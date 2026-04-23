"use client";

import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { schemeColors } from "@/utils/constants";
import {
  convertManagerDate,
  convertManagerName,
  handleServerError,
} from "@/utils/helpers";
import React, { useEffect, useState } from "react";

function FundManager({ schemeData }: any) {
  const [fundManagereData, setFundManagereData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeData) getFundManagerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeData]);

  const getFundManagerData = async () => {
    setLoading(true);
    try {
      const passBody: any = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN,
      };

      const res: any = await api.post(`/scheme/get-fundmanager-data`, passBody);
      if (res.data.data) setFundManagereData(res.data.data);
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatExperience = (exp: any) => {
    if (exp === "NULL" || exp === null || exp === undefined) return "--";
    const n = Number(exp);
    if (!isFinite(n) || n === 0) return "--";
    return `${n} year${n === 1 ? "" : "s"}`;
  };

  return (
    <div className="p-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <div className="mb-5">
          <CustomText className="text-lg font-semibold text-base-content">
            Fund Managers
          </CustomText>
          <div className="text-xs text-base-content/50 mt-1">
            People managing this scheme
          </div>
        </div>

        {loading && (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          </div>
        )}

        {!loading && fundManagereData.length === 0 && (
          <div className="py-12 text-center text-sm text-base-content/50">
            No fund manager information available.
          </div>
        )}

        {!loading && fundManagereData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fundManagereData.map((item: any, index: number) => {
              const palette = schemeColors[index % schemeColors.length];
              const name = item?.FundManagersMaster?.manager_name || "--";
              return (
                <div
                  key={item?.scheme_manager_id ?? index}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-5 flex items-center gap-4"
                >
                  <div
                    className={`w-14 h-14 shrink-0 ${palette.bg} ${palette.text} font-semibold text-lg rounded-full flex items-center justify-center`}
                  >
                    <span>{convertManagerName(name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <CustomText className="text-sm font-semibold text-base-content truncate">
                      {name}
                    </CustomText>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-base-content/60">
                      <span>
                        Experience:{" "}
                        <span className="text-base-content/80">
                          {formatExperience(item?.FundManagersMaster?.manager_exp)}
                        </span>
                      </span>
                      <span>
                        Since:{" "}
                        <span className="text-base-content/80">
                          {convertManagerDate(item?.manager_startdate, true) || "--"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FundManager;
