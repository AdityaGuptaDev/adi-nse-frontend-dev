"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/dashBoard/index"))
  
function Dashboard(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Welcome To Dashboard");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default Dashboard;