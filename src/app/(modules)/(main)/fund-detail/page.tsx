"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";

const Page = dynamic(() => import("@/components/fund-detail/index"));

function FundDetail(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Scheme Details");
  }, [setTitle]);

  return (
    <Suspense fallback={<div>Loading scheme details...</div>}>
      <Page {...{ ...props }} />
    </Suspense>
  )

}

export default FundDetail;
