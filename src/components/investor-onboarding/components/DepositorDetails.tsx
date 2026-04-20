"use client";

import { useEffect, useState } from "react";
import { StepComponentProps } from "../types";
import api from "@/utils/api";

const DP_KEY = "depository-details";

export default function DepositoryDetails({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    investorId
}: StepComponentProps) {

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(DP_KEY);
        return saved
            ? JSON.parse(saved)
            : {
                investor_id: investorId,

                // NSDL
                dpType_nsdl: "NSDL",
                nsdlDpId: "IN",
                nsdlClientId: "",
                nsdlProfId: "",
                nsdlDpClientId: "",

                // CDSL
                dpType_cdsl: "CDSL",
                cdslDpId: "",
                cdslClientId: "",
                cdslProfId: "",
                cdslDpClientId: "",
            };
    });

    useEffect(() => {
        localStorage.setItem(DP_KEY, JSON.stringify(formData));
    }, [formData]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const isValid =
        formData.nsdlDpId &&
        formData.nsdlClientId &&
        formData.nsdlProfId &&
        formData.cdslDpId &&
        formData.cdslClientId &&
        formData.cdslProfId;

    useEffect(() => {
        onCompletionUpdate(isValid);
    }, [isValid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            nsdlDpClientId: formData.nsdlDpId + formData.nsdlClientId,
            cdslDpClientId: formData.cdslDpId + formData.cdslClientId
        };

        await api.post("/kyc/depository_details", payload);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-xl">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent mb-6">Depository Details</h2>

            {/* NSDL SECTION */}
            <div className="border border-[#2A2A2A] p-4 rounded-lg bg-[#1F1A1A] mb-6">
                <h3 className="font-semibold text-[#F9FAFB] mb-4">NSDL</h3>

                <div className="grid grid-cols-3 gap-4">

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">Depository Type</label>
                        <input
                            value="NSDL"
                            readOnly
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] cursor-not-allowed opacity-70"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">DP ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.nsdlDpId}
                            onChange={(e) => handleChange("nsdlDpId", e.target.value.toUpperCase())}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">Client ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.nsdlClientId}
                            onChange={(e) => handleChange("nsdlClientId", e.target.value.toUpperCase())}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        />
                    </div>

                    <div className="col-span-3">
                        <label className="text-sm text-[#9CA3AF] block mb-2">NSDL Account Proof</label>
                        <select
                            value={formData.nsdlProfId}
                            onChange={(e) => handleChange("nsdlProfId", e.target.value)}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        >
                            <option value="">Select</option>
                            <option value="34">Statement of Accounts</option>
                            <option value="79">Client Master Report</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CDSL SECTION */}
            <div className="border border-[#2A2A2A] p-4 rounded-lg bg-[#1F1A1A] mb-6">
                <h3 className="font-semibold text-[#F9FAFB] mb-4">CDSL</h3>

                <div className="grid grid-cols-3 gap-4">

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">Depository Type</label>
                        <input
                            value="CDSL"
                            readOnly
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] cursor-not-allowed opacity-70"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">DP ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.cdslDpId}
                            onChange={(e) => handleChange("cdslDpId", e.target.value.toUpperCase())}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9CA3AF] block mb-2">Client ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.cdslClientId}
                            onChange={(e) => handleChange("cdslClientId", e.target.value.toUpperCase())}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        />
                    </div>

                    <div className="col-span-3">
                        <label className="text-sm text-[#9CA3AF] block mb-2">CDSL Account Proof</label>
                        <select
                            value={formData.cdslProfId}
                            onChange={(e) => handleChange("cdslProfId", e.target.value)}
                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 bg-[#111111] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        >
                            <option value="">Select</option>
                            <option value="34">Statement of Accounts</option>
                            <option value="79">Client Master Report</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* NAV BUTTONS */}
            <div className="flex justify-between pt-6 border-t border-[#2A2A2A]">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] hover:border-[#F59E0B] transition-all font-medium"
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isValid}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        isValid
                            ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 shadow-lg"
                            : "bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed"
                    }`}
                >
                    {isLastStep ? "Submit" : "Next"}
                </button>
            </div>
        </form>
    );
}
