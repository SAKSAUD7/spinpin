"use client";

import { AnimatedHero } from "../../../components/AnimatedHero";
import { ScrollReveal } from "../../../components/ScrollReveal";
import { BouncyButton } from "../../../components/BouncyButton";
import { SectionDivider } from "../../../components/SectionDivider";
import { Marquee } from "../../../components/Marquee";
import { TimingCardsClient } from "../../../components/TimingCardsClient";
import { motion } from "framer-motion";
import { Zap, Shield, Users, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Stat, GalleryItem, Activity } from "../../../lib/api/types";
import InstagramReels from "./InstagramReels";
import { getMediaUrl } from "@/lib/media-utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    Users,
    Trophy,
    Shield,
};

interface HomeContentProps {
    stats: Stat[];
    gallery: GalleryItem[];
    banners: any[];
    reels?: any[];

    settings?: any;
    activities: Activity[];
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    about?: {
        title: string;
        content: string;
        image: string;
    };
}

export default function HomeContent({ stats, gallery, banners, reels, settings, activities, hero, about }: HomeContentProps) {
    const aboutText = about?.content || settings?.aboutText || "Spin Pin was founded with one mission in mind – to bring people together through fun and engaging experiences. We've created Leicester's premier entertainment venue with bowling, roller skating, and arcade games.";
    const aboutTitle = about?.title || "Leicester's Premier Entertainment Venue";
    const aboutImage = about?.image || "/images/spinpin/unnamed (4).webp";
    const phone = settings?.contactPhone || "07700 900000";

    return (
        <main className="bg-background text-white">
            {/* Hero Section */}
            <AnimatedHero
                title={hero?.title}
                subtitle={hero?.subtitle}
                backgroundImage={hero?.image}
            />

            {/* Timing Cards — right below hero */}
            <TimingCardsClient />

            {/* Stats Section */}
            <section className="relative pt-12 md:pt-20 pb-16 md:pb-32 px-4 bg-background-light">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal animation="fade">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => {
                                const Icon = iconMap[stat.icon] || Zap;
                                return (
                                    <motion.div
                                        key={stat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="text-center"
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/20 text-primary">
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="text-4xl font-display font-black text-white mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-white/60">{stat.label}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollReveal>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>

            {/* About Section */}
            <section className="relative py-12 md:py-20 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal animation="slideLeft">
                            <div>
                                <span className="inline-block py-1 px-3 rounded-full bg-secondary text-black font-bold text-sm mb-6 tracking-wider uppercase">
                                    About Us
                                </span>
                                <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                                        {aboutTitle}
                                    </span>
                                </h2>
                                <p className="text-xl text-white/80 mb-6 leading-relaxed">
                                    {aboutText}
                                </p>
                                <p className="text-xl text-white/80 leading-relaxed mb-8">
                                    Located in the heart of Leicester city centre, we've created the ultimate entertainment destination with bowling, roller skating, and arcade games designed to thrill, challenge, and entertain.
                                </p>
                                <Link href="/about">
                                    <BouncyButton size="lg" variant="outline" className="text-white border-white" as="div">
                                        Read Our Story <ArrowRight className="w-5 h-5 ml-2" />
                                    </BouncyButton>
                                </Link>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="slideRight">
                            <div className="relative rounded-3xl overflow-hidden aspect-video lg:aspect-square">
                                <img
                                    src={getMediaUrl(aboutImage)}
                                    alt="Kids enjoying the park"
                                    className="w-full h-full object-cover rounded-3xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
                <SectionDivider position="bottom" variant="curve" color="fill-background" />
            </section>

            {/* Featured Attractions */}
            <section className="relative py-12 md:py-20 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    {/* Activities Carousel */}
                    <div className="mb-12">
                        <Marquee speed={40}>
                            {activities.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    className="mx-4 px-6 py-3 bg-gradient-to-r from-primary via-secondary to-accent rounded-full text-black font-bold text-lg whitespace-nowrap"
                                >
                                    {activity.name}
                                </div>
                            ))}
                        </Marquee>
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/attractions">
                            <BouncyButton size="lg" variant="primary" as="div">
                                View All Attractions <ArrowRight className="w-5 h-5" />
                            </BouncyButton>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Photo Gallery Section */}
            <section className="relative pt-12 md:pt-20 pb-16 md:pb-32 px-4 bg-background-light">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal animation="slideUp" className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
                                See The Action
                            </span>
                        </h2>
                        <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto">
                            Real moments, real fun! Check out what awaits you at Spin Pin.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gallery.length > 0 ? gallery.map((photo, index) => (
                            <ScrollReveal key={photo.id} animation="fade" delay={index * 0.1}>
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="relative group overflow-hidden rounded-3xl cursor-pointer"
                                >
                                    <div className="aspect-[4/3] relative">
                                        <img
                                            src={getMediaUrl(photo.src)}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/spinpin/unnamed.webp";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        )) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-white/60 text-lg">No gallery images available yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>



            {/* Instagram Reels Section */}
            <InstagramReels reels={reels} />

            {/* CTA Section */}
            <section className="relative py-16 md:py-32 px-4 bg-background-light">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal animation="scale">
                        <h2 className="text-5xl md:text-6xl lg:text-8xl font-display font-black mb-6 leading-tight">
                            Ready to
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
                                ROLL &amp; PLAY!
                            </span>
                        </h2>
                        <p className="text-base md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                            Book your tickets now and experience the ultimate entertainment adventure!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                            <Link href="/pricing">
                                <BouncyButton size="lg" variant="accent" as="div">
                                    Book Tickets Now
                                </BouncyButton>
                            </Link>
                            <Link href="/parties">
                                <BouncyButton size="lg" variant="secondary" as="div">
                                    Plan a Party
                                </BouncyButton>
                            </Link>
                            <div className="w-full sm:w-auto text-center sm:text-left">
                                <p className="text-sm text-white/60 mb-1">Questions?</p>
                                <a
                                    href={`tel:${phone.replace(/\s/g, '')}`}
                                    className="text-xl font-bold text-white hover:text-primary transition-colors"
                                >
                                    📞 {phone}
                                </a>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
