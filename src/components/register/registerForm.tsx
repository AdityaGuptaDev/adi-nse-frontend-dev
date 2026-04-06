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

  const [mobileForOtp, setMobileForOtp] = useState<string>("");
 const [registerAs, setRegisterAs] = useState<string>("");

  const searchParams = useSearchParams();
  const userType = searchParams.get("userType");  // "partner"
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
  const registerAsValue = watch("registerAs");
  console.log("registerAs---value",registerAsValue);

  // Handle mobile input change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobile', value, { shouldValidate: true });
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
        userType: userType || "customer",
        ...(partnerId && { partnerId }),
      };

      console.log("Sending payload to API:", payload);
      
      // Make API call
      const result = await api.post(`/user/register-user`, payload);
      console.log("API Response:", result.data);
      
      if (result.data.data) {
        setUserData(result.data.data);
        setRegisterAs(userType || "customer");
        reset();
         setMobileForOtp(data.mobile);
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
       // toastAlert("error", errorMsg);
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
      <div className="w-[450px] bg-white rounded-xl shadow-lg p-6 space-y-6 mx-auto mt-10 mb-10">
        <div className="relative">
          <a
            href="/"
            className="absolute -top-2 -left-2 text-gray-500 hover:text-[#243A73] transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </a>
          <img
            src={`${publicPathName}/logo_light.png`}
            className="h-16 mx-auto"
            alt="Logo"
          />
        </div>

        {/* Form Error Display */}
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{formError}</span>
            </div>
          </div>
        )}

    

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="mb-4 flex flex-col space-y-4">
            <div>
              <CustomInput
                label="Register as:"
                value={userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : "Customer"}
                placeholder="User Type"
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            
            <div>
              <CustomInput
                label="Your Mobile No."
                {...register("mobile")}
                required
                placeholder="Enter 10-digit mobile number"
                error={errors.mobile?.message}
                onChange={handleMobileChange}
                maxLength={10}
              />
              {mobileValue && mobileValue.length === 10 && (
                <div className="mt-1 text-green-600 text-xs flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid mobile number
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
           

            {/* Or try CustomButton with onClick */}
            <CustomButton
              className="mt-2 w-full bg-primary hover:bg-primary/90 transition-colors duration-200"
              type="button" // Change to button and handle manually
              loading={loading}
              disabled={!mobileValue || mobileValue.length !== 10 || loading}
              onClick={() => {
                console.log("CustomButton clicked manually");
                // Manually trigger form submission
                handleSubmit(onSubmit, onError)();
              }}
            >
              Register 
            </CustomButton>
          </div>
        </form>

        {isOpenOtpModal && userData && (
          <div id="my_modal" className="modal modal-open" ref={modalRef}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <OTPScreen
                userData={userData}
                setUserData={setUserData}
                isRegister={true}
                closeModal={closeModal}
                 mobile_no={mobileForOtp}
                 register_as={registerAs}
                partnerId={partnerId}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RegisterForm;