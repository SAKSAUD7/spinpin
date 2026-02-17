import React from 'react';
import AboutContent from "./components/AboutContent";
import { getPageSections } from "../../actions/page-sections";
import { getStatCards } from "../../actions/stat-cards";
import { getTimelineItems } from "../../actions/timeline-items";
import { getValueItems } from "../../actions/value-items";
import { getFaqs } from "../../actions/faqs";
import { getInstagramReels } from "../../actions/instagram-reels";


export default async function AboutPage() {
    const [
        pageSections,
        stats,
        timeline,
        values,
        faqs,
        reels
    ] = await Promise.all([
        getPageSections('about'),
        getStatCards('about'),
        getTimelineItems(),
        getValueItems(),
        getFaqs(),
        getInstagramReels()
    ]) as [any[], any[], any[], any[], any[], any[]];

    const heroSection = pageSections.find((s: any) => s.section_key === 'hero');
    const storySection = pageSections.find((s: any) => s.section_key === 'story');

    const hero = heroSection ? {
        title: heroSection.title,
        subtitle: heroSection.content,
        image: heroSection.image_url
    } : undefined;

    const story = storySection ? {
        title: storySection.title,
        content: storySection.content,
        image: storySection.image_url
    } : undefined;

    // Filter active items if they have an active flag
    const activeValues = values.filter((v: any) => !v.hasOwnProperty('active') || v.active);
    const activeTimeline = timeline.filter((t: any) => !t.hasOwnProperty('active') || t.active); // Sort by year maybe?
    const activeFaqs = faqs.filter((f: any) => !f.hasOwnProperty('active') || f.active);

    return (
        <AboutContent
            values={activeValues}
            stats={stats}
            timeline={activeTimeline}
            faqs={activeFaqs}
            reels={reels.filter((r: any) => r.active)} // Reels usually have active flag
            hero={hero}
            story={story}
        />
    );
}
