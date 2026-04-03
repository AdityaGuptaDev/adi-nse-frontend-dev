'use client';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/partnerList/index'),{ssr:false});

function PartnerList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Partner List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default PartnerList;
