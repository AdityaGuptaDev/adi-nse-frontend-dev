"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/kyc-quick-summary/index"),{ssr:false});

function InitialKYC(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Quick Summary");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InitialKYC;
