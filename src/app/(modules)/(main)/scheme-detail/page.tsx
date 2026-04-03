"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";

const Page = dynamic(() => import("@/components/scheme-detail/index"));

// const Page = dynamic(() => import("@/components/scheme-detail/index"), { ssr: false });

function SchemeDetails(props: any) {
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

export default SchemeDetails;
