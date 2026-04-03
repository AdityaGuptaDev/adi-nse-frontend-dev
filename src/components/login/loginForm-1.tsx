"use client";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomTab from "@/commonUI/Tab";
import CustomText from "@/commonUI/Text";
import { cookieStorageKeys, setCookieToken, storeCookieData } from "@/services/cookieStorageService";
import api from "@/utils/api";
import {
  ADMIN_INVESTER_DATA,
  FLAT_MENU,
  MENU_PREFIX,
  PROD_DATA,
  publicPathName,
  TOKEN_PREFIX,
  USER_DATA,
} from "@/utils/constants";
import { handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";
import RegisterForm from "../register/registerForm";
import OTPScreen from "../otp-screen/otp-screen";
import KYCVerification from "../partnerOnboarding/partnerOnboarding";

const loginSchema = yup.object().shape({
  // email: yup.string().required("Email is required").email("Invalid Email"),
  userName: yup.string()
    .required("This field is required")
    .test(
      "is-email-or-mobile",
      "Enter a valid email or mobile number",
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      }
    ),
  password: yup.string().required("Password is required"),
});

function LoginForm() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpenOtpModal, setIsOpenOtpModal] = useState(false);

  //adding of the new feature of login by aditya gupta-
  const [loginMode, setLoginMode] = useState<"otp" | "password">("password");
