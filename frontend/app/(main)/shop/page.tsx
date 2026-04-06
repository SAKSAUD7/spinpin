"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Filter, Package } from "lucide-react";
import { getMediaUrl } from "@/lib/media-utils";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category?: string;
    image_url?: string;
    imageUrl?: string;
    stock: number;
    active: boolean;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [cart, setCart] = useState<Record<number, number>>({});

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        fetch(`${API}/shop/products/`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setProducts(Array.isArray(data) ? data.filter((p: Product) => p.active) : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))];

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = selectedCategory === "All" || p.category === selectedCategory;
        return matchSearch && matchCat;
    });

    const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const removeFromCart = (id: number) => setCart(prev => {
        const next = { ...prev };
        if (next[id] > 1) next[id]--;
        else delete next[id];
        return next;
    });
    const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find(p => p.id === Number(id))?.price || 0) * qty, 0);
    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <main className="min-h-screen bg-[#0a0118]">
            {/* Hero */}
            <section className="relative pt-28 pb-16 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent" />
                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="inline-block mb-4 bg-yellow-400 text-black font-black text-sm px-6 py-2 rounded-full uppercase tracking-wider">
                        Spin Pin Shop
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        Merch & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">Accessories</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        Take home a piece of the fun — SpinPin branded gear, accessories and more
                    </p>
                </div>
            </section>

            {/* Shop Content */}
            <section className="pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Search + Filter + Cart */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                            ? "bg-primary text-black"
                                            : "bg-white/5 text-white/60 hover:bg-white/10"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {cartCount > 0 && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-3 rounded-xl font-bold whitespace-nowrap">
                                <ShoppingCart className="w-4 h-4" />
                                {cartCount} item{cartCount > 1 ? "s" : ""} · £{cartTotal.toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="text-center text-white/60 py-20">Loading products...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50 text-xl font-bold">No products found</p>
                            <p className="text-white/30 mt-2">Check back soon — we're adding new items regularly!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(product => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all group"
                                >
                                    <div className="relative h-52 bg-white/5">
                                        {product.image_url || product.imageUrl ? (
                                            <img
                                                src={getMediaUrl(product.image_url || product.imageUrl || "")}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
                                            </div>
                                        )}
                                        {product.category && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-black/60 text-white/80 text-xs font-semibold px-2 py-1 rounded-full">{product.category}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                                        <p className="text-white/50 text-sm mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-primary">£{Number(product.price).toFixed(2)}</span>
                                            {product.stock > 0 ? (
                                                cart[product.id] ? (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">-</button>
                                                        <span className="text-white font-bold w-4 text-center">{cart[product.id]}</span>
                                                        <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded-full bg-primary text-black font-bold hover:bg-primary/90 transition-colors">+</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(product.id)}
                                                        className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:scale-105 transition-all"
                                                    >
                                                        <ShoppingCart className="w-3.5 h-3.5" />
                                                        Add
                                                    </button>
                                                )
                                            ) : (
                                                <span className="text-red-400 text-sm font-bold">Sold Out</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Cart Summary */}
                    {cartCount > 0 && (
                        <div className="mt-10 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-bold text-lg">{cartCount} item{cartCount > 1 ? "s" : ""} in cart</p>
                                <p className="text-white/60">Total: <span className="text-white font-black text-xl">£{cartTotal.toFixed(2)}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/contact" className="px-6 py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                    Enquire In-Store
                                </Link>
                                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-all">
                                    Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
