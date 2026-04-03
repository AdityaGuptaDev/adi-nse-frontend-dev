"use client"

import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/risk-profile/index"))
  
function RiskProfile(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Risk Profile");
    }, [setTitle]);


    return <Page {...{ ...props }} />;
}

export default RiskProfile;