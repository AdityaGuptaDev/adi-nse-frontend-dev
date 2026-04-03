import api from "@/utils/api";


export const generateReference = async (values: any) => {
    const result: any = await api.get(`/mfu/generate-reference`);
    return result;

};

export const ApiFinTechNormalTxnService = async (values: any) => {
    const result: any = await api.post(`/mfu/txn-normal`, values);
    return result;

};
export const ApiFinTechSystematicTxnService = async (values: any) => {
    const result: any = await api.post(`/mfu/txn-systematic`, values);
    return result;

};

export const searchByISIN = async (values: any) => {
    const result: any = await api.get(`/mfu/isin/${values}`);
    return result;
};

export const submitMfuTransaction = async (values: any) => {
    const result: any = await api.post(`/mfu/txn-normal`, values);
    return result;

};


export const searchByCan = async (values: any) => {
    console.log("CAN", values)
    const result: any = await api.get(`/mfu/can/${values}`);
    return result;

};

export const viewCanDetails = async (values: any) => {
    console.log("viewCanDetails:- ", values)
    const result: any = await api.get(`/mfu/viewCanDetails/${values}`);
    return result;

};

export const searchByAmcId = async (values: any) => {
    console.log("viewCanDetails:- ", values)
    const result: any = await api.get(`/mfu/amc/${values}`);
    return result;

};

export const searchByCanIdmfuBankDetails = async (values: any) => {
    console.log("searchByCanIdmfuBankDetails:- ", values)
    const result: any = await api.get(`/mfu/mfuBankDetails/${values}`);
    return result;

};






