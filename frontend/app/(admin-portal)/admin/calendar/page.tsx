"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BookingEvent } from './components/BookingEvent';
import { BookingDetailsModal } from './components/BookingDetailsModal';

const locales = {
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Removed - using API routes instead

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

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'session' | 'party'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [summary, setSummary] = useState({
        totalBookings: 0,
        sessionBookings: 0,
        partyBookings: 0,
        totalRevenue: 0,
        totalParticipants: 0
    });

    const fetchBookings = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const start = format(startOfMonth(date), 'yyyy-MM-dd');
            const end = format(endOfMonth(date), 'yyyy-MM-dd');

            // Use API route proxy instead of direct backend call
            const response = await fetch(`/api/calendar?start_date=${start}&end_date=${end}`, {
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch bookings');
            }

            const data = await response.json();

            // Convert ISO strings to Date objects
            const formattedEvents = data.events.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));

            setEvents(formattedEvents);
            setSummary(data.summary);
        } catch (error) {
            console.error('[Calendar] Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings(currentDate);
    }, [currentDate, fetchBookings]);

    const filteredEvents = useMemo(() => {
        let filtered = events;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(e => e.type === filterType);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.customerName.toLowerCase().includes(query) ||
                e.customerEmail.toLowerCase().includes(query) ||
                e.title.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [events, filterType, searchQuery]);

    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const isSession = event.type === 'session';
        return {
            style: {
                backgroundColor: isSession ? '#3b82f6' : '#a855f7',
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.875rem',
                padding: '2px 6px',
            }
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <CalendarIcon size={32} className="text-blue-600" />
                            Booking Calendar
                        </h1>
                        <p className="text-slate-600 mt-1">View and manage all session and party bookings</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-slate-900">{summary.totalBookings}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
                        <p className="text-sm text-blue-700">Session Bookings</p>
                        <p className="text-2xl font-bold text-blue-900">{summary.sessionBookings}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
                        <p className="text-sm text-purple-700">Party Bookings</p>
                        <p className="text-2xl font-bold text-purple-900">{summary.partyBookings}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                        <p className="text-sm text-green-700">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">₹{summary.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
                        <p className="text-sm text-orange-700">Total Participants</p>
                        <p className="text-2xl font-bold text-orange-900">{summary.totalParticipants}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleNavigate(subMonths(currentDate, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-lg min-w-[200px] text-center">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={() => handleNavigate(addMonths(currentDate, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => handleNavigate(new Date())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
                        >
                            Today
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => handleViewChange('month')}
                            className={`px-4 py-2 rounded-lg transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handleViewChange('week')}
                            className={`px-4 py-2 rounded-lg transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => handleViewChange('day')}
                            className={`px-4 py-2 rounded-lg transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Day
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Bookings</option>
                            <option value="session">Session Only</option>
                            <option value="party">Party Only</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                        <Search size={18} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" style={{ height: '700px' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading bookings...</p>
                        </div>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        view={view}
                        onView={handleViewChange}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            event: BookingEvent,
                        }}
                        popup
                    />
                )}
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedEvent && (
                <BookingDetailsModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedEvent(null);
                    }}
                    onRefresh={() => fetchBookings(currentDate)}
                />
            )}
        </div>
    );
}
