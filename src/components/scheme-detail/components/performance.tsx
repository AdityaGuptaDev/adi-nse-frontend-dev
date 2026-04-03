import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import api from "@/utils/api";
import { dateFormateValue, formatDates, handleServerError } from "@/utils/helpers";
import { TIMEPERIODS, toFixedData, toFixedDataForReturn } from "@/utils/constants";

interface PerformanceData {
  id: string;
  period: string;
  // fundName: string;
  // categoryName: string;
  // fundReturn: number;
  // categoryReturn: number;
  // isPositive: boolean;
}

// const performanceData: PerformanceData[] = [
//   {
//     id: '1D',
//     period: "1 Day",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: -0.4,
//     categoryReturn: 0.8,
//     isPositive: true,
//   },
//   {
//     id: '1W',
//     period: "1 Week",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: 0.3,
//     categoryReturn: 0.1,
//     isPositive: false,
//   },
//   {
//     id: '1M',
//     period: "1 Month",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: -100,
//     categoryReturn: 100,
//     isPositive: true,
//   },
//   {
//     id: '3M',
//     period: "3 Month",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: 6.5,
//     categoryReturn: 6.9,
//     isPositive: true,
//   },
//   {
//     id: '6M',
//     period: "6 Month",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: -5.4,
//     categoryReturn: 4.7,
//     isPositive: true,
//   },
//   {
//     id: '1Y',
//     period: "1 Year",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: -10.4,
//     categoryReturn: 8.7,
//     isPositive: true,
//   },
//   {
//     id: '2Y',
//     period: "2 Year",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: 15.4,
//     categoryReturn: 18.7,
//     isPositive: true,
//   },
//   {
//     id: '3Y',
//     period: "3 Year",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: -54.4,
//     categoryReturn: -16.7,
//     isPositive: true,
//   },
//   {
//     id: '5Y',
//     period: "5 Year",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: 17.4,
//     categoryReturn: 16.1,
//     isPositive: true,
//   },
//   {
//     id: '10Y',
//     period: "10 Year",
//     fundName: "ICICI Prudential Balanced Advantage Fund - Growth",
//     categoryName: "Hybrid Balanced Advantage",
//     fundReturn: 17.4,
//     categoryReturn: 16.1,
//     isPositive: true,
//   },
// ];


const performanceData: PerformanceData[] = [
  {
    id: '1D',
    period: "1 Day",
  },
  {
    id: '1W',
    period: "1 Week",
  },
  {
    id: '1M',
    period: "1 Month",
  },
  {
    id: '3M',
    period: "3 Month",
  },
  {
    id: '6M',
    period: "6 Month",
  },
  {
    id: '1Y',
    period: "1 Year",
  },
  {
    id: '2Y',
    period: "2 Year",
  },
  {
    id: '3Y',
    period: "3 Year",
  },
  {
    id: '5Y',
    period: "5 Year",
  },
  {
    id: '10Y',
    period: "10 Year",
  },
];


const PerformanceBar: React.FC<{
  value: number;
  maxValue: number;
  isPositive: boolean;
  direction: "left" | "right";
}> = ({ value, maxValue, isPositive, direction }) => {
  const color = isPositive ? "#10b981" : "#ef4444";
  const absValue = Math.abs(value);
  const widthPercentage = (absValue / maxValue) * 100;

  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: "value",
      show: false,
      min: 0,
      max: maxValue,
      inverse: direction === "left",
    },
    yAxis: {
      type: "category",
      data: [""],
      show: false,
    },
    series: [
      {
        type: "bar",
        data: [absValue],
        itemStyle: {
          color,
          borderRadius: direction === "left" ? [0, 1, 1, 0] : [0, 0, 0, 1],
        },
        barWidth: "50%",
        showBackground: false,
      },
    ],
    tooltip: { show: true, formatter: () => `${value}%`, },
  };

  return (
    <div
      className={`flex items-center w-full h-4 ${direction === "left" ? "justify-end" : "justify-start"
        }`}
    >
      <div className="w-42   h-full">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    </div>
  );
};

