"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/investor-onboarding/index"), { ssr: false });

function InvestorOnboarding(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Investor Reports");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InvestorOnboarding;