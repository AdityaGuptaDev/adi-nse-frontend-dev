import api from '@/utils/api';

import getConfig from '@/utils/config';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

export interface Investor {
  id: number;
  amc_code: string;
  folio_no: string;
  prodcode: string;
  scheme: string;
  inv_name: string;
  pan: string;
  
  [key: string]: any; 
}

export interface ApiResponse {
  data: {
    data: Investor[];
    count: number;
  };
  msg: string;
}

export const fetchInvestorData = async (): Promise<Investor[]> => {
  try {
    const response = await api.get(`${ApiUrl}/mfu/portfolioValuationData`);
      console.log("Raw portfolio response:", response.data);

    const items = response?.data?.data?.data;

    if (!Array.isArray(items)) {
      console.warn("Portfolio API returned unexpected structure:", response.data);
      return [];
    }

    return items;
  } catch (error) {
    console.error('Error fetching portfolio valuation data:', error);
    return [];
  }
};

