import api from "@/utils/api";

export interface Transaction {
  id: string;
  folio_no: string;
  scheme: string;
  inv_name: string;
  traddate: string;
  postdate: string;
  purprice: string;
  units: string;
  amount: string;
  brokcode: string;
  trxn_natur: string;
  trxn_type_: string;
  bank_name: string;
  ac_no: string;
   mutual_fund: string;
  // Add other fields you need from the API response
}

interface TransactionSearchParams {
  pan?: string;
  folio?: string;
  scheme?: string;
    folio_no: string;
}

export const getTransactions = async (
  params: TransactionSearchParams
): Promise<Transaction[]> => {
  try {
    const response = await api.post("/mfu/portfolio/search", params);
    
    if (!response?.data?.data) {
      throw new Error("Invalid API response structure");
    }

  
    return response.data.data;
  } catch (error) {
    console.error("Transaction service error:", error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<{ message: string; id: string }> => {
  try {
    const response = await api.delete(`/mfu/portfolio/${transactionId}`);
    
    if (!response?.data) {
      throw new Error("Invalid API response structure");
    }

    return response.data;
  } catch (error) {
    console.error("Delete transaction error:", error);
    throw error;
  }
};