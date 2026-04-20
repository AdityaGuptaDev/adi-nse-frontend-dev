"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import { useRouter } from "next/navigation";

export default function PaymentFailedPage() {
  const router = useRouter();

  const handleOk = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mainbackground">
      <div className="max-w-sm w-full bg-[#111111] p-6 rounded-2xl shadow-lg">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FF3B30] rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#F9FAFB]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <text
                x="12"
                y="18"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="white"
              >
                !
              </text>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl  text-center text-base-content mb-2">
          Transaction Failed
        </h2>

        {/* Subtitle */}
        <CustomText className="text-center text-md mb-4 flex flex-col">
          <span>Your payment has been Failed.</span>
          <span>Please check the remarks for the reason.</span>
        </CustomText>

        {/* Transaction Details */}
        <div className="space-y-4 mb-8">
          <hr className="border-accent" />

          <div className="flex justify-between items-center">
            <span className="text-base-content text-xs">Transaction Id</span>
            <span className="text-base-content  text-sm font-medium">
              1234567890
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content text-xs">Folio No.</span>
            <span className="text-base-content text-sm font-medium">
              09876543321
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content text-xs">Amount </span>
            <span className="text-base-content text-sm font-medium">
              ₹ 15,000
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base-content text-xs">Remarks </span>
            <span className="text-base-content text-sm font-medium">
              Insufficiant Funds
            </span>
          </div>
        </div>

        {/* OK Button */}
        <div className="flex justify-center">
          <CustomButton
            className="btn bg-primary text-[#F9FAFB] text-md w-1/2 border-none rounded-xl"
            onClick={handleOk}
          >
            Ok
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
