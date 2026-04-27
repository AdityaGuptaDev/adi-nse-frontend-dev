"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";
import { FiDownload, FiSearch, FiRefreshCw } from "react-icons/fi";

// Transaction Detail Report — NSE MF Desk v1.9.6
// Endpoint: POST /nsemfdesk/api/v2/reports/TRANSACTION_DETAIL_REPORT
// Filters mirror the spec 1:1. Server enforces the 7/3-day window, but we
// pre-validate client-side to avoid a round-trip rejection.

type DateType = "REQUEST_DATE" | "ORDER_DATE" | "LAST_ACTIVITY_DATE";

interface ReportRow {
  member_code?: string;
  client_code?: string;
  mode_of_holding?: string;
  tax_status?: string;
  primary_holder_name?: string;
  primary_holder_pan?: string;
  primary_holder_mobile?: string;
  primary_holder_email?: string;
  product_type?: string;
  product_id?: string;
  product_reg_date_time?: string;
  frequency?: string;
  transaction_type?: string;
  amc_name?: string;
  rta_name?: string;
  scheme_name_from?: string;
  scheme_code_from?: string;
  scheme_name_to?: string;
  scheme_code_to?: string;
  dp_folio_no?: string;
  folio_no?: string;
  amount_units?: string;
  order_status?: string;
  order_remark?: string;
  mode_of_payment?: string;
  payment_bank_name?: string;
  payment_status?: string;
  payment_date_time?: string;
  payment_reference_no?: string;
  reconciliation_status?: string;
  alloted_nav?: string;
  alloted_unit?: string;
  alloted_amount?: string;
  stt?: string;
  refund_amount?: string;
  redemption_payout_amount?: string;
  entry_by?: string;
  sub_broker_code?: string;
  sub_broker_arn?: string;
  euin?: string;
  [k: string]: any;
}

// ── Date helpers ──────────────────────────────────────────────────────────
const pad2 = (n: number) => String(n).padStart(2, "0");
const toInputDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function todayStr(): string {
  return toInputDate(new Date());
}
function nDaysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toInputDate(d);
}
// yyyy-mm-dd (HTML date input) → dd-mm-yyyy (NSE spec)
function toApiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}
function daysBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Status badge palette ──────────────────────────────────────────────────
function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("success") || s.includes("allotted") || s.includes("valid"))
    return "bg-green-100 text-green-700";
  if (s.includes("fail") || s.includes("reject") || s.includes("invalid"))
    return "bg-red-100 text-red-700";
  if (s.includes("pending") || s.includes("authorization"))
    return "bg-yellow-100 text-yellow-700";
  if (s.includes("progress") || s.includes("process"))
    return "bg-blue-100 text-blue-700";
  return "bg-[#1F1A1A] text-[#9CA3AF]";
}

