'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Target, BarChart3, IndianRupee, ChevronLeft, FileText, Calendar, Zap, PieChart, Info, X, Search, Filter, Download, User, CreditCard, ArrowUpDown, Star, Wallet, Repeat, LogOut, TrendingDown, Briefcase, Moon, Sun, Activity, Award, Sparkles, Rocket, Shield, Cpu, Globe, Lock, Mail, Phone, MapPin, Settings, HelpCircle, Bell, CheckCircle, LineChart, DollarSign, Percent, BarChart } from 'lucide-react';
import { fetchInvestorPortfolio1, fetchPortfolioXIRR } from '@/services/dashboards';
import {
  ADMIN_INVESTER_DATA,
  FLAT_MENU,
  MENU_PREFIX,
  PROD_DATA,
  TOKEN_PREFIX,
  USER_DATA
} from '@/utils/constants';
import { getLS, removeLS, handleServerError } from '@/utils/helpers';
import api from '@/utils/api';
import { getInvestor } from "@/api/holder";
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import { ImProfile } from 'react-icons/im';
import { FaUnlockAlt, FaPowerOff } from 'react-icons/fa';
import Link from 'next/link';
import OnBoarding from '../on-boarding';

import TopPerformingSchemes from "./(components)/top-performing-schemes";
import RecommendedFunds from "./(components)/recommended-funds";
import InvestorPicker from "./(components)/InvestorPicker";
import InvestorPopup from "../fund-explore/investor";
import OrderPopup from "../fund-explore/order";

// Golden Black Theme (Same as SIP Page)
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

interface PortfolioItem {
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
  out_cagr_per?: string; // Added CAGR field
}

interface ApiPortfolioItem {
  scheme: string;
  cur_units: string;
  inv_amount: string;
  cur_amount: string;
  pnl_amount: string;
  pnl_per: string;
  xirr_per: string;
  last_day_return_amount: string;
  last_day_return_amount_per: string;
}

interface SchemeData {
  name: string;
  investment: number;
  currentValue: number;
  pnl: number;
  returnPercent: number;
  units: number;
  holdingDays: number; // Added holding days
  cagr: number; // Added CAGR
  folioNo: string;
  fundHouse: string;
  color: string;
}

interface TopPerformingScheme {
  id: number;
  scheme_id: number;
  Return1yr: number;
  AUM: number;
  SchemeMaster?: {
    name: string;
    riskLevel?: string;
    SchemeCategory?: {
      Name: string;
    };
    SchemeSubcategory?: {
      Name: string;
    };
  };
  OverallRating: number | null;
  performanceRating: number | null;
  schemeName?: string;
}

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

interface Investor {
  first_applicant?: string;
  scheme?: string;
  pri_isin: string;
  rtaAmcCode: string;
  rtaSchCode: string;
  can_id: string;
  investory_category: string;
  holding_mode: string;
  joint1?: string;
  joint2?: string;
  nominee?: string;
}

interface SelectedClient {
  name: string;
  pan: string;
}

const MutualFundDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prodUserData = getLS(USER_DATA);
  const searchPan = searchParams.get("pan");
  const searchName = searchParams.get("name");

  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(null);
  const [clientData, setClientData] = useState<{ name: string; pan: string }>({ name: '', pan: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClient = sessionStorage.getItem('selectedClient');
      if (storedClient) {
        try {
          const client = JSON.parse(storedClient);
          setSelectedClient(client);
          setClientData({
            name: client.name,
            pan: client.pan
          });
          console.log('Loaded client from sessionStorage:', client);
        } catch (error) {
          console.error('Error parsing stored client data:', error);
        }
      }
    }
  }, []);

  // Determine the final client data to use
  const panNumber =
    clientData.pan ||
    (prodUserData?.InvestorRegistration?.pan_no && prodUserData?.InvestorRegistration?.pan_no.trim() !== ""
      ? prodUserData.InvestorRegistration.pan_no
      : searchPan ?? "");

  const investorName =
    clientData.name ||
    (prodUserData?.InvestorRegistration?.name && prodUserData?.InvestorRegistration?.name.trim() !== ""
      ? prodUserData.InvestorRegistration.name
      : searchName ?? "");

  // Pick investorId
  const inv_id = prodUserData?.InvestorRegistration?.id;
  console.log('Investor ID:', inv_id);
  console.log('Final PAN:', panNumber);
  console.log('Final Investor Name:', investorName);
  console.log('Selected Client from session:', selectedClient);

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [apiPortfolioData, setApiPortfolioData] = useState<ApiPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [xirrValue, setXirrValue] = useState<string | null>(null);
  const [xirrLoading, setXirrLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeData | null>(null);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'investment' | 'currentValue' | 'pnl'>('investment');
  const [showAllSchemesModal, setShowAllSchemesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'investment',
    direction: 'desc'
  });
  const [topPerformingSchemes, setTopPerformingSchemes] = useState<TopPerformingScheme[]>([]);
  const [topSchemesLoading, setTopSchemesLoading] = useState(false);
  const [recommendedFunds, setRecommendedFunds] = useState<RecommendedFund[]>([]);
  const [recommendedFundsLoading, setRecommendedFundsLoading] = useState(false);
  const [onBoardingModal, setOnBoardingModal] = useState(false);

  const [investorList, setInvestorList] = useState<any[]>([])
  const [sipData, setSipData] = useState<any[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);
  const [showInvestorPicker, setshowInvestorPicker] = useState(false);

  const hasClientData = investorName?.trim() && panNumber?.trim();

  // Portfolio summary calculations from API data
  const totalInvestment = apiPortfolioData.reduce((sum, item) => sum + parseFloat(item.inv_amount), 0);
  const totalCurrentValue = apiPortfolioData.reduce((sum, item) => sum + parseFloat(item.cur_amount), 0);
  const totalPnL = apiPortfolioData.reduce((sum, item) => sum + parseFloat(item.pnl_amount), 0);
  const totalLastDayReturn = apiPortfolioData.reduce((sum, item) => sum + parseFloat(item.last_day_return_amount), 0);
  const totalLastDayReturnPercent = totalInvestment > 0 ? (totalLastDayReturn / totalInvestment) * 100 : 0;

  // Calculate overall XIRR (average of all schemes)
  const overallXirr = apiPortfolioData.length > 0
    ? apiPortfolioData.reduce((sum, item) => sum + parseFloat(item.xirr_per), 0) / apiPortfolioData.length
    : 0;

  // Sample chart data based on portfolio performance
  const chartData = [
    { month: 'Jan', value: totalInvestment * 0.85 },
    { month: 'Feb', value: totalInvestment * 0.88 },
    { month: 'Mar', value: totalInvestment * 0.92 },
    { month: 'Apr', value: totalInvestment * 0.95 },
    { month: 'May', value: totalInvestment * 0.98 },
    { month: 'Jun', value: totalInvestment * 1.02 },
    { month: 'Jul', value: totalInvestment * 1.05 },
    { month: 'Aug', value: totalInvestment * 1.08 },
    { month: 'Sep', value: totalInvestment * 1.12 },
    { month: 'Oct', value: totalCurrentValue },
  ];

  // Pie chart data for asset allocation
  const assetAllocation = [
    { name: 'Equity', value: 63, color: '#F59E0B' },
    { name: 'Debt', value: 21, color: '#10B981' },
    { name: 'Liquid', value: 11, color: '#6366F1' },
    { name: 'Others', value: 5, color: '#EF4444' },
  ];

  // Load API portfolio data for metrics card
  useEffect(() => {
    const loadApiPortfolioData = async () => {
      if (!hasClientData) {
        setApiLoading(false);
        setApiPortfolioData([]);
        return;
      }

      try {
        setApiLoading(true);
        console.log('Making API call to /partner/portfolio/searches with:', {
          pan: panNumber,
          rpt_date: selectedDate
        });

        const portfolioResponse = await api.post('/partner/portfolio/searches', {
          pan: panNumber,
          rpt_date: selectedDate
        });

        console.log('Portfolio API Response:', portfolioResponse.data);

        if (portfolioResponse.data?.data?.data && Array.isArray(portfolioResponse.data.data.data)) {
          setApiPortfolioData(portfolioResponse.data.data.data);
        } else {
          console.error('Invalid data format received from API');
          setApiPortfolioData([]);
        }

      } catch (err: any) {
        console.error('Portfolio API Error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setApiPortfolioData([]);
      } finally {
        setApiLoading(false);
      }
    };

    loadApiPortfolioData();
  }, [investorName, panNumber, selectedDate, hasClientData]);

  //added by rakesh sinha - updated to check CAN and UCC status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const userData = getLS(USER_DATA);
      console.log("User Data=", userData?.InvestorRegistration);

      const investor = userData?.InvestorRegistration;

      // If investor data exists and KYC is complete, no popup needed
      if (investor?.is_kyc_complete === true) {
        console.log("KYC complete - no onboarding popup");
        setOnBoardingModal(false);
        return;
      }

      // If CAN is registered, skip onboarding popup
      if (investor?.is_CAN_registered === true) {
        console.log("CAN registered - no onboarding popup");
        setOnBoardingModal(false);
        return;
      }

      // Check if UCC is created via NSE API (by mobile number)
      if (investor?.reg_mobile) {
        try {
          const res = await api.get(`/nse/ucc/search-by-mobile/${investor.reg_mobile}`);
          const payload = res?.data?.data ?? res?.data ?? {};
          if (payload?.status === "S" && payload?.data) {
            const uccData = payload.data;
            // If UCC record exists and uccCreated flag is true, skip onboarding
            if (uccData.uccCreated === 1 || uccData.uccCreated === true) {
              console.log("UCC created - no onboarding popup");
              setOnBoardingModal(false);
              return;
            }
          }
        } catch (err) {
          // UCC check failed - continue with normal check
          console.log("UCC check failed, continuing with normal onboarding check");
        }
      }

      // If none of the above conditions met, show onboarding popup
      if (!investor || investor.is_kyc_complete === false || investor.is_kyc_complete === null) {
        setOnBoardingModal(true);
      } else {
        setOnBoardingModal(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Original portfolio data loading for other sections
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!hasClientData) {
        setLoading(false);
        setPortfolioData([]);
        setXirrValue(null);
        return;
      }

      try {
        setLoading(true);
        setXirrLoading(true);

        const [portfolioData, xirrData] = await Promise.all([
          fetchInvestorPortfolio1(
            investorName as string,
            panNumber as string,
            selectedDate
          ),
          fetchPortfolioXIRR(panNumber as string, selectedDate)
        ]);

        if (Array.isArray(portfolioData)) {
          setPortfolioData(portfolioData);
          setError(null);
        } else {
          setError('Invalid data format received from server');
        }

        setXirrValue(xirrData);

      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error(err);
      } finally {
        setLoading(false);
        setXirrLoading(false);
      }
    };

    loadPortfolioData();
  }, [investorName, panNumber, selectedDate, hasClientData]);

  // Fetch top performing schemes
  useEffect(() => {
    const fetchTopPerformingSchemes = async () => {
      try {
        setTopSchemesLoading(true);
        console.log('Fetching top performing schemes...');
        const response = await api.get('/mutual-fund/get-top-performing-schemes');
        console.log('Top performing schemes response:', response.data);

        const schemesData = response.data?.data || response.data || [];
        console.log('Processed schemes data:', schemesData);

        setTopPerformingSchemes(schemesData);
      } catch (error) {
        console.error('Error fetching top performing schemes:', error);
        handleServerError(error);
        setTopPerformingSchemes([]);
      } finally {
        setTopSchemesLoading(false);
      }
    };

    fetchTopPerformingSchemes();
  }, []);

  useEffect(() => {
    const fetchRecommendedFunds = async () => {
      try {
        setRecommendedFundsLoading(true);
        console.log(' Fetching recommended funds...');

        const response = await api.get('scheme-configuration/vedantRecommended/all');
        console.log(' Full API response:', response);
        console.log(' Response data:', response.data);

        let fundsData: RecommendedFund[] = [];

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          fundsData = response.data.data;
          console.log(' Using response.data.data structure, found', fundsData.length, 'funds');
        } else if (response.data && Array.isArray(response.data)) {
          fundsData = response.data;
          console.log('Using response.data array structure, found', fundsData.length, 'funds');
        } else {
          console.warn(' Unexpected response structure:', response.data);
          fundsData = [];
        }

        console.log(' Processed funds data:', fundsData);
        setRecommendedFunds(fundsData);

      } catch (error: any) {
        console.error(' Error fetching recommended funds:', error);
        console.error(' Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        setRecommendedFunds([]);

      } finally {
        setRecommendedFundsLoading(false);
      }
    };

    fetchRecommendedFunds();
  }, []);

  // Load investor data
  useEffect(() => {
    const GetInvestor = async () => {
      const userData: any = getLS(USER_DATA);
      if (userData?.InvestorRegistration?.id) {
        try {
          const response = await getInvestor(userData.InvestorRegistration.id)
          setInvestorList(response?.data?.data?.data || [])
        } catch (error) {
          console.error('Error fetching investor data:', error);
        }
      }
    }
    GetInvestor()
  }, [])

  // Quick Action Handlers
  const handleInvestClick = () => {
    router.push('/mutual-fund');
  };

  const handleGoalsClick = () => {
    router.push('/goal-planning');
  };

  const handleWithdrawClick = () => {
    router.push('/portfolio');
  };

  const handleMySIPsClick = () => {
    router.push('/sip');
  };

  const handleRedirectToMutualFundPage = () => {
    console.log("Redirecting to mutual fund page...");
    router.push('/top-performing-scheme-list');
  };

  const handlePortfolioSchemeClick = (scheme: SchemeData) => {
    setSelectedScheme(scheme);
    console.log("Portfolio scheme clicked:", scheme);
    console.log("Investor List:", investorList, "count:", investorList.length);

    if (investorList.length > 1) {
      setshowInvestorPopup(true);
    } else {
      if (investorList.length === 1) {
        setSelectedInvestor(investorList[0]);
        setShowOrderPopup(true);
      }
    }
  };

  const handleRecommendedFundClick = (scheme: RecommendedFund) => {
    console.log("Recommended fund clicked:", scheme);

    handleRedirectToMutualFundPage();
    const schemeData: SchemeData = {
      name: scheme.scheme_name,
      investment: 0,
      currentValue: 0,
      pnl: 0,
      returnPercent: scheme.return_1y,
      units: 0,
      holdingDays: 0,
      cagr: 0,
      folioNo: '',
      fundHouse: '',
      color: '#F59E0B'
    };

    setSelectedScheme(schemeData);

    if (investorList.length > 1) {
      setshowInvestorPopup(true);
    } else if (investorList.length === 1) {
      setSelectedInvestor(investorList[0]);
      setShowOrderPopup(true);
    }
  };

  const handleTopPerformingSchemeClick = (scheme: TopPerformingScheme) => {
    console.log("Top performing scheme clicked:", scheme);

    const schemeData: SchemeData = {
      name: scheme.SchemeMaster?.name || scheme.schemeName || 'Unknown Scheme',
      investment: 0,
      currentValue: 0,
      pnl: 0,
      returnPercent: scheme.Return1yr,
      units: 0,
      holdingDays: 0,
      cagr: 0,
      folioNo: '',
      fundHouse: scheme.SchemeMaster?.SchemeCategory?.Name || '',
      color: '#F59E0B'
    };

    setSelectedScheme(schemeData);

    if (investorList.length > 1) {
      setshowInvestorPopup(true);
    } else if (investorList.length === 1) {
      setSelectedInvestor(investorList[0]);
      setShowOrderPopup(true);
    }
  };

  const validParentPortfolioData = portfolioData.filter(item =>
    item.out_record_typ === 'P' &&
    parseFloat(item.out_amount) > 0 &&
    parseFloat(item.out_current_val) > 0 &&
    parseFloat(item.out_units) > 0
  );

  const allTransactions = portfolioData.filter(item =>
    item.out_record_typ === 'C' &&
    item.out_traddate &&
    parseFloat(item.out_amount) > 0
  );

  const sortedTransactions = [...allTransactions].sort((a, b) =>
    new Date(b.out_traddate!).getTime() - new Date(a.out_traddate!).getTime()
  );

  const recentTransactions = sortedTransactions.slice(0, 5);
  const transactionsToDisplay = showAllTransactions ? sortedTransactions : recentTransactions;

  const getSchemeData = (): SchemeData[] => {
    if (!validParentPortfolioData.length) return [];

    const schemes: Record<string, SchemeData> = {};

    validParentPortfolioData.forEach(item => {
      const schemeName = item.out_scheme;
      if (!schemes[schemeName]) {
        const colors = ['#F59E0B', '#10B981', '#6366F1', '#EF4444', '#F59E0B', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#14B8A6'];
        schemes[schemeName] = {
          name: schemeName,
          investment: 0,
          currentValue: 0,
          pnl: 0,
          returnPercent: 0,
          units: 0,
          holdingDays: 0,
          cagr: 0,
          folioNo: item.out_folio_no,
          fundHouse: item.out_mutual_fund,
          color: colors[Object.keys(schemes).length % colors.length]
        };
      }

      schemes[schemeName].investment += parseFloat(item.out_amount);
      schemes[schemeName].currentValue += parseFloat(item.out_current_val);
      schemes[schemeName].pnl += parseFloat(item.out_p_n_l);
      schemes[schemeName].units += parseFloat(item.out_sum_units);
      schemes[schemeName].holdingDays = parseFloat(item.out_no_of_days);
      schemes[schemeName].cagr = parseFloat(item.out_cagr_per || '0');
    });

    Object.values(schemes).forEach(scheme => {
      scheme.returnPercent = ((scheme.currentValue - scheme.investment) / scheme.investment) * 100;
    });

    return Object.values(schemes).sort((a, b) => {
      switch (viewMode) {
        case 'investment':
          return b.investment - a.investment;
        case 'currentValue':
          return b.currentValue - a.currentValue;
        case 'pnl':
          return b.pnl - a.pnl;
        default:
          return b.investment - a.investment;
      }
    });
  };

  const schemeData = getSchemeData();
  const displayedSchemes = schemeData.slice(0, 10);

  const getSortedAndFilteredSchemes = () => {
    let filtered = schemeData.filter(scheme =>
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.fundHouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.folioNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof SchemeData] as number;
      const bValue = b[sortConfig.key as keyof SchemeData] as number;

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  };

  const sortedAndFilteredSchemes = getSortedAndFilteredSchemes();

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const AllSchemesModal = () => {
    const [modalSearchTerm, setModalSearchTerm] = useState('');

    const getFilteredSchemesForModal = () => {
      let filtered = schemeData.filter(scheme =>
        scheme.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        scheme.fundHouse.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        scheme.folioNo.toLowerCase().includes(modalSearchTerm.toLowerCase())
      );

      return filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof SchemeData] as number;
        const bValue = b[sortConfig.key as keyof SchemeData] as number;

        if (sortConfig.direction === 'asc') {
          return aValue - bValue;
        }
        return bValue - aValue;
      });
    };

    const modalFilteredSchemes = getFilteredSchemesForModal();

    const handleExportPDF = () => {
      try {
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Investment Schemes Portfolio</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #0A0A0A; color: #F9FAFB; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #F59E0B; }
            .header p { margin: 5px 0; color: #9CA3AF; }
            .summary { margin-bottom: 20px; padding: 15px; background: #111111; border-radius: 8px; border: 1px solid #2A2A2A; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 18px; font-weight: bold; color: #F59E0B; }
            .summary-label { font-size: 12px; color: #9CA3AF; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1F1A1A; text-align: left; padding: 12px; border-bottom: 2px solid #F59E0B; font-weight: 600; color: #F59E0B; }
            td { padding: 12px; border-bottom: 1px solid #2A2A2A; color: #F9FAFB; }
            .positive { color: #10B981; }
            .negative { color: #EF4444; }
            .footer { margin-top: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Investment Schemes Portfolio</h1>
            <p>Generated on ${new Date().toLocaleDateString()} | Total Schemes: ${schemeData.length}</p>
            <p>Investor: ${investorName} | PAN: ${panNumber}</p>
          </div>
          
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">₹${totalInvestment.toLocaleString('en-IN')}</div>
                <div class="summary-label">Total Investment</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${totalCurrentValue.toLocaleString('en-IN')}</div>
                <div class="summary-label">Current Value</div>
              </div>
              <div class="summary-item">
                <div class="summary-value ${totalPnL >= 0 ? 'positive' : 'negative'}">
                  ₹${totalPnL.toLocaleString('en-IN')} (${((totalPnL / totalInvestment) * 100).toFixed(2)}%)
                </div>
                <div class="summary-label">Profit & Loss</div>
              </div>
            </div>
          </div>

             <table>
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Fund House</th>
                <th>Folio No</th>
                <th>Units</th>
                <th>Holding Days</th>
                <th style="text-align: right;">Investment</th>
                <th style="text-align: right;">Current Value</th>
                <th style="text-align: right;">P&L</th>
                
                <th style="text-align: right;">CAGR</th>
              </tr>
            </thead>
            <tbody>
              ${modalFilteredSchemes.map(scheme => `
                <tr>
                  <td>${scheme.name}</td>
                  <td>${scheme.fundHouse}</td>
                  <td>${scheme.folioNo}</td>
                  <td>${scheme.units.toFixed(3)}</td>
                  <td>${scheme.holdingDays.toFixed(0)}</td>
                  <td style="text-align: right;">₹${scheme.investment.toLocaleString('en-IN')}</td>
                  <td style="text-align: right;">₹${scheme.currentValue.toLocaleString('en-IN')}</td>
                  <td style="text-align: right;" class="${scheme.pnl >= 0 ? 'positive' : 'negative'}">
                    ₹${scheme.pnl.toLocaleString('en-IN')}
                  </td>
                  <td style="text-align: right;" class="${scheme.returnPercent >= 0 ? 'positive' : 'negative'}">
                    ${scheme.returnPercent.toFixed(2)}%
                  </td>
                  <td style="text-align: right;" class="${scheme.cagr >= 0 ? 'positive' : 'negative'}">
                    ${scheme.cagr.toFixed(2)}%
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated from Mutual Fund Dashboard • ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF report. Please try again.');
      }
    };

    const handleExportCSV = () => {
      try {
        const headers = ['Scheme Name', 'Fund House', 'Folio No', 'Units', 'Holding Days', 'Investment', 'Current Value', 'P&L', 'CAGR(%)'];
        const csvData = modalFilteredSchemes.map(scheme => [
          scheme.name,
          scheme.fundHouse,
          scheme.folioNo,
          scheme.units,
          scheme.holdingDays,
          scheme.investment,
          scheme.currentValue,
          scheme.pnl,
          scheme.returnPercent,
          scheme.cagr
        ]);

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.join(',') + '\n';
        csvData.forEach(row => {
          csvContent += row.join(',') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `investment-schemes-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error generating CSV:', error);
        alert('Error generating CSV file. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-7xl mx-2 max-h-[90vh] overflow-hidden flex flex-col border border-[#2A2A2A]">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#2A2A2A] flex-shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#F59E0B] truncate">All Investment Schemes</h2>
              <p className="text-[#9CA3AF] text-sm mt-1">
                Total {schemeData.length} schemes • Showing {modalFilteredSchemes.length} schemes
                {modalSearchTerm && ` • Filtered by: "${modalSearchTerm}"`}
              </p>
            </div>
            <button
              onClick={() => setShowAllSchemesModal(false)}
              className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#9CA3AF]" />
            </button>
          </div>

          <div className="p-4 sm:p-6 border-b border-[#2A2A2A] flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative min-w-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search by scheme name, fund house, or folio number..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] text-sm text-[#F9FAFB] placeholder-[#9CA3AF]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 sm:px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 sm:px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <div className="min-w-[1100px]">
              <table className="w-full">
                <thead className="bg-[#1F1A1A] sticky top-0">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Scheme Name
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#F59E0B] whitespace-nowrap">Fund House</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#F59E0B] whitespace-nowrap">Folio No</th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('units')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Units
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('holdingDays')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Holding Days
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('investment')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Investment
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('currentValue')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Current Value
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('pnl')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        P&L
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('returnPercent')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Return %
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-[#F59E0B] cursor-pointer hover:bg-[#2A2A2A] whitespace-nowrap"
                      onClick={() => handleSort('cagr')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        CAGR
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {modalFilteredSchemes.map((scheme, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#1F1A1A] transition-colors cursor-pointer"
                      onClick={() => handlePortfolioSchemeClick(scheme)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: scheme.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[#F9FAFB] text-sm truncate">{scheme.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF] truncate max-w-[120px]">{scheme.fundHouse}</td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF] font-mono truncate max-w-[100px]">{scheme.folioNo}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-sm">
                        {scheme.units.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-sm">
                        {scheme.holdingDays.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-sm">
                        ₹{scheme.investment.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#10B981] whitespace-nowrap text-sm">
                        ₹{scheme.currentValue.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap text-sm ${scheme.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        ₹{scheme.pnl.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap text-sm ${scheme.returnPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {scheme.returnPercent.toFixed(2)}%
                      </td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap text-sm ${scheme.cagr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {scheme.cagr.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {modalFilteredSchemes.length === 0 && (
                <div className="text-center py-12 text-[#9CA3AF] text-sm">
                  {modalSearchTerm ? (
                    <>No schemes found matching "<strong className="text-[#F59E0B]">{modalSearchTerm}</strong>"</>
                  ) : (
                    'No schemes available'
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-[#2A2A2A] bg-[#1F1A1A] flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm text-[#9CA3AF] text-center sm:text-left">
                Showing {modalFilteredSchemes.length} of {schemeData.length} schemes
                {modalSearchTerm && ` • Filtered by: "${modalSearchTerm}"`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalSearchTerm('');
                    setShowAllSchemesModal(false);
                  }}
                  className="px-6 py-2 border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm w-full sm:w-auto text-[#F9FAFB]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SchemeDetailModal = () => {
    if (!selectedScheme) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-hidden flex flex-col border border-[#2A2A2A]">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#2A2A2A] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedScheme.color }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#F59E0B] truncate">{selectedScheme.name}</h2>
                <p className="text-[#9CA3AF] text-sm truncate">{selectedScheme.fundHouse}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSchemeModal(false)}
              className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#9CA3AF]" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Folio Number</label>
                  <p className="text-base font-mono text-[#F9FAFB] break-all">{selectedScheme.folioNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Units Held</label>
                  <p className="text-base font-semibold text-[#F9FAFB]">{selectedScheme.units.toFixed(3)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Holding Days</label>
                  <p className="text-base font-semibold text-[#F9FAFB]">{selectedScheme.holdingDays.toFixed(0)} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Investment</label>
                  <p className="text-base font-semibold text-[#F59E0B]">
                    ₹{selectedScheme.investment.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Current Value</label>
                  <p className="text-base font-semibold text-[#10B981]">
                    ₹{selectedScheme.currentValue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Profit & Loss</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-base font-semibold ${selectedScheme.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      ₹{selectedScheme.pnl.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-sm ${selectedScheme.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      ({selectedScheme.returnPercent >= 0 ? '+' : ''}{selectedScheme.returnPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">CAGR</label>
                  <p className={`text-base font-semibold ${selectedScheme.cagr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {selectedScheme.cagr.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#9CA3AF]">Weight in Portfolio</label>
                  <p className="text-base font-semibold text-[#F9FAFB]">
                    {((selectedScheme.investment / totalInvestment) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
              <h3 className="font-semibold text-[#F59E0B] mb-3 text-sm">Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#9CA3AF]">Absolute Return:</span>
                  <span className={`ml-2 font-medium ${selectedScheme.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {selectedScheme.returnPercent.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">CAGR:</span>
                  <span className={`ml-2 font-medium ${selectedScheme.cagr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {selectedScheme.cagr.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Holding Period:</span>
                  <span className="ml-2 font-medium text-[#F9FAFB]">
                    {selectedScheme.holdingDays.toFixed(0)} days
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Units:</span>
                  <span className="ml-2 font-medium text-[#F9FAFB]">
                    {selectedScheme.units.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-[#2A2A2A] bg-[#1F1A1A] flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowSchemeModal(false)}
                className="px-6 py-2 border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm w-full sm:w-auto order-2 sm:order-1 text-[#F9FAFB]"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-colors text-sm w-full sm:w-auto order-1 sm:order-2">
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && hasClientData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-4 flex items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B] mx-auto"></div>
          <p className="mt-4 text-[#9CA3AF]">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error && hasClientData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-4 flex items-center justify-center w-full">
        <div className="bg-[#111111] p-6 rounded-xl shadow-lg max-w-md text-center border border-[#2A2A2A]">
          <h2 className="text-xl font-bold text-[#EF4444] mb-2">Error</h2>
          <p className="text-[#9CA3AF] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="w-full px-0">
        {/* Header with Back Button and Date */}
        <div className="w-full bg-[#111111] border-b border-[#2A2A2A] shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6">
            {/* Premium date selector with golden border */}
            {hasClientData && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-xl opacity-20"></div>
                <div className="relative flex items-center gap-3 bg-[#1F1A1A] px-4 py-2 rounded-xl border border-[#F59E0B]/50 hover:border-[#F59E0B] transition-all duration-200 text-sm flex-shrink-0 min-w-0">
                  <div className="p-1.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-lg">
                    <Calendar className="w-4 h-4 text-white flex-shrink-0" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <label htmlFor="portfolio-date" className="text-xs sm:text-sm font-semibold text-[#F59E0B] whitespace-nowrap flex-shrink-0">
                      Portfolio Date
                    </label>
                    <input
                      id="portfolio-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-[#F9FAFB] text-xs sm:text-sm font-medium border-0 focus:outline-none cursor-pointer hover:text-[#F59E0B] transition-colors"
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Banner with Investor Info */}
        {hasClientData && (
          <div className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309]">
            <div className="px-4 sm:px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {(() => {
                          const currentHour = new Date().getHours();
                          let greeting = "";

                          if (currentHour >= 5 && currentHour < 12) {
                            greeting = "Good Morning";
                          } else if (currentHour >= 12 && currentHour < 17) {
                            greeting = "Good Afternoon";
                          } else if (currentHour >= 17 && currentHour < 21) {
                            greeting = "Good Evening";
                          } else {
                            greeting = "Good Night";
                          }

                          return greeting;
                        })()},
                      </h1>
                      {/* Investor Name with Gradient Effect */}
                      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                        {investorName}
                      </span>
                      {/* Animated Tick Symbol */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 animate-ping bg-green-400 rounded-full w-5 h-5 opacity-75"></div>
                        <div className="absolute inset-0 animate-pulse bg-green-500 rounded-full w-5 h-5 opacity-50"></div>
                        <CheckCircle className="w-5 h-5 text-green-400 relative z-10 animate-bounce" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white/90">PAN:</span>
                        <span className="text-sm font-mono font-medium text-white tracking-wider">{panNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <Award className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white/90">KYC:</span>
                        <span className="text-sm font-medium text-green-400">Verified</span>
                      </div>
                      {/* Time-based icon */}
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        {(() => {
                          const currentHour = new Date().getHours();
                          if (currentHour >= 5 && currentHour < 12) {
                            return <Sun className="w-4 h-4 text-yellow-400" />;
                          } else if (currentHour >= 12 && currentHour < 17) {
                            return <Sun className="w-4 h-4 text-orange-400" />;
                          } else if (currentHour >= 17 && currentHour < 21) {
                            return <Moon className="w-4 h-4 text-blue-300" />;
                          } else {
                            return <Moon className="w-4 h-4 text-indigo-300" />;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-4 min-w-0 min-h-screen">
          {/* Left Column - Main Content (3 columns) */}
          <div className="xl:col-span-3 space-y-6 min-w-0 w-full p-4 sm:p-6 flex flex-col min-h-screen">
            {/* Quick Actions Section */}
            <div className="bg-[#111111] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2A2A2A] w-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                  <Zap className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <h2 className="text-lg font-semibold text-[#F9FAFB]">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={handleInvestClick}
                  className="flex flex-col items-center justify-center p-4 bg-[#1F1A1A] hover:bg-[#2A2A2A] rounded-xl transition-all duration-200 group border border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-md"
                >
                  <TrendingUp className="w-6 h-6 text-[#F59E0B] group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-sm font-medium text-[#F9FAFB]">Invest</span>
                </button>

                <button
                  onClick={handleGoalsClick}
                  className="flex flex-col items-center justify-center p-4 bg-[#1F1A1A] hover:bg-[#2A2A2A] rounded-xl transition-all duration-200 group border border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-md"
                >
                  <Target className="w-6 h-6 text-[#F59E0B] group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-sm font-medium text-[#F9FAFB]">Goals</span>
                </button>

                <button
                  onClick={handleWithdrawClick}
                  className="flex flex-col items-center justify-center p-4 bg-[#1F1A1A] hover:bg-[#2A2A2A] rounded-xl transition-all duration-200 group border border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-md"
                >
                  <Briefcase className="w-6 h-6 text-[#F59E0B] group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-sm font-medium text-[#F9FAFB]">Portfolio</span>
                </button>

                <button
                  onClick={handleMySIPsClick}
                  className="flex flex-col items-center justify-center p-4 bg-[#1F1A1A] hover:bg-[#2A2A2A] rounded-xl transition-all duration-200 group border border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-md"
                >
                  <Repeat className="w-6 h-6 text-[#F59E0B] group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-sm font-medium text-[#F9FAFB]">My SIPs</span>
                </button>
              </div>
            </div>

            {/* Portfolio Summary Section - Enhanced Design */}
            <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden w-full">
              {/* Header with gradient and icon */}
              <div className="p-4 sm:p-5 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#F59E0B] to-[#B45309] rounded-lg shadow-md">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                      Portfolio Summary
                    </h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Real-time portfolio performance metrics
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Total Investment Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-2xl border border-[#2A2A2A] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F59E0B]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#F59E0B] to-[#B45309] rounded-xl shadow-md">
                          <IndianRupee className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/20 px-2 py-1 rounded-full tracking-wide">
                          TOTAL
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1 tracking-wide">Total Investment</p>
                      <p className="text-2xl font-black text-[#F59E0B] tracking-tight">
                        ₹{totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-[#F59E0B]">100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Value Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-2xl border border-[#2A2A2A] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#10B981]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#10B981]/10 rounded-full blur-2xl group-hover:bg-[#10B981]/20 transition-all"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl shadow-md">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#10B981] bg-[#10B981]/20 px-2 py-1 rounded-full tracking-wide">
                          CURRENT
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1 tracking-wide">Current Value</p>
                      <p className="text-2xl font-black text-[#10B981] tracking-tight">
                        ₹{totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-500" style={{ width: `${(totalCurrentValue / totalInvestment) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-[#10B981]">{((totalCurrentValue / totalInvestment) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 1D Return Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-2xl border border-[#2A2A2A] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F59E0B]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#F59E0B] to-[#B45309] rounded-xl shadow-md">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/20 px-2 py-1 rounded-full tracking-wide">
                          TODAY
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1 tracking-wide">1D Return</p>
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <p className={`text-2xl font-black ${totalLastDayReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} tracking-tight`}>
                          {totalLastDayReturn >= 0 ? '+' : ''}₹{totalLastDayReturn.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <span className={`text-sm font-bold ${totalLastDayReturnPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          ({totalLastDayReturnPercent >= 0 ? '+' : ''}{totalLastDayReturnPercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${totalLastDayReturnPercent >= 0 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'}`}
                            style={{ width: `${Math.min(Math.abs(totalLastDayReturnPercent), 100)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-medium ${totalLastDayReturnPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {Math.abs(totalLastDayReturnPercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XIRR Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-2xl border border-[#2A2A2A] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F59E0B]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#F59E0B] to-[#B45309] rounded-xl shadow-md">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/20 px-2 py-1 rounded-full tracking-wide">
                          RETURNS
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1 tracking-wide">XIRR</p>
                      <p className={`text-2xl font-black ${overallXirr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} tracking-tight`}>
                        {overallXirr.toFixed(2)}%
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${overallXirr >= 0 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'}`}
                            style={{ width: `${Math.min(Math.abs(overallXirr), 100)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-medium ${overallXirr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {Math.abs(overallXirr).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profit & Loss Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-2xl border border-[#2A2A2A] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F59E0B]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 bg-gradient-to-br ${totalPnL >= 0 ? 'from-[#10B981] to-[#059669]' : 'from-[#EF4444] to-[#DC2626]'} rounded-xl shadow-md`}>
                          {totalPnL >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-white" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold ${totalPnL >= 0 ? 'text-[#10B981] bg-[#10B981]/20' : 'text-[#EF4444] bg-[#EF4444]/20'} px-2 py-1 rounded-full tracking-wide`}>
                          P&L
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1 tracking-wide">Profit & Loss</p>
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <p className={`text-2xl font-black ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} tracking-tight`}>
                          {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <span className={`text-sm font-bold ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          ({((totalPnL / totalInvestment) * 100).toFixed(2)}%)
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${totalPnL >= 0 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'}`}
                            style={{ width: `${Math.min(Math.abs((totalPnL / totalInvestment) * 100), 100)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-medium ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {Math.abs((totalPnL / totalInvestment) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Details Section */}
            {hasClientData ? (
              validParentPortfolioData.length === 0 ? (
                <div className="space-y-4 sm:space-y-6 w-full min-w-0 flex-1 flex flex-col">
                  <div className="bg-[#111111] p-6 sm:p-8 rounded-xl shadow-lg border border-[#2A2A2A] text-center w-full flex-1 flex items-center justify-center min-h-[600px]">
                    <div className="max-w-md mx-auto w-full">
                      <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-[#9CA3AF] mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-[#F9FAFB] mb-2">No Portfolio Data</h3>
                      <p className="text-[#9CA3AF] text-sm sm:text-base mb-3 sm:mb-4">
                        No portfolio data found for the selected date and investor information.
                      </p>
                      <div className="text-xs sm:text-sm text-[#9CA3AF]">
                        <p>Please check:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Investor name and PAN are correct</li>
                          <li>• Portfolio exists for the selected date</li>
                          <li>• Data is available in the system</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Portfolio Details Table */}
                  <div className="space-y-3 sm:space-y-4 w-full min-w-0 flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-[#F9FAFB] truncate min-w-0">Portfolio Details</h2>
                      {schemeData.length > 10 && (
                        <button
                          onClick={() => setShowAllSchemesModal(true)}
                          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-colors text-sm w-fit flex-shrink-0 whitespace-nowrap shadow-sm"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          View All ({schemeData.length})
                        </button>
                      )}
                    </div>

                    <div className="bg-[#111111] p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden w-full min-w-0 flex-1 flex flex-col min-h-[600px]">
                      {displayedSchemes.length > 0 ? (
                        <div className="overflow-x-auto flex-1 flex flex-col">
                          <div className="min-w-[900px] flex-1">
                            <table className="w-full text-xs sm:text-sm h-full">
                              <thead>
                                <tr className="bg-[#1F1A1A] text-left">
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] whitespace-nowrap min-w-[150px]">Scheme</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] whitespace-nowrap min-w-[100px]">Fund House</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] whitespace-nowrap min-w-[80px]">Folio No</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">Units</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">Holding Days</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">Investment</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">Current Value</th>
                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">P&L</th>

                                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-semibold text-[#F59E0B] text-right whitespace-nowrap">CAGR(%)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#2A2A2A]">
                                {displayedSchemes.map((scheme, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-[#1F1A1A] transition-colors cursor-pointer"
                                    onClick={() => handlePortfolioSchemeClick(scheme)}
                                  >
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 font-medium text-[#F9FAFB] min-w-0">
                                      <div className="flex items-center gap-1 sm:gap-2 max-w-[140px] sm:max-w-[180px] lg:max-w-[220px]">
                                        <div
                                          className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: scheme.color }}
                                        />
                                        <span className="truncate text-xs sm:text-sm">{scheme.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-[#9CA3AF] text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
                                      {scheme.fundHouse}
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-[#9CA3AF] text-xs font-mono truncate max-w-[70px] sm:max-w-[90px]">
                                      {scheme.folioNo}
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-xs sm:text-sm">
                                      {scheme.units.toFixed(3)}
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-xs sm:text-sm">
                                      {scheme.holdingDays.toFixed(0)}
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium text-[#F59E0B] whitespace-nowrap text-xs sm:text-sm">
                                      ₹{scheme.investment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium text-[#10B981] whitespace-nowrap text-xs sm:text-sm">
                                      ₹{scheme.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                    <td className={`px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium whitespace-nowrap text-xs sm:text-sm ${scheme.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                      ₹{scheme.pnl.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>

                                    <td className={`px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3 text-right font-medium whitespace-nowrap text-xs sm:text-sm ${scheme.cagr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                      {scheme.cagr.toFixed(2)}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {schemeData.length > 10 && (
                              <div className="text-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#2A2A2A]">
                                <p className="text-xs sm:text-sm text-[#9CA3AF]">
                                  Showing 10 of {schemeData.length} schemes
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-xs sm:text-sm min-h-[400px]">
                          No portfolio data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Three Column Layout for Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Transactions Card */}
                    <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden min-w-0">
                      <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                              <FileText className="w-4 h-4 text-[#F59E0B]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#F9FAFB]">Recent Transactions</h2>
                          </div>
                          {allTransactions.length > 5 && (
                            <button
                              onClick={() => setShowAllTransactions(!showAllTransactions)}
                              className="px-3 py-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-colors text-xs font-medium shadow-sm"
                            >
                              {showAllTransactions ? 'Show Recent' : `View All (${allTransactions.length})`}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 max-h-[400px] overflow-y-auto">
                        {transactionsToDisplay.length > 0 ? (
                          <div className="space-y-3">
                            {transactionsToDisplay.map((transaction, index) => (
                              <div key={index} className="p-3 bg-[#1F1A1A] rounded-lg hover:bg-[#2A2A2A] transition-all duration-200 border border-[#2A2A2A]">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-[#F9FAFB] truncate flex-1">{transaction.out_scheme}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${transaction.out_trxntype === 'Systematic Investment'
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : transaction.out_trxntype === 'Redemption'
                                      ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                      : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                    }`}>
                                    {transaction.out_trxntype || 'Purchase'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-[#9CA3AF]">
                                    {transaction.out_traddate ? new Date(transaction.out_traddate).toLocaleDateString('en-IN') : 'N/A'}
                                  </span>
                                  <span className="font-semibold text-[#F59E0B]">
                                    ₹{parseFloat(transaction.out_amount).toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-[#9CA3AF] mt-1">
                                  <span>{parseFloat(transaction.out_units).toFixed(3)} units</span>
                                  <span>₹{parseFloat(transaction.out_purprice).toFixed(4)}/unit</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-32 flex items-center justify-center text-[#9CA3AF] text-sm">
                            No transaction data available
                          </div>
                        )}

                        {showAllTransactions && allTransactions.length > 10 && (
                          <div className="mt-3 text-center">
                            <p className="text-xs text-[#9CA3AF]">
                              Showing all {allTransactions.length} transactions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Performing Schemes Card */}
                    <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden min-w-0">
                      <TopPerformingSchemes
                        data={topPerformingSchemes}
                        onSchemeClick={handleTopPerformingSchemeClick}
                      />
                    </div>

                    {/* Trending Funds (Recommended Funds) Card */}
                    <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] w-full overflow-hidden min-w-0">
                      <RecommendedFunds
                        data={recommendedFunds}
                        onSchemeClick={handleRecommendedFundClick}
                        loading={recommendedFundsLoading}
                      />
                    </div>
                  </div>
                </>
              )
            ) : (
              // No Client Data Message
              <div className="bg-[#111111] p-6 sm:p-8 rounded-xl shadow-lg border border-[#2A2A2A] text-center w-full flex-1 flex items-center justify-center min-h-[600px]">
                <div className="max-w-md mx-auto w-full">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-[#9CA3AF] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-[#F9FAFB] mb-2">No Client Data Available</h3>
                  <p className="text-[#9CA3AF] text-sm sm:text-base mb-3 sm:mb-4">
                    Please provide investor information to view portfolio details.
                  </p>
                  <div className="text-xs sm:text-sm text-[#9CA3AF]">
                    <p>Required information:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Investor Name</li>
                      <li>• PAN Number</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Account Section (1 column) */}
          <div className="xl:col-span-1 min-w-0 w-full bg-[#111111] border-l border-[#2A2A2A]">
            <div className="sticky top-0 h-screen overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Account Card */}
                <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden w-full min-w-0">
                  <div className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Account</h3>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <Link
                      href="/my-profile"
                      className="flex items-center justify-between p-3 text-[#F9FAFB] hover:bg-[#1F1A1A] rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <ImProfile className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-medium">Profile</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 rotate-180 text-[#9CA3AF]" />
                    </Link>

                    <Link
                      href="/change-password"
                      className="flex items-center justify-between p-3 text-[#F9FAFB] hover:bg-[#1F1A1A] rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaUnlockAlt className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-medium">Change Password</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 rotate-180 text-[#9CA3AF]" />
                    </Link>

                    <div className="border-t border-[#2A2A2A] my-2"></div>
                  </div>

                  <div className="p-4 bg-[#1F1A1A] border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                      <span>Online</span>
                      <span className="ml-auto">v2.1.0</span>
                    </div>
                  </div>
                </div>

                {/* Asset Allocation Pie Chart - Enhanced Design */}
                <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden">
                  {/* Header with gradient */}
                  <div className="p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                        <PieChart className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#F9FAFB]">Asset Allocation</h3>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1 ml-10">
                      Diversification across asset classes
                    </p>
                  </div>

                  <div className="p-5">
                    {/* Chart Container */}
                    <div className="h-72 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <defs>
                            {assetAllocation.map((entry, index) => (
                              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={assetAllocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                              // Check if values are defined
                              if (midAngle === undefined || percent === undefined || index === undefined) return null;

                              const RADIAN = Math.PI / 180;
                              const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 1.2;
                              const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                              const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);

                              // Only show label if percentage is significant (> 5%)
                              if (percent < 0.05) return null;

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#9CA3AF"
                                  textAnchor={x > (cx as number) ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  className="text-xs font-medium"
                                >
                                  {`${assetAllocation[index]?.name} ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={false}
                          >
                            {assetAllocation.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${index})`}
                                stroke="#111111"
                                strokeWidth={2}
                                className="cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, props: any) => {
                              return [`${value}%`, props?.payload?.name || name];
                            }}
                            contentStyle={{
                              backgroundColor: '#111111',
                              border: '1px solid #2A2A2A',
                              borderRadius: '12px',
                              padding: '8px 12px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              fontSize: '12px',
                              color: '#F9FAFB'
                            }}
                            itemStyle={{ color: '#F9FAFB' }}
                            labelStyle={{ color: '#9CA3AF', fontWeight: '500' }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={48}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value, entry, index) => {
                              const item = assetAllocation[index as number];
                              if (!item) return value;
                              return (
                                <span className="text-xs text-[#F9FAFB] font-medium ml-1">
                                  {value} ({item.value}%)
                                </span>
                              );
                            }}
                            wrapperStyle={{
                              paddingTop: '16px',
                              fontSize: '12px'
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2A2A2A]">
                      {assetAllocation.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-[#1F1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-medium text-[#F9FAFB]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-[#F59E0B]">{item.value}%</span>
                            <span className="text-xs text-[#9CA3AF]">
                              {item.value === 63 ? '₹4.8L' : item.value === 21 ? '₹1.6L' : item.value === 11 ? '₹0.8L' : '₹0.4L'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Note */}
                    <div className="mt-4 p-3 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[#F9FAFB]">
                          Your portfolio is well-diversified across {assetAllocation.length} asset classes with
                          <span className="font-semibold text-[#F59E0B]"> {assetAllocation[0]?.value || 0}% </span>
                          in {assetAllocation[0]?.name || 'Equity'} for growth potential.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAllSchemesModal && <AllSchemesModal />}
        {showSchemeModal && <SchemeDetailModal />}
        {showInvestorPopup && (
          <InvestorPopup
            schemeData={selectedScheme}
            open={showInvestorPopup}
            investor={investorList}
            onClose={() => setshowInvestorPopup(false)}
          />
        )}

        {showInvestorPicker && (
          <InvestorPicker
            schemeData={selectedScheme}
            open={showInvestorPicker}
            onClose={() => setshowInvestorPicker(false)}
          />
        )}

        {showOrderPopup && selectedInvestor && (
          <OrderPopup
            schemeData={selectedScheme}
            investor={selectedInvestor}
            sipData={sipData}
            source={"Fund Explorer"}
            open={showOrderPopup}
            onClose={() => setShowOrderPopup(false)}
          />
        )}
      </div>

      {onBoardingModal && (
        <div>
          <OnBoarding onBoardingModal={onBoardingModal} />
        </div>
      )}
    </div>
  );
};

export default MutualFundDashboard;