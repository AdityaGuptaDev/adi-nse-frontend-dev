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
  accountNo: string;
  amount: string;
  status: string;
  umrnNo: string;
  registrationDate: string;
  approvedDate: string;
  mandateCollectionType: string;
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
  return "bg-gray-100 text-gray-600";
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
      const rows: any[] = res?.data?.data?.report_data || [];
      const mapped: MandateRow[] = rows.map((r: any) => ({
        mandateId: r.mandateId || r.mandate_id || "--",
        clientCode: r.clientCode || r.client_code || "--",
        clientName: r.clientName || r.client_name || "--",
        bankName: r.bankName || r.bank_name || "--",
        accountNo: r.accountNo || r.account_no || "--",
        amount: r.amount || "--",
        status: r.status || "--",
        umrnNo: r.umrnNo || r.umrn_no || "--",
        registrationDate: r.registrationDate || r.registration_date || "--",
        approvedDate: r.approvedDate || r.approved_date || "--",
        mandateCollectionType: r.mandateCollectionType || r.mandate_collection_type || "--",
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
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mandate List</h1>

      {/* ── Filter ── */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Client Code</label>
          <input
            type="text"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            placeholder="Optional"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1] w-[160px]"
          />
        </div>
        <button
          onClick={fetchMandates}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
          style={{ backgroundColor: "#4bc5c1" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client Code</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Mandate ID</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Bank Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Account No</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Amount</th>
              <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">UMRN</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Reg Date</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Approved Date</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Collection Type</th>
            </tr>
          </thead>
          <tbody>
            {!fetched ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400">
                  Select filters and click Search to view mandates
                </td>
              </tr>
            ) : mandates.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400">
                  No mandates found
                </td>
              </tr>
            ) : (
              mandates.map((m, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{m.clientCode}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#4bc5c1" }}>
                    {m.mandateId}
                  </td>
                  <td className="px-4 py-3">{m.bankName}</td>
                  <td className="px-4 py-3">{m.accountNo}</td>
                  <td className="px-4 py-3 text-right">{m.amount}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(m.status)}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.umrnNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{m.registrationDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{m.approvedDate}</td>
                  <td className="px-4 py-3">{m.mandateCollectionType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