// ── Component ─────────────────────────────────────────────────────────────
export default function NseTransactionReport() {
  const [fromDate, setFromDate] = useState<string>(nDaysAgoStr(7));
  const [toDate, setToDate] = useState<string>(todayStr());
  const [dateType, setDateType] = useState<DateType>("REQUEST_DATE");
  const [clientCode, setClientCode] = useState<string>("");
  const [applicantName, setApplicantName] = useState<string>("");
  const [pan, setPan] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [systematicRegId, setSystematicRegId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [fetched, setFetched] = useState(false);
  const [errorRemark, setErrorRemark] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  // Pre-fill client_code with the investor's own UCC when the user lands on
  // the page. Falls back silently if the investor isn't NSE-onboarded.
  useEffect(() => {
    const userData: any = getLS(USER_DATA);
    const userTypeId =
      userData?.InvestorRegistration?.userType_id ??
      userData?.partner?.userType_id ??
      userData?.userTypeId;
    if (userTypeId !== 2) return;

    const rawMobile =
      userData?.InvestorRegistration?.reg_mobile ||
      userData?.InvestorRegistration?.mobile ||
      userData?.mobile;
    const mobile = rawMobile
      ? String(rawMobile).replace(/\D/g, "").slice(-10)
      : "";
    if (!mobile) return;

    (async () => {
      try {
        const res = await api.get("/nse/ucc/investor-list", {
          params: { limit: 100, ucc_status: "created", mobile },
        });
        const payload = res?.data?.data ?? res?.data ?? {};
        const investors = payload?.data?.investors || [];
        const firstUcc = investors?.[0]?.client_code;
        if (firstUcc) setClientCode(firstUcc);
      } catch {
        // no-op — the user can still type their UCC manually
      }
    })();
  }, []);

  // Client-side pre-validation of the NSE spec's date-window rule.
  const dateWindowValid = useMemo(() => {
    if (!fromDate || !toDate) return false;
    const gap = daysBetween(fromDate, toDate);
    if (gap < 0) return false;
    const maxGap = dateType === "LAST_ACTIVITY_DATE" ? 3 : 7;
    return gap <= maxGap;
  }, [fromDate, toDate, dateType]);

  const maxGapLabel = dateType === "LAST_ACTIVITY_DATE" ? "3 days" : "7 days";

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toastAlert("warn", "Please select both From Date and To Date");
      return;
    }
    if (!dateWindowValid) {
      toastAlert(
        "error",
        `From / To date window can't exceed ${maxGapLabel} for ${dateType}`
      );
      return;
    }
    if (pan && pan.length !== 10) {
      toastAlert("error", "PAN must be exactly 10 characters");
      return;
    }
    const splitIds = (s: string) =>
      s.split(",").map((x) => x.trim()).filter(Boolean);
    if (orderId && splitIds(orderId).length > 50) {
      toastAlert("error", "Order ID supports at most 50 comma-separated values");
      return;
    }
    if (systematicRegId && splitIds(systematicRegId).length > 50) {
      toastAlert(
        "error",
        "Systematic Reg ID supports at most 50 comma-separated values"
      );
      return;
    }

    setLoading(true);
    setErrorRemark("");
    try {
      const payload: Record<string, string> = {
        from_date: toApiDate(fromDate),
        to_date: toApiDate(toDate),
        date_type: dateType,
      };
      // Only include optional filters when non-empty — NSE treats empty
      // strings as literal filters on some fields.
      if (clientCode.trim()) payload.client_code = clientCode.trim();
      if (applicantName.trim()) payload.applicant_name = applicantName.trim();
      if (pan.trim()) payload.pan = pan.trim().toUpperCase();
      if (orderId.trim()) payload.order_id = orderId.trim();
      if (systematicRegId.trim()) payload.systematic_reg_id = systematicRegId.trim();

      const res = await api.post("/nse/transaction-detail-report", payload);

      // Backend envelope: { status: "S"|"F", remark, data: <raw NSE body>, http_status }
      // On upstream failure the backend still returns HTTP 200 with status "F"
      // so the error_remark reaches us intact.
      const envelope = res?.data ?? {};
      const envelopeStatus = envelope?.status || "";
      const envelopeRemark = envelope?.remark || "";
      const nse = envelope?.data ?? {};
      // NSE sometimes wraps the real body under `.data` again.
      const nseBody = nse?.data ?? nse ?? {};

      const nseStatus = nseBody?.response_status || "";
      const data: ReportRow[] = Array.isArray(nseBody?.report_data)
        ? nseBody.report_data
        : [];
      const totalCount = Number(nseBody?.report_data_total || data.length || 0);
      const nseRemark = nseBody?.error_remark || "";

      setRows(data);
      setTotal(totalCount);
      setFetched(true);

      if (envelopeStatus === "F" || nseStatus === "F") {
        const msg = nseRemark || envelopeRemark || "NSE returned a failure status";
        setErrorRemark(msg);
        toastAlert("error", msg);
      } else if (data.length === 0) {
        toastAlert("info", "No transactions found for the selected filters");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFromDate(nDaysAgoStr(7));
    setToDate(todayStr());
    setDateType("REQUEST_DATE");
    setApplicantName("");
    setPan("");
    setOrderId("");
    setSystematicRegId("");
    setRows([]);
    setFetched(false);
    setTotal(0);
    setErrorRemark("");
  };

  // Simple CSV export of the current result set. Keeps parity with other NSE
  // report pages' "Export" buttons without pulling in the XLSX lib here.
  const exportCsv = () => {
    if (!rows.length) {
      toastAlert("warn", "Nothing to export yet");
      return;
    }
    const headers = [
      "client_code",
      "primary_holder_name",
      "primary_holder_pan",
      "product_type",
      "product_id",
      "product_reg_date_time",
      "transaction_type",
      "frequency",
      "amc_name",
      "scheme_name_from",
      "scheme_code_from",
      "scheme_name_to",
      "scheme_code_to",
      "folio_no",
      "dp_folio_no",
      "amount_units",
      "order_status",
      "order_remark",
      "mode_of_payment",
      "payment_status",
      "payment_reference_no",
      "alloted_nav",
      "alloted_unit",
      "alloted_amount",
      "euin",
      "sub_broker_arn",
    ];
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv =
      [headers.join(",")]
        .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(",")))
        .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nse-transaction-report-${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="nse-module p-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold text-[#F9FAFB] mb-1">Transaction Detail Report</h1>
      <p className="text-sm text-[#9CA3AF] mb-6">
        NSE MF Desk · Max window {maxGapLabel} · up to 50 order ids per request
      </p>

      {/* ── Filters ── */}
      <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">From Date *</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">To Date *</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              max={todayStr()}
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Date Type</label>
            <select
              value={dateType}
              onChange={(e) => setDateType(e.target.value as DateType)}
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <option value="REQUEST_DATE">Request Date</option>
              <option value="ORDER_DATE">Order Date</option>
              <option value="LAST_ACTIVITY_DATE">Last Activity Date</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Client Code (UCC)</label>
            <input
              type="text"
              value={clientCode}
              maxLength={20}
              onChange={(e) => setClientCode(e.target.value)}
              placeholder="e.g. 1009"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Applicant Name</label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="First holder name"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">PAN</label>
            <input
              type="text"
              value={pan}
              maxLength={10}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Order ID <span className="text-[#6B7280] font-normal">(overrides other filters)</span>
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Comma-separated, up to 50"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Systematic Reg ID <span className="text-[#6B7280] font-normal">(SIP/XSIP/STP/SWP)</span>
            </label>
            <input
              type="text"
              value={systematicRegId}
              onChange={(e) => setSystematicRegId(e.target.value)}
              placeholder="Comma-separated, up to 50"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
        </div>

        {!dateWindowValid && fromDate && toDate && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            NSE limits {dateType.replaceAll("_", " ").toLowerCase()} searches to a {maxGapLabel} window.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={fetchReport}
            disabled={loading || !dateWindowValid}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <FiSearch className="w-4 h-4" />
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={resetFilters}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3A3A3A] text-[#9CA3AF] text-sm hover:bg-[#1F1A1A]"
          >
            <FiRefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3A3A3A] text-[#9CA3AF] text-sm hover:bg-[#1F1A1A] disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>

          {fetched && (
            <div className="ml-auto text-xs text-[#9CA3AF]">
              Showing <span className="font-semibold text-[#F9FAFB]">{rows.length}</span>
              {total > rows.length ? ` of ${total}` : ""} record{rows.length === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {errorRemark && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {errorRemark}
          </div>
        )}
      </div>

      {/* ── Results table ── */}
      <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#1F1A1A]">
              <Th>Order ID</Th>
              <Th>Registered</Th>
              <Th>UCC</Th>
              <Th>Primary Holder</Th>
              <Th>PAN</Th>
              <Th>Product</Th>
              <Th>Type</Th>
              <Th>Frequency</Th>
              <Th>AMC</Th>
              <Th>Scheme</Th>
              <Th>Folio</Th>
              <Th right>Amount / Units</Th>
              <Th center>Order Status</Th>
              <Th center>Payment Status</Th>
              <Th right>Alloted NAV</Th>
              <Th right>Alloted Units</Th>
              <Th right>Alloted Amount</Th>
              <Th>EUIN</Th>
            </tr>
          </thead>
          <tbody>
            {!fetched ? (
              <tr>
                <td colSpan={18} className="text-center py-12 text-[#6B7280]">
                  Select filters and click Search to view transactions
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={18} className="text-center py-12 text-[#6B7280]">
                  No transactions found
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx} className="border-b border-[#2A2A2A] hover:bg-[#1F1A1A] transition">
                  <Td className="font-mono text-xs">{r.product_id || "--"}</Td>
                  <Td className="whitespace-nowrap">{r.product_reg_date_time || "--"}</Td>
                  <Td className="font-mono text-xs">{r.client_code || "--"}</Td>
                  <Td>{r.primary_holder_name || "--"}</Td>
                  <Td className="font-mono text-xs">{r.primary_holder_pan || "--"}</Td>
                  <Td>{r.product_type || "--"}</Td>
                  <Td>{r.transaction_type || "--"}</Td>
                  <Td>{r.frequency || "--"}</Td>
                  <Td>{r.amc_name || "--"}</Td>
                  <Td className="max-w-[260px] truncate" title={r.scheme_name_from}>
                    {r.scheme_name_from || "--"}
                    {r.scheme_name_to && r.scheme_name_to.trim() ? (
                      <span className="text-[#6B7280]"> → {r.scheme_name_to}</span>
                    ) : null}
                  </Td>
                  <Td className="font-mono text-xs">{r.folio_no?.trim() || r.dp_folio_no || "--"}</Td>
                  <Td className="text-right whitespace-nowrap">{r.amount_units || "--"}</Td>
                  <Td center>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(r.order_status || "")}`}>
                      {r.order_status || "--"}
                    </span>
                  </Td>
                  <Td center>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge(r.payment_status || "")}`}>
                      {r.payment_status?.trim() || "--"}
                    </span>
                  </Td>
                  <Td right>{r.alloted_nav?.trim() || "--"}</Td>
                  <Td right>{r.alloted_unit?.trim() || "--"}</Td>
                  <Td right>{r.alloted_amount?.trim() || "--"}</Td>
                  <Td className="font-mono text-xs">{r.euin || "--"}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tiny cell primitives to keep the JSX above readable ──────────────────
function Th({ children, right, center }: { children: React.ReactNode; right?: boolean; center?: boolean }) {
  const align = right ? "text-right" : center ? "text-center" : "text-left";
  return (
    <th className={`${align} px-4 py-3 text-[#9CA3AF] font-semibold whitespace-nowrap text-xs uppercase tracking-wider`}>
      {children}
    </th>
  );
}
function Td({
  children,
  right,
  center,
  className = "",
  title,
}: {
  children: React.ReactNode;
  right?: boolean;
  center?: boolean;
  className?: string;
  title?: string;
}) {
  const align = right ? "text-right" : center ? "text-center" : "text-left";
  return (
    <td className={`px-4 py-3 text-[#F9FAFB] ${align} ${className}`} title={title}>
      {children}
    </td>
  );
}
