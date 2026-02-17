import { ScrollReveal, SectionDivider } from "@repo/ui";
import { Coffee, Car, Shield, Wifi, ShoppingBag, Utensils, Users, Baby, Lock, Zap } from "lucide-react";
import { getFacilityItems } from "@/app/actions/facility-items";
import { getMediaUrl } from "@/lib/media-utils";


export default async function FacilitiesPage() {
    const facilities = await getFacilityItems() as any[];

    // Helper to map icon string to Lucide component
    const getIcon = (iconName: string) => {
        const lower = (iconName || "").toLowerCase();
        if (lower.includes("user")) return <Users className="w-8 h-8 text-primary" />;
        if (lower.includes("coffee") || lower.includes("cafe")) return <Coffee className="w-8 h-8 text-secondary" />;
        if (lower.includes("party") || lower.includes("utensil")) return <Utensils className="w-8 h-8 text-accent" />;
        if (lower.includes("car") || lower.includes("parking")) return <Car className="w-8 h-8 text-primary" />;
        if (lower.includes("shield") || lower.includes("safety")) return <Shield className="w-8 h-8 text-secondary" />;
        if (lower.includes("wifi") || lower.includes("amenit")) return <Wifi className="w-8 h-8 text-accent" />;
        return <Zap className="w-8 h-8 text-primary" />;
    };

    return (
        <main className="bg-background text-white min-h-screen pt-24">
            {/* Header */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <ScrollReveal animation="slideUp">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-black mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Park Facilities
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-2xl mx-auto">
                            More than just bouncing! Explore our world-class facilities designed for your comfort and enjoyment.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Facilities Grid */}
            <section className="relative px-4 pb-32 md:pb-40">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {facilities.map((facility: any, index: number) => (
                            <ScrollReveal key={facility.id || index} animation="fade" delay={index * 0.1}>
                                <div className="bg-surface-800 rounded-3xl border border-white/10 hover:border-primary/30 transition-colors flex flex-col overflow-hidden group">
                                    <div className="h-48 overflow-hidden relative flex-shrink-0">
                                        <img
                                            src={getMediaUrl(facility.image_url) || `/images/uploads/img-${(index % 6) + 1}.jpg`}
                                            alt={facility.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/hero-background.jpg"; // Fallback
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-800 to-transparent opacity-60" />
                                        <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                            {getIcon(facility.icon)}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-2xl font-display font-bold mb-3 text-white">
                                            {facility.title}
                                        </h3>
                                        <p className="text-white/70 mb-6">
                                            {facility.description}
                                        </p>
                                        <ul className="space-y-2 mt-auto">
                                            {Array.isArray(facility.items) ? facility.items.map((item: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    {item}
                                                </li>
                                            )) : (
                                                <li className="flex items-center gap-2 text-sm text-white/60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    {facility.items}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>
        </main>
    );
}
