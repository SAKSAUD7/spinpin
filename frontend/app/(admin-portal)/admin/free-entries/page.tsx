"use client";

import { useState, useEffect } from "react";
import { getFreeEntries } from "@/app/actions/cms";
import { Mail, Phone, Calendar, CheckCircle, XCircle, Clock, Plus, Ticket, FileText } from "lucide-react";
import { FreeEntryActions } from "../components/FreeEntryActions";
import { CreateFreeEntryModal } from "../components/CreateFreeEntryModal";
import { motion, AnimatePresence } from "framer-motion";

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm flex flex-col gap-3 ${color}`}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
                <div className="opacity-60">{icon}</div>
            </div>
            <div>
                <p className="text-3xl font-black tracking-tight">{value}</p>
            </div>
            {/* subtle glow blob */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-current" />
        </motion.div>
    );
}

export default function FreeEntriesPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    async function loadEntries() {
        try {
            const data = await getFreeEntries();
            setEntries(data);
        } catch (error) {
            console.error("Error loading entries:", error);
        } finally {
            setLoading(false);
        }
    }

    const stats = {
        total: entries.length,
        pending: entries.filter(e => e.status === "PENDING").length,
        approved: entries.filter(e => e.status === "APPROVED").length,
        rejected: entries.filter(e => e.status === "REJECTED").length
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-[#0a0118]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Ticket className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Free Entries</h1>
                    </div>
                    <p className="text-white/40 text-sm ml-14">
                        {loading ? "Loading..." : `${stats.total} total submissions`}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                >
                    <Plus className="w-5 h-5" />
                    Create New Entry
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Total Requests"
                    value={stats.total}
                    color="text-white bg-white/5 border-white/10"
                    icon={<FileText className="w-5 h-5" />}
                />
                <StatCard
                    label="Pending"
                    value={stats.pending}
                    color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                    icon={<Clock className="w-5 h-5" />}
                />
                <StatCard
                    label="Approved"
                    value={stats.approved}
                    color="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    icon={<CheckCircle className="w-5 h-5" />}
                />
                <StatCard
                    label="Rejected"
                    value={stats.rejected}
                    color="text-red-400 bg-red-400/10 border-red-400/20"
                    icon={<XCircle className="w-5 h-5" />}
                />
            </div>

            {/* Entries Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.04]">
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/40">Applicant</th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/40">Reason</th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/40">Status</th>
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/40">Date</th>
                                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-white/40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-md bg-white/5 animate-pulse" style={{ width: `${[120, 200, 70, 80, 50][j]}px` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Ticket className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                        <p className="text-white/30 font-medium">No free entry requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {entries.map((entry, i) => (
                                        <motion.tr 
                                            key={entry.id} 
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black shrink-0">
                                                        {(entry.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-white truncate">{entry.name}</p>
                                                        <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5 truncate">
                                                            <Mail size={12} />
                                                            {entry.email}
                                                        </p>
                                                        {entry.phone && (
                                                            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5 truncate">
                                                                <Phone size={12} />
                                                                {entry.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-white/70 max-w-md line-clamp-2">{entry.reason}</p>
                                                {entry.notes && (
                                                    <p className="text-xs text-primary mt-1 italic">Note: {entry.notes}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {entry.status === "PENDING" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border text-amber-400 bg-amber-400/10 border-amber-400/30">
                                                        <Clock className="w-3.5 h-3.5" /> Pending
                                                    </span>
                                                )}
                                                {entry.status === "APPROVED" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border text-emerald-400 bg-emerald-400/10 border-emerald-400/30">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                )}
                                                {entry.status === "REJECTED" && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border text-red-400 bg-red-400/10 border-red-400/30">
                                                        <XCircle className="w-3.5 h-3.5" /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-white/50">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-white/30" />
                                                    {new Date(entry.created_at || entry.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <FreeEntryActions entry={entry} />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateFreeEntryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadEntries();
                    }}
                />
            )}
        </div>
    );
}
