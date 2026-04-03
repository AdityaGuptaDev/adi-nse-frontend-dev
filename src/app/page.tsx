"use client";

import Dashboard from "@/components/dashBoard";
import InvestorDashboard from "@/components/investorDashboard/InvestorDashboard";
import LandingPage from "@/components/landing-page";
import Header from "@/components/mainLayout/header";
import Sidebar from "@/components/mainLayout/sidebar";
import { usePageTitle } from "@/context/pageTitleContext";
import { useEffect, useState } from "react";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { title } = usePageTitle(); // get title from context

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };


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
    <>
      <LandingPage />
      {/* <div className="flex h-screen w-full bg-secondary" data-theme="light">
        <div
          className={`hidden lg:block transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-16" : "w-[288px]"
          }`}
        >
          <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
        </div>
        <div
          className={`fixed z-50 top-0 h-screen bg-secondary lg:hidden transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "left-[-100%]" : "left-0 w-[288px]"
          }`}
        >
          <Sidebar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
        </div>
        <main className="flex flex-col flex-1 overflow-hidden bg-mainbackground lg:rounded-l-3xl">
          <Header
            toggleSidebar={toggleSidebar}
            title={title}
            collapsed={sidebarCollapsed}
            userData={user}
          />
          <div className="flex-1 overflow-y-auto xl:px-6 py-0">
            <div className="bg-white rounded-2xl min-h-full">
              <InvestorD />
            </div>
          </div>
        </main>
      </div> */}
    </>
  );
}
