"""
Email Service for sending emails via Azure Communication Services.
This service is reusable and handles all email sending logic.
"""

import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from .models import EmailLog

logger = logging.getLogger(__name__)


class EmailService:
    """
    Centralized email sending service using Azure Communication Services.
    
    Features:
    - Template rendering
    - Azure Email integration
    - EmailLog creation and updates
    - Error handling
    - Feature flag support
    """
    
    def __init__(self):
        """Initialize email service with Azure credentials from environment"""
        self.enabled = getattr(settings, 'EMAIL_ENABLED', False)
        self.debug_mode = getattr(settings, 'EMAIL_DEBUG_MODE', True)
        self.connection_string = getattr(settings, 'AZURE_COMMUNICATION_CONNECTION_STRING', '')
        self.sender_address = getattr(settings, 'AZURE_EMAIL_SENDER_ADDRESS', '')
        self.sender_name = getattr(settings, 'AZURE_EMAIL_SENDER_NAME', 'Ninja Inflatable Park')
    
    def send_email(
        self,
        email_type: str,
        recipient_email: str,
        recipient_name: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        booking=None,
        party_booking=None,
        contact_message=None
    ) -> EmailLog:
        """
        Send an email and create EmailLog entry.
        
        Args:
            email_type: Type of email (from EmailLog.EMAIL_TYPE_CHOICES)
            recipient_email: Email address of recipient
            recipient_name: Name of recipient
            subject: Email subject line
            template_name: Template file path (e.g., 'emails/booking/session_confirmation.html')
            context: Template context variables
            booking: Optional Booking instance
            party_booking: Optional PartyBooking instance
            contact_message: Optional ContactMessage instance
        
        Returns:
            EmailLog instance
        """
        
        # Create a JSON-serializable copy of context (without model instances)
        from decimal import Decimal
        serializable_context = {}
        for key, value in context.items():
            # Skip model instances - they're already linked via foreign keys
            if hasattr(value, '_meta'):  # Django model instance
                continue
            # Convert Decimal to string
            elif isinstance(value, Decimal):
                serializable_context[key] = str(value)
            # Convert dates/times to strings
            elif hasattr(value, 'isoformat'):
                serializable_context[key] = value.isoformat()
            else:
                serializable_context[key] = value
        
        # Create EmailLog entry
        email_log = EmailLog.objects.create(
            email_type=email_type,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            subject=subject,
            template_name=template_name,
            context_data=serializable_context,  # Use serializable version
            status='PENDING',
            booking=booking,
            party_booking=party_booking,
            contact_message=contact_message,
        )
        
        # Check if emails are enabled
        if not self.enabled:
            logger.info(f"Email disabled by feature flag: {email_type} to {recipient_email}")
            email_log.mark_failed("Email sending disabled by EMAIL_ENABLED flag")
            return email_log
        
        # Debug mode: log instead of sending
        if self.debug_mode:
            logger.info(f"[DEBUG MODE] Would send email: {email_type} to {recipient_email}")
            logger.info(f"[DEBUG MODE] Subject: {subject}")
            logger.info(f"[DEBUG MODE] Template: {template_name}")
            logger.info(f"[DEBUG MODE] Context: {serializable_context}")
            email_log.mark_failed("Debug mode enabled - email not sent")
            return email_log
        
        try:
            # Render email template (use full context with model instances)
            html_content = render_to_string(template_name, context)
            
            # Send via Azure Communication Services
            message_id = self._send_via_azure(
                recipient_email=recipient_email,
                subject=subject,
                html_content=html_content
            )
            
            # Mark as sent
            email_log.mark_sent(message_id=message_id)
            logger.info(f"Email sent successfully: {email_type} to {recipient_email} (ID: {message_id})")
            
        except Exception as e:
            # Mark as failed
            error_message = f"Failed to send email: {str(e)}"
            email_log.mark_failed(error_message)
            logger.error(f"Email sending failed: {email_type} to {recipient_email} - {error_message}")
        
        return email_log
    
    def _send_via_azure(
        self,
        recipient_email: str,
        subject: str,
        html_content: str
    ) -> str:
        """
        Send email via Azure Communication Services.
        
        Args:
            recipient_email: Recipient email address
            subject: Email subject
            html_content: HTML email content
        
        Returns:
            Message ID from Azure
        
        Raises:
            Exception: If sending fails
        """
        
        # Check credentials
        if not self.connection_string:
            raise ValueError("AZURE_COMMUNICATION_CONNECTION_STRING not configured")
        
        if not self.sender_address:
            raise ValueError("AZURE_EMAIL_SENDER_ADDRESS not configured")
        
        try:
            # Import Azure SDK
            from azure.communication.email import EmailClient
            
            # Create email client
            client = EmailClient.from_connection_string(self.connection_string)
            
            # Prepare email message (dict-based API)
            message = {
                "content": {
                    "subject": subject,
                    "html": html_content
                },
                "recipients": {
                    "to": [
                        {"address": recipient_email}
                    ]
                },
                "senderAddress": self.sender_address
            }
            
            # Send email
            poller = client.begin_send(message)
            result = poller.result()
            
            # Return message ID
            if isinstance(result, dict):
                return result.get("messageId") or result.get("id")
            return result.message_id
            
        except ImportError:
            raise Exception("Azure Communication Email SDK not installed. Run: pip install azure-communication-email")
        except Exception as e:
            raise Exception(f"Azure email sending failed: {str(e)}")
    
    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Render email template to HTML string.
        
        Args:
            template_name: Template file path
            context: Template context variables
        
        Returns:
            Rendered HTML content
        """
        from datetime import datetime
        
        # Add current year to context
        context['current_year'] = datetime.now().year
        
        return render_to_string(template_name, context)
    
    def send_booking_confirmation(self, booking):
        """
        Send session booking confirmation email.
        
        Args:
            booking: Booking instance
        """
        logger.error(f"CREATING EMAILLOG FOR BOOKING {booking.id}")
        
        context = {
            'booking': booking,
            'customer_name': booking.name,
            'booking_date': booking.date,
            'booking_time': booking.time,
            'duration': booking.duration,
            'adults': booking.adults,
            'kids': booking.kids,
            'spectators': booking.spectators,
            'amount': booking.amount,
            'booking_uuid': str(booking.uuid),
        }
        
        email_log = self.send_email(
            email_type='BOOKING_CONFIRMATION',
            recipient_email=booking.email,
            recipient_name=booking.name,
            subject=f'Booking Confirmation - Ninja Inflatable Park',
            template_name='emails/booking/session_confirmation.html',
            context=context,
            booking=booking
        )
        
        logger.error(f"EMAILLOG CREATED ID={email_log.id} STATUS={email_log.status}")
        
        if not getattr(settings, 'EMAIL_BOOKING_ENABLED', False):
            logger.error(f"EMAIL_BOOKING_ENABLED=False, marking as failed")
            email_log.mark_failed("Booking emails disabled by EMAIL_BOOKING_ENABLED flag")
        
        return email_log
    
    def send_party_booking_confirmation(self, party_booking):
        """
        Send party booking confirmation email.
        
        Args:
            party_booking: PartyBooking instance
        """
        logger.error(f"CREATING EMAILLOG FOR PARTY BOOKING {party_booking.id}")
        
        context = {
            'party_booking': party_booking,
            'customer_name': party_booking.name,
            'booking_date': party_booking.date,
            'booking_time': party_booking.time,
            'package_name': party_booking.package_name,
            'kids': party_booking.kids,
            'adults': party_booking.adults,
            'amount': party_booking.amount,
            'birthday_child_name': party_booking.birthday_child_name,
            'birthday_child_age': party_booking.birthday_child_age,
            'booking_uuid': str(party_booking.uuid),
        }
        
        email_log = self.send_email(
            email_type='PARTY_BOOKING_CONFIRMATION',
            recipient_email=party_booking.email,
            recipient_name=party_booking.name,
            subject=f'Party Booking Confirmation - Ninja Inflatable Park',
            template_name='emails/booking/party_confirmation.html',
            context=context,
            party_booking=party_booking
        )
        
        logger.error(f"EMAILLOG CREATED ID={email_log.id} STATUS={email_log.status}")
        
        if not getattr(settings, 'EMAIL_BOOKING_ENABLED', False):
            logger.error(f"EMAIL_BOOKING_ENABLED=False, marking as failed")
            email_log.mark_failed("Booking emails disabled by EMAIL_BOOKING_ENABLED flag")
        
        return email_log


    def send_contact_message_confirmation(self, contact_message):
        """
        Send admin notification for new contact message.
        
        Args:
            contact_message: ContactMessage instance
        """
        logger.info(f"Preparing to send contact message notification for ID {contact_message.id}")
        
        context = {
            'contact_message': contact_message,
            'customer_name': contact_message.name,
            'subject': contact_message.subject,
        }
        
        # Hardcoded admin email as per requirements
        admin_email = "info@ninjainflatablepark.com"
        
        email_log = self.send_email(
            email_type='ADMIN_CONTACT_MESSAGE',
            recipient_email=admin_email,
            recipient_name="Ninja Park Admin",
            subject=f'New Contact Message - {contact_message.subject}',
            template_name='emails/admin/contact_message.html',
            context=context,
            contact_message=contact_message
        )
        
        return email_log

    def send_waiver_confirmation(self, waiver):
        """
        Send waiver signing confirmation email.
        
        Args:
            waiver: Waiver instance
        """
        logger.info(f"Preparing to send waiver confirmation for Waiver ID {waiver.id}")
        
        # Determine booking reference string
        booking_ref = "Walk-in"
        if waiver.booking:
            booking_ref = f"Session #{waiver.booking.id}"
        elif waiver.party_booking:
            booking_ref = f"Party #{waiver.party_booking.id}"
            
        context = {
            'waiver': waiver,
            'name': waiver.name,
            'signed_at': waiver.signed_at,
            'waiver_id': waiver.id,
            'booking_reference': booking_ref,
        }
        
        email_log = self.send_email(
            email_type='WAIVER_CONFIRMATION',
            recipient_email=waiver.email,
            recipient_name=waiver.name,
            subject=f'Waiver Confirmation - Ninja Inflatable Park',
            template_name='emails/waiver_confirmation.html',
            context=context,
        )
        
        return email_log


# Singleton instance
email_service = EmailService()
