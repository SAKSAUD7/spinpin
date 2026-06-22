"use client";

/**
 * Payments List Page — Redesigned
 *
 * Admin portal page for viewing and managing all payments.
 * Premium dark glassmorphism theme matching SpinPin brand.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, Search, RefreshCw, CheckCircle, XCircle,
    Clock, TrendingUp, ArrowUpRight, ArrowDownRight,
    ChevronUp, ChevronDown, Filter, Eye, Zap,
    ShieldCheck, AlertCircle, FileText
} from "lucide-react";
import Link from "next/link";

interface Payment {
    id: number;
    booking_id: number | null;
    party_booking_id: number | null;
    provider: string;
    order_id: string;
    payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    booking_number: string;
    booking_date: string;
}

type SortKey = "id" | "amount" | "created_at" | "status";
type SortDir = "asc" | "desc";

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string; icon: React.ReactNode }> = {
    SUCCESS:  { label: "Success",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", dot: "bg-emerald-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    FAILED:   { label: "Failed",   cls: "text-red-400 bg-red-400/10 border-red-400/30",            dot: "bg-red-400",     icon: <XCircle className="w-3.5 h-3.5" />     },
    CREATED:  { label: "Pending",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/30",       dot: "bg-amber-400",   icon: <Clock className="w-3.5 h-3.5" />       },
    REFUNDED: { label: "Refunded", cls: "text-purple-400 bg-purple-400/10 border-purple-400/30",    dot: "bg-purple-400",  icon: <ArrowDownRight className="w-3.5 h-3.5" />},
};

const PROVIDER_CONFIG: Record<string, { label: string; cls: string }> = {
    MOCK:     { label: "Mock",     cls: "text-sky-400 bg-sky-400/10 border-sky-400/30"         },
    RAZORPAY: { label: "Razorpay", cls: "text-violet-400 bg-violet-400/10 border-violet-400/30"},
    STRIPE:   { label: "Stripe",   cls: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30"},
};

function StatCard({ label, value, sub, color, icon }: {
    label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode;
}) {
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
                {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
            </div>
            {/* subtle glow blob */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-current" />
        </motion.div>
    );
}

