"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import { decryptQuery, handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FiEdit,
  FiFileText,
  FiCreditCard,
  FiTrash2,
  FiMoreVertical,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiUpload,
  FiList,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";

// ── Types ──
interface Investor {
  id: number;
  investor_id: number | null;
  client_code: string | null;
  name: string;
  pan: string | null;
  email: string | null;
  mobile: string | null;
  gender: string | null;
  dob: string | null;
  tax_status: string | null;
  holding_nature: string | null;
  form_step: number | null;
  ucc_created: boolean;
  ucc_status: string;
  reg_id: string | null;
  reg_status: string | null;
  reg_remark: string | null;
  fatca_uploaded?: boolean | null;
  fatca_status?: string | null;
  fatca_remark?: string | null;
  created_at: string | null;
  updated_at: string | null;
  banks?: BankDetail[];
  latest_nse_log: {
    log_id: number;
    status: string;
    remark: string | null;
    reg_id: string | null;
    reg_status: string | null;
    reg_remark: string | null;
    submitted_at: string | null;
  } | null;
}

// Normalized mandate shape — unified view over both:
//  - the response from POST /nse/mandate-purchase (after create)
//  - each report_data row from POST /nse/mandate-status (list fetch)
interface NormalizedMandate {
  mandate_id: string | null;
  status: string | null;
  remark: string | null;
  client_code: string | null;
  amount: string | null;
  mandate_type: string | null;
  account_no: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_date: string | null;
  approved_date: string | null;
  umrn_no: string | null;
  source: "created" | "status";
}

const _clean = (v: any): string | null => {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
};

function normalizeMandateFromCreate(r: any): NormalizedMandate {
  return {
    mandate_id: _clean(r?.reg_id),
    status: _clean(r?.reg_status),
    remark: _clean(r?.reg_remark),
    client_code: _clean(r?.client_code),
    amount: _clean(r?.amount),
    mandate_type: _clean(r?.mandate_type),
    account_no: _clean(r?.account_no),
    ifsc_code: _clean(r?.ifsc_code),
    bank_name: null,
    bank_branch: null,
    start_date: _clean(r?.start_date),
    end_date: _clean(r?.end_date),
    registration_date: null,
    approved_date: null,
    umrn_no: null,
    source: "created",
  };
}

function normalizeMandateFromStatus(r: any): NormalizedMandate {
  return {
    mandate_id: _clean(r?.mandateId || r?.mandate_id),
    status: _clean(r?.status),
    remark: _clean(r?.remarks || r?.rejectReason),
    client_code: _clean(r?.clientCode || r?.client_code),
    amount: _clean(r?.amount),
    mandate_type: _clean(r?.mandateType || r?.mandate_type),
    account_no: _clean(r?.bankAccountNumber || r?.account_no),
    ifsc_code: _clean(r?.ifscCode || r?.ifsc_code),
    bank_name: _clean(r?.bankName),
    bank_branch: _clean(r?.bankBranch),
    start_date: _clean(r?.startDate),
    end_date: _clean(r?.endDate),
    registration_date: _clean(r?.registrationDate),
    approved_date: _clean(r?.approvedDate),
    umrn_no: _clean(r?.umrnNo),
    source: "status",
  };
}

// NSE mandate-status requires a date window. Use last 5 years → today.
function buildMandateStatusDateRange(): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  const today = new Date();
  const past = new Date();
  past.setFullYear(past.getFullYear() - 5);
  return { from: fmt(past), to: fmt(today) };
}

async function fetchMandatesForClient(clientCode: string): Promise<NormalizedMandate[]> {
  if (!clientCode) return [];
  const { from, to } = buildMandateStatusDateRange();
  const res = await api.post("/nse/mandate-status", {
    mandate_id: "",
    client_code: clientCode,
    from_date: from,
    to_date: to,
  });
  // Backend wraps as { status:"S", data:<nseResponse> } and encrypts — the
  // axios interceptor decrypts into res.data.data, so the NSE payload sits
  // at res.data.data.data.
  const outer = res?.data?.data ?? {};
  const inner = outer?.data ?? outer;
  const rows: any[] = inner?.report_data || outer?.report_data || [];
  return rows.map(normalizeMandateFromStatus);
}

