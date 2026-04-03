import dynamic from 'next/dynamic';
import React from 'react'


const Page = dynamic(() => import("@/components/dashboardSetting/dashboardSetting"));

  
function DashboardSettingsPage() {
    return <Page  />;
}

export default DashboardSettingsPage