
'use client'
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/rmDashboard/RmDashboard"));

  
function RelationshipManagerDashboard(props: any) {
  
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Relationship Manager Dashboard");
  }, [setTitle]);


  return <Page {...props} />;
}

export default RelationshipManagerDashboard