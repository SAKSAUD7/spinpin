"use client";

import { useState } from "react";
import { createFreeEntry } from "@/app/actions/cms";
import { toast } from "sonner";
import { X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface CreateFreeEntryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateFreeEntryModal({ onClose, onSuccess }: CreateFreeEntryModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        reason: ""
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.reason) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await createFreeEntry(formData);
            toast.success("Free entry request created successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to create entry");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#150a2e] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full my-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-black text-white">Create Free Entry</h2>
                        <p className="text-sm text-white/50 mt-1">Add a new free entry request for a customer</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-white/70" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">
                            Customer Name <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">
                            Email Address <span className="text-primary">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all"
                            placeholder="customer@example.com"
                            required
                        />
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">
                            Phone Number <span className="text-white/40 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all"
                            placeholder="1234567890"
                        />
                    </div>

                    {/* Reason Field */}
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">
                            Reason for Free Entry <span className="text-primary">*</span>
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                            placeholder="E.g., Birthday celebration, competition winner..."
                            required
                        />
                        <p className="text-xs text-white/40 mt-2">
                            Provide a clear reason why this customer is requesting free entry
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors font-bold border border-white/10"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--primary),0.3)] flex justify-center items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : "Create Entry"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
