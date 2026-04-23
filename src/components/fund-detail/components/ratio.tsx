"use client";

import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { toFixedDataForReturn } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";

function Ratio({ schemeData }: any) {
  const [ratioData, setRatioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeData?.id) getRatioSchemeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeData?.id]);

  const getRatioSchemeData = async () => {
    setLoading(true);
    try {
      const passBody: any = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN,
      };

      const res: any = await api.post(`/scheme/get-ratio-scheme-data`, passBody);
      if (res.data.data) setRatioData(res.data.data);
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const ratios = [
    {
      label: "Expense Ratio",
      value: schemeData?.net_expense_ratio,
      subtitle: "Annual",
      hint: "Ongoing annual fee charged by the AMC.",
    },
    {
      label: "Tracking Error",
      value: ratioData?.TrackingError3Yr,
      subtitle: "3-Year annualized",
      hint: "How closely the fund tracks its benchmark. Lower is better for index funds.",
    },
    {
      label: "Beta",
      value: ratioData?.Beta3Yr,
      subtitle: "vs Benchmark",
      hint: "Volatility relative to benchmark. >1 means more volatile.",
    },
    {
      label: "Sharpe Ratio",
      value: ratioData?.SharpeRatio3Yr,
      subtitle: "3-Year",
      hint: "Risk-adjusted return. Higher is better.",
    },
    {
      label: "Alpha",
      value: ratioData?.Alpha3Yr,
      subtitle: "3-Year",
      hint: "Excess return over benchmark after risk adjustment.",
    },
    {
      label: "Standard Deviation",
      value: ratioData?.StandardDeviation3Yr,
      subtitle: "3-Year",
      hint: "Volatility of returns. Lower is less risky.",
    },
  ];

  return (
    <div className="p-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <div className="mb-5">
          <CustomText className="text-lg font-semibold text-base-content">
            Key Ratios
          </CustomText>
          <div className="text-xs text-base-content/50 mt-1">
            Risk and return metrics for this scheme
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratios.map((r) => (
              <div
                key={r.label}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <CustomText className="text-sm font-semibold text-base-content">
                    {r.label}
                  </CustomText>
                  <span
                    className="text-[10px] text-base-content/40 cursor-help"
                    title={r.hint}
                  >
                    ⓘ
                  </span>
                </div>
                <div className="text-2xl font-semibold text-base-content tabular-nums mt-2">
                  {r.value !== undefined && r.value !== null && isFinite(Number(r.value))
                    ? toFixedDataForReturn(Number(r.value))
                    : "--"}
                </div>
                <div className="text-xs text-base-content/50 mt-1">{r.subtitle}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ratio;
