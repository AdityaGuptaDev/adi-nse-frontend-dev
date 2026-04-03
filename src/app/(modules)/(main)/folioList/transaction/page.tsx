"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";

const Page = dynamic(() => import("@/components/folioList/transaction"), { ssr: false });

function TransactionContent() {
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();

  const pan = searchParams.get("pan") || "";
  const pageType = searchParams.get("page") || "";

  let selectedFolios: any[] = [];
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("selectedFolios");
    selectedFolios = storedData ? JSON.parse(storedData) : [];
  }

  useEffect(() => {
    setTitle("Transaction");
  }, [setTitle]);

  return <Page pan={pan} pageType={pageType} selectedFolios={selectedFolios} />;
}

export default function Transaction() {
  return (
    <Suspense fallback={<div>Loading transaction...</div>}>
      <TransactionContent />
    </Suspense>
  );
}
