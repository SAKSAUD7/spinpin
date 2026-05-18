"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, ArrowRight, Ticket, XCircle, Loader2 } from "lucide-react";

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [booking, setBooking] = useState<any>(null);

    // SumUp sends: ?checkout_id=xxx&merchant_code=xxx&status=PAID or FAILED
    const checkoutId = searchParams.get("checkout_id");
    const paymentStatus = searchParams.get("status");

    useEffect(() => {
        // If status comes directly from SumUp redirect
        if (paymentStatus === "PAID" || paymentStatus === "PENDING") {
            setStatus("success");
        } else if (paymentStatus === "FAILED") {
            setStatus("failed");
        } else {
            // If no SumUp params, assume pay-at-venue (mock mode) success
            setStatus("success");
        }
    }, [paymentStatus]);

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-white/70 text-lg">Confirming your booking...</p>
                </div>
            </main>
        );
    }

    if (status === "failed") {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="max-w-lg w-full text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-14 h-14 text-red-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-3xl font-black text-white mb-4">Payment Failed</h1>
                        <p className="text-white/60 mb-8 text-lg">
                            Your payment could not be processed. No charge has been made.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/book"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 transition-all"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    // SUCCESS
    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">
                {/* Animated check */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="mb-8"
                >
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400/30 to-cyan-500/30 border-2 border-green-400/50 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                        Booking{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                            Confirmed!
                        </span>
                    </h1>
                    <p className="text-white/60 text-lg mb-8">
                        {paymentStatus === "PAID"
                            ? "Your payment was successful. See you at Spin Pin!"
                            : "Your booking is confirmed. Pay at the venue when you arrive."}
                    </p>

                    {/* Info Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
                        {checkoutId && (
                            <div className="flex items-center justify-between">
                                <span className="text-white/50 text-sm flex items-center gap-2">
                                    <Ticket className="w-4 h-4" /> Payment Reference
                                </span>
                                <span className="text-white font-mono text-sm font-bold">{checkoutId}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-white/50 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Status
                            </span>
                            <span className="text-green-400 font-bold text-sm">
                                {paymentStatus === "PAID" ? "✅ Paid" : "✅ Confirmed — Pay at Venue"}
                            </span>
                        </div>
                    </div>

                    {/* Important reminder */}
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-8">
                        <p className="text-cyan-300 text-sm font-semibold mb-2">📋 What to bring:</p>
                        <ul className="text-white/60 text-sm space-y-1 text-left">
                            <li>• Your booking confirmation email</li>
                            <li>• Valid ID (for group leader)</li>
                            <li>• Comfortable clothes & socks</li>
                            <li>• Arrive 10 minutes before your session</li>
                        </ul>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 transition-all"
                        >
                            Back to Home <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
                        >
                            Need Help?
                        </Link>
                    </div>

                    {/* Location reminder */}
                    <p className="text-white/30 text-sm mt-8">
                        📍 Spin Pin · Ramdoot House, Navigation Street, Leicester, LE1 3UR
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
