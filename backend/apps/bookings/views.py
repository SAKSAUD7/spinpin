from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Customer, Booking, Waiver, Transaction, BookingBlock, PartyBooking, SessionBookingHistory, PartyBookingHistory
from .serializers import CustomerSerializer, BookingSerializer, WaiverSerializer, TransactionSerializer, BookingBlockSerializer, PartyBookingSerializer, SessionBookingHistorySerializer, PartyBookingHistorySerializer
from .permissions import IsStaffUser, IsSuperAdminOnly
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from django.http import HttpResponse
from django.utils import timezone
from django.db import transaction
import json

from django.db.models import Sum, Count, Max, Q

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsStaffUser]  # Allow employees to access customers

    def get_queryset(self):
        queryset = Customer.objects.annotate(
            booking_count=Count('bookings'),
            total_spent=Sum('bookings__amount'),
            last_visit=Max('bookings__date')
        )
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search) | 
                Q(phone__icontains=search)
            )
            
        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        
        # Filtering
        booking_type = self.request.query_params.get('type', None)
        if booking_type:
            queryset = queryset.filter(type=booking_type)
            
        # Accept 'status' query param and filter by 'booking_status' field
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(booking_status=status)
            
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
            
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search) | 
                Q(phone__icontains=search) |
                Q(uuid__icontains=search)
            )
        
        # Arrival status filter
        has_arrived = self.request.query_params.get('has_arrived', None)
        if has_arrived is not None:
            if has_arrived.lower() == 'true':
                queryset = queryset.filter(arrived=True)
            elif has_arrived.lower() == 'false':
                queryset = queryset.filter(arrived=False)
            
        # Ordering
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at') # Default to newest first
        
        # DEBUG: Print queryset info
        print(f"[DEBUG] BookingViewSet.get_queryset()")
        print(f"[DEBUG] Query params: {dict(self.request.query_params)}")
        print(f"[DEBUG] Queryset count: {queryset.count()}")
        if queryset.count() > 0:
            print(f"[DEBUG] First booking: ID={queryset.first().id}, Name={queryset.first().name}")
            
        return queryset
    
    def get_permissions(self):
        # Allow public access ONLY for create and ticket retrieval
        # List and retrieve require staff authentication to protect customer data
        if self.action in ['create', 'ticket']:
            return [permissions.AllowAny()]
        return [IsStaffUser()]  # Allow employees to access bookings
    
    def create(self, request, *args, **kwargs):
        """Override create to trigger confirmation email"""
        from django.conf import settings
        import logging
        
        logger = logging.getLogger('apps.emails')
        logger.info("=== BookingViewSet.create() called ===")
        
        # Call parent create method
        try:
            response = super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            error_msg = str(e)
            logger.error(f"CRITICAL: Booking creation failed: {error_msg}")
            logger.error(traceback.format_exc())
            return Response(
                {
                    "detail": f"Server Error: {error_msg}",
                    "traceback": traceback.format_exc().split('\n')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the created booking from response
        if response.status_code == 201:
            booking_id = response.data.get('id')
            logger.info(f"Booking {booking_id} created successfully")
            
            # NOTE: Email confirmation is now sent AFTER payment verification
            # See apps/payments/services.py - PaymentService.verify_and_complete_payment()
            # This ensures customers only receive confirmation after successful payment
            
            # Trigger confirmation email if enabled (DISABLED - moved to payment verification)
            # if getattr(settings, 'EMAIL_BOOKING_ENABLED', False):
            #     try:
            #         from apps.emails.tasks import send_booking_confirmation_email
            #         logger.info(f"EMAIL_BOOKING_ENABLED=True, triggering email for booking {booking_id}")
            #         send_booking_confirmation_email(booking_id)
            #         logger.info(f"Email queued for booking {booking_id}")
            #     except Exception as e:
            #         logger.error(f"Failed to queue email for booking {booking_id}: {str(e)}", exc_info=True)
            # else:
            #     logger.warning(f"EMAIL_BOOKING_ENABLED=False, skipping email")
        
        return response

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def check_duplicate(self, request):
        """
        Public endpoint to check for duplicate bookings.
        Returns validation result without exposing full booking details.
        """
        email = request.query_params.get('email')
        date = request.query_params.get('date')
        time = request.query_params.get('time')
        
        if not all([email, date, time]):
            return Response(
                {'error': 'Missing required parameters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check for bookings with same details created in last 5 minutes
        five_minutes_ago = timezone.now() - timezone.timedelta(minutes=5)
        
        exists = Booking.objects.filter(
            email=email,
            date=date,
            time=time,
            created_at__gte=five_minutes_ago
        ).exists()
        
        return Response({'exists': exists})

    @action(detail=False, methods=['get'], url_path='ticket/(?P<uuid>[^/.]+)')
    def ticket(self, request, uuid=None):
        booking = get_object_or_404(Booking, uuid=uuid)
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def mark_arrived(self, request, pk=None):
        """Mark a party booking as arrived"""
        party_booking = self.get_object()
        party_booking.arrived = True
        party_booking.save()
        
        serializer = self.get_serializer(party_booking)
        return Response({
            'success': True,
            'message': f'Party booking #{party_booking.id} marked as arrived',
            'booking': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def mark_not_arrived(self, request, pk=None):
        """Mark a party booking as not arrived"""
        party_booking = self.get_object()
        party_booking.arrived = False
        party_booking.save()
        
        serializer = self.get_serializer(party_booking)
        return Response({
            'success': True,
            'message': f'Party booking #{party_booking.id} marked as not arrived',
            'booking': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def mark_arrived(self, request, pk=None):
        """Mark a booking as arrived"""
        booking = self.get_object()
        booking.arrived = True
        booking.arrived_at = timezone.now()
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response({
            'success': True,
            'message': f'Booking #{booking.id} marked as arrived',
            'booking': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_not_arrived(self, request, pk=None):
        """Mark a booking as not arrived"""
        booking = self.get_object()
        booking.arrived = False
        booking.arrived_at = None
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response({
            'success': True,
            'message': f'Booking #{booking.id} marked as not arrived',
            'booking': serializer.data
        })

class WaiverViewSet(viewsets.ModelViewSet):
    queryset = Waiver.objects.all()
    serializer_class = WaiverSerializer
    
    def get_queryset(self):
        queryset = Waiver.objects.all()
        
        # Filter by booking
        booking_id = self.request.query_params.get('booking_id', None)
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
            
        party_booking_id = self.request.query_params.get('party_booking_id', None)
        if party_booking_id:
            queryset = queryset.filter(party_booking_id=party_booking_id)
            
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset
    
    def get_permissions(self):
        # Allow public access for create (when customers sign waivers)
        # Require staff authentication for list/retrieve/update
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffUser()]  # Allow employees to access waivers
    
    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests for updating waiver fields like minors"""
        print(f"DEBUG: partial_update called with data: {request.data}")
        instance = self.get_object()
        
        # Update only the fields provided in the request
        if 'minors' in request.data:
            print(f"DEBUG: Updating minors to: {request.data['minors']}")
            instance.minors = request.data['minors']
        if 'adults' in request.data:
            print(f"DEBUG: Updating adults to: {request.data['adults']}")
            instance.adults = request.data['adults']
        if 'is_verified' in request.data:
            print(f"DEBUG: Updating is_verified to: {request.data['is_verified']}")
            instance.is_verified = request.data['is_verified']
            
        instance.save()
        print(f"DEBUG: Waiver saved successfully")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
        
    def force_reload(self):
        # This method exists solely to force a file change event for the auto-reloader
        pass
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Generate and download waiver PDF"""
        waiver = self.get_object()
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="waiver_{waiver.id}.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Header
        p.setFont("Helvetica-Bold", 24)
        p.drawString(1 * inch, height - 1 * inch, "Ninja Inflatable Park")
        p.setFont("Helvetica", 12)
        p.drawString(1 * inch, height - 1.3 * inch, "Liability Waiver & Release Form")
        
        # Waiver Details
        y = height - 2 * inch
        p.setFont("Helvetica-Bold", 14)
        p.drawString(1 * inch, y, "Participant Information")
        y -= 0.3 * inch
        
        p.setFont("Helvetica", 12)
        p.drawString(1 * inch, y, f"Name: {waiver.name}")
        y -= 0.25 * inch
        p.drawString(1 * inch, y, f"Type: {waiver.participant_type}")
        y -= 0.25 * inch
        if waiver.dob:
            p.drawString(1 * inch, y, f"Date of Birth: {waiver.dob}")
            y -= 0.25 * inch
        if waiver.email:
            p.drawString(1 * inch, y, f"Email: {waiver.email}")
            y -= 0.25 * inch
        if waiver.phone:
            p.drawString(1 * inch, y, f"Phone: {waiver.phone}")
            y -= 0.25 * inch
            
        # Booking Info
        y -= 0.5 * inch
        p.setFont("Helvetica-Bold", 14)
        p.drawString(1 * inch, y, "Booking Details")
        y -= 0.3 * inch
        p.setFont("Helvetica", 12)
        
        if waiver.booking:
            p.drawString(1 * inch, y, f"Booking ID: {waiver.booking.id}")
            y -= 0.25 * inch
            p.drawString(1 * inch, y, f"Date: {waiver.booking.date}")
        elif waiver.party_booking:
            p.drawString(1 * inch, y, f"Party Booking ID: {waiver.party_booking.id}")
            y -= 0.25 * inch
            p.drawString(1 * inch, y, f"Date: {waiver.party_booking.date}")
            
        # Agreement
        y -= 0.5 * inch
        p.setFont("Helvetica-Bold", 14)
        p.drawString(1 * inch, y, "Agreement")
        y -= 0.3 * inch
        p.setFont("Helvetica", 10)
        text = "By signing this document, I acknowledge that I have read and understood the terms and conditions of the Ninja Inflatable Park liability waiver. I voluntarily assume all risks associated with participation."
        
        p.drawString(1 * inch, y, text[:90])
        p.drawString(1 * inch, y - 15, text[90:])
        
        # Signature
        y -= 1.5 * inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1 * inch, y, "Signed By:")
        p.line(2 * inch, y, 5 * inch, y)
        p.drawString(2 * inch, y + 5, waiver.name)
        
        y -= 0.5 * inch
        p.drawString(1 * inch, y, "Date:")
        p.drawString(2 * inch, y, waiver.signed_at.strftime('%Y-%m-%d %H:%M') if waiver.signed_at else 'N/A')
        
        y -= 0.5 * inch
        p.drawString(1 * inch, y, "IP Address:")
        p.drawString(2 * inch, y, waiver.ip_address or 'N/A')
        
        p.showPage()
        p.save()
        return response
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all waivers to CSV"""
        import csv
        from django.http import HttpResponse
        
        waivers = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="waivers.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Name', 'Email', 'Phone', 'Type', 'Signed Date', 'Booking Type', 'Booking ID', 'DOB', 'Emergency Contact'])
        
        for waiver in waivers:
            booking_type = 'Session' if waiver.booking else ('Party' if waiver.party_booking else 'Walk-in')
            booking_id = waiver.booking.id if waiver.booking else (waiver.party_booking.id if waiver.party_booking else 'N/A')
            
            writer.writerow([
                waiver.id,
                waiver.name,
                waiver.email or '',
                waiver.phone or '',
                waiver.participant_type,
                waiver.signed_at.strftime('%Y-%m-%d %H:%M') if waiver.signed_at else '',
                booking_type,
                booking_id,
                waiver.dob.strftime('%Y-%m-%d') if waiver.dob else '',
                waiver.emergency_contact or ''
            ])
        
        return response
    
    @action(detail=False, methods=['get'])
    def by_booking(self, request):
        """Get all waivers for a specific booking"""
        booking_id = request.query_params.get('booking_id')
        party_booking_id = request.query_params.get('party_booking_id')
        
        if booking_id:
            waivers = self.queryset.filter(booking_id=booking_id)
        elif party_booking_id:
            waivers = self.queryset.filter(party_booking_id=party_booking_id)
        else:
            return Response({'error': 'Please provide booking_id or party_booking_id'}, status=400)
        
        serializer = self.get_serializer(waivers, many=True)
        return Response(serializer.data)


# Custom function-based view for waiver listing (bypasses serializer bug)
@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])  # We'll check permissions inside
def waiver_list_view(request):
    """Custom view to list/create waivers without using ModelSerializer"""
    if request.method == 'GET':
        # Require admin authentication for listing all waivers
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # List all waivers
        queryset = Waiver.objects.all()
        
        # Filter by booking
        booking_id = request.query_params.get('booking_id', None)
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
            
        party_booking_id = request.query_params.get('party_booking_id', None)
        if party_booking_id:
            queryset = queryset.filter(party_booking_id=party_booking_id)
            
        waivers = queryset.order_by('-created_at')
        data = []
        for waiver in waivers:
            waiver_data = {
                'id': waiver.id,
                'name': waiver.name,
                'email': waiver.email,
                'phone': waiver.phone,
                'dob': str(waiver.dob) if waiver.dob else None,
                'participant_type': waiver.participant_type,
                'is_primary_signer': waiver.is_primary_signer,
                'signed_at': waiver.signed_at.isoformat() if waiver.signed_at else None,
                'version': waiver.version,
                'emergency_contact': waiver.emergency_contact,
                'ip_address': waiver.ip_address,
                'minors': waiver.minors,
                'adults': waiver.adults,
                'is_verified': waiver.is_verified,  # Add this field
                'booking': waiver.booking.id if waiver.booking else None,
                'party_booking': waiver.party_booking.id if waiver.party_booking else None,
                'customer': waiver.customer.id if waiver.customer else None,
                'created_at': waiver.created_at.isoformat(),
                'updated_at': waiver.updated_at.isoformat(),
            }
            
            # Add booking reference
            if waiver.booking:
                waiver_data['booking_reference'] = f"Session #{waiver.booking.id}"
                waiver_data['booking_type'] = 'SESSION'
            elif waiver.party_booking:
                waiver_data['booking_reference'] = f"Party #{waiver.party_booking.id}"
                waiver_data['booking_type'] = 'PARTY'
            else:
                waiver_data['booking_reference'] = "Walk-in"
                waiver_data['booking_type'] = 'UNKNOWN'
            
            data.append(waiver_data)
        return Response(data)
    
    elif request.method == 'POST':
        try:
            data = request.data
            ip_address = request.META.get('REMOTE_ADDR')
            
            # Create waiver
            waiver = Waiver.objects.create(
                name=data.get('name'),
                email=data.get('email'),
                phone=data.get('phone'),
                dob=data.get('dob'),
                participant_type=data.get('participant_type', 'ADULT'),
                is_primary_signer=data.get('is_primary_signer', False),
                version=data.get('version', '1.0'),
                emergency_contact=data.get('emergency_contact'),
                ip_address=ip_address,
                minors=data.get('minors'),
                adults=data.get('adults'),
                booking_id=data.get('booking'),
                party_booking_id=data.get('party_booking'),
                customer_id=data.get('customer'),
            )
            
            # Send confirmation email (Safe Mode: Try-Except to not block waiver creation)
            if waiver.email:
                try:
                    from apps.emails.services import email_service
                    email_service.send_waiver_confirmation(waiver)
                except Exception as email_error:
                    # Log error but proceed
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to send waiver confirmation email: {email_error}", exc_info=True)

            return Response({
                'id': waiver.id,
                'name': waiver.name,
                'email': waiver.email,
                'participant_type': waiver.participant_type,
                'signed_at': waiver.signed_at.isoformat(),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'Failed to create waiver'
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.AllowAny])
def waiver_detail_view(request, id):
    """Custom view to get waiver details with booking and participant information"""
    try:
        waiver = Waiver.objects.get(pk=id)
        
        if request.method == 'PATCH':
            # Check for admin permissions strictly for updates
            if not request.user.is_staff and not request.user.is_superuser:
               return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

            if 'is_verified' in request.data:
                waiver.is_verified = request.data['is_verified']
                waiver.save()
                return Response({'success': True, 'is_verified': waiver.is_verified})
            
            return Response({'detail': 'No valid fields provided'}, status=status.HTTP_400_BAD_REQUEST)

        # GET method logic
        waiver_data = {
            'id': waiver.id,
            'name': waiver.name,
            'email': waiver.email,
            'phone': waiver.phone,
            'dob': str(waiver.dob) if waiver.dob else None,
            'participant_type': waiver.participant_type,
            'is_primary_signer': waiver.is_primary_signer,
            'signed_at': waiver.signed_at.isoformat() if waiver.signed_at else None,
            'version': waiver.version,
            'emergency_contact': waiver.emergency_contact,
            'ip_address': waiver.ip_address,
            'minors': waiver.minors,
            'adults': waiver.adults,
            'created_at': waiver.created_at.isoformat(),
            'updated_at': waiver.updated_at.isoformat(),
            'is_verified': waiver.is_verified, # Include in GET response
        }
        
        # Add booking details if exists
        if waiver.booking:
            waiver_data['booking'] = {
                'id': waiver.booking.id,
                'name': waiver.booking.name,
                'email': waiver.booking.email,
                'phone': waiver.booking.phone,
                'date': str(waiver.booking.date),
                'time': str(waiver.booking.time),
                'adults': waiver.booking.adults,
                'kids': waiver.booking.kids,
                'spectators': waiver.booking.spectators,
                'amount': float(waiver.booking.amount),
                'status': waiver.booking.booking_status,
            }
            waiver_data['booking_reference'] = f"Session #{waiver.booking.id}"
            waiver_data['booking_type'] = 'SESSION'
        elif waiver.party_booking:
            waiver_data['party_booking'] = {
                'id': waiver.party_booking.id,
                'name': waiver.party_booking.name,
                'email': waiver.party_booking.email,
                'phone': waiver.party_booking.phone,
                'date': str(waiver.party_booking.date),
                'time': str(waiver.party_booking.time),
                'package_name': waiver.party_booking.package_name,
                'kids': waiver.party_booking.kids,
                'adults': waiver.party_booking.adults,
                'amount': float(waiver.party_booking.amount),
                'status': waiver.party_booking.status,
                'birthday_child_name': waiver.party_booking.birthday_child_name,
                'birthday_child_age': waiver.party_booking.birthday_child_age,
                'participants': waiver.party_booking.participants,
            }
            waiver_data['booking_reference'] = f"Party #{waiver.party_booking.id}"
            waiver_data['booking_type'] = 'PARTY'
        else:
            waiver_data['booking_reference'] = "Walk-in"
            waiver_data['booking_type'] = 'UNKNOWN'
        
        return Response(waiver_data)
    except Waiver.DoesNotExist:
        return Response({'error': 'Waiver not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsStaffUser]  # Allow employees to access transactions

class BookingBlockViewSet(viewsets.ModelViewSet):
    queryset = BookingBlock.objects.all()
    serializer_class = BookingBlockSerializer
    permission_classes = [IsStaffUser]  # Allow employees to manage booking blocks

class PublicBookingBlockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API to fetch blocked dates for the Booking Wizard.
    Only returns active blocks that actually prevent bookings.
    """
    serializer_class = BookingBlockSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        blocking_types = ['BLOCKED_DATE', 'CLOSED', 'MAINTENANCE', 'PRIVATE_EVENT', 'OTHER']
        # Filter for active blocks in the future (or including today)
        return BookingBlock.objects.filter(
            type__in=blocking_types,
            end_date__gte=timezone.now().date()
        )

class PublicSiteAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API to fetch 'Closed Today' or 'Open Today' alerts for the current day.
    """
    serializer_class = BookingBlockSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        from datetime import datetime, time
        
        # Calculate today's range in the server's timezone
        now = timezone.now()
        today_start = datetime.combine(now.date(), time.min)
        today_end = datetime.combine(now.date(), time.max)
        
        if timezone.is_aware(now):
            today_start = timezone.make_aware(today_start)
            today_end = timezone.make_aware(today_end)

        alert_types = ['CLOSED_TODAY', 'OPEN_TODAY']
        
        # Filter blocks that are active, match alert types, and overlap with today
        # Overlap logic: (BlockStart <= TodayEnd) AND (BlockEnd >= TodayStart)
        return BookingBlock.objects.filter(
            type__in=alert_types,
            start_date__lte=today_end,
            end_date__gte=today_start
        ).order_by('-start_date')

# Custom function-based view for party booking creation (bypasses serializer bug)
@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
def create_party_booking_view(request):
    """Custom view to create party bookings without using ModelSerializer"""
    if request.method == 'GET':
        # List all party bookings
        bookings = PartyBooking.objects.all().order_by('-created_at')
        data = []
        for booking in bookings:
            data.append({
                'id': booking.id,
                'uuid': str(booking.uuid),
                'name': booking.name,
                'email': booking.email,
                'phone': booking.phone,
                'date': str(booking.date),
                'time': str(booking.time),
                'package_name': booking.package_name,
                'kids': booking.kids,
                'adults': booking.adults,
                'amount': float(booking.amount),
                'birthday_child_name': booking.birthday_child_name,
                'birthday_child_age': booking.birthday_child_age,
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'updated_at': booking.updated_at.isoformat(),
            })
        return Response(data)
    
    elif request.method == 'POST':
        try:
            data = request.data
            
            # Create or get customer
            customer = None
            if data.get('email'):
                customer, created = Customer.objects.get_or_create(
                    email=data['email'],
                    defaults={
                        'name': data.get('name', ''),
                        'phone': data.get('phone', ''),
                    }
                )
                if not created and not customer.name:
                    customer.name = data.get('name', '')
                    customer.phone = data.get('phone', '')
                    customer.save()
            
            # Create party booking
            booking = PartyBooking.objects.create(
                name=data.get('name'),
                email=data.get('email'),
                phone=data.get('phone'),
                date=data.get('date'),
                time=data.get('time'),
                package_name=data.get('package_name', 'Standard Party'),
                kids=int(data.get('kids', 0)),
                adults=int(data.get('adults', 0)),
                amount=float(data.get('amount', 0)),
                birthday_child_name=data.get('birthday_child_name'),
                birthday_child_age=int(data.get('birthday_child_age')) if data.get('birthday_child_age') else None,
                status=data.get('status', 'PENDING'),
                customer=customer,
                waiver_signed=data.get('waiver_signed', False),
            )
            
            return Response({
                'id': booking.id,
                'uuid': str(booking.uuid),
                'name': booking.name,
                'email': booking.email,
                'phone': booking.phone,
                'date': str(booking.date),
                'time': str(booking.time),
                'package_name': booking.package_name,
                'kids': booking.kids,
                'adults': booking.adults,
                'amount': float(booking.amount),
                'birthday_child_name': booking.birthday_child_name,
                'birthday_child_age': booking.birthday_child_age,
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'updated_at': booking.updated_at.isoformat(),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'Failed to create party booking'
            }, status=status.HTTP_400_BAD_REQUEST)

class PartyBookingViewSet(viewsets.ModelViewSet):
    queryset = PartyBooking.objects.all()
    serializer_class = PartyBookingSerializer
    
    def get_queryset(self):
        queryset = PartyBooking.objects.all()
        
        # Status filter
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Date filter
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search) | 
                Q(phone__icontains=search) |
                Q(uuid__icontains=search)
            )
        
        # Arrival status filter
        has_arrived = self.request.query_params.get('has_arrived', None)
        if has_arrived is not None:
            if has_arrived.lower() == 'true':
                queryset = queryset.filter(arrived=True)
            elif has_arrived.lower() == 'false':
                queryset = queryset.filter(arrived=False)
        
        # Ordering
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def get_permissions(self):
        # Allow public access for create, list (for duplicate checking), and ticket retrieval
        if self.action in ['create', 'list', 'ticket']:
            return [permissions.AllowAny()]
        return [IsStaffUser()]  # Allow employees to access party bookings
    
    def create(self, request, *args, **kwargs):
        """Override create to trigger confirmation email"""
        from django.conf import settings
        import logging
        
        logger = logging.getLogger('apps.emails')
        logger.info("=== PartyBookingViewSet.create() called ===")
        
        # Call parent create method
        response = super().create(request, *args, **kwargs)
        
        # Get the created party booking from response
        if response.status_code == 201:
            party_booking_id = response.data.get('id')
            logger.info(f"Party booking {party_booking_id} created successfully")
            
            # Trigger confirmation email if enabled
            if getattr(settings, 'EMAIL_BOOKING_ENABLED', False):
                try:
                    from apps.emails.tasks import send_party_booking_confirmation_email
                    logger.info(f"EMAIL_BOOKING_ENABLED=True, triggering email for party booking {party_booking_id}")
                    send_party_booking_confirmation_email(party_booking_id)
                    logger.info(f"Email queued for party booking {party_booking_id}")
                except Exception as e:
                    logger.error(f"Failed to queue email for party booking {party_booking_id}: {str(e)}", exc_info=True)
            else:
                logger.warning(f"EMAIL_BOOKING_ENABLED=False, skipping email")
        
        return response

    @action(detail=False, methods=['get'], url_path='ticket/(?P<uuid>[^/.]+)')
    def ticket(self, request, uuid=None):
        party_booking = get_object_or_404(PartyBooking, uuid=uuid)
        serializer = self.get_serializer(party_booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_participants(self, request, pk=None):
        """Add participant details to party booking and create individual waivers"""
        from django.utils import timezone
        
        party_booking = self.get_object()
        participants = request.data.get('participants', {})
        waiver_signed = request.data.get('waiver_signed', False)
        ip_address = request.META.get('REMOTE_ADDR')
        
        # Save participants data
        party_booking.participants = participants
        party_booking.waiver_signed = waiver_signed
        if waiver_signed:
            party_booking.waiver_signed_at = timezone.now()
            party_booking.waiver_ip_address = ip_address
        party_booking.save()
        
        # Delete existing waivers for this party booking to prevent duplicates
        # This makes the endpoint idempotent - calling it multiple times won't create duplicates
        Waiver.objects.filter(party_booking=party_booking).delete()
        
        # Find the primary adult
        primary_adult = None
        additional_adults = []
        
        for adult in participants.get('adults', []):
            if adult.get('is_primary', False):
                primary_adult = adult
            else:
                additional_adults.append(adult)
        
        # If no primary adult is marked, use the first adult
        if not primary_adult and participants.get('adults'):
            primary_adult = participants['adults'][0]
            additional_adults = participants['adults'][1:]
        
        # Create waiver for primary adult with minors nested
        if primary_adult:
            Waiver.objects.create(
                name=primary_adult.get('name'),
                email=primary_adult.get('email'),
                phone=primary_adult.get('phone'),
                dob=primary_adult.get('dob'),
                participant_type='ADULT',
                is_primary_signer=True,
                party_booking=party_booking,
                customer=party_booking.customer,
                ip_address=ip_address,
                version='1.0',
                minors=participants.get('minors', []),  # Store minors in JSON field
                adults=additional_adults  # Store additional adults in JSON field
            )
        
        # Create separate waiver records for additional adults only
        for adult in additional_adults:
            Waiver.objects.create(
                name=adult.get('name'),
                email=adult.get('email'),
                phone=adult.get('phone'),
                dob=adult.get('dob'),
                participant_type='ADULT',
                is_primary_signer=False,
                party_booking=party_booking,
                customer=party_booking.customer,
                ip_address=ip_address,
                version='1.0'
            )
        
        return Response({
            'success': True,
            'message': 'Participants added successfully',
            'waiver_count': len(participants.get('adults', [])) + len(participants.get('minors', []))
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resend_confirmation_email(self, request, pk=None):
        """Resend booking confirmation email to customer"""
        party_booking = self.get_object()
        
        try:
            # TODO: Implement email sending logic here
            # For now, just return success
            # In production, you would use Django's send_mail or your email service
            
            return Response({
                'success': True,
                'message': f'Confirmation email sent to {party_booking.customer_email}'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to send email: {str(e)}'
            }, status=500)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def mark_arrived(self, request, pk=None):
        """Mark a party booking as arrived"""
        party_booking = self.get_object()
        party_booking.arrived = True
        party_booking.arrived_at = timezone.now()
        party_booking.save()
        
        serializer = self.get_serializer(party_booking)
        return Response({
            'success': True,
            'message': f'Party Booking #{party_booking.id} marked as arrived',
            'booking': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def mark_not_arrived(self, request, pk=None):
        """Mark a party booking as not arrived"""
        party_booking = self.get_object()
        party_booking.arrived = False
        party_booking.arrived_at = None
        party_booking.save()
        
        serializer = self.get_serializer(party_booking)
        return Response({
            'success': True,
            'message': f'Party Booking #{party_booking.id} marked as not arrived',
            'booking': serializer.data
        })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def add_party_participants_view(request, uuid):
    """
    Custom view to add participants to a party booking identified by UUID.
    This bypasses the PartyBookingViewSet lookup which expects integer PKs.
    """
    from django.utils import timezone
    
    party_booking = get_object_or_404(PartyBooking, uuid=uuid)
    participants = request.data.get('participants', {})
    waiver_signed = request.data.get('waiver_signed', False)
    ip_address = request.META.get('REMOTE_ADDR')
    
    # Save participants data
    party_booking.participants = participants
    party_booking.waiver_signed = waiver_signed
    if waiver_signed:
        party_booking.waiver_signed_at = timezone.now()
        party_booking.waiver_ip_address = ip_address
    party_booking.save()
    
    # Delete existing waivers for this party booking to prevent duplicates
    # This makes the endpoint idempotent - calling it multiple times won't create duplicates
    Waiver.objects.filter(party_booking=party_booking).delete()
    
    # Find the primary adult
    primary_adult = None
    additional_adults = []
    
    for adult in participants.get('adults', []):
        if adult.get('is_primary', False):
            primary_adult = adult
        else:
            additional_adults.append(adult)
    
    # If no primary adult is marked, use the first adult
    if not primary_adult and participants.get('adults'):
        primary_adult = participants['adults'][0]
        additional_adults = participants['adults'][1:]
    
    # Create waiver for primary adult with minors nested
    if primary_adult:
        Waiver.objects.create(
            name=primary_adult.get('name'),
            email=primary_adult.get('email'),
            phone=primary_adult.get('phone'),
            dob=primary_adult.get('dob'),
            participant_type='ADULT',
            is_primary_signer=True,
            party_booking=party_booking,
            customer=party_booking.customer,
            ip_address=ip_address,
            version='1.0',
            minors=participants.get('minors', []),  # Store minors in JSON field
            adults=additional_adults  # Store additional adults in JSON field
        )
    
    # Create separate waiver records for additional adults only
    for adult in additional_adults:
        Waiver.objects.create(
            name=adult.get('name'),
            email=adult.get('email'),
            phone=adult.get('phone'),
            dob=adult.get('dob'),
            participant_type='ADULT',
            is_primary_signer=False,
            party_booking=party_booking,
            customer=party_booking.customer,
            ip_address=ip_address,
            version='1.0'
        )
    
    return Response({
        'success': True,
        'message': 'Participants added successfully',
        'waiver_count': len(participants.get('adults', [])) + len(participants.get('minors', []))
    })

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAdminUser])
def party_booking_detail_view(request, id):
    """Custom view to get/update/delete party booking details by ID"""
    try:
        party_booking = PartyBooking.objects.get(pk=id)
        
        if request.method == 'GET':
            data = {
                'id': party_booking.id,
                'uuid': str(party_booking.uuid),
                'name': party_booking.name,
                'email': party_booking.email,
                'phone': party_booking.phone,
                'date': str(party_booking.date),
                'time': str(party_booking.time),
                'package_name': party_booking.package_name,
                'kids': party_booking.kids,
                'adults': party_booking.adults,
                'amount': float(party_booking.amount),
                'birthday_child_name': party_booking.birthday_child_name,
                'birthday_child_age': party_booking.birthday_child_age,
                'participants': party_booking.participants,
                'waiver_signed': party_booking.waiver_signed,
                'waiver_signed_at': party_booking.waiver_signed_at.isoformat() if party_booking.waiver_signed_at else None,
                'waiver_ip_address': party_booking.waiver_ip_address,
                'status': party_booking.status,
                'customer': party_booking.customer.id if party_booking.customer else None,
                'created_at': party_booking.created_at.isoformat(),
                'updated_at': party_booking.updated_at.isoformat(),
            }
            return Response(data)
        
        elif request.method == 'PATCH':
            # Update party booking fields
            update_data = request.data
            if 'status' in update_data:
                party_booking.status = update_data['status']
            if 'booking_status' in update_data:
                party_booking.status = update_data['booking_status']
            if 'name' in update_data:
                party_booking.name = update_data['name']
            if 'email' in update_data:
                party_booking.email = update_data['email']
            if 'phone' in update_data:
                party_booking.phone = update_data['phone']
            if 'date' in update_data:
                party_booking.date = update_data['date']
            if 'time' in update_data:
                party_booking.time = update_data['time']
            if 'amount' in update_data:
                party_booking.amount = update_data['amount']
            
            party_booking.save()
            
            return Response({
                'id': party_booking.id,
                'uuid': str(party_booking.uuid),
                'status': party_booking.status,
                'updated_at': party_booking.updated_at.isoformat(),
            })
        
        elif request.method == 'DELETE':
            party_booking.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
    except PartyBooking.DoesNotExist:
        return Response({'success': False, 'error': 'Party booking not found'}, status=404)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def mark_party_arrived_view(request, pk):
    """Mark a party booking as arrived"""
    try:
        party_booking = PartyBooking.objects.get(pk=pk)
        party_booking.arrived = True
        party_booking.arrived_at = timezone.now()
        party_booking.save()
        
        return Response({
            'success': True,
            'message': f'Party Booking #{party_booking.id} marked as arrived'
        })
    except PartyBooking.DoesNotExist:
        return Response({'success': False, 'error': 'Party booking not found'}, status=404)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def mark_party_not_arrived_view(request, pk):
    """Mark a party booking as not arrived"""
    try:
        party_booking = PartyBooking.objects.get(pk=pk)
        party_booking.arrived = False
        party_booking.arrived_at = None
        party_booking.save()
        
        return Response({
            'success': True,
            'message': f'Party Booking #{party_booking.id} marked as not arrived'
        })
    except PartyBooking.DoesNotExist:
        return Response({'success': False, 'error': 'Party booking not found'}, status=404)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

# Session Booking History ViewSet
class SessionBookingHistoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing session booking history.
    Allows listing and restoring bookings that were paid but not saved.
    """
    queryset = SessionBookingHistory.objects.all()
    serializer_class = SessionBookingHistorySerializer
    permission_classes = [IsStaffUser]  # Allow employees to view booking history
    
    def get_queryset(self):
        """By default, only show non-restored history records"""
        queryset = SessionBookingHistory.objects.all()
        
        # Filter by restored status
        show_restored = self.request.query_params.get('show_restored', 'false')
        if show_restored.lower() != 'true':
            queryset = queryset.filter(restored=False)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        """
        Restore a booking from history to the main Booking table.
        This operation is atomic and will mark the history record as restored.
        """
        try:
            with transaction.atomic():
                history = self.get_object()
                
                # Validate not already restored
                if history.restored:
                    return Response({
                        'success': False,
                        'error': 'This booking has already been restored',
                        'restored_at': history.restored_at,
                        'restored_by': history.restored_by.username if history.restored_by else None,
                        'restored_booking_id': history.restored_booking_id
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create or get customer
                customer = None
                if history.email:
                    customer, created = Customer.objects.get_or_create(
                        email=history.email,
                        defaults={
                            'name': history.name,
                            'phone': history.phone,
                        }
                    )
                    if not created and not customer.name:
                        customer.name = history.name
                        customer.phone = history.phone
                        customer.save()
                
                # Create new booking from history data
                booking = Booking.objects.create(
                    name=history.name,
                    email=history.email,
                    phone=history.phone,
                    date=history.date,
                    time=history.time,
                    duration=history.duration,
                    adults=history.adults,
                    kids=history.kids,
                    spectators=history.spectators,
                    subtotal=history.subtotal,
                    discount_amount=history.discount_amount,
                    amount=history.amount,
                    voucher_code=history.voucher_code,
                    booking_status='CONFIRMED',  # Restored bookings are confirmed
                    payment_status='PAID' if history.payment_amount else 'PENDING',
                    waiver_status='PENDING',
                    type='MANUAL',  # Mark as manual since it's being restored by admin
                    customer=customer,
                )
                
                # Mark history as restored
                history.restored = True
                history.restored_at = timezone.now()
                history.restored_by = request.user
                history.restored_booking_id = booking.id
                history.save()
                
                # Serialize the created booking
                booking_serializer = BookingSerializer(booking)
                
                return Response({
                    'success': True,
                    'message': f'Booking restored successfully as Booking #{booking.id}',
                    'booking_id': booking.id,
                    'booking': booking_serializer.data,
                    'history_id': history.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to restore booking: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PartyBookingHistoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing party booking history.
    Allows listing and restoring bookings that were paid but not saved.
    """
    queryset = PartyBookingHistory.objects.all()
    serializer_class = PartyBookingHistorySerializer
    permission_classes = [IsStaffUser]  # Allow employees to view party booking history
    
    def get_queryset(self):
        """By default, only show non-restored history records"""
        queryset = PartyBookingHistory.objects.all()
        
        # Filter by restored status
        show_restored = self.request.query_params.get('show_restored', 'false')
        if show_restored.lower() != 'true':
            queryset = queryset.filter(restored=False)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        """
        Restore a party booking from history to the main PartyBooking table.
        This operation is atomic and will mark the history record as restored.
        """
        try:
            with transaction.atomic():
                history = self.get_object()
                
                # Validate not already restored
                if history.restored:
                    return Response({
                        'success': False,
                        'error': 'This booking has already been restored',
                        'restored_at': history.restored_at,
                        'restored_by': history.restored_by.username if history.restored_by else None,
                        'restored_booking_id': history.restored_booking_id
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create or get customer
                customer = None
                if history.email:
                    customer, created = Customer.objects.get_or_create(
                        email=history.email,
                        defaults={
                            'name': history.name,
                            'phone': history.phone,
                        }
                    )
                    if not created and not customer.name:
                        customer.name = history.name
                        customer.phone = history.phone
                        customer.save()
                
                # Create new party booking from history data
                party_booking = PartyBooking.objects.create(
                    name=history.name,
                    email=history.email,
                    phone=history.phone,
                    date=history.date,
                    time=history.time,
                    package_name=history.package_name,
                    kids=history.kids,
                    adults=history.adults,
                    amount=history.amount,
                    birthday_child_name=history.birthday_child_name,
                    birthday_child_age=history.birthday_child_age,
                    participants=history.participants,
                    status='CONFIRMED',  # Restored bookings are confirmed
                    customer=customer,
                )
                
                # Mark history as restored
                history.restored = True
                history.restored_at = timezone.now()
                history.restored_by = request.user
                history.restored_booking_id = party_booking.id
                history.save()
                
                # Serialize the created booking
                booking_serializer = PartyBookingSerializer(party_booking)
                
                return Response({
                    'success': True,
                    'message': f'Party booking restored successfully as Booking #{party_booking.id}',
                    'booking_id': party_booking.id,
                    'booking': booking_serializer.data,
                    'history_id': history.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to restore party booking: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

