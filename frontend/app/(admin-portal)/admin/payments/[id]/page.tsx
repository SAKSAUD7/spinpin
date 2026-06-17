"use client";

/**
 * Payment Detail Page — Redesigned
 * View payment details and process refunds
 */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, CreditCard, CheckCircle, XCircle, Clock,
    ArrowDownRight, AlertTriangle, RefreshCw, Copy,
    ShieldCheck, Receipt, ExternalLink, Banknote,
    CalendarDays, Hash, Building2, RotateCcw
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
    provider_response: any;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; bg: string; icon: React.ReactNode }> = {
    SUCCESS:  {
        label: "Success",
        cls: "text-emerald-400 border-emerald-400/40",
        bg: "bg-emerald-400/10",
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
    },
    FAILED:   {
        label: "Failed",
        cls: "text-red-400 border-red-400/40",
        bg: "bg-red-400/10",
        icon: <XCircle className="w-5 h-5 text-red-400" />
    },
    CREATED:  {
        label: "Pending",
        cls: "text-amber-400 border-amber-400/40",
        bg: "bg-amber-400/10",
        icon: <Clock className="w-5 h-5 text-amber-400" />
    },
    REFUNDED: {
        label: "Refunded",
        cls: "text-purple-400 border-purple-400/40",
        bg: "bg-purple-400/10",
        icon: <ArrowDownRight className="w-5 h-5 text-purple-400" />
    },
};

function CopyBtn({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={copy} className="ml-2 p-1 rounded hover:bg-white/10 transition-colors text-white/30 hover:text-white/70">
            <Copy className="w-3.5 h-3.5" />
            {copied && <span className="sr-only">Copied!</span>}
        </button>
    );
}

