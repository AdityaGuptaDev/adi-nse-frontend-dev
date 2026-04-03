import React, { useEffect, useState } from "react";
import Summary from "./holding/summary";
import DomesticEquity from "./holding/domestic-equity";
import OtherAssets from "./holding/other-assets";
import { handleServerError } from "@/utils/helpers";
import api from "@/utils/api";

function Holdings({ schemeData }: any) {
  const [activeTab, setActiveTab] = useState("Summary");

  const [summaryData, setSummaryData] = useState<any>({});
  const [domesticEquityData, setDomesticEquityData] = useState<any>([]);

  useEffect(() => {
    if (schemeData) {
      getFundManagerData();
    }
  }, [schemeData]);

  const getFundManagerData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN
      }

      let res: any = await api.post(`/scheme/get-holdingData`, passBody);

      if (res.data.data) {
        setSummaryData(res.data.data.holdingTypeWiseData);
        setDomesticEquityData(res.data.data.domesticEquityData);
      }

    } catch (error) {
      handleServerError(error);
    }
  }


  return (
    <div className="p-4">
      <div className="flex gap-3 mb-4">
        <button
          className={`px-4 py-2 rounded-xl cursor-pointer font-semibold text-white text-sm ${activeTab === "Summary"
              ? "  bg-primary"
              : "border-transparent  bg-placeholder"
            }`}
          onClick={() => setActiveTab("Summary")}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 rounded-xl cursor-pointer font-semibold text-white text-sm ${activeTab === "Domestic Equity" ? " bg-primary" : "  bg-placeholder"
            }`}
          onClick={() => setActiveTab("Domestic Equity")}
        >
          Domestic Equity
        </button>
        <button
          className={`px-4 py-2 rounded-xl cursor-pointer font-semibold text-white text-sm ${activeTab === "Other Assets" ? "  bg-primary" : "  bg-placeholder"
            }`}
          onClick={() => setActiveTab("Other Assets")}
        >
          Other Assets
        </button>
      </div>
      <div>
        {activeTab === "Summary" && <Summary summaryData={summaryData} />}
        {activeTab === "Domestic Equity" && <DomesticEquity domesticEquityData={domesticEquityData} />}
        {activeTab === "Other Assets" && <OtherAssets />}
      </div>
    </div>
  );
}

export default Holdings;
