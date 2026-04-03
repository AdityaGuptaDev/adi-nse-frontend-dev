"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/can-report/index"),{ssr:false});

function CanReport(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("CAN Report");
    }, [setTitle]);


    return <Page {...props} />;
}

export default CanReport;