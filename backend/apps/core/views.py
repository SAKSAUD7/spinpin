from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta

from .models import User, GlobalSettings, Logo, Notification
from .serializers import UserSerializer, GlobalSettingsSerializer, LogoSerializer, NotificationSerializer

from apps.bookings.models import Booking, Waiver, Customer, PartyBooking
from apps.bookings.serializers import BookingSerializer, PartyBookingSerializer
from apps.shop.models import Voucher
from apps.cms.models import Activity, Faq, Banner


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow Superusers and Staff (Managers/Employees) to view all users
        if self.request.user.is_superuser or self.request.user.is_staff:
            return User.objects.all()
        # Regular users can only see themselves
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        inactive = total - active
        
        # Mock recent logins for now if not tracked, or use last_login
        # Assuming last_login is standard Django field
        today = timezone.now().date()
        recent_logins = User.objects.filter(last_login__date=today).count()

        # Role distribution
        roles = User.objects.values('role').annotate(count=Count('id'))
        role_distribution = [
            {'role': r['role'] or 'No Role', 'count': r['count']} 
            for r in roles
        ]

        return Response({
            'totalUsers': total,
            'activeUsers': active,
            'inactiveUsers': inactive,
            'recentLogins': recent_logins,
            'roleDistribution': role_distribution
        })

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        limit = int(request.query_params.get('limit', 5))
        users = User.objects.order_by('-last_login')[:limit]
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

class GlobalSettingsViewSet(viewsets.ModelViewSet):
    queryset = GlobalSettings.objects.all()
    serializer_class = GlobalSettingsSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'fix_db_schema']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post', 'get'])
    def fix_db_schema(self, request):
        """Force run bookings migration manually"""
        from django.core.management import call_command
        try:
            # Force migration for bookings app
            call_command('migrate', 'bookings')
            return Response({'status': 'success', 'message': 'Bookings migration applied successfully'})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)

