"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/manual-upload/index"));

function ManualUpload(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Manual Upload Data");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default ManualUpload;
