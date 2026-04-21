"use client";

import { use, useEffect, useRef, useState, useContext, useMemo } from "react";
import { ArrowLeft, Pencil, ChevronDown, Plus, List, CheckCircleIcon, X } from "lucide-react";
import CustomSelect from "@/commonUI/Select";
import { viewCanDetails, generateReference, ApiFinTechNormalTxnService, searchByAmcId, searchByISIN, searchByCanIdmfuBankDetails, ApiFinTechSystematicTxnService, submitMfuTransaction, fetchClientIp, getMandates, getInvestorPortfolio, getBankByFolio, getSchemeByName } from "@/api/transaction";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { numberToWords } from "@/utils/helpers"
import { toast } from "react-toastify";
import { months, orderTypes, dividendFrequency, payMode, dividendOptions, arrTransactionType, freqMap, transactionTypeList, TAX_STATUS, accountTypeList } from "@/utils/constants";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import { generateTransactionByType } from "@/utils/mfu/generateTransaction";
import {
    NODE_API_URL,
    USER_DATA,
    publicPathName,
    toFixedData,
} from "@/utils/constants";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { getBankAccount } from "@/api/holder";
import { executeMfuTransaction, TransactionData, TransactionPayload } from "@/services/mfuTransactionService";
import Loader from "@/commonUI/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFundStore } from "@/store/useFundStore";

import DatePicker from "react-datepicker";

import { generateUniqueId } from "@/utils/mfu/generateUtrn";
import { getPayOutSec, getPaySec, getSchList, getSubSeqSec, getSysSchList } from "./transaction";

//const bankList: any = [];
interface InvestorPopupProps {
    modalId?: string;
    showTriggerButton?: boolean;
    schemeData?: any;
    sipData?: any;
    investor?: any;
    investorList?: any[]
    source?: any;
    open: boolean;
    onClose: () => void;
}
const optMap: Record<string, string> = {
    A: "Any Date",
    S: "Specific Date",
};
const sipDuration = [
    { label: "Please Select", value: "0" },
    { label: "Enter Date", value: "1" },
    { label: "Max Record", value: "2" },
    { label: "Enter Installment", value: "3" }


]

