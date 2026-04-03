import { ArrowLeft } from "lucide-react";
import router from "next/router";
import React, { useState } from "react";


interface PreciousMetalProps {
  onBack?: () => void;
  clientName?: string;
}


export default function PreciousMetalPage({ onBack }: PreciousMetalProps) {
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [formData, setFormData] = useState({
    investor: "Pankaj Kumar Sinha (BEHIND GUMLA PETROL PUMP EKTA NAGAR BOOTY MC)",
    distributor: "HO - vedant asset",
    assetType: "Precious Metal",
    productType: "",
    typeOfGold: "Jewellery",
    vendor: "",
    purchaseDate: { day: "", month: "Jan", year: "" },
    folioNumber: "",
    totalInvestment: "",
    quantity: "",
    rate: ""
  });

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

  const assetTypes = ["Precious Metal", "Equity", "Debt", "Others"];
  const productTypes = ["Gold", "Silver", "Platinum", "Diamond"];
  const goldTypes = ["Jewellery", "Coins", "Bars", "ETF"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleChange = (field: string, value: string | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductTypeChange = (value: string | object) => {
    handleChange("productType", value);
    setShowProductDetails(!!value);
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
                    <div className="flex items-center">
                      <select 
                        value={formData.investor}
                        onChange={(e) => handleChange("investor", e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 text-sm"
                      >
                        {investors.map((investor, i) => (
                          <option key={i} value={investor}>{investor}</option>
                        ))}
                      </select>
                      <span className="ml-2 text-green-500">✓</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">Select Distributor:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <div className="flex items-center">
                      <select 
                        value={formData.distributor}
                        onChange={(e) => handleChange("distributor", e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 text-sm"
                      >
                        {distributors.map((dist, i) => (
                          <option key={i} value={dist}>{dist}</option>
                        ))}
                      </select>
                      <span className="ml-2 text-green-500">✓</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">Select Asset Type:</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <div className="flex items-center">
                      <select 
                        value={formData.assetType}
                        onChange={(e) => handleChange("assetType", e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 text-sm"
                      >
                        {assetTypes.map((type, i) => (
                          <option key={i} value={type}>{type}</option>
                        ))}
                      </select>
                      <span className="ml-2 text-green-500">✓</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2 font-medium text-sm border-r border-gray-300">
                    Select Product Type: <span className="text-blue-600 underline cursor-pointer">[ Help ]</span>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    <div className="flex items-center">
                      <select 
                        value={formData.productType}
                        onChange={(e) => handleProductTypeChange(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="">Select Product Type...</option>
                        {productTypes.map((type, i) => (
                          <option key={i} value={type}>{type}</option>
                        ))}
                      </select>
                      {formData.productType && <span className="ml-2 text-green-500">✓</span>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Product Details Section - Only shown when product type is selected */}
          {showProductDetails && (
            <>
              <div className="border-b">
                <div className="bg-white px-4 py-2 border-b border-gray-300">
                  <h2 className="text-sm font-bold">Product Details:</h2>
                </div>
                
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">Type of Gold:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <select 
                          value={formData.typeOfGold}
                          onChange={(e) => handleChange("typeOfGold", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        >
                          {goldTypes.map((type, i) => (
                            <option key={i} value={type}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Purchase Date:</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <input 
                            type="text"
                            value={formData.purchaseDate.day}
                            onChange={(e) => handleChange("purchaseDate", {...formData.purchaseDate, day: e.target.value})}
                            className="w-12 border border-gray-300 px-2 py-1 text-sm"
                            placeholder="DD"
                            maxLength={2}
                          />
                          <select 
                            value={formData.purchaseDate.month}
                            onChange={(e) => handleChange("purchaseDate", {...formData.purchaseDate, month: e.target.value})}
                            className="border border-gray-300 px-2 py-1 text-sm"
                          >
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          <input 
                            type="text"
                            value={formData.purchaseDate.year}
                            onChange={(e) => handleChange("purchaseDate", {...formData.purchaseDate, year: e.target.value})}
                            className="w-16 border border-gray-300 px-2 py-1 text-sm"
                            placeholder="YYYY"
                            maxLength={4}
                          />
                        </div>
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Vendor / Purchase Point:</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input 
                          type="text"
                          value={formData.vendor}
                          onChange={(e) => handleChange("vendor", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">
                        Folio Number: <span className="text-xs text-gray-600">(Optional)</span>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={formData.folioNumber}
                          onChange={(e) => handleChange("folioNumber", e.target.value)}
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
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input 
                          type="text"
                          value={formData.totalInvestment}
                          onChange={(e) => handleChange("totalInvestment", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50 w-48">
                        Rate (per 10 gms): <span className="text-xs text-gray-600">(Rupees)</span>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={formData.rate}
                          onChange={(e) => handleChange("rate", e.target.value)}
                          className="w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-sm border-r border-gray-300 bg-gray-50">Quantity (gms):</td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <input 
                          type="text"
                          value={formData.quantity}
                          onChange={(e) => handleChange("quantity", e.target.value)}
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