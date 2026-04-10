"use client";

import React from "react";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import WithAuth from "@/app/HOC/withAuth";

const Page = dynamic(() => import("@/components/nse-investor-list/index"), { ssr: false });

function NseInvestorList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("NSE Investor List");
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(NseInvestorList);
