import api from '@/utils/api';
import getConfig from '@/utils/config';
import { USER_DATA } from '@/utils/constants';
import { getLS } from '@/utils/helpers';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

interface DashboardResponse {
  data: {
    status: string;
    remark: string;
    totalCount: number;
    activeCount: number;
    aumSum: number;
    transcount: number;
    revenueCount: number;
    totalRm:number;
    ucoCount: number;
  };
  msg: string;
}

interface PortfolioResponse {
  data: {
    data: PortfolioItem[];
  };
  msg: string;
}


export interface PortfolioItem {
  out_record_typ: string;
  out_folio_no: string;
  out_mutual_fund: string;
  out_scheme: string;
  out_trxntype: string;
  out_trxnno: string;
  out_traddate: string | null;
  out_purprice: string;
  out_units: string;
  out_amount: string;
  out_scheme_typ: string;
  out_source: string;
  out_div_int_reinv: string;
  out_no_of_days: string;
  out_current_nav: string;
  out_current_val: string;
  out_p_n_l: string;
  out_abs_per: string;
  out_cagr_per: string;
}



export const fetchPortfolioByPAN = async (): Promise<PortfolioItem[]> => {
  try {
    const userData = getLS(USER_DATA);
    const pan = userData?.InvestorRegistration?.pan_no;

    if (!pan) {
      throw new Error("PAN number not found");
    }

    const response = await api.post<PortfolioResponse>(
      `${ApiUrl}/partner/portfolio/searchs`,
      { pan } 
    );

    return response.data.data.data; 
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }
};

export const PartnerDashboardService = {
  async getDashboardData(mobile: string): Promise<DashboardResponse['data']> {
    try {
      const response = await api.post<DashboardResponse>(`${ApiUrl}/partner/dashboard`, { mobile });
      return response.data.data; 
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export const fetchInvestmentsByPAN = async (pan: string) => {
  try {
    const response = await api.post(`${ApiUrl}/mfu/investor/search`, {
      pan
    });
    return response.data.data.data; 
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

export const BirthdayService = {
  async getBirthdays() {
    try {
      const response = await api.get(`${ApiUrl}/partner/birthdays`);
      return response.data.data.data; 
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      return [];
    }
  }
};



export const PartnerAdminService = {
  async getAdminCounts() {
    try {
      const response = await api.get(`${ApiUrl}/partner/adming-counts`);
      return response.data.data.data[0];
    } catch (error) {
      console.error('Error fetching admin counts:', error);
      throw error;
    }
  }
};




