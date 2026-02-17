import React from 'react';
import { getPageSections } from '@/app/actions/page-sections';
import { getGuidelineCategories } from '@/app/actions/guideline-categories';
import { getLegalDocuments } from '@/app/actions/legal-documents';
import { HeroEditor } from '@/components/admin/cms/home/HeroEditor';
import { GuidelinesManager } from '@/components/admin/cms/guidelines/GuidelinesManager';
import { LegalDocumentsManager } from '@/components/admin/cms/guidelines/LegalDocumentsManager';
import { CMSBackLink } from '@/components/admin/cms/CMSBackLink';

export default async function GuidelinesAdminPage() {
    // Fetch all data in parallel
    const [sections, guidelines, legalDocs] = await Promise.all([
        getPageSections('guidelines'),
        getGuidelineCategories(),
        getLegalDocuments()
    ]) as [any[], any[], any[]];

    // Find hero section
    const heroSection = sections.find((s: any) => s.section_key === 'hero');

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <CMSBackLink />
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Guidelines Page Editing</h1>
                <p className="text-slate-500">Manage safety guidelines and legal documents</p>
            </div>

            <div className="grid gap-8">
                {/* Hero Section Editor */}
                <section>
                    <HeroEditor section={heroSection} pageSlug="guidelines" />
                </section>

                {/* Safety Guidelines Manager */}
                <section>
                    <GuidelinesManager items={guidelines} />
                </section>

                {/* Legal Documents Manager */}
                <section>
                    <LegalDocumentsManager items={legalDocs} />
                </section>
            </div>
        </div>
    );
}

