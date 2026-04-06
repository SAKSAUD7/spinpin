"use client";

/**
 * Payment Step Component
 *
 * Payment gateway is NOT yet integrated.
 * SumUp will be connected here in a future release.
 *
 * Current behaviour: booking is confirmed and payment is collected at the venue.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, MapPin, Shield, Lock, CreditCard, Banknote } from "lucide-react";

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
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        setTimeout(() => {
            onSuccess();
        }, 1200);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CreditCard className="text-primary h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-display font-black text-white">Confirm Booking</h2>
                    <p className="text-white/50 text-sm">Review and confirm your booking</p>
                </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-surface-900/50 rounded-2xl p-6 border-2 border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
                <div className="space-y-3 text-white/70">
                    <div className="flex justify-between">
                        <span>Date &amp; Time</span>
                        <span className="font-bold text-white">
                            {new Date(bookingDetails.date).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })} at {bookingDetails.time}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Contact</span>
                        <span className="font-bold text-white">{bookingDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Type</span>
                        <span className="font-bold text-white capitalize">{bookingType} booking</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-xl font-bold text-white">Total Amount</span>
                        <span className="text-2xl font-black text-primary">£{(amount / 100).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Pay at Venue Notice */}
            <div className="bg-amber-400/10 border-2 border-amber-400/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                        <Banknote className="text-amber-400 h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-amber-400 font-bold text-lg mb-1">Pay at Venue</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Online payment will be available soon via <strong className="text-white">SumUp</strong>.
                            For now, please complete your payment when you arrive at Spin Pin Leicester.
                            We accept <strong className="text-white">cash and card</strong> at reception.
                        </p>
                    </div>
                </div>
            </div>

            {/* What to bring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-800/50 rounded-xl p-4 flex items-start gap-3 border border-white/10">
                    <Clock className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-semibold text-sm">Arrive 10 minutes early</p>
                        <p className="text-white/50 text-xs">Allow time for check-in and payment</p>
                    </div>
                </div>
                <div className="bg-surface-800/50 rounded-xl p-4 flex items-start gap-3 border border-white/10">
                    <MapPin className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-semibold text-sm">Spin Pin Leicester</p>
                        <p className="text-white/50 text-xs">Show your booking reference at reception</p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-background-dark/50 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/60">
                    <p className="font-medium text-white/80 mb-1">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Secure Booking
                    </p>
                    <p>Your booking reference #{bookingId} has been saved. A confirmation email will be sent to {bookingDetails.email}.</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={confirmed}
                    className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirmed}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-black font-black rounded-xl shadow-lg transform transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {confirmed ? (
                        <>
                            <Check className="w-6 h-6 animate-bounce" />
                            Booking Confirmed!
                        </>
                    ) : (
                        <>
                            <Check className="w-6 h-6" />
                            Confirm Booking — Pay at Venue
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
