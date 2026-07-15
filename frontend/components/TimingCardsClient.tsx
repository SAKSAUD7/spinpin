"use client";

/**
 * TimingCardsClient — Dynamic Opening Hours Bar
 *
 * Computes the schedule from the same holiday logic used in the booking wizard.
 * No backend CMS required — stays automatically in sync with the booking calendar.
 *
 * Rules:
 *   Mon–Sun (exc. Mon): 12:00 – 22:00
 *   Saturday:           12:00 – 23:00
 *   Monday:             CLOSED — unless today is a school holiday or public holiday → 12:00 – 22:00
 */

import { Clock } from "lucide-react";
import { isHolidayOpen } from "../lib/api/types";

// Standard weekly schedule (index = day-of-week: 0=Sun ... 6=Sat)
// Display order: Mon → Tue → Wed → Thu → Fri → Sat → Sun
const WEEKLY_SCHEDULE = [
    { dow: 1, label: "Monday",    open: null,    close: null    }, // CLOSED unless holiday
    { dow: 2, label: "Tuesday",   open: "12:00", close: "22:00" },
    { dow: 3, label: "Wednesday", open: "12:00", close: "22:00" },
    { dow: 4, label: "Thursday",  open: "12:00", close: "22:00" },
    { dow: 5, label: "Friday",    open: "12:00", close: "22:00" },
    { dow: 6, label: "Saturday",  open: "12:00", close: "23:00" },
    { dow: 0, label: "Sunday",    open: "12:00", close: "22:00" },
];

function getLocalDateString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function TimingCardsClient() {
    const today = getLocalDateString();
    const todayDow = new Date().getDay();

    // Is Monday a holiday today? If so, override Monday to open.
    const mondayHolidayToday = todayDow === 1 && isHolidayOpen(today);

    const cards = WEEKLY_SCHEDULE.map((day) => {
        const isToday = day.dow === todayDow;
        const isMonday = day.dow === 1;

        // Monday: open only if today AND it's a holiday
        const open = isMonday
            ? (isToday && mondayHolidayToday ? "12:00" : null)
            : day.open;
        const close = isMonday
            ? (isToday && mondayHolidayToday ? "22:00" : null)
            : day.close;

        return { ...day, open, close, isToday, isHolidayOverride: isMonday && isToday && mondayHolidayToday };
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
                                        {card.isHolidayOverride && (
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
