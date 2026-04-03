"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/lumpsum-calculator/lumpsum-calculator"));

function LumpsumCal(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Lumpsum Calculator");
  }, [setTitle]);


  return <Page {...props} />;
}

export default WithAuth(LumpsumCal);
