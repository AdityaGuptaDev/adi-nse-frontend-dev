type AnyObject = Record<string, any>;

export const templates: Record<string, AnyObject> = {
    B: {//Lumpsum

        txnType: "B",
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
        euinDeclaration: "N",
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
            directTranToAmcFlag: "",
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
    },
    V: { //SIP
        txnType: "V",
        entGroupRefNo: "",
        orderMode: "Z",
        can: "",
        canType: "I",
        reqPrntEnt: "",
        riaCode: "",
        arnCode: "",
        subArnCode: "",
        euin: "",
        euinDeclaration: "N",
        subBrokCode: "",
        branchRMIntCode: "",
        totAmt: "",
        sysSchList: [
            {
                entUnqItrn: "",
                rtaAmcCode: "",
                rtaSchCode: "",
                outRtaSchCode: "",
                folio: "NEW",
                divOpt: "N",
                txnVolTyp: "A",
                vol: "",
                frequency: "",
                day: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
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
        paySecFlag: "Y",
        paySec: {
            payMode: "DM",
            micr: "",
            ifsc: "",
            accType: "SB",
            accNo: "",
            payDate: "",
            payAmt: "",
            beneVan: "",
            paymentRefNo: "",
            paymentBankRefNo: "",
            mandateRefNo: "",
            paymentConfirmTs: "",
            amcPaymentTs: ""
        },
        subSeqPayFlag: "Y",
        subSeqSec: {
            payMode: "DM",
            invAccType: "SB",
            invAccNo: "123456",
            micr: "110240140",
            ifsc: "HDFC0001220",
            paymentRefNo: "",
            mandateRefNo: "TRIT1234"
        },
        logDtl: {
            deviceType: "W",
            custIpAddress: "111.11.0.000"
        }
    },

    J: { //SWP
        txnType: "J",
        entGroupRefNo: "",
        orderMode: "Z",
        can: "",
        canType: "I",
        reqPrntEnt: "",
        riaCode: "",
        arnCode: "",
        subArnCode: "",
        euin: "",
        euinDeclaration: "Y",
        subBrokCode: "",
        branchRMIntCode: "",
        totAmt: "",
        sysSchList: [
            {
                entUnqItrn: "",
                rtaAmcCode: "",
                rtaSchCode: "",
                outRtaSchCode: "",
                folio: "",
                divOpt: "",
                txnVolTyp: "F",
                vol: "",
                frequency: "",
                day: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                payOutFlag: "N",
                payOutDtl: {
                    invAccNo: "",
                    micr: "",
                    ifsc: ""
                },
                priOtpFlag: "B",
                priMob: "",
                priEmail: ""
            }
        ],
        dpSecFlag: "",
        dpSec: {
            dpType: "",
            dpAccNo: ""
        },
        paySecFlag: "",
        paySec: {
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
            amcPaymentTs: ""
        },
        subSeqPayFlag: "N",
        subSeqSec: {
            payMode: "",
            invAccType: "",
            invAccNo: "",
            micr: "",
            ifsc: "",
            paymentRefNo: ""
        },
        logDtl: {
            deviceType: "W",
            custIpAddress: "111.11.0.000"
        }
    },

    E: {//STP
        txnType: "E",
        entGroupRefNo: "",
        orderMode: "Z",
        can: "",
        canType: "I",
        reqPrntEnt: "",
        riaCode: "",
        arnCode: "",
        subArnCode: "",
        euin: "",
        euinDeclaration: "N",
        subBrokCode: "",
        branchRMIntCode: "",
        totAmt: "",
        sysSchList: [
            {
                entUnqItrn: "",
                rtaAmcCode: "",
                rtaSchCode: "",
                outRtaSchCode: "",
                folio: "",
                divOpt: "N",
                txnVolTyp: "F",
                vol: "",
                frequency: "M",
                day: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                payOutFlag: "",
                payOutDtl: {
                    invAccNo: "",
                    micr: "",
                    ifsc: ""
                },
                priOtpFlag: "B",
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
            amcPaymentTs: ""
        },
        subSeqPayFlag: "N",
        subSeqSec: {
            payMode: "",
            invAccType: "",
            invAccNo: "",
            micr: "",
            ifsc: "",
            paymentRefNo: ""
        },
        logDtl: {
            deviceType: "W",
            custIpAddress: "111.11.0.000"
        }
    },
    O: { //Switch

        txnType: "S",
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
        can: "XXXXXXXXX",
        reqPrntEnt: "",
        riaCode: "",
        arnCode: "",
        subArnCode: "",
        euin: "",
        euinDeclaration: "N",
        subBrokCode: "",
        branchRMIntCode: "",
        totAmt: "",
        schList: [
            {
                entUnqItrn: "02",
                mfuUtrn: "",
                rtaAmcCode: "AXF",
                rtaSchCode: "BDDPD",
                outRtaSchCode: "CMGPG",
                folio: "KARLGOIN",
                divOpt: "P",
                txnVolTyp: "E",
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
            deviceType: "W",
            custIpAddress: "000.00.0.000"
        }



    },
    R: { //Redeemp

        txnType: "R",
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
        can: "XXXXXXXXXX",
        reqPrntEnt: "",
        riaCode: "",
        arnCode: "ARN-XXXX",
        subArnCode: "",
        euin: "",
        euinDeclaration: "N",
        subBrokCode: "",
        branchRMIntCode: "",
        totAmt: "10000",
        schList: [
            {
                entUnqItrn: "02",
                mfuUtrn: "",
                rtaAmcCode: "AXF",
                rtaSchCode: "CMGPG",
                outRtaSchCode: "",
                folio: "KARLGOIN",
                divOpt: "",
                txnVolTyp: "E",
                vol: "5000",
                payOutFlag: "Y",
                payOutDtl: {
                    invAccNo: "20141113",
                    micr: "XXXXXXXX",
                    ifsc: "XXXXXXXXXXX"
                },
                priOtpFlag: "",
                priMob: "",
                priEmail: ""
            }
        ],
        dpSecFlag: "",
        dpSec: {
            dpType: "",
            dpAccNo: ""
        },
        paySecFlag: "",
        paySec: {
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
            deviceType: "W",
            custIpAddress: "000.00.0.000"
        }

    },

};
