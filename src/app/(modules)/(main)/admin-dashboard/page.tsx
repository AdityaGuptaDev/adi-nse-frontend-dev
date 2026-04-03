'use client';
import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Page = dynamic(() => import('@/components/adminDashboard/AdminDashboard'));

function AdminDashboard(props: any) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Admin Dashboard');
  }, [setTitle]);

  return <Page {...props} />;
}

export default AdminDashboard;
