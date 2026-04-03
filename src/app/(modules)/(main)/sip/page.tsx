
'use client'
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/sip/index"));

  
function SIP(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("SIP");
  }, [setTitle]);


  return <Page {...props} />;
}

export default SIP