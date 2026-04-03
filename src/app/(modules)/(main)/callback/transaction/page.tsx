"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/callback/transaction/success"), { ssr: false })

function Transaction(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle(" Investor Dashboard");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default Transaction;