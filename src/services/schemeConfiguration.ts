import api from '@/utils/api';

export interface Scheme {
  scheme_name: string;
  fund_name: string;
  scheme_isin: string;
  risk_level: string;
  category_name: string;
}

export interface SchemeConfigRequest {
  search?: string;
  category?: string;
  risk_level?: string;
}

interface SchemeResponse {
  data: Scheme[];
}

export interface SaveSchemeConfigRequest {
  configurations: {
    color_id: number;
    description: string;
    scheme_name: string;
    fund_name: string;
    scheme_isin: string;
    category_name: string;
    risk_level?: string;
    percentage?: number;
  }[];
}

export interface SavedSchemeConfig {
  id?: number;
  color_id: number;
  color_name: string;
  color_description: string;
  scheme_description: string;
  scheme_name: string;
  fund_name: string;
  scheme_isin: string;
  category_name: string;
  risk_level?: string;
  percentage?: number; 
  created_at?: string;
  updated_at?: string;
}

export interface ColorMaster {
  id: number;
  color_name: string;
  description: string;
}

export interface ColorAllocation {
  color_id: number;
  color_name: string;
  total_allocation: number;
  remaining_allocation: number;
  is_fully_allocated: boolean;
}

// Interface for function response (available funds in modal)
export interface VedantFunctionFund {
  isin: string;
  scheme_id: number;
  scheme_name: string;
  risk_level: string;
  return_1d?: number;
  return_1w?: number;
  return_1mth?: number;
  return_3mth?: number;
  return_6mth?: number;
  return_1yr?: number;
  return_2yr?: number;
  return_3yr?: number;
  return_5yr?: number;
  return_7yr?: number;
  return_10yr?: number;
  return_15yr?: number;
}

// Interface for saved funds in table - UPDATED: removed category_name
export interface SavedVedantFund {
  category_id: number | null;
  id?: number;
  scheme_id: number;
  scheme_isin: string;
  scheme_name: string;
  risk_level: string;
  return_1d?: number;
  return_1w?: number;
  return_1m?: number;
  return_3m?: number;
  return_6m?: number;
  return_1y?: number;
  return_2y?: number;
  return_3y?: number;
  return_5y?: number;
  return_7y?: number;
  return_10y?: number;
  return_15y?: number;
  record_status?: number;
  created_at?: string;
  updated_at?: string;
}

// Combined interface for frontend usage
export type VedantRecommendedFund = VedantFunctionFund | SavedVedantFund;

