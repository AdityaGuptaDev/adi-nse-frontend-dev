"use client";

import React, { useRef, useState, useContext, useEffect } from "react";
import MyCartSync from "./(components)/my-cart-sync";
import TransactionCard from "./(components)/transactionCard";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomLabel from "@/commonUI/Label";
import CustomButton from "@/commonUI/Button";
import Dialog from "@/commonUI/Dialog";
import AccountContext from "@/context/AccountContext/Account.context";
import { generateReference, searchByISIN, ApiFinTechNormalTxnService, getMandates, fetchClientIp } from "@/api/transaction";
import { getBankAccount, getInvestor } from "@/api/holder";
import { generateTransactionByType } from "@/utils/mfu/generateTransaction";
import { dividendOptions, arrTransactionType, payMode, transactionTypeList } from "@/utils/constants";

// Resolve whatever the cart stored in `div_opt` (could be the code `"N"`/`"P"`/`"R"`,
// the description `"NA"`/`"PAYOUT"`/`"REINV"`/`"BOTH"`, empty string, or null)
// into a valid dividendOptions entry. MFU errors with `100428 divOpt is required`
// when this ends up blank, so for Growth schemes / unknown values we default to
// "N" (NA — Growth).
const resolveDividendOption = (raw: any) => {
  const v = (raw ?? "").toString().trim().toUpperCase();
  if (!v) return dividendOptions.find((d) => d.code === "N");
  return (
    dividendOptions.find((d) => d.code === v) ||
    dividendOptions.find((d) => d.description === v) ||
    dividendOptions.find((d) => d.code === "N")
  );
};
import { CiBoxList } from "react-icons/ci";
import { Router } from "next/router";
import OrderPopup from "@/components/fund-explore/order";
import { MfuPayload } from "@/utils/mfu/generatePayload";
import { generateUniqueId } from "@/utils/mfu/generateUtrn";
import { getPayOutSec, getPaySec, getSchList, getSubSeqSec, getSysSchList } from "../mutual-fund/transaction";
import CustomSelect from "@/commonUI/Select";
import { executeMfuTransaction, TransactionData } from "@/services/mfuTransactionService";
import { USER_DATA } from "@/utils/constants";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import Loader from "@/commonUI/Loader";
import { toast } from "react-toastify";
import { 
  ShoppingCart, Trash2, IndianRupee, CreditCard, Banknote, 
  Calendar, ArrowRight, X, AlertCircle, CheckCircle, Landmark, 
  Wallet, Truck, Shield, Clock, Star, TrendingUp, Gift, 
  ChevronRight, Circle, Plus, Minus, Building2, Smartphone,
  Sparkles, Package, Heart, RefreshCw, Lock, MapPin, Home
} from "lucide-react";

const schemeData: any = [];

