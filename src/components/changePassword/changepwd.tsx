"use client";
import api from "@/utils/api";
import { ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";
import { handleServerError, removeLS, setLS, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Lock, KeyRound, Shield, AlertCircle, CheckCircle } from "lucide-react";
import * as yup from "yup";

const schema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Field is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
  newPassword: yup
    .string()
    .required("Field is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
  confirmPassword: yup
    .string()
    .required("Field is required")
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
});

function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const [passwordType, setpasswordType] = useState<"text" | "password">("password");
  const [newpasswordType, setnewpasswordType] = useState<"text" | "password">("password");
  const [confirmpasswordType, setconfirmpasswordType] = useState<"text" | "password">("password");
  const [loading, setLoading] = useState<boolean>(false);
  const [successNote, setSuccessNote] = useState("");

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      const result: any = await api.post(`/user/changePassword`, values);

      if (result.data.data) {
        toastAlert("success", "Your Password has been successfully updated!");
        setSuccessNote("Your password has been updated successfully. Please log-out and login again.");
        localStorage.clear();
        sessionStorage.clear();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...');

      removeLS(PROD_DATA);
      removeLS(TOKEN_PREFIX);
      removeLS(MENU_PREFIX);
      removeLS(FLAT_MENU);
      removeLS(USER_DATA);
      removeLS(ADMIN_INVESTER_DATA);

      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log('Logout successful - redirecting to login');

      router.push('/login');

      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const PasswordField = ({
    label,
    type,
    toggle,
    error,
    placeholder,
    registerProps,
  }: any) => (
    <div className="group">
      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
        <span className="inline-flex items-center gap-1">{label} <span className="text-[#F59E0B]">*</span></span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Lock className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" />
        </div>
        <input
          type={type}
          placeholder={placeholder}
          {...registerProps}
          className="w-full pl-10 pr-12 py-3 bg-[#1a1c22]/80 border border-[#2a2c32] rounded-lg text-[#F9FAFB] placeholder:text-[#6a6c72] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all group-hover:border-[#F59E0B]/50"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F59E0B] transition-all duration-300 hover:scale-110"
        >
          {type === "password" ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );

  return (
    <div className="py-10 px-4">
      <div className="relative mx-auto w-full max-w-md">
        {/* Decorative ambient glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#F59E0B]/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#B45309]/10 blur-[100px] pointer-events-none"></div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative bg-gradient-to-br from-[#0a0c10] to-[#121418] rounded-2xl border-2 border-[#F59E0B]/30 shadow-2xl shadow-[#F59E0B]/10 p-8 space-y-6"
        >
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#F59E0B]/40"></div>
          <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#F59E0B]/40"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#F59E0B]/40"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#F59E0B]/40"></div>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full border border-[#F59E0B]/30">
              <KeyRound className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent">
              Change Password
            </h2>
            <p className="text-sm text-[#9CA3AF]">
              Keep your account secure by updating your password regularly.
            </p>
          </div>

          {successNote && (
            <div className="bg-[#10B981]/10 border-l-4 border-[#10B981] text-[#10B981] px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{successNote}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <PasswordField
              label="Current Password"
              type={passwordType}
              toggle={() => setpasswordType(passwordType === "password" ? "text" : "password")}
              placeholder="Enter current password"
              error={errors.oldPassword?.message}
              registerProps={register("oldPassword")}
            />
            <PasswordField
              label="New Password"
              type={newpasswordType}
              toggle={() => setnewpasswordType(newpasswordType === "password" ? "text" : "password")}
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              registerProps={register("newPassword")}
            />
            <PasswordField
              label="Confirm New Password"
              type={confirmpasswordType}
              toggle={() => setconfirmpasswordType(confirmpasswordType === "password" ? "text" : "password")}
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              registerProps={register("confirmPassword")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500 ease-out group-hover:w-full"></span>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Password →"
              )}
            </span>
          </button>

          <div className="text-center border-t border-[#2a2c32] pt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
              <Shield className="w-3 h-3 text-[#F59E0B]" />
              <span>Use at least 6 characters with a mix of letters &amp; numbers</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
