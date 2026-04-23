"use client";

import api from "@/utils/api";
import { toFixedData } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";

const RelatedScheme = ({ schemeData }: any) => {
  const [relatedSchemeData, setRelatedSchemeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schemeData?.id) getRelatedSchemeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeData?.id]);

  const getRelatedSchemeData = async () => {
    setLoading(true);
    try {
      const passBody: any = {
        schemeId: schemeData?.id,
        optionId: schemeData?.option_id,
        amcId: schemeData?.amc_id,
        categoryid: schemeData?.categoryid,
        subcategory_id: schemeData?.subcategory_id,
      };

      const res: any = await api.post(`/scheme/get-mutual-related-scheme-data`, passBody);
      if (res.data.data) {
        setRelatedSchemeData(res.data.data);
      }
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const returnColor = (val: any) => {
    const n = Number(val);
    if (!isFinite(n) || val === null || val === undefined) return "text-base-content/50";
    return n >= 0 ? "text-emerald-400" : "text-red-400";
  };

  const formatReturn = (val: any) => {
    if (val === null || val === undefined) return "--";
    const n = Number(val);
    if (!isFinite(n)) return "--";
    const prefix = n >= 0 ? "+" : "";
    return `${prefix}${n.toFixed(2)}%`;
  };

  return (
    <div className="p-4">
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-base-content">Related Schemes</div>
            <div className="text-xs text-base-content/50 mt-0.5">
              Other schemes in the same category
            </div>
          </div>
          {!loading && (
            <span className="text-xs text-base-content/50">
              {relatedSchemeData.length}{" "}
              {relatedSchemeData.length === 1 ? "scheme" : "schemes"}
            </span>
          )}
        </div>

        {/* Column headers — desktop only */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/[0.02] text-[11px] uppercase tracking-wider text-base-content/60">
          <div className="col-span-5">Scheme Name</div>
          <div className="col-span-2 text-right">NAV</div>
          <div className="col-span-2 text-right">1M</div>
          <div className="col-span-1 text-right">3M</div>
          <div className="col-span-2 text-right">1Y</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          </div>
        )}

        {/* Empty */}
        {!loading && relatedSchemeData.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-sm text-base-content/50">
              No related schemes found.
            </div>
          </div>
        )}

        {/* Rows */}
        {!loading && relatedSchemeData.length > 0 && (
          <div className="divide-y divide-white/5">
            {relatedSchemeData.map((item: any, index: number) => {
              const perf = item?.SchemePerformances?.[0] ?? {};
              const nav = perf?.Nav;
              const r1m = perf?.Return1mth;
              const r3m = perf?.Return3mth;
              const r1y = perf?.Return1yr;

              return (
                <div
                  key={item?.id ?? index}
                  className="px-6 py-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="md:col-span-5">
                    <div className="text-sm font-medium text-base-content leading-snug">
                      {item?.ms_fullname || item?.name || "--"}
                    </div>
                    {item?.AMCMaster?.Name && (
                      <div className="text-xs text-base-content/50 mt-1 truncate">
                        {item.AMCMaster.Name}
                      </div>
                    )}
                  </div>

                  {/* Mobile-stacked stats */}
                  <div className="mt-3 grid grid-cols-4 gap-2 md:hidden text-center">
                    <Stat
                      label="NAV"
                      value={
                        nav !== undefined && nav !== null ? `₹${toFixedData(nav)}` : "--"
                      }
                    />
                    <Stat label="1M" value={formatReturn(r1m)} color={returnColor(r1m)} />
                    <Stat label="3M" value={formatReturn(r3m)} color={returnColor(r3m)} />
                    <Stat label="1Y" value={formatReturn(r1y)} color={returnColor(r1y)} />
                  </div>

                  {/* Desktop cells */}
                  <div className="hidden md:block md:col-span-2 text-right text-sm text-base-content tabular-nums">
                    {nav !== undefined && nav !== null ? `₹${toFixedData(nav)}` : "--"}
                  </div>
                  <div
                    className={`hidden md:block md:col-span-2 text-right text-sm font-medium tabular-nums ${returnColor(
                      r1m,
                    )}`}
                  >
                    {formatReturn(r1m)}
                  </div>
                  <div
                    className={`hidden md:block md:col-span-1 text-right text-sm font-medium tabular-nums ${returnColor(
                      r3m,
                    )}`}
                  >
                    {formatReturn(r3m)}
                  </div>
                  <div
                    className={`hidden md:block md:col-span-2 text-right text-sm font-medium tabular-nums ${returnColor(
                      r1y,
                    )}`}
                  >
                    {formatReturn(r1y)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-base-content/50">
        {label}
      </div>
      <div className={`text-xs font-medium mt-0.5 tabular-nums ${color ?? "text-base-content"}`}>
        {value}
      </div>
    </div>
  );
}

export default RelatedScheme;
