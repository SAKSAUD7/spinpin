"use client";

import Link from "next/link";
import { ScrollReveal, BouncyButton, SectionDivider } from "@repo/ui";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
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

// Helper to find a plan by name (case-insensitive partial match)
function findPlan(plans: any[], ...names: string[]) {
    for (const name of names) {
        const found = plans.find(p => p.name?.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
    }
    return null;
}

function formatPrice(price: any) {
    if (price === undefined || price === null) return null;
    const num = parseFloat(price);
    return isNaN(num) ? null : num.toFixed(2);
}

export default function PricingContent({ plans, settings, info, hero, carouselImages = [] }: PricingContentProps) {
    // Ensure active plans only
    const activePlans = plans.filter(p => !p.hasOwnProperty('active') || p.active);

    // Dynamically resolve prices from CMS — match individual activity plans
    const skatingPlan      = findPlan(activePlans, 'skating');
    const bowlingPlan      = findPlan(activePlans, 'bowling');
    const vrPlan           = findPlan(activePlans, 'vr');
    const skateHirePlan    = findPlan(activePlans, 'skate hire', 'roller skate');
    const spectatorPlan    = findPlan(activePlans, 'spectator (4', 'spectator(4');
    const parkingPlan      = findPlan(activePlans, 'parking');
    const lockerPlan       = findPlan(activePlans, 'locker');

    const skatingPrice     = formatPrice(skatingPlan?.price)    ?? '11.95';
    const bowlingPrice     = formatPrice(bowlingPlan?.price)    ?? '9.95';
    const vrPrice          = formatPrice(vrPlan?.price)         ?? '7.95';
    const skateHirePrice   = formatPrice(skateHirePlan?.price)  ?? '4.95';
    const spectatorPrice   = formatPrice(spectatorPlan?.price)  ?? '2.95';
    const parkingPrice     = formatPrice(parkingPlan?.price)    ?? '3.00';
    const lockerPrice      = formatPrice(lockerPlan?.price)     ?? '2.00';

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
                                <Image
                                    src={getMediaUrl(hero.image)}
                                    alt={heroTitle}
                                    fill
                                    className="object-cover"
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

                        {/* Roller Skating Card */}
                        <ScrollReveal animation="scale" delay={0}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-primary bg-surface-800/80 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold py-1 px-4 rounded-full text-sm">
                                    MOST POPULAR
                                </div>
                                <div className="text-4xl mb-3">🛼</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-primary">
                                    Roller Skating
                                </h3>
                                <p className="text-white/60 mb-6">Per Session / Person</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{skatingPrice}</span>
                                    <span className="text-white/60 text-sm"> / person</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">90-min session</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">All ages welcome</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">Music &amp; disco lighting</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm">Leicester's first indoor rink</span>
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

                        {/* Ten Pin Bowling Card */}
                        <ScrollReveal animation="scale" delay={0.1}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-secondary bg-surface-800/80 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">🎳</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-secondary">
                                    Ten Pin Bowling
                                </h3>
                                <p className="text-white/60 mb-6">Per Game / Person</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{bowlingPrice}</span>
                                    <span className="text-white/60 text-sm"> / person</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Per game pricing</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Automatic scoring system</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Food &amp; drinks at lane</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-secondary shrink-0" />
                                        <span className="text-sm">Great for groups &amp; parties</span>
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

                        {/* VR Gaming Card */}
                        <ScrollReveal animation="scale" delay={0.2}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-accent bg-surface-800/80 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">🥽</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-accent">
                                    VR Gaming
                                </h3>
                                <p className="text-white/60 mb-6">Per Session / Person</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{vrPrice}</span>
                                    <span className="text-white/60 text-sm"> / person</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">30-min session</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Latest VR headsets</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">Multiple game titles</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white/80">
                                        <Check className="w-5 h-5 text-accent shrink-0" />
                                        <span className="text-sm">All ages welcome</span>
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

                        {/* Roller Skate Hire Card */}
                        <ScrollReveal animation="scale" delay={0.3}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">⛸️</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-secondary">
                                    Roller Skate Hire
                                </h3>
                                <p className="text-white/60 mb-6">Equipment Rental</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{skateHirePrice}</span>
                                    <span className="text-white/60 text-sm"> / pair</span>
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
                                        <span className="text-sm">Clean &amp; sanitized</span>
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
                        <ScrollReveal animation="scale" delay={0.4}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">👀</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-accent">
                                    Spectators (Age 4+)
                                </h3>
                                <p className="text-white/60 mb-6">Watching &amp; Waiting</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{spectatorPrice}</span>
                                    <span className="text-white/60 text-sm"> / person</span>
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
                        <ScrollReveal animation="scale" delay={0.5}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black font-bold py-1 px-4 rounded-full text-sm">
                                    FREE
                                </div>
                                <div className="text-4xl mb-3">👶</div>
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
                        <ScrollReveal animation="scale" delay={0.6}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">🚗</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-secondary">
                                    Parking
                                </h3>
                                <p className="text-white/60 mb-6">Per Car</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{parkingPrice}</span>
                                    <span className="text-white/60 text-sm"> / car</span>
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
                        <ScrollReveal animation="scale" delay={0.7}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="relative p-5 md:p-8 rounded-3xl border-2 border-white/10 bg-surface-800/50 backdrop-blur-sm h-full flex flex-col"
                            >
                                <div className="text-4xl mb-3">🔒</div>
                                <h3 className="text-2xl font-display font-bold mb-2 text-accent">
                                    Locker Hire
                                </h3>
                                <p className="text-white/60 mb-6">Secure Storage</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">£{lockerPrice}</span>
                                    <span className="text-white/60 text-sm"> / locker</span>
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
                                        <span>Tuesday - Friday</span>
                                        <span className="font-bold text-white">2:00 PM - 10:00 PM</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Saturday - Sunday</span>
                                        <span className="font-bold text-white">12:00 PM - 10:00 PM</span>
                                    </li>
                                    <li className="text-sm text-white/60 mt-2">
                                        * Peak times: School &amp; Bank holidays
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
                                    <li>• <strong>Roller Skating:</strong> £{skatingPrice} per person</li>
                                    <li>• <strong>Ten Pin Bowling:</strong> £{bowlingPrice} per game/person</li>
                                    <li>• <strong>VR Gaming:</strong> £{vrPrice} per session (30 mins)</li>
                                    <li>• <strong>Roller Skate Hire:</strong> £{skateHirePrice} per pair</li>
                                    <li>• <strong>Spectators (Age 4+):</strong> £{spectatorPrice} each</li>
                                    <li>• <strong>Spectators under 4:</strong> FREE</li>
                                    <li>• <strong>Parking:</strong> £{parkingPrice} per car</li>
                                    <li>• <strong>Locker Hire:</strong> £{lockerPrice} per locker</li>
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
