"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/rural-fund-explore/index"));

function RuralFundExplore(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Fund Explore");
  }, [setTitle]);

  return <Page {...props} />;
}

export default RuralFundExplore;
