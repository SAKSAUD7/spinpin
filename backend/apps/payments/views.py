"""
Payment API Views.

Provides REST API endpoints for payment operations:
- Create payment order
- Verify payment
- Process refund
- Get booking payment status
"""

import logging
from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .services import payment_service

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])  # Frontend needs to create orders
def create_payment_order(request):
    """
    Create a payment order.
    
    POST /api/payments/create-order
    
    Body:
        {
            "booking_id": 123,
            "booking_type": "session" or "party",
            "amount": 5000.00  # Optional, defaults to remaining balance
        }
    
    Returns:
        {
            "success": true,
            "order_id": "MOCK_ORDER_...",
            "amount": 5000.00,
            "currency": "INR",
            "provider": "MOCK",
            ...
        }
    """
    try:
        booking_id = request.data.get('booking_id')
        booking_type = request.data.get('booking_type')
        amount = request.data.get('amount')
        
        # Validate required fields
        if not booking_id:
            return Response(
                {'error': 'booking_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not booking_type or booking_type not in ['session', 'party']:
            return Response(
                {'error': 'booking_type must be "session" or "party"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert amount if provided
        if amount is not None:
            try:
                amount = Decimal(str(amount))
            except (InvalidOperation, ValueError):
                return Response(
                    {'error': 'Invalid amount format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create order
        order_data = payment_service.create_payment_order(
            booking_id=int(booking_id),
            booking_type=booking_type,
            amount=amount
        )
        
        return Response({
            'success': True,
            **order_data
        })
        
    except ValueError as e:
        logger.error(f"Validation error creating payment order: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error creating payment order: {str(e)}")
        return Response(
            {'error': f'Failed to create payment order: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # Frontend needs to verify payments
def verify_payment(request):
    """
    Verify a payment.
    
    POST /api/payments/verify
    
    Body (Mock):
        {
            "order_id": "MOCK_ORDER_...",
            "force_fail": false  # Optional, for testing
        }
    
    Body (Razorpay):
        {
            "razorpay_order_id": "order_...",
            "razorpay_payment_id": "pay_...",
            "razorpay_signature": "..."
        }
    
    Returns:
        {
            "success": true,
            "payment_id": "MOCK_PAY_...",
            "booking_id": 123,
            "booking_type": "session",
            "payment_status": "PAID",
            "paid_amount": 5000.00,
            "remaining_balance": 0.00
        }
    """
    try:
        # Get order_id (could be 'order_id' for mock or 'razorpay_order_id' for Razorpay)
        order_id = request.data.get('order_id') or request.data.get('razorpay_order_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id or razorpay_order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify payment
        result = payment_service.verify_and_complete_payment(
            order_id=order_id,
            payment_data=request.data
        )
        
        return Response(result)
        
    except ValueError as e:
        logger.error(f"Validation error verifying payment: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        return Response(
            {'success': False, 'error': f'Failed to verify payment: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only admins can refund
def process_refund(request):
    """
    Process a refund.
    
    POST /api/payments/refund
    
    Body:
        {
            "payment_id": 123,
            "amount": 2500.00,  # Optional, defaults to full refund
            "reason": "Customer requested refund"  # Optional
        }
    
    Returns:
        {
            "success": true,
            "refund_id": "MOCK_REFUND_...",
            "amount": 2500.00,
            "booking_id": 123,
            "payment_status": "PARTIAL"
        }
    """
    try:
        payment_id = request.data.get('payment_id')
        amount = request.data.get('amount')
        reason = request.data.get('reason', '')
        
        if not payment_id:
            return Response(
                {'error': 'payment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert amount if provided
        if amount is not None:
            try:
                amount = Decimal(str(amount))
            except (InvalidOperation, ValueError):
                return Response(
                    {'error': 'Invalid amount format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Process refund
        result = payment_service.process_refund(
            payment_id=int(payment_id),
            amount=amount,
            reason=reason
        )
        
        return Response(result)
        
    except ValueError as e:
        logger.error(f"Validation error processing refund: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error processing refund: {str(e)}")
        return Response(
            {'success': False, 'error': f'Failed to process refund: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_booking_payment_status(request, booking_id, booking_type):
    """
    Get payment status for a booking.
    
    GET /api/payments/booking/{booking_id}/{booking_type}/status
    
    Returns:
        {
            "booking_id": 123,
            "booking_type": "session",
            "total_amount": 5000.00,
            "paid_amount": 2500.00,
            "remaining_balance": 2500.00,
            "payment_status": "PARTIAL",
            "payments": [...]
        }
    """
    try:
        if booking_type not in ['session', 'party']:
            return Response(
                {'error': 'booking_type must be "session" or "party"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = payment_service.get_booking_payment_status(
            booking_id=int(booking_id),
            booking_type=booking_type
        )
        
        return Response(result)
        
    except ValueError as e:
        logger.error(f"Error getting payment status: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        return Response(
            {'error': f'Failed to get payment status: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only admins can view stats
def get_payment_stats(request):
    """
    Get payment statistics and analytics.
    
    GET /api/payments/stats
    
    Returns comprehensive payment analytics including:
    - Total payments, successful, failed, refunds
    - Revenue metrics (total, today, week, month)
    - Average transaction value
    - Success rate
    - Recent payments
    - Payment methods breakdown
    - Daily revenue trend
    """
    try:
        from .models import Payment
        from apps.bookings.models import Booking
        from apps.party_bookings.models import PartyBooking
        from django.db.models import Sum, Count, Q, Avg
        from django.utils import timezone
        from datetime import timedelta
        
        # Get all payments
        all_payments = Payment.objects.all()
        
        # Basic counts
        total_payments = all_payments.count()
        successful_payments = all_payments.filter(status='SUCCESS', amount__gt=0).count()
        failed_payments = all_payments.filter(status='FAILED').count()
        total_refunds = all_payments.filter(amount__lt=0).count()
        
        # Revenue calculations (only successful payments with positive amounts)
        successful_payment_qs = all_payments.filter(status='SUCCESS', amount__gt=0)
        total_revenue = successful_payment_qs.aggregate(total=Sum('amount'))['total'] or 0
        
        # Time-based revenue
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)
        
        today_revenue = successful_payment_qs.filter(
            created_at__gte=today_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        this_week_revenue = successful_payment_qs.filter(
            created_at__gte=week_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        this_month_revenue = successful_payment_qs.filter(
            created_at__gte=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Average transaction value
        avg_transaction = successful_payment_qs.aggregate(avg=Avg('amount'))['avg'] or 0
        
        # Success rate
        success_rate = (successful_payments / total_payments * 100) if total_payments > 0 else 0
        
        # Payment methods breakdown
        payment_methods = {
            'MOCK': all_payments.filter(provider='MOCK').count(),
            'RAZORPAY': all_payments.filter(provider='RAZORPAY').count()
        }
        
        # Recent payments (last 10)
        recent_payments_qs = all_payments.select_related(
            'booking', 'party_booking'
        ).order_by('-created_at')[:10]
        
        recent_payments = []
        for payment in recent_payments_qs:
            booking_info = None
            if payment.booking:
                booking_info = {
                    'id': payment.booking.id,
                    'type': 'session',
                    'name': payment.booking.name,
                    'email': payment.booking.email,
                    'date': payment.booking.date.isoformat() if payment.booking.date else None,
                }
            elif payment.party_booking:
                booking_info = {
                    'id': payment.party_booking.id,
                    'type': 'party',
                    'name': payment.party_booking.name,
                    'email': payment.party_booking.email,
                    'date': payment.party_booking.date.isoformat() if payment.party_booking.date else None,
                }
            
            recent_payments.append({
                'id': payment.id,
                'order_id': payment.order_id,
                'payment_id': payment.payment_id,
                'amount': float(payment.amount),
                'status': payment.status,
                'provider': payment.provider,
                'created_at': payment.created_at.isoformat(),
                'booking': booking_info
            })
        
        # Daily revenue for last 7 days
        daily_revenue = []
        for i in range(6, -1, -1):
            day_start = today_start - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            day_revenue = successful_payment_qs.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            daily_revenue.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'revenue': float(day_revenue)
            })
        
        return Response({
            'total_payments': total_payments,
            'successful_payments': successful_payments,
            'failed_payments': failed_payments,
            'total_refunds': total_refunds,
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'this_week_revenue': float(this_week_revenue),
            'this_month_revenue': float(this_month_revenue),
            'avg_transaction_value': float(avg_transaction),
            'success_rate': round(success_rate, 2),
            'payment_methods': payment_methods,
            'recent_payments': recent_payments,
            'daily_revenue': daily_revenue
        })
        
    except Exception as e:
        logger.error(f"Error getting payment stats: {str(e)}")
        return Response(
            {'error': f'Failed to get payment stats: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_payments(request):
    """
    List all payments with optional filtering.
    
    GET /api/payments/
    
    Query params:
        - status: Filter by status (SUCCESS, FAILED, CREATED, REFUNDED)
        - provider: Filter by provider (MOCK, RAZORPAY)
        - limit: Number of results (default: 100)
        - offset: Pagination offset (default: 0)
    
    Returns:
        {
            "count": 10,
            "results": [...]
        }
    """
    try:
        from .models import Payment
        from .serializers import PaymentSerializer
        
        # Get query parameters
        status_filter = request.query_params.get('status')
        provider_filter = request.query_params.get('provider')
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        # Build query
        queryset = Payment.objects.all().select_related('booking', 'party_booking')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if provider_filter:
            queryset = queryset.filter(provider=provider_filter)
        
        # Order by most recent first
        queryset = queryset.order_by('-created_at')
        
        # Get total count
        total_count = queryset.count()
        
        # Apply pagination
        payments = queryset[offset:offset + limit]
        
        # Serialize
        serializer = PaymentSerializer(payments, many=True)
        
        return Response({
            'count': total_count,
            'results': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error listing payments: {str(e)}")
        return Response(
            {'error': f'Failed to list payments: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
