// app/services/portfolioService.ts
import api from '@/utils/api';

const API_BASE_URL = '/partner/portfolio/searchs';
const PORTFOLIO_DETAILS_URL = '/partner/portfolio/details';

// ---------------- Types ----------------

export interface ProcessedRow {
  id: number;
  folioNo: string;
  productName: string;
  transactionType: string;
  transactionNo: string;
  purchaseDate: string;
  balanceUnits: string;
  price: string;
  totalUnit: string;
  cost: string;
  costValue: string;
  divPaid: string;
  div: string;
  divReinv: string;
  days: number;
  currentNav: string;
  currentValue: string;
  profitLoss: string;
  absPercentage: string;
  cagr: string;
  schemeType: string;
  pan: string;
  invName: string;
  recordType: string;
  isExpanded?: boolean;
}

export interface ApiPortfolioItem {
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
  out_div_int: string;
  out_div_int_reinv: string;
  out_no_of_days: string;
  out_current_nav: string;
  out_current_val: string;
  out_sum_units: string;
  out_p_n_l: string;
  out_abs_per: string;
  out_cagr_per: string;
  out_sum_amount: string;
}

interface PortfolioDataWrapper {
  data: ApiPortfolioItem[];
  count: number;
}

export interface PortfolioResponse {
  data: PortfolioDataWrapper;
  msg: string;
}

export interface ClientDetails {
  email: string;
  mobile_no: string;
  address1: string;
  address2: string;
  address3: string;
  pincode: string;
  city: string;
}

interface PortfolioSummary {
  totalCost: string;
  totalCurrentValue: string;
  totalProfitLoss: string;
  totalUnits: string;
  totalAbsPercentage: string;
  totalCagrPercentage: string;
  assetTypes: Record<string, number>;
  subClassification: Record<string, number>;
}

// ---------------- APIs ----------------

