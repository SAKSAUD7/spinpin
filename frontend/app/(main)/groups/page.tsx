import React from 'react';
import { getPageSections } from '@/app/actions/page-sections';
import { getGroupPackages } from '@/app/actions/group-packages';
import { getGroupBenefits } from '@/app/actions/group-benefits';
import GroupsContent from './components/GroupsContent';


export default async function GroupsPage() {
    // Fetch all data in parallel
    const [sections, packages, benefits] = await Promise.all([
        getPageSections('groups'),
        getGroupPackages(),
        getGroupBenefits()
    ]) as [any[], any[], any[]];

    // Find hero section
    const heroSection = sections.find((s: any) => s.section_key === 'hero');

    const hero = heroSection ? {
        title: heroSection.title,
        subtitle: heroSection.content,
        image: heroSection.image_url
    } : undefined;

    // Filter active items
    const activePackages = packages.filter(p => p.active !== false);
    const activeBenefits = benefits.filter(b => b.active !== false);

    return (
        <GroupsContent
            hero={hero}
            packages={activePackages}
            benefits={activeBenefits}
        />
    );
}
