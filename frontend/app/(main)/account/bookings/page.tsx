"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, ArrowRight, LogOut, User, ChevronRight, Package2, History } from "lucide-react";
import Link from "next/link";
import { useAccount } from "@/state/account/AccountContext";

interface Booking {
    id: number;
    booking_number: string;
    type: "SESSION" | "PARTY";
    activity: string;
    activity_emoji: string;
    package_name?: string;
    date: string;
    time: string;
    adults: number;
    kids: number;
    amount: number;
    status: string;
    created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
    CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function AccountBookingsPage() {
    const { customer, token, loading: authLoading, logout } = useAccount();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !customer) {
            router.replace("/account/login");
        }
    }, [authLoading, customer, router]);

    useEffect(() => {
        if (!token) return;
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        fetch(`${API}/bookings/customer-auth/my-bookings/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : { bookings: [] })
            .then(data => setBookings(data.bookings || []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, [token]);

    if (authLoading || !customer) {
        return (
            <div className="min-h-screen bg-[#0a0118] flex items-center justify-center">
                <div className="text-center text-white/60">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    Loading...
                </div>
            </div>
        );
    }

    const upcoming = bookings.filter(b => b.date >= new Date().toISOString().slice(0, 10) && b.status !== "CANCELLED");
    const past = bookings.filter(b => b.date < new Date().toISOString().slice(0, 10) || b.status === "CANCELLED");

    const formattedDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
    });

    return (
        <main className="min-h-screen bg-[#0a0118] py-20 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white">
                            Hi, {customer.name.split(" ")[0]}! 👋
                        </h1>
                        <p className="text-white/50 text-sm mt-1">{customer.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold">
                            <User className="w-4 h-4" /> Profile
                        </Link>
                        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/50 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-semibold">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-primary">{bookings.length}</div>
                        <div className="text-white/50 text-xs mt-1">Total Bookings</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-green-400">{upcoming.length}</div>
                        <div className="text-white/50 text-xs mt-1">Upcoming</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-blue-400">£{bookings.reduce((s, b) => s + b.amount, 0).toFixed(0)}</div>
                        <div className="text-white/50 text-xs mt-1">Total Spent</div>
                    </div>
                </div>

                {/* Book Again CTA */}
                <Link href="/book" className="block mb-8 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-2xl p-5 hover:from-pink-500/30 hover:to-purple-600/30 transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-bold">Book Another Session</div>
                            <div className="text-white/50 text-sm">Skating, bowling — book your next visit</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Upcoming Bookings */}
                {loading ? (
                    <div className="text-center py-10 text-white/40">Loading your bookings...</div>
                ) : (
                    <>
                        {upcoming.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-pink-400" /> Upcoming
                                </h2>
                                <div className="space-y-3">
                                    {upcoming.map(booking => (
                                        <BookingCard key={`${booking.type}-${booking.id}`} booking={booking} formattedDate={formattedDate} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {past.length > 0 && (
                            <div>
                                <h2 className="text-white/60 font-bold text-lg mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5" /> Past Bookings
                                </h2>
                                <div className="space-y-3 opacity-70">
                                    {past.slice(0, 10).map(booking => (
                                        <BookingCard key={`${booking.type}-${booking.id}`} booking={booking} formattedDate={formattedDate} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {bookings.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-5xl mb-4">🎳</div>
                                <p className="text-white/50 text-lg font-bold">No bookings yet</p>
                                <p className="text-white/30 text-sm mt-2 mb-8">Book your first session at Spin Pin!</p>
                                <Link href="/book" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-all">
                                    Book Now
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

function BookingCard({ booking, formattedDate }: { booking: Booking; formattedDate: (d: string) => string }) {
    const statusStyle = STATUS_STYLES[booking.status] || "bg-white/10 text-white/60 border-white/10";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
        >
            <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{booking.activity_emoji}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-bold">{booking.package_name || booking.activity}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                            {booking.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-white/50 text-sm flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formattedDate(booking.date)}</span>
                        {booking.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.time}</span>}
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(booking.adults || 0) + (booking.kids || 0)} guests</span>
                    </div>
                    {booking.booking_number && (
                        <p className="text-white/30 text-xs mt-1">#{booking.booking_number}</p>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-white font-black">£{booking.amount.toFixed(2)}</div>
                    {booking.type === "SESSION" && booking.id && (
                        <Link href={`/booking/${booking.id}`} className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 mt-1 justify-end">
                            View <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
