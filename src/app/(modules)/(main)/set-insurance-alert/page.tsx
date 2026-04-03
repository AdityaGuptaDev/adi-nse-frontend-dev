"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/customized-alert/setInsurance"));

function SIPCal(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("set-insurance-alert");
  }, [setTitle]);


  return <Page {...props} />;
}

export default WithAuth(SIPCal);
