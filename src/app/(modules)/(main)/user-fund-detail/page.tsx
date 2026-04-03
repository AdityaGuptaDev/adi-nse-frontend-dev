"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";

const Page = dynamic(() => import("@/components/scheme-detail/components/user-fund-details"));

function UserFundDetail(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Scheme Details");
  }, [setTitle]);

  return (
    <Suspense fallback={<div>Loading fund details...</div>}>
      <Page {...{ ...props }} />
    </Suspense>
  )
}

export default UserFundDetail;