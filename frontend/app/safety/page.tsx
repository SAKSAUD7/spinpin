"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function Safety() {
    const rules = [
        {
            title: "General Rules",
            items: [
                "Safety briefing is mandatory before entering the play area.",
                "Ninja Grip Socks must be worn at all times. No shoes or bare feet.",
                "Remove all jewelry, watches, keys, and sharp objects.",
                "No phones or cameras allowed on the equipment.",
                "No food, drink, or chewing gum in the play zones.",
                "Do not participate if you are pregnant or have health issues."
            ]
        },
        {
            title: "Play Etiquette",
            items: [
                "No pushing, racing, or dangerous stunts.",
                "One person at a time on slides and climbing walls.",
                "Always slide feet first. No headfirst diving.",
                "Move in one direction on obstacle courses.",
                "Be aware of others around you, especially smaller children.",
                "Follow all instructions given by the Ninja Marshals."
            ]
        }
    ];

    return (
        <main className="bg-background min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative text-center mb-16 py-12 px-6 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/images/uploads/img-8.jpg"
                            alt="Safety First"
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center p-6 bg-red-500/20 backdrop-blur-md rounded-full mb-8 relative z-10"
                    >
                        <Shield className="h-16 w-16 text-red-400" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative z-10"
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-black mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                                Safety First
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 leading-relaxed">
                            Your safety is our top priority. Please read and follow these guidelines to ensure a fun and safe experience for everyone.
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-12">
                    {rules.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-surface-800/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 shadow-lg border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center border-b border-white/10 pb-4">
                                <Info className="h-6 w-6 text-primary mr-3" />
                                {section.title}
                            </h2>
                            <ul className="space-y-6">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0 mt-0.5" />
                                        <span className="text-white/80 text-lg font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-yellow-500/10 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-yellow-500/30 flex flex-col md:flex-row items-start gap-6"
                    >
                        <div className="bg-yellow-500/20 p-4 rounded-full flex-shrink-0">
                            <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-3">Parental Supervision</h3>
                            <p className="text-white/80 text-lg leading-relaxed">
                                Ninja Inflatable Park staff (Marshals) are present to supervise and ensure safety. However,
                                <span className="font-bold text-yellow-300"> parents/guardians are responsible for supervising their children at all times.</span>
                                Failure to follow safety rules may result in removal from the park without refund.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
