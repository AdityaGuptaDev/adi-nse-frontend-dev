"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { FiSearch, FiUser, FiShield, FiCreditCard, FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";

// ── Types ──
interface AuthRecord {
  auth_email_sent: string;
  auth_status: string;
  member_code: string;
  client_code: string;
  primary_holder_name: string;
  primary_holder_dob: string;
  tax_status: string;
  gender: string;
  holding_nature: string;
  second_holder_name: string;
  third_holder_name: string;
  guardian_name: string;
  primary_holder_pan: string;
  primary_holder_kyc_status: string;
  primary_holder_kyc_status_remarks: string;
  second_holder_pan: string;
  second_holder_kyc_status: string;
  second_holder_kyc_status_remarks: string;
  third_holder_pan: string;
  third_holder_kyc_status: string;
  third_holder_kyc_status_remarks: string;
  guardian_pan: string;
  created_by: string;
  created_at: string;
  first_holder_fatca_exists: string;
  first_holder_fatca_remarks: string;
  first_holder_aof_exists: string;
  first_holder_aof_elog_remarks: string;
  first_holder_elog_exists: string;
  first_holder_email: string;
  first_holder_mobile_no: string;
  first_holder_auth_status: string;
  first_holder_auth_remarks: string;
  first_holder_auth_datetime: string;
  second_holder_fatca_exists: string;
  second_holder_fatca_remarks: string;
  second_holder_aof_exists: string;
  second_holder_aof_elog_remarks: string;
  second_holder_elog_exists: string;
  second_holder_email: string;
  second_holder_mobile_no: string;
  second_holder_auth_status: string;
  second_holder_auth_remarks: string;
  second_holder_auth_datetime: string;
  third_holder_fatca_exists: string;
  third_holder_fatca_remarks: string;
  third_holder_aof_exists: string;
  third_holder_aof_elog_remakrs: string;
  third_holder_elog_exists: string;
  third_holder_email: string;
  third_holder_mobile_no: string;
  third_holder_auth_status: string;
  third_holder_auth_remarks: string;
  third_holder_auth_datetime: string;
  demat_status: string;
  dp_remarks: string;
  default_dp: string;
  cdsl_dpid: string;
  cdsl_cltid: string;
  cmbp_id: string;
  nsdl_dpid: string;
  nsdl_cltid: string;
  bank1_account_type: string;
  bank1_account_no: string;
  bank1_name: string;
  bank1_ifsc: string;
  bank1_status: string;
  bank1_rejection_remarks: string;
  bank2_account_type: string;
  bank2_account_no: string;
  bank2_name: string;
  bank2_ifsc: string;
  bank2_status: string;
  bank2_rejection_remarks: string;
  bank3_account_type: string;
  bank3_account_no: string;
  bank3_name: string;
  bank3_ifsc: string;
  bank3_status: string;
  bank3_rejection_remarks: string;
  bank4_account_type: string;
  bank4_account_no: string;
  bank4_name: string;
  bank4_ifsc: string;
  bank4_status: string;
  bank4_rejection_remarks: string;
  bank5_account_type: string;
  bank5_account_no: string;
  bank5_name: string;
  bank5_ifsc: string;
  bank5_status: string;
  bank5_rejection_remarks: string;
}

const TAX_STATUS_MAP: Record<string, string> = {
  "01": "Individual", "02": "On Behalf of Minor", "03": "HUF", "04": "Company",
  "06": "Partnership Firm", "07": "Body Corporate", "08": "Trust", "09": "Society",
  "11": "NRI-Repatriable", "12": "NRI-Non Repatriable", "21": "Sole Proprietorship",
};

const HOLDING_MAP: Record<string, string> = { SI: "Single", JO: "Joint", AS: "Anyone or Survivor" };
const ACCOUNT_TYPE_MAP: Record<string, string> = { SB: "Savings", CB: "Current", NE: "NRE", NO: "NRO" };

