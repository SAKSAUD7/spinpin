"use client";

import { useState } from "react";
import { createBooking } from "@/app/actions/createBooking";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, Users, User, Mail, Phone, Ticket, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSessionBookingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const data = {
                date: formData.get("date") as string,
                time: formData.get("time") as string,
                duration: formData.get("duration") as string,
                adults: Number(formData.get("adults")),
                kids: Number(formData.get("kids")),
                spectators: Number(formData.get("spectators")),
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                phone: formData.get("phone") as string,
                dateOfBirth: formData.get("dateOfBirth") as string,
                dateOfArrival: formData.get("date") as string, // Use booking date as arrival date
                waiverAccepted: true, // Admin bookings auto-accept waiver
                voucherCode: formData.get("voucherCode") as string || undefined,
            };

            const result = await createBooking(data);

            if (result.success) {
                toast.success("Session booking created successfully");
                router.push("/admin/session-bookings");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create booking");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/session-bookings"
                    className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-4 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Session Bookings
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Manual Session Booking</h1>
                <p className="text-slate-500 mt-1">Create a session booking for walk-in or phone customers</p>
            </div>

            <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                {/* Customer Details */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Customer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <div className="relative max-w-md">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="dateOfBirth"
                                type="date"
                                required
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Booking Schedule */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Booking Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="date"
                                    type="date"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="time"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">Select Time</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="13:00">01:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                    <option value="17:00">05:00 PM</option>
                                    <option value="18:00">06:00 PM</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                            <select
                                name="duration"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                            >
                                <option value="60">60 minutes</option>
                                <option value="90">90 minutes</option>
                                <option value="120">120 minutes</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Guest Count */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Guest Count
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adults</label>
                            <input
                                name="adults"
                                type="number"
                                required
                                min="0"
                                defaultValue="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="text-xs text-slate-500 mt-1">₹899 per adult</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kids</label>
                            <input
                                name="kids"
                                type="number"
                                required
                                min="0"
                                defaultValue="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="text-xs text-slate-500 mt-1">₹500 per kid</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Spectators</label>
                            <input
                                name="spectators"
                                type="number"
                                required
                                min="0"
                                defaultValue="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="text-xs text-slate-500 mt-1">Free (non-participants)</p>
                        </div>
                    </div>
                </div>

                {/* Voucher */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-primary" />
                        Discount Code (Optional)
                    </h3>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Voucher Code</label>
                        <div className="relative">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="voucherCode"
                                type="text"
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                                placeholder="DISCOUNT20"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <Link
                        href="/admin/session-bookings"
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating Booking..." : "Create Session Booking"}
                    </button>
                </div>
            </form>
        </div>
    );
}
