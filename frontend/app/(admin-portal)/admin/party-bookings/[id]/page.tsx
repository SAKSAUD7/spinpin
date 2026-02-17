"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Printer, Mail, Users, User, CheckCircle, FileSignature, Cake } from "lucide-react";

// Removed - using API routes instead

export default function PartyBookingDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [waivers, setWaivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBookingData() {
            try {
                // Fetch party booking details via API route
                const bookingResponse = await fetch(`/api/bookings/${params.id}?type=PARTY`, {
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (bookingResponse.ok) {
                    const bookingData = await bookingResponse.json();
                    setBooking(bookingData);

                    // Fetch waivers for this party booking
                    const waiversResponse = await fetch(`/api/waivers`, {
                        credentials: 'include',
                        cache: 'no-store',
                    });

                    if (waiversResponse.ok) {
                        const allWaivers = await waiversResponse.json();
                        // Filter waivers for this party booking
                        const bookingWaivers = allWaivers.filter((w: any) => w.party_booking === bookingData.id);
                        setWaivers(bookingWaivers);
                    }
                }
            } catch (error) {
                console.error('Error loading party booking:', error);
            } finally {
                setLoading(false);
            }
        }
        loadBookingData();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            const response = await fetch(`/api/bookings/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type: 'PARTY', status: status }),
                cache: 'no-store',
            });
            if (response.ok) {
                // Reload booking data
                const data = await response.json();
                setBooking(data);
            }
        } catch (error) {
            console.error('Error updating status:', error);
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
        return <div className="p-8">Party booking not found</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/admin/party-bookings" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Party Bookings
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Party #{String(booking.id).padStart(6, '0')}</h1>
                    <p className="text-slate-500 mt-1">Created on {new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        <Mail size={18} /> Resend Email
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

                    {/* Party Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Party Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Date</label>
                                <p className="text-slate-900 font-medium">{booking.date}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Time Slot</label>
                                <p className="text-slate-900 font-medium">{booking.time}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Package</label>
                                <p className="text-slate-900 font-medium">{booking.package_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold">Total Amount</label>
                                <p className="text-xl font-bold text-green-600">₹{booking.amount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Birthday Child */}
                    {booking.birthday_child_name && (
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl shadow-sm border border-pink-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Cake size={20} className="text-pink-600" />
                                Birthday Child
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Name</label>
                                    <p className="text-slate-900 font-medium">{booking.birthday_child_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Age</label>
                                    <p className="text-slate-900 font-medium">{booking.birthday_child_age} years old</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guest Summary - Always show from booking data */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Guest Summary
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-3xl font-bold text-blue-600">{booking.adults || 0}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">Adults</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-3xl font-bold text-amber-600">{booking.kids || 0}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">Kids</p>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                                <span className="font-bold">Total Guests:</span> {(booking.adults || 0) + (booking.kids || 0)} people
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
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <User size={20} className="text-purple-600" />
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
                                            <div className="ml-4 mt-3 pl-4 border-l-2 border-purple-200">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Additional Adults ({waiver.adults.length})</p>
                                                <div className="space-y-2">
                                                    {waiver.adults.map((adult: any, idx: number) => (
                                                        <div key={`adult-${idx}`} className="flex items-center gap-2 text-sm">
                                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
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
                                            <div className="ml-4 mt-3 pl-4 border-l-2 border-pink-200">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Party Kids ({waiver.minors.length})</p>
                                                <div className="space-y-2">
                                                    {waiver.minors.map((minor: any, idx: number) => (
                                                        <div key={`minor-${idx}`} className="flex items-center gap-2 text-sm">
                                                            <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
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
                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {booking.status || 'PENDING'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleUpdateStatus('CONFIRMED')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Check size={18} /> Approve Party
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('CANCELLED')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                                <X size={18} /> Cancel Party
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
