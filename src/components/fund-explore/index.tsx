"use client";

import type { NextPage } from "next";
import { Fragment, useContext, useEffect, useState } from "react";

import { FaFileExport, FaStar } from "react-icons/fa";

import style from "./FundExplore.module.scss";

import { getFundPickerData } from "@/api/fund-picker";
import { useRouter } from "next/navigation";
import { BsBank, BsFileEarmarkPdf } from "react-icons/bs";
import { FiFilter, FiPlus } from "react-icons/fi";
import { MdArrowDropDown, MdArrowDropUp, MdViewColumn } from "react-icons/md";
import "react-range-slider-input/dist/style.css";
import Pagination from "../commonGrid/components/pagination";
import FundPickerFilter from "./fundPickerFilter";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import { LuArrowUpDown } from "react-icons/lu";
import PurchaseDetailPopup from "./purchaseDetail";
import SipPopup from "./sipDetail";
import { GrTransaction } from "react-icons/gr";
import { IoCartOutline } from "react-icons/io5";
import {
  ADMIN_INVESTER_DATA,
  NODE_API_URL,
  USER_DATA,
  publicPathName,
  toFixedData,
} from "@/utils/constants";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import api from "@/utils/api";
import AccountContext from "@/context/AccountContext/Account.context";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RiFileExcel2Line } from "react-icons/ri";
import InvestorPopup from "./investor";

