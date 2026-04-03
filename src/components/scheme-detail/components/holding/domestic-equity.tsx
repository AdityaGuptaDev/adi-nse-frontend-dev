import { toFixedData, toFixedDataForReturn } from "@/utils/constants";
import React from "react";
import { convertNumberIndian } from "../../../../utils/helpers";

interface Holding {
  assetName: string;
  sector: string;
  sharesQuantity: string;
  marketValue: string;
  weightage: string;
}

const portfolioData: Holding[] = [
  {
    assetName: "TVS Motor Company Ltd.",
    sector: "Automobile & Ancillaries",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "ICICI Bank Ltd.",
    sector: "Banking",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "HDFC Bank Ltd.",
    sector: "Banking",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Reliance Industries Ltd.",
    sector: "Banking",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Maruti Suzuki India Ltd.",
    sector: "Automobile & Ancillaries",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Infosys Ltd.",
    sector: "Information Technology",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Larsen & Toubro Ltd.",
    sector: "Infrastructure",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Bharti Airtel Ltd.",
    sector: "Telecom",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Axis Bank Ltd.",
    sector: "Banking",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "State Bank Of India",
    sector: "Banking",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Sun Pharmaceutical Industries Ltd.",
    sector: "Healthcare",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "Avenue Supermart Ltd.",
    sector: "Retailing",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
  {
    assetName: "NTPC Ltd.",
    sector: "Power",
    sharesQuantity: "1,10,50,400",
    marketValue: "2,952.67",
    weightage: "4.7%",
  },
];

function DomesticEquity({ domesticEquityData }: any) {

  console.log(domesticEquityData,"domesticEquityData")

  return (
    <div className=" bg-white overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-accent">
            <th className="text-left py-3 text-sm px-2 font-normal text-black">
              Asset Name
            </th>
            <th className="text-left py-3 px-2 text-sm font-normal text-black">
              Sector
            </th>
            <th className="text-center py-3 px-2 text-sm  font-normal text-black">
              Shares Quantity
            </th>
            <th className="text-center py-3 px-2 text-sm font-normal text-black">
              Market Value Rs. (Cr.)
            </th>
            <th className="text-center py-3 px-2 text-sm  font-normal text-black">
              Weightage
            </th>
          </tr>
        </thead>
        <tbody>
          {domesticEquityData.length > 0 && domesticEquityData.map((holding: any, index: any) => (
            <tr
              key={index}
              className=" transition-colors duration-200 border-y border-accent"
            >
              <td className="py-3 px-2 text-base-content text-sm">
                {holding.name}
              </td>
              <td className="py-3 px-2 text-sm text-black">{holding.sector ? holding.sector : "-"}</td>
              <td className="py-3 px-2 text-center text-sm text-black">
                {convertNumberIndian(holding.shares)}
              </td>
              <td className="py-3 px-2 text-center text-sm text-black">
                {holding.position_market_value ? convertNumberIndian(holding.position_market_value) : "-"}
              </td>
              <td className="py-3 px-2 text-center text-sm text-black">
                {toFixedDataForReturn(Number(holding.portfolio_weighting))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DomesticEquity;