function InfoRow({ label, value, mono, children }: { label: string; value?: string; mono?: boolean; children?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 gap-4">
            <span className="text-white/40 text-sm shrink-0">{label}</span>
            <div className="text-right">
                {children ?? (
                    <span className={`text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
                )}
            </div>
        </div>
    );
}

export default function PaymentDetailPage() {
    const params = useParams();
    const paymentId = params.id as string;

    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [isRefunding, setIsRefunding] = useState(false);
    const [refundError, setRefundError] = useState("");
    const [refundSuccess, setRefundSuccess] = useState(false);

    useEffect(() => { fetchPaymentDetails(); }, [paymentId]);

    const fetchPaymentDetails = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";
            const response = await fetch(`${API_URL}/admin/payments/${paymentId}/`, {
                credentials: "include",
                cache: "no-store",
            });
            if (response.ok) {
                const data = await response.json();
                setPayment(data);
                setRefundAmount(Math.abs(data.amount).toString());
            }
        } catch (error) {
            console.error("Failed to fetch payment details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!payment || !refundAmount) return;
        setIsRefunding(true);
        setRefundError("");
        setRefundSuccess(false);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";
            const response = await fetch(`${API_URL}/payments/refund/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    payment_id: payment.id,
                    amount: parseFloat(refundAmount),
                    reason: refundReason,
                }),
            });
            const result = await response.json();
            if (result.success) {
                setRefundSuccess(true);
                fetchPaymentDetails();
            } else {
                setRefundError(result.error || "Refund failed");
            }
        } catch (error: any) {
            setRefundError(error.message || "Failed to process refund");
        } finally {
            setIsRefunding(false);
        }
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
    });
    const fmtFull = (d: string) => new Date(d).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0118] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-white/40 text-sm">Loading payment…</p>
                </div>
            </div>
        );
    }

    /* ─── Not Found ─── */
    if (!payment) {
        return (
            <div className="min-h-screen bg-[#0a0118] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-14 h-14 text-red-400/50 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-white mb-2">Payment Not Found</h2>
                    <Link href="/admin/payments" className="text-primary hover:text-primary/80 text-sm font-semibold">
                        ← Back to Payments
                    </Link>
                </div>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG["CREATED"];
    const isNegative = payment.amount < 0;
    const canRefund = payment.status === "SUCCESS" && payment.amount > 0;

    return (
        <div className="min-h-screen bg-[#0a0118] p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/payments"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary" />
                            Payment <span className="text-primary">#{payment.id}</span>
                        </h1>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${statusCfg.cls} ${statusCfg.bg}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                        </span>
                    </div>
                    <p className="text-white/35 text-sm mt-0.5">Created {fmtFull(payment.created_at)}</p>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left — details */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Amount hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-6 ${statusCfg.bg} ${statusCfg.cls}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Amount</p>
                        <p className={`text-5xl font-black tracking-tight ${isNegative ? "text-red-400" : "text-white"}`}>
                            {isNegative ? "-" : ""}£{Math.abs(payment.amount).toLocaleString("en-GB")}
                        </p>
                        <p className="text-xs opacity-50 mt-2">{payment.currency}</p>
                    </motion.div>

                    {/* Transaction details */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6"
                    >
                        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Receipt className="w-4 h-4" /> Transaction Details
                        </h2>
                        <div>
                            <InfoRow label="Payment ID" mono>
                                <div className="flex items-center">
                                    <span className="font-mono text-sm text-white">{payment.id}</span>
                                </div>
                            </InfoRow>
                            <InfoRow label="Order ID" mono>
                                <div className="flex items-center">
                                    <span className="font-mono text-xs text-white/70 break-all max-w-[240px]">{payment.order_id}</span>
                                    <CopyBtn value={payment.order_id} />
                                </div>
                            </InfoRow>
                            <InfoRow label="Payment Reference" mono>
                                {payment.payment_id ? (
                                    <div className="flex items-center">
                                        <span className="font-mono text-xs text-white/70 break-all max-w-[240px]">{payment.payment_id}</span>
                                        <CopyBtn value={payment.payment_id} />
                                    </div>
                                ) : (
                                    <span className="text-white/20 text-sm">—</span>
                                )}
                            </InfoRow>
                            <InfoRow label="Provider">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                                    payment.provider === "MOCK" ? "text-sky-400 bg-sky-400/10 border-sky-400/30" :
                                    payment.provider === "RAZORPAY" ? "text-violet-400 bg-violet-400/10 border-violet-400/30" :
                                    "text-indigo-400 bg-indigo-400/10 border-indigo-400/30"
                                }`}>
                                    {payment.provider}
                                </span>
                            </InfoRow>
                            <InfoRow label="Created" value={fmtFull(payment.created_at)} />
                            <InfoRow label="Last Updated" value={fmtFull(payment.updated_at)} />
                            {payment.notes && (
                                <InfoRow label="Notes" value={payment.notes} />
                            )}
                        </div>
                    </motion.div>

                    {/* Booking link */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6"
                    >
                        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Booking Reference
                        </h2>
                        {payment.booking_id ? (
                            <Link
                                href={`/admin/session-bookings/${payment.booking_id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all group"
                            >
                                <div>
                                    <p className="text-xs text-white/40 mb-0.5">Session Booking</p>
                                    <p className="text-primary font-black text-lg">#{payment.booking_id}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                            </Link>
                        ) : payment.party_booking_id ? (
                            <Link
                                href={`/admin/party-bookings/${payment.party_booking_id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all group"
                            >
                                <div>
                                    <p className="text-xs text-white/40 mb-0.5">Party Booking</p>
                                    <p className="text-violet-400 font-black text-lg">#{payment.party_booking_id}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-violet-400/50 group-hover:text-violet-400 transition-colors" />
                            </Link>
                        ) : (
                            <p className="text-white/25 text-sm">No booking associated with this payment.</p>
                        )}
                    </motion.div>

                    {/* Provider response */}
                    {payment.provider_response && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6"
                        >
                            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Provider Response
                            </h2>
                            <pre className="bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-white/50 overflow-x-auto leading-relaxed">
                                {JSON.stringify(payment.provider_response, null, 2)}
                            </pre>
                        </motion.div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">

                    {/* Refund panel */}
                    {canRefund && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-6 sticky top-6"
                        >
                            <h2 className="text-white font-black text-lg mb-1 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-red-400" />
                                Process Refund
                            </h2>
                            <p className="text-white/40 text-xs mb-5">Issue a full or partial refund for this payment.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                        Refund Amount (£)
                                    </label>
                                    <input
                                        type="number"
                                        value={refundAmount}
                                        onChange={e => setRefundAmount(e.target.value)}
                                        max={payment.amount}
                                        step="0.01"
                                        className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:border-red-400/50 focus:ring-1 focus:ring-red-400/20 focus:outline-none text-sm transition-all"
                                    />
                                    <p className="text-xs text-white/30 mt-1">
                                        Max: <span className="text-white/50 font-semibold">£{payment.amount.toLocaleString("en-GB")}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                        Reason <span className="normal-case text-white/25">(optional)</span>
                                    </label>
                                    <textarea
                                        value={refundReason}
                                        onChange={e => setRefundReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:border-red-400/50 focus:ring-1 focus:ring-red-400/20 focus:outline-none text-sm transition-all resize-none placeholder-white/20"
                                        placeholder="e.g. Customer requested cancellation…"
                                    />
                                </div>

                                {refundError && (
                                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-xs">{refundError}</p>
                                    </div>
                                )}

                                {refundSuccess && (
                                    <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-emerald-400 text-xs font-semibold">Refund processed successfully!</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleRefund}
                                    disabled={isRefunding || !refundAmount || parseFloat(refundAmount) <= 0}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-500/90 active:scale-[0.98] text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isRefunding ? (
                                        <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                                    ) : (
                                        <><RotateCcw className="w-4 h-4" /> Issue Refund</>
                                    )}
                                </button>

                                <p className="text-[11px] text-white/25 text-center">⚠️ This action cannot be undone</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Refunded notice */}
                    {payment.amount < 0 && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                            <ArrowDownRight className="w-8 h-8 text-purple-400 mb-3" />
                            <h3 className="text-lg font-black text-purple-400 mb-1">Refund Payment</h3>
                            <p className="text-white/40 text-sm">This record represents a refund transaction.</p>
                        </div>
                    )}

                    {/* Security badge */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400/60 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-white/50">Secure Transaction</p>
                            <p className="text-[11px] text-white/25 mt-0.5">Payment data is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
