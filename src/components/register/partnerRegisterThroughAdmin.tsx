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

  return (
    <>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 mx-auto mt-10 mb-10 transition-all duration-300 hover:shadow-2xl">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full mb-2">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Partner Registration
          </h2>
          <p className="text-gray-600 text-sm">
            Register as a Partner to start your journey
          </p>
        </div>

        {/* Form Error Display */}
        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">{formError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="space-y-5">
            {/* User Type Display */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Register as:
              </label>
              <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
                <svg
                  className="w-5 h-5 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-blue-800 font-semibold">
                  {userType
                    ? userType.charAt(0).toUpperCase() + userType.slice(1)
                    : "Partner"}
                </span>

              </div>
              <p className="mt-2 text-xs text-gray-500">
                You are registering as a Business Partner
              </p>
            </div>

            {/* Mobile Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Mobile No. *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-700 font-medium sm:text-sm">
                    +91
                  </span>
                </div>
                <CustomInput
                  {...register("mobile")}
                  required
                  placeholder="Enter 10-digit mobile number"
                  error={errors.mobile?.message}
                  onChange={handleMobileChange}
                  maxLength={10}
                  className="pl-12 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  style={{
                    paddingLeft: "3.5rem",
                  }}
                />
              </div>

              {/* Mobile Validation Status */}
              {mobileValue && mobileValue.length === 10 && (
                <div className="mt-2 flex items-center justify-end">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium animate-fadeIn">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Valid mobile number
                  </div>
                </div>
              )}

              {/* Helper Text */}
              <p className="mt-2 text-xs text-gray-500">
                Must be a 10-digit Indian mobile number starting with 6-9
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <CustomButton
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              )}
            </CustomButton>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center text-gray-500 mb-2">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs">
              Your information is secure and encrypted
            </p>
          </div>
          <p className="text-xs text-gray-400">
            By continuing, you agree to our Terms & Conditions
          </p>
        </div>

        {isOpenOtpModal && userData && (
          <div id="my_modal" className="modal modal-open" ref={modalRef}>
            <div
              className="modal-box relative transform transition-all max-w-md mx-auto bg-white shadow-2xl rounded-xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
              }}
            >
              <button
                onClick={closeModal}
                className="btn btn-sm btn-circle absolute right-2 top-2 z-10"
              >
                ✕
              </button>
              <OTPScreen
                userData={userData}
                setUserData={setUserData}
                isRegister={true}
                closeModal={closeModal}
                mobile={submittedMobile}
                registerAs={submittedRegisterAs}
                fromAdmin={fromadmin}
                partnerId={partnerId}
              />
            </div>
          </div>
        )}

      </div>

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
      `}</style>
    </>
  );
}

export default RegisterForm;