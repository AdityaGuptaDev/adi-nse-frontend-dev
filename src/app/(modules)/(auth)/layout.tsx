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

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[url('/bg.png')] bg-no-repeat bg-cover bg-[position:Right_bottom] xl:bg-[length:120%]"
      data-theme="light"
    >
      {children}
    </div>
  );
}
