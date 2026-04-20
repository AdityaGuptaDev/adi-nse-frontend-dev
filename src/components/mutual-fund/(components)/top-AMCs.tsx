"use client";

import React from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight, FaBuilding, FaChartLine, FaArrowTrendUp } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { convertNumberIndian, convertOnlyDate } from "@/utils/helpers";
import { convertToCrores, schemeColors } from "@/utils/constants";
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
  textDark: "#1F2937",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

const TopAMCs = ({ data }: any) => {
  const router = useRouter();
  const amcsData = data?.length > 0 ? data : [];

  const getAUMColor = (aum: number) => {
    if (aum >= 100000) return "#10B981";
    if (aum >= 50000) return "#22C55E";
    if (aum >= 10000) return "#F59E0B";
    if (aum >= 5000) return "#FBBF24";
    return "#9CA3AF";
  };

  return (
    <div style={{ background: theme.cardBg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
            <FaBuilding className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: theme.textWhite }}>
              Top Asset Management Companies
            </div>
            <div className="text-xs" style={{ color: theme.textGray }}>
              Leading fund houses by AUM
            </div>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CustomButton
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              background: "transparent",
              border: `1px solid ${theme.primary}`,
              color: theme.primary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.gradient;
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = theme.primary;
            }}
            onClick={() => router.push(`/top-amc-list`)}
          >
            <span className="flex items-center gap-1.5">
              View All
              <FaAngleRight className="h-3.5 w-3.5" />
            </span>
          </CustomButton>
        </motion.div>
      </div>

      {/* AMC Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {amcsData.length > 0 ? (
          amcsData.slice(0, 5).map((amc: any, index: number) => (
            <motion.div
              key={amc.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/amc-scheme-detail?id=${amc.id}`}>
                <div 
                  className="rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                  style={{
                    background: theme.hoverBg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {/* AMC Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`relative p-2.5 rounded-xl shadow-sm`} style={{ background: schemeColors[index % schemeColors.length]?.bg || theme.primary }}>
                      <span className="text-white font-bold text-base">
                        {amc?.Name?.charAt(0)}
                      </span>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-tight line-clamp-2" style={{ color: theme.textWhite }}>
                        {amc?.Name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: theme.textGray }}>
                        {amc?.total_schemes || 0} Schemes
                      </div>
                    </div>
                  </div>

                  {/* AUM Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                          Total AUM
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <FaChartLine className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                          <div className="text-lg font-bold" style={{ color: getAUMColor(amc?.total_AUM || 0) }}>
                            {convertToCrores(amc?.total_AUM)} Cr
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                          Rank
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                          index === 0 ? 'text-amber-700' :
                          index === 1 ? 'text-[#E5E7EB]' :
                          index === 2 ? 'text-orange-700' :
                          'text-blue-700'
                        }`} style={{
                          background: index === 0 ? '#F59E0B20' :
                                     index === 1 ? '#9CA3AF20' :
                                     index === 2 ? '#F9731620' :
                                     '#3B82F620'
                        }}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* AUM Date */}
                    <div className="pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                      <div className="flex items-center justify-between">
                        <div className="text-xs" style={{ color: theme.textGray }}>
                          Updated on
                        </div>
                        <div className="text-xs font-medium" style={{ color: theme.textWhite }}>
                          {convertOnlyDate(amc?.AUMDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full mb-4" style={{ background: theme.hoverBg }}>
                <FaBuilding className="h-8 w-8" style={{ color: theme.textGray }} />
              </div>
              <div className="text-base mb-2" style={{ color: theme.textWhite }}>
                No AMC data available
              </div>
              <div className="text-sm" style={{ color: theme.textGray }}>
                Check back later for AMC information
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopAMCs;