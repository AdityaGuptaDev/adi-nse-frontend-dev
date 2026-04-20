"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

// ── Types ──
interface MandateRow {
  mandateId: string;
  clientCode: string;
  clientName: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  amount: string;
  status: string;
  umrnNo: string;
  registrationDate: string;
  approvedDate: string;
  mandateCollectionType: string;
  mandateType: string;
  startDate: string;
  endDate: string;
  rejectReason: string;
  remarks: string;
}

// ── Helpers ──
function todayStr(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy()}-${mm}-${dd}`;
  function yyyy() { return d.getFullYear(); }
}

function thirtyDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function toApiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("approved") || s.includes("active") || s.includes("success"))
    return "bg-green-100 text-green-700";
  if (s.includes("reject") || s.includes("fail") || s.includes("cancel"))
    return "bg-red-100 text-red-700";
  if (s.includes("pending") || s.includes("submitted"))
    return "bg-yellow-100 text-yellow-700";
  return "bg-[#1F1A1A] text-[#9CA3AF]";
}

// ══════════════════════════════════════════
//  NSE Mandate List
// ══════════════════════════════════════════
export default function NseMandateList() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [clientCode, setClientCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mandates, setMandates] = useState<MandateRow[]>([]);
  const [fetched, setFetched] = useState(false);

  const fetchMandates = async () => {
    if (!fromDate || !toDate) {
      toastAlert("warn", "Please select both dates");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/nse/mandate-status", {
        mandate_id: "",
        client_code: clientCode.trim(),
        from_date: toApiDate(fromDate),
        to_date: toApiDate(toDate),
      });
      // Backend wraps NSE response as { status: "S", data: <nseResponse> } and
      // encrypts it. The axios interceptor decrypts into res.data.data, so the
      // actual NSE payload (with report_data) lives at res.data.data.data.
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const rows: any[] =
        inner?.report_data ||
        outer?.report_data ||
        [];
      const clean = (v: any) => {
        const s = (v ?? "").toString().trim();
        return s === "" ? "--" : s;
      };
      const mapped: MandateRow[] = rows.map((r: any) => ({
        mandateId: clean(r.mandateId || r.mandate_id),
        clientCode: clean(r.clientCode || r.client_code),
        clientName: clean(r.clientName || r.client_name),
        bankName: clean(r.bankName || r.bank_name),
        bankBranch: clean(r.bankBranch || r.bank_branch),
        accountNo: clean(r.bankAccountNumber || r.accountNo || r.account_no),
        amount: clean(r.amount),
        status: clean(r.status),
        umrnNo: clean(r.umrnNo || r.umrn_no),
        registrationDate: clean(r.registrationDate || r.registration_date),
        approvedDate: clean(r.approvedDate || r.approved_date),
        mandateCollectionType: clean(r.mandateCollectionType || r.mandate_collection_type),
        mandateType: clean(r.mandateType || r.mandate_type),
        startDate: clean(r.startDate || r.start_date),
        endDate: clean(r.endDate || r.end_date),
        rejectReason: clean(r.rejectReason || r.reject_reason),
        remarks: clean(r.remarks),
      }));
      setMandates(mapped);
      setFetched(true);
      if (mapped.length === 0) toastAlert("info", "No mandates found");
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nse-module p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-[#D97706] mb-6">Mandate List</h1>

      {/* ── Filter ── */}
      <div className="bg-[#111111] rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Client Code</label>
          <input
            type="text"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            placeholder="Optional"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] w-[160px]"
          />
        </div>
        <button
          onClick={fetchMandates}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
          style={{ backgroundColor: "#F59E0B" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111111] rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Client Code</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Client Name</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Mandate ID</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Bank</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Account No</th>
              <th className="text-right px-4 py-3 text-[#9CA3AF] font-semibold">Amount</th>
              <th className="text-center px-4 py-3 text-[#9CA3AF] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">UMRN</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Reg Date</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Start Date</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">End Date</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Approved Date</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Collection</th>
            </tr>
          </thead>
          <tbody>
            {!fetched ? (
              <tr>
                <td colSpan={14} className="text-center py-12 text-[#6B7280]">
                  Select filters and click Search to view mandates
                </td>
              </tr>
            ) : mandates.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center py-12 text-[#6B7280]">
                  No mandates found
                </td>
              </tr>
            ) : (
              mandates.map((m, idx) => (
                <tr key={idx} className="border-b hover:bg-[#1F1A1A] transition">
                  <td className="px-4 py-3 font-mono text-xs">{m.clientCode}</td>
                  <td className="px-4 py-3">{m.clientName}</td>
                  <td className="px-4 py-3 font-medium font-mono text-xs" style={{ color: "#F59E0B" }}>
                    {m.mandateId}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {m.mandateType === "X" ? "Physical" : m.mandateType === "E" ? "eNACH" : m.mandateType}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{m.bankName}</div>
                    {m.bankBranch !== "--" && (
                      <div className="text-xs text-[#6B7280]">{m.bankBranch}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {m.accountNo !== "--" ? `****${m.accountNo.slice(-4)}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-right">₹ {m.amount}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(m.status)}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{m.umrnNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{m.registrationDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{m.startDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{m.endDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{m.approvedDate}</td>
                  <td className="px-4 py-3 text-xs">{m.mandateCollectionType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
