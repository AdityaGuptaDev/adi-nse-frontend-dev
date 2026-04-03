import { formatNumber, toFixedData, toFixedDataForReturn } from "@/utils/constants";
import React from "react";
import ReactECharts from "echarts-for-react";


interface SummaryData {
  category: string;
  type: string;
  // percentage: number;
  // isNegative?: boolean;
}

// const SummaryData: SummaryData[] = [
//   { category: "Domestic Equities", type: 'EQUITY', percentage: 100 },
//   { category: "Cash & Cash Equivalents and Net Assets", type: 'CASH', percentage: 9.2 },
//   { category: "Corporate Debt", type: 'DEBT', percentage: 6.9 },
//   { category: "Government Securities", type: 'Securities', percentage: 5.9 },
//   { category: "Treasury Bills", type: 'Bills', percentage: 4.1 },
//   { category: "REITs & InvITs", type: 'InvITs', percentage: 3.9 },
//   { category: "Certificate of Deposit", type: 'Deposit', percentage: 2.7 },
//   { category: "PTC & Securitized Debt", type: 'PTC', percentage: 1.6 },
//   { category: "Commercial Paper", type: 'Commercial', percentage: 0.4 },
//   { category: "Rights", type: 'Rights', percentage: 0.1 },
//   { category: "Derivatives-Put Options", type: 'Derivatives-Put', percentage: 0.1 },
//   {
//     category: "Derivatives-Call Options", type: 'Derivatives-Call',
//     percentage: -100,
//     isNegative: true,
//   },
// ];

const SummaryData: SummaryData[] = [
  { category: "Domestic Equities", type: 'EQUITY' },
  { category: "Cash & Cash Equivalents and Net Assets", type: 'CASH' },
  { category: "Corporate Debt", type: 'DEBT' },
  { category: "Government Securities", type: 'Securities' },
  { category: "Treasury Bills", type: 'Bills' },
  { category: "REITs & InvITs", type: 'InvITs' },
  { category: "Certificate of Deposit", type: 'Deposit' },
  { category: "PTC & Securitized Debt", type: 'PTC' },
  { category: "Commercial Paper", type: 'Commercial' },
  { category: "Rights", type: 'Rights' },
  { category: "Derivatives-Put Options", type: 'Derivatives-Put' },
  {
    category: "Derivatives-Call Options", type: 'Derivatives-Call'
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
  const widthPercentage = (absValue / maxValue) * 50;

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

  // return (
  //   <div
  //     className={`flex items-center w-full h-4 ${direction === "left" ? "justify-end" : "justify-start"
  //       }`}
  //   >
  //     <div
  //       className={`h-2 rounded-none transition-all duration-300 ${isPositive ? "bg-green-600" : "bg-red-600"
  //         }`}
  //       style={{ width: `${widthPercentage}%` }}
  //     />
  //   </div>
  // );
};

const Summary = ({ summaryData }: any) => {
  // const maxPercentage = Math.max(
  //   ...SummaryData.map((item) => Math.abs(item.percentage))
  // );

  console.log(summaryData, "summaryData")

  return (
    <div className="bg-white rounded-lg ">
      <div className="space-y-2 ">
        {SummaryData.map((item, index) => {
          const value = summaryData[item.type] || 0;
          console.log(typeof Number(value),"valuevaluevalue")
          const summaryValue: any = formatNumber(Number(value));

          return (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 items-center py-3 ${index !== SummaryData.length - 1 ? "border-b border-accent" : ""
                }`}
            >
              {/* Category Name */}
              <div className="col-span-4 text-sm text-gray-700 font-medium pr-2">
                {item.category}
              </div>

              {/* Negative Bar Column (for negative values) */}
              <div className="col-span-3 h-4 flex items-center justify-end ">
                {summaryValue < 0 && (
                  <PerformanceBar
                    value={summaryValue}
                    maxValue={100}
                    isPositive={false}
                    direction="left"
                  />
                )}
              </div>

              {/* Positive Bar Column (for positive values) */}
              <div className="col-span-4 h-4 flex items-center justify-start border-l border-base-content pl-2">
                {summaryValue >= 0 && (
                  <PerformanceBar
                    value={summaryValue}
                    maxValue={100}
                    isPositive={true}
                    direction="right"
                  />
                )}
              </div>

              {/* Percentage */}
              <div className="col-span-1 text-right">
                <span
                  className={`text-sm font-semibold ${summaryValue >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {/* {summaryValue >= 0 ? "+" : ""} */}
                  {summaryValue}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Section */}
      {/* <div className="mt-4 pt-4 border-t border-gray-200 px-4 pb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">
            Total Portfolio Allocation
          </span>
          <span className="font-semibold text-gray-900">
            {SummaryData.reduce(
              (sum, item) => sum + item.percentage,
              0
            ).toFixed(1)}
            %
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default Summary;
