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
export const searchMorningstarFundByName = async (values: any) => {
    const result: any = await api.post(`/mfu/morningstar`, values);
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


export const submitEmandate = async (values: any) => {
    const result: any = await api.get(`/mfu/APIePayEezzService?${values}`);
    return result;
};

export const eMandateStatus = async (values: any) => {
    const result: any = await api.get(`/mfu/APIEPayEezzStatusService?${values}`);
    return result;
};

export const getMandates = async (values: any) => {
    //const result: any = await api.get(`/mfu/mandates`, values);
    const result: any = await api.get(`/mfu/mandates?investor_id=${values}`);
    return result;
};
export const updateMandates = async (id: any, values: any) => {
    //const result: any = await api.get(`/mfu/mandates`, values);
    const result: any = await api.post(`/mfu/update-mandates?id=${id}`, values);
    return result;
};



export const fetchClientIp = async () => {
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        return data.ip; // e.g., "123.45.67.89"
    } catch (error) {
        console.error("Failed to fetch IP address", error);
        return "0.0.0.0"; // fallback
    }
};

export const getInvestorPortfolio = async (values: any) => {
    //const result: any = await api.get(`/mfu/mandates`, values);
    const result: any = await api.get(`/mfu/investor-portfolio?investor_id=${values}`);
    return result;
};


export const getBankByFolio = async (folio: string) => {
    const result: any = await api.post(`/mfu/bank-by-folio`, {
        folio: folio
    });
    return result;
};


export const getSchemeByName = async (schemeName: string) => {
    const result: any = await api.post(`/mfu/scheme-by-name`, {
        scheme_name: schemeName
    });
    return result;
};






