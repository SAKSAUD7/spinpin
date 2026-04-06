"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Package, Trash2 } from "lucide-react";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "", description: "", price: "", category: "",
        stock: "0", image_url: "", active: true,
    });

    useEffect(() => {
        if (!id) return;
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        fetch(`${API}/shop/products/${id}/`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setForm({
                    name: data.name || "",
                    description: data.description || "",
                    price: String(data.price || ""),
                    category: data.category || "",
                    stock: String(data.stock || "0"),
                    image_url: data.image_url || data.imageUrl || "",
                    active: data.active ?? true,
                });
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const res = await fetch(`${API}/shop/products/${id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }),
            });
            if (res.ok) {
                router.push("/admin/shop");
                router.refresh();
            } else {
                alert("Failed to update product.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this product permanently?")) return;
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${API}/shop/products/${id}/`, { method: "DELETE" });
        if (res.ok) {
            router.push("/admin/shop");
            router.refresh();
        }
    };

    const setField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    if (loading) return <div className="p-8 text-slate-600">Loading product...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/admin/shop" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Shop
            </Link>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Package size={24} /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
                        <p className="text-slate-500 text-sm">Update product details</p>
                    </div>
                </div>
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                    <Trash2 size={16} /> Delete
                </button>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                    <input type="text" required value={form.name} onChange={e => setField("name", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setField("description", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (£) *</label>
                        <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setField("price", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" />
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
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image URL</label>
                    <input type="url" value={form.image_url} onChange={e => setField("image_url", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary" />
                    {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />}
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
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
