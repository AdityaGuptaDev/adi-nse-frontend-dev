import dynamic from 'next/dynamic';
import React from 'react'


const Page = dynamic(() => import("@/components/forgotPassword/forgotPwdForm"));

  
function ForgotPassword() {
    return <Page />;
}

export default ForgotPassword