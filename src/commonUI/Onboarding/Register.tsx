"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, ArrowLeft, Shield, CheckCircle, Lock, Mail, X } from "lucide-react";

import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import OTPScreen from "./OTPScreen";
import OnBoarding from "@/components/on-boarding";

import api from "@/utils/api";
import { decrypt } from "@/utils/aesmfu";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";


const schema = yup.object({
    mobile: yup
        .string()
        .required("Mobile number is required")
        .matches(/^[0-9]+$/, "Mobile number must contain only digits")
        .length(10, "Mobile number must be exactly 10 digits")
        .test(
            "valid-start",
            "Mobile number should start with 6, 7, 8, or 9",
            (value) => !value || /^[6-9]/.test(value)
        ),
});

type FormValues = {
    mobile: string;
};

interface ParentData {
    userId: string | number | null;
    userType: string | null;
}

interface Payload {
    mobile: string;
    userType: string;
    parentUserType?: string;
    parentId?: string | number;
}


export default function RegisterForm() {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [isOtpOpen, setIsOtpOpen] = useState(false);

    const [userData, setUserData] = useState<any>(null);
    const [submittedMobile, setSubmittedMobile] = useState("");
    const [userType, setUserType] = useState<"Investor" | "Partner">("Investor");
    const [parentData, setParentData] = useState<ParentData>({
        userId: null,
        userType: null,
    });
    const [isAdminFlow, setIsAdminFlow] = useState(false);
    const [showOnBoarding, setShowOnBoarding] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get("id");
        const userTypeParam = params.get("userType");

        // Admin flow: AdminDashboard passes plain id + userType=admin (no encryption).
        // Detect this first so we don't try to decrypt a plain integer and fail
        // silently — that was the cause of the verify-otp 500 (partner_id="" → INTEGER cast error).
        if (userTypeParam === "admin") {
            setIsAdminFlow(true);
            setUserType("Investor");
            const adminUser = getLS(USER_DATA);
            setParentData({
                userId: adminUser?.id ?? idParam ?? null,
                userType: "admin",
            });
            return;
        }

        if (!idParam) return;

        try {
            const decrypted = JSON.parse(decrypt(idParam));
            setUserType("Investor");
            setParentData({
                userId: decrypted?.userId ?? null,
                userType: decrypted?.userType ?? null,
            });
        } catch (err) {
            console.error("Invalid encrypted ID", err);
        }
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { mobile: "" },
        mode: "onChange",
    });

    const mobileValue = watch("mobile");

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setValue("mobile", value, { shouldValidate: true });
        setFormError("");
    };

    const onSubmit = async ({ mobile }: FormValues) => {
        try {
            setLoading(true);
            setFormError("");

            const payload: Payload = {
                mobile,
                userType,
                parentUserType: parentData.userType || undefined,
                // Only forward parentId when it represents a real partner — for admin
                // flow the parent is just the admin user, not a partner who owns the investor.
                ...(!isAdminFlow && parentData.userId != null && { parentId: parentData.userId }),
            };

            const res = await api.post("/user/add-investor", payload);
            console.log("Registration Response:", res);

            if (!res?.data?.data) {
                toastAlert("error", res?.data?.message || "Registration failed");
                return;
            }

            setSubmittedMobile(mobile);
            setUserData(res.data.data);
            setIsOtpOpen(true);
            reset();

            toastAlert("success", "OTP sent successfully");
        } catch (error: any) {
            const message = error?.response?.data?.message;
            if (message) {
                setFormError(message);
                toastAlert("error", message);
            } else {
                handleServerError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111111] shadow-2xl p-4 sm:p-6 space-y-6">
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

                <header className="text-center space-y-3">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 border border-[#F59E0B]/30">
                        <User className="h-8 w-8 text-[#F59E0B]" />
                    </div>

                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                        Investor Registration
                    </h2>
                    <p className="text-sm text-[#9CA3AF]">
                        Register as an Investor to begin your investment journey
                    </p>
                </header>

                {formError && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-sm text-red-400 rounded-lg">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-[#F9FAFB] mb-2 block">
                            Mobile Number <span className="text-[#F59E0B]">*</span>
                        </label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F9FAFB] font-medium bg-[#1F1A1A] px-2 py-1 rounded-l-lg border border-r-0 border-[#2A2A2A] z-10">
                                +91
                            </span>
                            <input
                                type="tel"
                                {...register("mobile")}
                                placeholder="10-digit mobile number"
                                onChange={handleMobileChange}
                                maxLength={10}
                                className="w-full pl-16 pr-4 py-3 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                            />
                        </div>
                        {errors.mobile?.message && (
                            <p className="mt-1 text-xs text-red-400">{errors.mobile?.message}</p>
                        )}
                        {mobileValue && mobileValue.length === 10 && !errors.mobile && (
                            <div className="mt-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs text-[#10B981]">Valid mobile number</span>
                            </div>
                        )}
                        <p className="text-xs text-[#9CA3AF] mt-2">
                            We'll send you an OTP to verify your mobile number
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || mobileValue?.length !== 10}
                        className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                <span>Sending OTP...</span>
                            </>
                        ) : (
                            <span>Continue to OTP</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="pt-4 text-center border-t border-[#2A2A2A]">
                    <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
                        <Shield className="w-3 h-3 text-[#F59E0B]" />
                        <span>Your information is secure with us</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                        By registering, you agree to our 
                        <button className="text-[#F59E0B] hover:underline ml-1">Terms of Service</button> 
                        <span className="mx-1">and</span>
                        <button className="text-[#F59E0B] hover:underline">Privacy Policy</button>
                    </p>
                </div>
            </div>

            {isOtpOpen && userData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={modalRef}>
                    <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] max-w-md w-full shadow-2xl">
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setIsOtpOpen(false)}
                                className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 pb-6">
                            <OTPScreen
                                mode="REGISTER"
                                userData={userData}
                                closeModal={() => setIsOtpOpen(false)}
                                mobile={submittedMobile}
                                parentData={parentData}
                                isAdminFlow={isAdminFlow}
                                onShowOnBoarding={
                                    isAdminFlow ? () => setShowOnBoarding(true) : undefined
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {showOnBoarding && (
                <OnBoarding
                    onBoardingModal={showOnBoarding}
                    mandatory={true}
                    mobile={submittedMobile}
                />
            )}
        </div>
    );
}