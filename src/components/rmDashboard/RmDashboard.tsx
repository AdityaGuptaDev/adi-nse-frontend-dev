"use client";
import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Plus,
  BarChart3,
  Calculator,
  ArrowLeftRight,
  PlayCircle,
  BarChart2,
  Users,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  Star,
  AlertCircle,
  Handshake,
  FileText as FileTextIcon,
  Trophy,
  TrendingUp as TrendingUpIcon,
  UserCheck,
  UserX,
  Building2,
  Target as TargetIcon,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from "@/utils/api";
import getConfig from '@/utils/config';
import { getLS, removeLS } from '@/utils/helpers';
import { ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from '@/utils/constants';
import { cookieStorageKeys, removeCookieData, removeCookieToken } from '@/services/cookieStorageService';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

// Add interface for Top Performing Fund
interface TopPerformingFund {
  id: number;
  scheme_id: number;
  name: string;
  fundName: string;
  category: string;
  subcategory: string;
  riskLevel: string;
  return1yr: number;
  return3yr: number;
  return5yr: number;
  aum: number;
  nav: number;
  navChangePercentage: number;
  rating: number | null;
}

// Add this interface for RM details
interface RmDetails {
  total_investor: string;
  total_partner: string;
  total_bc: string;
  total_aum: string;
  total_transaction: string;
  mobile: string;
  email: string;
  name: string;
}

// Add interface for Managed Client
interface ManagedClient {
  id: number;
  name: string;
  email: string;
  mobile: string;
  pan: string;
  dob: string;
  client_type: 'investor' | 'partner' | 'bc';
  aadhaar: string | null;
}

// Add interface for Managed Clients Response
interface ManagedClientsResponse {
  data: {
    data: ManagedClient[];
    count: number;
  };
  msg: string;
}

const cacheRmDetails = (rmId: string, data: RmDetails) => {
  const cacheKey = `rm_${rmId}_details`;
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
};

const getCachedRmDetails = (rmId: string): RmDetails | null => {
  const cacheKey = `rm_${rmId}_details`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log("Using cached RM details");
        return data;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }
  return null;
};

//top performing funds
const cacheTopFunds = (data: TopPerformingFund[]) => {
  const cacheKey = 'top_performing_funds';
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
};

const getCachedTopFunds = (): TopPerformingFund[] | null => {
  const cacheKey = 'top_performing_funds';
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        console.log("Using cached top funds");
        return data;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }
  return null;
};

// Cache for managed clients
const cacheManagedClients = (rmId: string, data: ManagedClient[]) => {
  const cacheKey = `rm_${rmId}_clients`;
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
};

const getCachedManagedClients = (rmId: string): ManagedClient[] | null => {
  const cacheKey = `rm_${rmId}_clients`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log("Using cached managed clients");
        return data;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }
  return null;
};

