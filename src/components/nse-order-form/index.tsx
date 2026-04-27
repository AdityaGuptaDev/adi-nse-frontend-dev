"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiCopy, FiCheck, FiUpload, FiAlertTriangle, FiExternalLink, FiRefreshCw } from "react-icons/fi";

// ── Types ──
interface Investor {
  id: number;
  client_code: string | null;
  name: string;
  pan: string | null;
  banks?: { account_no: string; account_type: string; ifsc_code: string; bank_name: string; branch_name: string; default_bank_flag: string }[];
}

const PAYMENT_MODES = [
  { value: "MANDATE", label: "Debit Mandate" },
  { value: "NETBANKING", label: "Net Banking" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "UPI", label: "UPI" },
  { value: "NEFT", label: "NEFT/RTGS" },
];

// NSE XSIP frequency_type values (spec: WEEKLY / MONTHLY / QUARTERLY /
// FORTNIGHTLY / SEMI-ANNUAL / ANNUAL / DAILY). Must be allowed for the
// given scheme — if NSE rejects, pick a different one.
const SIP_FREQUENCIES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "FORTNIGHTLY", label: "Fortnightly" },
  { value: "SEMI-ANNUAL", label: "Semi-Annual" },
  { value: "ANNUAL", label: "Annual" },
  { value: "DAILY", label: "Daily" },
];

// DD/MM/YYYY formatter used by NSE XSIP start_date / end_date / step_up_*.
const formatDDMMYYYY = (iso: string): string => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

// NSE XSIP needs a cooling period between registration and the first debit —
// the mandate has to be NACH-approved (3-5 WD) and then activate on the
// sponsor bank (additional 5-7 WD). A 20-calendar-day buffer covers both
// legs across most banks; user can still pick any later date.
const SIP_START_DATE_LEAD_DAYS = 20;
const isoDateAfterDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// /nse/mandate-status takes DD-MM-YYYY. Flip ISO to that format.
const isoToApiDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

interface MandateOption {
  mandateId: string;
  umrnNo: string;
  bankName: string;
  accountNo: string;
  amount: string;
  status: string;
}

const ACCOUNT_TYPE_MAP: Record<string, string> = { SB: "Savings", CB: "Current", NE: "NRE", NO: "NRO" };

// ══════════════════════════════════════════
//  AOF Image Upload (blocks order submission if AOF not on file)
// ══════════════════════════════════════════
type AofStatus = "unknown" | "checking" | "uploaded" | "missing" | "error";

const AOF_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
// NSE AOFIMG accepts JPEG images only per their spec — any other extension is
// rejected with "Invalid file extension in request parameter 'File Name'".
const AOF_UPLOAD_ACCEPT = ".jpg,.jpeg,image/jpeg";
const AOF_UPLOAD_MIME_RE = /^image\/(jpeg|jpg)$/i;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Use the existing /nse/client-auth-report endpoint to discover whether the
// first holder has an AOF on file. The NSE report returns "Y" / "N" in
// `first_holder_aof_exists`. If the client code hasn't been authorized yet
// the report returns no rows — we treat that as "missing" (upload needed).
async function checkAofStatus(clientCode: string): Promise<"uploaded" | "missing"> {
  if (!clientCode) return "missing";
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  const today = new Date();
  const past = new Date();
  past.setFullYear(past.getFullYear() - 2);

  const res = await api.post("/nse/client-auth-report", {
    from_date: fmt(past),
    to_date: fmt(today),
    client_code: clientCode,
    date_type: "AUTH_SENT_DATE",
  });
  const outer = res?.data?.data ?? {};
  const inner = outer?.data ?? outer;
  const rows: any[] = inner?.report_data || outer?.report_data || [];
  const match = rows.find(
    (r) => (r?.client_code || "").toString().trim() === clientCode.trim()
  );
  const flag = (match?.first_holder_aof_exists || "").toString().trim().toUpperCase();
  return flag === "Y" ? "uploaded" : "missing";
}

