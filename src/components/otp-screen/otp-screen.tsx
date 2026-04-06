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
    <div className="myContainer !px-0">
      {/* <div className="mt-10 mb-2 md:w-[400px] max-w-screen-lg sm:w-96 mx-auto bg-white/80 p-8 rounded-xl backdrop-blur-lg border-8 border-white shadow-2xl"> */}
      <div className="mt-5 mb-2 rounded-3xl">
        <div>
          <img
            src={`${publicPathName}/logo_light.png`}
            className="h-16 mx-auto"
          />
        </div>
        <div>
          <CustomText className="text-center mb-5 mt-3.5 text-xl font-bold">
            OTP
          </CustomText>
          <CustomText className="text-center mb-5 text-sm font-base">
            We have sent the verification code to your entered mobile number
          </CustomText>
        </div>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // ✅ prevent default form submit
              onSubmit(); // ✅ call your async function manually
            }}
          >
            {isRegister ? (
              <>
                <div className="mb-1">
                  {/* <div>We have sent the verification code to your</div> */}
                  {/* <div>
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
                      // inputStyle={{
                      // border: "1px solid",
                      // borderRadius: "8px",
                      // width: "54px",
                      // height: "54px",
                      // fontSize: "12px",
                      // color: "#000",
                      // fontWeight: "400",
                      // caretColor: "blue",
                      // }}
                      //   focusStyle={{
                      //     border: "1px solid #CFD3DB",
                      //     outline: "none",
                      //   }}
                      />
                    </div>
                  </div> */}

                  <div>
                    
                    <div className="my-5 flex justify-center">
                      {/* <OtpInput
                        value={mobileOTP}
                        onChange={(otp: any) => setMobileOTP(otp)}
                        numInputs={6}
                        renderSeparator={<span className="otpInputGap"></span>}
                        renderInput={(props) => (
                          <input {...props} className="otpInput" />
                        )}
                        inputType={"text"}
                        shouldAutoFocus={true}
                      // inputStyle={{
                      // border: "1px solid",
                      // borderRadius: "8px",
                      // width: "54px",
                      // height: "54px",
                      // fontSize: "12px",
                      // color: "#000",
                      // fontWeight: "400",
                      // caretColor: "blue",
                      // }}
                      //   focusStyle={{
                      //     border: "1px solid #CFD3DB",
                      //     outline: "none",
                      //   }}
                      /> */}
                      <OtpInput
  value={mobileOTP}
  onChange={(otp: any) => setMobileOTP(otp)}
  numInputs={6}
  renderSeparator={<span className="otpInputGap"></span>}
  renderInput={(props) => <input {...props} className="otpInput" />}
  inputType={"text"}
  shouldAutoFocus={true}
/>
                    </div>
                  </div>
                </div>
                {/*<div className="mt-4 flex justify-center">
                  Email OTP - {userData?.emailOTP} ,&nbsp;&nbsp;&nbsp; Mobile
                  OTP - {userData?.mobileOTP}{" "}
                </div>*/}
              </>
            ) : (
              <>
                <div className="mb-1 ">
                  <div className="flex justify-center">
                    {/* <OtpInput
                      value={loginOTP}
                      onChange={(otp: any) => setLoginOTP(otp)}
                      numInputs={6}
                      renderSeparator={<span className="otpInputGap"></span>}
                      renderInput={(props) => (
                        <input {...props} className="otpInput" />
                      )}
                      inputType={"text"}
                      shouldAutoFocus={true}
                    /> */}
                    {/* <OtpInput
  value={loginOTP}
  onChange={handleLoginOtpChange}
  numInputs={6}
  renderSeparator={<span className="otpInputGap"></span>}
  renderInput={(props) => <input {...props} className="otpInput" />}
  inputType={"text"}
  shouldAutoFocus={true}
/> */}
<OtpInput
  value={loginOTP}
  onChange={(otp: any) => setLoginOTP(otp)}
  numInputs={6}
  renderSeparator={<span className="otpInputGap"></span>}
  renderInput={(props) => <input {...props} className="otpInput" />}
  inputType={"text"}
  shouldAutoFocus={true}
/>

                  </div>
                </div>
                {/*<div className="mt-4 flex justify-center">
                  OTP - {userData?.loginOTP}
                </div>*/}
              </>
            )}

            <div className="flex gap-5 justify-center text-center mt-6 ">
              <div onClick={(e) => e.stopPropagation()}>
                <CustomButton
                  className="w-28 bg-primary"
                  type="submit"
                  loading={loading}
                >
                  Submit
                </CustomButton>
              </div>
              <div>
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-28"
                  onClick={handleCloseOtpModel}
                  type="button"
                >
                  Cancel
                </CustomButton>
              </div>
            </div>
            <div className="text-red-600 text-center mt-4 cursor-pointer">
              Time Remaining: {formatTime(timer)}s
            </div>
            {timer === 0 && (
              <div
                className="text-other text-center mt-4 cursor-pointer"
                onClick={handleResendOTP}
              >
                Resend OTP
              </div>
            )}

            {showUserTypeSelection && (
              <div className="modal modal-open !bg-white">
                <div className="modal-box shadow-none rounded-3xl bg-white sm:w-96 md:w-[400px] max-w-screen-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-4">Select User Type</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Multiple user types found for this account. Please select how you want to login:
                    </p>

                    <div className="space-y-3">
                      {userTypes.map((userType: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleUserTypeSelection(userType)}
                          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
                          disabled={loading}
                        >
                          <div className="font-medium text-gray-800">
                            {userType.userType}
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setShowUserTypeSelection(false);
                      }}
                      className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default OTPScreen;
