'use client';

import WithAuth from '@/app/HOC/withAuth';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/rm-list-dtl/index'));

function RmList(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('RM List');
  }, [setTitle]);

  return <Page {...props} />;
}

export default WithAuth(RmList);
