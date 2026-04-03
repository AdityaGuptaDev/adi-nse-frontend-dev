import api from '@/utils/api';
import getConfig from '@/utils/config';





const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);


interface PortfolioSearchParams {
  inv_name: string;
  pan: string;
}

interface PortfolioItem {
  scheme: string;
  inv_name: string;
  folio_no: string;
  trxntype: string;
  purprice: string;
  units: string;
  amount: string;
  pan: string;
  traddate: string;
  file_path: string;
  created_at: string;
  updated_at: string;
  source: string;
}

interface PortfolioResponse {
  data: {
    data: PortfolioItem[];
    count: number;
  };
  msg: string;
}

export const searchInvestorPortfolio = async (params: PortfolioSearchParams): Promise<PortfolioResponse> => {
  try {
    const response = await api.post(`${ApiUrl}/mfu/investor/search`, params);
    return response.data;
  } catch (error) {
    console.error('Error fetching investor portfolio:', error);
    throw error;
  }
};

// Helper function to calculate current value (mock - in real app you'd need current NAV)
const calculateCurrentValue = (units: number, purchasePrice: number): number => {
  // For demo purposes, we'll assume 10% growth
  const currentPrice = parseFloat(purchasePrice.toString()) * 1.10;
  return units * currentPrice;
};

export const calculatePortfolioMetrics = (portfolioData: PortfolioItem[]) => {
  // Active SIPs (count of all unique schemes)
  const activeSIPs = new Set(portfolioData.map(item => item.scheme)).size;

  // Total SIP Values (sum of all amounts)
  const totalSIPValue = portfolioData.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  // Current AUM (sum of current values of all investments)
  const currentAUM = portfolioData.reduce((sum, item) => {
    const units = parseFloat(item.units);
    const price = parseFloat(item.purprice);
    return sum + calculateCurrentValue(units, price);
  }, 0);

  // Growth Rate (month-over-month)
  const monthlyGrowth = calculateGrowthRate(portfolioData);

  // Monthly Cash Flow (group by month)
  const monthlyCashFlow = calculateMonthlyCashFlow(portfolioData);

  // Recent 5 Transactions
  const recentTransactions = [...portfolioData]
    .sort((a, b) => new Date(b.traddate).getTime() - new Date(a.traddate).getTime())
    .slice(0, 5);

  // Top Purchases
  const topPurchases = [...portfolioData]
    .filter(item => item.trxntype === 'Purchase')
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  // Top Redemptions
  const topRedemptions = [...portfolioData]
    .filter(item => item.trxntype === 'Redemption')
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  return {
    activeSIPs,
    totalSIPValue,
    currentAUM,
    monthlyGrowth,
    monthlyCashFlow,
    recentTransactions,
    topPurchases,
    topRedemptions,
    // For your specific requests:
    topPurchase: topPurchases[0]?.amount || '0',
    topRedemption: topRedemptions[0]?.amount || '0',
    // Mock data for rejections and new SIPs (not in original data)
    rejections: '0', // Would need API to provide this
    newSIPs: '0' // Would need API to provide this
  };
};

const calculateGrowthRate = (portfolioData: PortfolioItem[]): number => {
  if (portfolioData.length < 2) return 0;
  
  // Group by month and calculate net flow
  const monthlyData: Record<string, number> = {};

  portfolioData.forEach(item => {
    const date = new Date(item.traddate);
    const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
    const amount = parseFloat(item.amount);

    if (item.trxntype === 'Purchase') {
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + amount;
    } else if (item.trxntype === 'Redemption') {
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) - amount;
    }
  });

  const months = Object.keys(monthlyData).sort();
  if (months.length < 2) return 0;

  const currentMonth = monthlyData[months[months.length - 1]];
  const prevMonth = monthlyData[months[months.length - 2]];

  if (prevMonth === 0) return 0;

  return ((currentMonth - prevMonth) / prevMonth) * 100;
};

const calculateMonthlyCashFlow = (portfolioData: PortfolioItem[]) => {
  const monthlyData: Record<string, { purchases: number; redemptions: number }> = {};

  portfolioData.forEach(item => {
    const date = new Date(item.traddate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const amount = parseFloat(item.amount);

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { purchases: 0, redemptions: 0 };
    }

    if (item.trxntype === 'Purchase') {
      monthlyData[monthYear].purchases += amount;
    } else if (item.trxntype === 'Redemption') {
      monthlyData[monthYear].redemptions += amount;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    purchases: data.purchases,
    redemptions: data.redemptions,
    netFlow: data.purchases - data.redemptions
  }));
};