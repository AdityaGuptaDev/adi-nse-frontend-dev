import api from '@/utils/api';
import getConfig from '@/utils/config';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

interface PortfolioSearchParams {
  inv_name: string;
  pan: string;
  rpt_date?: string;
}

export interface AdminCounts {
  total_bc: string;
  total_rm: string;
  total_investor: string;
  total_clients: string;
  total_partner: string;
  total_aum: string;
  active_investor: string;
  total_revenue: string;
}

export interface PortfolioItem {
  name: String;
  date: string | number | Date;
  mobile: string;
  email: string;
  rupee_bal: string;
  id: number;
  amc_code: string;
  folio_no: string;
  scheme: string;
  inv_name: string;
  trxn_natur: 'Purchase' | 'Redemption';
  traddate: string;
  postdate: string;
  purprice: string;
  units: string;
  amount: string;
  scheme_typ: string;
  tax_status: string;
  load: string;
  pan: string;
  bank_name: string;
  ac_no: string;
  rep_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvestorPortfolioItem {
  out_record_typ: string;
  out_arn: string;
  out_folio_no: string;
  out_mutual_fund: string;
  out_scheme: string;
  out_trxntype: string;
  out_trxnno: string;
  out_traddate: string | null;
  out_purprice: string;
  out_units: string;
  out_amount: string;
  out_sum_units: string;
  out_sum_amount: string;
  out_scheme_typ: string;
  out_source: string;
  out_div_int: string;
  out_div_int_reinv: string;
  out_no_of_days: string;
  out_current_nav: string;
  out_current_val: string;
  out_p_n_l: string;
  out_abs_per: string;
  out_xirr_per: string;
}

export interface RecommendedFund {
  id: number;
  scheme_id: string; 
  scheme_isin: string;
  scheme_name: string;
  risk_level: string;
  return_1y: number;
  return_3y?: number;
  return_5y?: number;
  return_1d?: number;
  return_1w?: number;
  return_1m?: number;
  return_3m?: number;
  return_6m?: number;
  return_2y?: number;
  return_7y?: number;
  return_10y?: number;
  return_15y?: number | null;
  record_status?: number;
  created_at?: string;
  updated_at?: string;
}

interface PortfolioResponse {
  data: {
    data: PortfolioItem[];
    count: number;
  };
  msg: string;
}

interface InvestorPortfolioResponse {
  data: {
    data: InvestorPortfolioItem[];
  };
  msg: string;
}

interface TopPerformingFund {
  id: number;
  scheme_id: number;
  Return1yr: number;
  AUM: number;
  SchemeMaster: {
    name: string;
    riskLevel: string;
    SchemeCategory: {
      Name: string;
    };
    SchemeSubcategory: {
      Name: string;
    };
  };
  OverallRating: number | null;
  performanceRating: number | null;
}

interface TopPerformingFundsResponse {
  data: TopPerformingFund[];
  msg: string;
}

export interface VedantRecommendedFund {
  id: number;
  scheme_id: number;
  scheme_isin: string;
  scheme_name: string;
  risk_level: string;
  return_1d: number;
  return_1w: number;
  return_1m: number;
  return_3m: number;
  return_6m: number;
  return_1y: number;
  return_2y: number;
  return_3y: number;
  return_5y: number;
  return_7y: number;
  return_10y: number;
  return_15y: number;
  record_status: number;
  created_at: string;
  updated_at: string;
}

interface VedantRecommendedFundsResponse {
  data: VedantRecommendedFund[];
  msg: string;
}

export const fetchInvestorPortfolio = async (invName: string, pan: string, rpt_date?: string) => {
  try {
    const requestBody: any = {
      inv_name: invName,
      pan: pan
    };

    if (rpt_date) {
      requestBody.rpt_date = rpt_date;
    }

    const response = await api.post(`${ApiUrl}/mfu/investor/search`, requestBody);
    
    console.log('Investor Portfolio API Response:', response.data);
    
    return response.data.data.data; 
  } catch (error) {
    console.error('Error fetching investor portfolio:', error);
    throw error;
  }
};

export interface XIRRResponse {
  data: {
    data: Array<{
      fn_xirr_all_funds: string;
    }>;
  };
  msg: string;
}

export const fetchPortfolioXIRR = async (pan: string, rpt_date: string): Promise<string | null> => {
  try {
    const requestBody = {
      pan: pan,
      rpt_date: rpt_date
    };

    console.log('Sending XIRR request with:', requestBody);

    const response = await api.post<XIRRResponse>(`${ApiUrl}/partner/portfolio/xirr`, requestBody);
    
    console.log('XIRR API Response:', response.data);
    
    if (response.data && 
        response.data.data && 
        Array.isArray(response.data.data.data) && 
        response.data.data.data.length > 0) {
      return response.data.data.data[0].fn_xirr_all_funds;
    } else {
      console.warn('Unexpected XIRR API response structure:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching portfolio XIRR:', error);
    
    if (error.response) {
      console.error('XIRR API Response Error:', error.response.data);
    } else if (error.request) {
      console.error('XIRR Network Error:', error.request);
    }
    
    return null;
  }
};

export const fetchInvestorPortfolio1 = async (invName: string, pan: string, rpt_date?: string): Promise<InvestorPortfolioItem[]> => {
  try {
    const requestBody: any = {
      inv_name: invName,
      pan: pan
    };

    if (rpt_date) {
      requestBody.rpt_date = rpt_date;
    }

    console.log('Sending portfolio request with:', requestBody);

    const response = await api.post<InvestorPortfolioResponse>(`${ApiUrl}/partner/portfolio/searchs`, requestBody);
    
    console.log('Portfolio API Response:', response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching investor portfolio:', error);
    
    if (error.response) {
      console.error('API Response Error:', error.response.data);
      throw new Error(`API Error: ${error.response.data?.msg || error.response.statusText}`);
    } else if (error.request) {
      console.error('Network Error:', error.request);
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export const PartnerCount = {
  async getPartnerCount(partnerId: string) {
    try {
      const response = await api.get(`${ApiUrl}/partner/partnerCount/${partnerId}`);
      return response.data?.data?.data?.[0]; 
    } catch (error) {
      console.error('Error fetching admin counts:', error);
      throw error;
    }
  }
};

export const searchPortfolio = async (params: PortfolioSearchParams): Promise<PortfolioResponse> => {
  try {
    const requestBody: any = {
      params: {
        inv_name: params.inv_name,
        pan: params.pan
      }
    };

  
    if (params.rpt_date) {
      requestBody.params.rpt_date = params.rpt_date;
    }
    
    const response = await api.post(`${ApiUrl}/mfu/portfolio/search`, requestBody);
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    return response.data as PortfolioResponse;
  } catch (error) {
    console.error('Error searching portfolio:', error);
    throw new Error('Failed to search portfolio');
  }
};

export const fetchAdminCounts = async (): Promise<AdminCounts> => {
  try {
    const response = await api.get(`${ApiUrl}/partner/adming-counts`);

    if (!response.data || !response.data.data || !response.data.data.data) {
      throw new Error('Invalid API response structure');
    }

    return response.data.data.data[0]; 
  } catch (error) {
    console.error('Error fetching admin counts:', error);
    throw new Error('Failed to fetch admin counts');
  }
};

// Top five funds 
export const fetchTopPerformingFunds = async (): Promise<TopPerformingFund[]> => {
  try {
    const response = await api.get<TopPerformingFundsResponse>(
      `${ApiUrl}/mutual-fund/get-top-performing-funds`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching top performing funds:', error);
    throw new Error('Failed to fetch top performing funds');
  }
};

// Vedant Recommended Funds API
export const fetchVedantRecommendedFunds = async (): Promise<VedantRecommendedFund[]> => {
  try {
    const response = await api.get<VedantRecommendedFundsResponse>(
      `${ApiUrl}/scheme-configuration/vedantRecommended/all`
    );
    
    console.log('Vedant Recommended Funds API Response:', response.data);
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn('Unexpected Vedant Recommended Funds API response structure:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching vedant recommended funds:', error);
    
    if (error.response) {
      console.error('Vedant Recommended Funds API Response Error:', error.response.data);
      throw new Error(`API Error: ${error.response.data?.msg || error.response.statusText}`);
    } else if (error.request) {
      console.error('Vedant Recommended Funds Network Error:', error.request);
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export const validateDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const getDefaultReportDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const fetchRecommendedFunds = async (): Promise<RecommendedFund[]> => {
  try {
    console.log(' Fetching recommended funds from API...');
    
    const response = await api.get(`${ApiUrl}/scheme-configuration/vedantRecommended/all`);
    console.log(' Recommended Funds API Response:', response.data);
    
    let fundsData: RecommendedFund[] = [];
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      fundsData = response.data.data;
      console.log(` Found ${fundsData.length} recommended funds`);
    } else if (response.data && Array.isArray(response.data)) {
      fundsData = response.data;
      console.log(` Found ${fundsData.length} recommended funds (alternative structure)`);
    } else {
      console.warn(' Unexpected API response structure:', response.data);
      fundsData = [];
    }
    
    return fundsData;

  } catch (error: any) {
    console.error(' Error fetching recommended funds:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};



// Interface for the API response
export interface PartnerCreatedStatusResponse {
  data: {
    results: {
      isUserCreated: number;
      missingFields: string[];
    };
  };
  msg: string;
}

export interface BcCreatedStatusResponse {
  data: {
    results: Array<{
      user_created: number;
    }>;
  };
  msg: string;
}


// Function to fetch partner creation status
export const fetchPartnerCreatedStatus = async (mobileNumber: string): Promise<number> => {
  try {
    const response = await api.get<PartnerCreatedStatusResponse>(
      `${ApiUrl}/partner/getPartnerCreatedStatus/${mobileNumber}`
    );
    console.log('Partner Created Status API Response:', response.data);
const isUserCreated =
  response.data.data.results.isUserCreated;
    // Check if results exist and return user_created status
   
      return isUserCreated;

   
    
    // If no results, assume not created
  } catch (error) {
    console.error('Error fetching partner created status:', error);
    
    // You can throw the error or return default value
    // Option 1: Throw error (let parent handle it)
    // throw error;
    
    // Option 2: Return default value (recommended)
    return 0; // Default to 0 (not created) on error
  }
};

export const fetchBcCreatedStatus = async (
  mobileNumber: string
): Promise<number> => {
  try {
    const response = await api.get<BcCreatedStatusResponse>(
      `${ApiUrl}/partner/getBcCreatedStatus/${mobileNumber}`
    );

    console.log("BC Created Status API Response:", response.data);

    return response.data?.data?.results?.[0]?.user_created ?? 0;
  } catch (error) {
    console.error("Error fetching BC created status:", error);
    return 0; // default: not created
  }
};
