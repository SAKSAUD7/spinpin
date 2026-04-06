"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginForm({ loginAction }: { loginAction: any }) {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null); // Clear previous errors
        setLoading(true);
        try {
            const result = await loginAction(formData);
            if (result && result.error) {
                setError(result.error);
                setLoading(false);
            }
            // If successful, Next.js redirect keeps loading=true until page changes
        } catch (e) {
            setError("Failed to connect to login server");
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                    {error}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="admin@spinpin.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-60"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}
