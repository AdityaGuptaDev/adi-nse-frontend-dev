"use client";

import CustomLoading from "@/commonUI/Loading";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { convertToCrores, schemeColors, toFixedDataForReturn } from "@/utils/constants";
import { convertManagerName, handleServerError } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";


const TopFundManagerList = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("All Managers");
  const [managersList, setManagersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // const tabs = ["All Managers", "Senior Managers", "Portfolio Managers", "Chief Officers"];

  useEffect(() => {
    getTopFundManagerList();
  }, []);

  const getTopFundManagerList = async () => {
    try {
      setLoading(true);
      let res: any = await api.get(`/mutual-fund/get-top-fund-managers-list`);
      if (res.data.data) {
        setLoading(false);
        setManagersList(res.data.data);
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  }

  const getReturnColor = (returnValue: number) => {
    if (returnValue >= 0) return "text-green-600";
    return "text-red-600";
  };

  const onBack = () => {
    router.push(`/mutual-fund`)
  }

  return (
    <>
      <div className="">
        {/* Header */}
        <div className=" px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div onClick={onBack} className="p-1 cursor-pointer">
                <IoArrowBack className="w-5 h-5 text-gray-600" />
              </div>
              <CustomText className="text-lg font-semibold text-gray-900">
                All Fund Managers
              </CustomText>
            </div>
            <CustomText className="text-sm text-gray-500">
              Showing 12 fund managers
            </CustomText>
          </div>

          {/* Tabs */}

          {/* <div className="tabs flex gap-2 overflow-x-auto my-4 px-4">
          {tabs.map((tab) => (
            <div
              key={tab} className="flex items-center"
            >
              <button
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab}
              </button>
            </div>
          ))}
        </div> */}
        </div>


        {/* Table */}
        <div className="shadow-sm overflow-hidden mt-4">
          <div className="overflow-auto ">
            <table className="table table-pin-rows">
              <thead className="thead border-b border-gray-200">
                <tr className="mt-4">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider">
                    Fund Manager
                  </th>
                  {/* <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider">
                  Designation
                </th> */}
                  <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                    Funds
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                    Total AUM
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                    Avg Returns  ( 5 Yr. )
                  </th>
                  {/* <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider">
                  Action
                </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center justify-center py-4">
                      <CustomLoading />
                    </td>
                  </tr>
                ) : (
                  <>
                    {managersList.length > 0 ? (
                      managersList.map((manager: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${schemeColors[index % schemeColors.length].bg} ${schemeColors[index % schemeColors.length].text} rounded-full flex items-center justify-center font-semibold`}>
                                {convertManagerName(manager.manager_name)}
                              </div>
                              <div className="ms-3">
                                <CustomText className="text-sm font-semibold cursor-pointer hover:text-secondary-content" onClick={() => router.push(`/fund-manager-detail?id=${manager.manager_id}`)}>
                                  {manager.manager_name}
                                </CustomText>
                                <CustomText className="text-xs">
                                  {manager.manager_education || '-'}
                                </CustomText>
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-4 py-4">
                    <CustomText className="text-sm font-semibold">
                      {manager.designation}
                    </CustomText>
                  </td> */}
                          <td className="px-4 py-4 text-center">
                            <CustomText className="text-sm font-semibold">
                              {manager.manager_exp === 'NULL' || manager.manager_exp == null ? 0 : manager.manager_exp}
                            </CustomText>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <CustomText className="text-sm font-semibold">
                              {manager.total_schemes || '-'}
                            </CustomText>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <CustomText className="text-sm font-semibold">
                              ₹ {convertToCrores(manager.total_AUM)} Cr.
                            </CustomText>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <CustomText className={`text-sm font-semibold ${getReturnColor(manager.Avg_5yrs_Return)}`}>
                              {toFixedDataForReturn(manager.Avg_5yrs_Return)}
                            </CustomText>
                          </td>
                          {/* <td className="px-4 py-4 text-center">
                    <div className="flex gap-1 justify-center">
                      {manager.rating ? (
                        <>
                          {manager.rating}
                          <FaStar className="text-primary text-lg" />
                        </>
                      ) : (
                        "--"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CustomButton
                      className="!text-secondary-content  text-sm font-bold bg-transparent border-none p-0 h-auto min-h-0"
                      onClick={() => router.push(`/fund-manager-detail?id=${manager.id}`)}
                    >
                      View
                    </CustomButton>
                  </td> */}
                        </tr>
                      ))) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </>
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default TopFundManagerList;