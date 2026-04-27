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
import { handleServerError, setLS } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";
import OTPScreen from "../otp-screen/otp-screen";
import ThemeToggle from "@/commonUI/ThemeToggle";
import LanguageDropdown from "@/commonUI/LanguageDropdown";
import { useLandingLang } from "@/i18n/landingI18n";

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
  const { t } = useLandingLang();
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

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

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
        setNotification({
          type: "error",
          message: "No user found with this email or mobile number",
        });
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
          setNotification({
            type: "error",
            message: "Incorrect Password entered !",
          });
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

            setNotification({
              type: "error",
              message: "Please verify email or mobile after login !",
            });
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

        setNotification({
          type: "error",
          message: "No user found with this mobile number !",
        });
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

        setNotification({
          type: "success",
          message: "OTP sent successfully to your mobile",
        });
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

            setNotification({
              type: "error",
              message: "Please verify email or mobile after login",
            });
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

    setNotification({
      type: "success",
      message: "Logged In successfully",
    });

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

        setNotification({
          type: "error",
          message: "Please enter username",
        });
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

          setNotification({
            type: "error",
            message: "Please verify email or mobile after login",
          });
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
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0c10] via-[#0f1219] to-[#06080c]">
        
        {/* ========== ALTERNATIVE ANIMATED BACKGROUND - COSMIC WEALTH THEME ========== */}
        <div className="absolute inset-0 overflow-hidden">
          
          {/* Deep space gradient orbs */}
          <div className="absolute top-[5%] left-[15%] w-[600px] h-[600px] rounded-full bg-[#F59E0B]/5 blur-[150px] animate-orb-float"></div>
          <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#B45309]/8 blur-[140px] animate-orb-float-delay"></div>
          <div className="absolute top-[40%] left-[40%] w-[700px] h-[700px] rounded-full bg-[#FBBF24]/3 blur-[180px] animate-orb-spin"></div>

          {/* Twinkling stars background */}
          <div className="absolute inset-0">
            {[...Array(150)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Animated radar/sonar effect */}
          <div className="absolute top-[15%] left-[5%] w-[300px] h-[300px] rounded-full border border-[#F59E0B]/20 animate-radar-ping">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#F59E0B] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-[150px] bg-gradient-to-t from-[#F59E0B] to-transparent origin-bottom animate-radar-sweep"></div>
          </div>

      

          {/* Animated circular progress rings */}
          <div className="absolute bottom-[15%] left-[5%] w-[180px] h-[180px] opacity-30">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="60 251" strokeLinecap="round" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="40 188" strokeLinecap="round" strokeDashoffset="-30" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="25 125" strokeLinecap="round" strokeDashoffset="-50" />
            </svg>
          </div>

          {/* Floating geometric shapes (diamonds/cubes representing assets) */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-[#F59E0B]/15 animate-float-shape"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 12}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: Math.random() > 0.5 ? '0%' : '50%',
                borderColor: `rgba(245, 158, 11, ${0.1 + Math.random() * 0.2})`,
              }}
            />
          ))}

          {/* Animated bar chart (live data feel) */}
          <div className="absolute bottom-[10%] right-[5%] flex items-end gap-1 h-36 opacity-40">
            {[28, 45, 62, 38, 85, 52, 70, 41, 93, 58, 77, 63, 88, 49, 72].map((height, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-[#F59E0B] to-[#FBBF24] rounded-t transition-all duration-300"
                style={{
                  height: `${height}px`,
                  animation: `barPulse ${1 + i * 0.1}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>

          {/* Moving light streak */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F59E0B]/40 to-transparent animate-light-streak"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent animate-light-streak-delay"></div>

          {/* Animated coin rain effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute text-lg animate-coin-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${8 + Math.random() * 10}s`,
                  opacity: 0.15,
                }}
              >
                💰
              </div>
            ))}
          </div>

          {/* Grid with perspective */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(245,158,11,0.05)_50%,transparent_60%)] animate-grid-move"></div>
        </div>

        {/* Theme + language controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <ThemeToggle />
          <LanguageDropdown />
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="myContainer w-full !px-0 !mx-3">
            <div className="mt-10 mb-2 w-full sm:w-96 md:w-[400px] max-w-screen-lg mx-auto backdrop-blur-xl bg-[#0a0c10]/60 p-8 rounded-3xl border border-[#F59E0B]/20 shadow-2xl shadow-black/50 transition-all duration-500 hover:shadow-[#F59E0B]/10 animate-container-glow">
              
              {/* Animated corner brackets */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>

              <div className="relative">
                <Link href="/" className="absolute -top-2 -left-2 text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-300 hover:scale-110 hover:rotate-12">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div className="flex justify-center">
                  <img
                    src={`${publicPathName}/logo_light.png`}
                    className="h-16 animate-logo-glow"
                    alt="Logo"
                  />
                </div>
              </div>

              <div>
                <div>
                  <CustomText className="text-center mb-2 text-2xl font-bold bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
                    {t("login.welcome")}
                  </CustomText>
              

                  {notification && (
                    <div
                      className={`mb-5 relative overflow-hidden rounded-2xl px-4 py-3 border shadow-xl animate-notification-slide backdrop-blur-xl ${notification.type === "success"
                          ? "border-[#10B981]/40 bg-[#10B981]/10"
                          : "border-[#F59E0B]/40 bg-[#F59E0B]/10"
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                      <div className="relative flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center animate-icon-pop ${notification.type === "success"
                              ? "bg-[#10B981]/20"
                              : "bg-[#F59E0B]/20"
                            }`}
                        >
                          {notification.type === "success" ? (
                            <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${notification.type === "success" ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                            {notification.type === "success" ? "Success!" : "Notice"}
                          </p>
                          <p className="text-xs text-[#E5E7EB]">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Login Type Tabs */}
                  <div className="flex mb-6 bg-[#1a1c22]/50 rounded-lg p-1 relative">
                    <button
                      className={`flex-1 py-2 text-center font-medium transition-all duration-300 rounded-md relative z-10 ${activeTab === "password"
                        ? "text-white"
                        : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                        }`}
                      onClick={() => {
                        setActiveTab("password");
                        setOtpSent(false);
                      }}
                    >
                      🔐 {t("login.tabPassword")}
                    </button>
                    <button
                      className={`flex-1 py-2 text-center font-medium transition-all duration-300 rounded-md relative z-10 ${activeTab === "otp"
                        ? "text-white"
                        : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                        }`}
                      onClick={() => {
                        setActiveTab("otp");
                        setOtpSent(false);
                      }}
                    >
                      📱 {t("login.tabOtp")}
                    </button>
                    <div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-md transition-all duration-400 ease-out ${activeTab === "password" ? "left-1" : "left-[calc(50%+2px)]"
                        }`}
                    ></div>
                  </div>
                </div>

                {/* Password Login Form */}
                {activeTab === "password" && (
                  <form onSubmit={passwordForm.handleSubmit(onPasswordLoginSubmit)} className="animate-form-in">
                    <div className="mb-1 flex flex-col gap-4">
                      <div className="group">
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                          <span className="inline-flex items-center gap-1">📧 {t("login.emailOrMobile")} <span className="text-[#F59E0B]">*</span></span>
                        </label>
                        <input
                          type="text"
                          {...passwordForm.register("userName")}
                          placeholder={t("login.emailOrMobilePlaceholder")}
                          className="w-full px-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all group-hover:border-[#F59E0B]/50"
                        />
                        {passwordForm.formState.errors.userName?.message && (
                          <p className="mt-1 text-xs text-red-400 animate-shake">{passwordForm.formState.errors.userName?.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                          <span className="inline-flex items-center gap-1">🔒 {t("login.password")} <span className="text-[#F59E0B]">*</span></span>
                        </label>
                        <div className="relative">
                          <input
                            type={passwordType}
                            {...passwordForm.register("password")}
                            placeholder={t("login.passwordPlaceholder")}
                            className="w-full px-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all pr-12 group-hover:border-[#F59E0B]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setpasswordType(passwordType === "password" ? "text" : "password")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-300 hover:scale-110"
                          >
                            {passwordType === "password" ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.password?.message && (
                          <p className="mt-1 text-xs text-red-400 animate-shake">{passwordForm.formState.errors.password?.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-end mt-2">
                      <button
                        type="button"
                        className="text-[#F59E0B] text-sm font-medium hover:text-[#FBBF24] transition-all hover:underline inline-flex items-center gap-1 group"
                        onClick={() => router.push("/forgot-password")}
                      >
                        {t("login.forgotPassword")}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="mt-6 w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500 ease-out group-hover:w-full"></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loginLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("login.loggingIn")}
                            </>
                          ) : (
                            <>{t("login.button")} →</>
                          )}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* OTP Login Form */}
                {activeTab === "otp" && (
                  <form onSubmit={otpForm.handleSubmit(onSendOtpSubmit)} className="animate-form-in">
                    <div className="mb-1 flex flex-col">
                      <div className="group">
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                          <span className="inline-flex items-center gap-1">📞 {t("login.mobileNumber")} <span className="text-[#F59E0B]">*</span></span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">+91</span>
                          <input
                            type="tel"
                            {...otpForm.register("mobile")}
                            placeholder={t("login.mobilePlaceholder")}
                            maxLength={10}
                            disabled={otpSent}
                            className="w-full pl-12 pr-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-[#F59E0B]/50"
                          />
                        </div>
                        {otpForm.formState.errors.mobile?.message && (
                          <p className="mt-1 text-xs text-red-400 animate-shake">{otpForm.formState.errors.mobile?.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={otpLoginLoading || otpSent}
                        className="mt-6 w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500 ease-out group-hover:w-full"></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {otpLoginLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("login.sendingOtp")}
                            </>
                          ) : otpSent ? (
                            <>✓ {t("login.otpSent")}</>
                          ) : (
                            <>{t("login.sendOtp")} →</>
                          )}
                        </span>
                      </button>
                    </div>
                    {otpSent && (
                      <div className="mt-4 text-center animate-pulse-subtle">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30">
                          <span className="inline-block w-2 h-2 bg-[#10B981] rounded-full animate-ping"></span>
                          <p className="text-[#10B981] text-sm">
                            {t("login.otpSentTo")} +91 {mobileNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {isOpenOtpModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" ref={modalRef}>
                    <div className="bg-gradient-to-br from-[#0a0c10] to-[#121418] rounded-xl shadow-2xl max-w-md w-full border border-[#F59E0B]/30 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
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
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#0a0c10] to-[#121418] rounded-xl shadow-2xl max-w-md w-full border border-[#F59E0B]/30 animate-scaleIn">
                      <div className="p-6">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full flex items-center justify-center animate-pulse-slow">
                            <span className="text-4xl">👥</span>
                          </div>
                          <h3 className="font-bold text-xl mb-2 text-[#F9FAFB]">{t("login.selectUserType")}</h3>
                          <p className="text-sm text-[#9CA3AF] mb-6">
                            {t("login.selectUserTypeDesc")}
                          </p>
                          <div className="space-y-3">
                            {userTypes.map((userType: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => handleUserTypeSelection(userType)}
                                className="w-full p-4 border border-[#2a2c32] rounded-lg hover:border-[#F59E0B] hover:bg-[#1a1c22] transition-all duration-300 text-left group transform hover:scale-[1.02]"
                                disabled={loginLoading}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center group-hover:bg-[#F59E0B]/20 transition-colors">
                                      <span className="text-[#F59E0B]">{index === 0 ? '🏦' : '👤'}</span>
                                    </div>
                                    <span className="font-medium text-[#F9FAFB] group-hover:text-[#F59E0B] transition-colors">
                                      {userType.userType}
                                    </span>
                                  </div>
                                  <span className="text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">→</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setShowUserTypeSelection(false);
                              setLoginLoading(false);
                            }}
                            className="mt-4 text-[#9CA3AF] hover:text-[#F59E0B] text-sm transition-colors inline-flex items-center gap-1 group"
                            disabled={loginLoading}
                          >
                            {t("login.cancel")}
                            <span className="group-hover:translate-x-0.5 transition-transform">←</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
          50% { transform: translate(20px, -20px) scale(1.1); opacity: 0.1; }
        }
        @keyframes orb-float-delay {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
          50% { transform: translate(-15px, 15px) scale(1.15); opacity: 0.12; }
        }
        @keyframes orb-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
        @keyframes radar-ping {
          0% { transform: scale(0.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes radar-sweep {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ticker-slide {
          0% { opacity: 0; transform: translateX(20px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-20px); }
        }
        @keyframes float-shape {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes barPulse {
          from { transform: scaleY(0.7); opacity: 0.4; }
          to { transform: scaleY(1); opacity: 0.7; }
        }
        @keyframes light-streak {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes coin-fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes container-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.05); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.1); }
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes logo-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.3)); }
          50% { filter: drop-shadow(0 0 15px rgba(245, 158, 11, 0.6)); }
        }
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes notification-slide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes icon-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes form-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-orb-float { animation: orb-float 12s ease-in-out infinite; }
        .animate-orb-float-delay { animation: orb-float-delay 15s ease-in-out infinite; }
        .animate-orb-spin { animation: orb-spin 30s linear infinite; transform-origin: center; }
        .animate-radar-ping { animation: radar-ping 4s ease-out infinite; transform-origin: center; }
        .animate-radar-sweep { animation: radar-sweep 8s linear infinite; transform-origin: center; }
        .animate-ticker-slide { animation: ticker-slide 6s ease-in-out infinite; white-space: nowrap; }
        .animate-float-shape { animation: float-shape 10s ease-in-out infinite; }
        .animate-light-streak { animation: light-streak 6s ease-in-out infinite; }
        .animate-light-streak-delay { animation: light-streak 6s ease-in-out 3s infinite; }
        .animate-coin-fall { animation: coin-fall 12s linear infinite; }
        .animate-grid-move { animation: grid-move 20s linear infinite; background-size: 50px 50px; }
        .animate-container-glow { animation: container-glow 4s ease-in-out infinite; }
        .animate-corner-pulse { animation: corner-pulse 3s ease-in-out infinite; }
        .animate-corner-pulse-delay { animation: corner-pulse 3s ease-in-out 1.5s infinite; }
        .animate-logo-glow { animation: logo-glow 3s ease-in-out infinite; }
        .animate-text-shimmer { animation: text-shimmer 3s linear infinite; }
        .animate-notification-slide { animation: notification-slide 0.3s ease-out; }
        .animate-icon-pop { animation: icon-pop 0.4s ease-out; }
        .animate-form-in { animation: form-in 0.4s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-pulse-subtle { animation: pulse-subtle 1s ease-in-out infinite; }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

export default LoginForm;