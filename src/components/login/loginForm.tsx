"use client";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import { cookieStorageKeys, setCookieToken, storeCookieData } from "@/services/cookieStorageService";
import api from "@/utils/api";
import {
  ADMIN_INVESTER_DATA,
  FLAT_MENU,
  MENU_PREFIX,
  PROD_DATA,
  publicPathName,
  TOKEN_PREFIX,
  USER_DATA,
} from "@/utils/constants";
import { handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";
import OTPScreen from "../otp-screen/otp-screen";

// Validation schema for login with password
const loginSchema = yup.object().shape({
  userName: yup.string()
    .required("This field is required")
    .test(
      "is-email-or-mobile",
      "Enter a valid email or mobile number",
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      }
    ),
  password: yup.string().required("Password is required"),
});

// Validation schema for login with OTP (mobile only)
const otpLoginSchema = yup.object().shape({
  mobile: yup.string()
    .required("Mobile number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

function LoginForm() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpenOtpModal, setIsOpenOtpModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  
  const openModal = () => setIsOpenOtpModal(true);
  const closeModal = () => {
    setIsOpenOtpModal(false);
    setOtpSent(false);
  };

  const [passwordType, setpasswordType] = useState<"text" | "password">("password");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [otpLoginLoading, setOtpLoginLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>();
  const [isNotVerify, setIsNotVerify] = useState(false);
  const [userName, setUserName] = useState<any>();
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<any>(null);

  useEffect(() => {
    if (isNotVerify) {
      openModal();
    }
  }, [isNotVerify]);

  // Form for password login
  const passwordForm = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Form for OTP login
  const otpForm = useForm({
    resolver: yupResolver(otpLoginSchema),
  });

  const checkUserTypes = async (userName: string) => {
    try {
      const result: any = await api.post(`/user/check-user-types`, { userName });
      console.log("checkUserTypes result--", result);
      return result.data.data;
    } catch (error) {
      handleServerError(error);
      return null;
    }
  };

  // Handle password login submission
  const onPasswordLoginSubmit = async (values: any) => {
    try {
      setLoginLoading(true);
      setUserName(values.userName);

      // First check how many user types exist for this email/mobile
      const userTypesData = await checkUserTypes(values.userName);

      if (!userTypesData) {
        setLoginLoading(false);
        return;
      }

      if (userTypesData.userTypesCount === 0) {
        setLoginLoading(false);
        toastAlert("error", "No user found with this email or mobile number");
        return;
      }

      if (userTypesData.userTypesCount > 1) {
        const values = passwordForm.getValues();
        let validUserTypes: any[] = [];

        for (let ut of userTypesData.userTypes) {
          let loginData = {
            ...values,
            userTypeId: ut.userTypeId,
          };

          const result = await tryLoginSilently(loginData);

          if (result) {
            validUserTypes.push(ut);
          }
        }

        if (validUserTypes.length === 0) {
          setLoginLoading(false);
          toastAlert("error", "Incorrect Password entered !");
          return;
        }

        if (validUserTypes.length === 1) {
          handleUserTypeSelection(validUserTypes[0]);
          return;
        }

        setUserTypes(validUserTypes);
        setShowUserTypeSelection(true);
        setLoginLoading(false);
        return;
      }

      // If only one user type, proceed with login
      const loginData = {
        ...values,
        userTypeId: userTypesData.userTypes[0].userTypeId
      };

      const result: any = await api.post(`/user/login`, loginData);
      let resData: any = result.data.data;

      if (resData) {
        if (!resData.user.isEmailOTPVerified && !resData.user.isMobileOTPVerified) {
          let body = {
            userName: userName,
          };

          let result: any = await api.post("/user/login-otp", body);
          if (result.data.data) {
            passwordForm.reset();
            setLoginLoading(false);
            toastAlert("error", "Please verify email or mobile after login");
            setUserData(result.data.data);
            setIsNotVerify(true);
            openModal();
          }
        } else {
          handleSuccessfulLogin(result.data.data);
        }
      }
    } catch (error) {
      setLoginLoading(false);
      handleServerError(error);
    }
  };

  // Handle OTP login - Send OTP
  const onSendOtpSubmit = async (values: any) => {
    try {
      setOtpLoginLoading(true);
      setMobileNumber(values.mobile);
      
      // Check if user exists with this mobile
      const userTypesData = await checkUserTypes(values.mobile);
      
      if (!userTypesData || userTypesData.userTypesCount === 0) {
        setOtpLoginLoading(false);
        toastAlert("error", "No user found with this mobile number");
        return;
      }

      // Send OTP to mobile
      let body = {
        userName: values.mobile,
      };

      let result: any = await api.post("/user/login-otp", body);
      
      if (result.data.data) {
        setOtpLoginLoading(false);
        setOtpSent(true);
        setUserData(result.data.data);
        openModal();
        toastAlert("success", "OTP sent successfully to your mobile");
      }
    } catch (error) {
      setOtpLoginLoading(false);
      handleServerError(error);
    }
  };

  const handleUserTypeSelection = async (userType: any) => {
    try {
      setLoginLoading(true);
      setSelectedUserType(userType);
      setShowUserTypeSelection(false);

      const values = passwordForm.getValues();
      const loginData = {
        ...values,
        userTypeId: userType.userTypeId
      };

      const result: any = await api.post(`/user/login`, loginData);
      let resData: any = result.data.data;

      if (resData) {
        if (!resData.user.isEmailOTPVerified && !resData.user.isMobileOTPVerified) {
          let body = {
            userName: userName,
          };

          let result: any = await api.post("/user/login-otp", body);
          if (result.data.data) {
            passwordForm.reset();
            setLoginLoading(false);
            toastAlert("error", "Please verify email or mobile after login");
            setUserData(result.data.data);
            setIsNotVerify(true);
            openModal();
          }
        } else {
          handleSuccessfulLogin(result.data.data);
        }
      }
    } catch (error) {
      setLoginLoading(false);
      handleServerError(error);
    }
  };
const handleSuccessfulLogin = (data: any) => {
  setLoginLoading(false);

  setLS(TOKEN_PREFIX, data.token);
  setLS(MENU_PREFIX, data.menu || []);
  setLS(USER_DATA, { ...data.user, ...data.meta });
  setLS(ADMIN_INVESTER_DATA, data.findFilterData);
  setLS(PROD_DATA, data);

  toastAlert("success", "Logged In successfully");

  // 🔥 FRONTEND-ONLY CONDITION
  const forceChange = sessionStorage.getItem("FORCE_CHANGE_PASSWORD");

  if (forceChange === "true") {
    sessionStorage.removeItem("FORCE_CHANGE_PASSWORD");
    router.push("/change-password");
    return;
  }

  // NORMAL FLOW
  if (data.initPath) {
    router.push(`/${data.initPath}`);
  } else {
    router.push("/dashboards");
  }
};

  const tryLoginSilently = async (loginData: any) => {
    try {
      const response = await api.post(`/user/login`, loginData, {
        validateStatus: () => true,
      });

      if (response.status === 200) return response.data.data;
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleLoginOTP = async () => {
    try {
      let userName = passwordForm.getValues("userName");
      setUserName(userName);

      if (!userName) {
        return toastAlert("error", "Please enter username");
      }

      let body = {
        userName: userName,
      };

      let result: any = await api.post("/user/login-otp", body);
      let resData: any = result.data.data;

      if (resData) {
        if (!resData.isEmailOTPVerified && !resData.isMobileOTPVerified) {
          passwordForm.setValue("userName", "");
          setUserData(resData);
          setIsNotVerify(true);
          openModal();
          toastAlert("error", "Please verify email or mobile after login");
        } else {
          setUserData(resData);
          openModal();
        }
      }
    } catch (error: any) {
      setLoginLoading(false);
      handleServerError(error);
    }
  };

  return (
    <>
      <div className="myContainer w-full !px-0 !mx-3">
        <div className="mt-10 mb-2 w-full sm:w-96 md:w-[400px] max-w-screen-lg mx-auto bg-white/80 p-8 rounded-3xl backdrop-blur-lg border-8 border-white shadow-2xl">
          <div className="relative">
            <Link href="/" className="absolute -top-2 -left-2 text-gray-500 hover:text-primary transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <img
              src={`${publicPathName}/logo_light.png`}
              className="h-16 mx-auto"
            />
          </div>

          <div>
            <div>
              <CustomText className="text-center mb-2 text-xl font-bold">
                Welcome
              </CustomText>
              
              {/* Login Type Tabs */}
              <div className="flex mb-6 border-b">
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors duration-200 ${
                    activeTab === "password"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("password");
                    setOtpSent(false);
                  }}
                >
                  Login with Password
                </button>
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors duration-200 ${
                    activeTab === "otp"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("otp");
                    setOtpSent(false);
                  }}
                >
                  Login with OTP
                </button>
              </div>
            </div>

            {/* Password Login Form */}
            {activeTab === "password" && (
              <form onSubmit={passwordForm.handleSubmit(onPasswordLoginSubmit)}>
                <div className="mb-1 flex flex-col">
                  <div>
                    <CustomInput
                      label="Enter Email/ Mobile No."
                      {...passwordForm.register("userName")}
                      required
                      placeholder="Enter Email/ Mobile No."
                      error={passwordForm.formState.errors.userName?.message}
                    />
                  </div>
                  <div>
                    <CustomInput
                      required
                      type={passwordType}
                      label="Password"
                      placeholder="Password"
                      {...passwordForm.register("password")}
                      error={passwordForm.formState.errors.password?.message}
                      icon={
                        passwordType === "password" ? (
                          <FaEyeSlash onClick={() => setpasswordType("text")} />
                        ) : (
                          <FaEye onClick={() => setpasswordType("password")} />
                        )
                      }
                    />
                  </div>
                </div>
                <div className="text-end mt-2">
                  <CustomText
                    className="inline text-blue-600 font-normal cursor-pointer hover:underline"
                    onClick={() => {
                      router.push("/forgot-password");
                    }}
                  >
                    Forgot Password?
                  </CustomText>
                </div>

                <div>
                  <CustomButton
                    className="mt-6 w-full"
                    type="submit"
                    loading={loginLoading}
                  >
                    Login
                  </CustomButton>
                </div>

                {/* <div className="text-end mt-2">
                  <CustomText
                    className="inline text-blue-600 font-normal cursor-pointer hover:underline"
                    onClick={handleLoginOTP}
                  >
                    Login with OTP
                  </CustomText>
                </div> */}
              </form>
            )}

            {/* OTP Login Form */}
            {activeTab === "otp" && (
              <form onSubmit={otpForm.handleSubmit(onSendOtpSubmit)}>
                <div className="mb-1 flex flex-col">
                  <div>
                    <CustomInput
                      label="Enter Mobile No."
                      {...otpForm.register("mobile")}
                      required
                      placeholder="Enter 10-digit mobile number"
                       maxLength={10}
                      error={otpForm.formState.errors.mobile?.message}
                      disabled={otpSent}
                    />
                  </div>
                </div>

                <div>
                  <CustomButton
                    className="mt-6 w-full"
                    type="submit"
                    loading={otpLoginLoading}
                    disabled={otpSent}
                  >
                    {otpSent ? "OTP Sent" : "Send OTP"}
                  </CustomButton>
                </div>

                {otpSent && (
                  <div className="mt-4 text-center">
                    <CustomText className="text-green-600 text-sm">
                      OTP sent to {mobileNumber}. Enter the OTP to login.
                    </CustomText>
                  </div>
                )}
              </form>
            )}

            {isOpenOtpModal && (
              <div id="my_modal" className="modal modal-open !bg-white" ref={modalRef}>
                <div className="modal-box shadow-none rounded-3xl bg-white sm:w-96 md:w-[400px] max-w-screen-lg" onClick={(e) => e.stopPropagation()}>
                  <OTPScreen
                    userData={userData}
                    setUserData={setUserData}
                    closeModal={closeModal}
                    isRegister={isNotVerify ? true : false}
                    userName={activeTab === "otp" ? mobileNumber : userName}
                    onLoginSuccess={handleSuccessfulLogin}
                  />
                </div>
              </div>
            )}

            {showUserTypeSelection && (
              <div className="modal modal-open !bg-white">
                <div className="modal-box shadow-none rounded-3xl bg-white sm:w-96 md:w-[400px] max-w-screen-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-4">Select User Type</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Multiple user types found for this account. Please select how you want to login:
                    </p>

                    <div className="space-y-3">
                      {userTypes.map((userType: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleUserTypeSelection(userType)}
                          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
                          disabled={loginLoading}
                        >
                          <div className="font-medium text-gray-800">
                            {userType.userType}
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setShowUserTypeSelection(false);
                        setLoginLoading(false);
                      }}
                      className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                      disabled={loginLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;