const OrderPopup: React.FC<InvestorPopupProps> = ({
    modalId = "OrderModel",
    investor,
    source,
    open,
    onClose,
}) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();
    const { schemeData, investorList, clearData } = useFundStore();

    const [sipData, setSipData] = useState<any[]>([]);
    const [transactionType, setTransactionType] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [isDividend, setIsDividend] = useState(false);


    const [selectedCan, setSelectedCan] = useState<any>(investorList[0]?.InvestorAccountHolding[0]?.CAN_Id);
    const [selectedHolder, setSelectedHolder] = useState<any>(investorList[0]?.name);
    // Two folio shapes are needed:
    //   • `selectedFolio`    — base digits only (e.g. "41007859"); this is
    //                           what MFU's order payload must carry.
    //   • `selectedFolioRaw` — the full display form including the advisor
    //                           slash suffix (e.g. "41007859/68"); this is
    //                           what our `search_by_folio` DB lookup keys on.
    const [selectedFolio, setSelectedFolio] = useState<any>(
        (() => {
            const raw = schemeData?.out_folio_no ?? null;
            if (raw === null || raw === undefined) return null;
            const v = String(raw).trim();
            if (!v) return null;
            return v.split("/")[0].trim() || null;
        })()
    );
    const [selectedFolioRaw, setSelectedFolioRaw] = useState<any>(
        schemeData?.out_folio_no ?? null
    );
    const [showCanList, setShowCanList] = useState(false);
    const [showFolioDropdown, setShowFolioDropdown] = useState(false);
    const [folioSelectionMode, setFolioSelectionMode] = useState<'existing' | 'new'>('existing');
    const [newFolioNumber, setNewFolioNumber] = useState('');

    const [data, setData] = useState<any[]>([]);
    const [frequencies, setFrequencies] = useState<any[]>([]);
    const [selectedFreq, setSelectedFreq] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [availableDates, setAvailableDates] = useState<{ label: string; value: string }[]>([]);
    const [rtaAmcCode, setRtaAmcCode] = useState("");
    const [rtaSchCode, setRtaSchCode] = useState("");
    const [outRtaSchCode, setOutRtaSchCode] = useState("");

    //added on on 12-Dec-2025
    const availableUnits = schemeData?.out_sum_units || 0;
    const availableAmount = schemeData?.out_sum_amount || 0;
    const [redType, setRedType] = useState("");



    const [minAmount, setMinAmount] = useState("");
    const [divOpt, setDivOpt] = useState("")
    const [sipDate, setSipDate] = useState("")
    const [sipMonth, setSipMonth] = useState("")
    const [sipYear, setSipYear] = useState("")
    const [endMonth, setEndMonth] = useState("")
    const [endYear, setEndYear] = useState("")
    const [selectedDuration, setSelectedDuration] = useState("")
    const [sipEndtDate, setSipEndDate] = useState("")

    const [sipInstallment, setSipInstallment] = useState("")
    const [amount, setAmount] = useState("");
    const [investorData, setInvestorData] = useState<any[]>([]);
    const [targetScheme, setTargetScheme] = useState<any[]>([])
    const [finalScheme, setFinalScheme] = useState<any[]>([])
    const [selectedSchemeType, setSelectedSchemeType] = useState("Growth")
    const [selectedScheme, setSelectedScheme] = useState("")
    const [selectedTargetScheme, setSelectedTargetScheme] = useState("")

    const [isTransact, setIsTransact] = useState(false);
    const [paymentMode, setPaymentMode] = useState('')
    const [accNo, setAccNo] = useState('')
    const [accType, setAccType] = useState('')
    const [ifsc, setIfsc] = useState('')
    const [micr, setMicr] = useState('')
    const [mandateRefNo, setMandateRefNo] = useState('')
    const [bankList, setBankList] = useState<any[]>([])
    const [selectedAccount, setSelectedAccount] = useState(
        bankList?.[0]?.account_no || ""
    );

    /* useEffect(() => {
         if (mandateList?.length > 0) {
             const first = bankList[0];
             setSelectedAccount(first.account_no);
             setAccType(first.account_type);
             setAccNo(first.account_no);
             setIfsc(first.ifsc);
             setMicr(first.micr);
         }
     }, [bankList]);*/
    const [placeHolder, setPlaceHolder] = useState('Amount');
    const [orderOptions, setOrderOptions] = useState<any[]>([])
    const [txnVolType, setTxnVolType] = useState("")
    const [vol, setVol] = useState("");
    const [isCartAdded, setIsCartAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [commonError, setCommonError] = useState("")
    const [mandateList, setMandateList] = useState<any[]>([]);
    const [selectedMandate, setSelectedMandate] = useState<any>({})
    const [transactionError, setTransactionError] = useState("")
    const [allowedSipDays, setAllowedSipDays] = useState<number[]>();
    const [errors, setErrors] = useState({
        date: "",
        month: "",
        year: "",
        amount: ""
    });
    const [investorPortfolio, setInvestorPortfolio] = useState<any[]>([]);
    const [beneVan, setBeneVan] = useState("")
    const [exeptions, setExceptions] = useState({
        value: false,
        message: ""
    })

    // Array shape matches how the rest of the file reads it (`bankByFolio[0]`).
    // Starting as `{}` meant the first render threw `Cannot read properties of
    // undefined (reading 'micr')` when Redeem/Switch/SWP/STP tried to submit
    // before the fetch resolved.
    const [bankByFolio, setBankByFolio] = useState<any[]>([])
    // Fallback bank for Redeem / SWP when the `search_by_folio` lookup comes
    // back empty (common for newer folios that aren't mapped yet in the DB).
    // We load the investor's primary bank once on mount so the payout leg
    // always has usable MICR / IFSC / account details.
    const [investorBanks, setInvestorBanks] = useState<any[]>([])



    const currentYear = new Date().getFullYear();
    const years = [
        { label: "Select", value: "" }, // 👈 default option
        ...Array.from({ length: 10 }, (_, i) => {
            const year = currentYear + i;
            return { label: year.toString(), value: year.toString() };
        }),
    ];

    const { setCartCounter, cartCounter } = useContext<any>(AccountContext);



    useEffect(() => {

        const fetchByISIN = async (targetScheme: any) => {
            const response = await searchByISIN(targetScheme);
            setSipData(response?.data?.data?.data || []);
        }
        const fetchBankByFolio = async (folio: string) => {
            if (!folio) return;
            // The DB function `search_by_folio` may be keyed on the full
            // advisor-suffixed folio ("41007859/68") OR on the base digits
            // ("41007859") depending on the AMC. Try both and take whichever
            // returns rows so Redeem / Switch / SWP / STP always have a bank.
            const attempts = Array.from(
                new Set([String(folio).trim(), String(folio).split("/")[0].trim()])
            ).filter(Boolean);
            for (const attempt of attempts) {
                try {
                    const response = await getBankByFolio(attempt);
                    const rows = response?.data?.data?.data;
                    const arr = Array.isArray(rows) ? rows : rows ? [rows] : [];
                    if (arr.length > 0) {
                        console.log("Bank details fetched by folio:", attempt, arr);
                        setBankByFolio(arr);
                        return;
                    }
                } catch (e) {
                    console.warn("getBankByFolio attempt failed for", attempt, e);
                }
            }
            console.warn("getBankByFolio returned empty for all forms of", folio);
            setBankByFolio([]);
        }

        fetchByISIN(schemeData?.schemeISIN);
        fetchBankByFolio(schemeData?.out_folio_no);

        console.log(schemeData)




        const fetchSchemeByName = async (schemeName: any) => {
            const response = await getSchemeByName(schemeName);
            console.log("Scheme By Name Response :- ", response)
            setFinalScheme(response?.data?.data?.data || []);

        }
        fetchSchemeByName(schemeData?.name)



    }, [])
    useEffect(() => {

        const fetch = async (targetScheme: any) => {
            const response = await getInvestorPortfolio(targetScheme);
            setInvestorPortfolio(response?.data?.data?.data || []);
        }
        fetch(investorList[0]?.id);

        // Pre-load the investor's own bank accounts so Redeem / SWP have a
        // fallback payout bank when `search_by_folio` returns empty (the
        // "Bank details for this folio are not available yet" case).
        const loadInvestorBanks = async () => {
            try {
                const id = investorList[0]?.id;
                if (!id) return;
                const resp = await getBankAccount(id);
                const rows = resp?.data?.data?.data ?? [];
                setInvestorBanks(Array.isArray(rows) ? rows : []);
            } catch (e) {
                console.warn("loadInvestorBanks failed:", e);
            }
        };
        loadInvestorBanks();

        const filteredOptions = orderTypes.filter(
            opt => !["STP", "SWP", "Switch", "Redeem"].includes(opt.label)
        );
        setOrderOptions(orderTypes)

    }, []);

    useEffect(() => {
        if (open) modalRef.current?.showModal();
        else modalRef.current?.close();
    }, [open]);

    useEffect(() => {
        // console.log("Investor List in Order Popup:", investorList);
        if (investorList.length === 0) {
            router.push('/portfolio');
        }
    }, [])

    // Re-fetch the bank mapped to the folio whenever the user changes folio
    // (switching between folios inside the dropdown), so Redeem / Switch /
    // SWP / STP build their payOutDtl against the correct bank account.
    // Tries the raw "41007859/68" form first, falls back to base digits.
    useEffect(() => {
        const source = selectedFolioRaw || selectedFolio;
        if (!source) return;
        (async () => {
            const attempts = Array.from(
                new Set([String(source).trim(), String(source).split("/")[0].trim()])
            ).filter(Boolean);
            for (const attempt of attempts) {
                try {
                    const response = await getBankByFolio(attempt);
                    const rows = response?.data?.data?.data;
                    const arr = Array.isArray(rows) ? rows : rows ? [rows] : [];
                    if (arr.length > 0) {
                        setBankByFolio(arr);
                        return;
                    }
                } catch (e) {
                    console.warn("Refresh bankByFolio attempt failed for", attempt, e);
                }
            }
            setBankByFolio([]);
        })();
    }, [selectedFolio, selectedFolioRaw]);
    const addToCart = async () => {

        try {
            const newErrors = {
                date: transactionType === "S" ? (sipDate ? "" : "Required") : "",
                month: transactionType === "S" ? (sipMonth ? "" : "Required") : "",
                year: transactionType === "S" ? (sipYear ? "" : "Required") : "",
                amount: amount ? "" : "Required",
            };
            setErrors(newErrors);
            const hasError = Object.values(newErrors).some((msg) => msg !== "");
            if (!hasError) {

                const userData: any = getLS(USER_DATA);

                let CartObj = {
                    user_id: Number(userData?.id),
                    investor_id: Number(userData?.InvestorRegistration?.id),
                    //investor_id: selectedCan?.value ? selectedCan?.value : investor?.can_id,
                    account_holding_id: 0,
                    cart_type: 1,
                    scheme_id: schemeData?.id,
                    trans_type: transactionTypeList.find(opt => opt.name === transactionType)?.id,
                    trans_amount: amount,
                    frequency: selectedFrequency,
                    day: sipDate,
                    start_month: sipMonth,
                    start_year: sipYear,
                    end_month: "10",
                    end_year: "2026",
                    rta_amc_code: rtaAmcCode,
                    rta_sch_code: rtaSchCode,
                    out_rta_sch_code: outRtaSchCode,
                    tx_vol_type: txnVolType,
                    vol: vol,
                };
                setIsCartAdded(true);

                let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
                if (addCartData.data.data) {
                    toastAlert("success", "Added To Cart");
                    setCartCounter(cartCounter + 1);
                } else {
                    toastAlert("info", "Unable to add in cart, please try again later!");
                }
            }
        } catch (error) {
            handleServerError(error);
        }
    };

    const handleRadio = (e: any) => {
        const value = e?.target?.value;
        setRedType(value);
        if (transactionType === 'R' || transactionType === 'O') {
            setPlaceHolder("Enter " + value)
            // setIsSelected(true);
            if (value === "Amount" || value === "Unit") {
                setPlaceHolder("Enter " + value)
                setIsSelected(true);
                setAmount("")
            } else {
                setIsSelected(true);
            }

            if (value === "All Units") {
                setAmount(availableUnits?.toString() || "")
                setPlaceHolder("Enter " + value)
                setIsSelected(true);

            }

        } else {
            setIsSelected(true);
            setIsDividend(value.includes("Dividend"));
        }
    };

    // MFU accepts only the base folio number (digits before the `/XX`
    // advisor/check-digit suffix). Sending "41007859/68" directly returns
    // `secErrorCode 100427: Invalid folio`, so strip everything at the first
    // slash before the value leaves this component.
    const normalizeFolio = (raw: any): string | null => {
        if (raw === null || raw === undefined) return null;
        const v = String(raw).trim();
        if (!v) return null;
        return v.split("/")[0].trim() || null;
    };

    const handleFolioSelection = (folio: any) => {
        setAccType(folio?.ac_type)
        setAccNo(folio?.ac_no)
        setIfsc(folio?.ifsc)
        setMicr(folio?.micr)
        setSelectedFolio(normalizeFolio(folio.folio_number));
        setSelectedFolioRaw(folio.folio_number ?? null);
        setShowFolioDropdown(false);
        setFolioSelectionMode('existing');
    };

    const handleFolio = async (folioType: any) => {
        if (folioType === "New") {
            setFolioSelectionMode('new');
            setShowFolioDropdown(false);
            setSelectedFolio(null);

        } else {

            setFolioSelectionMode('existing');

        }
    };

    const getCurrentFolioDisplay = () => {

        if (folioSelectionMode === 'new') {
            return newFolioNumber || 'Enter new folio number';
        }
        return selectedFolio || "EW";

    };

    const handleTransactionType = async (e: any) => {
        setIsSelected(true)
        if (commonError.length > 0) {
            setIsSelected(false)
        }
        const selectedValue = e?.target?.value;

        // Filter data based on selected value
        const txnData = sipData.filter((item: any) => item.txn_type === selectedValue);

        const firstTxn = txnData[0] || {};



        await getMandatelist()

        console.log("Filtered Transaction Data:", firstTxn.scheme_code);

        // Update dependent state values
        setRtaAmcCode(firstTxn.fund_code || '');
        setRtaSchCode(firstTxn.scheme_code || '');
        setDivOpt(firstTxn.div_opt || '');
        setMinAmount(firstTxn.min_amt || '');
        setData(txnData);
        setTransactionType(selectedValue);
        setCommonError("")
        setOutRtaSchCode("")
        // Frequency list based on SIP,STP and SWP
        if (selectedValue === 'Y' || selectedValue === 'V' || selectedValue === 'J') {

            const freqList = txnData
                .filter(
                    (item: any) =>
                        item.txn_type === selectedValue && item.sys_freq
                )
                .map((item: any) => ({
                    freq: item.sys_freq,
                    freqOpt: item.sys_freq_opt,
                }))
                // remove duplicates based on combination of freq + freqOpt
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (v) => v.freq === value.freq && v.freqOpt === value.freqOpt
                        )
                )
                .map((item) => ({
                    label: `${freqMap[item.freq] || item.freq} (${optMap[item.freqOpt] || item.freqOpt || "N/A"})`,
                    value: item.freq,
                    freqOpt: item.freqOpt,
                }));

            setFrequencies(freqList);


        }

        console.log("Transaction data filtered by type:", selectedValue);

        // Handle STP case
        if (selectedValue === "Y" || selectedValue === "O" || selectedValue === "J") {
            try {
                const response = await searchByAmcId(schemeData?.amc_id);

                const schemes = response?.data?.data?.data || [];
                console.log("Schemes fetched for AMC ID:", schemes);
                const filteredSchemes = schemes
                    .filter((scheme: any) => {
                        switch (selectedValue) {
                            case "O": // Switch Out
                                return scheme.switch_in_allowed?.toUpperCase() === "Y";

                            case "Y": // STP Out
                                return scheme.stp_in_allowed?.toUpperCase() === "Y";

                            case "J": // SWP
                                return scheme.swp_allowed?.toUpperCase() === "Y";

                            default:
                                return false;
                        }
                    });

                // setTargetScheme(filteredSchemes);
                // console.log("Filtered Schemes:", filteredSchemes);

                setTargetScheme(schemes);


                /*const response = await searchByAmcId(schemeData?.amc_id);
                const records = response?.data?.data?.data || [];
                const filteredSchemes = records
                    // Exclude same scheme
                    .filter((scheme: any) => scheme.pri_isin !== schemeData?.pri_isin)
                    .filter((scheme: any) => {
                        switch (selectedValue) {
                            case "O": // Switch
                                return scheme.switch_in_allowed === "Y";

                            case "Y": // STP
                                return scheme.stp_in_allowed === "Y";

                            case "W": // SWP (no target needed usually)
                                return scheme.swp_allowed === "Y";

                            default:
                                return false;
                        }
                    });

                setTargetScheme(filteredSchemes);*/
                //setTargetScheme(records);

            } catch (error) {
                console.log('Error fetching STP data:', error);
            }
        } else {
            setTargetScheme([]); // Reset if not STP
        }
    };

    const getMandatelist = async () => {

        const response = await getMandates(investorList[0]?.id);

        //setErrors()
        if (response.data?.data?.data.length <= 0) {
            setCommonError("Create mandate for SIP")
        } else {
            const mandateList = response.data?.data?.data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");

            setMandateList(mandateList)
        }
    }

    const handleTransact = async () => {
        setIsLoading(true)
        // Clear any stale error banners from a previous submit attempt so the
        // user doesn't see "Please select Payment Method?" after having picked
        // one, or last MFU rejection lingering on a fresh try.
        setExceptions({ value: false, message: "" })
        setTransactionError("")
        if (redType === "All Units") {
            setAmount(availableUnits?.toString() || "")
        }
        console.log("Transaction Type: ", amount, redType)
        const newErrors = {
            date: "",
            month: "",
            year: "",
            amount: amount ? "" : "Required",
        };
        setErrors(newErrors);
        const hasError = Object.values(newErrors).some((msg) => msg !== "");
        if (paymentMode.length == 0 && (transactionType === 'B' || transactionType === 'V')) {
            setExceptions({ value: true, message: 'Please select Payment Method?' })
            setIsLoading(false)
            return
        }

        // Only Redeem (R) and SWP (J) actually have a bank leg — they credit
        // proceeds to the investor's account. Switch (O) and STP (Y) are
        // scheme-to-scheme and need no bank at all, so blocking them on
        // `search_by_folio` (which is often empty for new folios) left those
        // tabs unusable. For R/J we prefer the folio-mapped bank and fall
        // back to the investor's primary bank on file.
        const folioBankPrimary: any =
            Array.isArray(bankByFolio) && bankByFolio.length > 0 ? bankByFolio[0] : null;
        const investorBankPrimary: any =
            Array.isArray(investorBanks) && investorBanks.length > 0 ? investorBanks[0] : null;
        const folioBank: any = folioBankPrimary ?? investorBankPrimary;

        const needsPayoutBank = transactionType === "R" || transactionType === "J";
        if (needsPayoutBank && !folioBank) {
            toast.error(
                "No bank account is available for payout on this folio. Please add a bank to the investor profile and try again."
            );
            setIsLoading(false);
            return;
        }
        if (!hasError) {

            const clientIp = await fetchClientIp();

            //const _amount = amount.concat(".00")
            const _amount = amount;
            let payFlag = "Y"
            let payOutFlag = ""

            const option = dividendOptions.find(opt => opt.description === divOpt);
            const txnType = arrTransactionType.find(t => t.value === transactionType)
            setTxnVolType(txnType?.txnVolTyp ?? "");
            const refNo = await generateReference("");
            let schList: any = [];
            let sysSchList: any = [];
            let subSeqSec: any = null;
            let paySec: any = null;
            let payOutDtl: any = null;
            let subSeqPayFlag: any = null;

            let mandateRefNo = ""
            let end_month = ""
            let end_year = ""

            if (transactionType == "B") {
                //Lump sum
                subSeqPayFlag = "";

                payOutFlag = ""
                payOutDtl = getPayOutSec(transactionType, "", "", accType, "")
                schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, payOutFlag, payOutDtl, txnType?.txnVolTyp ?? "")

                payFlag = "Y"
                paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)

                //Testing :- Done

            }
            else if (transactionType == "V") {
                //SIP

                // `bankList` is populated after the user picks a payment mode
                // and `accNo` is set by selecting a mandate. If either is
                // missing, `selectedBank.account_no` threw
                // `Cannot read properties of undefined (reading 'account_no')`
                // and the Transact button just died silently.
                if (!accNo) {
                    toast.error("Please select a bank account / mandate first.");
                    setIsLoading(false);
                    return;
                }
                const selectedBank = bankList.find(
                    bank => bank.account_no === accNo
                );
                const mandateBankAcc = selectedBank?.account_no ?? accNo;
                const relatedMandates = mandateList.filter(
                    mandate => mandate.acc_no === mandateBankAcc
                );

                if (relatedMandates.length === 0) {
                    toast.error("No mandate found for the selected bank account.");
                    setIsLoading(false);
                    return;
                }

                if (relatedMandates.length > 1) {
                    if (amount > relatedMandates[0].max_amt) {
                        setSelectedMandate(relatedMandates[1].prn)
                        mandateRefNo = relatedMandates[1].prn
                        end_month = relatedMandates[1].end_date.split("-")[1]
                        end_year = (relatedMandates[1].end_date.split("-")[0] - 1).toString()

                    } else {
                        setSelectedMandate(relatedMandates[0].prn)
                        console.log("Selected Mandate :- ", relatedMandates[0].prn)
                        mandateRefNo = relatedMandates[0].prn
                        end_month = relatedMandates[0].end_date.split("-")[1]
                        end_year = (relatedMandates[0].end_date.split("-")[0] - 1).toString()

                    }

                } else {
                    setSelectedMandate(relatedMandates[0].prn)
                    mandateRefNo = relatedMandates[0].prn
                    end_month = relatedMandates[0].end_date.split("-")[1]
                    end_year = (relatedMandates[0].end_date.split("-")[0] - 1).toString()

                }
                payOutDtl = getPayOutSec(transactionType, "", "", accType, "")

                sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, selectedFrequency, sipDate, sipMonth, sipYear, end_month, end_year, payOutDtl, txnType)

                paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)

                subSeqPayFlag = "Y"
                subSeqSec = getSubSeqSec(transactionType, "DM", micr, ifsc, accType, accNo, mandateRefNo)
                //Testing :- Done

            } else if (transactionType == "O") {
                //Switch
                subSeqPayFlag = "";

                payOutFlag = ""
                payOutDtl = getPayOutSec(transactionType, "", "", accType, "")
                schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, payOutFlag, payOutDtl, txnType?.txnVolTyp ?? "")

                payFlag = ""
                paySec = getPaySec(transactionType, paymentMode, folioBank?.micr, folioBank?.ifsc, folioBank?.account_type, folioBank?.account_no, _amount?.toString(), beneVan, "")
                //Testing Done
                if (redType === "All Units") {
                    setAmount(availableUnits?.toString() || "")
                }
                console.log("Selected Units: ", availableUnits)

            }
            else if (transactionType == "Y") {
                //STP — scheme-to-scheme, no bank debit. Mandate is only
                // consulted to derive an end date; if no mandate matches the
                // folio's bank we still proceed with a default horizon so the
                // tab is not completely blocked.
                const relatedMandates = mandateList.filter(
                    mandate => mandate.acc_no === folioBank?.account_no
                );

                if (relatedMandates.length > 0) {
                    const pickIdx =
                        relatedMandates.length > 1 &&
                            Number(amount) > Number(relatedMandates[0].max_amt)
                            ? 1
                            : 0;
                    const picked = relatedMandates[pickIdx];
                    setSelectedMandate(picked.prn);
                    mandateRefNo = picked.prn;
                    const parts = (picked.end_date || "").split("-");
                    end_month = parts[1] || "";
                    end_year = parts[0]
                        ? (parseInt(parts[0], 10) - 1).toString()
                        : "";
                }

                if (!end_month || !end_year) {
                    // Fallback: 10-year horizon from the SIP start year.
                    const baseYear = parseInt(sipYear, 10);
                    end_month = sipMonth
                        ? sipMonth.padStart(2, "0")
                        : (new Date().getMonth() + 1).toString().padStart(2, "0");
                    end_year = isNaN(baseYear)
                        ? (new Date().getFullYear() + 10).toString()
                        : (baseYear + 10).toString();
                }
                payOutDtl = getPayOutSec("E", "", "", accType, "")

                sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, selectedFrequency, sipDate, sipMonth, sipYear, end_month, end_year, payOutDtl, "E")
                payFlag = ""
                paySec = getPaySec("E", "", "", "", "", "", "", "", "")


                subSeqPayFlag = "N"
                subSeqSec = getSubSeqSec("E", "", "", "", "", "", "")
                setAmount("")



            }
            else if (transactionType == "J") {
                //SWP — periodic payout from scheme to folio bank. No debit
                // mandate is needed; only used opportunistically for end date.
                const relatedMandates = mandateList.filter(
                    mandate => mandate.acc_no === folioBank?.account_no
                );

                if (relatedMandates.length > 0) {
                    const pickIdx =
                        relatedMandates.length > 1 &&
                            Number(amount) > Number(relatedMandates[0].max_amt)
                            ? 1
                            : 0;
                    const picked = relatedMandates[pickIdx];
                    setSelectedMandate(picked.prn);
                    mandateRefNo = picked.prn;
                    const parts = (picked.end_date || "").split("-");
                    end_month = parts[1] || "";
                    end_year = parts[0]
                        ? (parseInt(parts[0], 10) - 1).toString()
                        : "";
                }

                if (!end_month || !end_year) {
                    const baseYear = parseInt(sipYear, 10);
                    end_month = sipMonth
                        ? sipMonth.padStart(2, "0")
                        : (new Date().getMonth() + 1).toString().padStart(2, "0");
                    end_year = isNaN(baseYear)
                        ? (new Date().getFullYear() + 10).toString()
                        : (baseYear + 10).toString();
                }
                payOutFlag = "Y"
                payOutDtl = getPayOutSec(transactionType, folioBank?.micr, folioBank?.ifsc, folioBank?.account_type, folioBank?.account_no)

                sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, selectedFrequency, sipDate, sipMonth, sipYear, end_month, end_year, payOutDtl, "J")
                payFlag = ""
                paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)

                subSeqPayFlag = "N"
                subSeqSec = getSubSeqSec(transactionType, "", "", "", "", "", "")
                setAmount("")


            }
            else if (transactionType == "R") {


                //Redeem
                let txnVolType = redType === "Amount" ? "A" : redType === "Unit" ? "U" : "A"
                let amount: any = "";

                if (redType === "Amount") {
                    txnVolType = "A"

                } else if (redType === "Unit") {

                    txnVolType = "U"
                } else if (redType === "All Units") {
                    setAmount(availableUnits?.toString() || "")
                    txnVolType = "E"
                }
                console.log("txnVolType :- ", txnVolType, _amount)
                console.log("typeof availableUnits:", typeof availableUnits);

                if (selectedFolio === null || selectedFolio === undefined) {
                    toast.error("Please select folio for redemption")
                    setIsLoading(false)
                    return
                }
                console.log(selectedFolio, "selectedFolio")

                console.log("Bank details by folio :- ", bankByFolio)




                payOutFlag = "Y"
                // payOutDtl = getPayOutSec(transactionType, micr, ifsc, accType, accNo)
                payOutDtl = getPayOutSec(transactionType, folioBank?.micr, folioBank?.ifsc, folioBank?.account_type, folioBank?.account_no)
                schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, payOutFlag, payOutDtl, txnVolType)
                console.log("SchList :- ", schList)
                payFlag = ""
                paySec = getPaySec(transactionType, "", "", "", "", "", "", "", "")
                if (redType === "All Units") {
                    setAmount(availableUnits?.toString() || "")
                }
                //Testing :- Done

            }



            const transaction: TransactionData = {
                txnType: transactionType === "Y" ? "E" : transactionType,
                entGroupRefNo: refNo?.data?.data?.reference ?? "",
                can: selectedCan,
                totAmt: transactionType == "J" || transactionType == "Y" ? "" : _amount,
                schList: schList,
                paySecFlag: payFlag,
                paySec: paySec,
                sysSchList: sysSchList ?? [],
                subSeqPayFlag: subSeqPayFlag,
                subSeqSec: subSeqSec ?? [],
                logDtl: {
                    deviceType: "W",
                    custIpAddress: clientIp
                }
            };

            try {
                console.log("Executing transaction with data:", transaction);


                const response = await executeMfuTransaction(transaction, 2, schemeData?.schemeISIN);
                console.log("Transaction response:", response);

                const result = JSON.parse(response?.data?.data);
                console.log("[portfolio-order] MFU response:", result);

                const respBody: any = result?.respBody ?? result ?? {};
                const respHeader: any = result?.respHeader ?? respBody?.respHeader ?? {};
                const appLink = respBody?.ordDtl?.appLinkPri;

                if (appLink) {
                    clearData();
                    window.open(appLink, '_blank');
                } else {
                    const errList: any[] = respBody?.secWisErrorList ?? [];
                    const schemeErrors = errList
                        .map((err: any) => (err?.secErrorMsg || err?.secErrorCode || "").toString().trim())
                        .filter((m: string) => m);
                    const headerMsg = (respHeader?.errorMsg || respHeader?.errorDesc || "").toString().trim();
                    const headerCode = (respHeader?.errorCode || "").toString().trim();
                    const msg =
                        [schemeErrors.join(", "), headerMsg || headerCode].filter(Boolean).join(" — ") ||
                        "MFU rejected this order but did not return a specific reason. Please verify the CAN, folio, bank and try again.";
                    toast.error(msg);
                    setTransactionError(msg);
                }

            } catch (err: any) {
                setIsLoading(false)
                setExceptions({ value: true, message: err?.msg })
                if (err?.err) {
                    console.log("Handled transaction error:", err.err);
                } else {
                    console.log("Unhandled error during transaction:", err);
                }
            } finally {
                setIsLoading(false)
            }

        }
        setIsLoading(false)
    }


    const handleSelectedTargetScheme = async (targetScheme: any) => {
        try {
            const response = await searchByISIN(targetScheme);
            console.log("Response from searchByISIN for target scheme:", response);

            const count = response?.data?.data?.count || 0;
            if (count > 0) {
                // Map txnType to filtering column
                let filteredRecords: any[] = [];

                switch (transactionType) {
                    case 'I': // Investment
                        filteredRecords = response?.data?.data?.data.filter(
                            (item: any) => item.txn_type === 'I'
                        );
                        break;

                    case 'O': // Switch Out
                        filteredRecords = response?.data?.data?.data.filter(
                            (item: any) => item.txn_type === 'I' || item.txn_type === 'O' // target will receive Switch In as Investment
                        );
                        break;

                    case 'Y': // STP Out
                        filteredRecords = response?.data?.data?.data.filter(
                            (item: any) => item.txn_type === 'Y' || item.txn_type === 'I'
                        );
                        break;

                    case 'J': // SWP
                        filteredRecords = response?.data?.data?.data.filter(
                            (item: any) => item.txn_type === 'J' || item.txn_type === 'I'
                        );
                        break;

                    default:
                        filteredRecords = [];
                }

                console.log(`Filtered records for txn_type '${transactionType}':`, filteredRecords);

                if (filteredRecords.length === 1) {
                    console.log("Unique scheme found for target scheme:", filteredRecords[0]?.scheme_code);
                    setOutRtaSchCode(filteredRecords[0]?.scheme_code);
                } else if (filteredRecords.length > 1) {
                    setOutRtaSchCode(filteredRecords[0]?.scheme_code);
                    /* toastAlert(
                         "info",
                         "Multiple schemes found for the selected target scheme. Please contact support."
                     );*/
                } else {
                    toastAlert(
                        "error",
                        "No valid scheme found for the selected target scheme."
                    );
                }
            } else {
                toastAlert("error", "No scheme found for the selected target scheme.");
            }
        } catch (error) {
            console.error("Error fetching target scheme details:", error);
            toastAlert("error", "Failed to fetch target scheme. Please try again.");
        }

    }

    const handleReset = async (transactionType: any) => {

        setFrequencies([]);
        setSipDate("");
        setSipMonth("");
        setSipYear("");
        setOutRtaSchCode("");
        setDivOpt("");
        setRtaAmcCode("");
        setRtaSchCode("");
        setDivOpt("");
        setMinAmount("");
        setAmount("")
        //setData([]);
        setIsCartAdded(false);


    }

    function getOrdinal(day: string | number): string {
        const num = Number(day);
        if (isNaN(num)) return "";
        const suffixes = ["th", "st", "nd", "rd"];
        const v = num % 100;
        return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    }

    const calculateSipInfo = (
        selectedDuration: string,
        sipEndDate: string | null,
        sipInstallment: string | null
    ) => {
        const start = new Date(); // today
        let end: Date;
        let installments: number;

        switch (selectedDuration) {
            case "1": // Enter Date
                if (!sipEndDate) {
                    console.error("End date is required.");
                    return null;
                }
                end = new Date(sipEndDate);
                if (end <= start) {
                    console.error("End date must be in the future.");
                    return null;
                }
                installments =
                    (end.getFullYear() - start.getFullYear()) * 12 +
                    (end.getMonth() - start.getMonth());
                break;

            case "2": // Max Record (40 years)
                end = new Date(start);
                end.setFullYear(end.getFullYear() + 40);
                installments = 480;
                break;

            case "3": // Enter Installment
                if (!sipInstallment || isNaN(Number(sipInstallment))) {
                    console.error("Valid installment count is required.");
                    return null;
                }
                installments = parseInt(sipInstallment, 10);
                if (installments <= 0 || installments > 480) {
                    console.error("Installments must be between 1 and 480.");
                    return null;
                }
                end = new Date(start);
                end.setMonth(end.getMonth() + installments);
                break;

            default:
                console.error("Invalid duration selected.");
                return null;
        }

        const options = { month: "long", year: "numeric" } as const;

        return {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
            startMonthYear: start.toLocaleDateString("en-US", options),
            endMonthYear: end.toLocaleDateString("en-US", options),
            installments,
        };
    };


    const handleBackClick = () => {
        router.back();
    };


    //const allowedSipDays = [1, 5, 10, 15, 25];

    const [sipStartDate, setSipStartDate] = useState<Date | null>(null);

    const isDateAvailable = (date: Date): boolean => {
        if (!Array.isArray(allowedSipDays) || allowedSipDays.length === 0) {
            return false;
        }

        const day = date.getDate(); // 1–31
        return allowedSipDays.includes(day);
    };


    const handleDateChange = (date: Date | null) => {
        if (!date) return;
        setSipStartDate(date);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        setSipDate(day.toString());
        setSipMonth(month.toString());
        setSipYear(year.toString());
    };

    //added by rakesh sinha on dated 26-02-2026
    const handleSchemeOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (value === "Existing Scheme") {
            setOutRtaSchCode("")
        } else if (value === "New Scheme") {
            setOutRtaSchCode(rtaSchCode)
        }
        // setSelectedSchemeOption(value);
    };

    const fetchByISIN = async (targetScheme: any) => {
        const response = await searchByISIN(targetScheme);
        setSipData(response?.data?.data?.data || []);

    }

    useEffect(() => {
        if (finalScheme.length > 0) {
            handleSchemeType("Growth"); // default selection
        }
    }, [finalScheme]);

    const handleSchemeType = (value: any) => {
        //const value = e?.target?.value;

        console.log(value)
        setSelectedScheme("")


        if (value == "Growth" && finalScheme.length > 0) {

            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("GR")
            );
            console.log("ISIN for Growth Scheme :- ", schemeName)

            setSelectedScheme(schemeName?.name);

            fetchByISIN(schemeName?.schemeISIN);
        } else if (value == "IDCW-P") {
            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("IDCW-P")
            );
            console.log("ISIN for IDCW-P Scheme :- ", schemeName)

            setSelectedScheme(schemeName?.name);
            fetchByISIN(schemeName?.schemeISIN);
        } else if (value == "IDCW-R") {
            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("IDCW-R")
            );
            console.log("ISIN for IDCW-R Scheme :- ", schemeName)

            setSelectedScheme(schemeName?.name);
            fetchByISIN(schemeName?.schemeISIN);
        }

        if (value === "ELSS") {
            toast.info("SIP not allowed for ELSS schemes");
            setTransactionType("");
            return false;
        }
        setSelectedSchemeType(value)


        //getSelectedScheme(transactionType)
        return true;
    }

    // Theme colors
    const theme = {
        primary: "#F59E0B",
        secondary: "#FBBF24",
        accent: "#1F1A1A",
        success: "#10B981",
        danger: "#EF4444",
        background: "#0A0A0A",
        cardBg: "#111111",
        textPrimary: "#F9FAFB",
        textSecondary: "#9CA3AF",
        border: "#2A2A2A",
        gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)"
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-[#2A2A2A]">
                    <div className="sticky top-0 z-30 bg-[#111111] border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <ArrowLeft
                                    className="w-5 h-5 cursor-pointer text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                                    onClick={handleBackClick}
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-[#F9FAFB]">
                                        Order Application Form
                                    </h3>
                                    <p className="text-xs text-[#9CA3AF]">Complete your purchase</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                        {/* LEFT COLUMN - Scheme, CAN, Folio, Bank */}
                        <div className="space-y-4">
                            <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-[#9CA3AF] font-medium space-y-4">
                                        <p>Scheme</p>
                                        <p>CAN</p>
                                        <p>Folio</p>
                                        <p>First Holder</p>
                                        <p>KYC Status</p>
                                    </div>
                                    <div className="text-[#F9FAFB] space-y-4">
                                        <p className="font-medium">{schemeData?.ms_fullname || schemeData?.name}</p>

                                        {/* CAN Selection */}
                                        <div className="flex items-center relative">
                                            <span className="text-sm font-mono">{selectedCan}</span>
                                            <button
                                                className="ml-2 p-1 rounded hover:bg-[#2A2A2A] transition-colors"
                                                onClick={() => setShowCanList(!showCanList)}
                                            >
                                                <Pencil className="w-3 h-3 text-[#F59E0B]" />
                                            </button>
                                            {showCanList && (
                                                <div className="absolute top-8 left-0 z-50 min-w-[600px] bg-[#111111] border border-[#2A2A2A] rounded-lg shadow-xl">
                                                    <div className="p-3 border-b border-[#2A2A2A]">
                                                        <h4 className="font-medium text-[#F9FAFB] text-sm">Select CAN</h4>
                                                    </div>
                                                    <div className="max-h-60 overflow-auto">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-[#1F1A1A] sticky top-0">
                                                                <tr className="border-b border-[#2A2A2A]">
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">Select</th>
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">CAN</th>
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">Primary Holder</th>
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">Tax Status</th>
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">Joint 1</th>
                                                                    <th className="py-2 px-3 text-left text-[#F59E0B]">Joint 2</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {investorList?.map((inv: any) => (
                                                                    <tr key={inv?.id} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="radio"
                                                                                name="can"
                                                                                className="w-4 h-4 accent-[#F59E0B]"
                                                                                onChange={() => {
                                                                                    setSelectedCan(inv?.InvestorAccountHolding[0]?.CAN_Id);
                                                                                    setSelectedHolder(inv?.name)
                                                                                    setShowCanList(false);
                                                                                }}
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3 font-mono text-xs text-[#F9FAFB]">{inv?.InvestorAccountHolding[0]?.CAN_Id}</td>
                                                                        <td className="py-2 px-3 text-[#F9FAFB]">{inv.name}</td>
                                                                        <td className="py-2 px-3 text-[#F9FAFB]">{TAX_STATUS.find((opt: any) => Number(opt.code) == Number(inv.tax_status))?.label || inv.tax_status}</td>
                                                                        <td className="py-2 px-3 text-[#9CA3AF]">{inv.joint1 || "-"}</td>
                                                                        <td className="py-2 px-3 text-[#9CA3AF]">{inv.joint2 || "-"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Folio Selection */}
                                        <div className="relative">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center flex-1">
                                                    {folioSelectionMode === 'new' ? (
                                                        <span className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F1A1A] text-[#F59E0B] rounded-md">NEW</span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F1A1A] text-[#F9FAFB] rounded-md">{getCurrentFolioDisplay()}</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="ml-2 p-1 rounded hover:bg-[#2A2A2A] transition-colors"
                                                    onClick={() => setShowFolioDropdown(!showFolioDropdown)}
                                                >
                                                    <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                                                </button>
                                            </div>

                                            {showFolioDropdown && (
                                                <div className="absolute top-8 left-0 z-50 w-[500px] bg-[#111111] border border-[#2A2A2A] rounded-lg shadow-xl">
                                                    <div className="p-3 border-b border-[#2A2A2A]">
                                                        <h4 className="font-medium text-[#F9FAFB] text-sm">Folio Selection</h4>
                                                    </div>
                                                    <div className="p-3 border-b border-[#2A2A2A] flex gap-2">
                                                        <button
                                                            onClick={() => handleFolio("New")}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F1A1A] text-[#F59E0B] rounded-md hover:bg-[#2A2A2A] transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            New Folio
                                                        </button>
                                                        <button
                                                            onClick={() => handleFolio("Existing")}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F1A1A] text-[#9CA3AF] rounded-md hover:bg-[#2A2A2A] transition-colors"
                                                        >
                                                            <List className="w-4 h-4" />
                                                            Select from List
                                                        </button>
                                                    </div>

                                                    {folioSelectionMode === 'existing' && (
                                                        <div className="max-h-60 overflow-y-auto">
                                                            <table className="w-full text-xs">
                                                                <thead className="bg-[#1F1A1A] sticky top-0">
                                                                    <tr className="border-b border-[#2A2A2A]">
                                                                        <th className="py-2 px-3 text-left text-[#F59E0B]">Select</th>
                                                                        <th className="py-2 px-3 text-left text-[#F59E0B]">Folio Number</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {investorPortfolio.map((opt: any) => (
                                                                        <tr key={opt.folio_no} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                                            <td className="py-2 px-3">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="folio"
                                                                                    className="w-4 h-4 accent-[#F59E0B]"
                                                                                    onChange={() => handleFolioSelection(opt)}
                                                                                />
                                                                            </td>
                                                                            <td className="py-2 px-3 font-mono text-xs text-[#F9FAFB]">{opt.folio_number}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm">{selectedHolder}</p>
                                        <p className="text-sm">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#10B981]/20 text-[#10B981]">
                                                ✓ KYC Validated
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {paymentMode && mandateList && mandateList.length > 0 && (
                                <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                    <h2 className="text-[#F59E0B] font-semibold mb-3">Mandate Lists</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#1F1A1A] sticky top-0">
                                                <tr className="border-b border-[#2A2A2A]">
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">Select</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">Bank</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">Account No</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">IFSC</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">Account Type</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">Limit</th>
                                                    <th className="py-2 px-2 text-left text-[#F59E0B]">MICR</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mandateList.map((opt: any) => (
                                                    <tr key={opt?.id} className="hover:bg-[#2A2A2A] border-b border-[#2A2A2A]">
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="radio"
                                                                name="mandate"
                                                                className="w-4 h-4 accent-[#F59E0B]"
                                                                onChange={() => {
                                                                    setAccType(opt?.acc_type)
                                                                    setAccNo(opt?.acc_no)
                                                                    setIfsc(opt?.ifsc)
                                                                    setMicr(opt?.micr)
                                                                    setSelectedMandate(opt?.prn)
                                                                    setEndMonth(opt?.end_date.split("-")[1])
                                                                    setEndYear((parseInt(opt?.end_date.split("-")[0]) - 1).toString())
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2 font-mono text-xs text-[#F9FAFB]">{opt?.prn}</td>
                                                        <td className="py-2 px-2 text-[#F9FAFB]">{opt.acc_no}</td>
                                                        <td className="py-2 px-2 text-[#F9FAFB]">{opt.ifsc}</td>
                                                        <td className="py-2 px-2 text-[#F9FAFB]">{opt.acc_type}</td>
                                                        <td className="py-2 px-2 text-[#F9FAFB]">{opt.max_amt}</td>
                                                        <td className="py-2 px-2 text-[#F9FAFB]">{opt.micr}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN - Transaction Details */}
                        <div className="space-y-4">
                            <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                <CustomSelect
                                    items={orderOptions}
                                    bindValue="value"
                                    bindName="label"
                                    label="Transaction Type:"
                                    className="w-full"
                                    value={transactionType}
                                    onChange={(selectedOption: any) => {
                                        const selectedValue = selectedOption?.target?.value;
                                        setTransactionType(selectedValue);
                                        handleTransactionType({ target: { value: selectedValue } });
                                    }}
                                />
                            </div>

                            {["Y", "O"].includes(transactionType) && (
                                <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                    <CustomReactSelect
                                        items={targetScheme}
                                        bindValue="schemeISIN"
                                        bindName="ms_fullname"
                                        label="Target Scheme:"
                                        value={selectedTargetScheme}
                                        className="w-full"
                                        onChange={(selectedOption: any) => {
                                            setSelectedTargetScheme(selectedOption?.schemeISIN || "");
                                            handleSelectedTargetScheme(selectedOption?.schemeISIN);
                                        }}
                                        isClearable
                                        placeholder="Select or type scheme"
                                    />
                                </div>
                            )}

                            {['B', 'V'].includes(transactionType) && (
                                <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                    <label className="block text-xs font-semibold text-[#F9FAFB] mb-2">Scheme Type:</label>
                                    <div className="flex items-center gap-4">
                                        {['Growth', 'IDCW-P', 'IDCW-R'].map(type => (
                                            <label key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value={type}
                                                    checked={selectedSchemeType === type}
                                                    onChange={(e: any) => handleSchemeType(e.target.value)}
                                                    className="w-4 h-4 accent-[#F59E0B]"
                                                />
                                                <span className="text-sm text-[#F9FAFB]">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {commonError.length > 0 && (
                                        <div className="text-sm text-[#EF4444] mt-4">
                                            No mandate found —{" "}
                                            <Link
                                                href="/account-holding"
                                                className="text-[#F59E0B] hover:underline"
                                            >
                                                click here to create SIP mandate
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {['R', 'O'].includes(transactionType) && (
                                <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                                    <label className="block text-xs font-semibold text-[#F9FAFB] mb-2">{transactionType === 'R' ? 'Redeem' : 'Switch'} Type:</label>
                                    <div className="flex items-center gap-4">
                                        {['Amount', 'Unit', 'All Units'].map(type => (
                                            <div key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="switchType"
                                                    value={type}
                                                    onChange={handleRadio}
                                                    className="w-4 h-4 accent-[#F59E0B]"
                                                />
                                                <span className="text-sm text-[#F9FAFB]">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-3 border border-[#2A2A2A] rounded-lg bg-[#111111]">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-[#9CA3AF] font-semibold">Available Units:</div>
                                            <div className="font-mono text-[#F9FAFB]">{availableUnits}</div>
                                            <div className="text-[#9CA3AF] font-semibold">Available Amount:</div>
                                            <div className="font-mono text-[#F9FAFB]">{availableAmount}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isSelected && (
                                <div className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A] space-y-4">
                                    {isDividend && (
                                        <div>
                                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Dividend Frequency:</label>
                                            <select className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent">
                                                <option value="">Select Frequency</option>
                                                {dividendFrequency.map(freq => (
                                                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {["V", "Y", "J"].includes(transactionType) && (
                                        <div>
                                            <CustomSelect
                                                items={frequencies}
                                                bindValue="value"
                                                bindName="label"
                                                label="SIP Frequency"
                                                className="mt-2"
                                                value={selectedFrequency}
                                                onChange={(event) => {
                                                    const selectedValue = event.target.value;
                                                    const selectedFreqObj = frequencies.find(
                                                        (f: any) => f.value === selectedValue
                                                    );
                                                    setSelectedFrequency(selectedValue);

                                                    const rawDates = data
                                                        .filter(
                                                            (item) =>
                                                                item.txn_type === transactionType &&
                                                                item.sys_freq === selectedValue &&
                                                                item.sys_date != null &&
                                                                item.sys_date.trim() !== ""
                                                        )
                                                        .map((item) => item.sys_date!.trim());

                                                    let dateList: string[] = [];

                                                    if (selectedFreqObj?.freqOpt === "A") {
                                                        dateList = Array.from({ length: 28 }, (_, i) => (i + 1).toString());
                                                    } else if (rawDates.length > 0) {
                                                        dateList = rawDates
                                                            .flatMap((dateStr) => {
                                                                if (dateStr.includes(";")) {
                                                                    return dateStr.split(";").flatMap((pair: any) => pair.split(","));
                                                                } else if (dateStr.includes("/")) {
                                                                    return dateStr.split("/");
                                                                } else if (dateStr.includes(",")) {
                                                                    return dateStr.split(",");
                                                                } else {
                                                                    return [dateStr];
                                                                }
                                                            })
                                                            .map((d) => d.trim())
                                                            .filter((d, i, arr) => d !== "" && arr.indexOf(d) === i);
                                                    }

                                                    if (selectedValue === "F" && dateList.length === 0) {
                                                        const pairs: string[] = ["1,14", "8,21", "15,28", "22,28"];
                                                        dateList = pairs;
                                                    }

                                                    const formattedDates = selectedValue === "F"
                                                        ? [
                                                            { label: "Select", value: "" },
                                                            ...dateList.map((pair) => {
                                                                const [first, second] = pair.split(",").map((d) => d.trim());
                                                                return {
                                                                    label: `${pair} — SIP on ${first}${getOrdinal(first)} & ${second}${getOrdinal(second)} every month`,
                                                                    value: pair,
                                                                };
                                                            }),
                                                        ]
                                                        : [
                                                            { label: "Select", value: "" },
                                                            ...dateList.map((date) => ({
                                                                label: `${date}`,
                                                                value: date,
                                                            })),
                                                        ];

                                                    const allowedDays = dateList
                                                        .map((d) => Number(d))
                                                        .filter((n) => !isNaN(n));

                                                    setAvailableDates(formattedDates);

                                                    if (selectedFrequency == "M" && allowedDays.length == 0) {
                                                        const defaultDays = [1, 5, 10, 15, 20, 25];
                                                        setAllowedSipDays(defaultDays);
                                                    } else {
                                                        setAllowedSipDays(allowedDays);
                                                    }
                                                }}
                                            />

                                            <div className="mt-3">
                                                <label className="text-xs font-bold text-[#F9FAFB]">SIP Start Date</label>
                                                <DatePicker
                                                    selected={sipStartDate}
                                                    onChange={handleDateChange}
                                                    filterDate={isDateAvailable}
                                                    placeholderText="Select SIP Start Date"
                                                    className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                                    dateFormat="dd/MM/yyyy"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Amount:</label>
                                        <input
                                            type="number"
                                            value={redType === 'All Units' ? availableUnits : amount}
                                            placeholder={placeHolder}
                                            disabled={redType === 'All Units'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const val = e.target.value;
                                                if (redType == "All Units") {
                                                    setAmount(availableUnits);
                                                } else {
                                                    setAmount(val);
                                                }
                                            }}
                                            className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent placeholder:text-[#9CA3AF]"
                                        />

                                        {amount !== "" && !isNaN(parseInt(amount, 10)) && (
                                            <label className="block text-xs font-medium text-[#9CA3AF] mt-2">
                                                {numberToWords(parseInt(amount, 10))}
                                            </label>
                                        )}

                                        {errors.amount && (
                                            <span className="text-red-400 text-xs">{errors.amount}</span>
                                        )}

                                        <p className="text-sm text-[#9CA3AF] mt-2">Min. Amount <span className="text-[#F59E0B]">{minAmount}</span></p>
                                    </div>

                                    {isTransact ? (
                                        <>
                                            {["B", "V"].includes(transactionType) && (
                                                <div className="mt-2">
                                                    <CustomSelect
                                                        items={payMode}
                                                        bindValue="value"
                                                        bindName="label"
                                                        label="Payment Modes:"
                                                        value={paymentMode}
                                                        onChange={(selectedOption: any) => {
                                                            const selectedValue = selectedOption?.target?.value;
                                                            setPaymentMode(selectedValue);
                                                            if (selectedValue === "NE" || selectedValue === "RT") {
                                                                setBeneVan("MFKK" + selectedCan);
                                                            } else if (selectedValue === "IU") {
                                                                setBeneVan("MFSYES" + selectedCan + "@@yesbankltd");
                                                            } else {
                                                                setBeneVan("");
                                                            }
                                                            const fetchBank = async () => {
                                                                const response = await getBankAccount(investorList[0].id);
                                                                const data = response?.data?.data?.data
                                                                setBankList(data)
                                                            }
                                                            fetchBank()
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {exeptions.value && (
                                                <div className="text-red-400 text-sm">{exeptions.message}</div>
                                            )}
                                            {transactionError && (
                                                <div className="text-red-400 text-sm">{transactionError}</div>
                                            )}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    onClick={handleTransact}
                                                    disabled={isLoading}
                                                    className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {isLoading ? <><Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-[#3A3A3A]' /> wait...</> : 'Order Now'}
                                                </button>
                                                <button
                                                    className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-all"
                                                    onClick={() => setIsTransact(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {isCartAdded && (
                                                <>
                                                    <div className="text-[#10B981] text-sm flex items-center">
                                                        <CheckCircleIcon className="w-4 h-4 text-[#10B981]" />
                                                        <span className="ml-3">{orderOptions.find(opt => opt.value === transactionType)?.label} added to cart successfully</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-all"
                                                            onClick={() => setIsTransact(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => window.location.href = 'my-cart'}
                                                            className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                                                        >
                                                            Go to cart
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                            {!isCartAdded && (
                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-all"
                                                        onClick={addToCart}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (transactionType === 'R' || transactionType === 'O') {
                                                                if (redType === 'Amount') {
                                                                    parseFloat(amount) >= parseFloat(availableAmount)
                                                                        ? toast.error('Redeem amount cannot be greater than available amount')
                                                                        : setIsTransact(true)
                                                                } else if (redType === 'Unit') {
                                                                    parseFloat(amount) >= parseFloat(availableUnits)
                                                                        ? toast.error('Redeem units cannot be greater than available units')
                                                                        : setIsTransact(true)
                                                                } else if (redType === 'All Units') {
                                                                    setAmount(availableUnits?.toString() || "")
                                                                    setIsTransact(true)
                                                                }
                                                            } else {
                                                                console.log("Transact for non-redeem order")
                                                                setIsTransact(true)
                                                            }
                                                        }}
                                                        className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                                                    >
                                                        Transact Now
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderPopup;