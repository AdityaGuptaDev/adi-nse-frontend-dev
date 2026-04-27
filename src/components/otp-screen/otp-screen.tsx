"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleServerError, setLS, toastAlert } from "@/utils/helpers";
import CustomButton from "@/commonUI/Button";
import OtpInput from "react-otp-input";
import CustomLabel from "@/commonUI/Label";
import CustomText from "@/commonUI/Text";
import {
  FLAT_MENU,
  MENU_PREFIX,
  PROD_DATA,
  TOKEN_PREFIX,
  USER_DATA,
  ADMIN_INVESTER_DATA,
  formatTime,
  publicPathName,
} from "@/utils/constants";
import api from "@/utils/api";
import { cookieStorageKeys, setCookieToken, storeCookieData } from "@/services/cookieStorageService";
import { useRouter } from "next/navigation";
import { Shield, Clock, X } from "lucide-react";
import { useLandingLang } from "@/i18n/landingI18n";

function OTPScreen({
  userData,
  setUserData,
  isRegister,

  closeModal,
  userName,
  partnerId,
  mobile,
  mobile_no,
  register_as,
  //register_as,
  fromAdmin
}: any) {
  const { t } = useLandingLang();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [emailOTP, setEmailOTP] = useState<any>();
  const [mobileOTP, setMobileOTP] = useState<any>();
  const [loginOTP, setLoginOTP] = useState<any>();
  const [timer, setTimer] = useState(120);   ////////  30 min
  const [intervalId, setIntervalId] = useState<any>(null);

   const [otpLoginLoading, setOtpLoginLoading] = useState<boolean>(false);
   const [mobileNumber, setMobileNumber] = useState("");


  // Same user type selection flow as login
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<any>(null);
console.log("registerAs------",register_as);
  useEffect(() => {
    if (userData) {
      setTimer(120); // Reset timer to 60 seconds
      startTimer(); // Start the timer
    }
  }, [userData]);

  useEffect(() => {
    if (timer === 0) {
      setUserData("");
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

  const checkUserTypes = async (userName: string) => {
    try {
      const result: any = await api.post(`/user/check-user-types`, { userName });
      return result.data.data;
    } catch (error) {
      handleServerError(error);
      return null;
    }
  };

  const onSubmit = async () => {
    try {
      if (loading) return;
      if (isRegister) {
        setLoading(true);

        if (
         // (!emailOTP || emailOTP.length !== 6) &&
          (!mobileOTP || mobileOTP.length !== 6)
        ) {
          setLoading(false);
          return toastAlert("error", "Invalid email or mobile otp");
        }

        // setLoading(false);
        // return;
        if (timer === 0) {
          setLoading(false);
          return toastAlert("error", "OTP Expired");
        }
        console.log("userData", userData);
        let payload = {
          //email: userData.mobile,
          mobile: userData.mobile,
          //emailOTP: emailOTP,
          mobileOTP: mobileOTP,
          partner_id:partnerId,

        };

        const result: any = await api.put(
          `/user/register-otp/${Number(userData.id)}`,
          payload
        );

        if (result.data.data) {
          setLoading(false);
          setUserData(result.data.data);
          closeModal();
          // setIsOpenOtpModal(false);
          //toastAlert("success", result.data.msg);
          console.log("mobile-",mobile);
          console.log("fromAdmin-",fromAdmin);
          console.log("registerAs-",register_as);

          if (fromAdmin===1 && register_as==="Partner") {
  router.push(`/partnerOnboarding?mobile=${mobile}&fromAdmin=${fromAdmin}`);

} 
 if (fromAdmin===1 && register_as==="BC") {
  
  router.push(`/bcOnboarding?mobile=${mobile}&fromAdmin=${fromAdmin}`);
} 
if(fromAdmin===1 && register_as==="Investor") {
  router.push(`/investorOnboarding?mobile=${mobile}&fromAdmin=${fromAdmin}`);
}
if(fromAdmin!==1 )
{
 
const mobileno=mobile_no;
console.log("mobile_no-----------+++++++",mobile_no);

   const loginOTPValue = mobileOTP; 
console.log("loginOTPValue-----------+++++++",loginOTPValue);
 setLoading(true);

        if (!loginOTPValue || loginOTPValue.length !== 6) {
          setLoading(false);
          return toastAlert("error", "Invalid Login otp");
        }

        let payload: any = {
          userName: mobileno || userData.email,
          loginOTP: loginOTPValue,
        };
        console.log("payload-----------+++++++",payload);
        console.log("userName-----------+++++++",userName);
        console.log("loginOTP-----------+++++++",loginOTP);


        const userTypesData = await checkUserTypes(payload.userName);

        console.log("userTypesData", userTypesData);

        if (!userTypesData) {
          setLoading(false);
          return;
        }

        if (userTypesData.userTypesCount === 0) {
          setLoading(false);
          toastAlert("error", "No user found with this email or mobile number");
          return;
        }
        // if (userTypesData.userTypesCount > 1) {
        //   setUserTypes(userTypesData.userTypes);
        //   setShowUserTypeSelection(true);
        //   setLoading(false);
        //   return;
        // }


       // payload.userTypeId = userTypesData.userTypes[0].userTypeId;

        console.log("Login payload:", payload);
if(register_as==="Partner"){
  payload.userTypeId = 4
}else{
  payload.userTypeId = 2;
}
//alert("inside the login")
        const result: any = await api.post(`/user/login`, payload);

        if (result.data.data) {
          setLoading(false);
          closeModal();
          // setIsOpenOtpModal(false);
          setLS(TOKEN_PREFIX, result.data.data.token);
          setLS(MENU_PREFIX, result.data.data.menu || []);
          setLS(USER_DATA, { ...result.data.data.user, ...result.data.data.meta });
          setLS(ADMIN_INVESTER_DATA, result.data.data.findFilterData);
          setLS(PROD_DATA, result.data.data);
          setCookieToken(result.data.data.token);
          storeCookieData(cookieStorageKeys.INIT_PATH, result.data.data.initPath);

         toastAlert("success", "Logged In successfully");
          if (result.data.data.initPath) {

            router.push(`/${result.data.data.initPath}`);
          } else {
            router.push("/dashboard");
          }

          //return false;
        }
  
}
  

        }
      } 
      
      
      
      else {
        setLoading(true);

        if (!loginOTP || loginOTP.length !== 6) {
          setLoading(false);
          return toastAlert("error", "Invalid Login otp");
        }

        let payload: any = {
          userName: userName || userData.email,
          loginOTP: loginOTP,
        };
        const userTypesData = await checkUserTypes(payload.userName);
        if (!userTypesData) {
          setLoading(false);
          return;
        }

        if (userTypesData.userTypesCount === 0) {
          setLoading(false);
          toastAlert("error", "No user found with this email or mobile number");
          return;
        }
        if (userTypesData.userTypesCount > 1) {
          setUserTypes(userTypesData.userTypes);
          setShowUserTypeSelection(true);
          setLoading(false);
          return;
        }


        payload.userTypeId = userTypesData.userTypes[0].userTypeId;

        const result: any = await api.post(`/user/login`, payload);

        if (result.data.data) {
          setLoading(false);
          closeModal();
          // setIsOpenOtpModal(false);
          setLS(TOKEN_PREFIX, result.data.data.token);
          setLS(MENU_PREFIX, result.data.data.menu || []);
          setLS(USER_DATA, { ...result.data.data.user, ...result.data.data.meta });
          setLS(ADMIN_INVESTER_DATA, result.data.data.findFilterData);
          setLS(PROD_DATA, result.data.data);
          setCookieToken(result.data.data.token);
          storeCookieData(cookieStorageKeys.INIT_PATH, result.data.data.initPath);

         // toastAlert("success", "Logged In successfully");
          if (result.data.data.initPath) {

            router.push(`/${result.data.data.initPath}`);
          } else {
            router.push("/dashboard");
          }

        }
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleUserTypeSelection = async (userType: any) => {
    try {
      setLoading(true);
      setSelectedUserType(userType);
      setShowUserTypeSelection(false);

      const payload: any = {
        userName: userName || userData?.email,
        loginOTP: loginOTP,
        userTypeId: userType?.userTypeId,
      };

      const result: any = await api.post(`/user/login`, payload);
      const resData: any = result?.data?.data;

      if (resData) {
        setLoading(false);
        closeModal();
        setLS(TOKEN_PREFIX, resData.token);
        setLS(MENU_PREFIX, resData.menu || []);
        setLS(USER_DATA, { ...resData.user, ...resData.meta });
        setLS(ADMIN_INVESTER_DATA, resData.findFilterData);
        setLS(PROD_DATA, resData);
        setCookieToken(resData.token);
        storeCookieData(cookieStorageKeys.INIT_PATH, resData.initPath);

        //toastAlert("success", "Logged In successfully");
        if (resData.initPath) {
          router.push(`/${resData.initPath}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleResendOTP = async () => {
    try {

      console.log(userData, "userDatauserData")
      console.log(userName, "userNameuserName")
      let body = {
        userName: userName,
        isRegister: isRegister ? true : false,
      };
      let result = await api.post("/user/resend-otp", body);

      if (result.data.data) {
        setUserData(result.data.data);
        //toastAlert("success", result.data.msg);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

//   const handleLoginOtpChange = (otp: string) => {
//   setLoginOTP(otp);

//   if (otp.length === 6) {
//     setTimeout(() => {
//       onSubmit();
//     }, 200);
//   }
// };




useEffect(() => {
  if (isRegister && mobileOTP?.length === 6) {
    onSubmit();
  }
}, [mobileOTP]);

useEffect(() => {
  if (!isRegister && loginOTP?.length === 6) {
    onSubmit();
  }
}, [loginOTP]);


  const handleCloseOtpModel = () => {
    closeModal();
    setTimer(0);
  }

  return (
    <div className="w-full p-6">
      <div className="w-full">
        <div className="flex justify-center mb-6">
          <img
            src={`${publicPathName}/logo_light.png`}
            className="h-14 w-auto"
            alt="Logo"
          />
        </div>
        <div>
          <CustomText className="text-center mb-3 text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
            {t("otp.heading")}
          </CustomText>
          <CustomText className="text-center mb-8 text-sm text-[#9CA3AF]">
            {t("otp.subtitle")}
          </CustomText>
        </div>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-8"
          >
            {isRegister ? (
              <div className="mb-2 px-2">
                <OtpInput
                  value={mobileOTP}
                  onChange={(otp: any) => setMobileOTP(otp)}
                  numInputs={6}
                  renderSeparator={null}
                  containerStyle="flex flex-nowrap justify-center items-center gap-2"
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="otp-input-field"
                      style={{
                        width: "40px",
                        height: "48px",
                        fontSize: "20px",
                        fontWeight: 600,
                        borderRadius: "10px",
                        border: "2px solid #2A2A2A",
                        backgroundColor: "#1F1A1A",
                        color: "#F9FAFB",
                        textAlign: "center",
                        outline: "none",
                        transition: "all 0.3s ease",
                        flexShrink: 0,
                        margin: 0,
                        padding: 0,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#F59E0B";
                        e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#2A2A2A";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  )}
                  inputType={"tel"}
                  shouldAutoFocus={true}
                />
              </div>
            ) : (
              <div className="mb-2 px-2">
                <OtpInput
                  value={loginOTP}
                  onChange={(otp: any) => setLoginOTP(otp)}
                  numInputs={6}
                  renderSeparator={null}
                  containerStyle="flex flex-nowrap justify-center items-center gap-2"
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="otp-input-field"
                      style={{
                        width: "44px",
                        height: "52px",
                        fontSize: "22px",
                        fontWeight: 600,
                        borderRadius: "12px",
                        border: "2px solid #2A2A2A",
                        backgroundColor: "#1F1A1A",
                        color: "#F9FAFB",
                        textAlign: "center",
                        outline: "none",
                        transition: "all 0.3s ease",
                        margin: 0,
                        padding: 0,
                        flexShrink: 0,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#F59E0B";
                        e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#2A2A2A";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  )}
                  inputType={"tel"}
                  shouldAutoFocus={true}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[120px] px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("otp.processing")}
                  </span>
                ) : (
                  t("otp.submit")
                )}
              </button>

              <button
                type="button"
                onClick={handleCloseOtpModel}
                className="w-full sm:w-auto min-w-[120px] px-6 py-3 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:border-[#F59E0B] transition-all"
              >
                {t("otp.cancel")}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-center pt-4">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-sm text-[#9CA3AF]">{t("otp.timeRemaining")}</span>
              <span className="text-sm font-bold text-[#F59E0B]">{formatTime(timer)}s</span>
            </div>

            {timer === 0 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#F59E0B] hover:text-[#FBBF24] transition-colors font-medium text-sm"
                >
                  {t("otp.resend")}
                </button>
              </div>
            )}

            {showUserTypeSelection && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-2xl max-w-md w-full mx-4">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl text-[#F9FAFB]">Select User Type</h3>
                      <button
                        type="button"
                        onClick={() => setShowUserTypeSelection(false)}
                        className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-[#9CA3AF] mb-6">
                      Multiple user types found for this account. Please select how you want to login:
                    </p>

                    <div className="space-y-3">
                      {userTypes.map((userType: any, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleUserTypeSelection(userType)}
                          className="w-full p-4 border-2 border-[#2A2A2A] rounded-lg hover:border-[#F59E0B] hover:bg-[#1F1A1A] transition-all duration-200 text-left"
                          disabled={loading}
                        >
                          <div className="font-medium text-[#F9FAFB]">
                            {userType.userType}
                          </div>
                          <div className="text-xs text-[#9CA3AF] mt-1">
                            Login as {userType.userType}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .otp-input-field {
            width: 38px !important;
            height: 46px !important;
            font-size: 18px !important;
            margin: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .otp-input-field {
            width: 34px !important;
            height: 42px !important;
            font-size: 16px !important;
            margin: 0 !important;
          }
        }
        @media (max-width: 380px) {
          .otp-input-field {
            width: 30px !important;
            height: 38px !important;
            font-size: 14px !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default OTPScreen;
