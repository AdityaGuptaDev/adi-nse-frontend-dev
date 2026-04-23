"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Copy,
  User,
  Calendar,
  Hash,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { getLS, handleServerError } from "@/utils/helpers";
import { getAccountHolding } from "@/api/holder";

interface CANData {
  canNumber: string;
  customerName: string;
  email: string;
  phone: string;
  panNumber: string;
  createdDate: string;
}

export default function CANSuccessComponent() {
  const router = useRouter();

  const [canData, setCanData] = useState<CANData | null>(null);
  const [canNo, setCanNo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCAN, setCopiedCAN] = useState(false);

  useEffect(() => {
    // Read LS inside the effect so the module itself doesn't crash when
    // imported in a server render. Also handles the edge case of the user
    // landing on /can-onboarding via direct URL / private window / cleared
    // storage — previously this page blew up on first property access.
    const investorData: any = getLS("INVESTOR_DATA");

    if (!investorData || !investorData.InvestorRegistration) {
      setError(
        "We couldn't find your CAN session data. Please log in again and return to the dashboard.",
      );
      setLoading(false);
      return;
    }

    const investorId = investorData?.InvestorRegistration?.id;

    setCanData({
      canNumber: investorData?.can_number ?? "",
      customerName: investorData?.InvestorRegistration?.name ?? "—",
      email: investorData?.reg_email ?? investorData?.email ?? "—",
      phone: investorData?.mobile ?? "—",
      panNumber: investorData?.InvestorRegistration?.pan_no ?? "—",
      createdDate: investorData?.InvestorRegistration?.createdAt
        ? new Date(investorData.InvestorRegistration.createdAt).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN"),
    });

    const fetchCan = async () => {
      try {
        const response: any = await getAccountHolding(investorId);
        const rows = response?.data?.data?.data;
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.CAN_Id) {
          setCanNo(String(rows[0].CAN_Id));
        } else {
          // Backend is still processing — MFU sometimes returns the CAN
          // asynchronously. Don't hard-fail; the registration succeeded.
          setCanNo("");
        }
      } catch (err) {
        handleServerError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCan();
  }, []);

  const copyCANNumber = async () => {
    if (!canNo) return;
    try {
      await navigator.clipboard.writeText(canNo);
      setCopiedCAN(true);
      setTimeout(() => setCopiedCAN(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = canNo;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedCAN(true);
      setTimeout(() => setCopiedCAN(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mx-auto mb-4" />
          <p className="text-[#9CA3AF]">Loading CAN details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111111] border border-red-500/30 rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#F9FAFB] mb-2">
            Couldn't load your CAN
          </h2>
          <p className="text-[#9CA3AF] text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboards")}
              className="px-4 py-2 bg-[#F59E0B] text-white rounded-md hover:bg-[#B45309] transition-colors text-sm font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] hover:border-[#F59E0B] rounded-md transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#111111] via-[#141414] to-[#1F1A1A] shadow-2xl">
          {/* Top amber accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#B45309]" />

          <div className="px-6 sm:px-10 pt-10 pb-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-5">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-400/40">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent mb-2">
              CAN Created Successfully
            </h1>
            <p className="text-[#9CA3AF] text-base sm:text-lg">
              Your Customer Application Number has been generated
            </p>
          </div>

          {/* CAN number panel */}
          <div className="px-6 sm:px-10 pb-8">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80 mb-3">
                Your Customer Account Number
              </p>

              {canNo ? (
                <>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-300 tracking-wider mb-4 break-all">
                    {canNo}
                  </div>
                  <button
                    onClick={copyCANNumber}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-sm font-medium transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCAN ? "Copied" : "Copy CAN Number"}
                  </button>
                </>
              ) : (
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  Your CAN is being provisioned by MFU. Check back in a few
                  minutes, or watch your email for the confirmation.
                </p>
              )}
            </div>
          </div>

          {/* Customer details grid */}
          {canData && (
            <div className="px-6 sm:px-10 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<User className="h-4 w-4" />} label="Customer Name" value={canData.customerName} />
                <DetailRow icon={<Hash className="h-4 w-4" />} label="PAN Number" value={canData.panNumber} mono />
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={canData.email} />
                <DetailRow icon={<Calendar className="h-4 w-4" />} label="Registration Date" value={canData.createdDate} />
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={canData.phone} />
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="px-6 sm:px-10 pb-10">
            <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5 flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center">
                <Mail className="h-4 w-4 text-[#FBBF24]" />
              </div>
              <div>
                <p className="font-semibold text-[#F9FAFB] mb-1">
                  Next step — check your email
                </p>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  We've sent the document checklist to{" "}
                  <span className="text-[#FBBF24] font-medium">
                    {canData?.email || "your registered email"}
                  </span>
                  . Upload the requested documents to complete onboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 hover:border-[#F59E0B]/40 transition-colors">
      <div className="shrink-0 w-8 h-8 rounded-md bg-[#1F1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#F59E0B]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-medium text-[#F9FAFB] truncate ${
            mono ? "font-mono tracking-wider" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
