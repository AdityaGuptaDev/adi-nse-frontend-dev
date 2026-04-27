"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "va_theme";
type Theme = "dark" | "light";

const applyTheme = (t: Theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", t);
};

export function useAppTheme() {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = (window.localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
        setTheme(stored);
        applyTheme(stored);
    }, []);

    const toggle = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(THEME_KEY, next);
        }
    };

    return { theme, toggle, isLight: theme === "light" };
}

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
    const { theme, toggle } = useAppTheme();
    const isLight = theme === "light";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                isLight
                    ? "bg-white border-[#E5E7EB] text-[#B45309] hover:bg-[#F3F4F6]"
                    : "bg-[#1F1A1A] border-[#2A2A2A] text-[#F59E0B] hover:bg-[#2A2A2A]"
            } ${className}`}
        >
            {/* Icon represents the CURRENT theme: Moon = dark mode is active,
                Sun = light mode is active. Clicking flips to the other. */}
            {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
