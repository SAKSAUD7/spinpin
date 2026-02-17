"use client";

import { AttractionsGrid } from "@/features/attractions/components/AttractionsGrid";
import { ScrollReveal, SectionDivider } from "@repo/ui";
import { Coffee, Car, Shield, Wifi, Utensils, Users, Zap } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import AttractionVideoSection from "@/components/AttractionVideoSection";

interface AttractionsContentProps {
    activities: any[];
    facilities: any[];
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    videoData?: any;
}

export default function AttractionsContent({ activities, facilities, hero, videoData }: AttractionsContentProps) {
    const heroTitle = hero?.title || "Our Attractions";
    const heroSubtitle = hero?.subtitle || "From ninja obstacle courses to giant slides, we've got something for everyone. Choose your adventure!";
    // Use generic image if hero image is missing or invalid
    const heroImage = hero?.image || "/images/uploads/img-2.jpg";

    // Helper to map icon string to Lucide component or default
    const getIcon = (iconName: string) => {
        // This is a simple mapping, extend as needed or use a robust icon library
        const lower = iconName?.toLowerCase() || "";
        if (lower.includes("user")) return <Users className="w-8 h-8 text-primary" />;
        if (lower.includes("coffee") || lower.includes("cafe")) return <Coffee className="w-8 h-8 text-secondary" />;
        if (lower.includes("party") || lower.includes("utensil")) return <Utensils className="w-8 h-8 text-accent" />;
        if (lower.includes("car") || lower.includes("parking")) return <Car className="w-8 h-8 text-primary" />;
        if (lower.includes("shield") || lower.includes("safety")) return <Shield className="w-8 h-8 text-secondary" />;
        if (lower.includes("wifi") || lower.includes("amenit")) return <Wifi className="w-8 h-8 text-accent" />;
        return <Zap className="w-8 h-8 text-primary" />; // Default
    };

    return (
        <main className="min-h-screen bg-background text-white">
            {/* Header */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 bg-gradient-to-b from-background-dark to-background">
                <div className="max-w-7xl mx-auto text-center">
                    <ScrollReveal animation="fade">
                        <span className="inline-block py-1 px-3 rounded-full bg-accent text-white font-bold text-sm mb-6 tracking-wider uppercase">
                            {activities.length}+ Unique Zones
                        </span>
                    </ScrollReveal>
                    <ScrollReveal animation="slideUp" delay={0.2}>
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-black mb-6 leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                {heroTitle}
                            </span>
                        </h1>
                        <p className="text-base md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto">
                            {heroSubtitle}
                        </p>
                    </ScrollReveal>
                </div>
                <SectionDivider position="bottom" variant="curve" color="fill-background" />
            </section>

            {/* Attraction Video Section - NEW: Displays video below hero, above attractions */}
            <AttractionVideoSection videoData={videoData} />

            {/* Attractions Grid - Uses the existing component but with dynamic data */}
            <AttractionsGrid activities={activities} />

            {/* Park Facilities Section */}
            <section className="relative py-12 md:py-20 px-4 pb-32 md:pb-40 bg-background-light">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal animation="slideUp">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-6">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                    Park Facilities
                                </span>
                            </h2>
                            <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto">
                                More than just bouncing! Explore our world-class facilities designed for your comfort and enjoyment.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {facilities.length > 0 ? facilities.map((facility, index) => (
                            <ScrollReveal key={facility.id || index} animation="fade" delay={index * 0.1}>
                                <div className="bg-surface-800 rounded-3xl border border-white/10 hover:border-primary/30 transition-colors flex flex-col overflow-hidden group h-full">
                                    <div className="h-48 overflow-hidden relative flex-shrink-0">
                                        <img
                                            src={getMediaUrl(facility.image_url) || `/images/uploads/img-${(index % 6) + 1}.jpg`}
                                            alt={facility.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/hero-background.jpg";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-800 to-transparent opacity-60" />
                                        <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                            {
                                                getIcon(facility.icon || facility.icon_name || facility.name)
                                            }
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-2xl font-display font-bold mb-3 text-white">
                                            {facility.title || facility.name}
                                        </h3>
                                        <p className="text-white/70 mb-6 line-clamp-3">
                                            {facility.description}
                                        </p>
                                        <ul className="space-y-2 mt-auto">
                                            {/* Handle items if they are array or separated string */}
                                            {Array.isArray(facility.items) ? facility.items.slice(0, 4).map((item: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    {typeof item === 'string' ? item : (item as any).value || (item as any).name || ""}
                                                </li>
                                            )) : (
                                                // Fallback if items/features is just comma separated string or null or using 'features' key
                                                (facility.items || facility.features || "").toString().split(',').filter((x: string) => x.trim()).slice(0, 4).map((item: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        {item.trim()}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>
                        )) : (
                            // Fallback facilities if fetch fails or empty
                            <div className="col-span-full text-center text-white/60">Loading facilities...</div>
                        )}
                    </div>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>
        </main>
    );
}
