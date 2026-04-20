import React, { useState } from "react";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import PortfolioValuationFilter from "../portfolio-valuation/portfolioValuationFilter";
import PortfolioSummaryFilter from "./portfolioSummaryFilter";
// import PortfolioValuationFilter from "./portfolio-valuation/portfolioValuationFilter";
// import {
//   ShoppingCart,
//   FileText,
//   Download,
//   Filter,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

const PortfolioSummary = () => {
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
  const [expandedFolios, setExpandedFolios] = useState(
    new Set(["KHUSHBOO_SINGH", "OJAS_SINGH"])
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [payload, setPayload] = useState();

  // Data from the image
  const reportData = [
    {
      investorName: "KHUSHBOO SINGH",
      folioNumber: "FMCPS0345M",
      categories: [
        {
          categoryName: "Equity",
          schemes: [
            {
              transactionId: "129852842",
              soa: "SOA",
              schemeName: "Canara Robeco Large and Mid Cap Fund Reg (G)",
              Purchase: 16000,
              SwitchIn: 0,
              Redemption: 14277,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: -1723,
              UnrealizedGain: 0,
              XIRRReturn: -12.84,
            },
            {
              transactionId: "9504314/14",
              soa: "SOA",
              schemeName: "HDFC Mid Cap Opportunities Fund (G)",
              Purchase: 51000,
              SwitchIn: 0,
              Redemption: 46423,
              SwitchOut: 7342,
              currentValue: 0,
              RealizedGain: 2765,
              UnrealizedGain: 0,
              XIRRReturn: 5.98,
            },
            {
              transactionId: "15926343/67",
              soa: "SOA",
              schemeName: "ICICI Pru Technology Fund (G)",
              Purchase: 0,
              SwitchIn: 6122,
              Redemption: 9497,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 3374,
              UnrealizedGain: 0,
              XIRRReturn: 111.44,
            },
            {
              transactionId: "15926372/77",
              soa: "SOA",
              schemeName: "ICICI Pru Technology Fund (G)",
              Purchase: 0,
              SwitchIn: 6122,
              Redemption: 9497,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 3374,
              UnrealizedGain: 0,
              XIRRReturn: 111.44,
            },
            {
              transactionId: "580287824977",
              soa: "SOA",
              schemeName: "UTI Mid Cap Fund (G)",
              Purchase: 10000,
              SwitchIn: 8823,
              Redemption: 8823,
              SwitchOut: 10000,
              currentValue: 0,
              RealizedGain: 0,
              UnrealizedGain: 0,
              XIRRReturn: 0,
            },
          ],
          subTotal: {
            Purchase: 77000,
            SwitchIn: 21068,
            Redemption: 88517,
            SwitchOut: 17342,
            currentValue: 0,
            RealizedGain: 7791,
            UnrealizedGain: 0,
            XIRRReturn: 8.45,
          },
        },
        {
          categoryName: "Liquid and Ultra Short",
          schemes: [
            {
              transactionId: "91095575886",
              soa: "SOA",
              schemeName: "Axis Ultra Short Duration Fund Reg (G)",
              Purchase: 5000,
              SwitchIn: 0,
              Redemption: 5179,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 179,
              UnrealizedGain: 0,
              XIRRReturn: 3.44,
            },
            {
              transactionId: "91095575901",
              soa: "SOA",
              schemeName: "Axis Ultra Short Duration Fund Reg (G)",
              Purchase: 5000,
              SwitchIn: 0,
              Redemption: 5179,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 179,
              UnrealizedGain: 0,
              XIRRReturn: 3.44,
            },
            {
              transactionId: "22120223",
              soa: "SOA",
              schemeName: "Franklin India Ultra Short Bond Super Ins (G)",
              Purchase: 100000,
              SwitchIn: 0,
              Redemption: 102871,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 2871,
              UnrealizedGain: 0,
              XIRRReturn: 9.24,
            },
            {
              transactionId: "21108823",
              soa: "SOA",
              schemeName: "Franklin India Ultra Short Bond Super Ins (G)",
              Purchase: 20000,
              SwitchIn: 0,
              Redemption: 20050,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 50,
              UnrealizedGain: 0,
              XIRRReturn: 6.72,
            },
            {
              transactionId: "9504314/14-L",
              soa: "SOA",
              schemeName: "HDFC Liquid Fund (G)",
              Purchase: 0,
              SwitchIn: 7342,
              Redemption: 7360,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 18,
              UnrealizedGain: 0,
              XIRRReturn: 6.68,
            },
            {
              transactionId: "15926343/67-S",
              soa: "SOA",
              schemeName: "ICICI Pru Savings Fund (G)",
              Purchase: 6000,
              SwitchIn: 0,
              Redemption: 0,
              SwitchOut: 6122,
              currentValue: 0,
              RealizedGain: 122,
              UnrealizedGain: 0,
              XIRRReturn: 4.62,
            },
            {
              transactionId: "15926372/77-S",
              soa: "SOA",
              schemeName: "ICICI Pru Savings Fund (G)",
              Purchase: 6000,
              SwitchIn: 0,
              Redemption: 0,
              SwitchOut: 6122,
              currentValue: 0,
              RealizedGain: 122,
              UnrealizedGain: 0,
              XIRRReturn: 4.62,
            },
          ],
          subTotal: {
            Purchase: 142000,
            SwitchIn: 7342,
            Redemption: 140639,
            SwitchOut: 12245,
            currentValue: 0,
            RealizedGain: 3542,
            UnrealizedGain: 0,
            XIRRReturn: 7.54,
          },
        },
      ],
      investorTotal: {
        Purchase: 219000,
        SwitchIn: 28410,
        Redemption: 229156,
        SwitchOut: 29586,
        currentValue: 0,
        RealizedGain: 11333,
        UnrealizedGain: 0,
        XIRRReturn: 8.18,
      },
    },
    {
      investorName: "OJAS SINGH",
      folioNumber: "FMCPS0345M",
      categories: [
        {
          categoryName: "Equity",
          schemes: [
            {
              transactionId: "1779778036",
              soa: "SOA",
              schemeName: "Canara Robeco Large and Mid Cap Fund Reg (G)",
              Purchase: 44000,
              SwitchIn: 0,
              Redemption: 58776,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 14776,
              UnrealizedGain: 0,
              XIRRReturn: 23.73,
            },
            {
              transactionId: "1779778036",
              soa: "SOA",
              schemeName: "Canara Robeco Large and Mid Cap Fund Reg (G)",
              Purchase: 44000,
              SwitchIn: 0,
              Redemption: 58776,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 14776,
              UnrealizedGain: 0,
              XIRRReturn: 23.73,
            },
            {
              transactionId: "1779778036",
              soa: "SOA",
              schemeName: "Canara Robeco Large and Mid Cap Fund Reg (G)",
              Purchase: 44000,
              SwitchIn: 0,
              Redemption: 58776,
              SwitchOut: 0,
              currentValue: 0,
              RealizedGain: 14776,
              UnrealizedGain: 0,
              XIRRReturn: 23.73,
            },
          ],
          subTotal: {
            Purchase: 44000,
            SwitchIn: 0,
            Redemption: 58776,
            SwitchOut: 0,
            currentValue: 0,
            RealizedGain: 14776,
            UnrealizedGain: 0,
            XIRRReturn: 23.73,
          },
        },
      ],
      investorTotal: {
        Purchase: 44000,
        SwitchIn: 0,
        Redemption: 58776,
        SwitchOut: 0,
        currentValue: 0,
        RealizedGain: 14776,
        UnrealizedGain: 0,
        XIRRReturn: 23.73,
      },
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

  const ExportSchemeData = (type: any) => {
    if (type === "XLS") {
      setExportXLSLoading(true);
      setTimeout(() => setExportXLSLoading(false), 2000);
    } else {
      setExportPDFLoading(true);
      setTimeout(() => setExportPDFLoading(false), 2000);
    }
  };

  const toggleFolioExpansion = (folioKey: any) => {
    const newExpanded = new Set(expandedFolios);
    if (newExpanded.has(folioKey)) {
      newExpanded.delete(folioKey);
    } else {
      newExpanded.add(folioKey);
    }
    setExpandedFolios(newExpanded);
  };

  const addToCart = (schemeId: any) => {
    console.log("Added to cart:", schemeId);
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
                Portfolio Summary
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
                <PortfolioSummaryFilter
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
      <div className="overflow-auto border-base-content/5 bg-base-100 border-t">
        <table className="table table-sm table-pin-rows">
          <thead className="thead">
            <tr className="">
              <th rowSpan={2} className="text-left">
                <div className="tableHeaderClass ">
                  <div>Folio</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Scheme</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Purchase </div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Switch In</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Redemption</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Switch Out</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Current Value</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Realized Gain</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Unrealized Gain</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>XIRR Return ( % )</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((investor, idx) => (
              <React.Fragment
                key={`${investor.investorName}_${investor.folioNumber}_${idx}`}
              >
                {/* Invest tor Header Row */}
                <tr className="bg-accent-content  font-semibold">
                  <td
                    colSpan={12}
                    className="p-3 cursor-pointer text-sm py-2 "
                    onClick={() => toggleFolioExpansion(investor.investorName)}
                  >
                    {investor.investorName} : {investor.folioNumber}
                  </td>
                </tr>

                <>
                  {/* Categories */}
                  {investor.categories.map((category, categoryIdx) => (
                    <React.Fragment
                      key={`${category.categoryName}_${categoryIdx}`}
                    >
                      {/* Category Header */}
                      <tr>
                        <td
                          colSpan={12}
                          className="p-2  py-2 text-sm text-[#E5E7EB] font-semibold"
                        >
                          {category.categoryName}
                        </td>
                      </tr>

                      {/* Scheme Rows */}
                      {category.schemes.map((scheme, schemeIdx) => (
                        <tr key={`${scheme.transactionId}_${schemeIdx}`}>
                          <td className="p-3 flex items-center  justify-between   pr-10 py-2">
                            <div className="flex items-center gap-6 text-xs ">
                              <div>
                                <div className="font-medium text-sm">
                                  {scheme.transactionId}
                                </div>
                              </div>
                            </div>

                            <div
                              data-tip="Invest Online"
                              className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                              onClick={(event) => {
                                addToCart(scheme.transactionId);
                              }}
                            >
                              <IoCartOutline size={16} className="text-white" />
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <span className="font-medium ">
                              {scheme.schemeName}
                            </span>
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.Purchase.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.SwitchIn.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.Redemption.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.SwitchOut.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.currentValue.toLocaleString()}
                          </td>
                          <td className="p-3 text-right  font-medium text-sm">
                            {scheme.RealizedGain.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.UnrealizedGain}
                          </td>
                          <td className="p-3 text-right text-sm">
                            {scheme.XIRRReturn}
                          </td>
                        </tr>
                      ))}

                      {/* Sub Total - Category */}
                      <tr className=" hover:bg-[#0A0A0A] font-medium text-md border-b-2">
                        <td
                          colSpan={2}
                          className="px-2 py-4 text-right text-md  font-semibold"
                        >
                          Sub Total - {category.categoryName} :
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.Purchase.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.SwitchIn.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.Redemption.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.SwitchOut.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.currentValue.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.RealizedGain.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.UnrealizedGain}
                        </td>
                        <td className="p-2 text-right">
                          {category.subTotal.XIRRReturn}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Sub Total - Investor */}
                  <tr className="hover:bg-[#0A0A0A] bg-[#111111] font-medium border-b-2">
                    <td className="py-4 text-md text-start font-semibold">
                      Sub Total - {investor.investorName} :
                    </td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.Purchase.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.SwitchIn.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.Redemption.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.SwitchOut.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.currentValue.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.RealizedGain.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.UnrealizedGain}
                    </td>
                    <td className="p-2 text-right">
                      {investor.investorTotal.XIRRReturn}
                    </td>
                  </tr>
                </>
                {/* )} */}
              </React.Fragment>
            ))}

            {/* Grand Total */}
            <tr className="hover:bg-[#0A0A0A] font-bold text-base-content text-sm border-b-2 border-accent-content">
              <td colSpan={2} className="px-2 py-4  text-sm text-right">
                Grand Total :
              </td>
              <td className="p-3 text-right">
                {grandTotal.Purchase.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {grandTotal.SwitchIn.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {grandTotal.Redemption.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {grandTotal.SwitchOut.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {grandTotal.currentValue.toLocaleString()}
              </td>
              <td className="p-3 text-right ">
                {grandTotal.RealizedGain.toLocaleString()}
              </td>
              <td className="p-3 text-right">{grandTotal.UnrealizedGain}</td>
              <td className="p-3 text-right">{grandTotal.XIRRReturn}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PortfolioSummary;
