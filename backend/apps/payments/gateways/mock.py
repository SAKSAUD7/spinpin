"""
Mock Payment Gateway Implementation.

This gateway simulates payment processing without any real money transactions.
Perfect for development, testing, and demo environments.

Features:
- Generates fake order IDs and payment IDs
- Always succeeds (configurable to test failures)
- Supports full, partial, and deposit payments
- Supports refunds (full and partial)
- Updates database exactly like a real gateway
- Zero risk of actual charges
"""

import uuid
import logging
from decimal import Decimal
from typing import Dict, Any, Tuple, Optional
from datetime import datetime
from django.utils import timezone
from django.db import transaction

from .base import BasePaymentGateway
from apps.payments.models import Payment

logger = logging.getLogger(__name__)


class MockPaymentGateway(BasePaymentGateway):
    """
    Mock payment gateway for testing and development.
    
    This gateway simulates real payment processing without touching real money.
    All payments automatically succeed (unless configured otherwise).
    """
    
    def __init__(self):
        """Initialize mock gateway"""
        self.provider_name = 'MOCK'
        logger.info("MockPaymentGateway initialized")
    
    def create_order(self, booking, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Create a mock payment order.
        
        Args:
            booking: Booking or PartyBooking instance
            amount: Payment amount (defaults to full booking amount)
        
        Returns:
            Dict with order details
        """
        # Determine booking type
        from apps.bookings.models import Booking, PartyBooking
        is_party = isinstance(booking, PartyBooking)
        
        # Calculate amount
        if amount is None:
            amount = booking.amount
        else:
            amount = Decimal(str(amount))
        
        # Generate fake order ID
        order_id = f"MOCK_ORDER_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8].upper()}"
        
        logger.info(f"Creating mock order: {order_id} for ₹{amount}")
        
        # Create Payment record
        payment_data = {
            'provider': self.provider_name,
            'order_id': order_id,
            'amount': amount,
            'currency': 'INR',
            'status': 'CREATED',
            'provider_response': {
                'mock': True,
                'created_at': timezone.now().isoformat(),
                'booking_type': 'party' if is_party else 'session',
                'booking_id': booking.id,
            }
        }
        
        if is_party:
            payment_data['party_booking'] = booking
        else:
            payment_data['booking'] = booking
        
        payment = Payment.objects.create(**payment_data)
        
        logger.info(f"Mock order created: {order_id} (Payment ID: {payment.id})")
        
        return {
            'order_id': order_id,
            'amount': float(amount),
            'currency': 'INR',
            'provider': self.provider_name,
            'payment_id': payment.id,
            'mock': True,
            'message': 'Mock order created successfully (no real money involved)',
        }
    
    @transaction.atomic
    def verify_payment(self, data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Verify mock payment (always succeeds).
        
        Args:
            data: Dict containing 'order_id' and optionally 'force_fail'
        
        Returns:
            Tuple of (success, payment_id, response)
        """
        order_id = data.get('order_id')
        force_fail = data.get('force_fail', False)
        
        if not order_id:
            raise ValueError("order_id is required for payment verification")
        
        # Get payment record
        try:
            payment = Payment.objects.get(order_id=order_id)
        except Payment.DoesNotExist:
            raise ValueError(f"Payment with order_id {order_id} not found")
        
        # Check if already processed
        if payment.status == 'SUCCESS':
            logger.warning(f"Payment {order_id} already processed")
            return (True, payment.payment_id, {'message': 'Payment already processed', 'mock': True})
        
        # Simulate failure if requested
        if force_fail:
            payment.mark_failed("Mock payment forced to fail for testing")
            logger.info(f"Mock payment {order_id} forced to fail")
            return (False, '', {'error': 'Mock payment failed', 'mock': True})
        
        # Generate fake payment ID
        payment_id = f"MOCK_PAY_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8].upper()}"
        
        # Mark payment as successful
        payment.mark_success(
            payment_id=payment_id,
            provider_response={
                'mock': True,
                'verified_at': timezone.now().isoformat(),
                'status': 'success',
            }
        )
        
        # Update booking paid_amount and payment_status
        booking = payment.get_booking()
        booking.paid_amount += payment.amount
        
        # Update payment status based on paid amount
        if booking.paid_amount >= booking.amount:
            booking.payment_status = 'PAID'
        elif booking.paid_amount > 0:
            booking.payment_status = 'PARTIAL'
        
        booking.save()
        
        logger.info(f"Mock payment verified: {order_id} → {payment_id}")
        logger.info(f"Booking {booking.id} paid_amount: ₹{booking.paid_amount}/₹{booking.amount} ({booking.payment_status})")
        
        response = {
            'mock': True,
            'payment_id': payment_id,
            'order_id': order_id,
            'amount': float(payment.amount),
            'status': 'success',
            'booking_payment_status': booking.payment_status,
            'booking_paid_amount': float(booking.paid_amount),
            'booking_remaining': float(booking.remaining_balance),
            'message': 'Mock payment verified successfully (no real money charged)',
        }
        
        return (True, payment_id, response)
    
    @transaction.atomic
    def refund(self, payment, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Process a mock refund.
        
        Args:
            payment: Payment instance to refund
            amount: Refund amount (defaults to full payment amount)
        
        Returns:
            Dict with refund details
        """
        # Calculate refund amount
        if amount is None:
            refund_amount = payment.amount
        else:
            refund_amount = Decimal(str(amount))
        
        # Validate refund amount
        if refund_amount > payment.amount:
            raise ValueError(f"Refund amount (₹{refund_amount}) cannot exceed payment amount (₹{payment.amount})")
        
        if refund_amount <= 0:
            raise ValueError("Refund amount must be positive")
        
        # Generate fake refund ID
        refund_id = f"MOCK_REFUND_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8].upper()}"
        
        logger.info(f"Processing mock refund: {refund_id} for ₹{refund_amount}")
        
        # Create refund payment record (negative amount)
        booking = payment.get_booking()
        from apps.bookings.models import PartyBooking
        is_party = isinstance(booking, PartyBooking)
        
        refund_payment_data = {
            'provider': self.provider_name,
            'order_id': refund_id,
            'payment_id': refund_id,
            'amount': -refund_amount,  # Negative for refund
            'currency': 'INR',
            'status': 'SUCCESS',
            'provider_response': {
                'mock': True,
                'refund': True,
                'original_payment_id': payment.payment_id,
                'original_order_id': payment.order_id,
                'refunded_at': timezone.now().isoformat(),
            },
            'notes': f"Refund for payment {payment.payment_id}",
        }
        
        if is_party:
            refund_payment_data['party_booking'] = booking
        else:
            refund_payment_data['booking'] = booking
        
        refund_payment = Payment.objects.create(**refund_payment_data)
        
        # Update booking paid_amount
        booking.paid_amount -= refund_amount
        
        # Update payment status
        if booking.paid_amount <= 0:
            booking.payment_status = 'REFUNDED'
        elif booking.paid_amount < booking.amount:
            booking.payment_status = 'PARTIAL'
        
        booking.save()
        
        # Mark original payment as refunded if full refund
        if refund_amount == payment.amount:
            payment.status = 'REFUNDED'
            payment.save()
        
        logger.info(f"Mock refund processed: {refund_id}")
        logger.info(f"Booking {booking.id} paid_amount after refund: ₹{booking.paid_amount} ({booking.payment_status})")
        
        return {
            'refund_id': refund_id,
            'amount': float(refund_amount),
            'status': 'success',
            'mock': True,
            'booking_payment_status': booking.payment_status,
            'booking_paid_amount': float(booking.paid_amount),
            'message': f'Mock refund of ₹{refund_amount} processed successfully (no real money refunded)',
        }
    
    def get_provider_name(self) -> str:
        """Get provider name"""
        return self.provider_name
