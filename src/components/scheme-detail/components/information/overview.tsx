import api from "@/utils/api";
import { toFixedData } from "@/utils/constants";
import { convertOnlyDate, handleServerError } from "@/utils/helpers";
import React, { useEffect, useState } from "react";

interface FundData {
  about: {
    schemeName: string;
    amcName: string;
    inceptionDate: string;
    aumMay2025: string;
    minInvestmentLumpsum: string;
    minInvestmentSip: string;
    expenseRatio: string;
    exitLoad: string;
    exitLoadDetails: string;
    riskRating: string;
    benchmark: string;
  };
  keyParameters: {
    marketCap: string;
    hybridBalancedAvg: string;
    minMaxRange: string;
    peRatio: string;
    hybridBalancedAvgPE: string;
    minMaxRangePE: string;
    pbRatio: string;
    hybridBalancedAvgPB: string;
    minMaxRangePB: string;
    dividendYield: string;
    hybridBalancedAvgDiv: string;
    minMaxRangeDiv: string;
    portfolioTurnover: string;
    hybridBalancedAvgTurnover: string;
    minMaxRangeTurnover: string;
  };
  type: {
    assetType: string;
    categorization: string;
    type: string;
    option: string;
    custodian: string;
    custodianSecond: string;
    registrar: string;
  };
}

