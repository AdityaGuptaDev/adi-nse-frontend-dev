import api from '@/utils/api';

interface FolioRequest {
  pan_no: string;
  sch_name?: string;
}

export interface FolioItem {
  foliochk: string;
  sch_name: string;
    inv_name: string;
  holding_na: string;
  jnt_name1: string;
  jnt_name2: string;
  nom_name: string;
  nom2_name: string;
  nom3_name: string;
  broker_cod: string;
  bank_name: string;
  branch: string;
  ac_no: string;
  ac_type: string;
  ifsc_code: string;
  source_table:string;
   mutual_fund: string;
}

interface FolioResponse {
  data: {
    data: FolioItem[];
  };
}

export const getFolioDetails = async (params: FolioRequest): Promise<FolioItem[]> => {
  try {
    const response = await api.post<FolioResponse>('/partner/portfolio/detailsList', params);
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching folio data:', error);
    throw error;
  }
};