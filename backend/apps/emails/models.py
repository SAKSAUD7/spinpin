from django.db import models
from django.utils import timezone


class EmailLog(models.Model):
    """
    Audit log for all emails sent by the system.
    Tracks status, retries, and relationships to bookings.
    """
    
    EMAIL_TYPE_CHOICES = [
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('PARTY_BOOKING_CONFIRMATION', 'Party Booking Confirmation'),
        ('PAYMENT_CONFIRMATION', 'Payment Confirmation'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
        ('WAIVER_REMINDER', 'Waiver Reminder'),
        ('BOOKING_CANCELLED', 'Booking Cancelled'),
        ('ADMIN_NEW_BOOKING', 'Admin: New Booking'),
        ('ADMIN_CONTACT_MESSAGE', 'Admin: Contact Message'),
        ('WAIVER_CONFIRMATION', 'Waiver Confirmation'),
        ('MARKETING_CAMPAIGN', 'Marketing Campaign'),
        ('BIRTHDAY_MARKETING', 'Birthday Automation'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]
    
    # Email Metadata
    email_type = models.CharField(
        max_length=50, 
        choices=EMAIL_TYPE_CHOICES,
        help_text="Type of email being sent"
    )
    recipient_email = models.EmailField(help_text="Email address of recipient")
    recipient_name = models.CharField(max_length=255, null=True, blank=True)
    subject = models.CharField(max_length=255, help_text="Email subject line")
    
    # Content (stored as JSON for flexibility)
    template_name = models.CharField(max_length=100, help_text="Template file used")
    context_data = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Template variables as JSON"
    )
    
    # Sending Status
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDING',
        db_index=True
    )
    error_message = models.TextField(
        null=True, 
        blank=True,
        help_text="Error details if sending failed"
    )
    
    # Azure Communication Services Response
    message_id = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Azure message ID for tracking"
    )
    
    # Retry Logic
    retry_count = models.IntegerField(
        default=0,
        help_text="Number of retry attempts made"
    )
    max_retries = models.IntegerField(
        default=3,
        help_text="Maximum number of retries allowed"
    )
    next_retry_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When to retry next (if failed)"
    )
    
    # Relationships (nullable - emails can exist independently)
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_logs',
        help_text="Related session booking (if any)"
    )
    party_booking = models.ForeignKey(
        'bookings.PartyBooking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_logs',
        help_text="Related party booking (if any)"
    )
    contact_message = models.ForeignKey(
        'cms.ContactMessage',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_logs',
        help_text="Related contact message (if any)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When email was queued"
    )
    sent_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When email was successfully sent"
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email_type', 'created_at']),
            models.Index(fields=['recipient_email']),
            models.Index(fields=['next_retry_at']),
        ]
    
    def __str__(self):
        return f"{self.email_type} to {self.recipient_email} - {self.status}"
    
    def mark_sent(self, message_id=None):
        """Mark email as successfully sent"""
        self.status = 'SENT'
        self.sent_at = timezone.now()
        if message_id:
            self.message_id = message_id
        self.save()
    
    def mark_failed(self, error_message):
        """Mark email as failed and schedule retry if applicable"""
        self.status = 'FAILED'
        self.error_message = error_message
        self.retry_count += 1
        
        if self.retry_count < self.max_retries:
            # Exponential backoff: 1min, 2min, 4min
            delay_minutes = 2 ** (self.retry_count - 1)
            self.next_retry_at = timezone.now() + timezone.timedelta(minutes=delay_minutes)
        
        self.save()
    
    def can_retry(self):
        """Check if email can be retried"""
        return (
            self.status == 'FAILED' and
            self.retry_count < self.max_retries and
            self.next_retry_at and
            timezone.now() >= self.next_retry_at
        )
