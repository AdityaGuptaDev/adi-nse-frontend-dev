"use client";

import CustomButton from "@/commonUI/Button";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import { usePageTitle } from "@/context/pageTitleContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaRegAddressCard } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import MobileEmailVerify from "./MobileEmailVerify";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, PAN_NO_REGEX, USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import AccountContext from "@/context/AccountContext/Account.context";
import { FaCircleCheck } from "react-icons/fa6";
import CustomReactSelect from "@/commonUI/ReactSelect";

// Enhanced PAN validation schema
const schema = yup.object().shape({
  pan_no: yup
    .string()
    .trim()
    .required("PAN No. is required")
    .matches(PAN_NO_REGEX, "Invalid PAN Number")
    .test(
      "valid-pan-format",
      "PAN must be in format: ABCDE1234F",
      (value) => {
        if (!value) return true;
        // Additional format validation
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(value.toUpperCase());
      }
    )
    .test(
      "no-special-chars",
      "PAN should not contain special characters or spaces",
      (value) => !value || /^[A-Z0-9]+$/.test(value.toUpperCase())
    )
    .transform((value) => value ? value.toUpperCase().replace(/\s/g, '') : value), // Auto-uppercase and remove spaces
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .length(6, "Pincode must be exactly 6 digits")
    .typeError("Pincode is required"),
  district: yup.string().required("District is required"),
  nameAsPan: yup.string().required("Name is required"),
  dob: yup.string().required("Date of birth is required"),
  tax_status: yup.string().required("Tax Status is required"),
});

