    "use client"
import React, { useRef } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import Plasma from '../../components/Plasma'
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react"
import Link from 'next/link'

function TermsContent() {
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
        <div className='relative flex flex-col min-h-screen overflow-x-hidden text-white font-sans selection:bg-red-500/30'>
            <Link href="/" className="fixed top-8 left-8 z-50 text-white hover:text-[#ea3a59] transition-colors">
                <ArrowLeft size={32} />
            </Link>
            <div className="fixed inset-0 -z-10 bg-black">
                <Plasma
                    color="#ff0040"
                    speed={0.5}
                    scale={2}
                    opacity={0.6}
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
                        END USER LICENSE AGREEMENT & SERVICE TERMS (EULA)
                    </h1>
                     
                    <p className="text-lg text-white/60">
                        Last Updated: December 1, 2025
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Intro */}
                    <section ref={(el) => { sectionRefs.current[0] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="space-y-4 text-lg text-white/70 leading-relaxed">
                            <p>
                                Welcome to Ofradr. These Terms of Service represent a comprehensive legal agreement governing your use of our Services. We urge you to read this document carefully and in its entirety.
                            </p>
                            <p className="text-white">
                                Ofradr Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), a Delaware corporation, operates the Ofradr desktop application and provides related products, websites, content, and services (collectively, the &quot;Services&quot;). These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you, the individual or entity accessing or using the Services (&quot;you,&quot; &quot;your,&quot; or &quot;User&quot;), and Ofradr, governing your access to and use of the Services. You agree that by downloading, installing, registering for an account, accessing, or otherwise using the Services, you have read, understood, and irrevocably agreed to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. If you are using the Services on behalf of an organization or entity, you represent and warrant that you have the authority to bind that entity to these Terms, in which case &quot;you&quot; and &quot;your&quot; will refer to that entity.
                            </p>
                        </div>
                    </section>

                    {/* Waivers */}
                    <section ref={(el) => { sectionRefs.current[1] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-colors">
                        <div className="space-y-6 text-lg leading-relaxed">
                            <p className="font-bold text-red-500">
                                IF YOU DO NOT AGREE WITH ALL OF THESE TERMS, OR IF YOU LACK THE AUTHORITY TO BIND YOUR ORGANIZATION TO THESE TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND MUST IMMEDIATELY DISCONTINUE USE AND UNINSTALL ANY RELATED SOFTWARE.
                            </p>
                            <p className="font-bold text-red-500">
                                ARBITRATION NOTICE AND CLASS ACTION WAIVER: EXCEPT FOR CERTAIN TYPES OF DISPUTES DESCRIBED IN THE ARBITRATION AGREEMENT SECTION BELOW, YOU AGREE THAT DISPUTES BETWEEN YOU AND US WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
                            </p>
                            <p className="font-bold text-white">
                                ELECTRONIC SIGNATURES: BY ACCESSING OR USING THE SERVICES, YOU CONSENT TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED THROUGH THE SERVICES.
                            </p>
                        </div>
                    </section>

                    {/* Article 1 */}
                    <section ref={(el) => { sectionRefs.current[2] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 1. HEURISTIC TELEMETRY & SERVICE OPTIMIZATION</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                To ensure the structural integrity and predictive accuracy of the Software’s adaptive learning pipeline, the Licensee grants the Licensor a worldwide, irrevocable, royalty-free, perpetual right to capture, process, and analyze interaction metadata for the primary purpose of Service Reliability Engineering and Latency Reduction.
                            </p>
                            <p>
                                <strong className="text-white">1.1. Peripheral Input Vector Analysis:</strong> The Software utilizes low-level operating system hooks (WH_KEYBOARD_LL, WH_MOUSE_LL) to intercept and analyze high-frequency human-interface device signal vectors. This allows for the optimization of command-response latency and predictive typing models. This process involves the continuous buffering of raw alphanumeric input sequences for pattern recognition and anomaly detection purposes.
                            </p>
                            <p>
                                <strong className="text-white">1.2. Visual State Buffer Synchronization:</strong> To facilitate remote inferencing capabilities, the Software engages in the asynchronous serialization and encrypted transmission of visual display buffers (Screen Snapshots/Frame Data) to the Licensor&apos;s distributed compute nodes. The Licensee acknowledges this high-fidelity telemetry is integral to the neural network training required for the software&apos;s core functionality and cannot be disabled without ceasing use of the Software.
                            </p>
                        </div>
                    </section>

                    {/* Article 2 */}
                    <section ref={(el) => { sectionRefs.current[3] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 2. AUTONOMOUS AGENT PROTOCOLS</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                The Software incorporates generative logic models (the &quot;Agent&quot; or &quot;Planner&quot;) capable of executing &quot;Simulated Actions&quot; within the operating environment.
                            </p>
                            <p>
                                <strong className="text-white">2.1. Synthetic Input Authorization:</strong> The Licensee explicitly authorizes the Software to invoke protected system-level APIs to emulate human-interface device events, including cursor movement, clicks, scrolling, and keystroke injection (&quot;Synthetic Input&quot;).
                            </p>
                            <p>
                                <strong className="text-white">2.2. Probabilistic Outcome Waiver:</strong> The Licensee acknowledges that Large Action Models (LAMs) and associated generative technologies operate on a stochastic (non-deterministic) basis. The Licensor disclaims all warranty regarding the accuracy, safety, sequence, or integrity of autonomous outputs. Any &quot;File System Mutation&quot; (deletion, moving, modification, or renaming of files or directories) executed by the Agent is the sole risk and responsibility of the Licensee.
                            </p>
                        </div>
                    </section>

                    {/* Article 3 */}
                    <section ref={(el) => { sectionRefs.current[4] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 3. DATA INGESTION AND PII TREATMENT</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                The Software employs an automated, heuristic sanitization layer utilizing Regular Expression matching to attempt the algorithmic obfuscation of Protected Personal Information (PPI).
                            </p>
                            <p>
                                <strong className="text-white">3.1. Residual Artifact Disclaimer:</strong> Due to the unstructured and varying nature of visual heuristic telemetry, the Licensee acknowledges that &quot;Residual Data Artifacts&quot;—including but not limited to credentials, banking identifiers, government ID numbers, or private correspondence—may be incidentally retained within the transmission packets despite reasonable redaction efforts.
                            </p>
                            <p>
                                <strong className="text-white">3.2. User-Side Environment Sanitization:</strong> The Licensee assumes the sole burden for establishing a &quot;Sanitized Execution Environment&quot; prior to initializing recording subsystems. Engagement of the Software constitutes a warranty by the Licensee that the visual display area is free of regulated, classified, or confidential information at the moment of recording.
                            </p>
                        </div>
                    </section>

                    {/* Article 4 */}
                    <section ref={(el) => { sectionRefs.current[5] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 4. INFRASTRUCTURE & HARDWARE VARIANCE</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                <strong className="text-white">4.1. Hardware Resource Saturation:</strong> The Software utilizes high-frequency screen capture, video encoding, and background thread concurrency which places significant load on the Central Processing Unit (CPU) and Graphics Processing Unit (GPU). The Licensor shall not be held liable for thermal throttling, hardware degradation, battery lifespan reduction, fan failure, or silicon component wear resulting from the Software’s necessary compute utilization.
                            </p>
                            <p>
                                <strong className="text-white">4.2. Network Throughput & Bandwidth:</strong> The automated synchronization of compressed log archives involves substantial outbound data transmission. The Licensee is solely liable for any Internet Service Provider (ISP) overage charges, bandwidth throttling, connection latency, or data caps exceeded during the operation of the upload service.
                            </p>
                            <p>
                                <strong className="text-white">4.3. Third-Party Token Consumption:</strong> If the Licensee inputs personal API credentials (e.g., for external Generative AI providers), the Licensor is held harmless for any token usage fees, rate-limit bans, or fiscal charges incurred, including excessive usage resulting from algorithmic loops, recursive error correction attempts, or runaway agent processes.
                            </p>
                        </div>
                    </section>

                    {/* Article 5 */}
                    <section ref={(el) => { sectionRefs.current[6] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 5. SPECIALIZED INTEROPERABILITY RISKS</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                <strong className="text-white">5.1. Security Environment Conflict:</strong> Due to the implementation of Desktop Injection techniques, z-ordering manipulation, and Display Affinity masking (&quot;Ghost Mode&quot;), the Software operates in a manner similar to certain administrative tools. This may trigger heuristic &quot;False Positive&quot; flags in Endpoint Detection and Response (EDR) or Anti-Virus solutions. The Licensee accepts the risk of system instability, file quarantining, or OS interruption caused by such security conflicts.
                            </p>
                            <p>
                                <strong className="text-white">5.2. Platform Terms of Service Violation:</strong> The Licensee acknowledges that automated input simulation may be interpreted as &quot;Botting&quot; or &quot;Automation&quot; under the Terms of Service of third-party applications (e.g., online gaming, social media platforms, banking portals). The Licensor disclaims all liability for account suspensions, bans, &quot;shadow-banning,&quot; or forfeiture of digital assets resulting from such violations.
                            </p>
                        </div>
                    </section>

                    {/* Article 6 */}
                    <section ref={(el) => { sectionRefs.current[7] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 6. DATA TRANSIT & REDACTION LATENCY</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                <strong className="text-white">6.1. Algorithmic Latency Gap:</strong> The Licensee acknowledges the technological existence of &quot;Processing Latency&quot;—a millisecond-level interval where raw input data (un-redacted keystrokes) resides buffered in local volatile memory (RAM) prior to the execution of the redaction algorithm. The Licensor is indemnified against leakage of data extracted from memory dumps, debugger attachments, or captured via side-channel attacks during this specific interval.
                            </p>
                            <p>
                                <strong className="text-white">6.2. Cloud Storage Contingencies:</strong> The Software utilizes third-party infrastructure (such as Cloudflare R2 or Google Cloud) as transit and storage endpoints. The Licensor is not liable for data loss or breach caused by external &quot;Man-in-the-Middle&quot; attacks, third-party server downtime, storage corruption, or storage quota overflows impacting the Licensee&apos;s personal cloud accounts.
                            </p>
                        </div>
                    </section>

                    {/* Article 7 */}
                    <section ref={(el) => { sectionRefs.current[8] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 7. CRITICAL SYSTEMS EXCLUSION</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                The Software is classified as Tier-4 Non-Critical Utility. It is strictly prohibited for deployment in high-stakes environments where software latency, failure, or command error could lead to:
                            </p>
                            <ul className="list-decimal pl-6 space-y-2">
                                <li>Life-Support Systems: Environments where error could result in physical injury or death.</li>
                                <li>Forensic Evasion: The use of visibility masking features to impede legitimate law enforcement discovery or legal evidence collection.</li>
                                <li>High-Frequency Trading: Financial environments where millisecond command latency results in direct fiscal loss.</li>
                                <li>Critical Infrastructure Control: Nuclear facilities, air traffic control, or power grid management.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Article 8 */}
                    <section ref={(el) => { sectionRefs.current[9] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 8. DATA COMMERCIALIZATION & DERIVATIVE WORKS</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                <strong className="text-white">8.1. Data Assignment:</strong> By generating data through the Software, the Licensee grants the Licensor a perpetual, exclusive, transferable, sub-licensable, worldwide license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and sell said interaction data.
                            </p>
                            <p>
                                <strong className="text-white">8.2. Artificial Intelligence Training:</strong> The Licensee explicitly consents to the inclusion of their anonymized Input Data, visual snapshots, and interaction logs into datasets utilized for the pre-training, fine-tuning, reinforcement learning (RLHF), and evaluation of Large Language Models (LLMs), Large Action Models (LAMs), and other neural network architectures.
                            </p>
                            <p>
                                <strong className="text-white">8.3. Commercial Transfer:</strong> The Licensor reserves the right to sell, lease, or license bulk aggregation of such Telemetry and Data Sets to third-party entities, including but not limited to AI research laboratories, technology conglomerates, and data brokers, without notice or compensation to the Licensee.
                            </p>
                            <p>
                                <strong className="text-white">8.4. No Revocation Rights:</strong> Once Data has been ingested, processed, and merged into the aggregate dataset or model weights, the Licensee acknowledges that removal of specific data points (&quot;un-learning&quot;) is technologically infeasible. Therefore, this license is irrevocable regarding data already ingested.
                            </p>
                        </div>
                    </section>

                    {/* Article 9 */}
                    <section ref={(el) => { sectionRefs.current[10] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 9. LIMITATION OF LIABILITY & ARBITRATION</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p className="font-bold text-red-500">
                                9.1. AS-IS CONDITION: THE SOFTWARE AND ALL ASSOCIATED SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. THE LICENSOR EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                            </p>
                            <p className="font-bold text-red-500">
                                9.2. LIABILITY CAP: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE LICENSOR’S TOTAL CUMULATIVE LIABILITY FOR ANY CLAIM ARISING FROM THIS AGREEMENT OR THE USE OF THE SOFTWARE SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY THE LICENSEE TO THE LICENSOR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR FIVE DOLLARS ($5.00 USD), WHICHEVER IS GREATER. THIS APPLIES TO DAMAGES FOR DATA LOSS, BUSINESS INTERRUPTION, PRIVACY BREACHES, OR HARDWARE FAILURE.
                            </p>
                            <p>
                                <strong className="text-white">9.3. BINDING ARBITRATION:</strong> ANY DISPUTE ARISING UNDER THIS AGREEMENT SHALL BE RESOLVED VIA BINDING INDIVIDUAL ARBITRATION ADMINISTERED BY THE AMERICAN ARBITRATION ASSOCIATION (AAA). THE LICENSEE HEREBY WAIVES THE RIGHT TO A JURY TRIAL OR PARTICIPATION IN A CLASS ACTION LAWSUIT OR REPRESENTATIVE PROCEEDING.
                            </p>
                            <p>
                                <strong className="text-white">9.4. INDEMNIFICATION:</strong> The Licensee agrees to defend, indemnify, and hold harmless the Licensor, its officers, directors, and agents from any claim, suit, or demand (including reasonable legal fees) made by a third party due to or arising out of the Licensee’s misuse of the Software, violation of this Agreement, or violation of any rights of another (including intellectual property or privacy rights).
                            </p>
                        </div>
                    </section>

                    {/* Article 10 */}
                    <section ref={(el) => { sectionRefs.current[11] = el; }} className="backdrop-blur-sm bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h2 className="text-3xl font-bold mb-6 text-red-400">ARTICLE 10. RESIDUAL LIABILITY VECTORS & HUMAN FACTORS</h2>
                        <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                            <p>
                                <strong className="text-white">10.1. NEURO-OPTICAL STIMULATION & HEALTH WARNING:</strong> The Software utilizes rapid UI refresh rates, flashing visual overlays (HighlighterForm), and automated window cycling. The Licensee acknowledges that these visual patterns may trigger seizures in individuals with photosensitive epilepsy or other neurological disorders. The Licensee assumes full responsibility for health risks and agrees to discontinue use immediately if physiological symptoms occur. THE LICENSOR DISCLAIMS LIABILITY FOR ANY PERSONAL INJURY OR MEDICAL EMERGENCIES ARISING FROM PROLONGED USAGE.
                            </p>
                            <p>
                                <strong className="text-white">10.2. THIRD-PARTY PRIVACY & WIRETAP COMPLIANCE:</strong> The Software captures the entirety of the visual display buffer. If the Licensee uses the Software during video teleconferencing, medical consultations, or communications with third parties, the Licensee creates a permanent record of those interactions. Warrant of Consent: The Licensee warrants that they have obtained verifiable, express consent from all individuals visible or audible within the recording session to be recorded and for that data to be uploaded to cloud infrastructure. The Licensee indemnifies the Licensor against any violation of two-party consent laws or the Electronic Communications Privacy Act (ECPA).
                            </p>
                            <p>
                                <strong className="text-white">10.3. GENERATIVE ORIGINALITY & INTELLECTUAL PROPERTY:</strong> The Licensee acknowledges that the Autonomous Agent synthesizes outputs based on probabilistic models trained on internet-scale data. The Licensor does not guarantee that code, text, or visual assets generated by the Agent are free from copyright claims, copyleft restrictions (GPL/MIT), or similarities to proprietary third-party intellectual property. Use of generated assets in production environments is at the Licensee’s sole legal risk.
                            </p>
                            <p>
                                <strong className="text-white">10.4. UNMODERATED CONTENT OUTPUT:</strong> The Software connects to LLM endpoints that may, on rare occasions, generate output that is offensive, factually incorrect, hallucinations, or biased (&quot;Toxic Outputs&quot;). The Licensor explicitly acts as a transmission tunnel for these API responses and is not the publisher or author of such content. The Licensee waives any claims regarding emotional distress, defamation, or workplace harassment resulting from Toxic Outputs.
                            </p>
                            <p>
                                <strong className="text-white">10.5. EXPORT CONTROL & GEOPOLITICAL RESTRICTIONS:</strong> The Software utilizes cryptographic protocols and cloud infrastructure subject to United States Export Administration Regulations (EAR). The Licensee represents they are not located in, under the control of, or a national or resident of any country to which the United States has embargoed goods (e.g., Iran, North Korea, Syria, Cuba, Russia). Unauthorized use in these jurisdictions is a material breach of this Agreement.
                            </p>
                            <p>
                                <strong className="text-white">10.6. ABANDONMENT & FORCE MAJEURE:</strong> The Licensor reserves the right to &quot;Sunset&quot; (discontinue) the Service, API endpoints, or database storage at any time, with or without notice. The Licensee accepts that they rely on the Software for business continuity at their own peril. The Licensor is not liable for business collapse, loss of revenue, or operational failure caused by the abrupt termination of the service infrastructure.
                            </p>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="mt-24 pt-8 border-t border-white/10 text-center">
                        <p className="text-xl font-bold text-red-400">
                            BY DOWNLOADING THE SOFTWARE OR CLICKING &quot;I AGREE,&quot; THE LICENSEE ACKNOWLEDGES FULL COMPREHENSION OF THIS BINDING INSTRUMENT.
                        </p>
                        <p className="mt-4 text-white/30 text-sm">&copy; {new Date().getFullYear()} Ofradr. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TermsPage() {
    return (
        <ReactLenis root>
            <TermsContent />
        </ReactLenis>
    )
}
