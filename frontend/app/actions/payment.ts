"use server";

/**
 * Payment Actions
 * 
 * Server actions for payment gateway integration (Mock & Razorpay)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface PaymentOrderData {
    booking_id: number;
    booking_type: "session" | "party";
    amount?: number; // Optional, defaults to remaining balance
}

export interface PaymentVerificationData {
    order_id: string;
    // For Razorpay
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    // For Mock
    force_fail?: boolean;
}

/**
 * Create a payment order
 */
export async function createPaymentOrder(data: PaymentOrderData) {
    try {
        const response = await fetch(`${API_URL}/payments/create-order/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "Failed to create payment order",
            };
        }

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        console.error("Create payment order error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

/**
 * Verify payment
 */
export async function verifyPayment(data: PaymentVerificationData) {
    try {
        const response = await fetch(`${API_URL}/payments/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "Payment verification failed",
            };
        }

        return result;
    } catch (error) {
        console.error("Verify payment error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

/**
 * Get booking payment status
 */
export async function getBookingPaymentStatus(bookingId: number, bookingType: "session" | "party") {
    try {
        const response = await fetch(
            `${API_URL}/payments/booking/${bookingId}/${bookingType}/status/`,
            {
                cache: "no-store",
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "Failed to get payment status",
            };
        }

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        console.error("Get payment status error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}
