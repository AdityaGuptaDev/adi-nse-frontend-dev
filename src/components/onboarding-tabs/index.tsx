"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const CreateUCC = dynamic(() => import("@/components/create-ucc"), { ssr: false });
const InitialKYC = dynamic(() => import("@/components/initial-KYC"), { ssr: false });

type Lane = "nse" | "mfu";

export default function OnboardingTabs() {
    const searchParams = useSearchParams();
    const initialLane: Lane = searchParams?.get("lane") === "mfu" ? "mfu" : "nse";
    const [activeTab, setActiveTab] = useState<Lane>(initialLane);

    useEffect(() => {
        const lane = searchParams?.get("lane");
        if (lane === "mfu" || lane === "nse") setActiveTab(lane);
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <div className="px-4 pt-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex mb-4 bg-[#1a1c22]/50 rounded-lg p-1 relative">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-center text-sm font-medium transition-all duration-300 rounded-md relative z-10 ${
                                activeTab === "nse"
                                    ? "text-white"
                                    : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                            }`}
                            onClick={() => setActiveTab("nse")}
                        >
                            🏦 Onboard through NSE
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-center text-sm font-medium transition-all duration-300 rounded-md relative z-10 ${
                                activeTab === "mfu"
                                    ? "text-white"
                                    : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                            }`}
                            onClick={() => setActiveTab("mfu")}
                        >
                            🏛 Onboard through MFU
                        </button>
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-md transition-all duration-400 ease-out ${
                                activeTab === "nse" ? "left-1" : "left-[calc(50%+2px)]"
                            }`}
                        />
                    </div>
                </div>
            </div>

            {activeTab === "nse" ? <CreateUCC /> : <InitialKYC />}
        </div>
    );
}
