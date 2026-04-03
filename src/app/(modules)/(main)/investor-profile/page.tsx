"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/my-profile/myProfile"));

function MyProfile(props: any) {

    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("My Profile");
    }, [setTitle]);


    return <Page {...props} />;
}

export default MyProfile;
