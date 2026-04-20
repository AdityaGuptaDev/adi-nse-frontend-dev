"use client";

import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import CustomText from "@/commonUI/Text";
import { useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa6";

interface ThemeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  schemes: number;
  returnRange: {
    min: number;
    max: number;
  };
  date: string;
  isLocked?: boolean;
}

interface InvestmentThemeListProps {
  data?: ThemeData[];
  onBack?: () => void;
}

const InvestmentThemeList: React.FC<InvestmentThemeListProps> = ({
  data = [],
  onBack
}) => {
  const router = useRouter();

  const handleBack = () => {
      router.back();
  };

  // Mock data for investment themes
  const themesData: ThemeData[] = data.length > 0 ? data : [
    {
      id: "1",
      name: "Tax Saving Investment",
      description: "Investing in Tax Saving Funds",
      icon: "💰",
      iconBg: "bg-gradient-to-br from-orange-400 to-yellow-500",
      schemes: 5,
      returnRange: { min: 16.3, max: 27.6 },
      date: "01 Jul 2025"
    },
    {
      id: "2",
      name: "Small Cap Funds",
      description: "Invest in Small Cap Funds",
      icon: "📈",
      iconBg: "bg-gradient-to-br from-blue-400 to-green-500",
      schemes: 5,
      returnRange: { min: 21.3, max: 28.4 },
      date: "01 Jul 2025"
    },
    {
      id: "3",
      name: "Mid Cap Funds",
      description: "Invest in Mid Cap Funds",
      icon: "📊",
      iconBg: "bg-gradient-to-br from-purple-400 to-pink-500",
      schemes: 5,
      returnRange: { min: 22.3, max: 32.4 },
      date: "01 Jul 2025"
    },
    {
      id: "4",
      name: "High Beta Funds",
      description: "Investing in High Risk - High Returns companies",
      icon: "📊",
      iconBg: "bg-gradient-to-br from-blue-600 to-blue-800",
      schemes: 5,
      returnRange: { min: 21.3, max: 30.1 },
      date: "01 Jul 2025"
    },
    {
      id: "5",
      name: "International Funds",
      description: "Invest in overseas funds and companies.",
      icon: "✓",
      iconBg: "bg-gradient-to-br from-green-400 to-teal-500",
      schemes: 5,
      returnRange: { min: 8.3, max: 53.3 },
      date: "01 Jul 2025",
      isLocked: true
    },
    {
      id: "6",
      name: "Flexi Cap Funds",
      description: "Invest in companies across market capitalization.",
      icon: "↻",
      iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
      schemes: 5,
      returnRange: { min: 15.6, max: 25.8 },
      date: "01 Jul 2025",
      isLocked: true
    },
    {
      id: "7",
      name: "Moderate Risk",
      description: "Investing in Medium Risk - Medium Return",
      icon: "⭐",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
      schemes: 5,
      returnRange: { min: 12.5, max: 22.8 },
      date: "01 Jul 2025",
      isLocked: true
    }
  ];

  const getReturnColor = (returnValue: number) => {
    if (returnValue >= 0) return "text-green-600";
    return "text-red-600";
  };

  const handleThemeClick = (theme: ThemeData) => {
    if (!theme.isLocked) {
      // Navigate to theme detail or schemes list
      console.log('Navigate to theme:', theme.name);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#2A2A2A] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={handleBack} className="p-1 cursor-pointer">
              <IoArrowBack className="w-5 h-5 " />
            </div>
            <CustomText className="text-lg font-semibold">
              Mutual Fund Investment Themes
            </CustomText>
          </div>
          <CustomText className="text-sm ">
            3 Yr Return Range
          </CustomText>
        </div>
      </div>

      {/* Themes List */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          {themesData.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              // className={`bg-[#111111] rounded-lg p-4 shadow-sm border border-[#2A2A2A] transition-all duration-200 ${
              //   theme.isLocked 
              //     ? 'opacity-75 cursor-not-allowed' 
              //     : 'hover:shadow-md cursor-pointer hover:border-blue-300'
              // }`}
              className={`bg-[#111111] rounded-lg p-4 shadow-sm border border-[#2A2A2A] transition-all duration-200 hover:shadow-md hover:border-blue-300`}
            >
              <div className="flex items-center gap-4">
                {/* Theme Icon */}
                <div className={`w-16 h-16 ${theme.iconBg} rounded-lg flex items-center justify-center text-white text-2xl font-bold relative`}>
                  {theme.icon}
                  {/* {theme.isLocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🔒</span>
                    </div>
                  )} */}
                </div>

                {/* Theme Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <CustomText className="text-base font-semibold text-[#F9FAFB] mb-1">
                        {theme.name}
                      </CustomText>
                      <CustomText className="text-sm text-[#9CA3AF] mb-2">
                        {theme.description}
                      </CustomText>
                      <div className="flex gap-3 items-center">
                        <CustomText className="text-xs text-[#9CA3AF]">
                          {theme.date}
                        </CustomText>
                        <div>
                          <FaLock className="text-[#9CA3AF]" />
                          {/* <span className="text-white text-lg">🔒</span> */}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Info */}
                    <div className="text-right ml-4 flex justify-center items-center gap-4">
                      {/* Schemes Count */}
                      <div className="flex gap-1 justify-center items-center">
                        <span className="border border-orange-200 bg-orange-300 p-2 rounded-md px-2"></span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium">
                          {theme.schemes} Schemes
                        </span>
                      </div>

                      {/* Return Range */}
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-green-600 text-sm">▲</span>
                          <CustomText className={`text-sm font-semibold ${getReturnColor(theme.returnRange.min)}`}>
                            {theme.returnRange.min.toFixed(1)}% p.a
                          </CustomText>
                        </div>
                        <div className="text-[#6B7280] text-xs">-</div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-green-600 text-sm">▲</span>
                          <CustomText className={`text-sm font-semibold ${getReturnColor(theme.returnRange.max)}`}>
                            {theme.returnRange.max.toFixed(1)}% p.a
                          </CustomText>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      {/* <div className="px-4 py-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <CustomText className="text-sm font-medium text-blue-800">
              Investment Themes Information
            </CustomText>
          </div>
          <CustomText className="text-xs text-blue-700">
            Investment themes represent different investment strategies and market segments. 
            Returns shown are historical 3-year annualized returns and past performance 
            does not guarantee future results. Please read scheme documents carefully before investing.
          </CustomText>
        </div>
      </div> */}
    </div>
  );
};

export default InvestmentThemeList;