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

  const getPerformanceColor = (returnValue: number) => {
    if (returnValue >= 20) return "text-green-600";
    if (returnValue >= 15) return "text-green-500";
    if (returnValue >= 10) return "text-yellow-600";
    if (returnValue >= 5) return "text-orange-500";
    return "text-red-500";
  };

  const getPerformanceBgColor = (returnValue: number) => {
    if (returnValue >= 20) return "bg-green-50 border-green-100";
    if (returnValue >= 15) return "bg-green-50/50 border-green-50";
    if (returnValue >= 10) return "bg-yellow-50/50 border-yellow-50";
    if (returnValue >= 5) return "bg-orange-50/50 border-orange-50";
    return "bg-red-50/50 border-red-50";
  };

  const handleInvestorAction = (scheme: any) => {
    setSelectedScheme(scheme?.SchemeMaster);
    onSchemeClick(scheme?.SchemeMaster);
  };

  return (
    <>
      <FullPageLoader isVisible={navigateLoader} message="Processing..." />
      
      <div className="bg-white p-4 md:p-5 rounded-xl">
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
                <CustomText className="text-xl font-bold text-gray-900">
                  Top Performing Schemes
                </CustomText>
                <CustomText className="text-sm text-gray-600">
                  Best performing mutual funds in {activeTab}
                </CustomText>
              </div>
            </div>

            {/* View All Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="md:self-start"
            >
              <CustomButton
                className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
                onClick={onChangeViewAll}
              >
                <span className="flex items-center gap-1.5">
                  View All
                  <FaAngleRight className="h-3.5 w-3.5" />
                </span>
              </CustomButton>
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
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === fundClass.categoryName
                          ? "bg-primary text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
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
                    className="bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Scheme Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className={`relative p-2 rounded-lg ${schemeColors[index % schemeColors.length]?.bg || 'bg-blue-500'} cursor-pointer`}
                          onClick={() => handleNavigateFundDetail(scheme)}
                        >
                          <div className="text-white font-bold text-base w-6 h-6 flex items-center justify-center">
                            {scheme?.SchemeMaster?.ms_fullname?.charAt(0) || 'F'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CustomText 
                            className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors mb-0.5"
                            onClick={() => handleNavigateFundDetail(scheme)}
                          >
                            {scheme?.SchemeMaster?.ms_fullname || 'Fund Name'}
                          </CustomText>
                          <CustomText className="text-xs text-gray-500 truncate">
                            {scheme?.SchemeMaster?.SchemeCategory?.Name || 'Category'}
                          </CustomText>
                        </div>
                      </div>

                      {/* Returns Section */}
                      <div className={`mb-3 p-3 rounded-lg border ${getPerformanceBgColor(returnValue)}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <CustomText className="text-xs font-medium text-gray-700">
                            1Y Returns
                          </CustomText>
                          {isTopReturn && (
                            <FaFire className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <IoTriangle className="text-green-600 w-3 h-3" />
                          <CustomText className={`text-lg font-bold ${getPerformanceColor(returnValue)}`}>
                            {toFixedDataForReturn(returnValue)}
                          </CustomText>
                          <CustomText className="text-xs text-gray-500">
                            p.a
                          </CustomText>
                        </div>
                        <div className="mt-1.5">
                          <CustomText className="text-xs text-gray-500">
                            Avg: {toFixedDataForReturn(scheme.categoryReturnAvg || 0)}
                          </CustomText>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <CustomText className="text-xs text-gray-500 mb-0.5">
                            Min. Invest
                          </CustomText>
                          <CustomText className="text-sm font-semibold text-gray-900">
                            ₹{scheme.minAmount ? convertNumberIndian(scheme.minAmount) : "5,000"}
                          </CustomText>
                        </div>
                        <div className="text-right">
                          <CustomText className="text-xs text-gray-500 mb-0.5">
                            Risk
                          </CustomText>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLOR(scheme?.SchemeMaster?.riskLevel || 'Medium')}`}>
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
                          className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
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
                <div className="inline-block p-4 bg-gray-100 rounded-lg mb-3">
                  <FaChartLine className="h-8 w-8 text-gray-400 mx-auto" />
                </div>
                <CustomText className="text-base text-gray-600">
                  No schemes found for this category
                </CustomText>
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