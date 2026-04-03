"use clent";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import React, { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA, formatTime } from "@/utils/constants";
import useRegistrationStore from "./store";
import OtpInput from "react-otp-input";
import api from "@/utils/api";
import { MdEdit } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { RxCross1 } from "react-icons/rx";

const phoneRegExp = /^\d{10}$/;

const schema = yup.object().shape({
  mobile: yup
    .string()
    .matches(phoneRegExp, "Mobile No is not valid")
    .required("Mobile No is required")
    .min(10, "Invalid mobile number")
    .max(10, "Invalid mobile number")
    .required("Mobile Number is required")
    .typeError("Please enter valid Mobile number"),
  email: yup.string().email("Email is not valid").required("Email is required"),
  nameAsPan: yup.string().required("NAme is required"),
});

function MobileEmailVerify({
  setKYCSFlow,
  setKYCFlowScreen,
  setKYCValidated,
  setMobileEmailVerify,
  KYCData,
  userType,
  annualFund
}: any) {
  const [userData, setUserData] = useState<any>();
  const modalRef = useRef<HTMLDialogElement>(null);

  const [mobileVerify, setMobileVerify] = useState<any>(false);
  const [emailVerify, setEmailVerify] = useState<any>(false);
  const [otpVerifyLoader, setOtpVerifyLoader] = useState<any>(false);
  const [otpData, setOtpData] = useState<any>(false);
  const [emailOTP, setEmailOTP] = useState<any>();
  const [mobileOTP, setMobileOTP] = useState<any>();
  const [timer, setTimer] = useState(60);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [verifyLoader, setVerifyLoader] = useState<any>(false);
  const [nameDisable, setNameDisable] = useState<any>(false);
  const [isMember, setAddMember] = useState<any>(false);

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const { verifyKYC, setVerifyKYC } =
    useRegistrationStore();

  useEffect(() => {
    const user: any = getLS(USER_DATA);
    const isMember: any = getLS(ADD_MEMBER);
    if (isMember) {

      setAddMember(isMember);
    }
    setUserData(user);
    if (user) {
      setValue("mobile", user?.mobile);
      setValue("email", user?.email);
      setValue("nameAsPan", KYCData.User_kycName);
      if (KYCData.User_kycName) {
        setNameDisable(true);
      }
      setVerifyKYC({
        ...verifyKYC,
        Email: user?.email,
        Mobile: user?.mobile,
      });
    }
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      mobile: "",
      email: "",
      nameAsPan: "",
      emailFlag: false,
      mobileFlag: false,
    },
  });

  const handleNextKYCStep = () => {
    setKYCSFlow(true);
  };

  const handleBackProcess = () => {

    if (userType === "Urban") {
      setKYCValidated(false);
      setMobileEmailVerify(false);
    } else {
      setKYCValidated(true);
      setMobileEmailVerify(false);
    }

  };

  //   useEffect(() => {
  //     if (emailVerify || mobileVerify) {
  //       openModal();
  //     }
  //   }, [emailVerify, mobileVerify]);

  useEffect(() => {
    if (emailVerify || mobileVerify) {
      //   resetMobileOtpValidate({ mobileValidateOtp: "" });
      //   resetEmailOtpValidate({ emailValidateOtp: "" });
      setTimer(60); // Reset timer to 60 seconds
      startTimer(); // Start the timer
    }
  }, [emailVerify, mobileVerify]);

  useEffect(() => {
    if (timer === 0) {
      setOtpData("");
    }
  }, [timer]);

  const startTimer = () => {
    clearInterval(intervalId);
    const newIntervalId = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(newIntervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(newIntervalId); // Save the new interval ID
  };

  const handleKycDetails = async (values: any) => {
    try {
      if (values?.emailFlag) {
        if (verifyKYC?.Email === values?.email) {
          return toastAlert("error", "Email already exist");
        }
      }

      if (values?.mobileFlag) {
        if (verifyKYC?.Mobile === values?.mobile) {
          return toastAlert("error", "Mobile no. already exist");
        }
      }

      let payload: any = {
        email: verifyKYC?.Email,
        mobile: verifyKYC?.Mobile,
        emailFlag: values?.emailFlag,
        mobileFlag: values?.mobileFlag,
        reg_email: values?.email,
        reg_mobile: values?.mobile,
      };

      const res: any = await api.post(`/kyc/kyc-otp-generate`, payload);

      if (res.data.data) {
        toastAlert("success", res?.data?.msg);
        setOtpData(res?.data?.data);
        setTimer(60);
        startTimer()

        if (watch("emailFlag")) {
          setEmailVerify(true);
          openModal();
        }
        if (watch("mobileFlag")) {
          setMobileVerify(true);
          openModal();
        }
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const onhandleOtpSubmit = async () => {
    try {
      setOtpVerifyLoader(true);
      if (emailVerify) {
        if (!emailOTP || emailOTP.length !== 6) {
          setOtpVerifyLoader(false);
          return toastAlert("error", "Invalid email otp");
        }
      } else if (mobileVerify) {
        if (!mobileOTP || mobileOTP.length !== 6) {
          setOtpVerifyLoader(false);
          return toastAlert("error", "Invalid mobile otp");
        }
      }

      let payload = {
        investor_id: userData?.id,
        email: verifyKYC?.Email,
        mobile: verifyKYC?.Mobile,
        emailFlag: watch("emailFlag"),
        mobileFlag: watch("mobileFlag"),
        reg_email: watch("email"),
        reg_mobile: watch("mobile"),
        emailOTP: emailOTP,
        mobileOTP: mobileOTP,
      };

      let res: any = await api.post(`/kyc/kyc-otp-verify`, payload);

      if (res.data.data) {
        setOtpVerifyLoader(false);
        toastAlert("success", "Otp Verified");
        setMobileVerify(false);
        setEmailVerify(false);
        setValue("emailFlag", false);
        setValue("mobileFlag", false);
        setVerifyKYC({
          ...verifyKYC,
          Email: watch("email"),
          Mobile: watch("mobile"),
        });
        closeModal();
      }
    } catch (error: any) {
      setOtpVerifyLoader(false);
      handleServerError(error);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      setVerifyLoader(true);

      const payload: any = {
        ...KYCData,
        // kyc_type: !addMember ? "Registered" : "NEW",
        isMember: isMember,
        User_kycName: KYCData?.User_kycName || values.nameAsPan,
        email: values?.email,
        mobile: values?.mobile,
        pan_no: KYCData.pan_no,
        group_leader_id: isMember ? userData?.InvestorRegistration?.id : 0,
        user_type: userType,
        annualFund,
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


        // }
      }
    } catch (error) {
      setVerifyLoader(false);
      handleServerError(error);
    }
  };


  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            <div className="flex gap-1">
              <CustomInput
                label="Mobile"
                type="tel"
                placeholder="Enter Mobile"
                {...register("mobile")}
                onChange={(e: any) => {
                  setValue("mobile", e?.target?.value, {
                    shouldValidate: true,
                  });
                }}
                required
                error={errors.mobile?.message}
                disabled={!watch("mobileFlag")}
                className="flex-1"
              />
              {/* </div>
            <div className="mt-0 xl:mt-8 2xl:mt-8"> */}
              {!watch("emailFlag") ? (
                !watch("mobileFlag") ? (
                  <CustomButton className="mt-8 px-2"
                    onClick={() => {
                      setValue("mobileFlag", true);
                    }}
                  >
                    <MdEdit size={20} />
                  </CustomButton>
                ) : (
                  <div className="flex gap-1 mt-8">
                    <CustomButton className="px-2" onClick={handleSubmit(handleKycDetails)}>
                      Validate
                    </CustomButton>
                    <CustomButton className="px-2"
                      onClick={() => {
                        setValue("mobile", verifyKYC?.Mobile);
                        setValue("mobileFlag", false);
                      }}
                    >
                      <RxCross1 size={20} />
                    </CustomButton>
                  </div>
                )
              ) : null}
            </div>
            <div className="flex gap-1">
              <CustomInput
                label="Email"
                type="email"
                placeholder="Enter Email"
                {...register("email")}
                onChange={(e: any) => {
                  setValue("email", e?.target?.value, {
                    shouldValidate: true,
                  });
                }}
                required
                error={errors.email?.message}
                disabled={!watch("emailFlag")}
                className="flex-1"
              />
              {/* </div>
            <div className="mt-0 xl:mt-8 2xl:mt-8"> */}
              {!watch("mobileFlag") ? (
                !watch("emailFlag") ? (
                  <CustomButton className="mt-8 px-2"
                    onClick={() => {
                      setValue("emailFlag", true);
                    }}
                  >
                    <MdEdit size={20} />
                  </CustomButton>
                ) : (
                  <div className="flex gap-1 mt-8">
                    <CustomButton className="px-2" onClick={handleSubmit(handleKycDetails)}>
                      Validate
                    </CustomButton>
                    <CustomButton className="px-2"
                      onClick={() => {
                        setValue("emailFlag", false);
                        setValue("email", verifyKYC?.Email);
                      }}
                    >
                      <RxCross1 size={20} />
                    </CustomButton>
                  </div>
                )
              ) : null}
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
          </div>
        </div>
        <div className="border-b border-border"></div>
        <div className="p-4 flex justify-between">
          <div>
            <CustomButton className="w-32" onClick={handleBackProcess}>
              Back
            </CustomButton>
          </div>
          <div>
            <CustomButton className="w-32" type="submit" loading={verifyLoader}>
              Next
            </CustomButton>
          </div>
        </div>
      </form>

      <dialog id="my_modal" className="modal" ref={modalRef}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // ✅ prevent default form submit
                onhandleOtpSubmit(); // ✅ call your async function manually
              }}
            >
              <div className="mb-1">
                {/* <div>We have sent the verification code to your</div> */}
                {emailVerify ? (
                  <div>
                    <div className="text-center">Email address</div>
                    <div className="my-5 flex justify-center">
                      <OtpInput
                        value={emailOTP}
                        onChange={(otp: any) => setEmailOTP(otp)}
                        numInputs={6}
                        renderSeparator={<span className="otpInputGap"></span>}
                        renderInput={(props) => (
                          <input {...props} className="otpInput" />
                        )}
                        inputType={"text"}
                        shouldAutoFocus={true}
                      />
                    </div>
                  </div>
                ) : null}

                {mobileVerify ? (
                  <div>
                    <div className="text-center">Mobile Number</div>
                    <div className="my-5 flex justify-center">
                      <OtpInput
                        value={mobileOTP}
                        onChange={(otp: any) => setMobileOTP(otp)}
                        numInputs={6}
                        renderSeparator={<span className="otpInputGap"></span>}
                        renderInput={(props) => (
                          <input {...props} className="otpInput" />
                        )}
                        inputType={"text"}
                        shouldAutoFocus={true}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {/*<div className="mt-4 flex justify-center">
                {emailVerify
                  ? `Email OTP - ${otpData?.kyc_email_otp ? otpData?.kyc_email_otp : "-"
                  }`
                  : null}{" "}
                {mobileVerify
                  ? `Mobile OTP - ${otpData?.kyc_mobile_otp ? otpData?.kyc_mobile_otp : "-"
                  }`
                  : null}
              </div>*/}

              <div onClick={(e) => e.stopPropagation()}>
                <CustomButton
                  className="mt-6 w-full bg-primary"
                  type="submit"
                  loading={otpVerifyLoader}
                >
                  Submit
                </CustomButton>
              </div>
              <div className="text-red-600 text-center mt-4 cursor-pointer">
                Time Remaining: {formatTime(timer)}s
              </div>
              {timer === 0 && (
                <div
                  className="text-other text-center mt-4 cursor-pointer"
                  onClick={handleSubmit(handleKycDetails)}
                >
                  Resend OTP
                </div>
              )}
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default MobileEmailVerify;
