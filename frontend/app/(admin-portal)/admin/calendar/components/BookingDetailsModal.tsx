import { X, User, Mail, Phone, Users, Calendar, Clock, DollarSign, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'session' | 'party';
    bookingId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    participants: number;
    kids: number;
    adults: number;
    status: string;
    amount: number;
    arrived: boolean;
    packageName: string;
    birthdayChildName?: string;
    birthdayChildAge?: number;
}

interface BookingDetailsModalProps {
    event: CalendarEvent;
    onClose: () => void;
    onRefresh: () => void;
}

export const BookingDetailsModal = ({ event, onClose, onRefresh }: BookingDetailsModalProps) => {
    const isSession = event.type === 'session';

    const handleViewBooking = () => {
        const url = isSession
            ? `/admin/bookings/${event.bookingId}`
            : `/admin/party-bookings/${event.bookingId}`;
        window.location.href = url;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`p-6 ${isSession ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white rounded-t-2xl`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{isSession ? '🎯' : '🎉'}</span>
                                <h2 className="text-2xl font-bold">{event.title}</h2>
                            </div>
                            <p className="text-white/90">{isSession ? 'Session Booking' : 'Party Booking'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        {event.arrived ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border-2 border-green-300">
                                <CheckCircle size={18} />
                                <span className="font-bold">Arrived</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border-2 border-orange-300">
                                <AlertCircle size={18} />
                                <span className="font-bold">Not Arrived</span>
                            </div>
                        )}
                        <div className={`px-4 py-2 rounded-lg font-bold ${event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-slate-100 text-slate-800'
                            }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-3 text-slate-900">Customer Information</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <User size={18} className="text-slate-500" />
                                <span className="font-semibold text-slate-900">{event.customerName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-slate-500" />
                                <span className="text-slate-700">{event.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-slate-500" />
                                <span className="text-slate-700">{event.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-3 text-slate-900">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Date</p>
                                    <p className="font-semibold text-slate-900">{format(event.start, 'MMM dd, yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Time</p>
                                    <p className="font-semibold text-slate-900">
                                        {format(event.start, 'hh:mm a')} - {format(event.end, 'hh:mm a')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Participants</p>
                                    <p className="font-semibold text-slate-900">
                                        {event.participants} ({event.adults} Adults, {event.kids} Kids)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign size={18} className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Amount</p>
                                    <p className="font-semibold text-slate-900">₹{event.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Package</p>
                                    <p className="font-semibold text-slate-900">{event.packageName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Party-specific details */}
                        {!isSession && event.birthdayChildName && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎂</span>
                                    <div>
                                        <p className="text-xs text-slate-500">Birthday Child</p>
                                        <p className="font-semibold text-slate-900">
                                            {event.birthdayChildName} ({event.birthdayChildAge} years old)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleViewBooking}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors ${isSession
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            View Full Details
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
