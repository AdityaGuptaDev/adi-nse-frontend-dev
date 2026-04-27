"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LANG_OPTIONS, useLandingLang } from "@/i18n/landingI18n";

interface LanguageDropdownProps {
    className?: string;
}

export default function LanguageDropdown({ className = "" }: LanguageDropdownProps) {
    const { lang, setLang } = useLandingLang();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const current = LANG_OPTIONS.find((l) => l.code === lang) ?? LANG_OPTIONS[0];

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all duration-200"
            >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-semibold">{current.native}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-[#2A2A2A] bg-[#111111] shadow-xl overflow-hidden z-50"
                >
                    {LANG_OPTIONS.map((opt) => {
                        const active = opt.code === lang;
                        return (
                            <button
                                key={opt.code}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                    setLang(opt.code);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors ${
                                    active
                                        ? "bg-[#1F1A1A] text-[#F59E0B]"
                                        : "text-[#F9FAFB] hover:bg-[#1F1A1A] hover:text-[#F59E0B]"
                                }`}
                            >
                                <span className="flex flex-col items-start leading-tight">
                                    <span className="font-semibold">{opt.native}</span>
                                    <span className="text-[11px] text-[#9CA3AF]">{opt.label}</span>
                                </span>
                                {active && <Check className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
