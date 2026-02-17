"use client";

/**
 * Payment Step Component
 * 
 * Reusable payment gateway integration for booking wizards
 * Supports Mock and Razorpay payment gateways
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Loader2, AlertCircle, Shield, Lock } from "lucide-react";
import { createPaymentOrder, verifyPayment } from "../app/actions/payment";

interface PaymentStepProps {
    bookingId: number;
    bookingType: "session" | "party";
    amount: number;
    bookingDetails: {
        date: string;
        time: string;
        name: string;
        email: string;
        [key: string]: any;
    };
    onSuccess: () => void;
    onBack: () => void;
}

export function PaymentStep({
    bookingId,
    bookingType,
    amount,
    bookingDetails,
    onSuccess,
    onBack,
}: PaymentStepProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "verifying" | "success" | "failed">("idle");

    const handlePayment = async () => {
        setIsProcessing(true);
        setError("");
        setPaymentStatus("creating");

        try {
            // Step 1: Create payment order
            const orderResult = await createPaymentOrder({
                booking_id: bookingId,
                booking_type: bookingType,
                amount: amount,
            });

            if (!orderResult.success) {
                throw new Error(orderResult.error || "Failed to create payment order");
            }

            const { order_id, provider, mock } = orderResult;

            // Step 2: Handle payment based on provider
            if (provider === "MOCK" || mock) {
                // Mock gateway - auto-verify
                setPaymentStatus("verifying");
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

                const verifyResult = await verifyPayment({
                    order_id: order_id,
                });

                if (verifyResult.success) {
                    setPaymentStatus("success");
                    setTimeout(() => {
                        onSuccess();
                    }, 1000);
                } else {
                    throw new Error(verifyResult.error || "Payment verification failed");
                }
            } else if (provider === "RAZORPAY") {
                // Razorpay gateway - open Razorpay checkout
                // @ts-ignore
                const options = {
                    key: orderResult.key_id,
                    amount: orderResult.amount * 100, // Convert to paise
                    currency: "INR",
                    name: "Ninja Inflatable Park",
                    description: `${bookingType === "session" ? "Session" : "Party"} Booking`,
                    order_id: order_id,
                    handler: async function (response: any) {
                        setPaymentStatus("verifying");

                        const verifyResult = await verifyPayment({
                            order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResult.success) {
                            setPaymentStatus("success");
                            setTimeout(() => {
                                onSuccess();
                            }, 1000);
                        } else {
                            throw new Error(verifyResult.error || "Payment verification failed");
                        }
                    },
                    prefill: {
                        name: bookingDetails.name,
                        email: bookingDetails.email,
                        contact: bookingDetails.phone || "",
                    },
                    theme: {
                        color: "#00F0FF",
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                            setPaymentStatus("idle");
                            setError("Payment cancelled");
                        },
                    },
                };

                // @ts-ignore
                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err: any) {
            console.error("Payment error:", err);
            const errorMessage = err.message || "Payment failed. Please try again.";

            // Check for specific errors
            if (errorMessage.includes("not found")) {
                setError("Booking not found. Please go back and try again.");
            } else if (errorMessage.includes("Decimal")) {
                setError("Payment calculation error. Please contact support.");
            } else {
                setError(errorMessage);
            }

            setPaymentStatus("failed");
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CreditCard className="text-primary h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-display font-black text-white">Payment</h2>
                    <p className="text-white/50 text-sm">Secure payment gateway</p>
                </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-surface-900/50 rounded-2xl p-6 border-2 border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
                <div className="space-y-3 text-white/70">
                    <div className="flex justify-between">
                        <span>Date & Time</span>
                        <span className="font-bold text-white">
                            {new Date(bookingDetails.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {bookingDetails.time}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Contact</span>
                        <span className="font-bold text-white">{bookingDetails.name}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-xl font-bold text-white">Total Amount</span>
                        <span className="text-2xl font-black text-primary">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            {paymentStatus !== "idle" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 border-2 ${paymentStatus === "success"
                        ? "bg-green-500/10 border-green-500/30"
                        : paymentStatus === "failed"
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-primary/10 border-primary/30"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {paymentStatus === "creating" && (
                            <>
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                <span className="text-white font-medium">Creating payment order...</span>
                            </>
                        )}
                        {paymentStatus === "verifying" && (
                            <>
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                <span className="text-white font-medium">Verifying payment...</span>
                            </>
                        )}
                        {paymentStatus === "success" && (
                            <>
                                <Check className="w-6 h-6 text-green-400" />
                                <span className="text-green-400 font-medium">Payment successful!</span>
                            </>
                        )}
                        {paymentStatus === "failed" && (
                            <>
                                <AlertCircle className="w-6 h-6 text-red-400" />
                                <span className="text-red-400 font-medium">Payment failed</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Security Notice */}
            <div className="bg-background-dark/50 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/60">
                    <p className="font-medium text-white/80 mb-1">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Secure Payment
                    </p>
                    <p>Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing || paymentStatus === "success"}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-success via-success to-success/90 hover:from-success/90 hover:via-success hover:to-success text-black font-black rounded-xl shadow-neon-lime transform transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Processing...
                        </>
                    ) : paymentStatus === "success" ? (
                        <>
                            <Check className="w-6 h-6" />
                            Payment Complete
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-6 h-6" />
                            Pay ₹{amount.toLocaleString('en-IN')}
                        </>
                    )}
                </button>
            </div>

            <p className="text-center text-white/40 text-sm">
                🔒 This is a {process.env.NEXT_PUBLIC_PAYMENT_MODE === "razorpay" ? "live" : "test"} payment gateway.
                {process.env.NEXT_PUBLIC_PAYMENT_MODE !== "razorpay" && " No real money will be charged."}
            </p>
        </motion.div>
    );
}
