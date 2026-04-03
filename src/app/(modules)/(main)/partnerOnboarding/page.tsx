"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/partnerOnboarding/partnerOnboarding"),{ssr:false})
  
function partnerOnboarding(props: any) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Partner Onboading");
    }, [setTitle]);

    return <Page {...{ ...props }} />;
}

export default partnerOnboarding;