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
import { AlertCircle, X } from "lucide-react";

type gridProps = {
  headerList: any[];
  apiEndPoint: any;
  actionButtons: any[];
  checkbox?: boolean;
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
  pageName: any;
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
  checkbox = true,
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
  backButton,
}: gridProps) {
  const { columns, handleResize, getColumnWidth } = useColumns(headerList, 100);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();
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

  const modalRef = useRef<HTMLDialogElement>(null);

  const handleOpen = () => {
    modalRef.current?.showModal();
  };

  const handleClose = () => {
    modalRef.current?.close();
  };

  const handleSorting = (keyName: string) => {
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
  }, [page, limit, sortOrder, gridsSearchFilter, refreshKey]);

  const get = async (param: any) => {
    try {
      let data = await api.get(apiEndPoint, { params: param });

      if (data?.data?.data?.rows) {
        setTotalCount(data.data.data.count ?? data.data.data.rows.length);
        setDataList(data.data.data.rows);
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
    setShowFilter((prev) => !prev);
  };

  const handleClickClearFilter = () => {
    setGridsSearchFilter({});
    setShowFilter(false);
    setSelectedOptions({});
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
    );
    return findOption || null;
  };

  // Function to split action buttons into rows of 3
  const splitIntoRows = (buttons: any[]) => {
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
      rows.push(buttons.slice(i, i + 3));
    }
    return rows;
  };

  return (
    <>
      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-lg overflow-hidden">
        <div className="flex justify-between px-4 py-3 border-b border-[#2A2A2A]">
          {backButton ? (
            <div className="flex items-center">
              <CustomBackButton onClick={() => window.history.back()}>
                <IoMdArrowRoundBack className="h-6 w-6 mr-1 text-[#F59E0B] hover:text-[#FBBF24] transition-colors" />
              </CustomBackButton>
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClickFilter}
              className="px-4 py-2 text-sm font-medium text-[#F59E0B] hover:text-[#FBBF24] transition-colors bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] hover:border-[#F59E0B]/50"
            >
              {showFilter ? "Hide Filter" : "Show Filter"}
            </button>
            <button
              onClick={handleClickClearFilter}
              className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-[#F59E0B] transition-colors bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] hover:border-[#F59E0B]/50"
            >
              Clear Filter
            </button>
            {permission?.add ? (
              <button
                onClick={(e) => {
                  toggleForm("add");
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                <GoPlusCircle className="h-4 w-4" />
                Add {pageName}
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1F1A1A] border-b border-[#2A2A2A]">
                {checkbox ? (
                  <th className="sticky left-0 w-12 text-center bg-[#1F1A1A] p-3 border-r border-[#2A2A2A]">
                    <CustomCheckbox
                      checked={allSelected && excludedEntries.length === 0}
                      onChange={(e: any) => toggleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded-md border-[#F59E0B]/30 bg-transparent transition-all hover:scale-105"
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
                        <span className="absolute right-0 top-0 h-full w-px cursor-col-resize bg-[#2A2A2A]" />
                      }
                      onResize={(_: any, item: any) => {
                        handleResize(header.name, item.size.width);
                      }}
                      draggableOpts={{ enableUserSelectHack: false }}
                    >
                      <th
                        style={{ width: getColumnWidth(header.name) }}
                        className="relative overflow-hidden whitespace-nowrap px-4 py-3 border-r border-[#2A2A2A] text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <CustomText className="flex items-center text-[#F59E0B] font-semibold text-sm">
                            {header.name}
                          </CustomText>
                          {header?.sorting && (
                            <div
                              className="flex items-center cursor-pointer hover:text-[#FBBF24] transition-colors"
                              onClick={() => handleSorting(header.fieldName)}
                            >
                              {sortOrder.name == header.fieldName ? (
                                sortOrder.sort == "asc" ? (
                                  <GoArrowDown size={14} className="text-[#F59E0B]" />
                                ) : sortOrder.sort == "desc" ? (
                                  <GoArrowUp size={14} className="text-[#F59E0B]" />
                                ) : (
                                  <LuArrowUpDown size={14} className="text-[#9CA3AF]" />
                                )
                              ) : (
                                <LuArrowUpDown size={14} className="text-[#9CA3AF]" />
                              )}
                            </div>
                          )}
                        </div>

                        {showFilter && header?.filter && (
                          <div className="mt-2">
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
                                    [header.fieldName]: value,
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
                              <input
                                type={header.type ? header.type : "text"}
                                name={header.fieldName}
                                onChange={handleFilter_Search}
                                placeholder={`Filter ${header.name}`}
                                className="w-full px-3 py-1.5 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] focus:border-transparent"
                              />
                            )}
                          </div>
                        )}
                      </th>
                    </Resizable>
                  );
                })}
                {actionButtons.length > 0 ? (
                  <th className="sticky right-0 w-32 bg-[#1F1A1A] p-3 text-center border-l border-[#2A2A2A]">
                    <CustomText className="flex items-center justify-center text-[#F59E0B] font-semibold text-sm">
                      Actions
                    </CustomText>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {dataList && dataList?.length > 0 ? (
                <>
                  {dataList.map((d: any, index: number) => {
                    const actionRows = splitIntoRows(actionButtons.filter(btn => 
                      typeof btn.show === "function" ? btn.show(d) : btn.show
                    ));
                    
                    return (
                      <tr
                        className="border-b border-[#2A2A2A] hover:bg-[#1F1A1A] transition-colors"
                        key={`data${index}`}
                      >
                        {checkbox && (
                          <td className="sticky left-0 bg-[#111111] p-3 text-center border-r border-[#2A2A2A]">
                            <CustomCheckbox
                              checked={dataChecked(d.id)}
                              onChange={() => handleDataCheck(d.id)}
                              className="w-4 h-4 rounded-md border-[#F59E0B]/30 bg-transparent transition-all hover:scale-105"
                            />
                          </td>
                        )}

                        {columns.map((header: any, idx: number) => (
                          <td
                            className="px-4 py-3 text-sm"
                            key={`${header.fieldName}-${idx}`}
                          >
                            <CustomText
                              className={`inline-block text-[#F9FAFB] ${header.dataClass
                                ? header.dataClass(d[header.fieldName])
                                : ""
                                }`}
                            >
                              {header.formatter ? (() => {
                                const formattedValue = header.formatter(d[header.fieldName]);

                                if (header.fieldName === "isKYCDone" && formattedValue === "Pending") {
                                  return (
                                    <span
                                      className="text-[#F59E0B] cursor-pointer hover:text-[#FBBF24] transition-colors"
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
                          <td className="sticky right-0 bg-[#111111] p-3 border-l border-[#2A2A2A]">
                            <div className="flex flex-col gap-2">
                              {actionRows.map((row, rowIndex) => (
                                <div key={`row-${rowIndex}`} className="flex flex-wrap items-center justify-center gap-2">
                                  {row.map((btn: any, btnIndex: number) => {
                                    const canShow = typeof btn.show === "function" ? btn.show(d) : btn.show;
                                    
                                    return canShow ? (
                                      <Fragment key={`tooltip-${rowIndex}-${btnIndex}`}>
                                        {btn.title === "Delete" ? (
                                          <>
                                            <div className="relative group">
                                              <button
                                                className={`p-2 rounded-lg transition-all hover:scale-110 ${btn.className}`}
                                                onClick={() => {
                                                  setSelectedDeleteData(d);
                                                  handleOpen();
                                                }}
                                              >
                                                <span className="text-xl">{btn.icon}</span>
                                              </button>
                                              {btn.tooltip && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1F1A1A] text-[#F9FAFB] text-xs rounded border border-[#2A2A2A] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                  {btn.tooltip}
                                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F1A1A]"></div>
                                                </div>
                                              )}
                                            </div>

                                            <dialog
                                              id="my_modal"
                                              className="modal"
                                              ref={modalRef}
                                            >
                                              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                                <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full border border-[#2A2A2A]">
                                                  <div className="p-6 text-center">
                                                    <div className="flex justify-center mb-4">
                                                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                                        <AlertCircle className="w-8 h-8 text-red-400" />
                                                      </div>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-[#F9FAFB] mb-3">
                                                      Are you sure?
                                                    </h3>
                                                    <p className="text-[#9CA3AF] mb-6">
                                                      You won't be able to revert this action
                                                    </p>
                                                    <div className="flex gap-4 justify-center">
                                                      <button
                                                        type="button"
                                                        className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                                                        onClick={() => {
                                                          clickOnAction(
                                                            btn.title,
                                                            selectedDeleteData
                                                          );
                                                          handleClose();
                                                        }}
                                                      >
                                                        Yes, Delete
                                                      </button>
                                                      <button
                                                        type="button"
                                                        className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                                                        onClick={handleClose}
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </dialog>
                                          </>
                                        ) : (
                                          <div className="relative group">
                                            <button
                                              className={`p-2 rounded-lg transition-all hover:scale-110 ${btn.className}`}
                                              onClick={() => clickOnAction(btn.title, d)}
                                            >
                                              <span className="text-xl">{btn.icon}</span>
                                            </button>
                                            {btn.tooltip && (
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1F1A1A] text-[#F9FAFB] text-xs rounded border border-[#2A2A2A] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {btn.tooltip}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F1A1A]"></div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Fragment>
                                    ) : null;
                                  })}
                                </div>
                              ))}
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
                    className="text-center font-semibold text-[#9CA3AF] py-8"
                    colSpan={columns.length + (checkbox ? 1 : 0) + (actionButtons.length > 0 ? 1 : 0)}
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#2A2A2A] p-4">
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