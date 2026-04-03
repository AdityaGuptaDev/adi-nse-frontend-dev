"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/misReport/aun-report"),{ssr:false});

function AUMReport(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("aum-report");
    }, [setTitle]);


    return <Page {...props} />;
}

export default AUMReport;