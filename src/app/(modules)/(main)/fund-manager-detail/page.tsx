"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/(components)/fund-manager-detail"));

function FundManagerDetails(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Mutual Fund");
  }, [setTitle]);

  return (
    <Suspense fallback={<div>Loading Fund Manager details...</div>}>
      <Page {...{ ...props }} />
    </Suspense>
  )
}

export default FundManagerDetails;
