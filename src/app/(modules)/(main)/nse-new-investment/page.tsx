"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-new-investment/index"), { ssr: false });

function NseNewInvestment(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE New Investment"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseNewInvestment);
