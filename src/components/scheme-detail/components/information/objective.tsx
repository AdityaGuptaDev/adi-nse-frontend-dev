import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import React, { useState } from "react";
import ReactECharts from "echarts-for-react";

function Objective({ schemeData }: any) {
  const [totalPoints, setTotalPoints] = useState<any>(34);
  const [riskProfile, setRiskProfile] = useState<any>("");

  function getGaugeValue(riskLevel: string | undefined): number {
    switch (riskLevel) {
      case "Low Risk":
        return 0.1667;
      case "Moderate Low Risk": // If this is a valid label
        return 0.3333;
      case "Moderate Risk":
        return 0.5;
      case "Moderately High risk": // Be case-insensitive
        return 0.6667;
      case "High Risk":
        return 0.8333;
      case "Very High Risk":
        return 1;
      default:
        return 0; // fallback
    }
  }


  console.log(schemeData?.riskLevel, "schemeData?.riskLevelschemeData?.riskLevel")
  const AssetAllocationMF = {
    // series: [
    //   {
    //     type: "gauge",
    //     startAngle: 180,
    //     endAngle: 0,
    //     center: ["50%", "75%"],
    //     radius: "90%",
    //     min: 0,
    //     max: 1,
    //     splitNumber: 6,
    //     axisLine: {
    //       lineStyle: {
    //         width: 36,
    //         color: [
    //           // [0.1667, "#cc3a3b"],  // red    // Low Risk
    //           // [0.3333, "#f16b44"],  // reddish orange ///// Moderate Low
    //           // [0.5, "#efa647"],     // orange // Moderate
    //           // [0.6667, "#f5e655"],  // yellow   ////// Moderately High
    //           // [0.8333, "#90c34e"],  // light green /////  high
    //           // [1, "#3e884d"],       // green // very High

    //           [0.1667, "#3e884d"],  // green         ///  Low
    //           [0.3333, "#90c34e"],  // light green         //////   Low to Moderate
    //           [0.5, "#f5e655"],     // yellow         ///////  Moderate
    //           [0.6667, "#efa647"],  // orange           /////  Moderately High
    //           [0.8333, "#f16b44"],  // reddish orange      //////  High
    //           [1, "#cc3a3b"],       // red             ////  Very High
    //         ],
    //         shadowColor: "rgba(0, 0, 0, 0.5)",
    //         shadowBlur: 10,
    //       },
    //     },
    //     pointer: {
    //       length: "70%",
    //       width: 4,
    //       itemStyle: {
    //         color: "blue",
    //       },
    //     },
    //     // pointer: {
    //     //   icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
    //     //   length: "12%",
    //     //   width: 20,
    //     //   offsetCenter: [0, "-60%"],
    //     //   itemStyle: {
    //     //     color: "rgba(0, 0, 0, 1)",
    //     //   },
    //     // },
    //     axisTick: {
    //       length: 20,
    //       lineStyle: {
    //         color: "auto",
    //         width: 0,
    //       },
    //     },
    //     splitLine: {
    //       length: 20,
    //       lineStyle: {
    //         color: "auto",
    //         width: 0,
    //       },
    //     },
    //     axisLabel: {
    //       color: "#464646",
    //       fontSize: 10,
    //       distance: -60,
    //       width: 65,
    //       overflow: "break",
    //       rotate: "tangential",
    //       formatter: function (value: number) {
    //         return "";
    //       },
    //     },
    //     title: {
    //       offsetCenter: [0, "-10%"],
    //       fontSize: 14,
    //       color: "#aaa",
    //     },
    //     detail: {
    //       fontSize: 50,
    //       offsetCenter: [0, "-35%"],
    //       valueAnimation: true,
    //       // formatter: function (value: number) {
    //       //   return Math.round(value * 100) + "";
    //       // },
    //       color: "#000",
    //     },
    //     data: [
    //       {
    //         value: getGaugeValue(schemeData?.riskLevel),
    //         // value: 0.6667,
    //         // name: "Your Score",
    //         detail: {
    //           color: "rgba(0, 0, 0, 0)",
    //         },
    //       },
    //     ],
    //   },
    // ],
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: 1,
        splitNumber: 6,
        axisLine: {
          lineStyle: {
            width: 36,
            color: [
              [0.1667, "#3e884d"],  // green
              [0.3333, "#90c34e"],  // light green
              [0.5, "#f5e655"],     // yellow
              [0.6667, "#efa647"],  // orange
              [0.8333, "#f16b44"],  // reddish orange
              [1, "#cc3a3b"],       // red
            ],
            shadowColor: "rgba(0, 0, 0, 0.5)",
            shadowBlur: 10,
          },
        },
        pointer: {
          // icon: "path://M2,0 L-2,0 L0,1 Z",
          length: "90%",   // reach the full arc radius
          width: 4,
          offsetCenter: [0, "0%"], // always keep base in center
          itemStyle: {
            color: "blue",
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          show: false,
        },
        data: [
          {
            value: getGaugeValue(schemeData?.riskLevel),
          },
        ],
      },
    ],

  };
  return (
    <>
      <div className="mt-5">
        <h1 className="text-sm w-full  font-bold text-gray-950 underline ">
          Objective
        </h1>
        <span className="text-gray-950 text-xs">
          To provide capital appreciation and income distribution to the
          investors by using equity derivatives strategies, arbitrage
          opportunities and pure equity investments.
        </span>
      </div>
      <div>
        <h1 className="text-sm w-full  font-bold text-gray-950 underline mt-5">
          Scheme Risk
        </h1>
        <div className="mt-4 text-center">
          {/* <div className="flex justify-center">
            <CustomText className="text-xl font-bold flex items-center gap-2 bg-center">
              Your Risk is
              <span className="badge badge-primary  text-white">
                Moderate
                
              </span>
            </CustomText>
          </div> */}

          <div>
            <ReactECharts
              option={AssetAllocationMF}
              className={`riskchart`}
              opts={{ renderer: "svg" }}
            />
          </div>

          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <div className="flex gap-2 items-center">
              <div className={` h-5 w-5 rounded-md bg-[#3e884d]`}></div>
              <div>Low</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className={`h-5 w-5 rounded-md bg-[#90c34e]`}></div>
              <div>Moderately Low</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className={`h-5 w-5 rounded-md bg-[#f5e655]`}></div>
              <div>Moderate</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className={`h-5 w-5 rounded-md bg-[#efa647]`}></div>
              <div>Moderately High</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className={`h-5 w-5 rounded-md bg-[#f16b44]`}></div>
              <div>High</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className={`h-5 w-5 rounded-md bg-[#cc3a3b]`}></div>
              <div>Very High</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Objective;
