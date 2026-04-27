"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import LanguageDropdown from "@/commonUI/LanguageDropdown";
import { useLandingLang } from "@/i18n/landingI18n";

// In-app nav shown under each post-login dashboard header. Each item routes to
// an existing protected page so the user stays logged in. The active route is
// highlighted by comparing the current pathname. The right-side controls flip
// html[data-theme] between "dark" (default) and "light" and let the user pick
// a UI language; both choices persist in localStorage and apply app-wide.
const NAV_ITEMS = [
    { id: "account-holding", labelKey: "dnav.accountHolding", path: "/account-holding" },
    { id: "fund-explore", labelKey: "dnav.fundExplore", path: "/fund-explore" },
    { id: "sip-calculator", labelKey: "dnav.calculator", path: "/sip-calculator" },
    { id: "risk-profile", labelKey: "dnav.riskProfile", path: "/risk-profile" },
    { id: "all-report", labelKey: "dnav.reports", path: "/all-report" },
    { id: "article", labelKey: "dnav.article", path: "/article" },
    { id: "investment-videos", labelKey: "dnav.videos", path: "/investment-videos" },
];

const THEME_KEY = "va_theme";
type Theme = "dark" | "light";

const applyTheme = (t: Theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", t);
};

export default function LandingNav() {
    const { t } = useLandingLang();
    const router = useRouter();
    const pathname = usePathname();
    const [theme, setTheme] = useState<Theme>("dark");

    // Hydrate from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = (window.localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
        setTheme(stored);
        applyTheme(stored);
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(THEME_KEY, next);
        }
    };

    return (
        <div className="va-landing-nav bg-[#0A0A0A] border-b border-[#2A2A2A]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex-1" />
                <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => router.push(item.path)}
                                className={`va-nav-btn px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors rounded-md ${
                                    isActive
                                        ? "text-[#F59E0B] bg-[#1F1A1A]"
                                        : "text-[#9CA3AF] hover:text-[#F59E0B] hover:bg-[#1F1A1A]"
                                }`}
                            >
                                {t(item.labelKey)}
                            </button>
                        );
                    })}
                </nav>
                <div className="flex-1 flex justify-end items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        aria-label="Toggle theme"
                        className="va-theme-toggle inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#2A2A2A] text-[#9CA3AF] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                    >
                        {/* Icon represents the CURRENT theme — Moon when dark
                            is active, Sun when light is active. */}
                        {theme === "dark" ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                    </button>
                    <LanguageDropdown />
                </div>
            </div>
        </div>
    );
}
