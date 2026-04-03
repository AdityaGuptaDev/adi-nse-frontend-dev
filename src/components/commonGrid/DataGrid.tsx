"use client";

import { Resizable } from "react-resizable";
import useColumns from "./columnHook";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Pagination from "./components/pagination";
import api from "@/utils/api";
import { GoArrowDown, GoPlusCircle } from "react-icons/go";
import { GoArrowUp } from "react-icons/go";
import CustomButton from "@/commonUI/Button";
import { LuArrowUpDown } from "react-icons/lu";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomText from "@/commonUI/Text";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { IoMdArrowRoundBack } from "react-icons/io";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { useRouter } from "next/navigation";
import { setLS } from "@/utils/helpers";
import { Console } from "console";

type gridProps = {
  headerList: any[];
  apiEndPoint: any;
  actionButtons: any[];
  checkbox?: boolean; // Optional prop with a default value
  footer?: any;
  bordered?: boolean;
  clickOnAction?: any;
  emitChange?: (config: any) => void;
  loading?: boolean;
  ExportExcelUrl?: string;
  disableExport?: boolean;
  refreshKey: any;
  permission: any;
  toggleForm: (pageType: any) => void;
  pageName: any
  backButton?: boolean;
};

type SelectionState = {
  allSelected: boolean;
  excludedEntries: number[];
  includedEntries: number[];
};