function InitialScreen({ setKYCSFlow, setKYCFlowScreen }: any) {
  const router = useRouter();

  const [KYCValidated, setKYCValidated] = useState<any>(false);
  const [mobileEmailVerify, setMobileEmailVerify] = useState<any>(false);
  const [annualFund, setAnnualFund] = useState<any>("<50K");
  const [kycStatus, setKycStatus] = useState<any>(false);
  const [KYCData, setKYCData] = useState<any>([]);
  const [kycVerifyLoder, setKycVerifyLoder] = useState<any>(false);
  const [userType, setUserType] = useState<any>();
  const [verifyLoader, setVerifyLoader] = useState<any>(false);
  const [isMember, setAddMember] = useState<any>(false);
  const [userData, setUserData] = useState<any>([]);
  const [nameDisable, setNameDisable] = useState<any>(false);
  const [panCheckLoader, setPanCheckLoader] = useState<any>(false);
  const [panStatusVerified, setPanStatusVerified] = useState<any>(false);
  const [panDisabled, setPanDisabled] = useState<any>(false);
  const [taxStatus, setTaxStatus] = useState<any>("");
  const [showPanAlert, setShowPanAlert] = useState(false);
  const [panAlertMessage, setPanAlertMessage] = useState("");
  const { setKycDetails, kyc_details, setListings, listings } =
    useContext<any>(AccountContext);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pan_no: "",
      pincode: "",
      district: "",
      nameAsPan: "",
      dob: "",
      tax_status: "",
    },
    mode: "onChange", // Validate on change
  });

  // Watch PAN value for real-time validation
  const panValue = watch("pan_no");

  useEffect(() => {
    const user: any = getLS(USER_DATA);
    const isMember: any = getLS(ADD_MEMBER);
    if (isMember) {
      setAddMember(isMember);
    }
    setUserData(user);

    if (userType === "Urban") {
      setAnnualFund(null);
      setValue("pan_no", KYCData.pan_no);
      setValue("pincode", KYCData.pincode);
      setValue("nameAsPan", KYCData.nameAsPan);
      setValue("dob", KYCData.dob);
      setValue("district", KYCData.district);
      setValue("tax_status", KYCData.tax_status);
    }
  }, [userType, KYCData]);

  useEffect(() => {
    if (kycStatus) {
      setAnnualFund(null);
    }
  }, [kycStatus]);

  useEffect(() => {
    listings_data();
  }, []);

  // Reset PAN status when PAN number changes
  useEffect(() => {
    if (panValue && panStatusVerified) {
      setPanStatusVerified(false);
      setPanDisabled(false);
    }
  }, [panValue]);

  const listings_data = async () => {
    try {
      const res = await api.get(`/kyc/on-boarding-listings`);
      if (res?.data?.data) {
        const list = res?.data?.data;
        setListings((prev: any) => ({
          ...prev,
          ...(list as Partial<any>),
        }));
        setValue("tax_status", list?.tax_status[0]?.id)
        setTaxStatus(list?.tax_status[0]?.status);
      }
    } catch (error) {
      handleServerError(error);
    }
  }

  // Enhanced PAN validation function
  const validatePAN = (pan: string): boolean => {
    if (!pan) return false;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const isValidFormat = panRegex.test(pan.toUpperCase());

    if (!isValidFormat) {
      setPanAlertMessage("Invalid PAN format. Must be 10 characters: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)");
      return false;
    }

    return true;
  };

  const handleKYCVerify = () => {
    setVerifyLoader(false);
    setKYCValidated((prev: any) => !prev);
    setValue("pan_no", KYCData.pan_no);
    setValue("pincode", KYCData.pincode);
    setValue("nameAsPan", KYCData.nameAsPan);
    setValue("dob", KYCData.dob);
    setValue("district", KYCData.district);
    setValue("tax_status", KYCData.tax_status);
  };

  const handleNexttab = async () => {
    // Validate PAN status before proceeding
    if (!panStatusVerified) {
      setPanAlertMessage("Please check PAN status first before proceeding");
      setShowPanAlert(true);
      return;
    }

    try {
      setVerifyLoader(true);
      const payload: any = {
        ...KYCData,
        isMember: isMember,
        pan_no: KYCData.pan_no,
        tax_status: KYCData.tax_status,
        investor_id: !isMember ? userData?.InvestorRegistration?.id : null,
        group_leader_id: isMember ? userData?.InvestorRegistration?.id : 0,
        user_type: userType,
        dob: KYCData.dob,
        kycStatus: kycStatus,
        annualFund,
        rm_id: userData?.partner?.regId ? userData?.partner.rm_id : userData?.RM?.id ? userData?.RM.id : null,
        partner_id: userData?.partner?.regId ? userData?.partner.regId : null,
      };

      if (annualFund == '<50K') {
        payload.kycStatus = true;
      }

      let res: any = await api.post(`/kyc/create_kyc_investor`, payload);

      if (res.data.data) {
        setVerifyLoader(false);
        toastAlert("success", res?.data?.msg);
        setKYCSFlow(true);
        if (isMember) {
          setLS(MEMBER_DATA, { InvestorRegistration: res.data.data.newKyc });
        } else {
          userData.InvestorRegistration = res.data.data.newKyc;
          setLS(USER_DATA, userData);
        }

        if (res.data.data.newKyc.isKYCDone) {
          setKYCFlowScreen(false);
        }
      }
    } catch (error) {
      console.log(error, 'errorerror');
      setVerifyLoader(false);
      handleServerError(error);
    }
  };

  const handleCheckPanStatus = async () => {
    const panValue = watch("pan_no");

    // Validate PAN format first
    if (!panValue) {
      setPanAlertMessage("Please enter PAN number first");
      setShowPanAlert(true);
      return;
    }

    if (!validatePAN(panValue)) {
      setShowPanAlert(true);
      return;
    }

    try {
      setPanCheckLoader(true);
      setNameDisable(false);

      let res: any = await api.post(`/kyc/checkPANStatus`, {
        pan_no: panValue.toUpperCase(),
        taxStatus: taxStatus
      });

      if (res.data.data) {
        setPanCheckLoader(false);
        setPanStatusVerified(true);
        setPanDisabled(true);
        toastAlert("success", res.data.msg || "PAN status checked successfully");
        console.log(res.data.data, 'res.data.data');

        if (res.data.data?.User_kycName) {
          setValue("nameAsPan", res.data.data.User_kycName);
          setKycStatus(res.data.data.kycStatus);
          setNameDisable(true);
        }
      }
    } catch (error) {
      setPanCheckLoader(false);
      setPanStatusVerified(false);
      handleServerError(error);
    }
  };

  const handleEditPan = () => {
    setPanDisabled(false);
    setPanStatusVerified(false);
  };

  // Enhanced PAN input handler
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Auto-format as user types (add space after 5th character for better readability)
    if (value.length > 5) {
      value = value.slice(0, 5) + value.slice(5);
    }

    setValue("pan_no", value, { shouldValidate: true });

    // Reset verification status when PAN changes
    if (panStatusVerified) {
      setPanStatusVerified(false);
      setPanDisabled(false);
    }
  };


  const onSubmit = async (values: any) => {
    try {

      setKycVerifyLoder(true);

      let res: any = await api.post(`/kyc/checkKYCStatus`, values);

      if (res.data.data) {
        setKycVerifyLoder(false);
        toastAlert("success", res.data.msg);
        setKycStatus(res.data.data.kycstatus);
        setKYCData({ ...res.data.data, ...values });
        setKycDetails({ ...kyc_details, pan_no: values?.pan_no });
        setKYCValidated((prev: any) => !prev);
        reset();
      }
    } catch (error) {
      setKycVerifyLoder(false);
      handleServerError(error);
    }
  };


  return (
    <>
      {/* PAN Alert Popup */}
      {showPanAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid PAN</h3>
              <p className="text-gray-600 mb-4">{panAlertMessage}</p>
              <button
                onClick={() => setShowPanAlert(false)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {!KYCValidated && !mobileEmailVerify ? (
        <>
          <div className="p-4 px-6 pb-6 justify-items-center">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col w-4/3 mx-auto">
                <div>
                  <CustomReactSelect
                    label="Tax Status"
                    items={listings.tax_status}
                    required
                    bindValue="id"
                    bindName="status"
                    value={watch("tax_status")}
                    {...register("tax_status")}
                    onChange={(e: any) => {
                      setValue("tax_status", e.id, {
                        shouldValidate: true,
                      });
                      setTaxStatus(e.status);
                    }}
                    error={errors.tax_status?.message}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CustomInput
                      label="PAN"
                      placeholder="Enter PAN (e.g., ABCDE1234F)"
                      {...register("pan_no")}
                      required
                      onChange={handlePanChange}
                      error={errors.pan_no?.message}
                      disabled={panDisabled}
                      maxLength={10}
                      button={
                        !panDisabled ? (
                          <CustomButton
                            type="button"
                            className="px-3 py-2 text-sm h-8"
                            onClick={handleCheckPanStatus}
                            loading={panCheckLoader}
                            disabled={panCheckLoader || panDisabled || !panValue || errors.pan_no}
                          >
                            Check
                          </CustomButton>
                        ) : (
                          <CustomButton
                            type="button"
                            className="px-3 py-2 text-sm h-8"
                            onClick={handleEditPan}
                          >
                            Edit
                          </CustomButton>
                        )
                      }
                    />
                    {panValue && !errors.pan_no && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Valid PAN format
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <CustomInput
                    label="Name As PAN"
                    placeholder="Enter Name"
                    {...register("nameAsPan")}
                    required
                    error={errors.nameAsPan?.message}
                    disabled={nameDisable}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Date of Birth As PAN"
                    placeholder="Enter DOB"
                    {...register("dob")}
                    required
                    type="date"
                    error={errors.dob?.message}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Pin Code"
                    placeholder="Pin Code"
                    type="number"
                    {...register("pincode")}
                    required
                    error={errors.pincode?.message}
                    maxLength={6}
                  />
                </div>
                <div>
                  <CustomInput
                    label="District"
                    placeholder="District"
                    {...register("district")}
                    required
                    error={errors.district?.message}
                  />
                </div>
                <div className="sm:mt-8">
                  <CustomButton
                    className="w-32"
                    type="submit"
                    loading={kycVerifyLoder}
                    disabled={!panStatusVerified || kycVerifyLoder}
                  >
                    Initiate
                  </CustomButton>
                </div>
              </div>
            </form>
          </div>
          <div className="border-b border-border"></div>
        </>
      ) : KYCValidated ? (
        <>
          <div className="p-4 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between mt-3 gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="lg:w-52">
                  <CustomText>
                    {kycStatus ? `KYC validated` : `KYC not validated`}
                  </CustomText>
                </div>
                <div className="flex justify-between items-center w-full sm:w-56 gap-2">
                  <progress
                    className="progress progress-primary bg-progressBg w-56 h-2"
                    value="0"
                    max="100"
                  ></progress>
                  <div className="text-primary cursor-pointer">
                    {kycStatus ? (
                      <FaCircleCheck className="text-green-600" size={20} />
                    ) : (
                      <IoCloseSharp size={20} />
                    )}
                  </div>
                </div>
              </div>
              <div onClick={handleKYCVerify} className="cursor-pointer text-end">
                <CustomText className="text-secondary-content">Edit</CustomText>
              </div>
            </div>
          </div>

          <div className="border-b border-border"></div>
          {!kycStatus && userType === "Rural" && (
            <>
              <div className="mt-4 p-4 px-6 pb-6">
                <div>
                  <CustomText className="text-sm">
                    Your annual investment in mutual funds will be,
                  </CustomText>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 mt-4">
                  <div>
                    <CustomCheckbox
                      label="less than 50,000"
                      checked={annualFund === "<50K"}
                      onClick={() => setAnnualFund("<50K")}
                    />
                  </div>
                  <div>
                    <CustomCheckbox
                      label="Equal And Above 50,000"
                      checked={annualFund === ">=50K"}
                      onClick={() => setAnnualFund(">=50K")}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="border-b border-border"></div>

          <div className="p-4 flex justify-between">
            <div>
              <CustomButton className="w-32" onClick={handleKYCVerify}>
                Back
              </CustomButton>
            </div>
            <div>
              <CustomButton className="w-32" onClick={handleNexttab} loading={verifyLoader} disabled={verifyLoader}>
                Next
              </CustomButton>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default InitialScreen;