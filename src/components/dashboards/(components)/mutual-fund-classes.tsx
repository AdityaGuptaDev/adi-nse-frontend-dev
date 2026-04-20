"use client";

import React, { Fragment, useState } from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight } from "react-icons/fa6";
import { IoTriangle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { formatReturn } from "@/utils/helpers";
import Link from "next/link";
import { schemeColors } from "@/utils/constants";
import FullPageLoader from "@/commonUI/FullPageLoader";


interface SchemeList {
  id: number;
  name: string;
  returns: {
    threeYear: number;
  };
  icon?: string;
  color?: string;
}
interface FundCategory {
  id: string;
  name: string;
  returns: {
    threeYear: number;
  };
  icon?: string;
  color?: string;
  scheme: SchemeList[];
}


interface FundClass {
  id: string;
  name: string;
  categories: FundCategory[];
}

const MutualFundClasses = ({ data }: any) => {

  const router = useRouter();

  const [activeTab, setActiveTab] = useState(data?.[0]?.categoryName || "Equity");
  const [viewAllLoader, setViewAllLoader] = useState(false);


  // Mock data for demonstration
  const mockData: FundClass[] = [
    {
      id: "equity",
      name: "Equity",
      categories: [
        {
          id: "sector-energy",
          name: "Sector Funds - Energy & Power",
          returns: { threeYear: 32.3 },
          icon: "⚡",
          color: "text-green-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        },
        {
          id: "sector-infra",
          name: "Sector Funds - Infrastructure",
          returns: { threeYear: 32.0 },
          icon: "🏗️",
          color: "text-blue-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        },
        {
          id: "mid-cap",
          name: "Mid Cap Fund",
          returns: { threeYear: 27.7 },
          icon: "📈",
          color: "text-purple-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        }
      ]
    },
    {
      id: "debt",
      name: "Debt",
      categories: [
        {
          id: "gilt-fund",
          name: "Gilt Fund",
          returns: { threeYear: 8.5 },
          icon: "🏛️",
          color: "text-blue-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        },
        {
          id: "corporate-bond",
          name: "Corporate Bond Fund",
          returns: { threeYear: 7.2 },
          icon: "🏢",
          color: "text-[#9CA3AF]",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        }
      ]
    },
    {
      id: "hybrid",
      name: "Hybrid",
      categories: [
        {
          id: "balanced-advantage",
          name: "Balanced Advantage Fund",
          returns: { threeYear: 15.8 },
          icon: "⚖️",
          color: "text-orange-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        },
        {
          id: "aggressive-hybrid",
          name: "Aggressive Hybrid Fund",
          returns: { threeYear: 18.2 },
          icon: "🚀",
          color: "text-red-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        }
      ]
    },
    {
      id: "other",
      name: "Other",
      categories: [
        {
          id: "index-fund",
          name: "Index Fund",
          returns: { threeYear: 12.5 },
          icon: "📊",
          color: "text-indigo-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        },
        {
          id: "etf",
          name: "Exchange Traded Fund (ETF)",
          returns: { threeYear: 11.8 },
          icon: "💱",
          color: "text-teal-600",
          scheme: [
            {
              id: 1,
              name: "Nippon India Power & Infra Fund(G)",
              returns: { threeYear: 36.9 },
              icon: "⚡",
            },
            {
              id: 2,
              name: "DSP Natural Res & New Energy Fund-Reg(G)",
              returns: { threeYear: 24.8 },
              icon: "⚡",
            },
            {
              id: 3,
              name: "Tata Resources & Energy Fund-Reg(G)",
              returns: { threeYear: 23.6 },
              icon: "⚡",
            },
          ]
        }
      ]
    }
  ];

  const fundClasses = data.length > 0 ? data : mockData;
  
  // const fundClasses =  mockData;
  const activeClass = fundClasses.find((fc: any) => fc.categoryName === activeTab) || fundClasses[0];

  const onChangeViewAll = () => {
    setViewAllLoader(true);
    router.push(`/mutual-fund-classes-list`);
    setViewAllLoader(false);
  }

  return (
    <>
      <FullPageLoader
        isVisible={viewAllLoader}
        message="Processing..."
      />
      <div className="bg-[#111111]">
        <div className="flex items-center justify-between mb-4">
          <CustomText className="text-lg font-montserrat font-semibold text-[#F9FAFB]">
            Mutual Fund Classes
          </CustomText>
          <CustomButton
            className="p-0 h-auto min-h-0 !text-secondary-content !bg-[#111111]"
            onClick={() => onChangeViewAll()}
          >
            View All <span><FaAngleRight /></span>
          </CustomButton>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-4 border-b border-[#2A2A2A]">
          <div role="tablist" className="tabs tabs-border">
            {fundClasses.map((fundClass: any, index: number) => (
              // <button
              //   key={fundClass.id}
              //   onClick={() => setActiveTab(fundClass.name)}
              //   className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              //     activeTab === fundClass.name
              //       ? "text-blue-600 border-blue-600"
              //       : "text-[#9CA3AF] hover:text-[#F9FAFB] border-transparent"
              //   }`}
              // >
              //   {fundClass.name}
              // </button>
              <a role="tab" key={index}
                className={`tab transition-all ${activeTab === fundClass.categoryName
                  ? " tab-active font-bold text-primary border-primary"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB] border-transparent"
                  }`} onClick={() => setActiveTab(fundClass.categoryName)}>{fundClass.categoryName}</a>
            ))}
          </div>
        </div>

        {/* Active Tab Content */}
        <div>
          <CustomText className="text-base font-medium text-[#F9FAFB] mb-4">
            Top Categories and Fund in {activeTab} (3 Years)
          </CustomText>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeClass?.subCategory?.length > 0 ? (
                activeClass?.subCategory?.map((mfData: any, index: number) => (
                  <div
                    key={index}
                    className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side - Category info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <CustomText className="font-semibold text-base">
                            {mfData?.subCategoryName}
                          </CustomText>
                        </div>
                      </div>

                      {/* Right side - Returns */}
                      <div className="flex justify-between gap-2 items-center">
                        {/* <CustomText className="text-xs text-[#9CA3AF] mb-1">
                      p.a
                    </CustomText> */}
                        <div className="flex items-center gap-2">
                          <IoTriangle className="text-green-600 w-3 h-3" />
                          <CustomText className="text-sm font-bold text-green-600">
                            {formatReturn(mfData?.subCategoryReturnAvg)}
                          </CustomText>
                        </div>
                      </div>
                    </div>

                    {mfData.scheme.map((item: any, index: number) => (
                      <Fragment key={index}>
                        <div className="flex items-center justify-between mt-2 ms-3">
                          {/* Left side - Category info */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 ${schemeColors[index % schemeColors.length].bg} rounded-full flex items-center justify-center`}>
                              <span className={`${schemeColors[index % schemeColors.length].text} text-lg`}>{item?.SchemeMaster?.ms_fullname.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <Link href={`/scheme-detail`}>
                                <CustomText className="font-medium text-[#F9FAFB] text-sm  cursor-pointer">
                                  {item?.SchemeMaster?.ms_fullname}
                                </CustomText>
                              </Link>
                            </div>
                          </div>

                          {/* Right side - Returns */}
                          <div className="flex justify-between gap-2 items-center">
                            {/* <CustomText className="text-xs text-[#9CA3AF] mb-1">
                          p.a
                        </CustomText> */}
                            <div className="flex items-center gap-2">
                              <IoTriangle className="text-green-600 w-3 h-3" />
                              <CustomText className="text-sm font-bold text-green-600">
                                {formatReturn(item.Returns3yr)}
                              </CustomText>
                            </div>
                          </div>
                        </div>
                        <div className="border border-b border-[#2A2A2A] my-4"></div>
                      </Fragment>
                    ))}
                  </div>
                ))) : (
                <div className="col-span-3">
                  <CustomText className="text-center text-[#9CA3AF]">
                    No Data Found
                  </CustomText>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default MutualFundClasses;
