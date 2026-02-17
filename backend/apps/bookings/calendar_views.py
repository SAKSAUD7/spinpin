from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from datetime import datetime, timedelta
from ..bookings.models import Booking, PartyBooking
from ..bookings.permissions import IsStaffUser

@api_view(['GET'])
@permission_classes([IsStaffUser])
def calendar_bookings(request):
    """
    Get all bookings (session + party) for calendar display
    Accepts start_date and end_date query parameters
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    # Default to current month if no dates provided
    if not start_date or not end_date:
        today = datetime.now()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
        # Get last day of month
        if today.month == 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_date = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        end_date = end_date.strftime('%Y-%m-%d')
    
    events = []
    
    # Get session bookings
    session_bookings = Booking.objects.filter(
        date__gte=start_date,
        date__lte=end_date
    ).select_related('customer').order_by('date', 'time')
    
    for booking in session_bookings:
        # Combine date and time for start datetime
        start_datetime = datetime.combine(booking.date, booking.time)
        # Add duration (default 2 hours if not specified)
        duration_minutes = getattr(booking, 'duration', 120)
        end_datetime = start_datetime + timedelta(minutes=duration_minutes)
        
        events.append({
            'id': f'session-{booking.id}',
            'title': f'Session #{booking.id}',
            'start': start_datetime.isoformat(),
            'end': end_datetime.isoformat(),
            'type': 'session',
            'bookingId': booking.id,
            'customerName': booking.customer.name if booking.customer else booking.name,
            'customerEmail': booking.customer.email if booking.customer else booking.email,
            'customerPhone': booking.customer.phone if booking.customer else booking.phone,
            'participants': (booking.kids or 0) + (booking.adults or 0),
            'kids': booking.kids or 0,
            'adults': booking.adults or 0,
            'status': booking.status.lower() if hasattr(booking, 'status') else 'confirmed',
            'amount': float(booking.amount) if booking.amount else 0,
            'arrived': getattr(booking, 'arrived', False),
            'packageName': booking.package_name if hasattr(booking, 'package_name') else 'Session Booking'
        })
    
    # Get party bookings
    party_bookings = PartyBooking.objects.filter(
        date__gte=start_date,
        date__lte=end_date
    ).select_related('customer').order_by('date', 'time')
    
    for booking in party_bookings:
        # Combine date and time for start datetime
        start_datetime = datetime.combine(booking.date, booking.time)
        # Party bookings typically 3 hours
        duration_minutes = 180
        end_datetime = start_datetime + timedelta(minutes=duration_minutes)
        
        events.append({
            'id': f'party-{booking.id}',
            'title': f'Party #{booking.id}',
            'start': start_datetime.isoformat(),
            'end': end_datetime.isoformat(),
            'type': 'party',
            'bookingId': booking.id,
            'customerName': booking.name,
            'customerEmail': booking.email,
            'customerPhone': booking.phone,
            'participants': (booking.kids or 0) + (booking.adults or 0),
            'kids': booking.kids or 0,
            'adults': booking.adults or 0,
            'status': booking.status.lower() if booking.status else 'pending',
            'amount': float(booking.amount) if booking.amount else 0,
            'arrived': getattr(booking, 'arrived', False),
            'packageName': booking.package_name,
            'birthdayChildName': booking.birthday_child_name,
            'birthdayChildAge': booking.birthday_child_age
        })
    
    # Calculate summary
    summary = {
        'totalBookings': len(events),
        'sessionBookings': len([e for e in events if e['type'] == 'session']),
        'partyBookings': len([e for e in events if e['type'] == 'party']),
        'totalRevenue': sum(e['amount'] for e in events),
        'totalParticipants': sum(e['participants'] for e in events)
    }
    
    return Response({
        'events': events,
        'summary': summary,
        'dateRange': {
            'start': start_date,
            'end': end_date
        }
    })
