"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/commonUI/Onboarding/Register"), { ssr: false });

function InvestorOnboarding(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Add Investor");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InvestorOnboarding;