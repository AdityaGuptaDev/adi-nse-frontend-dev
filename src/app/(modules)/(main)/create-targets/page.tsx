"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/createTargets/create-targets"),{ssr:false});

function CreateTarget(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("RiskManagement");
    }, [setTitle]);


    return <Page {...props} />;
}

export default CreateTarget;