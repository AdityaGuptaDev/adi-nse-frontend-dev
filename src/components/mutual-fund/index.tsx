"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import CustomText from "@/commonUI/Text";
import TopAMCs from "./(components)/top-AMCs";
import MutualFundClasses from "./(components)/mutual-fund-classes";
import TopFundManagers from "./(components)/top-fund-managers";
import MutualFundThemes from "./(components)/mutual-fund-themes";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import InvestmentTheme from "./(components)/investment-themes";
import NewFundOffers from "./(components)/new-fund-offers";
import FullPageLoader from "@/commonUI/FullPageLoader";
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';
import { getInvestor } from "@/api/holder";
import InvestorPicker from "./(components)/InvestorPicker";
import InvestorPopup from "../fund-explore/investor";
import { Investor } from "@/services/searchReportService";
import OrderPopup from "./new-order";
import { searchByISIN } from "@/api/transaction";
import { useFundStore } from "@/store/useFundStore";
import TopPerformingSchemes from "./(components)/top-performing-schemes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaBuilding,
  FaUserTie,
  FaGift,
  FaTags,
  FaLightbulb,
  FaListUl,
  FaChevronDown,
  FaLayerGroup,
  FaMoneyBillWave,
  FaCoins,
  FaArrowRight
} from "react-icons/fa6";
import { GiTakeMyMoney, GiMoneyStack, GiCash } from "react-icons/gi";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