// Compact RM Profile Component using Horizontal Card Layout
const CompactRMProfile = ({ rmDetails }: { rmDetails: RmDetails | null }) => {
  if (!rmDetails) return null;

  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between bg-[#111111] rounded-xl p-3 border border-[#2A2A2A] shadow-lg">
        {/* Left side - Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {rmDetails.name?.charAt(0).toUpperCase() || 'R'}
          </div>
          <div>
            <h1 className="text-base font-bold text-[#F9FAFB]">{rmDetails.name}</h1>
            <p className="text-xs text-[#9CA3AF]">Relationship Manager</p>
          </div>
        </div>

        {/* Right side - Contact info as badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F59E0B]/10 px-2.5 py-1 rounded-lg border border-[#F59E0B]/30">
            <Phone className="w-3 h-3 text-[#F59E0B]" />
            <span className="text-xs font-medium text-[#F59E0B]">{rmDetails.mobile}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/30">
            <Mail className="w-3 h-3 text-[#10B981]" />
            <span className="text-xs font-medium text-[#10B981] truncate max-w-[140px]">
              {rmDetails.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Overview Component
const StatsOverview = ({ rmDetails }: { rmDetails: RmDetails | null }) => {
  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

  const stats = [
    {
      label: "Total Investors",
      value: rmDetails ? rmDetails.total_investor : "...",
      icon: User,
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
    },
    {
      label: "Total Partners",
      value: rmDetails ? rmDetails.total_partner : "...",
      icon: User,
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
    },
    {
      label: "AUM",
      value: rmDetails ? formatNumber(parseFloat(rmDetails.total_aum)) : "...",
      icon: BarChart3,
      color: "bg-[#10B981]/20 text-[#10B981]",
    },
    {
      label: "Transactions",
      value: rmDetails ? formatNumber(parseFloat(rmDetails.total_transaction)) : "...",
      icon: ArrowLeftRight,
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
    },
  ];

  return (
    <div className="w-full px-4 py-4">
      <h2 className="text-lg font-semibold text-[#F9FAFB] mb-4">Performance Overview</h2>

      <div className="bg-[#111111] rounded-xl shadow-lg p-5 border border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          {stats.map((stat, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center px-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${stat.color}`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-[#F9FAFB] truncate">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#9CA3AF] font-medium truncate">
                    {stat.label}
                  </div>
                </div>
              </div>
              {idx < stats.length - 1 && (
                <div className="w-px h-12 bg-[#2A2A2A] mx-2"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// RM Quick Actions Component - Compact version
const RMQuickActions = () => {
  const router = useRouter();
  const handleRegister = async (userType: string) => {
    if (!sessionStorage.getItem(USER_DATA)) {
      removeCookieToken();
      removeCookieData(cookieStorageKeys.INIT_PATH);
    }

    removeLS(PROD_DATA);
    removeLS(TOKEN_PREFIX);
    removeLS(MENU_PREFIX);
    removeLS(FLAT_MENU);
    removeLS(USER_DATA);
    removeLS(ADMIN_INVESTER_DATA);

    router.push(`/register?userType=${userType}`);
  };

  const actions = [
    {
      icon: Plus,
      label: "Add Partner",
      color: "bg-[#10B981]/20 text-[#10B981]",
      onClick: () => handleRegister('Partner')
    },
    {
      icon: Plus,
      label: "Add Investor",
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
      onClick: () => handleRegister('Investor')
    },
    {
      icon: Search,
      label: "Fund Finder",
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: Calculator,
      label: "Calculator",
      color: "bg-[#EF4444]/20 text-[#EF4444]",
      onClick: () => router.push('/sip-calculator')
    },
    {
      icon: BarChart2,
      label: "Portfolio",
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
      onClick: () => router.push('/portfolio')
    },
    {
      icon: PlayCircle,
      label: "Start SIP",
      color: "bg-[#10B981]/20 text-[#10B981]",
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: User,
      label: "Reports",
      color: "bg-[#F59E0B]/20 text-[#F59E0B]",
      onClick: () => router.push('/search-report')
    },
  ];

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Quick Actions</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center p-4 bg-[#111111] rounded-lg border border-[#2A2A2A] hover:shadow-xl focus:shadow-xl transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none w-full hover:border-[#F59E0B]/50"
            tabIndex={0}
            aria-label={action.label}
            onClick={action.onClick}
          >
            <div
              className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}
            >
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-[#F9FAFB] text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Top Performing Funds Component - Non-clickable version
const TopPerformingFunds = ({ funds }: { funds: TopPerformingFund[] }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `₹${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    return `₹${num}`;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Very High Risk':
        return 'text-red-400 bg-red-500/20';
      case 'High Risk':
        return 'text-orange-400 bg-orange-500/20';
      case 'Medium Risk':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'Low Risk':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-[#9CA3AF] bg-[#2A2A2A]';
    }
  };

  const getReturnColor = (returnValue: number) => {
    return returnValue > 0 ? 'text-[#10B981]' : 'text-[#EF4444]';
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-[#F59E0B]/20">
          <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Top Performing Funds</h2>
      </div>

      <div className="bg-[#111111] rounded-xl shadow-lg p-4 border border-[#2A2A2A]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {funds.map((fund, index) => (
            <div
              key={fund.id}
              className="group bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-lg p-3 border border-[#2A2A2A] hover:border-[#F59E0B]/50 transition-all duration-200"
            >
              {/* Fund Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 w-full">
                  <div>
                    <span className="text-white font-bold text-sm"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#F9FAFB] truncate" title={fund.fundName}>
                      {truncateText(fund.fundName, 25)}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] truncate">
                      {truncateText(fund.category, 20)}
                    </p>
                  </div>
                </div>
                {fund.rating && (
                  <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                    <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs font-medium text-[#F9FAFB]">{fund.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">1Y Return</span>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className={`w-3 h-3 ${getReturnColor(fund.return1yr)}`} />
                    <span className={`text-sm font-bold ${getReturnColor(fund.return1yr)}`}>
                      {fund.return1yr > 0 ? '+' : ''}{fund.return1yr.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">3Y Return</span>
                  <span className={`text-sm font-bold ${getReturnColor(fund.return3yr)}`}>
                    {fund.return3yr > 0 ? '+' : ''}{fund.return3yr.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Fund Details */}
              <div className="pt-3 border-t border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(fund.riskLevel)}`}>
                    {fund.riskLevel.split(' ')[0]}
                  </div>
                  <div className="text-xs font-medium text-[#F59E0B]">
                    AUM: {formatNumber(fund.aum)}
                  </div>
                </div>
                <div className="text-xs text-[#9CA3AF] truncate">
                  NAV: ₹{fund.nav.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#9CA3AF]">
              <span className="font-medium text-[#F59E0B]">{funds.length}</span> top performing funds
            </div>
            <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                <span>Positive Returns</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                <span>Medium Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Managed Clients Section Component
const ManagedClientsSection = ({ clients }: { clients: ManagedClient[] }) => {
  const router = useRouter();

  const groupedClients = clients.reduce((acc, client) => {
    if (!acc[client.client_type]) {
      acc[client.client_type] = [];
    }
    acc[client.client_type].push(client);
    return acc;
  }, {} as Record<string, ManagedClient[]>);

  // Get type-specific details with subtle but distinct colors
  const clientTypeConfig = {
    investor: {
      title: "Investors",
      icon: UserCheck,
      headerColor: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
      iconBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
      countBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
      borderColor: "border-[#F59E0B]/20",
      hoverColor: "hover:bg-[#F59E0B]/5",
      textColor: "text-[#F59E0B]",
      actionColor: "text-[#F59E0B] hover:text-[#FBBF24]",
      description: "Individual investment clients",
      actionLabel: "View All Investors",
      actionPath: "/investors"
    },
    partner: {
      title: "Partners",
      icon: Handshake,
      headerColor: "bg-[#10B981]/10 border-[#10B981]/20",
      iconBg: "bg-[#10B981]/20 text-[#10B981]",
      countBg: "bg-[#10B981]/20 text-[#10B981]",
      borderColor: "border-[#10B981]/20",
      hoverColor: "hover:bg-[#10B981]/5",
      textColor: "text-[#10B981]",
      actionColor: "text-[#10B981] hover:text-[#059669]",
      description: "Business partners & associates",
      actionLabel: "View All Partners",
      actionPath: "/partners"
    },
    bc: {
      title: "Business Correspondents",
      icon: Building2,
      headerColor: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
      iconBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
      countBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
      borderColor: "border-[#F59E0B]/20",
      hoverColor: "hover:bg-[#F59E0B]/5",
      textColor: "text-[#F59E0B]",
      actionColor: "text-[#F59E0B] hover:text-[#FBBF24]",
      description: "Business correspondents & agents",
      actionLabel: "View All BCs",
      actionPath: "/business-correspondents"
    }
  };

  // Format date of birth
  const formatDOB = (dob: string) => {
    try {
      const date = new Date(dob);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dob;
    }
  };

  // Get client initials for avatar
const getInitials = (name: string | null | undefined): string => {
  if (!name) {
    return "??"; 
  }
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

  // Get client age from DOB
  const getAgeFromDOB = (dob: string) => {
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return null;
    }
  };

  // Get avatar color based on client type
  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'investor': return 'bg-[#F59E0B]/20 text-[#F59E0B]';
      case 'partner': return 'bg-[#10B981]/20 text-[#10B981]';
      case 'bc': return 'bg-[#F59E0B]/20 text-[#F59E0B]';
      default: return 'bg-[#2A2A2A] text-[#9CA3AF]';
    }
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#B45309] flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F9FAFB]">Managed Clients</h2>
            <p className="text-xs text-[#9CA3AF]">All your clients in one place</p>
          </div>
        </div>
        <div className="text-sm font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-lg border border-[#F59E0B]/30">
          Total: {clients.length}
        </div>
      </div>

      {/* Client Type Cards - Compact with subtle colors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.entries(clientTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const clientsOfType = groupedClients[type] || [];

          return (
            <div
              key={type}
              className={`rounded-lg border ${config.borderColor} bg-[#111111] overflow-hidden hover:shadow-xl transition-shadow duration-200`}
            >
              {/* Header */}
              <div className={`p-3 ${config.headerColor} border-b ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-md ${config.iconBg} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#F9FAFB]">{config.title}</h3>
                      <p className="text-xs text-[#9CA3AF]">
                        {clientsOfType.length} {clientsOfType.length === 1 ? 'client' : 'clients'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${config.countBg}`}>
                    {clientsOfType.length}
                  </span>
                </div>
              </div>

              {/* Client List */}
              <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
                {clientsOfType.length > 0 ? (
                  clientsOfType.slice(0, 4).map((client) => {
                    const age = getAgeFromDOB(client.dob);
                    return (
                      <div
                        key={client.id}
                        className={`p-3 border ${config.borderColor} rounded-md ${config.hoverColor} transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${getAvatarColor(client.client_type)}`}>
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#F9FAFB]">
                                {client.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-[#9CA3AF]">
                                  {age ? `${age}y` : formatDOB(client.dob)}
                                </span>
                                <span className="text-xs text-[#9CA3AF]">•</span>
                                <span className={`text-xs font-medium ${config.textColor}`}>
                                  {client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Details - Compact */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="truncate">
                            <div className="flex items-center gap-1 text-[#9CA3AF] mb-1">
                              <Mail className="w-3 h-3" />
                              <span>Email</span>
                            </div>
                            <a
                              href={`mailto:${client.email}`}
                              className="font-medium text-[#F9FAFB] hover:text-[#F59E0B] transition-colors truncate block"
                              title={client.email}
                            >
                              {client.email}
                            </a>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 text-[#9CA3AF] mb-1">
                              <Phone className="w-3 h-3" />
                              <span>Mobile</span>
                            </div>
                            <a
                              href={`tel:${client.mobile}`}
                              className="font-medium text-[#F9FAFB] hover:text-[#F59E0B] transition-colors"
                            >
                              {client.mobile}
                            </a>
                          </div>

                          <div className="col-span-2 mt-2 pt-2 border-t border-[#2A2A2A]">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[#9CA3AF] text-xs">PAN:</span>
                                <span className="font-mono font-medium text-[#F9FAFB] ml-1">
                                  {client.pan}
                                </span>
                              </div>
                              {client.aadhaar && (
                                <div>
                                  <span className="text-[#9CA3AF] text-xs">Aadhaar:</span>
                                  <span className="font-mono font-medium text-[#F9FAFB] ml-1">
                                    {client.aadhaar.slice(0, 4)}****{client.aadhaar.slice(-4)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 border border-dashed border-[#2A2A2A] rounded-md">
                    <UserX className="w-6 h-6 text-[#2A2A2A] mx-auto mb-2" />
                    <p className="text-sm text-[#9CA3AF]">No {config.title.toLowerCase()} found</p>
                    <button className="text-xs text-[#F59E0B] hover:text-[#FBBF24] font-medium mt-1">
                      + Add New
                    </button>
                  </div>
                )}

                {clientsOfType.length > 4 && (
                  <div className="text-center pt-2 border-t border-[#2A2A2A]">
                    <button
                      className={`inline-flex items-center gap-1 text-xs font-medium ${config.actionColor}`}
                      onClick={() => router.push(config.actionPath)}
                    >
                      View {clientsOfType.length - 4} more
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 p-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
              <span className="text-[#9CA3AF]">Investors: {groupedClients['investor']?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
              <span className="text-[#9CA3AF]">Partners: {groupedClients['partner']?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
              <span className="text-[#9CA3AF]">BCs: {groupedClients['bc']?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] font-sans">
      <div className="p-4 w-full">
        <div className="mb-4">
          <div className="flex items-center justify-between bg-[#111111] rounded-xl p-3 border border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 w-32 bg-[#2A2A2A] rounded animate-pulse mb-1"></div>
                <div className="h-3 w-24 bg-[#2A2A2A] rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-[#2A2A2A] rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-[#2A2A2A] rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-40 bg-[#2A2A2A] rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center bg-[#111111] rounded-lg shadow-sm p-4 border border-[#2A2A2A]">
                <div className="w-10 h-10 bg-[#2A2A2A] rounded-lg animate-pulse mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 w-20 bg-[#2A2A2A] rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-24 bg-[#2A2A2A] rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-32 bg-[#2A2A2A] rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center p-3 bg-[#111111] rounded-lg border border-[#2A2A2A]">
                <div className="w-10 h-10 bg-[#2A2A2A] rounded-lg animate-pulse mb-2"></div>
                <div className="h-3 w-12 bg-[#2A2A2A] rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Funds Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-48 bg-[#2A2A2A] rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#111111] rounded-lg p-3 border border-[#2A2A2A]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2A2A2A] rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#2A2A2A] rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-[#2A2A2A] rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-3 w-8 bg-[#2A2A2A] rounded animate-pulse"></div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-[#2A2A2A] rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-[#2A2A2A] rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-[#2A2A2A] rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-[#2A2A2A] rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#2A2A2A]">
                  <div className="flex justify-between mb-2">
                    <div className="h-6 w-12 bg-[#2A2A2A] rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-[#2A2A2A] rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-16 bg-[#2A2A2A] rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Managed Clients Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-48 bg-[#2A2A2A] rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111111] rounded-xl p-4 border border-[#2A2A2A]">
                <div className="h-8 w-32 bg-[#2A2A2A] rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3 p-3 bg-[#1F1A1A] rounded-lg">
                      <div className="w-10 h-10 bg-[#2A2A2A] rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-[#2A2A2A] rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-24 bg-[#2A2A2A] rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Error Component with user data info
const EnhancedError = ({ error, userData, onRetry }: { error: string, userData: any, onRetry: () => void }) => (
  <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-4">
    <div className="text-center max-w-2xl w-full">
      <AlertCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Authentication Required</h2>
      <p className="text-[#9CA3AF] text-base mb-6">{error}</p>

      {/* User Data Info */}
      {userData && (
        <div className="mb-6 p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30 text-left">
          <h3 className="font-bold text-[#F9FAFB] text-base mb-2">User Data Found:</h3>
          <div className="text-sm text-[#9CA3AF] space-y-1">
            <p><span className="font-medium text-[#F59E0B]">RM Name:</span> {userData.RM?.Name || userData.name || 'Not found'}</p>
            <p><span className="font-medium text-[#F59E0B]">Email:</span> {userData.RM?.email || userData.email || 'Not found'}</p>
            <p><span className="font-medium text-[#F59E0B]">Mobile:</span> {userData.RM?.mobile || userData.mobile || 'Not found'}</p>
            <p><span className="font-medium text-[#F59E0B]">RM ID:</span> {userData.RM?.id || 'Not found'}</p>
            <p><span className="font-medium text-[#F59E0B]">User ID:</span> {userData.user_id || 'Not found'}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white text-base rounded-lg hover:opacity-90 transition-colors flex items-center justify-center shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </button>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-2.5 bg-[#1F1A1A] text-[#F9FAFB] text-base rounded-lg hover:bg-[#2A2A2A] transition-colors shadow-lg border border-[#2A2A2A]"
        >
          Go to Login
        </button>
      </div>

      <div className="mt-8 text-sm text-[#9CA3AF]">
        <p>If the problem persists, please contact support with the information above.</p>
      </div>
    </div>
  </div>
);

// Main Relationship Manager Dashboard Component
const RelationshipManagerDashboard = () => {
  const [rmDetails, setRmDetails] = useState<RmDetails | null>(null);
  const [topFunds, setTopFunds] = useState<TopPerformingFund[]>([]);
  const [managedClients, setManagedClients] = useState<ManagedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const extractUserData = () => {
    console.log(" Extracting user data from USER_DATA...");
    const userData = getLS(USER_DATA);
    console.log(" Extracted user data:", userData);
    return userData;
  };

  const extractRmId = (): string | null => {
    const userData = extractUserData();
    if (!userData) {
      console.warn(" No USER_DATA found");
      return null;
    }

    console.log(" Extracting RM ID from USER_DATA:", userData);
    
    const rmId = 
      userData?.RM?.id?.toString() ||         
      userData?.rmId?.toString() ||
      userData?.id?.toString() ||            
      userData?.regId?.toString() ||        
      userData?.user_id?.toString() ||        
      userData?.user?.id?.toString() ||
      userData?.user?.regId?.toString() ||     
      userData?.user?.rmId?.toString() ||      
      null;

    console.log(" Extracted RM ID:", rmId);
    return rmId;
  };

  const fetchRmDetailsWithTimeout = async (rmId: string): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await api.get(`${ApiUrl}/partner/rmCount/${rmId}`, {
        signal: controller.signal,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      console.log(" API Response received:", response);
      return response.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(" API Error:", err);
      throw err;
    }
  };

  const fetchManagedClients = async (rmId: string): Promise<ManagedClient[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(` Fetching managed clients from: ${ApiUrl}/partner/AllClient/${rmId}`);
      const response = await api.get<ManagedClientsResponse>(`${ApiUrl}/partner/AllClient/${rmId}`, {
        signal: controller.signal,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);

      console.log("Managed clients API response:", response.data);

      if (!response.data || !response.data.data || !Array.isArray(response.data.data.data)) {
        throw new Error("Invalid response format for managed clients");
      }

      return response.data.data.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(" Managed clients API Error:", err);
      throw err;
    }
  };

  const fetchTopPerformingFunds = async (): Promise<TopPerformingFund[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log(` Fetching top performing funds from: ${ApiUrl}/mutual-fund/get-top-performing-funds`);
      const response = await api.get(`${ApiUrl}/mutual-fund/get-top-performing-funds`, {
        signal: controller.signal,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);

      console.log(" Top funds API response:", response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid response format for top performing funds");
      }

      return response.data.data.slice(0, 5).map((fund: any) => ({
        id: fund.id,
        scheme_id: fund.scheme_id,
        name: fund.SchemeMaster?.name || 'Unknown Fund',
        fundName: fund.SchemeMaster?.ms_fullname || fund.SchemeMaster?.name || 'Unknown Fund',
        category: fund.SchemeMaster?.SchemeCategory?.Name || 'Others',
        subcategory: fund.SchemeMaster?.SchemeSubcategory?.Name || 'Others',
        riskLevel: fund.SchemeMaster?.riskLevel || 'Very High Risk',
        return1yr: fund.Return1yr || 0,
        return3yr: fund.Returns3yr || 0,
        return5yr: fund.Returns5yr || 0,
        aum: fund.AUM || 0,
        nav: fund.Nav || 0,
        navChangePercentage: fund.NavChangePercentage || 0,
        rating: fund.OverallRating || fund.internalOverallRating || null
      }));
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(" Top funds API Error:", err);
      throw err;
    }
  };

  const validateApiResponse = (response: any): RmDetails => {
    console.log(" Validating API response:", response);

    if (!response || typeof response !== 'object') {
      throw new Error("Invalid API response: Response is not an object");
    }

    if (response.status === 'error') {
      throw new Error(response.message || "API returned an error");
    }

    if (response.status === false) {
      throw new Error(response.message || "API request failed");
    }

    if (!response.data || typeof response.data !== 'object') {
      throw new Error("Invalid API response: Missing data property");
    }

    let rmData;

    if (response.data.data && Array.isArray(response.data.data)) {
      if (response.data.data.length === 0) {
        throw new Error("No data found for this Relationship Manager");
      }
      rmData = response.data.data[0];
    }
    else if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        throw new Error("No data found for this Relationship Manager");
      }
      rmData = response.data[0];
    }
    else if (response.data && typeof response.data === 'object') {
      rmData = response.data;
    } else {
      throw new Error("Invalid API response structure");
    }

    const requiredFields = ['total_investor', 'total_partner', 'total_bc', 'total_aum', 'total_transaction', 'mobile', 'email', 'name'];
    const missingFields = requiredFields.filter(field => !rmData[field] && rmData[field] !== 0);

    if (missingFields.length > 0) {
      console.warn(" Missing fields in response:", missingFields);
      console.log(" Actual response data:", rmData);

      const userData = extractUserData();
      const rmUserData = userData?.RM || {};

      const defaultRmData = {
        total_investor: '0',
        total_partner: '0',
        total_bc: '0',
        total_aum: '0',
        total_transaction: '0',
        mobile: rmUserData.mobile || userData?.mobile || 'Not available',
        email: rmUserData.email || userData?.email || 'Not available',
        name: rmUserData.Name || userData?.name || 'Relationship Manager',
        ...rmData
      };
      return defaultRmData;
    }

    return rmData;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window === 'undefined') {
        throw new Error("This component must run in the browser");
      }

      const userData = extractUserData();
      setUserData(userData);

      if (!userData) {
        throw new Error('User data not found. Please login again.');
      }

      console.log(" Loaded user data:", userData);

      const rmId = extractRmId();
      console.log(" Extracted RM ID:", rmId);

      if (!rmId) {
        throw new Error('RM ID not found in user data. Please contact support.');
      }

      console.log("🚀 Loading dashboard for RM ID:", rmId);

      const [cachedRmData, cachedFundsData, cachedClientsData] = await Promise.all([
        getCachedRmDetails(rmId),
        getCachedTopFunds(),
        getCachedManagedClients(rmId)
      ]);

      if (cachedRmData) {
        console.log(" Using cached RM data");
        setRmDetails(cachedRmData);
      }

      if (cachedFundsData) {
        console.log(" Using cached funds data");
        setTopFunds(cachedFundsData);
      }

      if (cachedClientsData) {
        console.log(" Using cached clients data");
        setManagedClients(cachedClientsData);
      }

      const fetchPromises = [];
      if (!cachedRmData) {
        fetchPromises.push(
          fetchRmDetailsWithTimeout(rmId).then(response => {
            const rmData = validateApiResponse(response);
            cacheRmDetails(rmId, rmData);
            setRmDetails(rmData);
          })
        );
      }

      if (!cachedClientsData) {
        fetchPromises.push(
          fetchManagedClients(rmId).then(clients => {
            cacheManagedClients(rmId, clients);
            setManagedClients(clients);
          })
        );
      }

      if (!cachedFundsData) {
        fetchPromises.push(
          fetchTopPerformingFunds().then(funds => {
            cacheTopFunds(funds);
            setTopFunds(funds);
          })
        );
      }

      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }

      console.log(" Dashboard loaded successfully");

    } catch (err: any) {
      console.error(" Dashboard load error:", err);

      const errorMessage = err.name === 'AbortError'
        ? "Request timeout. Please check your connection and try again."
        : err.message.includes('Network Error')
          ? "Network error. Please check your internet connection."
          : `Failed to load dashboard: ${err.message}`;

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('rm_') || key === 'top_performing_funds') {
          localStorage.removeItem(key);
        }
      });
    }
    setTimeout(() => {
      loadDashboardData();
    }, 300);
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadDashboardData();
    }, 100);

    return () => clearTimeout(loadTimer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <EnhancedError error={error} userData={userData} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] font-sans">
      <main className="p-4 w-full">
        <div className="w-full space-y-4">
          <CompactRMProfile rmDetails={rmDetails} />
          <StatsOverview rmDetails={rmDetails} />
          <RMQuickActions />
          {topFunds.length > 0 && <TopPerformingFunds funds={topFunds} />}
          {managedClients.length > 0 && <ManagedClientsSection clients={managedClients} />}
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2A2A2A;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #F59E0B;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B45309;
        }
      `}</style>
    </div>
  );
};

export default RelationshipManagerDashboard;
