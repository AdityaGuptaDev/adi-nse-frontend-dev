"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/transactionHistory/index"),{ssr:false});

function TransactionHistory(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Transaction History");
    }, [setTitle]);


    return <Page {...props} />;
}

export default TransactionHistory;