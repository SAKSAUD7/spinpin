import React from 'react';
import PartyContent from "./components/PartyContent";
import { getPartyPackages } from "../../actions/party-packages";
import { getMenuSections } from "../../actions/menu-sections";
import { getPageSections } from "../../actions/page-sections";
import { getSettings } from "../../actions/settings";
import { getGalleryItems } from "../../actions/gallery";


export default async function Parties() {
    // Fetch data
    const [
        partyPackages,
        menuSections,
        pageSections,
        settings,
        galleryItems
    ] = await Promise.all([
        getPartyPackages(),
        getMenuSections(),
        getPageSections('party-booking'),
        getSettings(),
        getGalleryItems()
    ]) as [any[], any[], any[], any, any[]];

    const carouselImages = galleryItems
        .filter((item: any) => {
            const cat = item.category?.toLowerCase() || '';
            return cat === 'parties_carousel' || cat === 'parties carousel';
        })
        .map((item: any) => item.image_url);

    const heroSection = pageSections.find((s: any) => s.section_key === 'hero');
    const termsSection = pageSections.find((s: any) => s.section_key === 'terms');

    const hero = heroSection ? {
        title: heroSection.title,
        subtitle: heroSection.content,
        image: heroSection.image_url
    } : undefined;

    return (
        <PartyContent
            packages={partyPackages}
            menus={menuSections}
            hero={hero}
            settings={settings}
            terms={termsSection?.content}
            carouselImages={carouselImages}
        />
    );
}
