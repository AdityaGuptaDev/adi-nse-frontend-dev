"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(
  () => import("@/components/reports/portfolio-summary/portfolioSummary")
);

function Reports(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Reports");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default Reports;