function CartList() {
  const {
    handleDeleteCart,
    cartData,
    setCartData,
  } = MyCartSync();

  const userData: any = getLS(USER_DATA);
  const { setSatatusCartData } = useContext<any>(AccountContext);

  const [selectedCan, setSelectedCan] = useState<any>();
  const schemeModalRef = useRef<HTMLDialogElement>(null);
  const otpModalRef = useRef<HTMLDialogElement>(null);

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [schemeName, setSchemeName] = useState("");
  const [schemeCode, setSchemeCode] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [selecteduser, setSelecteduser] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(userData?.InvestorRegistration?.id || "");
  const [sipData, setSipData] = useState({})

  const [isTransact, setIsTransact] = useState(false);
  const [paymentMode, setPaymentMode] = useState('')
  const [beneVan, setBeneVan] = useState("")
  const [bankList, setBankList] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [accNo, setAccNo] = useState('')
  const [accType, setAccType] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [micr, setMicr] = useState('')

  const [transactionError, setTransactionError] = useState("")
  const [mandateList, setMandateList] = useState<any[]>([])
  const [selectedMandate, setSelectedMandate] = useState<any>("")

  const [isLoading, setIsLoading] = useState(false);
  const [activeTransactionType, setActiveTransactionType] = useState<number | null>(null);

  // SIP validation states
  const [sipDate, setSipDate] = useState("");
  const [sipMonth, setSipMonth] = useState("");
  const [sipYear, setSipYear] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [errors, setErrors] = useState({
    date: "",
    month: "",
    year: "",
    frequency: "",
    amount: ""
  });

  const [exeptions, setExceptions] = useState({
    value: false,
    message: ""
  })

  const tData: any[] = [];
  let amt = 0;

  // Set initial selected account when bankList changes
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

  const [investorList, setInvestorList] = useState<any[]>([]);

  useEffect(() => {
    const GetInvestor = async () => {
      const userData: any = getLS(USER_DATA);
      const response = await getInvestor(userData?.InvestorRegistration?.id)
      setInvestorList(response?.data?.data?.data)
      setSelectedCan(response?.data?.data?.data[0]?.InvestorAccountHolding?.[0]?.CAN_Id || "");
    }
    GetInvestor()
  }, []);

  const SearchData = async (ISIN: string, typeId: number): Promise<any> => {
    try {
      const response = await searchByISIN(ISIN);
      console.log("Response:", response);
      tData.push({ data: response?.data?.data?.data, transactionType: typeId })
      return response;
    } catch (error) {
      console.error("Error searching by ISIN:", error);
      throw error;
    }
  };

  const getTotalForType = (type: number) => {
    return cartData
      .filter((item: any) => item.trans_type === type)
      .reduce((sum: number, item: any) => sum + Number(item.trans_amount || 0), 0);
  };

  const getTransactionSummary = (type: number) => {
    const items = cartData.filter((item: any) => item.trans_type === type);
    const schemes = items.map((item: any) => ({
      schemeISIN: item?.SchemeMaster?.schemeISIN,
      schemeName: item?.SchemeMaster?.ms_fullname,
      amount: Number(item.trans_amount || 0),
      folio: item?.folioType || "NEW",
    }));
    const total = schemes.reduce((sum: any, s: any) => sum + s.amount, 0);
    return { schemes, total };
  };

  const handleBuyNow = async (transactionType: any) => {
    try {
      setIsLoading(true);

      const filteredCart = cartData.filter(
        (item: any) => Number(item.trans_type) === Number(transactionType)
      );

      const tType = transactionTypeList.find(
        (opt: any) => Number(opt.id) === Number(transactionType)
      )?.name;

      console.log("Transaction Type:", transactionType, tType);

      if (!filteredCart.length) {
        toast.error("No schemes found");
        return;
      }

      const totalAmount = filteredCart.reduce(
        (sum: number, item: any) => sum + Number(item.trans_amount ?? item.vol ?? 0), 0
      );

      let schList: any[] = [];
      let sysSchList: any[] = [];
      let paySec: any = null;
      let subSeqSec: any = [];
      let payFlag = "Y";
      let subSeqPayFlag = "";
      const refNo = await generateReference("");
      const clientIp = await fetchClientIp();
      const selectedBank = bankList.find((bank) => bank.account_no === accNo);
      const txnTypeObj = arrTransactionType.find((t: any) => t.name === transactionType);

      filteredCart.forEach((item: any) => {
        const amount = String(item.trans_amount ?? item.vol ?? 0);
        const option = resolveDividendOption(item.div_opt);
        const payOutDtl = getPayOutSec(tType || "B", "", "", accType, "");

        if (tType === "B" || tType === "S") {
          const result = getSchList(
            tType, generateUniqueId(), item?.rta_amc_code || "",
            item?.rta_sch_code || "", item?.out_rta_sch_code || "",
            "NEW", "New", option, amount, "", payOutDtl, item?.tx_vol_type ?? ""
          );
          schList.push(...result);
        } else if (["V", "Y", "J"].includes(tType || "")) {
          const relatedMandates = mandateList.filter((m) => m.acc_no === selectedBank?.account_no);
          if (!relatedMandates.length) throw new Error("No mandate found");
          const mandate = relatedMandates[0];
          const result = getSysSchList(
            generateUniqueId(), item?.SchemeMaster?.ProductCode || "",
            item?.rta_sch_code || "", item?.out_rta_sch_code || "",
            "NEW", "New", option, amount, selectedFrequency,
            item.day || sipDate, item.start_month || sipMonth,
            item.start_year || sipYear, item.end_month || "",
            item.end_year || "", payOutDtl, txnTypeObj
          );
          sysSchList.push(...result);
          subSeqPayFlag = "Y";
          subSeqSec = getSubSeqSec(
            tType || "B", "DM", selectedBank?.micrCode, selectedBank?.ifscCode,
            selectedBank?.accountType, selectedBank?.account_no, mandate.prn
          );
        }
      });

      paySec = getPaySec(
        tType || "B", paymentMode, selectedBank?.micr, selectedBank?.ifsc,
        selectedBank?.account_type, selectedBank?.account_no,
        totalAmount.toString(), beneVan, selectedMandate
      );

      const transaction: TransactionData = {
        txnType: tType || "B",
        entGroupRefNo: refNo?.data?.data?.reference ?? "",
        can: selectedCan || "",
        totAmt: totalAmount,
        schList: schList,
        paySecFlag: payFlag,
        paySec: paySec,
        sysSchList: sysSchList,
        subSeqPayFlag: subSeqPayFlag,
        subSeqSec: subSeqSec,
        logDtl: { deviceType: "W", custIpAddress: clientIp }
      };

      console.log("Final Transaction:", transaction);

      const response = await executeMfuTransaction(transaction, 2, "");
      const result = JSON.parse(response?.data?.data);
      console.log("[my-cart] MFU response:", result);

      const respBody: any = result?.respBody ?? result ?? {};
      const respHeader: any = result?.respHeader ?? respBody?.respHeader ?? {};
      const appLink = respBody?.ordDtl?.appLinkPri;

      if (appLink) {
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
          "MFU rejected this order but did not return a specific reason. Please verify the selected CAN, bank, and scheme and try again.";
        toast.error(msg);
        setTransactionError(msg);
      }

    } catch (error: any) {
      console.error("Transaction error:", error);
      setExceptions({ value: true, message: error?.message || "Transaction failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNows = async (transactionType: number) => {
    try {
      setIsLoading(true);

      const filteredCart = cartData.filter(
        (item: any) => Number(item.trans_type) === Number(transactionType)
      );

      const tType = transactionTypeList.find(
        (opt: any) => Number(opt.id) === Number(transactionType)
      )?.name;

      console.log("Transaction Type:", transactionType, tType);

      const totalAmount = filteredCart.reduce(
        (sum: number, item: any) => sum + Number(item.trans_amount ?? item.vol ?? 0), 0
      );

      console.log("Total Amount:", totalAmount);

      const schList = filteredCart.flatMap((item: any) => {
        const option = resolveDividendOption(item.div_opt);
        const txnTypeObj = arrTransactionType.find((t: any) => t.name === tType);
        return getSchList(
          tType || "B", generateUniqueId(), item?.SchemeMaster?.ProductCode || "",
          item?.rta_sch_code || "", item?.out_rta_sch_code || "",
          "", "New", option, String(item.trans_amount ?? item.vol ?? 0),
          "Y", null, txnTypeObj?.txnVolTyp || ""
        );
      });

      console.log("Scheme List:", schList);

      const clientIp = await fetchClientIp();
      const selectedBank = bankList.find(bank => bank.account_no === accNo);

      const transaction: TransactionData = {
        txnType: tType || "B",
        entGroupRefNo: "",
        can: selectedCan || "",
        totAmt: totalAmount,
        schList: schList,
        paySecFlag: "Y",
        paySec: getPaySec(
          tType || "B", paymentMode, selectedBank?.micrCode, selectedBank?.ifscCode,
          selectedBank?.accountType, selectedBank?.bankAccountNumber,
          totalAmount.toString(), beneVan, selectedMandate
        ),
        sysSchList: [],
        subSeqPayFlag: "",
        subSeqSec: [],
        logDtl: { deviceType: "W", custIpAddress: clientIp }
      };

      console.log("Final transaction payload:", transaction);

    } catch (error: any) {
      console.error("Transaction error:", error);
      setExceptions({ value: true, message: error?.message || "Transaction failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionSection = (typeId: number, label: string, icon: React.ReactNode) => {
    const items = cartData.filter((item: any) => item.trans_type === typeId);
    if (items.length === 0) return null;

    return (
      <div key={typeId} className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden mb-6 transition-all hover:border-[#F59E0B]/30">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1F1A1A] to-[#111111] border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                label === "Lumpsum" ? "bg-[#F59E0B]/20" : 
                label === "SIP" ? "bg-[#10B981]/20" : "bg-[#6366F1]/20"
              }`}>
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{label}</h2>
                <p className="text-sm text-white/50 mt-0.5">{items.length} {items.length === 1 ? 'scheme' : 'schemes'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-[#F59E0B]">₹{getTotalForType(typeId).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        
        {/* Items List */}
        <div className="divide-y divide-[#2A2A2A]">
          {items.map((item: any, idx: any) => (
            <div key={item.id || idx} className="p-5 hover:bg-[#1A1A1A] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      label === "Lumpsum" ? "bg-[#F59E0B]/20 text-[#F59E0B]" : 
                      label === "SIP" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#6366F1]/20 text-[#6366F1]"
                    }`}>
                      {label}
                    </span>
                    {item?.folioType === "NEW" && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                        New Folio
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item?.SchemeMaster?.ms_fullname || ""}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <span>Amount: ₹{(item?.trans_amount || item?.amount || 0).toLocaleString('en-IN')}</span>
                    {item?.frequency && <span>Frequency: {item.frequency}</span>}
                    {item?.day && <span>Day: {item.day}</span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSchemeName(item?.SchemeMaster?.ms_fullname);
                    setSchemeCode(item?.id);
                    setOpen(true);
                  }}
                  className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Actions */}
        <div className="p-5 bg-[#0D0D0D] border-t border-[#2A2A2A]">
          <button
            onClick={() => {
              setActiveTransactionType(typeId);
              setIsTransact(true);
            }}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Proceed to Pay ₹{getTotalForType(typeId).toLocaleString('en-IN')}
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Payment Section */}
          {isTransact && activeTransactionType === typeId && (
            <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Lock className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="font-semibold text-white">Secure Payment</h3>
              </div>

              {/* Payment Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {payMode.map((mode: any) => (
                    <button
                      key={mode.value}
                      onClick={() => {
                        setPaymentMode(mode.value);
                        if (mode.value === "NE" || mode.value === "RT") {
                          setBeneVan("MFKK" + selectedCan);
                        } else if (mode.value === "IU") {
                          setBeneVan("MFSYES" + selectedCan + "@@yesbankltd");
                        }
                        if (["NE", "OT", "RT", "UP"].includes(mode.value)) {
                          const investorId = (selectedInvestor as any);
                          if (investorId) {
                            const fetchBank = async () => {
                              try {
                                const response = await getBankAccount(selectedInvestor);
                                const data = response?.data?.data?.data || [];
                                setBankList(data);
                              } catch (error) {
                                setBankList([]);
                              }
                            }
                            fetchBank();
                            setMandateList([]);
                          }
                        } else if (mode.value === "DM") {
                          const investorId = (selectedInvestor as any)?.id;
                          if (investorId) {
                            const fetchMandates = async () => {
                              try {
                                const response = await getMandates(investorId);
                                const data = response?.data?.data?.data || [];
                                const filteredMandates = data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");
                                setMandateList(filteredMandates);
                              } catch (error) {
                                setMandateList([]);
                              }
                            }
                            fetchMandates();
                            setBankList([]);
                          }
                        } else {
                          setBankList([]);
                          setMandateList([]);
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        paymentMode === mode.value
                          ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-[#2A2A2A] hover:border-[#F59E0B]/50 bg-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {mode.value === "NE" && <Building2 className="w-4 h-4 text-white/60" />}
                        {mode.value === "UP" && <Smartphone className="w-4 h-4 text-white/60" />}
                        {mode.value === "DM" && <RefreshCw className="w-4 h-4 text-white/60" />}
                        {mode.value === "OT" && <Banknote className="w-4 h-4 text-white/60" />}
                        <span className="text-sm font-medium text-white">{mode.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Lists */}
              {["NE", "OT", "RT", "UP"].includes(paymentMode) && bankList?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#F59E0B]" />
                    Select Bank Account
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {bankList.map((opt: any) => (
                      <label
                        key={opt?.account_no}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAccount === opt?.account_no
                            ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                            : 'border-[#2A2A2A] hover:border-[#F59E0B]/50 bg-[#1A1A1A]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bankAccount"
                          className="w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]"
                          checked={selectedAccount === opt?.account_no}
                          onChange={() => {
                            setAccType(opt?.account_type);
                            setAccNo(opt?.account_no);
                            setIfsc(opt?.ifsc);
                            setMicr(opt?.micr);
                            setSelectedAccount(opt?.account_no);
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">{opt?.BankMaster?.bank_name || opt?.bank_name}</p>
                          <p className="text-sm text-white/60">Account: {opt.account_no}</p>
                          <div className="flex gap-3 mt-1 text-xs text-white/40">
                            <span>IFSC: {opt.ifsc}</span>
                            <span>Type: {opt?.account_type}</span>
                          </div>
                        </div>
                        {selectedAccount === opt?.account_no && <CheckCircle className="w-5 h-5 text-[#F59E0B]" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandate Lists */}
              {paymentMode === 'DM' && mandateList?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Select Mandate
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {mandateList.map((opt: any) => (
                      <label
                        key={opt?.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedMandate === opt?.prn
                            ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                            : 'border-[#2A2A2A] hover:border-[#F59E0B]/50 bg-[#1A1A1A]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mandate"
                          className="w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]"
                          checked={selectedMandate === opt?.prn}
                          onChange={() => {
                            setAccType(opt?.acc_type);
                            setAccNo(opt?.acc_no);
                            setIfsc(opt?.ifsc);
                            setMicr(opt?.micr);
                            setSelectedMandate(opt?.prn);
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">Account: {opt.acc_no}</p>
                          <p className="text-xs text-white/50 font-mono">Ref: {opt?.prn}</p>
                          <div className="flex gap-3 mt-1 text-xs text-white/40">
                            <span>IFSC: {opt.ifsc}</span>
                            <span>Limit: ₹{opt.max_amt}</span>
                          </div>
                        </div>
                        {selectedMandate === opt?.prn && <CheckCircle className="w-5 h-5 text-[#F59E0B]" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {exeptions.value && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{exeptions.message}</p>
                </div>
              )}

              {transactionError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{transactionError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleBuyNow(typeId)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-[#3A3A3A]' />
                      <span>Processing...</span>
                    </div>
                  ) : 'Pay Now'}
                </button>
                <button
                  className="px-6 py-3 bg-[#1A1A1A] text-white border border-[#2A2A2A] rounded-xl font-semibold hover:bg-[#2A2A2A] transition-all"
                  onClick={() => {
                    setIsTransact(false);
                    setActiveTransactionType(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalCartValue = cartData.reduce((sum: number, item: { trans_amount: any; }) => sum + Number(item.trans_amount || 0), 0);
  const totalItems = cartData.length;

  // Calculate estimated returns (example: 12% expected returns)
  const estimatedReturns = totalCartValue * 0.12;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-[#F59E0B] to-[#B45309] rounded-2xl shadow-lg">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full shadow-lg">
                    {totalItems}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">My Cart</h1>
                <p className="text-sm text-white/50 mt-1">Review and confirm your investment transactions</p>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-400 font-medium">Secure Investment</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">Instant Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Summary Cards */}
        {cartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] rounded-2xl p-5 border border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-sm">Total Items</p>
                  <p className="text-3xl font-bold text-white mt-1">{totalItems}</p>
                  <p className="text-xs text-white/40 mt-2">Investment Schemes</p>
                </div>
                <div className="p-3 bg-[#F59E0B]/10 rounded-xl">
                  <Package className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] rounded-2xl p-5 border border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-sm">Total Investment</p>
                  <p className="text-3xl font-bold text-[#F59E0B] mt-1">₹{totalCartValue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-white/40 mt-2">Including all charges</p>
                </div>
                <div className="p-3 bg-[#F59E0B]/10 rounded-xl">
                  <IndianRupee className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] rounded-2xl p-5 border border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-sm">Est. Annual Returns</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">₹{estimatedReturns.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-white/40 mt-2">@12% expected returns</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartData.length > 0 ? (
              <>
                {renderTransactionSection(1, "Lumpsum", <Banknote className="w-5 h-5 text-[#F59E0B]" />)}
                {renderTransactionSection(2, "SIP", <Calendar className="w-5 h-5 text-[#10B981]" />)}
                {renderTransactionSection(3, "STP", <RefreshCw className="w-5 h-5 text-[#6366F1]" />)}
              </>
            ) : (
              <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-12 h-12 text-white/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                  <p className="text-white/50 mb-6">Looks like you haven't added any schemes to your cart yet.</p>
                  <button 
                    onClick={() => window.location.href = '/mutual-fund/explore'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    Explore Schemes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          {cartData.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-5 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-[#F59E0B]/10 rounded-lg">
                    <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white">Order Summary</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Total Items</span>
                    <span className="font-medium text-white">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Total Investment</span>
                    <span className="font-medium text-[#F59E0B]">₹{totalCartValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Transaction Charges</span>
                    <span className="text-green-500">Free</span>
                  </div>
                </div>
                
                <div className="border-t border-[#2A2A2A] pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total Amount</span>
                    <span className="text-xl font-bold text-[#F59E0B]">₹{totalCartValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Investment Tip */}
                <div className="bg-[#F59E0B]/10 rounded-xl p-4 mb-4 border border-[#F59E0B]/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#F59E0B] font-medium">Pro Tip</p>
                      <p className="text-xs text-white/70 mt-1">Complete your investment today to start your wealth creation journey!</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <button
                  onClick={() => window.location.href = '/mutual-fund/explore'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-all border border-[#2A2A2A]"
                >
                  <Plus className="w-4 h-4" />
                  Add More Schemes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Remove Scheme"
        footer={
          <div className="flex justify-end gap-2">
            <CustomButton onClick={() => setOpen(false)} label="Cancel" />
            <CustomButton
              label="Remove"
              onClick={() => {
                handleDeleteCart(schemeCode);
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-white/80">
            Are you sure you want to remove <span className="font-semibold text-white">{schemeName}</span> from your cart?
          </p>
        </div>
      </Dialog>

      {/* Order Popup */}
      {showOrderPopup && (
        <OrderPopup
          schemeData={schemeData}
          investor={selectedInvestor}
          sipData={sipData}
          source={"cart"}
          open={showOrderPopup}
          onClose={() => setShowOrderPopup(false)}
        />
      )}
    </div>
  );
}

export default CartList;