"use client";

/**
 * Payments List Page
 * 
 * Admin portal page for viewing and managing all payments
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, Filter, Download, RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
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

export default function PaymentsListPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterProvider, setFilterProvider] = useState("all");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            console.log("Fetching payments from:", `${API_URL}/payments/`);

            const response = await fetch(`${API_URL}/payments/`, {
                credentials: "include",
                cache: "no-store",
            });

            console.log("Payment API Response:", response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log("Payments data:", data);
                setPayments(data.results || data);
            } else {
                const errorText = await response.text();
                console.error("Failed to fetch payments:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const matchesSearch =
            payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toString().includes(searchTerm);

        const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
        const matchesProvider = filterProvider === "all" || payment.provider === filterProvider;

        return matchesSearch && matchesStatus && matchesProvider;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return "text-green-400 bg-green-400/10 border-green-400/30";
            case "FAILED":
                return "text-red-400 bg-red-400/10 border-red-400/30";
            case "CREATED":
                return "text-blue-400 bg-blue-400/10 border-blue-400/30";
            case "REFUNDED":
                return "text-orange-400 bg-orange-400/10 border-orange-400/30";
            default:
                return "text-gray-400 bg-gray-400/10 border-gray-400/30";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return <CheckCircle className="w-4 h-4" />;
            case "FAILED":
                return <XCircle className="w-4 h-4" />;
            case "CREATED":
                return <Clock className="w-4 h-4" />;
            case "REFUNDED":
                return <DollarSign className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const stats = {
        total: payments.length,
        success: payments.filter((p) => p.status === "SUCCESS").length,
        failed: payments.filter((p) => p.status === "FAILED").length,
        refunded: payments.filter((p) => p.amount < 0).length,
        totalAmount: payments
            .filter((p) => p.status === "SUCCESS" && p.amount > 0)
            .reduce((sum, p) => sum + p.amount, 0),
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-black text-white flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" />
                        Payments
                    </h1>
                    <p className="text-white/60 mt-1">Manage all payment transactions</p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-surface-800/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <p className="text-white/60 text-sm font-medium">Total Payments</p>
                    <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-green-500/10 backdrop-blur-md p-4 rounded-xl border border-green-500/30">
                    <p className="text-green-400 text-sm font-medium">Successful</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{stats.success}</p>
                </div>
                <div className="bg-red-500/10 backdrop-blur-md p-4 rounded-xl border border-red-500/30">
                    <p className="text-red-400 text-sm font-medium">Failed</p>
                    <p className="text-2xl font-black text-red-400 mt-1">{stats.failed}</p>
                </div>
                <div className="bg-orange-500/10 backdrop-blur-md p-4 rounded-xl border border-orange-500/30">
                    <p className="text-orange-400 text-sm font-medium">Refunds</p>
                    <p className="text-2xl font-black text-orange-400 mt-1">{stats.refunded}</p>
                </div>
                <div className="bg-primary/10 backdrop-blur-md p-4 rounded-xl border border-primary/30">
                    <p className="text-primary text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-black text-primary mt-1">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-800/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Payment ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-surface-900 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="CREATED">Created</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                    <select
                        value={filterProvider}
                        onChange={(e) => setFilterProvider(e.target.value)}
                        className="px-4 py-2 bg-surface-900 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                    >
                        <option value="all">All Providers</option>
                        <option value="MOCK">Mock</option>
                        <option value="RAZORPAY">Razorpay</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-surface-800/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Loading payments...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No payments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-900/50 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Booking
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Provider
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredPayments.map((payment) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                            #{payment.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{payment.customer_name || 'N/A'}</span>
                                                <span className="text-white/40 text-xs">{payment.customer_email || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {payment.booking_id ? (
                                                <Link
                                                    href={`/admin/session-bookings/${payment.booking_id}`}
                                                    className="text-primary hover:text-primary/80 font-medium"
                                                >
                                                    {payment.booking_number || `#${payment.booking_id}`}
                                                </Link>
                                            ) : payment.party_booking_id ? (
                                                <Link
                                                    href={`/admin/party-bookings/${payment.party_booking_id}`}
                                                    className="text-primary hover:text-primary/80 font-medium"
                                                >
                                                    {payment.booking_number || `P#${payment.party_booking_id}`}
                                                </Link>
                                            ) : (
                                                <span className="text-white/40">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${payment.provider === "MOCK"
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-purple-500/20 text-purple-400"
                                                }`}>
                                                {payment.provider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            <span className={payment.amount < 0 ? "text-red-400" : "text-green-400"}>
                                                {payment.amount < 0 ? "-" : ""}₹{Math.abs(payment.amount).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                                            {new Date(payment.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                href={`/admin/payments/${payment.id}`}
                                                className="text-primary hover:text-primary/80 font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
