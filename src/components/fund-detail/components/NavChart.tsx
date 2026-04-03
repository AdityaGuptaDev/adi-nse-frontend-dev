"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import { dateFormat, dateFormateValue, handleServerError } from "@/utils/helpers";
import api from "@/utils/api";
import { toFixedData, toFixedDataForReturn } from "@/utils/constants";

function NAVChart({ schemeData }: any) {
  const chartRef = useRef<any>(null);
  const [range, setRange] = useState<any>("oneMonth");

  let [graphData, setGraphData] = useState<any>([]);

  // let getMonthDate = addYears(new Date(), 1);        ////////   1 year by default
  let getMonthDate = addMonths(new Date(), 1);        ////////    1 Month by default

  let fromDate = dateFormat(getMonthDate)
  let toDate = dateFormat(new Date())
  let date = new Date(fromDate);
  let date1 = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // let [formattedDate, setFromDate] = useState<any>(date1);
  let [minDate, setMinDate] = useState<any>();
  let [maxDate, setMaxDate] = useState<any>();
  let [currentNav, setCurrentNav] = useState<any>();

  let [filter, setFilter] = useState<any>({
    id: schemeData?.id,
    scheme_type: schemeData?.scheme_type,
    name: schemeData?.name,
    ms_fullname: schemeData?.ms_fullname,
    fromDate: fromDate,
    toDate: toDate,
  });

  let indate = new Date(schemeData?.inception_date);

  const calculateSmartYAxis = (minValue: number, maxValue: number) => {
      const range = maxValue - minValue;
      
      // If range is very small (flat line), add padding
      if (range < (minValue * 0.01)) { // Less than 1% movement
          const padding = minValue * 0.01; // 1% padding
          return {
              min: minValue - padding,
              max: maxValue + padding
          };
      }
      
      // Otherwise use 5% padding
      const padding = range * 0.05;
      return {
          min: minValue - padding,
          max: maxValue + padding
      };
  };

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
      range === 'oneMonth' ?
        {
          type: "time",  // Change from "category" to "time"
          boundaryGap: false,
          min: minDate ? minDate : filter.fromDate,
          max: maxDate ? maxDate : filter.toDate,
          hideOverlap: true,
          minInterval: 24 * 60 * 60 * 1000, // 1 day interval for one month view
          axisLabel: {
            formatter: "{dd}-{MMM}",
            rotate: 0,
          },
          splitLine: {
            show: false
          }
        } : {
          type: "time",
          boundaryGap: false,
          min: minDate ? minDate : filter.fromDate,
          max: maxDate ? maxDate : filter.toDate,
          hideOverlap: true,
          minInterval: 1,
          maxInterval: `${range == 'threeMonth' ? 30 * 24 * 60 * 60 * 1000 : range == 'sixMonth' || range == 'oneYear' ? 24 * 3600 * 1000 * 28 : range == 'threeYear' || range == 'fiveYear' || range == 'tenYear' || range == 'sinceInception' ? 'year' : ''}`,
          // maxInterval: 24 * 3600 * 1000 * 28,
          axisLabel: {
            // formatter: `${range == 'oneYear' || range == 'threeYear' || range == 'fiveYear' || range == 'tenYear' ? "{MMM}-{yyyy}" : "{dd}-{MMM}"} `,
            formatter: `${range == 'threeMonth' ? "{dd}-{MMM}" : "{MMM} {yyyy}"}`,
            rotate: 0,
          },
          splitLine: {
            show: false
          }
        },
    ],
    yAxis: {
        type: "value",
        boundaryGap: [0, '100%'],
        ...(graphData?.getMinValue && graphData?.getMaxValue ? 
            calculateSmartYAxis(graphData.getMinValue, graphData.getMaxValue) : 
            { min: 'dataMin', max: 'dataMax' }
        ),
        splitLine: {
            show: true,
            lineStyle: {
                color: "rgba(255, 255, 255, 0.05)"
            }
        }
    },
    series: [],
    media: [
      {
        query: {
          maxWidth: 768
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
        name: "NAV",
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
      { name: "1M", activeTab: "oneMonth" },
      { name: "3M", activeTab: "threeMonth" },
      { name: "6M", activeTab: "sixMonth" },
      { name: "1Y", activeTab: "oneYear" },
      { name: "3Y", activeTab: "threeYear" },
      { name: "5Y", activeTab: "fiveYear" },
      { name: "10Y", activeTab: "tenYear" },
      { name: "Since Inception", activeTab: "sinceInception" },
    );

    return milestones;
  };

  function addYears(date: any, years: any) {
    date.setFullYear(date.getFullYear() - years);
    return date;
  }

  function addMonths(date: any, months: any) {
    date.setMonth(date.getMonth() - months);
    return date;
  }

  const onChangePeriod = (value: any) => {
    setRange(value)

    if (value == 'oneMonth') {
      let getMonthDate = addMonths(new Date(), 1);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
      // let date = new Date(fromDate);
      // let date1 = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      // setFromDate(date1)
    }
    if (value == 'threeMonth') {
      let getMonthDate = addMonths(new Date(), 3);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
    }
    if (value == 'sixMonth') {
      let getMonthDate = addMonths(new Date(), 6);
      let fromDate = dateFormat(getMonthDate)
      let toDate = dateFormat(new Date())
      setFilter({ 'fromDate': fromDate, 'toDate': toDate, 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
    }

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

    if (value == 'sinceInception') {
      setFilter({ 'tab': 'sinceInception', 'id': schemeData?.id, 'scheme_type': schemeData?.scheme_type, 'schemeName': schemeData?.ms_fullname })
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


  function generateWeekLabels(startDateStr: string, endDateStr: string) {
    const labels = [];
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    let current = new Date(startDate);
    let week = 1;

    while (current <= endDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Ensure the weekEnd doesn't go beyond endDate
      if (weekEnd > endDate) {
        weekEnd.setTime(endDate.getTime());
      }

      const format = (date: Date) =>
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

      labels.push(`Week ${week} (${format(weekStart)} - ${format(weekEnd)})`);

      // Move to next week
      current.setDate(current.getDate() + 7);
      week++;
    }

    return labels;
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
        setCurrentNav(res.data.data.nav);
      }
    } catch (error: any) {
      handleServerError(error)
    }
  };


  return (
    <div className="w-full p-4 rounded">
      <div className="ml-10  text-[#1E4841]">
        <div className="flex gap-3 items-center">
          <div className="text-2xl font-medium">{toFixedData(currentNav)}</div>
        </div>
        <div className="text-sm mt-2">Current NAV</div>
      </div>
      <div className="w-full h-[400px]">
        <ReactECharts ref={chartRef} option={optionNAVGrowth} />
      </div>
      <div className="tabs flex flex-wrap gap-3 mt-4">
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
      </div>
    </div>
  )
}

export default NAVChart;
