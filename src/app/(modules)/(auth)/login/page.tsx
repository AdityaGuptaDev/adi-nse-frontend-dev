import dynamic from 'next/dynamic';
import React from 'react'


const Page = dynamic(() => import("@/components/login/loginForm"));

  
function Login() {
    return <Page  />;
}

export default Login