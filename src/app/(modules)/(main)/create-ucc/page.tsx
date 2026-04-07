"use client";

import React from "react";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import WithAuth from "@/app/HOC/withAuth";

const Page = dynamic(() => import("@/components/create-ucc/index"), { ssr: false });

function CreateUCC(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Create UCC");
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(CreateUCC);
