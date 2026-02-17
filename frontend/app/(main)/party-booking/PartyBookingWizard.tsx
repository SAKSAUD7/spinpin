"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScrollReveal, BouncyButton } from "@repo/ui";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Mail, Phone, User, Cake, MessageSquare, PartyPopper, CheckCircle } from "lucide-react";
import { createPartyBooking } from "../../actions/createPartyBooking";
import ParticipantCollection from "../../../components/ParticipantCollection";
import { PaymentStep } from "../../../components/PaymentStep";
import { fetchBookingBlocks, isDateBlocked, BookingBlock } from "@/lib/api/booking-blocks";
import { PageSection } from "@/lib/cms/types";

interface PartyBookingWizardProps {
    cmsContent?: PageSection[];
}

// E-Invitation Step Component
function EInvitationStep({ bookingId, bookingDetails, onNext, onSkip, onBack, title, subtitle }: any) {
    return (
        <div className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">{title}</h2>
            <p className="text-white/70 mb-6">{subtitle}</p>
            <div className="bg-background-dark rounded-xl p-6 mb-6">
                <p className="text-white/80 mb-4">
                    Send beautiful e-invitations to your guests! You can customize and send invitations after booking.
                </p>
                <p className="text-sm text-white/60">
                    Visit your booking dashboard to manage invitations.
                </p>
            </div>
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-white font-bold rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={onSkip}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
}


export default function PartyBookingWizard({ cmsContent = [] }: PartyBookingWizardProps) {
    const router = useRouter();
    const MIN_PARTICIPANTS = 10;

    // 1: Basic Info, 2: Participants, 3: E-Invitation, 4: Payment, 5: Confirmation
    const [step, setStep] = useState(1);
    const [bookingBlocks, setBookingBlocks] = useState<BookingBlock[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [tempBookingId, setTempBookingId] = useState<string | null>(null);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [participantError, setParticipantError] = useState("");

    // Helper function to get CMS content
    const getContent = (key: string, defaultTitle: string, defaultSubtitle: string) => {
        const section = cmsContent?.find(s => s.section_key === key);
        return {
            title: section?.title || defaultTitle,
            subtitle: section?.subtitle || defaultSubtitle
        };
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        childName: "",
        childAge: "",
        date: "",
        time: "",
        participants: 10, // Will be validated against config.min_participants
        spectators: 0,
        specialRequests: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ...

    // Load party booking config from CMS AND Booking Blocks
    useEffect(() => {
        const loadConfigAndBlocks = async () => {
            // Load blocks
            fetchBookingBlocks().then(setBookingBlocks);

            try {
                const res = await fetch('/api/party-config', {
                    cache: 'no-store',
                });
                const data = await res.json();
                setConfig(data);
            } catch (error) {
                console.error('Failed to load party booking config:', error);
            }
        };
        loadConfigAndBlocks();
    }, []);

    // ...

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        const blockReason = isDateBlocked(newDate, bookingBlocks);

        if (blockReason) {
            alert(`This date is not available due to ${blockReason}`);
            // Don't update state, effectively clearing or keeping previous (or clear it)
            setFormData({ ...formData, date: "" });
            return;
        }

        setFormData({ ...formData, date: newDate });
    };

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Blocking Check on Submit (Double check)
        const blockReason = isDateBlocked(formData.date, bookingBlocks);
        if (blockReason) {
            alert(`This date is not available due to ${blockReason}`);
            setFormData({ ...formData, date: "" });
            return;
        }

        // Validate minimum participants on submit
        if (formData.participants < MIN_PARTICIPANTS) {
            setParticipantError(`Minimum ${MIN_PARTICIPANTS} participants required.`);
            return;
        }
        // ...

        setParticipantError("");
        setIsSubmitting(true);

        try {
            // Create the initial booking
            const result = await createPartyBooking(formData);

            if (result.success) {
                setTempBookingId(result.bookingId);
                // Store complete booking details including the integer id for invitation step
                setBookingDetails({
                    ...formData,
                    ...result.booking, // Include full booking object (id, uuid, etc.)
                    bookingId: result.bookingId
                });
                setStep(2); // Move to participant collection
            } else {
                alert(result.error || "Failed to create booking. Please try again.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleParticipantSubmit = async (data: { adults: any[]; minors: any[]; waiverSigned: boolean }) => {
        if (!tempBookingId) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/party-bookings/${tempBookingId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participants: {
                        adults: data.adults,
                        minors: data.minors
                    },
                    waiver_signed: data.waiverSigned
                }),
                cache: 'no-store',
            });

            if (response.ok) {
                // Instead of finishing immediately, we go to Step 3 (Invitation)
                setStep(3);
            } else {
                alert("Failed to save participants. Please try again.");
            }
        } catch (error) {
            console.error("Error saving participants:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInvitationNext = () => {
        // Step 3 finished, go to Step 4 (Payment)
        setStep(4);
    };

    const calculateTotal = () => {
        const participantPrice = config?.participant_price || 1500;
        const extraSpectatorPrice = config?.spectator_price || 100;
        const freeSpectators = config?.free_spectators || 10;
        const gstRate = config?.gst_rate || 18;
        const depositPercentage = config?.deposit_percentage || 50;

        const chargeableSpectators = Math.max(0, formData.spectators - freeSpectators);

        const participantCost = formData.participants * participantPrice;
        const spectatorCost = chargeableSpectators * extraSpectatorPrice;
        const subtotal = participantCost + spectatorCost;
        const gst = subtotal * (gstRate / 100);
        const total = subtotal + gst;

        return { subtotal, gst, total, deposit: total * (depositPercentage / 100) };
    };

    const costs = calculateTotal();

    // CONFIRMATION SCREEN (Step 5)
    if (submitted && step === 5 && bookingDetails) {
        return (
            <main className="min-h-screen bg-background py-20">
                <div className="max-w-3xl mx-auto px-4">
                    <ScrollReveal animation="scale">
                        <div className="bg-surface-800/50 backdrop-blur-md p-10 rounded-3xl border border-primary/30 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-primary" />
                            </div>
                            <h1 className="text-4xl font-display font-black mb-4 text-primary">
                                {getContent('step-4', 'Party Booking Confirmed!', '').title}
                            </h1>
                            <p className="text-xl text-white/80 mb-8">
                                {getContent('step-4', '', "Your party booking has been received. We'll send you a confirmation email shortly.").subtitle}
                            </p>

                            <div className="bg-background-dark rounded-2xl p-6 mb-8 text-left">
                                <h3 className="font-bold text-lg mb-4 text-white">Booking Summary</h3>
                                <div className="space-y-2 text-white/70">
                                    <p><strong className="text-white">Booking ID:</strong> {bookingDetails.bookingId}</p>
                                    <p><strong className="text-white">Total Amount:</strong> ₹{costs.total.toFixed(2)}</p>
                                    <p><strong className="text-white">Deposit Required (50%):</strong> ₹{costs.deposit.toFixed(2)}</p>
                                    <p><strong className="text-white">Date:</strong> {formData.date}</p>
                                    <p><strong className="text-white">Time:</strong> {formData.time}</p>
                                    <p><strong className="text-white">Participants:</strong> {formData.participants}</p>
                                </div>
                            </div>

                            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8">
                                <p className="text-sm text-white/80">
                                    <strong className="text-accent">Next Steps:</strong> We'll send you payment details via email.
                                    Please pay the 50% deposit to confirm your booking.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <BouncyButton size="lg" variant="primary" onClick={() => router.push(`/tickets/${bookingDetails.bookingId}`)}>
                                    View Ticket
                                </BouncyButton>
                                {/* We could also link to the public invitation page here! */}
                                <BouncyButton size="lg" variant="secondary" onClick={() => router.push("/")}>
                                    Back to Home
                                </BouncyButton>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </main>
        );
    }

    // MAIN FORM
    return (
        <main className="min-h-screen bg-background py-20">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <ScrollReveal animation="slideUp">
                        <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Book Your Party
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-2xl mx-auto">
                            Fill in the details below to reserve your party at Ninja Inflatable Park
                        </p>
                    </ScrollReveal>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-3xl mx-auto mb-10">
                    <div className="flex items-center justify-center gap-2">
                        {/* 1 */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-700 text-white/30'} font-bold transition-all`}>
                            1
                        </div>
                        <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-surface-700'} transition-all`}></div>

                        {/* 2 */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-700 text-white/30'} font-bold transition-all`}>
                            2
                        </div>
                        <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-surface-700'} transition-all`}></div>

                        {/* 3 */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-700 text-white/30'} font-bold transition-all`}>
                            3
                        </div>
                        <div className={`h-1 w-12 ${step >= 4 ? 'bg-primary' : 'bg-surface-700'} transition-all`}></div>

                        {/* 4 */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 4 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-700 text-white/30'} font-bold transition-all`}>
                            4
                        </div>
                        <div className={`h-1 w-12 ${step >= 5 ? 'bg-primary' : 'bg-surface-700'} transition-all`}></div>

                        {/* 5 */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 5 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-700 text-white/30'} font-bold transition-all`}>
                            5
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-semibold px-4 max-w-lg mx-auto">
                        <span className={step >= 1 ? 'text-primary' : 'text-white/30'}>Details</span>
                        <span className={step >= 2 ? 'text-primary' : 'text-white/30'}>Participants</span>
                        <span className={step >= 3 ? 'text-primary' : 'text-white/30'}>E-Invitation</span>
                        <span className={step >= 4 ? 'text-primary' : 'text-white/30'}>Payment</span>
                        <span className={step >= 5 ? 'text-primary' : 'text-white/30'}>Confirm</span>
                    </div>
                </div>

                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Booking Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleBasicInfoSubmit} className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                                <h2 className="text-2xl font-display font-bold mb-6 text-primary">{getContent('step-1', 'Party Details', '').title}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contact Information */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Mail className="w-4 h-4 inline mr-2" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                            placeholder="9845471611"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Cake className="w-4 h-4 inline mr-2" />
                                            Child's Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.childName}
                                            onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                            placeholder="Birthday child's name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Cake className="w-4 h-4 inline mr-2" />
                                            Child's Age
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.childAge}
                                            onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                            placeholder="Age"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Party Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Clock className="w-4 h-4 inline mr-2" />
                                            Preferred Time *
                                        </label>
                                        <select
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                        >
                                            <option value="">Select time</option>
                                            {(config?.available_time_slots || ["12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]).map((slot: string) => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Users className="w-4 h-4 inline mr-2" />
                                            Number of Participants * (Min. {MIN_PARTICIPANTS})
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0" // Allow typing small numbers, validate on blur/submit
                                            value={formData.participants}
                                            onChange={(e) => {
                                                // Allow any number input, don't force min immediately
                                                const val = e.target.value;
                                                const intVal = parseInt(val);
                                                setFormData({
                                                    ...formData,
                                                    participants: isNaN(intVal) ? 0 : intVal
                                                });

                                                // Clear error if valid
                                                if (!isNaN(intVal) && intVal >= MIN_PARTICIPANTS) {
                                                    setParticipantError("");
                                                }
                                            }}
                                            onBlur={() => {
                                                // Validate on blur
                                                if (formData.participants < MIN_PARTICIPANTS) {
                                                    setParticipantError(`Minimum ${MIN_PARTICIPANTS} participants required.`);
                                                }
                                            }}
                                            className={`w-full px-4 py-3 bg-background-dark border-2 ${participantError ? 'border-red-500' : 'border-surface-700'
                                                } rounded-xl focus:border-primary focus:outline-none transition-colors text-white`}
                                        />
                                        {participantError && (
                                            <p className="text-red-500 text-sm mt-1">{participantError}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            <Users className="w-4 h-4 inline mr-2" />
                                            Number of Spectators
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.spectators}
                                            onChange={(e) => setFormData({ ...formData, spectators: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
                                        />
                                        <p className="text-xs text-white/50 mt-1">First 10 spectators free</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-bold mb-2 text-white/80">
                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                        Special Requests
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                        className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white resize-none"
                                        placeholder="Any special requirements or dietary restrictions..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || formData.participants < MIN_PARTICIPANTS}
                                    className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Participants
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                {formData.participants < MIN_PARTICIPANTS && (
                                    <p className="text-center text-sm text-yellow-500 mt-2">
                                        ⚠️ Please add at least {MIN_PARTICIPANTS} participants to continue
                                    </p>
                                )}
                            </form>
                        </div >

                        {/* Price Summary */}
                        < div className="lg:col-span-1" >
                            <ScrollReveal animation="slideLeft">
                                <div className="bg-surface-800/50 backdrop-blur-md p-6 rounded-3xl border border-primary/30 sticky top-24">
                                    <h3 className="text-xl font-display font-bold mb-4 text-primary flex items-center gap-2">
                                        <PartyPopper className="w-5 h-5" />
                                        Price Summary
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Participants ({formData.participants})</span>
                                            <span className="text-white font-bold">₹{(formData.participants * 1500).toLocaleString()}</span>
                                        </div>
                                        {formData.spectators > 10 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/70">Extra Spectators ({formData.spectators - 10})</span>
                                                <span className="text-white font-bold">₹{((formData.spectators - 10) * 100).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Subtotal</span>
                                            <span className="text-white font-bold">₹{costs.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-white/70">GST ({config?.gst_rate || 18}%)</span>
                                            <span className="text-white font-bold">₹{costs.gst.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-3 flex justify-between">
                                            <span className="font-bold text-white">Total</span>
                                            <span className="font-bold text-xl text-primary">₹{costs.total.toFixed(2)}</span>
                                        </div>
                                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                                            <p className="text-xs text-white/70">
                                                <strong className="text-accent">Deposit ({config?.deposit_percentage || 50}%):</strong> ₹{costs.deposit.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-background-dark rounded-xl p-4 text-xs text-white/70 space-y-2">
                                        <p className="font-bold text-white text-sm mb-2">Includes:</p>
                                        {(config?.package_inclusions || [
                                            "75 mins play + 1hr party room",
                                            "Party feast included",
                                            "Drinks & mini slush",
                                            "10 free spectators"
                                        ]).map((item: string, index: number) => (
                                            <p key={index}>✓ {item}</p>
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div >
                    </div >
                )
                }

                {
                    step === 2 && (
                        <ScrollReveal animation="slideUp">
                            <ParticipantCollection
                                onSubmit={handleParticipantSubmit}
                                onBack={() => setStep(1)}
                                totalParticipants={formData.participants}
                                title={getContent('step-2', 'Participants', '').title}
                                subtitle={getContent('step-2', '', `Add details for all ${formData.participants} participants`).subtitle}
                            />
                        </ScrollReveal>
                    )
                }

                {
                    step === 3 && (
                        <EInvitationStep
                            bookingId={tempBookingId!}
                            bookingDetails={bookingDetails}
                            onNext={handleInvitationNext}
                            onSkip={handleInvitationNext}
                            onBack={() => setStep(2)}
                            title={getContent('step-3', 'E-Invitations', '').title}
                            subtitle={getContent('step-3', '', 'Send custom invitations to your guests').subtitle}
                        />
                    )
                }

                {
                    step === 4 && tempBookingId && (
                        <ScrollReveal animation="slideUp">
                            <PaymentStep
                                bookingId={parseInt(tempBookingId)}
                                bookingType="party"
                                amount={costs.total}
                                bookingDetails={{
                                    date: formData.date,
                                    time: formData.time,
                                    name: formData.name,
                                    email: formData.email,
                                    phone: formData.phone
                                }}
                                onSuccess={() => {
                                    setSubmitted(true);
                                    setStep(5);
                                }}
                                onBack={() => setStep(3)}
                            />
                        </ScrollReveal>
                    )
                }
            </div >
        </main >
    );
}
