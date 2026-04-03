import api from '@/utils/api';
import getConfig from '@/utils/config';
import { PortfolioApiResponse, PortfolioItem } from './type';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

export const fetchPortfolioDetails = async (): Promise<PortfolioItem[]> => {
  try {
    const response = await api.post<PortfolioApiResponse>(`${ApiUrl}/partner/portfolio/detailsListAll`);
    return response.data.data.data;
  } catch (error: any) {
    console.error('Error fetching portfolio details:', error?.message || error);
    throw new Error(`Failed to fetch portfolio details: ${error?.message || 'Unknown error'}`);
  }
};
