"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

// ── Types ──
interface KycResult {
  pan: string;
  name: string;
  kyc_status: string;
  status_remark: string;
  kra_name: string;
  status_date: string;
}

// ══════════════════════════════════════════
//  NSE KYC Status
// ══════════════════════════════════════════
export default function NseKycStatus() {
  const router = useRouter();
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KycResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleCheck = async () => {
    const trimmedPan = pan.trim().toUpperCase();
    if (!trimmedPan) {
      toastAlert("warn", "Please enter a PAN number");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(trimmedPan)) {
      toastAlert("warn", "Please enter a valid PAN number");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/nse/kyc-check", { pan_no: trimmedPan });
      const data = res?.data?.data;
      if (data) {
        setResult({
          pan: data.pan || data.pan_no || trimmedPan,
          name: data.name || data.investor_name || "--",
          kyc_status: data.kyc_status || data.kycStatus || "--",
          status_remark: data.status_remark || data.statusRemark || data.remark || "--",
          kra_name: data.kra_name || data.kraName || "--",
          status_date: data.status_date || data.statusDate || "--",
        });
      } else {
        toastAlert("info", "No KYC data found for this PAN");
      }
      setSearched(true);
    } catch (err: any) {
      handleServerError(err);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const isKycDone = result
    ? (result.kyc_status || "").toLowerCase().includes("verified") ||
      (result.kyc_status || "").toLowerCase().includes("registered") ||
      (result.kyc_status || "").toLowerCase().includes("validated") ||
      (result.kyc_status || "").toLowerCase() === "yes"
    : false;

  return (
    <div className="nse-module p-6 max-w-[700px] mx-auto">
      <h1 className="text-2xl font-bold text-[#D97706] mb-6">KYC Status Check</h1>

      {/* ── Search ── */}
      <div className="bg-[#111111] rounded-xl shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
          PAN Number
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="Enter PAN (e.g. ABCDE1234F)"
            maxLength={10}
            className="border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] flex-1 uppercase tracking-wider"
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50 whitespace-nowrap"
            style={{ backgroundColor: "#F59E0B" }}
          >
            {loading ? "Checking..." : "Check KYC"}
          </button>
        </div>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="bg-[#111111] rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F9FAFB]">KYC Details</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isKycDone
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isKycDone ? "KYC Verified" : "KYC Not Verified"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "PAN", value: result.pan },
              { label: "Name", value: result.name },
              { label: "KYC Status", value: result.kyc_status },
              { label: "Status Remark", value: result.status_remark },
              { label: "KRA Name", value: result.kra_name },
              { label: "Status Date", value: result.status_date },
            ].map((item) => (
              <div key={item.label} className="border-b pb-3">
                <p className="text-xs text-[#6B7280] mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-[#F9FAFB]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-[#111111] rounded-xl shadow-sm border p-6 text-center">
          <p className="text-[#6B7280]">No KYC data found for this PAN</p>
        </div>
      )}
    </div>
  );
}
