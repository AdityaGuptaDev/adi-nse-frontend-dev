"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/portfolio-order"));

function MutualFund(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("New Order");
    }, [setTitle]);


    return <Page {...props} />;
}

export default MutualFund;

