"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Printer, Mail, Users, User, CheckCircle, FileSignature, Loader2 } from "lucide-react";
import { PaymentHistoryCard } from "../../components/PaymentHistoryCard";
import { toast } from "sonner";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [waivers, setWaivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadBookingData();
    }, [params.id]);

    async function loadBookingData() {
        try {
            const bookingResponse = await fetch(`/api/bookings/${params.id}`, {
                credentials: 'include',
                cache: 'no-store',
            });

            if (bookingResponse.ok) {
                const bookingData = await bookingResponse.json();
                setBooking(bookingData);

                const waiversResponse = await fetch(`/api/waivers?booking_id=${bookingData.id}`, {
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (waiversResponse.ok) {
                    const waiversData = await waiversResponse.json();
                    setWaivers(Array.isArray(waiversData) ? waiversData : []);
                }
            } else {
                toast.error('Failed to load booking details.');
            }
        } catch (error) {
            console.error('Error loading booking:', error);
            toast.error('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    }

    const handlePrint = () => {
        window.print();
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/bookings/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ booking_status: newStatus }),
            });
            if (response.ok) {
                const data = await response.json();
                setBooking(data);
                toast.success(`Booking ${newStatus === 'CONFIRMED' ? 'confirmed' : 'cancelled'} successfully!`);
            } else {
                const err = await response.json().catch(() => ({}));
                console.error('Status update failed:', err);
                toast.error(err.error || 'Failed to update booking status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update booking status. Check your connection.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setActionLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';
            const response = await fetch(`${API_URL}/emails/send-booking-confirmation/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ booking_id: params.id }),
            });
            if (response.ok) {
                toast.success('Confirmation email resent successfully!');
            } else {
                toast.error('Failed to resend email. Please try again.');
            }
        } catch (error) {
            toast.error('Could not connect to email service.');
        } finally {
            setActionLoading(false);
        }
    };

    const calculateAge = (dob: string): number => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!booking) {
        return <div className="p-8">Booking not found</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/admin/bookings" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Bookings
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Booking #{String(booking.id).padStart(6, '0')}</h1>
                    <p className="text-slate-500 mt-1">Created on {new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button
                        onClick={handleResendEmail}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} Resend Email
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Name</label>
                                <p className="text-slate-900 font-medium">{booking.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Email</label>
                                <p className="text-slate-900 font-medium">{booking.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Phone</label>
                                <p className="text-slate-900 font-medium">{booking.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Reservation Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Date</label>
                                <p className="text-slate-900 font-medium">{booking.date}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Time Slot</label>
                                <p className="text-slate-900 font-medium">{booking.time} ({booking.duration || 60} mins)</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Total Amount</label>
                                <p className="text-xl font-bold text-green-600">£{booking.amount}</p>
                            </div>
                            {booking.activity && (
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Activity</label>
                                    <p className="text-slate-900 font-medium capitalize">
                                        {booking.activity === 'roller-skating' && '🛼 Roller Skating'}
                                        {booking.activity === 'ten-pin-bowling' && '🎳 Ten Pin Bowling'}
                                        {booking.activity === 'arcade' && '🕹️ Arcade'}
                                        {!['roller-skating', 'ten-pin-bowling', 'arcade'].includes(booking.activity) && booking.activity}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment History & Gateway Updates */}
                    <PaymentHistoryCard bookingId={booking.id} bookingType="session" />

                    {booking.add_ons && booking.add_ons.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">➕ Add-ons &amp; Extras</h2>
                            <div className="space-y-3">
                                {booking.add_ons.map((ao: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{ao.emoji}</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ao.label}</p>
                                                <p className="text-sm text-slate-500">{ao.qty} × £{Number(ao.price_each).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900">£{Number(ao.subtotal).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                                    <span className="font-bold text-slate-700">Add-ons Total</span>
                                    <span className="font-bold text-green-600">
                                        £{booking.add_ons.reduce((s: number, ao: any) => s + Number(ao.subtotal), 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parking plates */}
                    {booking.parking_plates && booking.parking_plates.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                🚗 Pre-booked Parking
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                {booking.parking_plates.length} car{booking.parking_plates.length > 1 ? 's' : ''} registered at booking time
                            </p>
                            <div className="space-y-2">
                                {booking.parking_plates.map((plate: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="w-7 h-7 rounded bg-yellow-400 flex items-center justify-center flex-shrink-0">
                                            <span className="text-black font-black text-xs">{i + 1}</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-900 text-lg tracking-widest uppercase">{plate}</span>
                                        <span className="ml-auto text-xs text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Pre-booked</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-3">ℹ️ Allow these vehicles entry to the secure car park on arrival.</p>
                        </div>
                    )}

                    {/* Guest Summary - Always show from booking data */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Guest Summary
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-3xl font-bold text-blue-600">{booking.adults || 0}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">Adults</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-3xl font-bold text-amber-600">{booking.kids || 0}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">Kids</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-3xl font-bold text-slate-600">{booking.spectators || 0}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">Spectators</p>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                                <span className="font-bold">Total Guests:</span> {(booking.adults || 0) + (booking.kids || 0) + (booking.spectators || 0)} people
                            </p>
                        </div>
                    </div>

                    {/* Participant Details & Waivers */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <FileSignature size={20} />
                            Participant Details & Waivers
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Individual participant information from signed waivers
                        </p>

                        {waivers && waivers.length > 0 ? (
                            <div className="space-y-4">
                                {waivers.map((waiver: any) => (
                                    <div key={waiver.id} className="border border-slate-200 rounded-lg p-4">
                                        {/* Primary Signer */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <User size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{waiver.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {waiver.participant_type === 'ADULT' ? 'Primary Adult' : 'Minor'}
                                                        {waiver.is_primary_signer && ' (Primary Signer)'}
                                                    </p>
                                                    {waiver.email && <p className="text-sm text-slate-600">{waiver.email}</p>}
                                                    {waiver.phone && <p className="text-sm text-slate-600">{waiver.phone}</p>}
                                                    {waiver.dob && <p className="text-xs text-slate-400">DOB: {waiver.dob}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {waiver.is_verified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        <CheckCircle size={14} />
                                                        Checked In
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                        Pending Check-in
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Adults */}
                                        {waiver.adults && waiver.adults.length > 0 && (
                                            <div className="ml-4 mt-3 pl-4 border-l-2 border-blue-200">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Additional Adults ({waiver.adults.length})</p>
                                                <div className="space-y-2">
                                                    {waiver.adults.map((adult: any, idx: number) => (
                                                        <div key={`adult-${idx}`} className="flex items-center gap-2 text-sm">
                                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                            <div>
                                                                <span className="font-medium text-slate-900">{adult.name}</span>
                                                                {adult.email && <span className="text-slate-500 ml-2">({adult.email})</span>}
                                                                {adult.dob && <span className="text-xs text-slate-400 ml-2">DOB: {adult.dob}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Minors */}
                                        {waiver.minors && waiver.minors.length > 0 && (
                                            <div className="ml-4 mt-3 pl-4 border-l-2 border-amber-200">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Minors ({waiver.minors.length})</p>
                                                <div className="space-y-2">
                                                    {waiver.minors.map((minor: any, idx: number) => (
                                                        <div key={`minor-${idx}`} className="flex items-center gap-2 text-sm">
                                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                                            <div>
                                                                <span className="font-medium text-slate-900">{minor.name}</span>
                                                                {minor.dob && (
                                                                    <span className="text-xs text-slate-500 ml-2">
                                                                        DOB: {minor.dob} (Age {calculateAge(minor.dob)})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {waiver.emergency_contact && (
                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">
                                                    <span className="font-semibold">Emergency Contact:</span> {waiver.emergency_contact}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                <FileSignature size={48} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-700 font-medium mb-1">No waivers signed yet</p>
                                <p className="text-sm text-slate-500 mb-3">
                                    Expecting {booking.adults || 0} adult{(booking.adults || 0) !== 1 ? 's' : ''} and {booking.kids || 0} kid{(booking.kids || 0) !== 1 ? 's' : ''} to sign waivers
                                </p>
                                <p className="text-xs text-slate-400">
                                    Participants will appear here once they complete the waiver signing process
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Status</h2>
                        <div className="mb-6">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold 
                ${booking.booking_status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    booking.booking_status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {booking.booking_status || 'PENDING'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleUpdateStatus('CONFIRMED')}
                                disabled={actionLoading || booking.booking_status === 'CONFIRMED'}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                {booking.booking_status === 'CONFIRMED' ? 'Already Confirmed' : 'Approve Booking'}
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('CANCELLED')}
                                disabled={actionLoading || booking.booking_status === 'CANCELLED'}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
