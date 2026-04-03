import { ApiFinTechNormalTxnService, ApiFinTechSystematicTxnService } from "@/api/transaction";
import { generateTransactionByType } from "@/utils/mfu/generateTransaction"

type TxnType = "B" | "V" | "E" | "J" | "O" | "R";

function isValidTxnType(type: string): type is TxnType {
    return ["B", "V", "E", "J", "O", "R"].includes(type);
}

export interface TransactionData {
    txnType: string;
    entGroupRefNo: string;
    can: string;
    totAmt: string;
    schList: any;
    paySecFlag: string;
    paySec: any;
    sysSchList?: any;
    subSeqPayFlag: any;
    subSeqSec: any;
    logDtl: any;
}



export interface TransactionPayload {
    investor_id: number;
    isin: string;
    goal_id: string;
    transaction: any;
}

export const executeMfuTransaction = async (
    parms: TransactionData,
    investor_id: number,
    isin: string
): Promise<any> => {
    try {
        if (isValidTxnType(parms.txnType)) {
            const payload = generateTransactionByType(parms.txnType, {
                entGroupRefNo: parms.entGroupRefNo ?? "",
                can: parms.can,
                arnCode: String(process.env.NEXT_PUBLIC_VEDANT_ARN),
                subArnCode: "",
                euin: parms.txnType === "J" ? "" : String(process.env.NEXT_PUBLIC_VEDANT_EUIN),
                totAmt: parms.totAmt,
                schList: parms.schList ?? [],
                paySecFlag: parms.paySecFlag,
                paySec: parms.paySec,
                sysSchList: parms.sysSchList ?? [],
                subSeqPayFlag: parms.subSeqPayFlag ?? "",
                subSeqSec: parms.subSeqSec ?? [],
                logDtl: parms.logDtl ?? []



            });

            if (!parms.schList || parms.schList.length === 0) {
                delete payload.schList;
            }

            if (!parms.sysSchList || parms.sysSchList.length === 0) {
                delete payload.sysSchList;
            }
            if (!parms.subSeqSec || parms.subSeqSec.length === 0) {
                delete payload.subSeqSec;
                delete payload.subSeqPayFlag;
            }


            /*Object.keys(payload).forEach(key => {
                const value = payload[key];
                if (
                    value === null ||
                    value === undefined ||
                    value === "" ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    delete payload[key];
                }
            });*/
            const transactionPayload: TransactionPayload = {
                investor_id: investor_id,
                isin: isin,
                goal_id: '',
                transaction: payload
            }
            console.log("Transaction Payload:", transactionPayload);

            //const payload=
            if (payload.txnType == "B" || payload.txnType == "R" || payload.txnType == "S") {
                const response = await ApiFinTechNormalTxnService(transactionPayload);
                console.log("Normal Transaction Resulst Response :- ", response)
                const result = JSON.parse(response?.data?.data);
                return response;


            } else {
                const response = await ApiFinTechSystematicTxnService(transactionPayload);
                const result = JSON.parse(response?.data?.data);
                return response;
            }

        }



    } catch (err) {
        throw err;
    }
}