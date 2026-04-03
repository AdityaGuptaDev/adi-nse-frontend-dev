"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/(components)/top-amc-list"));

function TopAMCList(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Mutual Fund");
  }, [setTitle]);


  return <Page {...props} />;
}

export default TopAMCList;

