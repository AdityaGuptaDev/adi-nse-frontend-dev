"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/initial-KYC/index"));

function InitialKYC(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Initiate On-Boarding");
  }, [setTitle]);


  return <Page {...props} />;
}

export default WithAuth(InitialKYC);