function SortBtn({ col, sort, dir }: { col: SortKey; sort: SortKey; dir: SortDir }) {
    const active = sort === col;
    return (
        <span className="flex items-center gap-1 group select-none">
            {active ? (
                dir === "asc"
                    ? <ChevronUp className="w-3.5 h-3.5 text-primary" />
                    : <ChevronDown className="w-3.5 h-3.5 text-primary" />
            ) : (
                <ChevronUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
        </span>
    );
}

export default function PaymentsListPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterProvider, setFilterProvider] = useState("all");
    const [sort, setSort] = useState<SortKey>("created_at");
    const [dir, setDir] = useState<SortDir>("desc");

    useEffect(() => { fetchPayments(); }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";
            const response = await fetch(`${API_URL}/payments/`, { credentials: "include", cache: "no-store" });
            if (response.ok) {
                const data = await response.json();
                setPayments(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total:      payments.length,
        success:    payments.filter(p => p.status === "SUCCESS").length,
        failed:     payments.filter(p => p.status === "FAILED").length,
        pending:    payments.filter(p => p.status === "CREATED").length,
        refunded:   payments.filter(p => p.status === "REFUNDED").length,
        revenue:    payments.filter(p => p.status === "SUCCESS" && p.amount > 0).reduce((s, p) => s + p.amount, 0),
    }), [payments]);

    const toggleSort = (key: SortKey) => {
        if (sort === key) setDir(d => d === "asc" ? "desc" : "asc");
        else { setSort(key); setDir("desc"); }
    };

    const filtered = useMemo(() => {
        let list = [...payments];

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(p =>
                p.order_id.toLowerCase().includes(q) ||
                (p.payment_id?.toLowerCase() ?? "").includes(q) ||
                (p.customer_name?.toLowerCase() ?? "").includes(q) ||
                (p.customer_email?.toLowerCase() ?? "").includes(q) ||
                p.id.toString().includes(q)
            );
        }
        if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
        if (filterProvider !== "all") list = list.filter(p => p.provider === filterProvider);

        list.sort((a, b) => {
            let av: number | string = 0, bv: number | string = 0;
            if (sort === "id")         { av = a.id;          bv = b.id; }
            if (sort === "amount")     { av = a.amount;       bv = b.amount; }
            if (sort === "created_at") { av = a.created_at;  bv = b.created_at; }
            if (sort === "status")     { av = a.status;       bv = b.status; }
            if (av < bv) return dir === "asc" ? -1 : 1;
            if (av > bv) return dir === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [payments, searchTerm, filterStatus, filterProvider, sort, dir]);

    const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
    const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
    });

    const StatusBadge = ({ status }: { status: string }) => {
        const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["CREATED"];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.cls}`}>
                {cfg.icon}
                {cfg.label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-[#0a0118]">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Payments</h1>
                    </div>
                    <p className="text-white/40 text-sm ml-14">
                        {loading ? "Loading..." : `${stats.total} transactions total`}
                    </p>
                </div>
                <button
                    onClick={fetchPayments}
                    disabled={loading}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-sm font-semibold disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard
                    label="Total"
                    value={stats.total}
                    color="text-white bg-white/5 border-white/10"
                    icon={<FileText className="w-5 h-5" />}
                />
                <StatCard
                    label="Revenue"
                    value={`£${stats.revenue.toLocaleString("en-GB")}`}
                    sub={`${stats.success} successful`}
                    color="text-primary bg-primary/10 border-primary/20"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    label="Success"
                    value={stats.success}
                    sub={stats.total ? `${Math.round((stats.success / stats.total) * 100)}% rate` : "—"}
                    color="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    icon={<CheckCircle className="w-5 h-5" />}
                />
                <StatCard
                    label="Pending"
                    value={stats.pending}
                    color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                    icon={<Clock className="w-5 h-5" />}
                />
                <StatCard
                    label="Failed"
                    value={stats.failed}
                    color="text-red-400 bg-red-400/10 border-red-400/20"
                    icon={<AlertCircle className="w-5 h-5" />}
                />
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by name, email, order ID…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none text-sm transition-all"
                    />
                </div>

                {/* Status filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 focus:outline-none text-sm appearance-none cursor-pointer transition-all min-w-[140px]"
                    >
                        <option value="all" className="bg-[#1a0b2e]">All Status</option>
                        <option value="SUCCESS"  className="bg-[#1a0b2e]">Success</option>
                        <option value="CREATED"  className="bg-[#1a0b2e]">Pending</option>
                        <option value="FAILED"   className="bg-[#1a0b2e]">Failed</option>
                        <option value="REFUNDED" className="bg-[#1a0b2e]">Refunded</option>
                    </select>
                </div>

                {/* Provider filter */}
                <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <select
                        value={filterProvider}
                        onChange={e => setFilterProvider(e.target.value)}
                        className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 focus:outline-none text-sm appearance-none cursor-pointer transition-all min-w-[150px]"
                    >
                        <option value="all"      className="bg-[#1a0b2e]">All Providers</option>
                        <option value="MOCK"     className="bg-[#1a0b2e]">Mock</option>
                        <option value="RAZORPAY" className="bg-[#1a0b2e]">Razorpay</option>
                        <option value="STRIPE"   className="bg-[#1a0b2e]">Stripe</option>
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur-sm">

                {/* Table head */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.04]">
                                {[
                                    { label: "#ID",      key: "id"         as SortKey, w: "w-16" },
                                    { label: "Customer", key: null,                    w: "min-w-[180px]" },
                                    { label: "Booking",  key: null,                    w: "w-32" },
                                    { label: "Provider", key: null,                    w: "w-28" },
                                    { label: "Amount",   key: "amount"     as SortKey, w: "w-28" },
                                    { label: "Status",   key: "status"     as SortKey, w: "w-28" },
                                    { label: "Date",     key: "created_at" as SortKey, w: "w-36" },
                                    { label: "",         key: null,                    w: "w-20" },
                                ].map(({ label, key, w }) => (
                                    <th key={label} className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/40 ${w}`}>
                                        {key ? (
                                            <button onClick={() => toggleSort(key)} className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                                                {label}
                                                <SortBtn col={key} sort={sort} dir={dir} />
                                            </button>
                                        ) : label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {/* Loading skeleton */}
                            {loading && Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-4 rounded-md bg-white/5 animate-pulse" style={{ width: `${[40, 120, 70, 60, 50, 60, 80, 50][j]}px` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Empty state */}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <CreditCard className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                        <p className="text-white/30 font-medium">No payments found</p>
                                        <p className="text-white/20 text-xs mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            )}

                            {/* Rows */}
                            <AnimatePresence>
                                {!loading && filtered.map((payment, i) => {
                                    const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG["CREATED"];
                                    const providerCfg = PROVIDER_CONFIG[payment.provider] ?? { label: payment.provider, cls: "text-white/50 bg-white/5 border-white/10" };
                                    const isNegative = payment.amount < 0;

                                    return (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group"
                                        >
                                            {/* ID */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-white/40">#{payment.id}</span>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black shrink-0">
                                                        {(payment.customer_name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white font-semibold text-sm truncate">{payment.customer_name || "—"}</p>
                                                        <p className="text-white/35 text-xs truncate">{payment.customer_email || ""}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Booking */}
                                            <td className="px-5 py-4">
                                                {payment.booking_id ? (
                                                    <Link href={`/admin/session-bookings/${payment.booking_id}`}
                                                        className="text-primary hover:text-primary/80 font-mono text-xs font-bold hover:underline transition-colors">
                                                        {payment.booking_number || `#${payment.booking_id}`}
                                                    </Link>
                                                ) : payment.party_booking_id ? (
                                                    <Link href={`/admin/party-bookings/${payment.party_booking_id}`}
                                                        className="text-violet-400 hover:text-violet-300 font-mono text-xs font-bold hover:underline transition-colors">
                                                        {payment.booking_number || `P#${payment.party_booking_id}`}
                                                    </Link>
                                                ) : (
                                                    <span className="text-white/20 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Provider */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${providerCfg.cls}`}>
                                                    {providerCfg.label}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    {isNegative
                                                        ? <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                                        : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                                    }
                                                    <span className={`font-black text-sm ${isNegative ? "text-red-400" : "text-white"}`}>
                                                        {isNegative ? "-" : ""}£{Math.abs(payment.amount).toLocaleString("en-GB")}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusCfg.cls}`}>
                                                    {statusCfg.icon}
                                                    {statusCfg.label}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4">
                                                <p className="text-white/60 text-xs font-medium">{fmt(payment.created_at)}</p>
                                                <p className="text-white/30 text-[11px]">{fmtTime(payment.created_at)}</p>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/admin/payments/${payment.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/0 hover:bg-primary/10 border border-white/0 hover:border-primary/30 text-white/40 hover:text-primary text-xs font-semibold transition-all group-hover:border-white/10"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs text-white/30">
                            Showing <span className="text-white/50 font-semibold">{filtered.length}</span> of{" "}
                            <span className="text-white/50 font-semibold">{payments.length}</span> payments
                        </p>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/60" />
                            <span className="text-xs text-white/20">Transactions secured</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
