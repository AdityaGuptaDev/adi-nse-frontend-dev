export interface FolioDetailsSection {
    holdNat?: string;
    taxStatus?: string;
    priPanOrPekrn?: string;
    secPanOrPekrn?: string;
    thrPanOrPekrn?: string;
    gurPanOrPekrn?: string;
}

export interface PayOutDetails {
    invAccNo?: string;
    micr?: string;
    ifsc?: string;
}

export interface Schemes {
    entUnqItrn: string;
    mfuUtrn?: string;
    rtaAmcCode: string;
    rtaSchCode: string;
    outRtaSchCode?: string;
    folio: string;
    divOpt: string;
    txnVolTyp: string;
    vol: string;
    frequency: string;
    day: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    payOutFlag?: string;
    payOutDtl?: PayOutDetails;
    priOtpFlag?: string;
    priMob?: string;
    priEmail?: string;
}

export interface DpSection {
    dpType?: string;
    dpAccNo?: string;
}

export interface PaySection {
    directTranToAmcFlag?: string;
    payMode?: string;
    micr?: string;
    ifsc?: string;
    accType?: string;
    accNo?: string;
    payDate?: string;
    payAmt?: string;
    beneVan?: string;
    paymentRefNo?: string;
    paymentBankRefNo?: string;
    mandateRefNo?: string;
    paymentConfirmTs?: string;
    amcPaymentTs?: string;
}
export interface SubSeqSec {
    payMode?: string;
    invAccType?: string;
    invAccNo?: string;
    micr?: string;
    ifsc?: string;
    paymentRefNo?: string;
}

export interface LogDetails {
    deviceType: string;
    custIpAddress: string;
}

export interface TransactionTemplate {
    txnType: string;
    entGroupRefNo: string;
    orderMode: string;
    folioTxnFlag: string;
    folioDetSec?: FolioDetailsSection;
    can: string;
    canType: string;
    reqPrntEnt?: string;
    riaCode?: string;
    arnCode: string;
    subArnCode?: string;
    euin?: string;
    euinDeclaration?: string;
    subBrokCode?: string;
    branchRMIntCode?: string;
    totAmt?: string;
    schList: Schemes[];
    dpSecFlag?: string;
    dpSec?: DpSection;
    paySecFlag?: string;
    paySec?: PaySection;
    subSeqPayFlag?: string;
    subSeqSec: SubSeqSec;
    logDtl: LogDetails;
}

export class TransactionManager {
    private transaction: TransactionTemplate;

    constructor(initialData: Partial<TransactionTemplate>) {
        this.transaction = {
            txnType: '',
            entGroupRefNo: '',
            orderMode: '',
            folioTxnFlag: '',
            can: '',
            canType: '',
            arnCode: '',
            schList: [],
            logDtl: { deviceType: 'W', custIpAddress: '000.00.0.000' },
            subSeqSec: {
                payMode: '',
                invAccType: '',
                invAccNo: '',
                micr: '',
                ifsc: '',
                paymentRefNo: ''
            },
            ...initialData,
        };
    }

    setProperty<Key extends keyof TransactionTemplate>(
        key: Key,
        value: TransactionTemplate[Key]
    ) {
        this.transaction[key] = value;
    }

    addScheme(schedule: Schemes) {
        this.transaction.schList.push(schedule);
    }

    removeScheme(index: number) {
        if (index >= 0 && index < this.transaction.schList.length) {
            this.transaction.schList.splice(index, 1);
        }
    }

    deleteProperties(paths: string[]) {
        for (const path of paths) {
            const keys = path.replace(/\[(\d+)]/g, '.$1').split('.');
            let obj: any = this.transaction;

            for (let i = 0; i < keys.length - 1; i++) {
                if (obj[keys[i]] === undefined) {
                    obj = undefined;
                    break;
                }
                obj = obj[keys[i]];
            }

            if (obj && typeof obj === 'object') {
                delete obj[keys[keys.length - 1]];
            }
        }
    }

    getTransaction(): TransactionTemplate {
        return this.transaction;
    }

    getOrderedTransactionJSON(): any {
        const txn = this.transaction;
        return {
            txnType: txn.txnType,
            entGroupRefNo: txn.entGroupRefNo,
            orderMode: txn.orderMode,
            folioTxnFlag: txn.folioTxnFlag,
            folioDetSec: txn.folioDetSec,
            can: txn.can,
            canType: txn.canType,
            reqPrntEnt: txn.reqPrntEnt,
            riaCode: txn.riaCode,
            arnCode: txn.arnCode,
            subArnCode: txn.subArnCode,
            euin: txn.euin,
            euinDeclaration: txn.euinDeclaration,
            subBrokCode: txn.subBrokCode,
            branchRMIntCode: txn.branchRMIntCode,
            totAmt: txn.totAmt,
            schList: txn.schList.map(sch => ({
                entUnqItrn: sch.entUnqItrn,
                mfuUtrn: sch.mfuUtrn,
                rtaAmcCode: sch.rtaAmcCode,
                rtaSchCode: sch.rtaSchCode,
                outRtaSchCode: sch.outRtaSchCode,
                folio: sch.folio,
                divOpt: sch.divOpt,
                txnVolTyp: sch.txnVolTyp,
                vol: sch.vol,
                frequency: sch.frequency,
                day: sch.day,
                startMonth: sch.startMonth,
                startYear: sch.startYear,
                endMonth: sch.endMonth,
                endYear: sch.endYear,
                payOutFlag: sch.payOutFlag,
                payOutDtl: sch.payOutDtl,
                priOtpFlag: sch.priOtpFlag,
                priMob: sch.priMob,
                priEmail: sch.priEmail,
            })),
            dpSecFlag: txn.dpSecFlag,
            dpSec: txn.dpSec,
            paySecFlag: txn.paySecFlag,
            paySec: txn.paySec,
            subSeqPayFlag: txn.subSeqPayFlag,
            subSeqSec: txn.subSeqSec,
            logDtl: txn.logDtl
        };
    }
}
