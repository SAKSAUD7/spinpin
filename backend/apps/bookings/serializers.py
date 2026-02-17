from rest_framework import serializers
from .models import Customer, Booking, Waiver, Transaction, BookingBlock, PartyBooking, SessionBookingHistory, PartyBookingHistory
# from apps.shop.serializers import VoucherSerializer

class CustomerSerializer(serializers.ModelSerializer):
    booking_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    last_visit = serializers.DateField(read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'notes', 'created_at', 'updated_at', 
                  'booking_count', 'total_spent', 'last_visit']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class BookingBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingBlock
        fields = '__all__'

# Simple booking serializer WITHOUT waivers to avoid circular reference
class SimpleBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'name', 'email', 'phone', 'date', 'time', 'duration', 
                  'adults', 'kids', 'spectators', 'amount', 'status', 'booking_status',
                  'payment_status', 'waiver_status', 'type', 'created_at', 'updated_at']

class WaiverSerializer(serializers.ModelSerializer):
    # booking_details = SimpleBookingSerializer(source='booking', read_only=True)  # Temporarily disabled
    # party_booking_details = serializers.SerializerMethodField()  # Temporarily disabled
    booking_type = serializers.SerializerMethodField(read_only=True)
    booking_reference = serializers.SerializerMethodField(read_only=True)
    arrived = serializers.SerializerMethodField(read_only=True)
    arrived_at = serializers.SerializerMethodField(read_only=True)
    # Forced reload for serializer update
    
    class Meta:
        model = Waiver
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'signed_at']
    
    def get_party_booking_details(self, obj):
        if obj.party_booking:
            return {
                'id': obj.party_booking.id,
                'name': obj.party_booking.name,
                'email': obj.party_booking.email,
                'phone': obj.party_booking.phone,
                'date': str(obj.party_booking.date),
                'time': str(obj.party_booking.time),
                'package_name': obj.party_booking.package_name,
                'kids': obj.party_booking.kids,
                'adults': obj.party_booking.adults,
                'amount': float(obj.party_booking.amount),
                'status': obj.party_booking.status,
            }
        return None
    
    def get_arrived(self, obj):
        if obj.booking:
            return obj.booking.arrived
        elif obj.party_booking:
            return obj.party_booking.arrived
        return False

    def get_arrived_at(self, obj):
        if obj.booking and obj.booking.arrived:
            return obj.booking.arrived_at
        elif obj.party_booking and obj.party_booking.arrived:
            return obj.party_booking.arrived_at
        return None
    
    def get_booking_type(self, obj):
        if obj.booking:
            return 'SESSION'
        elif obj.party_booking:
            return 'PARTY'
        return 'UNKNOWN'
    
    def get_booking_reference(self, obj):
        if obj.booking:
            return f"Session #{obj.booking.id}"
        elif obj.party_booking:
            return f"Party #{obj.party_booking.id}"
        return "Walk-in"

class BookingSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)
    # voucher_details = VoucherSerializer(source='voucher', read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    waiver_status = serializers.SerializerMethodField()
    # waivers = WaiverSerializer(many=True, read_only=True)  # Temporarily disabled due to IPAddressField error

    class Meta:
        model = Booking
        fields = ['id', 'uuid', 'booking_number', 'name', 'email', 'phone', 'date', 'time', 'duration',
                  'adults', 'kids', 'spectators', 'subtotal', 'discount_amount', 'amount',
                  'voucher_code', 'status', 'booking_status', 'payment_status', 'waiver_status',
                  'type', 'qr_code', 'customer', 'customer_details', 'voucher', 'transactions',
                  'arrived', 'arrived_at',  # Arrival tracking
                  # 'waivers',  # Temporarily removed
                  'created_at', 'updated_at']

    def get_waiver_status(self, obj):
        # Dynamically check if any waiver is linked to this booking
        if obj.waivers.exists():
            return 'SIGNED'
        return obj.waiver_status or 'PENDING'
        
    def validate(self, data):
        """Check for Booking Blocks"""
        date = data.get('date')
        if date:
            # Check for active blocks on this date
            # We block if type is BLOCKED_DATE or any legacy blocking type
            # CLOSED_TODAY and OPEN_TODAY are alerts only, not blocks
            blocking_types = ['BLOCKED_DATE', 'CLOSED', 'MAINTENANCE', 'PRIVATE_EVENT', 'OTHER']
            
            blocks = BookingBlock.objects.filter(
                start_date__lte=date,
                end_date__gte=date,
                type__in=blocking_types
            )
            
            if blocks.exists():
                block = blocks.first()
                raise serializers.ValidationError(f"This date is not available due to {block.reason}")
                
        return data
    
    def create(self, validated_data):
        """Override create to automatically create/link customer"""
        # Extract customer data
        email = validated_data.get('email')
        name = validated_data.get('name')
        phone = validated_data.get('phone')
        
        # Get or create customer by email
        if email:
            customer, created = Customer.objects.get_or_create(
                email=email,
                defaults={
                    'name': name,
                    'phone': phone
                }
            )
            
            # Update customer info if changed
            if not created:
                updated = False
                if customer.name != name:
                    customer.name = name
                    updated = True
                if phone and customer.phone != phone:
                    customer.phone = phone
                    updated = True
                if updated:
                    customer.save()
            
            # Link customer to booking
            validated_data['customer'] = customer
        
        # Create booking with linked customer
        booking = super().create(validated_data)
        return booking

class PartyBookingSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    spectators = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    waiver_status = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()

    class Meta:
        model = PartyBooking
        fields = ['id', 'uuid', 'booking_number', 'name', 'email', 'phone', 'date', 'time', 'package_name', 
                  'kids', 'adults', 'amount', 'birthday_child_name', 'birthday_child_age',
                  'participants', 'waiver_signed', 'waiver_signed_at', 'waiver_ip_address',
                  'status', 'customer', 'arrived', 'arrived_at', 'created_at', 'updated_at',
                  'duration', 'spectators', 'qr_code', 'payment_status', 'waiver_status', 'booking_status']

    def get_duration(self, obj):
        return 120  # Party bookings are standard 2 hours

    def get_spectators(self, obj):
        return 0  # Spectators not currently tracked in PartyBooking model

    def get_qr_code(self, obj):
        # Generate a QR code URL or value similar to regular bookings
        # For now, return the UUID which can be used to generate client-side or mocked
        return f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={obj.uuid}"

    def get_payment_status(self, obj):
        # Party bookings usually default to PENDING until deposit is paid
        # But we'll map the main status to payment status for now
        if obj.status == 'CONFIRMED' or obj.status == 'COMPLETED':
            return 'PAID'
        return 'PENDING'

    def get_waiver_status(self, obj):
        if obj.waivers.exists():
            return 'SIGNED'
        return 'SIGNED' if obj.waiver_signed else 'PENDING'

    def get_booking_status(self, obj):
        return obj.status

    def validate(self, data):
        """Check for Booking Blocks"""
        date = data.get('date')
        if date:
            blocking_types = ['BLOCKED_DATE', 'CLOSED', 'MAINTENANCE', 'PRIVATE_EVENT', 'OTHER']
            blocks = BookingBlock.objects.filter(
                start_date__lte=date,
                end_date__gte=date,
                type__in=blocking_types
            )
            
            if blocks.exists():
                block = blocks.first()
                raise serializers.ValidationError(f"This date is not available due to {block.reason}")
                
        return data
    
    def create(self, validated_data):
        """Override create to automatically create/link customer"""
        # Extract customer data
        email = validated_data.get('email')
        name = validated_data.get('name')
        phone = validated_data.get('phone')
        
        # Get or create customer by email
        if email:
            customer, created = Customer.objects.get_or_create(
                email=email,
                defaults={
                    'name': name,
                    'phone': phone
                }
            )
            
            # Update customer info if changed
            if not created:
                updated = False
                if customer.name != name:
                    customer.name = name
                    updated = True
                if phone and customer.phone != phone:
                    customer.phone = phone
                    updated = True
                if updated:
                    customer.save()
            
            # Link customer to booking
            validated_data['customer'] = customer
        
        # Create party booking with linked customer
        party_booking = super().create(validated_data)
        return party_booking


class SessionBookingHistorySerializer(serializers.ModelSerializer):
    """Serializer for SessionBookingHistory with computed fields"""
    can_restore = serializers.SerializerMethodField()
    restored_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionBookingHistory
        fields = '__all__'
        read_only_fields = ['id', 'uuid', 'created_at', 'updated_at', 'restored', 
                           'restored_at', 'restored_by', 'restored_booking_id']
    
    def get_can_restore(self, obj):
        """Check if this history record can be restored"""
        return not obj.restored
    
    def get_restored_by_name(self, obj):
        """Get the name of the admin who restored this booking"""
        if obj.restored_by:
            return obj.restored_by.username
        return None


class PartyBookingHistorySerializer(serializers.ModelSerializer):
    """Serializer for PartyBookingHistory with computed fields"""
    can_restore = serializers.SerializerMethodField()
    restored_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PartyBookingHistory
        fields = '__all__'
        read_only_fields = ['id', 'uuid', 'created_at', 'updated_at', 'restored', 
                           'restored_at', 'restored_by', 'restored_booking_id']
    
    def get_can_restore(self, obj):
        """Check if this history record can be restored"""
        return not obj.restored
    
    def get_restored_by_name(self, obj):
        """Get the name of the admin who restored this booking"""
        if obj.restored_by:
            return obj.restored_by.username
        return None
