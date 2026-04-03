"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Page = dynamic(() => import("@/components/payment-success"));

function PaymentSuccessPage(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Transaction Status");
  }, [setTitle]);

  return <Page {...{ ...props }} />;
}

export default PaymentSuccessPage;
