"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket } from "lucide-react";
import { useUI } from "../../state/ui/uiContext";
import { BouncyButton } from "../../components/BouncyButton";
import { useEffect, useState } from "react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/attractions", label: "Attractions" },
    { href: "/parties", label: "Parties" },
    { href: "/pricing", label: "Pricing" },
    { href: "/guidelines", label: "Guidelines" },
    { href: "/contact", label: "Contact" },
];

export function Navbar({ settings }: { settings?: any }) {
    const pathname = usePathname();
    const { state, dispatch } = useUI();
    const { isMobileMenuOpen } = state;
    const phone = settings?.contactPhone || "07349110865";
    const [logoUrl, setLogoUrl] = useState("/spinpin-logo.png");

    useEffect(() => {
        // Fetch dynamic logo on mount
        const fetchLogo = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/core/logos/active/`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.image_url) {
                        setLogoUrl(data.image_url);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch logo:", error);
            }
        };
        fetchLogo();
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            window.history.pushState({ menuOpen: true }, "", window.location.href);

            const handlePopState = () => {
                dispatch({ type: "CLOSE_MOBILE_MENU" });
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                document.body.style.overflow = 'auto';
                window.removeEventListener("popstate", handlePopState);
            };
        } else {
            // Always ensure overflow is reset when menu closes
            document.body.style.overflow = 'auto';
        }
    }, [isMobileMenuOpen, dispatch]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0118] border-b border-white/10">
            <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="relative z-50 block flex-shrink-0">
                    <img
                        src={logoUrl}
                        alt="Spin Pin"
                        className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
                        style={{ background: 'transparent' }}
                    />
                </Link>


                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-white/80"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/book">
                        <BouncyButton size="sm" variant="accent" as="div">
                            Book Now <Ticket className="w-4 h-4 ml-2" />
                        </BouncyButton>
                    </Link>
                    <Link href="/admin">
                        <BouncyButton size="sm" variant="outline" className="text-white border-white" as="div">
                            Admin
                        </BouncyButton>
                    </Link>
                </nav>

                <div className="md:hidden flex items-center gap-2 relative z-50">
                    <Link href="/book">
                        <BouncyButton size="sm" variant="accent" className="text-xs px-3 py-1.5" as="div">
                            Book
                        </BouncyButton>
                    </Link>
                    <button className="text-white" onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}>
                        {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Backdrop - tap to close */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[60] md:hidden"
                                style={{
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                }}
                                onClick={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}
                            />

                            {/* Menu Panel */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="fixed top-0 right-0 bottom-0 w-[280px] z-[70] md:hidden bg-[#261645] shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="h-full flex flex-col p-5">
                                    {/* Close Button */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Menu</span>
                                        <button
                                            onClick={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                            aria-label="Close menu"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    {/* Navigation Links */}
                                    <nav className="flex-1 space-y-2">
                                        {navLinks.map((link) => {
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}
                                                    className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive
                                                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                                        : "text-white/90 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        })}

                                        {/* Action Buttons - Inline with navigation */}
                                        <div className="pt-2 space-y-2">
                                            <Link href="/book" onClick={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}>
                                                <div className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold text-sm transition-all text-center shadow-md">
                                                    Book Session
                                                </div>
                                            </Link>

                                            <Link href="/admin" onClick={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}>
                                                <div className="w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors text-center">
                                                    Admin
                                                </div>
                                            </Link>
                                        </div>
                                    </nav>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
