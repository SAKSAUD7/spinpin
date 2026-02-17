import { getProducts } from "@/app/actions/cms";
import { getAdminSession } from "../../../lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package, DollarSign, Eye, EyeOff } from "lucide-react";
import { ProductActions } from "../components/ProductActions";

export default async function ShopPage() {
    const session = await getAdminSession();
    if (!session) redirect("/admin/login");

    const products = await getProducts();

    const stats = {
        total: products.length,
        active: products.filter((p: any) => p.active).length,
        totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0)
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
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Products</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Products</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Inventory Value</p>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                                {product.active ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                                    {product.category && (
                                        <p className="text-xs text-slate-500">{product.category}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-700">Stock: {product.stock}</p>
                                    {product.stock === 0 && (
                                        <p className="text-xs text-red-600 font-bold">Out of Stock</p>
                                    )}
                                </div>
                            </div>
                            <ProductActions product={product} />
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No products found. Add your first product to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