const [otpSent, setOtpSent] = useState(false);
const [otp, setOtp] = useState("");




  // const openModal = () => {
  //   modalRef.current?.showModal();
  // };

  // const closeModal = () => {
  //   modalRef.current?.close();
  // };

  const openModal = () => setIsOpenOtpModal(true);
  const closeModal = () => setIsOpenOtpModal(false);

  const tabOptions: any = [
    { id: 1, label: "Login" },
    { id: 2, label: "Sign Up" },
  ];

  const [passwordType, setpasswordType] = useState<"text" | "password">(
    "password"
  );
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [tabName, setTabName] = useState(tabOptions[0].label);
  const [userData, setUserData] = useState<any>();
  const [isNotVerify, setIsNotVerify] = useState(false);
  const [userName, setUserName] = useState<any>();
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<any>(null);

  useEffect(() => {
    if (isNotVerify) {
      openModal();
    }
  }, [isNotVerify]);

  console.log(isNotVerify, "isNotVerify")
  console.log(isOpenOtpModal, "isOpenOtpModal")

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const handleClickTab = (e: any) => {
    if (e === 1) {
      setTabName(tabOptions[0].label);
    }
    if (e === 2) {
      setTabName(tabOptions[1].label);
    }
  };

  const checkUserTypes = async (userName: string) => {
    try {
      const result: any = await api.post(`/user/check-user-types`, { userName });
      console.log("checkUserTypes result--", result);
      return result.data.data;
    } catch (error) {
      handleServerError(error);
      return null;
    }
  };

  const onSubmit = async (values: any) => {
    try {
      setLoginLoading(true);
      setUserName(values.userName);

      // First check how many user types exist for this email/mobile
      const userTypesData = await checkUserTypes(values.userName);


      if (!userTypesData) {
        setLoginLoading(false);
        return;
      }
      console.log("userTypesData.userTypesCount--", userTypesData.userTypesCount);

      // If no user types found, show error
      if (userTypesData.userTypesCount === 0) {
        setLoginLoading(false);
        toastAlert("error", "No user found with this email or mobile number");
        return;
      }

      // If multiple user types found, show selection
      // if (userTypesData.userTypesCount > 1) {
      //   setUserTypes(userTypesData.userTypes);
      //   setShowUserTypeSelection(true);
      //   setLoginLoading(false);
      //   return;
      // }
      if (userTypesData.userTypesCount > 1) {
        const values = getValues();
        let validUserTypes: any[] = [];

        for (let ut of userTypesData.userTypes) {
          let loginData = {
            ...values,
            userTypeId: ut.userTypeId,
          };

          const result = await tryLoginSilently(loginData);

          if (result) {
            validUserTypes.push(ut);
          }
        }

        if (validUserTypes.length === 0) {
          setLoginLoading(false);
          toastAlert("error", "Incorrect Password entered !");
          return;
        }

        if (validUserTypes.length === 1) {
          handleUserTypeSelection(validUserTypes[0]);
          return;
        }

        setUserTypes(validUserTypes);
        setShowUserTypeSelection(true);
        setLoginLoading(false);
        return;
      }



      // If only one user type, proceed with login
      const loginData = {
        ...values,
        userTypeId: userTypesData.userTypes[0].userTypeId
      };

      const result: any = await api.post(`/user/login`, loginData);

      let resData: any = result.data.data;


      if (resData) {

        // setEmail(resData.user.email);

        if (
          !resData.user.isEmailOTPVerified &&
          !resData.user.isMobileOTPVerified
        ) {
          let body = {
            userName: userName,
          };

          let result: any = await api.post("/user/login-otp", body);
          if (result.data.data) {
            reset();
            setLoginLoading(false);
            toastAlert("error", "Please verify email or mobile after login");
            setUserData(result.data.data);
            setIsNotVerify(true);
            openModal();
          }
        } else {
          console.log(result.data.data, 'result.data.data');
          setLoginLoading(false);
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
            router.push("/dashboards");
          }
        }
      }
    } catch (error) {
      setLoginLoading(false);
      handleServerError(error);
    }
  };

  const handleUserTypeSelection = async (userType: any) => {
    try {
      setLoginLoading(true);
      setSelectedUserType(userType);
      setShowUserTypeSelection(false);


      const values = getValues();
      const loginData = {
        ...values,
        userTypeId: userType.userTypeId
      };

      const result: any = await api.post(`/user/login`, loginData);
      let resData: any = result.data.data;

      if (resData) {
        if (
          !resData.user.isEmailOTPVerified &&
          !resData.user.isMobileOTPVerified
        ) {
          let body = {
            userName: userName,
          };

          let result: any = await api.post("/user/login-otp", body);
          if (result.data.data) {
            reset();
            setLoginLoading(false);
            toastAlert("error", "Please verify email or mobile after login");
            setUserData(result.data.data);
            setIsNotVerify(true);
            openModal();
          }
        } else {
          setLoginLoading(false);
          setLS(TOKEN_PREFIX, result.data.data.token);
          setLS(MENU_PREFIX, result.data.data.menu || []);
          setLS(USER_DATA, { ...result.data.data.user, ...result.data.data.meta });
          setLS(ADMIN_INVESTER_DATA, result.data.data.findFilterData);
          setLS(PROD_DATA, result.data.data);
          setCookieToken(result.data.data.token);
          storeCookieData(cookieStorageKeys.INIT_PATH, result.data.data.initPath);

          toastAlert("success", "Logged In successfully");
          console.log("inital path", result)
          if (result.data.data.initPath) {
            router.push(`/${result.data.data.initPath}`);
          } else {
            router.push("/dashboards");
          }
        }
      }
    } catch (error) {
      setLoginLoading(false);
      handleServerError(error);
    }
  };

  const tryLoginSilently = async (loginData: any) => {
    try {
      const response = await api.post(`/user/login`, loginData, {
        validateStatus: () => true, // prevents redirect/reload
      });

      if (response.status === 200) return response.data.data;
      return null; // invalid password
    } catch (e) {
      return null;
    }
  };


  // const handleLoginOTP = async () => {
  //   try {
  //     let userName = getValues("userName");
  //     setUserName(userName);

  //     if (!userName) {
  //       return toastAlert("error", "Please enter username");
  //     }

  //     let body = {
  //       userName: userName,
  //     };

  //     let result: any = await api.post("/user/login-otp", body);

  //     let resData: any = result.data.data;
  //     console.log(resData, 'resData')

  //     if (resData) {
  //       if (!resData.isEmailOTPVerified && !resData.isMobileOTPVerified) {
  //         setValue("userName", "");
  //         setUserData(resData);
  //         setIsNotVerify(true);
  //         openModal();
  //         toastAlert("error", "Please verify email or mobile after login");
  //       } else {
  //         setUserData(resData);
  //         openModal();
  //       }
  //     }
  //   } catch (error: any) {
  //     setLoginLoading(false);
  //     handleServerError(error);
  //   }
  // };

  const handleLoginOTP = async () => {
  try {
    const userName = getValues("userName");

    if (!userName) {
      return toastAlert("error", "Please enter mobile number");
    }

    const result: any = await api.post("/user/login-otp", { userName });

    if (result.data.data) {
      setUserData(result.data.data);
      setOtpSent(true);
      toastAlert("success", "OTP sent successfully");
    }
  } catch (error) {
    handleServerError(error);
  }
};


  return (
    <>
      <div className="myContainer w-full !px-0 !mx-3">
        <div className="mt-10 mb-2 w-full sm:w-96 md:w-[400px] max-w-screen-lg mx-auto bg-white/80 p-8 rounded-3xl backdrop-blur-lg border-8 border-white shadow-2xl">
          <div className="relative">
            <Link href="/" className="absolute -top-2 -left-2 text-gray-500 hover:text-primary transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <img
              src={`${publicPathName}/logo_light.png`}
              className="h-16 mx-auto"
            />
          </div>


          <div>
            <div>
             <CustomText className="text-center mb-5 text-xl font-bold">
  Welcome
</CustomText>

<div className="flex justify-center mb-6">
  <div className="flex bg-gray-100 rounded-xl p-1 w-full">
    <button
      type="button"
      onClick={() => {
        setLoginMode("otp");
        setOtpSent(false);
        setOtp("");
      }}
      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
        loginMode === "otp"
          ? "bg-white shadow text-primary"
          : "text-gray-500"
      }`}
    >
      Login with Code
    </button>

    <button
      type="button"
      onClick={() => setLoginMode("password")}
      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
        loginMode === "password"
          ? "bg-white shadow text-primary"
          : "text-gray-500"
      }`}
    >
      Login with Password
    </button>
  </div>
