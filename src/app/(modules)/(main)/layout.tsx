"use client";

import Header from "@/components/mainLayout/header";
import Sidebar from "@/components/mainLayout/sidebar";
import HeaderArea from "@/components/moduleUi/headerArea";
import { PageTitleProvider, usePageTitle } from "@/context/pageTitleContext";
import { PROD_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";
import { useEffect, useState } from "react";
// other imports...

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTitleProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </PageTitleProvider>
  );
}

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { title } = usePageTitle(); // get title from context

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const user = getLS(PROD_DATA)?.user;

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-secondary" data-theme="light">
      {/* for web */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>
      {/* for mobile */}
      <div
        className={`fixed z-50 top-0 h-screen bg-secondary lg:hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? "left-[-100%]" : "left-0 w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>
      {/* <main className="flex-1 overflow-y-auto xl:px-0 bg-[#F4F6F8] rounded-l-3xl min-h-screen"> */}
      <main className="flex flex-col flex-1 overflow-hidden bg-mainbackground lg:rounded-l-3xl">
        <Header
          toggleSidebar={toggleSidebar}
          title={title}
          collapsed={sidebarCollapsed}
          userData={user}
        />
        <div className="flex-1 overflow-y-auto xl:px-6 py-0">
          <div className="bg-white rounded-2xl min-h-[calc(100vh-100px)]">{children}</div>
        </div>
      </main>
    </div>
  );
}
