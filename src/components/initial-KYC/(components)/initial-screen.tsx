"use client";

import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import CustomButton from "@/commonUI/Button";

import CustomInput from "@/commonUI/Input";

import { useRouter } from "next/navigation";

import { Shield } from "lucide-react";
import OTPInput from "react-otp-input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";

import api from "@/utils/api";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, PAN_NO_REGEX, USER_DATA } from "@/utils/constants";
import AccountContext from "@/context/AccountContext/Account.context";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { fetchDecentroByMobile } from "@/api/kyc";
import CustomTextarea from "@/commonUI/TextArea";
import { getInvestor, getUserByInvestorId } from "@/api/holder";

// ---------------------
// Types
// ---------------------
interface Props {
    setKYCSFlow: (v: boolean) => void;
    setKYCFlowScreen: (v: boolean) => void;
}

interface ListingsShape {
    tax_status?: Array<{ id: string; status: string }>;
}

// ---------------------
// Validation schema
// ---------------------
const schema = yup.object().shape({
    pan_no: yup
        .string()
        .trim()
        .required("PAN No. is required")
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN Number")
        .transform((value) => (value ? value.toUpperCase().replace(/\s/g, "") : value)),
    pincode: yup
        .string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
    district: yup.string().required("District is required"),
    nameAsPan: yup.string().required("Name is required"),
    dob: yup.string().required("Date of birth is required"),
    address: yup.string().required("Address is required"),
    state_id: yup.string().required("State is required"),
    country_id: yup.string().required("Country is required"),
    tax_status: yup.string().required("Tax Status is required"),
    aadhaar_no: yup.string().required("Aadhaar is required").matches(/^[0-9]{12}$/, "Aadhaar must be 12 digits"),
    ismember: yup.boolean().optional(),


    email: yup.string().when("ismember", (ismember, schema) =>
        ismember
            ? schema.required("Email is required for members").email("Invalid email format")
            : schema.notRequired()
    ),

    mobile: yup.string().when("ismember", (ismember, schema) =>
        ismember
            ? schema.required("Mobile is required for members").matches(/^[0-9]{10}$/, "Mobile must be 10 digits")
            : schema.notRequired()
    ),

    passwd: yup.string().when("ismember", (ismember, schema) =>
        ismember
            ? schema.required("Password is required for members").min(6, "Password must be at least 6 characters")
            : schema.notRequired()
    ),
});

// ---------------------
// Helper validators
// ---------------------
const isValidPANFormat = (pan?: string) => {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan.toUpperCase());
};

