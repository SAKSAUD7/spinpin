"use client";

import { useState } from "react";
import { ScrollReveal, BouncyButton } from "@repo/ui";
import { motion } from "framer-motion";
import { staggerContainer } from "@repo/animations";
import { getMediaUrl } from "@/lib/media-utils";
import { ChevronDown, MapPin, HelpCircle } from "lucide-react";

interface Activity {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    active: boolean;
    order: number;
    why_choose_us?: string;
    what_to_expect?: string;
    location_info?: string;
    activity_faqs?: Array<{ question: string; answer: string }>;
}

interface AttractionsGridProps {
    activities: Activity[];
}

export const AttractionsGrid = ({ activities }: AttractionsGridProps) => {
    const [showAll, setShowAll] = useState(false);
    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

    const displayedActivities = showAll ? activities : activities.slice(0, 6);
    const hasMore = activities.length > 6;

    const toggleActivity = (id: string) => {
        setExpandedActivity(expandedActivity === id ? null : id);
    };

    return (
        <div className="py-20 px-4 md:px-8 bg-background">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
                {displayedActivities.length > 0 ? (
                    displayedActivities.map((activity, index) => (
                        <ScrollReveal
                            key={activity.id}
                            animation="slideUp"
                            delay={index * 0.1}
                        >
                            <div className="group relative bg-surface-800 rounded-3xl border border-white/10 hover:border-primary/30 transition-all overflow-hidden flex flex-col h-full">
                                {/* Image */}
                                <div className="h-64 overflow-hidden relative flex-shrink-0">
                                    <img
                                        src={getMediaUrl(activity.imageUrl)}
                                        alt={activity.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/hero-background.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-800 via-surface-800/50 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-2">
                                            {activity.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <p className="text-white/70 mb-4 line-clamp-3">
                                        {activity.description}
                                    </p>

                                    {/* Expand Button */}
                                    {(activity.why_choose_us || activity.what_to_expect || activity.location_info || activity.activity_faqs) && (
                                        <button
                                            onClick={() => toggleActivity(activity.id)}
                                            className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition-colors"
                                        >
                                            {expandedActivity === activity.id ? 'Show Less' : 'Learn More'}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedActivity === activity.id ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Content */}
                                {expandedActivity === activity.id && (
                                    <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                                        {/* Why Choose Us */}
                                        {activity.why_choose_us && (
                                            <div>
                                                <h4 className="text-lg font-bold text-primary mb-2">Why Choose Us?</h4>
                                                <div className="text-sm text-white/70 whitespace-pre-line">
                                                    {activity.why_choose_us}
                                                </div>
                                            </div>
                                        )}

                                        {/* What to Expect */}
                                        {activity.what_to_expect && (
                                            <div>
                                                <h4 className="text-lg font-bold text-secondary mb-2">What to Expect?</h4>
                                                <div className="text-sm text-white/70 whitespace-pre-line">
                                                    {activity.what_to_expect}
                                                </div>
                                            </div>
                                        )}

                                        {/* Location Info */}
                                        {activity.location_info && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                                <div className="text-sm text-white/70">
                                                    {activity.location_info}
                                                </div>
                                            </div>
                                        )}

                                        {/* Activity FAQs */}
                                        {activity.activity_faqs && activity.activity_faqs.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-bold text-accent mb-2 flex items-center gap-2">
                                                    <HelpCircle className="w-5 h-5" />
                                                    FAQs
                                                </h4>
                                                <div className="space-y-3">
                                                    {activity.activity_faqs.map((faq, idx) => (
                                                        <details key={idx} className="group/faq">
                                                            <summary className="cursor-pointer text-sm font-semibold text-white hover:text-primary transition-colors flex items-center gap-2">
                                                                <span className="group-open/faq:rotate-90 transition-transform">▶</span>
                                                                {faq.question}
                                                            </summary>
                                                            <p className="mt-2 ml-5 text-sm text-white/60">
                                                                {faq.answer}
                                                            </p>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Book Now Button */}
                                        <a
                                            href="/book"
                                            className="block w-full py-3 px-4 bg-gradient-to-r from-primary via-secondary to-accent text-black font-bold text-center rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                                        >
                                            Book Now
                                        </a>
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <p className="text-white/60 text-xl">No attractions available yet.</p>
                    </div>
                )}
            </motion.div>

            {/* Show All / Show Less Button */}
            {hasMore && (
                <div className="flex justify-center mt-12">
                    <BouncyButton
                        onClick={() => setShowAll(!showAll)}
                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-primary/50 transition-all"
                    >
                        {showAll ? 'Show Less' : `Show All ${activities.length} Attractions`}
                        <svg
                            className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : 'group-hover:translate-y-1'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </BouncyButton>
                </div>
            )}
        </div>
    );
};
