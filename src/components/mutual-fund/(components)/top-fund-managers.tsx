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

  const getExperienceGradient = (years: number): string => {
    if (years >= 20) return "from-purple-500 to-indigo-500";
    if (years >= 15) return "from-blue-500 to-cyan-500";
    if (years >= 10) return "from-green-500 to-emerald-500";
    if (years >= 5) return "from-yellow-500 to-amber-500";
    return "from-gray-500 to-slate-500";
  };

  const getAUMColor = (aum: number): React.CSSProperties => {
    if (aum >= 100000) return { color: "#10B981" };
    if (aum >= 50000) return { color: "#22C55E" };
    if (aum >= 10000) return { color: "#F59E0B" };
    if (aum >= 5000) return { color: "#FBBF24" };
    return { color: "#9CA3AF" };
  };

  const getAUMBgColor = (aum: number): React.CSSProperties => {
    if (aum >= 100000) return { background: `${theme.success}20` };
    if (aum >= 50000) return { background: `${theme.success}15` };
    if (aum >= 10000) return { background: `${theme.primary}20` };
    if (aum >= 5000) return { background: `${theme.secondary}20` };
    return { background: `${theme.textGray}20` };
  };

  return (
    <>
      <FullPageLoader isVisible={navigateLoader} message="Processing..." />
      
      <div className="p-4 md:p-5 rounded-xl" style={{ background: theme.cardBg }}>
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
                <div className="text-xl font-bold" style={{ color: theme.textWhite }}>
                  Top Fund Managers
                </div>
                <div className="text-sm" style={{ color: theme.textGray }}>
                  Most experienced and successful fund managers
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
                className="px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
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
              const experienceGradient = getExperienceGradient(experienceYears);
              
              return (
                <motion.div
                  key={manager.manager_id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="rounded-lg transition-all duration-200 overflow-hidden cursor-pointer"
                  style={{
                    background: theme.hoverBg,
                    border: `1px solid ${theme.border}`,
                  }}
                  onClick={() => onChangeFundManager(manager)}
                >
                  <div className="p-4">
                    {/* Manager Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative p-2.5 rounded-xl bg-gradient-to-r ${experienceGradient} shadow-sm`}>
                          <FaUserTie className="h-5 w-5 text-white" />
                          {isTopPerformer && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              <FaTrophy className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-bold text-sm" style={{ color: theme.textWhite }}>
                            {manager?.manager_name || 'Fund Manager'}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: theme.textGray }}>
                            {experienceYears}+ years experience
                          </div>
                        </div>
                      </div>
                      
                      {isTopPerformer && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          #1
                        </div>
                      )}
                    </div>

                    {/* AUM Section */}
                    <div className="mb-4 p-3 rounded-lg" style={{ background: theme.cardBg, border: `1px solid ${theme.border}` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-medium" style={{ color: theme.textGray }}>
                          Total AUM Managed
                        </div>
                        <FaChartLine className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-xl font-bold" style={getAUMColor(aum)}>
                          {convertToCrores(aum)} Cr
                        </div>
                      </div>
                    </div>

                    {/* Top Performing Scheme */}
                    <div className="p-3 rounded-lg" style={{ background: `${theme.primary}10`, border: `1px solid ${theme.primary}30` }}>
                      <div className="text-xs font-medium mb-2" style={{ color: theme.textGray }}>
                        Top Performing Scheme
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${theme.primary}20` }}>
                            <span className="text-xs font-bold" style={{ color: theme.primary }}>
                              {topScheme.name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium leading-tight line-clamp-2" style={{ color: theme.textWhite }}>
                              {topScheme.name || 'Scheme Name'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <IoTriangle className="w-3 h-3" style={{ color: theme.success }} />
                          <div className="text-sm font-bold" style={{ color: theme.success }}>
                            {toFixedDataForReturn(returns3yr)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs" style={{ color: theme.textGray }}>
                          3-Year Returns
                        </div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    {hoveredCard === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}
                      >
                        <div className="text-xs text-center" style={{ color: theme.primary }}>
                          Click to view manager details →
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full mb-4" style={{ background: theme.hoverBg }}>
                  <FaUserTie className="h-8 w-8 mx-auto" style={{ color: theme.textGray }} />
                </div>
                <div className="text-base mb-2" style={{ color: theme.textWhite }}>
                  No fund manager data available
                </div>
                <div className="text-sm" style={{ color: theme.textGray }}>
                  Check back later for fund manager information
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopFundManagers;