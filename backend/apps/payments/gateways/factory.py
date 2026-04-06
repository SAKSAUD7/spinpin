"""
Payment Gateway Factory.

Razorpay has been removed. SumUp will be integrated here in a future release.
The only active gateway is the Mock gateway, which auto-confirms bookings
so the booking can be saved to the database — payment is collected at the venue.
"""

import logging
from .base import BasePaymentGateway
from .mock import MockPaymentGateway

logger = logging.getLogger(__name__)


def get_payment_gateway() -> BasePaymentGateway:
    """
    Get the configured payment gateway instance.

    Currently only MockPaymentGateway is active.
    SumUp will replace this when online payments go live.

    Returns:
        MockPaymentGateway instance
    """
    logger.info("Payment gateway: Mock (pay at venue — SumUp coming soon)")
    return MockPaymentGateway()


# Singleton instance for reuse
_gateway_instance = None


def get_gateway_instance() -> BasePaymentGateway:
    """
    Get singleton payment gateway instance.

    Returns:
        Cached BasePaymentGateway instance
    """
    global _gateway_instance
    if _gateway_instance is None:
        _gateway_instance = get_payment_gateway()
    return _gateway_instance
