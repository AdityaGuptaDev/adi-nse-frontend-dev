"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/permission/permission"));

function Permission(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Permission");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default Permission;
