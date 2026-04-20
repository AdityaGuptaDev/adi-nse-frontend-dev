"use client";

import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import { useEffect, useState } from "react";
import { FaIdCard, FaMapMarkerAlt, FaSignature, FaVideo } from "react-icons/fa";
import POI from "./KYC-steps/(components)/POI";
import DigiLocker from "./KYC-steps/(components)/DigiLocker_component";
import { getLS } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA } from "@/utils/constants";
import { MdOutlineAddAPhoto } from "react-icons/md";





function KYCInitial({ KYCFlowScreen, setKYCFlowScreen,panNumber,
  mobileNumber,   
  email,
  name}: any) {
  const [poiScreen, setPOIScreen] = useState(false)

  
  useEffect(() => {
    const user = getLS(USER_DATA);
    const isMember = getLS(ADD_MEMBER)
    const memberData = getLS(MEMBER_DATA)

    const lastKycStep = isMember
      ? memberData?.InvestorRegistration?.last_kyc_step
      : user?.InvestorRegistration?.last_kyc_step;

      console.log("")

    if (lastKycStep > 1) {
      setPOIScreen(true);
    }


  }, []);
  
  return (
    <>
    

      <div className="overflow-auto max-h-[calc(100vh-180px)]">
        {!KYCFlowScreen ? (
          <>

           

{
  poiScreen ? (
    <POI />
  ) : (
    <DigiLocker
      setPOIScreen={setPOIScreen}
      mobileNumber={mobileNumber}   // 👈 Pass mobile number here
    />
  )
}

          </>
        ) : (
          // Welcome Screen
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="max-w-4xl mx-auto p-8 text-center">
              {/* Welcome Header */}

              <div className="mb-8">
                <CustomText className="text-4xl font-bold text-[#F9FAFB] mb-4">
                  Welcome!
                </CustomText>
                <CustomText className="text-lg text-[#9CA3AF] mb-2">
                  Thank you for choosing Digital KYC.
                </CustomText>
                <CustomText className="text-lg text-[#9CA3AF] mb-2">
                  To make sure the KYC process goes smoothly,
                </CustomText>
                <CustomText className="text-lg text-[#9CA3AF]">
                  we request you to keep the following documents handy.
                </CustomText>
              </div>

              {/* Document Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Identity Proof */}
                <div className="bg-[#111111] p-6 rounded-lg shadow-md border">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaIdCard className="text-3xl text-blue-600" />
                    </div>
                  </div>
                  <CustomText className="text-xl font-semibold text-[#F9FAFB] mb-4">
                    IDENTITY PROOF
                  </CustomText>
                  <div className="text-[#9CA3AF] space-y-2">
                    <CustomText className="font-medium">Accepted Documents are</CustomText>
                    <CustomText className="text-sm">
                      <strong>PAN Card</strong> (Front side)
                    </CustomText>
                    <CustomText className="text-sm">
                      <strong>PAN DigiLocker</strong>
                    </CustomText>
                  </div>
                </div>

                {/* Address Proof */}
                <div className="bg-[#111111] p-6 rounded-lg shadow-md border">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="text-3xl text-green-600" />
                    </div>
                  </div>
                  <CustomText className="text-xl font-semibold text-[#F9FAFB] mb-4">
                    ADDRESS PROOF
                  </CustomText>
                  <div className="text-[#9CA3AF] space-y-2">
                    <CustomText className="font-medium">Accepted Documents are</CustomText>

                    <CustomText className="text-sm">
                      <strong>Aadhaar DigiLocker</strong>
                    </CustomText>
                  </div>
                </div>

                {/* Signature Scan */}
                <div className="bg-[#111111] p-6 rounded-lg shadow-md border">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaSignature className="text-3xl text-purple-600" />
                    </div>
                  </div>
                  <CustomText className="text-xl font-semibold text-[#F9FAFB] mb-4">
                    SIGNATURE SCAN
                  </CustomText>
                  <div className="text-[#9CA3AF] space-y-2">
                    <CustomText className="font-medium">Required for verification</CustomText>
                    <CustomText className="text-sm">
                      Clear signature on white paper
                    </CustomText>
                  </div>
                </div>

                {/* Video Verification */}
                <div className="bg-[#111111] p-6 rounded-lg shadow-md border">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                      <MdOutlineAddAPhoto className="text-3xl text-red-600" />
                    </div>
                  </div>
                  <CustomText className="text-xl font-semibold text-[#F9FAFB] mb-4">
                    PHOTO VERIFICATION
                  </CustomText>
                  <div className="text-[#9CA3AF] space-y-2">
                    <CustomText className="font-medium">Live Photo required</CustomText>
                    <CustomText className="text-sm">
                      Ensure good lighting and clear audio
                    </CustomText>
                  </div>
                </div>
              </div>

              {/* Let's Go Button */}
              <div className="flex justify-center">
                <CustomButton
                  onClick={() => setKYCFlowScreen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Let's Go
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default KYCInitial;
