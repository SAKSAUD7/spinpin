"use client";

import { useState } from "react";
import { createPartyBooking } from "@/app/actions/createPartyBooking";
import { updatePartyBooking } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, User, Mail, Phone, Baby, Info, Gift } from "lucide-react";
import { toast } from "sonner";

interface AdminPartyBookingFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function AdminPartyBookingForm({ initialData, isEditing = false }: AdminPartyBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        try {
            // Convert FormData to object for the action
            const data = {
                date: formData.get("date"),
                time: formData.get("time"),
                participants: Number(formData.get("participants")),
                spectators: Number(formData.get("spectators")),
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                childName: formData.get("childName"),
                childAge: Number(formData.get("childAge")),
                specialRequests: formData.get("specialRequests"),
                partyPackage: formData.get("partyPackage"),
                theme: formData.get("theme"),
                decorations: formData.get("decorations") === "true",
                catering: formData.get("catering") === "true",
                cake: formData.get("cake") === "true",
                photographer: formData.get("photographer") === "true",
                partyFavors: formData.get("partyFavors") === "true",
                booking_status: formData.get("bookingStatus"), // Add status support
            };

            let result;
            if (isEditing && initialData?.id) {
                result = await updatePartyBooking(initialData.id, data);
            } else {
                result = await createPartyBooking(data);
            }

            if (result.success) {
                toast.success(isEditing ? "Booking updated successfully" : "Booking created successfully");
                router.push("/admin/party-bookings");
                router.refresh();
            } else {
                setError(result.error || `Failed to ${isEditing ? "update" : "create"} booking`);
                toast.error(result.error || "Operation failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Customer Details */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="name"
                                type="text"
                                required
                                defaultValue={initialData?.name}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue={initialData?.email}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="phone"
                                type="tel"
                                required
                                defaultValue={initialData?.phone}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Party Details */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Baby className="w-5 h-5 text-primary" />
                    Party Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Birthday Child Name</label>
                        <input
                            name="childName"
                            type="text"
                            required
                            defaultValue={initialData?.childName || initialData?.birthday_child_name}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                            placeholder="Child's Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Child's Age</label>
                        <input
                            name="childAge"
                            type="number"
                            required
                            min="1"
                            max="18"
                            defaultValue={initialData?.childAge || initialData?.birthday_child_age}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                            placeholder="Age"
                        />
                    </div>
                </div>
            </div>

            {/* Booking Details */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Booking Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="date"
                                type="date"
                                required
                                defaultValue={initialData?.date}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                name="time"
                                required
                                defaultValue={initialData?.time}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white text-slate-900"
                            >
                                <option value="">Select Time</option>
                                <option value="10:00:00">10:00 AM</option>
                                <option value="12:00:00">12:00 PM</option>
                                <option value="14:00:00">02:00 PM</option>
                                <option value="16:00:00">04:00 PM</option>
                                <option value="18:00:00">06:00 PM</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guests */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Guest Count
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Participants (Kids)</label>
                        <input
                            name="participants"
                            type="number"
                            required
                            min="10"
                            defaultValue={initialData?.participants || initialData?.kids}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                            placeholder="Min 10"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 10 participants required</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Spectators (Adults)</label>
                        <input
                            name="spectators"
                            type="number"
                            required
                            min="0"
                            defaultValue={initialData?.spectators || initialData?.adults}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                            placeholder="0"
                        />
                        <p className="text-xs text-slate-500 mt-1">First 10 spectators are free</p>
                    </div>
                </div>
            </div>

            {/* Package & Add-ons */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Package & Add-ons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Party Package</label>
                        <select
                            name="partyPackage"
                            defaultValue={initialData?.partyPackage || initialData?.party_package}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                        >
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="ULTIMATE">Ultimate</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
                        <select
                            name="theme"
                            defaultValue={initialData?.theme}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                        >
                            <option value="">No Theme</option>
                            <option value="NINJA">Ninja Warrior</option>
                            <option value="SPACE">Space Adventure</option>
                            <option value="JUNGLE">Jungle Safari</option>
                            <option value="PRINCESS">Princess Castle</option>
                            <option value="SUPERHERO">Superhero</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Add-ons</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="decorations" value="true" defaultChecked={initialData?.decorations} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm text-slate-700">Decorations</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="catering" value="true" defaultChecked={initialData?.catering} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm text-slate-700">Catering</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="cake" value="true" defaultChecked={initialData?.cake} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm text-slate-700">Cake</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="photographer" value="true" defaultChecked={initialData?.photographer} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm text-slate-700">Photographer</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="partyFavors" value="true" defaultChecked={initialData?.partyFavors || initialData?.party_favors} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <span className="text-sm text-slate-700">Party Favors</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Additional Information
                </h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests / Notes</label>
                    <textarea
                        name="specialRequests"
                        rows={3}
                        defaultValue={initialData?.specialRequests || initialData?.special_requests}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                        placeholder="Any dietary requirements, decorations, etc."
                    ></textarea>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Booking" : "Create Party Booking")}
                </button>
            </div>
        </form>
    );
}
