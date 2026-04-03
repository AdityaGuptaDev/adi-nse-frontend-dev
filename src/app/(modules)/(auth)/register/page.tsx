import dynamic from "next/dynamic";
import { Suspense } from "react";

const Page = dynamic(() => import("@/components/register/registerForm"), {
    //ssr: false, // (optional but helps prevent SSR bailout)
});

export default function Register() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Page />
        </Suspense>
    );
}
