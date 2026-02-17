import { ScrollReveal } from "@repo/ui";
import { Shield, AlertTriangle, FileText } from "lucide-react";

export default function WaiverTermsPage() {
    return (
        <main className="min-h-screen bg-background py-20">
            <div className="max-w-4xl mx-auto px-4">
                <ScrollReveal animation="slideUp">
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Liability Waiver & Terms
                            </span>
                        </h1>
                        <p className="text-xl text-white/70">
                            Please read carefully before participating
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal animation="slideUp">
                    <div className="bg-surface-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-8">
                        {/* Important Notice */}
                        <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-accent mb-2">Important Notice</h3>
                                    <p className="text-white/80 text-sm">
                                        By signing this waiver, you acknowledge that you have read, understood, and agree to all terms and conditions outlined below.
                                        This waiver applies to all participants, including minors for whom you are the legal guardian.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Terms Content */}
                        <div className="prose prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6" />
                                    1. Assumption of Risk
                                </h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I understand and acknowledge that participation in activities at Ninja Inflatable Park involves inherent risks, including but not limited to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Physical injury from jumping, bouncing, and other inflatable activities</li>
                                        <li>Collisions with other participants or equipment</li>
                                        <li>Falls, slips, and trips</li>
                                        <li>Sprains, strains, fractures, or other bodily injuries</li>
                                    </ul>
                                    <p>
                                        I voluntarily assume all risks associated with participation in these activities.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">2. Release of Liability</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I hereby release, waive, discharge, and covenant not to sue Ninja Inflatable Park, its owners, operators, employees, agents, and affiliates from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury, including death, that may be sustained by me or any property belonging to me, while participating in such activities.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">3. Medical Conditions</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I certify that I (and any minors for whom I am signing) am physically fit and have no medical conditions that would prevent safe participation in inflatable activities. I agree to immediately inform staff of any medical conditions, injuries, or concerns.
                                    </p>
                                    <p className="font-medium text-accent">
                                        Participants with the following conditions should not participate without medical clearance:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Heart conditions or high blood pressure</li>
                                        <li>Pregnancy</li>
                                        <li>Recent surgeries or injuries</li>
                                        <li>Neck, back, or joint problems</li>
                                        <li>Epilepsy or seizure disorders</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">4. Rules and Regulations</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I agree to follow all posted rules, safety guidelines, and instructions from Ninja Inflatable Park staff. I understand that failure to comply may result in immediate removal from the facility without refund.
                                    </p>
                                    <p className="font-medium">Safety rules include but are not limited to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>No shoes, sharp objects, or jewelry on inflatables</li>
                                        <li>No food or drinks on inflatable equipment</li>
                                        <li>No rough play, pushing, or dangerous behavior</li>
                                        <li>Follow age and height restrictions</li>
                                        <li>Supervise children at all times</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">5. Parental/Guardian Consent</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        For participants under 18 years of age, I certify that I am the parent or legal guardian and have the authority to sign this waiver on their behalf. I agree to supervise minors and ensure they follow all safety rules.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">6. Photo/Video Release</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I grant Ninja Inflatable Park permission to use photographs or videos taken during my visit for promotional purposes, including social media, website, and marketing materials.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">7. Emergency Medical Treatment</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I authorize Ninja Inflatable Park staff to seek emergency medical treatment if necessary. I agree to be financially responsible for any medical costs incurred.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">8. Severability</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        If any provision of this waiver is found to be unenforceable, the remaining provisions shall remain in full force and effect.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">9. Acknowledgment</h2>
                                <div className="text-white/70 space-y-3">
                                    <p>
                                        I have read this waiver of liability, assumption of risk, and indemnity agreement, fully understand its terms, and understand that I am giving up substantial rights, including my right to sue. I acknowledge that I am signing this agreement freely and voluntarily, and intend my signature to be a complete and unconditional release of all liability to the greatest extent allowed by law.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-primary mb-3">Questions or Concerns?</h3>
                            <p className="text-white/80 text-sm mb-4">
                                If you have any questions about this waiver or our safety procedures, please contact us:
                            </p>
                            <div className="text-white/70 text-sm space-y-1">
                                <p><strong>Phone:</strong> +91 98454 71611</p>
                                <p><strong>Email:</strong> info@ninjainflatablepark.com</p>
                                <p><strong>Address:</strong> Ninja Inflatable Park, Bangalore</p>
                            </div>
                        </div>

                        {/* Version Info */}
                        <div className="text-center text-white/50 text-sm">
                            <p>Waiver Version 1.0 | Last Updated: December 2025</p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </main>
    );
}
