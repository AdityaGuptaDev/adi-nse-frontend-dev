"use client";

import React, { useState } from "react";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import CustomText from "@/commonUI/Text";
import CustomInput from "@/commonUI/Input";
import { FiShare2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface AMCData {
  id: string;
  name: string;
  aum: string;
  schemes: number;
  asOfDate: string;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    sevenYear: number;
    tenYear: number;
  };
}

interface TopPerformingSchemeListProps {
  data?: AMCData[];
}

const TopPerformingSchemeList: React.FC<TopPerformingSchemeListProps> = ({
  data = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const mockData: AMCData[] = [
    {
      id: "1",
      name: "SBI Mutual Fund",
      aum: "11,99,811 Cr (30 Jun 2025)",
      schemes: 124,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 12.8,
        threeYear: 14.2,
        fiveYear: 11.5,
        sevenYear: 13.1,
        tenYear: 12.9
      }
    },
    {
      id: "2",
      name: "ICICI Prudential Mutual Fund",
      aum: "10,28,285 Cr (30 Jun 2025)",
      schemes: 141,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 15.3,
        threeYear: 16.1,
        fiveYear: 13.4,
        sevenYear: 14.7,
        tenYear: 13.8
      }
    },
    {
      id: "3",
      name: "HDFC Mutual Fund",
      aum: "8,71,370 Cr (30 Jun 2025)",
      schemes: 105,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 13.7,
        threeYear: 15.8,
        fiveYear: 12.9,
        sevenYear: 14.2,
        tenYear: 13.5
      }
    },
    {
      id: "4",
      name: "Nippon India Mutual Fund",
      aum: "6,50,378 Cr (30 Jun 2025)",
      schemes: 111,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 14.6,
        threeYear: 13.9,
        fiveYear: 11.8,
        sevenYear: 12.4,
        tenYear: 12.1
      }
    },
    {
      id: "5",
      name: "Kotak Mahindra Mutual Fund",
      aum: "5,50,188 Cr (30 Jun 2025)",
      schemes: 102,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 16.2,
        threeYear: 17.1,
        fiveYear: -14.3,
        sevenYear: 15.6,
        tenYear: 14.8
      }
    },
    {
      id: "6",
      name: "Aditya Birla Sun Life Mutual Fund",
      aum: "4,14,315 Cr (30 Jun 2025)",
      schemes: 109,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 11.9,
        threeYear: 13.7,
        fiveYear: 10.8,
        sevenYear: 12.3,
        tenYear: 11.7
      }
    },
    {
      id: "7",
      name: "UTI Mutual Fund",
      aum: "3,85,920 Cr (30 Jun 2025)",
      schemes: 98,
      asOfDate: "30 Jun 2025",
      returns: {
        oneYear: 13.4,
        threeYear: 14.6,
        fiveYear: 12.2,
        sevenYear: 13.8,
        tenYear: 13.1
      }
    }
  ];

  const schemes = data.length > 0 ? data : mockData;

  const filteredSchemes = schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReturnColor = (returnValue: number) => {
    if (returnValue >= 0) return "text-green-600";
    return "text-red-600";
  };

  const onBack = () => {
    router.back();
  }
  const SectionDivider = () => <hr className="border-accent" />;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={onBack} className="p-1 cursor-pointer">
              <IoArrowBack className="w-5 h-5 text-gray-600" />
            </div>
            <CustomText className="text-lg font-semibold text-gray-900">
              Top Performing Schemes
            </CustomText>
          </div>
          {/* <div className="p-2 cursor-pointer">
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </div> */}
        </div>
      </div>

      {/* Search Bar */}
      <div className=" py-3 border-b border-gray-200">
        <div className="relative w-full px-4 mb-4">
          {/* <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> */}
          <CustomInput
            icon={<IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
            type="text"
            placeholder="Search For Top Performing Schemes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          // className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        {/* </div> */}

        {/* Schemes List */}
        {/* <div className=""> */}
        {filteredSchemes.map((scheme) => (
          <>
            {/* // <div key={scheme.id} className="bg-white rounded-lg my-3 p-4 shadow-sm"> */}
            <div className="hover:bg-gray-50 cursor-pointer">
              <div key={scheme.id} className="px-4">
                {/* Scheme Header */}
                <div className="flex justify-between items-center">
                  <div className="my-3">
                    <CustomText className="text-base font-semibold text-secondary-content mb-1">
                      {scheme.name}
                    </CustomText>
                    <CustomText className="text-sm mb-1">
                      AUM: {scheme.aum}
                    </CustomText>
                    <CustomText className="text-sm">
                      Schemes: {scheme.schemes}
                    </CustomText>
                  </div>

                  {/* Returns Grid */}
                  <div className="grid grid-cols-5 gap-5">
                    <div className="text-center">
                      <CustomText className="text-xs mb-1">1Y</CustomText>
                      <CustomText className={`text-sm font-semibold ${getReturnColor(scheme.returns.oneYear)}`}>
                        {scheme.returns.oneYear.toFixed(1)}%
                      </CustomText>
                    </div>
                    <div className="text-center">
                      <CustomText className="text-xs mb-1">3Y</CustomText>
                      <CustomText className={`text-sm font-semibold ${getReturnColor(scheme.returns.threeYear)}`}>
                        {scheme.returns.threeYear.toFixed(1)}%
                      </CustomText>
                    </div>
                    <div className="text-center">
                      <CustomText className="text-xs mb-1">5Y</CustomText>
                      <CustomText className={`text-sm font-semibold ${getReturnColor(scheme.returns.fiveYear)}`}>
                        {scheme.returns.fiveYear.toFixed(1)}%
                      </CustomText>
                    </div>
                    <div className="text-center">
                      <CustomText className="text-xs mb-1">7Y</CustomText>
                      <CustomText className={`text-sm font-semibold ${getReturnColor(scheme.returns.sevenYear)}`}>
                        {scheme.returns.sevenYear.toFixed(1)}%
                      </CustomText>
                    </div>
                    <div className="text-center">
                      <CustomText className="text-xs mb-1">10Y</CustomText>
                      <CustomText className={`text-sm font-semibold ${getReturnColor(scheme.returns.tenYear)}`}>
                        {scheme.returns.tenYear.toFixed(1)}%
                      </CustomText>
                    </div>
                  </div>
                </div>
              </div>
              <SectionDivider />
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default TopPerformingSchemeList;