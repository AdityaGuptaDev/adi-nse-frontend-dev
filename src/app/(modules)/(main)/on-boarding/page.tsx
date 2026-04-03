"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/on-boarding/index"));

function OnBoarding(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("OnBoarding");
  }, [setTitle]);


  return <Page {...props} />;
}

export default OnBoarding;
