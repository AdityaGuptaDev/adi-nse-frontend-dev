"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import { addMonths, dateFormat, dateFormateValue, handleServerError } from "@/utils/helpers";
import api from "@/utils/api";
import { toFixedData, toFixedDataForReturn } from "@/utils/constants";

const dataSets = {
  "1Y": {
    x: [
      "Jun 2024",
      "Jul 2024",
      "Aug 2024",
      "Sep 2024",
      "Oct 2024",
      "Nov 2024",
      "Dec 2024",
    ],
    y: [500, 850, 1300, 700, 1700, 1350, 1500],
  },
  "3Y": {
    x: ["2022", "2023", "2024"],
    y: [1200, 1800, 1500],
  },
  "5Y": {
    x: ["2020", "2021", "2022", "2023", "2024"],
    y: [900, 1100, 1300, 1600, 1500],
  },
  "10Y": {
    x: ["2015", "2017", "2019", "2021", "2023", "2025"],
    y: [500, 900, 1100, 1300, 1600, 1500],
  },
};

function NAVChart({ schemeData }: any) {
  const chartRef = useRef<any>(null);
  const [range, setRange] = useState("oneYear");
  // const [range, setRange] = useState("1Y");

  let [graphData, setGraphData] = useState<any>([]);

  let getMonthDate = addYears(new Date(), 1);
  let fromDate = dateFormat(getMonthDate)
  let toDate = dateFormat(new Date())
  let date = new Date(fromDate);
  let date1 = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // let [formattedDate, setFromDate] = useState<any>(date1);
  let [minDate, setMinDate] = useState<any>();
  let [maxDate, setMaxDate] = useState<any>();
  // let [filter, setFilter] = useState<any>({
  //   id: props?.searchParams?.id,
  //   scheme_type: props?.searchParams?.scheme_type,
  //   name: props?.searchParams?.name,
  //   ms_fullname: props?.searchParams?.ms_fullname,
  //   fromDate: fromDate, 
  //   toDate: toDate, 
  // });

  let [filter, setFilter] = useState<any>({
    id: schemeData?.id,
    scheme_type: schemeData?.scheme_type,
    name: schemeData?.name,
    ms_fullname: schemeData?.ms_fullname,
    fromDate: fromDate,
    toDate: toDate,
  });

  let indate = new Date(schemeData?.inception_date);


  const optionNAVGrowth = {
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        let date = new Date(params?.[0]?.axisValueLabel);
        var formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        var output = 'Date: ' + formattedDate + '<br/>';
        output += '<table width="100%">';
        let loop = 0;
        if (graphData?.schemeArray.length > 0) {
          loop = loop + 1
        }

        for (let i = 0; i < loop; i++) {
          const value: any = (params[i]?.data) ? parseFloat(params[i].data[1]).toFixed(2) : 'NaN';
          if (value !== 'NaN') {
            output += `<tr>
                <td>${params[i].marker}</td>
                <td>${params[i].seriesName}</td>
                <td class="text-end text-bold tabular-nums"><strong>${value}</strong></td>
              </tr>`;
          }
        }
        return output + '</table>';
      },
      confine: true,
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      textStyle: {
        color: "#0a5195"
      },
      data: ["Fund"],
    },
    Animation: true,
    animationDuration: 1000,
    grid: {
      left: "6%",
      right: "4%",
      //   bottom: "3%",
      //   containLabel: true,
    },
    dataZoom: [
      {
        type: 'slider',
        // start: 0,
        // end: 25
      },
    ],
    xAxis: [
      {
        type: "time",
        boundaryGap: false,
        min: minDate ? minDate : filter.fromDate,
        max: maxDate ? maxDate : filter.toDate,
        hideOverlap: true,
        minInterval: 1,
        maxInterval: `${range == 'oneYear' ? 24 * 3600 * 1000 * 28 : range == 'threeYear' || range == 'fiveYear' || range == 'tenYear' ? 'year' : ''}`,
        // maxInterval: 24 * 3600 * 1000 * 28,
        axisLabel: {
          // formatter: `${range == 'oneYear' || range == 'threeYear' || range == 'fiveYear' || range == 'tenYear' ? "{MMM}-{yyyy}" : "{dd}-{MMM}"} `,
          formatter: "{MMM} {yyyy}",
          rotate: 0,
        },
        splitLine: {
          show: false
        }
      },
    ],
    yAxis: [
      {
        type: "value",
        boundaryGap: [0, '100%'],
        // maxInterval: 50,
        // min: 10100,
        // max: 10200,
        // maxInterval: `${range == 'oneMonth' ? 100 : 50}`,
        min: (graphData?.getMinValue) ? getFloorRoundValue(Math.round(graphData?.getMinValue), 500) : 0,
        max: (graphData?.getMaxValue) ? getRoundValue(Math.round(graphData?.getMaxValue), 500) : 0,
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255, 255, 255, 0.05)"
          }
        }
      },
    ],
    series: [],
    // {
    //   name: "Fund",
    //   type: "line",
    //   showSymbol: false,
    //   smooth: true,
    //   // areaStyle: {
    //   //   opacity: 0,
    //   // },
    //   lineStyle: {
    //     width: 2
    //   },
    //   data: graphData?.schemeArray,
    //   // color: "#fe6bb9"
    //   color: "#0a5195",
    //   areaStyle: {
    //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    //       {
    //         offset: 0,
    //         color: '#F5862E80'
    //       },
    //       {
    //         offset: 1,
    //         color: '#F5862E00'
    //       }
    //     ])
    //   },
    // },
    // ],

    media: [
      {
        query: {
          maxWidth: 500
        },
        option: {
          legend: {
            top: '0%'
          },
          grid: {
            bottom: "35%",
            left: 50,
            //   containLabel: true,
          },
          yAxis: {
            axisLabel: {
              width: "100",
            },
          },
          xAxis: {
            axisLabel: { rotate: 45 }
          },
        }
      },
      {
        option: {
          legend: {
            top: '0%'
          }
        }
      }
    ],
  };




  useEffect(() => {
    let instance: any = chartRef.current.getEchartsInstance();
    const finalOption = {
      ...optionNAVGrowth,
      series: [{
        name: "Fund",
        type: "line",
        showSymbol: false,
        smooth: true,
        // areaStyle: {
        //   opacity: 0,
        // },
        lineStyle: {
          width: 2
        },
        data: graphData?.schemeArray,
        // color: "#fe6bb9"
        color: "#0a5195",
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#F5862E80'
            },
            {
              offset: 1,
              color: '#F5862E00'
            }
          ])
        },
      },]
    };

    instance.setOption(finalOption, true); // ✅ Safe full update
    // instance.setOption({
    //   series: {
    //     name: "Fund",
    //     type: "line",
    //     showSymbol: false,
    //     smooth: true,
    //     // areaStyle: {
    //     //   opacity: 0,
    //     // },
    //     lineStyle: {
    //       width: 2
    //     },
    //     data: graphData?.schemeArray,
    //     // color: "#fe6bb9"
    //     color: "#0a5195",
    //     areaStyle: {
    //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    //         {
    //           offset: 0,
    //           color: '#F5862E80'
    //         },
    //         {
    //           offset: 1,
    //           color: '#F5862E00'
    //         }
    //       ])
    //     },
    //   },
    // }, {
    //   replaceMerge: ['series']
    // })

  }, [graphData])



  useEffect(() => {
    if (schemeData) {
      getGraphData();
    }
  }, [filter, schemeData]);

  const showYears = () => {

    const today = new Date();

    let years = today.getFullYear() - indate.getFullYear();
    let months = today.getMonth() - indate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    const milestones = [];

    milestones.push(
      { name: "1Y", activeTab: "oneYear" },
      { name: "3Y", activeTab: "threeYear" },
      { name: "5Y", activeTab: "fiveYear" },
      { name: "10Y", activeTab: "tenYear" }
    );

    return milestones;
  };

  function addYears(date: any, years: any) {
    date.setFullYear(date.getFullYear() - years);
    return date;
  }

  const onChangePeriod = (value: any) => {
    setRange(value)
    if (value == 'oneYear') {
      let getMonthDate = addYears(new Date(), 1);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
      // let date = new Date(fromDate);
      // let date1 = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      // setFromDate(date1)
    }
    if (value == 'threeYear') {
      let getMonthDate = addYears(new Date(), 3);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
    }
    if (value == 'fiveYear') {
      let getMonthDate = addYears(new Date(), 5);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
    }
    if (value == 'tenYear') {
      let getMonthDate = addYears(new Date(), 10);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
    }
  }


  function getFloorRoundValue(value: any, roundTo: any) {
    var modValue = Math.round(value % roundTo);

    if (modValue == 0) {
      return value;
    }
    else {
      return (value - modValue);
    }
  }

  function getRoundValue(value: any, roundTo: any) {
    var modValue = Math.round(value % roundTo);

    if (modValue == 0) {
      return value;
    }
    else {
      var result = (value - modValue) + roundTo;

      return result;
    }
  }


  const getGraphData = async () => {
    try {
      filter.id = schemeData?.id
      filter.scheme_type = schemeData?.scheme_type
      filter.schemeFullName = schemeData?.ms_fullname
      filter.schemeName = schemeData?.name

      const res: any = await api.post(`/scheme/get-scheme-nav-graph-detail`, filter);

      if (res.data.data) {
        setMinDate(res.data.data.minFromDate);
        setMaxDate(res.data.data.maxToDate);
        setGraphData(res.data.data);
      }
    } catch (error: any) {
      handleServerError(error)
    }
  };


  return (
    <div className="w-full p-4 rounded">
      <div className="ml-10  text-[#1E4841]">
        <div className="flex gap-3 items-center">
          {/* <span className="text-md">NAV</span>{" "} */}
          <div className="text-2xl font-medium">{toFixedData(schemeData?.SchemePerformances[0]?.Nav)}</div>
          <div className="p-4 badge rounded-full bg-green-100 text-green-600 text-base">{toFixedDataForReturn(schemeData?.SchemePerformances[0]?.NavChangePercentage)}</div>
          <div className="text-base">{toFixedData(schemeData?.SchemePerformances[0]?.NavChange)}</div>
        </div>
        {/* <div className="text-sm mt-2">22 May 2025</div> */}
        <div className="text-sm mt-2">{dateFormateValue(schemeData?.SchemePerformances[0]?.NavDate)}</div>
      </div>
      {/* <div ref={chartRef} className="w-full h-[400px]" /> */}
      <div className="w-full h-[400px]">
        <ReactECharts ref={chartRef} option={optionNAVGrowth} />
      </div>
      <div className="flex gap-3 mt-4">
        {showYears().map((item: any, index: any) => {
          return (
            <Fragment key={index}>
              <button
                // key={index}
                onClick={() => onChangePeriod(item.activeTab)}
                className={`tab text-white py-2 rounded-xl font-semibold ${range === item.activeTab
                  ? "tab-active bg-primary hover:text-white text-white"
                  : "bg-placeholder !text-white"
                  }`}
              >
                {item.name}
              </button>
            </Fragment>
          )
        })}
        {/* {["1Y", "3Y", "5Y", "10Y"].map((label) => (
          <button
            key={label}
            onClick={() => setRange(label)}
            className={`tab text-white rounded-xl font-semibold ${range === label
                ? "tab-active bg-primary hover:text-white text-white"
                : "bg-placeholder !text-white"
              }`}
          >
            {label}
          </button>
        ))} */}
      </div>
    </div>
  )
}

export default NAVChart;
