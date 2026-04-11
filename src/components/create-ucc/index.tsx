"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomTextarea from "@/commonUI/TextArea";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { EMAIL_REGEX, PAN_NO_REGEX, USER_DATA } from "@/utils/constants";
import AccountContext from "@/context/AccountContext/Account.context";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiCheck } from "react-icons/fi";
import OTPInput from "react-otp-input";

// ── Dropdown Options ──

const yesNoOptions = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
];

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
  { value: "T", label: "Transgender" },
];

const occupationOptions = [
  { value: "01", label: "Business" },
  { value: "02", label: "Service" },
  { value: "03", label: "Professional" },
  { value: "04", label: "Agriculture" },
  { value: "05", label: "Retired" },
  { value: "06", label: "Housewife" },
  { value: "07", label: "Student" },
  { value: "08", label: "Others" },
];

const maritalStatusOptions = [
  { value: "M", label: "Married" },
  { value: "U", label: "Unmarried" },
  { value: "O", label: "Others" },
];

const annualIncomeOptions = [
  { value: "01", label: "Below 1 Lac" },
  { value: "02", label: "> 1 <=5 Lacs" },
  { value: "03", label: "> 5 <=10 Lacs" },
  { value: "04", label: "> 10 <=25 Lacs" },
  { value: "05", label: "> 25 Lacs <= 1 Crore" },
  { value: "06", label: "> 1 Crore" },
];

const wealthSourceOptions = [
  { value: "01", label: "Salary" },
  { value: "02", label: "Business Income" },
  { value: "03", label: "Gift" },
  { value: "04", label: "Ancestral Property" },
  { value: "05", label: "Rental Income" },
  { value: "06", label: "Prize Money" },
  { value: "07", label: "Royalty" },
  { value: "08", label: "Others" },
];

const addressTypeOptions = [
  { value: "1", label: "Residential" },
  { value: "2", label: "Business" },
  { value: "3", label: "Residential or Business" },
  { value: "4", label: "Registered Office" },
];

const pepOptions = [
  { value: "N", label: "Not a politically exposed person" },
  { value: "P", label: "A politically exposed person" },
  { value: "R", label: "Related to a politically exposed person" },
];

// NSE UCC spec (page 50, fields 131-132): identity type values must be 1-4 only.
// 2 = Aadhaar — only LAST 4 DIGITS are accepted (privacy requirement).
// 4 = OCI/Passport — typically only for foreign nominees.
const nomineeIdProofOptions = [
  { value: "1", label: "PAN" },
  { value: "2", label: "Aadhaar (last 4 digits)" },
  { value: "3", label: "Driving Licence" },
  { value: "4", label: "OCI / Passport" },
];

// Validate nominee identity number against the chosen identity type
const validateNomineeIdNumber = (type: string, num: string): string | true => {
  if (!num) return "ID number is required";
  const v = num.trim().toUpperCase();
  switch (type) {
    case "1":
      return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) || "Enter a valid 10-character PAN (e.g., ABCDE1234F)";
    case "2":
      return /^\d{4}$/.test(v) || "Enter the LAST 4 digits of Aadhaar only";
    case "3":
      return (/^[A-Z0-9]{5,20}$/.test(v)) || "Enter a valid driving licence number";
    case "4":
      return (/^[A-Z0-9]{5,20}$/.test(v)) || "Enter a valid passport / OCI number";
    default:
      return "Select an ID proof type first";
  }
};

const idDocTypeOptions = [
  { value: "PAN", label: "PAN" },
  { value: "PASSPORT", label: "Passport" },
  { value: "VOTER", label: "Voter ID" },
  { value: "DL", label: "Driving License" },
  { value: "AADHAAR", label: "Aadhaar" },
];

const mobileRelationOptions = [
  { value: "SE", label: "SELF" },
  { value: "SP", label: "SPOUSE" },
  { value: "GD", label: "GUARDIAN" },
  { value: "DP", label: "DEPENDENT PARENTS" },
  { value: "DC", label: "DEPENDENT CHILDREN" },
  { value: "DS", label: "DEPENDENT SIBLINGS" },
  { value: "PM", label: "PMS" },
  { value: "CD", label: "CUSTODIAN" },
  { value: "PO", label: "POA" },
];

const holdingNatureOptions = [
  { value: "SI", label: "Single" },
  { value: "JO", label: "Joint" },
  { value: "AS", label: "Anyone or Survivor" },
];

const clientTypeOptions = [
  { value: "P", label: "Physical" },
  { value: "D", label: "Demat" },
];

const accountTypeOptions = [
  { value: "SB", label: "SB - Savings" },
  { value: "CB", label: "CB - Current" },
  { value: "NE", label: "NE - NRE" },
  { value: "NO", label: "NO - NRO" },
];

const communicationModeOptions = [
  { value: "P", label: "P - Physical" },
  { value: "E", label: "E - Electronic" },
  { value: "M", label: "M - Mobile" },
];

const divPayModeOptions = [
  { value: "01", label: "01 - Cheque" },
  { value: "02", label: "02 - Direct Credit" },
  { value: "03", label: "03 - ECS" },
  { value: "04", label: "04 - NEFT" },
  { value: "05", label: "05 - RTGS" },
];

const paperlessFlagOptions = [
  { value: "Z", label: "Z - Email + Mobile" },
  { value: "P", label: "P - Physical" },
];

const declarationFlagOptions = [
  { value: "SE", label: "SE - Self" },
  { value: "OT", label: "OT - Others" },
];

const nominationAuthOptions = [
  { value: "W", label: "W - Wet Signature" },
  { value: "E", label: "E - eSign" },
  { value: "O", label: "O - OTP Authentication" },
  { value: "V", label: "V - Video Recording" },
];

const kycTypeOptions = [
  { value: "K", label: "K - KRA Compliant" },
  { value: "C", label: "C - CKYC Compliant" },
  { value: "B", label: "B - Biometric KYC" },
  { value: "E", label: "E - Aadhaar eKYC PAN" },
];

const nomineeRelationshipOptions = [
  { value: "01", label: "01 - Spouse" },
  { value: "02", label: "02 - Son" },
  { value: "03", label: "03 - Daughter" },
  { value: "04", label: "04 - Father" },
  { value: "05", label: "05 - Mother" },
  { value: "06", label: "06 - Brother" },
  { value: "07", label: "07 - Sister" },
  { value: "08", label: "08 - Grand Father" },
  { value: "09", label: "09 - Grand Mother" },
  { value: "10", label: "10 - Grand Son" },
  { value: "11", label: "11 - Grand Daughter" },
  { value: "12", label: "12 - Uncle" },
  { value: "13", label: "13 - Aunt" },
  { value: "14", label: "14 - Nephew" },
  { value: "15", label: "15 - Niece" },
  { value: "16", label: "16 - Cousin" },
  { value: "17", label: "17 - Son-in-law" },
  { value: "18", label: "18 - Daughter-in-law" },
  { value: "19", label: "19 - Brother-in-law" },
  { value: "20", label: "20 - Sister-in-law" },
  { value: "21", label: "21 - Father-in-law" },
  { value: "22", label: "22 - Mother-in-law" },
  { value: "23", label: "23 - Others" },
];

const nomineeIdentityTypeOptions = [
  { value: "1", label: "1 - PAN" },
  { value: "2", label: "2 - Aadhaar" },
  { value: "3", label: "3 - Driving Licence" },
  { value: "4", label: "4 - OCI/Passport" },
];

const defaultDpOptions = [
  { value: "CDSL", label: "CDSL" },
  { value: "NSDL", label: "NSDL" },
];

const panExemptCategoryOptions = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
];

// ── Default Form Values ──

