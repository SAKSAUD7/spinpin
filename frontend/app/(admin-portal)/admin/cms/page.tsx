import React from 'react';
import Link from 'next/link';
import { getPages } from '@/app/actions/pages';
import { PermissionGate } from '@/components/PermissionGate';
import {
    Layout, FileText, Image, MessageSquare,
    Calendar, Users, Shield, HelpCircle,
    Settings, Instagram, Utensils, Award
} from 'lucide-react';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/lib/admin-auth';

export default async function CmsDashboard() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    const pages = (await getPages()).filter((page: any) =>
        !['facilities', 'privacy', 'waiver-terms'].includes(page.slug)
    );

    const collections = [
        { name: 'Banners', href: '/admin/banners', icon: Image, description: 'Homepage hero sliders' },
        { name: 'Logos', href: '/admin/cms/logos', icon: Image, description: 'Site logos and branding' },

        { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle, description: 'Questions and answers' },
        { name: 'Social Links', href: '/admin/cms/social-links', icon: Users, description: 'Social media profiles' },
        { name: 'Gallery', href: '/admin/cms/gallery', icon: Image, description: 'Photo gallery items' },
        { name: 'Stat Cards', href: '/admin/cms/stat-cards', icon: Award, description: 'Homepage statistics' },
        { name: 'Instagram Reels', href: '/admin/cms/instagram-reels', icon: Instagram, description: 'Social feed items' },
        { name: 'Menu Sections', href: '/admin/cms/menu-sections', icon: Utensils, description: 'Food and drink menu' },
        { name: 'Group Packages', href: '/admin/cms/group-packages', icon: Users, description: 'School and corporate groups' },
        { name: 'Party Packages', href: '/admin/cms/party-packages', icon: Calendar, description: 'Birthday party options' },
        { name: 'Pricing Plans', href: '/admin/cms/pricing-plans', icon: FileText, description: 'Session and party pricing' },
        { name: 'Guidelines', href: '/admin/cms/guideline-categories', icon: Shield, description: 'Safety rules' },
        { name: 'Legal Docs', href: '/admin/cms/legal-documents', icon: FileText, description: 'Terms, privacy, waivers' },
        { name: 'Contact Info', href: '/admin/cms/contact-info', icon: Settings, description: 'Site-wide contact details' },
        { name: 'Timeline', href: '/admin/cms/timeline-items', icon: Calendar, description: 'Company history' },
        { name: 'Values', href: '/admin/cms/value-items', icon: Award, description: 'Company core values' },
        { name: 'Facilities', href: '/admin/cms/facility-items', icon: Layout, description: 'Park amenities' },

        // Wizards
        { name: 'Session Booking', href: '/admin/cms/session-booking', icon: FileText, description: 'Session wizard steps' },
        { name: 'Party Booking', href: '/admin/cms/party-booking', icon: Calendar, description: 'Party wizard steps' },

        // Moved from Pages
        { name: 'Facilities Page', href: '/admin/cms/facilities', icon: Layout, description: 'Facilities page content' },
        { name: 'Privacy Policy', href: '/admin/cms/privacy', icon: Shield, description: 'Privacy policy page content' },
        { name: 'Waiver Terms', href: '/admin/cms/waiver-terms', icon: FileText, description: 'Waiver terms page content' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">CMS Dashboard</h1>
                <p className="text-slate-500">Manage all website content from one place</p>
            </div>

            {/* Pages Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Pages
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page: any) => (
                        <Link
                            key={page.slug}
                            href={`/admin/cms/${page.slug}`}
                            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                                    {page.title.replace(/ - Ninja Inflatable Park|Ninja Inflatable Park - /g, '').trim()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${page.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {page.active ? 'Active' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">/{page.slug}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Collections Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary" />
                    Content Collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collections.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-900">{item.name}</span>
                            </div>
                            <p className="text-xs text-slate-500">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