function StatusBadge({ status }: { status: string }) {
  if (!status || status.trim() === "") return <span className="text-xs text-[#6B7280]">--</span>;
  const s = status.toUpperCase();
  const isSuccess = s === "SUCCESS" || s === "AUTHORIZE" || s === "ACTIVE" || s === "Y";
  const isPending = s === "PENDING" || s === "UNDER PROCESS" || s === "REVIEW";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      isSuccess ? "bg-green-50 text-green-700 border border-green-200"
      : isPending ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-red-50 text-red-600 border border-red-200"
    }`}>
      {isSuccess ? <FiCheckCircle className="w-3 h-3" /> : isPending ? <FiClock className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

function YesNoBadge({ value, label }: { value: string; label: string }) {
  if (!value || value.trim() === "") return null;
  const yes = value.toUpperCase() === "Y";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${yes ? "text-green-600" : "text-red-500"}`}>
      {yes ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | undefined; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-[#9CA3AF] text-xs">{label}</span>
      <span className={`text-sm font-medium text-[#F9FAFB] text-right ${mono ? "font-mono" : ""}`}>{value || "--"}</span>
    </div>
  );
}

// ══════════════════════════════════════════
//  Expandable Record Card
// ══════════════════════════════════════════
function RecordCard({ record, index }: { record: AuthRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);

  // Collect banks
  const banks = [1, 2, 3, 4, 5].map((i) => {
    const accNo = (record as any)[`bank${i}_account_no`];
    if (!accNo) return null;
    return {
      name: (record as any)[`bank${i}_name`] || "",
      account_no: accNo,
      account_type: (record as any)[`bank${i}_account_type`] || "",
      ifsc: (record as any)[`bank${i}_ifsc`] || "",
      status: (record as any)[`bank${i}_status`] || "",
      rejection_remarks: (record as any)[`bank${i}_rejection_remarks`] || "",
    };
  }).filter(Boolean);

  // Collect holders
  const holders = [
    { prefix: "first_holder", name: record.primary_holder_name, pan: record.primary_holder_pan, kyc: record.primary_holder_kyc_status, kycRemarks: record.primary_holder_kyc_status_remarks },
    record.second_holder_name ? { prefix: "second_holder", name: record.second_holder_name, pan: record.second_holder_pan, kyc: record.second_holder_kyc_status, kycRemarks: record.second_holder_kyc_status_remarks } : null,
    record.third_holder_name ? { prefix: "third_holder", name: record.third_holder_name, pan: record.third_holder_pan, kyc: record.third_holder_kyc_status, kycRemarks: record.third_holder_kyc_status_remarks } : null,
  ].filter(Boolean);

  return (
    <div className="border border-[#2A2A2A] rounded-xl overflow-hidden mb-4">
      {/* Summary Row */}
      <div
        className="flex items-center justify-between px-5 py-4 bg-[#111111] hover:bg-[#1F1A1A]/50 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-xs text-[#6B7280] font-mono w-6">{index + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#F9FAFB]">{record.primary_holder_name || "--"}</span>
              <span className="font-mono text-xs text-[#9CA3AF]">{record.client_code || "--"}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#9CA3AF]">
              <span>PAN: <strong className="text-[#E5E7EB]">{record.primary_holder_pan || "--"}</strong></span>
              <span>{TAX_STATUS_MAP[record.tax_status] || record.tax_status || "--"}</span>
              <span>{HOLDING_MAP[record.holding_nature] || record.holding_nature || "--"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={record.auth_status} />
          {expanded ? <FiChevronUp className="w-4 h-4 text-[#6B7280]" /> : <FiChevronDown className="w-4 h-4 text-[#6B7280]" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[#2A2A2A] bg-[#1F1A1A]/30 px-5 py-5 space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-3">
                <FiUser className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-sm font-semibold text-[#E5E7EB]">Investor Details</h4>
              </div>
              <InfoRow label="Name" value={record.primary_holder_name} />
              <InfoRow label="PAN" value={record.primary_holder_pan} mono />
              <InfoRow label="DOB" value={record.primary_holder_dob} />
              <InfoRow label="Gender" value={record.gender === "M" ? "Male" : record.gender === "F" ? "Female" : record.gender} />
              <InfoRow label="Tax Status" value={TAX_STATUS_MAP[record.tax_status] || record.tax_status} />
              <InfoRow label="Holding" value={HOLDING_MAP[record.holding_nature] || record.holding_nature} />
              <InfoRow label="Client Code" value={record.client_code} mono />
              <InfoRow label="Member Code" value={record.member_code} mono />
              <InfoRow label="Created By" value={record.created_by} />
              <InfoRow label="Created At" value={record.created_at} />
              {record.guardian_name && <InfoRow label="Guardian" value={`${record.guardian_name} (${record.guardian_pan || ""})`} />}
            </div>

            <div className="bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-3">
                <FiShield className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-sm font-semibold text-[#E5E7EB]">Authorization & KYC</h4>
              </div>
              <InfoRow label="Auth Email Sent" value={record.auth_email_sent} />
              <InfoRow label="Overall Auth Status" value={record.auth_status} />
              <div className="my-2 border-t border-[#2A2A2A]" />
              {holders.map((h: any, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[10px] text-[#6B7280] uppercase font-semibold mb-1">{i === 0 ? "Primary" : i === 1 ? "Second" : "Third"} Holder</p>
                  <InfoRow label="Auth Status" value={(record as any)[`${h.prefix}_auth_status`]} />
                  <InfoRow label="Auth DateTime" value={(record as any)[`${h.prefix}_auth_datetime`]} />
                  {(record as any)[`${h.prefix}_auth_remarks`] && <InfoRow label="Auth Remarks" value={(record as any)[`${h.prefix}_auth_remarks`]} />}
                  <InfoRow label="KYC Status" value={h.kyc} />
                  {h.kycRemarks && <InfoRow label="KYC Remarks" value={h.kycRemarks} />}
                </div>
              ))}
            </div>

            <div className="bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-3">
                <FiCreditCard className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-sm font-semibold text-[#E5E7EB]">Documents & Demat</h4>
              </div>
              {holders.map((h: any, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[10px] text-[#6B7280] uppercase font-semibold mb-1">{i === 0 ? "Primary" : i === 1 ? "Second" : "Third"} Holder</p>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <YesNoBadge value={(record as any)[`${h.prefix}_fatca_exists`]} label="FATCA" />
                    <YesNoBadge value={(record as any)[`${h.prefix}_aof_exists`]} label="AOF" />
                    <YesNoBadge value={(record as any)[`${h.prefix}_elog_exists`]} label="eLog" />
                  </div>
                  {(record as any)[`${h.prefix}_fatca_remarks`] && <InfoRow label="FATCA Remark" value={(record as any)[`${h.prefix}_fatca_remarks`]} />}
                  {(record as any)[`${h.prefix}_aof_elog_remarks`] && <InfoRow label="AOF/eLog Remark" value={(record as any)[`${h.prefix}_aof_elog_remarks`]} />}
                  <InfoRow label="Email" value={(record as any)[`${h.prefix}_email`]} />
                  <InfoRow label="Mobile" value={(record as any)[`${h.prefix}_mobile_no`]} />
                </div>
              ))}
              <div className="mt-2 border-t border-[#2A2A2A] pt-2">
                <p className="text-[10px] text-[#6B7280] uppercase font-semibold mb-1">Demat Account</p>
                <InfoRow label="Status" value={record.demat_status} />
                {record.dp_remarks && <InfoRow label="DP Remarks" value={record.dp_remarks} />}
                <InfoRow label="Default DP" value={record.default_dp} />
                {record.cdsl_dpid && <InfoRow label="CDSL DPID" value={record.cdsl_dpid} mono />}
                {record.cdsl_cltid && <InfoRow label="CDSL Client ID" value={record.cdsl_cltid} mono />}
                {record.cmbp_id && <InfoRow label="CMBP ID" value={record.cmbp_id} mono />}
                {record.nsdl_dpid && <InfoRow label="NSDL DPID" value={record.nsdl_dpid} mono />}
                {record.nsdl_cltid && <InfoRow label="NSDL Client ID" value={record.nsdl_cltid} mono />}
              </div>
            </div>
          </div>

          {/* Bank Details Table */}
          {banks.length > 0 && (
            <div className="bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-3">
                <BsBank2 className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-sm font-semibold text-[#E5E7EB]">Bank Accounts</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#6B7280] uppercase border-b border-[#2A2A2A]">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Bank Name</th>
                      <th className="text-left py-2 px-2">Account No</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">IFSC</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 px-2 text-[#6B7280] text-xs">{i + 1}</td>
                        <td className="py-2 px-2 text-[#E5E7EB]">{bank.name || "--"}</td>
                        <td className="py-2 px-2 font-mono text-xs text-[#E5E7EB]">{bank.account_no}</td>
                        <td className="py-2 px-2 text-xs">{ACCOUNT_TYPE_MAP[bank.account_type] || bank.account_type}</td>
                        <td className="py-2 px-2 font-mono text-xs">{bank.ifsc || "--"}</td>
                        <td className="py-2 px-2"><StatusBadge status={bank.status} /></td>
                        <td className="py-2 px-2 text-xs text-[#9CA3AF] max-w-[150px] truncate">{bank.rejection_remarks || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//  Main Page Component
// ══════════════════════════════════════════
export default function NseClientAuth() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AuthRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [errorRemark, setErrorRemark] = useState("");

  // Filters
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const formatForInput = (d: Date) => d.toISOString().split("T")[0];
  const formatForApi = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const [fromDate, setFromDate] = useState(formatForInput(sevenDaysAgo));
  const [toDate, setToDate] = useState(formatForInput(today));
  const [clientCode, setClientCode] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [dateType, setDateType] = useState("AUTH_SENT_DATE");

  const handleSearch = async () => {
    setLoading(true);
    setRecords([]);
    setErrorRemark("");
    try {
      const payload: any = {
        from_date: formatForApi(fromDate),
        to_date: formatForApi(toDate),
      };
      if (clientCode.trim()) payload.client_code = clientCode.trim();
      if (authStatus) payload.auth_status = authStatus;
      if (dateType) payload.date_type = dateType;

      const res = await api.post("/nse/client-auth-report", payload);
      const responseData = res?.data?.data ?? res?.data;

      if (responseData?.status === "S") {
        const data = responseData?.data;
        // Handle both direct response and nested response
        const reportData = data?.report_data || data?.data?.report_data || [];
        const total = data?.report_data_total || data?.data?.report_data_total || reportData.length;
        setRecords(reportData);
        setTotalRecords(Number(total));
        if (reportData.length === 0) {
          toastAlert("info", "No records found for the selected criteria");
        }
      } else {
        setErrorRemark(responseData?.remark || responseData?.data?.error_remark || "Failed to fetch report");
        toastAlert("error", responseData?.remark || "Failed to fetch client authorization report");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  // Summary counts
  const countByStatus = (status: string) => records.filter((r) => r.auth_status?.toUpperCase() === status).length;

  return (
    <div className="nse-module p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F9FAFB]">Client Authorization Report</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Check NSE client authorization, KYC, FATCA, AOF, eLog and bank verification status</p>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">From Date *</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">To Date *</label>
            <input
              type="date"
              value={toDate}
              max={formatForInput(today)}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Client Code</label>
            <input
              type="text"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value.toUpperCase())}
              placeholder="e.g. K123"
              className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Auth Status</label>
            <select
              value={authStatus}
              onChange={(e) => setAuthStatus(e.target.value)}
              className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="AUTHORIZE">Authorized</option>
              <option value="REVIEW">Review</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Date Type</label>
            <select
              value={dateType}
              onChange={(e) => setDateType(e.target.value)}
              className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <option value="AUTH_SENT_DATE">Auth Sent Date</option>
              <option value="AUTH_DONE_DATE">Auth Done Date</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#F59E0B] text-white rounded-lg text-sm font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSearch className="w-4 h-4" />
            {loading ? "Searching..." : "Search"}
          </button>
          {records.length > 0 && (
            <span className="text-xs text-[#9CA3AF]">Found <strong className="text-[#F9FAFB]">{totalRecords}</strong> record(s)</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", count: records.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Authorized", count: countByStatus("SUCCESS"), color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Pending", count: countByStatus("PENDING"), color: "bg-amber-50 text-amber-700 border-amber-200" },
            { label: "Failed", count: records.length - countByStatus("SUCCESS") - countByStatus("PENDING"), color: "bg-red-50 text-red-600 border-red-200" },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
              <div className="text-2xl font-bold">{card.count}</div>
              <div className="text-xs font-medium mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {errorRemark && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {errorRemark}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-[#6B7280]">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-[#F59E0B]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading client authorization data...
          </div>
        </div>
      )}

      {/* Records */}
      {!loading && records.length > 0 && (
        <div>
          <p className="text-xs text-[#9CA3AF] mb-3">Click on a record to expand full details including holder info, documents, demat and bank accounts.</p>
          {records.map((record, idx) => (
            <RecordCard key={`${record.client_code}-${idx}`} record={record} index={idx} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && records.length === 0 && !errorRemark && (
        <div className="text-center py-16 text-[#6B7280]">
          <FiShield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Select date range and click Search to view client authorization status</p>
        </div>
      )}
    </div>
  );
}
