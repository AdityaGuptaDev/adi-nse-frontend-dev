"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ADMIN_INVESTER_DATA,
  MENU_PREFIX,
  PROD_DATA,
  TOKEN_PREFIX,
  USER_DATA,
} from "@/utils/constants";

function AsPartnerBootstrap() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      let rowData: any = null;

      // 1️⃣ Try reading from URL (old system)
      const data = params.get("data");

      if (data) {
        rowData = JSON.parse(decodeURIComponent(data));
      }

      // 2️⃣ If not found in URL → check localStorage (new system)
      if (!rowData) {
        const storedData = localStorage.getItem("RM_LOGIN_DATA");

        if (storedData) {
          rowData = JSON.parse(storedData);
          localStorage.removeItem("RM_LOGIN_DATA"); // cleanup
        }
      }

      // If still no data → redirect login
      if (!rowData) {
        router.replace("/login");
        return;
      }

      // Parse login response
      const investorToken = rowData?.token;
      const investorUser = { ...rowData.user, ...rowData.meta };
      const investorMenu = rowData?.menu || [];
      const initPath = rowData?.initPath || "partner-dashboard";
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

      // Redirect to partner dashboard
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
      <AsPartnerBootstrap />
    </Suspense>
  );
}