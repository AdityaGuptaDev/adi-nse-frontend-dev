"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import HeaderArea from "../moduleUi/headerArea";
import { useEffect, useRef, useState } from "react";
import OnBoarding from "../on-boarding";
import { getLS } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";

function Dashboard(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  const [onBoardingModal, setOnBoardingModal] = useState(false);




  useEffect(() => {
    const isKyc = getLS(USER_DATA);

    if (
      (!isKyc?.InvestorRegistration) ||
      (isKyc && isKyc?.InvestorRegistration?.is_kyc_complete === false) ||
      isKyc?.InvestorRegistration?.is_kyc_complete === null
    ) {
      // setOnBoardingModal(true);
    }
  }, []);

  console.log(onBoardingModal,"onBoardingModal")

  return (
    <div className="">
      {onBoardingModal && (
      <div>
        <OnBoarding  onBoardingModal={onBoardingModal} />
      </div>
      )}
    
      {/* <HeaderArea title="Welcome To Dashboard" /> */}
      <div className="p-4 font-bold text-2xl">Welcome To Dashboard</div>
      <div className="grid grid-cols-2 gap-4">
        {/* <div>
          <DashboardOverview />
        </div>
        <div>
         <DashboardSummary/>
        </div> */}
      </div>
      {/* <div className="mt-4">
        <RecentSales />
      </div> */}
    </div>
  );
}

export default Dashboard;
