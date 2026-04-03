"use client";

import React from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight } from "react-icons/fa6";
import { publicPathName } from "@/utils/constants";
import { IoTriangle } from "react-icons/io5";

interface ThemeData {
  id: string;
  name: string;
  description: string;
  image?: string;
  schemes: number;
  returnRange: {
    min: number;
    max: number;
  };
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  backgroundColor?: string;
  textColor?: string;
}

interface MutualFundThemesProps {
  data: ThemeData[];
}

const MutualFundThemes: React.FC<MutualFundThemesProps> = ({ data }) => {
  // Mock data for demonstration
  const mockData: ThemeData[] = [
    {
      id: "1",
      image: "Tax-Savings.jpg",
      name: "Tax-Saving Investment",
      description: "Investing in Tax Saving Funds",
      schemes: 5,
      returnRange: { min: 19.4, max: 30.7 },
      riskLevel: "High",
      backgroundColor: "bg-gradient-to-br from-yellow-100 to-orange-100",
      textColor: "text-orange-800"
    },
    {
      id: "2",
      image: "Smallcap-MF.jpg",
      name: "Small Cap Funds",
      description: "Invest in Small Cap Funds",
      schemes: 5,
      returnRange: { min: 23.1, max: 31.5 },
      riskLevel: "Very High",
      backgroundColor: "bg-gradient-to-br from-green-100 to-emerald-100",
      textColor: "text-green-800"
    },
    {
      id: "3",
      image: "Midcap-MF.jpg",
      name: "Mid Cap Funds",
      description: "Invest in Mid Cap Funds",
      schemes: 5,
      returnRange: { min: 26.0, max: 36.7 },
      riskLevel: "High",
      backgroundColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
      textColor: "text-blue-800"
    },
    {
      id: "4",
      name: "High Beta Funds",
      image: "High-Beta.jpg",
      description: "Investing in High Risk - High Return...",
      schemes: 5,
      returnRange: { min: 23.1, max: 33.9 },
      riskLevel: "Very High",
      backgroundColor: "bg-gradient-to-br from-purple-100 to-pink-100",
      textColor: "text-purple-800"
    },
    {
      id: "5",
      image: "international_funds.jpg",
      name: "International Funds",
      description: "Invest in overseas funds and...",
      schemes: 5,
      returnRange: { min: 7.6, max: 52.5 },
      riskLevel: "High",
      backgroundColor: "bg-gradient-to-br from-indigo-100 to-blue-100",
      textColor: "text-indigo-800"
    }
  ];

  const themes = data.length > 0 ? data : mockData;

  const formatReturnRange = (min: number, max: number) => {
    return `${min.toFixed(1)}% - ${max.toFixed(1)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Very High":
        return "bg-red-100 text-red-700 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getThemeIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      "Tax-Saving Investment": "💰",
      "Small Cap Funds": "🌱",
      "Mid Cap Funds": "📊",
      "High Beta Funds": "🚀",
      "International Funds": "🌍"
    };
    return iconMap[name] || "📈";
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-4">
        <CustomText className="text-lg font-semibold text-gray-900">
          Mutual Fund Themes
        </CustomText>
        <CustomButton
          className="p-0 h-auto min-h-0 !text-secondary-content !bg-white"
          onClick={() => {/* Navigate to all AMCs */ }}
        >
          View All <span><FaAngleRight /></span>
        </CustomButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {themes.map((theme) => (
          <>
            {/* <div
              key={theme.id}
              className={`
                       rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200
                       border border-gray-200`}
            >
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  {theme.image ? (
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-2xl">
                      {getThemeIcon(theme.name)}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center mb-2">
                <CustomText className="font-semibold text-sm leading-tight text-gray-900">
                  {theme.name}
                </CustomText>
              </div>

              <div className="text-center mb-3">
                <CustomText className="text-xs text-gray-600 leading-relaxed">
                  {theme.description}
                </CustomText>
              </div>

              <div className="text-center mb-3">
                <CustomText className="text-xs text-gray-500">
                  {theme.schemes} Schemes
                </CustomText>
              </div>

              <div className="text-center mb-3">
                <CustomText className="text-xs text-gray-500 mb-1">
                  3Y Return Range
                </CustomText>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <CustomText className="text-sm font-bold text-green-600">
                    {formatReturnRange(theme.returnRange.min, theme.returnRange.max)}
                  </CustomText>
                </div>
              </div>

              <div className="text-center">
                <CustomText className="text-xs text-gray-500">
                  p.a
                </CustomText>
              </div>
            </div> */}
            <div className="card bg-base-100 shadow-sm">
              <figure className="p-2">
                <img
                  src={`${publicPathName}/mutual-fund/${theme.image}`}
                  alt={theme.image}
                  className="rounded-xl object-cover w-60 h-40 max-w-60 max-h-40" />
              </figure>
              <div className="card-body">
                <div className="">
                  <CustomText className="font-semibold text-sm leading-tight text-gray-900">
                    {theme.name}
                  </CustomText>
                </div>

                <div className="">
                  <CustomText className="text-xs text-gray-600 leading-relaxed">
                    {theme.description}
                  </CustomText>
                </div>

                <div className="mt-3">
                  <CustomText className="text-xs text-gray-500">
                    {theme.schemes} Schemes
                  </CustomText>
                </div>

                <div className="">
                  <CustomText className="text-xs text-gray-500 ">
                    3Y Return Range
                  </CustomText>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <IoTriangle className="text-green-600 w-3 h-3" />
                      <CustomText className="text-sm font-bold text-green-600">
                        {/* {formatReturnRange(theme.returnRange.min, theme.returnRange.max)} */}
                        {theme.returnRange.min.toFixed(1)} %
                      </CustomText> -
                      <IoTriangle className="text-green-600 w-3 h-3" />
                      <CustomText className="text-sm font-bold text-green-600">
                        {/* {formatReturnRange(theme.returnRange.min, theme.returnRange.max)} */}
                        {theme.returnRange.max.toFixed(1)} %
                      </CustomText>
                    </div>
                    <div className="">
                      <CustomText className="text-xs text-gray-500">
                        p.a
                      </CustomText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
      </div>

      {/* Additional Info */}
      {/* <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-blue-600 text-lg">🎯</div>
          <CustomText className="text-sm font-medium text-blue-800">
            Thematic Investment Opportunities
          </CustomText>
        </div>
        <CustomText className="text-xs text-blue-700">
          Thematic funds allow you to invest in specific sectors, market caps, or investment strategies.
          Each theme offers different risk-return profiles and is suitable for different investment goals and time horizons.
        </CustomText>
      </div> */}
    </div>
  );
};

export default MutualFundThemes;
