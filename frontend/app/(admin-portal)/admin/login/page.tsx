import { loginAdmin } from "@/app/actions/admin";
import { getAdminSession } from "../../../lib/admin-auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "./LoginForm";

export default async function AdminLoginPage() {
    const session = await getAdminSession();
    if (session) {
        redirect("/admin");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage Spin Pin</p>
                </div>

                <AdminLoginForm loginAction={loginAdmin as any} />

                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Protected System. Authorized Access Only.</p>
                </div>
            </div>
        </div>
    );
}
