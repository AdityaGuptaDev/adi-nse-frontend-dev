"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";

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

const ACCOUNT_TYPE_MAP: Record<string, string> = { SB: "Savings", CB: "Current", NE: "NRE", NO: "NRO" };

export default function NseOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Scheme from URL params
  const schemeCode = searchParams.get("scheme_code") || "";
  const schemeName = searchParams.get("scheme_name") || "";
  const amcCode = searchParams.get("amc_code") || "";
  const isin = searchParams.get("isin") || "";
  const minAmount = searchParams.get("min_amount") || "100";

  // Form state
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);
  const [mode, setMode] = useState<"P" | "D">("P"); // Physical / Demat
  const [transactionType, setTransactionType] = useState("P"); // P=Purchase, R=Redemption
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

  // Success modal
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // EUIN fields
  const [euinDeclaration, setEuinDeclaration] = useState("Y");
  const [euinNumber, setEuinNumber] = useState("");

  // Fetch investors for UCC selection
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/nse/ucc/investor-list", { params: { limit: 100, ucc_status: "created" } });
        const payload = res?.data?.data ?? res?.data ?? {};
        if (payload?.status === "S" && payload?.data?.investors) {
          setInvestors(payload.data.investors);
          if (payload.data.investors.length > 0) {
            setSelectedInvestorId(payload.data.investors[0].id);
          }
        }
      } catch (err) {
        handleServerError(err);
      }
    })();
  }, []);

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const banks = selectedInvestor?.banks || [];

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

  const handlePlaceOrder = async () => {
    if (!selectedInvestor) { toastAlert("error", "Please select an investor"); return; }
    if (!amount || parseFloat(amount) < parseFloat(minAmount)) {
      toastAlert("error", `Minimum amount is ₹${minAmount}`); return;
    }

    setSubmitting(true);
    try {
      // Build transaction payload
      const txnPayload = {
        transaction_details: [{
          order_ref_number: "",
          scheme_code: schemeCode,
          trxn_type: transactionType,
          buy_sell_type: transactionType === "P" ? "FRESH" : "",
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

      // Call the right API based on transaction type
      let apiUrl = "/nse/transaction";
      if (transactionType === "R") apiUrl = "/nse/redemption";

      const res = await api.post(apiUrl, txnPayload);
      const responseData = res?.data?.data ?? res?.data;

      if (responseData?.status === "S") {
        const txnData = responseData?.data?.transaction_details?.[0] || responseData?.data?.[0] || {};
        if (txnData.trxn_status === "TRXN FAILED") {
          toastAlert("error", txnData.trxn_remark || "Transaction failed");
        } else {
          // Get payment link
          let paymentLink = "";
          try {
            const linkRes = await api.post("/nse/get-link", {
              productType: transactionType === "P" ? "PUR" : "RED",
              productRefId: txnData.trxn_order_id || "",
            });
            const linkData = linkRes?.data?.data ?? linkRes?.data;
            paymentLink = linkData?.data?.firstHolderLink || linkData?.firstHolderLink || "";
          } catch { /* link fetch is optional */ }

          setOrderSuccess({
            investor: selectedInvestor.name,
            pan: selectedInvestor.pan,
            scheme: schemeName,
            amount: amount,
            type: transactionType === "P" ? "Purchase" : "Redemption",
            orderId: txnData.trxn_order_id || "",
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] px-6 py-4 text-center">
            <h2 className="text-white text-lg font-semibold">Order Status</h2>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheck className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Order Successfully placed to NSE Invest</h3>

            <div className="bg-blue-50 rounded-xl p-5 text-left space-y-3 mb-6">
              {[
                { label: "Investor", value: `${orderSuccess.investor} / ${orderSuccess.pan}` },
                { label: "Scheme", value: orderSuccess.scheme },
                { label: "Amount", value: `₹${Number(orderSuccess.amount).toLocaleString("en-IN")}` },
                { label: "Transaction Type", value: orderSuccess.type },
                { label: "Order Number", value: orderSuccess.orderId },
                { label: "Date", value: orderSuccess.date },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800 text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {orderSuccess.paymentLink && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-6">
                <input
                  readOnly
                  value={orderSuccess.paymentLink}
                  className="flex-1 text-xs text-gray-600 bg-transparent truncate outline-none"
                />
                <button
                  onClick={() => copyToClipboard(orderSuccess.paymentLink)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#4bc5c1] text-white rounded-md text-xs font-medium hover:bg-[#3db5b1]"
                >
                  {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/nse-my-orders")}
                className="px-6 py-2.5 bg-[#4bc5c1] text-white rounded-full text-sm font-semibold hover:bg-[#3db5b1]"
              >
                View Orders
              </button>
              <button
                onClick={() => { setOrderSuccess(null); setAmount(""); }}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50"
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4bc5c1] to-[#3db5b1] rounded-t-2xl px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white hover:text-white/80">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white text-lg font-semibold">Order Application Form</h2>
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Scheme & Investor Info */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Scheme</span>
                <span className="font-medium text-gray-800 text-right max-w-[300px]">{schemeName || "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">UCC</span>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#4bc5c1] font-medium focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
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
                <span className="text-gray-500">Folio</span>
                <span className="font-medium text-green-600">NEW</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">First Holder</span>
                <span className="font-medium text-gray-800">{selectedInvestor?.name || "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">EUIN Declaration</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="euin_decl" value="Y" checked={euinDeclaration === "Y"} onChange={() => setEuinDeclaration("Y")} className="w-3.5 h-3.5 text-[#4bc5c1]" />
                    <span className="text-xs">Yes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="euin_decl" value="N" checked={euinDeclaration === "N"} onChange={() => setEuinDeclaration("N")} className="w-3.5 h-3.5 text-[#4bc5c1]" />
                    <span className="text-xs">No</span>
                  </label>
                </div>
              </div>
              {euinDeclaration === "Y" && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">EUIN Number</span>
                  <input
                    type="text"
                    value={euinNumber}
                    onChange={(e) => setEuinNumber(e.target.value.toUpperCase())}
                    placeholder="E123456"
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - Order Details */}
          <div className="space-y-5">
            {/* Mode */}
            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">Mode :</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" value="P" checked={mode === "P"} onChange={() => setMode("P")} className="w-4 h-4 text-[#4bc5c1]" />
                  <span className="text-sm">Physical</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" value="D" checked={mode === "D"} onChange={() => setMode("D")} className="w-4 h-4 text-[#4bc5c1]" />
                  <span className="text-sm">Demat</span>
                </label>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">Transaction Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
              >
                <option value="P">Purchase</option>
                <option value="R">Redemption</option>
              </select>
            </div>

            {/* Scheme Type */}
            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">Scheme Type :</label>
              <div className="flex items-center gap-4">
                {[
                  { value: "GR", label: "Growth" },
                  { value: "DP", label: "Dividend Payout" },
                  { value: "DR", label: "Dividend Reinvestment" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="scheme_type" value={opt.value} checked={schemeType === opt.value} onChange={() => setSchemeType(opt.value)} className="w-4 h-4 text-[#4bc5c1]" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-600 font-medium">Amount:</label>
                <span className="text-xs text-gray-400">Min: ₹{Number(minAmount).toLocaleString("en-IN")}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={minAmount}
                  className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-gray-400 mt-1">{numberToWords(Math.floor(parseFloat(amount)))}</p>
              )}
            </div>

            {/* Payment Option (Purchase only) */}
            {transactionType === "P" && (
              <>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pay_opt" value="link" checked={paymentOption === "link"} onChange={() => setPaymentOption("link")} className="w-4 h-4 text-[#4bc5c1]" />
                    <span className="text-sm">Send payment link on email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pay_opt" value="pay" checked={paymentOption === "pay"} onChange={() => setPaymentOption("pay")} className="w-4 h-4 text-[#4bc5c1]" />
                    <span className="text-sm">Pay Now</span>
                  </label>
                </div>

                {paymentOption === "pay" && (
                  <>
                    {/* Payment Mode */}
                    <div>
                      <label className="text-sm text-gray-600 font-medium mb-2 block">Payment Modes :</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]"
                      >
                        {PAYMENT_MODES.map((pm) => (
                          <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Selection (for Mandate, Cheque, UPI, NetBanking) */}
                    {["MANDATE", "CHEQUE", "UPI", "NETBANKING"].includes(paymentMode) && banks.length > 0 && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
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
                                  <input type="radio" name="pay_bank" value={bank.account_no} checked={selectedBank === bank.account_no} onChange={() => setSelectedBank(bank.account_no)} className="w-4 h-4 text-[#4bc5c1]" />
                                </td>
                                <td className="px-3 py-2 text-gray-700">{bank.bank_name || "--"}</td>
                                <td className="px-3 py-2 font-mono text-xs">{bank.account_no}</td>
                                <td className="px-3 py-2 text-gray-500 text-xs">{bank.branch_name || "--"}</td>
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
                        <p className="text-xs text-gray-500">Cheque to be made in favour of</p>
                        <p className="text-sm font-medium">Beneficiary Name : NSE INVEST PLATFORM NCL SETTLEMENT A/C</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cheque Number</label>
                            <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cheque Date</label>
                            <input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI fields */}
                    {paymentMode === "UPI" && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">UPI ID</label>
                        <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]" />
                      </div>
                    )}

                    {/* NEFT/RTGS fields */}
                    {paymentMode === "NEFT" && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                          {[
                            { label: "Beneficiary Name", value: "NSE INVEST PLATFORM NCL SETTLEMENT AC" },
                            { label: "Bank Name", value: "HDFC BANK LTD" },
                            { label: "Branch Name", value: "FORT, MUMBAI" },
                            { label: "IFSC Code", value: "HDFC0000060" },
                            { label: "Virtual Account No", value: `NSEMF${selectedInvestor?.client_code || "XXXXXX"}` },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="font-medium text-gray-800">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">NEFT / RTGS UTR Number (Optional)</label>
                          <input type="text" value={neftUtr} onChange={(e) => setNeftUtr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4bc5c1]" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="px-8 py-2.5 bg-[#4bc5c1] text-white rounded-full text-sm font-semibold hover:bg-[#3db5b1] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          By clicking on Place Order, I confirm that I have read all the Scheme Information Documents.
        </p>
      </div>
    </div>
  );
}
