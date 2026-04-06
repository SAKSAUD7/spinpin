"use client";

/**
 * TimingCardsClient
 *
 * Client-side version of TimingCards that fetches its own data via useEffect.
 * Use this inside client components (e.g. HomeContent, PartyContent) so the
 * timing bar can be injected directly below the hero section.
 */

import { useEffect, useState } from "react";
import { Clock, Sun, Moon, Calendar, Timer, AlarmClock } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
    Clock,
    Sun,
    Moon,
    Calendar,
    Timer,
    AlarmClock,
};

const colorMap: Record<string, { border: string; iconBg: string; iconText: string; badge: string }> = {
    primary: {
        border: "border-blue-400/40",
        iconBg: "bg-blue-500/20",
        iconText: "text-blue-300",
        badge: "bg-blue-500/20 text-blue-200",
    },
    secondary: {
        border: "border-purple-400/40",
        iconBg: "bg-purple-500/20",
        iconText: "text-purple-300",
        badge: "bg-purple-500/20 text-purple-200",
    },
    accent: {
        border: "border-yellow-400/40",
        iconBg: "bg-yellow-500/20",
        iconText: "text-yellow-300",
        badge: "bg-yellow-500/20 text-yellow-200",
    },
};

export function TimingCardsClient() {
    const [cards, setCards] = useState<any[]>([]);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        fetch(`${API_URL}/cms/timing-cards/`, { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCards(data.filter((c: any) => c.active));
                }
            })
            .catch(() => {/* silently fail */ });
    }, []);

    if (cards.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-white/10 py-3 px-3">
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

                        {/* Cards */}
                        {cards.map((card: any) => {
                            const IconComp = iconMap[card.icon] || Clock;
                            const colors = colorMap[card.color] || colorMap.primary;
                            return (
                                <div
                                    key={card.id}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${colors.border} bg-white/5 backdrop-blur-sm shrink-0`}
                                >
                                    <div className={`p-1 rounded-full ${colors.iconBg}`}>
                                        <IconComp className={`w-3 h-3 ${colors.iconText}`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-white/80 text-xs font-semibold whitespace-nowrap">
                                            {card.day_label}
                                        </span>
                                        {card.open_time !== "CLOSED" && (
                                            <>
                                                <span className="text-white/40 text-xs">·</span>
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${colors.badge}`}>
                                                    {card.open_time}{card.close_time ? ` – ${card.close_time}` : ""}
                                                </span>
                                            </>
                                        )}
                                        {card.open_time === "CLOSED" && (
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 whitespace-nowrap">
                                                CLOSED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
