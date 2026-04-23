"use client";

import CustomText from "@/commonUI/Text";
import { toFixedData } from "@/utils/constants";
import { convertOnlyEndDate } from "@/utils/helpers";
import React from "react";

function Information({ schemeData }: any) {
  const fields = [
    {
      label: "Sub-Category",
      value: schemeData?.SchemeSubcategory?.Name,
    },
    {
      label: "Category",
      value: schemeData?.SchemeCategory?.Name,
    },
    {
      label: "AMC",
      value: schemeData?.AMCMaster?.Name,
    },
    {
      label: "Registrar",
      value: schemeData?.AMCMaster?.amc_registrar,
    },
    {
      label: "Benchmark",
      value: schemeData?.allBenchmarkName,
    },
    {
      label: "Launch Date",
      value: schemeData?.inception_date
        ? convertOnlyEndDate(schemeData.inception_date)
        : null,
    },
    {
      label: "Expense Ratio",
      value:
        schemeData?.net_expense_ratio !== undefined &&
        schemeData?.net_expense_ratio !== null
          ? `${toFixedData(schemeData.net_expense_ratio)}% p.a.`
          : null,
    },
    {
      label: "ISIN",
      value: schemeData?.schemeISIN,
    },
    {
      label: "Scheme Code",
      value: schemeData?.scheme_code ?? schemeData?.SchemeCode,
    },
    {
      label: "Plan Type",
      value: schemeData?.plan_type ?? schemeData?.PlanType,
    },
    {
      label: "Option",
      value: schemeData?.option_name ?? schemeData?.OptionName,
    },
    {
      label: "Minimum Investment",
      value: schemeData?.min_initial_investment
        ? `₹${Number(schemeData.min_initial_investment).toLocaleString("en-IN")}`
        : null,
    },
  ];

  return (
    <div className="p-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <CustomText className="text-lg font-semibold text-base-content">
          Key Parameters
        </CustomText>
        <div className="text-xs text-base-content/50 mt-1 mb-5">
          Everything on the scheme at a glance
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((f) => (
            <div
              key={f.label}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-4"
            >
              <div className="text-[11px] uppercase tracking-wider text-base-content/50">
                {f.label}
              </div>
              <div
                className="text-sm font-medium text-base-content mt-1.5 break-words"
                title={f.value ? String(f.value) : undefined}
              >
                {f.value ?? "--"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Information;
