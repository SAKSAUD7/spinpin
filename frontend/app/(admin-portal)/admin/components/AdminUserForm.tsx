"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser, updateAdminUser, deleteAdminUser } from "@/app/actions/users";
import { Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Role {
    id: string;
    name: string;
    description: string | null;
}

interface AdminUser {
    id: string;
    name: string;
    email: string;
    roleId: string | null;
    isActive: boolean;
}

interface AdminUserFormProps {
    user?: AdminUser;
    roles: Role[];
    isNew?: boolean;
}

export function AdminUserForm({ user, roles, isNew = false }: AdminUserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            roleId: formData.get("roleId") as string,
            password: formData.get("password") as string,
            isActive: formData.get("isActive") === "on"
        };

        try {
            if (isNew) {
                if (!data.password) throw new Error("Password is required for new users");
                await createAdminUser({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    roleId: data.roleId
                });
            } else {
                if (!user) return;
                await updateAdminUser(user.id, {
                    name: data.name,
                    email: data.email,
                    role: data.roleId, // Map roleId to role for backend
                    isActive: data.isActive,
                    password: data.password || undefined // Only send if provided
                });
            }
            router.push("/admin/users");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteAdminUser(user.id);
            router.push("/admin/users");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to delete user");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">User Details</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                defaultValue={user?.name}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={user?.email}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select
                            name="roleId"
                            defaultValue={user?.roleId || ""}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900"
                        >
                            <option value="" disabled>Select a role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name} - {role.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isNew && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900"
                            />
                            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                        </div>
                    )}

                    {!isNew && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                defaultChecked={user?.isActive}
                                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                Active Account
                            </label>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    {!isNew && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={18} />
                            Delete User
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <Link
                            href="/admin/users"
                            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isNew ? "Create User" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