interface Investors {
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

type TabType = 'all' | 'top-schemes' | 'new-offers' | 'amcs' | 'managers' | 'classes';

function MutualFund() {
  const router = useRouter();
  const user = getLS(USER_DATA);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [investorList, setInvestorList] = useState<any[]>([]);
  const [sipData, setSipData] = useState<any[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);
  const [showInvestorPicker, setshowInvestorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { setSchemeData, setInvestors } = useFundStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInvestmentHelper, setShowInvestmentHelper] = useState(true);
  const [helperAnimation, setHelperAnimation] = useState<'idle' | 'bounce' | 'wave' | 'jump'>('bounce');

  const [mutualFundData, setMutualFundData] = useState<any>({
    allCategory: [],
    topPerformingSchemes: [],
    topAMCs: [],
    fundClasses: [],
    newFundData: [],
    topFundManagers: [],
    themes: [],
    investmentTheme: [],
  });

  const allTabs = [
    {
      id: 'all' as TabType,
      label: 'All',
      icon: FaLayerGroup,
      color: 'from-purple-500 to-pink-500',
      description: 'View all categories'
    },
    {
      id: 'top-schemes' as TabType,
      label: 'Top Performing Schemes',
      icon: FaChartLine,
      color: 'from-blue-500 to-cyan-500',
      description: 'Best performing schemes'
    },
    {
      id: 'new-offers' as TabType,
      label: 'New Offers',
      icon: FaGift,
      color: 'from-green-500 to-emerald-500',
      description: 'Latest NFOs'
    },
    {
      id: 'amcs' as TabType,
      label: 'AMCs',
      icon: FaBuilding,
      color: 'from-orange-500 to-red-500',
      description: 'Asset Management Companies'
    },
    {
      id: 'managers' as TabType,
      label: 'Managers',
      icon: FaUserTie,
      color: 'from-amber-500 to-yellow-500',
      description: 'Fund Managers'
    },
  ];

  // Fun investment messages
  const investmentMessages = [
    "💰 Grow Your Money Here!",
    "🚀 Start Investing Today!",
    "📈 Your Future Self Will Thank You!",
    "💎 Discover Hidden Gems!",
    "🌟 Make Your Money Work!",
    "🎯 Smart Investments Await!",
    "✨ Financial Freedom Starts Now!"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  // Rotate messages every few seconds
  useEffect(() => {
    if (showInvestmentHelper) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % investmentMessages.length);
        setHelperAnimation('wave');
        setTimeout(() => setHelperAnimation('bounce'), 500);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showInvestmentHelper]);

  const fetchByISIN = useCallback(async (schemeISIN: any) => {
    try {
      const response = await searchByISIN(schemeISIN);
      const records = response?.data?.data?.data || [];
      setSipData(records);
    } catch (error) {
      console.log('Error fetching ISIN data:', error);
    }
  }, []);

  const handleSchemeClick = useCallback((scheme: any) => {
    setSelectedScheme(scheme);
    fetchByISIN(scheme?.schemeISIN);

    if (investorList.length > 1) {
      setshowInvestorPopup(true);
    } else {
      if (investorList.length === 1) {
        setSchemeData(scheme);
        setInvestors(investorList);
        router.push("/mutual-fund/new-order");
      }
    }
  }, [fetchByISIN, investorList, router, setSchemeData, setInvestors]);

  const getComponents = useCallback(() => {
    return [
      {
        id: 'top-schemes',
        component: TopPerformingSchemes,
        data: mutualFundData.topPerformingSchemes,
        props: {
          data: mutualFundData.topPerformingSchemes,
          onSchemeClick: handleSchemeClick
        }
      },
      {
        id: 'new-offers',
        component: NewFundOffers,
        data: mutualFundData.newFundData,

        props: {
          data: mutualFundData.newFundData
        }
      },
      {
        id: 'amcs',
        component: TopAMCs,
        data: mutualFundData.topAMCs,
        props: {
          data: mutualFundData.topAMCs
        }
      },
      {
        id: 'managers',
        component: TopFundManagers,
        data: mutualFundData.topFundManagers,
        props: {
          data: mutualFundData.topFundManagers
        }
      },
    ];
  }, [mutualFundData, handleSchemeClick]);

  const filteredComponents = activeTab === 'all'
    ? getComponents()
    : getComponents().filter(comp => comp.id === activeTab);

  useEffect(() => {
    fetchMutualFundData();
  }, []);

  const fetchMutualFundData = async () => {
    try {
      setLoading(true);

      const [
        topPerSchemesRes,
        allCategoryRes,
        fundClassesRes,
        newFundDataRes,
        topAMCsRes,
        fundManagersRes,
        themesRes,
        investmentThemeRes
      ] = await Promise.all([
        api.get(`/mutual-fund/get-top-performing-schemes`),
        api.get(`/scheme/get-allscheme-category`),
        api.get(`/mutual-fund/get-top-mutual-fund-catdata`),
        api.get(`/mutual-fund/get-new-fund-offer-list`),
        api.get(`/mutual-fund/get-top-amc-list`),
        api.get(`/mutual-fund/get-top-fund-managers-list`),
        api.get(`/mutual-fund/get-themes`).catch(() => ({ data: { data: [] } })),
        api.get(`/mutual-fund/get-investment-themes`).catch(() => ({ data: { data: [] } }))
      ]);

      setMutualFundData({
        allCategory: allCategoryRes.data.data || [],
        topPerformingSchemes: topPerSchemesRes.data.data || [],
        topAMCs: topAMCsRes.data.data || [],
        fundClasses: fundClassesRes.data.data || [],
        topFundManagers: fundManagersRes.data.data || [],
        themes: themesRes.data.data || [],
        investmentTheme: investmentThemeRes.data.data || [],
        newFundData: newFundDataRes.data.data || [],
      });
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  useEffect(() => {
    const GetInvestor = async () => {
      const userData: any = getLS(USER_DATA);
      const response = await getInvestor(userData?.InvestorRegistration?.id)
      setInvestorList(response?.data?.data?.data)
    }
    GetInvestor()
  }, []);

  const handleHelperClick = () => {
    setHelperAnimation('jump');
    setTimeout(() => setHelperAnimation('bounce'), 1000);

    // Scroll to top performing schemes
    const topSchemesElement = document.getElementById('top-schemes');
    if (topSchemesElement) {
      topSchemesElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Set active tab to top schemes
    setActiveTab('top-schemes');
  };

  return (
    <>
      <FullPageLoader isVisible={loading} message="Loading..." />

      <div className="bg-mainbackground min-h-screen relative">

        {showInvestmentHelper && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: helperAnimation === 'bounce'
                ? [0, -20, 0]
                : helperAnimation === 'wave'
                  ? [0, -10, 10, -10, 0]
                  : helperAnimation === 'jump'
                    ? [0, -40, 0]
                    : 0
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.3 },
              y: helperAnimation === 'bounce'
                ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                : helperAnimation === 'wave'
                  ? { duration: 0.5 }
                  : helperAnimation === 'jump'
                    ? { duration: 0.8 }
                    : { duration: 0.3 }
            }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            onClick={handleHelperClick}
            onMouseEnter={() => setHelperAnimation('wave')}
            onMouseLeave={() => setHelperAnimation('bounce')}
          >

            <div className="relative">

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-xl opacity-30"
              />

              <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-2xl p-4 shadow-2xl border-2 border-white">

                <div className="relative">

                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="h-1 w-4 bg-pink-300 rounded-full mt-1 mx-auto"></div>
                  </div>

                  {/* Money Bag Body */}
                  <div className="relative">
                    <GiTakeMyMoney className="h-12 w-12 text-white" />
                    {/* Sparkles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2"
                    >
                      <div className="h-3 w-3 bg-yellow-300 rounded-full"></div>
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute -bottom-2 -left-2"
                    >
                      <div className="h-2 w-2 bg-pink-300 rounded-full"></div>
                    </motion.div>
                  </div>
                </div>

                {/* Speech Bubble */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-16 -right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-200 min-w-[180px]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {investmentMessages[currentMessage]}
                    </span>
                    <FaArrowRight className="h-3 w-3 text-green-500 animate-bounce ml-1" />
                  </div>
                  {/* Speech bubble tail */}
                  <div className="absolute -bottom-2 right-6">
                    <div className="h-4 w-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
                  </div>
                </motion.div>
              </div>

              {/* Click Me Badge */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
              >
                CLICK ME!
              </motion.div>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Single Compact Header with Menu in One Line */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm p-3 mb-6 border border-gray-100 relative">
              {/* Investment Helper Toggle */}
              <button
                onClick={() => setShowInvestmentHelper(!showInvestmentHelper)}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1.5 rounded-full z-10 shadow-md hover:shadow-lg transition-shadow"
                title={showInvestmentHelper ? "Hide Helper" : "Show Helper"}
              >
                {showInvestmentHelper ? "👋" : "💰"}
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Back Button */}
                  <button
                    onClick={handleBackClick}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 flex-shrink-0"
                  >
                    <IoMdArrowRoundBack className="text-base text-gray-600" />
                  </button>

                  {/* Divider */}
                  <div className="h-6 w-px bg-gray-200"></div>

                  {/* All Menu Items in Single Line */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
                    {allTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${isActive
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-sm`
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{tab.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {filteredComponents.map((comp: any) => {
                const Component = comp.component as React.ComponentType<any>;
                const hasData = comp.data && comp.data.length > 0;

                return (
                  <motion.div
                    key={comp.id}
                    id={comp.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative"
                  >
                    {/* Highlight for top schemes when helper is clicked */}
                    {comp.id === 'top-schemes' && activeTab === 'top-schemes' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-1 bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 rounded-xl blur-sm -z-10"
                      />
                    )}

                    <div className="p-5">
                      {/* Component Header - Only show if not 'all' tab */}
                      {activeTab === 'all' && (
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <CustomText className="text-lg font-semibold text-gray-900">
                              {comp.title}
                            </CustomText>
                            <CustomText className="text-sm text-gray-600 mt-1">
                              {comp.description}
                            </CustomText>
                          </div>


                        </div>
                      )}

                      {/* Component Content */}
                      {hasData ? (
                        <Component {...comp.props} />
                      ) : (
                        <div className="text-center py-10">
                          <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <CustomText className="text-gray-400 text-xl">?</CustomText>
                            </div>
                          </div>
                          <CustomText className="text-base text-gray-600 mb-2">
                            No data available
                          </CustomText>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Back to All Button for filtered view */}
          {activeTab !== 'all' && filteredComponents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <CustomText className="text-sm font-medium text-gray-800">
                    Viewing 1 category
                  </CustomText>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('all')}
                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    View All
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Popup Components */}
        {showInvestorPopup && selectedScheme && (
          <InvestorPopup
            schemeData={selectedScheme}
            open={showInvestorPopup}
            investor={investorList}
            onClose={() => setshowInvestorPopup(false)}
          />
        )}

        {showInvestorPicker && selectedScheme && (
          <InvestorPicker
            schemeData={selectedScheme}
            open={showInvestorPicker}
            onClose={() => setshowInvestorPicker(false)}
          />
        )}

        {showOrderPopup && selectedInvestor && selectedScheme && (
          <OrderPopup
            schemeData={selectedScheme}
            investor={selectedInvestor}
            sipData={sipData}
            source={"fund-exploress"}
            open={showOrderPopup}
            onClose={() => setShowOrderPopup(false)}
          />
        )}
      </div>
    </>
  );
}

export default MutualFund;