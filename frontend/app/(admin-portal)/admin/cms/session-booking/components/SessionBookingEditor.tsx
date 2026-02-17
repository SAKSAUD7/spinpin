"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, Layout, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { getPageSections, updatePageSection, createPageSection } from '@/app/actions/page-sections';
import { PageSection } from '@/lib/cms/types';
import { cmsGet, cmsPatch } from '@/lib/cms-api';

// Define the steps we want to make editable
const SESSION_STEPS = [
    { key: 'step-1', label: 'Step 1: Session Selection', defaultTitle: 'Select Session', defaultSubtitle: 'Choose your preferred date, time and duration' },
    { key: 'step-2', label: 'Step 2: Guests', defaultTitle: 'Select Guests', defaultSubtitle: 'Choose the number of jumpers and spectators' },
    { key: 'step-3', label: 'Step 3: Details', defaultTitle: 'Your Details', defaultSubtitle: "We'll send your booking confirmation here" },
    { key: 'step-5', label: 'Step 5: Payment', defaultTitle: 'Summary & Payment', defaultSubtitle: 'Review your booking details' },
];

const sectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
});

const pricingSchema = z.object({
    adult_price: z.number().min(0, "Price must be positive"),
    adult_label: z.string().min(1, "Label is required"),
    adult_description: z.string().min(1, "Description is required"),
    kid_price: z.number().min(0, "Price must be positive"),
    kid_label: z.string().min(1, "Label is required"),
    kid_description: z.string().min(1, "Description is required"),
    spectator_price: z.number().min(0, "Price must be positive"),
    spectator_label: z.string().min(1, "Label is required"),
    spectator_description: z.string().min(1, "Description is required"),
    gst_rate: z.number().min(0).max(100, "GST must be between 0-100%"),
    duration_label: z.string().min(1, "Label is required"),
    duration_description: z.string().min(1, "Description is required"),
});

type SectionFormData = z.infer<typeof sectionSchema>;
type PricingFormData = z.infer<typeof pricingSchema>;

