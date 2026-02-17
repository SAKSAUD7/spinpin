"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";

interface AnimatedHeroProps {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
}

export function AnimatedHero({
    title = "ARE YOU A NINJA?",
    subtitle = "Get ready to jump, climb, bounce, and conquer the ultimate inflatable adventure! Experience thrills, laughter, and challenges that push your limits in the most exciting way.",
    backgroundImage = "/park-slides-action.jpg"
}: AnimatedHeroProps) {

    // Split title for styling if it contains "NINJA" or line breaks
    // This is a simple heuristic to maintain the visual style
    const titleParts = title.split('NINJA');
    const hasNinja = titleParts.length > 1;

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={getMediaUrl(backgroundImage)}
                    alt="Ninja Inflatable Park"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                {/* Yellow Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block mb-6"
                >
                    <div className="bg-yellow-400 text-black font-black text-sm md:text-base px-6 py-2 rounded-full uppercase tracking-wider">
                        Skating Bowling Gaming
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight"
                >
                    {hasNinja ? (
                        <>
                            <span className="text-white">{titleParts[0]}</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-pink-500">
                                NINJA{titleParts[1]}
                            </span>
                        </>
                    ) : (
                        <span className="text-white">{title}</span>
                    )}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-white text-lg md:text-xl lg:text-2xl mb-6 max-w-3xl mx-auto leading-relaxed"
                >
                    {subtitle}
                </motion.p>

                {/* CASH ONLY Notice */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mb-8 max-w-2xl mx-auto"
                >
                    <div className="bg-red-600 border-2 border-red-400 rounded-2xl px-6 py-4 shadow-lg shadow-red-600/50">
                        <div className="flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-white font-black text-lg md:text-xl uppercase tracking-wide">
                                ⚠️ CASH ONLY - No Card Payments Accepted
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href="/book"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-105 transition-all"
                    >
                        Book Tickets Now
                    </Link>
                    <Link
                        href="/kiosk/waiver"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Sign Waiver
                    </Link>
                    <Link
                        href="/attractions"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
                    >
                        View Attractions
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
                >
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}
