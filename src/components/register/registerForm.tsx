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
import ThemeToggle from "@/commonUI/ThemeToggle";
import LanguageDropdown from "@/commonUI/LanguageDropdown";
import { useLandingLang } from "@/i18n/landingI18n";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  User,
  Phone,
  TrendingUp,
  Award,
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
  const { t } = useLandingLang();
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
  console.log("registerAs---value", registerAsValue);

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
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0c10] via-[#0f1219] to-[#06080c]">

        {/* ========== ANIMATED BACKGROUND — WEALTH REGISTRATION THEME ========== */}
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

          {/* Floating geometric shapes */}
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

          {/* Animated bar chart */}
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
          <div className="w-[450px] max-w-full">
            <div className="relative bg-[#0a0c10]/80 backdrop-blur-xl rounded-xl border-2 border-[#F59E0B]/30 shadow-2xl shadow-[#F59E0B]/10 p-6 space-y-6 mx-auto animate-container-glow">

              {/* Animated corner brackets */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="absolute -top-2 -left-2 text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-300 group"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex justify-center">
                  <img
                    src={`${publicPathName}/logo_light.png`}
                    className="h-16 animate-logo-glow"
                    alt="Logo"
                  />
                </div>
              </div>

              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full mb-2 border border-[#F59E0B]/30 animate-icon-pulse">
                  <User className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
                  {t("register.title")}
                </h2>
              </div>

              {/* Form Error Display */}
              {formError && (
                <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg animate-slide-down">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">{formError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit, onError)} className="animate-form-in">
                <div className="mb-4 flex flex-col space-y-5">
                  <div className="group">
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                      {t("register.registerAs")}: <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Award className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      <input
                        type="text"
                        value={userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : "Customer"}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent cursor-not-allowed opacity-70"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                      {t("register.mobileNumber")} <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Phone className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" />
                      </div>
                      <span className="absolute left-12 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-medium border-r border-[#2a2c32] pr-2">+91</span>
                      <input
                        type="tel"
                        {...register("mobile")}
                        required
                        placeholder={t("register.mobilePlaceholder")}
                        onChange={handleMobileChange}
                        maxLength={10}
                        className="w-full pl-20 pr-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all group-hover:border-[#F59E0B]/50"
                      />
                    </div>
                    {errors.mobile?.message && (
                      <p className="mt-1 text-xs text-red-400 animate-shake">{errors.mobile?.message as string}</p>
                    )}
                    {mobileValue && mobileValue.length === 10 && !errors.mobile && (
                      <div className="mt-2 flex items-center gap-1 animate-fade-in">
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                        <span className="text-xs text-[#10B981]">{t("register.validMobile")}</span>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-[#9CA3AF] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {t("register.mobileHint")}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    disabled={!mobileValue || mobileValue.length !== 10 || loading}
                    onClick={() => {
                      console.log("Button clicked manually");
                      handleSubmit(onSubmit, onError)();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                          <span>{t("register.processing")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("register.button")}</span>
                          <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-[#2a2c32] animate-fade-in-up">
                <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF] mb-2">
                  <Shield className="w-3 h-3 text-[#F59E0B]" />
                  <span>{t("register.secureNote")}</span>
                </div>
                <p className="text-xs text-[#9CA3AF]/70">
                  {t("register.terms")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpenOtpModal && userData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" ref={modalRef}>
          <div className="bg-gradient-to-br from-[#0a0c10] to-[#121418] rounded-xl shadow-2xl max-w-md w-full border border-[#F59E0B]/30 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
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
        </div>
      )}

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
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes form-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orb-float { animation: orb-float 12s ease-in-out infinite; }
        .animate-orb-float-delay { animation: orb-float-delay 15s ease-in-out infinite; }
        .animate-orb-spin { animation: orb-spin 30s linear infinite; transform-origin: center; }
        .animate-radar-ping { animation: radar-ping 4s ease-out infinite; transform-origin: center; }
        .animate-radar-sweep { animation: radar-sweep 8s linear infinite; transform-origin: center; }
        .animate-float-shape { animation: float-shape 10s ease-in-out infinite; }
        .animate-light-streak { animation: light-streak 6s ease-in-out infinite; }
        .animate-light-streak-delay { animation: light-streak 6s ease-in-out 3s infinite; }
        .animate-grid-move { animation: grid-move 20s linear infinite; background-size: 50px 50px; }
        .animate-container-glow { animation: container-glow 4s ease-in-out infinite; }
        .animate-corner-pulse { animation: corner-pulse 3s ease-in-out infinite; }
        .animate-corner-pulse-delay { animation: corner-pulse 3s ease-in-out 1.5s infinite; }
        .animate-logo-glow { animation: logo-glow 3s ease-in-out infinite; }
        .animate-text-shimmer { animation: text-shimmer 3s linear infinite; }
        .animate-icon-pulse { animation: icon-pulse 2s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-form-in { animation: form-in 0.4s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </>
  );
}

export default RegisterForm;
