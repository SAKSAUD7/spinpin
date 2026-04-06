"use client";

import Link from "next/link";
import { ScrollReveal, BouncyButton, SectionDivider } from "@repo/ui";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, Users, Mail } from "lucide-react";
import { formatCurrency } from "@repo/utils";
import { getMediaUrl } from "@/lib/media-utils";
import PricingCarousel from "./PricingCarousel";
import { TimingCardsClient } from "@/components/TimingCardsClient";

interface PricingContentProps {
    plans: any[];
    settings?: any;
    info?: any;
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    carouselImages?: any[];
}

export default function PricingContent({ plans, settings, info, hero, carouselImages = [] }: PricingContentProps) {
    // Sort plans by price or some order field if available, otherwise assume backend order
    // Ensure active plans only
    const activePlans = plans.filter(p => !p.hasOwnProperty('active') || p.active);

    const heroTitle = hero?.title || "Pricing Plans";
    const heroSubtitle = hero?.subtitle || "Choose the perfect package for your Spin Pin adventure.";

    return (
        <main className="bg-background text-white min-h-screen">
            {/* Hero */}
            <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background-dark to-background">
                <div className="max-w-7xl mx-auto text-center">
                    <ScrollReveal animation="fade">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary text-black font-bold text-sm mb-6 tracking-wider uppercase">
                            Pricing
                        </span>
                    </ScrollReveal>
                    <ScrollReveal animation="slideUp" delay={0.2}>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-black mb-6 leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                {heroTitle}
                            </span>
                        </h1>
                        {hero?.image && (
                            <div className="relative w-full max-w-4xl mx-auto h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10">
                                <img
                                    src={getMediaUrl(hero.image)}
                                    alt={heroTitle}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            </div>
                        )}
                        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
                            {heroSubtitle}
                        </p>
                    </ScrollReveal>
                </div>

                {/* Carousel Section */}
                {carouselImages && carouselImages.length > 0 && (
                    <div className="mt-12">
                        <PricingCarousel images={carouselImages} />
                    </div>
                )}

                <SectionDivider position="bottom" variant="curve" color="fill-background" />
            </section>

            {/* Timing Cards — below hero */}
            <TimingCardsClient />

            {/* Pricing Cards */}
            <section className="relative px-4 pb-32 md:pb-40 pt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Our Pricing
                            </span>
                        </h2>
                        <p className="text-white/70 text-lg">Simple, transparent pricing for all our activities</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Skating/Bowling/VR Card */}
                        <ScrollReveal animation="scale" delay={0}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-primary bg-surface-800/80 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold py-1 px-4 rounded-full text-sm">
                                    MOST POPULAR
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-primary">
                                    Skating / Bowling / VR
                                </h3>
                                <p className="text-white/60 mb-6">Per Game / Person</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£9.95</span>
                                    <span className="text-white/60 text-sm">/ game</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">Ten Pin Bowling</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">Roller Skating</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">VR Gaming</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">All ages welcome</span>
                                    </li>
                                </ul>
                                <Link href="/book" className="w-full">
                                    <div className="w-full">
                                        <BouncyButton size="lg" variant="primary" className="w-full">
                                            Book Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                            </motion.div>
                        </ScrollReveal>

                        {/* Roller Skate Hire Card */}
                        <ScrollReveal animation="scale" delay={0.1}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <h3 className="text-2xl font-display font-bold mb-2 text-secondary">
                                    Roller Skate Hire
                                </h3>
                                <p className="text-white/60 mb-6">Equipment Rental</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£2.95</span>
                                    <span className="text-white/60 text-sm">/ pair</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">All sizes available</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Safety equipment included</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Clean & sanitized</span>
                                    </li>
                                </ul>
                                <Link href="/book" className="w-full">
                                    <div className="w-full">
                                        <BouncyButton size="lg" variant="secondary" className="w-full">
                                            Book Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                            </motion.div>
                        </ScrollReveal>

                        {/* Spectators (Age 4+) Card */}
                        <ScrollReveal animation="scale" delay={0.2}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <h3 className="text-2xl font-display font-bold mb-2 text-accent">
                                    Spectators (Age 4+)
                                </h3>
                                <p className="text-white/60 mb-6">Watching & Waiting</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£2.95</span>
                                    <span className="text-white/60 text-sm">/ person</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Comfortable seating area</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Watch your friends play</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Access to cafe area</span>
                                    </li>
                                </ul>
                                <Link href="/book" className="w-full">
                                    <div className="w-full">
                                        <BouncyButton size="lg" variant="accent" className="w-full">
                                            Book Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                            </motion.div>
                        </ScrollReveal>

                        {/* Spectators Under 4 Card */}
                        <ScrollReveal animation="scale" delay={0.3}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black font-bold py-1 px-4 rounded-full text-sm">
                                    FREE
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-primary">
                                    Spectators Under 4
                                </h3>
                                <p className="text-white/60 mb-6">Little Ones</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-green-500">FREE</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">No charge for under 4s</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Must be supervised</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Family-friendly space</span>
                                    </li>
                                </ul>
                                <Link href="/book" className="w-full">
                                    <div className="w-full">
                                        <BouncyButton size="lg" variant="primary" className="w-full">
                                            Book Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                            </motion.div>
                        </ScrollReveal>

                        {/* Parking Card */}
                        <ScrollReveal animation="scale" delay={0.4}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <h3 className="text-2xl font-display font-bold mb-2 text-secondary">
                                    Parking
                                </h3>
                                <p className="text-white/60 mb-6">Per Car</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£3.00</span>
                                    <span className="text-white/60 text-sm">/ car</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Secure parking area</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Close to entrance</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Register at reception</span>
                                    </li>
                                </ul>
                                <div className="w-full">
                                    <div className="px-4 py-3 bg-white/5 rounded-lg text-center text-sm text-white/60">
                                        Pay at reception
                                    </div>
                                </div>
                            </motion.div>
                        </ScrollReveal>

                        {/* Locker Hire Card */}
                        <ScrollReveal animation="scale" delay={0.5}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <h3 className="text-2xl font-display font-bold mb-2 text-accent">
                                    Locker Hire
                                </h3>
                                <p className="text-white/60 mb-6">Secure Storage</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£2.00</span>
                                    <span className="text-white/60 text-sm">/ locker</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Keep belongings safe</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Various sizes available</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Easy access</span>
                                    </li>
                                </ul>
                                <div className="w-full">
                                    <div className="px-4 py-3 bg-white/5 rounded-lg text-center text-sm text-white/60">
                                        Available at venue
                                    </div>
                                </div>
                            </motion.div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Group Booking - Compact Card */}
            <section className="relative px-4 pb-32 md:pb-40">
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal animation="scale">
                        <motion.div
                            whileHover={{ y: -3 }}
                            className="relative p-6 rounded-2xl border-2 border-accent bg-gradient-to-br from-surface-800/80 to-surface-900/80 backdrop-blur-sm"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black font-black py-1 px-6 rounded-full text-sm shadow-lg">
                                GROUP BOOKING
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                {/* Price */}
                                <div className="text-center md:text-left">
                                    <div className="mb-2">
                                        <span className="text-4xl font-black text-white">Custom</span>
                                        <span className="text-white/60 text-sm ml-1">Pricing</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs">
                                        <span className="px-3 py-1 bg-white/10 rounded-full">Groups 10+</span>
                                    </div>
                                </div>

                                {/* Key Features */}
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Check className="w-4 h-4 text-accent shrink-0" />
                                            <span>Discounted pricing</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Check className="w-4 h-4 text-accent shrink-0" />
                                            <span>Flexible timings</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Check className="w-4 h-4 text-accent shrink-0" />
                                            <span>Dedicated support</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Check className="w-4 h-4 text-accent shrink-0" />
                                            <span>Schools & corporates</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                                <Link href="/groups" className="flex-1">
                                    <div className="w-full">
                                        <BouncyButton size="md" variant="accent" className="w-full">
                                            <Users className="w-4 h-4 mr-2" />
                                            Book Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                                <Link href="/contact#contactForm" className="flex-1">
                                    <div className="w-full">
                                        <BouncyButton size="md" variant="outline" className="w-full text-white border-white">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Enroll Now
                                        </BouncyButton>
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Additional Info */}
            <section className="relative py-12 md:py-20 px-4 bg-background-light">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ScrollReveal animation="slideRight">
                            <div className="bg-surface-800 p-8 rounded-3xl border border-white/10">
                                <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-primary" />
                                    Opening Hours
                                </h3>
                                <ul className="space-y-3 text-white/80">
                                    <li className="flex justify-between">
                                        <span>Monday</span>
                                        <span className="font-bold text-white">Closed</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Tuesday - Sunday</span>
                                        <span className="font-bold text-white">12:00 PM - 10:00 PM</span>
                                    </li>
                                    <li className="text-sm text-white/60 mt-2">
                                        * Peak times: School & Bank holidays
                                    </li>
                                </ul>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="slideLeft">
                            <div className="bg-surface-800 p-8 rounded-3xl border border-white/10">
                                <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-secondary" />
                                    Pricing Details
                                </h3>
                                <ul className="space-y-3 text-white/80 text-sm">
                                    <li>• <strong>Skating/Bowling/VR:</strong> £9.95 per game/person</li>
                                    <li>• <strong>Roller Skate Hire:</strong> £2.95 each</li>
                                    <li>• <strong>Spectators (Age 4+):</strong> £2.95 each</li>
                                    <li>• <strong>Spectators under 4:</strong> FREE</li>
                                    <li>• <strong>Parking:</strong> £3.00 per car</li>
                                    <li>• <strong>Locker Hire:</strong> £2.00 per locker</li>
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>
        </main>
    );
}