const Performance = ({ schemeData }: any) => {

  // const maxReturn = Math.max(
  //   ...performanceData.map((d) =>
  //     Math.max(Math.abs(d.fundReturn), Math.abs(d.categoryReturn))
  //   )
  // );

  const [performanceSchemeData, setPerformanceSchemeData] = useState<any>([]);

  useEffect(() => {
    getPerformanceSchemeData();
  }, []);

  const getPerformanceSchemeData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        categoryId: schemeData?.SchemeCategory?.ID,
        subCategoryId: schemeData?.SchemeSubcategory?.Id,
      }

      let res: any = await api.post(`/scheme/get-performance-scheme-data`, passBody);

      if (res.data.data) {
        setPerformanceSchemeData(res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="ml-4 sm:ml-8 pt-4 pb-6 text-[#1E4841]">
        <div className="flex items-center space-x-2">
          <span className="text-md">NAV</span>
          <span className="text-2xl font-bold">{toFixedData(schemeData?.SchemePerformances[0]?.Nav)}</span>
        </div>
        {/* <p className="text-sm mt-1">22 May 2025</p> */}
        <p className="text-sm mt-1">{dateFormateValue(schemeData?.SchemePerformances[0]?.NavDate)}</p>
      </div>

      <div className="bg-white rounded-lg   ">
        {performanceData.map((row, index) => {

          let catAVG: any = row.id === TIMEPERIODS.OneDay ? toFixedDataForReturn(performanceSchemeData[0]?.Return1d_AVG) :
            row.id === TIMEPERIODS.OneWeek ? toFixedDataForReturn(performanceSchemeData[0]?.Return1w_AVG) :
              row.id === TIMEPERIODS.OneMonth ? toFixedDataForReturn(performanceSchemeData[0]?.Return1mth_AVG) :
                row.id === TIMEPERIODS.ThreeMonth ? toFixedDataForReturn(performanceSchemeData[0]?.Return3mth_AVG) :
                  row.id === TIMEPERIODS.SixMonth ? toFixedDataForReturn(performanceSchemeData[0]?.Return6mth_AVG) :
                    row.id === TIMEPERIODS.OneYear ? toFixedDataForReturn(performanceSchemeData[0]?.Return1yr_AVG) :
                      row.id === TIMEPERIODS.TwoYear ? toFixedDataForReturn(performanceSchemeData[0]?.Returns2yr_AVG) :
                        row.id === TIMEPERIODS.ThreeYear ? toFixedDataForReturn(performanceSchemeData[0]?.Returns3yr_AVG) :
                          row.id === TIMEPERIODS.FiveYear ? toFixedDataForReturn(performanceSchemeData[0]?.Returns5yr_AVG) :
                            row.id === TIMEPERIODS.TenYear ? toFixedDataForReturn(performanceSchemeData[0]?.Returns10yr_AVG)
                              : "-";

          const catAVGValue = parseFloat(catAVG);

          let fundAVG: any = row.id === TIMEPERIODS.OneDay ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return1d) :
            row.id === TIMEPERIODS.OneWeek ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return1w) :
              row.id === TIMEPERIODS.OneMonth ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return1mth) :
                row.id === TIMEPERIODS.ThreeMonth ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return3mth) :
                  row.id === TIMEPERIODS.SixMonth ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return6mth) :
                    row.id === TIMEPERIODS.OneYear ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Return1yr) :
                      row.id === TIMEPERIODS.TwoYear ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Returns2yr) :
                        row.id === TIMEPERIODS.ThreeYear ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Returns3yr) :
                          row.id === TIMEPERIODS.FiveYear ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Returns5yr) :
                            row.id === TIMEPERIODS.TenYear ? toFixedDataForReturn(schemeData?.SchemePerformances[0]?.Returns10yr)
                              : "-";

          const fundAVGValue = parseFloat(fundAVG);

          const maxReturn = Math.max(
            ...performanceData.map(row => {
              const fund = row.id === TIMEPERIODS.OneDay ? schemeData?.SchemePerformances[0]?.Return1d :
                row.id === TIMEPERIODS.OneWeek ? schemeData?.SchemePerformances[0]?.Return1w :
                  row.id === TIMEPERIODS.OneMonth ? schemeData?.SchemePerformances[0]?.Return1mth :
                    row.id === TIMEPERIODS.ThreeMonth ? schemeData?.SchemePerformances[0]?.Return3mth :
                      row.id === TIMEPERIODS.SixMonth ? schemeData?.SchemePerformances[0]?.Return6mth :
                        row.id === TIMEPERIODS.OneYear ? schemeData?.SchemePerformances[0]?.Return1yr :
                          row.id === TIMEPERIODS.TwoYear ? schemeData?.SchemePerformances[0]?.Returns2yr :
                            row.id === TIMEPERIODS.ThreeYear ? schemeData?.SchemePerformances[0]?.Returns3yr :
                              row.id === TIMEPERIODS.FiveYear ? schemeData?.SchemePerformances[0]?.Returns5yr :
                                row.id === TIMEPERIODS.TenYear ? schemeData?.SchemePerformances[0]?.Returns10yr :
                                  0;

              const cat = row.id === TIMEPERIODS.OneDay ? performanceSchemeData[0]?.Return1d_AVG :
                row.id === TIMEPERIODS.OneWeek ? performanceSchemeData[0]?.Return1w_AVG :
                  row.id === TIMEPERIODS.OneMonth ? performanceSchemeData[0]?.Return1mth_AVG :
                    row.id === TIMEPERIODS.ThreeMonth ? performanceSchemeData[0]?.Return3mth_AVG :
                      row.id === TIMEPERIODS.SixMonth ? performanceSchemeData[0]?.Return6mth_AVG :
                        row.id === TIMEPERIODS.OneYear ? performanceSchemeData[0]?.Return1yr_AVG :
                          row.id === TIMEPERIODS.TwoYear ? performanceSchemeData[0]?.Returns2yr_AVG :
                            row.id === TIMEPERIODS.ThreeYear ? performanceSchemeData[0]?.Returns3yr_AVG :
                              row.id === TIMEPERIODS.FiveYear ? performanceSchemeData[0]?.Returns5yr_AVG :
                                row.id === TIMEPERIODS.TenYear ? performanceSchemeData[0]?.Returns10yr_AVG :
                                  0;

              return Math.max(Math.abs(fund || 0), Math.abs(cat || 0));
            })
          );

          return (
            <div
              key={index}
              className={`grid grid-cols-12 gap-0 justify-start items-center py-4 px-4 ${index !== performanceData.length - 1
                ? "border-b border-accent"
                : ""
                }`}
            >
              <div className="col-span-2 sm:col-span-1">
                <div className="flex justify-center items-center bg-mainbackground rounded-sm text-center min-w-10 h-14">
                  <span className="text-sm font-medium text-secondary">
                    {row.period}
                  </span>
                </div>
              </div>

              <div className="col-span-10 sm:col-span-4 pl-3 ">
                <div className="space-y-1">
                  <div className="text-sm text-base-content font-medium">
                    {schemeData.ms_fullname}
                  </div>
                  <div className="text-sm text-base-content">
                    {/* {row.categoryName} */}
                    {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
                  </div>
                </div>
              </div>

              <div className="col-span-5 sm:col-span-3 flex flex-col items-end space-y-2">
                <div className="h-5 border-r-1 pr-2 ">
                  {fundAVGValue < 0 && (
                    <PerformanceBar
                      value={fundAVGValue}
                      maxValue={100}
                      isPositive={false}
                      direction="left"
                    />
                  )}
                </div>
                <div className="h-5 pr-2 ">
                  {catAVGValue < 0 && (
                    <PerformanceBar
                      value={catAVGValue}
                      maxValue={100}
                      isPositive={false}
                      direction="left"
                    />
                  )}
                </div>
              </div>

              <div className="col-span-5 sm:col-span-3 flex flex-col items-start space-y-2">
                <div className="h-5 pl-2  ">
                  {fundAVGValue >= 0 && (
                    <PerformanceBar
                      value={fundAVGValue}
                      maxValue={100}
                      isPositive={true}
                      direction="right"
                    />
                  )}
                </div>
                <div className="h-5 border-l-1 pl-2 ">
                  {catAVGValue >= 0 && (
                    <PerformanceBar
                      value={catAVGValue}
                      maxValue={100}
                      isPositive={true}
                      direction="right"
                    />
                  )}
                </div>
              </div>

              <div className="col-span-1 text-right">
                <div className="space-y-2">
                  <div
                    className={`text-base font-medium ${fundAVGValue >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {/* {fundAVGValue > 0 ? "+" : ""} */}
                    {fundAVGValue}%
                  </div>
                  <div
                    className={`text-md font-medium ${catAVGValue >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {/* {catAVGValue >= 0 ? "+" : ""} */}
                    {/* {row.categoryReturn.toFixed(1)}% */}

                    {catAVGValue}%
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Performance;
