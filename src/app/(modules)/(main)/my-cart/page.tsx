"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/my-cart/index"));

function MyCart(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("My Cart");
  }, [setTitle]);


  return <Page {...props} />;
}

export default MyCart;
