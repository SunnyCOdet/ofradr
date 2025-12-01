"use client"
import React, { useRef } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import Plasma from '../../components/Plasma'
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react"
import Link from 'next/link'

function PrivacyContent() {
    const lenis = useLenis();
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    const scrollToSection = (direction: 'up' | 'down') => {
        if (!lenis) return;

        const currentScroll = window.scrollY;
        const positions = sectionRefs.current
            .filter((ref): ref is HTMLElement => ref !== null)
            .map(ref => ref.offsetTop);

        let targetIndex = -1;
        const tolerance = 10;

        if (direction === 'down') {
            targetIndex = positions.findIndex(pos => pos > currentScroll + tolerance);
        } else {
            for (let i = positions.length - 1; i >= 0; i--) {
                if (positions[i] < currentScroll - tolerance) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1 && currentScroll > 0) {
                targetIndex = 0;
            }
        }

        if (targetIndex !== -1 && targetIndex < positions.length) {
            lenis.scrollTo(positions[targetIndex], { duration: 1.5 });
        }
    };

    return (
        <div className='relative flex flex-col min-h-screen overflow-x-hidden text-white font-sans selection:bg-blue-500/30'>
            <Link href="/" className="fixed top-8 left-8 z-50 text-white hover:text-[#ea3a59] transition-colors">
                <ArrowLeft size={32} />
            </Link>
            <div className="fixed inset-0 -z-10 bg-black">
                <Plasma
                    color="#0066ff"
                    speed={0.4}
                    scale={2.5}
                    opacity={0.5}
                />
            </div>

            {/* Navigation Buttons */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                <button
                    onClick={() => scrollToSection('up')}
                    className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white group"
                    aria-label="Scroll Up"
                >
                    <ChevronUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button
                    onClick={() => scrollToSection('down')}
                    className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white group"
                    aria-label="Scroll Down"
                >
                    <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
            </div>

            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="mb-12">
                    <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors mb-8 inline-block">
                        ← Return to Home
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-white/60">
                        Data Collection & Usage Practices
                    </p>
                </div>

                <div className="space-y-24">
                    {/* Article 1 */}
                    <section ref={(el) => { sectionRefs.current[0] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">1. Information We Collect</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We collect information you provide directly to us, such as when you create an account, use our interactive features, or communicate with us. This may include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Account credentials (email, username)</li>
                                <li>Usage data and interaction logs</li>
                                <li>Device information and IP address</li>
                            </ul>
                        </div>
                    </section>

                    {/* Article 2 */}
                    <section ref={(el) => { sectionRefs.current[1] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">2. How We Use Your Data</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We use the collected information to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Monitor and analyze trends, usage, and activities</li>
                                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                                <li>Personalize and improve the Service and provide content or features that match user profiles or interests</li>
                            </ul>
                        </div>
                    </section>

                    {/* Article 3 */}
                    <section ref={(el) => { sectionRefs.current[2] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">3. Data Sharing & Disclosure</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We do not share your personal information with third parties except as described in this policy. We may share your information with:
                            </p>
                            <p>
                                <strong>Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                            </p>
                            <p>
                                <strong>Legal Requirements:</strong> We may disclose your information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.
                            </p>
                        </div>
                    </section>

                    {/* Article 4 */}
                    <section ref={(el) => { sectionRefs.current[3] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">4. Data Retention</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law.
                            </p>
                        </div>
                    </section>

                    {/* Article 5 */}
                    <section ref={(el) => { sectionRefs.current[4] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">5. Your Rights</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                Depending on your location, you may have rights regarding your personal information, including the right to access, correct, delete, or restrict use of your personal data.
                            </p>
                            <p className="text-blue-200/80 border-l-2 border-blue-500/50 pl-4">
                                To exercise these rights, please contact us at privacy@ofradr.com.
                            </p>
                        </div>
                    </section>

                    {/* Article 6 */}
                    <section ref={(el) => { sectionRefs.current[5] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">6. Security</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                            </p>
                        </div>
                    </section>

                    {/* Article 7 */}
                    <section ref={(el) => { sectionRefs.current[6] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">7. Cookies & Tracking</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            </p>
                        </div>
                    </section>

                    {/* Article 8 */}
                    <section ref={(el) => { sectionRefs.current[7] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">8. International Transfers</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                            </p>
                        </div>
                    </section>

                    {/* Article 9 */}
                    <section ref={(el) => { sectionRefs.current[8] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">9. Children's Privacy</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
                            </p>
                        </div>
                    </section>

                    {/* Article 10 */}
                    <section ref={(el) => { sectionRefs.current[9] = el; }} className="backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-semibold mb-6 text-blue-400">10. Changes to This Policy</h2>
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-24 pt-8 border-t border-white/10 text-center text-white/30 text-sm">
                    <p>&copy; {new Date().getFullYear()} Ofradr. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default function PrivacyPage() {
    return (
        <ReactLenis root>
            <PrivacyContent />
        </ReactLenis>
    )
}
