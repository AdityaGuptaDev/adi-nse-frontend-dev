"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import OTPScreen from "../otp-screen/otp-screen";
import { publicPathName } from "@/utils/constants";
import { 
  User, 
  Phone, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  Users, 
  Lock, 
  Mail, 
  AlertCircle,
  ArrowLeft
} from "lucide-react";

// Simplified schema - remove unused fields
const schema = yup.object().shape({
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Mobile number must contain only digits")
    .max(10, "Mobile number must be maximum 10 digits")
    .min(10, "Mobile number must be exactly 10 digits")
    .test(
      "valid-mobile-start",
      "Mobile number should start with 6, 7, 8, or 9",
      (value) => !value || /^[6-9]/.test(value)
    ),
});

function RegisterForm() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpenOtpModal, setIsOpenOtpModal] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const [submittedMobile, setSubmittedMobile] = useState<string>("");
  const [submittedRegisterAs, setSubmittedRegisterAs] = useState("Partner");

  const searchParams = useSearchParams();
  const userType = searchParams.get("userType"); // "partner"
  const partnerId = searchParams.get("partner_id");

  const openModal = () => {
    console.log("Opening modal");
    setIsOpenOtpModal(true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setIsOpenOtpModal(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      mobile: "",
    },
    mode: "onChange",
  });

  const mobileValue = watch("mobile");
  const fromadmin = 1;
  const registerAs = watch("registerAs");

  const registerAsValue = userType
    ? userType.charAt(0).toUpperCase() + userType.slice(1)
    : "Partner";

  // Handle mobile input change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("mobile", value, { shouldValidate: true });
    setFormError(""); // Clear any previous errors
  };

  // Main submit function
  const onSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);

    try {
      setLoading(true);
      setFormError("");

      // Validate mobile number
      if (!data.mobile || data.mobile.length !== 10) {
        setFormError("Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }

      const payload = {
        mobile: data.mobile,
        userType: userType || "Partner",
        ...(partnerId && { partnerId }),
      };

      console.log("Sending payload to API:", payload);

      // Make API call
      const result = await api.post(`/user/register-user`, payload);
      console.log("API Response:", result.data);

      if (result.data.data) {
        setSubmittedMobile(data.mobile);
        setSubmittedRegisterAs(registerAsValue);

        setUserData(result.data.data);
        reset();
        openModal(); // Open OTP modal
        //toastAlert("success", "Registration successful! Please verify OTP.");
      } else if (result.data.message) {
        //toastAlert("error", result.data.message);
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response?.data?.message) {
        const errorMsg = error.response.data.message;
        setFormError(errorMsg);
        //toastAlert("error", errorMsg);
      } else {
        handleServerError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission errors
  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    if (errors.mobile) {
      setFormError(errors.mobile.message);
    }
  };

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 py-8">
        <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-[#2A2A2A] shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-3xl">
          {/* Back Button */}
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-200 group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full mb-2 border border-[#F59E0B]/30">
              <Building2 className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
              Partner Registration
            </h2>
            <p className="text-[#9CA3AF] text-sm">
              Register as a Partner to start your journey
            </p>
          </div>

          {/* Form Error Display */}
          {formError && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{formError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="space-y-5">
              {/* User Type Display */}
              <div className="relative">
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Register as:
                </label>
                <div className="flex items-center p-3 bg-gradient-to-r from-[#F59E0B]/10 to-[#B45309]/10 rounded-lg border border-[#F59E0B]/20">
                  <Users className="w-5 h-5 text-[#F59E0B] mr-3" />
                  <span className="text-[#F59E0B] font-semibold">
                    {userType
                      ? userType.charAt(0).toUpperCase() + userType.slice(1)
                      : "Partner"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#9CA3AF]">
                  You are registering as a Business Partner
                </p>
              </div>

              {/* Mobile Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Your Mobile No. <span className="text-[#F59E0B]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[#F9FAFB] font-medium sm:text-sm bg-[#1F1A1A] px-2 py-1 rounded-l-lg border border-r-0 border-[#2A2A2A]">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    {...register("mobile")}
                    required
                    placeholder="Enter 10-digit mobile number"
                    onChange={handleMobileChange}
                    maxLength={10}
                    value={mobileValue || ""}
                    className="w-full pl-20 pr-4 py-3 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none text-[#F9FAFB] placeholder:text-[#6B7280] text-base"
                    style={{
                      paddingLeft: "5rem",
                    }}
                  />
                </div>

             

                {/* Mobile Validation Status */}
                {mobileValue && mobileValue.length === 10 && !errors.mobile && (
                  <div className="mt-2 flex items-center justify-end">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium animate-fadeIn">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Valid mobile number
                    </div>
                  </div>
                )}

                {/* Helper Text */}
                <p className="mt-2 text-xs text-[#9CA3AF]">
                  Must be a 10-digit Indian mobile number starting with 6-9
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <CustomButton
                className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                type="button"
                loading={loading}
                disabled={!mobileValue || mobileValue.length !== 10 || loading}
                onClick={() => {
                  console.log("CustomButton clicked manually");
                  handleSubmit(onSubmit, onError)();
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Continue to OTP Verification
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </CustomButton>
            </div>
          </form>

          {/* Additional Info */}
          <div className="text-center pt-6 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-center text-[#9CA3AF] mb-2">
              <Shield className="w-4 h-4 mr-2 text-[#F59E0B]" />
              <p className="text-xs">
                Your information is secure and encrypted
              </p>
            </div>
            <p className="text-xs text-[#9CA3AF]/70">
              By continuing, you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </div>

      {isOpenOtpModal && userData && (
        <div 
          id="my_modal" 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          ref={modalRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative transform transition-all max-w-md w-full bg-[#111111] border border-[#2A2A2A] shadow-2xl rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-[#9CA3AF] hover:text-[#F59E0B] transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <OTPScreen
                userData={userData}
                setUserData={setUserData}
                isRegister={true}
                closeModal={closeModal}
                mobile={submittedMobile}
                register_as={submittedRegisterAs}
                fromAdmin={fromadmin}
                partnerId={partnerId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Ensure all input text is visible */
        input::placeholder {
          color: #6B7280;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1F1A1A inset !important;
          -webkit-text-fill-color: #F9FAFB !important;
        }
      `}</style>
    </>
  );
}

export default RegisterForm;