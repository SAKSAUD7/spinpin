"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Package } from "lucide-react";

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "", description: "", price: "", category: "",
        stock: "0", image_url: "", active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const res = await fetch(`${API}/shop/products/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }),
            });
            if (res.ok) {
                router.push("/admin/shop");
                router.refresh();
            } else {
                alert("Failed to create product. Please check all fields.");
            }
        } finally {
            setSaving(false);
        }
    };

    const setField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/admin/shop" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Shop
            </Link>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Package size={24} /></div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
                    <p className="text-slate-500 text-sm">Add a new product to the SpinPin shop</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                    <input type="text" required value={form.name} onChange={e => setField("name", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g. SpinPin Tote Bag" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setField("description", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Describe the product..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (£) *</label>
                        <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setField("price", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="9.99" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                        <input type="number" min="0" value={form.stock} onChange={e => setField("stock", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                    <input type="text" value={form.category} onChange={e => setField("category", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="e.g. Clothing, Accessories, Tokens" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image URL</label>
                    <input type="url" value={form.image_url} onChange={e => setField("image_url", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="active" checked={form.active} onChange={e => setField("active", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label htmlFor="active" className="text-sm font-semibold text-slate-700">Active (visible in shop)</label>
                </div>
                <div className="flex gap-3 pt-2">
                    <Link href="/admin/shop" className="flex-1 text-center px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</Link>
                    <button type="submit" disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold disabled:opacity-50 transition-colors">
                        <Save size={18} />
                        {saving ? "Saving..." : "Add Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
