import logging
import uuid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.apps import apps
from django.db.models import Q
from apps.emails.services import email_service
from .models import EmailUnsubscribe, MarketingCampaign, BirthdayEmailTracker, EmailTemplate

logger = logging.getLogger(__name__)

class MarketingService:
    """
    Service to handle all marketing e-mail logic:
    - Birthday automation
    - Campaign sending
    - Unsubscribe management
    """
    
    def generate_unsubscribe_token(self, email):
        """
        Generate a secure token for unsubscribing.
        Currently using a simple signed implementation or UUID storage.
        For simplicity and state, we'll implement a token-based lookup if needed, 
        or just sign the email.
        
        To be robust without complex crypto, we can just use the email directly 
        if we trust the link source, but better to sign it.
        
        For this implementation: simple base64 or similar is NOT secure.
        We will use django.core.signing.
        """
        from django.core.signing import Signer
        signer = Signer()
        return signer.sign(email)

    def verify_unsubscribe_token(self, token):
        """
        Verify token and return email if valid.
        """
        from django.core.signing import Signer, BadSignature
        signer = Signer()
        try:
            return signer.unsign(token)
        except BadSignature:
            return None

    def is_unsubscribed(self, email):
        """Check if email is unsubscribed."""
        return EmailUnsubscribe.objects.filter(email=email).exists()

    def unsubscribe_email(self, email, reason="User requested"):
        """Add email to unsubscribe list."""
        EmailUnsubscribe.objects.get_or_create(email=email, defaults={'reason': reason})

    def get_public_unsubscribe_url(self, email):
        """
        Generate the strict HTTPS URL for the public unsubscribe view.
        """
        token = self.generate_unsubscribe_token(email)
        # Assuming frontend or backend serves this. 
        # Since we are adding "ZERO BREAKS", we'll serve this via a backend view.
        # We need the domain.
        base_url = settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        if not base_url.startswith('http'):
            base_url = f"https://{base_url}"
            
        return f"{base_url}/marketing/unsubscribe/?token={token}"

    # ==========================
    # BIRTHDAY AUTOMATION
    # ==========================
    
    def send_birthday_batch(self):
        """
        Finds participants with birthday in 20 days and sends emails.
        Rules:
        - 20 days before DOB
        - Minor -> Email Guardian
        - Adult -> Email Participant
        - Check Unsubscribe
        - Check Duplicate (BirthdayEmailTracker)
        """
        today = timezone.now().date()
        target_date = today + timedelta(days=20)
        current_year = today.year
        
        logger.info(f"Running Birthday Batch for DOB: {target_date} (Year: {current_year})")
        
        # We need to look at logic for "Same Day and Month" ignoring year.
        # Django __day and __month lookups.
        
        Waiver = apps.get_model('bookings', 'Waiver')
        
        # Find matching waivers for MINORS
        waivers = Waiver.objects.filter(
            dob__month=target_date.month,
            dob__day=target_date.day,
            participant_type='MINOR'
        ).exclude(email__isnull=True).exclude(email='')
        
        sent_count = 0
        
        for waiver in waivers:
            email = waiver.email # This is guardian email for minors
            name = waiver.name
            
            # 1. Check Unsubscribe
            if self.is_unsubscribed(email):
                logger.info(f"Skipping Birthday Email (Unsubscribed): {email}")
                continue
                
            # 2. Check Duplicates (Already sent this year)
            if BirthdayEmailTracker.objects.filter(email=email, year=current_year).exists():
                logger.info(f"Skipping Birthday Email (Duplicate): {email}")
                continue
                
            # 3. Send Email
            try:
                self._send_birthday_email(waiver, email, name, current_year)
                # 4. Track Success
                BirthdayEmailTracker.objects.create(
                    email=email,
                    year=current_year,
                    waiver=waiver
                )
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send birthday email to {email}: {e}")

        # ---------------------------------------------------------
        # ADDITIONAL CHECKS: Legacy Minors stored in JSON `minors` list
        # ---------------------------------------------------------
        # Fetch Waivers that HAVE a minors list
        json_waivers = Waiver.objects.exclude(minors__isnull=True).exclude(minors__exact=[])
        
        for waiver in json_waivers:
            if not waiver.email: continue
            
            # Helper to check if we already processed this guardian in this batch
            # (Though the Tracker check below handles persistence)
            
            try:
                minors_list = waiver.minors
                if not isinstance(minors_list, list):
                    continue
                    
                target_found = False
                minor_name = ""
                
                for minor in minors_list:
                    if not isinstance(minor, dict) or 'dob' not in minor:
                        continue
                        
                    # Parse DOB string "YYYY-MM-DD"
                    try:
                        m_dob_str = minor.get('dob')
                        # Simple string slice for Month/Day comparison to avoid full date parsing issues
                        # Format is typically YYYY-MM-DD
                        parts = m_dob_str.split('-')
                        if len(parts) == 3:
                            m_month = int(parts[1])
                            m_day = int(parts[2])
                            
                            if m_month == target_date.month and m_day == target_date.day:
                                target_found = True
                                minor_name = minor.get('name', 'Your Child')
                                break
                    except (ValueError, IndexError):
                        continue
                        
                if target_found:
                    email = waiver.email
                    name = waiver.name # Guardian Name
                    
                    # 1. Check Unsubscribe
                    if self.is_unsubscribed(email):
                        continue
                        
                    # 2. Check Duplicates 
                    # Note: Unique limit is Email + Year. 
                    # This means we only send ONE birthday email per family/guardian per year.
                    # This is a known database constraint.
                    if BirthdayEmailTracker.objects.filter(email=email, year=current_year).exists():
                        continue
                        
                    # 3. Send Email
                    self._send_birthday_email(waiver, email, name, current_year)
                    
                    # 4. Track
                    BirthdayEmailTracker.objects.create(
                        email=email,
                        year=current_year,
                        waiver=waiver
                    )
                    sent_count += 1
                    logger.info(f"Sent Legacy Minor Birthday Email to {email} for {minor_name}")

            except Exception as e:
                logger.error(f"Error processing legacy minor waiver {waiver.id}: {e}")

        logger.info(f"Birthday Batch Completed. Sent: {sent_count}")

    def _send_birthday_email(self, waiver, email, name, year):
        """Internal method to send the actual birthday email via EmailService."""
        unsubscribe_url = self.get_public_unsubscribe_url(email)
        
        context = {
            'name': name,
            'unsubscribe_url': unsubscribe_url,
            'year': year
        }
        
        # Use existing EmailService logic but inject our unsubscribe check/log
        # We'll use a direct call to send_email but with specific template
        
        email_service.send_email(
            email_type='BIRTHDAY_MARKETING',
            recipient_email=email,
            recipient_name=name,
            subject=f"🎉 A Birthday Is Coming Up — Celebrate at Ninja Inflatable Park!",
            template_name='emails/marketing/birthday.html',
            context=context
        )

    # ==========================
    # CAMPAIGN SENDING
    # ==========================
    
    def send_campaign(self, campaign_id):
        """
        Orchestrates sending a marketing campaign.
        """
        try:
            campaign = MarketingCampaign.objects.get(id=campaign_id)
        except MarketingCampaign.DoesNotExist:
            logger.error(f"Campaign {campaign_id} not found")
            return

        if campaign.status == 'SENT':
            logger.warning(f"Campaign {campaign.title} already sent")
            return

        logger.info(f"Starting Campaign: {campaign.title}")
        
        # Resolve Recipients
        recipient_emails = self._resolve_recipients(campaign)
        
        success_count = 0
        failed_count = 0
        
        for email, name in recipient_emails:
            # Check Unsubscribe
            if self.is_unsubscribed(email):
                continue
                
            try:
                self._send_campaign_email(campaign, email, name)
                success_count += 1
            except Exception as e:
                logger.error(f"Campaign send failed for {email}: {e}")
                failed_count += 1
        
        # Update Campaign Stats
        campaign.status = 'SENT'
        campaign.sent_at = timezone.now()
        campaign.sent_count = success_count
        campaign.failed_count = failed_count
        campaign.save()
        
        logger.info(f"Campaign Completed. Success: {success_count}, Failed: {failed_count}")

    def _resolve_recipients(self, campaign):
        """
        Returns list of (email, name) tuples based on recipient_type.
        """
        Waiver = apps.get_model('bookings', 'Waiver')
        recipients = set()
        
        if campaign.recipient_type == 'ALL_ADULTS':
            # Participants who are adults
            waivers = Waiver.objects.filter(participant_type='ADULT').exclude(email__isnull=True).values_list('email', 'name')
            for email, name in waivers:
                if email: recipients.add((email, name))
                
        elif campaign.recipient_type == 'ALL_GUARDIANS':
            # Minors have guardian email in 'email' field or linked account
            # In our Waiver model, 'email' field is the contact email (guardian for minors)
            waivers = Waiver.objects.exclude(email__isnull=True).values_list('email', 'name')
            for email, name in waivers:
                if email: recipients.add((email, name))
                
        elif campaign.recipient_type == 'CUSTOM_LIST':
            if campaign.custom_email_list:
                # Split by comma or newline
                raw_emails = campaign.custom_email_list.replace('\n', ',').split(',')
                for raw in raw_emails:
                    e = raw.strip()
                    if e:
                        # Use email as name if unknown
                        recipients.add((e, "Valued Customer"))
        
        return list(recipients)

    def _send_campaign_email(self, campaign, email, name):
        """Send individual campaign email."""
        unsubscribe_url = self.get_public_unsubscribe_url(email)
        
        # If campaign has no template, use base or fail
        template_name = 'emails/marketing/campaign.html'
        
        context = {
            'name': name,
            'campaign_content': campaign.content,
            'unsubscribe_url': unsubscribe_url
        }
        
        email_service.send_email(
            email_type='MARKETING_CAMPAIGN',
            recipient_email=email,
            recipient_name=name,
            subject=campaign.subject,
            template_name=template_name,
            context=context
        )

marketing_service = MarketingService()
