from django.db import models
from apps.shop.models import Voucher
import uuid
from datetime import datetime

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['-created_at']),  # For sorting by newest
        ]
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return self.name

class Booking(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Fully Paid'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
    ]
    WAIVER_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SIGNED', 'Signed'),
    ]
    TYPE_CHOICES = [
        ('SESSION', 'Session'),
        ('PARTY', 'Party'),
        ('MANUAL', 'Manual'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text="Duration in minutes")
    adults = models.IntegerField(default=0)
    kids = models.IntegerField(default=0)
    spectators = models.IntegerField(default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total amount paid so far")
    voucher_code = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(max_length=20, default='CONFIRMED') # Legacy
    booking_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    waiver_status = models.CharField(max_length=20, choices=WAIVER_STATUS_CHOICES, default='PENDING')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='SESSION')
    qr_code = models.CharField(max_length=255, unique=True, null=True, blank=True)
    booking_number = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="Unique booking number (NIP-YYYYMMDD-XXXX)")
    
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    
    # Arrival tracking
    arrived = models.BooleanField(default=False)
    arrived_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['date', 'time']),  # For availability checks
            models.Index(fields=['email']),  # For customer lookups
            models.Index(fields=['name']),   # For global search
            models.Index(fields=['phone']),  # For global search
            models.Index(fields=['uuid']),  # For ticket retrieval
            models.Index(fields=['booking_status']),  # For filtering by status
            models.Index(fields=['payment_status']),  # For payment tracking
            models.Index(fields=['-created_at']),  # For sorting by newest
            models.Index(fields=['customer']),  # Foreign key lookup
        ]
        ordering = ['-created_at']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'

    def __str__(self):
        return f"Booking {self.id} - {self.name}"
    
    @property
    def remaining_balance(self):
        """Calculate remaining balance to be paid"""
        return self.amount - self.paid_amount
    
    def generate_booking_number(self):
        """Generate unique booking number: NIP-YYYYMMDD-XXXX"""
        date = datetime.now()
        year = date.year
        month = str(date.month).zfill(2)
        day = str(date.day).zfill(2)
        
        # Use booking ID for uniqueness instead of random number
        # This ensures no collisions
        booking_id = str(self.id).zfill(4)
        
        return f"NIP-{year}{month}{day}-{booking_id}"
    
    def save(self, *args, **kwargs):
        # Generate booking number on first save
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.booking_number:
            self.booking_number = self.generate_booking_number()
            super().save(update_fields=['booking_number'])

class PartyBooking(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Fully Paid'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    package_name = models.CharField(max_length=255)
    kids = models.IntegerField(default=0)
    adults = models.IntegerField(default=0)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total amount paid so far")
    
    birthday_child_name = models.CharField(max_length=255, null=True, blank=True)
    birthday_child_age = models.IntegerField(null=True, blank=True)
    
    # Participant Details
    participants = models.JSONField(null=True, blank=True)
    # Structure: {
    #   "adults": [{"name": "John Doe", "email": "john@example.com", "phone": "123", "dob": "1990-01-01"}],
    #   "minors": [{"name": "Jane Doe", "dob": "2015-05-10", "guardian": "John Doe"}]
    # }
    
    # Waiver Information
    waiver_signed = models.BooleanField(default=False)
    waiver_signed_at = models.DateTimeField(null=True, blank=True)
    waiver_ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='party_bookings')
    booking_number = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="Unique booking number (NIPARTY-YYYYMMDD-XXXX)")
    
    # Arrival tracking (matching Booking model)
    arrived = models.BooleanField(default=False)
    arrived_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['date', 'time']),  # For availability checks
            models.Index(fields=['email']),  # For customer lookups
            models.Index(fields=['name']),   # For global search
            models.Index(fields=['phone']),  # For global search
            models.Index(fields=['uuid']),  # For ticket retrieval
            models.Index(fields=['status']),  # For filtering by status
            models.Index(fields=['-created_at']),  # For sorting by newest
            models.Index(fields=['customer']),  # Foreign key lookup
        ]
        ordering = ['-created_at']
        verbose_name = 'Party Booking'
        verbose_name_plural = 'Party Bookings'

    def __str__(self):
        return f"Party {self.id} - {self.name}"
    
    @property
    def remaining_balance(self):
        """Calculate remaining balance to be paid"""
        return self.amount - self.paid_amount
    
    def generate_booking_number(self):
        """Generate unique booking number: NIPARTY-YYYYMMDD-XXXX"""
        date = datetime.now()
        year = date.year
        month = str(date.month).zfill(2)
        day = str(date.day).zfill(2)
        
        # Use booking ID for uniqueness
        booking_id = str(self.id).zfill(4)
        
        return f"NIPARTY-{year}{month}{day}-{booking_id}"
    
    def save(self, *args, **kwargs):
        # Generate booking number on first save
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.booking_number:
            self.booking_number = self.generate_booking_number()
            super().save(update_fields=['booking_number'])

