"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  Settings,
  User,
  MessageSquare,
  Menu,
  X,
  Plus,
  BarChart3,
  Calculator,
  Share2,
  Target,
  ArrowRight,
  TrendingUp,
  Calendar,
  ArrowLeftRight,
  DollarSign,
  PlayCircle,
  BarChart2,
  PieChart,
  Users,
  FileText,
  CreditCard,
  Briefcase,
  Activity,
  Home,
  Layers,
  Globe,
  Building,
  Shield,
  Phone,
  Mail,
  Download,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  MoreVertical,
  Star,
  Heart,
  Zap,
  Award,
  Wallet,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  IndianRupee,
  BookOpen,
  Receipt,
  Smartphone,
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { USER_DATA } from '@/utils/constants';
import { getLS } from '@/utils/helpers';
import OnBoarding from '../on-boarding';
import api from '@/utils/api';
import getConfig from '@/utils/config';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

// Type definitions
interface PortfolioRecord {
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

interface PortfolioResponse {
  data: {
    data: PortfolioRecord[];
  };
  msg: string;
}

interface Investment {
  id: string;
  icon: any;
  schemeName: string;
  amcName: string;
  investedAmount: string;
  currentValue: string;
  returns: string;
  returnsColor: string;
  category: string;
  color: string;
  sipAmount: string;
  sipDate: string;
  folioNo: string;
  childRecords: PortfolioRecord[];
}

interface UserData {
  InvestorRegistration?: {
    pan_no?: string;
    is_kyc_complete?: boolean | null;
  };
}

interface InvestmentCardProps {
  investment: Investment;
  index: number;
  onToggleDetails: (id: string) => void;
  isExpanded: boolean;
}

// Service function to fetch portfolio data
export const fetchPortfolioByPAN = async (pan: string): Promise<PortfolioRecord[]> => {
  try {
    const response = await api.post<PortfolioResponse>(
      `${ApiUrl}/partner/portfolio/searchs`,
      { pan } 
    );

    return response.data?.data?.data || []; 
  } catch (error) {
    console.log("Error fetching portfolio data:", error);
    throw new Error("Failed to fetch portfolio data");
  }
};


// Portfolio Overview Component
const PortfolioOverview = ({ portfolioStats }: { portfolioStats: any }) => {
  const stats = [
    {
      label: "Total Investment",
      value: portfolioStats.totalInvestment,
      icon: IndianRupee,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Current Value",
      value: portfolioStats.currentValue,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Returns",
      value: portfolioStats.totalReturns,
      icon: Activity,
      color: portfolioStats.totalReturns.startsWith("-")
        ? "bg-red-100 text-red-600"
        : "bg-purple-100 text-purple-600",
    },
    // {
    //   label: "CAGR",
    //   value: portfolioStats.cagr,
    //   icon: BarChart3,
    //   color: portfolioStats.cagr.startsWith("-")
    //     ? "bg-red-100 text-red-600"
    //     : "bg-orange-100 text-orange-600",
    // },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Portfolio Overview
      </h3>
      <div className="flex gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center bg-gray-50 rounded-lg p-3 hover:shadow-md transition-all flex-1"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// Investment Card Component
const InvestmentCard = ({ investment, index, onToggleDetails, isExpanded }: InvestmentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 cursor-pointer ${
        isExpanded ? 'shadow-lg' : 'hover:shadow-lg hover:scale-[1.02]'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${investment.color} flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <investment.icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-sm font-semibold ${investment.returnsColor} bg-green-50 px-2 py-1 rounded-full`}>
            {investment.returns}
          </span>
          <span className="text-xs text-gray-500 mt-1">{investment.category}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">{investment.schemeName}</h3>
        <p className="text-xs text-gray-600">{investment.amcName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Invested</p>
          <p className="text-sm font-semibold text-gray-900">{investment.investedAmount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-sm font-semibold text-gray-900">{investment.currentValue}</p>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleDetails(investment.id);
            }}
            className="flex items-center text-blue-600 text-sm hover:text-blue-800 transition-colors"
          >
            <span className="mr-1">View Details</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
          <h4 className="font-medium text-gray-900 mb-3">Transaction History</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {investment.childRecords.map((record, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.out_trxntype || 'Portfolio Summary'}</p>
                    <p className="text-xs text-gray-500">
                      {record.out_traddate ? new Date(record.out_traddate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{parseFloat(record.out_amount || '0').toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">{record.out_units} units</p>
                  </div>
                </div>
                {record.out_trxntype && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">NAV: </span>
                      <span className="font-medium">₹{record.out_purprice}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type: </span>
                      <span className="font-medium">{record.out_scheme_typ}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const TransactionModal = ({ 
  transactions, 
  isOpen, 
  onClose 
}: { 
  transactions: PortfolioRecord[]; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen) return null;

  // Filter and sort all transactions
  const allTransactions = transactions
    .filter(t => t.out_traddate && t.out_trxntype)
    .sort((a, b) => new Date(b.out_traddate || '').getTime() - new Date(a.out_traddate || '').getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {allTransactions.length > 0 ? (
            <div className="space-y-4">
              {allTransactions.map((transaction, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.out_trxntype.includes('Purchase') || transaction.out_trxntype.includes('Switch In') 
                        ? 'bg-blue-100 text-blue-600' 
                        : transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.out_trxntype.includes('Purchase') || transaction.out_trxntype.includes('Switch In') 
                        ? <Plus className="w-5 h-5" /> 
                        : transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                        ? <ArrowDown className="w-5 h-5" />
                        : <ArrowLeftRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.out_scheme}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.out_trxntype} • 
                        {transaction.out_traddate 
                          ? new Date(transaction.out_traddate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Folio: {transaction.out_folio_no}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                        ? '-₹' + parseFloat(transaction.out_amount || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })
                        : '₹' + parseFloat(transaction.out_amount || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      }
                    </p>
                    <p className="text-xs text-green-600">
                      Completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.out_units} units @ ₹{transaction.out_purprice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
        
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
// Recent Transactions Component
const RecentTransactions = ({ transactions }: { transactions: PortfolioRecord[] }) => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Filter and sort transactions
  const recentTxns = transactions
    .filter(t => t.out_traddate && t.out_trxntype)
    .sort((a, b) => new Date(b.out_traddate || '').getTime() - new Date(a.out_traddate || '').getTime())
    .slice(0, 5);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          {transactions.filter(t => t.out_traddate && t.out_trxntype).length > 5 && (
            <button 
              onClick={() => setShowAllTransactions(true)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        {recentTxns.length > 0 ? (
          <div className="space-y-4">
            {recentTxns.map((transaction, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.out_trxntype.includes('Purchase') || transaction.out_trxntype.includes('Switch In') 
                      ? 'bg-blue-100 text-blue-600' 
                      : transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {(transaction.out_trxntype.includes('Purchase') || transaction.out_trxntype.includes('Switch In')) 
                      ? <Plus className="w-4 h-4" /> 
                      : transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                      ? <ArrowDown className="w-4 h-4" />
                      : <ArrowLeftRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.out_scheme}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.out_trxntype} • 
                      {transaction.out_traddate 
                        ? new Date(transaction.out_traddate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}>
                    {transaction.out_trxntype.includes('Redemption') || transaction.out_trxntype.includes('Switch Out')
                      ? '-₹' + parseFloat(transaction.out_amount || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      : '₹' + parseFloat(transaction.out_amount || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })
                    }
                  </p>
                  <p className="text-xs text-green-600">
                    Completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No recent transactions found
          </div>
        )}
      </div>

      <TransactionModal 
        transactions={transactions} 
        isOpen={showAllTransactions} 
        onClose={() => setShowAllTransactions(false)} 
      />
    </>
  );
};

// Utility functions
const getIconForScheme = (schemeName: string) => {
  if (schemeName.includes('Large') || schemeName.includes('Bluechip')) return BarChart3;
  if (schemeName.includes('Small') || schemeName.includes('Mid')) return Target;
  if (schemeName.includes('Balanced') || schemeName.includes('Hybrid')) return PieChart;
  if (schemeName.includes('Liquid') || schemeName.includes('Cash')) return Wallet;
  return TrendingUp;
};

const getAMCName = (schemeName: string): string => {
  const matches = schemeName.match(/^([^-]+)/);
  return matches ? matches[0].trim() : 'Unknown AMC';
};

const getCategory = (schemeName: string): string => {
  if (schemeName.includes('Large')) return 'Large Cap';
  if (schemeName.includes('Mid')) return 'Mid Cap';
  if (schemeName.includes('Small')) return 'Small Cap';
  if (schemeName.includes('Balanced') || schemeName.includes('Hybrid')) return 'Hybrid';
  if (schemeName.includes('Liquid') || schemeName.includes('Cash')) return 'Liquid';
  return 'Other';
};

const getColorForCategory = (category: string): string => {
  switch(category) {
    case 'Large Cap': return 'bg-blue-100 text-blue-600';
    case 'Mid Cap': return 'bg-purple-100 text-purple-600';
    case 'Small Cap': return 'bg-orange-100 text-orange-600';
    case 'Hybrid': return 'bg-teal-100 text-teal-600';
    case 'Liquid': return 'bg-indigo-100 text-indigo-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Process portfolio data to group by scheme and folio
const processPortfolioData = (data: PortfolioRecord[]): Investment[] => {
  // Group records by folio number and scheme
  const groupedData: { [key: string]: PortfolioRecord[] } = {};
  
  data.forEach(record => {
    const key = `${record.out_folio_no}-${record.out_scheme}`;
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(record);
  });
  
  // Create investment objects from grouped data
  const investments: Investment[] = [];
  
  Object.keys(groupedData).forEach((key, index) => {
    const records = groupedData[key];
    const parentRecord = records.find(r => r.out_record_typ === 'P');
    
    if (parentRecord) {
      const childRecords = records.filter(r => r.out_record_typ === 'C');
      const returnsColor = parseFloat(parentRecord.out_p_n_l || '0') >= 0 ? "text-green-600" : "text-red-600";
      
      investments.push({
        id: `${parentRecord.out_folio_no}-${parentRecord.out_scheme}-${index}`, // Unique ID for each investment
        icon: getIconForScheme(parentRecord.out_scheme),
        schemeName: parentRecord.out_scheme,
        amcName: getAMCName(parentRecord.out_scheme),
        investedAmount: `₹${parseFloat(parentRecord.out_amount || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        currentValue: `₹${parseFloat(parentRecord.out_current_val || '0').toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        returns: `${parseFloat(parentRecord.out_abs_per || '0') >= 0 ? '+' : ''}${parentRecord.out_abs_per}%`,
        returnsColor,
        category: getCategory(parentRecord.out_scheme),
        color: getColorForCategory(getCategory(parentRecord.out_scheme)),
        sipAmount: 'N/A', // This would need to be calculated from child records
        sipDate: 'N/A',
        folioNo: parentRecord.out_folio_no,
        childRecords
      });
    }
  });
  
  return investments;
};

// Calculate portfolio statistics
const calculatePortfolioStats = (investments: Investment[]) => {
  const totalInvestment = investments.reduce((sum, inv) => {
    return sum + parseFloat(inv.investedAmount.replace('₹', '').replace(/,/g, ''));
  }, 0);
  
  const currentValue = investments.reduce((sum, inv) => {
    return sum + parseFloat(inv.currentValue.replace('₹', '').replace(/,/g, ''));
  }, 0);
  
  const totalReturns = currentValue - totalInvestment;
  
  // Calculate XIRR (simplified average of all returns)
  const cagr = investments.reduce((sum, inv) => {
    return sum + parseFloat(inv.returns.replace('%', ''));
  }, 0) / investments.length;
  
  return {
    totalInvestment: `₹${totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    currentValue: `₹${currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    totalReturns: `${totalReturns >= 0 ? '₹' : '-₹'}${Math.abs(totalReturns).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    cagr: `${cagr >= 0 ? '+' : ''}${cagr.toFixed(2)}%`
  };
};

// Main Dashboard Component
const MutualFundInvestorDashboard = () => {
  const [onBoardingModal, setOnBoardingModal] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioRecord[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: '₹0',
    currentValue: '₹0',
    totalReturns: '₹0',
    cagr: '0%'
  });

  // Fetch portfolio data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData: UserData = getLS(USER_DATA);
        const pan = userData?.InvestorRegistration?.pan_no;
        
        if (pan) {
          const data = await fetchPortfolioByPAN(pan);
          setPortfolioData(data);
          
          // Process data to create investments
          const processedInvestments = processPortfolioData(data);
          setInvestments(processedInvestments);
          setFilteredInvestments(processedInvestments);
          
          // Calculate portfolio stats
          setPortfolioStats(calculatePortfolioStats(processedInvestments));
        } else {
          throw new Error('PAN number not found in user data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
        console.log('Error fetching portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter investments based on search and active filter
  useEffect(() => {
    let filtered = [...investments];
    
    if (searchTerm) {
      filtered = filtered.filter(investment =>
        investment.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.amcName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(investment => {
        return (
          (activeFilter === 'equity' && investment.category.includes('Cap')) ||
          (activeFilter === 'hybrid' && investment.category === 'Hybrid') ||
          (activeFilter === 'debt' && investment.category === 'Debt') ||
          (activeFilter === 'index' && investment.category === 'Index') ||
          (activeFilter === 'liquid' && investment.category === 'Liquid')
        );
      });
    }

    setFilteredInvestments(filtered);
  }, [searchTerm, activeFilter, investments]);

  // Toggle details for a specific card
  const toggleDetails = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Check KYC status
  useEffect(() => {
    const userData = getLS(USER_DATA);
    if (
      (!userData?.InvestorRegistration) ||
      (userData && userData?.InvestorRegistration?.is_kyc_complete === false) ||
      userData?.InvestorRegistration?.is_kyc_complete === null
    ) {
      // setOnBoardingModal(true);
    }
  }, []);

 return (
    <>
      {onBoardingModal && (
        <div>
          <OnBoarding onBoardingModal={onBoardingModal} />
        </div>
      )}
      <div className="min-h-screen w-full bg-gray-50">
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Portfolio Overview now at the top with full width */}
            <PortfolioOverview portfolioStats={portfolioStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentTransactions transactions={portfolioData} />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Portfolio Summary</h3>
                  <span className="text-sm text-blue-600">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Funds</span>
                    <span className="text-sm font-medium text-gray-900">{investments.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Folios</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Set(investments.map(i => i.folioNo)).size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Asset Allocation</span>
                    <span className="text-sm font-medium text-gray-900">
                      Equity: {investments.length > 0 ? Math.round((investments.filter(i => i.category.includes('Cap')).length / investments.length * 100)) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Best Performer</span>
                    <span className="text-sm font-medium text-green-600">
                      {investments.length > 0 
                        ? investments.reduce((max, inv) => 
                            parseFloat(inv.returns) > parseFloat(max.returns) ? inv : max
                          ).schemeName.substring(0, 20) + '...'
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rest of the component remains the same */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Funds', count: investments.length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeFilter === filter.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {filter.label}
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          activeFilter === filter.id
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Investment Holdings</h2>
                <span className="text-sm text-gray-500">{filteredInvestments.length} funds</span>
              </div>

              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3">Loading your investments...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">Error! </strong>
                  <span className="block sm:inline">{error}</span>
                  <button 
                    onClick={() => window.location.reload()}
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  >
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <title>Close</title>
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                    </svg>
                  </button>
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredInvestments.map((investment, index) => (
                      <InvestmentCard 
                        key={investment.id} 
                        investment={investment} 
                        index={index}
                        onToggleDetails={toggleDetails}
                        isExpanded={expandedCardId === investment.id}
                      />
                    ))}
                  </div>

                  {filteredInvestments.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
                      <p className="text-gray-600">Try adjusting your search criteria</p>
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setActiveFilter('all');
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default MutualFundInvestorDashboard;