"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ADMIN_INVESTER_DATA, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";

/*
  Bootstrap page used when admin clicks "Dashboard" on an investor.
  It receives token, user payload and menu via query (encrypted by backend ideally),
  stores them in sessionStorage/localStorage keys expected by the app, and redirects
  to investor initPath. This runs in a separate window so it won't affect the admin tab.
*/

function AsUserBootstrap() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      const data = params.get("data");
      if (!data) {

        router.replace("/login");
        return;
      }
      const rowData = JSON.parse(decodeURIComponent(data))

      // Parse
      const investorToken = rowData?.token;
      const investorUser = { ...rowData.user, ...rowData.meta }; // contains user, menu, meta, initPath, etc per your sample
      const investorMenu = rowData?.menu || [];
      const initPath = rowData?.initPath || 'user-dashboard';
      const filterData = rowData?.findFilterData;

      // Persist to storage expected by the app; SESSION ONLY (do not touch localStorage)
      sessionStorage.setItem(TOKEN_PREFIX, JSON.stringify(investorToken));
      sessionStorage.setItem(USER_DATA, JSON.stringify(investorUser));
      sessionStorage.setItem(MENU_PREFIX, JSON.stringify(investorMenu));
      sessionStorage.setItem(PROD_DATA, JSON.stringify(rowData));
      sessionStorage.setItem(ADMIN_INVESTER_DATA, filterData ? JSON.stringify(filterData) : JSON.stringify({}));



      router.replace(`/${initPath.replace(/^\//, "")}`);
    } catch (e) {
      console.error(e);
      router.replace("/login");
    }
  }, [params, router]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AsUserBootstrap />
    </Suspense>
  );
}

