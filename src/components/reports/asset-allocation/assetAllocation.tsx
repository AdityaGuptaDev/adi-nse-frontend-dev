import React, { useState } from "react";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import PortfolioValuationFilter from "../portfolio-valuation/portfolioValuationFilter";
import AssetLocationFiler from "./assetAllocationFilter";

import DebtPieChart from "./PieChartComponent";
import CustomButton from "@/commonUI/Button";
import { FaChevronUp } from "react-icons/fa";

const AssetAllocation = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    order: string | null;
  }>({
    key: null,
    order: "DESC",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [exportXLSLoading, setExportXLSLoading] = useState(false);
  const [exportPDFLoading, setExportPDFLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [payload, setPayload] = useState();
  const [showHolding, setShowHolding] = useState(false);

  // Data from the image
  const reportData = [
    {
      investor: "Total",
      amount: 1160,
      share: 100.0,
      isTotal: true,
    },
    {
      investor: "SUBESH KUMAR",
      amount: 1160,
      share: 100.0,
      isTotal: false,
    },
  ];

  const grandTotal = {
    Purchase: 1042897,
    SwitchIn: 117638,
    Redemption: 1120737,
    SwitchOut: 118811,
    currentValue: 1159,
    RealizedGain: 80113,
    UnrealizedGain: 59,
    XIRRReturn: 15.51,
  };

  const ExportSchemeData = (type: any) => {
    if (type === "XLS") {
      setExportXLSLoading(true);
      setTimeout(() => setExportXLSLoading(false), 2000);
    } else {
      setExportPDFLoading(true);
      setTimeout(() => setExportPDFLoading(false), 2000);
    }
  };

  const productData = [
    {
      product: "Total",
      amount: 1160,
      share: 100.0,
      isTotal: true,
    },
    {
      product: "Mutual Fund",
      amount: 1160,
      share: 100.0,
      isTotal: false,
    },
  ];

  const subCategoryData = [
    {
      subcetagory: "Total",
      amount: 1326,
      share: 100.0,
      isTotal: true,
    },
    {
      subcetagory: "Debt: Liquid",
      amount: 1160,
      share: 104,
      isTotal: true,
    },
  ];
  const fundData = [
    {
      fund: "Total",
      amount: 1160,
      share: 100.0,
      isTotal: true,
    },
    {
      fund: "Nippon India Mutual Fund",
      amount: 1160,
      share: 100.0,
      isTotal: false,
    },
  ];
  const categoryData = [
    {
      schemeName: "Total",
      subCategory: "",
      equity: 0,
      debt: 1158,
      gold: 0,
      globalEquity: 0,
      other: 2,
      total: 1160,
      share: 100.0,
      isTotal: true,
    },
    {
      schemeName: "Nippon India Liquid Fund (G)",
      subCategory: "Debt: Liquid",
      equity: 0,
      debt: 1158,
      gold: 0,
      globalEquity: 0,
      other: 2,
      total: 1160,
      share: 100.0,
      isTotal: false,
    },
  ];

  // Equity Cap data from image
  const equityCapData = [
    {
      schemeName: "Total",
      subCategory: "",
      equityLargeCap: 0,
      equityMidCap: 0,
      equitySmallCap: 0,
      total: 0,
      share: 100.0,
      isTotal: true,
    },
    {
      schemeName: "Nippon India Liquid Fund (G)",
      subCategory: "Debt: Liquid",
      equityLargeCap: 0,
      equityMidCap: 0,
      equitySmallCap: 0,
      total: 0,
      share: 0,
      isTotal: false,
    },
  ];
  const grandTotalData = [
    {
      schemeScript: "Grand Total :",
      amount: 1160,
      share: 100.0,
      isGrandTotal: true,
    },
    {
      schemeScript: "Debt: Liquid",
      amount: 1160,
      share: 100.0,
      isGrandTotal: false,
    },
    {
      schemeScript: "Nippon India Liquid Fund (G)",
      amount: 1160,
      share: 100.0,
      isGrandTotal: false,
    },
    {
      schemeScript: "Sub Total :",
      amount: 1160,
      share: 100.0,
      isGrandTotal: false,
    },
  ];
  // Holding data
  const holdingData = {
    byPaper: [
      { name: "91 Days Tbill", amount: 81, share: 6.94 },
      { name: "Reverse Repo", amount: 70, share: 6.01 },
      { name: "Indian Oil Corporation Limited", amount: 68, share: 5.84 },
      { name: "5.22% Government of India", amount: 58, share: 5.02 },
      { name: "HDFC Bank Limited", amount: 52, share: 4.46 },
      { name: "Reliance Jio Infocomm Limited", amount: 48, share: 4.13 },
      {
        name: "National Bank For Agriculture and Rural Developm...",
        amount: 48,
        share: 4.12,
      },
      { name: "Reliance Industries Limited", amount: 40, share: 3.45 },
      { name: "ICICI Securities Limited", amount: 39, share: 3.37 },
      { name: "Reliance Retail Ventures Limited", amount: 32, share: 2.75 },
    ],
    byRating: [
      { name: "A1+", amount: 960, share: 82.72 },
      { name: "SOV", amount: 195, share: 16.82 },
      { name: "AAA", amount: 18, share: 1.57 },
      { name: "Cash", amount: -13, share: -1.11 },
    ],
  };

  const onChangeSearch = (event: any) => {
    setSearch(event.target.value);
  };

  const onChangeSorting = (key: any) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.order === "ASC") {
        return { key, order: "DESC" };
      } else if (prev.key === key && prev.order === "DESC") {
        return { key: null, order: null };
      } else {
        return { key, order: "ASC" };
      }
    });
  };

  return (
    <>
      {/* Header Controls */}
      <div className="p-1 sm:p-3 flex gap-1 sm:gap-2 flex-wrap focus:ring-none border-accent">
        <div>
          <div className="drawer drawer-end z-40 ">
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle"
              checked={isDrawerOpen}
              onChange={() => setIsDrawerOpen(!isDrawerOpen)}
            />
            <div className="drawer-content flex gap-5 ">
              <div className="text-black text-2xl hidden md:flex items-center w-full md:w-auto">
                Asset Allocation
              </div>
              <button
                className="btn rounded-xl btnStyle p-0 px-2 h-[34px] sm:h-[40px]"
                onClick={() => setIsDrawerOpen(true)}
              >
                <FiFilter className="text-primary text-lg sm:text-2xl" />
              </button>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer-4"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu rounded-l-2xl bg-[#111111] text-base-content min-h-full w-96 ">
                <AssetLocationFiler
                  isOpen={isDrawerOpen}
                  handleClose={() => setIsDrawerOpen(false)}
                  setPayload={setPayload}
                />
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden lg:block flex-1"></div>
        <div>
          <div
            data-tip="PDF"
            tabIndex={0}
            role="button"
            className="relative z-10 tooltip tooltip-bottom"
          >
            <button
              className="btn rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
              type="button"
              onClick={() => ExportSchemeData("PDF")}
            >
              {exportPDFLoading ? (
                <>
                  <span className="loading loading-spinner"></span> loading
                </>
              ) : (
                <BsFileEarmarkPdf className="text-primary text-lg sm:text-2xl" />
              )}
            </button>
          </div>
        </div>
        <div>
          <div
            data-tip="Excel"
            tabIndex={0}
            role="button"
            className="relative z-10 tooltip tooltip-bottom"
          >
            <button
              className="btn rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
              type="button"
              onClick={() => ExportSchemeData("XLS")}
            >
              {exportXLSLoading ? (
                <>
                  <span className="loading loading-spinner"></span> loading
                </>
              ) : (
                // <Download className="text-primary text-lg sm:text-2xl" />
                <RiFileExcel2Line className="text-primary text-lg sm:text-2xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}

      <div className="flex flex-col md:flex-row  items-center justify-between    py-10">
        {/* Tables */}
        <div className="w-1/2 md:max-w-full flex flex-col gap-5  ">
          {/* Product Table */}
          <div className="bg-[#111111]  text-sm  shadow-xs  rounded-sm overflow-hidden ">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-accent  font-semibold p-2 text-start">
                    Product
                  </th>
                  <th className="bg-accent  font-semibold p-2 text-start">
                    Amount
                  </th>
                  <th className="bg-accent  font-semibold p-2 text-start">
                    Share(%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {productData.map((row, idx) => (
                  <tr key={row.product + idx}>
                    <td className="bg-accent-content    p-2 border-b border-accent">
                      {row.product}
                    </td>
                    <td className="bg-accent-content   pl-5  border-b border-accent">
                      {row.amount.toLocaleString()}
                    </td>
                    <td className="bg-accent-content    pl-5 border-b border-accent">
                      {row.share.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Investor Table */}
          <div className="bg-[#111111] text-sm  shadow-xs rounded-sm  overflow-hidden">
            <table className="w-full ">
              <thead>
                <tr>
                  <th className="bg-accent text-base-content font-semibold p-3 text-left">
                    Investor
                  </th>
                  <th className="bg-accent   text-base-content font-semibold p-3 text-left">
                    Amount
                  </th>
                  <th className="bg-accent text-base-content font-semibold p-3 text-left">
                    Share(%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={row.investor + idx}>
                    <td className="p-2 border-accent border-b">
                      {row.investor}
                    </td>
                    <td className="p-2 border-accent border-b pl-5">
                      {row.amount.toLocaleString()}
                    </td>
                    <td className="p-2 border-accent border-b pl-5">
                      {row.share.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pie Chart */}

        <DebtPieChart />
      </div>

      <div className="w-full  flex  gap-10  ">
        {/* Sub Cetagory Table */}
        <div className="bg-[#111111]  text-sm  shadow-xs  rounded-sm overflow-hidden w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-accent  font-semibold p-2 text-start">
                  Sub Cetagory
                </th>
                <th className="bg-accent  font-semibold p-2 text-start">
                  Amount
                </th>
                <th className="bg-accent  font-semibold p-2 text-start">
                  Share(%)
                </th>
              </tr>
            </thead>
            <tbody>
              {subCategoryData.map((row, idx) => (
                <tr key={row.subcetagory + idx}>
                  <td className="bg-accent-content    p-2 border-b border-accent">
                    {row.subcetagory}
                  </td>
                  <td className="bg-accent-content   pl-5  border-b border-accent">
                    {row.amount.toLocaleString()}
                  </td>
                  <td className="bg-accent-content    pl-5 border-b border-accent">
                    {row.share.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Fund Table */}
        <div className="bg-[#111111] text-sm  shadow-xs rounded-sm  overflow-hidden w-full">
          <table className="w-full ">
            <thead>
              <tr>
                <th className="bg-accent text-base-content font-semibold p-3 text-left">
                  Fund
                </th>
                <th className="bg-accent   text-base-content font-semibold p-3 text-left">
                  Amount
                </th>
                <th className="bg-accent text-base-content font-semibold p-3 text-left">
                  Share(%)
                </th>
              </tr>
            </thead>
            <tbody>
              {fundData.map((row, idx) => (
                <tr key={row.fund + idx}>
                  <td className="p-2 border-accent border-b">{row.fund}</td>
                  <td className="p-2 border-accent border-b pl-5">
                    {row.amount.toLocaleString()}
                  </td>
                  <td className="p-2 border-accent border-b pl-5">
                    {row.share.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-accent p-3 font-semibold text-base my-3">Category</div>
      {/* Category Breakdown Table */}
      <div className="bg-[#111111]  flex flex-col gap-4  shadow-xs rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-accent font-semibold p-2 text-left">
                  Scheme Name
                </th>
                <th className="bg-accent font-semibold p-2 text-left">
                  Sub Category
                </th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Equity
                </th>
                <th className="bg-accent font-semibold p-2 text-right">Debt</th>
                <th className="bg-accent font-semibold p-2 text-right">Gold</th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Global Equity
                </th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Other
                </th>
                <th className="bg-accent   font-semibold p-2 text-right">
                  Total
                </th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Share(%)
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((row, idx) => (
                <tr
                  key={row.schemeName + idx}
                  className={row.isTotal ? "bg-accent-content  " : ""}
                >
                  <td className="p-2 border-b border-accent">
                    {row.schemeName}
                  </td>
                  <td className="p-2 border-b border-accent">
                    {row.subCategory}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.equity}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.debt.toLocaleString()}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.gold}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.globalEquity}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.other}
                  </td>
                  <td className="p-2 border-b border-accent text-right bg-accent-content  ">
                    {row.total.toLocaleString()}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.share.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Equity Cap Table */}
        <div className="bg-accent p-3 font-semibold text-base ">
          Equity Cap for Mutual Fund
        </div>
        <div className="bg-[#111111]  shadow-xs rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-accent font-semibold p-2 text-left">
                    Scheme Name
                  </th>
                  <th className="bg-accent font-semibold p-2 text-left">
                    Sub Category
                  </th>
                  <th className="bg-accent font-semibold p-2 text-right">
                    Equity Large Cap
                  </th>
                  <th className="bg-accent font-semibold p-2 text-right">
                    Equity Mid Cap
                  </th>
                  <th className="bg-accent font-semibold p-2 text-right">
                    Equity Small Cap
                  </th>
                  <th className="bg-accent font-semibold p-2 text-right">
                    Total
                  </th>
                  <th className="bg-accent font-semibold p-2 text-right">
                    Share(%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {equityCapData.map((row, idx) => (
                  <tr
                    key={row.schemeName + idx}
                    className={row.isTotal ? "bg-accent-content" : ""}
                  >
                    <td className="p-2 border-b border-accent">
                      {row.schemeName}
                    </td>
                    <td className="p-2 border-b border-accent">
                      {row.subCategory}
                    </td>
                    <td className="p-2 border-b border-accent text-right">
                      {row.equityLargeCap}
                    </td>
                    <td className="p-2 border-b border-accent text-right">
                      {row.equityMidCap}
                    </td>
                    <td className="p-2 border-b border-accent text-right">
                      {row.equitySmallCap}
                    </td>
                    <td className="p-2 border-b border-accent text-right ">
                      {row.total}
                    </td>
                    <td className="p-2 border-b border-accent text-right">
                      {row.share.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Grand Total Table */}
        <div className="bg-[#111111]  shadow-xs rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-accent font-semibold p-2 text-left">
                  Scheme/Scrip
                </th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Amount
                </th>
                <th className="bg-accent font-semibold p-2 text-right">
                  Share(%)
                </th>
              </tr>
            </thead>
            <tbody>
              {grandTotalData.map((row, idx) => (
                <tr
                  key={row.schemeScript + idx}
                  className={row.isGrandTotal ? "bg-accent-content" : ""}
                >
                  <td className="p-2 border-b border-accent">
                    {row.isGrandTotal ? (
                      <span className="font-semibold">{row.schemeScript}</span>
                    ) : (
                      <span className="">{row.schemeScript}</span>
                    )}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.amount.toLocaleString()}
                  </td>
                  <td className="p-2 border-b border-accent text-right">
                    {row.share.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>{" "}
        {/* Show Holding Button */}
        <div className="flex justify-center my-3">
          <CustomButton onClick={() => setShowHolding(!showHolding)}>
            {showHolding ? "Hide Holding" : "Show Holding"}
            {showHolding ? (
              <FaChevronUp className=" transition-all" />
            ) : (
              <FaChevronUp className="rotate-180 transition-all" />
            )}
          </CustomButton>
        </div>
        {/* Holding Details Section */}
        {showHolding && (
          <div className="mt-8">
            <div className="bg-accent p-3 font-semibold text-xl mb-4">
              Holding
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* By Scrip (Top 10) */}
              <div className="bg-[#111111] shadow-sm rounded-sm overflow-hidden">
                <div className="bg-accent p-3 font-semibold text-base">
                  By Scrip (Top 10)
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-center h-32 bg-[#0A0A0A] rounded">
                    <div className="flex items-center text-primary">
                      <span className="text-2xl mr-2">⚠️</span>
                      <span className="text-[#9CA3AF]">No data available.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Paper (Top 10) */}
              <div className="bg-[#111111] shadow-sm rounded-sm overflow-hidden">
                <div className="bg-accent p-3 font-semibold text-base">
                  By Paper (Top 10)
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="bg-accent font-semibold p-2 text-left">
                        Name
                      </th>
                      <th className="bg-accent font-semibold p-2 text-right">
                        Amount
                      </th>
                      <th className="bg-accent font-semibold p-2 text-right ">
                        Share(%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdingData.byPaper.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#2A2A2A]">
                        <td className="p-2 text-left">{row.name}</td>
                        <td className="p-2 text-right">{row.amount}</td>
                        <td className="p-2 text-right ">
                          {row.share.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* By Sector (Top 10) */}
              <div className="bg-[#111111] shadow-sm rounded-sm overflow-hidden">
                <div className="bg-accent p-3 font-semibold text-base">
                  By Sector (Top 10)
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-center h-32 bg-[#0A0A0A] rounded">
                    <div className="flex items-center text-primary">
                      <span className="text-2xl mr-2">⚠️</span>
                      <span className="text-[#9CA3AF]">No data available.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Rating (Top 10) */}
              <div className="bg-[#111111] shadow-sm rounded-sm overflow-hidden">
                <div className="bg-accent p-3 font-semibold text-base">
                  By Rating (Top 10)
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="bg-accent font-semibold p-2 text-left">
                        Rating
                      </th>
                      <th className="bg-accent font-semibold p-2 text-right">
                        Amount
                      </th>
                      <th className="bg-accent font-semibold p-2 text-right">
                        Share(%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdingData.byRating.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#2A2A2A]">
                        <td className="p-2 text-left">{row.name}</td>
                        <td className="p-2 text-right">{row.amount}</td>
                        <td className="p-2 text-right">
                          {row.share.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssetAllocation;
