"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";


const Page = dynamic(() => import("@/components/recommended-fund-settings/index"), {
  ssr: false,
  loading: () => <div>Loading scheme details...</div>,
});

function SchemeDetails(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Recommended Fund");
  }, [setTitle]);

  return (
    <Suspense fallback={<div>Loading scheme details...</div>}>
      <Page {...props} />
    </Suspense>
  );
}

export default SchemeDetails;
