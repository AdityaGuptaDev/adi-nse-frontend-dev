import dynamic from 'next/dynamic';
import React from 'react'


const Page = dynamic(() => import("@/components/investorOnboarding/investorOnboarding"));

  
function investorOnboarding() {
    return <Page  />;
}

export default investorOnboarding