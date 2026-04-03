import api from '@/utils/api';


import getConfig from '@/utils/config';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

export interface PortfolioValuationItem {
  transactions: never[];
  cagr: number;
  abs_return: number;
  holding_days: number;
  gain: number;
  current_value: number;
  purchase_value: number;
  current_nav: number;
  balance_units: number;
  soa: string;
  transaction_id: string;
  category: string;
  purchase_nav: number;
  id: number;
  amc_code: string;
  folio_no: string;
  prodcode: string;
  scheme: string;
  inv_name: string;
  trxntype: string;
  trxnno: string;
  trxnmode: string;
  trxnstat: string;
  usercode: string;
  usrtrxno: string;
  traddate: string;
  postdate: string;
  purprice: string;
  units: string;
  amount: string;
  brokcode: string;
  subbrok: string;
  brokperc: string;
  brokcomm: string;
  altfolio: string;
  rep_date: string;
  time1: string;
  trxnsubtyp: string;
  applicatio: string;
  trxn_natur: string;
  tax: string;
  total_tax: string;
  te_15h: string;
  micr_no: string;
  remarks: string;
  swflag: string;
  old_folio: string;
  seq_no: string;
  reinvest_f: string;
  mult_brok: string;
  stt: string;
  location: string;
  scheme_typ: string;
  tax_status: string;
  load: string;
  scanrefno: string;
  pan: string;
  inv_iin: string;
  targ_src_s: string;
  trxn_type_: string;
  ticob_trty: string;
  ticob_trno: string;
  ticob_post: string;
  dp_id: string;
  trxn_charg: string;
  eligib_amt: string;
  src_of_txn: string;
  trxn_suffi: string;
  siptrxnno: string;
  ter_locati: string;
  euin: string;
  euin_valid: string;
  euin_opted: string;
  sub_brk_ar: string;
  exch_dc_fl: string;
  src_brk_co: string;
  sys_regn_d: string;
  ac_no: string;
  bank_name: string;
  reversal_c: string;
  exchange_f: string;
  ca_initiat: string;
  gst_state_: string;
  igst_amoun: string;
  cgst_amoun: string;
  sgst_amoun: string;
  rev_remark: string;
  original_t: string;
  stamp_duty: string;
  folio_old: string;
  scheme_fol: string;
  amc_ref_no: string;
  request_re: string;
  transmissi: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioValuationResponse {
  data: {
    data: PortfolioValuationItem[];
    count: number;
  };
  msg: string;
}

export interface FolioResponse {
  folio_no: string;
  
}

export const fetchPortfolioValuationData = async (): Promise<PortfolioValuationItem[]> => {
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



export const fetchFolioAndSchemesByPan = async (pan: string): Promise<PortfolioValuationItem[]> => {
  try {
    const response = await api.post(`${ApiUrl}/mfu/portfolio/search`, { pan });
    return response?.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching folio/schemes by PAN:', error);
    return [];
  }
};


export const fetchPortfolioSearchDetails = async (
  pan: string,
  folio?: string,
  scheme?: string
): Promise<PortfolioValuationItem[]> => {
  try {
    const payload: Record<string, string> = { pan };
    if (folio) payload.folio_no = folio.trim();
    if (scheme) payload.scheme = scheme;

    const response = await api.post(`${ApiUrl}/mfu/portfolio/search`, payload);

    console.log("Response data from API:", response.data); 

    const items = response?.data?.data?.data || response?.data?.data;

    if (!Array.isArray(items)) {
      console.warn("Unexpected response format:", response?.data);
      return [];
    }

    return items;
  } catch (error) {
    console.error("Error fetching detailed portfolio search:", error);
    return [];
  }
};

export const fetchFoliosByPanAndScheme = async (
  pan: string,
  scheme: string
): Promise<string[]> => {  // Changed to return string[] since we only need folio numbers
  try {
    const response = await api.post(`${ApiUrl}/partner/getFolio`, {
      pan,
      scheme
    });

    console.log("Folio API Response:", response.data); // Debug log

    // Extract folio numbers from response
    const folios = response?.data?.data?.data?.map((item: { folio_no: string }) => item.folio_no) || [];
    
    console.log("Extracted folios:", folios); // Debug log

    return folios;
  } catch (error) {
    console.error("Error fetching folios by PAN and scheme:", error);
    return [];
  }
};


