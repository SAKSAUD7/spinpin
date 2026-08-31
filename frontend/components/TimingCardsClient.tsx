"use client";

/**
 * TimingCardsClient — Dynamic Opening Hours Bar
 *
 * Schedule driven by:
 *  1. The /api/bookings/site-alerts endpoint (booking calendar = source of truth)
 *     - OPEN_TODAY  block  → Monday (or any weekday) is OPEN today (holiday/event)
 *     - CLOSED_TODAY block → venue is CLOSED today regardless of day
 *  2. Hard-coded school holiday / public holiday fallback (isHolidayOpen) so
 *     the strip still works correctly even if no admin block is created.
 *
 * Rules (in priority order):
 *   Admin CLOSED_TODAY block → ALL days show the today badge as closed
 *   Admin OPEN_TODAY block   → today shows as open (even if Monday)
 *   isHolidayOpen(today)     → today is open (school/bank holiday)
 *   Monday default           → CLOSED
 *   All other days           → use CMS timing card hours
 */

import { Clock } from "lucide-react";
import { isHolidayOpen, todayInUK, nowInUK } from "@/lib/api/types";
import { useEffect, useState } from "react";

function getUKDow(): number {
    // Use UK timezone for day-of-week so Monday detection is correct for UK visitors
    return nowInUK().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
}

const DAY_NAME_TO_DOW: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0,
};

export function TimingCardsClient() {
    const [schedule, setSchedule] = useState<any[]>([]);
    // null = not yet fetched, false = no override, 'open' | 'closed' = admin override
    const [todayAdminOverride, setTodayAdminOverride] = useState<null | false | 'open' | 'closed'>(null);

    // Fetch the CMS timing cards (static per-weekday hours)
    useEffect(() => {
        fetch('/api/timing-cards')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const mapped = data.map((item: any) => {
                        const dow = DAY_NAME_TO_DOW[item.day_label] ?? -1;
                        const isClosed = !item.open_time || item.open_time === "CLOSED" || item.open_time.toLowerCase() === "closed";
                        return {
                            dow,
                            label: item.day_label,
                            open: isClosed ? null : item.open_time,
                            close: isClosed ? null : item.close_time,
                        };
                    });
                    setSchedule(mapped);
                }
            })
            .catch(err => console.error("Failed to load timing cards", err));
    }, []);

    // Fetch site-alerts from the BOOKING CALENDAR to get today's admin override
    useEffect(() => {
        const todayStr = todayInUK();
        fetch('/api/bookings/site-alerts')
            .then(res => res.json())
            .then((alerts: any[]) => {
                if (!Array.isArray(alerts) || alerts.length === 0) {
                    setTodayAdminOverride(false);
                    return;
                }
                // Find a block that covers today
                let override: false | 'open' | 'closed' = false;
                for (const alert of alerts) {
                    const start = (alert.start_date || '').split('T')[0];
                    const end = (alert.end_date || '').split('T')[0];
                    if (todayStr >= start && todayStr <= end) {
                        if (alert.type === 'OPEN_TODAY') { override = 'open'; break; }
                        if (alert.type === 'CLOSED_TODAY') { override = 'closed'; break; }
                    }
                }
                setTodayAdminOverride(override);
            })
            .catch(() => setTodayAdminOverride(false));
    }, []);

    const today = todayInUK();
    const todayDow = getUKDow(); // UK timezone day-of-week

    // Holiday fallback: is today a school/bank holiday?
    const isFallbackHoliday = isHolidayOpen(today);

    // Determine final open/closed for today
    const isTodayForceOpen =
        todayAdminOverride === 'open' ||          // admin marked OPEN_TODAY in booking calendar
        (todayAdminOverride !== 'closed' && isFallbackHoliday); // school/bank holiday fallback

    const isTodayForceClosed = todayAdminOverride === 'closed';

    // Wait until both fetches have resolved before rendering
    if (schedule.length === 0 || todayAdminOverride === null) return null;

    const cards = schedule.map((day) => {
        const isToday = day.dow === todayDow;
        const isMonday = day.dow === 1;

        let open = day.open;
        let close = day.close;
        let isHolidayOverride = false;
        let isAdminOpen = false;

        if (isToday) {
            if (isTodayForceClosed) {
                // Admin explicitly closed today
                open = null;
                close = null;
            } else if (isTodayForceOpen && (!open || isMonday)) {
                // Open today via booking calendar or holiday fallback
                open = "12:00";
                close = "22:00";
                isHolidayOverride = !!(todayAdminOverride === 'open');
                isAdminOpen = todayAdminOverride === 'open';
            } else if (isMonday && !isTodayForceOpen) {
                // Regular closed Monday
                open = null;
                close = null;
            }
        } else if (isMonday) {
            // Non-today Mondays are always shown as closed in the strip
            open = null;
            close = null;
        }

        return { ...day, open, close, isToday, isHolidayOverride, isAdminOpen };
    });

    return (
        <div className="relative z-20 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-white/10 py-3 px-3">
            <div className="max-w-7xl mx-auto">
                {/* Mobile-scrollable row */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 md:gap-4 min-w-max md:min-w-0 md:flex-wrap md:justify-center px-1">

                        {/* Label */}
                        <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold uppercase tracking-widest shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Opening Hours</span>
                            <span className="xs:hidden">Hours</span>
                        </div>

                        <div className="w-px h-4 bg-white/20 shrink-0" />

                        {/* Day cards */}
                        {cards.map((card) => {
                            const isClosed = !card.open;

                            const cardBorder = card.isToday
                                ? isClosed
                                    ? "border-red-500/50 bg-red-500/10"
                                    : "border-primary/60 bg-primary/10"
                                : "border-white/10 bg-white/5";

                            const labelClass = card.isToday ? "text-white font-bold" : "text-white/70 font-semibold";

                            const badgeClass = isClosed
                                ? "bg-red-500/20 text-red-300"
                                : card.isToday
                                    ? "bg-primary/30 text-primary font-black"
                                    : "bg-white/10 text-white/60 font-bold";

                            return (
                                <div
                                    key={card.dow}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${cardBorder} backdrop-blur-sm shrink-0 transition-all`}
                                >
                                    <span className={`text-xs whitespace-nowrap ${labelClass}`}>
                                        {card.label}
                                        {card.isToday && (
                                            <span className="ml-1 text-[9px] opacity-50 font-normal">(today)</span>
                                        )}
                                        {card.isAdminOpen && (
                                            <span className="ml-1 text-[9px] text-emerald-400 font-bold">OPEN</span>
                                        )}
                                        {card.isHolidayOverride && !card.isAdminOpen && (
                                            <span className="ml-1 text-[9px] text-emerald-400 font-bold">HOLIDAY</span>
                                        )}
                                    </span>

                                    <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${badgeClass}`}>
                                        {isClosed ? "CLOSED" : `${card.open} – ${card.close}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
