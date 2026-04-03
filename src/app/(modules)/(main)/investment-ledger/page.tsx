"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/misReport/investment-ledger-mis"),{ssr:false});

function InitialKYC(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("investment-ledger");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InitialKYC;