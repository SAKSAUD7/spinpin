"""
Payment API URLs.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_payments, name='list-payments'),  # List all payments
    path('create-order/', views.create_payment_order, name='create-payment-order'),
    path('verify/', views.verify_payment, name='verify-payment'),
    path('refund/', views.process_refund, name='process-refund'),
    path('booking/<int:booking_id>/<str:booking_type>/status/', views.get_booking_payment_status, name='booking-payment-status'),
    path('stats/', views.get_payment_stats, name='payment-stats'),
    # SumUp server-to-server webhook — register this URL in SumUp merchant dashboard
    path('sumup-webhook/', views.sumup_webhook, name='sumup-webhook'),
    # Admin: manually re-verify a stuck pending payment
    path('reverify/<str:order_id>/', views.reverify_payment, name='reverify-payment'),
    path('<int:payment_id>/', views.get_payment, name='get-payment'),
]
