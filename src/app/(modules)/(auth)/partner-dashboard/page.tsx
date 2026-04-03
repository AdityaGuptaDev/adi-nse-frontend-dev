
'use client'
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/partnerDashboard/partnerDashboard"), {
  ssr: false,
})

function partnerDashboard(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Partner Dashboard");
    }, [setTitle]);


    return <Page {...props} />;
}

export default partnerDashboard