class SchemeConfigurationService {
  // Scheme Configuration Methods
  static async getAllSchemes(params?: SchemeConfigRequest): Promise<Scheme[]> {
    try {
      const response = await api.get<SchemeResponse>('/scheme-configuration/getAllSchemes', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching scheme data:', error);
      throw new Error('Failed to fetch scheme data');
    }
  }

  static async getSchemesByRiskLevel(riskLevel: string): Promise<Scheme[]> {
    try {
      const allSchemes = await this.getAllSchemes();
      return allSchemes.filter(scheme => scheme.risk_level === riskLevel);
    } catch (error) {
      console.error('Error filtering schemes by risk level:', error);
      throw error;
    }
  }

  static async getSchemesByCategory(category: string): Promise<Scheme[]> {
    try {
      const allSchemes = await this.getAllSchemes();
      return allSchemes.filter(scheme => scheme.category_name === category);
    } catch (error) {
      console.error('Error filtering schemes by category:', error);
      throw error;
    }
  }

  static async searchSchemes(searchTerm: string): Promise<Scheme[]> {
    try {
      const allSchemes = await this.getAllSchemes();
      const lowerSearchTerm = searchTerm.toLowerCase();
      return allSchemes.filter(
        scheme =>
          scheme.scheme_name.toLowerCase().includes(lowerSearchTerm) ||
          scheme.scheme_isin.toLowerCase().includes(lowerSearchTerm) ||
          scheme.fund_name.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching schemes:', error);
      throw error;
    }
  }

  static async getUniqueCategories(): Promise<string[]> {
    try {
      const allSchemes = await this.getAllSchemes();
      const categories = [...new Set(allSchemes.map(scheme => scheme.category_name))];
      return categories.sort();
    } catch (error) {
      console.error('Error getting unique categories:', error);
      throw error;
    }
  }

  static async getUniqueRiskLevels(): Promise<string[]> {
    try {
      const allSchemes = await this.getAllSchemes();
      const riskLevels = [...new Set(allSchemes.map(scheme => scheme.risk_level))];
      return riskLevels.sort();
    } catch (error) {
      console.error('Error getting unique risk levels:', error);
      throw error;
    }
  }

  static async saveSchemeConfiguration(config: SaveSchemeConfigRequest): Promise<void> {
    try {
      await api.post('/scheme-configuration/saveConfiguration', config);
    } catch (error) {
      console.error('Error saving scheme configuration:', error);
      throw new Error('Failed to save scheme configuration');
    }
  }

  static async getSavedConfigurations(): Promise<SavedSchemeConfig[]> {
    try {
      const response = await api.get('/scheme-configuration/getConfigurations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching saved configurations:', error);
      throw new Error('Failed to fetch saved configurations');
    }
  }

  static async updateConfiguration(id: number, config: Partial<SavedSchemeConfig>): Promise<void> {
    try {
      await api.put(`/scheme-configuration/updateConfiguration/${id}`, config);
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw new Error('Failed to update configuration');
    }
  }

  static async deleteConfiguration(id: number): Promise<void> {
    try {
      await api.delete(`/scheme-configuration/deleteConfiguration/${id}`);
    } catch (error) {
      console.error('Error deleting configuration:', error);
      throw new Error('Failed to delete configuration');
    }
  }

  static async getAllColors(): Promise<ColorMaster[]> {
    try {
      const response = await api.get('/scheme-configuration/getColors');
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected response structure for colors:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching color data:', error);
      return [];
    }
  }

  static async getColorAllocation(colorId: number): Promise<ColorAllocation> {
    try {
      const response = await api.get(`/scheme-configuration/getColorAllocation/${colorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching color allocation:', error);
      throw new Error('Failed to fetch color allocation');
    }
  }

  static async getAllColorAllocations(): Promise<ColorAllocation[]> {
    try {
      const response = await api.get('/scheme-configuration/getAllColorAllocations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all color allocations:', error);
      throw new Error('Failed to fetch color allocations');
    }
  }

  // Vedant Recommended Funds Methods - UPDATED

  // Get available funds from function (for modal)
  static async getAvailableVedantFunds(): Promise<VedantFunctionFund[]> {
    try {
      const response = await api.get('/scheme-configuration/vedantRecommended/available');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching available vedant funds:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch available vedant funds';
      throw new Error(errorMessage);
    }
  }

  // Get saved funds from table
  static async getAllVedantRecommendedFunds(): Promise<SavedVedantFund[]> {
    try {
      const response = await api.get('/scheme-configuration/vedantRecommended/all');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching vedant recommended funds:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch vedant recommended funds';
      throw new Error(errorMessage);
    }
  }

  static async saveVedantRecommendedFund(fund: VedantFunctionFund | VedantFunctionFund[]): Promise<any> {
    try {
      console.log('Saving vedant recommended fund:', fund);
      
      let payload;
      if (Array.isArray(fund)) {
        payload = { recommendedFunds: fund };
      } else {
        payload = fund;
      }
      
      const response = await api.post('/scheme-configuration/vedantRecommended/add', payload);
      console.log('Save response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error saving vedant recommended fund:', error);
      
      if (error.response) {
        console.error('Backend response error:', error.response.data);
        console.error('Backend status:', error.response.status);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save vedant recommended fund';
      throw new Error(errorMessage);
    }
  }

  static async updateVedantRecommendedFund(id: number, fund: Partial<VedantFunctionFund>): Promise<any> {
    try {
      console.log('Updating vedant recommended fund:', { id, fund });
      const response = await api.put(`/scheme-configuration/vedantRecommended/update/${id}`, fund);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating vedant recommended fund:', error);
      
      if (error.response) {
        console.error('Backend response error:', error.response.data);
        console.error('Backend status:', error.response.status);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update vedant recommended fund';
      throw new Error(errorMessage);
    }
  }

  static async deleteVedantRecommendedFund(id: number): Promise<any> {
    try {
      console.log('Deleting vedant recommended fund:', id);
      const response = await api.delete(`/scheme-configuration/vedantRecommended/delete/${id}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting vedant recommended fund:', error);
      
      if (error.response) {
        console.error('Backend response error:', error.response.data);
        console.error('Backend status:', error.response.status);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete vedant recommended fund';
      throw new Error(errorMessage);
    }
  }

  // BC Schemes Method
  static async getBcSchemes(): Promise<any[]> {
    try {
      const response = await api.get('/scheme-configuration/getBcSchemes');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching BC schemes:', error);
      throw new Error('Failed to fetch BC scheme data');
    }
  }
}

export default SchemeConfigurationService;