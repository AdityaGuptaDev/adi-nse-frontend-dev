"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { FiX } from "react-icons/fi";

interface OnBoardingProps {
  onBoardingModal: boolean;
  onClose?: () => void;
  mandatory?: boolean;
}

function OnBoarding({ onBoardingModal, onClose, mandatory = false }: OnBoardingProps) {
  const router = useRouter();
  // Local visibility mirror — lets the component hide itself immediately on
  // Remind Later without waiting for the parent's state update cycle.
  const [visible, setVisible] = useState(onBoardingModal);

  useEffect(() => {
    setVisible(onBoardingModal);
  }, [onBoardingModal]);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    onClose?.();
  };

  const goMfu = () => {
    close();
    router.push("/initial-KYC");
  };

  const goNse = () => {
    close();
    router.push("/create-ucc");
  };

  const handleLater = () => {
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-5 relative">
          {!mandatory && (
            <button
              onClick={handleLater}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <FaFileInvoiceDollar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">
                Complete Your Onboarding
              </h2>
              <p className="text-white/80 text-xs">Only takes a few minutes</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            {mandatory
              ? "Please choose a platform to proceed with investor onboarding. This step is required."
              : "Your investor onboarding is pending. Pick the platform you'd like to transact on — you can always add the other one later."}
          </p>

          <div className="space-y-3">
            <button
              onClick={goMfu}
              className="w-full rounded-xl border-2 border-[#F59E0B] bg-white px-4 py-3 text-left hover:bg-[#F59E0B]/5 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">
                    Go with MFU
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    CAN-based, Morningstar catalogue, SIP & Lumpsum
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#D97706] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  Start KYC →
                </span>
              </div>
            </button>

            <button
              onClick={goNse}
              className="w-full rounded-xl border-2 border-[#F59E0B] bg-white px-4 py-3 text-left hover:bg-[#F59E0B]/5 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">
                    Go with NSE
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    UCC-based, NSE MF Desk, live execution
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#D97706] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  Create UCC →
                </span>
              </div>
            </button>
          </div>

          {!mandatory && (
            <div className="pt-1">
              <button
                onClick={handleLater}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                Remind Me Later
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">
                We&apos;ll hide this reminder for the rest of this session
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnBoarding;
