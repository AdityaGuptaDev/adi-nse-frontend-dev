"use client";

import React, { useEffect, useRef, useState } from "react";
import OtpInput from "react-otp-input";
import { useRouter } from "next/navigation";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { toastAlert, handleServerError, setLS } from "@/utils/helpers";
import {
    TOKEN_PREFIX,
    MENU_PREFIX,
    USER_DATA,
    PROD_DATA,
    ADMIN_INVESTER_DATA,
    formatTime,
    publicPathName,
} from "@/utils/constants";
import {
    setCookieToken,
    storeCookieData,
    cookieStorageKeys,
} from "@/services/cookieStorageService";

type OtpMode = "REGISTER" | "LOGIN";

interface OTPScreenProps {
    mode: OtpMode;
    userData: any;
    closeModal: () => void;
    mobile: string;
    parentData?: any | null;

}


export default function OTPScreen({
    mode,
    userData,
    closeModal,
    mobile,
    parentData,
}: OTPScreenProps) {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(350);
    const [loading, setLoading] = useState(false);

    const [userTypes, setUserTypes] = useState<any[]>([]);
    const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);


    useEffect(() => {
        startTimer();
        return stopTimer;
    }, []);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleSubmit = async () => {
        if (otp.length !== 6) {
            return toastAlert("error", "Invalid OTP");
        }

        if (timer === 0) {
            return toastAlert("error", "OTP expired");
        }

        try {
            setLoading(true);
            if (mode === "REGISTER") {
                await verifyRegisterOTP();
            } else {
                await verifyLoginOTP();
            }
        } catch (error) {
            handleServerError(error);
        } finally {
            setLoading(false);
        }
    };


    const verifyRegisterOTP = async () => {
        console.log(userData, "userData");
        const payload = {
            mobile,
            mobileOTP: otp,
            userId: userData.id,
            userTypeId: userData.userTypeId,
            parentData,
        };

        const res = await api.post(`/user/verify-otp`, payload);
        const data = res?.data?.data;

        if (!data) return;

        toastAlert("success", res.data.msg);
        closeModal();
        //setLS("INVESTOR_DATA", data);
        setLS("INVESTOR_USER_ID", data?.id);

         router.push(`/initial-KYC`);

    };


    const verifyLoginOTP = async () => {
        const payload: any = {
            userName: mobile,
            loginOTP: otp,
        };

        const userTypesRes = await api.post("/user/check-user-types", {
            userName: mobile,
        });

        const userTypesData = userTypesRes?.data?.data;

        if (!userTypesData || userTypesData.userTypesCount === 0) {
            return toastAlert("error", "User not found");
        }

        if (userTypesData.userTypesCount > 1) {
            setUserTypes(userTypesData.userTypes);
            setShowUserTypeSelection(true);
            return;
        }

        payload.userTypeId = userTypesData.userTypes[0].userTypeId;
        await login(payload);
    };

    const login = async (payload: any) => {
        const res = await api.post("/user/login", payload);
        const data = res?.data?.data;

        if (!data) return;

        setLS(TOKEN_PREFIX, data.token);
        setLS(MENU_PREFIX, data.menu || []);
        setLS(USER_DATA, { ...data.user, ...data.meta });
        setLS(ADMIN_INVESTER_DATA, data.findFilterData);
        setLS(PROD_DATA, data);

        setCookieToken(data.token);
        storeCookieData(cookieStorageKeys.INIT_PATH, data.initPath);

        toastAlert("success", "Logged in successfully");
        closeModal();
        router.push(data.initPath ? `/${data.initPath}` : "/dashboard");
    };

    const resendOTP = async () => {
        try {
            const res = await api.post("/user/resend-otp", {
                userName: mobile,
                isRegister: mode === "REGISTER",
            });

            if (res.data.data) {
                toastAlert("success", res.data.msg);
                setTimer(120);
                startTimer();
            }
        } catch (error) {
            handleServerError(error);
        }
    }


    return (
        <div className="text-center">
            <img src={`${publicPathName}/logo_light.png`} className="h-16 mx-auto" />

            <CustomText className="mt-4 text-xl font-bold">OTP Verification</CustomText>
            <CustomText className="text-sm mt-2">
                Enter the 6-digit OTP sent to your mobile
            </CustomText>

            <div className="my-6 flex justify-center">
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="otpInputGap" />}
                    renderInput={(props) => <input {...props} className="otpInput" />}
                    shouldAutoFocus
                />
            </div>

            <div className="flex justify-center gap-4">
                <CustomButton loading={loading} onClick={handleSubmit}>
                    Verify
                </CustomButton>
                <CustomButton
                    type="button"
                    className="bg-white !text-black border"
                    onClick={closeModal}
                >
                    Cancel
                </CustomButton>
            </div>

            <div className="mt-4 text-red-600">
                Time Remaining: {formatTime(timer)}
            </div>

            {timer === 0 && (
                <div
                    className="mt-3 cursor-pointer text-primary"
                    onClick={resendOTP}
                >
                    Resend OTP
                </div>
            )}

            {showUserTypeSelection && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold mb-4">Select User Type</h3>
                        {userTypes.map((ut: any, i: number) => (
                            <button
                                key={i}
                                className="w-full border p-3 rounded mb-2"
                                onClick={() =>
                                    login({
                                        userName: mobile,
                                        loginOTP: otp,
                                        userTypeId: ut.userTypeId,
                                    })
                                }
                            >
                                {ut.userType}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
