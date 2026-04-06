"use server";

/**
 * Payment Actions — SumUp integration coming soon.
 *
 * Razorpay has been removed. Online payments will be processed
 * via SumUp in a future release. For now bookings are confirmed
 * and payment is collected at the venue.
 */

export interface PaymentOrderData {
    booking_id: number;
    booking_type: "session" | "party";
    amount?: number;
}

export interface PaymentVerificationData {
    order_id: string;
}

/**
 * Stub — no payment gateway active.
 * Will be replaced with SumUp integration.
 */
export async function createPaymentOrder(_data: PaymentOrderData) {
    return {
        success: true,
        provider: "NONE",
        order_id: `local_${Date.now()}`,
        message: "Pay at venue. SumUp coming soon.",
    };
}

/**
 * Stub — no payment gateway active.
 */
export async function verifyPayment(_data: PaymentVerificationData) {
    return {
        success: true,
        message: "Pay at venue. SumUp coming soon.",
    };
}

/**
 * Stub — no payment gateway active.
 */
export async function getBookingPaymentStatus(
    _bookingId: number,
    _bookingType: "session" | "party"
) {
    return {
        success: true,
        payment_status: "PENDING_VENUE",
        message: "Payment collected at venue.",
    };
}
