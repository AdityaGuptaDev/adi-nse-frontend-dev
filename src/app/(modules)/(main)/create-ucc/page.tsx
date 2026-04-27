"use client";

import React from "react";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import WithAuth from "@/app/HOC/withAuth";

const Page = dynamic(() => import("@/components/onboarding-tabs"), { ssr: false });

function CreateUCC(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Investor Onboarding");
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(CreateUCC);
