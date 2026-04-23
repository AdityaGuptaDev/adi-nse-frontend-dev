"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/index"), { ssr: false });

function FundPicker(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Fund Explore");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default FundPicker;
