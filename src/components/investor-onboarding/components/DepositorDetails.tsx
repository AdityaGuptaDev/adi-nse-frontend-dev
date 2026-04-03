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
        <form onSubmit={handleSubmit} className="p-6 bg-white">

            <h2 className="text-xl font-semibold mb-6">Depository Details</h2>

            {/* NSDL SECTION */}
            <div className="border p-4 rounded bg-gray-50 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">NSDL</h3>

                <div className="grid grid-cols-3 gap-4">

                    <div>
                        <label className="text-sm">Depository Type</label>
                        <input
                            value="NSDL"
                            readOnly
                            className="w-full border rounded px-3 py-2 bg-gray-200"
                        />
                    </div>

                    <div>
                        <label className="text-sm">DP ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.nsdlDpId}
                            onChange={(e) => handleChange("nsdlDpId", e.target.value.toUpperCase())}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm">Client ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.nsdlClientId}
                            onChange={(e) => handleChange("nsdlClientId", e.target.value.toUpperCase())}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div className="col-span-3">
                        <label className="text-sm">NSDL Account Proof</label>
                        <select
                            value={formData.nsdlProfId}
                            onChange={(e) => handleChange("nsdlProfId", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Select</option>
                            <option value="34">Statement of Accounts</option>
                            <option value="79">Client Master Report</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CDSL SECTION */}
            <div className="border p-4 rounded bg-gray-50 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">CDSL</h3>

                <div className="grid grid-cols-3 gap-4">

                    <div>
                        <label className="text-sm">Depository Type</label>
                        <input
                            value="CDSL"
                            readOnly
                            className="w-full border rounded px-3 py-2 bg-gray-200"
                        />
                    </div>

                    <div>
                        <label className="text-sm">DP ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.cdslDpId}
                            onChange={(e) => handleChange("cdslDpId", e.target.value.toUpperCase())}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm">Client ID</label>
                        <input
                            type="text"
                            maxLength={8}
                            value={formData.cdslClientId}
                            onChange={(e) => handleChange("cdslClientId", e.target.value.toUpperCase())}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div className="col-span-3">
                        <label className="text-sm">CDSL Account Proof</label>
                        <select
                            value={formData.cdslProfId}
                            onChange={(e) => handleChange("cdslProfId", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Select</option>
                            <option value="34">Statement of Accounts</option>
                            <option value="79">Client Master Report</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* NAV BUTTONS */}
            <div className="flex justify-between pt-6 border-t">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="px-6 py-2 bg-gray-600 text-white rounded"
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isValid}
                    className={`px-6 py-2 rounded ${isValid ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                    {isLastStep ? "Submit" : "Next"}
                </button>
            </div>
        </form>
    );
}
