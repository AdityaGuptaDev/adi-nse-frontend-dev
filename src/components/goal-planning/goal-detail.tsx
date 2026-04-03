"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { NODE_API_URL, toFixedDataForReturn } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

function GoalDetail(props: any) {

  let router = useRouter();
  const [goalPlanData, setGoalPlanData] = useState<any>();
  const [schemeList, setSchemeList] = useState<any>([]);

  useEffect(() => {
    getGoalPlanDataById(props);
  }, [props]);

  const getGoalPlanDataById = async (props: any) => {
    try {
      let id = props?.searchParams.id;

      let res: any = await api.get(`/goal-plan/getGoalPlanData/${id}`);

      if (res.data.data) {
        setGoalPlanData(res.data.data.goal);
        setSchemeList(res.data.data.schemeList);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  return (
    <>
        <div className="pageTitle">
          <CustomText className="text-xl font-montserrat font-semibold mt-1">
            My Goal
          </CustomText>
        </div>

      <div className="p-4">
        <div className="flex min-h-[calc(100vh-300px)]">
          <div className="w-1/4 px-4">
            <div className="">
              <img
                src={`${NODE_API_URL}/static/goalplanning/${goalPlanData?.GoalType?.goal_icon}`}
                className="text-center items-center  w-48 h-32 ms-12"
              />
            </div>
            <div className="mt-3">
              <CustomText className="text-lg font-semibold font-montserrat">
                {goalPlanData?.goal_label}
              </CustomText>
            </div>
            <div className="flex gap-5  mt-2">
              <CustomText className="text-xs">
                Category: {goalPlanData?.GoalType?.goal_name}
              </CustomText>
              {goalPlanData?.sip_amt > 0 ? (
                <div className="badge bg-secondary-content/10 text-secondary-content text-xs">
                  SIP
                </div>
              ) : (
                <div className="badge bg-secondary-content/10 text-secondary-content text-xs -mt-1">
                  Lumpsum
                </div>
              )}
            </div>
            <div className="flex justify-between mt-5">
              <CustomText className="text-sm font-semibold">
                Your Goal Progress
              </CustomText>
              <CustomText className="text-sm font-semibold">
                Duration 6 Months
              </CustomText>
            </div>
            <div>
              <progress
                className="progress w-full progress-primary rounded-none bg-mainbackground"
                value={`10`}
                max="100"
              ></progress>
            </div>
            <div>
              <CustomText className="text-base font-semibold text-center mt-2">
                Target Amount ₹ &nbsp;{goalPlanData?.target_amt}
              </CustomText>
            </div>
            <div className="flex justify-between mt-5 text-sm">
              <CustomText>Recommended</CustomText>
              <CustomText>₹ {goalPlanData?.calc_amt}</CustomText>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <CustomText>Invested</CustomText>
              <CustomText>
                ₹ {goalPlanData?.totalAlloc?.Invested?.toFixed(2) || 0}
              </CustomText>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <CustomText>Current</CustomText>
              <CustomText>
                ₹ {goalPlanData?.totalAlloc?.Current?.toFixed(2) || 0}
              </CustomText>
            </div>
          </div>
          <div className="border-r border-accent h-auto mx-2" />
          <div className="w-3/4 px-2">
            <div>
              <CustomText className="font-montserrat text-lg font-semibold">
                Suggested Investments
              </CustomText>
            </div>
            <div className="mt-6 overflow-y-auto">
              {goalPlanData?.GoalPlanUserAllocs &&
              goalPlanData?.GoalPlanUserAllocs.length > 0 ? (
                <>
                  {goalPlanData?.GoalPlanUserAllocs?.map(
                    (data: any, index: number) => {
                      return (
                        <Fragment key={index}>
                          <div className="underline">
                            <CustomText className="font-semibold">
                              {data?.SchemeCategory?.Name} -{" "}
                              {data?.SchemeSubcategory?.Name}
                            </CustomText>
                          </div>
                          <div className="my-5 grid grid-cols-12 gap-1">
                            <div className="col-span-12 lg:col-span-3">
                              <CustomText className="text-xs">
                                Scheme
                              </CustomText>
                              <CustomText className="text-sm">
                                {data?.SchemeMaster?.ms_fullname}
                              </CustomText>
                            </div>
                            <div className="lg:col-span-2">
                              <CustomText className="text-xs text-start mb-1">
                                Folio
                              </CustomText>
                              <CustomText className="flex items-center gap-2 text-sm">
                                {data?.folio_no || "-"}
                              </CustomText>
                            </div>
                            <div className="lg:col-span-2">
                              <CustomText className="text-xs">
                                Invested Value
                              </CustomText>
                              <CustomText className="flex items-center gap-2 text-sm">
                                {data?.amount?.toFixed(2) || 0}
                              </CustomText>
                            </div>
                            <div className="lg:col-span-1">
                              <CustomText className="text-xs">Unit</CustomText>
                              <CustomText className="flex items-center gap-2 text-sm">
                                {data?.units || 0}
                              </CustomText>
                            </div>
                            <div className="lg:col-span-2">
                              <CustomText className="text-xs">
                                Current Value
                              </CustomText>
                              <CustomText className="flex items-center gap-2 mx-auto text-sm">
                                {isNaN(data?.units * data?.nav)
                                  ? 0
                                  : (data?.units * data?.nav)?.toFixed(2)}
                              </CustomText>
                            </div>
                            <div className="p-2 bg-accent-content -mt-2 rounded-md lg:col-span-2">
                              <CustomText className="text-xs">
                                Total Gain
                              </CustomText>
                              <CustomText className="text-sm">
                                &#8377;{" "}
                                {isNaN(data?.units * data?.nav - data?.amount)
                                  ? 0
                                  : (
                                      data?.units * data?.nav -
                                      data?.amount
                                    )?.toFixed(2)}
                              </CustomText>
                            </div>
                          </div>
                        </Fragment>
                      );
                    }
                  )}
                </>
              ) : (
                <div>No Data Found!</div>
              )}
            </div>
          </div>
        </div>
      </div>

       {/* Border line */}
       <div className="border-b border-accent"></div>

       <div className="mt-5 px-5">
        <CustomButton className="w-36 bg-white !text-black !border !border-gray-300 shadow-none" onClick={() => router.push(`/goal-planning`)}>Back</CustomButton>
       </div>
    </>
  );
}

export default GoalDetail;
