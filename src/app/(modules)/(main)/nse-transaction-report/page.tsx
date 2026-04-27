"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-transaction-report/index"), { ssr: false });

function NseTransactionReport(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE Transaction Report"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseTransactionReport);
