"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/(components)/amc-scheme-detail"));

function AMCSchemeDetail(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Mutual Fund");
  }, [setTitle]);

  return (
    <Suspense fallback={<div>Loading AMC details...</div>}>
      <Page {...{ ...props }} />
    </Suspense>
  )
}

export default AMCSchemeDetail;
