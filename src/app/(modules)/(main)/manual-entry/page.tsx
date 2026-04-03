"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/manual-entry/stock"));

function ManualEntry(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Manual Entry");
    }, [setTitle]);


    return <Page {...props} />;
}

export default ManualEntry;