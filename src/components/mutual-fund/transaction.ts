import { get } from "http";

let paySec: any = {}
let payOutDtl: any = {}
let schList: any = []
let sysSchList: any = []
let subSeqSec: any = {}
export function getPaySec(txnType: string, paymentMode: string, micr: string, ifsc: string, accType: string, accNo: string, _amount: string | undefined, beneVan: string, selectedMandate: string): any {

    if (txnType === "B") {
        paySec = {
            payMode: paymentMode,
            micr: micr,
            ifsc: ifsc,
            accType: accType,
            accNo: accNo,
            payDate: new Date().toISOString().slice(0, 10),
            payAmt: _amount?.toString(),
            beneVan: beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: ""
        }
    } else if (txnType === "V") {
        paySec = {
            payMode: paymentMode,
            micr: micr,
            ifsc: ifsc,
            accType: accType,
            accNo: accNo,
            payDate: new Date().toISOString().slice(0, 10),
            payAmt: _amount?.toString(),
            beneVan: beneVan,
            paymentRefNo: paymentMode === "DM" ? selectedMandate : "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: ""
        }
    }
    else if (txnType === "R") {
        paySec = {
            payMode: paymentMode,
            micr: micr,
            ifsc: ifsc,
            accType: accType,
            accNo: accNo,
            payDate: "",
            payAmt: "",
            beneVan: beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: ""
        }
    } else if (txnType === "V") {
        paySec = {
            payMode: paymentMode,
            micr: micr,
            ifsc: ifsc,
            accType: accType,
            accNo: accNo,
            payDate: new Date().toISOString().slice(0, 10),
            payAmt: _amount?.toString(),
            beneVan: beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: ""
        }
    }
    else if (txnType === "E") {
        paySec = {
            payMode: paymentMode,
            micr: micr,
            ifsc: ifsc,
            accType: accType,
            accNo: accNo,
            payDate: "",
            payAmt: _amount?.toString(),
            beneVan: beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: ""
        }
    }

    return paySec;

}

export function getPayOutSec(txnType: string, micr: string, ifsc: string, accType: string, accNo: string): any {
    payOutDtl = {
        invAccNo: accNo,
        micr: micr,
        ifsc: ifsc
    }
    return payOutDtl;

}

export function getSchList(txnType: string, entUnqItrn: string, rtaAmcCode: string, rtaSchCode: string, outRtaSchCode: string, folioSelectionMode: string, selectedFolio: any, option: any, _amount: string | undefined, payOutFlag: string, payOutDtl: any, txnVolTyp: string): any {
    schList = [];
    if (txnType === "B") {
        schList.push({
            entUnqItrn: entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: rtaSchCode,
            outRtaSchCode: outRtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio == null ? "NEW" : selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: _amount ?? "",
            payOutFlag: "",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""

        });
    } else if (txnType === "O") {
        let amount = "";
        if (txnVolTyp === "A") {
            amount = _amount ?? "0";
        } else {
            amount = parseFloat(_amount ?? "0").toFixed(2);
        }

        schList.push({
            entUnqItrn: entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: outRtaSchCode,
            outRtaSchCode: rtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: "",
            payOutFlag: "",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""

        });
    }
    else if (txnType === "R") {
        schList.push({
            entUnqItrn: entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: rtaSchCode,
            outRtaSchCode: outRtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio,
            divOpt: "",
            txnVolTyp: txnVolTyp ?? "",
            vol: txnVolTyp == "E" ? "" : _amount,
            payOutFlag: "Y",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""

        });
    } else if (txnType === "J") {
        schList.push({
            entUnqItrn: entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: rtaSchCode,
            outRtaSchCode: outRtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: _amount ?? "",
            payOutFlag: "",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""

        });
    }
    return schList;
}



export function getSysSchList(entUnqItrn: string, rtaAmcCode: string, rtaSchCode: string, outRtaSchCode: string, folioSelectionMode: string, selectedFolio: any, option: any, _amount: string | undefined, selectedFrequency: string, sipDate: string, sipMonth: string, sipYear: string, end_month: string, end_year: string, payOutDtl: any, txnType: any) {
    sysSchList = [];
    if (txnType === "J") {
        sysSchList.push({
            entUnqItrn: entUnqItrn,
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: rtaSchCode,
            outRtaSchCode: outRtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio === null ? "NEW" : selectedFolio,
            divOpt: "",
            txnVolTyp: "F",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth: sipMonth.length > 1 ? sipMonth : "0" + sipMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "Y",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""
        });

    } else if (txnType === "E") {
        sysSchList.push({
            entUnqItrn: entUnqItrn,
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: outRtaSchCode,
            outRtaSchCode: rtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: "F",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth: sipMonth.length > 1 ? sipMonth : "0" + sipMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""
        });
    }

    else {
        sysSchList.push({
            entUnqItrn: entUnqItrn,
            rtaAmcCode: rtaAmcCode,
            rtaSchCode: rtaSchCode,
            outRtaSchCode: outRtaSchCode,
            //folio: folioSelectionMode === "new" ? "NEW" : selectedFolio?.folio_no ?? "NEW",
            folio: selectedFolio === null ? "NEW" : selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnType?.txnVolTyp ?? "",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth: sipMonth.length > 1 ? sipMonth : "0" + sipMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "",
            payOutDtl: payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: ""
        });
    }
    return sysSchList;

}


export function getSubSeqSec(transactionType: string, payMode: string, micr: string, ifsc: string, accType: string, accNo: string, mandateRefNo: string): any {


    subSeqSec = {
        payMode: payMode,
        invAccType: accType,
        invAccNo: accNo,
        micr: micr,
        ifsc: ifsc,
        paymentRefNo: "",
        mandateRefNo: mandateRefNo
        //mandateRefNo: "UTIB7020511252010392"
    }


    return subSeqSec;

}