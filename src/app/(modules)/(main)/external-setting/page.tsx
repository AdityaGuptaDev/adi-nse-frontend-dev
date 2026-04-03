"use client";

import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/external-setting/index"))


function ExternalSetting(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("External Setting");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default ExternalSetting