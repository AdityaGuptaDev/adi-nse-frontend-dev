"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-kyc-status/index"), { ssr: false });

function NseKycStatus(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE KYC Status"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseKycStatus);