</div>

              {/* <CustomText className="text-center mb-5 text-sm font-base">
              Enter your detail to procced further
            </CustomText> */}
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
               {/* MOBILE INPUT (COMMON) */}
  <CustomInput
    label="Mobile Number"
    {...register("userName")}
    required
    placeholder="Enter Mobile Number"
    error={errors.userName?.message}
  />

  {/* PASSWORD MODE */}
  {loginMode === "password" && (
    <>
      <CustomInput
        required
        type={passwordType}
        label="Password"
        placeholder="Password"
        {...register("password")}
        error={errors.password?.message}
        icon={
          passwordType === "password" ? (
            <FaEyeSlash onClick={() => setpasswordType("text")} />
          ) : (
            <FaEye onClick={() => setpasswordType("password")} />
          )
        }
      />

      <div className="text-end mt-2">
        <CustomText
          className="inline text-blue-600 cursor-pointer hover:underline"
          onClick={() => router.push("/forgot-password")}
        >
          Forgot Password?
        </CustomText>
      </div>

      <CustomButton
        className="mt-6 w-full"
        type="submit"
        loading={loginLoading}
      >
        Login
      </CustomButton>
    </>
  )}
  {loginMode === "otp" && (
  <>
    {!otpSent ? (
      <CustomButton
        type="button"
        className="mt-6 w-full"
        onClick={handleLoginOTP}
      >
        Send OTP
      </CustomButton>
    ) : (
      <>
        <CustomInput
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6 digit OTP"
        />

        <CustomButton
          className="mt-6 w-full"
          type="button"
          onClick={() => openModal()}
        >
          Verify & Login
        </CustomButton>
      </>
    )}
  </>
)}

            </form>
            {isOpenOtpModal && (
              <div id="my_modal" className="modal modal-open !bg-white" ref={modalRef} >
                <div className="modal-box shadow-none rounded-3xl bg-white sm:w-96 md:w-[400px] max-w-screen-lg" onClick={(e) => e.stopPropagation()}>
                 <OTPScreen
  userData={userData}
  setUserData={setUserData}
  closeModal={closeModal}
  isRegister={isNotVerify ? true : false}
  userName={userName}
/>

                </div>
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
                          disabled={loginLoading}
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
                        setLoginLoading(false);
                      }}
                      className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                      disabled={loginLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>


        </div>
      </div>
    </>
  );
}

export default LoginForm;
