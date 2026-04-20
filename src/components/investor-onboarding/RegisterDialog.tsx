"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import OTPScreen from "../otp-screen/otp-screen";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import { publicPathName } from "@/utils/constants";

const schema = yup.object().shape({
    email: yup
        .string()
        .required("Email is required")
        .email("Invalid email format")
        .max(100, "Email must be less than 100 characters"),

    mobile: yup
        .string()
        .required("Mobile number is required")
        .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),

    password: yup
        .string()
        .required("Password is required")
        .min(6)
        .max(16)
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Must contain uppercase, lowercase & number"
        ),

    confirmPassword: yup
        .string()
        .required("Confirm Password is required")
        .oneOf([yup.ref("password")], "Passwords do not match"),
});

interface RegisterDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function RegisterDialog({ open, onClose }: RegisterDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchParams = useSearchParams();

    const userType = searchParams.get("userType");
    const partnerId = searchParams.get("partner_id");

    const [loading, setLoading] = useState(false);
    const [passwordType, setPasswordType] = useState<"text" | "password">("password");
    const [confirmPasswordType, setConfirmPasswordType] =
        useState<"text" | "password">("password");
    const [userData, setUserData] = useState<any>();
    const [showOtp, setShowOtp] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    /** open / close dialog */
    useEffect(() => {
        if (open) dialogRef.current?.showModal();
        else dialogRef.current?.close();
    }, [open]);

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue("mobile", e.target.value.replace(/\D/g, "").slice(0, 10), {
            shouldValidate: true,
        });
    };

    const onSubmit = async (values: any) => {
        try {
            setLoading(true);

            const payload = {
                ...values,
                userType: userType || "customer",
            };

            const res = await api.post("/user/register-user", payload);

            if (res.data?.data) {
                setUserData(res.data.data);
                reset();
                setShowOtp(true);
            }
        } catch (err) {
            handleServerError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="fixed inset-0 z-50 m-0 p-0 bg-black/50 w-full flex items-center justify-center"
            onCancel={onClose}
        >
            <div className="bg-[#111111] w-[350px] p-6 space-y-5 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#9CA3AF] hover:text-[#F59E0B]"
                >
                    ✕
                </button>
                {!showOtp ? (
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <CustomInput
                            label="Your Mobile No."
                            {...register("mobile")}
                            onChange={handleMobileChange}
                            error={errors.mobile?.message}
                        />

                        <CustomInput
                            label="Password"
                            type={passwordType}
                            {...register("password")}
                            error={errors.password?.message}
                            icon={
                                passwordType === "password" ? (
                                    <FaEyeSlash onClick={() => setPasswordType("text")} />
                                ) : (
                                    <FaEye onClick={() => setPasswordType("password")} />
                                )
                            }
                        />

                        <CustomInput
                            label="Confirm Password"
                            type={confirmPasswordType}
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

                        <CustomButton
                            type="submit"
                            className="w-full mt-4"
                            loading={loading}
                            disabled={!isValid}
                        >
                            Register
                        </CustomButton>
                    </form>
                ) : (
                    <OTPScreen
                        userData={userData}
                        setUserData={setUserData}
                        isRegister
                        closeModal={onClose}
                        partnerId={partnerId}
                    />
                )}
            </div>
        </dialog>
    );
}
