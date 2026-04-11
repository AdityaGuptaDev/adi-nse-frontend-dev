"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheck, FiClock } from "react-icons/fi";

// ── Types ──
interface OrderDetail {
  order_id: string;
  investor_name: string;
  pan: string;
  order_type: string;
  scheme_name: string;
  folio_no: string;
  amount: string;
  status: string;
  auth_status: string;
  payment_status: string;
  confirmation_status: string;
  auth_link: string;
}

// ── Helpers ──
function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function sevenDaysAgoDDMMYYYY(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function resolveStep(order: OrderDetail): number {
  const s = (order.status || "").toLowerCase();
  if (s.includes("success") || s.includes("allotted") || s.includes("confirmed")) return 4;
  if (
    s.includes("payment") ||
    (order.payment_status || "").toLowerCase().includes("done")
  )
    return 3;
  if (
    s.includes("auth") ||
    (order.auth_status || "").toLowerCase().includes("done") ||
    (order.auth_status || "").toLowerCase().includes("success")
  )
    return 2;
  return 1;
}

// ══════════════════════════════════════════
//  NSE Order Tracking
// ══════════════════════════════════════════
export default function NseOrderTracking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderId) {
      toastAlert("warn", "No order ID provided");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post("/nse/order-status", {
        order_ids: orderId,
        from_date: sevenDaysAgoDDMMYYYY(),
        to_date: todayDDMMYYYY(),
        trans_type: "ALL",
        order_type: "ALL",
        sub_order_type: "ALL",
      });
      const rows: any[] = res?.data?.data?.report_data || [];
      if (rows.length === 0) {
        toastAlert("info", "Order not found");
        setOrder(null);
      } else {
        const r = rows[0];
        setOrder({
          order_id: r.order_id || r.orderId || r.orderNo || orderId,
          investor_name: r.investor_name || r.investorName || r.clientName || "--",
          pan: r.pan || r.panNo || "--",
          order_type: r.trans_type || r.transType || r.buySell || "--",
          scheme_name: r.scheme_name || r.schemeName || r.scheme || "--",
          folio_no: r.folio_no || r.folioNo || r.folio || "--",
          amount: r.amount || r.orderAmount || "--",
          status: r.status || r.orderStatus || "--",
          auth_status: r.auth_status || r.authStatus || "",
          payment_status: r.payment_status || r.paymentStatus || "",
          confirmation_status: r.confirmation_status || r.confirmationStatus || "",
          auth_link: r.auth_link || r.authLink || "",
        });
      }
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? resolveStep(order) : 0;

  const steps = [
    { step: 1, label: "Order Placed", desc: "Your order has been submitted" },
    { step: 2, label: "Authentication", desc: "Investor authentication" },
    { step: 3, label: "Payment", desc: "Payment processing" },
    { step: 4, label: "Order Confirmation", desc: "Order confirmed by AMC" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
          style={{ borderColor: "#F59E0B", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-[900px] mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Tracking</h1>
        <p className="text-gray-500 mb-6">
          {orderId ? "Order not found." : "No order ID provided."}
        </p>
        <button
          onClick={() => router.push("/nse-my-orders")}
          className="px-6 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: "#F59E0B" }}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="nse-module p-6 max-w-[900px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">
            {order.investor_name}{" "}
            <span className="text-gray-400">({order.pan})</span> &middot; Order ID:{" "}
            <span className="font-semibold" style={{ color: "#F59E0B" }}>
              {order.order_id}
            </span>
          </p>
        </div>
        <button
          onClick={() => router.push("/nse-my-orders")}
          className="text-sm underline"
          style={{ color: "#F59E0B" }}
        >
          Back to Orders
        </button>
      </div>

      {/* ── Info Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Order Type", value: order.order_type === "P" ? "Purchase" : order.order_type === "R" ? "Redemption" : order.order_type },
          { label: "Scheme", value: order.scheme_name },
          { label: "Folio", value: order.folio_no },
          { label: "Amount", value: order.amount },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800 truncate" title={item.value}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Progress</h2>
        <div className="relative pl-8">
          {steps.map((s, idx) => {
            const isDone = currentStep >= s.step;
            const isCurrent = currentStep === s.step - 1 || (currentStep === s.step && s.step < 4);
            const isAuthPending = s.step === 2 && currentStep === 1;

            let iconBg = "#e5e7eb"; // gray
            let iconColor = "#9ca3af";
            if (isDone) {
              iconBg = "#22c55e";
              iconColor = "#fff";
            } else if (isAuthPending) {
              iconBg = "#f59e0b";
              iconColor = "#fff";
            }

            return (
              <div key={s.step} className="relative mb-8 last:mb-0">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className="absolute left-[-20px] top-[32px] w-[2px] h-[calc(100%+8px)]"
                    style={{
                      backgroundColor: isDone ? "#22c55e" : "#e5e7eb",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className="absolute left-[-32px] top-[2px] w-[24px] h-[24px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: iconBg }}
                >
                  {isDone ? (
                    <FiCheck size={14} color={iconColor} />
                  ) : (
                    <FiClock size={14} color={iconColor} />
                  )}
                </div>

                {/* Content */}
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      isDone ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>

                  {isAuthPending && (
                    <button
                      onClick={() => {
                        if (order.auth_link) {
                          window.open(order.auth_link, "_blank");
                        } else {
                          toastAlert("info", "Authentication link not available. Please try again later.");
                        }
                      }}
                      className="mt-2 px-4 py-1.5 rounded-lg text-white text-xs font-medium"
                      style={{ backgroundColor: "#f59e0b" }}
                    >
                      Authenticate Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