const defaultValues = {
  // Step 1 - PAN & Aadhaar
  tax_status: "",
  primary_holder_pan: "",
  primary_holder_first_name: "",
  primary_holder_middle_name: "",
  primary_holder_last_name: "",
  primary_holder_dob_incorporation: "",
  primary_holder_pan_exempt: "N",
  primary_holder_exempt_category: "",
  primary_holder_kyc_type: "",
  primary_holder_ckyc_number: "",
  aadhaar_updated: "Y",
  mapin_id: "",
  address_1: "",
  address_2: "",
  address_3: "",
  city: "",
  state: "",
  pincode: "",
  country: "INDIA",
  // Step 1 - secondary/third/guardian PAN
  second_holder_pan: "",
  second_holder_pan_exempt: "N",
  second_holder_exempt_category: "",
  third_holder_pan: "",
  third_holder_pan_exempt: "N",
  third_holder_exempt_category: "",
  guardian_pan: "",
  guardian_pan_exempt: "N",
  guardian_exempt_category: "",
  // Step 2 - Holder Details
  client_code: "",
  gender: "M",
  occupation_code: "01",
  holding_nature: "SI",
  marital_status: "M",
  annual_income: "02",
  wealth_source: "",
  address_type: "1",
  city_of_birth: "",
  country_of_birth: "INDIA",
  pep_status: "N",
  tax_india_only: true,
  tax_residency_country: "",
  tax_id_doc_type: "",
  tax_id_number: "",
  second_holder_first_name: "",
  second_holder_middle_name: "",
  second_holder_last_name: "",
  second_holder_dob: "",
  second_holder_mobile: "",
  second_holder_mobile_relation: "",
  second_holder_email: "",
  second_holder_email_relation: "",
  second_holder_occupation: "",
  second_holder_annual_income: "",
  second_holder_wealth_source: "",
  second_holder_address_type: "",
  second_holder_city_of_birth: "",
  second_holder_country_of_birth: "INDIA",
  second_holder_pep: "N",
  second_holder_tax_india_only: true,
  third_holder_first_name: "",
  third_holder_middle_name: "",
  third_holder_last_name: "",
  third_holder_dob: "",
  third_holder_mobile: "",
  third_holder_mobile_relation: "",
  third_holder_email: "",
  third_holder_email_relation: "",
  third_holder_occupation: "",
  third_holder_annual_income: "",
  third_holder_wealth_source: "",
  third_holder_address_type: "",
  third_holder_city_of_birth: "",
  third_holder_country_of_birth: "INDIA",
  third_holder_pep: "N",
  third_holder_tax_india_only: true,
  guardian_first_name: "",
  guardian_middle_name: "",
  guardian_last_name: "",
  guardian_dob: "",
  // Step 3 - Bank & Address
  account_type_1: "SB",
  account_no_1: "",
  micr_no_1: "",
  ifsc_code_1: "",
  default_bank_flag_1: "Y",
  bank_name_1: "",
  branch_name_1: "",
  bank_address_1: "",
  bank_city_1: "",
  bank_pincode_1: "",
  account_type_2: "",
  account_no_2: "",
  micr_no_2: "",
  ifsc_code_2: "",
  default_bank_flag_2: "",
  bank_name_2: "",
  branch_name_2: "",
  bank_address_2: "",
  bank_city_2: "",
  bank_pincode_2: "",
  cheque_name: "",
  div_pay_mode: "01",
  resi_phone: "",
  resi_fax: "",
  office_phone: "",
  office_fax: "",
  email: "",
  communication_mode: "E",
  indian_mobile_no: "",
  foreign_address_1: "",
  foreign_address_2: "",
  foreign_address_3: "",
  foreign_address_city: "",
  foreign_address_pincode: "",
  foreign_address_state: "",
  foreign_address_country: "",
  // Step 4 - Nomination & Others
  client_type: "P",
  pms: "",
  default_dp: "",
  cdsl_dpid: "",
  cdslcltid: "",
  cmbp_id: "",
  nsdldpid: "",
  nsdlcltid: "",
  paperless_flag: "Z",
  mobile_declaration_flag: "SE",
  email_declaration_flag: "SE",
  nomination_opt: "Y",
  nomination_authentication: "O",
  nominee_1_name: "",
  nominee_1_relationship: "05",
  nominee_1_applicable: "",
  nominee_1_minor_flag: "N",
  nominee_1_dob: "",
  nominee_1_guardian: "",
  nominee_1_identity_type: "1",
  nominee_1_identity_number: "",
  nominee_1_email: "",
  nominee_1_mobile: "",
  nominee_1_address1: "",
  nominee_1_address2: "",
  nominee_1_address3: "",
  nominee_1_city: "",
  nominee_1_pin: "",
  nominee_1_country: "INDIA",
  nominee_soa: "Y",
  do_not_wish_to_nominate: false,
  show_nominee_in_soa: true,
  nominee_1_share: "",
  nominee_1_same_address: true,
  nominee_1_guardian_pan: "",
  // Nominee 2
  nominee_2_name: "",
  nominee_2_relationship: "",
  nominee_2_dob: "",
  nominee_2_share: "",
  nominee_2_email: "",
  nominee_2_mobile: "",
  nominee_2_identity_type: "",
  nominee_2_identity_number: "",
  nominee_2_minor_flag: false,
  nominee_2_guardian: "",
  nominee_2_guardian_pan: "",
  nominee_2_same_address: true,
  nominee_2_address1: "",
  nominee_2_address2: "",
  nominee_2_address3: "",
  nominee_2_pin: "",
  nominee_2_city: "",
  nominee_2_country: "INDIA",
  // Nominee 3
  nominee_3_name: "",
  nominee_3_relationship: "",
  nominee_3_dob: "",
  nominee_3_share: "",
  nominee_3_email: "",
  nominee_3_mobile: "",
  nominee_3_identity_type: "",
  nominee_3_identity_number: "",
  nominee_3_minor_flag: false,
  nominee_3_guardian: "",
  nominee_3_guardian_pan: "",
  nominee_3_same_address: true,
  nominee_3_address1: "",
  nominee_3_address2: "",
  nominee_3_address3: "",
  nominee_3_pin: "",
  nominee_3_city: "",
  nominee_3_country: "INDIA",
  reg_id: "",
  reg_status: "",
  reg_remark: "",
};

// ── Step validation fields ──

// Per NSE CLIENTCOMMON183 spec: mandatory fields only in step validation
const stepFields: Record<number, string[]> = {
  0: [
    "tax_status",
    "primary_holder_pan",
    "primary_holder_pan_exempt",
  ],
  1: [
    "client_code",
    "holding_nature",
    "gender",
    "marital_status",
    "annual_income",
    "address_type",
    "address_1", "pincode", "city", "state", "country",
    "city_of_birth", "country_of_birth",
  ],
  2: [],
  3: [
    "div_pay_mode",
  ],
};

const STEP_LABELS = [
  "PAN & Aadhaar",
  "Holding Pattern",
  "Nominee Details",
  "Bank Details",
];

