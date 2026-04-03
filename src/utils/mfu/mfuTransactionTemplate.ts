export const transactionPayloadTemplate = {
    txnType: "",
    entGroupRefNo: "",
    orderMode: "Z",
    folioTxnFlag: "N",
    folioDetSec: {
        holdNat: "",
        taxStatus: "",
        priPanOrPekrn: "",
        secPanOrPekrn: "",
        thrPanOrPekrn: "",
        gurPanOrPekrn: ""
    },
    can: "",
    reqPrntEnt: "",
    riaCode: "",
    arnCode: "ARN-104974",
    subArnCode: "",
    euin: "",
    euinDeclaration: "Y",
    subBrokCode: "",
    branchRMIntCode: "",
    totAmt: 0,
    schList: [],
    dpSecFlag: "N",
    dpSec: {
        dpType: "",
        dpAccNo: ""
    },
    paySecFlag: "Y",
    paySec: {
        payMode: "OT",
        micr: "",
        ifsc: "",
        accType: "SB",
        accNo: "",
        payDate: "",
        payAmt: "",
        beneVan: "",
        paymentBankRefNo: "",
        mandateRefNo: "",
        paymentConfirmTs: "",
        amcPaymentTs: ""
    },
    logDtl: {
        deviceType: "W",
        custIpAddress: "0.0.0.0"
    }
};


export const transactionSwitchPayloadTemplate = {
    txnType: "S",
    entGroupRefNo: "V202507030195",
    orderMode: "Z",
    folioTxnFlag: "N",
    folioDetSec: {
        holdNat: "",
        taxStatus: "",
        priPanOrPekrn: "",
        secPanOrPekrn: "",
        thrPanOrPekrn: "",
        gurPanOrPekrn: ""
    },
    can: "14157AKA03",
    reqPrntEnt: "",
    riaCode: "",
    arnCode: "ARN-104974",
    subArnCode: "",
    euin: "",
    euinDeclaration: "Y",
    subBrokCode: "",
    branchRMIntCode: "",
    totAmt: "",
    schList: [
        {
            entUnqItrn: "1751535162952",
            mfuUtrn: "",
            rtaAmcCode: "H",
            rtaSchCode: "MCOG",
            outRtaSchCode: "104",
            folio: "KARLGOIN",
            divOpt: "N",
            txnVolTyp: "E",
            vol: "",
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
    dpSecFlag: "N",
    dpSec: {
        dpType: "",
        dpAccNo: ""
    },
    paySecFlag: "",
    paySec: {
        directTranToAmcFlag: "",
        payMode: "",
        micr: "",
        ifsc: "",
        accType: "",
        accNo: "",
        payDate: "",
        payAmt: "",
        beneVan: "",
        paymentBankRefNo: "",
        mandateRefNo: "",
        paymentConfirmTs: "",
        amcPaymentTs: ""
    },
    logDtl: {
        custIpAddress: "0.0.0.0"
    }
};


//Updated Transaction Templae

//For Individual Redeem,Purchase and Switch

export const ApiFinTechNormalTxnService = {

}


