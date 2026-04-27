"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { FiEdit, FiFileText, FiCreditCard, FiTrash2, FiExternalLink } from "react-icons/fi";
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
//  Inline Action Buttons
// ══════════════════════════════════════════
function ActionMenu({
  investor,
  onEdit,
  onActivate,
  onCreateMandate,
  onManageBanks,
  onSubmitFatca,
  onDelete,
  activating,
}: {
  investor: Investor;
  onEdit: () => void;
  onActivate: () => void;
  onCreateMandate: () => void;
  onManageBanks: () => void;
  onSubmitFatca: () => void;
  onDelete: () => void;
  activating: boolean;
}) {
  // "Activate UCC" calls GET_LINK (productType CL_ACT, refId = client_code)
  // and opens the resulting authorization URL in a new tab. Only relevant
  // once a UCC exists on NSE (ucc_created), and the activation is still
  // pending — we treat anything other than "ACTIVE" as pending since the
  // backend status text varies (CREATED / REG_SUCCESS / blank).
  const isUccActive = (investor.ucc_status || "").toUpperCase().includes("ACTIVE");

  const items: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  }[] = [
    { icon: <FiEdit className="w-4 h-4" />, label: "Edit Profile", onClick: onEdit },
    {
      icon: <FiExternalLink className="w-4 h-4" />,
      label: isUccActive
        ? "UCC Activated"
        : activating
        ? "Fetching link..."
        : "Activate UCC",
      onClick: onActivate,
      disabled: !investor.ucc_created || isUccActive || activating,
    },
    { icon: <FiCreditCard className="w-4 h-4" />, label: "Create Mandate", onClick: onCreateMandate, disabled: !investor.ucc_created },
    { icon: <BsBank2 className="w-4 h-4" />, label: "Manage Banks", onClick: onManageBanks, disabled: !investor.ucc_created },
    { icon: <FiFileText className="w-4 h-4" />, label: "Submit FATCA", onClick: onSubmitFatca, disabled: !investor.ucc_created },
    { icon: <FiTrash2 className="w-4 h-4" />, label: "Delete Profile", onClick: onDelete, danger: true },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          title={item.label}
          aria-label={item.label}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap transition-colors ${
            item.disabled
              ? "opacity-40 cursor-not-allowed border-[#2A2A2A] text-[#6B7280]"
              : item.danger
              ? "border-red-500/40 text-red-500 hover:bg-red-500/10"
              : "border-[#2A2A2A] text-[#E5E7EB] hover:border-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#1F1A1A]"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
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
      const payload = {
        reg_data: [
          {
            client_code: investor.client_code || investor.pan || "",
            amount: amount,
            mandate_type: mandateType,
            account_no: selectedBankObj.account_no,
            ac_type: selectedBankObj.account_type,
            ifsc_code: selectedBankObj.ifsc_code,
            micr_no: "",
            start_date: formatDateApi(startDate),
            end_date: formatDateApi(endDate),
            member_mandate_no: "",
          },
        ],
      };

      const res = await api.post("/nse/mandate-purchase", payload);
      const responseData = res?.data?.data ?? res?.data;

      if (responseData?.status === "S") {
        const regData = responseData?.data?.reg_data?.[0] || responseData?.data?.[0] || {};
        if (regData.reg_status === "REG_FAILED") {
          toastAlert("error", regData.reg_remark || "Mandate registration failed");
        } else {
          // Carry mandate_type and client_code through so the success modal
          // can branch (Physical → upload scan; eNACH → open auth link).
          onSuccess({
            ...regData,
            mandate_type: mandateType,
            client_code: investor.client_code || investor.pan || "",
          });
        }
      } else {
        toastAlert("error", responseData?.remark || "Failed to create mandate");
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
        className="bg-[#111111] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Submit Mandate</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Investor Details */}
          <div className="border border-[#2A2A2A] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-3 border-b border-[#2A2A2A] pb-2">
              Investor Details
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-[#6B7280] text-xs">Investor Name</span>
                <div className="font-medium text-[#F9FAFB]">{investor.name}</div>
              </div>
              <div className="text-right">
                <span className="text-[#6B7280] text-xs">PAN</span>
                <div className="font-medium text-[#F9FAFB] font-mono">{investor.pan || "--"}</div>
              </div>
              <div>
                <span className="text-[#6B7280] text-xs">UCC</span>
                <div className="font-medium text-[#F9FAFB] font-mono">{investor.client_code || investor.pan || "--"}</div>
              </div>
              <div className="text-right">
                <span className="text-[#6B7280] text-xs">Tax Status</span>
                <div className="font-medium text-[#F9FAFB]">
                  {investor.tax_status ? TAX_STATUS_MAP[investor.tax_status] || investor.tax_status : "--"}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border border-[#2A2A2A] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-3 border-b border-[#2A2A2A] pb-2">
              Bank Details
            </h3>
            {banks.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-4 text-center">No bank accounts found for this investor</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#6B7280] uppercase">
                    <th className="text-left py-2 w-8"></th>
                    <th className="text-left py-2">Bank Name</th>
                    <th className="text-left py-2">Account No</th>
                    <th className="text-left py-2">IFSC</th>
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
                          className="w-4 h-4 text-[#4bc5c1] border-[#3A3A3A] focus:ring-[#4bc5c1] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5">
                        <div className="text-[#E5E7EB] text-sm">{bank.bank_name || "—"}</div>
                        {bank.branch_name && (
                          <div className="text-[10px] text-[#6B7280]">{bank.branch_name}</div>
                        )}
                      </td>
                      <td className="py-2.5 text-[#E5E7EB] font-mono text-xs">{bank.account_no}</td>
                      <td className="py-2.5">
                        <div className="text-[#E5E7EB] font-mono text-xs">{bank.ifsc_code || "—"}</div>
                        {bank.micr_no && (
                          <div className="text-[10px] text-[#6B7280]">MICR: {bank.micr_no}</div>
                        )}
                      </td>
                      <td className="py-2.5 text-[#9CA3AF] text-xs">
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
          <div className="border border-[#2A2A2A] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-3 border-b border-[#2A2A2A] pb-2">
              Mandate Details
            </h3>
            <div className="space-y-4">
              {/* Mandate Type */}
              <div>
                <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Mandate Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mandate_type"
                      value="X"
                      checked={mandateType === "X"}
                      onChange={() => setMandateType("X")}
                      className="w-4 h-4 text-[#4bc5c1] border-[#3A3A3A] focus:ring-[#4bc5c1]"
                    />
                    <span className="text-sm text-[#E5E7EB]">Physical</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mandate_type"
                      value="E"
                      checked={mandateType === "E"}
                      onChange={() => setMandateType("E")}
                      className="w-4 h-4 text-[#4bc5c1] border-[#3A3A3A] focus:ring-[#4bc5c1]"
                    />
                    <span className="text-sm text-[#E5E7EB]">eNACH</span>
                  </label>
                </div>
              </div>

              {/* Dates + Amount */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Start Date :</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayISO}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">End Date :</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || banks.length === 0}
            className="px-8 py-2.5 bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 border border-[#3A3A3A] text-[#9CA3AF] rounded-full text-sm font-semibold hover:bg-[#1F1A1A] transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  Mandate Success Modal
// ══════════════════════════════════════════
// Convert a File to base64 (without the "data:...;base64," prefix) for
// the NSE MANDATEIMG endpoint, which expects a raw base64 string.
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.replace(/^data:[^;]+;base64,/, ""));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_SCAN_BYTES = 4 * 1024 * 1024; // 4 MB raw — backend caps at ~5.6 MB base64
const SCAN_EXT_RE = /\.(jpg|jpeg|png|pdf|tiff|tif)$/i;

function MandateSuccessModal({
  mandateData,
  onClose,
}: {
  mandateData: any;
  onClose: () => void;
}) {
  // Backend chains GET_LINK after mandate registration and attaches the
  // authorization URL(s) onto the same reg_data row. firstHolderLink is
  // the eNACH/netbanking page (or physical-mandate form) the investor
  // must visit to approve. If GET_LINK failed, errorMessage is populated
  // and we fall back to a copyable Mandate ID.
  const authLink: string =
    mandateData?.auth_link ||
    mandateData?.auth_links?.firstHolderLink ||
    "";
  const linkErr: string = mandateData?.auth_links?.errorMessage || "";
  const isPhysical = mandateData?.mandate_type === "X";
  const mandateId: string = mandateData?.reg_id || "";
  const clientCode: string = mandateData?.client_code || "";

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedAt, setUploadedAt] = React.useState<string>("");

  const handleApproveNow = () => {
    if (authLink) {
      window.open(authLink, "_blank", "noopener,noreferrer");
      onClose();
    } else {
      toastAlert(
        "error",
        linkErr ||
          "Authorization link not available — please use Member Desk to approve."
      );
    }
  };

  const handleCopyLink = async () => {
    if (!authLink) return;
    try {
      await navigator.clipboard.writeText(authLink);
      toastAlert("success", "Link copied to clipboard");
    } catch {
      toastAlert("error", "Could not copy link");
    }
  };

  const handleScanSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!mandateId || !clientCode) {
      toastAlert("error", "Missing mandate ID or client code — cannot upload");
      return;
    }
    if (!SCAN_EXT_RE.test(file.name)) {
      toastAlert("error", "Allowed file types: jpg, jpeg, png, pdf, tiff, tif");
      return;
    }
    if (file.name.length > 30) {
      toastAlert("error", "File name must be 30 characters or less");
      return;
    }
    if (file.size > MAX_SCAN_BYTES) {
      toastAlert("error", "File too large (max 4 MB)");
      return;
    }
    setUploading(true);
    try {
      const file_data = await fileToBase64(file);
      const res = await api.post("/nse/mandate-image-upload", {
        client_code: clientCode,
        mandate_id: mandateId,
        file_name: file.name,
        file_data,
      });
      const payload = res?.data?.data ?? res?.data;
      const ok = payload?.status === "S" || payload?.data?.status === "100";
      if (ok) {
        setUploadedAt(new Date().toLocaleString());
        toastAlert(
          "success",
          payload?.remark || payload?.data?.message || "Mandate image uploaded"
        );
      } else {
        toastAlert(
          "error",
          payload?.data?.message || payload?.remark || "Upload failed"
        );
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#111111] rounded-2xl w-full max-w-md mx-4 shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Check Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#4bc5c1] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#4bc5c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
          Your Mandate has been created Successfully.
        </h3>
        <p className="text-sm text-[#9CA3AF] mb-6">
          {isPhysical
            ? "Print the mandate form, get it signed by the investor, then scan and upload the signed copy to NSE."
            : "To approve the mandate login to your Net Banking portal and enter your Debit Card details."}
        </p>

        {mandateData?.reg_id && (
          <p className="text-xs text-[#6B7280] mb-4">
            Mandate ID: <span className="font-mono font-medium text-[#9CA3AF]">{mandateData.reg_id}</span>
          </p>
        )}

        {/* Physical mandate: scan upload via MANDATEIMG. The "form download"
            is the same NSE-issued auth link (when GET_LINK returns one),
            otherwise distributors print from their internal template. */}
        {isPhysical ? (
          <>
            {authLink && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 mb-3 text-left">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                  Mandate Form Link
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={authLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-xs text-[#4bc5c1] hover:underline font-mono"
                    title={authLink}
                    download
                  >
                    Download / Open Form
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="text-[10px] uppercase tracking-wider text-[#9CA3AF] hover:text-white border border-[#3A3A3A] rounded px-2 py-1"
                    type="button"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {uploadedAt && (
              <p className="text-xs text-green-400 mb-3">
                Scan uploaded at {uploadedAt}.
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.tiff,.tif,image/*,application/pdf"
              className="hidden"
              onChange={handleScanSelected}
            />

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !mandateId}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {uploading ? "Uploading..." : uploadedAt ? "Re-upload Scan" : "Upload Scan"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-[#3A3A3A] text-[#9CA3AF] rounded-full text-sm font-semibold hover:bg-[#1F1A1A] transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            {authLink && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 mb-4 text-left">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                  Authorization Link
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={authLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-xs text-[#4bc5c1] hover:underline font-mono"
                    title={authLink}
                  >
                    {authLink}
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="text-[10px] uppercase tracking-wider text-[#9CA3AF] hover:text-white border border-[#3A3A3A] rounded px-2 py-1"
                    type="button"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {!authLink && linkErr && (
              <p className="text-xs text-red-400 mb-4">
                Could not fetch authorization link: {linkErr}
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleApproveNow}
                disabled={!authLink}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve Now
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Approve Later
              </button>
            </div>
          </>
        )}
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

  // Per-row "Activate UCC" loading state. Keyed by client_code so a click
  // on one row doesn't spin the others. The action calls GET_LINK with
  // productType CL_ACT and opens the resulting URL in a new tab.
  const [activatingClient, setActivatingClient] = useState<string>("");
  const handleActivateUcc = async (inv: Investor) => {
    const code = inv.client_code?.trim();
    if (!code) {
      toastAlert("error", "No UCC client code on file for this investor");
      return;
    }
    setActivatingClient(code);
    try {
      const res = await api.post("/nse/get-link", {
        productType: "CL_ACT",
        productRefId: code,
      });
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const link = inner?.firstHolderLink || "";
      const errMsg = inner?.errorMessage || "";
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        toastAlert("error", errMsg || "Activation link not available yet");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setActivatingClient("");
    }
  };

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

      // Scope the list based on who's logged in:
      //  • Partner (userType 4) → only their mapped investors (partner_id)
      //  • Investor (userType 2) → just their own UCC record (mobile/id)
      //  • Anyone else (admin/RM) → unscoped
      const userData: any = getLS(USER_DATA);
      const partnerId = userData?.partner?.regId;
      const userTypeId =
        userData?.InvestorRegistration?.userType_id ??
        userData?.partner?.userType_id ??
        userData?.userTypeId;

      if (userTypeId === 4 && partnerId) {
        params.partner_id = partnerId;
      } else if (userTypeId === 2) {
        const investorId = userData?.InvestorRegistration?.id;
        const investorMobile =
          userData?.InvestorRegistration?.reg_mobile ||
          userData?.InvestorRegistration?.mobile ||
          userData?.mobile;
        if (investorId) params.investor_id = investorId;
        if (investorMobile) params.mobile = String(investorMobile).replace(/\D/g, "").slice(-10);
      }

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
    <div className="p-4 md:p-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Search by name, PAN, mobile, email, client code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* UCC Status Filter */}
          <select
            className="border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
            className="px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm hover:bg-[#1F1A1A] transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-4 mb-4 text-xs text-[#9CA3AF]">
        <span>Total: <strong className="text-[#F9FAFB]">{pagination.total}</strong></span>
        <span>Page <strong className="text-[#F9FAFB]">{pagination.page}</strong> of <strong className="text-[#F9FAFB]">{pagination.total_pages || 1}</strong></span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto border border-[#2A2A2A] rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1F1A1A] text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">PAN</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tax Status</th>
              <th className="px-4 py-3">Form Step</th>
              <th className="px-4 py-3">UCC Status</th>
              <th className="px-4 py-3">Client Code</th>
              <th className="px-4 py-3">NSE Remark</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={12} className="text-center py-16 text-[#6B7280]">
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
                <td colSpan={12} className="text-center py-16 text-[#6B7280]">
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
                  <tr key={inv.id} className="hover:bg-[#1F1A1A]/50 transition-colors">
                    <td className="px-4 py-3 text-[#6B7280] font-mono text-xs">{serial}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#F9FAFB]">{inv.name || "--"}</div>
                      {inv.gender && (
                        <span className="text-[10px] text-[#6B7280] uppercase">{inv.gender === "M" ? "Male" : inv.gender === "F" ? "Female" : inv.gender}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{inv.pan || "--"}</td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{inv.mobile || "--"}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] max-w-[180px] truncate" title={inv.email || ""}>{inv.email || "--"}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">
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
                    <td className="px-4 py-3 font-mono text-xs text-[#E5E7EB]">{inv.client_code || "--"}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-xs text-[#9CA3AF] truncate" title={nseRemark}>{nseRemark}</div>
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
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{formatDate(inv.updated_at)}</td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        investor={inv}
                        onEdit={() => router.push(`/create-ucc?id=${inv.id}`)}
                        onActivate={() => handleActivateUcc(inv)}
                        activating={activatingClient === inv.client_code}
                        onCreateMandate={() => setMandateInvestor(inv)}
                        onManageBanks={() => toastAlert("info", "Manage Banks coming soon")}
                        onSubmitFatca={() => toastAlert("info", "Submit FATCA coming soon")}
                        onDelete={() => toastAlert("info", "Delete Profile coming soon")}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-[#9CA3AF] text-xs">
            Showing {(pagination.page - 1) * pagination.limit + 1}
            {" "}-{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}
            {" "}of {pagination.total}
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F1A1A] transition-colors"
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
                      : "border border-[#2A2A2A] hover:bg-[#1F1A1A]"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F1A1A] transition-colors"
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
    </div>
  );
}