class Waiver(models.Model):
    PARTICIPANT_TYPE_CHOICES = [
        ('ADULT', 'Adult'),
        ('MINOR', 'Minor'),
    ]
    
    # Participant Information
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    participant_type = models.CharField(max_length=10, choices=PARTICIPANT_TYPE_CHOICES, default='ADULT')
    is_primary_signer = models.BooleanField(default=False)
    
    # Waiver Details
    # file_url = models.URLField(null=True, blank=True)  # Temporarily disabled due to DRF bug
    signed_at = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=20, default='1.0')
    emergency_contact = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Legacy fields for backward compatibility
    minors = models.JSONField(null=True, blank=True)  # List of {name, dob}
    adults = models.JSONField(null=True, blank=True)  # List of {name, email, phone, dob}
    
    # Relationships
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='waivers')
    party_booking = models.ForeignKey(PartyBooking, on_delete=models.SET_NULL, null=True, blank=True, related_name='waivers')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='waivers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),  # For customer lookups
            models.Index(fields=['name']),   # For global search
            models.Index(fields=['booking']),  # Foreign key lookup
            models.Index(fields=['party_booking']),  # Foreign key lookup
            models.Index(fields=['customer']),  # Foreign key lookup
            models.Index(fields=['participant_type']),  # For filtering
            models.Index(fields=['-created_at']),  # For sorting by newest
        ]
        ordering = ['-created_at']
        verbose_name = 'Waiver'
        verbose_name_plural = 'Waivers'

    def __str__(self):
        return f"Waiver for {self.name} ({self.participant_type})"

class Transaction(models.Model):
    METHOD_CHOICES = [
        ('STRIPE', 'Stripe'),
        ('CASH', 'Cash'),
        ('RAZORPAY', 'Razorpay'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    transaction_id = models.CharField(max_length=255, unique=True)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} {self.currency}"

class BookingBlock(models.Model):
    TYPE_CHOICES = [
        ('BLOCKED_DATE', 'Blocked Date'),
        ('CLOSED_TODAY', 'Closed Today (Popup)'),
        ('OPEN_TODAY', 'Open Today (Holiday)'),
        # Legacy choices kept for backward compatibility
        ('CLOSED', 'Closed'),
        ('MAINTENANCE', 'Maintenance'),
        ('PRIVATE_EVENT', 'Private Event'),
        ('OTHER', 'Other'),
    ]

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    reason = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='BLOCKED_DATE')
    recurring = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.type}] {self.reason} ({self.start_date.date()} - {self.end_date.date()})"

class SessionBookingHistory(models.Model):
    """
    Stores session bookings that were paid but not saved due to system errors.
    Allows admins to restore these bookings to the main Booking table.
    """
    # Original booking data (copied from Booking model)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text="Duration in minutes")
    adults = models.IntegerField(default=0)
    kids = models.IntegerField(default=0)
    spectators = models.IntegerField(default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    voucher_code = models.CharField(max_length=50, null=True, blank=True)
    
    # History-specific fields
    original_booking_id = models.IntegerField(null=True, blank=True, help_text="Original booking ID if it existed")
    payment_transaction_id = models.CharField(max_length=255, null=True, blank=True, help_text="Payment gateway transaction ID")
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Amount actually paid")
    failure_reason = models.TextField(help_text="Why this booking went to history (e.g., 'Payment succeeded but save failed')")
    
    # Restore tracking
    restored = models.BooleanField(default=False, help_text="Whether this booking has been restored")
    restored_at = models.DateTimeField(null=True, blank=True, help_text="When the booking was restored")
    restored_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='restored_session_bookings', help_text="Admin who restored this booking")
    restored_booking_id = models.IntegerField(null=True, blank=True, help_text="ID of the booking created when restored")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Session Booking History"
        verbose_name_plural = "Session Booking History"
    
    def __str__(self):
        status = "Restored" if self.restored else "Pending"
        return f"Session History #{self.id} - {self.name} ({status})"

class PartyBookingHistory(models.Model):
    """
    Stores party bookings that were paid but not saved due to system errors.
    Allows admins to restore these bookings to the main PartyBooking table.
    """
    # Original booking data (copied from PartyBooking model)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    package_name = models.CharField(max_length=255)
    kids = models.IntegerField(default=0)
    adults = models.IntegerField(default=0)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    birthday_child_name = models.CharField(max_length=255, null=True, blank=True)
    birthday_child_age = models.IntegerField(null=True, blank=True)
    participants = models.JSONField(null=True, blank=True)
    
    # History-specific fields
    original_booking_id = models.IntegerField(null=True, blank=True, help_text="Original booking ID if it existed")
    payment_transaction_id = models.CharField(max_length=255, null=True, blank=True, help_text="Payment gateway transaction ID")
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Amount actually paid")
    failure_reason = models.TextField(help_text="Why this booking went to history (e.g., 'Payment succeeded but save failed')")
    
    # Restore tracking
    restored = models.BooleanField(default=False, help_text="Whether this booking has been restored")
    restored_at = models.DateTimeField(null=True, blank=True, help_text="When the booking was restored")
    restored_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='restored_party_bookings', help_text="Admin who restored this booking")
    restored_booking_id = models.IntegerField(null=True, blank=True, help_text="ID of the booking created when restored")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Party Booking History"
        verbose_name_plural = "Party Booking History"
    
    def __str__(self):
        status = "Restored" if self.restored else "Pending"
        return f"Party History #{self.id} - {self.name} ({status})"
