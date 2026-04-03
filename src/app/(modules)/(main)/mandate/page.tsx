"use client";
export const dynamic = "force-dynamic";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamics from "next/dynamic";
import { useEffect } from "react";

const Page = dynamics(() => import("@/components/mandate/index"));

function Mandate(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Mandate");
  }, [setTitle]);

  return <Page {...props} />;
}

export default Mandate;
