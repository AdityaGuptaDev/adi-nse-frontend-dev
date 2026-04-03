// services/remapInvestorService.ts
import api from '@/utils/api';


export interface RemapInvestorItem {
  foliochk: string;
  broker_cod: string;
  sch_name: string;
  jnt_name1: string;
  jnt_name2: string;
  bank_name: string;
  branch: string;
  ac_type: string;
  ac_no: string;
  holding_na: string;
  amc_code: string;
  pan?: string; 
}

interface RemapInvestorResponse {
  data: {
    data: RemapInvestorItem[];
  };
  status?: string;
  message?: string;
}

export const getInvestorDataByPAN = async (
  pan_no: string
): Promise<RemapInvestorItem[]> => {
  try {
    if (!pan_no || pan_no.trim().length === 0) {
      throw new Error('PAN number is required');
    }

    const response = await api.post<RemapInvestorResponse>(
      '/partner/portfolio/detailsList',
      { pan_no: pan_no.trim().toUpperCase() }
    );

    const responseData = response.data.data?.data || [];

    return responseData.map((item) => ({
      ...item,
      pan: item.pan || pan_no 
    }));
  } catch (error) {
    console.error('Error fetching investor data by PAN:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch investor data'
    );
  }
};
