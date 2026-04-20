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
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#111111] shadow-sm border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-[#2A2A2A]"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1F1A1A] rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#F9FAFB]">
                    Investment Cart
                  </h1>
                  <p className="text-sm text-[#9CA3AF]">{clientName} • 0 items</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleEmailCart}
              className="flex items-center space-x-2 bg-[#F59E0B] hover:bg-[#B45309] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Mail size={16} />
              <span>Email Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Action Tabs */}
        <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] overflow-hidden mb-6">
          <div className="flex">
            <button 
              onClick={handleBuyLumpSum}
              className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-6 py-4 font-medium text-sm border-r border-[#2A2A2A] hover:from-[#B45309] hover:to-[#92400E] transition-all"
            >
              Buy LumpSum (0)
            </button>
            <button 
              onClick={handleBuySIP}
              className="flex-1 bg-[#1F1A1A] hover:bg-[#2A2A2A] text-white px-6 py-4 font-medium text-sm border-r border-[#2A2A2A] transition-colors"
            >
              Buy SIP (0)
            </button>
            <button 
              onClick={handleSell}
              className="flex-1 bg-[#1F1A1A] hover:bg-[#2A2A2A] text-white px-6 py-4 font-medium text-sm border-r border-[#2A2A2A] transition-colors"
            >
              Sell (0)
            </button>
            <button 
              onClick={handleSwitch}
              className="flex-1 bg-[#1F1A1A] hover:bg-[#2A2A2A] text-white px-6 py-4 font-medium text-sm transition-colors"
            >
              Switch (0)
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1F1A1A] border-b border-[#2A2A2A]">
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Sno
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Folio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Dividend Option
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B] border-r border-[#2A2A2A]">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#F59E0B]">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-[#1F1A1A] rounded-full">
                        <ShoppingCart className="h-8 w-8 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-[#F9FAFB] mb-1">Your cart is empty</p>
                        <p className="text-sm text-[#9CA3AF]">Add some investment products to get started</p>
                      </div>
                      <button 
                        onClick={handleBrowseProducts}
                        className="bg-[#F59E0B] hover:bg-[#B45309] text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
        <div className="bg-[#1F1A1A] border border-[#F59E0B] rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-[#111111] rounded-lg">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F59E0B] mb-2">Gateway Configuration Required</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                You don't have NSE NMF transaction gateway active on your FinnSys platform. 
                Please contact our support team to activate your NSE NMF transaction gateway and start processing transactions.
              </p>
              <button 
                onClick={handleContactSupport}
                className="mt-3 bg-[#F59E0B] hover:bg-[#B45309] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
