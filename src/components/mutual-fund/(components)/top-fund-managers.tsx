"use client";

import React, { useState } from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight, FaUserTie, FaChartLine, FaTrophy, FaInfo } from "react-icons/fa6";
import { IoTriangle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/commonUI/FullPageLoader";
import { convertToCrores, toFixedDataForReturn } from "@/utils/constants";
import { motion } from "framer-motion";

const TopFundManagers = ({ data }: any) => {
  const router = useRouter();
  const [navigateLoader, setNavigateLoader] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const fundManagers = data?.length > 0 ? data : [];

  const onChangeViewAll = () => {
    setNavigateLoader(true);
    router.push(`/top-fund-manager-list`);
    setNavigateLoader(false);
  };

  const onChangeFundManager = async (manager: any) => {
    setNavigateLoader(true);
    await router.push(`/fund-manager-detail?id=${manager.manager_id}`);
    setNavigateLoader(false);
  };

  const getExperienceColor = (years: number) => {
    if (years >= 20) return "from-purple-500 to-indigo-500";
    if (years >= 15) return "from-blue-500 to-cyan-500";
    if (years >= 10) return "from-green-500 to-emerald-500";
    if (years >= 5) return "from-yellow-500 to-amber-500";
    return "from-gray-500 to-slate-500";
  };

  const getAUMColor = (aum: number) => {
    if (aum >= 100000) return "text-green-600";
    if (aum >= 50000) return "text-green-500";
    if (aum >= 10000) return "text-blue-600";
    if (aum >= 5000) return "text-blue-500";
    return "text-gray-600";
  };

  return (
    <>
      <FullPageLoader isVisible={navigateLoader} message="Processing..." />
      
      <div className="bg-white p-4 md:p-5 rounded-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Main Header */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-sm"
              >
                <FaUserTie className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CustomText className="text-xl font-bold text-gray-900">
                  Top Fund Managers
                </CustomText>
                <CustomText className="text-sm text-gray-600">
                  Most experienced and successful fund managers
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
                className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                onClick={onChangeViewAll}
              >
                <span className="flex items-center gap-1.5">
                  View All
                  <FaAngleRight className="h-3.5 w-3.5" />
                </span>
              </CustomButton>
            </motion.div>
          </div>

     
        </div>

        {/* Fund Managers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fundManagers.length > 0 ? (
            fundManagers.slice(0, 3).map((manager: any, index: number) => {
              const aum = manager.total_AUM || 0;
              const experienceYears = manager.experience_years || 5;
              const topScheme = manager.topScheme?.SchemeMaster || {};
              const returns3yr = topScheme?.SchemePerformances?.[0]?.Returns3yr || 0;
              const isTopPerformer = index === 0;
              
              return (
                <motion.div
                  key={manager.manager_id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() => onChangeFundManager(manager)}
                >
                  <div className="p-4">
                    {/* Manager Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative p-2.5 rounded-xl bg-gradient-to-r ${getExperienceColor(experienceYears)} shadow-sm`}>
                          <FaUserTie className="h-5 w-5 text-white" />
                          {isTopPerformer && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              <FaTrophy className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <CustomText className="font-bold text-gray-900 text-sm">
                            {manager?.manager_name || 'Fund Manager'}
                          </CustomText>
                          <CustomText className="text-xs text-gray-500 mt-0.5">
                            {experienceYears}+ years experience
                          </CustomText>
                        </div>
                      </div>
                      
                      {isTopPerformer && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          #1
                        </div>
                      )}
                    </div>

                    {/* AUM Section */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <CustomText className="text-xs font-medium text-gray-700">
                          Total AUM Managed
                        </CustomText>
                        <FaChartLine className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <CustomText className={`text-xl font-bold ${getAUMColor(aum)}`}>
                          {convertToCrores(aum)} Cr
                        </CustomText>
                   
                      </div>
                    </div>

                    {/* Top Performing Scheme */}
                    <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-indigo-50/30 rounded-lg border border-indigo-100">
                      <CustomText className="text-xs font-medium text-gray-700 mb-2">
                        Top Performing Scheme
                      </CustomText>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 text-xs font-bold">
                              {topScheme.name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CustomText className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                              {topScheme.name || 'Scheme Name'}
                            </CustomText>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <IoTriangle className="text-green-600 w-3 h-3" />
                          <CustomText className="text-sm font-bold text-green-600">
                            {toFixedDataForReturn(returns3yr)}
                          </CustomText>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <CustomText className="text-xs text-gray-500">
                          3-Year Returns
                        </CustomText>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    {hoveredCard === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-3 border-t border-gray-100"
                      >
                        <CustomText className="text-xs text-gray-600 text-center">
                          Click to view manager details →
                        </CustomText>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <FaUserTie className="h-8 w-8 text-gray-400" />
                </div>
                <CustomText className="text-base text-gray-600 mb-2">
                  No fund manager data available
                </CustomText>
                <CustomText className="text-sm text-gray-500">
                  Check back later for fund manager information
                </CustomText>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default TopFundManagers;