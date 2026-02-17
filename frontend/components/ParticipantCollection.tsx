"use client";

import { useState } from "react";
import { User, Mail, Phone, Calendar, X, Plus } from "lucide-react";
import { HybridDateInput } from "./HybridDateInput";

interface Adult {
    id: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
    isPrimary: boolean;
}

interface Minor {
    id: string;
    name: string;
    dob: string;
    guardian: string;
}

interface ParticipantCollectionProps {
    onSubmit: (data: { adults: Adult[]; minors: Minor[]; waiverSigned: boolean }) => void;
    onBack?: () => void;
    totalParticipants: number;
    title?: string;
    subtitle?: string;
}

export default function ParticipantCollection({ onSubmit, onBack, totalParticipants, title, subtitle }: ParticipantCollectionProps) {
    const [adults, setAdults] = useState<Adult[]>([{
        id: '1',
        name: '',
        email: '',
        phone: '',
        dob: '',
        isPrimary: true
    }]);

    const [minors, setMinors] = useState<Minor[]>([]);
    const [waiverSigned, setWaiverSigned] = useState(false);
    const [error, setError] = useState('');

    const addAdult = () => {
        setAdults([...adults, {
            id: Date.now().toString(),
            name: '',
            email: '',
            phone: '',
            dob: '',
            isPrimary: false
        }]);
    };

    const removeAdult = (id: string) => {
        if (adults.length > 1) {
            setAdults(adults.filter(a => a.id !== id));
        }
    };

    const updateAdult = (id: string, field: keyof Adult, value: any) => {
        setAdults(adults.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const addMinor = () => {
        setMinors([...minors, {
            id: Date.now().toString(),
            name: '',
            dob: '',
            guardian: ''
        }]);
    };

    const removeMinor = (id: string) => {
        setMinors(minors.filter(m => m.id !== id));
    };

    const updateMinor = (id: string, field: keyof Minor, value: string) => {
        setMinors(minors.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (adults.length === 0) {
            setError('At least one adult is required');
            return;
        }

        if (!waiverSigned) {
            setError('Please agree to the waiver terms');
            return;
        }

        // Check all adults have required fields
        const invalidAdult = adults.find(a => !a.name || !a.email || !a.phone || !a.dob);
        if (invalidAdult) {
            setError('Please fill all required fields for adults');
            return;
        }

        // Check all minors have required fields
        const invalidMinor = minors.find(m => !m.name || !m.dob || !m.guardian);
        if (invalidMinor) {
            setError('Please fill all required fields for minors');
            return;
        }

        setError('');
        onSubmit({ adults, minors, waiverSigned });
    };

    const totalAdded = adults.length + minors.length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="text-primary h-6 w-6" /> {/* Replaced Users with User icon or keep original if valid */}
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-white">{title || "Participant Details"}</h2>
                        <p className="text-white/50 text-sm">
                            {subtitle || `Please provide details for the primary contact. You can add more participants now or later. (${totalAdded} added)`}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Adults Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Adults ({adults.length})
                            </h3>
                        </div>

                        <div className="space-y-4 mb-4">
                            {adults.map((adult, index) => (
                                <div key={adult.id} className="bg-background-dark rounded-xl p-6 border border-surface-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-white">Adult {index + 1}</h4>
                                        {adults.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAdult(adult.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={adult.name}
                                                onChange={(e) => updateAdult(adult.id, 'name', e.target.value)}
                                                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder:text-slate-400"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={adult.email}
                                                onChange={(e) => updateAdult(adult.id, 'email', e.target.value)}
                                                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder:text-slate-400"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={adult.phone}
                                                onChange={(e) => updateAdult(adult.id, 'phone', e.target.value)}
                                                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder:text-slate-400"
                                                placeholder="9845471611"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Date of Birth *
                                            </label>
                                            <HybridDateInput
                                                value={adult.dob}
                                                onChange={(val) => updateAdult(adult.id, 'dob', val)}
                                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                                placeholder="DD-MM-YYYY"
                                            />
                                        </div>
                                    </div>

                                    {index === 0 && (
                                        <div className="mt-4">
                                            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={adult.isPrimary}
                                                    onChange={(e) => updateAdult(adult.id, 'isPrimary', e.target.checked)}
                                                    className="w-4 h-4 text-primary border-surface-700 rounded focus:ring-primary"
                                                />
                                                Primary contact (will receive booking confirmation)
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addAdult}
                            className="w-full py-3 flex items-center justify-center gap-2 bg-surface-800 border-2 border-dashed border-surface-600 hover:border-primary hover:bg-surface-700 hover:text-primary text-white/70 rounded-xl transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Adult
                        </button>
                    </div>

                    {/* Minors Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-secondary" />
                                Minors (Under 18) ({minors.length})
                            </h3>
                        </div>

                        {minors.length > 0 && (
                            <div className="space-y-4 mb-4">
                                {minors.map((minor, index) => (
                                    <div key={minor.id} className="bg-background-dark rounded-xl p-6 border border-surface-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-white">Minor {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeMinor(minor.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={minor.name}
                                                    onChange={(e) => updateMinor(minor.id, 'name', e.target.value)}
                                                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder:text-slate-400"
                                                    placeholder="Jane Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-2">
                                                    Date of Birth *
                                                </label>
                                                <HybridDateInput
                                                    value={minor.dob}
                                                    onChange={(val) => updateMinor(minor.id, 'dob', val)}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-2">
                                                    Guardian Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={minor.guardian}
                                                    onChange={(e) => updateMinor(minor.id, 'guardian', e.target.value)}
                                                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder:text-slate-400"
                                                    placeholder="Parent/Guardian"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={addMinor}
                            className="w-full py-3 flex items-center justify-center gap-2 bg-surface-800 border-2 border-dashed border-surface-600 hover:border-secondary hover:bg-surface-700 hover:text-secondary text-white/70 rounded-xl transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Minor
                        </button>
                    </div>

                    {/* Waiver Agreement */}
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Waiver Agreement</h3>
                        <div className="bg-background-dark rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-sm text-white/70">
                            <p className="mb-2">
                                By checking the box below, I acknowledge that I have read and agree to the{' '}
                                <a href="/waiver-terms" target="_blank" className="text-primary hover:underline">
                                    liability waiver and terms of service
                                </a>.
                            </p>
                            <p className="mb-2">
                                I understand that participation in activities at Spin Pin involves inherent risks,
                                and I agree to release the facility from liability for any injuries or damages.
                            </p>
                            <p>
                                For all minors listed above, I confirm that I am the legal guardian and have the authority
                                to sign this waiver on their behalf.
                            </p>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={waiverSigned}
                                onChange={(e) => setWaiverSigned(e.target.checked)}
                                className="w-5 h-5 text-primary border-surface-700 rounded focus:ring-primary mt-1"
                            />
                            <span className="text-white">
                                I agree to the waiver terms and conditions for myself and all participants listed above *
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 px-6 py-4 bg-surface-700 hover:bg-surface-600 text-white font-bold rounded-xl transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-4 bg-primary hover:bg-primary-light text-black font-bold rounded-xl transition-colors"
                        >
                            Continue to Confirmation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
