"use client"

import React from 'react'
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/transactOnline/show-create-cart"));

function TransactOnline(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("TransactOnline");
    }, [setTitle]);


    return <Page {...props} />;
}

export default TransactOnline;