"use client";

import WithAuth from "@/app/HOC/withAuth";
import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/can-onboarding"));

function CanImageUpload(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Can Image Upload");
    }, [setTitle]);


    return <Page {...props} />;
}

export default CanImageUpload;
