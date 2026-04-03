"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA } from "@/utils/constants";
import { getLS, handleServerError, setLS } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";



function DigiLocker({ setPOIScreen, mobileNumber }: any) {

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>("");
  const [singzyData, setSingzyData] = useState<any>([]);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isMember, setIsMember] = useState(false);


  useEffect(() => {
    let getUser: any = getLS(USER_DATA);
    let isMember = getLS(ADD_MEMBER)
    let memberData = getLS(MEMBER_DATA)
    if (memberData) {
      setIsMember(isMember);
      setUserData(memberData);
    } else {
      setUserData(getUser);

    }
    if (getUser) {


      let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name
      let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id
      // if (signzy_user_name) {

      //   investorLogin({ signzy_user_name, signzy_kyc_id });
      // }

    }
  }, []);

  // const investorLogin = async (values: any) => {
  //   try {
     
  //     //vedantasset_preprod_absl
  //     //yB17Fc2YJblQ

  //     console.log("fff-----------investorLogin-----------ffffghf")
  //     const payload: any = {
  //       username: 'test-20492',
  //       password: '68763af98474830016cf9410',
  //     };
  //     const res = await api.post(`/kyc/investorSignzyLogin`, payload);
  //     if (res?.data?.data) {
  //       setSingzyData(res?.data?.data);
  //     }
  //   } catch (error) {
  //     handleServerError(error);
  //   }
  // };
  const handleContinue = async () => {
  try {
    setIsLoading(true);

    console.log("Executing the API of investorSignzyLogin...");

    const payload2: any = {
      mobile_number: mobileNumber,
    };

    // 1️⃣ Call the investorSignzyLogin API
    const res2 = await api.post(`/kyc/investorSignzyLogin`, payload2);
    const signzyResp = res2?.data?.data;

    if (!signzyResp) {
      throw new Error("Failed to log in to Signzy. Missing credentials.");
    }

    // Update state (for future use), but also keep local copy
    setSingzyData(signzyResp);

    console.log("Executed investorSignzyLogin successfully", signzyResp);

    // 2️⃣ Now use this local variable directly instead of waiting for React to update
    const payload: any = {
      userToken: signzyResp?.id,
      synzyuserId: signzyResp?.userId,
    };

    // 3️⃣ Call initiate_dlConsent
    const res = await api.post(`/kyc/initiate_dlConsent`, payload);
    if (res?.data?.data) {
      setHasExistingData(true);

      // Open DigiLocker consent link
      window.open(res?.data?.data?.result?.url, "_blank");
    }

    setIsLoading(false);
  } catch (error) {
    setIsLoading(false);
    handleServerError(error);
  }
};


  // const getDetails = async () => {
  //   try {
  //     setIsLoading(true)

  //     const payload: any = {
  //       userToken: singzyData?.id,
  //       synzyuserId: singzyData?.userId,
  //       investor_id: userData?.InvestorRegistration?.id
  //     };
  //     const res = await api.post(`/kyc/getDLDetails`, payload);
  //     if (res?.data?.data) {

  //       let invester = res.data.data.investor_data;
  //       if (invester) {
  //         userData.InvestorRegistration = invester;
  //         if (isMember) {
  //           setLS(MEMBER_DATA, userData);
  //         } else {
  //           setLS(USER_DATA, userData);
  //         }
  //       }
  //       setPOIScreen(true)
  //       setIsLoading(false)

  //     }
  //   } catch (error) {
  //     setIsLoading(false)
  //     setHasExistingData(false);

  //     handleServerError(error);
  //   }
  // }


   const getDetails = async () => {
    try {
      setIsLoading(true)
      const payload: any = {
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
        investor_id: userData?.InvestorRegistration?.id
      };
      const res = await api.post(`/kyc/getDLDetails`, payload);
      if (res?.data?.data) {
        let invester = res.data.data.investor_data;
        if (invester) {
          userData.InvestorRegistration = invester;
          if (isMember) {
            setLS(MEMBER_DATA, userData);
          } else {
            setLS(USER_DATA, userData);
          }
        }
        setCurrentScreen('poi'); // Change this line
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      setHasExistingData(false);
      handleServerError(error);
    }
  }
  

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <CustomText className="text-2xl font-bold text-blue-600 mb-4">
              Aadhaar Based KYC
            </CustomText>
            <CustomText className="text-gray-700 text-base leading-relaxed">
              {hasExistingData
                ? "Your existing Aadhaar details have been found. Click below to retrieve and continue with your KYC process."
                : "Your Aadhar card must be linked to a mobile number to receive and confirm the OTP"
              }
            </CustomText>
          </div>

          {/* Logo/Image Section */}
          <div className="flex justify-center mb-6">
            <div className="w-18 h-18  rounded-lg flex items-center justify-center">
              <img
                src="./digilocker-logo.png"
                alt="Digilocker Logo"
                className="w-full h-full object-contain"
              />
          
            </div>
          </div>

          {/* How Digilocker Works Section */}
          <div className="mb-8">
            <CustomText className="text-xl font-semibold text-gray-800 mb-6">
              {hasExistingData ? "Retrieve Your Details" : "How Digilocker works"}
            </CustomText>

            <div className="space-y-4">
              {hasExistingData ? (
                // Content when data exists
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      ✓
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      Your Aadhaar details are already linked and verified in our system
                    </CustomText>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      ✓
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      Click "Get Details and Continue" to retrieve your information and proceed with KYC
                    </CustomText>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      ✓
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      This will save time by auto-filling your verified documents and information
                    </CustomText>
                  </div>
                </>
              ) : (
                // Original content when no data
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      a
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      Your KYC related documents are auto-verified using the digilocker and approved instantly
                    </CustomText>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      b
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      To access digilocker you enter your Aadhar number and confirm the OTP received on the mobile linked to the aadhaar card
                    </CustomText>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      c
                    </div>
                    <CustomText className="text-gray-700 leading-relaxed">
                      You will be redirected to the digilocker page wherein you need to provide consent for sharing document/information with CRA
                    </CustomText>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {
              !hasExistingData ? (
                <>
                  <CustomButton
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 min-w-[140px]"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Continue
                        <FaArrowRight size={14} />
                      </>
                    )}
                  </CustomButton>
                </>

              ) : (
                <>

                  <CustomButton
                    onClick={getDetails}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 min-w-[140px]"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Get Details and Continue
                        <FaArrowRight size={14} />
                      </>
                    )}
                  </CustomButton>
                </>
              )

            }





          </div>

          {/* Additional Info */}
          <div className={`mt-6 p-4 rounded-lg ${hasExistingData ? 'bg-green-50' : 'bg-blue-50'}`}>
            <CustomText className={`text-sm text-center ${hasExistingData ? 'text-green-800' : 'text-blue-800'}`}>
              <strong>Note:</strong> {hasExistingData
                ? "Your Aadhaar details are already verified and ready to use for quick KYC completion"
                : "Ensure your Aadhaar is linked to your mobile number for seamless verification"
              }
            </CustomText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigiLocker;
function setCurrentScreen(arg0: string) {
  throw new Error("Function not implemented.");
}

