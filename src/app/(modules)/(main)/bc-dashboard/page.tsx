"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/bc-dashboard/index"),{ssr:false})
  
function BCDashboard(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Business Correspondent Dashboard");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default BCDashboard;