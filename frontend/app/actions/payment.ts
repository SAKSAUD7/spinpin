"use server";

/**
 * Payment Actions — SumUp Integration (Live)
 *
 * Dual-merchant routing:
 *   - roller-skating / arcade → SpinPin Ltd account
 *   - ten-pin-bowling         → Twinkle Town Ltd account
 *
 * Flow:
 *   1. createPaymentOrder() → backend creates SumUp checkout → returns checkout_url
 *   2. Frontend redirects customer to checkout_url (SumUp hosted page)
 *   3. SumUp redirects back to /book/success?checkout_id=xxx&status=PAID|FAILED
 *   4. Success page shows confirmation
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";

export interface PaymentOrderData {
    booking_id: number;
    booking_type: "session" | "party";
    amount?: number;
}

export interface PaymentVerificationData {
    order_id: string;
}

export interface PaymentOrderResult {
    success: boolean;
    provider?: string;
    order_id?: string;
    checkout_url?: string;
    merchant?: string;
    amount?: number;
    currency?: string;
    error?: string;
    message?: string;
}

/**
 * Create a SumUp payment checkout.
 *
 * Calls POST /api/v1/payments/create-order on the Django backend.
 * The backend automatically selects the correct SumUp merchant
 * (SpinPin Ltd or Twinkle Town Ltd) based on the booking's activity.
 *
 * Returns { checkout_url } — redirect the user to this URL.
 */
export async function createPaymentOrder(
    data: PaymentOrderData
): Promise<PaymentOrderResult> {
    try {
        const response = await fetch(`${API_URL}/payments/create-order/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                booking_id:   data.booking_id,
                booking_type: data.booking_type,
                amount:       data.amount,
            }),
            cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Payment order creation failed:", result);
            return {
                success: false,
                error: result.error || "Failed to create payment order",
            };
        }

        console.log(
            `SumUp checkout created via ${result.merchant}:`,
            result.order_id
        );

        return {
            success:      true,
            provider:     result.provider || "sumup",
            order_id:     result.order_id,
            checkout_url: result.checkout_url,
            merchant:     result.merchant,
            amount:       result.amount,
            currency:     result.currency,
        };
    } catch (error) {
        console.error("Error creating payment order:", error);
        return {
            success: false,
            error:   error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Verify a SumUp payment after redirect.
 *
 * Calls POST /api/v1/payments/verify on the Django backend.
 * The backend polls SumUp API to confirm the payment status
 * and updates the booking's payment_status field.
 */
export async function verifyPayment(data: PaymentVerificationData) {
    try {
        const response = await fetch(`${API_URL}/payments/verify/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: data.order_id }),
            cache: "no-store",
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error verifying payment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Verification failed",
        };
    }
}

/**
 * Get payment status for a booking.
 */
export async function getBookingPaymentStatus(
    bookingId: number,
    bookingType: "session" | "party"
) {
    try {
        const response = await fetch(
            `${API_URL}/payments/booking/${bookingId}/${bookingType}/status`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            return { success: false, payment_status: "UNKNOWN" };
        }

        return { success: true, ...(await response.json()) };
    } catch (error) {
        console.error("Error fetching payment status:", error);
        return { success: false, payment_status: "UNKNOWN" };
    }
}
