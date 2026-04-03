import api from "@/utils/api";

import getConfig from '@/utils/config';
import { ApiPartner, ApiPartnerListResponse } from "./partnerTypes";
const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);




export const getPartnerList = async (): Promise<ApiPartner[]> => {
  try {
    const response = await api.get<ApiPartnerListResponse>(`${ApiUrl}/partner/partnerList`);
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching partner list:', error);
    throw error;
  }
};