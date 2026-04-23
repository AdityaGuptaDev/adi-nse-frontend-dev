"use client";

import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useMemo, useState } from "react";

type PeriodKey = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "10Y";

const PERIODS: { label: PeriodKey; title: string; fundKey: string; avgKey: string }[] = [
  { label: "1D", title: "1 Day", fundKey: "Return1d", avgKey: "Return1d_AVG" },
  { label: "1W", title: "1 Week", fundKey: "Return1w", avgKey: "Return1w_AVG" },
  { label: "1M", title: "1 Month", fundKey: "Return1mth", avgKey: "Return1mth_AVG" },
  { label: "3M", title: "3 Months", fundKey: "Return3mth", avgKey: "Return3mth_AVG" },
  { label: "6M", title: "6 Months", fundKey: "Return6mth", avgKey: "Return6mth_AVG" },
  { label: "1Y", title: "1 Year", fundKey: "Return1yr", avgKey: "Return1yr_AVG" },
  { label: "3Y", title: "3 Years", fundKey: "Returns3yr", avgKey: "Returns3yr_AVG" },
  { label: "5Y", title: "5 Years", fundKey: "Returns5yr", avgKey: "Returns5yr_AVG" },
  { label: "10Y", title: "10 Years", fundKey: "Returns10yr", avgKey: "Returns10yr_AVG" },
];

function Performance({ schemeData }: any) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("1Y");
  const [performanceSchemeData, setPerformanceSchemeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeData?.id) getPerformanceSchemeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeData?.id]);

  const getPerformanceSchemeData = async () => {
    setLoading(true);
    try {
      const passBody: any = {
        schemeId: schemeData?.id,
        categoryId: schemeData?.SchemeCategory?.ID,
        subCategoryId: schemeData?.SchemeSubcategory?.Id,
      };

      const res: any = await api.post(`/scheme/get-performance-scheme-data`, passBody);
      if (res.data.data) setPerformanceSchemeData(res.data.data);
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const active = PERIODS.find((p) => p.label === selectedPeriod) ?? PERIODS[5];

  const { fundReturn, categoryAvg, alpha } = useMemo(() => {
    const fundRaw = schemeData?.SchemePerformances?.[0]?.[active.fundKey];
    const avgRaw = performanceSchemeData?.[0]?.[active.avgKey];

    const fund = fundRaw !== undefined && fundRaw !== null ? Number(fundRaw) : null;
    const avg = avgRaw !== undefined && avgRaw !== null ? Number(avgRaw) : null;
    const a = fund !== null && avg !== null ? fund - avg : null;

    return { fundReturn: fund, categoryAvg: avg, alpha: a };
  }, [schemeData, performanceSchemeData, active]);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <CustomText className="text-lg font-semibold text-base-content">
              Performance
            </CustomText>
            <div className="text-xs text-base-content/50 mt-1">
              Returns over {active.title.toLowerCase()} vs the category average
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedPeriod(p.label)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedPeriod === p.label
                    ? "bg-primary text-white"
                    : "bg-white/5 text-base-content/70 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PerfCard label="Fund Return" value={fundReturn} tone />
            <PerfCard label="Category Average" value={categoryAvg} />
            <PerfCard
              label="Alpha vs Category"
              value={alpha}
              tone
              hint={
                alpha !== null && alpha !== undefined && isFinite(alpha)
                  ? alpha >= 0
                    ? "Outperforming category"
                    : "Underperforming category"
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PerfCard({
  label,
  value,
  tone = false,
  hint,
}: {
  label: string;
  value: number | null;
  tone?: boolean;
  hint?: string;
}) {
  const isNum = value !== null && value !== undefined && isFinite(value);
  const display = isNum ? `${value! >= 0 ? "+" : ""}${value!.toFixed(2)}%` : "--";
  const color =
    !tone || !isNum
      ? "text-base-content"
      : value! >= 0
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-base-content/50">{label}</div>
      <div className={`text-3xl font-semibold mt-2 tabular-nums ${color}`}>{display}</div>
      {hint && <div className="text-xs text-base-content/50 mt-1">{hint}</div>}
    </div>
  );
}

export default Performance;
