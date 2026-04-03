"use client";

import { ArrowLeft } from "lucide-react";
import router from "next/router";
import React, { useState } from "react";



interface InterestingBearingProps {
  onBack?: () => void;
  clientName?: string;

}


export default function InterestBearingPage({ onBack }: InterestingBearingProps) {
  const [formData, setFormData] = useState({
    investor: "Pankaj Kumar Sinha (BEHIND GUMLA PETROL PUMP EKTA NAGAR BOOTY MC)",
    distributor: "HO - vedant asset",
    assetType: "Debt",
    productType: "",
    productName: "",
    institution: "",
    folioNumber: "",
    totalInvestment: "",
    quantity: "1",
    interest: "",
    annualInterestRate: "",
    faceValue: "",
    compounding: "None",
    tenure: { value1: "0", value2: "0", value3: "0", value4: "0", unit: "Days" },
    purchaseDate: { day: "1", month: "Jan", year: "yyyy" },
    maturityDate: ""
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

  const distributors = [
    "HO - vedant asset",
    "Branch Office",
    "Regional Office"
  ];

  const assetTypes = ["Debt", "Equity", "Hybrid", "Others"];

  const productTypes = [
    "Fixed Income - Cummulative",
    "Fixed Income - Non-Cummulative",
    "Variable Income",
    "Growth"
  ];

  const compoundingOptions = ["None", "Annual", "Semi-Annual", "Quarterly", "Monthly"];
  const tenureUnits = ["Days", "Months", "Years"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleChange = (field: string, value: string | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Show product details when product type is selected
    if (field === "productType" && value) {
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
          <h1 className="text-lg font-medium">Add New Financial Product</h1>
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
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">Select Distributor:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <select
                      value={formData.distributor}
                      onChange={(e) => handleChange("distributor", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      {distributors.map((dist, i) => (
                        <option key={i} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">Select Asset Type:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <select
                      value={formData.assetType}
                      onChange={(e) => handleChange("assetType", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      {assetTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">
                    Select Product Type: <span className="text-blue-600 underline cursor-pointer">[ Help ]</span>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <select
                      value={formData.productType}
                      onChange={(e) => handleChange("productType", e.target.value)}
                      className="w-full border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">Select Product Type...</option>
                      {productTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Product Details Section - Only show when product type is selected */}
          {showProductDetails && (
            <>
              <div className="border-b">
                <div className="bg-white px-4 py-2 border-b border-gray-300">
                  <h2 className="text-sm font-bold">Product Details:</h2>
                </div>

                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">Product Name:</td>
                      <td className="px-4 py-3 border-r border-gray-300 w-96">
                        <input
                          type="text"
                          value={formData.productName}
                          onChange={(e) => handleChange("productName", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-32">
                        <div>Tenure:</div>
                        <div className="text-xs text-gray-600 mt-1">
                          (e.g. '1000 Days' or '0365 Days'
                          or '0060 Months' or '0005 Years',
                          etc)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            value={formData.tenure.value1}
                            onChange={(e) => handleChange("tenure", { ...formData.tenure, value1: e.target.value })}
                            className="w-8 border border-gray-300 px-1 py-1 text-sm text-center"
                            maxLength={1}
                          />
                          <input
                            type="text"
                            value={formData.tenure.value2}
                            onChange={(e) => handleChange("tenure", { ...formData.tenure, value2: e.target.value })}
                            className="w-8 border border-gray-300 px-1 py-1 text-sm text-center"
                            maxLength={1}
                          />
                          <input
                            type="text"
                            value={formData.tenure.value3}
                            onChange={(e) => handleChange("tenure", { ...formData.tenure, value3: e.target.value })}
                            className="w-8 border border-gray-300 px-1 py-1 text-sm text-center"
                            maxLength={1}
                          />
                          <input
                            type="text"
                            value={formData.tenure.value4}
                            onChange={(e) => handleChange("tenure", { ...formData.tenure, value4: e.target.value })}
                            className="w-8 border border-gray-300 px-1 py-1 text-sm text-center"
                            maxLength={1}
                          />
                          <select
                            value={formData.tenure.unit}
                            onChange={(e) => handleChange("tenure", { ...formData.tenure, unit: e.target.value })}
                            className="border border-gray-300 px-2 py-1 text-sm"
                          >
                            {tenureUnits.map((unit, i) => (
                              <option key={i} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Institution / Company:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.institution}
                          onChange={(e) => handleChange("institution", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Purchase / Start Date:</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <select
                            value={formData.purchaseDate.day}
                            onChange={(e) => handleChange("purchaseDate", { ...formData.purchaseDate, day: e.target.value })}
                            className="border border-gray-300 px-2 py-1 text-sm w-16"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
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
                            className="border border-gray-300 px-2 py-1 text-sm w-16"
                            placeholder="yyyy"
                          />
                        </div>
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">
                        Folio Number:<br />
                        <span className="text-xs text-gray-600">(Optional)</span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.folioNumber}
                          onChange={(e) => handleChange("folioNumber", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Maturity / End Date:</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={formData.maturityDate}
                          onChange={(e) => handleChange("maturityDate", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
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
                      <td className="px-4 py-3 border-r border-gray-300 w-96">
                        <input
                          type="text"
                          value={formData.totalInvestment}
                          onChange={(e) => handleChange("totalInvestment", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-32">
                        Face Value: <span className="text-xs text-gray-600">(Rupees)</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={formData.faceValue}
                          onChange={(e) => handleChange("faceValue", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Quantity:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.quantity}
                          onChange={(e) => handleChange("quantity", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Compounding</td>
                      <td className="px-4 py-3">
                        <select
                          value={formData.compounding}
                          onChange={(e) => handleChange("compounding", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        >
                          {compoundingOptions.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Interest:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.interest}
                          onChange={(e) => handleChange("interest", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3" colSpan={2}></td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">
                        Annual Interest Rate: <span className="text-xs text-gray-600">(%)</span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input
                          type="text"
                          value={formData.annualInterestRate}
                          onChange={(e) => handleChange("annualInterestRate", e.target.value)}
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
                <button className="bg-gray-200 border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-300">
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}