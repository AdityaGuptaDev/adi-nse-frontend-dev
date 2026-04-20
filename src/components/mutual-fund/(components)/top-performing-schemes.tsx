"use client";
// Top Performing Schemes Component

import CustomButton from "@/commonUI/Button";
import CustomBackButton from "@/commonUI/CustomBackButton";
import FullPageLoader from "@/commonUI/FullPageLoader";
import CustomText from "@/commonUI/Text";
import InvestorPopup from "@/components/fund-explore/investor";
import PurchaseDetailPopup from "@/components/fund-explore/purchaseDetail";
import SipPopup from "@/components/fund-explore/sipDetail";
import AccountContext from "@/context/AccountContext/Account.context";
import api from "@/utils/api";
import { schemeColors, toFixedDataForReturn, USER_DATA } from "@/utils/constants";
import { convertNumberIndian, getLS, handleServerError, RISK_COLOR, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { FaAngleRight, FaChartLine, FaFire, FaMedal, FaCircle, FaInfo } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoCartOutline, IoTriangle } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

// Golden Black Theme Constants
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textWhite: "#FFFFFF",
  textGray: "#9CA3AF",
  textLight: "#E5E5E5",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

type Props = {
  data: any;
  onSchemeClick: (scheme: any) => void;
};

function TopPerformingSchemes({ data, onSchemeClick }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(data?.[0]?.categoryName || "Equity");
  const [navigateLoader, setNavigateLoader] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [showSipPopup, setShowSipPopup] = useState(false);
  const [showInvestorPopup, setShowInvestorPopup] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

  const schemes = data && data.length > 0 ? data : [];
  const activeClass = schemes.find((fc: any) => fc.categoryName === activeTab) || schemes[0];

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
      transition: {
        duration: 0.3
      }
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2
      }
    }
  };

  const onChangeViewAll = () => {
    setNavigateLoader(true);
    router.push(`/top-performing-scheme-list`);
    setNavigateLoader(false);
  };

  const handleNavigateFundDetail = (item: any) => {
    setNavigateLoader(true);
    router.push(`/fund-detail?id=${item?.SchemeMaster?.id}&tab=NAV`);
    setNavigateLoader(false);
  };

  const addToCart = async (schemeId: number) => {
    try {
      const userData: any = getLS(USER_DATA);
      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeId,
        trans_type: 1,
      };
      
      let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
      if (addCartData.data.data) {
        toastAlert("success", "Added To Cart");
        setCartCounter(cartCounter + 1);
      } else {
        toastAlert("info", "Unable to add in cart, please try again later!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const getPerformanceColor = (returnValue: number): React.CSSProperties => {
    if (returnValue >= 20) return { color: "#10B981" };
    if (returnValue >= 15) return { color: "#22C55E" };
    if (returnValue >= 10) return { color: "#F59E0B" };
    if (returnValue >= 5) return { color: "#F97316" };
    return { color: "#EF4444" };
  };

  const getPerformanceBgColor = (returnValue: number): React.CSSProperties => {
    if (returnValue >= 20) return { background: `${theme.success}20`, border: `1px solid ${theme.border}` };
    if (returnValue >= 15) return { background: `${theme.success}15`, border: `1px solid ${theme.border}` };
    if (returnValue >= 10) return { background: `${theme.primary}20`, border: `1px solid ${theme.border}` };
    if (returnValue >= 5) return { background: `${theme.warning}20`, border: `1px solid ${theme.border}` };
    return { background: `${theme.danger}20`, border: `1px solid ${theme.border}` };
  };

  const getTabStyle = (isActive: boolean): React.CSSProperties => {
    if (isActive) {
      return {
        background: theme.gradient,
        color: theme.textWhite,
        border: "none"
      };
    }
    return {
      background: theme.hoverBg,
      color: theme.textGray,
      border: `1px solid ${theme.border}`
    };
  };

  const handleInvestorAction = (scheme: any) => {
    setSelectedScheme(scheme?.SchemeMaster);
    onSchemeClick(scheme?.SchemeMaster);
  };

  const riskColorStyle = (risk: string): React.CSSProperties => {
    const riskMap: Record<string, React.CSSProperties> = {
      'Low': { background: '#10B98120', color: '#10B981' },
      'Moderate': { background: '#F59E0B20', color: '#F59E0B' },
      'High': { background: '#EF444420', color: '#EF4444' },
      'Very High': { background: '#EF444440', color: '#EF4444' },
    };
    return riskMap[risk] || { background: '#9CA3AF20', color: '#9CA3AF' };
  };

  return (
    <>
      <FullPageLoader isVisible={navigateLoader} message="Processing..." />
      
      <div className="p-4 md:p-5 rounded-xl" style={{ background: theme.cardBg }}>
        {/* Header Section with Title and Description */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Main Header */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 rounded-xl shadow-sm"
              >
                <FaMedal className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <div className="text-xl font-bold" style={{ color: theme.textWhite }}>
                  Top Performing Schemes
                </div>
                <div className="text-sm" style={{ color: theme.textGray }}>
                  Best performing mutual funds in {activeTab}
                </div>
              </div>
            </div>

            {/* View All Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="md:self-start"
            >
              <button
                className="px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                style={{ background: theme.gradient }}
                onClick={onChangeViewAll}
              >
                <span className="flex items-center gap-1.5">
                  View All
                  <FaAngleRight className="h-3.5 w-3.5" />
                </span>
              </button>
            </motion.div>
          </div>

          {/* Category Tabs */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 pb-2">
                  {schemes.map((fundClass: any, index: number) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(fundClass.categoryName)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                      style={getTabStyle(activeTab === fundClass.categoryName)}
                    >
                      {fundClass.categoryName}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {activeClass?.scheme?.length > 0 ? (
              activeClass.scheme.map((scheme: any, index: number) => {
                const returnValue = parseFloat(scheme?.Return1yr) || 0;
                const isTopReturn = returnValue >= 15;
                
                return (
                  <motion.div
                    key={scheme.id || index}
                    variants={cardVariants}
                    whileHover="hover"
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="rounded-lg transition-all duration-200 overflow-hidden"
                    style={{
                      background: theme.hoverBg,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="p-4">
                      {/* Scheme Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="relative p-2 rounded-lg cursor-pointer"
                          style={{ background: schemeColors[index % schemeColors.length]?.bg || theme.primary }}
                          onClick={() => handleNavigateFundDetail(scheme)}
                        >
                          <div className="text-white font-bold text-base w-6 h-6 flex items-center justify-center">
                            {scheme?.SchemeMaster?.ms_fullname?.charAt(0) || 'F'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer transition-colors mb-0.5"
                            style={{ color: theme.textWhite }}
                            onClick={() => handleNavigateFundDetail(scheme)}
                            onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
                            onMouseLeave={(e) => e.currentTarget.style.color = theme.textWhite}
                          >
                            {scheme?.SchemeMaster?.ms_fullname || 'Fund Name'}
                          </div>
                          <div className="text-xs truncate" style={{ color: theme.textGray }}>
                            {scheme?.SchemeMaster?.SchemeCategory?.Name || 'Category'}
                          </div>
                        </div>
                      </div>

                      {/* Returns Section */}
                      <div className="mb-3 p-3 rounded-lg" style={getPerformanceBgColor(returnValue)}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="text-xs font-medium" style={{ color: theme.textGray }}>
                            1Y Returns
                          </div>
                          {isTopReturn && (
                            <FaFire className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <IoTriangle className="text-green-600 w-3 h-3" />
                          <div className="text-lg font-bold" style={getPerformanceColor(returnValue)}>
                            {toFixedDataForReturn(returnValue)}
                          </div>
                          <div className="text-xs" style={{ color: theme.textGray }}>
                            p.a
                          </div>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-xs" style={{ color: theme.textGray }}>
                            Avg: {toFixedDataForReturn(scheme.categoryReturnAvg || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                            Min. Invest
                          </div>
                          <div className="text-sm font-semibold" style={{ color: theme.textWhite }}>
                            ₹{scheme.minAmount ? convertNumberIndian(scheme.minAmount) : "5,000"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                            Risk
                          </div>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={riskColorStyle(scheme?.SchemeMaster?.riskLevel || 'Medium')}
                          >
                            {scheme?.SchemeMaster?.riskLevel || 'Medium'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInvestorAction(scheme)}
                          className="flex-1 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg"
                          style={{ background: theme.gradient }}
                        >
                          <GrTransaction className="h-3.5 w-3.5" />
                          Invest
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-8"
              >
                <div className="inline-block p-4 rounded-lg mb-3" style={{ background: theme.hoverBg }}>
                  <FaChartLine className="h-8 w-8 mx-auto" style={{ color: theme.textGray }} />
                </div>
                <div className="text-base" style={{ color: theme.textWhite }}>
                  No schemes found for this category
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Investor Popup */}
        {showInvestorPopup && selectedInvestor && (
          <InvestorPopup
            open={showInvestorPopup}
            investor={selectedInvestor}
            onClose={() => {
              setShowInvestorPopup(false);
              setSelectedInvestor(null);
            }}
          />
        )}

        <PurchaseDetailPopup
          modalId="purchaseDetailModal"
          showTriggerButton={false}
          schemeData={selectedScheme}
        />

        {showSipPopup && (
          <SipPopup
            schemeData={selectedScheme}
            open={showSipPopup}
            onClose={() => setShowSipPopup(false)}
          />
        )}
      </div>
    </>
  );
};

export default TopPerformingSchemes;