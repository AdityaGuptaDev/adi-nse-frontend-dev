"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/register/bcRegisterThroughAdmin"),{ssr:false})
  
function bcRegisterThroughAdmin(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("BC Onboading");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default bcRegisterThroughAdmin;