"use client";

import React, { useContext, useEffect, useState } from "react";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import api from "@/utils/api";
import { convertManagerDate, convertManagerName, getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { convertToCrores, toFixedData, toFixedDataForReturn, USER_DATA } from "@/utils/constants";
import { GrTransaction } from "react-icons/gr";
import { IoCartOutline } from "react-icons/io5";
import AccountContext from "@/context/AccountContext/Account.context";
import InvestorPopup from "@/components/fund-explore/investor";
import SipPopup from "@/components/fund-explore/sipDetail";
import PurchaseDetailPopup from "@/components/fund-explore/purchaseDetail";


const FundManagerDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const manager_id: any = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("Schemes");
  const [managerData, setManagerData] = useState<any>({});

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);
  const [showSipPopup, setShowSipPopup] = useState(false);

  const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

  const tabs = ["Schemes", "Overview"];

  useEffect(() => {
    if (manager_id) {
      getManagerDetail();
    }
  }, [manager_id]);


  const getManagerDetail = async () => {
    try {

      let res: any = await api.get(`/mutual-fund/get-fund-manager-detail/${manager_id}`);
      if (res.data.data) {
        setManagerData(res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }


  const addToCart = async (schemeId: number) => {
    try {
      const userData: any = getLS(USER_DATA);

      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeId,
        trans_type: 1,
      };

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

  const SectionDivider = () => <hr className="border-accent" />;

  const handleNavigateFundDetail = (item: any) => {
    // setNavigateLoader(true);
    router.push(
      `/fund-detail?id=${item?.SchemeMaster?.id}&tab=NAV`
    );
    // setNavigateLoader(false);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8 px-6 mb-5">
      {/* Personal Information & Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div>
          <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-4">
            Personal Information
          </CustomText>
          <div className="space-y-3">
            <div className="flex justify-between">
              <CustomText className="text-sm ">Full Name:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.manager_name}</CustomText>
            </div>
            {/* <div className="flex justify-between">
              <CustomText className="text-sm ">Designation:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.personalInfo.designation}</CustomText>
            </div> */}
            <div className="flex justify-between">
              <CustomText className="text-sm ">Experience:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.manager_exp}</CustomText>
            </div>
            <div className="flex justify-between">
              <CustomText className="text-sm ">Education:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.manager_education}</CustomText>
            </div>
            <div className="flex justify-between">
              <CustomText className="text-sm ">Joined</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.managerStartDate ? convertManagerDate(managerData.managerStartDate) : '--'}</CustomText>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-4">
            Performance Metrics
          </CustomText>
          <div className="space-y-3">
            <div className="flex justify-between">
              <CustomText className="text-sm ">Funds Managed:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.total_schemes}</CustomText>
            </div>
            <div className="flex justify-between">
              <CustomText className="text-sm ">Total AUM:</CustomText>
              <CustomText className="text-sm font-semibold">₹ {convertToCrores(managerData.total_AUM)} Cr.</CustomText>
            </div>
            <div className="flex justify-between">
              <CustomText className="text-sm ">Average Returns ( 5 Yr. ):</CustomText>
              <CustomText className="text-sm font-semibold text-green-600">{toFixedDataForReturn(managerData.Avg_5yrs_Return)}</CustomText>
            </div>
            {/* <div className="flex justify-between">
              <CustomText className="text-sm ">Best Performing Fund:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.performanceMetrics.bestPerformingFund}</CustomText>
            </div>
            <div className="flex justify-between">
              <CustomText className="text-sm ">Investment Style:</CustomText>
              <CustomText className="text-sm font-semibold">{managerData.performanceMetrics.investmentStyle}</CustomText>
            </div> */}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Investment Philosophy */}
      {managerData.manager_biography && (
        <>
          <div>
            <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-4">
              Investment Philosophy
            </CustomText>
            <CustomText className="text-sm text-[#E5E7EB] leading-relaxed">
              {managerData.manager_biography}
            </CustomText>
          </div>
          <SectionDivider />
        </>
      )}


      {/* Awards & Recognition */}
      {/* <div className="mb-4">
        <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-4">
          Awards & Recognition
        </CustomText>
        <ul className="space-y-2">
          {managerData.awards.map((award: any, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <span className="">•</span>
              <CustomText className="text-sm text-[#E5E7EB]">{award}</CustomText>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );

  const renderSchemesTab = () => (
    <div className="overflow-auto h-[calc(100vh-230px)] 2xl:h-[calc(100vh-210px)]">
      <table className="table table-pin-rows">
        <thead className="thead border-b border-[#2A2A2A]">
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-left text-sm font-semibold  tracking-wider">
              Fund Name
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              Category
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              NAV
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              AUM (Cr)
            </th>
            <th colSpan={5} className="mergeTh px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              Return
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              Rating
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              Exp. Ratio
            </th>
            <th rowSpan={2} className="px-4 py-3 text-center text-sm font-semibold  tracking-wider">
              Actions
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
        <tbody className="bg-[#111111] divide-y divide-[#2A2A2A]">
          {managerData?.SchemeFundManagers?.map((scheme: any, index: any) => (
            <tr key={index} className="hover:bg-[#1F1A1A]">
              <td className="px-4 py-4">
                <div>
                  <CustomText className="text-sm font-medium text-secondary-content cursor-pointer" onClick={(e: any) =>
                    handleNavigateFundDetail(scheme)
                  }>
                    {scheme.SchemeMaster?.ms_fullname}
                  </CustomText>
                  <CustomText className="text-xs ">
                    {scheme?.SchemeMaster?.SchemeCategory?.Name} - {scheme?.SchemeMaster?.SchemeSubcategory?.Name}
                  </CustomText>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {scheme?.SchemeMaster?.SchemeCategory?.Name}
                </span>
              </td>
              <td className="px-4 py-4 text-center font-semibold">
                <CustomText className="text-sm">{toFixedData(scheme?.SchemeMaster?.SchemePerformances[0]?.Nav)}</CustomText>
              </td>
              <td className="px-4 py-4 text-center font-semibold">
                <CustomText className="text-sm">{convertToCrores(scheme?.SchemeMaster?.SchemePerformances[0]?.AUM)}</CustomText>
              </td>
              {/* <td className="px-4 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <CustomText className={`text-xs ${getReturnColor(scheme.returns.oneYear)}`}>
                    {scheme.returns.oneYear.toFixed(2)}%
                  </CustomText>
                  <CustomText className={`text-xs ${getReturnColor(scheme.returns.threeYear)}`}>
                    {scheme.returns.threeYear.toFixed(2)}%
                  </CustomText>
                  <CustomText className={`text-xs ${getReturnColor(scheme.returns.fiveYear)}`}>
                    {scheme.returns.fiveYear.toFixed(2)}%
                  </CustomText>
                </div>
              </td> */}
              <td className="px-4 py-4">
                {/* <CustomText className={`text-sm ${getReturnColor(fund?.SchemePerformances[0]?.Return1yr)}`}> */}
                <CustomText className={`text-sm`}>
                  {toFixedDataForReturn(scheme?.SchemeMaster?.SchemePerformances[0]?.Return1yr)}
                </CustomText>
              </td>

              <td className="px-4 py-4">
                <CustomText className={`text-sm`}>
                  {toFixedDataForReturn(scheme?.SchemeMaster?.SchemePerformances[0]?.Returns3yr)}
                </CustomText>
              </td>

              <td className="px-4 py-4">
                <CustomText className={`text-sm`}>
                  {toFixedDataForReturn(scheme?.SchemeMaster?.SchemePerformances[0]?.Returns5yr)}
                </CustomText>
              </td>

              <td className="px-4 py-4">
                <CustomText className={`text-sm`}>
                  {toFixedDataForReturn(scheme?.SchemeMaster?.SchemePerformances[0]?.Returns7yr)}
                </CustomText>
              </td>

              <td className="px-4 py-4">
                <CustomText className={`text-sm`}>
                  {toFixedDataForReturn(scheme?.SchemeMaster?.SchemePerformances[0]?.Returns10yr)}
                </CustomText>
              </td>

              <td className="px-4 py-4 text-center">
                <div className="flex gap-1 justify-center">
                  {scheme?.SchemeMaster?.SchemePerformances[0]?.OverallRating ? (
                    <>
                      {scheme?.SchemeMaster?.SchemePerformances[0]?.OverallRating}
                      <FaStar className="text-primary text-lg" />
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <CustomText className="text-sm">{toFixedData(scheme?.SchemeMaster?.net_expense_ratio)}</CustomText>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex gap-3">
                  <div >
                    {/* <div tabIndex={0} role="button" className="btn m-1">Click  ⬇️</div> */}
                    <div
                      data-tip="Transact"
                      tabIndex={0}
                      role="button"
                      className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                      onClick={() => {
                        setSelectedScheme(scheme?.SchemeMaster);
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
                      addToCart(scheme?.SchemeMaster?.id);
                    }}
                  >
                    <IoCartOutline size={16} className="text-white" />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center  font-semibold text-lg`}>
                {convertManagerName(managerData?.manager_name)}
              </div>
              <div>
                <CustomText className="text-xl font-semibold text-[#F9FAFB]">
                  {managerData.manager_name}
                </CustomText>
                {/* <CustomText className="text-sm text-[#9CA3AF]">
                {managerData.designation}
              </CustomText> */}
              </div>
            </div>
            <CustomButton
              className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => router.push('/top-fund-manager-list')}
            >
              View All Managers
            </CustomButton>
          </div>

          {/* Tabs */}

          <div role="tablist" className="tabs tabs-bordered flex px-4 gap-0 mt-4 border-b border-accent">
            {tabs.map((tab) => (
              <div
                key={tab} className="flex items-center"
              >
                <a
                  role="tab"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeTab === tab
                    ? "text-secondary-content border-secondary-content"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB] border-transparent"
                    }`}
                >
                  {tab}
                </a>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-4">
          {activeTab === "Overview" ? renderOverviewTab() : renderSchemesTab()}
        </div>
      </div>


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
            onClose={() => setshowInvestorPopup(false)}
          />
        )
      }
    </>
  );
};

export default FundManagerDetail;