const Overview = ({ schemeData }: any) => {
  //format inception date
  // --start--
  let date = new Date(schemeData?.inception_date);
  let inception_formatted_Date = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  ////////  AUMDate  formate date /////////
  let adate = schemeData?.SchemePerformances?.[0]?.AUMDate;
  let AUMDate = adate ? adate.split(" ") : null;
  let AUMformattedDate;
  if (AUMDate) {
    const formatted = new Date(AUMDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    AUMformattedDate = formatted;
  }

  const [PERatioData, setPERatioData] = useState<any>([]);
  const [PBRatioData, setPBRatioData] = useState<any>([]);
  const [annualReportTurnoveRatioData, setAnnualReportTurnoveRatioData] = useState<any>([]);

  const fundData: FundData = {
    about: {
      schemeName: "ICICI Prudential Balanced Advantage Fund - Growth",
      amcName: "ICICI Prudential Asset Management Company Limited",
      inceptionDate: "30 Dec 2006",
      aumMay2025: "₹65,227",
      minInvestmentLumpsum: "₹500",
      minInvestmentSip: "₹100",
      expenseRatio: "1.44%",
      exitLoad: "0%",
      exitLoadDetails:
        "Nil upto 30% of units and 1% for remaining units on or before 1Y, Nil after 1Y",
      riskRating: "High",
      benchmark: "CRISIL Hybrid 50+50 - Moderate Index",
    },
    keyParameters: {
      marketCap: "₹54,262.54",
      hybridBalancedAvg: "₹54,179.18",
      minMaxRange: "₹ 37,510.19 - 68,277.17",
      peRatio: "35.46",
      hybridBalancedAvgPE: "31.79",
      minMaxRangePE: "26.83 - 43.75",
      pbRatio: "7.54",
      hybridBalancedAvgPB: "6.00",
      minMaxRangePB: "4.42 - 9.88",
      dividendYield: "1.14",
      hybridBalancedAvgDiv: "4.42",
      minMaxRangeDiv: "0.93 - 9.66",
      portfolioTurnover: "0.34 times",
      hybridBalancedAvgTurnover: "1.40 times",
      minMaxRangeTurnover: "0.26 times - 6.32 times",
    },
    type: {
      assetType: "Hybrid",
      categorization: "Balanced Advantage",
      type: "Open ended scheme",
      option: "Growth",
      custodian: "HDFC Bank Limited",
      custodianSecond: "Citibank N.A",
      registrar: "Computer Age Management Services Limited",
    },
  };

  useEffect(() => {
    getKeyParametersData();
  }, []);


  const getKeyParametersData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        categoryId: schemeData?.SchemeCategory?.ID,
        subCategoryId: schemeData?.SchemeSubcategory?.Id,
      }

      let res: any = await api.post(`/scheme/get-scheme-keyparameter-data`, passBody);

      if (res.data.data) {
        setPERatioData(res.data.data.findPERatio);
        setPBRatioData(res.data.data.findPBRatio);
        setAnnualReportTurnoveRatioData(res.data.data.findAnnualReportTurnoveRatio);
      }

    } catch (error) {
      handleServerError(error);
    }
  }

  const InfoRow: React.FC<{
    label: string;
    value: string;
    isSubItem?: boolean;
  }> = ({ label, value, isSubItem = false }) => (
    <div
      className={`flex justify-between items-start py-2 ${isSubItem ? "pl-4 text-sm text-accent" : ""
        }`}
    >
      <span className="font-medium text-accent flex-1">{label}</span>
      <span className="text-accent text-right flex-1">{value}</span>
    </div>
  );

  const SectionDivider = () => <hr className="border-accent my-4" />;

  return (
    <div>
      {/* <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xs"> */}
      {/* Header */}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-28 p-2 sm:p-6 pt-2">
        {/* About Section */}
        <div className="space-y-1">
        <h1 className="text-base w-full font-bold base-content underline mb-6">
          About
        </h1>
          <div className="mb-4">
            <h3 className="text-xs  text-base-content  ">Scheme Name</h3>

            <p className="text-base-content text-sm leading-relaxed">
              {schemeData.ms_fullname}
            </p>
          </div>

          <SectionDivider />

          <div className="mb-4">
            <h3 className="text-xs text-base-content   ">AMC Name</h3>
            <p className="text-base-content text-sm leading-relaxed">
              {schemeData.AMCMaster.Name}
            </p>
          </div>

          <SectionDivider />

          <div className="flex flex-col items-start py-2">
            <span className="font-medium  text-xs text-base-content flex-1">
              Inception Date
            </span>
            <span className="base-content text-sm text-right flex-1">
              {inception_formatted_Date}
            </span>
          </div>

          <SectionDivider />

          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs  text-base-content flex-1">
              {/* AUM as on May 2025 */}
              AUM as on {AUMformattedDate}
            </span>
            <span className="base-content text-sm text-right flex-1">
              ₹{" "}
              {Math.round(
                schemeData?.SchemePerformances?.[0]?.AUM / 10000000
              ).toLocaleString()}{" "}
              Cr
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs  text-base-content flex-1">
              Min. Investment Lumpsum
            </span>
            <span className="base-content text-sm text-right flex-1">
              {fundData.about.minInvestmentLumpsum}
              {/* ₹ {(schemeDetails?.bse_lumpsum_params) ? Number(schemeDetails?.bse_lumpsum_params?.[0]?.minimum_purchase_amount).toLocaleString() : 0} */}
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium  text-xs  text-base-content flex-1">
              Min. Investment SIP
            </span>
            <span className="base-content text-sm text-right flex-1">
              ₹ 100{" "}
              {/* {schemeData?.bse_lumpsum_params
                ? Number(
                    schemeData?.bse_sip_params?.[0]?.min_installment_amount
                  ).toLocaleString()
                : 0} */}
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs text-base-content flex-1">
              Expense Ratio as on {convertOnlyDate(schemeData.net_expense_ratio_dt)}
            </span>
            <span className="base-content text-sm text-right flex-1">
              {schemeData.net_expense_ratio} %
            </span>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <h3 className="font-medium text-xs text-base-content mb-2">
              Exit Load
            </h3>
            <p className="base-content text-sm mb-2">
              {(schemeData?.exit_load) ? schemeData?.exit_load : '-'}
            </p>
            <p className="text-sm text-base-content leading-relaxed bg-mainbackground rounded-sm p-3">
              {fundData.about.exitLoadDetails}
            </p>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs text text-base-content flex-1">
              Risk Rating
            </span>
            <span className="base-content text-sm text-right flex-1">
              {schemeData.riskLevel}
            </span>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <h3 className="font-medium  text-xs text-base-content mb-2">
              Benchmark
            </h3>
            <p className="base-content text-sm">{schemeData?.allBenchmarkName ? schemeData?.allBenchmarkName : "-"}</p>
          </div>
        </div>

        {/* Key Parameters Section */}
        <div className="sm:space-y-1">
          <h1 className="text-base font-bold w-full  base-content underline mb-6">
            Key Parameters
          </h1>
          <div className="mb-4 ">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm text-base-content mb-2">
                Market Capitalization
              </h3>
              <p className="text-black text-sm  mb-1  bg-mainbackground rounded-sm p-2">
                {fundData.keyParameters.marketCap}
              </p>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium text-xs text-base-content flex-1">
                {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
              </span>
              <span className="text-black text-xs text-right flex-1">
                {fundData.keyParameters.hybridBalancedAvg}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium  text-xs text-base-content flex-1">
                Min - Max Range (Across 20 Scheme)
              </span>
              <span className="text-black text-xs text-right flex-1">
                {fundData.keyParameters.minMaxRange}
              </span>
            </div>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm text-base-content mb-2">
                PE Ratio
              </h3>
              <p className="base-content text-sm   mb-1 bg-mainbackground rounded-sm p-2">
                {toFixedData(schemeData.pe_ratio)}
              </p>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium text-xs text-base-content flex-1">
                {/* Hybrid - Balanced Advantage Avg. */}
                {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
              </span>
              <span className="base-content text-xs text-right flex-1">
                {toFixedData(PERatioData[0]?.pe_ratio_AVG)}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium text-xs text-base-content flex-1">
                Min - Max Range (Across {PERatioData[0]?.total_schemes} Scheme)
              </span>
              <span className="base-content text-xs text-right flex-1">
                {toFixedData(PERatioData[0]?.min_pe_ratio)} - {toFixedData(PERatioData[0]?.max_pe_ratio)}
              </span>
            </div>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-base-content mb-2">PB Ratio</h3>
              <p className="base-content mb-1 bg-mainbackground rounded-sm p-2">
                {toFixedData(schemeData.pb_ratio)}
              </p>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium text-base-content flex-1">
                {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
              </span>
              <span className="base-content text-right text-xs flex-1">
                {toFixedData(PBRatioData[0]?.pb_ratio_AVG)}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 text-sm text-base-content">
              <span className="font-medium text-base-content flex-1">
                Min - Max Range (Across {PBRatioData[0]?.total_schemes} Scheme)
              </span>
              <span className="base-content text-xs text-right flex-1">
                {toFixedData(PBRatioData[0]?.min_pb_ratio)} - {toFixedData(PBRatioData[0]?.max_pb_ratio)}
              </span>
            </div>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm">
              <h3 className="font-medium  text-base-content mb-2">
                Dividend Yield
              </h3>
              <p className="base-content mb-1 bg-mainbackground rounded-sm p-2">
                {fundData.keyParameters.dividendYield}
              </p>
            </div>
            <div className="flex justify-between text-xs items-start py-2  text-base-content">
              <span className="font-medium text-base-content flex-1">
                {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
              </span>
              <span className="base-content text-right  flex-1">
                {fundData.keyParameters.hybridBalancedAvgDiv}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 text-xs text-base-content">
              <span className="font-medium text-base-content flex-1">
                Min - Max Range (Across 20 Scheme)
              </span>
              <span className="base-content text-right flex-1">
                {fundData.keyParameters.minMaxRangeDiv}
              </span>
            </div>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm">
              <h3 className="font-medium text-base-content mb-2">
                Portfolio Turnover Ratio
              </h3>
              <p className="base-content mb-1 bg-mainbackground rounded-sm p-2">
                {toFixedData(schemeData?.SchemeRiskRatios[0]?.AnnualReportTurnoverRatio)}
              </p>
            </div>
            <div className="flex justify-between items-start py-2 text-xs text-base-content">
              <span className="font-medium text-base-content flex-1">
                {schemeData?.SchemeCategory?.Name} - {schemeData?.SchemeSubcategory?.Name}
              </span>
              <span className="base-content text-right flex-1">
                {toFixedData(annualReportTurnoveRatioData[0]?.AnnualReportTurnoverRatio_AVG)}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 text-xs text-base-content">
              <span className="font-medium text-base-content flex-1">
                Min - Max Range (Across {annualReportTurnoveRatioData[0]?.total_schemes} Scheme)
              </span>
              <span className="base-content text-right flex-1">
                {toFixedData(annualReportTurnoveRatioData[0]?.min_AnnualReportTurnoverRatio)} - {toFixedData(annualReportTurnoveRatioData[0]?.max_AnnualReportTurnoverRatio)}
              </span>
            </div>
          </div>
        </div>

        {/* Type Section */}
        <div className="sm:space-y-1 sm:pl-11">
        <h1 className="text-base font-bold w-full  base-content underline mb-6">
          Type
        </h1>
          <div className="flex flex-col items-start  py-2">
            <span className="font-medium text-xs text-base-contenttext-xs flex-1">
              Asset Type
            </span>
            <span className=" text-right text-sm flex-1">
              {schemeData?.SchemeCategory?.Name}
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs text-base-content flex-1">
              Categorization
            </span>
            <span className="base-content text-sm text-right flex-1">
              {schemeData?.SchemeSubcategory?.Name}
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-xs text-base-content flex-1">
              Type
            </span>
            <span className="base-content text-sm text-right flex-1">
              {schemeData?.iscloseended === true ? `Close ended scheme` : `Open ended scheme`}
            </span>
          </div>
          <SectionDivider />
          <div className="flex flex-col items-start py-2">
            <span className="font-medium text-base-content text-xs flex-1">
              Option
            </span>
            <span className="base-content text-right text-sm flex-1">
              {schemeData?.SchemeOption?.option}
            </span>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <h3 className="text-sm  text-black mb-3   font-semibold underline">
              Custodian
            </h3>
            <p className="text-base-content text-xs ">
              {fundData.type.custodian}
            </p>
            <SectionDivider />
            <p className="text-base-content text-xs ">
              {fundData.type.custodianSecond}
            </p>
          </div>
          <SectionDivider />
          <div className="mb-4">
            <h3 className="text-sm   underline text-black mb-3  font-semibold">
              Registrar
            </h3>
            <p className="text-base-content text-xs">
              {fundData.type.registrar}
            </p>
            <SectionDivider />
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default Overview;
