"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

// ── Types ──
interface OrderRow {
  order_date: string;
  investor_name: string;
  folio_no: string;
  scheme_name: string;
  trans_type: string;
  amount: string;
  units: string;
  status: string;
  remarks: string;
  order_id: string;
}

// ── Helpers ──
function todayStr(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function sevenDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function toApiDate(dateStr: string): string {
  // convert yyyy-mm-dd to dd-mm-yyyy
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("success") || s.includes("allotted"))
    return "bg-green-100 text-green-700";
  if (s.includes("fail") || s.includes("reject"))
    return "bg-red-100 text-red-700";
  if (s.includes("pending") || s.includes("authorization"))
    return "bg-yellow-100 text-yellow-700";
  if (s.includes("progress") || s.includes("process"))
    return "bg-blue-100 text-blue-700";
  return "bg-[#1F1A1A] text-[#9CA3AF]";
}

// ══════════════════════════════════════════
//  NSE My Orders
// ══════════════════════════════════════════
export default function NseMyOrders() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(sevenDaysAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [fetched, setFetched] = useState(false);

  // ── Summary counts ──
  const totalOrders = orders.length;
  const authPending = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("authorization")
  ).length;
  const paymentPending = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("payment")
  ).length;
  const inProgress = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s.includes("progress") || s.includes("process");
  }).length;
  const success = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s.includes("success") || s.includes("allotted");
  }).length;
  const failed = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s.includes("fail") || s.includes("reject");
  }).length;

  const summaryCards = [
    { label: "Total Orders", count: totalOrders, color: "#F59E0B" },
    { label: "Auth Pending", count: authPending, color: "#f59e0b" },
    { label: "Payment Pending", count: paymentPending, color: "#f97316" },
    { label: "In Progress", count: inProgress, color: "#3b82f6" },
    { label: "Success", count: success, color: "#22c55e" },
    { label: "Failed / Rejected", count: failed, color: "#ef4444" },
  ];

  // ── Fetch Orders ──
  const fetchOrders = async () => {
    if (!fromDate || !toDate) {
      toastAlert("warn", "Please select both dates");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/nse/order-status", {
        from_date: toApiDate(fromDate),
        to_date: toApiDate(toDate),
        trans_type: "ALL",
        order_type: "ALL",
        sub_order_type: "ALL",
      });
      const rows: any[] = res?.data?.data?.report_data || [];
      const mapped: OrderRow[] = rows.map((r: any) => ({
        order_date: r.order_date || r.orderDate || "--",
        investor_name: r.investor_name || r.investorName || r.clientName || "--",
        folio_no: r.folio_no || r.folioNo || r.folio || "--",
        scheme_name: r.scheme_name || r.schemeName || r.scheme || "--",
        trans_type: r.trans_type || r.transType || r.buySell || "--",
        amount: r.amount || r.orderAmount || "--",
        units: r.units || r.orderUnits || "--",
        status: r.status || r.orderStatus || "--",
        remarks: r.remarks || r.remark || "--",
        order_id: r.order_id || r.orderId || r.orderNo || "",
      }));
      setOrders(mapped);
      setFetched(true);
      if (mapped.length === 0) toastAlert("info", "No orders found for the selected date range");
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nse-module p-6 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-[#F9FAFB] mb-6">My Orders</h1>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#111111] rounded-xl shadow-sm border p-4 text-center"
          >
            <p className="text-sm text-[#9CA3AF] mb-1">{card.label}</p>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.count}
            </p>
          </div>
        ))}
      </div>

      {/* ── Date Filter ── */}
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
        <button
          onClick={fetchOrders}
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
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Order Date</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Investor Name</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Folio No</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Scheme</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Type</th>
              <th className="text-right px-4 py-3 text-[#9CA3AF] font-semibold">Amount</th>
              <th className="text-right px-4 py-3 text-[#9CA3AF] font-semibold">Units</th>
              <th className="text-center px-4 py-3 text-[#9CA3AF] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#9CA3AF] font-semibold">Remarks</th>
              <th className="text-center px-4 py-3 text-[#9CA3AF] font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {!fetched ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-[#6B7280]">
                  Select a date range and click Search to view orders
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-[#6B7280]">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o, idx) => (
                <tr key={idx} className="border-b hover:bg-[#1F1A1A] transition">
                  <td className="px-4 py-3 whitespace-nowrap">{o.order_date}</td>
                  <td className="px-4 py-3">{o.investor_name}</td>
                  <td className="px-4 py-3">{o.folio_no}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={o.scheme_name}>
                    {o.scheme_name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        o.trans_type === "P"
                          ? "bg-green-100 text-green-700"
                          : o.trans_type === "R"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-[#1F1A1A] text-[#9CA3AF]"
                      }`}
                    >
                      {o.trans_type === "P"
                        ? "Purchase"
                        : o.trans_type === "R"
                        ? "Redemption"
                        : o.trans_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{o.amount}</td>
                  <td className="px-4 py-3 text-right">{o.units}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(o.status)}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[150px] truncate" title={o.remarks}>
                    {o.remarks}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {o.order_id && (
                      <button
                        onClick={() =>
                          router.push(`/nse-order-tracking?order_id=${o.order_id}`)
                        }
                        className="text-xs font-medium underline"
                        style={{ color: "#F59E0B" }}
                      >
                        Track Order
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
