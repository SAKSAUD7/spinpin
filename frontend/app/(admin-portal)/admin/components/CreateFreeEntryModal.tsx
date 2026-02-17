"use client";

import { useState } from "react";
import { createFreeEntry } from "@/app/actions/cms";
import { toast } from "sonner";
import { X } from "lucide-react";

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Create Free Entry Request</h2>
                        <p className="text-sm text-slate-500 mt-1">Add a new free entry request on behalf of a customer</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                            placeholder="Enter customer's full name"
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                            placeholder="customer@example.com"
                            required
                        />
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number <span className="text-slate-400">(Optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                            placeholder="1234567890"
                        />
                    </div>

                    {/* Reason Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Reason for Free Entry <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 resize-none"
                            placeholder="E.g., Birthday celebration, school event, special occasion..."
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Provide a clear reason why this customer is requesting free entry
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