function AofUploadModal({
  clientCode,
  investorName,
  onClose,
  onUploaded,
}: {
  clientCode: string;
  investorName?: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<"NRM" | "RIA">("NRM");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!AOF_UPLOAD_MIME_RE.test(f.type) && !/\.(jpg|jpeg)$/i.test(f.name)) {
      toastAlert("error", "NSE AOF only accepts JPG / JPEG files");
      e.target.value = "";
      return;
    }
    if (f.size > AOF_UPLOAD_MAX_BYTES) {
      toastAlert("error", "File must be 4 MB or smaller");
      e.target.value = "";
      return;
    }
    if (f.name.length > 40) {
      toastAlert("error", "File name must be 40 characters or less");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toastAlert("error", "Please choose the signed AOF file");
      return;
    }
    if (!clientCode || clientCode.length > 10) {
      toastAlert("error", "Invalid client code for this investor");
      return;
    }

    setSubmitting(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await api.post("/nse/aof-upload", {
        client_code: clientCode,
        file_name: file.name,
        document_type: documentType,
        file_data: base64,
      });
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const nseStatus = inner?.status ?? outer?.status;
      const nseMessage = inner?.message || outer?.remark || "";

      if (nseStatus === "100" || outer?.status === "S") {
        toastAlert("success", nseMessage || "AOF uploaded successfully");
        onUploaded();
        onClose();
      } else {
        toastAlert("error", nseMessage || "AOF upload failed");
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
        className="bg-[#111111] rounded-2xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Upload AOF Image</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-xs text-[#9CA3AF] bg-amber-50 border border-amber-200 rounded-lg p-3">
            NSE requires a signed Account Opening Form (AOF) on file before any
            transaction can be placed. Upload the scanned signed AOF below —
            JPG / JPEG only, up to 4 MB.
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {investorName && (
              <div>
                <div className="text-[#6B7280] uppercase tracking-wider text-[10px]">Investor</div>
                <div className="font-medium text-[#F9FAFB]">{investorName}</div>
              </div>
            )}
            <div>
              <div className="text-[#6B7280] uppercase tracking-wider text-[10px]">UCC</div>
              <div className="font-mono font-medium text-[#F9FAFB]">{clientCode}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
              Document Type
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="aof_doc_type"
                  value="NRM"
                  checked={documentType === "NRM"}
                  onChange={() => setDocumentType("NRM")}
                  className="w-4 h-4 text-[#F59E0B]"
                />
                <span className="text-sm text-[#E5E7EB]">Normal (NRM)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="aof_doc_type"
                  value="RIA"
                  checked={documentType === "RIA"}
                  onChange={() => setDocumentType("RIA")}
                  className="w-4 h-4 text-[#F59E0B]"
                />
                <span className="text-sm text-[#E5E7EB]">RIA</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
              Signed AOF File
            </label>
            <input
              type="file"
              accept={AOF_UPLOAD_ACCEPT}
              onChange={handleFileChange}
              className="block w-full text-xs text-[#E5E7EB] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#F59E0B]/10 file:text-[#D97706] hover:file:bg-[#F59E0B]/20 cursor-pointer"
            />
            {file && (
              <div className="mt-2 text-[11px] text-[#9CA3AF]">
                Selected: <span className="font-medium text-[#E5E7EB]">{file.name}</span>{" "}
                ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !file}
            className="px-8 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 border border-[#3A3A3A] text-[#9CA3AF] rounded-full text-sm font-semibold hover:bg-[#1F1A1A] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NseOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Scheme from URL params — mutable because we may swap an ISIN → NSE
  // scheme_code lookup on mount if the caller accidentally passed an ISIN.
  const [schemeCode, setSchemeCode] = useState(() => searchParams.get("scheme_code") || "");
  const [schemeName, setSchemeName] = useState(() => searchParams.get("scheme_name") || "");
  const [amcCode, setAmcCode] = useState(() => searchParams.get("amc_code") || "");
  const [isin, setIsin] = useState(() => searchParams.get("isin") || "");
  const [minAmount, setMinAmount] = useState(() => searchParams.get("min_amount") || "100");

  // When a user lands here from the NSE portfolio (rather than the generic
  // Invest button in Fund Explore), we expose the full transaction palette:
  // Lumpsum / SIP / Switch / SWP / Redemption. Otherwise only Lumpsum+SIP
  // are selectable — that matches the UX when initiating a fresh investment.
  // The portfolio page should navigate with ?source=portfolio and can pass
  // existing folio/units context via the query string.
  const fromPortfolio =
    (searchParams.get("source") || "").toLowerCase() === "portfolio";
  const portfolioFolioNo = searchParams.get("folio_no") || "";
  const portfolioUnits = searchParams.get("units") || "";
  const [schemeResolving, setSchemeResolving] = useState(false);
  const [schemeResolveError, setSchemeResolveError] = useState<string>("");

  // Form state
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);
  const [mode, setMode] = useState<"P" | "D">("P"); // Physical / Demat
  // Transaction type codes:
  //   P = Purchase (Lumpsum)
  //   S = SIP (XSIP registration)
  //   R = Redemption (available only when entered from portfolio)
  //   SW = Switch (available only when entered from portfolio)
  //   ST = STP Registration (available only when entered from portfolio)
  //   SP = SWP Registration (available only when entered from portfolio)
  //
  // Portfolio → NSE order form passes the intended action via ?tt=<code>.
  // Seed the state with it so the user doesn't have to re-pick from the
  // dropdown after navigating from the Transact menu.
  const [transactionType, setTransactionType] = useState(() => {
    const tt = (searchParams.get("tt") || "").toUpperCase();
    return ["P", "S", "R", "SW", "ST", "SP"].includes(tt) ? tt : "P";
  });
  const [schemeType, setSchemeType] = useState("GR"); // GR=Growth, DP=Dividend Payout, DR=Dividend Reinvestment
  const [amount, setAmount] = useState("");
  const [paymentOption, setPaymentOption] = useState<"link" | "pay">("pay");
  const [paymentMode, setPaymentMode] = useState("MANDATE");
  const [selectedBank, setSelectedBank] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [upiId, setUpiId] = useState("");
  const [neftUtr, setNeftUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // SIP / XSIP-specific fields. Only used when transactionType === "S".
  const [sipFrequency, setSipFrequency] = useState("MONTHLY");
  const [sipStartDate, setSipStartDate] = useState("");
  const [sipInstallmentNo, setSipInstallmentNo] = useState("60");
  const [sipEndDate, setSipEndDate] = useState(""); // only used when frequency is DAILY
  const [sipMandateId, setSipMandateId] = useState("");
  const [sipFirstOrderToday, setSipFirstOrderToday] = useState<"Y" | "N">("N");
  const [mandateOptions, setMandateOptions] = useState<MandateOption[]>([]);

  // Redemption (R) state — only used when transactionType === "R"
  const [redFolioNo, setRedFolioNo] = useState(portfolioFolioNo);
  const [redAllUnits, setRedAllUnits] = useState(false);
  const [redAmount, setRedAmount] = useState("");
  const [redUnits, setRedUnits] = useState("");

  // Switch (SW) state — only used when transactionType === "SW"
  const [switchToSchemeCode, setSwitchToSchemeCode] = useState("");
  const [switchFolioNo, setSwitchFolioNo] = useState(portfolioFolioNo);
  const [switchBuySellType, setSwitchBuySellType] = useState<"FRESH" | "ADDITIONAL">("FRESH");
  const [switchAllUnits, setSwitchAllUnits] = useState(false);
  const [switchAmount, setSwitchAmount] = useState("");
  const [switchUnits, setSwitchUnits] = useState("");

  // SWP (SP) state — only used when transactionType === "SP"
  const [swpFrequency, setSwpFrequency] = useState("MONTHLY");
  const [swpStartDate, setSwpStartDate] = useState("");
  const [swpEndDate, setSwpEndDate] = useState(""); // DAILY only
  const [swpNoOfWithdrawals, setSwpNoOfWithdrawals] = useState("12");
  const [swpAmount, setSwpAmount] = useState("");
  const [swpUnits, setSwpUnits] = useState("");
  const [swpFolioNo, setSwpFolioNo] = useState(portfolioFolioNo);
  const [swpFirstOrderToday, setSwpFirstOrderToday] = useState<"Y" | "N">("N");

  // STP (ST) state — only used when transactionType === "ST". Same
  // frequency/cooling-period rules as SIP/SWP; transfers from the source
  // scheme to another scheme in the same AMC.
  const [stpToSchemeCode, setStpToSchemeCode] = useState("");
  const [stpFrequency, setStpFrequency] = useState("MONTHLY");
  const [stpStartDate, setStpStartDate] = useState("");
  const [stpEndDate, setStpEndDate] = useState(""); // DAILY only
  const [stpNoOfTransfers, setStpNoOfTransfers] = useState("12");
  const [stpAmount, setStpAmount] = useState("");
  const [stpUnits, setStpUnits] = useState("");
  const [stpFolioNo, setStpFolioNo] = useState(portfolioFolioNo);
  const [stpFirstOrderToday, setStpFirstOrderToday] = useState<"Y" | "N">("N");
  const [mandatesLoading, setMandatesLoading] = useState(false);

  // Minimum SIP start date — today + the NSE cooling period. Precomputed so
  // the date picker's `min` matches the validation logic.
  const sipMinStartDate = isoDateAfterDays(SIP_START_DATE_LEAD_DAYS);

  // Default the start date to the minimum allowed when the user first
  // switches into SIP mode, so the picker doesn't land on today (which NSE
  // rejects with "INVALID START DATE"). Only auto-fills when blank so the
  // user's explicit choice is preserved.
  useEffect(() => {
    if (transactionType === "S" && !sipStartDate) {
      setSipStartDate(sipMinStartDate);
    }
    // SWP uses the same cooling period (20 days) so the mandate-less
    // withdrawal cycle has time to register with NSE.
    if (transactionType === "SP" && !swpStartDate) {
      setSwpStartDate(sipMinStartDate);
    }
    // STP is a recurring switch — NSE treats it like XSIP for registration,
    // so the same 20-day cooling period applies to the first transfer date.
    if (transactionType === "ST" && !stpStartDate) {
      setStpStartDate(sipMinStartDate);
    }
  }, [transactionType, sipStartDate, swpStartDate, stpStartDate, sipMinStartDate]);

  // Success modal
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [fetchingLink, setFetchingLink] = useState(false);

  // EUIN fields
  const [euinDeclaration, setEuinDeclaration] = useState("Y");
  const [euinNumber, setEuinNumber] = useState("");

  // AOF gate — Place Order is blocked until the first holder has an AOF on file.
  const [aofStatus, setAofStatus] = useState<AofStatus>("unknown");
  const [aofErrorRemark, setAofErrorRemark] = useState<string>("");
  const [showAofUpload, setShowAofUpload] = useState(false);

  // Fetch investors for UCC selection, scoped to who's logged in:
  //  • Investor (userType 2) → only their own UCC
  //  • Partner  (userType 4) → only investors mapped to this partner
  //  • Admin/RM/other         → unscoped (full list)
  //
  // The backend ANDs investor_id + mobile, so if a UCC row has one populated
  // but not the other (common with imported / legacy registrations) a combined
  // filter returns zero rows. Try each scoping independently and keep the
  // first non-empty hit so the UCC always surfaces when it exists.
  useEffect(() => {
    const fetchList = async (scopeParams: Record<string, any>) => {
      const res = await api.get("/nse/ucc/investor-list", {
        params: { limit: 100, ucc_status: "created", ...scopeParams },
      });
      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload?.status === "S" && Array.isArray(payload?.data?.investors)) {
        return payload.data.investors as Investor[];
      }
      return [] as Investor[];
    };

    const fetchUccByMobileDirect = async (mobile: string) => {
      // Same endpoint the routing helper uses. Shapes the UCC record into the
      // Investor interface so the dropdown can render it verbatim.
      try {
        const res = await api.get(`/nse/ucc/search-by-mobile/${mobile}`);
        const payload = res?.data?.data ?? res?.data ?? {};
        const u = payload?.data;
        if (payload?.status !== "S" || !u) return [] as Investor[];
        const isReady = u.uccCreated === 1 || u.uccCreated === true || !!u.clientCode;
        if (!isReady) return [] as Investor[];
        const shaped: Investor = {
          id: u.id,
          client_code: u.clientCode ?? null,
          name: [u.primaryHolderFirstName, u.primaryHolderMiddleName, u.primaryHolderLastName]
            .filter(Boolean)
            .join(" "),
          pan: u.primaryHolderPan ?? null,
          banks: [
            u.accountNo1 && {
              account_no: u.accountNo1,
              account_type: u.accountType1 || "SB",
              ifsc_code: u.ifscCode1 || "",
              bank_name: u.bankName1 || "",
              branch_name: u.branchName1 || "",
              default_bank_flag: u.defaultBankFlag1 || "N",
            },
            u.accountNo2 && {
              account_no: u.accountNo2,
              account_type: u.accountType2 || "SB",
              ifsc_code: u.ifscCode2 || "",
              bank_name: u.bankName2 || "",
              branch_name: u.branchName2 || "",
              default_bank_flag: u.defaultBankFlag2 || "N",
            },
          ].filter(Boolean) as Investor["banks"],
        };
        return [shaped];
      } catch {
        return [] as Investor[];
      }
    };

    (async () => {
      try {
        const userData: any = getLS(USER_DATA);
        const userTypeId =
          userData?.InvestorRegistration?.userType_id ??
          userData?.partner?.userType_id ??
          userData?.userTypeId;

        const investorId = userData?.InvestorRegistration?.id;
        const rawMobile =
          userData?.InvestorRegistration?.reg_mobile ||
          userData?.InvestorRegistration?.mobile ||
          userData?.mobile;
        const mobile = rawMobile
          ? String(rawMobile).replace(/\D/g, "").slice(-10)
          : "";

        let list: Investor[] = [];

        if (userTypeId === 2) {
          // Investor scope — try each selector on its own so a partial match still hits.
          if (investorId) {
            list = await fetchList({ investor_id: investorId });
          }
          if (list.length === 0 && mobile) {
            list = await fetchList({ mobile });
          }
          // Last-resort direct lookup — bypasses the investor-list filters entirely.
          if (list.length === 0 && mobile) {
            list = await fetchUccByMobileDirect(mobile);
          }
        } else if (userTypeId === 4 && userData?.partner?.regId) {
          list = await fetchList({ partner_id: userData.partner.regId });
        } else {
          list = await fetchList({});
        }

        setInvestors(list);
        if (list.length > 0) {
          setSelectedInvestorId(list[0].id);
        } else {
          toastAlert(
            "error",
            "No UCC found for this account. Complete NSE onboarding to place orders."
          );
        }
      } catch (err) {
        handleServerError(err);
      }
    })();
  }, []);

  // Defensive ISIN guard — if the caller passed a Morningstar ISIN as the
  // scheme_code by mistake, resolve it to the canonical NSE scheme row before
  // the user hits Place Order. An ISIN is always 12 characters starting with
  // 2 country letters (e.g. "INF" / "INE"), a proper NSE scheme_code never
  // matches that shape.
  useEffect(() => {
    const looksLikeIsin = (v: string) =>
      !!v && /^[A-Z]{2}[A-Z0-9]{9}\d$/i.test(v.trim());

    const needsResolve =
      (looksLikeIsin(schemeCode) && !isin) || // scheme_code is actually an ISIN
      (looksLikeIsin(schemeCode) && schemeCode.trim() === isin.trim()); // both match → definitely an ISIN

    if (!needsResolve) return;

    const isinToResolve = (isin || schemeCode).trim().toUpperCase();
    setSchemeResolving(true);
    setSchemeResolveError("");
    (async () => {
      try {
        const res = await api.get("/nse/scheme/resolve-by-isin", {
          params: { isin: isinToResolve },
        });
        const outer = res?.data?.data ?? res?.data ?? {};
        const resolved = outer?.data;
        if (outer?.status !== "S" || !resolved?.matched) {
          setSchemeResolveError(
            outer?.remark || "This scheme is not available on NSE for execution"
          );
          return;
        }
        setSchemeCode(resolved.scheme_code || "");
        setSchemeName(resolved.scheme_name || schemeName || "");
        setAmcCode(resolved.amc_code || amcCode);
        setIsin(resolved.isin || isinToResolve);
        if (resolved.min_purchase_amount) setMinAmount(resolved.min_purchase_amount);
      } catch (err) {
        setSchemeResolveError("Failed to verify this scheme on NSE");
        handleServerError(err);
      } finally {
        setSchemeResolving(false);
      }
    })();
    // Only run once on mount — we only want to correct the initial URL params,
    // not re-run after the user interacts with the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const banks = selectedInvestor?.banks || [];

  // Whenever the selected investor changes, re-check whether their AOF is on
  // file. Block the Place Order button until the check resolves to "uploaded".
  const refreshAofStatus = useCallback(async () => {
    const code = selectedInvestor?.client_code?.trim();
    if (!code) {
      setAofStatus("unknown");
      setAofErrorRemark("");
      return;
    }
    setAofStatus("checking");
    setAofErrorRemark("");
    try {
      const next = await checkAofStatus(code);
      setAofStatus(next);
      if (next === "missing") {
        setAofErrorRemark("AOF image not yet uploaded for this UCC.");
      }
    } catch (err: any) {
      setAofStatus("error");
      setAofErrorRemark(err?.msg || "Unable to verify AOF status");
    }
  }, [selectedInvestor?.client_code]);

  useEffect(() => {
    refreshAofStatus();
  }, [refreshAofStatus]);

  // Pull the UCC's registered XSIP mandates so the Mandate ID field is a
  // dropdown. Scans the last ~2 years because a mandate approved earlier
  // is still valid until its end date. Runs only when SIP is the active
  // transaction type — Purchase/Redemption don't need this list.
  //
  // "Approved" criteria: status text contains approve/active/success/
  // registered, OR the mandate already has a UMRN (UMRN issued ⇒ bank
  // approval done — the textual status sometimes lags by a day on NSE's
  // side, so UMRN is the more reliable signal).
  const fetchMandates = useCallback(async () => {
    const code = selectedInvestor?.client_code?.trim();
    if (!code || transactionType !== "S") {
      setMandateOptions([]);
      return;
    }
    setMandatesLoading(true);
    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      const today = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const toIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const fromIso = `${twoYearsAgo.getFullYear()}-${pad(twoYearsAgo.getMonth() + 1)}-${pad(twoYearsAgo.getDate())}`;
      // NSEMF spec for /reports/MANDATE_STATUS expects YYYY-MM-DD; backend
      // also normalizes, so either format works — sending ISO directly.
      const res = await api.post("/nse/mandate-status", {
        mandate_id: "",
        client_code: code,
        from_date: fromIso,
        to_date: toIso,
      });
      const outer = res?.data?.data ?? {};
      const inner = outer?.data ?? outer;
      const rows: any[] = inner?.report_data || outer?.report_data || [];
      const approved: MandateOption[] = rows
        .map((r) => ({
          mandateId: String(r.mandateId ?? r.mandate_id ?? "").trim(),
          umrnNo: String(r.umrnNo ?? r.umrn_no ?? "").trim(),
          bankName: String(r.bankName ?? r.bank_name ?? "").trim(),
          accountNo: String(
            r.bankAccountNumber ?? r.accountNo ?? r.account_no ?? "",
          ).trim(),
          amount: String(r.amount ?? "").trim(),
          status: String(r.status ?? "").trim(),
        }))
        .filter((m) => {
          if (!m.mandateId) return false;
          const s = m.status.toLowerCase();
          const statusOk =
            s.includes("approve") ||
            s.includes("active") ||
            s.includes("success") ||
            s.includes("register");
          return statusOk || !!m.umrnNo;
        });
      setMandateOptions(approved);
    } catch {
      setMandateOptions([]);
    } finally {
      setMandatesLoading(false);
    }
  }, [selectedInvestor?.client_code, transactionType]);

  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  // Number to words helper
  const numberToWords = (num: number): string => {
    if (num === 0) return "";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
    return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
  };

  // Calls NSE GET_LINK for an order and returns the first-holder payment URL.
  // NSE's GET_LINK is a reporting endpoint — it can occasionally be slow to
  // reflect a freshly-created order, so we also expose this as a manual retry
  // from the success modal ("Refresh Link").
  const fetchPaymentLink = async (orderId: string): Promise<string> => {
    if (!orderId) return "";
    try {
      const linkRes = await api.post("/nse/get-link", {
        productType: transactionType === "R" ? "REDEMPTION" : "PUR",
        productRefId: orderId,
      });
      const linkData = linkRes?.data?.data ?? linkRes?.data;
      return (
        linkData?.data?.firstHolderLink ||
        linkData?.firstHolderLink ||
        linkData?.data?.link ||
        linkData?.link ||
        ""
      );
    } catch {
      return "";
    }
  };

  const handleRefreshPaymentLink = async () => {
    if (!orderSuccess?.orderId || fetchingLink) return;
    setFetchingLink(true);
    try {
      const link = await fetchPaymentLink(orderSuccess.orderId);
      if (link) {
        setOrderSuccess((prev: any) => ({ ...prev, paymentLink: link }));
      } else {
        toastAlert(
          "warn",
          "Payment link not yet available from NSE. Please try again in a moment."
        );
      }
    } finally {
      setFetchingLink(false);
    }
  };

  const handleOpenPaymentLink = () => {
    const link = orderSuccess?.paymentLink;
    if (!link) {
      toastAlert("error", "Payment link not available yet");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handlePlaceOrder = async () => {
    if (!selectedInvestor) { toastAlert("error", "Please select an investor"); return; }
    // The shared Amount field only applies to Purchase and SIP. Redemption,
    // Switch and SWP carry their own amount/units inputs in their own panels
    // and are validated later in their respective branches.
    if (transactionType === "P" || transactionType === "S") {
      if (!amount || parseFloat(amount) < parseFloat(minAmount)) {
        toastAlert("error", `Minimum amount is ₹${minAmount}`); return;
      }
    }
    if (schemeResolving) {
      toastAlert("warn", "Verifying scheme on NSE, please wait");
      return;
    }
    if (schemeResolveError || !schemeCode) {
      toastAlert("error", schemeResolveError || "Scheme could not be verified on NSE");
      return;
    }
    // AOF gate intentionally removed in production — NSE accepts the
    // order regardless of AOF status, and the upload can happen later
    // from the investor list. No banner, no warn toast on this screen.

    // SIP-specific guard rails
    if (transactionType === "S") {
      if (!sipStartDate) {
        toastAlert("error", "Please pick a SIP start date");
        return;
      }
      if (sipStartDate < sipMinStartDate) {
        toastAlert(
          "error",
          `Start date must be at least ${SIP_START_DATE_LEAD_DAYS} days from today (earliest: ${sipMinStartDate}).`,
        );
        return;
      }
      if (sipFrequency === "DAILY" && !sipEndDate) {
        toastAlert("error", "Daily SIP requires an end date");
        return;
      }
      if (sipFrequency !== "DAILY" && (!sipInstallmentNo || parseInt(sipInstallmentNo) < 1)) {
        toastAlert("error", "Number of installments is required");
        return;
      }
      if (!sipMandateId.trim()) {
        toastAlert("error", "XSIP Mandate ID is required");
        return;
      }
    }

    // Redemption-specific guard rails. NSE accepts either an amount or units
    // (not both), unless "all_units" is set — in which case both must be blank.
    if (transactionType === "R") {
      if (!redAllUnits && !redAmount && !redUnits) {
        toastAlert("error", "Enter a redemption amount, units, or tick 'Redeem all units'");
        return;
      }
      if (!redAllUnits && redAmount && redUnits) {
        toastAlert("error", "Enter either amount or units, not both");
        return;
      }
    }

    // Switch-specific guard rails. NSE requires the target scheme code and
    // disallows amount+units together. Demat switches only accept units.
    if (transactionType === "SW") {
      if (!switchToSchemeCode.trim()) {
        toastAlert("error", "Please enter the target scheme code");
        return;
      }
      if (!switchAllUnits && !switchAmount && !switchUnits) {
        toastAlert("error", "Enter a switch amount, units, or tick 'Switch all units'");
        return;
      }
      if (!switchAllUnits && switchAmount && switchUnits) {
        toastAlert("error", "Enter either amount or units, not both");
        return;
      }
      if (mode === "D" && !switchAllUnits && !switchUnits) {
        toastAlert("error", "Demat switches must be placed in units");
        return;
      }
    }

    // STP-specific guard rails. NSE treats STP like SIP for registration;
    // same 20-day cooling period applies. Amount and units are mutually
    // exclusive. Demat STP is units-only (physical allows either).
    if (transactionType === "ST") {
      if (!stpToSchemeCode.trim()) {
        toastAlert("error", "Please enter the target scheme code");
        return;
      }
      if (!stpStartDate) {
        toastAlert("error", "Please pick an STP start date");
        return;
      }
      if (stpStartDate < sipMinStartDate) {
        toastAlert(
          "error",
          `Start date must be at least ${SIP_START_DATE_LEAD_DAYS} days from today (earliest: ${sipMinStartDate}).`,
        );
        return;
      }
      if (stpFrequency === "DAILY" && !stpEndDate) {
        toastAlert("error", "Daily STP requires an end date");
        return;
      }
      if (stpFrequency !== "DAILY" && (!stpNoOfTransfers || parseInt(stpNoOfTransfers) < 1)) {
        toastAlert("error", "Number of transfers is required");
        return;
      }
      if (!stpAmount && !stpUnits) {
        toastAlert("error", "Enter an installment amount or units");
        return;
      }
      if (stpAmount && stpUnits) {
        toastAlert("error", "Enter either installment amount or units, not both");
        return;
      }
      if (mode === "D" && !stpUnits) {
        toastAlert("error", "Demat STP must be placed in units");
        return;
      }
      if (!stpFolioNo.trim() && mode === "P") {
        toastAlert("error", "Folio number is required for Physical STP");
        return;
      }
    }

    // SWP-specific guard rails. Same 20-day cooling period as SIP. DAILY
    // frequency uses an end date; all others use a withdrawal count.
    if (transactionType === "SP") {
      if (!swpStartDate) {
        toastAlert("error", "Please pick a SWP start date");
        return;
      }
      if (swpStartDate < sipMinStartDate) {
        toastAlert(
          "error",
          `Start date must be at least ${SIP_START_DATE_LEAD_DAYS} days from today (earliest: ${sipMinStartDate}).`,
        );
        return;
      }
      if (swpFrequency === "DAILY" && !swpEndDate) {
        toastAlert("error", "Daily SWP requires an end date");
        return;
      }
      if (swpFrequency !== "DAILY" && (!swpNoOfWithdrawals || parseInt(swpNoOfWithdrawals) < 1)) {
        toastAlert("error", "Number of withdrawals is required");
        return;
      }
      if (!swpAmount && !swpUnits) {
        toastAlert("error", "Enter an installment amount or units");
        return;
      }
      if (swpAmount && swpUnits) {
        toastAlert("error", "Enter either installment amount or units, not both");
        return;
      }
      if (mode === "D" && !swpUnits) {
        toastAlert("error", "Demat SWP must be placed in units");
        return;
      }
      if (!swpFolioNo.trim() && mode === "P") {
        toastAlert("error", "Folio number is required for Physical SWP");
        return;
      }
    }

    setSubmitting(true);
    try {
      // SIP branch → XSIP registration (different payload shape + endpoint)
      if (transactionType === "S") {
        const regPayload = {
          reg_data: [{
            amc_code: amcCode || "",
            sch_code: schemeCode,
            client_code: selectedInvestor.client_code || "",
            bank_ref_no: "",
            trans_mode: mode === "D" ? "D" : "P",
            dp_txn_mode: mode === "D" ? "C" : "P",
            start_date: formatDDMMYYYY(sipStartDate),
            frequency_type: sipFrequency,
            frequency_allowed: "1",
            installment_amount: amount,
            status: "1",
            folio_no: "",
            sip_remarks: "",
            installment_no: sipFrequency === "DAILY" ? "" : sipInstallmentNo,
            convenience_fee: "",
            xsip_mandate_id: sipMandateId.trim(),
            sub_broker_code: "",
            euin_number: euinDeclaration === "Y" ? euinNumber : "",
            euin_declaration: euinDeclaration,
            dpc_flag: "Y",
            first_order_today: sipFirstOrderToday,
            isip_mandate: "",
            sub_broker_arn: "",
            end_date: sipFrequency === "DAILY" ? formatDDMMYYYY(sipEndDate) : "",
            primary_holder_mobile: "",
            primary_holder_email: "",
            step_up_required: "N",
            step_up_start_date: "",
            step_up_end_date: "",
            step_up_frequency: "",
            step_up_amount: "",
            filler_1: "",
            filler_2: "",
            filler_3: "",
            filler_4: "",
            filler_5: "",
            member_unique_id: "",
          }],
        };

        const res = await api.post("/nse/xsip-registration", regPayload);
        const responseData = res?.data?.data ?? res?.data;

        // NSE wraps the XSIP result the same way — { status, data: { reg_data: [...] } }
        const regResult =
          responseData?.data?.reg_data?.[0] ||
          responseData?.reg_data?.[0] ||
          {};
        const regStatus = regResult?.reg_status || "";
        const regRemark = regResult?.reg_remark || "";

        if (responseData?.status === "S" && regStatus === "REG_SUCCESS") {
          // Backend chains GET_LINK (productType XSIP_REG) and attaches
          // the authorization URL onto reg_data[0].auth_link — the
          // investor must visit this to complete XSIP authorization.
          const xsipAuthLink: string =
            regResult?.auth_link ||
            regResult?.auth_links?.firstHolderLink ||
            "";
          setOrderSuccess({
            investor: selectedInvestor.name,
            pan: selectedInvestor.pan,
            scheme: schemeName,
            amount,
            type: "SIP",
            orderId: regResult?.reg_id || "",
            date: new Date().toLocaleString("en-IN"),
            paymentLink: "", // SIP has no one-shot payment link — mandate handles recurring debit
            authLink: xsipAuthLink,
          });
        } else {
          // NSE's XSIP error strings smash numbers into the text with no
          // separators: "INSTALLMENT AMT IS LESS THAN MINIMUM INSTALLMENT
          // AMT 200000". Pull the tail number out, format it in Indian
          // rupees, and surface the scheme's real minimum so the user knows
          // what to enter. Also auto-fill the Amount field to that minimum
          // so the next click succeeds immediately.
          const rawRemark = regRemark || responseData?.remark || "XSIP registration failed";
          const minMatch = /MINIMUM\s+INSTALLMENT\s+AMT\s+(\d+)/i.exec(rawRemark);
          if (minMatch) {
            const minRupees = Number(minMatch[1]);
            const formatted = minRupees.toLocaleString("en-IN");
            toastAlert(
              "error",
              `NSE rejected: this scheme's minimum SIP installment is ₹${formatted}. Please enter an amount of at least ₹${formatted}.`,
            );
            setAmount(String(minRupees));
          } else {
            toastAlert("error", rawRemark);
          }
        }
        return;
      }

      // Redemption branch → /nse/redemption. NSE expects either an amount
      // OR units (not both). When all_units="Y" both must be blank.
      if (transactionType === "R") {
        const redPayload = {
          transaction_details: [{
            order_ref_number: "",
            scheme_code: schemeCode,
            trxn_type: "R",
            buy_sell_type: "",
            client_code: selectedInvestor.client_code || "",
            demat_physical: mode === "D" ? "C" : "P",
            order_amount: redAllUnits ? "" : redAmount,
            folio_no: redFolioNo,
            remarks: "",
            kyc_flag: "Y",
            sub_broker_code: "",
            euin_number: euinDeclaration === "Y" ? euinNumber : "",
            euin_declaration: euinDeclaration,
            min_redemption_flag: "N",
            dpc_flag: "Y",
            all_units: redAllUnits ? "Y" : "N",
            redemption_units: redAllUnits ? "" : redUnits,
            sub_broker_arn: "",
            bank_ref_no: "",
            account_no: "",
            mobile_no: "",
            email: "",
            mandate_id: "",
            filler1: "",
            member_unique_id: "",
          }],
        };

        const res = await api.post("/nse/redemption", redPayload);
        const responseData = res?.data?.data ?? res?.data;

        if (responseData?.status === "S") {
          const txnData = responseData?.data?.transaction_details?.[0] || responseData?.data?.[0] || {};
          if (txnData.trxn_status === "TRXN FAILED") {
            toastAlert("error", txnData.trxn_remark || "Redemption failed");
          } else {
            const orderId = txnData.trxn_order_id || "";
            setOrderSuccess({
              investor: selectedInvestor.name,
              pan: selectedInvestor.pan,
              scheme: schemeName,
              amount: redAllUnits ? "" : (redAmount || ""),
              units: redAllUnits ? "ALL" : (redUnits || ""),
              type: "Redemption",
              orderId,
              date: new Date().toLocaleString("en-IN"),
              paymentLink: "",
            });
          }
        } else {
          toastAlert("error", responseData?.remark || "Redemption failed");
        }
        return;
      }

      // Switch branch → /nse/switch. NSE switches debit units from one scheme
      // and purchase into another inside the same AMC. Amount/units are
      // mutually exclusive; all_units forces a full switch-out.
      if (transactionType === "SW") {
        const swPayload = {
          transaction_details: [{
            order_ref_number: "",
            from_scheme_code: schemeCode,
            to_scheme_code: switchToSchemeCode.trim(),
            trxn_type: "SW",
            buy_sell_type: switchBuySellType,
            client_code: selectedInvestor.client_code || "",
            demat_physical: mode === "D" ? "C" : "P",
            amount: switchAllUnits || !switchAmount ? "" : switchAmount,
            units: switchAllUnits ? "" : switchUnits,
            all_units: switchAllUnits ? "Y" : "N",
            folio_no: switchFolioNo,
            remarks: "",
            kyc_flag: "Y",
            sub_broker_code: "",
            euin_number: euinDeclaration === "Y" ? euinNumber : "",
            euin_declaration: euinDeclaration,
            min_redemption_flag: "N",
            dpc_flag: "Y",
            sub_broker_arn: "",
            bank_ref_no: "",
            mobile_no: "",
            email: "",
            filler1: "",
            member_unique_id: "",
          }],
        };

        const res = await api.post("/nse/switch", swPayload);
        const responseData = res?.data?.data ?? res?.data;

        if (responseData?.status === "S") {
          const txnData = responseData?.data?.transaction_details?.[0] || responseData?.data?.[0] || {};
          if (txnData.trxn_status === "TRXN FAILED") {
            toastAlert("error", txnData.trxn_remark || "Switch failed");
          } else {
            const orderId = txnData.trxn_order_id || "";
            setOrderSuccess({
              investor: selectedInvestor.name,
              pan: selectedInvestor.pan,
              scheme: `${schemeName} → ${switchToSchemeCode.trim()}`,
              amount: switchAllUnits ? "" : (switchAmount || ""),
              units: switchAllUnits ? "ALL" : (switchUnits || ""),
              type: "Switch",
              orderId,
              date: new Date().toLocaleString("en-IN"),
              paymentLink: "",
            });
          }
        } else {
          toastAlert("error", responseData?.remark || "Switch failed");
        }
        return;
      }

      // STP branch → /nse/stp-registration. Reg_data envelope. Schedules
      // recurring transfers from the source scheme to a target scheme in
      // the same AMC.
      if (transactionType === "ST") {
        const stpPayload = {
          reg_data: [{
            amc_code: amcCode || "",
            from_scheme_code: schemeCode,
            to_scheme_code: stpToSchemeCode.trim(),
            client_code: selectedInvestor.client_code || "",
            trans_mode: mode === "D" ? "D" : "P",
            folio_no: stpFolioNo,
            start_date: formatDDMMYYYY(stpStartDate),
            end_date: stpFrequency === "DAILY" ? formatDDMMYYYY(stpEndDate) : "",
            frequency_type: stpFrequency,
            frequency_allowed: "1",
            no_of_transfers: stpFrequency === "DAILY" ? "" : stpNoOfTransfers,
            installment_amount: mode === "D" ? "" : (stpAmount || ""),
            installment_units: stpUnits || "",
            first_order_today: stpFirstOrderToday,
            sub_broker_code: "",
            euin_number: euinDeclaration === "Y" ? euinNumber : "",
            euin_declaration: euinDeclaration,
            dpc_flag: "Y",
            sub_broker_arn: "",
            remarks: "",
            filler_1: "",
            filler_2: "",
            filler_3: "",
            filler_4: "",
            filler_5: "",
            member_unique_id: "",
          }],
        };

        const res = await api.post("/nse/stp-registration", stpPayload);
        const responseData = res?.data?.data ?? res?.data;

        const regResult =
          responseData?.data?.reg_data?.[0] ||
          responseData?.reg_data?.[0] ||
          {};
        const regStatus = regResult?.reg_status || "";
        const regRemark = regResult?.reg_remark || "";

        if (responseData?.status === "S" && regStatus === "REG_SUCCESS") {
          setOrderSuccess({
            investor: selectedInvestor.name,
            pan: selectedInvestor.pan,
            scheme: `${schemeName} → ${stpToSchemeCode.trim()}`,
            amount: stpAmount || "",
            units: stpUnits || "",
            type: "STP",
            orderId: regResult?.reg_id || "",
            date: new Date().toLocaleString("en-IN"),
            paymentLink: "",
          });
        } else {
          toastAlert("error", regRemark || responseData?.remark || "STP registration failed");
        }
        return;
      }

      // SWP branch → /nse/swp-registration. Registration endpoints use the
      // reg_data envelope (same as SIP/XSIP) and return reg_status/reg_remark.
      if (transactionType === "SP") {
        const swpPayload = {
          reg_data: [{
            amc_code: amcCode || "",
            scheme_code: schemeCode,
            client_code: selectedInvestor.client_code || "",
            trans_mode: mode === "D" ? "D" : "P",
            folio_no: swpFolioNo,
            start_date: formatDDMMYYYY(swpStartDate),
            end_date: swpFrequency === "DAILY" ? formatDDMMYYYY(swpEndDate) : "",
            frequency_type: swpFrequency,
            frequency_allowed: "1",
            no_of_withdrawals: swpFrequency === "DAILY" ? "" : swpNoOfWithdrawals,
            installment_amount: mode === "D" ? "" : (swpAmount || ""),
            installment_units: swpUnits || "",
            first_order_today: swpFirstOrderToday,
            sub_broker_code: "",
            euin_number: euinDeclaration === "Y" ? euinNumber : "",
            euin_declaration: euinDeclaration,
            dpc_flag: "Y",
            sub_broker_arn: "",
            remarks: "",
            filler_1: "",
            filler_2: "",
            filler_3: "",
            filler_4: "",
            filler_5: "",
            member_unique_id: "",
          }],
        };

        const res = await api.post("/nse/swp-registration", swpPayload);
        const responseData = res?.data?.data ?? res?.data;

        const regResult =
          responseData?.data?.reg_data?.[0] ||
          responseData?.reg_data?.[0] ||
          {};
        const regStatus = regResult?.reg_status || "";
        const regRemark = regResult?.reg_remark || "";

        if (responseData?.status === "S" && regStatus === "REG_SUCCESS") {
          setOrderSuccess({
            investor: selectedInvestor.name,
            pan: selectedInvestor.pan,
            scheme: schemeName,
            amount: swpAmount || "",
            units: swpUnits || "",
            type: "SWP",
            orderId: regResult?.reg_id || "",
            date: new Date().toLocaleString("en-IN"),
            paymentLink: "",
          });
        } else {
          toastAlert("error", regRemark || responseData?.remark || "SWP registration failed");
        }
        return;
      }

      // Purchase branch → /nse/transaction. This is the default Lumpsum path.
      const txnPayload = {
        transaction_details: [{
          order_ref_number: "",
          scheme_code: schemeCode,
          trxn_type: "P",
          buy_sell_type: "FRESH",
          client_code: selectedInvestor.client_code || "",
          demat_physical: mode === "D" ? "C" : "P",
          order_amount: amount,
          folio_no: "",
          remarks: "",
          kyc_flag: "Y",
          sub_broker_code: "",
          euin_number: euinDeclaration === "Y" ? euinNumber : "",
          euin_declaration: euinDeclaration,
          min_redemption_flag: "N",
          dpc_flag: "Y",
          all_units: "N",
          redemption_units: "",
          sub_broker_arn: "",
          bank_ref_no: "",
          account_no: selectedBank || "",
          mobile_no: "",
          email: "",
          mandate_id: "",
          filler1: "",
          member_unique_id: "",
        }],
      };

      const res = await api.post("/nse/transaction", txnPayload);
      const responseData = res?.data?.data ?? res?.data;

      if (responseData?.status === "S") {
        const txnData = responseData?.data?.transaction_details?.[0] || responseData?.data?.[0] || {};
        if (txnData.trxn_status === "TRXN FAILED") {
          toastAlert("error", txnData.trxn_remark || "Transaction failed");
        } else {
          const orderId = txnData.trxn_order_id || "";
          const paymentLink = await fetchPaymentLink(orderId);

          setOrderSuccess({
            investor: selectedInvestor.name,
            pan: selectedInvestor.pan,
            scheme: schemeName,
            amount: amount,
            type: "Purchase",
            orderId,
            date: new Date().toLocaleString("en-IN"),
            paymentLink,
          });
        }
      } else {
        toastAlert("error", responseData?.remark || "Transaction failed");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ══════════════════════════════════════════
  //  ORDER SUCCESS MODAL
  // ══════════════════════════════════════════
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F1A1A] p-4">
        <div className="bg-[#111111] rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-4 text-center">
            <h2 className="text-white text-lg font-semibold">Order Status</h2>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheck className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB] mb-6">Order Successfully placed to NSE Invest</h3>

            <div className="bg-blue-50 rounded-xl p-5 text-left space-y-3 mb-6">
              {[
                { label: "Investor", value: `${orderSuccess.investor} / ${orderSuccess.pan}` },
                { label: "Scheme", value: orderSuccess.scheme },
                orderSuccess.amount
                  ? { label: "Amount", value: `₹${Number(orderSuccess.amount).toLocaleString("en-IN")}` }
                  : null,
                orderSuccess.units
                  ? { label: "Units", value: orderSuccess.units }
                  : null,
                { label: "Transaction Type", value: orderSuccess.type },
                { label: "Order Number", value: orderSuccess.orderId },
                { label: "Date", value: orderSuccess.date },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">{item.label}</span>
                  <span className="font-medium text-[#F9FAFB] text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {orderSuccess.type === "SIP" ? (
              <div className="space-y-3 mb-6">
                <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 text-center">
                  <p className="text-xs text-[#9CA3AF]">
                    SIP registered with NSE. Future instalments will be debited
                    automatically via the linked XSIP mandate on the chosen
                    frequency. Use the authorization link below to confirm the
                    XSIP registration.
                  </p>
                </div>
                {orderSuccess.authLink ? (
                  <>
                    <button
                      onClick={() => window.open(orderSuccess.authLink, "_blank", "noopener,noreferrer")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-md"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Authorize XSIP — Open NSE Link
                    </button>
                    <div className="flex items-center gap-2 bg-[#1F1A1A] rounded-lg p-3">
                      <input
                        readOnly
                        value={orderSuccess.authLink}
                        className="flex-1 text-xs text-[#9CA3AF] bg-transparent truncate outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(orderSuccess.authLink)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#F59E0B] text-white rounded-md text-xs font-medium hover:bg-[#D97706]"
                      >
                        {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-[#6B7280] text-center">
                    XSIP authorization link not returned by NSE yet — it usually appears within a minute. Check Member Desk if not received.
                  </p>
                )}
              </div>
            ) : orderSuccess.type === "SWP" ? (
              <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-[#9CA3AF]">
                  SWP registered with NSE. Withdrawals will be credited to the
                  investor's registered bank on the chosen frequency — no payment
                  link is issued for the registration itself.
                </p>
              </div>
            ) : orderSuccess.type === "Redemption" ? (
              <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-[#9CA3AF]">
                  Redemption order submitted to NSE. Proceeds will be credited
                  to the investor's registered bank once the AMC settles the
                  transaction — no payment link is issued for redemptions.
                </p>
              </div>
            ) : orderSuccess.type === "Switch" ? (
              <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-[#9CA3AF]">
                  Switch order submitted to NSE. Units will be redeemed from the
                  source scheme and allocated to the target scheme within the
                  same AMC — no payment link is issued for switches.
                </p>
              </div>
            ) : orderSuccess.type === "STP" ? (
              <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-[#9CA3AF]">
                  STP registered with NSE. Transfers will move units from the
                  source scheme to the target scheme on the chosen frequency —
                  no payment link is issued for the registration itself.
                </p>
              </div>
            ) : orderSuccess.paymentLink ? (
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleOpenPaymentLink}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-md"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Pay Now — Open NSE Payment Link
                </button>
                <div className="flex items-center gap-2 bg-[#1F1A1A] rounded-lg p-3">
                  <input
                    readOnly
                    value={orderSuccess.paymentLink}
                    className="flex-1 text-xs text-[#9CA3AF] bg-transparent truncate outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(orderSuccess.paymentLink)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#F59E0B] text-white rounded-md text-xs font-medium hover:bg-[#D97706]"
                  >
                    {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-[#9CA3AF] mb-2">
                  NSE hasn't returned a payment link yet. It usually appears within a minute
                  of order placement.
                </p>
                <button
                  onClick={handleRefreshPaymentLink}
                  disabled={fetchingLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-md text-xs font-semibold hover:bg-[#D97706] disabled:opacity-60"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${fetchingLink ? "animate-spin" : ""}`} />
                  {fetchingLink ? "Fetching..." : "Refresh Payment Link"}
                </button>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/nse-my-orders")}
                className="px-6 py-2.5 bg-[#F59E0B] text-white rounded-full text-sm font-semibold hover:bg-[#D97706]"
              >
                View Orders
              </button>
              <button
                onClick={() => { setOrderSuccess(null); setAmount(""); }}
                className="px-6 py-2.5 border border-[#3A3A3A] text-[#9CA3AF] rounded-full text-sm font-semibold hover:bg-[#1F1A1A]"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  //  ORDER FORM
  // ══════════════════════════════════════════
  return (
    <div className="nse-module p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-t-2xl px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white hover:text-white/80">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white text-lg font-semibold">Order Application Form</h2>
      </div>

      <div className="bg-[#111111] rounded-b-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Scheme & Investor Info */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">Scheme</span>
                <span className="font-medium text-[#F9FAFB] text-right max-w-[300px]">{schemeName || "--"}</span>
              </div>
              {isin && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">ISIN</span>
                  <span className="font-mono text-[#9CA3AF]">{isin}</span>
                </div>
              )}
              {schemeResolving && (
                <div className="flex items-center gap-2 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] px-3 py-2 text-xs text-[#9CA3AF]">
                  <svg className="animate-spin h-3.5 w-3.5 text-[#6B7280]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying this scheme on NSE MF Desk...
                </div>
              )}
              {!schemeResolving && schemeResolveError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {schemeResolveError}. Please pick another scheme.
                </div>
              )}
              {!schemeResolving && !schemeResolveError && schemeCode && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                  <FiCheck className="w-3.5 h-3.5" />
                  Verified on NSE — scheme code <span className="font-mono font-semibold">{schemeCode}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">UCC</span>
                <select
                  className="border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm text-[#F59E0B] font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  value={selectedInvestorId || ""}
                  onChange={(e) => setSelectedInvestorId(Number(e.target.value))}
                >
                  <option value="">Select Investor</option>
                  {investors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.client_code} - {inv.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">Folio</span>
                <span className="font-medium text-green-600">NEW</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">First Holder</span>
                <span className="font-medium text-[#F9FAFB]">{selectedInvestor?.name || "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">EUIN Declaration</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="euin_decl" value="Y" checked={euinDeclaration === "Y"} onChange={() => setEuinDeclaration("Y")} className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="text-xs">Yes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="euin_decl" value="N" checked={euinDeclaration === "N"} onChange={() => setEuinDeclaration("N")} className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="text-xs">No</span>
                  </label>
                </div>
              </div>
              {euinDeclaration === "Y" && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-[#9CA3AF]">EUIN Number</span>
                  <input
                    type="text"
                    value={euinNumber}
                    onChange={(e) => setEuinNumber(e.target.value.toUpperCase())}
                    placeholder="E123456"
                    className="border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - Order Details */}
          <div className="space-y-5">
            {/* Mode */}
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Mode :</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" value="P" checked={mode === "P"} onChange={() => setMode("P")} className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm">Physical</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" value="D" checked={mode === "D"} onChange={() => setMode("D")} className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm">Demat</span>
                </label>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Transaction Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              >
                <option value="P">{fromPortfolio ? "Lumpsum (Purchase)" : "Purchase"}</option>
                <option value="S">SIP</option>
                {fromPortfolio && <option value="SW">Switch</option>}
                {fromPortfolio && <option value="ST">STP</option>}
                {fromPortfolio && <option value="SP">SWP</option>}
                {fromPortfolio && <option value="R">Redemption</option>}
              </select>
            </div>

            {/* SIP / XSIP fields — only visible when Transaction Type = SIP */}
            {transactionType === "S" && (
              <div className="space-y-4 rounded-xl border border-[#2A2A2A] bg-[#1F1A1A] p-4">
                <div className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  SIP Details
                </div>

                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Frequency</label>
                  <select
                    value={sipFrequency}
                    onChange={(e) => setSipFrequency(e.target.value)}
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {SIP_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={sipStartDate}
                      min={sipMinStartDate}
                      onChange={(e) => setSipStartDate(e.target.value)}
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Must be at least {SIP_START_DATE_LEAD_DAYS} days ahead — NSE
                      needs time to activate the mandate.
                    </p>
                  </div>
                  {sipFrequency === "DAILY" ? (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">End Date</label>
                      <input
                        type="date"
                        value={sipEndDate}
                        min={sipStartDate || sipMinStartDate}
                        onChange={(e) => setSipEndDate(e.target.value)}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Number of Installments Months</label>
                      <input
                        type="number"
                        value={sipInstallmentNo}
                        onChange={(e) => setSipInstallmentNo(e.target.value)}
                        placeholder="12"
                        min={1}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 flex items-center gap-2">
                    <span>XSIP Mandate ID</span>
                    {mandatesLoading && (
                      <span className="text-[11px] text-[#6B7280]">loading…</span>
                    )}
                    <button
                      type="button"
                      onClick={fetchMandates}
                      disabled={mandatesLoading || !selectedInvestor?.client_code}
                      className="ml-auto text-[10px] uppercase tracking-wider text-[#9CA3AF] hover:text-white border border-[#3A3A3A] rounded px-2 py-0.5 disabled:opacity-40"
                      title="Re-fetch approved mandates from NSE"
                    >
                      Refresh
                    </button>
                  </label>
                  <select
                    value={sipMandateId}
                    onChange={(e) => setSipMandateId(e.target.value)}
                    disabled={mandatesLoading || mandateOptions.length === 0}
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {mandatesLoading
                        ? "Fetching approved mandates from NSE..."
                        : mandateOptions.length === 0
                        ? "No approved mandates available — register one first"
                        : "Select an approved mandate"}
                    </option>
                    {mandateOptions.map((m) => (
                      <option key={m.mandateId} value={m.mandateId}>
                        {m.mandateId} — {m.bankName || "Bank"}
                        {m.accountNo ? ` (A/C ****${m.accountNo.slice(-4)})` : ""}
                        {m.amount ? ` · ₹${m.amount} cap` : ""}
                        {m.umrnNo ? ` · UMRN ${m.umrnNo}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    {mandatesLoading
                      ? "Looking up approved mandates for this UCC..."
                      : mandateOptions.length > 0
                      ? `${mandateOptions.length} approved mandate(s) found for this UCC.`
                      : "No approved mandates yet for this UCC. Once a mandate is approved (UMRN issued), click Refresh."}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">First Order Today</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sip_first_today"
                        value="Y"
                        checked={sipFirstOrderToday === "Y"}
                        onChange={() => setSipFirstOrderToday("Y")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sip_first_today"
                        value="N"
                        checked={sipFirstOrderToday === "N"}
                        onChange={() => setSipFirstOrderToday("N")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* Redemption (R) — visible only when Transaction Type = Redemption */}
            {transactionType === "R" && (
              <div className="space-y-4 rounded-xl border border-[#2A2A2A] bg-[#1F1A1A] p-4">
                <div className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  Redemption Details
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Folio Number</label>
                  <input
                    type="text"
                    value={redFolioNo}
                    onChange={(e) => setRedFolioNo(e.target.value)}
                    placeholder="Existing folio"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redAllUnits}
                    onChange={(e) => setRedAllUnits(e.target.checked)}
                    className="w-4 h-4 text-[#F59E0B]"
                  />
                  <span className="text-sm">Redeem all units</span>
                </label>
                {!redAllUnits && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Amount (₹)</label>
                      <input
                        type="number"
                        value={redAmount}
                        onChange={(e) => { setRedAmount(e.target.value); if (e.target.value) setRedUnits(""); }}
                        placeholder="0"
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Units</label>
                      <input
                        type="number"
                        value={redUnits}
                        onChange={(e) => { setRedUnits(e.target.value); if (e.target.value) setRedAmount(""); }}
                        placeholder="0.000"
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-[#6B7280]">
                  Enter either amount or units (NSE rejects both together). Tick "Redeem all units" to sell the full balance.
                </p>
              </div>
            )}

            {/* Switch (SW) — visible only when Transaction Type = Switch */}
            {transactionType === "SW" && (
              <div className="space-y-4 rounded-xl border border-[#2A2A2A] bg-[#1F1A1A] p-4">
                <div className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  Switch Details
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  From Scheme: <span className="font-mono text-[#F9FAFB]">{schemeCode || "—"}</span>
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Switch to Scheme Code</label>
                  <input
                    type="text"
                    value={switchToSchemeCode}
                    onChange={(e) => setSwitchToSchemeCode(e.target.value.toUpperCase())}
                    placeholder="Target scheme code (e.g. AXLCRG-GR)"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] font-mono"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Destination scheme must be under the same AMC.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Buy / Sell Type</label>
                  <select
                    value={switchBuySellType}
                    onChange={(e) => setSwitchBuySellType(e.target.value as "FRESH" | "ADDITIONAL")}
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="FRESH">Fresh</option>
                    <option value="ADDITIONAL">Additional</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Folio Number</label>
                  <input
                    type="text"
                    value={switchFolioNo}
                    onChange={(e) => setSwitchFolioNo(e.target.value)}
                    placeholder="Existing folio (mandatory for Physical)"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={switchAllUnits}
                    onChange={(e) => setSwitchAllUnits(e.target.checked)}
                    disabled={mode === "D"}
                    className="w-4 h-4 text-[#F59E0B]"
                  />
                  <span className="text-sm">Switch all units {mode === "D" ? "(not allowed for Demat)" : ""}</span>
                </label>
                {!switchAllUnits && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Amount (₹)</label>
                      <input
                        type="number"
                        value={switchAmount}
                        onChange={(e) => { setSwitchAmount(e.target.value); if (e.target.value) setSwitchUnits(""); }}
                        placeholder="0"
                        disabled={mode === "D"}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Units</label>
                      <input
                        type="number"
                        value={switchUnits}
                        onChange={(e) => { setSwitchUnits(e.target.value); if (e.target.value) setSwitchAmount(""); }}
                        placeholder="0.000"
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-[#6B7280]">
                  Demat switches must use units. Physical switches can use amount or units.
                </p>
              </div>
            )}

            {/* STP (ST) — visible only when Transaction Type = STP */}
            {transactionType === "ST" && (
              <div className="space-y-4 rounded-xl border border-[#2A2A2A] bg-[#1F1A1A] p-4">
                <div className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  STP Details
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">To Scheme Code</label>
                  <input
                    type="text"
                    value={stpToSchemeCode}
                    onChange={(e) => setStpToSchemeCode(e.target.value.toUpperCase())}
                    placeholder="Target scheme code (e.g. AXLCRG-GR)"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Must belong to the same AMC as the source scheme.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Frequency</label>
                  <select
                    value={stpFrequency}
                    onChange={(e) => setStpFrequency(e.target.value)}
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {SIP_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={stpStartDate}
                      min={sipMinStartDate}
                      onChange={(e) => setStpStartDate(e.target.value)}
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                  {stpFrequency === "DAILY" ? (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">End Date</label>
                      <input
                        type="date"
                        value={stpEndDate}
                        min={stpStartDate || sipMinStartDate}
                        onChange={(e) => setStpEndDate(e.target.value)}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Number of Transfers</label>
                      <input
                        type="number"
                        value={stpNoOfTransfers}
                        onChange={(e) => setStpNoOfTransfers(e.target.value)}
                        placeholder="12"
                        min={1}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Folio Number</label>
                  <input
                    type="text"
                    value={stpFolioNo}
                    onChange={(e) => setStpFolioNo(e.target.value)}
                    placeholder="Existing folio (mandatory for Physical)"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Installment Amount (₹)</label>
                    <input
                      type="number"
                      value={stpAmount}
                      onChange={(e) => { setStpAmount(e.target.value); if (e.target.value) setStpUnits(""); }}
                      placeholder="0"
                      disabled={mode === "D"}
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Installment Units</label>
                    <input
                      type="number"
                      value={stpUnits}
                      onChange={(e) => { setStpUnits(e.target.value); if (e.target.value) setStpAmount(""); }}
                      placeholder="0.000"
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Demat STP requires units (amount must be blank). Physical STP accepts either.
                </p>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">First Order Today</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stp_first_today"
                        value="Y"
                        checked={stpFirstOrderToday === "Y"}
                        onChange={() => setStpFirstOrderToday("Y")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stp_first_today"
                        value="N"
                        checked={stpFirstOrderToday === "N"}
                        onChange={() => setStpFirstOrderToday("N")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SWP (SP) — visible only when Transaction Type = SWP */}
            {transactionType === "SP" && (
              <div className="space-y-4 rounded-xl border border-[#2A2A2A] bg-[#1F1A1A] p-4">
                <div className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  SWP Details
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Frequency</label>
                  <select
                    value={swpFrequency}
                    onChange={(e) => setSwpFrequency(e.target.value)}
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {SIP_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={swpStartDate}
                      min={sipMinStartDate}
                      onChange={(e) => setSwpStartDate(e.target.value)}
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                  {swpFrequency === "DAILY" ? (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">End Date</label>
                      <input
                        type="date"
                        value={swpEndDate}
                        min={swpStartDate || sipMinStartDate}
                        onChange={(e) => setSwpEndDate(e.target.value)}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Number of Withdrawals</label>
                      <input
                        type="number"
                        value={swpNoOfWithdrawals}
                        onChange={(e) => setSwpNoOfWithdrawals(e.target.value)}
                        placeholder="12"
                        min={1}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Folio Number</label>
                  <input
                    type="text"
                    value={swpFolioNo}
                    onChange={(e) => setSwpFolioNo(e.target.value)}
                    placeholder="Existing folio (mandatory for Physical)"
                    className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Installment Amount (₹)</label>
                    <input
                      type="number"
                      value={swpAmount}
                      onChange={(e) => { setSwpAmount(e.target.value); if (e.target.value) setSwpUnits(""); }}
                      placeholder="0"
                      disabled={mode === "D"}
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Installment Units</label>
                    <input
                      type="number"
                      value={swpUnits}
                      onChange={(e) => { setSwpUnits(e.target.value); if (e.target.value) setSwpAmount(""); }}
                      placeholder="0.000"
                      className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Demat SWP requires units (amount must be blank). Physical SWP accepts either.
                </p>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">First Order Today</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="swp_first_today"
                        value="Y"
                        checked={swpFirstOrderToday === "Y"}
                        onChange={() => setSwpFirstOrderToday("Y")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="swp_first_today"
                        value="N"
                        checked={swpFirstOrderToday === "N"}
                        onChange={() => setSwpFirstOrderToday("N")}
                        className="w-4 h-4 text-[#F59E0B]"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Scheme Type and Amount — only for Purchase and SIP (R/SW/SP
                drive their own amount/units inputs in their own panels). */}
            {(transactionType === "P" || transactionType === "S") && (
              <>
                <div>
                  <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Scheme Type :</label>
                  <div className="flex items-center gap-4">
                    {[
                      { value: "GR", label: "Growth" },
                      { value: "DP", label: "Dividend Payout" },
                      { value: "DR", label: "Dividend Reinvestment" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scheme_type" value={opt.value} checked={schemeType === opt.value} onChange={() => setSchemeType(opt.value)} className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-[#9CA3AF] font-medium">Amount:</label>
                    <span className="text-xs text-[#6B7280]">Min: ₹{Number(minAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={minAmount}
                      className="w-full pl-7 pr-4 py-2.5 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-xs text-[#6B7280] mt-1">{numberToWords(Math.floor(parseFloat(amount)))}</p>
                  )}
                </div>
              </>
            )}

            {/* Payment block — shown for Purchase and SIP. Redemption skips
                payment selection (money flows the other way). */}
            {(transactionType === "P" || transactionType === "S") && (
              <>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pay_opt" value="link" checked={paymentOption === "link"} onChange={() => setPaymentOption("link")} className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-sm">Send payment link on email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pay_opt" value="pay" checked={paymentOption === "pay"} onChange={() => setPaymentOption("pay")} className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-sm">Pay Now</span>
                  </label>
                </div>

                {paymentOption === "pay" && (
                  <>
                    {/* Payment Mode */}
                    <div>
                      <label className="text-sm text-[#9CA3AF] font-medium mb-2 block">Payment Modes :</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      >
                        {PAYMENT_MODES.map((pm) => (
                          <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Selection (for Mandate, Cheque, UPI, NetBanking) */}
                    {["MANDATE", "CHEQUE", "UPI", "NETBANKING"].includes(paymentMode) && banks.length > 0 && (
                      <div className="border border-[#2A2A2A] rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#1F1A1A] text-xs text-[#9CA3AF] uppercase">
                              <th className="px-3 py-2 text-left w-8">Select</th>
                              <th className="px-3 py-2 text-left">Bank Name</th>
                              <th className="px-3 py-2 text-left">Account No</th>
                              <th className="px-3 py-2 text-left">Branch Name</th>
                              <th className="px-3 py-2 text-left">Default Bank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {banks.map((bank) => (
                              <tr key={bank.account_no} className="border-t border-gray-50">
                                <td className="px-3 py-2">
                                  <input type="radio" name="pay_bank" value={bank.account_no} checked={selectedBank === bank.account_no} onChange={() => setSelectedBank(bank.account_no)} className="w-4 h-4 text-[#F59E0B]" />
                                </td>
                                <td className="px-3 py-2 text-[#E5E7EB]">{bank.bank_name || "--"}</td>
                                <td className="px-3 py-2 font-mono text-xs">{bank.account_no}</td>
                                <td className="px-3 py-2 text-[#9CA3AF] text-xs">{bank.branch_name || "--"}</td>
                                <td className="px-3 py-2 text-center">{bank.default_bank_flag || "N"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Cheque fields */}
                    {paymentMode === "CHEQUE" && (
                      <div className="space-y-3">
                        <p className="text-xs text-[#9CA3AF]">Cheque to be made in favour of</p>
                        <p className="text-sm font-medium">Beneficiary Name : NSE INVEST PLATFORM NCL SETTLEMENT A/C</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-[#9CA3AF] mb-1 block">Cheque Number</label>
                            <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                          </div>
                          <div>
                            <label className="text-xs text-[#9CA3AF] mb-1 block">Cheque Date</label>
                            <input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI fields */}
                    {paymentMode === "UPI" && (
                      <div>
                        <label className="text-xs text-[#9CA3AF] mb-1 block">UPI ID</label>
                        <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                      </div>
                    )}

                    {/* NEFT/RTGS fields */}
                    {paymentMode === "NEFT" && (
                      <div className="space-y-3">
                        <div className="bg-[#1F1A1A] rounded-xl p-4 space-y-2 text-sm">
                          {[
                            { label: "Beneficiary Name", value: "NSE INVEST PLATFORM NCL SETTLEMENT AC" },
                            { label: "Bank Name", value: "HDFC BANK LTD" },
                            { label: "Branch Name", value: "FORT, MUMBAI" },
                            { label: "IFSC Code", value: "HDFC0000060" },
                            { label: "Virtual Account No", value: `NSEMF${selectedInvestor?.client_code || "XXXXXX"}` },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-[#9CA3AF]">{item.label}</span>
                              <span className="font-medium text-[#F9FAFB]">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-xs text-[#9CA3AF] mb-1 block">NEFT / RTGS UTR Number (Optional)</label>
                          <input type="text" value={neftUtr} onChange={(e) => setNeftUtr(e.target.value)} className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* AOF banner intentionally removed for production — NSE accepts
            orders without an on-file AOF image, and the upload happens
            from the investor list. The Upload AOF modal still exists in
            this component but is no longer surfaced from this screen. */}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[#2A2A2A]">
          <button
            onClick={handlePlaceOrder}
            disabled={
              submitting ||
              schemeResolving ||
              !!schemeResolveError ||
              !schemeCode
            }
            title={
              schemeResolving
                ? "Verifying scheme on NSE..."
                : schemeResolveError
                ? schemeResolveError
                : ""
            }
            className="px-8 py-2.5 bg-[#F59E0B] text-white rounded-full text-sm font-semibold hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-8 py-2.5 border border-[#3A3A3A] text-[#9CA3AF] rounded-full text-sm font-semibold hover:bg-[#1F1A1A]"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-[#6B7280] text-center mt-4">
          By clicking on Place Order, I confirm that I have read all the Scheme Information Documents.
        </p>
      </div>

      {showAofUpload && selectedInvestor?.client_code && (
        <AofUploadModal
          clientCode={selectedInvestor.client_code}
          investorName={selectedInvestor.name}
          onClose={() => setShowAofUpload(false)}
          onUploaded={() => {
            setAofStatus("uploaded");
            setAofErrorRemark("");
            // NSE updates its auth report asynchronously — force a refresh so
            // the status survives a page reload.
            setTimeout(() => refreshAofStatus(), 1500);
          }}
        />
      )}
    </div>
  );
}
