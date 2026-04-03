"use client";

import { ShoppingCart, AlertTriangle, ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface InvestmentCartProps {
  onBack?: () => void;
  clientName?: string;
}

export default function InvestmentCart({ onBack, clientName = "LAKSHMI SINHA" }: InvestmentCartProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleBuyLumpSum = () => {
    alert("Buy LumpSum clicked");
  };

  const handleBuySIP = () => {
    alert("Buy SIP clicked");
  };

  const handleSell = () => {
    alert("Sell clicked");
  };

  const handleSwitch = () => {
    alert("Switch clicked");
  };

  const handleBrowseProducts = () => {
    alert("Browse Products clicked");
  };

  const handleContactSupport = () => {
    alert("Contact Support clicked");
  };

  const handleEmailCart = () => {
    alert("Email Cart clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Investment Cart
                  </h1>
                  <p className="text-sm text-slate-500">{clientName} • 0 items</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleEmailCart}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Mail size={16} />
              <span>Email Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Action Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="flex">
            <button 
              onClick={handleBuyLumpSum}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 font-medium text-sm border-r border-red-400 hover:from-red-600 hover:to-red-700 transition-all"
            >
              Buy LumpSum (0)
            </button>
            <button 
              onClick={handleBuySIP}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white px-6 py-4 font-medium text-sm border-r border-slate-600 transition-colors"
            >
              Buy SIP (0)
            </button>
            <button 
              onClick={handleSell}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white px-6 py-4 font-medium text-sm border-r border-slate-600 transition-colors"
            >
              Sell (0)
            </button>
            <button 
              onClick={handleSwitch}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white px-6 py-4 font-medium text-sm transition-colors"
            >
              Switch (0)
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Sno
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Folio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Dividend Option
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 border-r border-slate-200">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <ShoppingCart className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-600 mb-1">Your cart is empty</p>
                        <p className="text-sm text-slate-500">Add some investment products to get started</p>
                      </div>
                      <button 
                        onClick={handleBrowseProducts}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Gateway Configuration Required</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                You don't have NSE NMF transaction gateway active on your FinnSys platform. 
                Please contact our support team to activate your NSE NMF transaction gateway and start processing transactions.
              </p>
              <button 
                onClick={handleContactSupport}
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}