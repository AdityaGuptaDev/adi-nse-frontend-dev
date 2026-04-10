"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-my-orders/index"), { ssr: false });

function NseMyOrders(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE My Orders"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseMyOrders);
