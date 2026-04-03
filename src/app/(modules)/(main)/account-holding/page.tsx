"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/account-holding/index"));

function InitialKYC(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Account Holding");
    }, [setTitle]);


    return <Page {...props} />;
}

export default InitialKYC;