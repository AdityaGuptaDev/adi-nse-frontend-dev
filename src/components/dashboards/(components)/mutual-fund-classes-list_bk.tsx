"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoCartOutline, IoShareOutline } from "react-icons/io5";
import CustomText from "@/commonUI/Text";
import { FiFilter, FiPlus, FiShare2 } from "react-icons/fi";
import { GrTransaction } from "react-icons/gr";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import CustomButton from "@/commonUI/Button";
import { MdClose } from "react-icons/md";
import CustomCheckbox from "@/commonUI/CheckBox";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import { convertToCrores, toFixedData, toFixedDataForReturn } from "@/utils/constants";
import { IoMdClose } from "react-icons/io";
import Pagination from "@/components/commonGrid/components/pagination";

interface FundData {
  id: string;
  name: string;
  category: string;
  actions: {
    buy: boolean;
    sell: boolean;
  };
  morningstarRating: number;
  nav: number;
  aum: string;
  expenseRatio: number;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    sevenYear: number;
    tenYear: number;
  };
  sinceInception: number;
  launchDate: string;
}

interface MutualFundClassesListProps {
  data?: FundData[];
  // onBack?: () => void;
}

const MutualFundClassesList: React.FC<MutualFundClassesListProps> = ({
  data = [],
}) => {
  const [activeTab, setActiveTab] = useState("Equity");
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState([]);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  // const [finalApplyTab, setFinalApplyTab] = useState(activeClass);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [selectSubCategory, setSelectSubCategory] = useState<any>([]);

  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(25);
  let [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  const schemeModalRef = useRef<HTMLDialogElement>(null);

  const schemeOpenModal = () => {
    schemeModalRef.current?.showModal();
  };

  const schemeCloseModal = () => {
    schemeModalRef.current?.close();
  };


  const mockData: FundData[] = [
    {
      id: "1",
      name: "SBI PSU Fund-Reg(G)",
      category: "Thematic Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 3,
      nav: 181.28,
      aum: "6641.11",
      expenseRatio: 1.89,
      returns: {
        oneYear: 17.26,
        threeYear: 7.24,
        fiveYear: 17.33,
        sevenYear: 1.33,
        tenYear: 17.23
      },
      sinceInception: 17.26,
      launchDate: "19/04/2017"
    },
    {
      id: "2",
      name: "SBI Large Cap Fund-Reg(G)",
      category: "Large Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 5,
      nav: 196.64,
      aum: "79717.67",
      expenseRatio: 1.51,
      returns: {
        oneYear: 9.25,
        threeYear: 3.29,
        fiveYear: 3.29,
        sevenYear: 7.33,
        tenYear: 3.25
      },
      sinceInception: 9.20,
      launchDate: "25/04/2017"
    },
    {
      id: "3",
      name: "SBI Mid Cap Fund-Reg(G)",
      category: "Mid Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 4,
      nav: 142.85,
      aum: "12456.78",
      expenseRatio: 1.75,
      returns: {
        oneYear: -22.45,
        threeYear: 10.27,
        fiveYear: 13.67,
        sevenYear: 6.3,
        tenYear: 14.37
      },
      sinceInception: 13.42,
      launchDate: "12/01/2018"
    },
    {
      id: "4",
      name: "SBI Small Cap Fund-Reg(G)",
      category: "Small Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 3,
      nav: 89.34,
      aum: "8934.56",
      expenseRatio: 1.95,
      returns: {
        oneYear: 76.74,
        threeYear: 7.14,
        fiveYear: 16.37,
        sevenYear: 5.3,
        tenYear: 16.78
      },
      sinceInception: 16.67,
      launchDate: "15/01/2019"
    },
    {
      id: "5",
      name: "SBI Small Cap Fund-Reg(G)",
      category: "Small Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 3,
      nav: 89.34,
      aum: "8934.56",
      expenseRatio: 1.95,
      returns: {
        oneYear: 76.74,
        threeYear: 7.14,
        fiveYear: 16.37,
        sevenYear: 5.3,
        tenYear: 16.78
      },
      sinceInception: 16.67,
      launchDate: "15/01/2019"
    },
    {
      id: "6",
      name: "SBI Small Cap Fund-Reg(G)",
      category: "Small Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 3,
      nav: 89.34,
      aum: "8934.56",
      expenseRatio: 1.95,
      returns: {
        oneYear: 76.74,
        threeYear: 7.14,
        fiveYear: 16.37,
        sevenYear: 5.3,
        tenYear: 16.78
      },
      sinceInception: 16.67,
      launchDate: "15/01/2019"
    },
    {
      id: "7",
      name: "SBI Small Cap Fund-Reg(G)",
      category: "Small Cap Fund",
      actions: { buy: true, sell: true },
      morningstarRating: 3,
      nav: 89.34,
      aum: "8934.56",
      expenseRatio: 1.95,
      returns: {
        oneYear: 76.74,
        threeYear: 7.14,
        fiveYear: 16.37,
        sevenYear: 5.3,
        tenYear: 16.78
      },
      sinceInception: 16.67,
      launchDate: "15/01/2019"
    },
  ];


  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    debounceTimer = setTimeout(async () => {
      getSchemeData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [filters, page, activeTab]);


  useEffect(() => {
    if (categoryData) {
      onChangeActiveClasses();
    }
  }, [categoryData])


  const getSchemeData = async () => {
    try {

      const param = {
        filters: filters ? JSON.stringify(filters) : false,
        limit: limit,
        // sort: sortConfig.key
        //   ? JSON.stringify({ [sortConfig.key]: sortConfig.order })
        //   : JSON.stringify({ "SchemePerformances.Returns3yr": "DESC" }),
        page: page,
      };

      const res = await api.get(`/mutual-fund/get-mutual-fund-classes-scheme`, { params: param });

      if (res.data.data) {
        setCategoryData(res?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  }

  const activeClass: any = categoryData?.find((fc: any) => fc.categoryName === activeTab) || categoryData[0];

  const onChangeActiveClasses = () => {
    const activeClass: any = categoryData?.find((fc: any) => fc.categoryName === activeTab) || categoryData[0];
    if (activeClass) {
      let schemeTotalCount: any = activeClass?.schemeList.count;
      setPage(1);
      setTotalCount(schemeTotalCount);
    }

  }

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const onActiveTabHandle = (tab: any) => {
    setPage(1);
    setTotalCount(0);

    if (activeTab !== tab) {
      setFilters(undefined);
      setSelectSubCategory([]);
      const matchedCategory: any = categoryData.find((item: any) => item.categoryName === tab);
      if (matchedCategory) {
        setPage(1);
        setTotalCount(matchedCategory.schemeList.count);
      }
    }
    setActiveTab(tab);
    schemeOpenModal();
  }


  const onBack = () => {
    router.back();
  }

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

  }

  const resetFilter = () => {
    setSelectSubCategory([]);
    setFilters(undefined);
    setIsDrawerOpen(false);
  }

  return (
    <div className="">
      {/* Header */}
      <div className=" border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={onBack} className="p-1 cursor-pointer">
              <IoArrowBack className="w-5 h-5 text-gray-600" />
            </div>
            <CustomText className="text-lg font-semibold text-gray-900">
              Mutual Fund Classes
            </CustomText>
          </div>
          {/* <div className="p-2 cursor-pointer">
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </div> */}
        </div>

        {/* Tabs */}

        <div role="tablist" className="tabs tabs-bordered flex px-4 gap-0 mt-4 border-b border-accent">
          {categoryData?.map((tab: any, index: number) => (
            <div
              key={index} className="flex items-center"
            >
              <a
                role="tab"
                onClick={() => onActiveTabHandle(tab.categoryName)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === tab.categoryName
                  ? "text-primary border-primary"
                  : "text-gray-600 hover:text-gray-800 border-transparent"
                  }`}
              >
                <div className="flex gap-4 items-center">
                  <span>
                    {tab.categoryName}
                  </span>

                  {activeTab === tab.categoryName ? (
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
                          <FiFilter size={14} className="text-primary text-lg sm:text-2xl" />
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
                            <h3 className="text-lg font-medium font-montserrat">{activeTab}</h3>
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
                                  {activeClass.subCategoryList?.map((item: any) => (
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
                                          handleSubCategoryChange(Number(item.Id))
                                        }
                                      />
                                    </div>
                                  ))}
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

        {/* <dialog id="my_modal" className="modal" ref={schemeModalRef}>
          <div className="modal-box">
            <form method="dialog" className="modalHeader">
              <div className="flex-1 sm:flex justify-between">
                <h3 className="modalTitle">{activeTab} Fund Filters</h3>
              </div>
              <div className="">
                <button
                  className="btn btn-md btn-circle btn-ghost"
                  onClick={schemeCloseModal}
                >
                  <MdClose size={25} />
                </button>
              </div>
            </form>
            <div className="modalBody">
              <div className="my-4">
                <ul>
                  {categoryFilter.map((item: any, index: number) => (
                    <li key={index}>
                      <CustomCheckbox label={item.value} checked={selectedCatIds.includes(item.id)}
                        onChange={(e) => handleCheckboxChange(e, item.id)} />
                    </li>
                  ))}
                </ul>
              </div>


            </div>
            <div className="modalFooter">
              <div className="text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-28"
                  onClick={() => setSelectedCatIds([])}
                  disabled={!selectedCatIds.length}
                >
                  Reset
                </CustomButton>
              </div>
              <div className="text-center">
                <CustomButton
                  className="w-28"
                  onClick={handleApplyBtn}
                >
                  Apply
                </CustomButton>
              </div>
            </div>
          </div>
        </dialog> */}

      </div>

      {/* <div className="bg-white px-4 border-b border-gray-200">
      </div> */}

      {/* Table */}
      <div className="shadow-sm overflow-hidden rounded-lg">
        <div className="overflow-auto h-[calc(100vh-230px)] 2xl:h-[calc(100vh-280px)]">
          <table className="table table-pin-rows">
            <thead className="thead border-b border-gray-200">
              <tr>
                <th rowSpan={2} className="px-4 py-3 text-left text-sm font-semibold  tracking-wider">
                  Fund Name
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Actions
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Rating
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  NAV
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  AUM (Cr)
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Exp. Ratio
                </th>
                <th colSpan={5} className="mergeTh px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Return
                  {/* <div>Returns</div>
                  <div className="flex justify-center gap-4 mt-1">
                    <span>1Y</span>
                    <span>3Y</span>
                    <span>5Y</span>
                    <span>10Y</span>
                  </div> */}
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Since Incep
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
                  Launch Date
                </th>
              </tr>
              <tr className="mb-3">
                <th className="colTh px-4 py-3">1Y</th>
                <th className="colTh px-4 py-3">3Y</th>
                <th className="colTh px-4 py-3">5Y</th>
                <th className="colTh px-4 py-3">7Y</th>
                <th className="colTh px-4 py-3">10Y</th>
              </tr>
            </thead>
            <tbody className="bg-white mb-4">
              {activeClass?.schemeList?.rows ? (
                activeClass?.schemeList?.rows?.map((fund: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <CustomText className="text-base font-medium text-secondary-content cursor-pointer" onClick={() => router.push(`/scheme-detail`)}>
                          {fund.ms_fullname}
                        </CustomText>
                        <CustomText className="text-xs">
                          {fund?.SchemeSubcategory?.Name}
                        </CustomText>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-3">
                        <div className="dropdown dropdown-center">
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
                            />
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-sm"
                          >
                            <li>
                              <a>
                                {/* onClick={() => handleOpenModal(item)} */}
                                <FiPlus className="text-primary text-lg" />
                                One-Time
                                {/* </button> */}
                              </a>
                            </li>
                            <li>
                              <a
                              // onClick={() => {
                              //   setSelectedScheme(item);
                              //   setSipModalKey(Date.now()); // force remount
                              //   setShowSipPopup(true);
                              // }}
                              >
                                <FiPlus className="text-primary text-lg" />
                                SIP
                                {/* </button> */}
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div
                          data-tip="Add to Cart"
                          className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                        // onClick={(event: any) => {
                        //   addToCart(item?.id);
                        // }}
                        >
                          <IoCartOutline size={16} className="text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {fund?.SchemePerformances[0]?.OverallRating ? (
                          <>
                            {fund?.SchemePerformances[0]?.OverallRating}
                            <FaStar className="text-primary text-lg" />
                          </>
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CustomText className="text-sm">{toFixedData(fund?.SchemePerformances[0]?.Nav)}</CustomText>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CustomText className="text-sm">{convertToCrores(fund?.SchemePerformances[0]?.AUM)}</CustomText>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CustomText className="text-sm">{toFixedData(fund?.net_expense_ratio)}</CustomText>
                    </td>

                    <td className="px-4 py-4">
                      {/* <CustomText className={`text-sm ${getReturnColor(fund?.SchemePerformances[0]?.Return1yr)}`}> */}
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.Return1yr)}
                      </CustomText>
                    </td>

                    <td className="px-4 py-4">
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.Returns3yr)}
                      </CustomText>
                    </td>

                    <td className="px-4 py-4">
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.Returns5yr)}
                      </CustomText>
                    </td>

                    <td className="px-4 py-4">
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.Returns7yr)}
                      </CustomText>
                    </td>

                    <td className="px-4 py-4">
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.Returns10yr)}
                      </CustomText>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <CustomText className={`text-sm`}>
                        {toFixedDataForReturn(fund?.SchemePerformances[0]?.ReturnSinceIncep)}
                      </CustomText>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CustomText className="text-sm"> {fund.inception_date
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
                        : "--"}</CustomText>
                    </td>
                  </tr>
                ))) : (
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
    </div>
  );
};

export default MutualFundClassesList;