class LogoViewSet(viewsets.ModelViewSet):
    queryset = Logo.objects.all()
    serializer_class = LogoSerializer
    # Trigger deployment for missing endpoints
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the currently active logo"""
        try:
            active_logo = Logo.objects.get(is_active=True)
            serializer = self.get_serializer(active_logo, context={'request': request})
            return Response(serializer.data)
        except Logo.DoesNotExist:
            return Response({'error': 'No active logo found'}, status=404)
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """Set a logo as active"""
        logo = self.get_object()
        logo.is_active = True
        logo.save()
        serializer = self.get_serializer(logo, context={'request': request})
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]  # TODO: Change to IsAdminUser in production
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread = Notification.objects.filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(is_read=False).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'success', 'message': 'All notifications marked as read'})



from apps.bookings.permissions import IsStaffUser

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsStaffUser]  # Allow employees to access dashboard

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = timezone.now().date()
        first_day_of_month = today.replace(day=1)

        # Session Bookings (Standard Booking model)
        session_bookings_today = Booking.objects.filter(date=today).exclude(status='CANCELLED').count()
        total_session_bookings = Booking.objects.exclude(status='CANCELLED').count()
        session_revenue = Booking.objects.exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0

        # Party Bookings (New PartyBooking model)
        party_bookings_today = PartyBooking.objects.filter(date=today).exclude(status='CANCELLED').count()
        total_party_bookings = PartyBooking.objects.exclude(status='CANCELLED').count()
        party_revenue = PartyBooking.objects.exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0

        # Aggregated Stats
        bookings_today = session_bookings_today + party_bookings_today
        total_bookings = total_session_bookings + total_party_bookings
        total_revenue = session_revenue + party_revenue

        # Waivers
        pending_waivers = Booking.objects.filter(waiver_status='PENDING').exclude(status='CANCELLED').count()
        pending_party_waivers = PartyBooking.objects.filter(waiver_signed=False).exclude(status='CANCELLED').count()
        total_pending_waivers = pending_waivers + pending_party_waivers

        total_waivers = Waiver.objects.count()
        signed_waivers = total_waivers 

        # Recent Bookings (Combine and Sort)
        recent_sessions = Booking.objects.select_related('customer').order_by('-created_at')[:5]
        recent_parties = PartyBooking.objects.select_related('customer').order_by('-created_at')[:5]
        
        # Manually construct data instead of using serializers
        recent_sessions_data = [{
            'id': b.id,
            'uuid': str(b.uuid),
            'name': b.name,
            'email': b.email,
            'type': 'SESSION',
            'amount': b.amount,
            'date': b.date.isoformat() if b.date else None,
            'time': str(b.time) if b.time else None,
            'status': b.booking_status,
            'created_at': b.created_at.isoformat()
        } for b in recent_sessions]
        
        recent_parties_data = [{
            'id': b.id,
            'uuid': str(b.uuid),
            'name': b.name,
            'email': b.email,
            'type': 'PARTY',
            'amount': b.amount,
            'date': b.date.isoformat() if b.date else None,
            'time': str(b.time) if b.time else None,
            'status': b.status,
            'created_at': b.created_at.isoformat()
        } for b in recent_parties]
        
        all_recent = sorted(
            recent_sessions_data + recent_parties_data, 
            key=lambda x: x.get('created_at', ''), 
            reverse=True
        )[:5]

        # Revenue Chart (last 7 days)
        monthly_revenue = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_session_revenue = Booking.objects.filter(date=d).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
            day_party_revenue = PartyBooking.objects.filter(date=d).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
            
            monthly_revenue.append({
                "name": d.strftime('%a'),
                "total": float(day_session_revenue + day_party_revenue)  # Convert Decimal to float
            })

        # Customers
        total_customers = Customer.objects.count()
        new_customers_month = Customer.objects.filter(created_at__gte=first_day_of_month).count()
        repeat_customers = Customer.objects.annotate(booking_count=Count('bookings')).filter(booking_count__gt=1).count()

        # Vouchers
        active_vouchers = Voucher.objects.filter(is_active=True).count()
        total_voucher_redemptions = Voucher.objects.aggregate(Sum('used_count'))['used_count__sum'] or 0

        # Content
        total_activities = Activity.objects.filter(active=True).count()
        total_faqs = Faq.objects.filter(active=True).count()
        total_banners = Banner.objects.filter(active=True).count()

        # Avg Booking Value
        avg_booking_value = 0
        if total_bookings > 0:
            avg_booking_value = total_revenue / total_bookings

        waiver_completion_rate = 100 if total_waivers == 0 else int((signed_waivers / total_waivers) * 100)

        # NEW METRICS FOR DASHBOARD REDESIGN
        
        # Unread Contact Messages
        from apps.cms.models import ContactMessage
        unread_messages = ContactMessage.objects.filter(is_read=False).count()
        latest_message = ContactMessage.objects.filter(is_read=False).order_by('-created_at').first()
        latest_message_preview = None
        if latest_message:
            latest_message_preview = f"{latest_message.name}: {latest_message.message[:50]}..." if len(latest_message.message) > 50 else f"{latest_message.name}: {latest_message.message}"
        
        # Today's Revenue
        today_session_revenue = Booking.objects.filter(date=today).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
        today_party_revenue = PartyBooking.objects.filter(date=today).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
        today_revenue = today_session_revenue + today_party_revenue
        
        # Yesterday's Revenue for comparison
        yesterday = today - timedelta(days=1)
        yesterday_session_revenue = Booking.objects.filter(date=yesterday).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
        yesterday_party_revenue = PartyBooking.objects.filter(date=yesterday).exclude(status='CANCELLED').aggregate(Sum('amount'))['amount__sum'] or 0
        yesterday_revenue = yesterday_session_revenue + yesterday_party_revenue
        
        # Booking Trend (This week vs Last week)
        week_ago = today - timedelta(days=7)
        two_weeks_ago = today - timedelta(days=14)
        
        this_week_session = Booking.objects.filter(created_at__gte=week_ago).exclude(status='CANCELLED').count()
        this_week_party = PartyBooking.objects.filter(created_at__gte=week_ago).exclude(status='CANCELLED').count()
        this_week_bookings = this_week_session + this_week_party
        
        last_week_session = Booking.objects.filter(created_at__gte=two_weeks_ago, created_at__lt=week_ago).exclude(status='CANCELLED').count()
        last_week_party = PartyBooking.objects.filter(created_at__gte=two_weeks_ago, created_at__lt=week_ago).exclude(status='CANCELLED').count()
        last_week_bookings = last_week_session + last_week_party
        
        # Calculate growth percentage
        booking_growth = 0
        if last_week_bookings > 0:
            booking_growth = round(((this_week_bookings - last_week_bookings) / last_week_bookings) * 100, 1)
        elif this_week_bookings > 0:
            booking_growth = 100  # 100% growth if we had 0 last week

        return Response({
            "bookingsToday": bookings_today,
            "totalBookings": total_bookings,
            "totalRevenue": total_revenue,
            "pendingWaivers": total_pending_waivers,
            "recentBookings": all_recent,
            "monthlyRevenue": monthly_revenue,
            "sessionBookings": total_session_bookings,
            "partyBookings": total_party_bookings,
            "totalCustomers": total_customers,
            "newCustomersMonth": new_customers_month,
            "repeatCustomers": repeat_customers,
            "activeVouchers": active_vouchers,
            "redeemedVouchers": total_voucher_redemptions,
            "totalActivities": total_activities,
            "totalFaqs": total_faqs,
            "totalBanners": total_banners,
            "avgBookingValue": round(avg_booking_value),
            "waiverCompletionRate": waiver_completion_rate,
            "totalWaivers": total_waivers,
            "signedWaivers": signed_waivers,
            # New metrics
            "unreadMessages": unread_messages,
            "latestMessagePreview": latest_message_preview,
            "todayRevenue": float(today_revenue),
            "yesterdayRevenue": float(yesterday_revenue),
            "thisWeekBookings": this_week_bookings,
            "lastWeekBookings": last_week_bookings,
            "bookingGrowth": booking_growth,
        })
    
    @action(detail=False, methods=['get'])
    def all_bookings(self, request):
        """
        Unified endpoint that returns both session and party bookings combined with customer data
        """
        booking_type = request.query_params.get('type', None)
        status = request.query_params.get('status', None)
        search = request.query_params.get('search', None)
        
        all_bookings_data = []
        
        try:
            # Fetch session bookings
            if booking_type != 'party':
                session_bookings = Booking.objects.select_related('customer').all()
                if status:
                    session_bookings = session_bookings.filter(booking_status=status)
                if search:
                    session_bookings = session_bookings.filter(
                        Q(name__icontains=search) | Q(email__icontains=search)
                    )
                
                for booking in session_bookings:
                    try:
                        all_bookings_data.append({
                            'id': booking.id,
                            'uuid': str(booking.uuid),
                            'type': 'SESSION',
                            'name': booking.name,
                            'email': booking.email,
                            'phone': booking.phone,
                            'date': str(booking.date) if booking.date else None,
                            'time': str(booking.time) if booking.time else None,
                            'duration': booking.duration,
                            'adults': booking.adults,
                            'kids': booking.kids,
                            'spectators': booking.spectators,
                            'amount': float(booking.amount) if booking.amount else 0,
                            'booking_status': booking.booking_status,
                            'payment_status': booking.payment_status,
                            'waiver_status': booking.waiver_status,
                            'created_at': booking.created_at.isoformat() if booking.created_at else None,
                            'customer': {
                                'id': booking.customer.id if booking.customer else None,
                                'name': booking.customer.name if booking.customer else booking.name,
                                'email': booking.customer.email if booking.customer else booking.email,
                                'phone': booking.customer.phone if booking.customer else booking.phone,
                            } if booking.customer or booking.name else None
                        })
                    except Exception as e:
                        print(f"Error serializing session booking {booking.id}: {e}")
            
            # Fetch party bookings
            if booking_type != 'session':
                party_bookings = PartyBooking.objects.select_related('customer').all()
                if status:
                    party_bookings = party_bookings.filter(status=status)
                if search:
                    party_bookings = party_bookings.filter(
                        Q(name__icontains=search) | Q(email__icontains=search)
                    )
                
                for booking in party_bookings:
                    try:
                        all_bookings_data.append({
                            'id': booking.id,
                            'uuid': str(booking.uuid),
                            'type': 'PARTY',
                            'name': booking.name,
                            'email': booking.email,
                            'phone': booking.phone,
                            'date': str(booking.date) if booking.date else None,
                            'time': str(booking.time) if booking.time else None,
                            'duration': 120,  # Default party duration
                            'adults': booking.adults,
                            'kids': booking.kids,
                            'spectators': 0,  # Not tracked for party bookings
                            'amount': float(booking.amount) if booking.amount else 0,
                            'booking_status': booking.status,
                            'payment_status': 'PENDING',  # Not tracked separately for party bookings
                            'waiver_status': 'SIGNED' if booking.waiver_signed else 'PENDING',
                            'created_at': booking.created_at.isoformat() if booking.created_at else None,
                            'birthday_child_name': booking.birthday_child_name,
                            'birthday_child_age': booking.birthday_child_age,
                            'package_name': booking.package_name,
                            'customer': {
                                'id': booking.customer.id if booking.customer else None,
                                'name': booking.customer.name if booking.customer else booking.name,
                                'email': booking.customer.email if booking.customer else booking.email,
                                'phone': booking.customer.phone if booking.customer else booking.phone,
                            } if booking.customer or booking.name else None
                        })
                    except Exception as e:
                        print(f"Error serializing party booking {booking.id}: {e}")
            
            # Sort by created_at (most recent first)
            all_bookings_data.sort(key=lambda x: x['created_at'] or '', reverse=True)
            
            return Response({
                'count': len(all_bookings_data),
                'results': all_bookings_data
            })
        except Exception as e:
            print(f"Error in all_bookings: {e}")
            return Response({'error': str(e)}, status=500)
