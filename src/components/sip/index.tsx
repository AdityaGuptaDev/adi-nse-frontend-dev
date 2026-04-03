import { useState, useEffect, useRef, useContext } from "react";
import {
  ArrowLeft, Pencil, ChevronDown, Plus, List, CheckCircleIcon,
  Info, Zap, Medal, TrendingUp, Ban, Sparkles, ArrowRight,
  Calendar, Clock, Shield, Star, Wallet, Gem, Rocket,
  ChevronRight, Award, Target, BarChart3, Sun, Moon,
  CreditCard, Globe, Smartphone, Lock, ChevronLeft,
  AlertCircle, Check, X, Filter, Search, Home,
  PieChart, Settings, Bell, User, Menu, TrendingUp as TrendingIcon,
  Activity, DollarSign, LineChart, Briefcase, Percent, XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// API Imports
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert, numberToWords, convertNumberIndian } from "@/utils/helpers";
import { USER_DATA, schemeColors, toFixedDataForReturn, arrTransactionType, freqMap, dividendOptions } from "@/utils/constants";
import AccountContext from "@/context/AccountContext/Account.context";

import { executeMfuTransaction, TransactionData } from "@/services/mfuTransactionService";
import { generateReference, fetchClientIp, getMandates, searchByISIN, searchByCanIdmfuBankDetails } from "@/api/transaction";
import { generateUniqueId } from "@/utils/mfu/generateUtrn";

import Loader from "@/commonUI/Loader";
import FullPageLoader from "@/commonUI/FullPageLoader";

import { getBankAccount } from "@/api/holder";
import { getPayOutSec, getPaySec, getSubSeqSec, getSysSchList, getSchList } from "../mutual-fund/transaction";
import { useFundStore } from "@/store/useFundStore";

// Constants
const frequencies = [
  { label: "Daily", value: "D", icon: "☀️", sub: "Every day", hindiSub: "हर दिन" },
  { label: "Weekly", value: "W", icon: "📆", sub: "Every week", hindiSub: "हर हफ्ते" },
  { label: "Monthly", value: "M", icon: "📅", sub: "Per month", hindiSub: "हर महीने" },
];

const fundIcons = ["🏛️", "🚀", "🌍", "⚡", "🎯", "📈", "📊", "💼", "💎", "⭐", "🔥", "💫", "🌟", "⚡", "💪"];

const Stars = ({ n }: { n: number }) => (
  <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#FBBF24" }}>
    {"★".repeat(n)}
    <span style={{ color: "#374151" }}>{"★".repeat(5 - n)}</span>
  </span>
);

