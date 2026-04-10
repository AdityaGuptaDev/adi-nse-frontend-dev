"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-mandate-list/index"), { ssr: false });

function NseMandateList(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE Mandate List"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseMandateList);
