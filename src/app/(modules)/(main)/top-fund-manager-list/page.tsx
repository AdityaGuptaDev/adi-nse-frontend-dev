"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/(components)/top-fund-manager-list"));

function TopFundManagerList(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Mutual Fund");
  }, [setTitle]);


  return <Page {...props} />;
}

export default TopFundManagerList;

