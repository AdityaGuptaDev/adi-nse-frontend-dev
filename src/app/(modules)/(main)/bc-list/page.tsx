'use client';

import WithAuth from '@/app/HOC/withAuth';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/bc-list/index'));

function BcList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('BC List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(BcList);
