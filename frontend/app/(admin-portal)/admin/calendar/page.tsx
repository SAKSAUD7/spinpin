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
    activity?: string;
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
    const [activityFilter, setActivityFilter] = useState<'all' | 'skating' | 'bowling' | 'arcade'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [summary, setSummary] = useState({
        totalBookings: 0,
        sessionBookings: 0,
        partyBookings: 0,
        totalRevenue: 0,
        totalParticipants: 0
    });
    const [selectedDate, setSelectedDate] = useState<string>(''); // for capacity grid
    const [slotCapacity, setSlotCapacity] = useState<Record<string, any>>({});
    const [capacityLoading, setCapacityLoading] = useState(false);

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

    // Fetch slot capacity when a day is selected
    useEffect(() => {
        if (!selectedDate) return;
        setCapacityLoading(true);
        fetch(`/api/bookings/slot-availability?date=${selectedDate}`, { cache: 'no-store' })
            .then(r => r.ok ? r.json() : {})
            .then(data => setSlotCapacity(data || {}))
            .catch(() => setSlotCapacity({}))
            .finally(() => setCapacityLoading(false));
    }, [selectedDate]);

    const filteredEvents = useMemo(() => {
        let filtered = events;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(e => e.type === filterType);
        }

        // Filter by activity for session bookings
        if (activityFilter !== 'all') {
            filtered = filtered.filter(e => {
                if (e.type !== 'session') return false;
                const act = (e.activity || e.title || '').toLowerCase();
                return act.includes(activityFilter);
            });
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
    }, [events, filterType, activityFilter, searchQuery]);

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

    // When user clicks a day on the calendar, load that day's capacity grid
    const handleSelectSlot = ({ start }: { start: Date }) => {
        const dateStr = format(start, 'yyyy-MM-dd');
        setSelectedDate(dateStr);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        let bg = '#a855f7'; // default: party = violet
        if (event.type === 'session') {
            const act = (event.activity || event.title || '').toLowerCase();
            if (act.includes('skating') || act.includes('roller')) bg = '#ec4899'; // pink = skating
            else if (act.includes('bowling')) bg = '#3b82f6'; // blue = bowling
            else if (act.includes('arcade')) bg = '#8b5cf6'; // purple = arcade
            else bg = '#f97316'; // orange = combo/unknown session
        }
        return {
            style: {
                backgroundColor: bg,
                borderRadius: '6px',
                opacity: 0.92,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.8rem',
                padding: '2px 6px',
                fontWeight: 600,
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
                        <p className="text-2xl font-bold text-green-900">£{summary.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
                        <p className="text-sm text-orange-700">Total Participants</p>
                        <p className="text-2xl font-bold text-orange-900">{summary.totalParticipants}</p>
                    </div>
                </div>

                {/* Day Capacity Grid — appears when a calendar day is clicked */}
                {selectedDate && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                📊 Slot Capacity —&nbsp;
                                <span className="text-blue-600">{selectedDate}</span>
                            </h2>
                            <button onClick={() => setSelectedDate('')} className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-1">✕ Close</button>
                        </div>
                        {capacityLoading ? (
                            <p className="text-slate-400 text-sm animate-pulse">Loading capacity data…</p>
                        ) : Object.keys(slotCapacity).length === 0 ? (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <span className="text-2xl">✅</span>
                                <p className="text-green-800 text-sm font-medium">No bookings on this day yet — all slots are fully open.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-left">
                                            <th className="py-2 pr-6 text-slate-500 font-semibold w-16">Slot</th>
                                            <th className="py-2 pr-8 text-pink-600 font-semibold">🛼 Skating</th>
                                            <th className="py-2 text-blue-600 font-semibold">🎳 Bowling Lanes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(slot => {
                                            const d = slotCapacity[slot];
                                            const skaters = d?.skating_headcount ?? 0;
                                            const skMax = d?.skating_max ?? 60;
                                            const lanes = d?.bowling_lanes_used ?? 0;
                                            const lMax = d?.bowling_max_lanes ?? 6;
                                            const skPct = Math.min(skaters / skMax, 1);
                                            const bPct = Math.min(lanes / lMax, 1);
                                            const skSt = d?.skating_status ?? 'available';
                                            const bSt = d?.bowling_status ?? 'available';
                                            const skColor = skSt === 'full' ? 'bg-red-500' : skSt === 'busy' ? 'bg-yellow-400' : 'bg-emerald-400';
                                            const bColor = bSt === 'full' ? 'bg-red-500' : bSt === 'busy' ? 'bg-yellow-400' : 'bg-blue-400';
                                            const skLabel = skSt === 'full' ? 'text-red-600' : skSt === 'busy' ? 'text-yellow-600' : 'text-slate-400';
                                            const bLabel = bSt === 'full' ? 'text-red-600' : bSt === 'busy' ? 'text-yellow-600' : 'text-slate-400';
                                            const hasActivity = skaters > 0 || lanes > 0;
                                            return (
                                                <tr key={slot} className={`hover:bg-slate-50 ${!hasActivity ? 'opacity-40' : ''}`}>
                                                    <td className="py-2.5 pr-6 font-mono font-bold text-slate-700 text-sm">{slot}</td>
                                                    <td className="py-2.5 pr-8">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-28 bg-slate-100 rounded-full h-2 flex-shrink-0">
                                                                <div className={`h-2 rounded-full transition-all ${skColor}`} style={{ width: `${skPct * 100}%` }} />
                                                            </div>
                                                            <span className={`text-xs font-semibold ${skLabel}`}>{skaters}/{skMax}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-0.5">
                                                                {Array.from({ length: lMax }).map((_, i) => (
                                                                    <div key={i} title={`Lane ${i + 1}${i < lanes ? ' — booked' : ' — free'}`}
                                                                        className={`w-4 h-5 rounded-sm transition-colors ${i < lanes ? bColor : 'bg-slate-100'}`} />
                                                                ))}
                                                            </div>
                                                            <span className={`text-xs font-semibold ${bLabel}`}>{lanes}/{lMax} lanes</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <p className="text-xs text-slate-400 mt-3 flex items-center gap-3">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block" /> Available</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-sm inline-block" /> Almost Full (≥70%)</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block" /> Full</span>
                                    <span className="ml-2 italic">Click any day on the calendar to load its capacity grid</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

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
                            onChange={(e) => { setFilterType(e.target.value as any); setActivityFilter('all'); }}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Bookings</option>
                            <option value="session">Session Only</option>
                            <option value="party">Party Only</option>
                        </select>
                        {/* Activity sub-filter – only relevant for sessions */}
                        {(filterType === 'all' || filterType === 'session') && (
                            <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value as any)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="all">All Activities</option>
                                <option value="skating">🛼 Roller Skating</option>
                                <option value="bowling">🎳 Ten Pin Bowling</option>
                                <option value="arcade">🕹️ Arcade Games</option>
                            </select>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span> Skating</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Bowling</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Arcade</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block"></span> Party</span>
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
                        onSelectSlot={handleSelectSlot}
                        selectable
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
