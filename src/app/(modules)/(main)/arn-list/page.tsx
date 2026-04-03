'use client';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/arn-list/index'));

function ARNList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('ARN List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default ARNList;
