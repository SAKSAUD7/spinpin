from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, BookingViewSet, WaiverViewSet, TransactionViewSet, 
    BookingBlockViewSet, PartyBookingViewSet, SessionBookingHistoryViewSet, 
    PartyBookingHistoryViewSet, create_party_booking_view, waiver_list_view, 
    waiver_detail_view, add_party_participants_view, party_booking_detail_view,
    mark_party_arrived_view, mark_party_not_arrived_view,
    PublicBookingBlockViewSet, PublicSiteAlertViewSet
)
from .calendar_views import calendar_bookings

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'waivers-old', WaiverViewSet)  # Keep for detail/PDF endpoints
router.register(r'transactions', TransactionViewSet)
router.register(r'booking-blocks', BookingBlockViewSet)
# Note: party-bookings viewset is registered but create endpoint is overridden below
router.register(r'party-bookings-old', PartyBookingViewSet)
# History endpoints for booking restoration
router.register(r'session-booking-history', SessionBookingHistoryViewSet)
router.register(r'party-booking-history', PartyBookingHistoryViewSet)
router.register(r'public/booking-blocks', PublicBookingBlockViewSet, basename='public-booking-blocks')
router.register(r'site-alerts', PublicSiteAlertViewSet, basename='site-alerts')

urlpatterns = [
    # Calendar endpoint
    path('calendar/', calendar_bookings, name='calendar-bookings'),
    # Custom party booking endpoints (bypasses serializer bug)
    path('party-bookings/', create_party_booking_view, name='party-bookings-list-create'),
    path('party-bookings/<int:id>/', party_booking_detail_view, name='party-booking-detail'),
    path('party-bookings/<int:pk>/mark_arrived/', mark_party_arrived_view, name='party-booking-mark-arrived'),
    path('party-bookings/<int:pk>/mark_not_arrived/', mark_party_not_arrived_view, name='party-booking-mark-not-arrived'),
    path('party-bookings/<uuid:uuid>/add_participants/', add_party_participants_view, name='party-booking-add-participants'),
    path('party-bookings/ticket/<uuid:uuid>/', PartyBookingViewSet.as_view({'get': 'ticket'}), name='party-booking-ticket'),
    # Custom waiver endpoints (bypasses serializer bug)
    path('waivers/', waiver_list_view, name='waivers-list'),
    path('waivers/<int:id>/', waiver_detail_view, name='waiver-detail'),
    path('', include(router.urls)),
]

