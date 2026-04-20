"use client";

import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ArrowLeft, Mail, Shield, KeyRound } from "lucide-react";

const schema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid Email"),
});

export default function ForgotPasswordForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (formValues: any) => {
    try {
      setLoading(true);

      let checkEmail = await api.post(`/user/forgotPassword`, formValues);
      console.log(checkEmail, "checkEmailcheckEmail");
      setLoading(false);
      toastAlert("success", checkEmail.data.msg);
      sessionStorage.setItem("FORCE_CHANGE_PASSWORD", "true");
      router.push("/login");
    } catch (error: any) {
      setLoading(false);
      handleServerError(error);
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0c10] via-[#0f1219] to-[#06080c]">

        {/* ========== ANIMATED BACKGROUND ========== */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-[5%] left-[15%] w-[600px] h-[600px] rounded-full bg-[#F59E0B]/5 blur-[150px] animate-orb-float"></div>
          <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#B45309]/8 blur-[140px] animate-orb-float-delay"></div>
          <div className="absolute top-[40%] left-[40%] w-[700px] h-[700px] rounded-full bg-[#FBBF24]/3 blur-[180px] animate-orb-spin"></div>

          {/* Twinkling stars */}
          <div className="absolute inset-0">
            {[...Array(120)].map((_, i) => (
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

          {/* Floating geometric shapes */}
          {[...Array(15)].map((_, i) => (
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

          {/* Moving light streaks */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F59E0B]/40 to-transparent animate-light-streak"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent animate-light-streak-delay"></div>

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(245,158,11,0.05)_50%,transparent_60%)] animate-grid-move"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full sm:w-96 md:w-[420px] max-w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative bg-[#0a0c10]/80 backdrop-blur-xl rounded-xl border-2 border-[#F59E0B]/30 shadow-2xl shadow-[#F59E0B]/10 p-8 space-y-6 animate-container-glow"
            >
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#F59E0B]/40 animate-corner-pulse"></div>
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#F59E0B]/40 animate-corner-pulse-delay"></div>

              <div className="relative">
                <Link
                  href="/login"
                  className="absolute -top-2 -left-2 text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-300 group"
                  aria-label="Back to login"
                >
                  <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full border border-[#F59E0B]/30 animate-icon-pulse">
                  <KeyRound className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
                  Password Recovery
                </h2>
                <p className="text-sm text-[#9CA3AF]">
                  Enter your email and we&apos;ll send you instructions to reset your password.
                </p>
              </div>

              <div className="animate-form-in">
                <div className="group">
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-4 h-4 text-[#F59E0B]" /> Your Email <span className="text-[#F59E0B]">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" />
                    </div>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="Enter Email"
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all group-hover:border-[#F59E0B]/50"
                    />
                  </div>
                  {errors.email?.message && (
                    <p className="mt-1 text-xs text-red-400 animate-shake">{errors.email?.message as string}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500 ease-out group-hover:w-full"></span>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link →"
                  )}
                </span>
              </button>

              <div className="text-center border-t border-[#2a2c32] pt-4 animate-fade-in-up">
                <p className="text-sm text-[#9CA3AF]">
                  Remembered your password?{" "}
                  <Link href="/login" className="text-[#F59E0B] hover:text-[#FBBF24] font-semibold transition-colors">
                    Back to Login
                  </Link>
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#9CA3AF]/80">
                  <Shield className="w-3 h-3 text-[#F59E0B]" />
                  <span>Your account is protected with industry-grade security</span>
                </div>
              </div>
            </form>
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
        @keyframes float-shape {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.3; }
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
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes form-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
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
        .animate-orb-float { animation: orb-float 12s ease-in-out infinite; }
        .animate-orb-float-delay { animation: orb-float-delay 15s ease-in-out infinite; }
        .animate-orb-spin { animation: orb-spin 30s linear infinite; transform-origin: center; }
        .animate-float-shape { animation: float-shape 10s ease-in-out infinite; }
        .animate-light-streak { animation: light-streak 6s ease-in-out infinite; }
        .animate-light-streak-delay { animation: light-streak 6s ease-in-out 3s infinite; }
        .animate-grid-move { animation: grid-move 20s linear infinite; background-size: 50px 50px; }
        .animate-container-glow { animation: container-glow 4s ease-in-out infinite; }
        .animate-corner-pulse { animation: corner-pulse 3s ease-in-out infinite; }
        .animate-corner-pulse-delay { animation: corner-pulse 3s ease-in-out 1.5s infinite; }
        .animate-icon-pulse { animation: icon-pulse 2s ease-in-out infinite; }
        .animate-text-shimmer { animation: text-shimmer 3s linear infinite; }
        .animate-form-in { animation: form-in 0.4s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </>
  );
}
