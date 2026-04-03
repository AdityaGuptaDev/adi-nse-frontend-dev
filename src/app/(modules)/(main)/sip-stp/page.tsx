"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/misReport/sip-stp"),{ssr:false});

function InitialKYC(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("SIP-SWP");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InitialKYC;