interface BankDetail {
  account_no: string;
  account_type: string;
  ifsc_code: string;
  micr_no: string;
  bank_name: string;
  branch_name: string;
  default_bank_flag: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Helpers ──
const TAX_STATUS_MAP: Record<string, string> = {
  "01": "Individual",
  "02": "On Behalf of Minor",
};

const STEP_LABELS: Record<number, string> = {
  0: "PAN & Aadhaar",
  1: "Holding Pattern",
  2: "Nominee Details",
  3: "Bank Details",
};

function formatDate(v: string | null | undefined): string {
  if (!v) return "--";
  try {
    const d = new Date(v);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return v;
  }
}

// ── Account Type Map ──
const ACCOUNT_TYPE_MAP: Record<string, string> = {
  SB: "Savings",
  CB: "Current",
  NE: "NRE",
  NO: "NRO",
};

// ══════════════════════════════════════════
//  Action Dropdown Menu
// ══════════════════════════════════════════
function ActionMenu({
  investor,
  onEdit,
  onCreateMandate,
  onMandateDetails,
  onManageBanks,
  onSubmitFatca,
  onDelete,
}: {
  investor: Investor;
  onEdit: () => void;
  onCreateMandate: () => void;
  onMandateDetails: () => void;
  onManageBanks: () => void;
  onSubmitFatca: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fatcaAlreadyDone = !!investor.fatca_uploaded;
  const items = [
    { icon: <FiEdit className="w-4 h-4" />, label: "Edit Profile", onClick: onEdit },
    { icon: <FiCreditCard className="w-4 h-4" />, label: "Create Mandate", onClick: onCreateMandate, disabled: !investor.ucc_created },
    { icon: <FiList className="w-4 h-4" />, label: "Mandate Details", onClick: onMandateDetails, disabled: !investor.ucc_created },
    { icon: <BsBank2 className="w-4 h-4" />, label: "Manage Banks", onClick: onManageBanks, disabled: !investor.ucc_created },
    {
      icon: <FiFileText className="w-4 h-4" />,
      label: fatcaAlreadyDone ? "FATCA Submitted ✓" : "Submit FATCA",
      onClick: fatcaAlreadyDone ? () => {} : onSubmitFatca,
      disabled: !investor.ucc_created || fatcaAlreadyDone,
    },
    { icon: <FiTrash2 className="w-4 h-4 text-red-500" />, label: "Delete Profile", onClick: onDelete, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiMoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                item.disabled
                  ? "opacity-40 cursor-not-allowed text-gray-400"
                  : item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//  Mandate Modal
// ══════════════════════════════════════════
function MandateModal({
  investor,
  onClose,
  onSuccess,
}: {
  investor: Investor;
  onClose: () => void;
  onSuccess: (data: any) => void;
}) {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [mandateType, setMandateType] = useState<"X" | "E">("X");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Date helpers
  const toISODate = (d: Date) => d.toISOString().split("T")[0]; // YYYY-MM-DD for <input type="date">
  const formatDateApi = (dateStr: string) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY for NSE API
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const todayISO = toISODate(new Date());
  const defaultEnd = new Date();
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 40);

  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(toISODate(defaultEnd));

  const banks: BankDetail[] = investor.banks || [];

  const selectedBankObj = banks.find((b) => b.account_no === selectedBank);

  const handleSubmit = async () => {
    if (!selectedBank) {
      toastAlert("error", "Please select a bank account");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toastAlert("error", "Please enter a valid amount");
      return;
    }
    if (!selectedBankObj) {
      toastAlert("error", "Selected bank not found");
      return;
    }
    if (!startDate || !endDate) {
      toastAlert("error", "Please select start and end dates");
      return;
    }
    if (endDate <= startDate) {
      toastAlert("error", "End date must be after start date");
      return;
    }

    setSubmitting(true);
    try {
      const formattedStartDate = formatDateApi(startDate);
      const formattedEndDate = formatDateApi(endDate);
      
      console.log('Original dates:', { startDate, endDate });
      console.log('Formatted dates:', { formattedStartDate, formattedEndDate });
      
      // const payload = {
      //   reg_data: [
      //     {
      //       client_code: investor.client_code || investor.pan || "",
      //       amount: amount,
      //       mandate_type: mandateType,
      //       account_no: selectedBankObj.account_no,
      //       ac_type: selectedBankObj.account_type,
      //       ifsc: selectedBankObj.ifsc_code, // Use 'ifsc' instead of 'ifsc_code' to avoid encryption
      //       micr_no: selectedBankObj.micr_no || "",
      //       start_date: formattedStartDate,
      //       end_date: formattedEndDate,
      //       member_mandate_no: "",
      //     },
      //   ],
      // };
      const payload = {
  reg_data: [
    {
      client_code: investor.client_code || investor.pan || "",
      amount: amount,
      mandate_type: mandateType,
      account_no: selectedBankObj.account_no,
      ac_type: selectedBankObj.account_type,
      ifsc_code: selectedBankObj.ifsc_code, // ✅ correct key
      micr_code: selectedBankObj.micr_no || "",
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      member_mandate_no: "",
    },
  ],
};
      
      console.log('Payload before encryption:', payload);

     const rawApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const res = await rawApi.post("/nse/mandate-purchase", payload);

      // Backend response is AES-encrypted via sendEncryptedResponse — rawApi
      // skips the interceptor, so decrypt the payload here manually.
      const rawBody = res?.data;
      let decryptedBody: any = rawBody?.data;
      try {
        if (typeof decryptedBody === "string") {
          decryptedBody = decryptQuery(decryptedBody);
        }
      } catch (e) {
        console.error("Failed to decrypt mandate response", e);
      }

      const innerStatus = decryptedBody?.status ?? rawBody?.status;
      const isSuccess =
        innerStatus === "S" || innerStatus === true || rawBody?.status === true;

      if (isSuccess) {
        const regData =
          decryptedBody?.data?.reg_data?.[0] ||
          decryptedBody?.reg_data?.[0] ||
          decryptedBody?.data?.[0] ||
          {};

        if (!regData?.reg_id && !regData?.reg_status) {
          toastAlert("error", "Mandate response did not contain registration details");
          return;
        }

        if (regData.reg_status === "REG_FAILED") {
          toastAlert("error", regData.reg_remark?.trim() || "Mandate registration failed");
        } else {
          // Merge submitted payload so the success modal + inline details can
          // show bank / amount / dates without another round-trip.
          const submitted = payload.reg_data[0] || {};
          const merged = { ...submitted, ...regData, created_at: new Date().toISOString() };
          toastAlert(
            "success",
            `Mandate created successfully. Reg ID: ${regData.reg_id} (${regData.reg_status})`
          );
          onSuccess(merged);
        }
      } else {
        const errMsg =
          decryptedBody?.remark ||
          decryptedBody?.message ||
          rawBody?.message ||
          "Failed to create mandate";
        toastAlert("error", errMsg);
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Submit Mandate</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Investor Details */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
              Investor Details
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-gray-400 text-xs">Investor Name</span>
                <div className="font-medium text-gray-800">{investor.name}</div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-xs">PAN</span>
                <div className="font-medium text-gray-800 font-mono">{investor.pan || "--"}</div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">UCC</span>
                <div className="font-medium text-gray-800 font-mono">{investor.client_code || investor.pan || "--"}</div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-xs">Tax Status</span>
                <div className="font-medium text-gray-800">
                  {investor.tax_status ? TAX_STATUS_MAP[investor.tax_status] || investor.tax_status : "--"}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
              Bank Details
            </h3>
            {banks.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No bank accounts found for this investor</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase">
                    <th className="text-left py-2 w-8"></th>
                    <th className="text-left py-2">Bank Name</th>
                    <th className="text-left py-2">Account No</th>
                    <th className="text-left py-2">IFSC</th>
                    <th className="text-left py-2">MICR</th>
                    <th className="text-left py-2">Branch</th>
                    <th className="text-left py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank) => (
                    <tr key={bank.account_no} className="border-t border-gray-50">
                      <td className="py-2.5">
                        <input
                          type="radio"
                          name="bank_select"
                          value={bank.account_no}
                          checked={selectedBank === bank.account_no}
                          onChange={() => setSelectedBank(bank.account_no)}
                          className="w-4 h-4 text-[#F59E0B] border-gray-300 focus:ring-[#F59E0B] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5">
                        <div className="text-gray-700 text-sm">{bank.bank_name || "—"}</div>
                      </td>
                      <td className="py-2.5 text-gray-700 font-mono text-xs">{bank.account_no}</td>
                      <td className="py-2.5">
                        <div className="text-gray-700 font-mono text-xs">{bank.ifsc_code || "—"}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="text-gray-700 font-mono text-xs">{bank.micr_no || "—"}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="text-gray-700 text-xs">{bank.branch_name || "—"}</div>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">
                        {ACCOUNT_TYPE_MAP[bank.account_type] || bank.account_type}
                        {bank.default_bank_flag === "Y" && (
                          <span className="ml-1 text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">Default</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mandate Details */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
              Mandate Details
            </h3>
            <div className="space-y-4">
              {/* Mandate Type */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Mandate Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mandate_type"
                      value="X"
                      checked={mandateType === "X"}
                      onChange={() => setMandateType("X")}
                      className="w-4 h-4 text-[#F59E0B] border-gray-300 focus:ring-[#F59E0B]"
                    />
                    <span className="text-sm text-gray-700">Physical</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mandate_type"
                      value="E"
                      checked={mandateType === "E"}
                      onChange={() => setMandateType("E")}
                      className="w-4 h-4 text-[#F59E0B] border-gray-300 focus:ring-[#F59E0B]"
                    />
                    <span className="text-sm text-gray-700">eNACH</span>
                  </label>
                </div>
              </div>

              {/* Dates + Amount */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Start Date :</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayISO}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">End Date :</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || banks.length === 0}
            className="px-8 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  Mandate Link Helpers (GET_LINK / RESEND_COMM)
// ══════════════════════════════════════════
// NSE GET_LINK returns a short URL for the mandate:
//  - Physical (mandate_type "X") → PDF form link the investor must print, sign & send
//  - eNACH (mandate_type "E")    → hosted authorization page link
// The backend already proxies this at POST /nse/get-link and /nse/resend-comm.
// Backend wraps NSE response as { status:"S", data:<nseResponse> } and encrypts;
// the axios interceptor decrypts into res.data.data, so the NSE payload sits at
// res.data.data.data — we parse defensively since the exact URL key varies.

function extractShortUrl(payload: any): string | null {
  if (!payload) return null;
  if (typeof payload === "string" && /^https?:\/\//i.test(payload)) return payload;
  const candidates = [
    payload?.short_url,
    payload?.shortUrl,
    payload?.short_link,
    payload?.link,
    payload?.url,
    payload?.pdf_url,
    payload?.enach_link,
    payload?.mandate_link,
    payload?.mandate_url,
    payload?.form_url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  if (Array.isArray(payload) && payload.length) {
    return extractShortUrl(payload[0]);
  }
  if (payload?.data) return extractShortUrl(payload.data);
  if (payload?.reg_data) return extractShortUrl(payload.reg_data);
  return null;
}

async function fetchMandateShortLink(
  regId: string,
  mandateType: "X" | "E" | string | null | undefined
): Promise<string | null> {
  if (!regId) {
    toastAlert("error", "Missing Reg ID for mandate link");
    return null;
  }
  // NSE link_type enum: NACH for physical, ENACH for electronic.
  const linkType = mandateType === "E" ? "MANDATE_AUTH" : "MANDATE_AUTH";
  try {
    const res = await api.post("/nse/get-link", {
      productRefId: regId,
      productType: linkType,
    });
    const outer = res?.data?.data ?? {};
    const inner = outer?.data ?? outer;
    const url = extractShortUrl(inner) || extractShortUrl(outer);
    if (!url) {
      const remark =
        inner?.error_remark || inner?.remark || outer?.remark || "No link returned by NSE";
      toastAlert("error", remark);
      return null;
    }
    return url;
  } catch (err) {
    handleServerError(err);
    return null;
  }
}

async function resendMandateEmail(regId: string): Promise<boolean> {
  if (!regId) {
    toastAlert("error", "Missing Reg ID for resend");
    return false;
  }
  try {
    const res = await api.post("/nse/resend-comm", {
      reg_id: regId,
      comm_type: "E",
    });
    const outer = res?.data?.data ?? {};
    const inner = outer?.data ?? outer;
    const ok =
      outer?.status === "S" ||
      inner?.response_status === "S" ||
      inner?.status === "S";
    if (ok) {
      toastAlert("success", "Mandate email resent successfully");
      return true;
    }
    toastAlert("error", inner?.error_remark || inner?.remark || "Failed to resend email");
    return false;
  } catch (err) {
    handleServerError(err);
    return false;
  }
}

// ══════════════════════════════════════════
//  Scan Mandate Image Upload Modal (Physical mandate only)
// ══════════════════════════════════════════
// NSE fileupload/MANDATEIMG doc limits:
//  - client_code: <= 10 chars
//  - mandate_id: numeric, <= 15 digits
//  - file_name: <= 30 chars, image or PDF
//  - file_data: base64 of the scanned signed mandate
const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
const UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.pdf,.tiff,.tif";
const UPLOAD_MIME_RE = /^(image\/(jpeg|jpg|png|tiff|tif)|application\/pdf)$/i;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // reader gives "data:<mime>;base64,<data>"; strip the prefix.
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function MandateScanUploadModal({
  clientCode,
  mandateId,
  investorName,
  onClose,
  onUploaded,
}: {
  clientCode: string;
  mandateId: string;
  investorName?: string;
  onClose: () => void;
  onUploaded?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!UPLOAD_MIME_RE.test(f.type) && !/\.(jpg|jpeg|png|pdf|tiff|tif)$/i.test(f.name)) {
      toastAlert("error", "Only JPG, PNG, TIFF or PDF files are allowed");
      e.target.value = "";
      return;
    }
    if (f.size > UPLOAD_MAX_BYTES) {
      toastAlert("error", "File must be 4 MB or smaller");
      e.target.value = "";
      return;
    }
    if (f.name.length > 30) {
      toastAlert("error", "File name must be 30 characters or less");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toastAlert("error", "Please choose a scanned mandate file");
      return;
    }
    if (!clientCode || clientCode.length > 10) {
      toastAlert("error", "Invalid client code for this mandate");
      return;
    }
    if (!/^\d{1,15}$/.test(mandateId)) {
      toastAlert("error", "Invalid mandate ID — must be numeric (<=15 digits)");
      return;
    }

    setSubmitting(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await api.post("/nse/mandate-image-upload", {
        client_code: clientCode,
        mandate_id: mandateId,
        file_name: file.name,
        file_data: base64,
      });
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const nseStatus = inner?.status ?? outer?.status;
      const nseMessage = inner?.message || outer?.remark || "";

      // NSE returns status "100" on success per doc.
      if (nseStatus === "100" || outer?.status === "S") {
        toastAlert("success", nseMessage || "Mandate image uploaded successfully");
        onUploaded?.();
        onClose();
      } else {
        toastAlert("error", nseMessage || "Mandate image upload failed");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Upload Signed Mandate</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            After printing and signing the mandate PDF sent to the investor, scan
            the signed copy and upload it here. NSE accepts JPG, PNG, TIFF or
            PDF up to 4 MB.
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {investorName && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px]">Investor</div>
                <div className="font-medium text-gray-800">{investorName}</div>
              </div>
            )}
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-[10px]">UCC</div>
              <div className="font-mono font-medium text-gray-800">{clientCode}</div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-400 uppercase tracking-wider text-[10px]">Mandate ID</div>
              <div className="font-mono font-medium text-gray-800">{mandateId}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Scanned Mandate File
            </label>
            <input
              type="file"
              accept={UPLOAD_ACCEPT}
              onChange={handleFileChange}
              className="block w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#F59E0B]/10 file:text-[#D97706] hover:file:bg-[#F59E0B]/20 cursor-pointer"
            />
            {file && (
              <div className="mt-2 text-[11px] text-gray-500">
                Selected: <span className="font-medium text-gray-700">{file.name}</span>{" "}
                ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !file}
            className="px-8 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  Mandate Inline Actions (used in list row + success modal)
// ══════════════════════════════════════════
function MandateInlineActions({
  regId,
  mandateType,
  regStatus,
  size = "sm",
  onUploadScan,
}: {
  regId: string | null | undefined;
  mandateType: string | null | undefined;
  regStatus: string | null | undefined;
  size?: "sm" | "md";
  onUploadScan?: () => void;
}) {
  const [linkLoading, setLinkLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  if (regStatus !== "REG_SUCCESS" || !regId) return null;

  const isPhysical = mandateType === "X";
  const isEnach = mandateType === "E";
  const padding = size === "sm" ? "px-2.5 py-1" : "px-4 py-2";
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  const handleGetLink = async () => {
    setLinkLoading(true);
    const url = await fetchMandateShortLink(regId, mandateType);
    setLinkLoading(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleResend = async () => {
    setResendLoading(true);
    await resendMandateEmail(regId);
    setResendLoading(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {isPhysical && (
        <button
          onClick={handleGetLink}
          disabled={linkLoading}
          className={`inline-flex items-center gap-1 ${padding} rounded-full bg-[#F59E0B] text-white ${fontSize} font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-50`}
        >
          <FiDownload className={iconSize} />
          {linkLoading ? "..." : "Download PDF"}
        </button>
      )}
      {isPhysical && onUploadScan && (
        <button
          onClick={onUploadScan}
          className={`inline-flex items-center gap-1 ${padding} rounded-full bg-amber-500 text-white ${fontSize} font-semibold hover:bg-amber-600 transition-colors`}
        >
          <FiUpload className={iconSize} />
          Upload Scan
        </button>
      )}
      {isEnach && (
        <button
          onClick={handleGetLink}
          disabled={linkLoading}
          className={`inline-flex items-center gap-1 ${padding} rounded-full bg-[#F59E0B] text-white ${fontSize} font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-50`}
        >
          <FiExternalLink className={iconSize} />
          {linkLoading ? "..." : "Open eNACH"}
        </button>
      )}
      <button
        onClick={handleResend}
        disabled={resendLoading}
        className={`inline-flex items-center gap-1 ${padding} rounded-full border border-[#F59E0B] text-[#D97706] ${fontSize} font-semibold hover:bg-[#F59E0B]/10 transition-colors disabled:opacity-50`}
      >
        <FiMail className={iconSize} />
        {resendLoading ? "..." : "Resend Email"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════
//  Mandate Success Modal
// ══════════════════════════════════════════
function MandateSuccessModal({
  mandateData,
  onClose,
}: {
  mandateData: any;
  onClose: () => void;
}) {
  const [linkLoading, setLinkLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const isPhysical = mandateData?.mandate_type === "X";
  const isEnach = mandateData?.mandate_type === "E";
  const canFetchLink = mandateData?.reg_status === "REG_SUCCESS" && !!mandateData?.reg_id;

  const handleGetLink = async () => {
    setLinkLoading(true);
    const url = await fetchMandateShortLink(mandateData?.reg_id, mandateData?.mandate_type);
    setLinkLoading(false);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      toastAlert(
        "success",
        isPhysical ? "Mandate PDF opened in new tab" : "eNACH authorization page opened"
      );
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await resendMandateEmail(mandateData?.reg_id);
    setResendLoading(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Check Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#F59E0B] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Your Mandate has been created Successfully.
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          To approve the mandate login to your Net Banking portal and enter your Debit Card details.
        </p>

        {/* ── Mandate Registration Summary ── */}
        <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#D97706]/5 border border-[#F59E0B]/30 rounded-xl p-4 mb-5 text-left">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Reg ID</div>
              <div className="font-mono font-semibold text-gray-800 break-all">
                {mandateData?.reg_id || "--"}
              </div>
            </div>
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Reg Status</div>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  mandateData?.reg_status === "REG_SUCCESS"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {mandateData?.reg_status || "--"}
              </span>
            </div>
            {mandateData?.client_code && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Client Code</div>
                <div className="font-mono font-medium text-gray-700">{mandateData.client_code}</div>
              </div>
            )}
            {mandateData?.amount && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Amount</div>
                <div className="font-medium text-gray-700">₹ {mandateData.amount}</div>
              </div>
            )}
            {mandateData?.account_no && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Account No</div>
                <div className="font-mono font-medium text-gray-700">
                  ****{String(mandateData.account_no).slice(-4)}
                </div>
              </div>
            )}
            {mandateData?.ifsc_code && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">IFSC</div>
                <div className="font-mono font-medium text-gray-700">{mandateData.ifsc_code}</div>
              </div>
            )}
            {mandateData?.start_date && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Start Date</div>
                <div className="font-medium text-gray-700">{mandateData.start_date}</div>
              </div>
            )}
            {mandateData?.end_date && (
              <div>
                <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">End Date</div>
                <div className="font-medium text-gray-700">{mandateData.end_date}</div>
              </div>
            )}
          </div>
          {mandateData?.reg_remark && mandateData.reg_remark.trim() && (
            <div className="mt-3 pt-3 border-t border-[#F59E0B]/20">
              <div className="text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Remark</div>
              <div className="text-xs text-gray-600">{mandateData.reg_remark}</div>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        {canFetchLink && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {isPhysical && (
              <button
                onClick={handleGetLink}
                disabled={linkLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <FiDownload className="w-4 h-4" />
                {linkLoading ? "Fetching..." : "Download Mandate PDF"}
              </button>
            )}
            {isPhysical && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <FiUpload className="w-4 h-4" />
                Upload Signed Scan
              </button>
            )}
            {isEnach && (
              <button
                onClick={handleGetLink}
                disabled={linkLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <FiExternalLink className="w-4 h-4" />
                {linkLoading ? "Fetching..." : "Open eNACH Link"}
              </button>
            )}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#F59E0B] text-[#D97706] rounded-full text-sm font-semibold hover:bg-[#F59E0B]/10 transition-colors disabled:opacity-50"
            >
              <FiMail className="w-4 h-4" />
              {resendLoading ? "Sending..." : "Resend Email"}
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>

      {showUpload && isPhysical && mandateData?.reg_id && mandateData?.client_code && (
        <MandateScanUploadModal
          clientCode={mandateData.client_code}
          mandateId={mandateData.reg_id}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//  FATCA Upload Modal
// ══════════════════════════════════════════
function FatcaModal({ investor, onClose }: { investor: Investor; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    addr_type: "1", po_bir_inc: "", co_bir_inc: "IN", tax_res1: "IN", tpin1: investor.pan || "",
    id1_type: "C", srce_wealt: "01", inc_slab: "31", pep_flag: "N", occ_code: "01", occ_type: "B",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.po_bir_inc) { toastAlert("error", "Place of birth is required"); return; }
    setSubmitting(true);
    try {
      const payload = {
        reg_details: [{
          pan_rp: investor.pan || "", pekrn: "", inv_name: investor.name, dob: "", fr_name: "", sp_name: "",
          tax_status: investor.tax_status || "01", data_src: "E", addr_type: form.addr_type,
          po_bir_inc: form.po_bir_inc, co_bir_inc: form.co_bir_inc, tax_res1: form.tax_res1, tpin1: form.tpin1,
          id1_type: form.id1_type, tax_res2: "", tpin2: "", id2_type: "", tax_res3: "", tpin3: "", id3_type: "",
          tax_res4: "", tpin4: "", id4_type: "", srce_wealt: form.srce_wealt, corp_servs: "",
          inc_slab: form.inc_slab, net_worth: "", nw_date: "", pep_flag: form.pep_flag,
          occ_code: form.occ_code, occ_type: form.occ_type, exemp_code: "", ffi_drnfe: "", giin_no: "",
          spr_entity: "", giin_na: "", giin_exemc: "", nffe_catg: "", act_nfe_sc: "", nature_bus: "",
          rel_listed: "", exch_name: "O", ubo_appl: "N", ubo_count: "", ubo_name: "", ubo_pan: "",
          ubo_nation: "", ubo_add1: "", ubo_add2: "", ubo_add3: "", ubo_city: "", ubo_pin: "",
          ubo_state: "", ubo_cntry: "", ubo_add_ty: "", ubo_ctr: "", ubo_tin: "", ubo_id_ty: "",
          ubo_cob: "", ubo_dob: "", ubo_gender: "", ubo_fr_nam: "", ubo_occ: "", ubo_occ_ty: "",
          ubo_tel: "", ubo_mobile: "", ubo_code: "", ubo_hol_pc: "", sdf_flag: "Y", ubo_df: "N",
          aadhaar_rp: "", new_change: "", log_name: "", filler1: "", filler2: "",
        }],
      };
      const res = await api.post("/nse/fatca-upload", payload);
      const responseData = res?.data?.data ?? res?.data;
      if (responseData?.status === "S") {
        const regData = responseData?.data?.reg_details?.[0] || {};
        if (regData.reg_status === "REG_SUCCESS") {
          toastAlert("success", "FATCA submitted successfully");
          onClose();
        } else {
          toastAlert("error", regData.reg_remark || "FATCA submission failed");
        }
      } else {
        toastAlert("error", responseData?.remark || "FATCA submission failed");
      }
    } catch (err) { handleServerError(err); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Submit FATCA</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400 text-xs block">Name</span><span className="font-medium">{investor.name}</span></div>
            <div className="text-right"><span className="text-gray-400 text-xs block">PAN</span><span className="font-medium font-mono">{investor.pan}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Place of Birth *</label>
              <input type="text" value={form.po_bir_inc} onChange={(e) => update("po_bir_inc", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Country of Birth</label>
              <input type="text" value={form.co_bir_inc} onChange={(e) => update("co_bir_inc", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tax Residence Country</label>
              <input type="text" value={form.tax_res1} onChange={(e) => update("tax_res1", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Income Slab</label>
              <select value={form.inc_slab} onChange={(e) => update("inc_slab", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                <option value="31">Below 1 Lac</option><option value="32">&gt;1 to 5 Lacs</option><option value="33">&gt;5 to 10 Lacs</option>
                <option value="34">&gt;10 to 25 Lacs</option><option value="35">&gt;25 Lacs to 1 Cr</option><option value="36">&gt;1 Crore</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">PEP Status</label>
              <select value={form.pep_flag} onChange={(e) => update("pep_flag", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                <option value="N">Not Politically Exposed</option><option value="Y">Politically Exposed</option><option value="R">Related to PEP</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Source of Wealth</label>
              <select value={form.srce_wealt} onChange={(e) => update("srce_wealt", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                <option value="01">Salary</option><option value="02">Business Income</option><option value="03">Gift</option>
                <option value="04">Ancestral Property</option><option value="05">Rental Income</option><option value="08">Others</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3">
          <button onClick={handleSubmit} disabled={submitting} className="px-8 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold disabled:opacity-50">{submitting ? "Submitting..." : "Submit"}</button>
          <button onClick={onClose} className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  Manage Banks Modal
// ══════════════════════════════════════════
function ManageBanksModal({ investor, onClose, onRefresh }: { investor: Investor; onClose: () => void; onRefresh: () => void }) {
  const banks = investor.banks || [];
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newBank, setNewBank] = useState({ account_type: "SB", account_no: "", ifsc_code: "", default_bank_flag: "N" });

  const handleAdd = async () => {
    if (!newBank.account_no || !newBank.ifsc_code) { toastAlert("error", "Account number and IFSC are required"); return; }
    setSubmitting(true);
    try {
      const payload = {
        bank_dtl: [{ client_code: investor.client_code || investor.pan || "", action_type: "ADD", account_type: newBank.account_type, account_no: newBank.account_no, micr_no: "", ifsc_code: newBank.ifsc_code, default_bank_flag: newBank.default_bank_flag }],
      };
      const res = await api.post("/nse/client-bank-details", payload);
      const responseData = res?.data?.data ?? res?.data;
      if (responseData?.status === "S") {
        const bankRes = responseData?.data?.bank_dtl?.[0] || responseData?.data?.[0] || {};
        if (bankRes.status === "SUCCESS") {
          toastAlert("success", "Bank added successfully");
          setAdding(false); setNewBank({ account_type: "SB", account_no: "", ifsc_code: "", default_bank_flag: "N" }); onRefresh();
        } else { toastAlert("error", bankRes.error_remark || "Failed to add bank"); }
      } else { toastAlert("error", responseData?.remark || "Failed to add bank"); }
    } catch (err) { handleServerError(err); } finally { setSubmitting(false); }
  };

  const handleDelete = async (bank: BankDetail) => {
    if (!confirm(`Delete bank ${bank.account_no}?`)) return;
    try {
      const payload = {
        bank_dtl: [{ client_code: investor.client_code || investor.pan || "", action_type: "DEL", account_type: bank.account_type, account_no: bank.account_no, micr_no: "", ifsc_code: bank.ifsc_code, default_bank_flag: "N" }],
      };
      const res = await api.post("/nse/client-bank-details", payload);
      const responseData = res?.data?.data ?? res?.data;
      if (responseData?.status === "S") { toastAlert("success", "Bank deleted"); onRefresh(); }
      else { toastAlert("error", "Failed to delete bank"); }
    } catch (err) { handleServerError(err); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Manage Banks - {investor.name}</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <table className="w-full text-sm mb-4">
            <thead><tr className="text-xs text-gray-400 uppercase border-b"><th className="text-left py-2">Bank</th><th className="text-left py-2">Account</th><th className="text-left py-2">IFSC</th><th className="text-left py-2">Type</th><th className="text-left py-2">Default</th><th className="py-2 w-16"></th></tr></thead>
            <tbody>
              {banks.length === 0 ? (<tr><td colSpan={6} className="text-center py-6 text-gray-400">No banks found</td></tr>) : banks.map((b) => (
                <tr key={b.account_no} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700">{b.bank_name || "—"}</td>
                  <td className="py-2 font-mono text-xs">{b.account_no}</td>
                  <td className="py-2 font-mono text-xs">{b.ifsc_code}</td>
                  <td className="py-2 text-xs">{ACCOUNT_TYPE_MAP[b.account_type] || b.account_type}</td>
                  <td className="py-2 text-xs">{b.default_bank_flag}</td>
                  <td className="py-2"><button onClick={() => handleDelete(b)} className="text-red-500 text-xs hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!adding ? (
            <button onClick={() => setAdding(true)} className="px-4 py-2 text-sm text-[#F59E0B] border border-[#F59E0B] rounded-lg hover:bg-[#F59E0B]/5">+ Add Bank</button>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Account Type</label><select value={newBank.account_type} onChange={(e) => setNewBank((p) => ({ ...p, account_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="SB">Savings</option><option value="CB">Current</option></select></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Default Bank</label><select value={newBank.default_bank_flag} onChange={(e) => setNewBank((p) => ({ ...p, default_bank_flag: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="N">No</option><option value="Y">Yes</option></select></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Account Number *</label><input type="text" value={newBank.account_no} onChange={(e) => setNewBank((p) => ({ ...p, account_no: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">IFSC Code *</label><input type="text" value={newBank.ifsc_code} onChange={(e) => setNewBank((p) => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={submitting} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm disabled:opacity-50">{submitting ? "Adding..." : "Add"}</button>
                <button onClick={() => setAdding(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
          <button onClick={onClose} className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  NSE Investor List Component
// ══════════════════════════════════════════

export default function NseInvestorList(_props: any) {
  const router = useRouter();

  // Data
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, total_pages: 0 });
  const [loading, setLoading] = useState(false);

  // Modals
  const [mandateInvestor, setMandateInvestor] = useState<Investor | null>(null);
  const [mandateSuccessData, setMandateSuccessData] = useState<any>(null);
  const [fatcaInvestor, setFatcaInvestor] = useState<Investor | null>(null);
  const [banksInvestor, setBanksInvestor] = useState<Investor | null>(null);
  const [scanUploadTarget, setScanUploadTarget] = useState<{
    clientCode: string;
    mandateId: string;
    investorName: string;
  } | null>(null);

  // Per-investor mandate list state keyed by investor.id.
  const [expandedInvestorIds, setExpandedInvestorIds] = useState<Set<number>>(new Set());
  const [mandatesByInvestor, setMandatesByInvestor] = useState<Record<number, NormalizedMandate[]>>({});
  const [mandatesLoadingIds, setMandatesLoadingIds] = useState<Set<number>>(new Set());
  const [mandatesErrorByInvestor, setMandatesErrorByInvestor] = useState<Record<number, string | null>>({});

  const loadMandatesForInvestor = useCallback(
    async (inv: Investor) => {
      const clientCode = inv.client_code?.trim();
      if (!clientCode) {
        setMandatesErrorByInvestor((prev) => ({ ...prev, [inv.id]: "Missing client code" }));
        return;
      }
      setMandatesLoadingIds((prev) => {
        const next = new Set(prev);
        next.add(inv.id);
        return next;
      });
      setMandatesErrorByInvestor((prev) => ({ ...prev, [inv.id]: null }));
      try {
        const list = await fetchMandatesForClient(clientCode);
        setMandatesByInvestor((prev) => ({ ...prev, [inv.id]: list }));
        if (list.length === 0) {
          setMandatesErrorByInvestor((prev) => ({ ...prev, [inv.id]: "No mandates found" }));
        }
      } catch (err) {
        handleServerError(err);
        setMandatesErrorByInvestor((prev) => ({ ...prev, [inv.id]: "Failed to load mandates" }));
      } finally {
        setMandatesLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(inv.id);
          return next;
        });
      }
    },
    []
  );

  const toggleMandateDetails = useCallback(
    (inv: Investor) => {
      setExpandedInvestorIds((prev) => {
        const next = new Set(prev);
        if (next.has(inv.id)) {
          next.delete(inv.id);
        } else {
          next.add(inv.id);
          // Lazy-load the first time it's opened.
          if (!mandatesByInvestor[inv.id]) {
            loadMandatesForInvestor(inv);
          }
        }
        return next;
      });
    },
    [mandatesByInvestor, loadMandatesForInvestor]
  );

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [uccFilter, setUccFilter] = useState<"" | "created" | "not_created">("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, uccFilter]);

  // ── Fetch investors ──
  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (uccFilter) params.ucc_status = uccFilter;

      const res = await api.get("/nse/ucc/investor-list", { params });
      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload?.status === "S" && payload?.data) {
        setInvestors(payload.data.investors || []);
        setPagination(payload.data.pagination || { total: 0, page: 1, limit: 20, total_pages: 0 });
      } else {
        setInvestors([]);
        setPagination({ total: 0, page: 1, limit: 20, total_pages: 0 });
      }
    } catch (err) {
      handleServerError(err);
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, uccFilter]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  // ── Pagination helpers ──
  const canPrev = page > 1;
  const canNext = page < pagination.total_pages;

  // ══════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════
  return (
    <div className="nse-module p-4 md:p-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Search by name, PAN, mobile, email, client code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* UCC Status Filter */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={uccFilter}
            onChange={(e) => setUccFilter(e.target.value as any)}
          >
            <option value="">All Status</option>
            <option value="created">UCC Created</option>
            <option value="not_created">UCC Not Created</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchInvestors}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span>Total: <strong className="text-gray-800">{pagination.total}</strong></span>
        <span>Page <strong className="text-gray-800">{pagination.page}</strong> of <strong className="text-gray-800">{pagination.total_pages || 1}</strong></span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">PAN</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tax Status</th>
              <th className="px-4 py-3">Form Step</th>
              <th className="px-4 py-3">UCC Status</th>
              <th className="px-4 py-3">Client Code</th>
              <th className="px-4 py-3">Bank Details</th>
              <th className="px-4 py-3">NSE Remark</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={13} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : investors.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-16 text-gray-400">
                  No investors found
                </td>
              </tr>
            ) : (
              investors.map((inv, idx) => {
                const serial = (pagination.page - 1) * pagination.limit + idx + 1;
                const stepLabel = inv.form_step != null ? STEP_LABELS[inv.form_step] || `Step ${inv.form_step}` : "--";
                const nseRemark =
                  inv.latest_nse_log?.reg_remark ||
                  inv.latest_nse_log?.remark ||
                  inv.reg_remark ||
                  "--";

                return (
                  <React.Fragment key={inv.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{serial}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{inv.name || "--"}</div>
                      {inv.gender && (
                        <span className="text-[10px] text-gray-400 uppercase">{inv.gender === "M" ? "Male" : inv.gender === "F" ? "Female" : inv.gender}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.pan || "--"}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.mobile || "--"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={inv.email || ""}>{inv.email || "--"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {inv.tax_status ? TAX_STATUS_MAP[inv.tax_status] || inv.tax_status : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className={`w-2 h-2 rounded-full ${inv.form_step === 3 ? "bg-green-400" : "bg-amber-400"}`} />
                        {stepLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          inv.ucc_created
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {inv.ucc_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{inv.client_code || "--"}</td>
                    <td className="px-4 py-3">
                      {inv.banks && inv.banks.length > 0 ? (
                        <div className="max-w-[200px]">
                          {inv.banks.slice(0, 1).map((bank, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="font-medium text-gray-800 truncate" title={bank.bank_name}>
                                {bank.bank_name || "--"}
                              </div>
                              <div className="text-gray-500 font-mono" title={bank.account_no}>
                                {bank.account_no ? `****${bank.account_no.slice(-4)}` : "--"}
                              </div>
                              <div className="text-gray-400 font-mono text-[10px]">
                                {bank.ifsc_code || "--"}
                              </div>
                              {bank.micr_no && (
                                <div className="text-gray-400 text-[9px]">MICR: {bank.micr_no}</div>
                              )}
                              {inv.banks && inv.banks.length > 1 && (
                                <div className="text-blue-500 text-[9px] font-medium">+{inv.banks.length - 1} more</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No banks</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-xs text-gray-500 truncate" title={nseRemark}>{nseRemark}</div>
                      {inv.latest_nse_log?.reg_status && (
                        <span
                          className={`text-[10px] font-medium ${
                            inv.latest_nse_log.reg_status === "REG_SUCCESS" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {inv.latest_nse_log.reg_status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inv.updated_at)}</td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        investor={inv}
                        onEdit={() => router.push(`/create-ucc?id=${inv.id}`)}
                        onCreateMandate={() => setMandateInvestor(inv)}
                        onMandateDetails={() => toggleMandateDetails(inv)}
                        onManageBanks={() => setBanksInvestor(inv)}
                        onSubmitFatca={() => setFatcaInvestor(inv)}
                        onDelete={() => toastAlert("info", "Delete Profile coming soon")}
                      />
                    </td>
                  </tr>
                  {expandedInvestorIds.has(inv.id) && (
                    <tr className="bg-gradient-to-r from-[#F59E0B]/5 to-transparent border-b border-gray-100">
                      <td></td>
                      <td colSpan={12} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] uppercase tracking-wider">
                            <FiCreditCard className="w-3.5 h-3.5" />
                            Mandate Details
                            {mandatesByInvestor[inv.id] && (
                              <span className="text-gray-400 normal-case font-normal">
                                ({mandatesByInvestor[inv.id].length})
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadMandatesForInvestor(inv)}
                              disabled={mandatesLoadingIds.has(inv.id)}
                              className="text-[10px] text-[#D97706] hover:underline disabled:opacity-50"
                            >
                              {mandatesLoadingIds.has(inv.id) ? "Refreshing..." : "Refresh"}
                            </button>
                            <button
                              onClick={() => toggleMandateDetails(inv)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label="Collapse"
                            >
                              <FiChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {mandatesLoadingIds.has(inv.id) && !mandatesByInvestor[inv.id] ? (
                          <div className="text-xs text-gray-400 py-4 text-center">Loading mandates...</div>
                        ) : mandatesErrorByInvestor[inv.id] && !mandatesByInvestor[inv.id]?.length ? (
                          <div className="text-xs text-gray-400 py-4 text-center">
                            {mandatesErrorByInvestor[inv.id]}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(mandatesByInvestor[inv.id] || []).map((m, mIdx) => {
                              const statusLower = (m.status || "").toLowerCase();
                              const statusClass =
                                statusLower.includes("success") || statusLower.includes("active") || statusLower.includes("approved")
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : statusLower.includes("reject") || statusLower.includes("fail")
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200";
                              return (
                                <div
                                  key={`${m.mandate_id || mIdx}-${mIdx}`}
                                  className="bg-white border border-gray-100 rounded-lg p-3"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
                                    <div>
                                      <div className="text-gray-400 text-[10px] uppercase">Mandate ID</div>
                                      <div className="font-mono font-semibold text-gray-800">{m.mandate_id || "--"}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-400 text-[10px] uppercase">Status</div>
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusClass}`}>
                                        {m.status || "--"}
                                      </span>
                                    </div>
                                    {m.mandate_type && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Type</div>
                                        <div className="font-medium text-gray-700">
                                          {m.mandate_type === "X" ? "Physical" : m.mandate_type === "E" ? "eNACH" : m.mandate_type}
                                        </div>
                                      </div>
                                    )}
                                    {m.amount && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Amount</div>
                                        <div className="font-medium text-gray-700">₹ {m.amount}</div>
                                      </div>
                                    )}
                                    {m.bank_name && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Bank</div>
                                        <div className="font-medium text-gray-700 truncate" title={m.bank_name}>
                                          {m.bank_name}
                                          {m.bank_branch ? ` (${m.bank_branch})` : ""}
                                        </div>
                                      </div>
                                    )}
                                    {m.account_no && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">A/C No</div>
                                        <div className="font-mono font-medium text-gray-700">
                                          ****{String(m.account_no).slice(-4)}
                                        </div>
                                      </div>
                                    )}
                                    {m.ifsc_code && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">IFSC</div>
                                        <div className="font-mono font-medium text-gray-700">{m.ifsc_code}</div>
                                      </div>
                                    )}
                                    {m.umrn_no && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">UMRN</div>
                                        <div className="font-mono font-medium text-gray-700">{m.umrn_no}</div>
                                      </div>
                                    )}
                                    {m.registration_date && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Reg Date</div>
                                        <div className="font-medium text-gray-700">{m.registration_date}</div>
                                      </div>
                                    )}
                                    {m.start_date && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Start</div>
                                        <div className="font-medium text-gray-700">{m.start_date}</div>
                                      </div>
                                    )}
                                    {m.end_date && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">End</div>
                                        <div className="font-medium text-gray-700">{m.end_date}</div>
                                      </div>
                                    )}
                                    {m.approved_date && (
                                      <div>
                                        <div className="text-gray-400 text-[10px] uppercase">Approved</div>
                                        <div className="font-medium text-gray-700">{m.approved_date}</div>
                                      </div>
                                    )}
                                    {m.remark && (
                                      <div className="col-span-2 md:col-span-4 lg:col-span-6">
                                        <div className="text-gray-400 text-[10px] uppercase">Remark</div>
                                        <div className="text-gray-600">{m.remark}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    <MandateInlineActions
                                      regId={m.mandate_id}
                                      mandateType={m.mandate_type}
                                      // The NSE status report uses a human-readable status string
                                      // (e.g. "SCAN IMAGE NOT UPLOADED"), not REG_SUCCESS — so treat
                                      // any row returned from the status report as eligible for the
                                      // download / resend / upload actions.
                                      regStatus={m.source === "created" ? m.status : "REG_SUCCESS"}
                                      onUploadScan={() => {
                                        const cc = m.client_code || inv.client_code;
                                        if (m.mandate_id && cc) {
                                          setScanUploadTarget({
                                            clientCode: cc,
                                            mandateId: m.mandate_id,
                                            investorName: inv.name || "",
                                          });
                                        } else {
                                          toastAlert("error", "Missing client code or mandate ID");
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-500 text-xs">
            Showing {(pagination.page - 1) * pagination.limit + 1}
            {" "}-{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}
            {" "}of {pagination.total}
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              let p: number;
              if (pagination.total_pages <= 5) {
                p = i + 1;
              } else if (page <= 3) {
                p = i + 1;
              } else if (page >= pagination.total_pages - 2) {
                p = pagination.total_pages - 4 + i;
              } else {
                p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Mandate Modal ── */}
      {mandateInvestor && (
        <MandateModal
          investor={mandateInvestor}
          onClose={() => setMandateInvestor(null)}
          onSuccess={(data) => {
            const targetInv = mandateInvestor;
            const newMandate = normalizeMandateFromCreate(data);

            // Merge into the per-investor mandates cache and auto-expand.
            setMandatesByInvestor((prev) => {
              const existing = prev[targetInv.id] || [];
              return { ...prev, [targetInv.id]: [newMandate, ...existing] };
            });
            setExpandedInvestorIds((prev) => {
              const next = new Set(prev);
              next.add(targetInv.id);
              return next;
            });
            // Refetch from NSE in background so the status column reflects
            // server-side truth (e.g. "SCAN IMAGE NOT UPLOADED").
            loadMandatesForInvestor(targetInv);

            setMandateInvestor(null);
            setMandateSuccessData(data);
          }}
        />
      )}

      {/* ── Mandate Success Modal ── */}
      {mandateSuccessData && (
        <MandateSuccessModal
          mandateData={mandateSuccessData}
          onClose={() => setMandateSuccessData(null)}
        />
      )}

      {/* ── FATCA Modal ── */}
      {fatcaInvestor && (
        <FatcaModal
          investor={fatcaInvestor}
          onClose={() => setFatcaInvestor(null)}
        />
      )}

      {/* ── Manage Banks Modal ── */}
      {banksInvestor && (
        <ManageBanksModal
          investor={banksInvestor}
          onClose={() => setBanksInvestor(null)}
          onRefresh={() => { setBanksInvestor(null); fetchInvestors(); }}
        />
      )}

      {/* ── Scan Mandate Upload Modal ── */}
      {scanUploadTarget && (
        <MandateScanUploadModal
          clientCode={scanUploadTarget.clientCode}
          mandateId={scanUploadTarget.mandateId}
          investorName={scanUploadTarget.investorName}
          onClose={() => setScanUploadTarget(null)}
        />
      )}
    </div>
  );
}
