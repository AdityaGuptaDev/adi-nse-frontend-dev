'use client';

import WithAuth from '@/app/HOC/withAuth';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/investor-list/index'));

function InvestorList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Investor List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(InvestorList);
