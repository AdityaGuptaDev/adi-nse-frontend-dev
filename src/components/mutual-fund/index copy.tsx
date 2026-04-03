"use client";

import React, { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import CustomText from "@/commonUI/Text";

import TopAMCs from "./(components)/top-AMCs";
import MutualFundClasses from "./(components)/mutual-fund-classes";
import TopFundManagers from "./(components)/top-fund-managers";
import MutualFundThemes from "./(components)/mutual-fund-themes";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import InvestmentTheme from "./(components)/investment-themes";
import NewFundOffers from "./(components)/new-fund-offers";
import FullPageLoader from "@/commonUI/FullPageLoader";
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';
import { getInvestor } from "@/api/holder";
import InvestorPicker from "./(components)/InvestorPicker";
import InvestorPopup from "../fund-explore/investor";
import { Investor } from "@/services/searchReportService";
import OrderPopup from "./new-order";
import { searchByISIN } from "@/api/transaction";
import { useFundStore } from "@/store/useFundStore";
import TopPerformingSchemes from "./(components)/top-performing-schemes";


interface Investors {
  first_applicant?: string;
  scheme?: string;
  pri_isin: string;
  rtaAmcCode: string;
  rtaSchCode: string;
  can_id: string;
  investory_category: string;
  holding_mode: string;
  joint1?: string;
  joint2?: string;
  nominee?: string;
}

function MutualFund() {
  const router = useRouter();

  //added by rakesh sinha
  const user = getLS(USER_DATA)

  const [selectedScheme, setSelectedScheme] = useState(null);

  const [investorList, setInvestorList] = useState<any[]>([])
  const [sipData, setSipData] = useState<any[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showInvestorPopup, setshowInvestorPopup] = useState(false);
  const [showInvestorPicker, setshowInvestorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setSchemeData, setInvestors } = useFundStore();


  const [mutualFundData, setMutualFundData] = useState<any>({
    allCategory: [],
    topPerformingSchemes: [],
    topAMCs: [],
    fundClasses: [],
    newFundData: [],
    topFundManagers: [],
    themes: [],
    investmentTheme: [],
  });

  useEffect(() => {
    fetchMutualFundData();
  }, []);

  const fetchMutualFundData = async () => {
    try {
      setLoading(true);
      // You can replace these with actual API calls

      let topPerSchemesRes: any = await api.get(`/mutual-fund/get-top-performing-schemes`);
      let allCategoryRes: any = await api.get(`/scheme/get-allscheme-category`);
      let fundClassesRes: any = await api.get(`/mutual-fund/get-top-mutual-fund-catdata`);
      let newFundDataRes: any = await api.get(`/mutual-fund/get-new-fund-offer-list`);
      let topAMCsRes: any = await api.get(`/mutual-fund/get-top-amc-list`);
      let fundManagersRes: any = await api.get(`/mutual-fund/get-top-fund-managers-list`);

      const [
        themesRes,
        investmentThemeRes,
      ] = await Promise.all([
        Promise.resolve({ data: { data: [] } }),
        Promise.resolve({ data: { data: [] } }),
      ]);

      setMutualFundData({
        allCategory: allCategoryRes.data.data || [],
        topPerformingSchemes: topPerSchemesRes.data.data || [],
        topAMCs: topAMCsRes.data.data || [],
        fundClasses: fundClassesRes.data.data || [],
        topFundManagers: fundManagersRes.data.data || [],
        themes: themesRes.data.data || [],
        investmentTheme: investmentThemeRes.data.data || [],
        newFundData: newFundDataRes.data.data || [],
      });
    } catch (error) {
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="loading loading-spinner loading-lg"></div>
  //     </div>
  //   );
  // }


  /*useEffect(() => {
    const fetchByISIN = async () => {
      try {
        const response = await searchByISIN(selectedScheme?.schemeISIN);
        const records = response?.data?.data?.data || [];
        setSipData(records)
        console.log("Transaction - searchByISIN:", records);
      } catch (error) {
        console.log('Error fetching ISIN data:', error);
      }
    };

    if (selectedScheme?.schemeISIN) {
      fetchByISIN();
    }
  }, [selectedScheme?.schemeISIN]);*/




  useEffect(() => {

    const GetInvestor = async () => {
      const userData: any = getLS(USER_DATA);
      const response = await getInvestor(userData?.InvestorRegistration?.id)
      setInvestorList(response?.data?.data?.data)

    }
    GetInvestor()
  }, [])

  const fetchByISIN = async (schemeISIN: any) => {
    try {
      const response = await searchByISIN(schemeISIN);
      const records = response?.data?.data?.data || [];
      setSipData(records)
      console.log("Transaction - searchByISIN:", records);
    } catch (error) {
      console.log('Error fetching ISIN data:', error);
    }
  };
  const handleSchemeClick = (scheme: any) => {
    setSelectedScheme(scheme)
    fetchByISIN(scheme?.schemeISIN);
    console.log("Investor LIstsss ===", investorList, "count :-", investorList.length)

    //setShowOrderPopup(true)

    // setshowInvestorPicker(true);
    //return false;

    if (investorList.length > 1) {

      setshowInvestorPopup(true)

    } else {
      if (investorList.length === 1) {
        // setSelectedInvestor(investorList[0])
        //setShowOrderPopup(true)
        //router.push(`/mutual-fund/new-order?schemeId=${scheme.id}&investorId=${investorList[0].id}`);

        setSchemeData(scheme);
        setInvestors(investorList)
        router.push("/mutual-fund/new-order");

      }

    }

    console.log("Scheme clicked:", scheme);
    // Handle the clicked scheme here (navigate, show details, etc.)
  };

  return (
    <>
      <FullPageLoader
        isVisible={loading}
        message="Processing..." />
      <div className="bg-mainbackground min-h-screen">
        <div className="container- mx-auto px-0 py-6">
          {/* Header */}
          {/* <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackClick}
            className="btn btn-ghost btn-circle"
          >
            <IoMdArrowRoundBack className="text-xl" />
          </button>
          <div>
            <CustomText className="text-2xl font-bold text-gray-900">
              Mutual Funds
            </CustomText>
            <CustomText className="text-sm text-gray-600">
              Explore and invest in mutual funds
            </CustomText>
          </div>
        </div> */}

          {/* Main Content */}
          <div className="space-y-8">
            {/* Top Performing Schemes */}
            <div className="bg-white rounded-xl p-6 shadow-none">
              <TopPerformingSchemes data={mutualFundData.topPerformingSchemes} onSchemeClick={handleSchemeClick} />
            </div>

            {/* Mutual Fund Classes */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm">
            <MutualFundClasses data={mutualFundData.fundClasses} />
          </div> */}

            {/* New Fund Offres */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <NewFundOffers data={mutualFundData.newFundData} />
            </div>

            {/* Top AMCs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <TopAMCs data={mutualFundData.topAMCs} />
            </div>

            {/* Top Fund Managers */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <TopFundManagers data={mutualFundData.topFundManagers} />
            </div>

            {/* Mutual Fund Themes */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm">
            <MutualFundThemes data={mutualFundData.themes} />
          </div> */}

            {/* Investment Themes */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm">
            <InvestmentTheme data={mutualFundData.investmentTheme} />
          </div> */}

            {/* More Mutual Fund */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm">
            <MoreMutulFund />
          </div> */}
          </div>
        </div>

        {
          showInvestorPopup && (
            <InvestorPopup
              schemeData={selectedScheme}
              open={showInvestorPopup}
              investor={investorList}
              onClose={() => setshowInvestorPopup(false)}
            />
          )
        }

        {
          showInvestorPicker && (
            <InvestorPicker
              schemeData={selectedScheme}
              open={showInvestorPicker}
              onClose={() => setshowInvestorPicker(false)}
            />
          )
        }

        {showOrderPopup && selectedInvestor && (
          <OrderPopup
            schemeData={selectedScheme}
            investor={selectedInvestor}
            sipData={sipData}
            source={"fund-exploress"}
            open={showOrderPopup}
            onClose={() => setShowOrderPopup(false)}
          />
        )}
      </div>
    </>
  );
}

export default MutualFund;
