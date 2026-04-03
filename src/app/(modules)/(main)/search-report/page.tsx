
"use client"
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/search-report/searchReport"));

  
function DashboardHeader(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Client List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default DashboardHeader