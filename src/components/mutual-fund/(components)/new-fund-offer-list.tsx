"use client";

import React, { Fragment, useEffect, useState } from "react";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import CustomText from "@/commonUI/Text";
import CustomInput from "@/commonUI/Input";
import { useRouter } from "next/navigation";
import { convertDate, convertNumberIndian, FUND_STATUS_COLOR, handleServerError } from "@/utils/helpers";
import api from "@/utils/api";
import { toFixedData } from "@/utils/constants";


function NewFundOfferList() {

  const [searchTerm, setSearchTerm] = useState("");
  const [newFundOfferList, setNewFundOfferList] = useState<any>([]);

  const router = useRouter();

  useEffect(() => {
    getNewFundOfferList();
  }, [searchTerm]);

  const getNewFundOfferList = async () => {
    try {
      let res: any = await api.get(`/mutual-fund/get-new-fund-offer-list`, { params: { search: searchTerm } });
      if (res.data.data) {

        const names = res.data.data?.SchemeBenchmarksMappings?.map((item: any) => item.SchemeBenchmarksMaster?.benchmark_name)
          .filter(Boolean) // remove null/undefined
          .join(" / ");

        res.data.data = { ...res.data.data, allBenchmarkName: names };
        
        setNewFundOfferList(res.data.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  }


  const onBack = () => {
    router.back();
  }
  const SectionDivider = () => <hr className="border-accent" />;

  const handleNavigateFundDetail = (item: any) => {
    // setNavigateLoader(true);
    router.push(
      `/fund-detail?id=${item?.id}&tab=NAV`
    );
    // setNavigateLoader(false);
  };


  return (
    <div className="">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={onBack} className="p-1 cursor-pointer">
              <IoArrowBack className="w-5 h-5 text-gray-600" />
            </div>
            <CustomText className="text-lg font-semibold text-gray-900">
              NFO
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
        {newFundOfferList.length > 0 ? (
          newFundOfferList.map((scheme: any, index: number) => (
            <Fragment key={index}>
              {/* // <div key={scheme.id} className="bg-white rounded-lg my-3 p-4 shadow-sm"> */}
              <div className="hover:bg-gray-50 cursor-pointer" onClick={() =>
                handleNavigateFundDetail(scheme)
              }>
                <div className="px-4">
                  {/* Scheme Header */}
                  <div className="flex justify-between items-center">
                    <div className="my-3">
                      <CustomText className="text-base font-semibold text-secondary-content mb-1">
                        {scheme.name}
                      </CustomText>
                      <CustomText className="text-sm mb-1">
                        Open Period: {convertDate(scheme.nfo_start_date, scheme.nfo_end_date)}
                      </CustomText>
                      <div className="flex gap-4 items-center">
                        <CustomText className="text-sm">
                          Min Investment: {convertNumberIndian(500)} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
                        </CustomText>
                        <CustomText className="text-sm">
                          NAV: {scheme?.SchemePerformances[0]?.Nav ? toFixedData(scheme?.SchemePerformances[0]?.Nav) : "-"}
                        </CustomText>
                      </div>

                      {/* <CustomText className="text-sm">
                      Min Investment: {convertNumberIndian(scheme.minInvestment)} | NAV: {convertNumberIndian(scheme.nav)}
                    </CustomText> */}

                      <div className="mt-2">
                        <CustomText className="font-semibold text-secondary-content text-base line-clamp-2">
                          <span className={`badge ${FUND_STATUS_COLOR(scheme?.fundStatus)}`}>{scheme.fundStatus}</span>
                        </CustomText>
                      </div>
                    </div>


                    {/* Returns Grid */}
                    <div className="grid grid-cols-5 gap-5">
                      <div className="text-center">
                        <CustomText className="text-xs mb-1">Category</CustomText>
                        <CustomText className={`text-sm font-semibold`}>
                          {scheme?.SchemeCategory?.Name}
                        </CustomText>
                      </div>
                      <div className="text-center">
                        <CustomText className="text-xs mb-1">Risk</CustomText>
                        <CustomText className={`text-sm font-semibold text-red-400`}>
                          {scheme.riskLevel}
                        </CustomText>
                      </div>
                      <div className="text-center">
                        <CustomText className="text-xs mb-1">Exit Load</CustomText>
                        <CustomText className={`text-sm font-semibold`}>
                          {scheme.exit_load}
                        </CustomText>
                      </div>
                      <div className="text-center">
                        <CustomText className="text-xs mb-1">Exp Ratio</CustomText>
                        <CustomText className={`text-sm font-semibold`}>
                          {toFixedData(scheme.net_expense_ratio)}%
                        </CustomText>
                      </div>
                      <div className="text-center">
                        <CustomText className="text-xs mb-1">Benchmark</CustomText>
                        <CustomText className={`text-sm font-semibold`}>
                          {scheme.allBenchmarkName ? scheme?.allBenchmarkName : "--"}
                        </CustomText>
                      </div>
                    </div>
                  </div>
                </div>
                <SectionDivider />
              </div>
            </Fragment>
          ))) : (
          <div className="px-4 py-6 text-center">
            <CustomText className="text-lg font-medium text-gray-900">
              No Data Found
            </CustomText>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewFundOfferList;