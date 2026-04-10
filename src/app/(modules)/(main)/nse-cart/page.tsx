"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-cart/index"), { ssr: false });

function NseCart(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE Cart"); }, [setTitle]);
  return <Page {...props} />;
}
export default WithAuth(NseCart);
