"use client";

import { ArrowLeft } from "lucide-react";
import router from "next/router";
import React, { useState } from "react";



interface MutualFundProps {
  onBack?: () => void;
  clientName?: string;
}
export default function MutualFundPage({ onBack }: MutualFundProps) {
  // Form state
  const [formData, setFormData] = useState({
    investor: "Pankaj Kumar Sinha (BEHIND GUMLA PETROL PUMP EKTA NAGAR BOOTY MC)",
    amc: "Adiva Birla Sunlife Mutual Fund",
    scheme: "",
    purchaseDate: { day: "1", month: "Jan", year: "yyyy" },
    dematOption: "existing",
    existingDemat: "1017207976 (Aditya Birla Sunlife M)",
    investment: { total: "", units: "1", price: "" }
  });

  const [showProductDetails, setShowProductDetails] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Data options
  const investors = [
    "Pankaj Kumar Sinha (BEHIND GUMLA PETROL PUMP EKTA NAGAR BOOTY MC)",
    "Other Investor 1",
    "Other Investor 2"
  ];

  const amcs = [
    "Adiva Birla Sunlife Mutual Fund",
    "HDFC Mutual Fund",
    "ICICI Prudential Mutual Fund",
    "SBI Mutual Fund",
    "Nippon India Mutual Fund"
  ];

  const schemes = [
    "ABSL Bal Bhavishya Yojna Wealth Plan - Reg - Gr",
    "ABSL Equity Fund - Direct - Growth",
    "ABSL Frontline Equity Fund - Direct - Growth",
    "ABSL Tax Relief 96 - Direct - Growth"
  ];

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Handlers
  const handleChange = (field: string, value: string | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === "scheme" && value) {
      setShowProductDetails(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white shadow-sm">
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center bg-indigo-300 text-white hover:bg-indigo-400 transition-colors px-4 py-2 rounded"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-lg font-medium">Add New Investment</h1>
          <div className="flex space-x-2">
            <button className="bg-blue-500 px-3 py-1 rounded text-sm">📊 Manage Tickets</button>
            <button className="bg-green-500 px-3 py-1 rounded text-sm">💬 Send us Whatsapp</button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-0">
          {/* Top Section - Selection Fields */}
          <div className="border-b">
            <table className="w-full">
              <tbody>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300 w-48">Select Investor:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <select
                      value={formData.investor}
                      onChange={(e) => handleChange("investor", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      {investors.map((investor, i) => (
                        <option key={i} value={investor}>{investor}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300 w-48">Distributor:</td>
                  <td className="px-4 py-2">
                    <div className="px-2 py-1 bg-gray-100 text-sm">
                      {formData.investor}
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">Select AMC/Stock Exchange:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <select
                      value={formData.amc}
                      onChange={(e) => handleChange("amc", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      {amcs.map((amc, i) => (
                        <option key={i} value={amc}>{amc}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">
                    MF Scheme/Stock/NPS: <span className="text-blue-600 underline cursor-pointer">[ Help ]</span>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={formData.scheme}
                      onChange={(e) => handleChange("scheme", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">Select scheme...</option>
                      {schemes.map((scheme, i) => (
                        <option key={i} value={scheme}>{scheme}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Product Details Section - Only show when scheme is selected */}
          {showProductDetails && (
            <>
              <div className="border-b">
                <div className="bg-white px-4 py-2 border-b border-gray-300">
                  <h2 className="text-sm font-bold">Product Details:</h2>
                </div>

                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">Purchase Date:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            value={formData.purchaseDate.day}
                            onChange={(e) => handleChange("purchaseDate", { ...formData.purchaseDate, day: e.target.value })}
                            className="w-12 border border-gray-300 px-2 py-1 text-sm"
                            placeholder="DD"
                            maxLength={2}
                          />
                          <select
                            value={formData.purchaseDate.month}
                            onChange={(e) => handleChange("purchaseDate", { ...formData.purchaseDate, month: e.target.value })}
                            className="border border-gray-300 px-2 py-1 text-sm"
                          >
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={formData.purchaseDate.year}
                            onChange={(e) => handleChange("purchaseDate", { ...formData.purchaseDate, year: e.target.value })}
                            className="w-16 border border-gray-300 px-2 py-1 text-sm"
                            placeholder="YYYY"
                            maxLength={4}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">Add product under:</td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="existingDemat"
                              name="dematOption"
                              checked={formData.dematOption === "existing"}
                              onChange={() => handleChange("dematOption", "existing")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="existingDemat" className="ml-2 text-sm">
                              Existing DEMAT ID/folio No
                            </label>
                          </div>
                          {formData.dematOption === "existing" && (
                            <input
                              type="text"
                              value={formData.existingDemat}
                              onChange={(e) => handleChange("existingDemat", e.target.value)}
                              className="w-full border border-gray-300 px-2 py-1 text-sm"
                            />
                          )}
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="newDemat"
                              name="dematOption"
                              checked={formData.dematOption === "new"}
                              onChange={() => handleChange("dematOption", "new")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="newDemat" className="ml-2 text-sm">
                              New DEMAT ID/folio No
                            </label>
                          </div>
                          {formData.dematOption === "new" && (
                            <input
                              type="text"
                              placeholder="Leave Blank for Auto Generation"
                              className="w-full border border-gray-300 px-2 py-1 text-sm text-gray-500 italic"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Investment Section */}
              <div className="border-b">
                <div className="bg-white px-4 py-2 border-b border-gray-300">
                  <h2 className="text-sm font-bold">Investment: <span className="text-xs text-gray-600">(Enter any two fields)</span></h2>
                </div>

                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">
                        Total Investment: <span className="text-xs text-gray-600">(Rupees)</span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.investment.total}
                          onChange={(e) => handleChange("investment", { ...formData.investment, total: e.target.value })}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">
                        Price per Unit/Share: <span className="text-xs text-gray-600">(Rupees)</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={formData.investment.price}
                          onChange={(e) => handleChange("investment", { ...formData.investment, price: e.target.value })}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Total Units/Shares:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.investment.units}
                          onChange={(e) => handleChange("investment", { ...formData.investment, units: e.target.value })}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3" colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <div className="p-4 bg-gray-100 text-center">
                <button className="bg-gray-200 border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-300 mr-2">
                  Clear Form
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700">
                  Submit Investment
                </button>
              </div>
            </>
          )}

          {/* Initial Continue Button */}
          {!showProductDetails && (
            <div className="p-4 bg-gray-100 text-center">
              <button
                className={`px-6 py-2 text-sm font-medium ${formData.scheme
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                disabled={!formData.scheme}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}