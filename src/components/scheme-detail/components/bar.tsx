import React from "react";
import ReactECharts from "echarts-for-react";

const PerformanceBarChart = () => {
  const data = [
    { label: "1 Day", value: 0.4 },
    { label: "1 Week", value: -0.3 },
    { label: "1 Month", value: 1.4 },
    { label: "3 Month", value: 6.5 },
    { label: "6 Month", value: 5.4 },
    { label: "1 Year", value: 10.4 },
    { label: "2 Year", value: 15.4 },
    { label: "3 Year", value: 14.4 },
    { label: "5 Year", value: 17.4 },
  ];

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: any) {
        const val = params[0].value;
        return `${params[0].name}: <strong>${
          val > 0 ? "+" : ""
        }${val}%</strong>`;
      },
    },
    xAxis: {
      type: "value",
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: data.map((d) => d.label),
      inverse: true,
    },
    series: [
      {
        type: "bar",
        data: data.map((d) => ({
          value: d.value,
          itemStyle: {
            color: d.value >= 0 ? "#4ade80" : "#ef4444", // green for +, red for -
          },
        })),
        barWidth: "50%",
      },
    ],
    grid: {
      left: "25%",
      right: "10%",
      top: "5%",
      bottom: "5%",
    },
  };

  return (
    <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
  );
};

export default PerformanceBarChart;
