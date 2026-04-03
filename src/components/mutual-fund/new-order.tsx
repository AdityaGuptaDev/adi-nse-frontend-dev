import { use, useEffect, useRef, useState, useContext, useMemo } from "react";
import { ArrowLeft, Pencil, ChevronDown, Plus, List, CheckCircleIcon } from "lucide-react";
import CustomSelect from "@/commonUI/Select";
import { viewCanDetails, generateReference, ApiFinTechNormalTxnService, searchByAmcId, searchByISIN, searchByCanIdmfuBankDetails, ApiFinTechSystematicTxnService, submitMfuTransaction, fetchClientIp, getMandates, getInvestorPortfolio, getSchemeByName } from "@/api/transaction";
import { transactionPayloadTemplate } from '@/utils/mfu/mfuTransactionTemplate'
import { cookieStorageKeys } from "@/services/cookieStorageService";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { TransactionManager, Schemes } from "@/utils/mfu/mfuTransactionManager";
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
import "react-datepicker/dist/react-datepicker.css";
import { generateUniqueId } from "@/utils/mfu/generateUtrn";
import { set } from "date-fns";
import { getPayOutSec, getPaySec, getSchList, getSubSeqSec, getSysSchList } from "./transaction";
import { get } from "http";


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
    const [selectedFolio, setSelectedFolio] = useState<any>(schemeData?.out_folio_no ?? null);
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
        const fetch = async (targetScheme: any) => {
            const response = await getInvestorPortfolio(targetScheme);
            console.log("Investor Portfolio Response :- ", response)
            setInvestorPortfolio(response?.data?.data?.data || []);
        }
        fetch(investorList[0]?.id);

        const fetchSchemeByName = async (schemeName: any) => {
            const response = await getSchemeByName(schemeName);
            console.log("Scheme By Name Response :- ", response)
            setFinalScheme(response?.data?.data?.data || []);

        }
        fetchSchemeByName(schemeData?.name)

    }, [])


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
        // console.log("Investor List in Order Popup:", investorList);
        if (investorList.length === 0) {
            router.push('/fund-explore');
        }
    }, [])


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
                console.log("Submitting:", { sipDate, sipMonth, sipYear, amount });

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
                    day: sipDate.length > 1 ? sipDate : "0" + sipDate,
                    start_month: sipMonth.length > 1 ? sipMonth : "0" + sipMonth,
                    start_year: sipYear,
                    end_month: "10",
                    end_year: "2026",
                    rta_amc_code: rtaAmcCode,
                    rta_sch_code: rtaSchCode,
                    out_rta_sch_code: outRtaSchCode,
                    tx_vol_type: txnVolType,
                    vol: vol,
                };
                console.log("Cart Object :- ", CartObj)
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

    const handleFolioSelection = (folio: any) => {
        setAccType(folio?.ac_type.trim())
        setAccNo(folio?.ac_no)
        setIfsc(folio?.ifsc)
        setMicr(folio?.micr)
        setSelectedFolio(folio);
        setShowFolioDropdown(false);
        setFolioSelectionMode('existing');
    };

    const handleFolio = async (folioType: any) => {
        if (folioType === "New") {
            setFolioSelectionMode('new');
            setShowFolioDropdown(false);
            setSelectedFolio(null);
            const response = await searchByCanIdmfuBankDetails(selectedCan?.value);
            //console.log("Response :-", response)
            const result = response?.data?.data?.data;

            console.log(result);
            setBankList(result);
        } else {

            setFolioSelectionMode('existing');
        }
    };

    const getCurrentFolioDisplay = () => {

        if (folioSelectionMode === 'new') {
            return newFolioNumber || 'Enter new folio number';
        }
        return selectedFolio?.folio_no || "NEW";

    };


    const getSelectedScheme = async (selectedValue: any) => {
        setIsSelected(true)
        const txnData = sipData.filter((item: any) => item.txn_type === selectedValue);
        console.log("Filtered Transaction Data:", txnData);

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

            console.log(investorList, "Investor Id for mandate")

            const response = await getMandates(investorList[0]?.id);

            //setErrors()
            if (response.data?.data?.data.length <= 0) {
                setCommonError("Create mandate for SIP")
            } else {
                const mandateList = response.data?.data?.data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");

                setMandateList(mandateList)
            }

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

            console.log("FREQ LIST", freqList);
            setFrequencies(freqList);


            setFrequencies(freqList);

        } else {
            const response = await getMandates(investorList[0]?.id);

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
                console.log('Error fetching STP data:', error);
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
        const newErrors = {
            date: "",
            month: "",
            year: "",
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

            console.log("Investor Data :- ", investorData)
            console.log(transactionType)
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
                console.log("rtaSchCode=", rtaSchCode)

                payOutFlag = ""
                payOutDtl = getPayOutSec(transactionType, "", "", accType, "")
                schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, payOutFlag, payOutDtl, txnType?.txnVolTyp ?? "")

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

                sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, selectedFrequency, sipDate, sipMonth, sipYear, endMonth, endYear, payOutDtl, txnType)

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
                console.log("Transaction Payload :- ", transaction)


                const response = await executeMfuTransaction(transaction, 2, schemeData?.schemeISIN);
                console.log("Response :- ", response)


                const result = JSON.parse(response?.data?.data);
                console.log(result)
                const appLink = result?.respBody?.ordDtl?.appLinkPri;

                if (appLink) {
                    clearData();
                    //window.location.href = appLink;
                    window.open(appLink, '_blank');
                } else {
                    toast.error(JSON.stringify(result?.respBody))
                    setTransactionError(JSON.stringify(result?.respBody))
                    alert("Transaction submitted, but no payment link returned.");
                }

                console.log("Transaction result:", result);
            } catch (err: any) {
                setIsLoading(false)
                console.log("My error", err)
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
        const response = await searchByISIN(targetScheme);
        // const records = JSON.parse(response?.data?.data?.data);
        console.log("mfuSchemeCode ", response?.data?.data?.data[0])
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

        console.log({ day, month, year });
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


        getSelectedScheme(transactionType)
        return true;
    }

    return (
        <>
            {/*<dialog ref={modalRef} className="modal" id={modalId}>*/}
            <div className="p-6 ">
                <div className="w-full rounded-xl">
                    {/* Sticky header */}
                    <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <ArrowLeft
                                    className="w-5 h-5 cursor-pointer text-gray-600 hover:text-gray-800"
                                    onClick={handleBackClick}
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Order Application Form
                                    </h3>
                                    <p className="text-xs text-gray-500">Complete your purchase</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* quick scheme snapshot if available */}
                                <div className="hidden sm:flex items-center gap-3">
                                    {/*<img src="/axis-logo.png" alt="AMC" className="h-8 w-auto" />*/}
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-800">
                                            {schemeData?.name}
                                        </div>
                                        {/* <div className="text-xs text-gray-500">Large Cap · Equity</div>*/}
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
                                <div className="text-gray-600 font-medium space-y-6">

                                    <p>Scheme</p>
                                    <p>CAN</p>
                                    <p>Folio</p>
                                    <p>First Holder</p>
                                    <p>KYC Status</p>
                                </div>
                                <div className="text-gray-800 space-y-4 ">
                                    <p className="font-medium">{schemeData?.name}</p>

                                    {/* Enhanced CAN Selection */}
                                    <div className="flex items-center relative border border-gray-300 rounded-md px-2 py-1">
                                        <span className="text-sm font-mono">{selectedCan}</span>
                                        <button
                                            className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                                            onClick={() => {
                                                setShowCanList(!showCanList)

                                            }}
                                        >
                                            <ChevronDown className="w-6 h-6 text-gray-500" />
                                        </button>
                                        {showCanList && (
                                            <div className="absolute  top-8 left-0 z-50 min-w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg ">
                                                <div className="p-3 border-b border-gray-100">
                                                    <h4 className="font-medium text-gray-900 text-sm">Select CAN</h4>
                                                </div>
                                                <div className="max-h-60 overflow-auto">
                                                    <table className="w-full text-xs ">
                                                        <thead className="bg-gray-50">
                                                            <tr className="border-b border-gray-200">
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
                                                                <tr key={inv?.id} className="hover:bg-gray-50 border-b border-gray-100">
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
                                    <div className="relative ">
                                        <div className="flex items-center justify-between border border-gray-300 rounded-md">
                                            <div className="flex items-center flex-1">
                                                {folioSelectionMode === 'new' ? (
                                                    <>
                                                        <label className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">NEW</label>
                                                    </>
                                                ) : (

                                                    <span className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">{getCurrentFolioDisplay()}</span>
                                                )}
                                            </div>
                                            <button
                                                className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                                                onClick={() => setShowFolioDropdown(!showFolioDropdown)}
                                            >
                                                <ChevronDown className="w-6 h-6 text-gray-500" />
                                            </button>
                                        </div>

                                        {showFolioDropdown && (
                                            <div className="dialog absolute top-8 left-0 z-50 w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg">
                                                <div className="p-3 border-b border-gray-100">
                                                    <h4 className="font-medium text-gray-900 text-sm">Folio Selection</h4>
                                                </div>


                                                <div className="p-3 border-b bg-gray-100 border-gray-100 flex gap-2">
                                                    <button
                                                        onClick={() => handleFolio("New")}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        New Folio
                                                    </button>
                                                    <button
                                                        onClick={() => handleFolio("Existing")}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                                    >
                                                        <List className="w-4 h-4" />
                                                        Select from List
                                                    </button>
                                                </div>

                                                {/* Existing Folios List */}
                                                {folioSelectionMode === 'existing' && (
                                                    <div className="max-h-60 overflow-y-auto bg-red-50">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-gray-50 sticky top-0">
                                                                <tr className="border-b border-gray-200">
                                                                    <th className="py-2 px-3 text-left">Select</th>
                                                                    <th className="py-2 px-3 text-left">Folio Number</th>
                                                                    <th className="py-2 px-3 text-left">Primary Holder</th>
                                                                    <th className="py-2 px-3 text-left">Tax Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                {investorPortfolio.map((opt: any) => (
                                                                    <tr key={opt.folio_no} className="hover:bg-gray-50 border-b border-gray-100">
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="radio"
                                                                                name="folio"
                                                                                className="w-4 h-4 text-blue-600"
                                                                                onChange={() => handleFolioSelection(opt)}
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3 font-mono text-xs">{opt.folio_number}</td>

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
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr className="border-b border-gray-200">
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
                                                    <tr key={opt?.account_no} className="hover:bg-gray-50 border-b border-gray-100">
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
                                                                        console.log("Mandate Lists=====:", mandateList)
                                                                        const flteredMandate = mandateList.filter((x: any) => x.acc_no == opt?.account_no)
                                                                        //setSelectedMandate(flteredMandate[2]);
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
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr className="border-b border-gray-200">
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
                                                        <tr key={opt?.id} className="hover:bg-gray-50 border-b border-gray-100">
                                                            <td className="py-2 px-3">
                                                                <input
                                                                    type="radio"
                                                                    name="folio"
                                                                    className="w-4 h-4 text-blue-600"
                                                                    onChange={() => {
                                                                        // setAccType(accountTypeList.find((x: any) => x.id == opt?.acc_type)?.value)
                                                                        //console.log("Account Type Selected::::", accountTypeList.find((x: any) => x.id == opt?.acc_type)?.value)
                                                                        console.log(mandateList)
                                                                        setAccType(opt?.acc_type)
                                                                        setAccNo(opt?.acc_no)
                                                                        setIfsc(opt?.ifsc)
                                                                        setMicr(opt?.micr)
                                                                        setSelectedMandate(opt?.prn)
                                                                        console.log(opt?.prn)
                                                                        //setEndMonth(opt?.mandate_end_month)
                                                                        //setEndYear(opt?.mandate_end_year)
                                                                        console.log("Mandate Selected::::", opt?.end_date.split("-")[1], opt?.end_date.split("-")[0])
                                                                        // setEndMonth(opt?.end_date.split("-")[1])
                                                                        //setEndYear((opt?.end_date.split("-")[0]-1))
                                                                        // setEndYear((parseInt(opt?.end_date.split("-")[0]) - 1).toString())
                                                                        if (transactionType === "V") {
                                                                            console.log("Mandate Lists=====:", mandateList)
                                                                            const flteredMandate = mandateList.filter((x: any) => x.acc_no == opt?.acc_no)
                                                                            //setSelectedMandate(flteredMandate[2]);
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
                        <div className="space-y-4 ">
                            <div className="mt-2">
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
                                        //handleReset(selectedValue)
                                    }}
                                />

                            </div>

                            {["Y", "O"].includes(transactionType) && (
                                <div className="mt-2 relative  w-full">
                                    <CustomReactSelect
                                        items={targetScheme}
                                        bindValue="schemeISIN"
                                        bindName="ms_fullname"
                                        label="Target Scheme:"
                                        value={selectedTargetScheme}
                                        className="w-full"
                                        onChange={(selectedOption: any) => {
                                            console.log("Target Scheme", selectedOption?.schemeISIN)
                                            setSelectedTargetScheme(selectedOption?.schemeISIN || "");
                                            handleSelectedTargetScheme(selectedOption?.schemeISIN);

                                        }}
                                        isClearable
                                        placeholder="Select or type scheme"

                                    />
                                </div>
                            )}


                            {['B', 'V'].includes(transactionType) &&

                                <div>

                                    <label className="block text-xs font-semibold text-gray-700 mb-2 ">Scheme Type:</label>
                                    <div className="flex items-center gap-2">
                                        {['Growth', 'IDCW-P', 'IDCW-R'].map(type => (
                                            <label key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value={type}
                                                    //disabled={commonError.length > 0 ? true : false}

                                                    checked={selectedSchemeType === type}
                                                    onChange={(e: any) => handleSchemeType(e.target.value)}
                                                    className="w-4 h-4 text-blue-600 items-center"
                                                />
                                                <span className="text-sm">{type}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {commonError.length > 0 &&
                                        <div className="text-sm text-red-500 mt-6">
                                            No mandate found —{" "}
                                            <Link
                                                href="/account-holding"
                                                style={{ color: "#007bff", textDecoration: "none" }}
                                            >
                                                click here to create SIP mandate
                                            </Link>
                                            .
                                        </div>
                                    }
                                </div>

                            }

                            {/*['R', 'O'].includes(transactionType) &&
                                <div>
                                    <label className="block text-xs font-semibold font-medium text-gray-700 mb-2">{transactionType === 'R' ? 'Redeem' : 'Switch'} Type:</label>
                                    <div className="flex items-center gap-2">
                                        {['Amount', 'Unit', 'All Unit'].map(type => (
                                            <div key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="switchType"
                                                    value={type}
                                                    onChange={handleRadio}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{type}</span>
                                            </div>

                                        ))}
                                    </div>

                                </div>


                            */}


                            {isSelected && (
                                <div className="space-y-4">
                                    {isDividend && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Dividend Frequency:</label>
                                            <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">Select Frequency</option>
                                                {dividendFrequency.map(freq => (
                                                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {["V", "Y", "J"].includes(transactionType) &&
                                        <div >
                                            <div className="flex items-center gap-2">
                                                {/* <label className="block text-sm font-medium text-gray-700 mb-2">Select Frequency:</label>*/}

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

                                                        console.log(
                                                            "Selected Frequency:",
                                                            selectedValue,
                                                            "Option:",
                                                            selectedFreqObj?.freqOpt
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

                                                        /*if (selectedValue === "W") {
                                                            const days: number[] = [];
                                                            for (let weekStart = 1; weekStart <= 28; weekStart += 7) {
                                                                for (let i = 0; i < 5; i++) {
                                                                    const day = weekStart + i;
                                                                    if (day <= 31) days.push(day);
                                                                }
                                                            }
                                                            dateList = days.map((d) => d.toString());
                                                        }*/

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

                                                        console.log("Formatted Dates:", formattedDates);
                                                        setAvailableDates(formattedDates);

                                                        console.log("====================", selectedFrequency, allowedDays);

                                                        //  Default allowed SIP days if Monthly selected but no dates provided
                                                        if (selectedFrequency == "M" && allowedDays.length == 0) {
                                                            const defaultDays = [1, 5, 10, 15, 20, 25];
                                                            setAllowedSipDays(defaultDays);
                                                        } else {
                                                            setAllowedSipDays(allowedDays);
                                                        }
                                                    }}
                                                />


                                                <div>
                                                    <label className="text-xs font-bold ">SIP Start Date</label>
                                                    <DatePicker
                                                        selected={sipStartDate}
                                                        onChange={(e) => handleDateChange(e, 'Start')}
                                                        filterDate={isDateAvailable}
                                                        minDate={getMinSipDate()}
                                                        placeholderText="Select SIP Start Date"
                                                        className="border rounded border-gray-300 p-1.5 w-60 focus:border-gray-500 focus:outline-none"
                                                        dateFormat="dd/MM/yyyy"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold ">SIP End Date</label>
                                                    <DatePicker
                                                        selected={sipEndDate}
                                                        onChange={(e) => handleDateChange(e, 'End')}
                                                        maxDate={mandateEndDate || undefined}
                                                        placeholderText="Select SIP End Date"
                                                        className="border rounded border-gray-300 p-1.5 w-60 focus:border-gray-500 focus:outline-none"
                                                        dateFormat="dd/MM/yyyy"
                                                    />
                                                </div>

                                            </div>
                                        </div>

                                    }


                                    <div>
                                        <CustomInput
                                            label="Amount :"
                                            value={amount}
                                            placeholder={placeHolder}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) {
                                                    setAmount(val);
                                                }
                                            }} />


                                        {amount !== "" && !isNaN(parseInt(amount, 10)) && (
                                            <label className="block text-xs font-medium text-gray-700 mt-2">
                                                {numberToWords(parseInt(amount, 10))}
                                            </label>
                                        )}

                                        <div className="flex items-center justify-between">

                                            {errors.amount && (
                                                <span className="text-red-500 text-xs">{errors.amount}</span>
                                            )}
                                        </div>

                                        <p className="text-sm">Min. Amount <span className="text-red-500">{minAmount}</span></p>

                                    </div>
                                    {isTransact ?
                                        <>
                                            {/*transactionType !== 'R' &&*/}
                                            < div className="mt-2">
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


                                                        const fetchBank = async () => {
                                                            const response = await getBankAccount(investorList[0].id);
                                                            const data = response?.data?.data?.data
                                                            console.log("bankList :- ", response?.data?.data?.data);
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
                                                <CustomButton onClick={handleTransact}>{isLoading ? <><Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-gray-300' />  wait...</> : 'Order Now'}
                                                </CustomButton>
                                                <CustomButton className="bg-gray-300 hover:bg-gray-400 text-black" onClick={() => setIsTransact(false)}>Cancel</CustomButton>

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
                                                        <CustomButton className="bg-gray-500 hover:bg-gray-600 " onClick={() => setIsTransact(false)}>Cancel</CustomButton>

                                                        <CustomButton onClick={(e) => {
                                                            window.location.href = 'my-cart'
                                                        }}>Go to cart</CustomButton>
                                                    </div>
                                                </>


                                            }
                                            {!isCartAdded &&
                                                <div className="flex gap-3 pt-4">
                                                    <CustomButton className="bg-gray-300 hover:bg-gray-400 text-[#000000]" onClick={addToCart}> Add to Cart</CustomButton>
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
