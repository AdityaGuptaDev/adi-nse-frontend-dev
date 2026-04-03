"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ADMIN_INVESTER_DATA,
  MENU_PREFIX,
  PROD_DATA,
  TOKEN_PREFIX,
  USER_DATA
} from "@/utils/constants";

function AsInvestorBootstrap() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      let rowData: any = null;

      const data = params.get("data");

      if (data) {
        rowData = JSON.parse(decodeURIComponent(data));
      }

      if (!rowData) {
        const stored = localStorage.getItem("partnerLoginData");
        if (stored) {
          rowData = JSON.parse(stored);
          localStorage.removeItem("partnerLoginData"); 
        }
      }

      if (!rowData) {
        router.replace("/login");
        return;
      }

      const investorToken = rowData?.token;
      const investorUser = { ...rowData.user, ...rowData.meta };
      const investorMenu = rowData?.menu || [];
      const initPath = rowData?.initPath || "dashboards";
      const filterData = rowData?.findFilterData;

      // Store session data
      sessionStorage.setItem(TOKEN_PREFIX, JSON.stringify(investorToken));
      sessionStorage.setItem(USER_DATA, JSON.stringify(investorUser));
      sessionStorage.setItem(MENU_PREFIX, JSON.stringify(investorMenu));
      sessionStorage.setItem(PROD_DATA, JSON.stringify(rowData));
      sessionStorage.setItem(
        ADMIN_INVESTER_DATA,
        filterData ? JSON.stringify(filterData) : JSON.stringify({})
      );

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
      <AsInvestorBootstrap />
    </Suspense>
  );
}