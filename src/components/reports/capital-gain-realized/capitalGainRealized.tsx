import React, { useState } from "react";
import { FaFileExport, FaStar } from "react-icons/fa";
import { BsBank, BsFileEarmarkPdf } from "react-icons/bs";
import { FiFilter, FiPlus } from "react-icons/fi";
import { MdArrowDropDown, MdArrowDropUp, MdViewColumn } from "react-icons/md";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import { LuArrowUpDown } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import { IoCartOutline } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import { toast } from "react-toastify";
import CustomButton from "@/commonUI/Button";
import PortfolioValuationFilter from "../portfolio-valuation/portfolioValuationFilter";

const CapitalGainRealize = () => {
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
    new Set(["SUBESH_KUMAR"])
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [payload, setPayload] = useState<any>();

  // Sample data matching the image exactly
  const reportData = [
    {
      investorName: "SUBESH KUMAR",
      folioNumber: "ARGPK0824P",
      category: "Liquid and Ultra Short",
      schemes: [
        {
          transactionId: "477269204955",
          soa: "S0A",
          schemeName: "Nippon India Liquid Fund (G)",
          balanceUnits: 0.182,
          purchaseNav: 6041.6127,
          currentNav: 6364.9366,
          purchaseValue: 1100,
          currentValue: 1158,
          gain: 59,
          holdingDays: 271,
          absReturn: 5.35,
          cagr: 7.22,
          transactions: [
            {
              date: "09-12-2024",
              type: "Purchase",
              units: 0.163,
              nav: 6132.639,
              purchaseValue: 1000,
              currentValue: 1037,
              gain: 38,
              days: 195,
              absReturn: 3.78,
              cagr: 7.08,
            },
            {
              date: "31-08-2022",
              type: "SIP",
              units: 0.019,
              nav: 5257.8098,
              purchaseValue: 100,
              currentValue: 121,
              gain: 21,
              days: 1026,
              absReturn: 21.05,
              cagr: 7.03,
            },
          ],
        },
      ],
    },
    {
      investorName: "SUBESH KUMAR",
      folioNumber: "ARGPK0824P",
      category: "Liquid and Ultra Short",
      schemes: [
        {
          transactionId: "477269204955",
          soa: "S0A",
          schemeName: "Nippon India Liquid Fund (G)",
          balanceUnits: 0.182,
          purchaseNav: 6041.6127,
          currentNav: 6364.9366,
          purchaseValue: 1100,
          currentValue: 1158,
          gain: 59,
          holdingDays: 271,
          absReturn: 5.35,
          cagr: 7.22,
          transactions: [
            {
              date: "09-12-2024",
              type: "Purchase",
              units: 0.163,
              nav: 6132.639,
              purchaseValue: 1000,
              currentValue: 1037,
              gain: 38,
              days: 195,
              absReturn: 3.78,
              cagr: 7.08,
            },
            {
              date: "31-08-2022",
              type: "SIP",
              units: 0.019,
              nav: 5257.8098,
              purchaseValue: 100,
              currentValue: 121,
              gain: 21,
              days: 1026,
              absReturn: 21.05,
              cagr: 7.03,
            },
          ],
        },
      ],
    },
    {
      investorName: "SUBESH KUMAR",
      folioNumber: "ARGPK0824P",
      category: "Liquid and Ultra Short",
      schemes: [
        {
          transactionId: "477269204955",
          soa: "S0A",
          schemeName: "Nippon India Liquid Fund (G)",
          balanceUnits: 0.182,
          purchaseNav: 6041.6127,
          currentNav: 6364.9366,
          purchaseValue: 1100,
          currentValue: 1158,
          gain: 59,
          holdingDays: 271,
          absReturn: 5.35,
          cagr: 7.22,
          transactions: [
            {
              date: "09-12-2024",
              type: "Purchase",
              units: 0.163,
              nav: 6132.639,
              purchaseValue: 1000,
              currentValue: 1037,
              gain: 38,
              days: 195,
              absReturn: 3.78,
              cagr: 7.08,
            },
            {
              date: "31-08-2022",
              type: "SIP",
              units: 0.019,
              nav: 5257.8098,
              purchaseValue: 100,
              currentValue: 121,
              gain: 21,
              days: 1026,
              absReturn: 21.05,
              cagr: 7.03,
            },
          ],
        },
      ],
    },
  ];

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

  const getSortIcon = (key: any) => {
    if (sortConfig.key !== key) {
      return <LuArrowUpDown size={15} className="text-black" />;
    }
    return sortConfig.order === "ASC" ? (
      <GoArrowUp size={15} className="text-black" />
    ) : (
      <GoArrowDown size={15} className="text-black" />
    );
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
    toast.success("Added to cart");
  };

  function setSelectedScheme(item: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      {/* Header Controls */}
      <div className="p-1 sm:p-3 flex gap-1 sm:gap-2 flex-wrap focus:ring-none border-accent">
        {/* <div>
          <input
            type="search"
            className="grow bg-transparent border border-accent rounded-xl py-1 focus:outline-none px-3 sm:min-w-80 sm:min-h-10"
            placeholder="Search"
            onChange={onChangeSearch}
          />
        </div> */}
        <div>
          <div className="drawer drawer-end z-40 ">
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle"
              checked={isDrawerOpen}
              onChange={() => setIsDrawerOpen(!isDrawerOpen)}
            />
            <div className="drawer-content flex gap-5">
              <div className="text-black text-2xl hidden md:flex items-center w-full md:w-auto">
                Portfolio Valuation
              </div>
              <button
                className="btn rounded-xl btnStyle p-0 px-2 h-[34px] sm:h-[40px]"
                // onClick={() => setDrawerOpen(true)}
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
              <ul className="menu rounded-l-2xl bg-white text-base-content min-h-full w-96 ">
                <PortfolioValuationFilter
                  isOpen={isDrawerOpen}
                  handleClose={() => setIsDrawerOpen(false)}
                  setPayload={setPayload}
                />
                {/* <PortfolioValuationFilter
                  isOpen={isDrawerOpen}
                  handleClose={() => setIsDrawerOpen(false)}
                  setPayload={setPayload}
                /> */}
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
            <CustomButton
              className="btn bg-accent-content hover:bg-accent rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
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
            </CustomButton>
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
                  <div>Balance Units</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Purchase NAV</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Current NAV</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Purchase Value</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Current Value</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Gain</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Holding Days</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>Abs Return (%)</div>
                </div>
              </th>
              <th rowSpan={2}>
                <div className="tableHeaderClass">
                  <div>CAGR (%)</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((investor, idx) => (
              <React.Fragment
                key={`${investor.investorName}_${investor.folioNumber}_${idx}`}
              >
                {/* Investor Header Row */}
                <tr className="bg-accent-content  font-semibold">
                  <td
                    colSpan={12}
                    className="p-3 cursor-pointer text-sm py-2 "
                    onClick={() => toggleFolioExpansion("SUBESH_KUMAR")}
                  >
                    {investor.investorName} : {investor.folioNumber}
                  </td>
                </tr>

                <>
                  {/* Category Header */}
                  <tr>
                    <td
                      colSpan={12}
                      className="p-2  py-2 text-sm font-medium text-gray-700"
                    >
                      {investor.category}
                    </td>
                  </tr>

                  {/* Scheme Rows */}
                  {investor.schemes.map((scheme) => (
                    <React.Fragment key={scheme.transactionId}>
                      {/* Main Scheme Row */}
                      <tr>
                        <td className="p-3 flex items-center gap-2 py-2">
                          <div className="flex items-center gap-2  text-sm  font-semibold">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                toggleFolioExpansion(scheme.transactionId)
                              }
                            >
                              {expandedFolios.has(scheme.transactionId) ? (
                                <MdArrowDropDown size={20} />
                              ) : (
                                <MdArrowDropUp size={20} />
                              )}
                            </button>
                            <div>
                              <div className="font-medium">
                                {scheme.transactionId}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div
                              data-tip="Statement Of  Account"
                              tabIndex={0}
                              role="button"
                              className="btn btn-sm btnStyle py-0 px-2 text-xs text-primary font-normal border-0 rounded-lg tooltip tooltip-bottom"
                            >
                              SOA
                            </div>

                            <div
                              data-tip="Invest Online"
                              className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                              onClick={(event: any) => {
                                addToCart(scheme.transactionId);
                              }}
                            >
                              <IoCartOutline size={16} className="text-white" />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <span className="font-medium ">
                            {scheme.schemeName}
                          </span>
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.balanceUnits.toFixed(3)}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.purchaseNav.toFixed(4)}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.currentNav.toFixed(4)}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.purchaseValue.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.currentValue.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {scheme.gain}
                        </td>
                        <td className="p-3 text-sm text-right">
                          {scheme.holdingDays}
                        </td>
                        <td className="p-3 text-sm  text-right">
                          {scheme.absReturn}
                        </td>
                        <td className="p-3  text-sm text-right">
                          {scheme.cagr}
                        </td>
                      </tr>

                      {/* Transaction Details */}
                      {expandedFolios.has(scheme.transactionId) &&
                        scheme.transactions.map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50 text-sm">
                            <td className="p-2 pl-12 text-sm">
                              {transaction.date}
                            </td>
                            <td className="p-2 text-sm ">{transaction.type}</td>
                            <td className="p-2 text-right text-sm">
                              {transaction.units.toFixed(3)}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.nav.toFixed(4)}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {scheme.currentNav.toFixed(4)}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.purchaseValue.toLocaleString()}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.currentValue.toLocaleString()}
                            </td>
                            <td className="p-2 text-sm text-right ">
                              {transaction.gain}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.days}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.absReturn}
                            </td>
                            <td className="p-2 text-sm text-right">
                              {transaction.cagr}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}

                  {/* Sub Total - Category */}
                  <tr className=" hover:bg-gray-50 font-medium border-b-2 ">
                    <td
                      colSpan={3}
                      className="px-2 py-4 text-right text-sm  font-semibold"
                    >
                      Sub Total - {investor.category} :
                    </td>
                    <td colSpan={3} className="p-2 text-right">
                      1,100
                    </td>
                    <td className="p-2 text-right text-sm">1,158</td>
                    <td className="p-2 text-right text-sm">59</td>
                    <td className="p-2 text-right text-sm">271</td>
                    <td className="p-2 text-right text-sm">5.35</td>
                    <td className="p-2 text-right text-sm">7.22</td>
                  </tr>

                  {/* Sub Total - Investor */}
                  <tr className="hover:bg-gray-50 bg-white font-medium border-b-2">
                    <td className="py-4 text-sm text-start font-semibold">
                      Sub Total - {investor.investorName} :
                    </td>
                    <td colSpan={5} className="p-2 text-right">
                      1,100
                    </td>
                    <td className="p-2 text-right text-sm">1,158</td>
                    <td className="p-2 text-right text-sm">59</td>
                    <td className="p-2 text-right text-sm">271</td>
                    <td className="p-2 text-right text-sm">5.35</td>
                    <td className="p-2 text-right text-sm">7.22</td>
                  </tr>
                </>
              </React.Fragment>
            ))}

            {/* Grand Total */}
            <tr className="hover:bg-gray-50 font-bold text-base-content text-sm border-b-2 border-accent-content">
              <td colSpan={5} className="px-2 py-4  text-sm text-right">
                Grand Total :
              </td>
              <td className="p-3 text-right">1,100</td>
              <td className="p-3 text-right">1,158</td>
              <td className="p-3 text-right ">59</td>
              <td className="p-3 text-right">271</td>
              <td className="p-3 text-right">5.35</td>
              <td className="p-3 text-right">7.22</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CapitalGainRealize;
