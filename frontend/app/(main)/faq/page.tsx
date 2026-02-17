"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What should I wear to Ninja Park?",
            answer: "Wear comfortable athletic clothing that allows free movement. We provide special Ninja Grip Socks (included in your ticket) which are mandatory. Please remove all jewelry, watches, and sharp objects before entering the play area."
        },
        {
            question: "What is the age limit?",
            answer: "We welcome ninjas of all ages! Children aged 1-7 years can enjoy our Little Ninjas package, while those 7 years and above can access all zones with the Ninja Warrior package. Children under 7 must be supervised by an adult at all times."
        },
        {
            question: "How long is a session?",
            answer: "Each session is 60 minutes of play time. You can extend your session for an additional hour for ₹500 per person, subject to availability. We recommend arriving 15 minutes early for check-in and safety briefing."
        },
        {
            question: "Can I bring my own food?",
            answer: "Outside food and beverages are not permitted in the park, except for birthday cakes for party bookings. We have a fully-stocked Ninja Cafe with delicious snacks, meals, and drinks available for purchase."
        },
        {
            question: "Do you offer birthday party packages?",
            answer: "Yes! Our party packages include 75 minutes of play time plus 45 minutes in a private party room. Parties are available Thursday through Sunday and require a minimum of 10 guests. A 50% non-refundable deposit is required to book."
        },
        {
            question: "What are your opening hours?",
            answer: "We're open Tuesday through Sunday from 12:00 PM to 9:00 PM. We're closed on Mondays for maintenance and deep cleaning to ensure the best experience for our guests."
        },
        {
            question: "Is parking available?",
            answer: "Yes, we have ample free parking available for all guests. The first 2 hours are complimentary, and we have designated spots for families and accessible parking."
        },
        {
            question: "What safety measures do you have?",
            answer: "Safety is our top priority. We have trained Ninja Marshals supervising all zones, mandatory safety briefings, 24/7 CCTV coverage, first aid staff on-site, and regular equipment inspections. All participants must sign a waiver before entering."
        },
        {
            question: "Can I book online?",
            answer: "Yes! You can book your session online through our website. We recommend booking in advance, especially for weekends and holidays, to guarantee your preferred time slot."
        },
        {
            question: "What is your cancellation policy?",
            answer: "Regular session bookings can be rescheduled up to 24 hours before your session time. For party bookings, one date change is allowed with at least 2 weeks notice. Rescheduling within 2 weeks incurs a ₹1,000 admin fee."
        },
        {
            question: "Do you have facilities for spectators?",
            answer: "Absolutely! Spectators can purchase entry for ₹150 + GST, which includes access to our cafe, free Wi-Fi, comfortable seating areas, and the ability to watch their loved ones have fun. We also have baby care facilities and lockers available."
        },
        {
            question: "Are there any health restrictions?",
            answer: "Participants should not have any serious health conditions, injuries, or be pregnant. If you have any concerns about your ability to participate safely, please consult with our staff before booking. We reserve the right to refuse entry if we believe participation poses a safety risk."
        }
    ];

    return (
        <main className="bg-background min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative text-center mb-16 py-12 px-6 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/images/uploads/img-7.jpg"
                            alt="FAQ"
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-black mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Frequently Asked Questions
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 leading-relaxed">
                            Got questions? We've got answers! Find everything you need to know about visiting Ninja Park.
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-surface-800/50 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-white/10 hover:border-primary/30"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg font-bold text-white pr-8">{faq.question}</span>
                                <ChevronDown
                                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "transform rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: openIndex === index ? "auto" : 0,
                                    opacity: openIndex === index ? 1 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-8 pb-6 text-white/70 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center bg-surface-800/50 backdrop-blur-md rounded-[3rem] p-12 shadow-xl border border-primary/20"
                >
                    <h2 className="text-3xl font-display font-black text-white mb-4">
                        Still Have Questions?
                    </h2>
                    <p className="text-lg text-white/70 mb-8">
                        Our friendly team is here to help! Give us a call or send us a message.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="/contact"
                            className="inline-block bg-primary hover:bg-primary/90 text-black font-bold py-4 px-10 rounded-full shadow-lg transition-colors uppercase tracking-wide"
                        >
                            Contact Us
                        </a>
                        <a
                            href="tel:+919845471611"
                            className="inline-block bg-surface-700 border-2 border-white/20 hover:border-primary text-white hover:text-primary font-bold py-4 px-10 rounded-full transition-colors uppercase tracking-wide"
                        >
                            Call +91 98454 71611
                        </a>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
