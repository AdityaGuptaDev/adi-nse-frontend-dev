"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Building2, Landmark, X, ChevronRight } from "lucide-react";

type OnBoardingProps = {
  onBoardingModal?: boolean;
  onClose?: () => void;
  /**
   * If set, the NSE lane opens /create-ucc?mobile=<value> so the form prefills
   * for this investor. Useful when a partner has just registered a new
   * investor and we already have their mobile in hand.
   */
  mobile?: string;
  /**
   * When true, the dismiss (×) button is hidden — the user must pick a lane.
   * Used right after partner-add-investor OTP verification.
   */
  mandatory?: boolean;
};

function OnBoarding({ onClose, mobile, mandatory }: OnBoardingProps) {
  const router = useRouter();

  const goMfu = () => {
    router.push("/initial-KYC");
  };

  const goNse = () => {
    if (mobile) {
      router.push(`/create-ucc?mobile=${encodeURIComponent(mobile)}`);
    } else {
      router.push("/create-ucc");
    }
  };

  return (
    <div
      id="onboarding_lane_picker"
      className="modal modal-open"
      onClick={!mandatory ? onClose : undefined}
    >
      <div
        className="modal-box relative max-w-lg bg-gradient-to-br from-[#0a0c10] to-[#121418] border-2 border-[#F59E0B]/30 rounded-2xl shadow-2xl shadow-[#F59E0B]/10 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#F59E0B]/40"></div>
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#F59E0B]/40"></div>
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#F59E0B]/40"></div>
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#F59E0B]/40"></div>

        {/* Close button (hidden when mandatory) */}
        {!mandatory && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#F59E0B] transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent">
            Choose Your Onboarding Path
          </h3>
          <p className="text-sm text-[#9CA3AF] mt-2">
            Pick the execution lane you want to transact through.
            You can invest in Mutual Funds via either option.
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-6 space-y-3">
          {/* MFU lane */}
          <button
            type="button"
            onClick={goMfu}
            className="group w-full text-left bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B] hover:bg-[#1F1A1A]/80 rounded-xl p-5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                <Landmark className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#F9FAFB]">Go with MFU</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">CAN</span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Complete Initial KYC and register a MFU CAN — supports joint holdings and family linking.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#F59E0B] group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* NSE lane */}
          <button
            type="button"
            onClick={goNse}
            className="group w-full text-left bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B] hover:bg-[#1F1A1A]/80 rounded-xl p-5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#F9FAFB]">Go with NSE</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">UCC</span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Create an NSE UCC in a single 4-step form — fastest path to place your first order.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#F59E0B] group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Footer note */}
        <div className="px-8 pb-6 text-center space-y-3">
          <p className="text-[11px] text-[#6B7280]">
            You can add the other lane later from your profile.
          </p>
          {!mandatory && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-[#9CA3AF] hover:text-[#F59E0B] border border-[#2A2A2A] hover:border-[#F59E0B]/50 rounded-lg px-4 py-2 transition-colors"
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnBoarding;
