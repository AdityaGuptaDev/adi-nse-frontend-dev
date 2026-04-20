"use client";

import React from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { convertNumberIndian, convertOnlyDate } from "@/utils/helpers";
import { convertToCrores, schemeColors } from "@/utils/constants";


const TopAMCs = ({ data }: any) => {

  const router = useRouter();

  const amcsData = data.length > 0 ? data : [];

  return (
    <div className="bg-[#111111]">
      <div className="flex items-center justify-between mb-4">
        <CustomText className="text-lg font-montserrat font-semibold text-[#F9FAFB]">
          Top AMCs
        </CustomText>
        <CustomButton
          className="p-0 h-auto min-h-0 !text-secondary-content !bg-[#111111]"
          onClick={() => router.push(`/top-amc-list`)}
        >
          View All <span><FaAngleRight /></span>
        </CustomButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {amcsData.length > 0 ? (
          amcsData.slice(0, 5).map((amc: any, index: number) => (
          <Link href={`/amc-scheme-detail?id=${amc.id}`} key={index}>
            <div
              key={index}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {/* AMC Icon/Logo */}
              <div className="flex items-center  mb-3">
                <div className={`w-8 h-8 ${schemeColors[index % schemeColors.length].bg} rounded-full flex items-center justify-center`}>
                  <span className={`${schemeColors[index % schemeColors.length].text} text-lg`}>{amc?.Name?.charAt(0)}</span>
                </div>
                {/* <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                  {amc.logo ? (
                    <img
                      src={amc.logo}
                      alt={amc.Name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-blue-600 text-lg">{getAMCIcon(amc.Name)}</span>
                  )}
                </div> */}
              </div>

              {/* AMC Name */}
              <div className=" mb-3">
                <CustomText className="font-semibold text-[#F9FAFB] text-sm leading-tight">
                  {amc?.Name}
                </CustomText>
              </div>

              {/* AUM */}
              <div className="flex justify-between items-center">
                <div className=" mb-2">
                  <CustomText className="text-xs text-[#9CA3AF]">
                    AUM
                  </CustomText>
                  <CustomText className="text-sm font-bold text-[#F9FAFB]">
                    {convertToCrores(amc?.total_AUM)} Cr.
                  </CustomText>
                </div>

                {/* Schemes Count */}
                <div className=" mb-3">
                  <CustomText className="text-xs text-[#9CA3AF] ">
                    Schemes
                  </CustomText>
                  <CustomText className="text-base font-bold text-[#F9FAFB]">
                    {amc?.total_schemes}
                  </CustomText>
                </div>
              </div>

              {/* As of Date */}
              <div>
                <CustomText className="text-xs text-[#6B7280]">
                  (as on {convertOnlyDate(amc?.AUMDate)})
                </CustomText>
              </div>
            </div>
          </Link>
        ))) : (
          <div className="col-span-5">
            <CustomText className="text-center text-[#9CA3AF]">
              No Data Found
            </CustomText>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopAMCs;