export const fetchClientDetails = async (
  panNo: string,
  invName: string
): Promise<ClientDetails> => {
  try {
    const response = await api.post(PORTFOLIO_DETAILS_URL, {
      pan_no: panNo,
      inv_name: invName,
    });
    const firstItem = response.data?.data?.data?.[0] || {};
    return {
      email: firstItem.email || '',
      mobile_no: firstItem.mobile_no || '',
      address1: firstItem.address1 || '',
      address2: firstItem.address2 || '',
      address3: firstItem.address3 || '',
      city: firstItem.city || '',
      pincode: firstItem.pincode || '',
    };
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

export const fetchPortfolioDetails = async (
  invName: string,
  panNo: string,
): Promise<PortfolioResponse> => {
  try {
    const response = await api.post(API_BASE_URL, {
      inv_name: invName,
      pan: panNo,
    });
    return response.data as PortfolioResponse;
  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    throw error;
  }
};

export const fetchPortfolioDetails1 = async (
  invName: string,
  panNo: string,
  rpt_date: string,
): Promise<PortfolioResponse> => {
  try {
    const response = await api.post(API_BASE_URL, {
      inv_name: invName,
      pan: panNo,
      rpt_date: rpt_date,
    });
    return response.data as PortfolioResponse;
  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    throw error;
  }
};

// ---------------- Helpers ----------------

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper function to clean and parse numeric values
const cleanNumber = (value: string, defaultValue = '0'): string => {
  if (!value) return defaultValue;
  // Remove any non-numeric characters except decimal point and minus sign
  const cleaned = value.toString().replace(/[^\d.-]/g, '');
  return cleaned || defaultValue;
};

const parseSafeFloat = (value: string): number => {
  try {
    const cleaned = cleanNumber(value);
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
};

// ---------------- Data Processing ----------------

export const processPortfolioData = (
  items: ApiPortfolioItem[] = []
): ProcessedRow[] => {
  const rows: ProcessedRow[] = [];
  let rowId = 1;

  items.forEach((item) => {
    rows.push({
      id: rowId++,
      folioNo: item.out_folio_no || '',
      productName: item.out_scheme || '',
      transactionType: item.out_trxntype || '',
      transactionNo: item.out_trxnno || '',
      purchaseDate: formatDate(item.out_traddate),
      balanceUnits: cleanNumber(item.out_units),
      cost: cleanNumber(item.out_sum_amount),
      price: cleanNumber(item.out_purprice),
      totalUnit: cleanNumber(item.out_sum_units),
      costValue: cleanNumber(item.out_amount),
      divPaid: cleanNumber(item.out_div_int_reinv),
      div: cleanNumber(item.out_div_int),
      divReinv: cleanNumber(item.out_div_int_reinv),
      days: parseInt(cleanNumber(item.out_no_of_days)) || 0,
      currentNav: cleanNumber(item.out_current_nav),
      currentValue: cleanNumber(item.out_current_val),
      profitLoss: cleanNumber(item.out_p_n_l),
      absPercentage: cleanNumber(item.out_abs_per),
      cagr: cleanNumber(item.out_cagr_per),
      schemeType: item.out_scheme_typ || '',
      pan: item.out_source || '',
      invName: '',
      recordType: item.out_record_typ || '',
    });
  });

  return rows;
};

// Calculate aggregated data for a group of transactions (folio + scheme)
export const calculateGroupSummary = (transactions: ProcessedRow[]) => {
  if (!transactions || transactions.length === 0) {
    return {
      balanceUnits: 0,
      costValue: 0,
      currentValue: 0,
      profitLoss: 0,
      absPercentage: 0,
      weightedCagr: 0,
      days: 0
    };
  }

  // For parent records, we just use the values directly
  const parentRecord = transactions.find(t => t.recordType === 'P');
  if (parentRecord) {
    return {
      balanceUnits: parseSafeFloat(parentRecord.balanceUnits),
      costValue: parseSafeFloat(parentRecord.costValue),
      currentValue: parseSafeFloat(parentRecord.currentValue),
      profitLoss: parseSafeFloat(parentRecord.profitLoss),
      absPercentage: parseSafeFloat(parentRecord.absPercentage),
      weightedCagr: parseSafeFloat(parentRecord.cagr),
      days: parentRecord.days || 0
    };
  }

  // Fallback calculation if no parent record found
  const balanceUnits = transactions.reduce((sum, item) => 
    sum + parseSafeFloat(item.balanceUnits), 0);
  
  const costValue = transactions.reduce((sum, item) => 
    sum + parseSafeFloat(item.costValue), 0);
  
  const currentValue = transactions.reduce((sum, item) => 
    sum + parseSafeFloat(item.currentValue), 0);
  
  const profitLoss = currentValue - costValue;
  const absPercentage = costValue > 0 ? (profitLoss / costValue) * 100 : 0;
  
  return {
    balanceUnits,
    costValue,
    currentValue,
    profitLoss,
    absPercentage,
    weightedCagr: 0,
    days: 0
  };
};

export const calculateSummary = (
  processedData: ReturnType<typeof processPortfolioData> = []
): PortfolioSummary => {
  // Filter only parent records (P) for summary calculation
  const parentRecords = processedData.filter(item => item.recordType === 'P');
  
  if (!parentRecords || parentRecords.length === 0) {
    return {
      totalCost: '0.00',
      totalCurrentValue: '0.00',
      totalProfitLoss: '0.00',
      totalUnits: '0.00',
      totalAbsPercentage: '0.00',
      totalCagrPercentage: '0.00',
      assetTypes: {},
      subClassification: {},
    };
  }

  // Calculate totals using safe parsing
  const totalCost = parentRecords.reduce(
    (sum, item) => sum + parseSafeFloat(item.costValue),
    0
  );
  
  const totalCurrentValue = parentRecords.reduce(
    (sum, item) => sum + parseSafeFloat(item.currentValue),
    0
  );
  
  // FIX: Calculate profit/loss directly from cost and current value
  const totalProfitLoss = totalCurrentValue - totalCost;
  
  const totalUnits = parentRecords.reduce(
    (sum, item) => sum + parseSafeFloat(item.balanceUnits),
    0
  );
  
  const totalAbsPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  // Calculate weighted average CAGR based on cost value
  const totalCagrPercentage = parentRecords.reduce((sum, item) => {
    const itemCost = parseSafeFloat(item.costValue);
    const weight = totalCost > 0 ? itemCost / totalCost : 0;
    const itemCagr = parseSafeFloat(item.cagr);
    return sum + (itemCagr * weight);
  }, 0);

  const assetTypes = parentRecords.reduce((acc, item) => {
    const type = (item.schemeType || '').includes('Equity')
      ? 'Equity'
      : 'Other';
    const currentValue = parseSafeFloat(item.currentValue);
    acc[type] = (acc[type] || 0) + currentValue;
    return acc;
  }, {} as Record<string, number>);

  Object.keys(assetTypes).forEach((key) => {
    assetTypes[key] = totalCurrentValue > 0 
      ? parseFloat(((assetTypes[key] / totalCurrentValue) * 100).toFixed(2))
      : 0;
  });

  const subClassification = parentRecords.reduce((acc, item) => {
    const schemeName = (item.productName || '').toLowerCase();
    let classification = 'Other';

    if (schemeName.includes('large') && schemeName.includes('mid')) {
      classification = 'Large & Mid Cap Fund';
    } else if (schemeName.includes('large')) {
      classification = 'Largecap Fund';
    } else if (schemeName.includes('mid')) {
      classification = 'Midcap Fund';
    } else if (schemeName.includes('small')) {
      classification = 'Smallcap Fund';
    } else if (schemeName.includes('sector') || schemeName.includes('thematic')) {
      classification = 'Sector/Thematic Fund';
    } else if (schemeName.includes('liquid') || schemeName.includes('cash')) {
      classification = 'Liquid/Cash Fund';
    }

    const currentValue = parseSafeFloat(item.currentValue);
    acc[classification] = (acc[classification] || 0) + currentValue;
    return acc;
  }, {} as Record<string, number>);

  Object.keys(subClassification).forEach((key) => {
    subClassification[key] = totalCurrentValue > 0
      ? parseFloat(((subClassification[key] / totalCurrentValue) * 100).toFixed(2))
      : 0;
  });

  return {
    totalCost: totalCost.toFixed(2),
    totalCurrentValue: totalCurrentValue.toFixed(2),
    totalProfitLoss: totalProfitLoss.toFixed(2), // Now accurately calculated
    totalUnits: totalUnits.toFixed(2),
    totalAbsPercentage: totalAbsPercentage.toFixed(2),
    totalCagrPercentage: totalCagrPercentage.toFixed(2),
    assetTypes,
    subClassification,
  };
};