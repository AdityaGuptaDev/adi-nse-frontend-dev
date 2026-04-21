export function getPaySec(
    txnType: string,
    paymentMode: string,
    micr: string,
    ifsc: string,
    accType: string,
    accNo: string,
    _amount: string | undefined,
    beneVan: string,
    selectedMandate: string
): any {
    const today = new Date().toISOString().slice(0, 10);

    if (txnType === "B") {
        // Lumpsum: `mandateRefNo` is only valid for the DM (PayEezz) payment
        // mode. Sending it for Net Banking / NEFT / RTGS / UPI causes MFU to
        // reject the order with "mandateRefNo should be empty".
        const isMandateBased = paymentMode === "DM";
        return {
            payMode: paymentMode,
            micr,
            ifsc,
            accType,
            accNo,
            payDate: today,
            payAmt: _amount?.toString() ?? "",
            beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: isMandateBased ? selectedMandate : "",
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    if (txnType === "V") {
        return {
            payMode: paymentMode,
            micr,
            ifsc,
            accType,
            accNo,
            payDate: today,
            payAmt: _amount?.toString() ?? "",
            beneVan,
            paymentRefNo: paymentMode === "DM" ? selectedMandate : "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    if (txnType === "R") {
        return {
            payMode: paymentMode,
            micr,
            ifsc,
            accType,
            accNo,
            payDate: "",
            payAmt: "",
            beneVan,
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: selectedMandate,
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    // STP Out — the outgoing STP leg has no bank payment; MFU expects an empty
    // payment section so it does not attempt a debit.
    if (txnType === "E" || txnType === "Y") {
        return {
            payMode: "",
            micr: "",
            ifsc: "",
            accType: "",
            accNo: "",
            payDate: "",
            payAmt: "",
            beneVan: "",
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: "",
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    // Switch Out ("O") — scheme-to-scheme, no bank leg. Previously this txn
    // type had no case, so the helper returned a module-level cached object
    // from the previous invocation, leaking Lumpsum/SIP bank details into the
    // Switch payload and causing MFU to reject it.
    if (txnType === "O") {
        return {
            payMode: "",
            micr: "",
            ifsc: "",
            accType: "",
            accNo: "",
            payDate: "",
            payAmt: "",
            beneVan: "",
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: "",
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    // SWP ("J") — payout from scheme to bank; paySec itself carries no debit.
    if (txnType === "J") {
        return {
            payMode: "",
            micr: "",
            ifsc: "",
            accType: "",
            accNo: "",
            payDate: "",
            payAmt: "",
            beneVan: "",
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: "",
            paymentConfirmTs: "",
            amcPaymentTs: "",
        };
    }

    return {};
}

export function getPayOutSec(
    _txnType: string,
    micr: string,
    ifsc: string,
    _accType: string,
    accNo: string
): any {
    return {
        invAccNo: accNo,
        micr,
        ifsc,
    };
}

export function getSchList(
    txnType: string,
    entUnqItrn: string,
    rtaAmcCode: string,
    rtaSchCode: string,
    outRtaSchCode: string,
    _folioSelectionMode: string,
    selectedFolio: any,
    option: any,
    _amount: string | undefined,
    _payOutFlag: string,
    payOutDtl: any,
    txnVolTyp: string
): any[] {
    const schList: any[] = [];

    if (txnType === "B") {
        schList.push({
            entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode,
            rtaSchCode,
            outRtaSchCode,
            folio: selectedFolio == null ? "NEW" : selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: _amount ?? "",
            payOutFlag: "",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    } else if (txnType === "O") {
        schList.push({
            entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode,
            rtaSchCode: outRtaSchCode,
            outRtaSchCode: rtaSchCode,
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: txnVolTyp === "E" ? "" : _amount ?? "",
            payOutFlag: "",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    } else if (txnType === "R") {
        schList.push({
            entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode,
            rtaSchCode,
            outRtaSchCode,
            folio: selectedFolio,
            divOpt: "",
            txnVolTyp: txnVolTyp ?? "",
            vol: txnVolTyp === "E" ? "" : _amount ?? "",
            payOutFlag: "Y",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    } else if (txnType === "J") {
        schList.push({
            entUnqItrn,
            mfuUtrn: "",
            rtaAmcCode,
            rtaSchCode,
            outRtaSchCode,
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnVolTyp ?? "",
            vol: _amount ?? "",
            payOutFlag: "",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    }

    return schList;
}


export function getSysSchList(
    entUnqItrn: string,
    rtaAmcCode: string,
    rtaSchCode: string,
    outRtaSchCode: string,
    _folioSelectionMode: string,
    selectedFolio: any,
    option: any,
    _amount: string | undefined,
    selectedFrequency: string,
    sipDate: string,
    sipMonth: string,
    sipYear: string,
    end_month: string,
    end_year: string,
    payOutDtl: any,
    txnType: any
): any[] {
    const sysSchList: any[] = [];
    const startMonth = sipMonth && sipMonth.length > 1 ? sipMonth : sipMonth ? "0" + sipMonth : "";

    if (txnType === "J") {
        sysSchList.push({
            entUnqItrn,
            rtaAmcCode,
            rtaSchCode,
            outRtaSchCode,
            folio: selectedFolio === null ? "NEW" : selectedFolio,
            divOpt: "",
            txnVolTyp: "F",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "Y",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    } else if (txnType === "E") {
        sysSchList.push({
            entUnqItrn,
            rtaAmcCode,
            rtaSchCode: outRtaSchCode,
            outRtaSchCode: rtaSchCode,
            folio: selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: "F",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    } else {
        sysSchList.push({
            entUnqItrn,
            rtaAmcCode,
            rtaSchCode,
            outRtaSchCode,
            folio: selectedFolio === null ? "NEW" : selectedFolio,
            divOpt: option?.code?.toString() ?? "",
            txnVolTyp: txnType?.txnVolTyp ?? "",
            vol: _amount ?? "",
            frequency: selectedFrequency,
            day: sipDate,
            startMonth,
            startYear: sipYear,
            endMonth: end_month,
            endYear: end_year,
            payOutFlag: "",
            payOutDtl,
            priOtpFlag: "",
            priMob: "",
            priEmail: "",
        });
    }

    return sysSchList;
}


export function getSubSeqSec(
    _transactionType: string,
    payMode: string,
    micr: string,
    ifsc: string,
    accType: string,
    accNo: string,
    mandateRefNo: string
): any {
    return {
        payMode,
        invAccType: accType,
        invAccNo: accNo,
        micr,
        ifsc,
        paymentRefNo: "",
        mandateRefNo,
    };
}
