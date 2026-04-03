"use client";


import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/order-success/index"),{ssr:false});

function OrderSuccess(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Order Success");
  }, [setTitle]);


  return <Page {...props} />;
}

export default OrderSuccess;
