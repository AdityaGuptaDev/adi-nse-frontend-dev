"use client"

import { usePageTitle } from '@/context/pageTitleContext';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react'

const Page = dynamic(() => import("@/components/goal-list/index"))
  
function GoalList(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
      setTitle("Goal Planning");
    }, [setTitle]);


    return <Page {...{ ...props }} />;
}

export default GoalList;