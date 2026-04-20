"use client"

import React, { useEffect } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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

  // The auth pages now carry their own Golden-Black themed background (full-bleed
  // gradient + animated layers). The layout just needs to provide a dark shell so
  // the viewport around the page doesn't flash white.
  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-theme="light">
      {children}
    </div>
  );
}
