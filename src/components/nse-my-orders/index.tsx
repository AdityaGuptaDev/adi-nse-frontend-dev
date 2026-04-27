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

// NSE ORDER_STATUS spec: "Maximum Date range should be 7 days" (inclusive).
// 7 days inclusive means the numerical diff between from and to is ≤ 6.
// Picking from=today-7 → diff=7 days → NSE rejects with "should be 7 days".
const MAX_DATE_DIFF_DAYS = 6;

// ── Helpers ──
function isoFromDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function todayStr(): string {
  return isoFromDate(new Date());
}

function sixDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - MAX_DATE_DIFF_DAYS);
  return isoFromDate(d);
}

function diffInDays(fromIso: string, toIso: string): number {
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  return Math.round((b - a) / 86_400_000);
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
  const [fromDate, setFromDate] = useState(sixDaysAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [fetched, setFetched] = useState(false);

  // Keep from_date and to_date within NSE's 7-day-inclusive window.
  // When the user moves one bound past the limit, slide the other to
  // match instead of throwing an error — this is what NSE Member Desk
  // does and it's much less annoying than a validation popup.
  const handleFromChange = (next: string) => {
    setFromDate(next);
    if (toDate && diffInDays(next, toDate) > MAX_DATE_DIFF_DAYS) {
      const d = new Date(next);
      d.setDate(d.getDate() + MAX_DATE_DIFF_DAYS);
      setToDate(isoFromDate(d));
    }
    if (toDate && diffInDays(next, toDate) < 0) {
      setToDate(next);
    }
  };
  const handleToChange = (next: string) => {
    setToDate(next);
    if (fromDate && diffInDays(fromDate, next) > MAX_DATE_DIFF_DAYS) {
      const d = new Date(next);
      d.setDate(d.getDate() - MAX_DATE_DIFF_DAYS);
      setFromDate(isoFromDate(d));
    }
    if (fromDate && diffInDays(fromDate, next) < 0) {
      setFromDate(next);
    }
  };

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
    if (diffInDays(fromDate, toDate) < 0) {
      toastAlert("error", "From Date cannot be after To Date");
      return;
    }
    if (diffInDays(fromDate, toDate) > MAX_DATE_DIFF_DAYS) {
      toastAlert(
        "error",
        `Date range can be at most ${MAX_DATE_DIFF_DAYS + 1} days (NSE limit).`,
      );
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
      // Backend sends { status, remark, data: <nseRaw> } encrypted; the
      // axios interceptor decrypts to res.data.data, so the raw NSE
      // payload (with response_status, report_data, error_remark) lives
      // at res.data.data.data depending on the wrapper depth.
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const responseStatus =
        inner?.response_status ?? outer?.response_status ?? "";
      const errorRemark =
        inner?.error_remark || outer?.error_remark || "";
      const rows: any[] =
        inner?.report_data || outer?.report_data || [];

      // NSE returns response_status=F + error_remark for two very
      // different situations:
      //   1. Empty result — "No record(s) found." (not an error, just
      //      means there are no orders in this window). Treat as empty.
      //   2. Real validation/auth failure — "Maximum Difference between
      //      from_date to to_date should be 7 days.", "Invalid date",
      //      "Invalid authorization header." etc. Toast loudly.
      const isEmptyRemark =
        !!errorRemark &&
        /no\s+record/i.test(errorRemark);
      if ((responseStatus === "F" || errorRemark) && !isEmptyRemark) {
        toastAlert("error", errorRemark || "NSE rejected the report request");
        setOrders([]);
        setFetched(true);
        return;
      }
      if (isEmptyRemark) {
        setOrders([]);
        setFetched(true);
        toastAlert("info", "No orders found for the selected date range");
        return;
      }

      const mapped: OrderRow[] = rows.map((r: any) => ({
        order_date: r.order_date || r.orderDate || r.request_date || "--",
        investor_name:
          r.investor_name ||
          r.investorName ||
          r.clientName ||
          r.first_applicant_name ||
          "--",
        folio_no: r.folio_no || r.folioNo || r.folio || "--",
        scheme_name: r.scheme_name || r.schemeName || r.scheme || "--",
        trans_type: r.trans_type || r.transType || r.buySell || r.transaction_type || "--",
        amount: r.amount || r.orderAmount || "--",
        units: r.units || r.orderUnits || r.quantity || "--",
        status: r.status || r.orderStatus || r.order_status || "--",
        remarks: r.remarks || r.remark || r.order_remark || "--",
        order_id: r.order_id || r.orderId || r.orderNo || "",
      }));
      setOrders(mapped);
      setFetched(true);
      if (mapped.length === 0)
        toastAlert("info", "No orders found for the selected date range");
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
            max={toDate || undefined}
            onChange={(e) => handleFromChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => handleToChange(e.target.value)}
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
        <span className="text-[11px] text-[#6B7280] ml-auto">
          NSE limits this report to a {MAX_DATE_DIFF_DAYS + 1}-day window.
        </span>
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
