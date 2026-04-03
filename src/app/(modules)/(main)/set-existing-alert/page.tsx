"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/customized-alert/setExisting"));

function SIPCal(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("set-existing-alert");
  }, [setTitle]);


  return <Page {...props} />;
}

export default WithAuth(SIPCal);
