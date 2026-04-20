"use client";

import React, { useState } from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { FaAngleRight } from "react-icons/fa6";
import { IoTriangle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/commonUI/FullPageLoader";
import { convertToCrores, toFixedDataForReturn } from "@/utils/constants";


const TopFundManagers = ({ data }: any) => {

  const router = useRouter();

  const [navegateLoader, setNavigateLoader] = useState(false);

  const fundManagers = data.length > 0 ? data : [];
  // const fundManagers = mockData;

  const onChangeViewAll = () => {
    setNavigateLoader(true);
    router.push(`/top-fund-manager-list`)
    setNavigateLoader(false);
  }

  const onChangeFundManager = async (manager: any) => {
    setNavigateLoader(true);
    await router.push(`/fund-manager-detail?id=${manager.manager_id}`);
    setNavigateLoader(false);
  }

  return (
    <>
      <FullPageLoader
        isVisible={navegateLoader}
        message="Processing..."
      />
      <div className="bg-[#111111]">
        <div className="flex items-center justify-between mb-4">
          <CustomText className="text-lg font-montserrat font-semibold text-[#F9FAFB]">
            Top Fund Managers
          </CustomText>
          {/* <CustomButton
          className="btn-link btn-sm text-blue-600 hover:bg-blue-50 p-0 h-auto min-h-0"
        >
          View All →
        </CustomButton> */}
          <CustomButton
            className="p-0 h-auto min-h-0 !text-secondary-content !bg-[#111111]"
            onClick={() => onChangeViewAll()}
          >
            View All <span><FaAngleRight /></span>
          </CustomButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fundManagers.length > 0 ? (
            fundManagers?.slice(0, 3)?.map((manager: any, index: any) => (
              <div
                key={index}
                className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => onChangeFundManager(manager)}
              >
                {/* Manager Info */}
                <div className=" mb-3">
                  <CustomText className="font-semibold text-[#F9FAFB] text-base mb-1">
                    {manager?.manager_name}
                  </CustomText>
                  {/* {manager.experience && (
                <CustomText className="text-xs text-[#9CA3AF]">
                  {manager.experience} years experience
                </CustomText>
              )} */}
                </div>

                {/* AUM Managed */}
                <div className=" mb-3">
                  <CustomText className="text-xs text-[#9CA3AF] mb-1">
                    AUM Managed
                  </CustomText>
                  <CustomText className="text-sm font-bold text-[#F9FAFB]">
                    {convertToCrores(manager.total_AUM)} Cr.
                  </CustomText>
                </div>

                {/* Top Performing Scheme */}
                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <CustomText className="text-xs text-[#9CA3AF] mb-2">
                      Top Performing Scheme
                    </CustomText>
                    <CustomText className="text-xs text-[#9CA3AF]">
                      3y Return %
                    </CustomText>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs">{manager?.topScheme?.SchemeMaster?.name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <CustomText className="text-sm font-medium text-[#F9FAFB] leading-tight">
                          {manager?.topScheme?.SchemeMaster?.name}
                        </CustomText>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <IoTriangle className="text-green-600 w-3 h-3" />
                      <CustomText className="text-sm font-bold text-green-600">
                        {toFixedDataForReturn(manager?.topScheme?.SchemeMaster?.SchemePerformances[0]?.Returns3yr)}
                      </CustomText>
                    </div>
                    {/* <div className="flex items-center justify-between">
                  <CustomText className="text-sm font-bold text-blue-600">
                    {formatReturn(manager.topPerformingScheme.returns.threeYear)}
                  </CustomText>
                </div> */}
                  </div>
                </div>
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
    </>
  );
};

export default TopFundManagers;
