"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import CustomText from "@/commonUI/Text";
import { useRouter, useSearchParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { IoArrowBack, IoCartOutline } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { LuArrowUpDown } from "react-icons/lu";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import {
  convertToCrores,
  toFixedData,
  toFixedDataForReturn,
  USER_DATA,
} from "@/utils/constants";
import Pagination from "@/components/commonGrid/components/pagination";
import { MdViewColumn } from "react-icons/md";
import AccountContext from "@/context/AccountContext/Account.context";
import SipPopup from "@/components/fund-explore/sipDetail";
import PurchaseDetailPopup from "@/components/fund-explore/purchaseDetail";
import InvestorPopup from "@/components/fund-explore/investor";
import { FiFilter } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import CustomCheckbox from "@/commonUI/CheckBox";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ReturnColumnKey =
  | "return1day"
  | "return7days"
  | "return1month"
  | "return3months"
  | "return6months"
  | "return1y"
  | "return2y"
  | "return3y"
  | "return5y"
  | "return7y"
  | "return10y";

const AMCSchemeDetail = () => {
  const [activeTab, setActiveTab] = useState("Schemes Overview");
  const [categoryActiveTab, setCategoryActiveTab] = useState("Equity");

  const router = useRouter();
  const searchParams = useSearchParams();

  const amc_id: any = searchParams.get("id");
  // const tabs = ["Schemes Overview", "Overview", "Key Person", "AUM"];
  const tabs = ["Schemes Overview", "Overview"];

  const [amcData, setAMCData] = useState<any>([]);
  const [overViewData, setOverViewData] = useState<any>({});
  const [sortConfig, setSortConfig] = useState<any>({
    key: null,
    sort: "DESC",
  });
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  let [exportData, setexportData] = useState<any>([]);

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);
  const [showSipPopup, setShowSipPopup] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectSubCategory, setSelectSubCategory] = useState<any>([]);
  const [exportXLSLoading, setExportXLSLoading] = useState(false);

  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

  const [visibleColumns, setVisibleColumns] = useState<
    Record<ReturnColumnKey, boolean>
  >({
    return1day: false,
    return7days: false,
    return1month: false,
    return3months: false,
    return6months: false,
    return1y: true,
    return2y: true,
    return3y: true,
    return5y: true,
    return7y: false,
    return10y: true,
  });

  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(25);
  let [totalCount, setTotalCount] = useState(0);
  // // Mock data for SBI Mutual Fund

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    debounceTimer = setTimeout(async () => {
      if (amc_id) {
        getAMCDetail();
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [amc_id, filters, page, categoryActiveTab, sortConfig]);

  useEffect(() => {
    if (amcData) {
      onChangeActiveClasses();
    }
  }, [amcData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(".dropdown-content");
      const button = document.querySelector(".columns-button");

      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        setShowColumnsDropdown(false);
      }
    };

    if (showColumnsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnsDropdown]);

  useEffect(() => {
    if (exportData.length > 0) {
      exportToExcel();
    }
  }, [exportData]);

  const getAMCDetail = async () => {
    try {
      const param = {
        filters: filters ? JSON.stringify(filters) : false,
        limit: limit,
        sort: sortConfig.key
          ? JSON.stringify({ [sortConfig.key]: sortConfig.order })
          : JSON.stringify({ "SchemePerformances.Returns3yr": "DESC" }),
        page: page,
      };

      let res: any = await api.get(
        `/mutual-fund/get-scheme-by-amc-id/${amc_id}`,
        { params: param }
      );
      if (res.data.data) {
        setAMCData(res.data.data.categoryData);
        setOverViewData(res.data.data.overview);
        // setTotalCount(res.data.data?.schemeList?.count);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const activeClass: any =
    amcData?.find((fc: any) => fc.categoryName === categoryActiveTab) ||
    amcData[0];

  const onChangeActiveClasses = () => {
    const activeClass: any =
      amcData?.find((fc: any) => fc.categoryName === categoryActiveTab) ||
      amcData[0];
    if (activeClass) {
      let schemeTotalCount: any = activeClass?.schemeList.count;
      // setPage(1);
      setTotalCount(schemeTotalCount);
    }
  };

  const visibleColumnsCount =
    Object.values(visibleColumns).filter(Boolean).length;

  const onChangeSorting = (key: string) => {
    // console.log(key);
    setSortConfig((prev: { key: string; order: string }) => {
      // 1st click: asc → 2nd: desc → 3rd: reset (null)
      if (prev.key === key && prev.order === "ASC") {
        return { key, order: "DESC" };
      } else if (prev.key === key && prev.order === "DESC") {
        return { key: null, order: null }; // reset to default
      } else {
        return { key, order: "ASC" };
      }
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <>
          <LuArrowUpDown size={15} className="text-black" />
        </>
      );
    }
    return sortConfig.order === "ASC" ? (
      <GoArrowUp size={15} className="text-black" />
    ) : (
      <GoArrowDown size={15} className="text-black" />
    );
  };

  const handleColumnToggle = (columnKey: ReturnColumnKey) => {
    console.log(columnKey, "columnKey");
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const handleNavigateFundDetail = (item: any) => {
    // setNavigateLoader(true);
    router.push(`/fund-detail?id=${item?.id}&tab=NAV`);
    // setNavigateLoader(false);
  };

  const addToCart = async (schemeId: number) => {
    try {
      const userData: any = getLS(USER_DATA);
      // console.log(userData, "userDatauserData");

      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeId,
        trans_type: 1,
      };
      console.log(CartObj);

      let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
      if (addCartData.data.data) {
        toastAlert("success", "Added To Cart");
        setCartCounter(cartCounter + 1);
      } else {
        toastAlert("info", "Unable to add in cart, please try again later!");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const onActiveTabHandle = (tab: any) => {
    // setPage(1);
    setTotalCount(0);

    if (categoryActiveTab !== tab) {
      setFilters(undefined);
      setSelectSubCategory([]);
      const matchedCategory: any = amcData.find(
        (item: any) => item.categoryName === tab
      );
      if (matchedCategory) {
        setPage(1);
        setTotalCount(matchedCategory.schemeList.count);
      }
    }
    setCategoryActiveTab(tab);
  };

  const handleSubCategoryChange = (subCategoryId: number) => {
    let updatedSubCategories;

    //  if (event.target.checked) {
    //   setSelectSubCategory((prev) => [...prev, id]);
    // } else {
    //   setSelectSubCategory((prev) => prev.filter((item) => item !== id));
    // }

    if (selectSubCategory.includes(subCategoryId)) {
      updatedSubCategories = selectSubCategory.filter(
        (id: number) => id !== subCategoryId
      );
    } else {
      updatedSubCategories = [...selectSubCategory, subCategoryId];
    }

    setSelectSubCategory(updatedSubCategories);
  };

  const resetFilter = () => {
    setSelectSubCategory([]);
    setFilters(undefined);
    setIsDrawerOpen(false);
  };

  const applyFilter = (e: any) => {
    if (selectSubCategory && selectSubCategory.length > 0) {
      const payloadObj: any = {
        ...(filters || {}),
        subCategory: selectSubCategory,
      };

      setFilters(payloadObj);
    } else {
      setFilters(undefined); // ✅ clear all filters
    }
    setIsDrawerOpen(false);
  };

  const onChangeSearch = (event: any) => {
    if (event.target.value) {
      // setSearch(event.target.value);
      const payloadObj = {
        ...filters,
        ...{ ms_fullname: event.target.value },
      };
      setFilters(payloadObj);
    } else {
      const { ms_fullname, ...rest } = filters;
      setFilters(rest);
    }
  };

  const ExportSchemeData = async () => {
    try {
      // if(exportType === 'PDF') {
      //   setExportPDFLoading(true);
      // } else {
      //   setExportXLSLoading(true);
      // }

      if (activeClass.schemeList.rows) {
        setexportData(activeClass.schemeList.rows);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  //create headers for excel
  const createHeader = () => {
    let headers = [
      "Scheme",
      "Rating",
      "Nav",
      "AUM (Cr.)",
      "Exp. Ratio",
      "Launch Date",
    ];

    if (visibleColumns.return1day) {
      headers.push("Rtn1Day");
    }
    if (visibleColumns.return7days) {
      headers.push("Rtn1Week");
    }
    if (visibleColumns.return1month) {
      headers.push("Rtn1mth");
    }
    if (visibleColumns.return3months) {
      headers.push("Rtn3mth");
    }
    if (visibleColumns.return6months) {
      headers.push("Rtn6mth");
    }
    if (visibleColumns.return1y) {
      headers.push("Rtn1yr");
    }
    if (visibleColumns.return2y) {
      headers.push("Rtn2yr");
    }
    if (visibleColumns.return3y) {
      headers.push("Rtn3yr");
    }
    if (visibleColumns.return5y) {
      headers.push("Rtn5yr");
    }
    if (visibleColumns.return7y) {
      headers.push("Rtn7yr");
    }
    if (visibleColumns.return10y) {
      headers.push("Rtn10yr");
    }
    if (visibleColumns.return10y) {
      headers.push("Since Incep");
    }

    return headers;
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExportXLSLoading(true);
      let list: any = exportData;
      if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          let obj: any = {};
          obj.Scheme = list[i].ms_fullname;
          // obj.category = list[i].scheme_subcategory?.name
          obj["Rating"] =
            list[i].SchemePerformances[0]?.OverallRating == null
              ? "-"
              : list[i].SchemePerformances[0]?.OverallRating;
          obj["Nav"] = toFixedData(list[i]?.SchemePerformances[0]?.Nav);
          obj["AUM (Cr.)"] = convertToCrores(
            list[i]?.SchemePerformances[0]?.AUM
          );
          obj["Exp. Ratio"] = toFixedData(list[i]?.net_expense_ratio);
          obj["Launch Date"] = list[i]?.inception_date
            ? (() => {
                const d = new Date(list[i]?.inception_date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()
            : "--";

          if (visibleColumns.return1day)
            obj.Rtn1Day = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return1d
            );
          if (visibleColumns.return7days)
            obj.Rtn1Week = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return1w
            );
          if (visibleColumns.return1month)
            obj.Rtn1mth = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return1mth
            );
          if (visibleColumns.return3months)
            obj.Rtn3mth = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return3mth
            );
          if (visibleColumns.return6months)
            obj.Rtn6mth = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return6mth
            );
          if (visibleColumns.return1y)
            obj.Rtn1yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Return1yr
            );
          if (visibleColumns.return2y)
            obj.Rtn2yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Returns2yr
            );
          if (visibleColumns.return3y)
            obj.Rtn3yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Returns3yr
            );
          if (visibleColumns.return5y)
            obj.Rtn5yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Returns5yr
            );
          if (visibleColumns.return7y)
            obj.Rtn7yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Returns7yr
            );
          if (visibleColumns.return10y)
            obj.Rtn10yr = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.Returns10yr
            );
          if (visibleColumns.return10y)
            obj.RtnMax = toFixedDataForReturn(
              list[i]?.SchemePerformances[0]?.ReturnSinceIncep
            );

          list[i] = obj;
        }
      }

      let Heading: any = [];
      let headerNames = await createHeader();
      Heading.push(headerNames);

      const wb = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, Heading);

      //Starting in the second row to avoid overriding and skipping headers
      XLSX.utils.sheet_add_json(ws, list, { origin: "A2", skipHeader: true });

      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Funds.xlsx");
      setExportXLSLoading(false);

      // }
    } catch (error) {
      setExportXLSLoading(false);
      console.log("export", error);
    } finally {
      // setExportLoading(false);
    }
  };

  const renderSchemesOverview = () => (
    <>
      <div className="flex justify-between items-center px-4">
        <div
          role="tablist"
          className="tabs tabs-bordered flex px-4 gap-0 mt-0 "
        >
          {amcData?.map((tab: any, index: number) => (
            <div key={index} className="flex items-center">
              <a
                role="tab"
                onClick={() => onActiveTabHandle(tab.categoryName)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  categoryActiveTab === tab.categoryName
                    ? "text-primary border-primary"
                    : "text-gray-600 hover:text-gray-800 border-transparent"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <span>{tab.categoryName}</span>

                  {categoryActiveTab === tab.categoryName ? (
                    <div className="drawer drawer-end z-40 ">
                      <input
                        id="my-drawer-4"
                        type="checkbox"
                        className="drawer-toggle "
                        checked={isDrawerOpen}
                        onChange={() => setIsDrawerOpen(!isDrawerOpen)}
                      />
                      <div className="drawer-content">
                        <button
                          data-tip="Filter"
                          tabIndex={0}
                          // className="btn btn-sm rounded-xl btnStyle p-0 px-2 h-[34px] sm:h-[40px] tooltip tooltip-top"
                          className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-top"
                          // onClick={() => setDrawerOpen(true)}
                          onClick={() => setIsDrawerOpen(true)}
                        >
                          <FiFilter
                            size={14}
                            className="text-primary text-lg sm:text-2xl"
                          />
                        </button>
                      </div>

                      <div className="drawer-side">
                        <label
                          htmlFor="my-drawer-4"
                          aria-label="close sidebar"
                          className="drawer-overlay"
                        ></label>
                        <ul className="menu rounded-l-2xl bg-white text-base-content min-h-full w-96 ">
                          <div className="flex justify-between items-center px-4">
                            <h3 className="text-lg font-medium font-montserrat">
                              {categoryActiveTab}
                            </h3>
                            <button
                              className="btn btn-sm btn-circle btn-ghost"
                              onClick={() => setIsDrawerOpen(false)}
                            >
                              <IoMdClose size={15} />
                            </button>
                          </div>
                          <div className="mt-2 h-[1px] w-full bg-accent"></div>

                          <div className="overflow-y-auto h-[calc(100vh-140px)] p-4">
                            <div className="mb-6">
                              {activeClass.subCategoryList?.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 ml-6">
                                  {activeClass.subCategoryList?.map(
                                    (item: any) => (
                                      <div
                                        key={item.Id}
                                        className="flex items-center"
                                      >
                                        <CustomCheckbox
                                          label={item.Name}
                                          checked={selectSubCategory.includes(
                                            Number(item.Id)
                                          )}
                                          onChange={() =>
                                            handleSubCategoryChange(
                                              Number(item.Id)
                                            )
                                          }
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mb-2 h-[1px] w-full bg-accent"></div>

                          <div className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                className="btn btn-outline w-full rounded-lg border-border"
                                onClick={resetFilter}
                              >
                                Reset
                              </button>
                              <button
                                className="btn bg-primary hover:bg-primary text-white border-none w-full rounded-lg"
                                onClick={(e) => applyFilter(e)}
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              </a>
              {/* {tab} */}
            </div>
          ))}
        </div>
        <div>
          <input
            type="search"
            className="grow bg-transparent border border-accent rounded-xl py-1 focus:outline-none px-3 sm:min-w-80 sm:min-h-10"
            placeholder="Search"
            onChange={(e) => onChangeSearch(e)}
          />
        </div>
      </div>

      <div className="shadow-none overflow-hidden rounded-lg">
        <div className="overflow-auto h-[calc(100vh-230px)] 2xl:h-[calc(100vh-280px)]">
          <table className="table table-pin-rows">
            <thead className="thead ">
              <tr>
                <th rowSpan={2} className="text-left">
                  <div className="tableHeaderClass min-w-64 sm:min-w-[300px]">
                    <div>Fund Name</div>

                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("ms_fullname");
                      }}
                    >
                      {getSortIcon("ms_fullname")}
                    </div>
                  </div>
                </th>
                <th rowSpan={2}></th>
                <th rowSpan={2}>
                  <div className="tableHeaderClass">
                    <div>Rating</div>
                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("SchemePerformances.OverallRating");
                      }}
                    >
                      {getSortIcon("SchemePerformances.OverallRating")}
                    </div>
                  </div>
                </th>
                <th rowSpan={2}>
                  <div className="tableHeaderClass">
                    <div>NAV</div>
                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("SchemePerformances.Nav");
                      }}
                    >
                      {getSortIcon("SchemePerformances.Nav")}
                    </div>
                  </div>
                </th>
                <th rowSpan={2}>
                  <div className="tableHeaderClass">
                    <div>AUM (Cr.)</div>
                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("SchemePerformances.AUM");
                      }}
                    >
                      {getSortIcon("SchemePerformances.AUM")}
                    </div>
                  </div>
                </th>

                <th rowSpan={2}>
                  <div className="tableHeaderClass">
                    <div>Exp. Ratio</div>
                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("SchemePerformances.AUM");
                      }}
                    >
                      {getSortIcon("SchemePerformances.AUM")}
                    </div>
                  </div>
                </th>

                {visibleColumnsCount > 0 && (
                  <th colSpan={visibleColumnsCount} className="mergeTh">
                    Return
                  </th>
                )}
                {visibleColumns.return10y && (
                  <th rowSpan={2}>
                    <div className="tableHeaderClass">
                      <div>Since Incep</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting(
                            "SchemePerformances.ReturnSinceIncep"
                          );
                        }}
                      >
                        {getSortIcon("SchemePerformances.ReturnSinceIncep")}
                      </div>
                    </div>
                  </th>
                )}
                <th rowSpan={2}>
                  <div className="tableHeaderClass">
                    <div>Launch Date</div>
                    <div
                      className="sorting cursor-pointer"
                      onClick={() => {
                        onChangeSorting("inception_date");
                      }}
                    >
                      {getSortIcon("inception_date")}
                    </div>
                  </div>
                </th>
              </tr>
              <tr className="top-11">
                {visibleColumns.return1day && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>1D</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return1d");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return1d")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return7days && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>7D</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return1w");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return1w")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return1month && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>1M</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return1mth");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return1mth")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return3months && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>3M</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return2mth");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return2mth")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return6months && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>6M</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return6mth");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return6mth")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return1y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>1Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Return1yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return1yr")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return2y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>2Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Returns2yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Returns2yr")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return3y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>3Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Returns3yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Returns3yr")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return5y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>5Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Returns5yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Returns5yr")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return7y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>7Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Returns7yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Returns7yr")}
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.return10y && (
                  <th className="colTh">
                    <div className="tableHeaderClass">
                      <div>10Y</div>
                      <div
                        className="sorting cursor-pointer"
                        onClick={() => {
                          onChangeSorting("SchemePerformances.Returns10yr");
                        }}
                      >
                        {getSortIcon("SchemePerformances.Return10syr")}
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white mb-4">
              {activeClass?.schemeList?.rows ? (
                activeClass?.schemeList?.rows.map(
                  (fund: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div
                            className="text-base font-medium text-secondary-content cursor-pointer"
                            onClick={(e: any) => handleNavigateFundDetail(fund)}
                          >
                            {fund.ms_fullname}
                          </div>
                          <div className="text-xs mt-1">
                            {fund?.SchemeSubcategory?.Name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex gap-3">
                          <div>
                            {/* <div tabIndex={0} role="button" className="btn m-1">Click  ⬇️</div> */}
                            <div
                              data-tip="Transact"
                              tabIndex={0}
                              role="button"
                              className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                              onClick={() => {
                                setSelectedScheme(fund);
                                setshowInvestorPopup(true);
                              }}
                            >
                              <GrTransaction
                                size={14}
                                className="text-primary"
                              />
                            </div>
                          </div>
                          <div
                            data-tip="Add to Cart"
                            className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                            onClick={(event: any) => {
                              addToCart(fund?.id);
                            }}
                          >
                            <IoCartOutline size={16} className="text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {fund?.SchemePerformances?.[0]?.OverallRating ? (
                            <>
                              {fund?.SchemePerformances?.[0]?.OverallRating}
                              <FaStar className="text-primary text-lg" />
                            </>
                          ) : (
                            "--"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm">
                          {toFixedData(fund?.SchemePerformances?.[0]?.Nav)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm">
                          {convertToCrores(fund?.SchemePerformances?.[0]?.AUM)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm">
                          {toFixedData(fund?.net_expense_ratio)}
                        </div>
                      </td>

                      {visibleColumns.return1day && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return1d
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return7days && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return1w
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return1month && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return1mth
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return3months && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return3mth
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return6months && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return6mth
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return1y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Return1yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return2y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Returns2yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return3y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Returns3yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return5y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Returns5yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return7y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Returns7yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return10y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.Returns10yr
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.return10y && (
                        <td>
                          <div className="flex justify-center items-center gap-2 mx-auto">
                            {toFixedDataForReturn(
                              fund?.SchemePerformances?.[0]?.ReturnSinceIncep
                            )}
                          </div>
                        </td>
                      )}

                      <td className="px-4 py-4 text-center">
                        <CustomText className="text-sm">
                          {" "}
                          {fund.inception_date
                            ? (() => {
                                const d = new Date(fund.inception_date);
                                const day = String(d.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                const month = String(d.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const year = d.getFullYear();
                                return `${day}/${month}/${year}`;
                              })()
                            : "--"}
                        </CustomText>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr className="text-center">
                  <td colSpan={5}>Data Not Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          totalCount={totalCount}
          limit={limit}
          page={page}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );

  const renderOverview = () => (
    <div className="space-y-8 p-6">
      <div>
        <CustomText className="text-lg font-semibold text-gray-900 mb-6">
          AMC Overview
        </CustomText>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">
                AMC Name
              </CustomText>
              <CustomText className="text-sm font-medium">
                {overViewData.amc_name}
              </CustomText>
            </div>
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">
                Number of schemes
              </CustomText>
              <CustomText className="text-sm font-medium">
                {overViewData.total_schemes}
              </CustomText>
            </div>
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">AUM</CustomText>
              <CustomText className="text-sm font-medium ">
                {convertToCrores(overViewData.total_AUM)} Cr.
              </CustomText>
            </div>
            {/* <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Inception Date</CustomText>
              <CustomText className="text-sm font-medium">{overViewData.inceptionDate}</CustomText>
            </div> */}
            {/* <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Trustee Name</CustomText>
              <CustomText className="text-sm font-medium">{overViewData.trusteeName}</CustomText>
            </div>
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Sponsor Name</CustomText>
              <CustomText className="text-sm font-medium">{overViewData.sponsorName}</CustomText>
            </div> */}
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Fax</CustomText>
              <CustomText className="text-sm font-medium">
                {overViewData.fax || "--"}
              </CustomText>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">
                Office Address
              </CustomText>
              <CustomText className="text-sm font-medium text-right max-w-xs">
                {overViewData.office_address || "--"}
              </CustomText>
            </div>
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">City</CustomText>
              <CustomText className="text-sm font-medium">
                {overViewData.city || "--"}
              </CustomText>
            </div>
            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Contact</CustomText>
              <CustomText className="text-sm font-medium">
                {overViewData.contact || "--"}
              </CustomText>
            </div>

            <div className="flex justify-between border border-gray-50 bg-gray-50 p-4 rounded-lg">
              <CustomText className="text-sm font-semibold">Website</CustomText>
              <CustomText className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                {overViewData.website || "--"}
              </CustomText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyPerson = () => (
    <div className="p-6">
      <CustomText className="text-lg font-semibold text-gray-900 mb-6">
        Key Personnel
      </CustomText>
      <div className="space-y-6">
        {amcData.keyPersonnel.map((person: any) => (
          <div
            key={person.id}
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div
              className={`w-12 h-12 ${person.bgColor} rounded-full flex items-center justify-center text-white font-semibold text-lg`}
            >
              {person.initials}
            </div>
            <div className="flex-1">
              <CustomText className="text-base font-semibold text-gray-900 mb-1">
                {person.name}
              </CustomText>
              <CustomText className="text-sm mb-2">
                {person.designation}
              </CustomText>
              <CustomText className="text-xs text-gray-600">
                {person.experience}
              </CustomText>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAUM = () => (
    <div className="p-6">
      <CustomText className="text-lg font-semibold text-gray-900 mb-6">
        Assets Under Management (AUM)
      </CustomText>
      <div className="space-y-4">
        {amcData.aumData.map((item: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <CustomText className="text-sm font-medium text-gray-900">
              {item.month}
            </CustomText>
            <div className="flex items-center gap-4 ml-8">
              <CustomText className="text-sm font-semibold text-gray-900  w-24 text-right">
                {item.amount}
              </CustomText>
              {/* <div className="flex-1 bg-gray-200 rounded-full h-2"> */}
              <div className="flex-1">
                <progress
                  className="progress progress-secondary-content w-56"
                  value="100"
                  max="100"
                ></progress>
                {/* <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${85 + index * 2}%` }}
                ></div> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Schemes Overview":
        return renderSchemesOverview();
      case "Overview":
        return renderOverview();
      // case "Key Person":
      //   return renderKeyPerson();
      // case "AUM":
      //   return renderAUM();
      default:
        return renderSchemesOverview();
    }
  };

  const onBack = () => {
    router.back();
  };

  return (
    <>
      <div className="">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div onClick={onBack} className="p-1 cursor-pointer">
                <IoArrowBack className="w-5 h-5 text-gray-600" />
              </div>
              <CustomText className="text-lg font-semibold text-gray-900">
                {overViewData?.amc_name}
              </CustomText>
            </div>
            {/* </div>

          <div className="flex justify-between items-center"> */}
            <div
              role="tablist"
              className="tabs tabs-bordered flex px-4 gap-2 mt-0"
            >
              {tabs.map((tab) => (
                <div key={tab} className="flex items-center">
                  <a
                    role="tab"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border transition-all cursor-pointer rounded-xl  ${
                      activeTab === tab
                        ? "text-white border-primary bg-primary"
                        : "text-gray-600 hover:text-gray-800 border-transparent  bg-black/5"
                    }`}
                  >
                    {tab}
                  </a>
                  {/* {tab} */}
                </div>
              ))}
            </div>

            <div className="min-w-48 flex justify-end">
              {activeTab === "Schemes Overview" && (
                <div className="flex gap-5">
                  <div
                    data-tip="Excel"
                    tabIndex={0}
                    role="button"
                    className="relative z-10 tooltip tooltip-bottom"
                  >
                    <button
                      className="btn rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
                      type="button"
                      onClick={() => {
                        ExportSchemeData();
                      }}
                    >
                      {exportXLSLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>{" "}
                          loading
                        </>
                      ) : (
                        <>
                          <RiFileExcel2Line className="text-primary text-lg sm:text-2xl" />
                        </>
                      )}
                      {/* <FaFileExport /> XLS */}
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      className="btn rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
                      type="button"
                      onClick={() =>
                        setShowColumnsDropdown(!showColumnsDropdown)
                      }
                    >
                      <MdViewColumn className="text-primary text-lg sm:text-2xl" />
                    </button>
                    {showColumnsDropdown && (
                      <div className="dropdown-content menu bg-mainbackground rounded-box w-60 py-4 px-0 shadow absolute right-0 top-full mt-1 z-[100]">
                        <button
                          className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() => setShowColumnsDropdown(false)}
                          type="button"
                        >
                          ✕
                        </button>
                        <div className="font-semibold mb-3 px-4">Return</div>
                        <div className="space-y-2 overflow-y-auto max-h-[50vh] px-4">
                          {[
                            { key: "return1day", label: "Return 1 Day" },
                            { key: "return7days", label: "Return 1 Week" },
                            { key: "return1month", label: "Return 1 Month" },
                            { key: "return3months", label: "Return 3 Months" },
                            { key: "return6months", label: "Return 6 Months" },
                            { key: "return1y", label: "Return 1 Year" },
                            { key: "return2y", label: "Return 2 Years" },
                            { key: "return3y", label: "Return 3 Years" },
                            { key: "return5y", label: "Return 5 Years" },
                            { key: "return7y", label: "Return 7 Years" },
                            { key: "return10y", label: "Return 10 Years" },
                            // { key: "ReturnSinceIncep", label: "Return Since Incep" },
                          ].map((col) => (
                            <label key={col.key} className="label my-2">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-info border-gray-500 before:bg-white checked:border-info"
                                checked={
                                  visibleColumns[col.key as ReturnColumnKey]
                                }
                                onChange={() =>
                                  handleColumnToggle(col.key as ReturnColumnKey)
                                }
                              />
                              <span className="text-sm text-black">
                                {col.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="">{renderTabContent()}</div>
      </div>

      <PurchaseDetailPopup
        modalId="purchaseDetailModal"
        showTriggerButton={false}
        schemeData={selectedScheme}
      />

      {showSipPopup && (
        <SipPopup
          schemeData={selectedScheme}
          open={showSipPopup}
          onClose={() => setShowSipPopup(false)}
        />
      )}

      {showInvestorPopup && (
        <InvestorPopup
          schemeData={selectedScheme}
          open={showInvestorPopup}
          onClose={() => setshowInvestorPopup(false)} investor={undefined}        />
      )}
    </>
  );
};

export default AMCSchemeDetail;
