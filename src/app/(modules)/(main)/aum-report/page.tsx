"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/aumReport/index"),{ssr:false});

function AUMReport(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Aum-report");
    }, [setTitle]);


    return <Page {...props} />;
}

export default AUMReport;