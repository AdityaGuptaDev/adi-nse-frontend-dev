"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import OTPScreen from "./OTPScreen";

import api from "@/utils/api";
import { decrypt } from "@/utils/aesmfu";
import { handleServerError, toastAlert } from "@/utils/helpers";


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
    //const [parentId, setParentId] = useState<string | null>(null);




    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encryptedId = params.get("id");

        if (!encryptedId) return;

        try {
            const decrypted = JSON.parse(decrypt(encryptedId));
            setUserType("Investor");
            //setParentId(decrypted?.userId ?? null);
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
                ...(parentData.userId != null && { parentId: parentData.userId }),
            };
            console.log("payload-",payload);
            
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-4 space-y-6">
                {/* Back Button */}
                <div className="flex items-center">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Go back"
                    >
                        <svg 
                            className="w-5 h-5 mr-2" 
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
                        <span className="text-sm font-medium">Back</span>
                    </button>
                </div>

                <header className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                        <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zM2 22c0-5.523 4.477-10 10-10s10 4.477 10 10" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold">Investor Registration</h2>
                    <p className="text-sm text-gray-600">
                        Register as an Investor to begin
                    </p>
                </header>



                {formError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 rounded">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


                    <div>
                        <label className="text-sm font-medium">Mobile Number *</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-3 text-gray-600">+91</span>
                            <CustomInput
                                {...register("mobile")}
                                placeholder="10-digit mobile number"
                                onChange={handleMobileChange}
                                error={errors.mobile?.message}
                                className="pl-4"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <CustomButton
                        type="submit"
                        loading={loading}
                        disabled={loading || mobileValue?.length !== 10}
                        className="w-full"
                    >
                        Continue to OTP
                    </CustomButton>
                </form>
            </div>

            {isOtpOpen && userData && (
                <div className="modal modal-open" ref={modalRef}>
                    <div className="modal-box max-w-md">
                        <button
                            onClick={() => setIsOtpOpen(false)}
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                        >
                            ✕
                        </button>
                        <OTPScreen
                            mode="REGISTER"
                            userData={userData}
                            closeModal={() => setIsOtpOpen(false)}
                            mobile={submittedMobile}
                            parentData={parentData}
                        />
                    </div>
                </div>
            )}


        </div>
    );
}