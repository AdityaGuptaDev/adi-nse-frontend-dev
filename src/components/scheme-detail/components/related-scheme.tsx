import api from "@/utils/api";
import { TIMEPERIODS, toFixedData } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";

interface FundData {
  name: string;
  nav: number;
  return: string;
}

interface TimePeriod {
  label: string;
  value: string;
}

const RelatedScheme = ({ schemeData }: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState("1D");
  const [relatedSchemeData, setRelatedSchemeData] = useState<any>([]);


  const timePeriods: TimePeriod[] = [
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "6M", value: "6M" },
    { label: "1Y", value: "1Y" },
    { label: "3Y", value: "3Y" },
    { label: "5Y", value: "5Y" },
  ];

  const fundData: FundData[] = [
    {
      name: "ICICI Pru Balanced Advantage Fund(M-IDCW Payout)-Direct Plan",
      nav: 28.06,
      return: "22.09%",
    },
    {
      name: "ICICI Pru Balanced Advantage Fund(M-IDCW)-Direct Plan",
      nav: 18.19,
      return: "21.09%",
    },
    {
      name: "ICICI Pru Balanced Advantage Fund(IDCW-Payout)-Direct Plan",
      nav: 72.67,
      return: "14.09%",
    },
    {
      name: "ICICI Pru Balanced Advantage Fund(IDCW-Payout)",
      nav: 17.92,
      return: "20.5%",
    },
  ];

  useEffect(() => {
    getRelatedSchemeData();
  }, []);

  const getRelatedSchemeData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        optionId: schemeData?.option_id,
        amcId: schemeData?.amc_id
      }

      let res: any = await api.post(`/scheme/get-related-scheme-data`, passBody);

      if (res.data.data) {
        setRelatedSchemeData(res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 ">
      <div className="max-w-8xl mx-auto bg-base-100 rounded-lg shadow">
        {/* Time Period Filter */}
        <div className="px-4 sm:px-6 py-4 border-b border-base-300">
          <div className="flex flex-wrap gap-2">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`tab text-white rounded-md px-2.5 sm:px-3 sm:py-2 text-xs font-semibold  ${selectedPeriod === period.value
                  ? "tab-active bg-primary hover:text-white text-white"
                  : "bg-placeholder !text-white"
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-4 bg-base-200 border-b border-base-300">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <h3 className="text-sm font-semibold text-base-content">
                Scheme Name
              </h3>
            </div>
            <div className="col-span-2 text-center">
              <h3 className="text-sm font-semibold text-base-content">NAV</h3>
            </div>
            <div className="col-span-2 text-right">
              <h3 className="text-sm font-semibold text-base-content">
                Return %
              </h3>
            </div>
          </div>
        </div>

        {/* Fund Data Rows */}
        <div className="divide-y divide-accent">
          {relatedSchemeData.length > 0 && relatedSchemeData.map((item: any, index: any) => {

            const formattedValue: any = selectedPeriod === TIMEPERIODS.OneDay ? toFixedData(item?.SchemePerformances[0]?.Return1d) :
              selectedPeriod === TIMEPERIODS.OneWeek ? toFixedData(item?.SchemePerformances[0]?.Return1w) :
                selectedPeriod === TIMEPERIODS.OneMonth ? toFixedData(item?.SchemePerformances[0]?.Return1mth) :
                  selectedPeriod === TIMEPERIODS.ThreeMonth ? toFixedData(item?.SchemePerformances[0]?.Return3mth) :
                    selectedPeriod === TIMEPERIODS.SixMonth ? toFixedData(item?.SchemePerformances[0]?.Return6mth) :
                      selectedPeriod === TIMEPERIODS.OneYear ? toFixedData(item?.SchemePerformances[0]?.Return1yr) :
                        selectedPeriod === TIMEPERIODS.ThreeYear ? toFixedData(item?.SchemePerformances[0]?.Returns3yr) :
                          selectedPeriod === TIMEPERIODS.FiveYear ? toFixedData(item?.SchemePerformances[0]?.Returns5yr)
                            : "-";

            const textColor = formattedValue >= 0 ? "text-green-600" : "text-red-600";

            return (
              <div key={index} className="px-6 py-4  transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8">
                    <p className="text-sm text-black font-medium leading-relaxed">
                      {item.ms_fullname}
                    </p>
                  </div>
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-black ">{toFixedData(item?.SchemePerformances[0]?.Nav)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className={`text-sm font-semibold  ${textColor}`}>
                      {formattedValue}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default RelatedScheme;
