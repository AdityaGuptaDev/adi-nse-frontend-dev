"use client";

import React from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════
//  NSE Cart (Placeholder)
// ══════════════════════════════════════════
export default function NseCart() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-[700px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart</h1>

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        {/* Empty cart icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e6f9f8" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#4bc5c1"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          Add schemes from New Investment page to your cart before placing orders
        </p>

        <button
          onClick={() => router.push("/nse-new-investment")}
          className="px-8 py-3 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: "#4bc5c1" }}
        >
          Browse Schemes
        </button>
      </div>
    </div>
  );
}
