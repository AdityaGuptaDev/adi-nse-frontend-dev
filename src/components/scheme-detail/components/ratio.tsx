"use client";

import api from "@/utils/api";
import { toFixedDataForReturn } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";


const Ratio = ({ schemeData }: any) => {
  const ratios: any[] = [
    { name: "Standard Deviation", value: 0.0426, hasTooltip: true },
    { name: "Beta", value: 0.2637, hasTooltip: true },
    { name: "Alpha", value: 0.4395, hasTooltip: true },
    { name: "Sharpe Ratio", value: 1.3456, hasTooltip: true },
    { name: "Sortino Ratio", value: 1.2312, hasTooltip: true },
    { name: "Treynor Ratio", value: 0.5987, hasTooltip: true },
  ];

  const [ratioData, setRatioData] = useState<any>();

  useEffect(() => {
    getPerformanceSchemeData();
  }, []);

  const getPerformanceSchemeData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN,
      }

      let res: any = await api.post(`/scheme/get-ratio-scheme-data`, passBody);

      if (res.data.data) {
        setRatioData(res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }


  return (
    <div className=" p-6">
      <div className="max-w-9xl mx-auto bg-[#111111] rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-field-border">
          <h1 className="text-sm font-semibold blackbase-content">Ratio</h1>
          <h2 className="text-sm   font-semibold blackbase-content">Scheme ( Return 3Y% )</h2>
        </div>

        {/* Ratios List */}
        <div className="divide-y divide-field-border">
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Standard Deviation
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.StandardDeviation3Yr)}
            </span>
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Beta
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.Beta3Yr)}
            </span>
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Alpha
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.Alpha3Yr)}
            </span>
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Sharpe Ratio
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.SharpeRatio3Yr)}
            </span>
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Sortino Ratio
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.SortinoRatio3Yr)}
            </span>
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center hover:bg-[#1F1A1A] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base-content text-sm font-medium">
                Treynor Ratio
              </span>
              <div
                className="tooltip tooltip-right"
                data-tip="Additional information about this ratio"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <span className="text-black text-sm">
              {toFixedDataForReturn(ratioData?.Treynor3Yr)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratio;
