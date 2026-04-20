import api from "@/utils/api";
import { SCHEMECATEGORY, TIMEPERIODS, convertToCrores, toFixedData, toFixedDataForReturn } from "@/utils/constants";
import { convertManagerDate, dateFormateValue, handleServerError } from "@/utils/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";


function UserFundDetails() {

  let router = useRouter();

    const searchParams = useSearchParams();
  
    const fundManagerId = searchParams.get("fund_manager_id");
    const schemeId = searchParams.get("id");

  // const parentTabs = ["Equity", "Hybrid"];
  const categoryTab = [
    { id: 1, name: "Equity" },
    { id: 3, name: "Hybrid" },
  ];
  const durationTabs = ["1Y", "3Y", "5Y", "10Y"];
  const [activeCategoryTab, setActiveCategoryTab] = useState(1);
  const [activeDurationTab, setActiveDurationTab] = useState("1Y");
  const [fundManagereData, setFundManagereData] = useState<any>();
  const [schemeData, setSchemeData] = useState<any>([]);

  const funds = [
    {
      name: "ICICI Pru LT Wealth Enhancement Fund(G)",
      aum: "39.21",
      nav: "28.06",
      return: "22.09%",
    },
    {
      name: "ICICI Pru Flexicap Fund(G)",
      aum: "16,677.22",
      nav: "18.19",
      return: "21.09%",
    },
    {
      name: "ICICI Pru Balanced Advantage Fund(G)",
      aum: "62,527.91",
      nav: "72.67",
      return: "14.09%",
    },
    {
      name: "ICICI Pru Transportation and Logistics Fund-Reg(G)",
      aum: "3,010.04",
      nav: "17.92",
      return: "20.5%",
    },
  ];

  useEffect(() => {
    if(fundManagerId) {
      getFundManagerData();
    }
  }, [fundManagerId]);

  const getFundManagerData = async () => {
    try {

      let passBody: any = {
        managerId: fundManagerId,
      }

      let res: any = await api.post(`/scheme/get-fundmanager-data-byId`, passBody);

      if (res.data.data) {
        setFundManagereData(res.data.data);
        onChangeCategory(activeCategoryTab, res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }

  const onChangeCategory = async (catId: any, managerData?: any) => {
    try {

      let manager_id: any = fundManagereData ? fundManagereData?.FundManagersMaster?.manager_id : managerData?.FundManagersMaster?.manager_id;

      let passBody: any = {
        managerId: manager_id,
        categoryId: catId
      }

      let res: any = await api.post(`/scheme/get-schemeData-bymanager`, passBody);

      if (res.data.data) {
        setSchemeData(res.data.data);
      }


    } catch (error) {
      handleServerError(error);
    }
  }

  const handleBackTab = () => {
    // router.push(
    //   `/scheme-detail?id=${data?.id}&isin=${data?.isin}&selectCategory=${data?.selectCategory
    //   }&selectSubCategory=${JSON.stringify([
    //     data?.selectSubCategory
    //   ])}&benchmark_id=${JSON.stringify([data?.benchmark_id])}&scheme_type=${data?.scheme_type
    //   }&name=${data?.name}&ms_fullname=${data?.ms_fullname}&tab=Fund Manager`
    // );

    router.push(
      `/scheme-detail?id=${schemeId}&tab=Fund Manager`
    );
  }

  const SectionDivider = () => <hr className="border-accent my-4" />;

  return (
    <div className="py-6">
      <div className="max-w-8xl px-5 mx-auto">
        {/* Header */}
        <div className="flex gap-4 items-center mb-6">
          <span className="text-primary text-sm cursor-pointer" onClick={handleBackTab}>
            <FaChevronLeft size={15} />
          </span>
          <h1 className="text-2xl font-semibold text-black">{fundManagereData?.FundManagersMaster?.manager_name}</h1>
        </div>

        {/* Profile Info */}
        <div className="mb-4 ml-8">
          {/* <p className="text-base-content text-sm mb-1">
            Chief Investment Officer - Equity
          </p> */}
          <p className="text-base-content mb-1 text-sm">{fundManagereData?.FundManagersMaster?.manager_exp === 'NULL' || fundManagereData?.FundManagersMaster?.manager_exp == null ? 0 : fundManagereData?.FundManagersMaster?.manager_exp} Year Experience</p>
          <p className="text-base-content mb-4 text-sm">
            {/* Date Of Joining 17 Dec 2009 */}
            Date Of Joining  {fundManagereData?.manager_startdate ? convertManagerDate(fundManagereData?.manager_startdate) : ''}
          </p>
        </div>

        <SectionDivider />

        {/* Main Tabs */}
        <div className="flex justify-between sm:justify-start gap-2 sm:gap-10 ">
          <div
            className="flex gap-2 "
            role="tablist"
            aria-label="Fund Filter Tabs"
          >
            {categoryTab.map((tab: any, idx: any) => (
              <button
                key={tab.id}
                id={`fund-tab-${idx}`}
                className={`tab text-white rounded-xl font-semibold text-sm ${activeCategoryTab === tab.id
                  ? "tab-active bg-primary hover:text-white text-white"
                  : "bg-placeholder !text-white"
                  }`}
                onClick={() => {
                  setActiveCategoryTab(tab.id);
                  // setActiveDurationTab("1Y"); // Reset duration when switching parent tab
                  onChangeCategory(tab.id)
                }}
                type="button"
                role="tab"
                aria-selected={activeCategoryTab === tab.id}
                aria-controls={`fund-tabpanel-${idx}`}
                tabIndex={activeCategoryTab === tab.id ? 0 : -1}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="">
            {/* Duration Tabs (conditional) */}
            {(activeCategoryTab === SCHEMECATEGORY.Equity || activeCategoryTab === SCHEMECATEGORY.Hybrid) && (
              <div
                className="flex gap-2 "
                role="tablist"
                aria-label="Duration Tabs"
              >
                {durationTabs.map((tab, idx) => (
                  <button
                    key={`duration-tab-${idx}`}
                    id={`duration-tab-${idx}`}
                    className={`tab text-white rounded-md font-medium text-sm px-2 sm:px-3 ${activeDurationTab === tab
                      ? "tab-active bg-primary hover:text-white text-white"
                      : "bg-placeholder !text-white"
                      }`}
                    onClick={() => {setActiveDurationTab(tab)}}
                    type="button"
                    role="tab"
                    aria-selected={activeDurationTab === tab}
                    aria-controls={`duration-tabpanel-${idx}`}
                    tabIndex={activeDurationTab === tab ? 0 : -1}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SectionDivider />

        {/* Fund Table */}
        <div className="bg-[#111111]  overflow-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 font-semibold text-sm text-black">
                  Scheme Name
                </th>
                <th className="text-right p-4 font-semibold text-black text-sm">
                  AUM
                </th>
                <th className="text-right p-4 font-semibold text-black text-sm">
                  NAV
                </th>
                <th className="text-right p-4 font-semibold text-black text-sm">
                  Return %
                </th>
              </tr>
            </thead>
            <tbody>
            {schemeData.length > 0 && schemeData.map((fund: any, i: any) => {

              let returnValue: any = activeDurationTab === TIMEPERIODS.OneYear ? fund?.SchemeMaster?.SchemePerformances[0]?.Return1yr : 
              activeDurationTab === TIMEPERIODS.ThreeYear ? fund?.SchemeMaster?.SchemePerformances[0]?.Returns3yr :
              activeDurationTab === TIMEPERIODS.FiveYear ? fund?.SchemeMaster?.SchemePerformances[0]?.Returns5yr :
              activeDurationTab === TIMEPERIODS.TenYear ? fund?.SchemeMaster?.SchemePerformances[0]?.Returns10yr : 
              "-";

               return (
                <tr
                  key={i}
                  className="border-t border-field-border hover:bg-[#1F1A1A]"
                >
                  <td className="p-4 text-base-content text-sm">{fund?.SchemeMaster?.ms_fullname}</td>
                  <td className="p-4 text-right text-black text-sm">
                    {convertToCrores(fund?.SchemeMaster?.SchemePerformances[0]?.AUM)}
                  </td>
                  <td className="p-4 text-right text-black text-sm">
                    {toFixedData(fund?.SchemeMaster?.SchemePerformances[0]?.Nav)}
                  </td>
                  <td className="p-4 text-right text-black font-medium text-sm">
                    {toFixedDataForReturn(returnValue)}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserFundDetails
