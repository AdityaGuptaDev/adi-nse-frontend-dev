
"use client";
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/investorDashboard/InvestorDashboard"));


function MutualFundInvestorDashboard(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("My Investment Portfolio");
  }, [setTitle]);


  return <Page {...props} />;
}
export default MutualFundInvestorDashboard