// Golden Black Theme
const goldenBlackTheme = {
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

// Fallback market data function
const getFallbackMarketData = () => {
  return [
    {
      index: "SENSEX",
      value: "72,456.32",
      change: "+0.45%",
      changeType: "positive",
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      index: "NIFTY 50",
      value: "21,852.45",
      change: "+0.52%",
      changeType: "positive",
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      index: "BANK NIFTY",
      value: "46,123.78",
      change: "-0.12%",
      changeType: "negative",
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      index: "INDIA VIX",
      value: "13.45",
      change: "-2.3%",
      changeType: "positive",
      lastUpdate: new Date().toLocaleTimeString()
    },
  ];
};

// Market Data Service - Updated for TradingView
const marketDataService = {
  getIndices: async () => {
    try {
      const response = await fetch('https://scanner.tradingview.com/india/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: {
            tickers: [
              'BSE:SENSEX',
              'NSE:NIFTY',
              'NSE:BANKNIFTY',
              'NSE:INDIAVIX'
            ],
            query: {
              types: []
            }
          },
          columns: [
            'name',
            'close',
            'change',
            'change_abs',
            'volume',
            'high',
            'low'
          ]
        })
      });

      const data = await response.json();

      if (data && data.data) {
        return data.data.map((item: any) => {
          const change = item.d[2] || 0;
          const changeType = change > 0 ? 'positive' : 'negative';
          return {
            index: item.d[0] || 'N/A',
            value: item.d[1] ? item.d[1].toFixed(2) : '0.00',
            change: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
            changeType: changeType,
            high: item.d[5] || 0,
            low: item.d[6] || 0,
            volume: item.d[4] || 0
          };
        });
      }
      return getFallbackMarketData();
    } catch (error) {
      console.error("Error fetching from TradingView:", error);
      return getFallbackMarketData();
    }
  },

  getGlobalIndices: async () => {
    try {
      const response = await fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: {
            tickers: [
              'DJI:DJI',
              'NASDAQ:IXIC',
              'SP:SPX',
              'FX:USDCAD'
            ],
            query: {
              types: []
            }
          },
          columns: [
            'name',
            'close',
            'change',
            'change_abs'
          ]
        })
      });

      const data = await response.json();

      if (data && data.data) {
        return data.data.map((item: any) => ({
          name: item.d[0] || 'N/A',
          value: item.d[1] ? item.d[1].toFixed(2) : '0.00',
          change: item.d[2] ? item.d[2].toFixed(2) : '0.00',
          changeType: (item.d[2] || 0) > 0 ? 'positive' : 'negative'
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching global indices:", error);
      return [];
    }
  },

  getSectorPerformance: async () => {
    try {
      const response = await fetch('https://scanner.tradingview.com/india/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: {
            tickers: [
              'NSE:NIFTYBANK',
              'NSE:NIFTYIT',
              'NSE:NIFTYPHARMA',
              'NSE:NIFTYAUTO',
              'NSE:NIFTYFMCG',
              'NSE:NIFTYREALTY'
            ],
            query: {
              types: []
            }
          },
          columns: [
            'name',
            'close',
            'change',
            'change_abs'
          ]
        })
      });

      const data = await response.json();

      if (data && data.data) {
        return data.data.map((item: any) => ({
          sector: (item.d[0] || '').replace('NIFTY', '').replace('NIFTY', '') || 'Unknown',
          value: item.d[1] ? item.d[1].toFixed(2) : '0.00',
          change: item.d[2] ? item.d[2].toFixed(2) : '0.00',
          changeType: (item.d[2] || 0) > 0 ? 'positive' : 'negative'
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching sector data:", error);
      return [];
    }
  }
};

// Tips Service
const tipsService = {
  getTips: async () => {
    try {
      const response = await api.get('/investment/tips');
      return response.data?.data || [
        { icon: "💡", tip: "Start early to maximize compounding", hindiTip: "जल्दी शुरू करें, ज्यादा कमाएं" },
        { icon: "📊", tip: "Diversify across fund categories", hindiTip: "विविध फंड में निवेश करें" },
        { icon: "⏰", tip: "Stay invested for long term", hindiTip: "लंबी अवधि निवेश करें" },
        { icon: "🎯", tip: "SIP reduces market timing risk", hindiTip: "एसआईपी से बाजार जोखिम कम" },
      ];
    } catch (error) {
      return [
        { icon: "💡", tip: "Start early to maximize compounding", hindiTip: "जल्दी शुरू करें, ज्यादा कमाएं" },
        { icon: "📊", tip: "Diversify across fund categories", hindiTip: "विविध फंड में निवेश करें" },
        { icon: "⏰", tip: "Stay invested for long term", hindiTip: "लंबी अवधि निवेश करें" },
        { icon: "🎯", tip: "SIP reduces market timing risk", hindiTip: "एसआईपी से बाजार जोखिम कम" },
      ];
    }
  }
};

// FAQ Service
const faqService = {
  getFAQs: async () => {
    try {
      const response = await api.get('/faq/sip');
      return response.data?.data || [
        { question: "What is SIP?", answer: "Systematic Investment Plan allows you to invest fixed amounts regularly" },
        { question: "What is minimum amount?", answer: "You can start SIP with just ₹100" },
        { question: "SIP vs Lumpsum?", answer: "SIP helps reduce market timing risk through rupee cost averaging" },
        { question: "Can I modify SIP?", answer: "Yes, you can modify or stop SIP anytime" },
      ];
    } catch (error) {
      return [
        { question: "What is SIP?", answer: "Systematic Investment Plan allows you to invest fixed amounts regularly" },
        { question: "What is minimum amount?", answer: "You can start SIP with just ₹100" },
        { question: "SIP vs Lumpsum?", answer: "SIP helps reduce market timing risk through rupee cost averaging" },
        { question: "Can I modify SIP?", answer: "Yes, you can modify or stop SIP anytime" },
      ];
    }
  }
};

export default function SipPage() {
  const router = useRouter();
  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);
  const { clearData, investorList: storeInvestorList } = useFundStore();

  // State for amount selection
  const [selAmt, setSelAmt] = useState(100);
  const [customAmt, setCustomAmt] = useState("");
  const amount = customAmt ? (parseInt(customAmt) || 0) : selAmt;

  // State for funds
  const [funds, setFunds] = useState<any[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<any[]>([]);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);

  // New state for category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // State for SIP schedule
  const [freq, setFreq] = useState("M");
  const [sipDate, setSipDate] = useState<Date | null>(null);
  const [sipDay, setSipDay] = useState("");
  const [sipMonth, setSipMonth] = useState("");
  const [sipYear, setSipYear] = useState("");
  const [allowedSipDays, setAllowedSipDays] = useState<number[]>([]);
  const [sipData, setSipData] = useState<any[]>([]);

  // State for investor
  const [investorList, setInvestorList] = useState<any[]>([]);
  const [canIdList, setCanIdList] = useState<any[]>([]);
  const [selectedCan, setSelectedCan] = useState<any>("");
  const [selectedHolder, setSelectedHolder] = useState<any>(null);
  const [investorId, setInvestorId] = useState<number | null>(null);

  // State for folio
  const [selectedFolio, setSelectedFolio] = useState<any>(null);
  const [showFolioDropdown, setShowFolioDropdown] = useState(false);
  const [folioSelectionMode, setFolioSelectionMode] = useState<'existing' | 'new'>('existing');
  const [investorData, setInvestorData] = useState<any[]>([]);
  const [newFolioNumber, setNewFolioNumber] = useState("");

  // State for bank and mandate
  const [bankList, setBankList] = useState<any[]>([]);
  const [mandateList, setMandateList] = useState<any[]>([]);
  const [selectedMandate, setSelectedMandate] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState("UP");
  const [accNo, setAccNo] = useState("");
  const [accType, setAccType] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [micr, setMicr] = useState("");
  const [beneVan, setBeneVan] = useState("");

  // State for transaction
  const [rtaAmcCode, setRtaAmcCode] = useState("");
  const [rtaSchCode, setRtaSchCode] = useState("");
  const [outRtaSchCode, setOutRtaSchCode] = useState("");
  const [divOpt, setDivOpt] = useState("");
  const [minAmount, setMinAmount] = useState("500");
  const [txnVolType, setTxnVolType] = useState("A");
  const [endMonth, setEndMonth] = useState("12");
  const [endYear, setEndYear] = useState((new Date().getFullYear() + 40).toString());

  // State for UI
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isTransact, setIsTransact] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);
  const [exeptions, setExceptions] = useState({ value: false, message: "" });
  const [transactionError, setTransactionError] = useState("");
  const [commonError, setCommonError] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const user = getLS(USER_DATA)
  const theme = goldenBlackTheme;

  // Check screen size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      } else if (width >= 768 && width < 1024) {
        setShowLeftSidebar(false);
        setShowRightSidebar(true);
      } else {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract investor ID from user data
  useEffect(() => {
    if (user?.InvestorRegistration?.id) {
      setInvestorId(user.InvestorRegistration.id);
    }
  }, [user]);

  // Function to fetch CAN ID from API
  const fetchCanId = async () => {
    if (!investorId) return;
    try {
      const response = await api.get(`/partner/getCanId/${investorId}`);
      if (response.data?.data?.data && response.data.data.data.length > 0) {
        const canIds = response.data.data.data.map((item: any) => item.CAN_Id);
        setCanIdList(canIds);
        if (canIds.length > 0 && !selectedCan) {
          setSelectedCan(canIds[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching CAN ID:", error);
    }
  };

  const fetchBank = async () => {
    if (!investorId) return;

    const response = await getBankAccount(investorId);
    const data = response?.data?.data?.data
    setBankList(data)

    const resp = await getMandates(investorId);
    if (response.data?.data?.data.length <= 0) {
      setCommonError("Create mandate for SIP / एसआईपी के लिए मैंडेट बनाएं")
    } else {
      const mandateList = resp.data?.data?.data.filter((mandate: any) => mandate.mmrnaggrstatus === "AK");
      setMandateList(mandateList)
    }
  }

  // Load user data on mount
  useEffect(() => {
    setLoaded(true);
    loadUserData();
    fetchTopPerformingFunds();
  }, []);

  // Fetch CAN ID and bank data when investor ID is available
  useEffect(() => {
    if (investorId) {
      fetchCanId();
      fetchBank();
    }
  }, [investorId]);

  // Function to check if a fund supports the selected frequency
  const doesFundSupportFrequency = (fund: any, frequency: string): boolean => {
    if (!fund.minAmountDetails || !Array.isArray(fund.minAmountDetails)) {
      return false;
    }

    // Check if there's an entry for the selected frequency
    return fund.minAmountDetails.some((detail: any) => detail.sys_freq === frequency);
  };

  // Function to get the minimum amount for a specific frequency
  const getMinAmountForFrequency = (fund: any, frequency: string): number => {
    if (!fund.minAmountDetails || !Array.isArray(fund.minAmountDetails)) {
      return fund.minAmount || 100;
    }

    const freqDetail = fund.minAmountDetails.find((detail: any) => detail.sys_freq === frequency);
    if (freqDetail && freqDetail.min_amt) {
      return parseFloat(freqDetail.min_amt);
    }
    return fund.minAmount || 100;
  };

  // Function to get available dates for a fund based on frequency
  const getAvailableDatesForFund = (fund: any, frequency: string): number[] => {
    if (!fund.minAmountDetails || !Array.isArray(fund.minAmountDetails)) {
      return [];
    }

    const freqDetail = fund.minAmountDetails.find((detail: any) => detail.sys_freq === frequency);
    if (!freqDetail || !freqDetail.sys_date) {
      return [];
    }

    // Parse the sys_date string
    const dateStr = freqDetail.sys_date.trim();
    if (!dateStr) return [];

    let dates: number[] = [];

    // Split by various separators
    if (dateStr.includes('/')) {
      dates = dateStr.split('/').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
    } else if (dateStr.includes(',')) {
      dates = dateStr.split(',').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
    } else {
      // Handle space-separated dates
      dates = dateStr.split(/\s+/).map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
    }

    return dates;
  };

  // Filter funds based on amount, category, and frequency
  useEffect(() => {
    if (funds.length > 0) {
      // First filter by frequency support - ONLY show funds that support the selected frequency
      let filtered = funds.filter(f => doesFundSupportFrequency(f, freq));

      // Then filter by minimum amount for the selected frequency
      filtered = filtered.filter(f => {
        const minAmtForFreq = getMinAmountForFrequency(f, freq);
        return minAmtForFreq <= amount;
      });

      // Calculate category counts based on filtered funds
      const counts: Record<string, number> = {};
      filtered.forEach(fund => {
        counts[fund.category] = (counts[fund.category] || 0) + 1;
      });
      setCategoryCounts(counts);

      // Then filter by category if not "All"
      if (selectedCategory !== "All") {
        filtered = filtered.filter(f => f.category === selectedCategory);
      }

      // If date is selected, filter funds that support that date
      if (sipDate) {
        const selectedDay = sipDate.getDate();
        filtered = filtered.filter(f => {
          const availableDates = getAvailableDatesForFund(f, freq);
          // If no specific dates are specified, all dates are allowed
          if (availableDates.length === 0) return true;
          return availableDates.includes(selectedDay);
        });
      }

      setFilteredFunds(filtered);

      // Clear selected fund if it doesn't match filters
      if (selectedFund) {
        const stillValid = doesFundSupportFrequency(selectedFund, freq) &&
          getMinAmountForFrequency(selectedFund, freq) <= amount &&
          (selectedCategory === "All" || selectedFund.category === selectedCategory);

        if (!stillValid) {
          setSelectedFund(null);
        }
      }
    }
  }, [amount, funds, selectedFund, selectedCategory, freq, sipDate]);

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      if (storeInvestorList && storeInvestorList.length > 0) {
        setInvestorList(storeInvestorList);
        const firstInvestor = storeInvestorList[0];
        setSelectedHolder(firstInvestor?.name || firstInvestor?.holder_name || null);
        return;
      }

      const userData: any = getLS(USER_DATA);
      if (userData?.InvestorRegistration) {
        const investors = Array.isArray(userData.InvestorRegistration)
          ? userData.InvestorRegistration
          : [userData.InvestorRegistration];
        setInvestorList(investors);
        if (investors.length > 0) {
          const firstInvestor = investors[0];
          setSelectedHolder(firstInvestor?.name || firstInvestor?.holder_name || null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setCommonError("Error loading investor data / निवेशक डेटा लोड करने में त्रुटि");
    }
  };

  // Fetch top performing funds from API
  const fetchTopPerformingFunds = async () => {
    setLoadingFunds(true);
    try {
      const response = await api.get(`/mutual-fund/sip-get-top-performing-schemes`);
      console.log("Top Performing schemes:=", response)
      if (response.data?.data && response.data.data.length > 0) {

        const categoryList = response.data.data.map((cat: any) => ({
          id: cat.id,
          name: cat.categoryName
        }));
        setCategories([{ id: "0", name: "All" }, ...categoryList]);

        const transformedFunds = response.data.data.flatMap((category: any, catIndex: number) => {
          return (category.scheme || []).map((scheme: any, index: number) => {
            const schemeMaster = scheme.SchemeMaster || {};
            const colorIndex = (catIndex + index) % schemeColors.length;

            // Extract min amount details for different frequencies
            const minAmountDetails = scheme.minAmount || [];

            return {
              id: scheme.id || schemeMaster.id || `${catIndex}-${index}`,
              name: schemeMaster.ms_fullname || scheme.scheme_name || "Unknown Fund",
              category: category.categoryName || schemeMaster.SchemeCategory?.Name || "Equity",
              categoryId: category.id,
              minAmount: 100,
              minAmountDetails: minAmountDetails, // Store all frequency details
              returns1Y: parseFloat(scheme.Return1yr || scheme.returns_1yr || 0),
              returns3Y: parseFloat(scheme.Return3yr || scheme.returns_3yr || 0),
              risk: schemeMaster.riskLevel || scheme.risk_level || "Moderate",
              rating: scheme.rating || 4,
              aum: scheme.AUM || scheme.aum || scheme.total_aum || "N/A",
              badge: scheme.is_popular ? "POPULAR" : (scheme.is_top_rated ? "TOP RATED" : null),
              badgeColor: scheme.is_popular ? theme.primary : (scheme.is_top_rated ? theme.primary : "#6B7280"),
              icon: fundIcons[(catIndex + index) % fundIcons.length],
              schemeISIN: schemeMaster.schemeISIN || scheme.ISIN || scheme.isin || scheme.scheme_isin,
              amc_id: schemeMaster.amc_id || scheme.amc_id,
              dividend_type: scheme.dividend_type || "Growth",
              categoryReturnAvg: scheme.categoryReturnAvg || 0,
              color: theme.primary,
              SchemeMaster: schemeMaster,
              schemeData: scheme, // Store original scheme data for reference
            };
          });
        });
        setFunds(transformedFunds);
      } else {
        setFunds([]);
      }
    } catch (error) {
      console.error("Error fetching top performing funds:", error);
      setFunds([]);
    } finally {
      setLoadingFunds(false);
    }
  };

  // Handle fund selection
  const handleFundSelect = async (fund: any) => {
    setSelectedFund(fund);
    setCommonError("");
    setActiveStep(4);

    // Reset date when fund changes to avoid date mismatch
    setSipDate(null);
    setSipDay("");
    setSipMonth("");
    setSipYear("");

    if (fund?.schemeISIN) {
      try {
        const response = await searchByISIN(fund.schemeISIN);
        const sipData = response?.data?.data?.data || [];
        setSipData(sipData);

        const sipTransactions = sipData.filter((item: any) => item.txn_type === "V");
        if (sipTransactions.length > 0) {
          const firstTxn = sipTransactions[0];
          setRtaAmcCode(firstTxn.fund_code || "");
          setRtaSchCode(firstTxn.scheme_code || "");
          setDivOpt(firstTxn.div_opt || "");
          setMinAmount(firstTxn.min_amt || "500");

          // Get allowed SIP days from the fund's minAmountDetails for selected frequency
          const freqDetail = fund.minAmountDetails?.find((d: any) => d.sys_freq === freq);
          if (freqDetail?.sys_date) {
            const dateStr = freqDetail.sys_date.trim();
            let dates: number[] = [];
            if (dateStr.includes('/')) {
              dates = dateStr.split('/').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
            } else if (dateStr.includes(',')) {
              dates = dateStr.split(',').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
            } else {
              dates = dateStr.split(/\s+/).map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
            }
            setAllowedSipDays(dates.length > 0 ? dates : []);
          } else {
            setAllowedSipDays([]);
          }
        } else {
          setDivOpt("");
          setMinAmount("500");
          setAllowedSipDays([]);
        }
      } catch (error) {
        console.error("Error fetching SIP data:", error);
        setDivOpt("");
        setMinAmount("500");
        setAllowedSipDays([]);
      }
    }
  };

  const handleFrequencyChange = (selectedValue: string) => {
    setFreq(selectedValue);
    // Reset selected fund when frequency changes
    setSelectedFund(null);
    // Reset date when frequency changes
    setSipDate(null);
    setSipDay("");
    setSipMonth("");
    setSipYear("");
  };

  // Check if a date is available for the selected fund and frequency
  const isDateAvailableForSelectedFund = (date: Date): boolean => {
    if (!selectedFund) return true;

    const selectedDay = date.getDate();
    const availableDates = getAvailableDatesForFund(selectedFund, freq);

    // If no specific dates are specified, all dates are allowed
    if (availableDates.length === 0) return true;

    return availableDates.includes(selectedDay);
  };

  const isDateAvailable = (date: Date): boolean => {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the earliest allowed date (7 days from today)
    const earliestAllowedDate = new Date(today);
    earliestAllowedDate.setDate(today.getDate() + 7);
    earliestAllowedDate.setHours(0, 0, 0, 0);

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    // Block all dates before the earliest allowed date (including today and next 6 days)
    if (dateToCheck < earliestAllowedDate) {
      return false;
    }

    // If a fund is selected, check if date is available for that fund
    if (selectedFund) {
      return isDateAvailableForSelectedFund(date);
    }

    return true;
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the earliest allowed date (7 days from today)
    const earliestAllowedDate = new Date(today);
    earliestAllowedDate.setDate(today.getDate() + 7);
    earliestAllowedDate.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Check if selected date is before the earliest allowed date
    if (selectedDate < earliestAllowedDate) {
      toastAlert("info", `SIP start date must be after ${earliestAllowedDate.toLocaleDateString('en-GB')} / एसआईपी शुरू करने की तारीख ${earliestAllowedDate.toLocaleDateString('en-GB')} के बाद होनी चाहिए`);
      return;
    }

    // If fund is selected, check if date is available for this fund
    if (selectedFund) {
      const isAvailable = isDateAvailableForSelectedFund(date);
      if (!isAvailable) {
        const availableDates = getAvailableDatesForFund(selectedFund, freq);
        toastAlert("info", `This fund only allows SIP on dates: ${availableDates.join(', ')} / यह फंड केवल इन तारीखों पर एसआईपी की अनुमति देता है: ${availableDates.join(', ')}`);
        return;
      }
    }

    setSipDate(date);
    setSipDay(date.getDate().toString().padStart(2, '0'));
    setSipMonth((date.getMonth() + 1).toString().padStart(2, '0'));
    setSipYear(date.getFullYear().toString());
    setActiveStep(3);
  };

  const getPerformanceColor = (returnValue: number) => {
    if (returnValue >= 20) return "#10B981";
    if (returnValue >= 15) return theme.primary;
    if (returnValue >= 10) return "#F59E0B";
    if (returnValue >= 5) return "#F97316";
    return "#EF4444";
  };

  const addToCart = async () => {
    if (!selectedFund || !amount) {
      toastAlert("info", "Please select fund and amount / कृपया फंड और राशि चुनें");
      return;
    }

    // Check if amount meets minimum for selected frequency
    const minAmtForFreq = getMinAmountForFrequency(selectedFund, freq);
    if (amount < minAmtForFreq) {
      toastAlert("info", `Minimum amount for ${freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'} SIP is ₹${minAmtForFreq} / ${freq === 'D' ? 'डेली' : freq === 'W' ? 'वीकली' : 'मंथली'} एसआईपी के लिए न्यूनतम राशि ₹${minAmtForFreq} है`);
      return;
    }

    try {
      const userData: any = getLS(USER_DATA);

      const CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: selectedFund?.id,
        trans_type: 7,
        trans_amount: amount,
        frequency: freq,
        day: sipDay || "05",
        start_month: sipMonth || "01",
        start_year: sipYear || new Date().getFullYear().toString(),
        end_month: endMonth,
        end_year: endYear,
        rta_amc_code: rtaAmcCode,
        rta_sch_code: rtaSchCode,
        out_rta_sch_code: outRtaSchCode,
        tx_vol_type: "A",
        vol: amount.toString(),
      };

      const addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
      if (addCartData.data.data) {
        toastAlert("success", "SIP Added To Cart / एसआईपी कार्ट में जोड़ा गया");
        setCartCounter(cartCounter + 1);
        setIsCartAdded(true);
      } else {
        toastAlert("info", "Unable to add to cart, please try again later!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleUPITransaction = async () => {
    if (!selectedFund || !amount || !sipDate) {
      toastAlert("info", "Please complete all selections / कृपया सभी विकल्प चुनें");
      return;
    }

    // Check if amount meets minimum for selected frequency
    const minAmtForFreq = getMinAmountForFrequency(selectedFund, freq);
    if (amount < minAmtForFreq) {
      toastAlert("info", `Minimum amount for ${freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'} SIP is ₹${minAmtForFreq} / ${freq === 'D' ? 'डेली' : freq === 'W' ? 'वीकली' : 'मंथली'} एसआईपी के लिए न्यूनतम राशि ₹${minAmtForFreq} है`);
      return;
    }

    if (!selectedCan) {
      setExceptions({ value: true, message: "CAN is required. Please select a CAN from the dropdown." });
      return;
    }

    setProcessing(true);
    setExceptions({ value: false, message: "" });
    setTransactionError("");

    try {
      const clientIp = await fetchClientIp();
      const refNo = await generateReference("");

      const day = sipDay;
      const month = sipMonth;
      const year = sipYear;

      const txnType = arrTransactionType.find(t => t.value === "V");
      setTxnVolType(txnType?.txnVolTyp ?? "A");

      let payOutDtl = getPayOutSec("V", "", "", "", "");
      let mandateRefNo = "";
      let end_month = endMonth;
      let end_year = endYear;
      let subSeqPayFlag = "Y";
      let subSeqSec: any = null;

      const upiVpa = `MFSYES${selectedCan}@@yesbankltd`;
      setBeneVan(upiVpa);

      let schList: any[] = [];
      let sysSchList: any[] = [];

      const relatedMandates = mandateList.filter(
        mandate => mandate.acc_no === bankList[0]?.account_no
      );

      if (relatedMandates.length > 1) {
        if (amount > relatedMandates[0].max_amt) {
          setSelectedMandate(relatedMandates[1].prn)
          mandateRefNo = relatedMandates[1].prn
          end_month = relatedMandates[1].end_date.split("-")[1]
          end_year = (relatedMandates[1].end_date.split("-")[0] - 1).toString()
        } else {
          setSelectedMandate(relatedMandates[0].prn)
          mandateRefNo = relatedMandates[0].prn
          end_month = relatedMandates[0].end_date.split("-")[1]
          end_year = (relatedMandates[0].end_date.split("-")[0] - 1).toString()
        }
      } else if (relatedMandates.length === 1) {
        setSelectedMandate(relatedMandates[0].prn)
        mandateRefNo = relatedMandates[0].prn
        end_month = relatedMandates[0].end_date.split("-")[1]
        end_year = (relatedMandates[0].end_date.split("-")[0] - 1).toString()
      }

      let paySec = getPaySec(
        "V",
        "UP",
        bankList[0]?.micr,
        bankList[0]?.ifsc,
        bankList[0]?.account_type,
        bankList[0]?.account_no,
        amount.toString(),
        "",
        ""
      );

      payOutDtl = getPayOutSec("V", "", "", accType, "")

      const option = dividendOptions.find(opt => opt.description === divOpt);

      sysSchList = getSysSchList(generateUniqueId(), rtaAmcCode, rtaSchCode, outRtaSchCode, folioSelectionMode, selectedFolio, option, amount.toString(), freq, freq === "D" ? "NA" :
        day, sipMonth, sipYear, end_month, end_year, payOutDtl, txnType)
      subSeqPayFlag = "Y"

      if (relatedMandates.length > 0) {
        subSeqSec = getSubSeqSec("V", "DM", relatedMandates[0].micr, relatedMandates[0].ifsc, relatedMandates[0].acc_type, relatedMandates[0].acc_no, mandateRefNo)
      }

      const transaction: TransactionData = {
        txnType: "V",
        entGroupRefNo: refNo?.data?.data?.reference ?? "",
        can: selectedCan,
        totAmt: amount.toString(),
        schList: schList,
        paySecFlag: "Y",
        paySec: paySec,
        sysSchList: sysSchList ?? [],
        subSeqPayFlag: subSeqPayFlag,
        subSeqSec: subSeqSec ?? [],
        logDtl: {
          deviceType: "W",
          custIpAddress: clientIp
        }
      };

      const response = await executeMfuTransaction(transaction, 2, selectedFund?.schemeISIN);

      let result;
      if (typeof response?.data?.data === 'string') {
        result = JSON.parse(response.data.data);
      } else {
        result = response?.data?.data;
      }

      if (result?.secWisErrorList && result.secWisErrorList.length > 0) {
        const errors = result.secWisErrorList.map((err: any) => err.secErrorMsg).join(", ");
        setTransactionError(errors);
        toast.error(errors);
        setProcessing(false);
        return;
      }

      const appLink = result?.respBody?.ordDtl?.appLinkPri;
      if (appLink) {
        toast.success("SIP initiated successfully! Redirecting to UPI payment...");
        clearData();
        setSuccess(true);
        setTimeout(() => {
          window.location.href = appLink;
        }, 2000);
      } else {
        if (result?.respBody?.status === "SUCCESS" || result?.status === "SUCCESS") {
          setSuccess(true);
          setProcessing(false);
        } else {
          toast.error(JSON.stringify(result?.respBody || result));
          setTransactionError(JSON.stringify(result?.respBody || result));
          setProcessing(false);
        }
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      setExceptions({ value: true, message: error?.message || "Transaction failed" });
      setProcessing(false);
    }
  };

  const handleFolioSelection = (folio: any) => {
    setAccType(folio?.ac_type?.trim() || "");
    setAccNo(folio?.ac_no || "");
    setIfsc(folio?.ifsc || "");
    setMicr(folio?.micr || "");
    setSelectedFolio(folio);
    setShowFolioDropdown(false);
    setFolioSelectionMode('existing');
  };

  const handleFolio = async (folioType: string) => {
    if (folioType === "New") {
      setFolioSelectionMode('new');
      setShowFolioDropdown(false);
      setSelectedFolio(null);
      if (selectedCan) {
        const response = await searchByCanIdmfuBankDetails(selectedCan);
        const result = response?.data?.data?.data;
        setBankList(result || []);
      }
    } else {
      setFolioSelectionMode('existing');
    }
  };

  const reset = () => {
    setSuccess(false);
    setSelectedFund(null);
    setSelAmt(100);
    setCustomAmt("");
    setSipDate(null);
    setSipDay("");
    setSipMonth("");
    setSipYear("");
    setIsTransact(false);
    setIsCartAdded(false);
    setPaymentMode("UP");
    setAccNo("");
    setIfsc("");
    setTransactionError("");
    setExceptions({ value: false, message: "" });
    setActiveStep(1);
    setSelectedCategory("All");
  };

  // Handle category selection
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedFund(null);

    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: theme.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "16px"
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={{
            maxWidth: "500px",
            width: "100%",
            background: theme.cardBg,
            borderRadius: isMobile ? "24px" : "32px",
            padding: isMobile ? "24px 16px" : "32px 24px",
            boxShadow: "0 20px 40px rgba(245,158,11,0.2)",
            textAlign: "center",
            border: `1px solid ${theme.border}`
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{
              width: isMobile ? "60px" : "80px",
              height: isMobile ? "60px" : "80px",
              borderRadius: isMobile ? "30px" : "40px",
              background: theme.gradient,
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: isMobile ? "30px" : "40px",
              boxShadow: `0 10px 20px rgba(245,158,11,0.3)`
            }}
          >
            <CheckCircleIcon size={isMobile ? 36 : 48} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: isMobile ? "24px" : "28px",
              fontWeight: "700",
              color: theme.textPrimary,
              margin: "0 0 8px"
            }}
          >
            Success! / सफलता! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: isMobile ? "14px" : "16px",
              color: theme.textSecondary,
              margin: "0 0 24px"
            }}
          >
            Your SIP of ₹{amount} is registered<br />
            आपका ₹{amount} का एसआईपी रजिस्टर हो गया है
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: theme.accent,
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "24px",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: isMobile ? "13px" : "14px", marginBottom: "8px", color: theme.textSecondary }}>
              <span style={{ fontWeight: "600", color: theme.primary }}>Fund / फंड:</span> {selectedFund?.name}
            </div>
            <div style={{ fontSize: isMobile ? "13px" : "14px", marginBottom: "8px", color: theme.textSecondary }}>
              <span style={{ fontWeight: "600", color: theme.primary }}>Frequency / आवृत्ति:</span> {frequencies.find(f => f.value === freq)?.label}
            </div>
            <div style={{ fontSize: isMobile ? "13px" : "14px", color: theme.textSecondary }}>
              <span style={{ fontWeight: "600", color: theme.primary }}>CAN:</span> {selectedCan}
            </div>
          </motion.div>

          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "12px"
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              style={{
                flex: 1,
                background: theme.gradient,
                border: "none",
                color: "#fff",
                padding: isMobile ? "12px" : "14px",
                borderRadius: "14px",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: `0 8px 16px rgba(245,158,11,0.3)`,
                width: isMobile ? "100%" : "auto"
              }}
            >
              New SIP / नया एसआईपी
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/my-cart')}
              style={{
                flex: 1,
                background: "transparent",
                border: `2px solid ${theme.primary}`,
                color: theme.primary,
                padding: isMobile ? "12px" : "14px",
                borderRadius: "14px",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: "600",
                cursor: "pointer",
                width: isMobile ? "100%" : "auto"
              }}
            >
              View Cart / कार्ट देखें
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <FullPageLoader isVisible={processing} message="Processing UPI Payment..." />

      <div style={{
        minHeight: "100vh",
        background: theme.background,
        fontFamily: "'Inter', sans-serif",
        color: theme.textPrimary
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker__input-container input {
            width: 100%;
            padding: ${isMobile ? '14px' : '16px'};
            border: 2px solid ${theme.border};
            border-radius: 14px;
            font-size: ${isMobile ? '14px' : '15px'};
            font-family: inherit;
            background: ${theme.accent};
            color: ${theme.textPrimary};
            outline: none;
            transition: all 0.2s;
          }
          .react-datepicker__input-container input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3px rgba(245,158,11,0.2);
          }
          .react-datepicker {
            background-color: ${theme.cardBg} !important;
            border-color: ${theme.border} !important;
            font-size: ${isMobile ? '12px' : '14px'} !important;
          }
          .react-datepicker__header {
            background-color: ${theme.accent} !important;
            border-bottom-color: ${theme.border} !important;
          }
          .react-datepicker__current-month,
          .react-datepicker__day-name {
            color: ${theme.textPrimary} !important;
          }
          .react-datepicker__day {
            color: ${theme.textPrimary} !important;
          }
          .react-datepicker__day:hover {
            background-color: ${theme.primary} !important;
            color: #fff !important;
          }
          .react-datepicker__day--selected {
            background-color: ${theme.primary} !important;
            color: #fff !important;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: ${theme.primary}80 !important;
          }
          .react-datepicker__day--disabled {
            color: ${theme.textSecondary} !important;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          input[type="range"] {
            -webkit-appearance: none;
            background: transparent;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 8px;
            background: ${theme.primary};
            cursor: pointer;
            margin-top: -6px;
          }
          input[type="range"]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: ${theme.accent};
            border-radius: 2px;
          }
          .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 999;
            backdrop-filter: blur(4px);
          }
        `}</style>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mobile-menu-overlay"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "280px",
                  background: theme.cardBg,
                  zIndex: 1000,
                  padding: "20px",
                  borderRight: `1px solid ${theme.border}`,
                  overflowY: "auto"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px"
                }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: theme.textPrimary }}>Menu</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMobileMenu}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: theme.textSecondary,
                      cursor: "pointer"
                    }}
                  >
                    <XCircle size={24} />
                  </motion.button>
                </div>

                {/* Category Filter in Mobile Menu */}
                {categories.length > 0 && amount > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: theme.textSecondary, marginBottom: "12px" }}>
                      Filter by Category
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {categories.map((category) => {
                        const count = categoryCounts[category.name] || 0;
                        return (
                          <motion.button
                            key={category.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryChange(category.name)}
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "none",
                              background: selectedCategory === category.name ? theme.primary : theme.accent,
                              color: selectedCategory === category.name ? "#fff" : theme.textSecondary,
                              fontSize: "14px",
                              fontWeight: "500",
                              cursor: category.name === "All" || count > 0 ? "pointer" : "not-allowed",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              opacity: category.name !== "All" && count === 0 ? 0.5 : 1
                            }}
                            disabled={category.name !== "All" && count === 0}
                          >
                            <span>{category.name}</span>
                            {category.name !== "All" && (
                              <span style={{
                                background: selectedCategory === category.name ? "rgba(255,255,255,0.2)" : `${theme.primary}20`,
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px"
                              }}>
                                {count}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: theme.textSecondary, marginBottom: "12px" }}>
                    Quick Links
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() => router.push('/my-cart')}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: theme.accent,
                        color: theme.textPrimary,
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      🛒 My Cart
                    </button>
                    <button
                      onClick={() => router.push('/portfolio')}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: theme.accent,
                        color: theme.textPrimary,
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      📊 Portfolio
                    </button>
                    <button
                      onClick={() => router.push('/transactions')}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: theme.accent,
                        color: theme.textPrimary,
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      💳 Transactions
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Top Bar for Mobile */}
        {isMobile && (
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              style={{
                background: "transparent",
                border: "none",
                color: theme.textPrimary,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer"
              }}
            >
              <ArrowLeft size={20} color={theme.primary} />
            </motion.button>

            <h2 style={{ fontSize: "16px", fontWeight: "600", color: theme.textPrimary }}>
              Start SIP
            </h2>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              style={{
                background: "transparent",
                border: "none",
                color: theme.textPrimary,
                cursor: "pointer"
              }}
            >
              <Menu size={20} />
            </motion.button>
          </div>
        )}

        {/* Desktop Back Button */}
        {!isMobile && (
          <div style={{
            maxWidth: "1400px",
            margin: "0 auto 16px",
            padding: "0 24px"
          }}>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "transparent",
                border: `2px solid ${theme.border}`,
                borderRadius: "40px",
                color: theme.textPrimary,
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.cardBg;
                e.currentTarget.style.borderColor = theme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <ArrowLeft size={18} color={theme.primary} />
              <span>Back / वापस</span>
            </motion.button>
          </div>
        )}

        {/* Main Content - Responsive Layout */}
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "24px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "16px" : "24px"
        }}>

          {/* Left Sidebar - Hidden on mobile, visible on desktop */}
          {!isMobile && showLeftSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{
                width: isTablet ? "220px" : "280px",
                flexShrink: 0
              }}
            >
              {/* Left sidebar content can go here */}
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              minWidth: 0
            }}
          >
            {/* Investor Card - Responsive */}
            {(investorList.length > 0 || canIdList.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: theme.cardBg,
                  borderRadius: isMobile ? "16px" : "20px",
                  padding: isMobile ? "12px" : "16px",
                  marginBottom: isMobile ? "16px" : "20px",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "8px" : "12px"
                }}>
                  <div style={{
                    width: isMobile ? "40px" : "48px",
                    height: isMobile ? "40px" : "48px",
                    borderRadius: isMobile ? "12px" : "16px",
                    background: theme.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: isMobile ? "16px" : "20px",
                    fontWeight: "600"
                  }}>
                    {selectedHolder?.charAt(0) || "U"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: "600",
                      fontSize: isMobile ? "14px" : "15px",
                      marginBottom: "4px",
                      color: theme.textPrimary
                    }}>
                      {selectedHolder || "Welcome / स्वागत है"}
                    </div>
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: theme.textSecondary,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}>
                      <span>CAN:</span>
                      <select
                        value={selectedCan}
                        onChange={(e) => setSelectedCan(e.target.value)}
                        style={{
                          background: `${theme.primary}20`,
                          border: `1px solid ${theme.primary}`,
                          borderRadius: "8px",
                          padding: isMobile ? "2px 6px" : "4px 8px",
                          color: theme.primary,
                          fontSize: isMobile ? "11px" : "13px",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        {canIdList.map((can, idx) => (
                          <option key={idx} value={can}>{can}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{
                    background: `${theme.success}20`,
                    padding: isMobile ? "4px 8px" : "6px 12px",
                    borderRadius: "20px",
                    fontSize: isMobile ? "10px" : "11px",
                    fontWeight: "500",
                    color: theme.success,
                    whiteSpace: "nowrap"
                  }}>
                    KYC ✓
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hero Banner - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: theme.gradient,
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "20px 16px" : "24px 20px",
                marginBottom: isMobile ? "16px" : "24px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: isMobile ? "120px" : "150px",
                  height: isMobile ? "120px" : "150px",
                  borderRadius: "75px",
                  background: "rgba(0,0,0,0.2)"
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Sparkles size={isMobile ? 16 : 20} color="#fff" />
                  <span style={{
                    background: "rgba(0,0,0,0.3)",
                    color: "#fff",
                    padding: isMobile ? "2px 8px" : "4px 12px",
                    borderRadius: "20px",
                    fontSize: isMobile ? "11px" : "12px",
                    fontWeight: "500"
                  }}>
                    SIP
                  </span>
                </div>

                <h1 style={{
                  fontSize: isMobile ? "28px" : "32px",
                  color: "#fff",
                  margin: "0 0 8px",
                  fontWeight: "700",
                  lineHeight: 1.2
                }}>
                  Start SIP<br />
                </h1>

                <p style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: "rgba(255,255,255,0.9)",
                  margin: "0 0 16px"
                }}>
                  शुरू करें SIP
                </p>

                <div style={{
                  display: "flex",
                  gap: isMobile ? "4px" : "8px",
                  flexWrap: "wrap"
                }}>
                  {["💰 Min ₹100", "📈 Top Rated", "🔒 Secure", "⚡ Instant"].map((item) => (
                    <span key={item} style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: "20px",
                      fontSize: isMobile ? "11px" : "12px",
                      color: "#fff"
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Progress Steps - Responsive */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: isMobile ? "16px" : "24px",
              padding: "0 4px"
            }}>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <motion.div
                    animate={{
                      scale: activeStep >= step ? 1 : 0.9,
                      backgroundColor: activeStep >= step ? theme.primary : theme.border
                    }}
                    style={{
                      width: isMobile ? "28px" : "32px",
                      height: isMobile ? "28px" : "32px",
                      borderRadius: isMobile ? "14px" : "16px",
                      background: activeStep >= step ? theme.primary : theme.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: isMobile ? "12px" : "13px",
                      fontWeight: "600"
                    }}
                  >
                    {step}
                  </motion.div>
                  {step < 4 && (
                    <div style={{
                      flex: 1,
                      height: "2px",
                      background: activeStep > step ? theme.primary : theme.border,
                      margin: "0 4px"
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1 - Amount - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: theme.cardBg,
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "16px" : "20px",
                marginBottom: isMobile ? "12px" : "16px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                marginBottom: isMobile ? "12px" : "16px"
              }}>
                <div style={{
                  width: isMobile ? "28px" : "32px",
                  height: isMobile ? "28px" : "32px",
                  borderRadius: isMobile ? "8px" : "10px",
                  background: `${theme.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.primary
                }}>
                  <Wallet size={isMobile ? 16 : 18} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? "15px" : "16px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                    color: theme.textPrimary
                  }}>
                    SIP Amount / कितना निवेश
                  </h3>
                </div>
              </div>

              {/* Amount Buttons Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: isMobile ? "10px" : "12px",
                marginBottom: "16px"
              }}>
                {[100, 200, 500, 1000].map((a) => {
                  const isSelected = (selAmt === a && !customAmt) || (parseInt(customAmt) === a && customAmt !== "");
                  return (
                    <motion.button
                      key={a}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelAmt(a);
                        setCustomAmt(a.toString());
                        setActiveStep(2);
                      }}
                      style={{
                        padding: isMobile ? "14px 8px" : "16px 12px",
                        borderRadius: "16px",
                        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
                        background: isSelected ? theme.gradient : theme.accent,
                        color: isSelected ? "#fff" : theme.textSecondary,
                        fontWeight: "700",
                        fontSize: isMobile ? "18px" : "20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: isSelected ? `0 8px 20px ${theme.primary}40` : "none",
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                            pointerEvents: "none"
                          }}
                        />
                      )}

                      <span style={{ position: "relative", zIndex: 1 }}>
                        ₹{a}
                      </span>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: "absolute",
                            bottom: "6px",
                            right: "8px",
                            fontSize: "12px",
                            opacity: 0.8
                          }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{
                  position: "absolute",
                  left: isMobile ? "12px" : "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "600",
                  color: customAmt ? theme.primary : theme.textSecondary
                }}>₹</span>
                <input
                  type="number"
                  placeholder="Amount / मनचाही राशि"
                  value={customAmt}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomAmt(value);
                    if (value === "") {
                      setSelAmt(0);
                    } else {
                      const numValue = parseInt(value);
                      if ([100, 200, 500, 1000].includes(numValue)) {
                        setSelAmt(numValue);
                      } else {
                        setSelAmt(0);
                      }
                    }
                    setActiveStep(2);
                  }}
                  style={{
                    width: "100%",
                    padding: isMobile ? "14px 14px 14px 40px" : "16px 16px 16px 44px",
                    background: customAmt ? `${theme.primary}10` : theme.accent,
                    border: `2px solid ${customAmt ? theme.primary : theme.border}`,
                    borderRadius: "16px",
                    fontSize: isMobile ? "14px" : "15px",
                    outline: "none",
                    color: theme.textPrimary,
                    transition: "all 0.2s ease",
                    fontWeight: customAmt ? "600" : "400"
                  }}
                />
                {customAmt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "12px",
                      color: theme.success
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </div>

              {customAmt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "10px 12px",
                    background: `${theme.primary}15`,
                    borderRadius: "12px",
                    fontSize: isMobile ? "12px" : "13px",
                    color: theme.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircleIcon size={14} color={theme.primary} />
                    <span>Selected Amount / चुनी हुई राशि:</span>
                  </div>
                  <div style={{ fontWeight: "700", fontSize: isMobile ? "14px" : "16px" }}>
                    ₹{customAmt}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Step 2 - SIP Schedule - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: theme.cardBg,
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "16px" : "20px",
                marginBottom: isMobile ? "12px" : "16px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                marginBottom: isMobile ? "12px" : "16px"
              }}>
                <div style={{
                  width: isMobile ? "28px" : "32px",
                  height: isMobile ? "28px" : "32px",
                  borderRadius: isMobile ? "8px" : "10px",
                  background: `${theme.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.primary
                }}>
                  <Calendar size={isMobile ? 16 : 18} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? "15px" : "16px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                    color: theme.textPrimary
                  }}>
                    How Often / कब तक
                  </h3>
                </div>
              </div>

              {/* Frequency Buttons */}
              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "10px" : "12px",
                marginBottom: "24px"
              }}>
                {frequencies.map((f) => {
                  const isSelected = freq === f.value;
                  return (
                    <motion.button
                      key={f.value}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleFrequencyChange(f.value)}
                      style={{
                        flex: 1,
                        padding: isMobile ? "14px 12px" : "16px 20px",
                        borderRadius: "20px",
                        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
                        background: isSelected ? theme.gradient : theme.accent,
                        color: isSelected ? "#fff" : theme.textSecondary,
                        fontWeight: "600",
                        fontSize: isMobile ? "15px" : "16px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: isMobile ? "12px" : "8px",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: isSelected ? `0 6px 16px ${theme.primary}40` : "none",
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                            pointerEvents: "none"
                          }}
                        />
                      )}

                      <span style={{
                        fontSize: isMobile ? "24px" : "28px",
                        position: "relative",
                        zIndex: 1
                      }}>
                        {f.value === "D" ? "☀️" : f.value === "W" ? "📆" : "📅"}
                      </span>

                      <div style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1
                      }}>
                        <div style={{
                          fontWeight: "700",
                          fontSize: isMobile ? "16px" : "18px",
                          marginBottom: "4px"
                        }}>
                          {f.label}
                        </div>
                        {!isMobile && (
                          <div style={{
                            fontSize: "11px",
                            opacity: 0.8,
                            color: isSelected ? "rgba(255,255,255,0.9)" : theme.textSecondary
                          }}>
                            {f.value === "D" ? "Every day / हर दिन" :
                              f.value === "W" ? "Every week / हर हफ्ते" :
                                "Every month / हर महीने"}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: "absolute",
                            top: isMobile ? "8px" : "12px",
                            right: isMobile ? "8px" : "12px",
                            fontSize: isMobile ? "14px" : "16px",
                            opacity: 0.9
                          }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Date Picker Section */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: "600",
                  color: theme.textSecondary,
                  marginBottom: "8px",
                  display: "block"
                }}>
                  Start Date / शुरू करने की तारीख
                </label>
                <div style={{
                  border: `2px solid ${sipDate ? theme.primary : theme.border}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  background: sipDate ? `${theme.primary}10` : theme.accent
                }}>
                  <DatePicker
                    selected={sipDate}
                    onChange={handleDateChange}
                    filterDate={isDateAvailable}
                    placeholderText="Select date / तारीख चुनें"
                    dateFormat="dd/MM/yyyy"
                    minDate={(() => {
                      const today = new Date();
                      const minDate = new Date(today);
                      minDate.setDate(today.getDate() + 8);
                      return minDate;
                    })()}
                  />
                </div>
                {sipDate && selectedFund && getAvailableDatesForFund(selectedFund, freq).length > 0 && (
                  <div style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: theme.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap"
                  }}>
                    <Info size={12} />
                    <span>Available dates for this fund: {getAvailableDatesForFund(selectedFund, freq).join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Step 3 - Fund Selection - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: theme.cardBg,
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "16px" : "20px",
                marginBottom: isMobile ? "12px" : "16px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                marginBottom: isMobile ? "12px" : "16px"
              }}>
                <div style={{
                  width: isMobile ? "28px" : "32px",
                  height: isMobile ? "28px" : "32px",
                  borderRadius: isMobile ? "8px" : "10px",
                  background: `${theme.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.primary
                }}>
                  <Target size={isMobile ? 16 : 18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: isMobile ? "15px" : "16px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                    color: theme.textPrimary
                  }}>
                    Select Fund / फंड चुनें
                  </h3>
                  <p style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: theme.textSecondary,
                    margin: "0"
                  }}>
                    {amount > 0 ? `${filteredFunds.length} funds available for ${freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'} SIP / ${filteredFunds.length} फंड उपलब्ध` : "Select amount first / पहले राशि चुनें"}
                  </p>
                </div>
                {amount > 0 && (
                  <div style={{
                    background: theme.primary,
                    color: "#fff",
                    padding: isMobile ? "2px 8px" : "4px 12px",
                    borderRadius: "20px",
                    fontSize: isMobile ? "11px" : "12px",
                    fontWeight: "600"
                  }}>
                    {filteredFunds.length}
                  </div>
                )}
              </div>

              {/* View More Button - Responsive */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/mutual-fund')}
                style={{
                  width: "100%",
                  background: theme.accent,
                  border: "none",
                  borderRadius: "12px",
                  padding: isMobile ? "10px" : "12px",
                  color: theme.primary,
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  cursor: "pointer"
                }}
              >
                <Rocket size={isMobile ? 14 : 16} />
                View More Funds / और फंड देखें
                <ArrowRight size={isMobile ? 14 : 16} />
              </motion.button>

              {/* Category Filter Buttons - Desktop */}
              {!isMobile && categories.length > 0 && amount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                  className="scrollbar-hide"
                >
                  {categories.map((category) => {
                    const count = categoryCounts[category.name] || 0;
                    return (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryChange(category.name)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          border: "none",
                          background: selectedCategory === category.name ? theme.primary : theme.accent,
                          color: selectedCategory === category.name ? "#fff" : theme.textSecondary,
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: category.name === "All" || count > 0 ? "pointer" : "not-allowed",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s",
                          opacity: category.name !== "All" && count === 0 ? 0.5 : 1
                        }}
                        disabled={category.name !== "All" && count === 0}
                      >
                        {category.name}
                        {category.name !== "All" && (
                          <span style={{
                            marginLeft: "6px",
                            fontSize: "11px",
                            background: selectedCategory === category.name ? "rgba(255,255,255,0.2)" : `${theme.primary}20`,
                            padding: "2px 6px",
                            borderRadius: "12px",
                            color: selectedCategory === category.name ? "#fff" : theme.primary
                          }}>
                            {count}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {amount === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: isMobile ? "24px 12px" : "32px 16px",
                  background: theme.accent,
                  borderRadius: "16px"
                }}>
                  <div style={{ fontSize: isMobile ? "32px" : "40px", marginBottom: "12px" }}>💰</div>
                  <div style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: theme.textSecondary
                  }}>
                    Select amount first<br />पहले राशि चुनें
                  </div>
                </div>
              ) : loadingFunds ? (
                <div style={{ textAlign: "center", padding: isMobile ? "24px" : "32px" }}>
                  <Loader size={isMobile ? "w-6 h-6" : "w-8 h-8"} color={`text-[${theme.primary}]`} borderColor={""} />
                </div>
              ) : filteredFunds.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: isMobile ? "24px 12px" : "32px 16px",
                  background: theme.accent,
                  borderRadius: "16px"
                }}>
                  <Info size={isMobile ? 24 : 32} color={theme.textSecondary} style={{ marginBottom: "12px" }} />
                  <div style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: theme.textSecondary
                  }}>
                    {selectedCategory !== "All"
                      ? `No ${selectedCategory} funds available for ${freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'} SIP with ₹${amount}`
                      : `No funds available for ${freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'} SIP with ₹${amount}`}
                    <br />
                    {selectedCategory !== "All"
                      ? `₹${amount} के लिए ${freq === 'D' ? 'डेली' : freq === 'W' ? 'वीकली' : 'मंथली'} एसआईपी के लिए कोई ${selectedCategory} फंड उपलब्ध नहीं है`
                      : `₹${amount} के लिए ${freq === 'D' ? 'डेली' : freq === 'W' ? 'वीकली' : 'मंथली'} एसआईपी के लिए कोई फंड उपलब्ध नहीं है`}
                    <div style={{ marginTop: "12px", fontSize: "11px", color: theme.textSecondary }}>
                      Try increasing your SIP amount or change frequency to see more funds
                      <br />
                      अधिक फंड देखने के लिए SIP राशि बढ़ाएं या आवृत्ति बदलें
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  maxHeight: isMobile ? "350px" : "400px",
                  overflowY: "auto",
                  paddingRight: "4px"
                }}>
                  {filteredFunds.map((fund, index) => {
                    const isSelected = selectedFund?.id === fund.id;
                    const minAmtForFreq = getMinAmountForFrequency(fund, freq);
                    const availableDates = getAvailableDatesForFund(fund, freq);

                    return (
                      <motion.div
                        key={fund.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={!isMobile ? "hover" : {}}
                        onClick={() => handleFundSelect(fund)}
                        style={{
                          padding: isMobile ? "12px" : "16px",
                          borderRadius: "16px",
                          marginBottom: "12px",
                          background: isSelected ? `${theme.primary}20` : theme.cardBg,
                          border: `2px solid ${isSelected ? theme.primary : theme.border}`,
                          cursor: "pointer",
                          position: "relative"
                        }}
                      >
                        {fund.badge && (
                          <div style={{
                            position: "absolute",
                            top: isMobile ? "8px" : "12px",
                            right: isMobile ? "8px" : "12px",
                            background: fund.badgeColor,
                            color: "#fff",
                            fontSize: isMobile ? "9px" : "10px",
                            fontWeight: "600",
                            padding: isMobile ? "2px 6px" : "4px 8px",
                            borderRadius: "4px"
                          }}>
                            {fund.badge}
                          </div>
                        )}

                        <div style={{
                          display: "flex",
                          gap: isMobile ? "8px" : "12px",
                          marginBottom: "12px"
                        }}>
                          <div style={{
                            width: isMobile ? "40px" : "48px",
                            height: isMobile ? "40px" : "48px",
                            borderRadius: isMobile ? "10px" : "12px",
                            background: theme.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isMobile ? "18px" : "20px"
                          }}>
                            {fund.icon}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: "600",
                              fontSize: isMobile ? "13px" : "14px",
                              marginBottom: "2px",
                              color: theme.textPrimary
                            }}>
                              {fund.name.substring(0, isMobile ? 20 : 25)}...
                            </div>
                            <div style={{
                              fontSize: isMobile ? "11px" : "12px",
                              color: theme.textSecondary
                            }}>
                              {fund.category}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: isMobile ? "6px" : "8px",
                          marginBottom: "12px"
                        }}>
                          <div style={{
                            background: theme.accent,
                            padding: isMobile ? "8px" : "10px",
                            borderRadius: "12px"
                          }}>
                            <div style={{
                              fontSize: isMobile ? "10px" : "11px",
                              color: theme.textSecondary,
                              marginBottom: "2px"
                            }}>
                              1Y Return / 1 साल रिटर्न
                            </div>
                            <div style={{
                              fontSize: isMobile ? "14px" : "16px",
                              fontWeight: "700",
                              color: getPerformanceColor(fund.returns1Y)
                            }}>
                              {fund.returns1Y.toFixed(1)}%
                            </div>
                          </div>

                          <div style={{
                            background: theme.accent,
                            padding: isMobile ? "8px" : "10px",
                            borderRadius: "12px"
                          }}>
                            <div style={{
                              fontSize: isMobile ? "10px" : "11px",
                              color: theme.textSecondary,
                              marginBottom: "2px"
                            }}>
                              Risk / जोखिम
                            </div>
                            <span style={{
                              fontSize: isMobile ? "11px" : "12px",
                              fontWeight: "600",
                              padding: isMobile ? "2px 6px" : "4px 8px",
                              borderRadius: "8px",
                              background: fund.risk === "Low" ? "#10B98120" : (fund.risk === "Moderate" ? `${theme.primary}20` : "#EF444420"),
                              color: fund.risk === "Low" ? "#10B981" : (fund.risk === "Moderate" ? theme.primary : "#EF4444")
                            }}>
                              {fund.risk}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <div style={{
                              fontSize: isMobile ? "10px" : "11px",
                              color: theme.textSecondary
                            }}>
                              Min / न्यूनतम ({freq === 'D' ? 'Daily' : freq === 'W' ? 'Weekly' : 'Monthly'})
                            </div>
                            <div style={{
                              fontSize: isMobile ? "14px" : "15px",
                              fontWeight: "700",
                              color: theme.primary
                            }}>
                              ₹{minAmtForFreq}
                            </div>
                          </div>
                          {availableDates.length > 0 && (
                            <div style={{
                              fontSize: isMobile ? "10px" : "11px",
                              color: theme.textSecondary,
                              textAlign: "right"
                            }}>
                              <div>Available dates</div>
                              <div style={{ fontWeight: "500", color: theme.primary }}>
                                {availableDates.slice(0, 3).join(', ')}{availableDates.length > 3 && '...'}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Step 4 - Payment - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: theme.cardBg,
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "16px" : "20px",
                marginBottom: isMobile ? "12px" : "16px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                marginBottom: isMobile ? "12px" : "16px"
              }}>
                <div style={{
                  width: isMobile ? "28px" : "32px",
                  height: isMobile ? "28px" : "32px",
                  borderRadius: isMobile ? "8px" : "10px",
                  background: `${theme.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.primary
                }}>
                  <CreditCard size={isMobile ? 16 : 18} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? "15px" : "16px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                    color: theme.textPrimary
                  }}>
                    Payment / भुगतान
                  </h3>
                  <p style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: theme.textSecondary,
                    margin: "0"
                  }}>
                    Complete with UPI / UPI से पूरा करें
                  </p>
                </div>
              </div>

              {selectedFund && amount > 0 && sipDate ? (
                <>
                  {/* UPI Info */}
                  <div style={{
                    background: `${theme.primary}20`,
                    borderRadius: "12px",
                    padding: isMobile ? "12px" : "16px",
                    marginBottom: "16px",
                    border: `1px solid ${theme.primary}40`
                  }}>
                    <div style={{
                      display: "flex",
                      gap: isMobile ? "8px" : "12px",
                      alignItems: "flex-start"
                    }}>
                      <Smartphone size={isMobile ? 18 : 20} color={theme.primary} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: isMobile ? "13px" : "14px",
                          fontWeight: "600",
                          color: theme.primary,
                          marginBottom: "4px"
                        }}>
                          UPI Payment / UPI भुगतान
                        </div>
                        <div style={{
                          fontSize: isMobile ? "12px" : "13px",
                          color: theme.textSecondary,
                          wordBreak: "break-all",
                          background: theme.cardBg,
                          padding: isMobile ? "8px" : "10px",
                          borderRadius: "8px"
                        }}>
                          VPA: MFSYES{selectedCan}@@yesbankltd
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div style={{
                    background: theme.accent,
                    borderRadius: "16px",
                    padding: isMobile ? "12px" : "16px",
                    marginBottom: "20px"
                  }}>
                    <div style={{
                      fontSize: isMobile ? "11px" : "12px",
                      fontWeight: "600",
                      color: theme.primary,
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <BarChart3 size={isMobile ? 12 : 14} />
                      ORDER SUMMARY / ऑर्डर सारांश
                    </div>

                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <span style={{ color: theme.textSecondary }}>Fund / फंड:</span>
                      <span style={{
                        fontWeight: "500",
                        color: theme.textPrimary
                      }}>
                        {selectedFund.name.substring(0, isMobile ? 15 : 20)}...
                      </span>
                    </div>

                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <span style={{ color: theme.textSecondary }}>Amount / राशि:</span>
                      <span style={{
                        fontWeight: "700",
                        color: theme.primary
                      }}>
                        ₹{amount}
                      </span>
                    </div>

                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <span style={{ color: theme.textSecondary }}>Frequency / आवृत्ति:</span>
                      <span style={{
                        fontWeight: "500",
                        color: theme.textPrimary
                      }}>
                        {frequencies.find(f => f.value === freq)?.label}
                      </span>
                    </div>

                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <span style={{ color: theme.textSecondary }}>Start Date / शुरू करने की तारीख:</span>
                      <span style={{
                        fontWeight: "500",
                        color: theme.textPrimary
                      }}>
                        {sipDate?.toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <span style={{ color: theme.textSecondary }}>CAN:</span>
                      <span style={{
                        color: selectedCan ? theme.success : theme.danger,
                        fontWeight: "500"
                      }}>
                        {selectedCan || "Not selected"}
                      </span>
                    </div>
                  </div>

                  {/* Error Display */}
                  {(commonError || exeptions.value || transactionError) && (
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: theme.danger,
                      textAlign: "center",
                      padding: isMobile ? "10px" : "12px",
                      background: `${theme.danger}20`,
                      borderRadius: "12px",
                      marginBottom: "16px"
                    }}>
                      {commonError || exeptions.message || transactionError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "column",
                    gap: "12px"
                  }}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUPITransaction}
                      disabled={processing}
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px" : "16px",
                        background: theme.gradient,
                        border: "none",
                        borderRadius: "14px",
                        color: "#fff",
                        fontSize: isMobile ? "15px" : "16px",
                        fontWeight: "600",
                        cursor: processing ? "not-allowed" : "pointer",
                        opacity: processing ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {processing ? (
                        <>
                          <Loader size={isMobile ? "w-4 h-4" : "w-5 h-5"} color="text-white" borderColor={""} />
                          Processing... / प्रोसेस हो रहा है...
                        </>
                      ) : (
                        <>
                          <Lock size={isMobile ? 16 : 18} />
                          Pay with UPI / UPI से भुगतान करें
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={addToCart}
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px" : "16px",
                        background: "transparent",
                        border: `2px solid ${theme.primary}`,
                        borderRadius: "14px",
                        color: theme.primary,
                        fontSize: isMobile ? "15px" : "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Plus size={isMobile ? 16 : 18} />
                      Add to Cart / कार्ट में जोड़ें
                    </motion.button>

                    {isCartAdded && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontSize: isMobile ? "12px" : "13px",
                          color: theme.success,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "center",
                          background: `${theme.success}20`,
                          padding: isMobile ? "10px" : "12px",
                          borderRadius: "12px"
                        }}
                      >
                        <CheckCircleIcon size={isMobile ? 14 : 16} />
                        Added to cart! / कार्ट में जोड़ा गया!
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: isMobile ? "24px 12px" : "32px 16px",
                  background: theme.accent,
                  borderRadius: "16px"
                }}>
                  <Info size={isMobile ? 32 : 40} color={theme.textSecondary} style={{ marginBottom: "12px" }} />
                  <div style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: theme.textSecondary
                  }}>
                    Complete previous steps first<br />पहले पिछले चरण पूरे करें
                  </div>
                </div>
              )}
            </motion.div>

            {/* Security Badges - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "12px" : "16px",
                marginTop: isMobile ? "16px" : "24px",
                padding: isMobile ? "12px" : "16px",
                background: theme.cardBg,
                borderRadius: "40px",
                border: `1px solid ${theme.border}`
              }}
            >
              {[
                { icon: "🛡️", text: "SSL Secure" },
                { icon: "✅", text: "SEBI Regulated" },
                { icon: "🏦", text: "MFU" },
                { icon: "⚡", text: "UPI" }
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>{item.icon}</span>
                  <span style={{
                    fontSize: isMobile ? "10px" : "11px",
                    color: theme.textSecondary
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Sidebar - Hidden on mobile, visible on desktop/tablet */}
          {!isMobile && showRightSidebar && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                width: isTablet ? "220px" : "280px",
                flexShrink: 0
              }}
            >
              {/* Right sidebar content can go here */}
            </motion.div>
          )}
        </div>

        {/* Mobile Action Button */}
        {isMobile && (
          <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            display: "flex",
            gap: "8px",
            zIndex: 100
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "28px",
                background: theme.gradient,
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)"
              }}
            >
              <Menu size={24} />
            </motion.button>
          </div>
        )}

        {/* Desktop Sidebar Toggle */}
        {!isMobile && (
          <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            display: "flex",
            gap: "8px",
            zIndex: 100
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "24px",
                background: theme.primary,
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)"
              }}
            >
              <Menu size={20} />
            </motion.button>
          </div>
        )}
      </div>
    </>
  );
}