export default function SessionBookingEditor() {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [pricingConfig, setPricingConfig] = useState<any>(null);
    const [savingPricing, setSavingPricing] = useState(false);

    useEffect(() => {
        loadSections();
        loadPricingConfig();
    }, []);

    const loadSections = async () => {
        try {
            const data = await getPageSections('booking-session');
            setSections(data);
        } catch (error) {
            console.error('Failed to load sections', error);
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const loadPricingConfig = async () => {
        try {
            const data = await cmsGet('/cms/session-booking-config/1/');
            setPricingConfig(data);
        } catch (error) {
            console.error('Failed to load pricing config', error);
            toast.error('Failed to load pricing configuration');
        }
    };

    const handleSave = async (stepKey: string, data: SectionFormData) => {
        setSaving(stepKey);
        try {
            const existingSection = sections.find(s => s.section_key === stepKey);

            if (existingSection) {
                await updatePageSection(existingSection.id, {
                    ...existingSection,
                    title: data.title,
                    subtitle: data.subtitle || '',
                });
            } else {
                await createPageSection({
                    page: 'booking-session',
                    section_key: stepKey,
                    title: data.title,
                    subtitle: data.subtitle || '',
                    active: true,
                    order: 0,
                    content: '',
                    image_url: '',
                    video_url: '',
                    cta_text: '',
                    cta_link: ''
                });
            }

            await loadSections();
            toast.success('Section updated successfully');
        } catch (error) {
            console.error('Failed to save section', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(null);
        }
    };

    const handlePricingSave = async (data: PricingFormData) => {
        setSavingPricing(true);
        try {
            await cmsPatch('/cms/session-booking-config/1/', data);
            await loadPricingConfig();
            toast.success('Pricing configuration updated successfully');
        } catch (error) {
            console.error('Failed to save pricing', error);
            toast.error('Failed to save pricing configuration');
        } finally {
            setSavingPricing(false);
        }
    };

    if (loading || !pricingConfig) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Pricing Configuration Section */}
            <PricingEditor
                initialData={pricingConfig}
                isSaving={savingPricing}
                onSave={handlePricingSave}
            />

            {/* Step Titles/Subtitles Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Step Titles & Subtitles</h3>
                <div className="space-y-6">
                    {SESSION_STEPS.map((step) => {
                        const section = sections.find(s => s.section_key === step.key);
                        return (
                            <StepEditor
                                key={step.key}
                                step={step}
                                initialData={section}
                                isSaving={saving === step.key}
                                onSave={(data) => handleSave(step.key, data)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function PricingEditor({ initialData, isSaving, onSave }: { initialData: any, isSaving: boolean, onSave: (data: PricingFormData) => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<PricingFormData>({
        resolver: zodResolver(pricingSchema),
        defaultValues: {
            adult_price: parseFloat(initialData?.adult_price) || 899,
            adult_label: initialData?.adult_label || "Ninja Warrior (7+ Years)",
            adult_description: initialData?.adult_description || "₹ 899 + GST per person",
            kid_price: parseFloat(initialData?.kid_price) || 500,
            kid_label: initialData?.kid_label || "Little Ninjas (1-7 Years)",
            kid_description: initialData?.kid_description || "₹ 500 + GST per person",
            spectator_price: parseFloat(initialData?.spectator_price) || 150,
            spectator_label: initialData?.spectator_label || "Spectators",
            spectator_description: initialData?.spectator_description || "₹ 150 + GST per person",
            gst_rate: parseFloat(initialData?.gst_rate) || 18,
            duration_label: initialData?.duration_label || "60 Minutes",
            duration_description: initialData?.duration_description || "Standard Session",
        }
    });

    return (
        <form onSubmit={handleSubmit(onSave)} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-blue-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Pricing & Categories Configuration
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Adult Configuration */}
                <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-slate-800 mb-4">Adult Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                            <input
                                {...register('adult_label')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. Ninja Warrior (7+ Years)"
                            />
                            {errors.adult_label && <p className="text-red-500 text-xs mt-1">{errors.adult_label.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('adult_price', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            {errors.adult_price && <p className="text-red-500 text-xs mt-1">{errors.adult_price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                                {...register('adult_description')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. ₹ 899 + GST per person"
                            />
                            {errors.adult_description && <p className="text-red-500 text-xs mt-1">{errors.adult_description.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Kid Configuration */}
                <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-slate-800 mb-4">Kid Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                            <input
                                {...register('kid_label')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. Little Ninjas (1-7 Years)"
                            />
                            {errors.kid_label && <p className="text-red-500 text-xs mt-1">{errors.kid_label.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('kid_price', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            {errors.kid_price && <p className="text-red-500 text-xs mt-1">{errors.kid_price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                                {...register('kid_description')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. ₹ 500 + GST per person"
                            />
                            {errors.kid_description && <p className="text-red-500 text-xs mt-1">{errors.kid_description.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Spectator Configuration */}
                <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-semibold text-slate-800 mb-4">Spectator Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                            <input
                                {...register('spectator_label')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. Spectators"
                            />
                            {errors.spectator_label && <p className="text-red-500 text-xs mt-1">{errors.spectator_label.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('spectator_price', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            {errors.spectator_price && <p className="text-red-500 text-xs mt-1">{errors.spectator_price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                                {...register('spectator_description')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g. ₹ 150 + GST per person"
                            />
                            {errors.spectator_description && <p className="text-red-500 text-xs mt-1">{errors.spectator_description.message}</p>}
                        </div>
                    </div>
                </div>

                {/* GST & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('gst_rate', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g. 18"
                        />
                        {errors.gst_rate && <p className="text-red-500 text-xs mt-1">{errors.gst_rate.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duration Label</label>
                        <input
                            {...register('duration_label')}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g. 60 Minutes"
                        />
                        {errors.duration_label && <p className="text-red-500 text-xs mt-1">{errors.duration_label.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duration Description</label>
                        <input
                            {...register('duration_description')}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g. Standard Session"
                        />
                        {errors.duration_description && <p className="text-red-500 text-xs mt-1">{errors.duration_description.message}</p>}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-medium disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Pricing Configuration
                </button>
            </div>
        </form>
    );
}

function StepEditor({ step, initialData, isSaving, onSave }: { step: any, initialData: any, isSaving: boolean, onSave: (data: SectionFormData) => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: initialData?.title || step.defaultTitle,
            subtitle: initialData?.subtitle || step.defaultSubtitle,
        }
    });

    return (
        <form onSubmit={handleSubmit(onSave)} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-700 text-sm flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-slate-400" />
                    {step.label}
                </h4>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all text-xs font-medium disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                    <input
                        {...register('title')}
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g. Select Session"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Subtitle</label>
                    <input
                        {...register('subtitle')}
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g. Choose your preferred date..."
                    />
                </div>
            </div>
        </form>
    );
}
