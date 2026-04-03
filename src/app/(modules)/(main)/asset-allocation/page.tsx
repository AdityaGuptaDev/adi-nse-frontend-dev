"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(
  () => import("@/components/reports/asset-allocation/assetAllocation")
);

function AssetAllocation() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Reports");
  }, [setTitle]);

  return <Page />;
}

export default AssetAllocation;