function DataGrid({
  headerList,
  actionButtons,
  checkbox = true, // Default value
  apiEndPoint,
  bordered,
  clickOnAction,
  emitChange,
  loading,
  ExportExcelUrl,
  disableExport = false,
  refreshKey,
  permission,
  toggleForm,
  pageName,
  backButton
}: gridProps) {
  const { columns, handleResize, getColumnWidth } = useColumns(headerList, 100);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();
  // const [sortKey, setSortKey] = useState<string | null>(null);
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortOrder, setSortOrder] = useState<any>(false);
  const [allSelected, setAllSelected] = useState(false);
  const [gridsSearchFilter, setGridsSearchFilter] = useState<any>(false);
  const [excludedEntries, setExcludedEntries] = useState<number[]>([]);
  const [includedEntries, setIncludedEntries] = useState<number[]>([]);
  const [dataList, setDataList] = useState<any>([]);
  const [totalCount, setTotalCount] = useState<any>(0);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDeleteData, setSelectedDeleteData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({});
  // const [selectedOption, setSelectedOption] = useState<any>();

  const modalRef = useRef<HTMLDialogElement>(null);

  const handleOpen = () => {
    modalRef.current?.showModal();
  };

  const handleClose = () => {
    modalRef.current?.close();
  };

  // Handle sorting
  const handleSorting = (keyName: string) => {
    // setSortKey(keyName);
    setSortOrder((prev: any) =>
      prev.name === keyName
        ? prev.sort === "asc"
          ? { name: keyName, sort: "desc" }
          : prev.sort === "desc"
            ? false
            : { name: keyName, sort: "asc" }
        : { name: keyName, sort: "asc" }
    );
  };

  // Handle limit change
  const onPageChange = (page: number) => {
    setPage(page);
  };

  useEffect(() => {
    const param = {
      filters: gridsSearchFilter ? JSON.stringify(gridsSearchFilter) : false,
      limit: limit,
      sort: sortOrder?.name
        ? JSON.stringify({ [sortOrder.name]: sortOrder.sort })
        : false,
      page: page,
    };

    if (apiEndPoint) {
      get(param);
    }
  }, [page, limit, page, sortOrder, gridsSearchFilter, refreshKey]);

  //   const get = async (param: any) => {
  //     try {
  //       let data = await api.get(apiEndPoint, { params: param });
  //       setTotalCount(data.data.data.count);
  //       // console.log(data.data.data.rows, "data.data.data.rows")
  //       setDataList(data.data.data.rows);
  //     } catch (error) { }
  //   };

  //   const get = async (param: any) => {
  //   try {
  //     let data = await api.get(apiEndPoint, { params: param });

  //     // since backend returns "data.data"
  //     const rows = data.data.data.data;  
  //     setTotalCount(rows.length);
  //     setDataList(rows);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const get = async (param: any) => {
    try {
      let data = await api.get(apiEndPoint, { params: param });


      // Case 1: API returns { count, rows }
      if (data?.data?.data?.rows) {
        setTotalCount(data.data.data.count ?? data.data.data.rows.length);
        setDataList(data.data.data.rows);

        // Case 2: API returns { data: [...] }
      } else if (Array.isArray(data?.data?.data?.data)) {
        const rows = data.data.data.data;
        setTotalCount(data.data.data.count ?? rows.length);
        setDataList(rows);

      } else {
        console.warn("Unexpected API response format:", data);
        setTotalCount(0);
        setDataList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const handleDataCheck = (id: number) => {
    if (allSelected) {
      setExcludedEntries((prev) => [...prev, id]);
    } else {
      setIncludedEntries(toggleInArray(includedEntries, id));
    }
  };
  const dataChecked = (id: number): boolean => {
    if (allSelected && !excludedEntries.includes(id)) {
      return true;
    }
    if (!allSelected && includedEntries.includes(id)) {
      return true;
    }
    return false;
  };

  const toggleInArray = (array: number[], id: number): number[] => {
    if (array.includes(id)) {
      return array.filter((item) => item !== id);
    }
    return [...array, id];
  };

  const toggleSelectAll = (isChecked: boolean) => {
    setAllSelected(isChecked);
    if (isChecked) {
      setExcludedEntries([]);
    } else {
      setIncludedEntries([]);
    }
  };

  // const handleFilter_Search = (e: React.SyntheticEvent<EventTarget>) => {
  const handleFilter_Search = (e: any) => {
    let searchObj = { ...gridsSearchFilter, [e.target.name]: e.target.value };
    if (Object.keys(searchObj).length) {
      let selectedObj: any = {};
      for (const key in searchObj) {
        if (searchObj.hasOwnProperty(key)) {
          if (searchObj[key] || searchObj[key] === false) {
            selectedObj = { ...selectedObj, [key]: searchObj[key] };
          } else {
            if (selectedObj.hasOwnProperty(key)) {
              delete selectedObj[key];
            }
          }
        }
      }
      searchObj = Object.keys(selectedObj).length ? selectedObj : false;
    } else {
      searchObj = false;
    }
    setGridsSearchFilter(searchObj);
  };

  const handleClickFilter = () => {
    setShowFilter((prev) => !prev); // Toggle the value
  };

  const handleClickClearFilter = () => {
    setGridsSearchFilter({}); // Clear filter data
    setShowFilter(false); // Hide input fields
  };

  const getSelectedOption = (
    header: any,
    selectedOptions: Record<string, any>
  ) => {
    if (!header?.options || !selectedOptions) return null;

    const fieldValue = selectedOptions?.[header.fieldName];

    if (fieldValue === undefined || fieldValue === null) return null;
    const findOption = header.options.find(
      (opt: any) => String(opt.value) === String(fieldValue)
    ).value ?? null

    return findOption;
  };


  return (
    <>
      <div className="bg-white rounded-xl">
        <div className="flex justify-between px-3">
          {backButton ? (
            <div className="justify-center mt-3">
              <CustomBackButton

                onClick={() => window.history.back()}
              >
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />

              </CustomBackButton>
            </div>
          ) : <div className="flex justify-between px-3"></div>
          }

          <div className="my-3 text-end flex justify-end gap-2">
            <div>
              <CustomButton
                className="flex text-proses-secondary normal-case"
                onClick={handleClickFilter}
              >
                {showFilter ? `Hide` : `Show`} Filter
              </CustomButton>
            </div>
            <div>
              <CustomButton
                className="flex text-proses-secondary normal-case"
                onClick={handleClickClearFilter}
              >
                Clear Filter
              </CustomButton>
            </div>
            <div >
              {permission?.add ? (
                <CustomButton
                  className="flex text-proses-secondary normal-case justify-end-end"
                  onClick={(e) => {
                    toggleForm("add");
                  }}
                >
                  {/* <GoPlusCircle className="h-4 w-4 mr-1" />  */}
                  Add {pageName}
                </CustomButton>
              ) : null}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto w-full max-w-full overflow-auto tableshadow border border-base-content/5 bg-white xl:h-[calc(100vh-270px)]">
          <table className={` table table-pin-rows `}>
            <thead>
              <tr className="font-montserrat">
                {checkbox ? (
                  <th className="sticky left-0 w-[10px] min-w-[8px] max-w-[8px] text-center justify-center cursor-pointer border-r-0 border-l-0 border-gray-100 border-t-0  border-y p-2 transition-colors rounded-bl-none z-10 bg-white">
                    <CustomCheckbox
                      checked={allSelected && excludedEntries.length === 0}
                      onChange={(e: any) => toggleSelectAll(e.target.checked)}
                      className="w-4 h-4 min-w-4 min-h-4 rounded-md border-gray-900/20 bg-ray-900/10 transition-all hover:scale-105 !hover:before:opacity-1"
                    />
                  </th>
                ) : null}
                {columns.map((header: any, index: number) => {
                  return (
                    <Resizable
                      key={`heder${index}`}
                      width={getColumnWidth(header.name)}
                      height={0}
                      handle={
                        <span className="absolute right-0 top-0 h-full w-px cursor-col-resize bg-white/50" />
                      }
                      onResize={(_: any, item: any) => {
                        handleResize(header.name, item.size.width);
                      }}
                      draggableOpts={{ enableUserSelectHack: false }}
                    >
                      <th
                        style={{ width: getColumnWidth(header.name) }}
                        className="relative overflow-hidden whitespace-nowrap  px-6 py-4 border-r border-gray-100"
                      >
                        <span className="flex justify-between">
                          <CustomText className="flex items-center text-black justify-between gap-2 font-semibold leading-none opacity-70">
                            {header.name}
                          </CustomText>
                          {header?.sorting && (
                            <div
                              className="flex items-center justify-between gap-2 font-normal leading-none opacity-70 cursor-pointer"
                              onClick={() => handleSorting(header.fieldName)}
                            >
                              {sortOrder.name == header.fieldName ? (
                                sortOrder.sort == "asc" ? (
                                  <GoArrowDown
                                    size={15}
                                    className="text-black"
                                  />
                                ) : sortOrder.sort == "desc" ? (
                                  <GoArrowUp size={15} className="text-black" />
                                ) : (
                                  <LuArrowUpDown
                                    size={15}
                                    className="text-black"
                                  />
                                )
                              ) : (
                                <LuArrowUpDown
                                  size={15}
                                  className="text-black"
                                />
                              )}
                            </div>
                          )}
                        </span>

                        {showFilter && header?.filter && (
                          <>
                            <div className="mt-1">
                              {header.type === 'select' ? (
                                <CustomReactSelect
                                  items={header.options}
                                  className="min-w-40"
                                  bindName="label"
                                  bindValue="value"
                                  isClearable={true}
                                  value={getSelectedOption(header, selectedOptions)}
                                  onChange={(selectedOption) => {
                                    const value = selectedOption ? selectedOption.value : null;

                                    setSelectedOptions((prev: any) => ({
                                      ...prev,
                                      [header.fieldName]: value,   // store each filter separately
                                    }));

                                    handleFilter_Search({
                                      target: {
                                        name: header.fieldName,
                                        value: value ?? "",
                                      },
                                    });
                                  }}
                                />
                              ) : (
                                <CustomInput
                                  type={header.type ? header.type : "text"}
                                  name={header.fieldName}
                                  onChange={handleFilter_Search}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </th>
                    </Resizable>
                  );
                })}
                {actionButtons.length > 0 ? (
                  <th className="sticky w-[100px] min-w-[100px] max-w-[100px] right-0 top-0 z-10 p-4 transition-colors rounded-tr-lg border-0 border-t-0 bg-white">
                    <CustomText className="flex items-center justify-center  text-black gap-2 font-semibold leading-none opacity-70">
                      Actions
                    </CustomText>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {dataList && dataList?.length > 0 ? (
                <>
                  {dataList.length > 0 &&
                    dataList.map((d: any, index: number) => {
                      const isLast = index === totalCount - 1;
                      const classes = isLast
                        ? "p-4 border-l"
                        : "p-4 border-0 border-blue-gray-900 border-l-0";

                      return (
                        <tr
                          className="border-b border-b-gray-200"
                          key={`data${index}`}
                        >
                          {checkbox && (
                            <td className=" sticky left-0 bg-white p-2 justify-center pointer text-center border-r-0 border-l-0 border-gray-100">
                              <CustomCheckbox
                                checked={dataChecked(d.id)}
                                onChange={() => handleDataCheck(d.id)}
                                className="w-4 h-4 min-w-4 min-h-4 rounded-md border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 !hover:before:opacity-0"
                              />
                            </td>
                          )}

                          {columns.map((header: any, index: number) => (
                            <td
                              className="px-5"
                              key={`${header.fieldName}-${index}`}
                            >
                              <CustomText
                                className={` inline-block ${header.dataClass
                                  ? header.dataClass(d[header.fieldName])
                                  : ""
                                  }`}
                              >
                                {header.formatter ? (() => {
                                  const formattedValue = header.formatter(d[header.fieldName]);

                                  if (header.fieldName === "isKYCDone" && formattedValue === "Pending") {
                                    return (
                                      <span
                                        className="text-blue-600  cursor-pointer"
                                        onClick={() => {
                                          setLS("INVESTOR_USER_ID", d?.user_id);
                                          console.log("Initial KYC Data-", dataList);
                                          router.push("/initial-KYC");
                                        }}
                                      >
                                        {formattedValue}
                                      </span>
                                    );
                                  }

                                  return formattedValue;
                                })() : (
                                  d[header.fieldName] || "--"
                                )}



                              </CustomText>
                            </td>
                          ))}
                          {actionButtons.length > 0 ? (
                            <td className="sticky z-0 bg-white right-0 w-[1500px] min-w-[150px] max-w-[100px] border-blue-gray-50">
                              <div className="flex flex-wrap items-center gap-2 justify-center">
                                {actionButtons.map(
                                  (btn: any, index: number) => {

                                    const canShow = typeof btn.show === "function" ? btn.show(d) : btn.show;

                                    return canShow ? (
                                      <Fragment key={`tooltip-${index}`}>
                                        {btn.title == "Delete" ? (
                                          <>
                                            <div
                                              // key={`tooltip-${index}`}
                                              className={`tooltip  tooltip-left btn-square cursor-pointer ${btn.className}`}
                                              data-tip={btn.tooltip}
                                              onClick={() => {
                                                setSelectedDeleteData(d); // <-- make sure 'd' is current row data
                                                handleOpen();
                                              }}
                                            >
                                              <span className="text-xl">
                                                {btn.icon}
                                              </span>
                                            </div>

                                            <dialog
                                              id="my_modal"
                                              className="modal"
                                              ref={modalRef}
                                            >
                                              <div className="modal-box">
                                                <h3 className="text-lg font-bold text-center">
                                                  Are you sure
                                                </h3>
                                                <p className="py-4 text-base text-center">
                                                  You won't be able to revert
                                                  this
                                                </p>
                                                <div className="modal-action justify-center">
                                                  <form method="dialog" className="flex">
                                                    <button
                                                      type="button"
                                                      className="btn mr-4 bg-primary text-white"
                                                      onClick={() => {
                                                        clickOnAction(
                                                          btn.title,
                                                          selectedDeleteData
                                                        );
                                                        handleClose();
                                                      }}
                                                    >
                                                      Yes
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="btn bg-white"
                                                      onClick={handleClose}
                                                    >
                                                      Close
                                                    </button>
                                                  </form>
                                                </div>
                                              </div>
                                            </dialog>
                                          </>
                                        ) : (
                                          <div
                                            // key={`tooltip-${index}`}
                                            className={`tooltip tooltip-left btn-square cursor-pointer  ${btn.className}`}
                                            data-tip={btn.tooltip}
                                            onClick={() =>
                                              clickOnAction(btn.title, d)
                                            }
                                          >
                                            <span className="text-xl">
                                              {btn.icon}
                                            </span>
                                          </div>
                                        )}
                                      </Fragment>
                                    ) : null;
                                  }
                                )}
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
                </>
              ) : (
                <tr>
                  <td
                    className="text-center font-semibold text-gray-500 py-4"
                    colSpan={5}
                  >
                    No data found !!!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination
            totalCount={totalCount}
            limit={limit}
            page={page}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </>
  );
}

export default DataGrid;
