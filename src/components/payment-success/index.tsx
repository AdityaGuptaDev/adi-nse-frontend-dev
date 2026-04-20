"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  const handleOk = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mainbackground">
      <div className="max-w-sm w-full bg-[#111111] p-6 rounded-2xl shadow-lg">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#F9FAFB]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl  text-center text-base-content mb-2">
          Transaction Successful
        </h2>

        {/* Subtitle */}
        <CustomText className="text-center text-md mb-4">
          Your payment has been successfully completed.
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
            <span className="text-base-content text-xs">Amount Paid</span>
            <span className="text-base-content text-sm font-medium">
              ₹ 15,000
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
