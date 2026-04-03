"use client";

import React, { useRef, useState, useContext, useEffect } from "react";
import MyCartSync from "./(components)/my-cart-sync";
import TransactionCard from "./(components)/transactionCard";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomLabel from "@/commonUI/Label";
import CustomButton from "@/commonUI/Button";
import Dialog from "@/commonUI/Dialog";
import AccountContext from "@/context/AccountContext/Account.context";
import { generateReference, searchByISIN, ApiFinTechNormalTxnService } from "@/api/transaction";
import { generateTransactionByType } from "@/utils/mfu/generateTransaction";
import { dividendOptions, arrTransactionType, payMode, transactionTypeList } from "@/utils/constants";
import { toastAlert } from "@/utils/helpers";
import { CiBoxList } from "react-icons/ci";
import { Router } from "next/router";
import OrderPopup from "@/components/fund-explore/order";
import { MfuPayload } from "@/utils/mfu/generatePayload";
import { generateUniqueId } from "@/utils/mfu/generateUtrn";
import { getPayOutSec, getPaySec, getSchList } from "../mutual-fund/transaction";
import CustomSelect from "@/commonUI/Select";
import { getBankAccount } from "@/api/holder";
import Loader from "@/commonUI/Loader";
interface TransactionData {
  schemeISIN?: string;
  trans_type: string;
  trans_amount: string;
  rtaAmcCode: string;
  rtaSchCode: string;
  outRtaSchCode: string;
  divOpt: string;
}
const schemeData: any = [];
function CartList() {

  const {
    handleDeleteCart,
    cartData,
    setCartData,
  } = MyCartSync();



  const { setSatatusCartData } = useContext<any>(AccountContext);

  const [selectedCan, setSelectedCan] = useState<any>();


  const schemeModalRef = useRef<HTMLDialogElement>(null);
  const otpModalRef = useRef<HTMLDialogElement>(null);

  const [transactionData, setTransactionData] = useState<any[]>([]);
  //const [transactionType, setTransactionType] = useState<number>(0);
  const [schemeName, setSchemeName] = useState("");
  const [schemeCode, setSchemeCode] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [selecteduser, setSelecteduser] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState({})
  const [sipData, setSipData] = useState({})

  const [isTransact, setIsTransact] = useState(true);
  const [paymentMode, setPaymentMode] = useState('')
  const [beneVan, setBeneVan] = useState("")
  const [bankList, setBankList] = useState<any[]>([])

  const [transactionError, setTransactionError] = useState("")

  const [isLoading, setIsLoading] = useState(false);

  const [exeptions, setExceptions] = useState({
    value: false,
    message: ""
  })




  const tData: any[] = [];
  let amt = 0;

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


  const getTotalForType = (type: number): number => {

    const filteredItems = cartData.filter((item: any) => item.trans_type === type);

    console.log("Filtered items:", filteredItems);
    let totAmt = 0;

    // Only trigger searches if there are items and avoid infinite loops
    if (filteredItems.length > 0) {
      filteredItems.forEach((item: any) => {
        totAmt += item.trans_amount;
        // Add safety check to prevent infinite loops
        if (item.SchemeMaster?.schemeISIN) {
          SearchData(item.SchemeMaster.schemeISIN, type).catch(error => {
            console.error("Search error for ISIN:", item.SchemeMaster.schemeISIN, error);
          });
        }
      });
    }
    console.log(totAmt)
    amt = totAmt;
    //setAmount(totAmt);


    // Calculate and return the total synchronously
    return filteredItems.reduce((sum: number, item: any) =>
      sum + Number(item.trans_amount || 0), 0
    );
  };

  const handleBuyNow = async (transactionType: any) => {


    console.log("Cart Data :=====", cartData)

    let tType = transactionTypeList.find((opt: any) => opt.id === transactionType)?.name

    //const filteredData = tData.find(opt => opt.transactionType === tType)?.data.filter((opt: any) => opt?.div_opt === "V");

    const filteredData = tData
      ?.flatMap((item: any) => item.data)
      ?.filter((opt: any) => opt.txn_type === tType);

    console.log("filtered data", filteredData);


    /* const schemes: any = [];
     filteredData.forEach(item => {
       console.log("items", item)
       if (item.length > 0) {
         schemes.push({ divOpt: item[0].div_opt, fund_code: item[0].fund_code, scheme_code: item[0].scheme_code })
       }
     });*/

    //console.log("Investor Data :- ", investorData)
    //console.log("TrNSACTION TYPE :-", schemes)
    //const option = dividendOptions.find(opt => opt.description === divOpt);
    //const txnType = arrTransactionType.find(t => t.value === transactionType)
    //setTxnVolType(txnType?.txnVolTyp ?? "");
    //const refNo = await generateReference("");
    let schList = [];
    let sysSchList: any = [];
    let subSeqSec: any = null;
    let paySec: any = null;
    let payOutDtl: any = null;
    let subSeqPayFlag: any = null;
    let mandateRefNo = ""
    let end_month = ""
    let end_year = ""
    let divOpt = "";

    let selectedFolio = "New"

    console.log("Schemes :- ", dividendOptions)
    //const refNo = await generateReference("");
    if (tType === "B" && filteredData?.length > 0) {
      schList = filteredData.map((opt: any) => {
        const option = dividendOptions.find(d => d.description === opt.div_opt);
        return getSchList(
          "B",
          generateUniqueId(),
          opt?.fund_code,
          opt?.scheme_code,
          "",
          "",
          selectedFolio,
          option,
          (amt as any),
          "Y",
          payOutDtl,
          ""
        );
      });
    }

    console.log(schList)



    /* if (transactionType == "B") {
         //Lump sum
         subSeqPayFlag = "";
 
         payOutFlag = ""
         payOutDtl = getPayOutSec(transactionType, "", "", accType, "")
         schList = getSchList(transactionType, generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, _amount, payOutFlag, payOutDtl, txnType?.txnVolTyp ?? "")
 
         payFlag = "Y"
         paySec = getPaySec(transactionType, paymentMode, micr, ifsc, accType, accNo, _amount?.toString(), beneVan, selectedMandate)
 
         //Testing :- Done
 
     }*/

    /*if (transactionType === 1) {
      const schList = schemes.map((txn: any, index: any) => ({
        entUnqItrn: `20240711${index + 1}`,
        mfuUtrn: "",
        rtaAmcCode: txn.fund_code,
        rtaSchCode: txn.scheme_code,
        outRtaSchCode: "",
        folio: "NEW",
        divOpt: dividendOptions.find(opt => opt.description === txn?.divOpt)?.code,
        //divOpt: "N",
        txnVolTyp: "A",
        vol: "5000",
        payOutFlag: "",
        payOutDtl: {
          invAccNo: "",
          micr: "",
          ifsc: ""
        },
        priOtpFlag: "",
        priMob: "",
        priEmail: ""
      }));
      const obj = new MfuPayload();
      const payload = obj.getTransactionPayload("B", {
        entGroupRefNo: refNo?.data?.data?.reference ?? "",
        can: "14163BEA01",
        arnCode: "ARN-104974",
        totAmt: "10000",
        schList,
        paySecFlag: "Y",
        paySec: {
          payMode: "OT",
          micr: "636211999",
          ifsc: "UTIB0000716",
          accType: "SB",
          accNo: "1234567890",
          payDate: new Date().toISOString().slice(0, 10),
          payAmt: "10000",
          beneVan: "",
          paymentRefNo: "",
          paymentBankRefNo: "",
          mandateRefNo: "",
          paymentConfirmTs: "",
          amcPaymentTs: ""
        }
      });

      console.log("Payload =>", payload);
      console.log(JSON.stringify(payload, null, 2));
      const response = await ApiFinTechNormalTxnService(payload);
      console.log(response)
      const result = JSON.parse(response?.data?.data);
      console.log(result)
      const appLink = result?.respBody?.ordDtl?.appLinkPri;

      if (appLink) {
        window.location.href = appLink;
      } else {

        alert("Transaction submitted, but no payment link returned.");
      }
    }*/


    // otpModalRef.current?.showModal(); // Uncomment for OTP logic
  };

  const renderTransactionSection = (typeId: number, label: string) => {
    const items = cartData.filter((item: any) => item.trans_type === typeId);
    if (items.length === 0) return null;

    return (
      <div key={typeId}>
        <h2 className="pb-2 font-semibold">{label}</h2>
        {items.map((item: any, idx: any) => (
          <TransactionCard
            key={item.id || idx}
            type={label}
            scheme={item?.SchemeMaster?.ms_fullname || ""}
            folio={item?.folioType || "New"}
            amount={item?.trans_amount || item?.amount || 0}
            editable={true}
            isNew={item?.folioType ? false : true}
            isAdd={item?.folioType ? true : false}
            details={{
              category: item?.SchemeMaster?.SchemeCategory?.Name || "-",
              subcategory: item?.SchemeMaster?.SchemeSubcategory?.Name || "-",
              frequency: item?.frequency || "-",
              day: item?.day || "-",
              start_month: item?.start_month || "-",
              start_year: item?.start_year || "-"

            }}
            onDelete={() => {
              setSchemeName(item?.SchemeMaster?.ms_fullname);
              setSchemeCode(item?.id);
              setOpen(true);
            }}
            onEdit={() => {
              setShowOrderPopup(true)
            }}
          />
        ))}
        <div className="flex items-center justify-between">
          <div className="mt-6 text-center">
            <CustomButton onClick={() => handleBuyNow(typeId)}>Place Order</CustomButton>
          </div>
          <div className="mt-4 text-right text-sm font-semibold text-alert-300">
            Total: {getTotalForType(typeId)} /-
          </div>

          {isTransact &&
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


                    /*const fetchBank = async () => {
                      const response = await getBankAccount(investorList[0].id);
                      const data = response?.data?.data?.data
                      console.log("bankList :- ", response?.data?.data?.data);
                      setBankList(data)
                    }


                    fetchBank()*/
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
                <CustomButton onClick={handleBuyNow}>{isLoading ? <><Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-gray-300' />  wait...</> : 'Order Now'}
                </CustomButton>
                <CustomButton className="bg-gray-300 hover:bg-gray-400 text-black" onClick={() => setIsTransact(false)}>Cancel</CustomButton>

              </div>
            </>
          }
        </div>

      </div>
    );
  };

  return (
    <div className="p-4">
      {/*<div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="w-full sm:w-auto">
                    <CustomLabel className="text-sm">Investor Name</CustomLabel>
                    <CustomReactSelect
                        items={userOptions}
                        bindValue="text"
                        bindName="text"
                        value={selecteduser}
                        onChange={(option) => setSelecteduser(option.text)}
                        className="cursor-pointer min-w-64"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <CustomLabel className="text-sm">Account Holding</CustomLabel>
                    <CustomReactSelect
                        items={userOptions}
                        bindValue="text"
                        bindName="text"
                        value={selecteduser}
                        onChange={(option) => setSelecteduser(option.text)}
                        className="cursor-pointer min-w-64"
                    />
                </div>
            </div>*/}

      <div className="space-y-6">
        {cartData.length > 0 ? (
          <>
            {renderTransactionSection(1, "Lumpsum")}
            {renderTransactionSection(2, "SIP")}
            {renderTransactionSection(3, "STP")}
          </>
        ) : (
          <div className="text-gray-600 text-center">No Items in the Cart</div>
        )}
      </div>

      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirmation"
        footer={
          <div className="flex justify-end gap-2">
            <CustomButton onClick={() => setOpen(false)} label="Cancel" />
            <CustomButton
              label="Confirm"
              onClick={() => {
                handleDeleteCart(schemeCode);
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <p>
          Are you sure you want to delete scheme{" "}
          <span className="text-red-700 font-semibold">{schemeName}</span>?
        </p>
      </Dialog>

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
