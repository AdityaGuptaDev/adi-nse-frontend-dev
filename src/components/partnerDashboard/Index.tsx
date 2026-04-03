import { Suspense } from "react";
import ClientDashboard from "./partnerDashboard";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientDashboard />
        </Suspense>
    );
}