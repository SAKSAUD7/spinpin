"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal, BouncyButton, SectionDivider, ImageCarousel } from "@repo/ui";
import { motion } from "framer-motion";
import { Check, PartyPopper, Mail, Utensils, Cake, Gift, Music, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import { MenuPopup } from "@/components/MenuPopup";

interface PartyContentProps {
    packages: any[];
    menus: any[];
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    settings?: any;
    terms?: string; // HTML string or plain text
    carouselImages?: string[];
}

export default function PartyContent({ packages, menus, hero, settings, terms, carouselImages }: PartyContentProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ... [Rest of code]
    // ...

    const heroTitle = hero?.title || "Spin Pin Party Booking";
    const heroSubtitle = hero?.subtitle || "Celebrate with the ultimate adventure! Birthdays, school trips, corporate events - we've got you covered.";
    const heroImage = getMediaUrl(hero?.image) || "/images/uploads/img-3.jpg";
    const phone = settings?.contact_phone || "07349110865";
    const email = settings?.contact_email || "info@spinpin.co.uk";

    return (
        <main className="bg-background text-white min-h-screen pt-24">
            <MenuPopup isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} menuSections={menus} />
            {/* Header - Reduced padding */}
            <section className="relative py-16 px-4 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt="Party Booking"
                        className="w-full h-full object-cover opacity-30"
                        onError={(e) => {
                            e.currentTarget.src = "/hero-background.jpg";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <ScrollReveal animation="slideUp">
                        <span className="inline-block py-1 px-4 rounded-full bg-primary text-black font-black text-xs mb-4 tracking-widest uppercase">
                            🎉 Parties & Events
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-6xl font-display font-black mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                {heroTitle}
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-2">
                            {heroSubtitle}
                        </p>
                        <p className="text-sm text-secondary font-bold">
                            Available: {settings?.party_availability || "Thursday - Sunday"}
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Dynamic Packages */}
            <section className="relative px-4 py-12 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className={`grid grid-cols-1 ${packages.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1 max-w-md mx-auto'} gap-8`}>
                        {packages.length > 0 ? (
                            packages.map((pkg, index) => (
                                <ScrollReveal key={pkg.id} animation="scale" delay={index * 0.1}>
                                    <motion.div
                                        whileHover={{ y: -3 }}
                                        className="relative p-6 rounded-2xl border-2 border-primary bg-gradient-to-br from-surface-800/80 to-surface-900/80 backdrop-blur-sm flex flex-col h-full"
                                    >
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-black py-1 px-6 rounded-full text-sm shadow-lg whitespace-nowrap">
                                            {pkg.name}
                                        </div>

                                        <div className="mt-6 mb-6 text-center">
                                            <div>
                                                <span className="text-4xl font-black text-white">£{pkg.price}</span>
                                                <span className="text-white/60 text-sm ml-1">/person</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center text-xs mt-2">
                                                {pkg.min_pax && <span className="px-3 py-1 bg-white/10 rounded-full">Min. {pkg.min_pax}</span>}
                                                {pkg.duration_minutes && <span className="px-3 py-1 bg-white/10 rounded-full">{pkg.duration_minutes} Mins</span>}
                                            </div>
                                        </div>

                                        <div className="flex-grow mb-6">
                                            <div className="grid grid-cols-1 gap-y-2 text-sm">
                                                {/* Handle both features (frontend prop) and includes (backend model field) */}
                                                {(() => {
                                                    const items = pkg.features || pkg.includes || [];
                                                    const displayItems = Array.isArray(items) ? items : [];

                                                    if (displayItems.length === 0) {
                                                        return <p className="text-white/60 italic text-center">Contact for details</p>;
                                                    }

                                                    return displayItems.map((feature: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-white/80">
                                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                            <Link href="/party-booking" className="w-full">
                                                <BouncyButton size="md" variant="primary" className="w-full">
                                                    <PartyPopper className="w-4 h-4 mr-2" />
                                                    Book Now
                                                </BouncyButton>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </ScrollReveal>
                            ))
                        ) : (
                            <div className="text-center text-white/60 col-span-full">
                                No party packages available currently.
                            </div>
                        )}
                    </div>

                    {/* View Menu Button */}
                    <div className="mt-8 flex justify-center">
                        <ScrollReveal animation="scale">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="group relative px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl font-bold text-black text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                <div className="flex items-center gap-3">
                                    <Eye className="w-5 h-5" />
                                    <span>View Full Menu</span>
                                    <Utensils className="w-5 h-5" />
                                </div>
                            </button>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Image Carousel */}
            <section className="relative px-4 py-12 bg-background">
                <div className="max-w-5xl mx-auto">
                    <ImageCarousel
                        images={carouselImages && carouselImages.length > 0 ? carouselImages : [
                            "/images/uploads/img-1.jpg",
                            "/images/uploads/img-3.jpg",
                            "/images/uploads/img-5.jpg",
                            "/images/uploads/img-7.jpg",
                            "/images/uploads/img-8.jpg"
                        ]}
                        className="shadow-2xl border-4 border-white/10"
                    />
                </div>
            </section>



            {/* Features - Compact */}
            <section className="relative px-4 py-12 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <Cake className="w-6 h-6 text-primary" />, title: "Private Party Room", desc: "Exclusive space for celebration" },
                            { icon: <Gift className="w-6 h-6 text-secondary" />, title: "Complete Package", desc: "Everything included" },
                            { icon: <Music className="w-6 h-6 text-accent" />, title: "All Activities", desc: "Full park access" },
                        ].map((feature, index) => (
                            <ScrollReveal key={index} animation="fade" delay={index * 0.1}>
                                <div className="bg-surface-800/50 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-display font-bold mb-1">{feature.title}</h3>
                                    <p className="text-white/60 text-sm">{feature.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Terms - Dynamic or Static Fallback */}
            <section className="relative px-4 py-12 bg-background-light">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal animation="slideUp">
                        <div className="bg-surface-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2 justify-center">
                                <AlertCircle className="w-6 h-6 text-secondary" />
                                Important Terms
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {terms ? (
                                    <div className="col-span-2 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: terms }} />
                                ) : (
                                    [
                                        "50% deposit required to confirm",
                                        "Minimum 10 participants",
                                        "Balance due before party starts",
                                        "Free rescheduling (2+ weeks notice)",
                                        "Late reschedule: £50 fee",
                                        "Extra time: £5 per 15 mins",
                                        "All guests must sign waiver",
                                        "No sparkler candles or confetti"
                                    ].map((term, index) => (
                                        <div key={index} className="flex gap-2 items-start text-white/80">
                                            <CheckCircle className="w-3 h-3 text-secondary shrink-0 mt-0.5" />
                                            <span>{term}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-white/60">
                                <p>
                                    Email:{" "}
                                    <a href={`mailto:${email}`} className="text-primary hover:underline">
                                        {email}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>

            {/* CTA - Compact */}
            <section className="relative py-16 px-4 pb-32 md:pb-40 bg-background">
                <div className="max-w-3xl mx-auto text-center">
                    <ScrollReveal animation="scale">
                        <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
                            Ready to Party?
                        </h2>
                        <p className="text-lg text-white/70 mb-6">
                            Book now and make it unforgettable!
                        </p>
                        <div className="flex justify-center">
                            <Link href="/party-booking">
                                <BouncyButton size="lg" variant="accent">
                                    <PartyPopper className="w-5 h-5 mr-2" />
                                    Book Your Party
                                </BouncyButton>
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
