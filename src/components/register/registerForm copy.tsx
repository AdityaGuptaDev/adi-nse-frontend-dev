"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import OTPScreen from "../otp-screen/otp-screen";
import CustomCheckbox from "@/commonUI/CheckBox";
import { publicPathName } from "@/utils/constants";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    )
    .max(100, "Email must be less than 100 characters"),

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

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  isPartner: yup.boolean(),
});

function RegisterForm() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState<any>();
  const [isOpenOtpModal, setIsOpenOtpModal] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [emailAlertMessage, setEmailAlertMessage] = useState("");

  const searchParams = useSearchParams();
  const userType = searchParams.get("userType");  // "partner"
  const partnerId = searchParams.get("partner_id");


  const openModal = () => setIsOpenOtpModal(true);
  const closeModal = () => setIsOpenOtpModal(false);




  const [passwordType, setpasswordType] = useState<"text" | "password">(
    "password"
  );
  const [confirmPasswordType, setConfirmPasswordType] = useState<
    "text" | "password"
  >("password");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      mobile: "",
      password: "",
      isPartner: false,
    },
    mode: "onChange", // Validate on change to catch errors early
  });

  const isPartner = watch("isPartner");

  // Real-time validation for mobile input - limit to 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobile', value, { shouldValidate: true });
  };

  // Real-time validation for email input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setValue('email', value, { shouldValidate: true });
  };

  // Validate email before submission
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const onSubmit = async (values: any) => {
    try {

      // First validate all fields including email
      const isFormValid = await trigger();

      if (!isFormValid) {
        // If form is not valid, show alert for email error specifically
        if (errors.email?.message) {
          setEmailAlertMessage(errors.email.message as string);
          setShowEmailAlert(true);
        }
        return; // Stop the process here
      }

      // Additional email validation check
      if (!validateEmail(values.email)) {
        setEmailAlertMessage("Please enter a valid email address");
        setShowEmailAlert(true);
        return; // Stop the process here
      }

      setLoading(true);
      // setEmail(values.email);

      // const result: any = await api.post(`/user/register-user`, values);
      const payload = {
        ...values,
        userType: userType || "customer"  // default fallback
      };

      const result = await api.post(`/user/register-user`, payload);

      if (result.data.data) {
        setLoading(false);
        console.log("userId-----", result.data.data);
        setUserData(result.data.data);
        reset();
        openModal();
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  // Handle form submission with validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation for all fields
    const isValid = await trigger();

    if (!isValid) {
      // Check if email has error and show alert
      if (errors.email?.message) {
        setEmailAlertMessage(errors.email.message as string);
        setShowEmailAlert(true);
      }
      return;
    }

    // If validation passes, proceed with form submission
    handleSubmit(onSubmit)();
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
          />
        </div>

        {/* Email Alert Popup */}
        {showEmailAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Email</h3>
                <p className="text-gray-600 mb-4">{emailAlertMessage}</p>
                <button
                  onClick={() => setShowEmailAlert(false)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="mb-1 flex flex-col">
            <div>
              <CustomInput
                label="Your Email"
                {...register("email")}
                required
                placeholder="Enter valid email (e.g., example@domain.com)"
                error={errors.email?.message}
                onChange={handleEmailChange}
              />
            </div>
            <div>
              <CustomInput
                label="Your Mobile No."
                {...register("mobile")}
                required
                placeholder="Enter mobile number"
                error={errors.mobile?.message}
                onChange={handleMobileChange}
                maxLength={10}
              />
            </div>
            <div>
              <CustomInput
                required
                type={passwordType}
                label="Password"
                placeholder="Password"
                {...register("password")}
                error={errors.password?.message}
                icon={
                  passwordType === "password" ? (
                    <FaEyeSlash onClick={() => setpasswordType("text")} />
                  ) : (
                    <FaEye onClick={() => setpasswordType("password")} />
                  )
                }
              />
            </div>
            <div>
              <CustomInput
                required
                type={confirmPasswordType}
                label="Confirm Password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                icon={
                  confirmPasswordType === "password" ? (
                    <FaEyeSlash onClick={() => setConfirmPasswordType("text")} />
                  ) : (
                    <FaEye onClick={() => setConfirmPasswordType("password")} />
                  )
                }
              />
            </div>
          </div>
          <div>
            <CustomButton
              className="mt-6 w-full bg-primary"
              type="submit"
              loading={loading}
              disabled={!isValid} // Optional: disable button when form is invalid
            >
              Register
            </CustomButton>
          </div>
        </form>

        {isOpenOtpModal && (
          <div id="my_modal" className="modal modal-open" ref={modalRef}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <OTPScreen
                userData={userData}
                setUserData={setUserData}
                isRegister={true}
                closeModal={closeModal}
                email={email}
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