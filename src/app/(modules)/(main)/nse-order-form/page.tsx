"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-order-form/index"), { ssr: false });

function NseOrderForm(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE Order Form"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseOrderForm);
