"use client";

import { useState } from "react";
import { ScrollReveal } from "@repo/ui";
import { FileText, HelpCircle, Shield, Lock, AlertCircle } from "lucide-react";

interface GuidelinesContentProps {
    hero?: {
        title: string;
        subtitle: string;
        image: string;
    };
    categories: any[];
    legalDocuments: any[];
    faqs: any[];
}

export default function GuidelinesContent({ hero, categories, legalDocuments, faqs }: GuidelinesContentProps) {
    const [activeTab, setActiveTab] = useState<string>("faqs");

    const tabs = [
        { id: "faqs", label: "FAQs", icon: HelpCircle, count: faqs?.length || 0 },
        { id: "terms", label: "Terms & Conditions", icon: FileText },
        { id: "privacy", label: "Privacy Policy", icon: Shield },
        { id: "rights", label: "Your Rights", icon: AlertCircle },
        { id: "security", label: "Security", icon: Lock },
    ];

    const getLegalDoc = (type: string) => {
        return legalDocuments?.find((doc: any) => doc.document_type === type.toUpperCase());
    };

    const termsDoc = getLegalDoc("terms");
    const privacyDoc = getLegalDoc("privacy");
    const rightsDoc = getLegalDoc("your_rights");
    const securityDoc = getLegalDoc("security");

    return (
        <main className="min-h-screen bg-background text-white">
            {/* Header */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 bg-gradient-to-b from-background-dark to-background">
                <div className="max-w-7xl mx-auto text-center">
                    <ScrollReveal animation="fade">
                        <span className="inline-block py-1 px-3 rounded-full bg-accent text-white font-bold text-sm mb-6 tracking-wider uppercase">
                            Information & Support
                        </span>
                    </ScrollReveal>
                    <ScrollReveal animation="slideUp" delay={0.2}>
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-black mb-6 leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                {hero?.title || "Guidelines & FAQs"}
                            </span>
                        </h1>
                        <p className="text-base md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto">
                            {hero?.subtitle || "Everything you need to know about Spin Pin Leicester"}
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Tabbed Content */}
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-semibold transition-all ${activeTab === tab.id
                                            ? "bg-primary text-black"
                                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-surface-800/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8">
                        {/* FAQs Tab */}
                        {activeTab === "faqs" && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
                                {faqs && faqs.length > 0 ? (
                                    <div className="space-y-4">
                                        {faqs.map((faq: any, index: number) => (
                                            <details key={faq.id || index} className="group bg-white/5 rounded-lg p-4 border border-white/10">
                                                <summary className="cursor-pointer font-semibold text-lg text-white hover:text-primary transition-colors flex items-center gap-2">
                                                    <span className="group-open:rotate-90 transition-transform">▶</span>
                                                    {faq.question}
                                                </summary>
                                                <p className="mt-3 ml-6 text-white/70 whitespace-pre-line">
                                                    {faq.answer}
                                                </p>
                                            </details>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/60">No FAQs available at the moment.</p>
                                )}
                            </div>
                        )}

                        {/* Terms Tab */}
                        {activeTab === "terms" && (
                            <div>
                                <h2 className="text-3xl font-bold mb-4 text-white">
                                    {termsDoc?.title || "Terms & Conditions"}
                                </h2>
                                {termsDoc?.intro && (
                                    <p className="text-white/70 mb-6 italic">{termsDoc.intro}</p>
                                )}
                                {termsDoc?.sections && termsDoc.sections.length > 0 ? (
                                    <div className="space-y-6">
                                        {termsDoc.sections.map((section: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="text-xl font-bold text-primary mb-3">{section.title}</h3>
                                                <div className="text-white/70 whitespace-pre-line pl-4 border-l-2 border-primary/30">
                                                    {section.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/60">Terms & Conditions not available.</p>
                                )}
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === "privacy" && (
                            <div>
                                <h2 className="text-3xl font-bold mb-4 text-white">
                                    {privacyDoc?.title || "Privacy Policy"}
                                </h2>
                                {privacyDoc?.intro && (
                                    <p className="text-white/70 mb-6 italic">{privacyDoc.intro}</p>
                                )}
                                {privacyDoc?.sections && privacyDoc.sections.length > 0 ? (
                                    <div className="space-y-6">
                                        {privacyDoc.sections.map((section: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="text-xl font-bold text-secondary mb-3">{section.title}</h3>
                                                <div className="text-white/70 whitespace-pre-line pl-4 border-l-2 border-secondary/30">
                                                    {section.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/60">Privacy Policy not available.</p>
                                )}
                            </div>
                        )}

                        {/* Your Rights Tab */}
                        {activeTab === "rights" && (
                            <div>
                                <h2 className="text-3xl font-bold mb-4 text-white">
                                    {rightsDoc?.title || "Your Rights"}
                                </h2>
                                {rightsDoc?.intro && (
                                    <p className="text-white/70 mb-6 italic">{rightsDoc.intro}</p>
                                )}
                                {rightsDoc?.sections && rightsDoc.sections.length > 0 ? (
                                    <div className="space-y-6">
                                        {rightsDoc.sections.map((section: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="text-xl font-bold text-accent mb-3">{section.title}</h3>
                                                <div className="text-white/70 whitespace-pre-line pl-4 border-l-2 border-accent/30">
                                                    {section.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/60">Your Rights information not available.</p>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div>
                                <h2 className="text-3xl font-bold mb-4 text-white">
                                    {securityDoc?.title || "Security"}
                                </h2>
                                {securityDoc?.intro && (
                                    <p className="text-white/70 mb-6 italic">{securityDoc.intro}</p>
                                )}
                                {securityDoc?.sections && securityDoc.sections.length > 0 ? (
                                    <div className="space-y-6">
                                        {securityDoc.sections.map((section: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="text-xl font-bold text-primary mb-3">{section.title}</h3>
                                                <div className="text-white/70 whitespace-pre-line pl-4 border-l-2 border-primary/30">
                                                    {section.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/60">Security information not available.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
