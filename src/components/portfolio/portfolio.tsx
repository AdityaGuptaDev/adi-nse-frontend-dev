"use client";

import type { NextPage } from "next";
import { Fragment, useContext, useEffect, useRef, useState, useCallback } from "react";
import { FaChevronUp, FaStar, FaSearch } from "react-icons/fa";
import { getAMCList } from "@/api/fund-picker";
import { useRouter } from "next/navigation";
import { FiFilter, FiPlus, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import "react-range-slider-input/dist/style.css";
import Pagination from "../commonGrid/components/pagination";
import FundPickerFilter from "../fund-explore/fundPickerFilter";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import { LuArrowUpDown } from "react-icons/lu";
import BuyModal from "./modals/buyModal";
import SipModal from "./modals/sipModal";
import RedeemModal from "./modals/redeemModal";
import SwitchModal from "./modals/switchModal";
import StpModal from "./modals/stpModal";
import SwpModal from "./modals/swpModal";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomLabel from "@/commonUI/Label";
import { NODE_API_URL, publicPathName, USER_DATA } from "@/utils/constants";
import { GrTransaction } from "react-icons/gr";
import { IoWalletOutline, IoAnalyticsOutline } from "react-icons/io5";
import CustomReactSelect from "@/commonUI/ReactSelect";
import api from "@/utils/api";
import getConfig from '@/utils/config';
import { getLS, getProdUser } from "@/utils/helpers";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { IoMdArrowRoundBack } from "react-icons/io";
import { searchByISIN } from "@/api/transaction";
import { getInvestor } from "@/api/holder";
import { useFundStore } from "@/store/useFundStore";
import { MdOutlineCalendarToday } from "react-icons/md";
import { ChevronLeft, TrendingUp, TrendingDown, Wallet, BarChart3, Calendar, Star, Search, Filter, X } from 'lucide-react';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

// Storage keys
const STORAGE_KEYS = {
  PORTFOLIO_DATA: 'portfolio_data',
  PORTFOLIO_SEARCH_PARAMS: 'portfolio_search_params',
  PORTFOLIO_STATE: 'portfolio_state'
};

const Portfolio: NextPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openTransactDropdown, setOpenTransactDropdown] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<any>({
    key: null,
    sort: "DESC",
  });

  // Add refs for each modal
  const buyModalRef = useRef<HTMLDialogElement>(null);
  const sipModalRef = useRef<HTMLDialogElement>(null);
  const redeemModalRef = useRef<HTMLDialogElement>(null);
  const switchModalRef = useRef<HTMLDialogElement>(null);
  const stpModalRef = useRef<HTMLDialogElement>(null);
  const swpModalRef = useRef<HTMLDialogElement>(null);

  const user = getLS(USER_DATA);
  let pan = user?.InvestorRegistration?.pan_no;
  let name = user?.InvestorRegistration?.name;

  // State for persistence
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchPan, setLastSearchPan] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // open modal by type
  const openModalByType = (type: string) => {
    switch (type) {
      case "Buy":
        buyModalRef.current?.showModal();
        break;
      case "SIP":
        sipModalRef.current?.showModal();
        break;
      case "Redeem":
        redeemModalRef.current?.showModal();
        break;
      case "Switch":
        switchModalRef.current?.showModal();
        break;
      case "STP":
        stpModalRef.current?.showModal();
        break;
      case "SWP":
        swpModalRef.current?.showModal();
        break;
      default:
        break;
    }
  };

  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(50);
  let [totalCount, setTotalCount] = useState(0);
  let [schemeData, setSchemeDatas] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  let [search, setSearch] = useState("");
  let [payload, setPayload] = useState<any>();
  const [groupBy, setgroupBy] = useState<string>("None");
  const [hideZeroInvestedValue, setHideZeroInvestedValue] = useState<boolean>(false);
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string | null>(null);
  const [AMCData, setAMCData] = useState<any>([]);
  const [selectAmc, setSelectAmc] = useState<any>([]);
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedInvestorId, setSelectedInvestorId] = useState<any>(null);
  const [selectedInvestorPan, setSelectedInvestorPan] = useState<any>(null);
  const [selectedAccountHolding, setSelectedAccountHolding] = useState("");
  const [selectedAccountHoldingId, setSelectedAccountHoldingId] = useState<any>(null);
  const [selectedAccountHoldingPan, setSelectedAccountHoldingPan] = useState<any>(null);

  // State for investor and account holder options
  const [investorOptions, setInvestorOptions] = useState<any[]>([]);
  const [accountHoldingOptions, setAccountHoldingOptions] = useState<any[]>([]);
  const [allAccountHolders, setAllAccountHolders] = useState<any[]>([]);
  const [hasAccountHolders, setHasAccountHolders] = useState<boolean>(false);
  const [investorList, setInvestorList] = useState<any[]>([]);
  const [sipData, setSipData] = useState<any[]>([]);
  const { setSchemeData, setInvestors } = useFundStore();

  // Save state to sessionStorage
  const saveStateToStorage = useCallback(() => {
    try {
      const stateToSave = {
        schemeData,
        totalCount,
        selectedInvestor,
        selectedInvestorId,
        selectedInvestorPan,
        selectedAccountHolding,
        selectedAccountHoldingId,
        selectedAccountHoldingPan,
        hasAccountHolders,
        hasSearched,
        lastSearchPan,
        groupBy,
        hideZeroInvestedValue,
        page,
        limit
      };
      sessionStorage.setItem(STORAGE_KEYS.PORTFOLIO_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving state to storage:", error);
    }
  }, [
    schemeData, totalCount, selectedInvestor, selectedInvestorId, selectedInvestorPan,
    selectedAccountHolding, selectedAccountHoldingId, selectedAccountHoldingPan,
    hasAccountHolders, hasSearched, lastSearchPan, groupBy, hideZeroInvestedValue, page, limit
  ]);

  // Load state from sessionStorage
  const loadStateFromStorage = useCallback(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEYS.PORTFOLIO_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setSchemeDatas(parsed.schemeData || []);
        setTotalCount(parsed.totalCount || 0);
        setSelectedInvestor(parsed.selectedInvestor || "");
        setSelectedInvestorId(parsed.selectedInvestorId || null);
        setSelectedInvestorPan(parsed.selectedInvestorPan || null);
        setSelectedAccountHolding(parsed.selectedAccountHolding || "");
        setSelectedAccountHoldingId(parsed.selectedAccountHoldingId || null);
        setSelectedAccountHoldingPan(parsed.selectedAccountHoldingPan || null);
        setHasAccountHolders(parsed.hasAccountHolders || false);
        setHasSearched(parsed.hasSearched || false);
        setLastSearchPan(parsed.lastSearchPan || null);
        setgroupBy(parsed.groupBy || "None");
        setHideZeroInvestedValue(parsed.hideZeroInvestedValue || false);
        setPage(parsed.page || 1);
        setLimit(parsed.limit || 50);
        return true;
      }
    } catch (error) {
      console.error("Error loading state from storage:", error);
    }
    return false;
  }, []);

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    if (!isInitialLoad) {
      saveStateToStorage();
    }
  }, [saveStateToStorage, isInitialLoad]);

  // Clear storage on logout or when needed
  const clearStoredData = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.PORTFOLIO_STATE);
    sessionStorage.removeItem(STORAGE_KEYS.PORTFOLIO_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.PORTFOLIO_SEARCH_PARAMS);
  }, []);

  // Fetch investor data
  const fetchInvestorData = async () => {
    try {
      const response = await api.get(
        `${ApiUrl}/partner/getInvestorPortfolioDtl/${userTypeid}/${userId}`
      );

      const data = response.data?.data?.data || [];

      let uniqueInvestors = [];

      if (data.length > 0) {
        uniqueInvestors = data.reduce((acc: { id: any; text: any; pan: any; value: any; }[], item: { user_name: any; user_pan: any; id: any; }) => {
          if (item.user_name && item.user_pan) {
            const existing = acc.find(inv => inv.id === item.id);
            if (!existing) {
              acc.push({
                id: item.id,
                text: item.user_name,
                pan: item.user_pan,
                value: item.id,
              });
            }
          }
          return acc;
        }, []);
      } else {
        const user = getLS(USER_DATA);
        const pan = user?.InvestorRegistration?.pan_no || "";
        const name = user?.InvestorRegistration?.name || "";

        if (name) {
          uniqueInvestors = [
            {
              id: 1,
              text: name,
              pan: pan,
              value: 1,
            },
          ];
        }
      }

      setInvestorOptions(uniqueInvestors);
      setAccountHoldingOptions([]);
      setAllAccountHolders([]);
      setHasAccountHolders(false);
    } catch (error) {
      console.error("Error fetching investor data:", error);
    }
  };

  useEffect(() => {
    const GetInvestor = async () => {
      const userData: any = getLS(USER_DATA);
      const response = await getInvestor(userData?.InvestorRegistration?.id);
      setInvestorList(response?.data?.data?.data);
    };
    GetInvestor();
  }, []);

  const fetchAccountHolders = async (investorId: string) => {
    try {
      const response = await api.get(
        `${ApiUrl}/partner/getAcctHoldingPortfolioDtl/${investorId}`
      );

      const data = response.data?.data?.data || [];

      const accountHolders = data.map((item: any) => ({
        id: item.id,
        text: item.holder_name || item.user_name || 'Unknown',
        pan: item.holder_pan || item.user_pan,
        investorId: investorId,
        value: item.holder_pan || item.user_pan
      }));

      setAllAccountHolders(accountHolders);
      setAccountHoldingOptions(accountHolders);
      setHasAccountHolders(accountHolders.length > 0);
    } catch (error) {
      console.error("Error fetching account holders:", error);
      setAllAccountHolders([]);
      setAccountHoldingOptions([]);
      setHasAccountHolders(false);
    }
  };

  const fetchByISIN = async (schemeISIN: any) => {
    try {
      const response = await searchByISIN(schemeISIN);
      const records = response?.data?.data?.data || [];
      setSipData(records);
      console.log("Transaction - searchByISIN:", records);
    } catch (error) {
      console.log('Error fetching ISIN data:', error);
    }
  };

  const handleInvestorSelection = (option: any) => {
    setSelectedInvestor(option.text);
    setSelectedInvestorId(option.id);
    setSelectedInvestorPan(option.pan);
    setSelectedAccountHolding("");
    setSelectedAccountHoldingId(null);
    setSelectedAccountHoldingPan(null);
    fetchAccountHolders(option.id);
  };

  const getAMC = async () => {
    try {
      const data = await getAMCList();
      if (data.data && data?.data?.data.length > 0) {
        const convertedData = data?.data?.data.map((item: any) => ({
          value: item.id,
          label: item.Name,
        }));
        setAMCData(convertedData);
      }
    } catch (error) { }
  };

  const handleTransactClick = async (index: number) => {
    if (transactButtonRefs.current[index]) {
      const rect = transactButtonRefs.current[index]!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 200;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownDirection((prev) => ({ ...prev, [index]: "up" }));
      } else {
        setDropdownDirection((prev) => ({ ...prev, [index]: "down" }));
      }
    }
    setOpenTransactDropdown(openTransactDropdown === index ? null : index);

    const _schemeData = {
      id: '',
      name: schemeData[index].out_mutual_fund,
      category: '',
      ms_fullname: schemeData[index].out_scheme,
      schemeISIN: schemeData[index].out_isin,
      amc_id: schemeData[index].out_amc_id,
      out_folio_no: schemeData[index].out_folio_no,
      out_sum_amount: schemeData[index].out_sum_amount,
      out_sum_units: schemeData[index].out_sum_units,
    };

    await fetchByISIN(schemeData[index].out_isin);
    console.log("Investorsssssssss :---------", investorList);

    if (investorList.length > 1) {
      //setshowInvestorPopup(true)
    } else {
      if (investorList.length === 1) {
        setSchemeData(_schemeData);
        setInvestors(investorList);

        // Save current state before navigating
        saveStateToStorage();

        // Store in localStorage for persistence across refreshes
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolioOrder_schemeData', JSON.stringify(_schemeData));
          localStorage.setItem('portfolioOrder_investorList', JSON.stringify(investorList));
        }

        router.push("/mutual-fund/portfolio-order");
      }
    }
  };

  const [dropdownDirection, setDropdownDirection] = useState<{ [key: number]: "up" | "down" }>({});
  const transactButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // filter by invested value
  const getFilteredData = () => {
    let filteredData = [...schemeData];
    if (hideZeroInvestedValue) {
      filteredData = filteredData.filter((scheme: any) => {
        const investedValue = scheme.out_amount || 0;
        return investedValue > 0;
      });
    }
    return filteredData;
  };

  const groupSchemeData = (data: any[], groupingType: string) => {
    if (groupingType === "None") {
      return { "All Schemes": data };
    }
    const grouped: { [key: string]: any[] } = {};
    data.forEach((scheme) => {
      let groupKey = "";
      switch (groupingType) {
        case "By AMC":
          groupKey = scheme.out_mutual_fund || "Unknown AMC";
          break;
        case "By Sub Category":
          groupKey = scheme.out_scheme_typ || "Unknown Category";
          break;
        default:
          groupKey = "All Schemes";
      }
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(scheme);
    });
    return grouped;
  };

  const groupedData = groupSchemeData(getFilteredData(), groupBy);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openTransactDropdown !== null) {
        const dropdown = document.querySelector(".transact-dropdown");
        const button = document.querySelector(".transact-button");

        if (
          dropdown &&
          !dropdown.contains(event.target as Node) &&
          button &&
          !button.contains(event.target as Node)
        ) {
          setOpenTransactDropdown(null);
        }
      }
    };

    if (openTransactDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTransactDropdown]);

  const router = useRouter();

  const [loader, setLoader] = useState(true);

  const prodUserData = getProdUser();
  let userId = '';

  const userTypeid = prodUserData?.userTypeId ?? 0;
  console.log("userId:", userId);
  console.log("userTypeId:-", userTypeid);
  if (userTypeid == 1) {
    userId == null;
  } else {
    userId = prodUserData?.id ?? 0;
  }

  const onPageChange = (page: number) => {
    setPage(page);
  };

  useEffect(() => {
    getAMC();
    fetchInvestorData();
  }, []);

  // Check for saved state on initial load
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState) {
      setLoader(false);
    }
    setIsInitialLoad(false);
  }, [loadStateFromStorage]);

  // Memoize the portfolio data fetch function
  const getPortfolioData = useCallback(async (pan: string, shouldSave = true) => {
    if (!pan) return;

    setLoader(true);
    try {
      const response = await api.post(`${ApiUrl}/partner/portfolio/searchs`, {
        pan: pan,
      });
      console.log("port folio search", response);

      const list = response.data?.data?.data ?? [];
      const portfolioRecords = list.filter(
        (item: any) => item.out_record_typ === "P"
      );

      setSchemeDatas(portfolioRecords);
      setTotalCount(portfolioRecords.length);
      setLastSearchPan(pan);
      setHasSearched(true);

      if (shouldSave) {
        saveStateToStorage();
      }
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    } finally {
      setLoader(false);
    }
  }, [saveStateToStorage]);

  // Auto-refresh when returning to page
  useEffect(() => {
    const handleFocus = () => {
      if (lastSearchPan) {
        getPortfolioData(lastSearchPan, true);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [lastSearchPan, getPortfolioData]);

  const handleSearch = () => {
    const panToSearch = selectedAccountHoldingPan || selectedInvestorPan;
    if (panToSearch) {
      getPortfolioData(panToSearch, true);
      setPage(1); // Reset to first page on new search
    } else {
      alert("Please select an investor first");
    }
  };

  const convertToCrores = (number: number) => {
    const crore = 10000000;
    const crores = number / crore;
    return crores?.toFixed(2);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0.00";

    if (num >= 10000000) {
      return `₹${convertToCrores(num)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    } else {
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatUnits = (units: string | number) => {
    const num = parseFloat(units as string);
    if (isNaN(num)) return "--";
    return num.toFixed(4);
  };

  const formatHoldingDays = (days: string | number) => {
    const num = parseInt(days as string);
    if (isNaN(num)) return "--";

    if (num < 30) {
      return `${num} ${num === 1 ? 'day' : 'days'}`;
    } else if (num < 365) {
      const months = Math.floor(num / 30);
      const remainingDays = num % 30;
      return remainingDays > 0
        ? `${months}m ${remainingDays}d`
        : `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(num / 365);
      const remainingDays = num % 365;
      const months = Math.floor(remainingDays / 30);
      return months > 0
        ? `${years}y ${months}m`
        : `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const onChangeSorting = (key: string) => {
    console.log(key);
    setSortConfig((prev: { key: string; order: string }) => {
      if (prev.key === key && prev.order === "ASC") {
        return { key, order: "DESC" };
      } else if (prev.key === key && prev.order === "DESC") {
        return { key: null, order: null };
      } else {
        return { key, order: "ASC" };
      }
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <LuArrowUpDown size={15} className="text-[#9CA3AF]" />;
    }
    return sortConfig.order === "ASC" ? (
      <GoArrowUp size={15} className="text-[#F59E0B]" />
    ) : (
      <GoArrowDown size={15} className="text-[#F59E0B]" />
    );
  };

  // Calculate stats
  const totalInvested = schemeData.reduce((sum, item) => sum + parseFloat(item.out_amount || 0), 0);
  const totalCurrentValue = schemeData.reduce((sum, item) => sum + parseFloat(item.out_current_val || 0), 0);
  const totalProfitLoss = schemeData.reduce((sum, item) => sum + parseFloat(item.out_p_n_l || 0), 0);
  const avgReturn = schemeData.length > 0
    ? schemeData.reduce((sum, item) => sum + parseFloat(item.out_abs_per || 0), 0) / schemeData.length
    : 0;
  const avgHoldingDays = schemeData.length > 0
    ? Math.round(schemeData.reduce((sum, item) => sum + parseInt(item.out_no_of_days || 0), 0) / schemeData.length)
    : 0;

  // Render scheme row
  const renderSchemeRow = (item: any, globalIndex: number) => {
    const profitLoss = parseFloat(item.out_p_n_l || 0);
    const isProfit = profitLoss >= 0;
    const returnPercent = parseFloat(item.out_abs_per || 0);

    return (
      <tr key={`${item.out_folio_no}-${globalIndex}`} className="hover:bg-[#1F1A1A] transition-colors duration-150 border-b border-[#2A2A2A]">
        <td className="font-normal text-white/90 py-4 px-6">
          <div className="flex items-center gap-4">
            <div>
              <img
                src={`${publicPathName}/Kotak.png`}
                className="w-10 h-10 min-w-10 min-h-10 object-contain"
                alt="bank"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div
                className="text-sm font-semibold text-white cursor-pointer hover:text-[#F59E0B] transition-colors"
                onClick={() => router.push(`/scheme-detail`)}
              >
                {item.out_scheme}
              </div>
              <div className="flex gap-3 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  {item.out_mutual_fund}
                </div>
                <div className="flex items-center gap-1">-</div>
                <div className="flex items-center gap-1">
                  Folio: {item.out_folio_no}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="text-right font-medium text-white/90 py-4 px-6">
          {item.out_current_nav ? `₹${parseFloat(item.out_current_nav).toFixed(2)}` : "--"}
        </td>
        <td className="text-right font-medium text-white/90 py-4 px-6">
          {formatUnits(item.out_units)}
        </td>
        <td className="text-right font-medium text-white/90 py-4 px-6">
          <div className="flex items-center justify-end gap-1">
            <MdOutlineCalendarToday className="text-white/40" size={14} />
            <span>{formatHoldingDays(item.out_no_of_days)}</span>
          </div>
        </td>
        <td className="text-right font-medium text-white/90 py-4 px-6">
          {formatCurrency(item.out_amount)}
        </td>
        <td className="text-right font-medium text-white/90 py-4 px-6">
          {formatCurrency(item.out_current_val)}
        </td>
        <td className="text-right py-4 px-6">
          <div className={`flex items-center justify-end gap-1 font-medium ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {isProfit ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {formatCurrency(item.out_p_n_l)}
          </div>
        </td>
        <td className="text-right py-4 px-6">
          <div className={`font-medium ${returnPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {item.out_abs_per ? `${parseFloat(item.out_abs_per).toFixed(2)}%` : "--"}
          </div>
        </td>
        <td className="relative w-20 py-4 px-6">
          <div className="relative flex justify-end">
            <button
              ref={(el) => {
                transactButtonRefs.current[globalIndex] = el;
              }}
              className="transact-button btn btn-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:from-[#F59E0B] hover:to-[#B45309] w-10 mx-auto py-0 px-2 text-sm font-medium text-white border-0 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                setSelectedScheme(item);
                handleTransactClick(globalIndex);
              }}
            >
              <GrTransaction size={14} className="text-white" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header Section */}
      <div className="bg-[#111111] border-b border-[#2A2A2A] shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-6">
            <CustomBackButton
              onClick={() => window.history.back()}
              className="inline-flex items-center p-2 border border-[#2A2A2A] rounded-lg text-[#F9FAFB] bg-[#1F1A1A] hover:bg-[#2A2A2A] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </CustomBackButton>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-xl font-bold text-white">Portfolio</h1>
            </div>
          </div>

          {/* Investor Selection Section */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
            <div className="flex flex-wrap items-end gap-4 flex-1">
              {/* Investor Dropdown */}
              <div className="form-control min-w-[200px] sm:min-w-[240px]">
                <CustomLabel className="text-sm font-medium text-white mb-2">
                  Investor name
                </CustomLabel>
                <CustomReactSelect
                  placeholder="Select investor"
                  items={investorOptions}
                  bindName="text"
                  bindValue="value"
                  value={selectedInvestorId}
                  onChange={handleInvestorSelection}
                  className="bg-[#1F1A1A] border-[#2A2A2A] text-white rounded-lg"
                  styles={{
                    control: (base: any) => ({
                      ...base,
                      backgroundColor: '#1F1A1A',
                      borderColor: '#2A2A2A',
                      color: '#F9FAFB'
                    }),
                    menu: (base: any) => ({
                      ...base,
                      backgroundColor: '#1F1A1A',
                      border: '1px solid #2A2A2A'
                    }),
                    option: (base: any, state: any) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                      color: '#F9FAFB',
                      cursor: 'pointer'
                    }),
                    singleValue: (base: any) => ({
                      ...base,
                      color: '#F9FAFB'
                    }),
                    input: (base: any) => ({
                      ...base,
                      color: '#F9FAFB'
                    }),
                    placeholder: (base: any) => ({
                      ...base,
                      color: '#9CA3AF'
                    })
                  }}
                />
              </div>

              {/* Account Holding Dropdown */}
              {hasAccountHolders && (
                <div className="form-control min-w-[200px] sm:min-w-[240px]">
                  <CustomLabel className="text-sm font-medium text-white mb-2">
                    Account Holding
                  </CustomLabel>
                  <CustomReactSelect
                    placeholder="Select account holder"
                    items={accountHoldingOptions}
                    bindName="text"
                    bindValue="value"
                    value={selectedAccountHoldingId}
                    onChange={(option: any) => {
                      setSelectedAccountHolding(option.text);
                      setSelectedAccountHoldingId(option.value);
                      setSelectedAccountHoldingPan(option.pan);
                    }}
                    className="bg-[#1F1A1A] border-[#2A2A2A] text-white rounded-lg"
                    styles={{
                      control: (base: any) => ({
                        ...base,
                        backgroundColor: '#1F1A1A',
                        borderColor: '#2A2A2A',
                        color: '#F9FAFB'
                      }),
                      menu: (base: any) => ({
                        ...base,
                        backgroundColor: '#1F1A1A',
                        border: '1px solid #2A2A2A'
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                        color: '#F9FAFB',
                        cursor: 'pointer'
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#F9FAFB'
                      }),
                      input: (base: any) => ({
                        ...base,
                        color: '#F9FAFB'
                      }),
                      placeholder: (base: any) => ({
                        ...base,
                        color: '#9CA3AF'
                      })
                    }}
                  />
                </div>
              )}

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F59E0B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={handleSearch}
                  disabled={!selectedInvestorPan}
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 shadow-sm hover:border-[#F59E0B]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Invested</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {formatCurrency(totalInvested.toString())}
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#F59E0B]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 shadow-sm hover:border-[#F59E0B]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Current Value</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {formatCurrency(totalCurrentValue.toString())}
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#10B981]/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 shadow-sm hover:border-[#F59E0B]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Profit/Loss</p>
                  <p className={`text-lg font-bold mt-1 ${totalProfitLoss >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {formatCurrency(totalProfitLoss.toString())}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalProfitLoss >= 0 ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'}`}>
                  {totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 shadow-sm hover:border-[#F59E0B]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Avg Return</p>
                  <p className={`text-lg font-bold mt-1 ${avgReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {avgReturn.toFixed(2)}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4 shadow-sm hover:border-[#F59E0B]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Avg Holding</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {formatHoldingDays(avgHoldingDays)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#0F0F0F] border-b border-[#2A2A2A] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-white/70">Group by:</span>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:bg-[#1F1A1A] cursor-pointer transition-colors">
              <CustomCheckbox
                label="None"
                name="groupBy"
                value="None"
                checked={groupBy === "None"}
                onChange={() => setgroupBy("None")}
              />
            </label>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:bg-[#1F1A1A] cursor-pointer transition-colors">
              <CustomCheckbox
                label="By AMC"
                name="groupBy"
                value="By AMC"
                checked={groupBy === "By AMC"}
                onChange={() => setgroupBy("By AMC")}
              />
            </label>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:bg-[#1F1A1A] cursor-pointer transition-colors">
              <CustomCheckbox
                label="By Sub Category"
                name="groupBy"
                value="By Sub Category"
                checked={groupBy === "By Sub Category"}
                onChange={() => setgroupBy("By Sub Category")}
              />
            </label>

            <div className="md:pl-4 md:ml-4 text-sm text-white/60 md:border-l-2 border-[#2A2A2A] flex items-center">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <CustomCheckbox
                  type="checkbox"
                  label="Don't Show holding with Zero Balance"
                  checked={hideZeroInvestedValue}
                  onChange={() => setHideZeroInvestedValue((prev) => !prev)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-full table-auto">
              <thead className="bg-[#1F1A1A] border-b border-[#2A2A2A]">
                <tr>
                  <th className="text-left py-4 px-6 w-1/4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Scheme</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_scheme")}
                      >
                        {getSortIcon("out_scheme")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">NAV</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_current_nav")}
                      >
                        {getSortIcon("out_current_nav")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Units</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_units")}
                      >
                        {getSortIcon("out_units")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Holding Days</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_no_of_days")}
                      >
                        {getSortIcon("out_no_of_days")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Invested Value</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_amount")}
                      >
                        {getSortIcon("out_amount")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Current Value</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_current_val")}
                      >
                        {getSortIcon("out_current_val")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Profit/Loss</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_p_n_l")}
                      >
                        {getSortIcon("out_p_n_l")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-1/8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">Return</div>
                      <div
                        className="sorting cursor-pointer hover:bg-[#2A2A2A] p-1 rounded transition-colors"
                        onClick={() => onChangeSorting("out_abs_per")}
                      >
                        {getSortIcon("out_abs_per")}
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 w-24">
                    <div className="text-sm font-semibold text-white">Transact</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loader ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      <div className="text-white/60">
                        {!hasSearched ? "Select an investor and click Search" : "Loading..."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {Object.keys(groupedData).length > 0 ? (
                      Object.entries(groupedData).map(([groupName, schemes], groupIndex) => {
                        const isOpen = groupBy === "None" || openAccordionGroup === groupName;
                        let globalIndex = 0;
                        
                        return (
                          <Fragment key={groupName}>
                            {groupBy !== "None" && (
                              <tr
                                key={`group-${groupIndex}`}
                                className="bg-[#1F1A1A] border-b border-[#2A2A2A] cursor-pointer hover:bg-[#2A2A2A] transition-colors"
                                onClick={() => setOpenAccordionGroup(openAccordionGroup === groupName ? null : groupName)}
                              >
                                <td colSpan={9} className="font-semibold text-sm py-3 px-6">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white">
                                      {groupName}
                                      <span className="text-white/50 ml-2">
                                        ({schemes.length} {schemes.length === 1 ? "scheme" : "schemes"})
                                      </span>
                                    </span>
                                    <span>
                                      {isOpen ? (
                                        <FaChevronUp className="w-4 h-4 transition-transform text-[#F59E0B]" />
                                      ) : (
                                        <FaChevronUp className="w-4 h-4 rotate-180 transition-transform text-[#F59E0B]" />
                                      )}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {isOpen && schemes.map((item: any) => {
                              const currentGlobalIndex = globalIndex++;
                              return renderSchemeRow(item, currentGlobalIndex);
                            })}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8">
                          <div className="text-white/60">
                            {hasSearched ? "No Data Found" : "Select an investor and click Search"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Only show if there's data */}
        {schemeData.length > 0 && (
          <div className="mt-6">
            <Pagination
              totalCount={totalCount}
              limit={limit}
              page={page}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <BuyModal
        ref={buyModalRef}
        currentValue={selectedScheme?.out_current_val || "0"}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      <SipModal
        ref={sipModalRef}
        currentValue={selectedScheme?.out_current_val || "0"}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      <RedeemModal
        ref={redeemModalRef}
        currentValue={selectedScheme?.out_current_val || "0"}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      <SwitchModal
        ref={switchModalRef}
        currentValue={selectedScheme?.out_current_val || "0"}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      <StpModal
        ref={stpModalRef}
        currentValue={selectedScheme?.out_current_val || "0"}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      <SwpModal
        ref={swpModalRef}
        currentValue={selectedInvestorPan || ""}
        investor={selectedInvestor || ""}
        accountHolding={selectedAccountHolding || ""}
        schemeData={selectedScheme}
      />
      {drawerOpen && (
        <FundPickerFilter
          open={drawerOpen}
          handleClose={() => setDrawerOpen(false)}
          setPayload={setPayload}
        />
      )}
    </div>
  );
};

export default Portfolio;