"use client"

import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'


const Page = dynamic(() => import("@/components/changePassword/changepwd"));

  
function ChangePassword() {
    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Change Password");
    }, [setTitle]);

    return <Page  />;
}

export default ChangePassword