// ---------------------
// Component
// ---------------------
export default function InitialScreen({ setKYCSFlow, setKYCFlowScreen }: Props) {
    const router = useRouter();
    const modalRef = useRef<HTMLDialogElement | null>(null);

    // local UI state
    const [KYCValidated, setKYCValidated] = useState(false);
    const [annualFund, setAnnualFund] = useState<"<50K" | ">=50K">("<50K");
    const [kycStatus, setKycStatus] = useState(false);
    const [KYCData, setKYCData] = useState<any>({});
    const [kycVerifyLoader, setKycVerifyLoder] = useState(false);
    const [userType, setUserType] = useState<string | undefined>(undefined);
    const [verifyLoader, setVerifyLoader] = useState(false);
    const [isMember, setAddMember] = useState(false);
    const [userData, setUserData] = useState<any>({});
    const [nameDisable, setNameDisable] = useState(false);
    const [panCheckLoader, setPanCheckLoader] = useState(false);
    const [panStatusVerified, setPanStatusVerified] = useState(false);
    const [panDisabled, setPanDisabled] = useState(false);
    const [taxStatus, setTaxStatus] = useState<string>("");
    const [showPanAlert, setShowPanAlert] = useState(false);
    const [panAlertMessage, setPanAlertMessage] = useState("");
    const [aadhaarCheckLoader, setAadhaarCheckLoader] = useState(false);
    const [aadhaarVerified, setAadhaarVerified] = useState(false);
    const [aadhaarOtpResponse, setAadhaarOtpResponse] = useState<any>(null);
    const [addressUploadLoader, setAddressUploadLoader] = useState(false);
    const [aadhaarOTP, setAadhaarOTP] = useState<string | null>(null);
    const [otpVerifyLoader, setOtpVerifyLoader] = useState(false);
    const [dob, setDob] = useState<string>("");
    const [countryList, setCountryList] = useState<any>([]);
    const [stateList, setStateList] = useState<any>([]);
    const [investorData, setInvestorData] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { setKycDetails, kyc_details, setListings, listings } = useContext<any>(AccountContext);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        getValues,
        trigger,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            pan_no: "",
            address: "",
            country_id: "",
            state_id: "",
            pincode: "",
            district: "",
            nameAsPan: "",
            dob: "",
            tax_status: "",
            aadhaar_no: "",
            email: "",
            mobile: "",
            passwd: "",
            ismember: isMember,
        },
        mode: "onChange",
    });

    const panValue = watch("pan_no");


    // initial load
    useEffect(() => {
        const user: any = getLS(USER_DATA);
        const memberFlag: any = getLS(ADD_MEMBER);
        console.log("Initial KYC load user:", memberFlag);
        if (memberFlag) setAddMember(memberFlag);
        if (user) setUserData(user);
        console.log("Initial KYC load user data:", user);

        const getMemeber = getLS("INVESTOR_USER_ID");
        if (getMemeber) setInvestorData(getMemeber);
        getCountry();

        if (!getMemeber) {

            if (
                !(user?.InvestorRegistration?.last_kyc_step === null ||
                    user?.InvestorRegistration?.last_kyc_step === 1)
            ) {
                router.push('investor-onboarding');
            }
        } else {
            getUserByInvestorId(getMemeber).then((res) => {
                if (res?.data?.data) {
                    // console.log("Member KYC Data:", res.data.data);
                    const result = res.data.data;
                    console.log("Member KYC Data Result:", result);
                    // setKYCData(res.data.data);
                    setUserData(res.data.data);

                    setLS("INVESTOR_DATA", res.data.data);
                    if (
                        !(result?.InvestorRegistration?.last_kyc_step === null ||
                            result?.InvestorRegistration?.last_kyc_step === 1)
                    ) {
                        console.log("Redirecting to onboarding...");
                        router.push('investor-onboarding');
                    }
                }
            });
        }


        // prefetch listings
        (async () => {
            try {
                const res = await api.get(`/kyc/on-boarding-listings`);
                if (res?.data?.data) {
                    const list = res.data.data as ListingsShape;
                    setListings((prev: any) => ({ ...(prev || {}), ...(list || {}) }));
                    if (list?.tax_status?.length) {
                        setValue("tax_status", list.tax_status[0].id);
                        setTaxStatus(list.tax_status[0].status);
                    }
                }
            } catch (err) {
                handleServerError(err);
            }
        })();

    }, [setListings, setValue]);

    useEffect(() => {
        if (panValue && panStatusVerified) {
            setPanStatusVerified(false);
            setPanDisabled(false);
        }
    }, [panValue]);


    const getCountry = async () => {
        try {
            let country = await api.get(`/country/getAllCountry`);

            if (country?.data?.data) {
                setCountryList(country?.data?.data);
                const india = country?.data?.data.find(
                    (c: any) => c.name.toLowerCase() === "india"
                );
                if (india) {
                    setValue("country_id", india.id);
                    await getStateList(india.id);

                }
            }
        } catch (error) {
            handleServerError(error);
        }
    };

    const getStateList = async (countryId: any) => {
        try {
            let state = await api.get(`/state/getAllStateByCountry/${countryId}`);
            if (state?.data?.data) {
                setStateList(state?.data?.data);
                return state?.data?.data;
            }
            return [];
        } catch (error) {
            handleServerError(error);
            return [];
        }
    };

    const validatePAN = (pan?: string): boolean => {
        if (!pan) {
            setPanAlertMessage("Please enter PAN number first");
            setShowPanAlert(true);
            return false;
        }
        if (!isValidPANFormat(pan)) {
            setPanAlertMessage("Invalid PAN format. Must be 10 characters: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)");
            setShowPanAlert(true);
            return false;
        }

        return true;
    };

    const handleKYCVerify = () => {
        setVerifyLoader(false);
        setKYCValidated((prev) => !prev);
        // fill values from KYCData (if available)
        if (KYCData) {
            setValue("pan_no", KYCData.pan_no || "");
            setValue("pincode", KYCData.pincode || "");
            setValue("nameAsPan", KYCData.nameAsPan || "");
            setValue("dob", KYCData.dob || "");
            setValue("district", KYCData.district || "");
            setValue("tax_status", KYCData.tax_status || watch("tax_status"));
        }
    };

    const handleNexttab = async () => {
        try {
            setKycVerifyLoder(true);
            const isValid = isMember
                ? await trigger(["email", "mobile", "passwd"])
                : true;

            const basicValid = await trigger([
                "pan_no", "pincode", "district", "nameAsPan",
                "dob", "address", "state_id", "country_id",
                "tax_status", "aadhaar_no"
            ]);

            if (!basicValid || !isValid) {
                toastAlert("error", "Please fix the errors in the form before proceeding.");
                return;
            }

            // build payload from KYCData + form values
            const form = getValues();

            const payload: any = {
                ...KYCData,
                ...form,
                isMember,
                investor_id: !isMember ? userData?.InvestorRegistration?.id : null,
                group_leader_id: isMember ? userData?.InvestorRegistration?.id : 0,
                user_type: userType,
                user_id: getLS("INVESTOR_USER_ID") || userData.id,
                dob: form.dob || KYCData.dob,
                kycStatus: kycStatus,
                annualFund,
                rm_id: userData?.partner?.regId ? userData?.partner?.rm_id : userData?.RM?.id || null,
                partner_id: userData?.partner?.regId || null,
            };

            console.log("KYC Payload:", payload);


            const res = await api.post(`/kyc/create_kyc_investor`, payload);
            if (res?.data?.data) {
                toastAlert("success", res.data.msg + "KYC created");
                let updatedPoa = await api.post(`/kyc/update-address`, payload);

                router.push('investor-onboarding')
                //setKYCSFlow(true);
                const newKyc = res.data.data.newKyc;
                if (isMember) setLS(MEMBER_DATA, { InvestorRegistration: newKyc });
                else {
                    userData.InvestorRegistration = newKyc;
                    setLS(USER_DATA, userData);
                }
                if (newKyc?.isKYCDone) setKYCFlowScreen(false);
            }
        } catch (err) {
            handleServerError(err);
        } finally {
            setKycVerifyLoder(false);
        }
    };

    const handleCheckPanStatus = async () => {
        const pan = getValues("pan_no");
        if (!validatePAN(pan)) return;

        try {
            setPanCheckLoader(true);
            setNameDisable(false);

            const res = await api.post(`/kyc/checkPANStatus`, { pan_no: pan.toUpperCase(), taxStatus });
            if (res?.data?.data) {
                setPanStatusVerified(true);
                setPanDisabled(true);
                toastAlert("success", res.data.msg || "PAN status checked successfully");
                const data = res.data.data;
                if (data?.User_kycName) {
                    setValue("nameAsPan", data.User_kycName);
                    setKycStatus(Boolean(data.kycStatus));
                    setNameDisable(true);
                }
            }
        } catch (err) {
            setPanStatusVerified(false);
            handleServerError(err);
        } finally {
            setPanCheckLoader(false);
        }
    };

    const handleEditPan = () => {
        setPanDisabled(false);
        setPanStatusVerified(false);
    };

    const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (value.length > 10) value = value.slice(0, 10);
        setValue("pan_no", value, { shouldValidate: true });

        if (panStatusVerified) {
            setPanStatusVerified(false);
            setPanDisabled(false);
        }
    };

    // Submit handler from "Initiate" button
    const onSubmit = async (values: any) => {
        try {
            setKycVerifyLoder(true);
            const res = await api.post(`/kyc/checkKYCStatus`, values);
            if (res?.data?.data) {
                toastAlert("success", res.data.msg || "KYC status fetched");
                setKycStatus(Boolean(res.data.data.kycstatus));
                setKYCData({ ...res.data.data, ...values });
                setKycDetails({ ...kyc_details, pan_no: values?.pan_no });
                setKYCValidated(true);
                reset();
            }
        } catch (err) {
            handleServerError(err);
        } finally {
            setKycVerifyLoder(false);
        }
    };

    // Aadhaar verification flow
    const handleCheckAadhaar = async () => {
        const aadhaar = getValues("aadhaar_no");
        if (!aadhaar || aadhaar.length !== 12) {
            toastAlert("error", "Please enter valid 12-digit Aadhaar");
            return;
        }

        try {
            setAadhaarCheckLoader(true);
            const payload: any = { aadhaar, investor_id: userData?.InvestorRegistration?.id };
            const data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);
            if (data?.data) {
                setAadhaarOtpResponse(data.data.data);
                setIsModalOpen(true); // Open modal only after successful OTP send
                toastAlert("success", data.data.msg || "OTP sent to Aadhaar linked mobile");
            }
        } catch (err) {
            handleServerError(err);
        } finally {
            setAadhaarCheckLoader(false);
        }
    };

    const reSendOtp = async () => {
        try {
            const payload: any = { aadhaar: getValues("aadhaar_no"), investor_id: userData?.InvestorRegistration?.id };
            const data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);
            if (data?.data) {
                setAadhaarOtpResponse(data.data.data);
                toastAlert("success", data.data.msg || "OTP resent");
            }
        } catch (err) {
            handleServerError(err);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAadhaarOTP(null);
    };

    const onhandleOtpSubmit = async () => {
        if (!aadhaarOTP) {
            toastAlert("error", "Please enter OTP");
            return;
        }
        setOtpVerifyLoader(true);
        try {
            const payload = {
                otp: aadhaarOTP,
                investor_id: userData?.InvestorRegistration?.id,
                aadhaar: getValues("aadhaar_no"),
                ref_id: aadhaarOtpResponse?.ref_id,
            };
            const data = await api.post(`/cashfree/aadhaar-otp-verification`, payload);
            const result = data?.data?.data;

            // Set Country
            const selectedCountry = countryList.find(
                (country: any) => country.name === result.split_address.country
            );

            if (selectedCountry) {
                setValue("country_id", selectedCountry.id, { shouldValidate: true });

                // Fetch states for the selected country
                const response = await api.get(`/state/getAllStateByCountry/${selectedCountry.id}`);
                if (response?.data?.data) {
                    const states = response.data.data;
                    setStateList(states);

                    // Find the state object by name
                    const selectedState = states.find(
                        (state: any) => state.name === result.split_address.state
                    );

                    if (selectedState) {
                        setValue("state_id", selectedState.id, { shouldValidate: true });
                    }
                }
            }

            setValue("pincode", result.split_address.pincode, { shouldValidate: true });
            setValue("district", result.split_address.dist, { shouldValidate: true });
            const dobParts = result.dob.split("-");

            const formattedDOB = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
            setValue("dob", formattedDOB, { shouldValidate: true });
            setValue("address", result.address, { shouldValidate: true });


            if (data?.data) {
                closeModal();
                toastAlert("success", data.data.msg || "Aadhaar verified");
            }
        } catch (err) {
            handleServerError(err);
        } finally {
            setOtpVerifyLoader(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-[#111111] p-6 md:p-8 rounded-xl border border-[#2A2A2A] shadow-xl">
            <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent mb-2">Identity Verification</h1>
                <p className="text-sm text-[#9CA3AF]">Securely verify your PAN or Aadhaar to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}

                <div>

                    {isMember &&
                        <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Email Address <span className="text-[#F59E0B]">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    {...register("email")}
                                    value={watch("email") || ""}
                                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Mobile Number <span className="text-[#F59E0B]">*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Your mobile number"
                                    {...register("mobile")}
                                    value={watch("mobile") || ""}
                                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                />
                                {errors.mobile && <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p>}
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Password <span className="text-[#F59E0B]">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    {...register("passwd")}
                                    value={watch("passwd") || ""}
                                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                />
                                {errors.passwd && <p className="mt-1 text-xs text-red-400">{errors.passwd.message}</p>}
                            </div>
                        </div>
                    }
                    <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
                        <div className="w-full md:w-1/4">
                            <CustomReactSelect
                                label="Tax Status"
                                items={listings?.tax_status}
                                required
                                bindValue="id"
                                bindName="status"
                                value={watch("tax_status")}
                                {...register("tax_status")}
                                onChange={(e: any) => {
                                    setValue("tax_status", e.id, { shouldValidate: true });
                                    setTaxStatus(e.status);
                                }}
                                error={errors.tax_status?.message}
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Aadhaar Number <span className="text-[#F59E0B]">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter 12-digit Aadhaar Number"
                                    {...register("aadhaar_no")}
                                    maxLength={12}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue("aadhaar_no", e.target.value.replace(/\D/g, ""))}
                                    className="flex-1 px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleCheckAadhaar}
                                    disabled={aadhaarCheckLoader}
                                    className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {aadhaarCheckLoader ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                            {errors.aadhaar_no && <p className="mt-1 text-xs text-red-400">{errors.aadhaar_no.message}</p>}
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Date of Birth <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="date"
                                {...register("dob")}
                                value={watch("dob") || ""}
                                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            />
                            {errors.dob && <p className="mt-1 text-xs text-red-400">{errors.dob.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                PAN <span className="text-[#F59E0B]">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter PAN (e.g., ABCDE1234F)"
                                    {...register("pan_no")}
                                    onChange={handlePanChange}
                                    disabled={panDisabled}
                                    maxLength={10}
                                    className="flex-1 px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50"
                                />
                                {!panDisabled ? (
                                    <button
                                        type="button"
                                        onClick={handleCheckPanStatus}
                                        disabled={panCheckLoader || panDisabled || !!errors.pan_no}
                                        className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {panCheckLoader ? "Checking..." : "Check"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEditPan}
                                        className="px-4 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors whitespace-nowrap"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {errors.pan_no && <p className="mt-1 text-xs text-red-400">{errors.pan_no.message}</p>}
                            {panValue && !errors.pan_no && (
                                <p className="text-xs text-[#10B981] mt-1">✓ Valid PAN format</p>
                            )}
                        </div>

                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Name As PAN <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                {...register("nameAsPan")}
                                disabled={nameDisable}
                                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50"
                            />
                            {errors.nameAsPan && <p className="mt-1 text-xs text-red-400">{errors.nameAsPan.message}</p>}
                        </div>
                    </div>

                    <div className="w-full mb-4">
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                            Address <span className="text-[#F59E0B]">*</span>
                        </label>
                        <textarea
                            placeholder="Input address"
                            {...register("address")}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
                        <div className="w-full md:w-1/4">
                            <CustomReactSelect
                                label="Country"
                                items={countryList}
                                required
                                bindValue="id"
                                bindName="name"
                                value={watch("country_id")}
                                {...register("country_id")}
                                onChange={async (e: any) => {
                                    setValue("country_id", e.id, { shouldValidate: true });
                                }}
                                error={errors.country_id?.message}
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <CustomReactSelect
                                label="State"
                                items={stateList}
                                required
                                placeholder="Select State"
                                bindValue="id"
                                bindName="name"
                                value={watch("state_id")}
                                onChange={(e: any) => {
                                    setValue("state_id", e.id, { shouldValidate: true });
                                }}
                                error={errors.state_id?.message}
                            />
                        </div>
                        <div className="w-full md:w-1/5">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Pin Code <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="Pin Code"
                                {...register("pincode")}
                                maxLength={6}
                                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            />
                            {errors.pincode && <p className="mt-1 text-xs text-red-400">{errors.pincode.message}</p>}
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                District <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="District"
                                {...register("district")}
                                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            />
                            {errors.district && <p className="mt-1 text-xs text-red-400">{errors.district.message}</p>}
                        </div>
                    </div>
                    <div className="sm:mt-6 md:col-span-2 flex gap-4">
                        <div className="ml-auto">
                            <button
                                type="button"
                                onClick={handleNexttab}
                                disabled={!panStatusVerified || kycVerifyLoader}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {kycVerifyLoader ? "Processing..." : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Aadhaar OTP modal - Only shows when isModalOpen is true */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full border border-[#2A2A2A] p-6">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onhandleOtpSubmit();
                        }}>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-[#F9FAFB]">Enter OTP</h3>
                                <p className="text-sm text-[#9CA3AF] mt-1">Please enter the OTP sent to your Aadhaar linked mobile</p>
                            </div>
                            <div className="my-5 flex justify-center">
                                <OTPInput
                                    value={aadhaarOTP || ""}
                                    onChange={(otp: string) => setAadhaarOTP(otp)}
                                    numInputs={6}
                                    renderSeparator={<span className="mx-2" />}
                                    renderInput={(props) => (
                                        <input
                                            {...props}
                                            className="w-12 h-12 text-center text-xl font-semibold border border-[#2A2A2A] rounded-lg bg-[#1F1A1A] text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                        />
                                    )}
                                    inputType="text"
                                    shouldAutoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={otpVerifyLoader}
                                className="w-full py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {otpVerifyLoader ? "Verifying..." : "Submit"}
                            </button>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={reSendOtp}
                                    className="text-[#F59E0B] hover:text-[#FBBF24] text-sm transition-colors"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAN alert modal */}
            {showPanAlert && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowPanAlert(false)}>
                    <div className="bg-[#111111] rounded-xl p-6 max-w-sm mx-4 border border-[#2A2A2A]" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">Invalid PAN</h3>
                            <p className="text-[#9CA3AF] mb-4">{panAlertMessage}</p>
                            <button onClick={() => setShowPanAlert(false)} className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
