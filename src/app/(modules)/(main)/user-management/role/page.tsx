"use client";
import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/role"));

function RoleList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Role");
  }, [setTitle]);
  return <Page {...props} />;
}

export default WithAuth(RoleList);
// export default RoleList
