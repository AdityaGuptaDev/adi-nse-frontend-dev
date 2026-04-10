"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useRouter } from "next/navigation";

// ── Types ──
type TabKey = "SIP" | "XSIP" | "STP" | "SWP";

interface SIPRow {
  client_code: string;
  sip_reg_no: string;
  scheme_name: string;
  frequency: string;
  amount: string;
  start_date: string;
  end_date: string;
  status: string;
}

// ══════════════════════════════════════════
//  NSE Systematic Orders
// ══════════════════════════════════════════
export default function NseSystematicOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("SIP");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "SIP", label: "SIP" },
    { key: "XSIP", label: "XSIP" },
    { key: "STP", label: "STP" },
    { key: "SWP", label: "SWP" },
  ];

  // ── Cancel SIP ──
  const handleCancelSIP = async (row: SIPRow) => {
    if (!window.confirm(`Cancel SIP registration ${row.sip_reg_no}?`)) return;
    setCancelling(row.sip_reg_no);
    try {
      await api.post("/nse/sip-cancellation", {
        can_data: [
          {
            client_code: row.client_code,
            sip_reg_no: row.sip_reg_no,
            remarks: "13:(Cancelled by user)",
          },
        ],
      });
      toastAlert("success", `SIP ${row.sip_reg_no} cancellation submitted`);
    } catch (err: any) {
      handleServerError(err);
    } finally {
      setCancelling(null);
    }
  };

  // ── SIP Table (placeholder) ──
  const renderSIPTable = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client Code</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Reg No</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Scheme</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Frequency</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Amount</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Start Date</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">End Date</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={9} className="text-center py-12 text-gray-400">
              Coming soon - data will load from registration reports
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── XSIP Table (placeholder) ──
  const renderXSIPTable = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client Code</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">XSIP Reg No</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Scheme</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Frequency</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Amount</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Start Date</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">End Date</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Mandate ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={9} className="text-center py-12 text-gray-400">
              Coming soon - data will load from registration reports
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── STP Table (placeholder) ──
  const renderSTPTable = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client Code</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">STP Reg No</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Source Scheme</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Target Scheme</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Amount</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Start Date</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">End Date</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={8} className="text-center py-12 text-gray-400">
              Coming soon - data will load from registration reports
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── SWP Table (placeholder) ──
  const renderSWPTable = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ backgroundColor: "#f0fdfa" }}>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client Code</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">SWP Reg No</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Scheme</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Frequency</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Amount</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Start Date</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">End Date</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={8} className="text-center py-12 text-gray-400">
              Coming soon - data will load from registration reports
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderTable = () => {
    switch (activeTab) {
      case "SIP": return renderSIPTable();
      case "XSIP": return renderXSIPTable();
      case "STP": return renderSTPTable();
      case "SWP": return renderSWPTable();
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Systematic Orders</h1>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key
                ? "text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            style={
              activeTab === tab.key
                ? { backgroundColor: "#4bc5c1" }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {renderTable()}
    </div>
  );
}
