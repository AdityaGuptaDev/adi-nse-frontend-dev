import api from '@/utils/api';
import getConfig from '@/utils/config';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);
interface PortfolioDetailsRequest {
  inv_name: string;
  pan_no: string;
}

interface PortfolioDetailsResponse {
  rpt_date: any;
  sch_name: any;
  folio_date: string | number | Date;
  foliochk: string;
  inv_name: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  email: string;
  phone_off: string;
  phone_res: string;
  inv_dob: string;
  mobile_no: string;
  pan_no: string;
  // Add other fields as needed
}

// Request type
export interface AumRecordDtlRequest {
  pan: string;
  date:string;
}

// Response type (matching the API structure)
export interface AumRecordDtlResponse {
  out_folio_no: string;
  out_arn: string;
  out_amc: string;
  out_mutual_fund:string;
  out_scheme: string;
  out_current_val: string;
  out_units: string;
  out_purprice:string;
  out_sum_amount:string;
 
}





// API response wrapper
export interface ApiResponse<T> {
  data: {
    data: T[];
  };
  msg: string;
}


export interface InvestmentLedgerDetail {
  out_brokcode: string;
  out_sub_brokcode?: string;
  out_amc: string;
  out_data_source?: string;
  out_investor: string;
  out_folio_no: string;
  out_scheme_type: string;
  out_scheme: string;
  out_txn_type: string;
  out_txn_no: string;
  out_txn_date: string;
  out_units: string;
  out_purprice: string;
  out_amount: string;
  out_stamp_duty?: string;
  out_total_amount: string;
  out_current_nav: string;
  out_sum_units: string;
  out_sum_inv: string;
  out_sum_curval: string;
  out_xirr: string;
}

export const investmentGetFolioDtl = async (
  pan: string,
  rpt_type: string,
  from_date: string,
  to_date: string
): Promise<InvestmentLedgerDetail[]> => {
  try {
    const response = await api.post(`/partner/getInvestmentLedgerData`, {
      pan,
      rpt_type,
      from_date,
      to_date,
    });
    return response.data.data.data as InvestmentLedgerDetail[];
  } catch (error) {
    console.error("Error fetching investment ledger details:", error);
    throw error;
  }
};


export const getPortfolioDetails = async (data: PortfolioDetailsRequest): Promise<PortfolioDetailsResponse[]> => {
  try {
    const response = await api.post(`${ApiUrl}/partner/portfolio/details`, data);
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    throw error;
  }
};

export const investmentGetFolio = async (pan: string): Promise<PortfolioDetailsResponse[]> => {
  try {
    const response = await api.post(`${ApiUrl}/partner/investmentGetFolio`, { pan });
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching investmentGetFolio details:', error);
    throw error;
  }
};



export const getPortfolioByPan = async (pan: string) => {
  try {
    const response = await api.post(`${ApiUrl}/mfu/portfolio/searchs`, { pan });
    // API returns nested data.data.data, so unwrap
    return response.data?.data?.data || [];
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }
};

export const getAumRecordDtl = async (
  data: AumRecordDtlRequest
): Promise<AumRecordDtlResponse[]> => {
  try {
    const response = await api.post<ApiResponse<AumRecordDtlResponse>>(
      `${ApiUrl}/partner/portfolio/searchs`,
      {
        pan: data.pan,
        rpt_date: data.date, 
      }
    );

    return response.data.data.data;
  } catch (error) {
    console.error("Error fetching AUM Record details:", error);
    throw error;
  }
};


interface TaxationSummaryRequest {
  pan: string;
  rpt_type: string;
  from_date: string;
  to_date: string;
  
}
interface TaxationSummaryRequests {
  pan: string;
  
  date: string;
  
}

// types/taxation.ts
export interface TaxationSummary {
  gain_type: string;
  fund_type: string;
  scheme: string;
  isin: string;
  folio: string;
  purchase_date: string | null;
  purchase_type: string | null;
  purchase_price: string | null;
  purchase_amount: string;
  purchase_amount_as_on: string | null;
  adjusted_purchase_price: string | null;
  cost_of_acquisition: string;
  units_sold: string;
  sell_date: string | null;
  sell_type: string | null;
  sell_price: string | null;
  sell_amount: string;
  cg_actual: string;
  cg_taxable: string;
  stt: string;
  tds: string;
}

export interface TaxationSummaryResponse {
  data: {
    data: TaxationSummary[];
  };
  msg: string;
}


export const getTaxationSummaryData = async (
  pan: string,
  rpt_type: string,
  from_date: string,
  to_date: string
): Promise<TaxationSummary[]> => {
  try {
    const payload: TaxationSummaryRequest = {
      pan,
      rpt_type,
      from_date,
      to_date,
    };

    const response = await api.post(`${ApiUrl}/partner/getTaxationSummaryData`, payload);

    return response.data.data.data; // returns TaxationSummary[]
  } catch (error) {
    console.error("Error fetching taxation summary data:", error);
    throw error;
  }
};


export const getTaxationSummaryData1 = async (
pan: string, date: string): Promise<TaxationSummary[]> => {
  try {
    const payload: TaxationSummaryRequests = {
      pan,
     
      date,
    };

    const response = await api.post(`${ApiUrl}/partner/getTaxationSummaryDataUnrealised`, payload);

    return response.data.data.data; // returns TaxationSummary[]
  } catch (error) {
    console.error("Error fetching taxation summary data:", error);
    throw error;
  }
};