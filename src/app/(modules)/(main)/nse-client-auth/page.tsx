"use client";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/context/pageTitleContext";
import WithAuth from "@/app/HOC/withAuth";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/nse-client-auth/index"), { ssr: false });

function NseClientAuth(props: any) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("NSE Client Authorization Report"); }, [setTitle]);
  return <Page {...props} />;
}

export default WithAuth(NseClientAuth);
