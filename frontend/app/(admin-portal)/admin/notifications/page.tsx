import { getNotifications } from '@/app/actions/notifications';
import { Bell, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 mt-1">View all your notifications</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
                        <p className="text-slate-500">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${notification.type === 'BOOKING' ? 'bg-blue-100 text-blue-600' :
                                            notification.type === 'PARTY_BOOKING' ? 'bg-purple-100 text-purple-600' :
                                                notification.type === 'CONTACT_MESSAGE' ? 'bg-green-100 text-green-600' :
                                                    notification.type === 'WAIVER_PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-slate-100 text-slate-600'
                                        }`}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {notification.time_ago}
                                                </p>
                                            </div>
                                            {notification.is_read && (
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                                            >
                                                View details →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
