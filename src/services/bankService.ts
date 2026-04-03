import api from "@/utils/api";
import axios from "axios";
export const updateInvestorBankDetails = async (data: any) => {
  try {
    const res = await api.post("kyc/canUpdateInvestorBankDetails", data); //  new CAN modification route
    return res.data;
  } catch (error: any) {
    console.error("Error in updateInvestorBankDetails:", error);
    throw error;
  }
};



export const updateInvestorNomineeDetails  = async (data: any) => {
  try {
    const res = await api.post("kyc/can-investor-nominee", data); //  new CAN modification route
    return res.data;
  } catch (error: any) {
    console.error("Error in updateInvestorNomineeDetails:", error);
    throw error;
  }
};
