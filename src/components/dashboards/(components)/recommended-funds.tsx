'use client'
import React from 'react';
import { TrendingUp, Star, AlertCircle, Sparkles, Shield, Zap, Calendar, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Golden Black Theme
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)"
};

interface RecommendedFund {
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

interface RecommendedFundsProps {
  data: RecommendedFund[];
  onSchemeClick: (scheme: RecommendedFund) => void;
  loading?: boolean;
}

const RecommendedFunds: React.FC<RecommendedFundsProps> = ({ data, onSchemeClick, loading = false }) => {
  const safeData = Array.isArray(data) ? data : [];

  // Function to determine risk badge color (dark theme)
  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <h2 className="text-lg font-semibold text-[#F9FAFB]">Trending Funds</h2>
            </div>
            <div className="h-5 w-12 bg-[#2A2A2A] rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-3 bg-[#1F1A1A] rounded-lg animate-pulse border border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2A2A2A] rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#2A2A2A] rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-[#2A2A2A] rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!safeData || safeData.length === 0) {
    return (
      <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#F9FAFB]">Trending Funds</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#1F1A1A] rounded-full flex items-center justify-center border border-[#2A2A2A]">
            <AlertCircle className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <p className="text-[#9CA3AF] mb-2">No trending funds available</p>
          <p className="text-[#9CA3AF] text-sm opacity-70">Fund recommendations will appear here once available</p>
        </div>
      </div>
    );
  }

  const formatReturn = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return 'text-[#9CA3AF]';
    return value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]';
  };

  const getReturnIcon = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return null;
    return value >= 0 
      ? <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
      : <ArrowDownRight className="w-3 h-3 text-[#EF4444]" />;
  };

  // Get additional returns based on available data
  const getAdditionalReturn = (fund: RecommendedFund) => {
    if (fund.return_3m !== undefined) return { label: '3M', value: fund.return_3m };
    if (fund.return_6m !== undefined) return { label: '6M', value: fund.return_6m };
    if (fund.return_3y !== undefined) return { label: '3Y', value: fund.return_3y };
    if (fund.return_5y !== undefined) return { label: '5Y', value: fund.return_5y };
    return null;
  };

  return (
    <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden">
      {/* Header Section - Golden Theme */}
      <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#F9FAFB]">Trending Funds</h2>
          </div>
          {safeData.length > 0 && (
            <div className="px-2 py-1 bg-[#F59E0B]/20 rounded-lg">
              <span className="text-xs text-[#F59E0B] font-medium">{safeData.length} Funds</span>
            </div>
          )}
        </div>
      </div>

      {/* Funds List - Dark Theme */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          {safeData.slice(0, 5).map((fund, index) => {
            const additionalReturn = getAdditionalReturn(fund);
            
            return (
              <div
                key={fund.id || fund.scheme_id || index}
                className="p-3 bg-[#1F1A1A] rounded-lg hover:bg-[#2A2A2A] transition-all duration-200 border border-[#2A2A2A] cursor-pointer group"
                onClick={() => onSchemeClick(fund)}
              >
                {/* Top Section - Scheme Info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                      index % 2 === 0 ? 'from-[#F59E0B] to-[#B45309]' : 'from-[#F59E0B] to-[#B45309]'
                    }`}>
                      <span className="text-white font-semibold text-sm">
                        {fund.scheme_name?.charAt(0) || 'F'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#F9FAFB] truncate group-hover:text-[#F59E0B] transition-colors">
                        {fund.scheme_name || 'Unnamed Scheme'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {fund.risk_level && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskBadgeColor(fund.risk_level)}`}>
                            {fund.risk_level}
                          </span>
                        )}
                        {fund.scheme_isin && (
                          <span className="text-xs text-[#9CA3AF] font-mono">
                            {fund.scheme_isin.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Returns Section */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2A]">
                  <div className="flex items-center gap-4">
                    {/* 1Y Return */}
                    <div>
                      <p className="text-xs text-[#9CA3AF]">1Y Return</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getReturnIcon(fund.return_1y)}
                        <span className={`text-sm font-semibold ${getReturnColor(fund.return_1y)}`}>
                          {formatReturn(fund.return_1y)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Return (if available) */}
                    {additionalReturn && (
                      <div>
                        <p className="text-xs text-[#9CA3AF]">{additionalReturn.label} Return</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getReturnIcon(additionalReturn.value)}
                          <span className={`text-sm font-semibold ${getReturnColor(additionalReturn.value)}`}>
                            {formatReturn(additionalReturn.value)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rating Placeholder with Golden Stars */}
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Rating</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 text-[#F59E0B] fill-current" />
                        <span className="text-xs font-medium text-[#F9FAFB]">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Link*/}
        {safeData.length > 5 && (
          <div className="mt-4 pt-3 border-t border-[#2A2A2A] text-center">
            <button 
              onClick={() => onSchemeClick(safeData[0])}
              className="text-sm text-[#F59E0B] hover:text-[#FBBF24] font-medium flex items-center justify-center gap-1 transition-colors group"
            >
              View All {safeData.length} Trending Funds
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedFunds;