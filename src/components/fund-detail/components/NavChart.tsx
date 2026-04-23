"use client";

import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import { dateFormat, convertOnlyEndDate, handleServerError } from "@/utils/helpers";
import api from "@/utils/api";
import { toFixedData } from "@/utils/constants";

type GraphPoint = [string, number];

type GraphData = {
  schemeArray?: GraphPoint[];
  minFromDate?: string;
  maxToDate?: string;
  nav?: number;
  getMinValue?: number;
  getMaxValue?: number;
};

const PERIODS = [
  { name: "1M", activeTab: "oneMonth" },
  { name: "3M", activeTab: "threeMonth" },
  { name: "6M", activeTab: "sixMonth" },
  { name: "1Y", activeTab: "oneYear" },
  { name: "3Y", activeTab: "threeYear" },
  { name: "5Y", activeTab: "fiveYear" },
  { name: "10Y", activeTab: "tenYear" },
  { name: "Since Inception", activeTab: "sinceInception" },
];

function subtractMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function subtractYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function rangeToFilter(range: string, schemeId: any, schemeType: any, schemeName: any) {
  const today = new Date();
  const base: any = {
    id: schemeId,
    scheme_type: schemeType,
    schemeName,
    ms_fullname: schemeName,
  };

  if (range === "sinceInception") {
    return { ...base, tab: "sinceInception" };
  }

  const map: Record<string, Date> = {
    oneMonth: subtractMonths(today, 1),
    threeMonth: subtractMonths(today, 3),
    sixMonth: subtractMonths(today, 6),
    oneYear: subtractYears(today, 1),
    threeYear: subtractYears(today, 3),
    fiveYear: subtractYears(today, 5),
    tenYear: subtractYears(today, 10),
  };

  const from = map[range] ?? subtractMonths(today, 1);
  return {
    ...base,
    fromDate: dateFormat(from),
    toDate: dateFormat(today),
  };
}

function NAVChart({ schemeData }: any) {
  const chartRef = useRef<any>(null);
  const [range, setRange] = useState<string>("oneMonth");
  const [graphData, setGraphData] = useState<GraphData>({});
  const [currentNav, setCurrentNav] = useState<number | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const schemeId = schemeData?.id;
  const schemeType = schemeData?.scheme_type;
  const schemeName = schemeData?.ms_fullname;

  useEffect(() => {
    if (!schemeId) return;
    fetchGraph(rangeToFilter(range, schemeId, schemeType, schemeName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId, range]);

  const fetchGraph = async (filter: any) => {
    setLoading(true);
    try {
      const res: any = await api.post(`/scheme/get-scheme-nav-graph-detail`, filter);
      const data: GraphData = res?.data?.data ?? {};
      setGraphData(data);
      if (data?.nav !== undefined) setCurrentNav(data.nav);
    } catch (error) {
      handleServerError(error);
      setGraphData({});
    } finally {
      setLoading(false);
    }
  };

  const points = graphData?.schemeArray ?? [];
  const hasData = points.length > 0;

  // Derive period change from first/last point in the series.
  const { changeAbs, changePct, asOfDate } = useMemo(() => {
    if (!hasData) return { changeAbs: null as number | null, changePct: null as number | null, asOfDate: null as string | null };
    const first = Number(points[0]?.[1]);
    const last = Number(points[points.length - 1]?.[1]);
    const abs = last - first;
    const pct = first ? (abs / first) * 100 : 0;
    return {
      changeAbs: abs,
      changePct: pct,
      asOfDate: points[points.length - 1]?.[0] ?? null,
    };
  }, [points, hasData]);

  const changeColor =
    changeAbs === null ? "text-base-content/70" : changeAbs >= 0 ? "text-emerald-400" : "text-red-400";
  const changeSign = changeAbs === null ? "" : changeAbs >= 0 ? "+" : "";

  const calculateSmartYAxis = (minValue: number, maxValue: number) => {
    const spread = maxValue - minValue;
    if (spread < minValue * 0.01) {
      const padding = minValue * 0.01;
      return { min: minValue - padding, max: maxValue + padding };
    }
    const padding = spread * 0.05;
    return { min: minValue - padding, max: maxValue + padding };
  };

  const chartOption = useMemo(() => {
    const xAxisBase = {
      type: "time" as const,
      boundaryGap: false,
      min: graphData?.minFromDate,
      max: graphData?.maxToDate,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
      axisLabel: {
        color: "rgba(255,255,255,0.65)",
        hideOverlap: true,
        formatter:
          range === "oneMonth" || range === "threeMonth"
            ? "{dd}-{MMM}"
            : "{MMM} {yyyy}",
      },
      splitLine: { show: false },
    };

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(17,17,17,0.95)",
        borderColor: "rgba(245,158,11,0.4)",
        textStyle: { color: "#fff" },
        formatter: (params: any) => {
          const p = params?.[0];
          if (!p) return "";
          const d = new Date(p.axisValueLabel);
          const formattedDate = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const value = p?.data ? Number(p.data[1]).toFixed(4) : "--";
          return `<div style="font-size:12px;opacity:0.7">${formattedDate}</div>
                  <div style="font-size:16px;font-weight:600;margin-top:2px">
                    NAV ₹${value}
                  </div>`;
        },
        axisPointer: {
          type: "cross",
          label: { backgroundColor: "#F59E0B" },
          lineStyle: { color: "rgba(245,158,11,0.4)" },
        },
      },
      legend: { show: false },
      animationDuration: 600,
      grid: { left: 60, right: 30, top: 30, bottom: 60 },
      dataZoom: [
        {
          type: "slider",
          height: 20,
          bottom: 10,
          borderColor: "rgba(255,255,255,0.1)",
          backgroundColor: "rgba(255,255,255,0.03)",
          fillerColor: "rgba(245,158,11,0.15)",
          handleStyle: { color: "#F59E0B" },
          textStyle: { color: "rgba(255,255,255,0.5)" },
        },
      ],
      xAxis: [xAxisBase],
      yAxis: {
        type: "value" as const,
        scale: true,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
        axisLabel: {
          color: "rgba(255,255,255,0.65)",
          formatter: (v: number) => v.toFixed(2),
        },
        ...(graphData?.getMinValue && graphData?.getMaxValue
          ? calculateSmartYAxis(graphData.getMinValue, graphData.getMaxValue)
          : { min: "dataMin", max: "dataMax" }),
        splitLine: { show: true, lineStyle: { color: "rgba(255,255,255,0.06)" } },
      },
      series: [
        {
          name: "NAV",
          type: "line",
          showSymbol: false,
          smooth: true,
          data: points,
          lineStyle: { width: 2, color: "#F59E0B" },
          itemStyle: { color: "#F59E0B" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(245,158,11,0.35)" },
              { offset: 1, color: "rgba(245,158,11,0.02)" },
            ]),
          },
        },
      ],
    };
  }, [points, graphData?.minFromDate, graphData?.maxToDate, graphData?.getMinValue, graphData?.getMaxValue, range]);

  const stats = [
    {
      label: "Category",
      value:
        schemeData?.SchemeCategory?.Name ||
        schemeData?.SchemeSubcategory?.Name ||
        "--",
    },
    { label: "Benchmark", value: schemeData?.allBenchmarkName || "--" },
    { label: "AMC", value: schemeData?.AMCMaster?.Name || "--" },
    {
      label: "Expense Ratio",
      value:
        schemeData?.net_expense_ratio !== undefined &&
        schemeData?.net_expense_ratio !== null
          ? `${toFixedData(schemeData.net_expense_ratio)}%`
          : "--",
    },
    {
      label: "Launch Date",
      value: schemeData?.inception_date
        ? convertOnlyEndDate(schemeData.inception_date)
        : "--",
    },
    {
      label: "Rating",
      value: schemeData?.SchemePerformances?.[0]?.OverallRating
        ? `${schemeData.SchemePerformances[0].OverallRating} ★`
        : "--",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* ===== Summary header ===== */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-base-content/60 mb-2">
              Current NAV
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-semibold text-base-content">
                ₹{toFixedData(currentNav as number)}
              </span>
              {changeAbs !== null && (
                <span className={`text-sm font-medium ${changeColor}`}>
                  {changeSign}
                  {changeAbs.toFixed(2)} ({changeSign}
                  {changePct?.toFixed(2)}%)
                  <span className="text-base-content/50 ml-1">
                    · {PERIODS.find((p) => p.activeTab === range)?.name}
                  </span>
                </span>
              )}
            </div>
            {asOfDate && (
              <div className="text-xs text-base-content/50 mt-2">
                As of{" "}
                {new Date(asOfDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>

          {schemeData?.scheme_type && (
            <span className="badge badge-outline text-primary border-primary/40">
              {schemeData.scheme_type}
            </span>
          )}
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 border-t border-white/5">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[11px] uppercase tracking-wider text-base-content/50">
                {s.label}
              </div>
              <div
                className="text-sm font-medium text-base-content mt-1 truncate"
                title={String(s.value)}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Chart card ===== */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
          <div className="text-sm font-medium text-base-content/80">NAV Trend</div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <Fragment key={item.activeTab}>
                <button
                  onClick={() => setRange(item.activeTab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    range === item.activeTab
                      ? "bg-primary text-white"
                      : "bg-white/5 text-base-content/70 hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </button>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="w-full h-[420px] mt-3 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#111111]/40 backdrop-blur-sm rounded-xl">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
            </div>
          )}

          {!loading && !hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="text-base-content/40 text-sm">
                No NAV history available for this period.
              </div>
              <div className="text-base-content/30 text-xs mt-1">
                Try a longer timeframe or check back later.
              </div>
            </div>
          )}

          <ReactECharts
            ref={chartRef}
            option={chartOption}
            style={{
              height: "100%",
              width: "100%",
              visibility: hasData ? "visible" : "hidden",
            }}
            notMerge
          />
        </div>
      </div>
    </div>
  );
}

export default NAVChart;
