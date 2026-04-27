"use client";

import Header from "@/components/mainLayout/header";
import LandingFooter from "@/components/mainLayout/landingFooter";
import LandingNav from "@/components/mainLayout/landingNav";
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
    // Theme is owned by the LandingNav toggle (persisted in localStorage as "va_theme").
    // We only set a default here on first load if the user hasn't picked one yet.
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("va_theme");
    document.documentElement.setAttribute("data-theme", stored === "light" ? "light" : "dark");
  }, []);

  // Theme is owned by <html data-theme>, set by the inline script in
  // app/layout.tsx (defaults to dark) and toggled by LandingNav. Hard-coding
  // data-theme on this wrapper would pin every logged-in page to one theme
  // regardless of the user's choice, so it's intentionally omitted.
  return (
    <div className="flex h-screen w-full bg-[#0A0A0A]">
      {/* for web */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>
      {/* for mobile */}
      <div
        className={`fixed z-50 top-0 h-screen bg-[#111111] lg:hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? "left-[-100%]" : "left-0 w-[288px]"
          }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      </div>
      <main className="flex flex-col flex-1 overflow-hidden bg-[#0A0A0A] lg:rounded-l-3xl border-l border-[#2A2A2A]">
        <Header
          toggleSidebar={toggleSidebar}
          title={title}
          collapsed={sidebarCollapsed}
          userData={user}
        />
        <LandingNav />
        <div className="flex-1 overflow-y-auto xl:px-6 py-0">
          <div className="bg-[#0A0A0A] rounded-2xl min-h-[calc(100vh-100px)] text-[#F9FAFB]">{children}</div>
          <LandingFooter />
        </div>
      </main>
    </div>
  );
}
