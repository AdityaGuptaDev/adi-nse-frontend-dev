import api from "@/utils/api";


export const getInvestor = async (values: any) => {
    const result: any = await api.get(`/investor/search/${values}`);
    return result;

};

export const addAccountHolding = async (values: any) => {
    const result: any = await api.post(`/investor/create-holding`, values)
    return result
}


export const getAccountHolding = async (values: any) => {
    const result: any = await api.get(`/investor/account-holding/${values}`)
    return result
}

export const getBankAccount = async (values: any) => {
    const result: any = await api.get(`/investor/investor-bank/${values}`)
    return result
}

export const getUserByInvestorId = async (values: any) => {
    const result: any = await api.get(`/user/userByInvestorId/${values}`)
    return result
}


