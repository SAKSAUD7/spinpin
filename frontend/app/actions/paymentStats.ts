"use server";

/**
 * Payment Stats Actions
 * 
 * Server actions for fetching payment analytics and statistics
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getPaymentStats() {
    try {
        const response = await fetch(`${API_URL}/admin/payments/stats/`, {
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Failed to fetch payment stats:", response.statusText);
            return getDefaultStats();
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching payment stats:", error);
        return getDefaultStats();
    }
}

function getDefaultStats() {
    return {
        total_payments: 0,
        successful_payments: 0,
        failed_payments: 0,
        total_refunds: 0,
        total_revenue: 0,
        today_revenue: 0,
        this_week_revenue: 0,
        this_month_revenue: 0,
        avg_transaction_value: 0,
        success_rate: 0,
        recent_payments: [],
        payment_methods: {
            MOCK: 0,
            RAZORPAY: 0
        },
        daily_revenue: []
    };
}
