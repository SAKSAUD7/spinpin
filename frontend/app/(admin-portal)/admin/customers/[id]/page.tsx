import { getAdminSession } from "@/app/lib/admin-auth";
import { getCustomerById } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Package, TrendingUp, User, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@repo/utils";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) redirect("/admin/login");

    // Fetch customer with their bookings
    const customer = await getCustomerById(params.id);

    if (!customer) {
        return <div className="p-8">Customer not found</div>;
    }

    // Calculate stats
    const totalBookings = customer.bookings.length;
    const totalSpent = customer.bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const lastBooking = customer.bookings[0];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Link href="/admin/customers" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Customers
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                            {(customer.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{customer.name || 'Unknown Customer'}</h1>
                            <p className="text-slate-500 text-sm mt-1">Customer ID: #{String(customer.id).slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Member Since</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(customer.createdAt)}</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                            <p className="text-sm font-medium text-slate-900">{customer.email || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                            <p className="text-sm font-medium text-slate-900">{customer.phone || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-slate-900">{totalBookings}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Spent</p>
                            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Last Visit</p>
                            <p className="text-lg font-bold text-slate-900">
                                {lastBooking ? formatDate(lastBooking.date) : 'Never'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Booking History</h2>
                    <p className="text-sm text-slate-500 mt-1">Recent bookings by this customer</p>
                </div>

                {customer.bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customer.bookings.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">#{String(booking.id).slice(-6).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(booking.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">{booking.packageId || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{booking.guests || 1} guests</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(booking.amount)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/bookings/${booking.id}`}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No bookings yet</p>
                        <p className="text-sm text-slate-400 mt-1">This customer hasn't made any bookings</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
        COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const defaultStyle = "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || defaultStyle} inline-flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'CONFIRMED' ? 'bg-emerald-500' : status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-400'}`} />
            {status}
        </span>
    );
}