const FundPicker: NextPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSipPopup, setShowSipPopup] = useState(false);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);

  const [sortConfig, setSortConfig] = useState<any>({
    key: null,
    sort: "DESC",
  });

  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(50);
  let [totalCount, setTotalCount] = useState(0);
  let [schemeData, setSchemeData] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  let [search, setSearch] = useState("");
  let [payload, setPayload] = useState<any>();
  let [exportData, setexportData] = useState<any>([]);
  const [exportType, setExportType] = useState<any>();
  const [exportXLSLoading, setExportXLSLoading] = useState(false);
  const [exportPDFLoading, setExportPDFLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminInvesterFilter, setAdminInvesterFilter] = useState<any>();
  const [sipModalKey, setSipModalKey] = useState(0);

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

  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
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

  const router = useRouter();

  const [loader, setLoader] = useState(true);

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    debounceTimer = setTimeout(async () => {
      getSchemeData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [payload, page, sortConfig]);

  useEffect(() => {
    getAdminInvesterFilter();
  }, []);

  useEffect(() => {
    if (exportData.length > 0 && exportType === "XLS") {
      exportToExcel();
    } else if (exportData.length > 0 && exportType === "PDF") {
      exportToPDF();
    }
  }, [exportData]);

  const onChangeSearch = (event: any) => {
    if (event.target.value) {
      setSearch(event.target.value);
      const payloadObj = { ...payload, ...{ ms_fullname: event.target.value } };
      setPayload(payloadObj);
    } else {
      const { ms_fullname, ...rest } = payload;
      // const payloadObj = { ...payload };
      // console.log(payloadObj,"payloadObjpayloadObj")
      setPayload(rest);
    }
  };

  const getAdminInvesterFilter = () => {
    try {
      const adminFilterData = getLS(ADMIN_INVESTER_DATA);

      if (adminFilterData) {
        const admin_filter = JSON.parse(adminFilterData.filter_data);

        // setAdminInvesterFilter(admin_filter ? admin_filter : '');

        payload = { ...payload, ...admin_filter };
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const getSchemeData = async () => {
    try {
      setLoader(true);
      const savedFilters = localStorage.getItem("fundPickerFilters");

      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.categoryid && parsedFilters.categoryid.length > 0) {
          payload = { ...payload, ...{ categoryid: parsedFilters.categoryid } };
        }

        if (
          parsedFilters.subcategory_id &&
          parsedFilters.subcategory_id.length > 0
        ) {
          payload = {
            ...payload,
            ...{ subcategory_id: parsedFilters.subcategory_id },
          };
        }
        if (parsedFilters.amc_id) {
          payload = { ...payload, ...{ amc_id: parsedFilters.amc_id } };
        }

        if (parsedFilters.option_id) {
          payload = { ...payload, ...{ option_id: parsedFilters.option_id } };
        }
      }
      const param = {
        filters: payload ? JSON.stringify(payload) : false,
        limit: limit,
        sort: sortConfig.key
          ? JSON.stringify({ [sortConfig.key]: sortConfig.order })
          : JSON.stringify({ "SchemePerformances.Returns3yr": "DESC" }),
        page: page,
      };
      const data = await getFundPickerData(param);
      if (data.data) {
        setSchemeData(data?.data?.data?.rows);
        setTotalCount(data?.data?.data?.count);
        ExportSchemeData();
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  const convertToCrores = (number: number) => {
    const crore = 10000000;
    const crores = number / crore;
    return crores?.toFixed(2);
  };

  const toFixedDataForReturn = (number: number) => {
    return number ? `${number?.toFixed(2)}%` : "--";
  };

  const handleColumnToggle = (columnKey: ReturnColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const visibleColumnsCount =
    Object.values(visibleColumns).filter(Boolean).length;

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

  const handleOpenModal = (schemeData: any) => {
    setSelectedScheme(schemeData);
    const modal = document.getElementById(
      "purchaseDetailModal"
    ) as HTMLDialogElement;
    modal?.showModal();
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
      console.log(CartObj)

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

  const ExportSchemeData = async () => {
    try {
      // if(exportType === 'PDF') {
      //   setExportPDFLoading(true);
      // } else {
      //   setExportXLSLoading(true);
      // }
      let filters: any = getLS("fundPickerFilters");

      const adminFilterData = getLS(ADMIN_INVESTER_DATA);

      if (adminFilterData && adminFilterData.filter_data) {
        const admin_filter = JSON.parse(adminFilterData.filter_data);
        filters = { ...filters, ...admin_filter };
        payload = { ...payload, ...admin_filter };
      }

      const param = {
        filters: payload
          ? JSON.stringify(payload)
          : filters
            ? JSON.stringify(filters)
            : false,
        limit: limit,
        sort: sortConfig.key
          ? JSON.stringify({ [sortConfig.key]: sortConfig.order })
          : JSON.stringify({ "SchemePerformances.Returns3yr": "DESC" }),
        page: page,
        forExcel: true,
      };
      const data = await getFundPickerData(param);

      // const data = await api.get(`/fund-picker/get-FundPicker-schemes-export?data=${obj}`);
      if (data.data) {
        // if(exportType === 'PDF') {
        //   setExportPDFLoading(false)
        // } else {
        //   setExportXLSLoading(false);
        // }
        setexportData(data?.data?.data);
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

  const exportToPDF = async () => {
    try {
      setExportPDFLoading(true);
      let body = {
        exportData: exportData,
        visibleColumns: visibleColumns,
        visibleColumnsCount: visibleColumnsCount,
      };

      let getPDF: any = await api.post(
        `/fund-picker/get-FundPicker-schemes-pdf-export`,
        body
      );

      if (getPDF.data.data) {
        setExportPDFLoading(false);
        saveAs(
          `${NODE_API_URL}/static/Fundpdf/${getPDF.data.data}`,
          getPDF.data.data
        );
      }
    } catch (error) {
      setExportPDFLoading(false);
      handleServerError(error);
    }
  };

  const handleNavigateSchemeDetail = (item: any, e: any, payload: any) => {
    const benchmarkids = item?.SchemeBenchmarksMappings?.map(
      (item: any) => item.benchmark_id_FK
    );

    router.push(
      `/scheme-detail?id=${item.id}&tab=NAV`
    );

    // router.push(
    //   `/scheme-detail?id=${item.id}&isin=${item.schemeISIN}&selectCategory=${item?.categoryid
    //   }&selectSubCategory=${JSON.stringify([
    //     item?.subcategory_id,
    //   ])}&benchmark_id=${JSON.stringify([benchmarkids])}&scheme_type=${item?.scheme_type
    //   }&name=${item?.name}&ms_fullname=${item?.ms_fullname}&tab=NAV`
    // );
  };

  return (
    <>
      <div className="p-1 sm:p-3 flex gap-1 sm:gap-2 flex-wrap focus:ring-none border-accent">
        <div>
          <input
            type="search"
            className="grow bg-transparent border border-accent rounded-xl py-1 focus:outline-none px-3 sm:min-w-80 sm:min-h-10"
            placeholder="Search"
            onChange={(e) => onChangeSearch(e)}
          />
        </div>
        <div>
          <div className="drawer drawer-end z-40 ">
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle"
              checked={isDrawerOpen}
              onChange={() => setIsDrawerOpen(!isDrawerOpen)}
            />
            <div className="drawer-content">
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
                <FundPickerFilter
                  isOpen={isDrawerOpen}
                  handleClose={() => setIsDrawerOpen(false)}
                  setPayload={setPayload}
                  payload={payload}
                  adminInvesterFilter={adminInvesterFilter}
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
              onClick={() => {
                ExportSchemeData(), setExportType("PDF");
              }}
            >
              {exportPDFLoading ? (
                <>
                  <span className="loading loading-spinner"></span> loading
                </>
              ) : (
                <>
                  <BsFileEarmarkPdf className="text-primary text-lg sm:text-2xl" />
                </>
              )}

              {/* <FaFileExport /> PDF */}
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
              onClick={() => {
                ExportSchemeData(), setExportType("XLS");
              }}
            >
              {exportXLSLoading ? (
                <>
                  <span className="loading loading-spinner"></span> loading
                </>
              ) : (
                <>
                  <RiFileExcel2Line className="text-primary text-lg sm:text-2xl" />
                </>
              )}
              {/* <FaFileExport /> XLS */}
            </button>
          </div>
        </div>
        <div className="relative">
          <button
            className="btn rounded-xl btnStyle columns-button px-2 h-[34px] sm:h-[40px]"
            type="button"
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
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
                  { key: "ReturnSinceIncep", label: "Return Since Incep" },
                ].map((col) => (
                  <label key={col.key} className="label my-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-info border-gray-500 before:bg-white checked:border-info"
                      checked={visibleColumns[col.key as ReturnColumnKey]}
                      onChange={() =>
                        handleColumnToggle(col.key as ReturnColumnKey)
                      }
                    />
                    <span className="text-sm text-black">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto border-base-content/5 bg-base-100 border-t h-[calc(100vh-230px)] 2xl:h-[calc(100vh-220px)]">
        <table className="table table-sm table-pin-rows">
          <thead className="thead ">
            <tr>
              <th rowSpan={2} className="text-left">
                <div className="tableHeaderClass min-w-64 sm:min-w-[300px]">
                  <div>Scheme</div>

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
                        onChangeSorting("SchemePerformances.ReturnSinceIncep");
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
            <tr className="top-9">
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
          <tbody>
            {loader ? (
              <tr>
                <td
                  colSpan={6 + visibleColumnsCount}
                  className="text-center border-0"
                  style={{ borderBottom: "none" }}
                >
                  <div
                    className={`text-center ${style.noData}`}
                    style={{ paddingTop: "60px", border: "none" }}
                  >
                    Loading...
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {schemeData.length > 0 ? (
                  schemeData.map((item: any, i: number) => (
                    <Fragment key={item.id}>
                      <tr>
                        <td className="font-normal">
                          <div className="flex items-center gap-4">
                            <div>
                              {/* <BsBank className="text-lg" /> */}
                              <img
                                // src={`${publicPathName}/Kotak.png`}
                                src={`${NODE_API_URL}/static/amc_logo/${item?.AMCMaster?.amc_logo}`}
                                className="w-10 h-10 min-w-10 min-h-10 object-contain"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div
                                className="text-sm sm:text-base font-normal text-[#3498DB] cursor-pointer"
                                // onClick={() => router.push(`/scheme-detail?id=${item.id}`)}
                                onClick={(e: any) =>
                                  handleNavigateSchemeDetail(item, e, payload)
                                }
                              >
                                {item.ms_fullname}
                              </div>
                              <div className="flex gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  {/* <div className="w-2 h-2 rounded-4xl bg-secondary"></div> */}
                                  {item.SchemeCategory?.Name}
                                </div>
                                <div className="flex items-center gap-1">-</div>
                                <div className="flex items-center gap-1">
                                  {/* <div className="w-2 h-2 rounded-4xl bg-secondary"></div> */}
                                  {item.SchemeSubcategory?.Name}
                                </div>
                              </div>
                              {/* <div className="flex gap-2">
                                <button
                                  className="btn btn-sm btnStyle py-0 px-3 text-sm font-normal border-0 rounded-2xl"
                                  onClick={() => handleOpenModal(item)}
                                >
                                  <FiPlus className="text-primary text-lg" />
                                  One-Time
                                </button>
                                <button
                                  className="btn btn-sm btnStyle py-0 px-3 text-sm font-normal border-0 rounded-2xl"
                                  onClick={() => {
                                    setSelectedScheme(item);
                                    setShowSipPopup(true);
                                  }}
                                >
                                  <FiPlus className="text-primary text-lg" />
                                  SIP
                                </button>
                              </div> */}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-3">
                            <div >
                              {/* <div tabIndex={0} role="button" className="btn m-1">Click  ⬇️</div> */}
                              <div
                                data-tip="Transact"
                                tabIndex={0}
                                role="button"
                                className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"

                              >
                                <GrTransaction
                                  size={14}
                                  className="text-primary"
                                  onClick={() => {
                                    setSelectedScheme(item);
                                    setshowInvestorPopup(true);
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              data-tip="Add to Cart"
                              className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                              onClick={(event: any) => {
                                addToCart(item?.id);
                              }}
                            >
                              <IoCartOutline size={16} className="text-white" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center items-center gap-2">
                            {item?.SchemePerformances?.[0]?.OverallRating ? (
                              <>
                                {item?.SchemePerformances[0]?.OverallRating}
                                <FaStar className="text-primary text-lg" />
                              </>
                            ) : (
                              "--"
                            )}
                          </div>
                        </td>
                        <td>
                          {toFixedData(item?.SchemePerformances?.[0]?.Nav)}
                        </td>
                        <td>
                          {convertToCrores(item?.SchemePerformances?.[0]?.AUM)}
                        </td>

                        <td>{toFixedData(item?.net_expense_ratio)}</td>

                        {/* Conditionally render return columns */}
                        {visibleColumns.return1day && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return1d
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return7days && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return1w
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return1month && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return1mth
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return3months && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return3mth
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return6months && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return6mth
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return1y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Return1yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return2y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Returns2yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return3y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Returns3yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return5y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Returns5yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return7y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Returns7yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return10y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.Returns10yr
                              )}
                            </div>
                          </td>
                        )}

                        {visibleColumns.return10y && (
                          <td>
                            <div className="flex justify-center items-center gap-2 mx-auto">
                              {toFixedDataForReturn(
                                item?.SchemePerformances?.[0]?.ReturnSinceIncep
                              )}
                            </div>
                          </td>
                        )}

                        <td>
                          {item.inception_date
                            ? (() => {
                              const d = new Date(item.inception_date);
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
                        </td>
                      </tr>
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6 + visibleColumnsCount}
                      className="text-center border-0"
                      style={{ borderBottom: "none" }}
                    >
                      <div
                        className={`text-center ${style.noData}`}
                        style={{ paddingTop: "60px", border: "none" }}
                      >
                        No Data Found
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody >
        </table >
      </div >
      <div className="mt-4">
        <Pagination
          totalCount={totalCount}
          limit={limit}
          page={page}
          onPageChange={onPageChange}
        />
      </div>

      {/* {drawerOpen && (
        <FundPickerFilter
          open={drawerOpen}
          handleClose={() => setDrawerOpen(false)}
          setPayload={setPayload}
        />
      )} */}

      {/* <FundPickerFilter
        isOpen={isDrawerOpen}
        handleClose={() => setIsDrawerOpen(false)}
        setPayload={setPayload}
      /> */}
      <PurchaseDetailPopup
        modalId="purchaseDetailModal"
        showTriggerButton={false}
        schemeData={selectedScheme}
      />

      {
        showSipPopup && (
          <SipPopup
            schemeData={selectedScheme}
            open={showSipPopup}
            onClose={() => setShowSipPopup(false)}
          />
        )
      }

      {
        showInvestorPopup && (
          <InvestorPopup
            schemeData={selectedScheme}
            open={showInvestorPopup}
            onClose={() => setshowInvestorPopup(false)} investor={undefined} />
        )
      }
    </>
  );
};

export default FundPicker;
