import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface ChartData {
  value: number;
  name: string;
  percentage: string;
  color: string;
  backgroundColor?: string;
}

const DebtPieChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const data: ChartData[] = [
    {
      value: 1158,
      name: "Debt",
      percentage: "99.79%",
      color: "#4ade80",
    },
    {
      value: 10,
      name: "Other",
      percentage: "0.21%",
      color: "#FED4E7",
      backgroundColor: "#ffffff",
    },
  ];

  useEffect(() => {
    if (chartRef.current) {
      // Initialize chart
      chartInstanceRef.current = echarts.init(chartRef.current);

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "transparent",
          textStyle: {
            color: "#fff",
          },
        },
        series: [
          {
            name: "Distribution",
            type: "pie",
            radius: ["0%", "90%"],
            center: ["50%", "50%"],
            data: data.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.color,
              },
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 3,
                shadowOffsetX: 0,
                shadowColor: "#ffffff",
              },
            },
            labelLine: {
              show: false,
            },
            label: {
              show: false,
            },
          },
        ],
      };

      chartInstanceRef.current.setOption(option);

      // Handle resize
      const handleResize = () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
        }
      };
    }
  }, []);

  return (
    // <div className="flex  items-center justify-center min-h-screen bg-slate-50 ">
    <div className=" w-1/3  relative ">
      {/* Chart Container */}
      <div ref={chartRef} className="h-66 " />

      {/* Custom Legend */}
      <div className="absolute top-32  -left-30 ">
        {data.map((item, idx) => (
          <>
            <div
              key={item.name}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <div
                className="w-3 h-3 rounded-full "
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium ">
                {item.name}: {item.value.toLocaleString()}
              </span>
              <span>({item.percentage})</span>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default DebtPieChart;