// ── Helper Components ──

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-full border-b border-gray-200 pb-1 mt-4 mb-1">
      <h3 className="font-semibold text-sm text-secondary">{title}</h3>
    </div>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full border-b border-gray-200 pb-1 mt-4 mb-1 cursor-pointer"
      >
        <h3 className="font-semibold text-sm text-secondary">{title}</h3>
        {open ? <IoIosArrowUp size={16} /> : <IoIosArrowDown size={16} />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Date helpers ──

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

// ── PAN helpers ──

const isValidPANFormat = (pan?: string) => {
  if (!pan) return false;
  return PAN_NO_REGEX.test(pan.toUpperCase());
};

// ── Main Component ──

function CreateUCC() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSecondHolder, setShowSecondHolder] = useState(false);
  const [showThirdHolder, setShowThirdHolder] = useState(false);
  const [nomineeCount, setNomineeCount] = useState(1);
  const [bankCount, setBankCount] = useState(1);
  const [defaultBankIdx, setDefaultBankIdx] = useState(1);
  const [showGuardian, setShowGuardian] = useState(false);

  // PAN verification state
  const [panCheckLoader, setPanCheckLoader] = useState(false);
  const [panStatusVerified, setPanStatusVerified] = useState(false);
  const [panDisabled, setPanDisabled] = useState(false);
  const [nameDisable, setNameDisable] = useState(false);
  const [kycStatus, setKycStatus] = useState(false);
  const [taxStatusLabel, setTaxStatusLabel] = useState("");
  const [showPanAlert, setShowPanAlert] = useState(false);
  const [panAlertMessage, setPanAlertMessage] = useState("");

  // UCC submission result modal state
  const [uccResultModal, setUccResultModal] = useState<{
    open: boolean;
    success: boolean;
    title: string;
    message: string;
    clientCode?: string;
  }>({ open: false, success: false, title: "", message: "" });

  // Aadhaar verification state
  const [aadhaarCheckLoader, setAadhaarCheckLoader] = useState(false);
  const [aadhaarOtpResponse, setAadhaarOtpResponse] = useState<any>(null);
  const [aadhaarOTP, setAadhaarOTP] = useState<string | null>(null);
  const [otpVerifyLoader, setOtpVerifyLoader] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarNo, setAadhaarNo] = useState("");

  // Bank verification state
  const [bankVerifyLoader1, setBankVerifyLoader1] = useState(false);
  const [bankVerified1, setBankVerified1] = useState(false);
  const [bankVerifyLoader2, setBankVerifyLoader2] = useState(false);
  const [bankVerified2, setBankVerified2] = useState(false);

  // PAN Exempt & KYC collapsible + Guardian PAN verification (for Minor)
  const [showPanExemptKyc, setShowPanExemptKyc] = useState(false);
  const [guardianPanCheckLoader, setGuardianPanCheckLoader] = useState(false);
  const [guardianPanVerified, setGuardianPanVerified] = useState(false);
  const [guardianPanDisabled, setGuardianPanDisabled] = useState(false);
  const [guardianNameDisable, setGuardianNameDisable] = useState(false);

  // Listings & lookups
  const [countryList, setCountryList] = useState<any>([]);
  const [stateList, setStateList] = useState<any>([]);

  const modalRef = useRef<HTMLDialogElement | null>(null);
  const { setListings, listings } = useContext<any>(AccountContext);

  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const panValue = watch("primary_holder_pan");

  // ── Initial load: fetch tax_status listings & country ──

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/kyc/on-boarding-listings`);
        if (res?.data?.data) {
          const list = res.data.data;
          setListings((prev: any) => ({ ...(prev || {}), ...(list || {}) }));
          // Tax Status is restricted to Individual / On Behalf of Minor
          setValue("tax_status", "01");
          setTaxStatusLabel("Individual");
        }
      } catch (err) {
        handleServerError(err);
      }
    })();
    getCountryList();

    // Prefill mobile number from localStorage if available, then fetch existing UCC record
    const userData: any = getLS(USER_DATA);
    const storedMobile =
      userData?.InvestorRegistration?.reg_mobile ||
      userData?.InvestorRegistration?.mobile ||
      userData?.InvestorRegistration?.mobile_no ||
      userData?.mobile ||
      userData?.mobile_no ||
      "";
    if (storedMobile) {
      const cleaned = String(storedMobile).replace(/\D/g, "").slice(-10);
      if (cleaned) {
        setValue("indian_mobile_no", cleaned, { shouldValidate: true });
        prefillFromExistingUCC(cleaned);
      }
    }
  }, []);

  // ── Prefill all 4 pages from saved UCC record by mobile ──
  const snakeToCamel = (s: string) =>
    s.split("_").map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join("");

  const normalizeDob = (val: any) => {
    if (typeof val !== "string") return val;
    const v = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m = v.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    // ISO datetime → YYYY-MM-DD
    const isoMatch = v.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoMatch) return isoMatch[1];
    return v;
  };

  const prefillFromExistingUCC = async (mobile: string) => {
    try {
      const res = await api.get(`/nse/ucc/search-by-mobile/${mobile}`);
      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload?.status !== "S" || !payload?.data) return;

      const record: Record<string, any> = payload.data;

      Object.keys(defaultValues).forEach((formKey) => {
        const camelKey = snakeToCamel(formKey);
        if (Object.prototype.hasOwnProperty.call(record, camelKey)) {
          let val = record[camelKey];
          if (val === null || val === undefined || val === "") return;
          if (/(^|_)dob($|_)|date_of|incorporation/i.test(formKey)) {
            val = normalizeDob(val);
          }
          setValue(formKey as any, val, { shouldValidate: false });
        }
      });

      // Restore step the user previously reached, if any
      if (typeof record.formStep === "number" && record.formStep >= 0 && record.formStep <= 3) {
        setCurrentStep(record.formStep);
      }
    } catch (err) {
      // 404 / not found is expected for first-time users — silently ignore
    }
  };

  // Reset PAN verified status when PAN changes
  useEffect(() => {
    if (panValue && panStatusVerified) {
      setPanStatusVerified(false);
      setPanDisabled(false);
    }
  }, [panValue]);

  // ── Country / State fetchers ──

  const getCountryList = async () => {
    try {
      const res = await api.get(`/country/getAllCountry`);
      if (res?.data?.data) {
        setCountryList(res.data.data);
        const india = res.data.data.find((c: any) => c.name.toLowerCase() === "india");
        if (india) {
          await getStateList(india.id);
        }
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const getStateList = async (countryId: any) => {
    try {
      const res = await api.get(`/state/getAllStateByCountry/${countryId}`);
      if (res?.data?.data) {
        setStateList(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (error) {
      handleServerError(error);
      return [];
    }
  };

  // ── Bank Account Verification (Cashfree) ──

  const handleVerifyBank = async (bankIndex: 1 | 2) => {
    const accountNo = getValues(`account_no_${bankIndex}` as any);
    const ifsc = getValues(`ifsc_code_${bankIndex}` as any);

    if (!accountNo || accountNo.length < 9) {
      toastAlert("error", "Please enter a valid account number (min 9 digits)");
      return;
    }
    if (!ifsc || ifsc.length !== 11) {
      toastAlert("error", "Please enter a valid 11-character IFSC code");
      return;
    }

    const setLoader = bankIndex === 1 ? setBankVerifyLoader1 : setBankVerifyLoader2;
    const setVerified = bankIndex === 1 ? setBankVerified1 : setBankVerified2;

    try {
      setLoader(true);
      const payload = {
        bankAcNo: accountNo,
        bankAcIfsc: ifsc.toUpperCase(),
        mobile: getValues("indian_mobile_no") || "",
        bankAcNameInBank: getValues("primary_holder_first_name") || "",
      };

      const response = await api.post("/cashfree/initiate-bank-account-verification", payload);

      if (response?.data?.data) {
        const bankData = response.data.data;
        if (bankData.micr) setValue(`micr_no_${bankIndex}` as any, bankData.micr, { shouldValidate: true });
        if (bankData.bank_name || bankData.bank) setValue(`bank_name_${bankIndex}` as any, bankData.bank_name || bankData.bank, { shouldValidate: true });
        if (bankData.branch) {
          setValue(`branch_name_${bankIndex}` as any, bankData.branch, { shouldValidate: true });
          setValue(`bank_address_${bankIndex}` as any, bankData.branch, { shouldValidate: true });
        }
        if (bankData.address) setValue(`bank_address_${bankIndex}` as any, bankData.address, { shouldValidate: true });
        if (bankData.city) setValue(`bank_city_${bankIndex}` as any, bankData.city, { shouldValidate: true });
        if (bankData.pincode) setValue(`bank_pincode_${bankIndex}` as any, bankData.pincode, { shouldValidate: true });

        setVerified(true);
        toastAlert("success", response.data.msg || "Bank account verified successfully");
      }
    } catch (err) {
      setVerified(false);
      handleServerError(err);
    } finally {
      setLoader(false);
    }
  };

  // ── PAN Check (CVL KRA) ──

  const validatePAN = (pan?: string): boolean => {
    if (!pan) {
      setPanAlertMessage("Please enter PAN number first");
      setShowPanAlert(true);
      return false;
    }
    if (!isValidPANFormat(pan)) {
      setPanAlertMessage("Invalid PAN format. Must be 10 characters: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)");
      setShowPanAlert(true);
      return false;
    }
    return true;
  };

  const handleCheckPanStatus = async () => {
    const pan = getValues("primary_holder_pan");
    if (!validatePAN(pan)) return;

    try {
      setPanCheckLoader(true);
      setNameDisable(false);

      const res = await api.post(`/kyc/checkPANStatus`, {
        pan_no: pan.toUpperCase(),
        taxStatus: taxStatusLabel,
      });
      if (res?.data?.data) {
        setPanStatusVerified(true);
        setPanDisabled(true);
        toastAlert("success", res.data.msg || "PAN status checked successfully");
        const data = res.data.data;
        if (data?.User_kycName) {
          // Split name into first/middle/last
          const nameParts = data.User_kycName.trim().split(/\s+/);
          setValue("primary_holder_first_name", nameParts[0] || "", { shouldValidate: true });
          setValue("primary_holder_middle_name", nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "", { shouldValidate: true });
          setValue("primary_holder_last_name", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "", { shouldValidate: true });
          setKycStatus(Boolean(data.kycStatus));
          setNameDisable(true);

          // Set KYC type based on kycStatus
          if (data.kycStatus) {
            setValue("primary_holder_kyc_type", "C", { shouldValidate: true });
          }
        }
      }
    } catch (err) {
      setPanStatusVerified(false);
      handleServerError(err);
    } finally {
      setPanCheckLoader(false);
    }
  };

  const handleEditPan = () => {
    setPanDisabled(false);
    setPanStatusVerified(false);
    setNameDisable(false);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setValue("primary_holder_pan", value, { shouldValidate: true });

    if (panStatusVerified) {
      setPanStatusVerified(false);
      setPanDisabled(false);
    }
  };

  // ── Guardian PAN Check (CVL KRA) — for Minor tax status ──

  const handleCheckGuardianPan = async () => {
    const pan = getValues("guardian_pan");
    if (!pan || !isValidPANFormat(pan)) {
      toastAlert("error", "Please enter a valid Guardian PAN");
      return;
    }
    try {
      setGuardianPanCheckLoader(true);
      setGuardianNameDisable(false);
      const res = await api.post(`/kyc/checkPANStatus`, {
        pan_no: pan.toUpperCase(),
        taxStatus: taxStatusLabel,
      });
      if (res?.data?.data) {
        setGuardianPanVerified(true);
        setGuardianPanDisabled(true);
        toastAlert("success", res.data.msg || "Guardian PAN verified");
        const data = res.data.data;
        if (data?.User_kycName) {
          const nameParts = data.User_kycName.trim().split(/\s+/);
          setValue("guardian_first_name", nameParts[0] || "", { shouldValidate: true });
          setValue("guardian_middle_name", nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");
          setValue("guardian_last_name", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
          setGuardianNameDisable(true);
        }
      }
    } catch (err) {
      setGuardianPanVerified(false);
      handleServerError(err);
    } finally {
      setGuardianPanCheckLoader(false);
    }
  };

  const handleEditGuardianPan = () => {
    setGuardianPanDisabled(false);
    setGuardianPanVerified(false);
    setGuardianNameDisable(false);
  };

  const handleGuardianPanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setValue("guardian_pan", value, { shouldValidate: true });
    if (guardianPanVerified) {
      setGuardianPanVerified(false);
      setGuardianPanDisabled(false);
    }
  };

  // Helper: check if selected tax status is "Minor"
  const isMinorTaxStatus = () => {
    return watch("tax_status") === "02";
  };

  // ── Aadhaar Verification (Cashfree) ──

  const handleCheckAadhaar = async () => {
    if (!aadhaarNo || aadhaarNo.length !== 12) {
      toastAlert("error", "Please enter valid 12-digit Aadhaar");
      return;
    }

    try {
      setAadhaarCheckLoader(true);
      const userData: any = getLS(USER_DATA);
      const payload: any = {
        aadhaar: aadhaarNo,
        investor_id: userData?.InvestorRegistration?.id,
      };
      const data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);
      if (data?.data) {
        setAadhaarOtpResponse(data.data.data);
        modalRef.current?.showModal();
        toastAlert("success", data.data.msg || "OTP sent to Aadhaar linked mobile");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setAadhaarCheckLoader(false);
    }
  };

  const reSendOtp = async () => {
    try {
      const userData: any = getLS(USER_DATA);
      const payload: any = {
        aadhaar: aadhaarNo,
        investor_id: userData?.InvestorRegistration?.id,
      };
      const data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);
      if (data?.data) {
        setAadhaarOtpResponse(data.data.data);
        toastAlert("success", data.data.msg || "OTP resent");
      }
    } catch (err) {
      handleServerError(err);
    }
  };

  const onhandleOtpSubmit = async () => {
    if (!aadhaarOTP) {
      toastAlert("error", "Please enter OTP");
      return;
    }
    setOtpVerifyLoader(true);
    try {
      const userData: any = getLS(USER_DATA);
      const payload = {
        otp: aadhaarOTP,
        investor_id: userData?.InvestorRegistration?.id,
        aadhaar: aadhaarNo,
        ref_id: aadhaarOtpResponse?.ref_id,
      };
      const data = await api.post(`/cashfree/aadhaar-otp-verification`, payload);
      const result = data?.data?.data;

      if (result) {
        // Auto-fill address from Aadhaar
        setValue("address_1", result.address || "", { shouldValidate: true });
        setValue("country", result.split_address?.country || "INDIA", { shouldValidate: true });
        setValue("state", result.split_address?.state || "", { shouldValidate: true });
        setValue("pincode", result.split_address?.pincode || "", { shouldValidate: true });
        setValue("city", result.split_address?.dist || "", { shouldValidate: true });

        // Auto-fill DOB from Aadhaar — convert DD-MM-YYYY (or DD/MM/YYYY) to YYYY-MM-DD for <input type="date">
        if (result.dob) {
          const raw = String(result.dob).trim();
          let isoDob = "";
          // Already ISO (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            isoDob = raw;
          } else {
            const parts = raw.split(/[-/]/);
            if (parts.length === 3 && parts[2].length === 4) {
              const [dd, mm, yyyy] = parts;
              isoDob = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
            }
          }
          if (isoDob) {
            setValue("primary_holder_dob_incorporation", isoDob, { shouldValidate: true });
          }
        }

        // Auto-fill gender if present
        if (result.gender) {
          const genderMap: Record<string, string> = { MALE: "M", FEMALE: "F", TRANSGENDER: "O", M: "M", F: "F" };
          setValue("gender", genderMap[result.gender?.toUpperCase()] || "M", { shouldValidate: true });
        }

        // Auto-fill name from Aadhaar if not already filled from PAN
        if (result.name && !getValues("primary_holder_first_name")) {
          const nameParts = result.name.trim().split(/\s+/);
          setValue("primary_holder_first_name", nameParts[0] || "", { shouldValidate: true });
          setValue("primary_holder_middle_name", nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "", { shouldValidate: true });
          setValue("primary_holder_last_name", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "", { shouldValidate: true });
        }

        // Set aadhaar_updated flag
        setValue("aadhaar_updated", "Y", { shouldValidate: true });

        setAadhaarVerified(true);
        modalRef.current?.close();
        setAadhaarOTP(null);
        toastAlert("success", data.data.msg || "Aadhaar verified successfully");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setOtpVerifyLoader(false);
    }
  };

  // ── Form Submit ──

  // const onSubmit = async (data: any) => {
  //   try {
  //     setLoading(true);
  //     const res = await api.post("/transaction/create-ucc", data);
  //     toastAlert("success", res?.data?.data?.msg || "UCC created successfully");
  //     reset();
  //     setCurrentStep(0);
  //     setPanStatusVerified(false);
  //     setPanDisabled(false);
  //     setAadhaarVerified(false);
  //     setAadhaarNo("");
  //     setBankVerified1(false);
  //     setBankVerified2(false);
  //     setGuardianPanVerified(false);
  //     setGuardianPanDisabled(false);
  //     setGuardianNameDisable(false);
  //     setShowPanExemptKyc(false);
  //   } catch (error) {
  //     handleServerError(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //new cod eby adity afor form submit
  // Replace onSubmit with this:
const onSubmit = async (data: any) => {
  try {
    setLoading(true);
    const userData: any = getLS(USER_DATA);
    const investor_id = userData?.InvestorRegistration?.id;
    const res = await api.post("/nse/ucc/step-3", { ...data, investor_id });

    // Backend wraps NSE response as: { status, remark, data: { step3, ucc } }
    const payload = res?.data?.data ?? res?.data ?? {};
    const backendStatus = payload?.status ?? res?.data?.status;
    const backendRemark = payload?.remark ?? res?.data?.remark;
    const regDetails = payload?.data?.ucc?.reg_details?.[0] ?? payload?.ucc?.reg_details?.[0];
    const isSuccess = backendStatus === "S" || regDetails?.reg_status === "REG_SUCCESS";

    if (!isSuccess) {
      setUccResultModal({
        open: true,
        success: false,
        title: "UCC Creation Failed",
        message: regDetails?.reg_remark || backendRemark || "UCC registration failed at NSE",
      });
      return;
    }

    const clientCode = regDetails?.reg_id || "";
    const successMsg = backendRemark || "Your UCC has been created successfully";

    setUccResultModal({
      open: true,
      success: true,
      title: "Congratulations!",
      message: successMsg,
      clientCode,
    });

    reset();
    setCurrentStep(0);
    setPanStatusVerified(false);
    setPanDisabled(false);
    setAadhaarVerified(false);
    setAadhaarNo("");
    setBankVerified1(false);
    setBankVerified2(false);
    setGuardianPanVerified(false);
    setGuardianPanDisabled(false);
    setGuardianNameDisable(false);
    setShowPanExemptKyc(false);
  } catch (error: any) {
    const errResp = error?.response?.data;
    const errPayload = errResp?.data ?? errResp ?? {};
    const errRegDetails = errPayload?.data?.ucc?.reg_details?.[0] ?? errPayload?.ucc?.reg_details?.[0];
    const rawMsg: string =
      errRegDetails?.reg_remark ||
      errPayload?.remark ||
      errResp?.remark ||
      errResp?.msg ||
      errResp?.message ||
      errResp?.error ||
      (typeof errResp === "string" ? errResp : null) ||
      error?.message ||
      "Failed to create UCC. Please try again.";

    // NSE requires FATCA to succeed BEFORE UCC — distinguish that failure so
    // the user knows which step to fix. The backend throws with a prefix of
    // "NSE FATCA upload rejected" or "NSE FATCA upload failed".
    const isFatcaFailure = /NSE FATCA|FATCA upload/i.test(rawMsg);
    const errMsg = isFatcaFailure
      ? `FATCA registration failed — ${rawMsg
          .replace(/NSE FATCA upload (rejected|failed)[^—:]*[—:]?\s*/i, "")
          .replace(/\.\s*UCC not attempted\.?$/i, "")
          .trim() || "NSE rejected the FATCA details"}. Please review Place of Birth, Country of Birth, Tax Residence, Income Slab and Source of Wealth in Step 2.`
      : rawMsg;
    setUccResultModal({
      open: true,
      success: false,
      title: isFatcaFailure ? "FATCA Registration Failed" : "UCC Creation Failed",
      message: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
    });
  } finally {
    setLoading(false);
  }
};


  // ── Step Navigation ──

  // const handleNext = async () => {
  //   const fields = stepFields[currentStep] as any;
  //   const valid = await trigger(fields);
  //   if (valid) setCurrentStep((s) => Math.min(s + 1, 3));
  // };
  //new code by aditya for next sving details -
  const handleNext = async () => {
  const fields = stepFields[currentStep] as any;
  const valid = await trigger(fields);
  if (!valid) return;

  // ── Step 2 pre-flight: nominee identity is mandatory per NSE UCC spec ──
  if (currentStep === 2) {
    const v = getValues() as any;
    const doNotNominate = !!v.do_not_wish_to_nominate;
    if (!doNotNominate) {
      for (let i = 1; i <= nomineeCount; i++) {
        const nm = v[`nominee_${i}_name`];
        if (!nm || !String(nm).trim()) continue;
        const idType = v[`nominee_${i}_identity_type`];
        const idNum = v[`nominee_${i}_identity_number`];
        if (!idType) {
          toastAlert("error", `Nominee ${i}: please select an ID Proof type (NSE requires it).`);
          return;
        }
        const result = validateNomineeIdNumber(String(idType), String(idNum || ""));
        if (result !== true) {
          toastAlert("error", `Nominee ${i}: ${result}`);
          return;
        }
      }
    }
  }

  try {
    const data: any = getValues();
    const userData: any = getLS(USER_DATA);
    const investor_id = userData?.InvestorRegistration?.id;
    const endpointMap: Record<number, string> = {
      0: "/nse/ucc/step-0",
      1: "/nse/ucc/step-1",
      2: "/nse/ucc/step-2",
    };
    const endpoint = endpointMap[currentStep];
    if (endpoint) {
      // Ensure tax_status and aadhaar number are explicitly included.
      // aadhaarNo lives in component state (useState), so getValues() does not pick it up.
      // Force-read tax_status from form — CustomReactSelect uses setValue only, not register
      const resolvedTaxStatus = data.tax_status || getValues("tax_status") || "01";
      const payload: any = {
        ...data,
        investor_id,
        // Send in BOTH snake_case and camelCase — backend saveUCCStep0 may use either
        tax_status: resolvedTaxStatus,
        taxStatus: resolvedTaxStatus,
        // aadhaarNo lives in component state (useState), so getValues() does not pick it up
        aadhaar_no: aadhaarNo || "",
        aadhaar_number: aadhaarNo || "",
        aadhaar: aadhaarNo || "",
        aadhaarNo: aadhaarNo || "",
      };
      console.log("[handleNext] step", currentStep, "tax_status =", resolvedTaxStatus, "aadhaar =", aadhaarNo);

      // ── Step 2 (Nominee page) — normalize nominee fields so backend persists them ──
      if (currentStep === 2) {
        const doNotNominate = !!data.do_not_wish_to_nominate;
        payload.do_not_wish_to_nominate = doNotNominate;
        payload.nomination_opt = doNotNominate ? "N" : "Y";
        payload.nominee_count = nomineeCount;

        // Coerce minor_flag to consistent "Y" / "N" strings (backend has mixed schema)
        const toFlag = (v: any) => (v === true || v === "Y" || v === "y" ? "Y" : "N");

        // Strip blank-only nominees that shouldn't be persisted
        for (const i of [1, 2, 3]) {
          const prefix = `nominee_${i}_`;
          const hasName = !!(data[`${prefix}name`] && String(data[`${prefix}name`]).trim());
          const inUse = i <= nomineeCount && hasName && !doNotNominate;

          payload[`${prefix}minor_flag`] = toFlag(data[`${prefix}minor_flag`]);
          payload[`${prefix}same_address`] = !!data[`${prefix}same_address`];

          // Ensure share is string of digits
          if (data[`${prefix}share`] != null && data[`${prefix}share`] !== "") {
            payload[`${prefix}share`] = String(data[`${prefix}share`]);
          }

          if (!inUse) {
            // Send empty/null for unused slots so backend can clear them
            [
              "name", "relationship", "dob", "share", "email", "mobile",
              "identity_type", "identity_number", "guardian", "guardian_pan",
              "address1", "address2", "address3", "pin", "city", "country",
            ].forEach((k) => {
              payload[`${prefix}${k}`] = "";
            });
            payload[`${prefix}minor_flag`] = "N";
            payload[`${prefix}same_address`] = false;
          }
        }
      }

      await api.post(endpoint, payload);
    }
    setCurrentStep((s) => Math.min(s + 1, 3));
  } catch (err) {
    handleServerError(err);
  }
};



  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // ══════════════════════════════════════════
  //  STEP 0 — PAN & Aadhaar Verification
  // ══════════════════════════════════════════

  const renderStep0 = () => (
    <>
      <SectionTitle title="Identity Verification" />

      {/* Row 1: Tax Status + PAN */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Status */}
          <CustomReactSelect
            label="Tax Status"
            items={[
              { id: "01", status: "Individual" },
              { id: "02", status: "On Behalf of Minor" },
            ]}
            required
            bindValue="id"
            bindName="status"
            value={watch("tax_status")}
            placeholder="Select Tax Status"
            onChange={(e: any) => {
              setValue("tax_status", e.id, { shouldValidate: true });
              setTaxStatusLabel(e.status);
            }}
            error={errors.tax_status?.message}
          />

          {/* PAN with Check/Edit button */}
          <CustomInput
            label="PAN Number"
            placeholder="Enter PAN (e.g., ABCDE1234F)"
            required
            value={watch("primary_holder_pan")}
            onChange={handlePanChange}
            error={errors.primary_holder_pan?.message}
            disabled={panDisabled}
            maxLength={10}
            button={
              !panDisabled ? (
                <CustomButton
                  type="button"
                  className="px-3 py-2 text-sm h-8"
                  onClick={handleCheckPanStatus}
                  loading={panCheckLoader}
                  disabled={panCheckLoader || panDisabled || !!errors.primary_holder_pan}
                >
                  Check
                </CustomButton>
              ) : (
                <CustomButton
                  type="button"
                  className="px-3 py-2 text-sm h-8"
                  onClick={handleEditPan}
                >
                  Edit
                </CustomButton>
              )
            }
          />
        </div>

        {panValue && isValidPANFormat(panValue) && (
          <p className="text-xs text-green-600 mt-1">Valid PAN format</p>
        )}
      </div>

      {/* Mobile + Mobile Relation + Email + Email Relation (after PAN, before Aadhaar) */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Controller
            name="indian_mobile_no"
            control={control}
            rules={{
              required: "Mobile number is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Enter a valid 10-digit mobile number",
              },
            }}
            render={({ field }) => (
              <CustomInput
                label="Mobile Number"
                placeholder="Enter 10-digit mobile number"
                required
                maxLength={10}
                value={field.value || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  field.onChange(val);
                }}
                onBlur={field.onBlur}
                error={errors.indian_mobile_no?.message}
              />
            )}
          />
          <CustomReactSelect
            label="Mobile Relation"
            items={mobileRelationOptions}
            required
            bindValue="value"
            bindName="label"
            value={watch("mobile_declaration_flag")}
            placeholder="Select Mobile Relation"
            onChange={(e: any) => {
              setValue("mobile_declaration_flag", e.value, { shouldValidate: true });
            }}
            error={errors.mobile_declaration_flag?.message}
          />
          <CustomInput
            label="Email"
            placeholder="Enter email address"
            required
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: EMAIL_REGEX,
                message: "Enter a valid email address",
              },
            })}
          />
          <CustomReactSelect
            label="Email Relation"
            items={mobileRelationOptions}
            required
            bindValue="value"
            bindName="label"
            value={watch("email_declaration_flag")}
            placeholder="Select Email Relation"
            onChange={(e: any) => {
              setValue("email_declaration_flag", e.value, { shouldValidate: true });
            }}
            error={errors.email_declaration_flag?.message}
          />
        </div>
      </div>

      {/* Row: Aadhaar */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput
            label="Aadhaar Number"
            placeholder="Enter 12-digit Aadhaar"
            required
            value={aadhaarNo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 12) setAadhaarNo(val);
            }}
            maxLength={12}
            disabled={aadhaarVerified}
            button={
              !aadhaarVerified ? (
                <CustomButton
                  type="button"
                  className="px-3 py-2 text-sm h-8"
                  onClick={handleCheckAadhaar}
                  loading={aadhaarCheckLoader}
                  disabled={aadhaarCheckLoader || aadhaarNo.length !== 12}
                >
                  Verify
                </CustomButton>
              ) : (
                <span className="text-green-600 text-xs font-semibold px-2">Verified</span>
              )
            }
          />
        </div>
      </div>

      {/* Row 2: Name (auto-filled from PAN/Aadhaar) */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput
            label="First Name"
            placeholder="First name"
            required
            disabled={nameDisable}
            error={errors.primary_holder_first_name?.message}
            {...register("primary_holder_first_name", { required: "First name is required" })}
          />
          <CustomInput
            label="Middle Name"
            placeholder="Middle name (optional)"
            disabled={nameDisable}
            {...register("primary_holder_middle_name")}
          />
          <CustomInput
            label="Last Name"
            placeholder="Last name (optional)"
            disabled={nameDisable}
            {...register("primary_holder_last_name")}
          />
        </div>
      </div>

      {/* Row 3: DOB (auto-filled from Aadhaar) + Address */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CustomInput
            label="DOB / Incorporation Date"
            placeholder="Select date"
            type="date"
            max={todayISO()}
            required
            error={errors.primary_holder_dob_incorporation?.message}
            {...register("primary_holder_dob_incorporation", { required: "DOB is required" })}
          />
          <CustomInput
            label="Country"
            placeholder="Country"
            required
            error={errors.country?.message}
            {...register("country", { required: "Country is required" })}
          />
          <CustomInput
            label="State"
            placeholder="State"
            required
            error={errors.state?.message}
            {...register("state", { required: "State is required" })}
          />
          <CustomInput
            label="Pincode"
            placeholder="Pincode"
            required
            error={errors.pincode?.message}
            {...register("pincode", { required: "Pincode is required" })}
          />
        </div>
      </div>

      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label="City / District"
            placeholder="City"
            required
            error={errors.city?.message}
            {...register("city", { required: "City is required" })}
          />
          <CustomInput
            label="Address Line 1"
            placeholder="Address (auto-filled from Aadhaar)"
            required
            error={errors.address_1?.message}
            {...register("address_1", { required: "Address is required" })}
          />
        </div>
      </div>

      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label="Address Line 2"
            placeholder="Address line 2 (optional)"
            {...register("address_2")}
          />
          <CustomInput
            label="Address Line 3"
            placeholder="Address line 3 (optional)"
            {...register("address_3")}
          />
        </div>
      </div>

      {/* Gender + Occupation */}
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomReactSelect
            label="Gender"
            items={genderOptions}
            required
            bindValue="value"
            bindName="label"
            value={watch("gender")}
            placeholder="Select Gender"
            onChange={(e: any) => {
              setValue("gender", e.value, { shouldValidate: true });
            }}
            error={errors.gender?.message}
          />
          <CustomReactSelect
            label="Occupation"
            items={occupationOptions}
            required
            bindValue="value"
            bindName="label"
            value={watch("occupation_code")}
            placeholder="Select Occupation"
            onChange={(e: any) => {
              setValue("occupation_code", e.value, { shouldValidate: true });
            }}
            error={errors.occupation_code?.message}
          />
        </div>
      </div>

      {/* ── Guardian Details (shown only when Minor is selected) ── */}
      {isMinorTaxStatus() && (
        <>
          <SectionTitle title="Guardian Details (Required for Minor)" />
          <div className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                label="Guardian PAN"
                placeholder="Enter Guardian PAN"
                required
                value={watch("guardian_pan")}
                onChange={handleGuardianPanChange}
                disabled={guardianPanDisabled}
                maxLength={10}
                button={
                  !guardianPanDisabled ? (
                    <CustomButton
                      type="button"
                      className="px-3 py-2 text-sm h-8"
                      onClick={handleCheckGuardianPan}
                      loading={guardianPanCheckLoader}
                      disabled={guardianPanCheckLoader || guardianPanDisabled}
                    >
                      Check
                    </CustomButton>
                  ) : (
                    <CustomButton
                      type="button"
                      className="px-3 py-2 text-sm h-8"
                      onClick={handleEditGuardianPan}
                    >
                      Edit
                    </CustomButton>
                  )
                }
              />
              <CustomInput
                label="Guardian Name"
                placeholder="Auto-filled from PAN"
                required
                disabled={guardianNameDisable}
                {...register("guardian_first_name")}
              />
              <CustomInput
                label="Guardian DOB"
                placeholder="Select date"
                type="date"
                max={todayISO()}
                required
                {...register("guardian_dob")}
              />
            </div>
          </div>
        </>
      )}

      {/* ── PAN Exempt & KYC Details (Collapsible) ── */}
      <CollapsibleSection
        title="PAN Exempt & KYC Details"
        open={showPanExemptKyc}
        onToggle={() => setShowPanExemptKyc((v) => !v)}
      >
        <Controller
          control={control}
          name="primary_holder_pan_exempt"
          rules={{ required: "Required" }}
          render={({ field: { onChange, value } }) => (
            <CustomReactSelect
              label="Primary PAN Exempt"
              required
              items={yesNoOptions}
              bindValue="value"
              bindName="label"
              value={value}
              placeholder="Select"
              onChange={(opt: any) => onChange(opt?.value)}
            />
          )}
        />
        <CustomInput
          label="Primary Exempt Category"
          placeholder="Enter category"
          {...register("primary_holder_exempt_category")}
        />
        <CustomInput
          label="CKYC Number"
          placeholder="Enter CKYC number"
          {...register("primary_holder_ckyc_number")}
        />
        <CustomInput
          label="MAPIN ID"
          placeholder="Enter MAPIN ID (optional)"
          {...register("mapin_id")}
        />
        <Controller
          control={control}
          name="aadhaar_updated"
          render={({ field: { onChange, value } }) => (
            <CustomReactSelect
              label="Aadhaar Updated"
              items={yesNoOptions}
              bindValue="value"
              bindName="label"
              value={value}
              placeholder="Select"
              onChange={(opt: any) => onChange(opt?.value)}
            />
          )}
        />
        {isMinorTaxStatus() && (
          <>
            <Controller
              control={control}
              name="guardian_pan_exempt"
              render={({ field: { onChange, value } }) => (
                <CustomReactSelect
                  label="Guardian PAN Exempt"
                  items={yesNoOptions}
                  bindValue="value"
                  bindName="label"
                  value={value}
                  placeholder="Select"
                  onChange={(opt: any) => onChange(opt?.value)}
                />
              )}
            />
            <CustomInput
              label="Guardian Exempt Category"
              placeholder="Enter category"
              {...register("guardian_exempt_category")}
            />
          </>
        )}
      </CollapsibleSection>
    </>
  );

  // ══════════════════════════════════════════
  //  STEP 1 — Holding Pattern / Personal Information
  // ══════════════════════════════════════════

  const ButtonGroup = ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
  }) => (
    <div className="col-span-full">
      <div className="text-sm text-secondary mb-2">{label}</div>
      <div className="flex flex-wrap gap-6">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer text-sm select-none"
              onClick={() => onChange(opt.value)}
            >
              <span
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  active
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                    : "bg-white border-gray-400"
                }`}
              >
                {active && <FiCheck size={14} className="text-white" />}
              </span>
              <span className="text-gray-700">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => {
    const holdingNatureValue = watch("holding_nature");
    const isJointOrSurvivor = holdingNatureValue === "JO" || holdingNatureValue === "AS";
    const taxIndiaOnly = watch("tax_india_only");

    return (
      <>
        <ButtonGroup
          label="Holding Pattern"
          value={watch("holding_nature")}
          options={[
            { value: "SI", label: "Single" },
            { value: "JO", label: "Joint" },
            { value: "AS", label: "Anyone or Survivor" },
          ]}
          onChange={(v) => setValue("holding_nature", v, { shouldValidate: true })}
        />

        <ButtonGroup
          label="Select Gender"
          value={watch("gender")}
          options={[
            { value: "M", label: "Male" },
            { value: "F", label: "Female" },
          ]}
          onChange={(v) => setValue("gender", v, { shouldValidate: true })}
        />

        <ButtonGroup
          label="Marital Status"
          value={watch("marital_status")}
          options={maritalStatusOptions}
          onChange={(v) => setValue("marital_status", v, { shouldValidate: true })}
        />

        <CustomInput
          label="Client Code"
          placeholder="Enter client code"
          required
          maxLength={10}
          error={errors.client_code?.message}
          {...register("client_code", {
            required: "Client code is required",
            maxLength: { value: 10, message: "Max 10 characters allowed" },
            pattern: {
              value: /^[A-Za-z0-9]+$/,
              message: "Only letters and numbers are allowed",
            },
          })}
        />

        {/* Row: Annual Income + Wealth Source + Address Type */}
        <CustomReactSelect
          label="Annual Income"
          items={annualIncomeOptions}
          required
          bindValue="value"
          bindName="label"
          value={watch("annual_income")}
          placeholder="Select"
          onChange={(e: any) => setValue("annual_income", e.value, { shouldValidate: true })}
          error={errors.annual_income?.message}
        />
        <CustomReactSelect
          label="Wealth Source"
          items={wealthSourceOptions}
          required
          bindValue="value"
          bindName="label"
          value={watch("wealth_source")}
          placeholder="Select"
          onChange={(e: any) => setValue("wealth_source", e.value, { shouldValidate: true })}
          error={errors.wealth_source?.message}
        />
        <CustomReactSelect
          label="Address Type"
          items={addressTypeOptions}
          required
          bindValue="value"
          bindName="label"
          value={watch("address_type")}
          placeholder="Select"
          onChange={(e: any) => setValue("address_type", e.value, { shouldValidate: true })}
          error={errors.address_type?.message}
        />

        {/* Row: Address + Pincode + Current City */}
        <CustomInput
          label="Address"
          placeholder="Enter address"
          required
          error={errors.address_1?.message}
          {...register("address_1", { required: "Address is required" })}
        />
        <CustomInput
          label="Pincode"
          placeholder="Enter pincode"
          required
          error={errors.pincode?.message}
          {...register("pincode", { required: "Pincode is required" })}
        />
        <CustomInput
          label="Current City"
          placeholder="Enter city"
          required
          error={errors.city?.message}
          {...register("city", { required: "City is required" })}
        />

        {/* Row: Current State + Current Country + City of Birth */}
        <CustomInput
          label="Current State"
          placeholder="Enter state"
          required
          error={errors.state?.message}
          {...register("state", { required: "State is required" })}
        />
        <CustomInput
          label="Current Country"
          placeholder="Enter country"
          required
          error={errors.country?.message}
          {...register("country", { required: "Country is required" })}
        />
        <CustomInput
          label="City Of Birth"
          placeholder="Enter city of birth"
          required
          error={errors.city_of_birth?.message}
          {...register("city_of_birth", { required: "City of birth is required" })}
        />

        {/* Row: Country of Birth */}
        <CustomInput
          label="Country of Birth"
          placeholder="Enter country of birth"
          required
          error={errors.country_of_birth?.message}
          {...register("country_of_birth", { required: "Country of birth is required" })}
        />

        {/* PEP Declaration */}
        <div className="col-span-full mt-2">
          <div className="text-sm text-secondary mb-2">I Declare that I am:</div>
          <div className="flex flex-wrap gap-6">
            {pepOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  className="accent-[var(--color-primary)]"
                  checked={watch("pep_status") === opt.value}
                  onChange={() => setValue("pep_status", opt.value, { shouldValidate: true })}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Tax Residency Confirmation */}
        <div className="col-span-full">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              className="accent-[var(--color-primary)]"
              checked={!!watch("tax_india_only")}
              onChange={(e) => setValue("tax_india_only", e.target.checked, { shouldValidate: true })}
            />
            I confirm that I am not a tax payer of any country other than India
          </label>
        </div>

        {/* Tax Residency block - shown only when checkbox is unchecked */}
        {!taxIndiaOnly && (
          <div className="col-span-full mt-2">
            <div className="text-sm font-semibold text-secondary mb-2">Tax Residency</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                label="Residence Country"
                placeholder="Enter residence country"
                {...register("tax_residency_country")}
              />
              <CustomReactSelect
                label="ID Document Type"
                items={idDocTypeOptions}
                bindValue="value"
                bindName="label"
                value={watch("tax_id_doc_type")}
                placeholder="Select"
                onChange={(e: any) => setValue("tax_id_doc_type", e.value)}
              />
              <CustomInput
                label="ID Number"
                placeholder="Enter ID number"
                {...register("tax_id_number")}
              />
            </div>
          </div>
        )}

        {/* ── Additional Holders (shown when Joint / Anyone or Survivor) ── */}
        {isJointOrSurvivor && (
          <div className="col-span-full mt-4">
            <div className="rounded-xl bg-white shadow-md border-l-4 border-indigo-500 overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-transparent">
                <div className="text-sm font-bold text-indigo-700 tracking-wide uppercase">Holder 2</div>
              </div>
              <div className="px-5 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomInput label="Name" placeholder="Name" {...register("second_holder_first_name")} />
                <CustomInput label="PAN" placeholder="PAN" {...register("second_holder_pan")} maxLength={10} />
                <CustomInput label="Date of Birth" placeholder="Select date" type="date" max={todayISO()} {...register("second_holder_dob")} />
                <CustomInput label="Mobile" placeholder="Mobile" {...register("second_holder_mobile")} maxLength={10} />
                <CustomReactSelect
                  label="Mobile Relation"
                  items={mobileRelationOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_mobile_relation")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_mobile_relation", e.value)}
                />
                <CustomInput label="Email ID" placeholder="Email" {...register("second_holder_email")} />
                <CustomReactSelect
                  label="Email ID Relation"
                  items={mobileRelationOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_email_relation")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_email_relation", e.value)}
                />
                <CustomReactSelect
                  label="Occupation Type"
                  items={occupationOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_occupation")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_occupation", e.value)}
                />
                <CustomReactSelect
                  label="Annual Income"
                  items={annualIncomeOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_annual_income")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_annual_income", e.value)}
                />
                <CustomReactSelect
                  label="Wealth Source"
                  items={wealthSourceOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_wealth_source")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_wealth_source", e.value)}
                />
                <CustomReactSelect
                  label="Address Type"
                  items={addressTypeOptions}
                  bindValue="value"
                  bindName="label"
                  value={watch("second_holder_address_type")}
                  placeholder="Select"
                  onChange={(e: any) => setValue("second_holder_address_type", e.value)}
                />
                <CustomInput label="City Of Birth" placeholder="City Of Birth" {...register("second_holder_city_of_birth")} />
                <CustomInput label="Country of Birth" placeholder="Country of Birth" {...register("second_holder_country_of_birth")} />
              </div>

              </div>
            </div>

            {!showThirdHolder && (
              <button
                type="button"
                onClick={() => setShowThirdHolder(true)}
                className="text-sm text-[var(--color-primary)] mt-3"
              >
                + Add more holder
              </button>
            )}

            {showThirdHolder && (
              <div className="rounded-xl bg-white shadow-md border-l-4 border-indigo-500 overflow-hidden mt-4">
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-50 to-transparent">
                  <div className="text-sm font-bold text-indigo-700 tracking-wide uppercase">Holder 3</div>
                  <button
                    type="button"
                    onClick={() => setShowThirdHolder(false)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <div className="px-5 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomInput label="Name" placeholder="Name" {...register("third_holder_first_name")} />
                  <CustomInput label="PAN" placeholder="PAN" {...register("third_holder_pan")} maxLength={10} />
                  <CustomInput label="Date of Birth" placeholder="Select date" type="date" max={todayISO()} {...register("third_holder_dob")} />
                  <CustomInput label="Mobile" placeholder="Mobile" {...register("third_holder_mobile")} maxLength={10} />
                  <CustomReactSelect
                    label="Mobile Relation"
                    items={mobileRelationOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_mobile_relation")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_mobile_relation", e.value)}
                  />
                  <CustomInput label="Email ID" placeholder="Email" {...register("third_holder_email")} />
                  <CustomReactSelect
                    label="Email ID Relation"
                    items={mobileRelationOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_email_relation")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_email_relation", e.value)}
                  />
                  <CustomReactSelect
                    label="Occupation Type"
                    items={occupationOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_occupation")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_occupation", e.value)}
                  />
                  <CustomReactSelect
                    label="Annual Income"
                    items={annualIncomeOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_annual_income")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_annual_income", e.value)}
                  />
                  <CustomReactSelect
                    label="Wealth Source"
                    items={wealthSourceOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_wealth_source")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_wealth_source", e.value)}
                  />
                  <CustomReactSelect
                    label="Address Type"
                    items={addressTypeOptions}
                    bindValue="value"
                    bindName="label"
                    value={watch("third_holder_address_type")}
                    placeholder="Select"
                    onChange={(e: any) => setValue("third_holder_address_type", e.value)}
                  />
                  <CustomInput label="City Of Birth" placeholder="City Of Birth" {...register("third_holder_city_of_birth")} />
                  <CustomInput label="Country of Birth" placeholder="Country of Birth" {...register("third_holder_country_of_birth")} />
                </div>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // ══════════════════════════════════════════
  //  STEP 2 — Nominee Details
  // ══════════════════════════════════════════

  const renderNomineeCard = (idx: 1 | 2 | 3) => {
    const name = (k: string) => `nominee_${idx}_${k}` as any;
    const isMinor = !!watch(name("minor_flag"));
    const sameAddress = !!watch(name("same_address"));
    const onSameAddrChange = (checked: boolean) => {
      setValue(name("same_address"), checked);
      if (checked) {
        setValue(name("address1"), watch("address_1") || "");
        setValue(name("address2"), watch("address_2") || "");
        setValue(name("address3"), watch("address_3") || "");
        setValue(name("pin"), watch("pincode") || "");
        setValue(name("city"), watch("city") || "");
        setValue(name("country"), watch("country") || "");
      }
    };
    return (
      <div key={idx} className="col-span-full mt-3">
        <div className="rounded-xl bg-white shadow-md border-l-4 border-emerald-500 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-50 to-transparent">
            <div className="text-sm font-bold text-emerald-700 tracking-wide uppercase">Nominee {idx}</div>
            {idx > 1 && (
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => setNomineeCount((c) => Math.max(1, c - 1))}
              >
                Remove
              </button>
            )}
          </div>

          <div className="px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomInput label="Name" placeholder="Name" {...register(name("name"))} />
            <CustomInput label="Date of Birth" placeholder="Select date" type="date" max={todayISO()} {...register(name("dob"))} />
            <CustomInput
              label="Share Percentage"
              placeholder="Share Percentage"
              type="number"
              {...register(name("share"))}
            />
            <CustomReactSelect
              label="Relationship"
              items={nomineeRelationshipOptions}
              bindValue="value"
              bindName="label"
              value={watch(name("relationship"))}
              placeholder="Select"
              onChange={(e: any) => setValue(name("relationship"), e.value)}
            />
            <CustomInput label="Email" placeholder="Email" type="email" {...register(name("email"))} />
            <Controller
              control={control}
              name={name("mobile")}
              render={({ field }) => (
                <CustomInput
                  label="Mobile Number"
                  placeholder="Mobile Number"
                  maxLength={10}
                  value={field.value || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    field.onChange(v);
                  }}
                />
              )}
            />
            <CustomReactSelect
              label="ID Proof"
              items={nomineeIdProofOptions}
              bindValue="value"
              bindName="label"
              value={watch(name("identity_type"))}
              placeholder="Select"
              required
              onChange={(e: any) => {
                setValue(name("identity_type"), e.value, { shouldValidate: true });
                // Reset id number when type changes so old value doesn't fail validation
                setValue(name("identity_number"), "", { shouldValidate: true });
              }}
              error={(errors as any)?.[`nominee_${idx}_identity_type`]?.message}
            />
            <Controller
              control={control}
              name={name("identity_number")}
              rules={{
                validate: (val) => {
                  const nomineeName = watch(name("name"));
                  const idType = watch(name("identity_type"));
                  // Only validate if a nominee name has been entered
                  if (!nomineeName || !String(nomineeName).trim()) return true;
                  if (!idType) return "Select ID Proof first";
                  return validateNomineeIdNumber(String(idType), String(val || ""));
                },
              }}
              render={({ field, fieldState }) => {
                const idType = watch(name("identity_type"));
                const placeholder =
                  idType === "1" ? "PAN (e.g., ABCDE1234F)" :
                  idType === "2" ? "Last 4 digits of Aadhaar" :
                  idType === "3" ? "Driving Licence Number" :
                  idType === "4" ? "Passport / OCI Number" :
                  "Select ID Proof first";
                const maxLen = idType === "1" ? 10 : idType === "2" ? 4 : 20;
                return (
                  <CustomInput
                    label="ID Number"
                    placeholder={placeholder}
                    required
                    maxLength={maxLen}
                    value={field.value || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      let v = e.target.value;
                      if (idType === "2") v = v.replace(/\D/g, "").slice(0, 4);
                      else if (idType === "1") v = v.toUpperCase().slice(0, 10);
                      else v = v.toUpperCase().slice(0, 20);
                      field.onChange(v);
                    }}
                    error={fieldState.error?.message}
                  />
                );
              }}
            />
          </div>

          <div className="mt-3 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="accent-[var(--color-primary)]"
                checked={isMinor}
                onChange={(e) => setValue(name("minor_flag"), e.target.checked)}
              />
              Nominee is a minor
            </label>
          </div>

          {!isMinor && (
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="accent-[var(--color-primary)]"
                  checked={sameAddress}
                  onChange={(e) => onSameAddrChange(e.target.checked)}
                />
                Same address as primary holder
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <CustomInput
              label="Address Line 1"
              placeholder="Address Line 1"
              disabled={!isMinor && sameAddress}
              {...register(name("address1"))}
            />
            <CustomInput
              label="Address Line 2"
              placeholder="Address Line 2"
              disabled={!isMinor && sameAddress}
              {...register(name("address2"))}
            />
            <CustomInput
              label="Address Line 3"
              placeholder="Address Line 3"
              disabled={!isMinor && sameAddress}
              {...register(name("address3"))}
            />
            <CustomInput
              label="Pincode"
              placeholder="Pincode"
              disabled={!isMinor && sameAddress}
              {...register(name("pin"))}
            />
            <CustomInput
              label="City"
              placeholder="City"
              disabled={!isMinor && sameAddress}
              {...register(name("city"))}
            />
            <CustomInput
              label="Country"
              placeholder="Country"
              disabled={!isMinor && sameAddress}
              {...register(name("country"))}
            />
            {isMinor && (
              <>
                <CustomInput label="Guardian Name" placeholder="Guardian Name" {...register(name("guardian"))} />
                <CustomInput label="Guardian PAN" placeholder="Guardian PAN" maxLength={10} {...register(name("guardian_pan"))} />
              </>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const doNotNominate = !!watch("do_not_wish_to_nominate");
    return (
      <>
        <div className="col-span-full flex items-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              className="accent-[var(--color-primary)]"
              checked={doNotNominate}
              onChange={(e) => {
                setValue("do_not_wish_to_nominate", e.target.checked);
                setValue("nomination_opt", e.target.checked ? "N" : "Y");
              }}
            />
            I do not wish to nominate
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              className="accent-[var(--color-primary)]"
              checked={!!watch("show_nominee_in_soa")}
              onChange={(e) => {
                setValue("show_nominee_in_soa", e.target.checked);
                setValue("nominee_soa", e.target.checked ? "Y" : "N");
              }}
            />
            Show Nominee in SOA
          </label>
        </div>

        {!doNotNominate && (
          <>
            {Array.from({ length: nomineeCount }, (_, i) => renderNomineeCard((i + 1) as 1 | 2 | 3))}

            {nomineeCount < 3 && (
              <div className="col-span-full">
                <button
                  type="button"
                  onClick={() => setNomineeCount((c) => Math.min(3, c + 1))}
                  className="text-sm text-[var(--color-primary)] mt-3"
                >
                  + Add more nominee
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  // ══════════════════════════════════════════
  //  STEP 3 — Bank Details
  // ══════════════════════════════════════════

  const renderBankCard = (idx: 1 | 2) => {
    const k = (s: string) => `${s}_${idx}` as any;
    const verified = idx === 1 ? bankVerified1 : bankVerified2;
    const verifyLoader = idx === 1 ? bankVerifyLoader1 : bankVerifyLoader2;
    const setVerified = idx === 1 ? setBankVerified1 : setBankVerified2;
    return (
      <div key={idx} className="col-span-full mt-3">
        <div className="rounded-xl bg-white shadow-md border-l-4 border-[var(--color-primary)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent">
            <div className="text-sm font-bold text-[var(--color-primary)] tracking-wide uppercase">Bank {idx}</div>
            {idx === 2 && (
              <button
                type="button"
                className="text-xs text-[var(--color-primary)]"
                onClick={() => {
                  setBankCount(1);
                  if (defaultBankIdx === 2) setDefaultBankIdx(1);
                }}
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-5 py-5">
            <CustomInput
              label="Account Number"
              placeholder="Account Number"
              {...register(k("account_no"))}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(k("account_no"), e.target.value, { shouldValidate: true });
                if (verified) setVerified(false);
              }}
            />
            <CustomInput
              label="IFSC Code"
              placeholder="IFSC Code"
              maxLength={11}
              {...register(k("ifsc_code"))}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(k("ifsc_code"), e.target.value.toUpperCase(), { shouldValidate: true });
                if (verified) setVerified(false);
              }}
              button={
                !verified ? (
                  <CustomButton
                    type="button"
                    className="px-3 py-2 text-sm h-8"
                    onClick={() => handleVerifyBank(idx)}
                    loading={verifyLoader}
                    disabled={verifyLoader}
                  >
                    Verify
                  </CustomButton>
                ) : (
                  <span className="text-green-600 text-xs font-semibold px-2">Verified</span>
                )
              }
            />
            <CustomReactSelect
              label="Account Type"
              items={accountTypeOptions}
              bindValue="value"
              bindName="label"
              value={watch(k("account_type"))}
              placeholder="Select"
              onChange={(opt: any) => setValue(k("account_type"), opt?.value, { shouldValidate: true })}
              error={(errors as any)[k("account_type")]?.message}
            />
            <CustomInput label="Bank Name" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("bank_name"))} />
            <CustomInput label="MICR Code (Optional)" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("micr_no"))} />
            <CustomInput label="Branch Name" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("branch_name"))} />
            <CustomInput label="Bank Address" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("bank_address"))} />
            <CustomInput label="City" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("bank_city"))} />
            <CustomInput label="Pincode" placeholder="Auto-filled on verify" disabled={!verified} {...register(k("bank_pincode"))} />
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <>
        {Array.from({ length: bankCount }, (_, i) => renderBankCard((i + 1) as 1 | 2))}

        {bankCount < 2 && (
          <div className="col-span-full">
            <button
              type="button"
              onClick={() => setBankCount(2)}
              className="text-sm text-[var(--color-primary)] mt-2"
            >
              + Add more bank
            </button>
          </div>
        )}

        <div className="col-span-full mt-4">
          <div className="text-sm text-secondary mb-2">Set Default :</div>
          <div className="flex items-center gap-6">
            {Array.from({ length: bankCount }, (_, i) => {
              const idx = i + 1;
              return (
                <label key={idx} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="accent-[var(--color-primary)]"
                    checked={defaultBankIdx === idx}
                    onChange={() => {
                      setDefaultBankIdx(idx);
                      setValue("default_bank_flag_1", idx === 1 ? "Y" : "N");
                      setValue("default_bank_flag_2", idx === 2 ? "Y" : "N");
                    }}
                  />
                  Bank {idx}
                </label>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="nse-module p-4">
      {/* ── Stepper ── */}
      <div className="flex items-center justify-center mb-6 gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (i < currentStep) setCurrentStep(i);
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i < currentStep
                    ? "bg-green-500 border-green-500 text-white"
                    : i === currentStep
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {i < currentStep ? <FiCheck size={18} /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  i === currentStep
                    ? "text-[var(--color-primary)] font-semibold"
                    : i < currentStep
                    ? "text-green-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-20 md:w-32 h-0.5 mx-2 mt-[-16px] ${
                  i < currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {stepRenderers[currentStep]()}
            </div>
          </div>
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            className={`btn btn-outline btn-secondary btn-sm rounded-lg ${
              currentStep === 0 ? "invisible" : ""
            }`}
            onClick={handleBack}
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              className="btn btn-primary text-white btn-sm rounded-lg px-8"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <CustomButton type="submit" loading={loading} className="btn-sm px-8">
              Submit
            </CustomButton>
          )}
        </div>
      </form>

      {/* ── Aadhaar OTP Modal ── */}
      <dialog className="modal" ref={modalRef} onClick={() => modalRef.current?.close()}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onhandleOtpSubmit();
            }}
          >
            <div className="text-center mb-4 font-semibold">Enter Aadhaar OTP</div>
            <div className="my-5 flex justify-center">
              <OTPInput
                value={aadhaarOTP || ""}
                onChange={(otp: string) => setAadhaarOTP(otp)}
                numInputs={6}
                renderSeparator={<span className="otpInputGap" />}
                renderInput={(props) => <input {...props} className="otpInput" />}
                inputType="text"
                shouldAutoFocus
              />
            </div>

            <CustomButton className="mt-6 w-full bg-primary" type="submit" loading={otpVerifyLoader}>
              Submit
            </CustomButton>

            <div className="text-other text-center mt-4 cursor-pointer" onClick={reSendOtp}>
              Resend OTP
            </div>
          </form>
        </div>
      </dialog>

      {/* ── PAN Alert Modal ── */}
      {showPanAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPanAlert(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid PAN</h3>
              <p className="text-gray-600 mb-4">{panAlertMessage}</p>
              <button onClick={() => setShowPanAlert(false)} className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UCC Result Modal (Success / Failure) ── */}
      {uccResultModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => setUccResultModal((p) => ({ ...p, open: false }))}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full mx-4 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ${
                  uccResultModal.success
                    ? "bg-green-100 ring-green-50"
                    : "bg-red-100 ring-red-50"
                }`}
              >
                {uccResultModal.success ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h3 className={`text-xl font-bold mb-3 ${uccResultModal.success ? "text-green-700" : "text-red-700"}`}>
                {uccResultModal.title}
              </h3>

              {/* Highlighted NSE response message */}
              <div
                className={`rounded-lg border-l-4 px-4 py-3 mb-4 text-left ${
                  uccResultModal.success
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  NSE Response
                </div>
                <p
                  className={`text-sm font-medium whitespace-pre-wrap break-words ${
                    uccResultModal.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {uccResultModal.message}
                </p>
              </div>

              {uccResultModal.success && uccResultModal.clientCode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg py-3 px-4 mb-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-green-700">Client Code</div>
                  <div className="text-2xl font-extrabold text-green-800 mt-1 tracking-wide">
                    {uccResultModal.clientCode}
                  </div>
                </div>
              )}

              <button
                onClick={() => setUccResultModal((p) => ({ ...p, open: false }))}
                className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors ${
                  uccResultModal.success ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateUCC;
