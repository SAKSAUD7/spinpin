"""
Payment Gateway Factory.

Returns the appropriate payment gateway based on PAYMENT_MODE setting.
This allows seamless switching between Mock and Razorpay without code changes.
"""

import logging
from django.conf import settings

from .base import BasePaymentGateway
from .mock import MockPaymentGateway
from .razorpay import RazorpayGateway

logger = logging.getLogger(__name__)


def get_payment_gateway() -> BasePaymentGateway:
    """
    Get the configured payment gateway instance.
    
    Returns the appropriate gateway based on PAYMENT_MODE setting:
    - 'mock': MockPaymentGateway (default, no real money)
    - 'razorpay': RazorpayGateway (production, requires credentials)
    
    Returns:
        BasePaymentGateway instance
    
    Raises:
        ValueError: If PAYMENT_MODE is invalid
        ImportError: If required dependencies are missing
    """
    payment_mode = getattr(settings, 'PAYMENT_MODE', 'mock').lower()
    
    if payment_mode == 'razorpay':
        logger.info("Initializing Razorpay payment gateway")
        try:
            return RazorpayGateway()
        except Exception as e:
            logger.error(f"Failed to initialize Razorpay gateway: {str(e)}")
            logger.warning("Falling back to Mock gateway")
            return MockPaymentGateway()
    
    elif payment_mode == 'mock':
        logger.info("Initializing Mock payment gateway (no real money)")
        return MockPaymentGateway()
    
    else:
        logger.warning(f"Invalid PAYMENT_MODE '{payment_mode}', defaulting to Mock gateway")
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
