import { use, useEffect, useRef, useState, useContext } from "react";
import { ArrowLeft, Pencil, ChevronDown, Plus, List, CheckCircleIcon } from "lucide-react";
import CustomSelect from "@/commonUI/Select";
import { viewCanDetails, generateReference, ApiFinTechNormalTxnService, searchByAmcId, searchByISIN, searchByCanIdmfuBankDetails, ApiFinTechSystematicTxnService, submitMfuTransaction } from "@/api/transaction";
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

const OrderPopup: React.FC<InvestorPopupProps> = ({
    modalId = "OrderModel",
    schemeData,
    investor,
    investorList,
    sipData,
    source,
    open,
    onClose,
}) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    const [transactionType, setTransactionType] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [isDividend, setIsDividend] = useState(false);


    const [selectedCan, setSelectedCan] = useState<any>(investor?.InvestorAccountHolding[0]?.CAN_Id);
    const [selectedHolder, setSelectedHolder] = useState<any>(investor?.name);
    const [selectedFolio, setSelectedFolio] = useState<any>(null);
    const [showCanList, setShowCanList] = useState(false);
    const [showFolioDropdown, setShowFolioDropdown] = useState(false);
    const [folioSelectionMode, setFolioSelectionMode] = useState<'existing' | 'new'>('existing');
    const [newFolioNumber, setNewFolioNumber] = useState('');

    const [data, setData] = useState<any[]>([]);
    const [frequencies, setFrequencies] = useState<string[]>([]);
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
    const [amount, setAmount] = useState("");
    const [investorData, setInvestorData] = useState<any[]>([]);
    const [targetScheme, setTargetScheme] = useState<any[]>([])
    const [selectedTargetScheme, setSelectedTargetScheme] = useState("")

    const [isTransact, setIsTransact] = useState(false);
    const [paymentMode, setPaymentMode] = useState('')
    const [accNo, setAccNo] = useState('')
    const [accType, setAccType] = useState('')
    const [ifsc, setIfsc] = useState('')
    const [micr, setMicr] = useState('')
    const [mandateRefNo, setMandateRefNo] = useState('')
    const [bankList, setBankList] = useState<any[]>([])
    const [placeHolder, setPlaceHolder] = useState('Amount');
    const [orderOptions, setOrderOptions] = useState<any[]>([])
    const [txnVolType, setTxnVolType] = useState("")
    const [vol, setVol] = useState("");
    const [isCartAdded, setIsCartAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const [errors, setErrors] = useState({
        date: "",
        month: "",
        year: "",
        amount: ""
    });

    const [exeptions, setExceptions] = useState({
        value: false,
        message: ""
    })

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => {
        const year = currentYear + i;
        return { label: year.toString(), value: year.toString() };
    });


    const { setCartCounter, cartCounter } = useContext<any>(AccountContext);




    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParts = window.location.pathname.split('/');
            const lastSegment = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
            console.log("Last part of URL:", lastSegment);
            if (lastSegment === 'fund-explore') {
                const filteredOptions = orderTypes.filter(
                    opt => !["STP", "SWP", "Switch", "Redeem"].includes(opt.label)
                );
                setOrderOptions(filteredOptions)
            } else {
                setOrderOptions(orderTypes)
            }

        }
    }, []);

    useEffect(() => {
        if (open) modalRef.current?.showModal();
        else modalRef.current?.close();
    }, [open]);

    useEffect(() => {
        console.log(sipData)

        if (source === "Cart") {
            console.log("Source :-", source)
        }

    },)


    /*useEffect(() => {
        console.log(investor)
        const fetchByCan = async () => {
            try {
                const response = await viewCanDetails(investor?.can_id);
                const records = response?.data?.data?.data || [];
                setInvestorData(records)

            } catch (error) {
                console.log('Error fetching CAN data:', error);
            }
        };

        fetchByCan();
    }, [investor?.can_id]);*/

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
                console.log(userData, "userDatauserData");
                console.log(schemeData)
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

    const handleRadio = (e: any) => {
        const value = e?.target?.value;
        if (transactionType === 'R' || transactionType === 'O') {
            if (value === "Amount" || value === "Unit") {
                setPlaceHolder("Enter " + value)
                setIsSelected(true);
            } else {
                setIsSelected(true);
            }

        } else {
            setIsSelected(true);
            setIsDividend(value.includes("Dividend"));
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

    const handleTransactionType = async (e: any) => {


        const selectedValue = e?.target?.value;

        // Filter data based on selected value
        const txnData = sipData.filter((item: any) => item.txn_type === selectedValue);
        const firstTxn = txnData[0] || {};

        // Update dependent state values
        setRtaAmcCode(firstTxn.fund_code || '');
        setRtaSchCode(firstTxn.scheme_code || '');
        setDivOpt(firstTxn.div_opt || '');
        setMinAmount(firstTxn.min_amt || '');
        setData(txnData);
        setTransactionType(selectedValue); // set this early

        // Frequency list based on SIP,STP and SWP
        if (selectedValue === 'Y' || selectedValue === 'V' || selectedValue === 'J') {

            const freqList = txnData
                .filter((item: any) => item.txn_type === selectedValue && item.sys_freq)
                .map((item: any) => item.sys_freq)
                .filter((value: any, index: any, self: any) => self.indexOf(value) === index)
                .map((freq: string) => ({
                    label: freqMap[freq] || freq,
                    value: freq,
                }));

            setFrequencies(freqList);
            setSelectedFreq(freqList[0] || '');

            console.log("Transaction Type:", selectedValue, schemeData?.amc_id);
            console.log("Frequencies:", freqList);
        } else {

        }

        // Handle STP case
        if (selectedValue === "Y" || selectedValue === "O") {
            try {
                const response = await searchByAmcId(schemeData?.amc_id);
                const records = response?.data?.data?.data || [];
                setTargetScheme(records);
                console.log('STP DATA', records);

            } catch (error) {
                console.log('Error fetching STP data:', error);
            }
        } else {
            setTargetScheme([]); // Reset if not STP
        }
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
        if (paymentMode.length == 0) {
            setExceptions({ value: true, message: 'Please select Payment Method?' })
            setIsLoading(false)
            return
        }
        if (!hasError) {

            console.log("Investor Data :- ", investorData)
            console.log(transactionType)
            const option = dividendOptions.find(opt => opt.description === divOpt);
            const txnType = arrTransactionType.find(t => t.value === transactionType)
            setTxnVolType(txnType?.txnVolTyp ?? "");
            const refNo = await generateReference("");

            const transaction: TransactionData = {
                txnType: transactionType,
                entGroupRefNo: refNo?.data?.data?.reference ?? "",
                can: selectedCan,
                totAmt: amount,
                schList: [
                    {
                        entUnqItrn: "20240627701",
                        mfuUtrn: "",
                        rtaAmcCode: rtaAmcCode,
                        rtaSchCode: rtaSchCode,
                        outRtaSchCode: outRtaSchCode,
                        folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
                        divOpt: option?.code?.toString() ?? "",
                        txnVolTyp: txnType?.txnVolTyp ?? "",
                        vol: txnType?.vol ?? "",
                        payOutFlag: "",
                        payOutDtl: {
                            invAccNo: "",
                            micr: "",
                            ifsc: ""
                        },
                        priOtpFlag: "",
                        priMob: "",
                        priEmail: ""
                    }
                ],
                paySecFlag: 'Y',
                paySec: {
                    payMode: paymentMode,
                    micr: micr,
                    ifsc: ifsc,
                    accType: accType,
                    accNo: accNo,
                    payDate: new Date().toISOString().slice(0, 10),
                    payAmt: amount?.toString(),
                    beneVan: "",
                    paymentRefNo: "",
                    paymentBankRefNo: "",
                    mandateRefNo: "",
                    paymentConfirmTs: "",
                    amcPaymentTs: ""
                }
            };

            try {


                const response = await executeMfuTransaction(transaction, 81, schemeData.schemeISIN);


                const result = JSON.parse(response?.data?.data);
                console.log(result)
                const appLink = result?.respBody?.ordDtl?.appLinkPri;

                if (appLink) {
                    window.location.href = appLink;
                } else {
                    toast.error("")
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
    return (
        <>
            <dialog ref={modalRef} className="modal" id={modalId}>
                <div className="modal-box max-w-6xl w-full  rounded-xl">
                    <ArrowLeft className="w-5 h-5 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors" onClick={onClose} />

                    <div className="text-center pb-4 mb-0">
                        <h3 className="font-semibold text-lg text-gray-900">Order Application Form</h3>
                    </div>

                    {/*<div className="flex justify-between items-start gap-8">*/}
                    <div className="grid grid-cols-2 gap-4 overflow-auto border-2 rounded-lg p-4 border-gray-400">
                        {/* Info Block */}
                        <div className="ml-5 ">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-gray-600 font-medium space-y-4">
                                    <p>Scheme</p>
                                    <p>CAN</p>
                                    <p>Folio</p>
                                    <p>First Holder</p>
                                    <p>KYC Status</p>
                                </div>
                                <div className="text-gray-800 space-y-4 ">
                                    <p className="font-medium">{schemeData?.ms_fullname}</p>

                                    {/* Enhanced CAN Selection */}
                                    <div className="flex items-center relative">
                                        <span className="text-sm font-mono">{selectedCan}</span>
                                        <button
                                            className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                                            onClick={() => {
                                                setShowCanList(!showCanList)

                                            }}
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
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
                                    <div className="relative">
                                        <div className="flex items-center justify-between">
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
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>

                                        {showFolioDropdown && (
                                            <div className="absolute top-8 left-0 z-50 w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg">
                                                <div className="p-3 border-b border-gray-100">
                                                    <h4 className="font-medium text-gray-900 text-sm">Folio Selection</h4>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="p-3 border-b border-gray-100 flex gap-2">
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
                                                    <div className="max-h-60 overflow-y-auto">
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

                                                                {investorData.map((opt: any) => (
                                                                    <tr key={opt.folio_no} className="hover:bg-gray-50 border-b border-gray-100">
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="radio"
                                                                                name="folio"
                                                                                className="w-4 h-4 text-blue-600"
                                                                                onChange={() => handleFolioSelection(opt)}
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3 font-mono text-xs">{opt.folio_no}</td>
                                                                        <td className="py-2 px-3">{opt.first_applicant}</td>
                                                                        <td className="py-2 px-3">
                                                                            <span className={`px-2 py-1 rounded-full text-xs ${opt.investory_category === 'Individual'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-orange-100 text-orange-800'
                                                                                }`}>
                                                                                {opt.investory_category}
                                                                            </span>
                                                                        </td>
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

                            {(paymentMode === 'NE' || paymentMode === 'OT' || paymentMode === 'RT') && bankList &&
                                <div className="max-h-64 overflow-y-auto mt-5">

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
                                                            onChange={() => {
                                                                setAccType(accountTypeList.find((x: any) => x.id == opt?.account_type)?.value)
                                                                setAccNo(opt?.account_no)
                                                                setIfsc(opt?.ifsc)
                                                                setMicr(opt?.micr)
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-xs">{opt?.BankMaster?.bank_name}</td>
                                                    <td className="py-2 px-3">{accountTypeList.find((x: any) => x.id == opt?.account_type)?.value}</td>
                                                    <td className="py-2 px-3">{opt.account_no}</td>
                                                    <td className="py-2 px-3">{opt.ifsc}</td>
                                                    <td className="py-2 px-3">{opt.micr}</td>

                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 space-y-4 max-w-[400px]">
                            <div className="mt-2">
                                <CustomSelect
                                    items={orderOptions}
                                    bindValue="value"
                                    bindName="label"
                                    label="Transaction Type:"
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
                                <div className="mt-2 relative z-20 w-full">
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


                            {transactionType !== 'R' &&

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 ">Scheme Type:</label>
                                    <div className="flex items-center gap-2">
                                        {['Growth', 'IDCW-P', 'IDCW-R'].map(type => (
                                            <label key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value={type}
                                                    onChange={handleRadio}
                                                    className="w-4 h-4 text-blue-600 items-center"
                                                />
                                                <span className="text-sm">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            }

                            {['R', 'O'].includes(transactionType) &&
                                <div>
                                    <label className="block text-xs font-semibold font-medium text-gray-700 mb-2">{transactionType === 'R' ? 'Redeem' : 'Switch'} Type:</label>
                                    <div className="flex items-center gap-2">
                                        {['Amount', 'Unit', 'All Unit'].map(type => (
                                            <div key={type} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value={type}
                                                    onChange={handleRadio}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{type}</span>
                                            </div>

                                        ))}
                                    </div>
                                </div>


                            }


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
                                        <div className="flex items-center gap-2">
                                            <div>
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

                                                        setSelectedFrequency(selectedValue);
                                                        const rawDates = data
                                                            .filter(
                                                                (item) =>
                                                                    item.txn_type === transactionType &&
                                                                    item.sys_freq === selectedValue &&
                                                                    item.sys_date?.trim() !== ''
                                                            )
                                                            .map((item) => item.sys_date.trim())
                                                            .filter((value, index, self) => self.indexOf(value) === index);

                                                        const dateList = rawDates
                                                            .flatMap((dateStr) => dateStr.split('/'))
                                                            .map((d) => d.trim())
                                                            .filter((d, i, arr) => d !== '' && arr.indexOf(d) === i);

                                                        const formattedDates = [
                                                            { label: "Select", value: "" },
                                                            ...dateList.map((date) => ({
                                                                label: `${date}`,
                                                                value: date
                                                            }))
                                                        ];


                                                        console.log(formattedDates)
                                                        setAvailableDates(formattedDates);
                                                    }}
                                                />


                                            </div>
                                            <div>
                                                <CustomSelect
                                                    items={availableDates}
                                                    bindValue="label"
                                                    bindName="label"
                                                    label={"SIP Dates"}
                                                    className="mt-2"
                                                    onChange={(event) => {
                                                        const selectedValue = event.target.value;
                                                        setSipDate(selectedValue)
                                                    }

                                                    }
                                                />
                                            </div>

                                            <div>
                                                <CustomSelect
                                                    items={months}
                                                    bindValue="value"
                                                    bindName="label"
                                                    label={"SIP Month"}
                                                    className="mt-2"
                                                    onChange={(event) => {
                                                        const selectedValue = event.target.value;
                                                        setSipMonth(selectedValue)
                                                    }

                                                    }
                                                />
                                            </div>
                                            <div>
                                                <CustomSelect
                                                    items={years}
                                                    bindValue="value"
                                                    bindName="label"
                                                    label={"SIP Year"}
                                                    className="mt-2"
                                                    onChange={(event) => {
                                                        const selectedValue = event.target.value;
                                                        setSipYear(selectedValue)
                                                    }

                                                    }
                                                />
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

                                    </div>
                                    {isTransact ?
                                        <>
                                            {transactionType !== 'R' &&
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

                                                            const fetchBank = async () => {
                                                                const response = await getBankAccount(investor.id);
                                                                const data = response?.data?.data?.data
                                                                console.log("bankList :- ", response?.data?.data?.data);
                                                                setBankList(data)
                                                            }

                                                            fetchBank()
                                                            //handleTransactionType({ target: { value: selectedValue } }); // simulate event
                                                        }}
                                                    />

                                                </div>
                                            }
                                            {exeptions.value &&
                                                <div className="text-red-500">{exeptions.message}</div>
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
            </dialog >
        </>
    );
};

export default OrderPopup;