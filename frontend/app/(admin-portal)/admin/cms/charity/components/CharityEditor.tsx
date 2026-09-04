"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, Heart, HeartOff } from "lucide-react";
import { fetchCharityConfig, updateCharityConfig } from "@/lib/api/cms";
import { Button } from "@/components/admin/Button";

export default function CharityEditor({ adminToken }: { adminToken: string }) {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            setLoading(true);
            const data = await fetchCharityConfig(adminToken);
            setConfig(data);
        } catch (error) {
            console.error("Failed to load charity config:", error);
            toast.error("Failed to load charity configuration");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!config) return;

        try {
            setSaving(true);
            const updated = await updateCharityConfig(config.id, config, adminToken);
            setConfig(updated);
            toast.success("Charity configuration saved successfully");
        } catch (error) {
            console.error("Failed to save charity config:", error);
            toast.error("Failed to save charity configuration");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="p-8 text-center text-slate-500">
                Failed to load configuration. Please try again later.
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
            {/* Master Switch */}
            <div className={`p-6 rounded-xl border-2 transition-colors ${config.is_enabled ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            {config.is_enabled ? <Heart className="text-pink-500 fill-pink-500" size={24} /> : <HeartOff className="text-slate-400" size={24} />}
                            Charity Feature Status
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            When enabled, customers will see the charity donation option during the booking wizard checkout step.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.is_enabled}
                            onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                </div>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">Content Configuration</h3>
                    <p className="text-sm text-slate-500">Manage the text and identity of the charity shown to customers</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Charity Name</label>
                            <input
                                type="text"
                                value={config.charity_name || ''}
                                onChange={(e) => setConfig({ ...config, charity_name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="e.g. Nepal Charity"
                                required
                            />
                            <p className="text-xs text-slate-500">Internal name saved to the booking snapshot for historical accuracy.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Display Title</label>
                            <input
                                type="text"
                                value={config.charity_title || ''}
                                onChange={(e) => setConfig({ ...config, charity_title: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="e.g. Support Nepal"
                                required
                            />
                            <p className="text-xs text-slate-500">The main title shown on the charity card.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Description</label>
                        <textarea
                            value={config.charity_description || ''}
                            onChange={(e) => setConfig({ ...config, charity_description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
                            placeholder="e.g. By confirming this booking for charity..."
                            required
                        />
                        <p className="text-xs text-slate-500">Short paragraph explaining the cause and how the donation works.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Checkbox Text</label>
                        <input
                            type="text"
                            value={config.checkbox_text || ''}
                            onChange={(e) => setConfig({ ...config, checkbox_text: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                            placeholder="e.g. Yes, I confirm this booking amount should go to..."
                            required
                        />
                        <p className="text-xs text-slate-500">The explicit consent text the user must click.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Success/Confirmation Text</label>
                        <input
                            type="text"
                            value={config.success_text || ''}
                            onChange={(e) => setConfig({ ...config, success_text: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g. Thank you! Your booking amount will go to..."
                        />
                        <p className="text-xs text-slate-500">Text shown after they select the checkbox.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Optional Info Text</label>
                        <textarea
                            value={config.info_text || ''}
                            onChange={(e) => setConfig({ ...config, info_text: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Any additional fine print..."
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Optional Image URL</label>
                        <input
                            type="url"
                            value={config.image_url || ''}
                            onChange={(e) => setConfig({ ...config, image_url: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        icon={saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    >
                        {saving ? "Saving..." : "Save Configuration"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
