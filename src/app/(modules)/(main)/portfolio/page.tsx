"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/portfolio/portfolio"));

function Portfolio(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Portfolio");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default Portfolio;
