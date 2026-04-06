import { getAdminSession } from "../../../lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package, DollarSign, Eye } from "lucide-react";
import { ProductActions } from "../components/ProductActions";

async function getProducts(): Promise<any[]> {
    try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${API}/shop/products/`, { cache: "no-store" });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export default async function ShopPage() {
    const session = await getAdminSession();
    if (!session) redirect("/admin/login");

    const products = await getProducts();

    const stats = {
        total: products.length,
        active: products.filter((p: any) => p.active).length,
        totalValue: products.reduce((sum: number, p: any) => sum + (parseFloat(p.price) * parseInt(p.stock || 0)), 0)
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Shop Products</h1>
                    <p className="text-slate-500 mt-1">Manage products available for purchase</p>
                </div>
                <Link
                    href="/admin/shop/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Package size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Products</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Eye size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Products</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><DollarSign size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Inventory Value</p>
                            <p className="text-2xl font-bold text-slate-900">£{stats.totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {(product.image_url || product.imageUrl) && (
                            <img src={product.image_url || product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                    {product.active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-2xl font-bold text-primary">£{product.price}</p>
                                    {product.category && <p className="text-xs text-slate-500">{product.category}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-700">Stock: {product.stock}</p>
                                    {product.stock === 0 && <p className="text-xs text-red-600 font-bold">Out of Stock</p>}
                                </div>
                            </div>
                            <ProductActions product={product} />
                            <Link
                                href={`/admin/shop/${product.id}`}
                                className="block mt-2 text-center px-3 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Edit Product
                            </Link>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center py-16 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="font-medium text-lg">No products yet</p>
                        <p className="text-sm mt-1">Add your first product to get started</p>
                        <Link href="/admin/shop/new" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                            <Plus size={18} /> Add Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
