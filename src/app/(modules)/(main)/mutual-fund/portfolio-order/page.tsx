"use client";

import { usePageTitle } from "@/context/pageTitleContext";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = dynamic(() => import("@/components/mutual-fund/portfolio-order"));

function MutualFund(props: any) {

    const { setTitle } = usePageTitle();
    const router = useRouter();

    useEffect(() => {
        setTitle("New Order");
    }, [setTitle]);


    // OrderPopup requires `open`/`onClose`; without them the X-button in the
    // popup dereferenced an undefined `onClose` and the whole form was unusable.
    return (
        <Page
            {...props}
            open={true}
            onClose={() => router.push("/portfolio")}
        />
    );
}

export default MutualFund;
