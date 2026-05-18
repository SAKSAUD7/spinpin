"""
SumUp Payment Gateway Integration for SpinPin.

Uses SumUp Checkout API (hosted redirect flow):
  1. Call /checkouts to create a checkout → get checkout_id
  2. Redirect customer to https://checkout.sumup.com/one/checkout?token={checkout_id}
  3. SumUp redirects back to /book/success?checkout_id={id}&status=paid|failed
  4. Call /checkouts/{id} to verify final status server-side

Docs: https://developer.sumup.com/api/checkouts/
"""

import logging
import uuid
import requests
from decimal import Decimal
from typing import Tuple, Dict, Any, Optional

from django.conf import settings

from .base import BasePaymentGateway
from ..models import Payment

logger = logging.getLogger(__name__)

SUMUP_API_BASE = "https://api.sumup.com/v0.1"


class SumUpGateway(BasePaymentGateway):
    """
    SumUp Checkout API gateway.

    Supports:
    - Creating hosted checkouts (redirect flow)
    - Verifying payment status via API
    - Refunds via API
    """

    def __init__(self):
        self.api_key = getattr(settings, "SUMUP_API_KEY", "")
        self.merchant_code = getattr(settings, "SUMUP_MERCHANT_CODE", "")
        self.return_url = getattr(settings, "SUMUP_RETURN_URL", "http://localhost:5000/book/success")
        if not self.api_key:
            logger.warning("SUMUP_API_KEY not configured — SumUp payments will fail")

    def get_provider_name(self) -> str:
        return "sumup"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def create_order(self, booking, amount: Decimal) -> Dict[str, Any]:
        """
        Create a SumUp checkout and return checkout details.

        Returns dict with:
          - order_id: the checkout_id from SumUp
          - checkout_url: URL to redirect customer to
          - provider: 'sumup'
          - amount, currency
        """
        # Determine booking type
        from apps.bookings.models import PartyBooking
        is_party = isinstance(booking, PartyBooking)
        booking_type = "party" if is_party else "session"

        # Generate a unique reference
        reference = f"SP-{booking.id}-{uuid.uuid4().hex[:8].upper()}"

        description = (
            f"{'Party' if is_party else 'Session'} Booking #{booking.id} — SpinPin Leicester"
        )

        payload = {
            "checkout_reference": reference,
            "amount": float(amount),
            "currency": "GBP",
            "merchant_code": self.merchant_code,
            "description": description,
            "return_url": f"{self.return_url}?booking_id={booking.id}&booking_type={booking_type}&reference={reference}",
        }

        try:
            resp = requests.post(
                f"{SUMUP_API_BASE}/checkouts",
                json=payload,
                headers=self._headers(),
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            logger.error(f"SumUp create_order failed: {e}")
            raise Exception(f"SumUp checkout creation failed: {e}")

        checkout_id = data.get("id")
        if not checkout_id:
            raise Exception(f"SumUp returned no checkout ID: {data}")

        # Save Payment record
        payment_kwargs = {"booking": booking} if not is_party else {"party_booking": booking}
        Payment.objects.create(
            **payment_kwargs,
            provider="SUMUP",
            order_id=checkout_id,
            amount=amount,
            currency="GBP",
            status="CREATED",
            provider_response=data,
        )

        checkout_url = f"https://checkout.sumup.com/one/checkout?token={checkout_id}"

        logger.info(f"SumUp checkout created: {checkout_id} for {booking_type} booking {booking.id}")

        return {
            "order_id": checkout_id,
            "checkout_url": checkout_url,
            "provider": "sumup",
            "amount": float(amount),
            "currency": "GBP",
            "reference": reference,
        }

    def verify_payment(self, payment_data: Dict[str, Any]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Verify a SumUp checkout by polling /checkouts/{id}.

        payment_data must contain 'order_id' (the SumUp checkout ID).
        Returns (success, payment_id, response_dict).
        """
        checkout_id = payment_data.get("order_id")
        if not checkout_id:
            return False, None, {"error": "Missing checkout ID"}

        try:
            resp = requests.get(
                f"{SUMUP_API_BASE}/checkouts/{checkout_id}",
                headers=self._headers(),
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            logger.error(f"SumUp verify_payment failed: {e}")
            return False, None, {"error": str(e)}

        status = data.get("status", "").upper()
        logger.info(f"SumUp checkout {checkout_id} status: {status}")

        if status == "PAID":
            # Get the transaction ID from the transactions list
            transactions = data.get("transactions", [])
            tx_id = transactions[0].get("id") if transactions else checkout_id

            # Update Payment record
            try:
                payment = Payment.objects.get(order_id=checkout_id)
                payment.mark_success(payment_id=tx_id, provider_response=data)

                # Update booking paid_amount and payment_status
                booking = payment.get_booking()
                booking.paid_amount = payment.amount
                if booking.paid_amount >= booking.amount:
                    booking.payment_status = "PAID"
                else:
                    booking.payment_status = "PARTIAL"
                booking.booking_status = "CONFIRMED"
                booking.save(update_fields=["paid_amount", "payment_status", "booking_status"])

            except Payment.DoesNotExist:
                logger.warning(f"Payment record not found for checkout {checkout_id}")

            return True, tx_id, data

        elif status in ("FAILED", "EXPIRED"):
            try:
                payment = Payment.objects.get(order_id=checkout_id)
                payment.mark_failed(f"SumUp status: {status}")
            except Payment.DoesNotExist:
                pass
            return False, None, {"error": f"Checkout {status.lower()}", "status": status}

        # Pending / in-progress
        return False, None, {"status": status, "message": "Payment not yet completed"}

    def refund(self, payment: Payment, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Initiate a refund via SumUp API.
        SumUp refunds are made against the transaction ID, not the checkout ID.
        """
        tx_id = payment.payment_id
        if not tx_id:
            raise ValueError("Cannot refund — no SumUp transaction ID on payment record")

        refund_amount = float(amount) if amount else float(payment.amount)

        try:
            resp = requests.post(
                f"{SUMUP_API_BASE}/me/refund/{tx_id}",
                json={"amount": refund_amount},
                headers=self._headers(),
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json() if resp.content else {}
        except requests.RequestException as e:
            logger.error(f"SumUp refund failed: {e}")
            raise Exception(f"SumUp refund failed: {e}")

        # Update payment record
        payment.status = "REFUNDED"
        payment.notes = f"Refunded £{refund_amount}"
        payment.save(update_fields=["status", "notes"])

        # Update booking
        booking = payment.get_booking()
        booking.paid_amount = max(Decimal("0"), booking.paid_amount - Decimal(str(refund_amount)))
        if booking.paid_amount <= 0:
            booking.payment_status = "REFUNDED"
        else:
            booking.payment_status = "PARTIAL"
        booking.save(update_fields=["paid_amount", "payment_status"])

        logger.info(f"SumUp refund processed: £{refund_amount} for transaction {tx_id}")

        return {
            "refund_id": f"refund-{tx_id}",
            "amount": refund_amount,
            "currency": "GBP",
            "status": "REFUNDED",
        }
