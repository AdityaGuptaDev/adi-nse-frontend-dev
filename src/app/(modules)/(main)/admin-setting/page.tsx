"use client";

import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/adminSetting/adminSetting"));


function adminDashboard(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle('Welcome To Admin Setting');
    }, [setTitle]);

    return <Page {...props} />;
}

export default adminDashboard;