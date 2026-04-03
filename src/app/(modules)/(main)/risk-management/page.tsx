"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/risk-management/risk-suitability"));

function RiskManagement(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("RiskManagement");
    }, [setTitle]);


    return <Page {...props} />;
}

export default RiskManagement;