import dynamic from 'next/dynamic';
import React from 'react'

const Page = dynamic(() => import("@/components/landing-page/index"));

function Landing() {
    return <Page />;
}

export default Landing
