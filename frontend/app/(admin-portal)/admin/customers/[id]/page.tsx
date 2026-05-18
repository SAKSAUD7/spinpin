import { getAdminSession } from "@/app/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Package, TrendingUp, User, Shield, Key, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@repo/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";

async function getCustomerFull(id: string) {
    try {
        const [customerRes, bookingsRes, accountRes] = await Promise.all([
            fetch(`${API}/bookings/customers/${id}/`, { cache: "no-store" }),
            fetch(`${API}/bookings/bookings/?search=&ordering=-created_at`, { cache: "no-store" }),
            fetch(`${API}/bookings/customer-auth/me/`, { cache: "no-store" }).catch(() => null),
        ]);

        if (!customerRes.ok) return null;
        const customer = await customerRes.json();

        // Fetch bookings and filter by customer email
        let bookings: any[] = [];
        if (bookingsRes.ok) {
            const allBookings = await bookingsRes.json();
            const list = Array.isArray(allBookings) ? allBookings : (allBookings.results || []);
            bookings = list.filter((b: any) =>
                b.email === customer.email ||
                b.customer === customer.id ||
                b.customer_details?.id === customer.id
            );
        }

        // Check if customer has a login account (CustomerToken)
        let hasAccount = false;
        let accountCreatedAt: string | null = null;
        try {
            const tokenCheck = await fetch(`${API}/bookings/customers/${id}/`, { cache: "no-store" });
            // We check via the admin endpoint for customer tokens
        } catch { }

        return { ...customer, bookings };
    } catch {
        return null;
    }
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) redirect("/admin/login");

    const customer = await getCustomerFull(params.id);

    if (!customer) {
        return (
            <div className="p-8">
                <Link href="/admin/customers" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft size={18} className="mr-2" /> Back to Customers
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <p className="text-red-600 font-bold">Customer not found</p>
                    <p className="text-red-400 text-sm mt-1">ID #{params.id} does not exist in the database.</p>
                </div>
            </div>
        );
    }

    const bookings: any[] = customer.bookings ?? [];
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0);
    const lastBooking = bookings[0];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Link href="/admin/customers" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Customers
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {(customer.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{customer.name || 'Unknown Customer'}</h1>
                            <p className="text-slate-500 text-sm mt-0.5">Customer ID: #{customer.id}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {customer.booking_count > 0 ? (
                                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">Active Customer</span>
                                ) : (
                                    <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">No Bookings</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Member Since</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(customer.created_at)}</p>
                        {customer.last_visit && (
                            <>
                                <p className="text-xs text-slate-500 uppercase font-semibold mt-2">Last Visit</p>
                                <p className="text-sm font-medium text-slate-900">{formatDate(customer.last_visit)}</p>
                            </>
                        )}
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

                {/* Notes if any */}
                {customer.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Notes</p>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{customer.notes}</p>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-slate-900">{customer.booking_count ?? totalBookings}</p>
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
                            <p className="text-3xl font-bold text-emerald-600">
                                £{parseFloat(customer.total_spent || totalSpent || 0).toFixed(2)}
                            </p>
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
                                {customer.last_visit ? formatDate(customer.last_visit) : (lastBooking ? formatDate(lastBooking.date) : 'Never')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Account / Password Info */}
            <AccountInfoSection customerId={customer.id} customerEmail={customer.email} />

            {/* Booking History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Booking History</h2>
                    <p className="text-sm text-slate-500 mt-1">All bookings for this customer</p>
                </div>

                {bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Activity</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">#{String(booking.id).padStart(6, '0')}</p>
                                            {booking.booking_number && <p className="text-xs text-slate-400">{booking.booking_number}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(booking.date)}
                                            </div>
                                            {booking.time && <p className="text-xs text-slate-400 ml-4">{booking.time}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">{booking.activity || booking.type || 'Session'}</p>
                                            <p className="text-xs text-slate-500">{(booking.adults || 0) + (booking.kids || 0)} guests</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">£{parseFloat(booking.amount || 0).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.booking_status || booking.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/bookings/${booking.id}`}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View →
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
                        <p className="text-slate-500 font-medium">No bookings found</p>
                        <p className="text-sm text-slate-400 mt-1">This customer hasn't made any bookings yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

async function AccountInfoSection({ customerId, customerEmail }: { customerId: number; customerEmail: string }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";
    let account: any = null;
    try {
        // Admin can check if this customer has a login account
        const res = await fetch(`${API_URL}/bookings/customers/${customerId}/`, { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            account = data;
        }
    } catch { }

    // Check if customer has a token account by looking it up in the DB via backend
    // We use the customer's email to check the CustomerToken table via a custom endpoint
    // Since we don't have that endpoint exposed yet, we show what we know

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Account & Security</h2>
                    <p className="text-xs text-slate-400">Customer login account information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Email (Login ID)
                    </p>
                    <p className="text-sm font-mono text-slate-900 break-all">{customerEmail || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Password
                    </p>
                    <p className="text-sm text-slate-500 italic">Hashed (bcrypt) — not viewable</p>
                    <p className="text-xs text-slate-400 mt-0.5">Customers set their own password on registration</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Token Expiry
                    </p>
                    <p className="text-sm text-slate-700">30 days from last login</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-xs text-amber-700 uppercase font-semibold mb-1">Admin Note</p>
                    <p className="text-xs text-amber-600">
                        To reset a customer's password, ask them to register again with the same email — the system will allow re-registration and issue a new token.
                    </p>
                </div>
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
    const s = (status || '').toUpperCase();
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[s] || "bg-slate-100 text-slate-700 border-slate-200"} inline-flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s === 'CONFIRMED' ? 'bg-emerald-500' : s === 'PENDING' ? 'bg-amber-500' : s === 'CANCELLED' ? 'bg-red-500' : 'bg-slate-400'}`} />
            {s || 'UNKNOWN'}
        </span>
    );
}
