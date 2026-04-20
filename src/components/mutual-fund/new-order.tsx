import { useEffect, useRef, useState, useContext } from "react";
import { ArrowLeft, ChevronDown, Plus, List, CheckCircleIcon } from "lucide-react";
import CustomSelect from "@/commonUI/Select";
import { generateReference, searchByAmcId, searchByISIN, fetchClientIp, getMandates, getInvestorPortfolio, getSchemeByName, getFolioBySchemeName } from "@/api/transaction";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { numberToWords } from "@/utils/helpers"
import { toast } from "react-toastify";
import { months, orderTypes, dividendFrequency, payMode, dividendOptions, arrTransactionType, transactionTypeList, TAX_STATUS, accountTypeList } from "@/utils/constants";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import { generateTransactionByType } from "@/utils/mfu/generateTransaction";
import { USER_DATA } from "@/utils/constants";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { getBankAccount } from "@/api/holder";
import { executeMfuTransaction, TransactionData } from "@/services/mfuTransactionService";
import Loader from "@/commonUI/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFundStore } from "@/store/useFundStore";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateUniqueId } from "@/utils/mfu/generateUtrn";
import { getPayOutSec, getPaySec, getSchList, getSubSeqSec, getSysSchList } from "./transaction";


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
    const { schemeData: storeSchemeData, investorList: storeInvestorList, clearData } = useFundStore();

    // Use localStorage as fallback for data persistence across refreshes
    const [localSchemeData, setLocalSchemeData] = useState<any>(null);
    const [localInvestorList, setLocalInvestorList] = useState<any[]>([]);

    // Prefer Zustand store, fallback to localStorage
    const schemeData = storeSchemeData || localSchemeData;
    const investorList = storeInvestorList?.length > 0 ? storeInvestorList : localInvestorList;

    const [sipData, setSipData] = useState<any[]>([]);
    const [transactionType, setTransactionType] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [isDividend, setIsDividend] = useState(false);


    const [selectedCan, setSelectedCan] = useState<any>("");
    const [selectedHolder, setSelectedHolder] = useState<any>("");
    const [selectedFolio, setSelectedFolio] = useState<any>(null);
    const [showCanList, setShowCanList] = useState(false);
    const [showFolioDropdown, setShowFolioDropdown] = useState(false);
    const [folioSelectionMode, setFolioSelectionMode] = useState<'new' | 'existing'>('new');
    const [newFolioNumber, setNewFolioNumber] = useState('');

    const [data, setData] = useState<any[]>([]);
    const [frequencies, setFrequencies] = useState<any[]>([]);
    const [selectedFreq, setSelectedFreq] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [availableDates, setAvailableDates] = useState<{ label: string; value: string }[]>([]);
    const [rtaAmcCode, setRtaAmcCode] = useState("");
    const [rtaSchCode, setRtaSchCode] = useState("");
    const [outRtaSchCode, setOutRtaSchCode] = useState("");

    const [minAmount, setMinAmount] = useState("");
    const [divOpt, setDivOpt] = useState("")
    const [sipDate, setSipDate] = useState("")
    const [sipMonth, setSipMonth] = useState("")
    const [sipYear, setSipYear] = useState("")
    const [endMonth, setEndMonth] = useState("")
    const [endYear, setEndYear] = useState("")
    const [selectedDuration, setSelectedDuration] = useState("")

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

    useEffect(() => {
        if (bankList?.length > 0) {
            const first = bankList[0];
            setSelectedAccount(first.account_no);
            setAccType(first.account_type);
            setAccNo(first.account_no);
            setIfsc(first.ifsc);
            setMicr(first.micr);
        }
    }, [bankList]);

    const [placeHolder, setPlaceHolder] = useState('Amount');
    const [orderOptions, setOrderOptions] = useState<any[]>([])
    const [txnVolType, setTxnVolType] = useState("")
    const [vol, setVol] = useState("");
    const [isCartAdded, setIsCartAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [commonError, setCommonError] = useState("")
    const [mandateList, setMandateList] = useState<any[]>([]);
    const [selectedMandate, setSelectedMandate] = useState<any>("")
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

    const [folioList, setFolioList] = useState<any[]>([])
    const [isLoadingFolios, setIsLoadingFolios] = useState(false)


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
        // Load data from localStorage if Zustand store is empty (for refresh persistence)
        if (typeof window !== 'undefined') {
            const storedScheme = localStorage.getItem('newOrder_schemeData');
            const storedInvestors = localStorage.getItem('newOrder_investorList');

            if (storedScheme) {
                try {
                    setLocalSchemeData(JSON.parse(storedScheme));
                } catch (e) {
                    console.error('Error parsing schemeData from localStorage:', e);
                }
            }

            if (storedInvestors) {
                try {
                    const parsedInvestors = JSON.parse(storedInvestors);
                    setLocalInvestorList(parsedInvestors);
                    // Also set CAN and Holder from localStorage data immediately
                    if (parsedInvestors?.length > 0) {
                        setSelectedCan(parsedInvestors[0]?.InvestorAccountHolding?.[0]?.CAN_Id || "");
                        setSelectedHolder(parsedInvestors[0]?.name || "");
                    }
                } catch (e) {
                    console.error('Error parsing investorList from localStorage:', e);
                }
            }
        }
    }, []);

    // Set CAN and Holder from Zustand store when navigating directly (not refresh)
    useEffect(() => {
        if (storeInvestorList?.length > 0) {
            setSelectedCan(storeInvestorList[0]?.InvestorAccountHolding?.[0]?.CAN_Id || "");
            setSelectedHolder(storeInvestorList[0]?.name || "");
        }
    }, [storeInvestorList]);

    useEffect(() => {
        // Fetch portfolio once we have investor data (from either source)
        const effectiveInvestorList = storeInvestorList?.length > 0 ? storeInvestorList : localInvestorList;
        if (effectiveInvestorList?.length > 0 && effectiveInvestorList[0]?.id) {
            const fetch = async (targetScheme: any) => {
                const response = await getInvestorPortfolio(targetScheme);
                setInvestorPortfolio(response?.data?.data?.data || []);
            }
            fetch(effectiveInvestorList[0].id);
        }

        // Fetch scheme by name once we have scheme data (from either source)
        const effectiveSchemeData = storeSchemeData || localSchemeData;
        if (effectiveSchemeData?.name) {
            const fetchSchemeByName = async (schemeName: any) => {
                const response = await getSchemeByName(schemeName);
                setFinalScheme(response?.data?.data?.data || []);
            }
            fetchSchemeByName(effectiveSchemeData.name)
        }

    }, [localSchemeData, localInvestorList])


    useEffect(() => {
        if (typeof window !== 'undefined') {
            //if (source === 'fund-explore') {
            const filteredOptions = orderTypes.filter(
                opt => !["STP", "SWP", "Switch", "Redeem"].includes(opt.label)
            );
            setOrderOptions(filteredOptions)
            // } /*else {
            //setOrderOptions(orderTypes)
            //}

        }
    }, []);

    useEffect(() => {
        if (open) modalRef.current?.showModal();
        else modalRef.current?.close();
    }, [open]);

    useEffect(() => {
        // Only run when we have valid data (either from Zustand or localStorage)
        const effectiveInvestorList = storeInvestorList?.length > 0 ? storeInvestorList : localInvestorList;
        const effectiveSchemeData = storeSchemeData || localSchemeData;

        if (effectiveInvestorList.length === 0 && !localStorage.getItem('newOrder_investorList')) {
            router.push('/fund-explore');
            return;
        }

        const fetchData = async () => {
            setIsLoadingFolios(true);
            try {
                let schemeToFetch = effectiveSchemeData?.name?.split(" ")[0].trim() || "" // Extract scheme name without growth/dividend
                const investorPan = effectiveInvestorList[0]?.pan_no;
                if (!investorPan) {
                    setIsLoadingFolios(false);
                    return;
                }

                const response = await getFolioBySchemeName(investorPan, schemeToFetch);
                const folios = response?.data?.data?.data || [];

                // If folios exist, default select the first one and set mode to existing
                if (folios.length > 0) {
                    setFolioSelectionMode('existing');
                    setSelectedFolio(folios[0]);
                } else {
                    // No folios available, set to new folio mode
                    setFolioSelectionMode('new');
                    setSelectedFolio(null);
                }

                setFolioList(folios);
            } catch (error) {
                console.error("Error fetching folio:", error);
            } finally {
                setIsLoadingFolios(false);
            }
        }

        if (effectiveInvestorList?.length > 0 && effectiveSchemeData) {
            fetchData();
        }



        // Run when either Zustand store or localStorage data becomes available
    }, [storeInvestorList, storeSchemeData, localInvestorList, localSchemeData])


    const addToCart = async () => {

        try {
            const isSIP = ["V", "Y", "J"].includes(transactionType);
            const newErrors = {
                date: isSIP ? (sipDate ? "" : "Required") : "",
                month: isSIP ? (sipMonth ? "" : "Required") : "",
                year: isSIP ? (sipYear ? "" : "Required") : "",
                frequency: isSIP ? (selectedFrequency ? "" : "Required") : "",
                amount: amount ? "" : "Required",
            };
            setErrors(newErrors);
            const hasError = Object.values(newErrors).some((msg) => msg !== "");
            if (!hasError) {
                const userData: any = getLS(USER_DATA);
                const option = dividendOptions.find(opt => opt.description === divOpt);
                const txnType = arrTransactionType.find(t => t.value === transactionType)

                let CartObj = {
                    user_id: Number(userData?.id),
                    investor_id: Number(userData?.InvestorRegistration?.id),
                    //investor_id: selectedCan?.value ? selectedCan?.value : investor?.can_id,
                    account_holding_id: 0,
                    cart_type: 1,
                    scheme_id: schemeData?.id,
                    trans_type: transactionTypeList.find(opt => opt.name === transactionType)?.id,
                    folio_no: selectedFolio ? selectedFolio.folio_no : "NEW",
                    trans_amount: amount,
                    frequency: selectedFrequency,
                    day: sipDate.length > 1 ? sipDate : "0" + sipDate,
                    start_month: sipMonth.length > 1 ? sipMonth : "0" + sipMonth,
                    start_year: sipYear,
                    end_month: endMonth.length > 1 ? endMonth : "0" + endMonth,
                    end_year: endYear.length > 1 ? endYear : "0" + endYear,
                    rta_amc_code: rtaAmcCode,
                    rta_sch_code: rtaSchCode,
                    out_rta_sch_code: outRtaSchCode,
                    tx_vol_type: txnType?.txnVolTyp ?? "",
                    vol: amount,
                    div_opt: option?.description ?? "",
                    goal_id: null
                };

                let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
                if (addCartData.data.data) {
                    toastAlert("success", "Added To Cart");
                    setCartCounter(cartCounter + 1);
                    setIsCartAdded(true);
                } else {
                    toastAlert("info", "Unable to add in cart, please try again later!");
                }
            }
        } catch (error) {
            handleServerError(error);
        }
    };

    const handleFolioSelection = (folio: any) => {
        /*setAccType(folio?.ac_type.trim())
        setAccNo(folio?.ac_no)
        setIfsc(folio?.ifsc)
        setMicr(folio?.micr)*/
        setSelectedFolio(folio);
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

    const getCurrentFolioDisplay = (folioType: string) => {
        if (folioSelectionMode === 'new') {
            return 'NEW';
        }
        return selectedFolio?.folio || 'NEW';
    };

    const getSelectedScheme = async (selectedValue: any) => {
        setIsSelected(true)
        const txnData = sipData.filter((item: any) => item.txn_type === selectedValue);
        const firstTxn = txnData[0] || {};

        // Update dependent state values
        setRtaAmcCode(firstTxn.fund_code || '');
        setRtaSchCode(firstTxn.scheme_code || '');
        setDivOpt(firstTxn.div_opt || '');
        setMinAmount(firstTxn.min_amt || '');
        setData(txnData);
        // set this early
        setCommonError("")
        // Frequency list based on SIP,STP and SWP
        if (selectedValue === 'Y' || selectedValue === 'V' || selectedValue === 'J') {
            const investorId = investorList[0]?.id;
            if (!investorId) {
                setCommonError("No investor selected");
                return;
            }
            const response = await getMandates(investorId);

            //setErrors()
            if (response.data?.data?.data.length <= 0) {
                setCommonError("Create mandate for SIP")
            } else {
                const mandateList = response.data?.data?.data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");

                setMandateList(mandateList)
            }

            const filteredTxnData = txnData.filter((item: any) => item.txn_type === selectedValue && item.sys_freq);
            const mappedFreqData = filteredTxnData.map((item: any) => ({ freq: item.sys_freq, freqOpt: item.sys_freq_opt }));
            const uniqueFreqData = mappedFreqData.filter((value: any, index: number, self: any[]) =>
                index === self.findIndex((v: any) => v.freq === value.freq && v.freqOpt === value.freqOpt)
            );
            const freqList: any[] = [];
            const freqMapping: any = { M: "Monthly", Q: "Quarterly", W: "Weekly", F: "Fortnightly", D: "Daily", A: "Any Date" };
            const optMapping: any = { E: "End of Period", B: "Beginning of Period", X: "As and When Presented", A: "Any" };
            for (let i = 0; i < uniqueFreqData.length; i++) {
                const item = uniqueFreqData[i];
                const freqName = item.freq;
                const freqOptVal = item.freqOpt;
                const freqLabel = freqMapping[freqName] || freqName;
                const optLabel = optMapping[freqOptVal] || freqOptVal || "N/A";
                freqList.push({
                    label: freqLabel + " (" + optLabel + ")",
                    value: freqName,
                    freqOpt: freqOptVal,
                });
            }

            setFrequencies(freqList);

        } else {
            const investorId = investorList[0]?.id;
            if (!investorId) {
                setCommonError("No investor selected");
                return;
            }
            const response = await getMandates(investorId);

            //setErrors()
            if (response.data?.data?.data.length <= 0) {
                setCommonError("Create mandate for SIP")
            } else {
                const mandateList = response.data?.data?.data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");

                setMandateList(mandateList)
            }

        }

        // Handle STP case
        if (selectedValue === "Y" || selectedValue === "O") {
            try {
                const response = await searchByAmcId(schemeData?.amc_id);
                const records = response?.data?.data?.data || [];
                setTargetScheme(records);
            } catch (error) {
                console.error('Error fetching STP data:', error);
            }
        } else {
            setTargetScheme([]); // Reset if not STP
        }
    }

    const handleTransactionType = async (e: any) => {

        const selectedValue = e?.target?.value;
        setTransactionType(selectedValue);
        getSelectedScheme(selectedValue)

    };





    const handleTransact = async () => {
        setIsLoading(true)
        const isSIP = ["V", "Y", "J"].includes(transactionType);
        const newErrors = {
            date: isSIP ? (sipDate ? "" : "Required") : "",
            month: isSIP ? (sipMonth ? "" : "Required") : "",
            year: isSIP ? (sipYear ? "" : "Required") : "",
            frequency: isSIP ? (selectedFrequency ? "" : "Required") : "",
            amount: amount ? "" : "Required",
        };
        setErrors(newErrors);
        const hasError = Object.values(newErrors).some((msg) => msg !== "");
        if (paymentMode.length == 0 && transactionType != 'R') {
            setExceptions({ value: true, message: 'Please select Payment Method?' })
            setIsLoading(false)
            return
        }
        if (!hasError) {

            const clientIp = await fetchClientIp();

            const _amount = amount;
            let payFlag = "Y"
            let payOutFlag = ""

            const option = dividendOptions.find(opt => opt.description === divOpt);
            const txnType = arrTransactionType.find(t => t.value === transactionType)
            setTxnVolType(txnType?.txnVolTyp ?? "");
            const refNo = await generateReference("");
            let schList = [];
            let sysSchList: any = [];
            let subSeqSec: any = null;
            let paySec: any = null;
            let payOutDtl: any = null;
            let subSeqPayFlag: any = null;
            let mandateRefNo = ""
            let end_month = ""
            let end_year = ""

            if (transactionType == "B") {
                subSeqPayFlag = "";
                payOutFlag = ""
                payOutDtl = getPayOutSec(transactionType, "", "", accType, "")
                schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio?.folio, option, _amount, payOutFlag, payOutDtl, txnType?.txnVolTyp ?? "")

                payFlag = "Y"
                paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)



            } else if (transactionType == "V" || transactionType == "Y" || transactionType == "J") {

                const selectedBank = bankList.find(
                    bank => bank.account_no === accNo
                );
                const relatedMandates = mandateList.filter(
                    mandate => mandate.acc_no === selectedBank.account_no
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

                // "Max Period" radio shows the mandate's end date but doesn't
                // call setEndMonth/setEndYear, so endMonth/endYear state stays
                // empty. Fall back to the mandate-derived end_month/end_year
                // (computed just above) so MFU always receives a valid value —
                // otherwise MFU rejects with `secErrorCode 100625: endMonth is
                // required`.
                const finalEndMonth = endMonth || end_month;
                const finalEndYear = endYear || end_year;

                sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, selectedFrequency, sipDate, sipMonth, sipYear, finalEndMonth, finalEndYear, payOutDtl, txnType)

                paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)

                subSeqPayFlag = "Y"
                subSeqSec = getSubSeqSec(transactionType, "DM", micr, ifsc, accType, accNo, mandateRefNo)

            }

            const transaction: TransactionData = {
                txnType: transactionType,
                entGroupRefNo: refNo?.data?.data?.reference ?? "",
                can: selectedCan,
                totAmt: _amount,
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
                const response = await executeMfuTransaction(transaction, 2, schemeData?.schemeISIN);
                const result = JSON.parse(response?.data?.data);
                console.log("[new-order] MFU response:", result);

                const respBody: any = result?.respBody ?? result ?? {};
                const respHeader: any = result?.respHeader ?? respBody?.respHeader ?? {};
                const ordDtl: any = respBody?.ordDtl ?? {};
                const appLink = ordDtl?.appLinkPri;

                if (appLink) {
                    clearData();
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('newOrder_schemeData');
                        localStorage.removeItem('newOrder_investorList');
                    }
                    window.open(appLink, '_blank');
                } else {
                    // Collect any real error text MFU returned (scheme-level or
                    // header-level) instead of dumping raw JSON on the screen.
                    const errList: any[] = respBody?.secWisErrorList ?? [];
                    const schemeErrors = errList
                        .map((err: any) =>
                            (err?.secErrorMsg || err?.secErrorCode || "").toString().trim()
                        )
                        .filter((m: string) => m);
                    const headerMsg = (respHeader?.errorMsg || respHeader?.errorDesc || "").toString().trim();
                    const headerCode = (respHeader?.errorCode || "").toString().trim();
                    const msg =
                        [schemeErrors.join(", "), headerMsg || headerCode]
                            .filter(Boolean)
                            .join(" — ") ||
                        "MFU rejected this order but did not return a specific reason. Please verify the CAN, bank, mandate and try again.";
                    toast.error(msg);
                    setTransactionError(msg);
                }
            } catch (err: any) {
                setIsLoading(false)
                setExceptions({ value: true, message: err?.msg })
            } finally {
                setIsLoading(false)
            }

        }
        setIsLoading(false)
    }


    const handleSelectedTargetScheme = async (targetScheme: any) => {
        const response = await searchByISIN(targetScheme);
        setOutRtaSchCode(response?.data?.data?.data[0]?.scheme_code)
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




    const handleBackClick = () => {
        router.back();
    };



    const [sipStartDate, setSipStartDate] = useState<Date | null>(null);
    const [sipEndDate, setSipEndDate] = useState<Date | null>(null);

    const [mandateEndDate, setMandateEndDate] = useState<Date | null>(null);

    const isDateAvailable = (date: Date): boolean => {
        if (!Array.isArray(allowedSipDays) || allowedSipDays.length === 0) {
            return false;
        }

        const day = date.getDate(); // 1–31
        return allowedSipDays.includes(day);
    };

    const getMinSipDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        return today;
    };


    const handleDateChange = (date: Date | null, dateType: any) => {
        if (!date) return;

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (dateType === "Start") {
            setSipStartDate(date);

            if (selectedFrequency === "D") {
                setSipDate("NA")
            } else {
                setSipDate(day.toString().length === 1 ? "0" + day.toString() : day.toString());
            }

            setSipMonth(month.toString());
            setSipYear(year.toString());
        } else {
            setSipEndDate(date);
            setEndMonth(month.toString().length === 1 ? "0" + month.toString() : month.toString());
            setEndYear(year.toString());
        }

    };

    //modified by on dated 11-03-2026


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
        setSelectedScheme("")


        if (value == "Growth" && finalScheme.length > 0) {

            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("GR")
            );
            setSelectedScheme(schemeName?.name);

            fetchByISIN(schemeName?.schemeISIN);
        } else if (value == "IDCW-P") {
            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("IDCW-P")
            );
            setSelectedScheme(schemeName?.name);
            fetchByISIN(schemeName?.schemeISIN);
        } else if (value == "IDCW-R") {
            const schemeName = finalScheme.find((sch: any) =>
                sch.ms_fullname?.toUpperCase().includes("IDCW-R")
            );
            setSelectedScheme(schemeName?.name);
            fetchByISIN(schemeName?.schemeISIN);
        }

        if (value === "ELSS") {
            toast.info("SIP not allowed for ELSS schemes");
            setTransactionType("");
            return false;
        }
        setSelectedSchemeType(value)


        getSelectedScheme(transactionType)
        return true;
    }

    return (
        <>
            {/*<dialog ref={modalRef} className="modal" id={modalId}>*/}
            <div className="p-6 ">
                <div className="w-full rounded-xl">
                    {/* Sticky header */}
                    <div className="sticky top-0 z-30 bg-[#111111] border-b border-[#2A2A2A]">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <ArrowLeft
                                    className="w-5 h-5 cursor-pointer text-[#9CA3AF] hover:text-[#F9FAFB]"
                                    onClick={handleBackClick}
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-[#F9FAFB]">
                                        Order Application Form
                                    </h3>
                                    <p className="text-xs text-[#9CA3AF]">Complete your purchase</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* quick scheme snapshot if available */}
                                <div className="hidden sm:flex items-center gap-3">
                                    {/*<img src="/axis-logo.png" alt="AMC" className="h-8 w-auto" />*/}
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-[#F9FAFB]">
                                            {schemeData?.name}
                                        </div>
                                        {/* <div className="text-xs text-[#9CA3AF]">Large Cap · Equity</div>*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*<div className="flex justify-between items-start gap-8">*/}
                    {/* <div className="grid grid-cols-2 gap-4 overflow-auto mt-6">*/}
                    {/* Content area */}
                    <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6  overflow-y-auto min-h-[70vh] mt-5">
                        {/* Info Block */}

                        {/* -------- LEFT: Scheme, CAN, Folio, Bank -------- */}

                        <div className="ml-5 h-max">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-[#9CA3AF] font-medium space-y-6">

                                    <p>Scheme</p>
                                    <p>CAN</p>
                                    <p>Folio</p>
                                    <p>First Holder</p>
                                    <p>KYC Status</p>
                                </div>
                                <div className="text-[#F9FAFB] space-y-4 ">
                                    <p className="font-medium">{schemeData?.name}</p>

                                    {/* Enhanced CAN Selection */}
                                    <div className="flex items-center relative border border-[#3A3A3A] rounded-md px-2 py-1">
                                        <span className="text-sm font-mono">{selectedCan}</span>
                                        <button
                                            className="ml-2 p-1 rounded hover:bg-[#1F1A1A] transition-colors"
                                            onClick={() => {
                                                setShowCanList(!showCanList)

                                            }}
                                        >
                                            <ChevronDown className="w-6 h-6 text-[#9CA3AF]" />
                                        </button>
                                        {showCanList && (
                                            <div className="absolute  top-8 left-0 z-50 min-w-[600px] bg-[#111111] border border-[#2A2A2A] rounded-lg shadow-lg ">
                                                <div className="p-3 border-b border-[#2A2A2A]">
                                                    <h4 className="font-medium text-[#F9FAFB] text-sm">Select CAN</h4>
                                                </div>
                                                <div className="max-h-60 overflow-auto">
                                                    <table className="w-full text-xs ">
                                                        <thead className="bg-[#1F1A1A]">
                                                            <tr className="border-b border-[#2A2A2A]">
                                                                <th className="py-2 px-3 text-left">Select</th>
                                                                <th className="py-2 px-3 text-left">CAN</th>
                                                                <th className="py-2 px-3 text-left">Primary Holder</th>
                                                                <th className="py-2 px-3 text-left">Tax Status</th>
                                                                <th className="py-2 px-3 text-left">Joint 1</th>
                                                                <th className="py-2 px-3 text-left">Joint 2</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {investorList?.map((inv: any) => (
                                                                <tr key={inv?.id} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                                    <td className="py-2 px-3">
                                                                        <input
                                                                            type="radio"
                                                                            name="can"
                                                                            className="w-4 h-4 text-blue-600"
                                                                            onChange={() => {
                                                                                setSelectedCan(inv?.InvestorAccountHolding[0]?.CAN_Id);
                                                                                setSelectedHolder(inv?.name)
                                                                                setShowCanList(false);
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="py-2 px-3 font-mono text-xs">{inv?.InvestorAccountHolding[0]?.CAN_Id}</td>
                                                                    <td className="py-2 px-3">{inv.name}</td>
                                                                    <td className="py-2 px-3">{TAX_STATUS.find((opt: any) => Number(opt.code) == Number(inv.tax_status))?.label || inv.tax_status}</td>
                                                                    <td className="py-2 px-3">{inv.joint1 || "-"}</td>
                                                                    <td className="py-2 px-3">{inv.joint2 || "-"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Professional Folio Selection */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between border border-[#3A3A3A] rounded-md bg-[#111111]">
                                            <div className="flex items-center flex-1">
                                                {isLoadingFolios ? (
                                                    <span className="flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF]">Loading folios...</span>
                                                ) : folioSelectionMode === 'new' ? (
                                                    <span className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700">{getCurrentFolioDisplay("new")}</span>
                                                ) : (
                                                    <span className="flex items-center gap-2 px-3 py-2 text-sm text-[#F9FAFB]">{selectedFolio?.folio || "Select Folio"}</span>
                                                )}
                                            </div>
                                            <button
                                                className="p-2 rounded hover:bg-[#1F1A1A] transition-colors"
                                                onClick={() => setShowFolioDropdown(!showFolioDropdown)}
                                            >
                                                <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />
                                            </button>
                                        </div>

                                        {showFolioDropdown && (
                                            <div className="dialog absolute top-8 left-0 z-50 w-[500px] bg-[#111111] border border-[#2A2A2A] rounded-lg shadow-lg">
                                                <div className="p-3 border-b border-[#2A2A2A]">
                                                    <h4 className="font-medium text-[#F9FAFB] text-sm">Folio Selection</h4>
                                                </div>


                                                <div className="p-3 border-b bg-[#1F1A1A] border-[#2A2A2A] flex gap-2">
                                                    <button
                                                        onClick={() => handleFolio("New")}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        New Folio
                                                    </button>
                                                    <button
                                                        onClick={() => handleFolio("Existing")}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F1A1A] text-[#E5E7EB] rounded-md hover:bg-[#1F1A1A] transition-colors"
                                                    >
                                                        <List className="w-4 h-4" />
                                                        Select from List
                                                    </button>
                                                </div>

                                                {/* Existing Folios List */}
                                                {folioSelectionMode === 'existing' && (
                                                    <div className="max-h-60 overflow-y-auto bg-[#111111]">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-[#1F1A1A] sticky top-0">
                                                                <tr className="border-b border-[#2A2A2A]">
                                                                    <th className="py-2 px-3 text-left">Select</th>
                                                                    <th className="py-2 px-3 text-left">Folio Number</th>
                                                                    <th className="py-2 px-3 text-left">Primary Holder</th>
                                                                    {/*<th className="py-2 px-3 text-left">Tax Status</th>*/}
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                {folioList.map((opt: any) => (
                                                                    <tr key={opt.folio} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="radio"
                                                                                name="folio"
                                                                                className="w-4 h-4 text-blue-600"
                                                                                onChange={() => handleFolioSelection(opt)}
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3 font-mono text-xs">{opt.folio}</td>
                                                                        <td className="py-2 px-3">{opt.name}</td>

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
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            ✓ KYC Validated
                                        </span>
                                    </p>
                                </div>
                            </div>


                            {["NE", "OT", "RT", "UP"].includes(paymentMode) ?

                                <>
                                    <div className="max-h-64 overflow-y-auto mt-5">
                                        <h2 className="m-3">Bank Lists</h2>

                                        <table className="w-full text-xs ">
                                            <thead className="bg-[#1F1A1A] sticky top-0">
                                                <tr className="border-b border-[#2A2A2A]">
                                                    <td></td>
                                                    <th className="py-2 px-3 text-left">Bank</th>
                                                    <th className="py-2 px-3 text-left">Account Type</th>
                                                    <th className="py-2 px-3 text-left">Account No</th>
                                                    <th className="py-2 px-3 text-left">IFSC</th>
                                                    <th className="py-2 px-3 text-left">MICR</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                {bankList.map((opt: any) => (
                                                    <tr key={opt?.account_no} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                        <td className="py-2 px-3">
                                                            <input
                                                                type="radio"
                                                                name="folio"
                                                                className="w-4 h-4 text-blue-600"
                                                                checked={selectedAccount === opt?.account_no}

                                                                onChange={() => {


                                                                    //setAccType(accountTypeList.find((x: any) => x.id == opt?.account_type)?.value)
                                                                    setAccType(opt?.account_type)
                                                                    setAccNo(opt?.account_no)
                                                                    setIfsc(opt?.ifsc)
                                                                    setMicr(opt?.micr)
                                                                    if (transactionType === "V") {
                                                                        const flteredMandate = mandateList.filter((x: any) => x.acc_no == opt?.account_no)
                                                                    }

                                                                }}

                                                            />
                                                        </td>
                                                        <td className="py-2 px-3 font-mono text-xs">{opt?.BankMaster?.bank_name}</td>
                                                        <td className="py-2 px-3 font-mono text-xs">{opt?.account_type}</td>
                                                        {/* <td className="py-2 px-3">{accountTypeList.find((x: any) => x.id == opt?.account_type)?.value}</td>*/}
                                                        <td className="py-2 px-3">{opt.account_no}</td>
                                                        <td className="py-2 px-3">{opt.ifsc}</td>
                                                        <td className="py-2 px-3">{opt.micr}</td>

                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                </>
                                : <>
                                    {paymentMode == 'DM' &&
                                        < div className="overflow-y-auto mt-5">
                                            <h2 className="m-3">Mandate Lists</h2>
                                            <table className="w-full text-xs ">
                                                <thead className="bg-[#1F1A1A] sticky top-0">
                                                    <tr className="border-b border-[#2A2A2A]">
                                                        <td></td>
                                                        <th className="py-2 px-3 text-left">Account No</th>
                                                        <th className="py-2 px-3 text-left">IFSC</th>
                                                        <th className="py-2 px-3 text-left">Account Type</th>
                                                        <th className="py-2 px-3 text-left">Limit</th>
                                                        <th className="py-2 px-3 text-left">Reference No</th>

                                                        <th className="py-2 px-3 text-left">MICR</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {mandateList.map((opt: any) => (
                                                        <tr key={opt?.id} className="hover:bg-[#1F1A1A] border-b border-[#2A2A2A]">
                                                            <td className="py-2 px-3">
                                                                <input
                                                                    type="radio"
                                                                    name="folio"
                                                                    className="w-4 h-4 text-blue-600"
                                                                    onChange={() => {
                                                                        setAccType(opt?.acc_type)
                                                                        setAccNo(opt?.acc_no)
                                                                        setIfsc(opt?.ifsc)
                                                                        setMicr(opt?.micr)
                                                                        setSelectedMandate(opt?.prn)
                                                                        if (transactionType === "V") {
                                                                            const flteredMandate = mandateList.filter((x: any) => x.acc_no == opt?.acc_no)
                                                                        }

                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="py-2 px-3">{opt.acc_no}</td>
                                                            <td className="py-2 px-3">{opt.ifsc}</td>
                                                            <td className="py-2 px-3">{opt.acc_type}</td>
                                                            <td className="py-2 px-3">{opt.max_amt}</td>
                                                            <td className="py-2 px-3 font-mono text-xs">{opt?.prn}</td>

                                                            <td className="py-2 px-3">{opt.micr}</td>


                                                        </tr>
                                                    ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    }

                                </>


                            }




                        </div>


                        {/* Transaction Details */}
                        <div className="space-y-4">
                            <div>
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
                                <div className="relative w-full">
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


                            {['B', 'V'].includes(transactionType) &&
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Scheme Type:</label>
                                    <div className="flex items-center gap-4">
                                        {['Growth', 'IDCW-P', 'IDCW-R'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value={type}
                                                    checked={selectedSchemeType === type}
                                                    onChange={(e: any) => handleSchemeType(e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-sm text-[#E5E7EB]">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            }

                            {/*['R', 'O'].includes(transactionType) && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                        {transactionType === 'R' ? 'Redeem' : 'Switch'} Type:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {['Amount', 'Unit', 'All Unit'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="switchType"
                                                    value={type}
                                                    onChange={handleRadio}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-sm text-[#E5E7EB]">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )*/}

                            {isSelected && (
                                <div className="space-y-4">
                                    {isDividend && (
                                        <div>
                                            <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Dividend Frequency:</label>
                                            <select className="w-full p-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">Select Frequency</option>
                                                {dividendFrequency.map(freq => (
                                                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Amount field for both Lumpsum and SIP */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-[#E5E7EB]">
                                                {["V", "Y", "J"].includes(transactionType) ? "Installment Amount" : "Amount"}:
                                            </label>
                                            <span className="text-xs italic text-[#9CA3AF]">Min: ₹ {minAmount}</span>
                                        </div>
                                        <CustomInput
                                            value={amount}
                                            placeholder={placeHolder}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) {
                                                    setAmount(val);
                                                }
                                            }} />

                                        {amount !== "" && !isNaN(parseInt(amount, 10)) && (
                                            <p className="text-xs text-[#9CA3AF] mt-1 italic">
                                                {numberToWords(parseInt(amount, 10))}
                                            </p>
                                        )}

                                        {errors.amount && (
                                            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    {["V", "Y", "J"].includes(transactionType) &&
                                        <div className="space-y-4">

                                            <div>
                                                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">SIP Frequency:</label>
                                                <CustomSelect
                                                    items={frequencies}
                                                    bindValue="value"
                                                    bindName="label"
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

                                                        //  CASE 1: "Any Date" → 1–28 days
                                                        if (selectedFreqObj?.freqOpt === "A") {
                                                            dateList = Array.from({ length: 28 }, (_, i) => (i + 1).toString());
                                                        }

                                                        //  CASE 2: Extract dates from sys_date if available
                                                        else if (rawDates.length > 0) {
                                                            dateList = rawDates
                                                                .flatMap((dateStr) => {
                                                                    if (dateStr.includes(";")) {
                                                                        // Fortnightly → e.g. "1,16;5,20"
                                                                        return dateStr.split(";").flatMap((pair: any) => pair.split(","));
                                                                    } else if (dateStr.includes("/")) {
                                                                        // Monthly, Quarterly → e.g. "2/8/15/24"
                                                                        return dateStr.split("/");
                                                                    } else if (dateStr.includes(",")) {
                                                                        // Comma-separated → e.g. "1,5,10,15"
                                                                        return dateStr.split(",");
                                                                    } else {
                                                                        // Single date
                                                                        return [dateStr];
                                                                    }
                                                                })
                                                                .map((d) => d.trim())
                                                                .filter((d, i, arr) => d !== "" && arr.indexOf(d) === i);
                                                        }

                                                        //  CASE 3: Fortnightly fallback → generate pairs like "1,14", "8,21", "15,28"
                                                        if (selectedValue === "F" && dateList.length === 0) {
                                                            const pairs: string[] = ["1,14", "8,21", "15,28", "22,28"];
                                                            dateList = pairs;
                                                        }

                                                        //  CASE 4: Build dropdown-friendly labels
                                                        const formattedDates =
                                                            selectedValue === "F"
                                                                ? [
                                                                    { label: "Select", value: "" },
                                                                    ...dateList.map((pair) => {
                                                                        const [first, second] = pair.split(",").map((d) => d.trim());
                                                                        return {
                                                                            label: `${pair} — SIP on ${first}${getOrdinal(
                                                                                first
                                                                            )} & ${second}${getOrdinal(second)} every month`,
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

                                                        //  Default allowed SIP days if Monthly selected but no dates provided
                                                        if (selectedFrequency == "M" && allowedDays.length == 0) {
                                                            const defaultDays = [1, 5, 10, 15, 20, 25];
                                                            setAllowedSipDays(defaultDays);
                                                        } else {
                                                            setAllowedSipDays(allowedDays);
                                                        }
                                                    }}
                                                />

                                                {/* SIP Dates Allowed Display */}
                                                {allowedSipDays && allowedSipDays.length > 0 && (
                                                    <div className="text-xs text-[#9CA3AF] mt-2 font-normal">
                                                        SIP Dates Allowed : [{allowedSipDays.join(', ')}]
                                                    </div>
                                                )}

                                                <div className="mt-2">
                                                    <label className="text-sm font-medium text-[#E5E7EB]">Start Date :</label>
                                                    <DatePicker
                                                        selected={sipStartDate}
                                                        onChange={(e) => handleDateChange(e, 'Start')}
                                                        filterDate={isDateAvailable}
                                                        minDate={getMinSipDate()}
                                                        placeholderText="Select SIP Start Date"
                                                        className="border rounded border-[#3A3A3A] p-2 w-full focus:border-blue-500 focus:outline-none mt-1"
                                                        dateFormat="dd-MM-yyyy"
                                                    />
                                                </div>

                                                {/* SIP Duration */}
                                                <div className="mt-4">
                                                    <label className="text-sm font-medium text-[#E5E7EB] mb-2 block">SIP Duration :</label>
                                                    <div className="flex items-center gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="sipDuration"
                                                                value="installments"
                                                                checked={selectedDuration === 'installments'}
                                                                onChange={() => setSelectedDuration('installments')}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-sm text-[#E5E7EB]">Enter Instalments</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="sipDuration"
                                                                value="endDate"
                                                                checked={selectedDuration === 'endDate'}
                                                                onChange={() => setSelectedDuration('endDate')}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-sm text-[#E5E7EB]">Enter End Date</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="sipDuration"
                                                                value="maxPeriod"
                                                                checked={selectedDuration === 'maxPeriod' || !selectedDuration}
                                                                onChange={() => setSelectedDuration('maxPeriod')}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-sm text-[#E5E7EB]">Max Period</span>
                                                        </label>
                                                    </div>

                                                    {/* Conditional Display Based on Duration Selection */}
                                                    {selectedDuration === 'installments' && (
                                                        <div className="mt-3">
                                                            <label className="text-sm font-medium text-[#E5E7EB] block mb-1">Number of Instalments :</label>
                                                            <CustomInput
                                                                value={sipInstallment}
                                                                placeholder="Enter number of installments"
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const val = e.target.value;
                                                                    if (/^\d*$/.test(val)) {
                                                                        setSipInstallment(val);
                                                                        // Calculate end date based on installments
                                                                        if (val && sipStartDate && selectedFrequency) {
                                                                            const installments = parseInt(val);
                                                                            const startDate = new Date(sipStartDate);
                                                                            let endDate = new Date(startDate);

                                                                            // Calculate end date based on frequency
                                                                            switch (selectedFrequency) {
                                                                                case 'M': // Monthly
                                                                                    endDate.setMonth(endDate.getMonth() + installments - 1);
                                                                                    break;
                                                                                case 'Q': // Quarterly
                                                                                    endDate.setMonth(endDate.getMonth() + (installments - 1) * 3);
                                                                                    break;
                                                                                case 'W': // Weekly
                                                                                    endDate.setDate(endDate.getDate() + (installments - 1) * 7);
                                                                                    break;
                                                                                case 'F': // Fortnightly
                                                                                    endDate.setDate(endDate.getDate() + (installments - 1) * 14);
                                                                                    break;
                                                                                case 'D': // Daily
                                                                                    endDate.setDate(endDate.getDate() + installments - 1);
                                                                                    break;
                                                                                default:
                                                                                    endDate.setMonth(endDate.getMonth() + installments - 1);
                                                                            }
                                                                            setSipEndDate(endDate);
                                                                            setEndMonth((endDate.getMonth() + 1).toString().padStart(2, '0'));
                                                                            setEndYear(endDate.getFullYear().toString());
                                                                        }
                                                                    }
                                                                }} />
                                                            {sipEndDate && (
                                                                <p className="text-xs text-[#9CA3AF] mt-1">
                                                                    Calculated End Date: {sipEndDate.toLocaleDateString('en-GB')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {selectedDuration === 'endDate' && (
                                                        <div className="mt-3">
                                                            <label className="text-sm font-medium text-[#E5E7EB] block mb-1">Select End Date :</label>
                                                            <DatePicker
                                                                selected={sipEndDate}
                                                                onChange={(date) => {
                                                                    if (date) {
                                                                        setSipEndDate(date);
                                                                        setEndMonth((date.getMonth() + 1).toString().padStart(2, '0'));
                                                                        setEndYear(date.getFullYear().toString());
                                                                    }
                                                                }}
                                                                minDate={sipStartDate || new Date()}
                                                                maxDate={mandateEndDate || undefined}
                                                                placeholderText="Select end date"
                                                                className="border rounded border-[#3A3A3A] p-2 w-full focus:border-blue-500 focus:outline-none"
                                                                dateFormat="dd-MM-yyyy"
                                                            />
                                                        </div>
                                                    )}

                                                    {selectedDuration === 'maxPeriod' && (
                                                        <div className="mt-3">
                                                            <label className="text-sm font-medium text-[#E5E7EB] block mb-1">Max Period (Mandate End Date) :</label>
                                                            {mandateEndDate ? (
                                                                <p className="text-sm text-[#9CA3AF] bg-[#1F1A1A] p-2 rounded border">
                                                                    {mandateEndDate.toLocaleDateString('en-GB')}
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm text-[#9CA3AF] italic">No mandate end date available</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                    }

                                    {isTransact ?
                                        <>
                                            <div className="mt-4">
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
                                                        }
                                                        else if (selectedValue === "IU") {
                                                            setBeneVan("MFSYES" + selectedCan + "@@yesbankltd");
                                                        }
                                                        else {
                                                            setBeneVan("");
                                                        }

                                                        const investorId = investorList[0]?.id;
                                                        if (!investorId) {
                                                            console.error("No investor ID available for bank fetch");
                                                            setBankList([]);
                                                            return;
                                                        }

                                                        const fetchBank = async () => {
                                                            const response = await getBankAccount(investorId);
                                                            const data = response?.data?.data?.data
                                                            setBankList(data)
                                                        }


                                                        fetchBank()
                                                        //handleTransactionType({ target: { value: selectedValue } }); // simulate event
                                                    }}
                                                />

                                            </div>
                                            {/*}*/}
                                            {exeptions.value &&
                                                <div className="text-red-500">{exeptions.message}</div>
                                            }

                                            {transactionError &&
                                                <div className="text-red-500">{transactionError}</div>
                                            }


                                            <div className="flex gap-3 pt-4">
                                                <CustomButton onClick={handleTransact}>{isLoading ? <><Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-[#3A3A3A]' />  wait...</> : 'Order Now'}
                                                </CustomButton>
                                                <CustomButton className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F9FAFB]" onClick={() => setIsTransact(false)}>Cancel</CustomButton>

                                            </div>
                                        </>
                                        :
                                        <>
                                            {isCartAdded &&
                                                <>
                                                    <div className="text-green-500 text-sm flex items-center">
                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" /> <span className="ml-3">{orderOptions.find(opt => opt.value === transactionType)?.label} added to cart sucessfully</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CustomButton className="bg-[#3A3A3A] hover:bg-[#4A4A4A] " onClick={() => setIsTransact(false)}>Cancel</CustomButton>

                                                        <CustomButton onClick={(e) => {
                                                            window.location.href = '/my-cart'
                                                        }}>Go to cart</CustomButton>
                                                    </div>
                                                </>


                                            }
                                            {!isCartAdded &&
                                                <div className="flex gap-3 pt-4">
                                                    <CustomButton className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#000000]" onClick={addToCart}> Add to Cart</CustomButton>
                                                    <CustomButton onClick={(e) => {
                                                        setIsTransact(true)
                                                    }}>Transact Now</CustomButton>

                                                </div>
                                            }
                                        </>

                                    }



                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </div >
            {/* </dialog >*/}

        </>
    );
};

export default OrderPopup;
