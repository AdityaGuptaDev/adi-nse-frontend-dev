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

const TopAMCs = ({ data }: any) => {
  const router = useRouter();
  const amcsData = data?.length > 0 ? data : [];

  const getAUMColor = (aum: number) => {
    if (aum >= 100000) return "text-green-600";
    if (aum >= 50000) return "text-green-500";
    if (aum >= 10000) return "text-blue-600";
    if (aum >= 5000) return "text-blue-500";
    return "text-gray-600";
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-sm">
            <FaBuilding className="h-5 w-5 text-white" />
          </div>
          <div>
            <CustomText className="text-lg font-bold text-gray-900">
              Top Asset Management Companies
            </CustomText>
            <CustomText className="text-xs text-gray-500">
              Leading fund houses by AUM
            </CustomText>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CustomButton
            className="px-4 py-2 text-sm bg-white border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
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
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer h-full">
                  {/* AMC Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`relative p-2.5 rounded-xl ${schemeColors[index % schemeColors.length]?.bg || 'bg-blue-500'} shadow-sm`}>
                      <span className={`text-white font-bold text-base`}>
                        {amc?.Name?.charAt(0)}
                      </span>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <CustomText className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                        {amc?.Name}
                      </CustomText>
                      <CustomText className="text-xs text-gray-500 mt-0.5">
                        {amc?.total_schemes || 0} Schemes
                      </CustomText>
                    </div>
                  </div>

                  {/* AUM Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CustomText className="text-xs text-gray-500 mb-0.5">
                          Total AUM
                        </CustomText>
                        <div className="flex items-baseline gap-1.5">
                          <FaChartLine className="h-3.5 w-3.5 text-blue-500" />
                          <CustomText className={`text-lg font-bold ${getAUMColor(amc?.total_AUM || 0)}`}>
                            {convertToCrores(amc?.total_AUM)} Cr
                          </CustomText>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <CustomText className="text-xs text-gray-500 mb-0.5">
                          Rank
                        </CustomText>
                        <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                          index === 0 ? 'bg-amber-50 text-amber-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-50 text-orange-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* AUM Date */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <CustomText className="text-xs text-gray-500">
                          Updated on
                        </CustomText>
                        <CustomText className="text-xs font-medium text-gray-700">
                          {convertOnlyDate(amc?.AUMDate)}
                        </CustomText>
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
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <FaBuilding className="h-8 w-8 text-gray-400" />
              </div>
              <CustomText className="text-base text-gray-600 mb-2">
                No AMC data available
              </CustomText>
              <CustomText className="text-sm text-gray-500">
                Check back later for AMC information
              </CustomText>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TopAMCs;