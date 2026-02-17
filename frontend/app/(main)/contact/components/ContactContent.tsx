"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal, SectionDivider, BouncyButton } from "@repo/ui";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";

interface ContactContentProps {
    settings?: any;
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    form?: {
        title: string;
        subtitle?: string;
    };
    defaultConfig?: any;
}

export default function ContactContent({ settings, hero, form, defaultConfig }: ContactContentProps) {
    // ... existing state ...
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        // ... existing submit logic ...
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { createContactMessage } = await import("@/app/actions/contact-messages");
            const { toast } = await import("sonner");

            const result = await createContactMessage(formData);

            if (result.success) {
                toast.success("Message sent! We'll get back to you soon.");
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                toast.error(result.error || "Failed to send message");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const phone = settings?.contact_phone || defaultConfig?.contact?.phone || "+91 98454 71611";
    // ... existing consts ...
    const email = settings?.contact_email || defaultConfig?.contact?.email || "info@ninjapark.com";
    const address = settings?.address || defaultConfig?.contact?.address || "Ramdoot House, First Floor - 2/3 Navigation Street, Leicester, LE13UR";
    const mapUrl = settings?.map_url || defaultConfig?.contact?.mapUrl || "https://goo.gl/maps/xyz";
    const openingHours = typeof settings?.opening_hours === 'string' ? settings.opening_hours : "12:00 PM - 10:00 PM";

    const contactInfo = [
        // ... existing contactInfo array ...
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Call Us",
            value: phone,
            href: `tel:${phone}`,
            color: "primary",
        },
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Us",
            value: email,
            href: `mailto:${email}`,
            color: "secondary",
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Visit Us",
            value: address,
            href: mapUrl,
            color: "accent",
        },
    ];

    const heroTitle = hero?.title || "Contact Us";
    const heroSubtitle = hero?.subtitle || "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible!";
    const heroImage = hero?.image || "/images/uploads/img-7.jpg";

    const formTitle = form?.title || "Send us a Message";
    const formSubtitle = form?.subtitle;

    return (
        <main className="min-h-screen bg-background text-white pt-24">
            {/* Header */}
            <section className="relative py-16 md:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt="Contact Us"
                        className="w-full h-full object-cover opacity-30"
                        onError={(e) => {
                            e.currentTarget.src = "/hero-background.jpg";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <ScrollReveal animation="fade">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary text-black font-bold text-sm mb-6 tracking-wider uppercase">
                            <MessageCircle className="w-4 h-4 inline mr-1" />
                            Get in Touch
                        </span>
                    </ScrollReveal>
                    <ScrollReveal animation="slideUp" delay={0.2}>
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-black mb-6 leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                {heroTitle}
                            </span>
                        </h1>
                        <p className="text-base md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto">
                            {heroSubtitle}
                        </p>
                    </ScrollReveal>
                </div>
                <SectionDivider position="bottom" variant="wave" color="fill-background" />
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 md:py-20 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {contactInfo.map((info, index) => (
                            <ScrollReveal key={info.title} animation="slideUp" delay={index * 0.1}>
                                <motion.a
                                    href={info.href}
                                    target={info.title === "Visit Us" ? "_blank" : undefined}
                                    rel={info.title === "Visit Us" ? "noopener noreferrer" : undefined}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className={`block p-8 bg-surface-800/50 backdrop-blur-md rounded-3xl border-2 border-${info.color}/30 hover:border-${info.color} transition-all h-full`}
                                >
                                    <div className={`w-14 h-14 rounded-full bg-${info.color}/20 flex items-center justify-center mb-4 text-${info.color}`}>
                                        {info.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-white">{info.title}</h3>
                                    <p className={`text-${info.color} font-semibold break-words`}>{info.value}</p>
                                </motion.a>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Form and Map Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <ScrollReveal animation="slideLeft">
                            <div id="contactForm" className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-primary/30">
                                <h2 className="text-3xl font-display font-black mb-6 text-primary">
                                    {formTitle}
                                </h2>
                                {formSubtitle && (
                                    <p className="text-white/70 mb-6">{formSubtitle}</p>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* ... existing form inputs ... */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder:text-white/40"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder:text-white/40"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder:text-white/40"
                                            placeholder="9845471611"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-white/80">
                                            Message
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-3 bg-background-dark border-2 border-surface-700 rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder:text-white/40 resize-none"
                                            placeholder="Tell us how we can help..."
                                            required
                                        />
                                    </div>
                                    <div className="w-full">
                                        <BouncyButton type="submit" variant="primary" className="w-full" size="lg" disabled={isSubmitting}>
                                            <div className="flex items-center justify-center">
                                                {isSubmitting ? (
                                                    <span>Sending...</span>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5 mr-2" />
                                                        Send Message
                                                    </>
                                                )}
                                            </div>
                                        </BouncyButton>
                                    </div>
                                </form>
                            </div>
                        </ScrollReveal>

                        {/* Map and Hours */}
                        <div className="space-y-8">
                            {/* Map Placeholder */}
                            <ScrollReveal animation="slideRight">
                                <div className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-accent/30 h-64 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-12 h-12 text-accent mx-auto mb-3" />
                                        <p className="text-white/70">Find us easily</p>
                                        <a
                                            href={mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent hover:text-accent-light underline mt-2 inline-block"
                                        >
                                            View on Google Maps
                                        </a>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Operating Hours */}
                            <ScrollReveal animation="slideRight" delay={0.2}>
                                <div className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-secondary/30">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Clock className="w-6 h-6 text-secondary" />
                                        <h3 className="text-2xl font-display font-black text-secondary">
                                            Operating Hours
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0">
                                            <span className="text-white/80 font-semibold">Every Day</span>
                                            <span className="text-secondary font-bold">{openingHours}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-16 md:py-32 px-4 pb-32 md:pb-40 bg-background-light">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal animation="scale">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-6">
                            Ready to Visit?
                        </h2>
                        <p className="text-base md:text-xl text-white/70 mb-10">
                            Book your tickets online and skip the queue!
                        </p>
                        <div className="flex justify-center">
                            <Link href="/book">
                                <div className="w-full">
                                    <BouncyButton size="lg" variant="accent">
                                        Book Now
                                    </BouncyButton>
                                </div>
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
