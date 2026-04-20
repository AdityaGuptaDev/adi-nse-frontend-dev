"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

interface Scheme {
  scheme_code: string;
  scheme_name: string;
  amc_code: string;
  amc_name: string;
  isin: string;
  sub_category: string;
  scheme_type: string;
  purchase_allowed: string;
  redemption_allowed: string;
  sip_allowed: string;
  min_purchase_amount: string;
  nav: string;
  nav_date: string;
}

export default function NseNewInvestment() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "nfo">("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch scheme master
  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/nse/scheme-master", { params: { file_type: "SCH" } });
      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload?.status === "S" && payload?.data) {
        // Parse pipe-separated text data if returned as text
        const rawData = payload.data;
        if (typeof rawData === "string") {
          const lines = rawData.split("\n").filter((l: string) => l.trim());
          const header = lines[0]?.split("|") || [];
          const parsed = lines.slice(1).map((line: string) => {
            const cols = line.split("|");
            const obj: any = {};
            header.forEach((h: string, i: number) => {
              obj[h.trim().toLowerCase().replace(/\s+/g, "_")] = cols[i]?.trim() || "";
            });
            return obj;
          });
          setSchemes(parsed);
        } else if (Array.isArray(rawData)) {
          setSchemes(rawData);
        } else {
          setSchemes([]);
        }
      } else {
        setSchemes([]);
      }
    } catch (err) {
      handleServerError(err);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Filter schemes
  useEffect(() => {
    let filtered = [...schemes];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.scheme_name?.toLowerCase().includes(q) ||
          s.amc_name?.toLowerCase().includes(q) ||
          s.scheme_code?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((s) => s.sub_category?.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    setFilteredSchemes(filtered);
    setPage(1);
  }, [schemes, debouncedSearch, categoryFilter]);

  // Get unique categories
  const categories = [...new Set(schemes.map((s) => s.sub_category).filter(Boolean))].sort();

  // Pagination
  const totalPages = Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE);
  const paginatedSchemes = filteredSchemes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTransact = (scheme: Scheme) => {
    const params = new URLSearchParams({
      scheme_code: scheme.scheme_code || "",
      scheme_name: scheme.scheme_name || "",
      amc_code: scheme.amc_code || "",
      isin: scheme.isin || "",
      min_amount: scheme.min_purchase_amount || "100",
    });
    router.push(`/nse-order-form?${params.toString()}`);
  };

  return (
    <div className="nse-module p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F9FAFB]">Invest Online NSE / New Investment</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-5">
        <div className="flex-1">
          <label className="text-xs text-[#9CA3AF] font-medium mb-1 block">Scheme</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-[#2A2A2A] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
              placeholder="Search by scheme name, AMC, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="text-xs text-[#9CA3AF] font-medium mb-1 block">Filter</label>
          <select
            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A2A] mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-[#9CA3AF] hover:text-[#E5E7EB]"
          }`}
        >
          All Schemes
        </button>
        <button
          onClick={() => setActiveTab("nfo")}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "nfo"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-[#9CA3AF] hover:text-[#E5E7EB]"
          }`}
        >
          NFO Schemes
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-xs text-[#9CA3AF]">
        <span>Total: <strong className="text-[#F9FAFB]">{filteredSchemes.length}</strong> schemes</span>
        {totalPages > 1 && (
          <span>Page <strong className="text-[#F9FAFB]">{page}</strong> of <strong className="text-[#F9FAFB]">{totalPages}</strong></span>
        )}
      </div>

      {/* Scheme Table */}
      <div className="overflow-x-auto border border-[#2A2A2A] rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1F1A1A] text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              <th className="px-4 py-3 min-w-[300px]">
                Scheme
                <span className="ml-1 text-gray-300 cursor-pointer">&#8645;</span>
              </th>
              <th className="px-4 py-3">Sub Category</th>
              <th className="px-4 py-3 text-right">NAV</th>
              <th className="px-4 py-3 text-right">Min Amount</th>
              <th className="px-4 py-3 text-center">Purchase</th>
              <th className="px-4 py-3 text-center">SIP</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-[#6B7280]">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-[#F59E0B]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading schemes...
                  </div>
                </td>
              </tr>
            ) : paginatedSchemes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-[#6B7280]">
                  {schemes.length === 0 ? "No schemes loaded. Click refresh to try again." : "No schemes match your search."}
                </td>
              </tr>
            ) : (
              paginatedSchemes.map((scheme, idx) => (
                <tr key={scheme.scheme_code || idx} className="hover:bg-[#1F1A1A]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#F59E0B] hover:underline cursor-pointer text-sm">
                      {scheme.scheme_name || "--"}
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5 font-mono">
                      {scheme.scheme_code} | {scheme.amc_code}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9CA3AF] text-xs">{scheme.sub_category || "--"}</td>
                  <td className="px-4 py-3 text-right text-[#E5E7EB] font-medium">
                    {scheme.nav ? `₹${scheme.nav}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#9CA3AF] text-xs">
                    {scheme.min_purchase_amount ? `₹${Number(scheme.min_purchase_amount).toLocaleString("en-IN")}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${scheme.purchase_allowed === "Y" ? "bg-green-400" : "bg-red-400"}`} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${scheme.sip_allowed === "Y" ? "bg-green-400" : "bg-red-400"}`} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleTransact(scheme)}
                      className="px-4 py-1.5 bg-[#F59E0B] text-white rounded-md text-xs font-semibold hover:bg-[#D97706] transition-colors"
                    >
                      Transact
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-[#9CA3AF] text-xs">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredSchemes.length)} of {filteredSchemes.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F1A1A]"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page ? "bg-[#F59E0B] text-white" : "border border-[#2A2A2A] hover:bg-[#1F1A1A]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F1A1A]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
