"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { publicPathName } from "@/utils/constants";

// Footer mirrored from the landing page so logged-in dashboards keep the same
// branding / contact info at the bottom. Quick Links route to the landing page
// with the right hash so they jump to the matching section without logging out.
export default function LandingFooter() {
    const router = useRouter();

    const go = (hash: string) => router.push(`/landing${hash}`);

    return (
        <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] py-12 px-6 mt-8">
            <div className="w-full max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
                    <div>
                        <img
                            src={`${publicPathName}/logo_light.png`}
                            alt="Vedant Asset"
                            className="h-12 w-auto mb-4 brightness-0 invert"
                        />
                        <p className="text-sm text-[#9CA3AF] leading-relaxed">
                            India's most trusted investment platform, making wealth creation accessible to everyone.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-[#9CA3AF]">
                            <li>
                                <button onClick={() => go("#about")} className="hover:text-[#F59E0B] transition-colors">
                                    About Us
                                </button>
                            </li>
                            <li>
                                <button onClick={() => go("#calculator")} className="hover:text-[#F59E0B] transition-colors">
                                    Calculator
                                </button>
                            </li>
                            <li>
                                <button onClick={() => go("#app")} className="hover:text-[#F59E0B] transition-colors">
                                    Mobile App
                                </button>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#F59E0B] transition-colors">Contact</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Resources</h4>
                        <ul className="space-y-2 text-sm text-[#9CA3AF]">
                            <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Investment Guide</a></li>
                            <li><a href="#" className="hover:text-[#F59E0B] transition-colors">FAQs</a></li>
                            <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Contact</h4>
                        <ul className="space-y-2 text-sm text-[#9CA3AF]">
                            <li className="flex items-center gap-2">📞 9304955509</li>
                            <li className="flex items-center gap-2">✉️ vedantasset@gmail.com</li>
                            <li>
                                <a
                                    href="https://www.vedantasset.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1"
                                >
                                    🌐 www.vedantasset.com
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </li>
                            <li className="flex items-start gap-2">📍 3rd Floor, Gayways House, Ranchi — 834001</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#2A2A2A] pt-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">
                        © 2025 Vedant Asset Technologies Pvt. Ltd. · SEBI Registered Investment Advisor
                    </p>
                    <p className="text-xs text-[#9CA3AF]/70 mt-2">
                        Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.
                    </p>
                </div>
            </div>
        </footer>
    );
}
