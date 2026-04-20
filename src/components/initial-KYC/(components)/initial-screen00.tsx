"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import React, { useState, useEffect } from "react";

interface MobileToAccountRequest {
  mobile_number: string;
  investor_id: string;
}

interface BranchDetails {
  branchVerificationResponseKey: string;
  bank: string;
  ifsc: string;
  branch: string;
  centre: string;
  district: string;
  state: string;
  contact: string;
  address: string;
  imps: boolean;
  rtgs: boolean;
  neft: boolean;
  micr: string;
  city: string;
  swift: string;
  upi: boolean;
}

interface AccountData {
  upiVpa: string;
  nameAsPerBank: string;
  accountNumber: string;
  ifsc: string;
  bankReferenceNumber: string;
  payoutStatus: string;
  payoutAmount: string;
  branchDetails: BranchDetails;
}

interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: string;
  totalIncome: string;
  occupation: string;
  age: string;
}

interface PhoneInfo {
  sequence: string;
  reportedDate: string;
  typeCode: string;
  number: string;
}

interface EmailInfo {
  sequence: string;
  reportedDate: string;
  emailAddress: string;
}

interface IdentityInfo {
  panNumber: { idNumber: string; sequence: string }[];
  passportNumber: any[];
  drivingLicense: { idNumber: string; sequence: string }[];
  voterId: any[];
  aadhaarNumber: { idNumber: string; sequence: string }[];
  rationCard: any[];
  otherId: any[];
}

interface AddressInfo {
  sequence: string;
  address: string;
  state: string;
  type: string;
  postal: string;
  reportedDate: string;
}

interface FinancialServiceData {
  reportOrderNumber: string;
  personalInfo: PersonalInfo;
  phoneInfo: PhoneInfo[];
  emailInfo: EmailInfo[];
  identityInfo: IdentityInfo;
  addressInfo: AddressInfo[];
}

interface MobileToAccountResponseItem {
  source: string;
  response: {
    decentroTxnId: string;
    status: string;
    responseCode: string;
    message: string;
    data: AccountData | FinancialServiceData | any;
    responseKey: string;
  };
}

interface MobileToAccountResponse {
  data: {
    status: string;
    remark: string;
    data: MobileToAccountResponseItem[];
  };
  msg: string;
}

export const getMobileToAccountDetails = async (
  params: MobileToAccountRequest
): Promise<MobileToAccountResponseItem[]> => {
  try {
    const response = await api.post<MobileToAccountResponse>(
      '/decentro/mobile-to-account',
      params
    );
    return response.data.data.data;
  } catch (error) {
    console.error('Error fetching mobile-to-account data:', error);
    throw error;
  }
};

// Card Component for better organization
const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-sm overflow-hidden ${className}`}>
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-[#2A2A2A]">
      <h3 className="text-lg font-semibold text-[#F9FAFB] flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        {title}
      </h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Compact Field Display Component
const CompactField = ({ label, value, span = 1 }: { label: string; value: string; span?: number }) => (
  <div className={`flex flex-col gap-1 ${span > 1 ? `col-span-${span}` : ''}`}>
    <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">{label}</label>
    <div className="text-sm text-[#F9FAFB] font-medium bg-[#1F1A1A] px-3 py-2 rounded-lg border border-[#2A2A2A] min-h-[42px] flex items-center">
      {value || "N/A"}
    </div>
  </div>
);

function MobileNumberSection({ setKYCSFlow, setKYCFlowScreen }: any) {
  const [loading, setLoading] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [apiResponse, setApiResponse] = useState<MobileToAccountResponseItem[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [tempMobileNumber, setTempMobileNumber] = useState("");

  const prodUserData = getLS(USER_DATA);
  const isMember = getLS(ADD_MEMBER);
  const storedMobileNumber = prodUserData?.InvestorRegistration?.reg_mobile ?? "";

  useEffect(() => {
    setMounted(true);
    setMobileNumber(storedMobileNumber);
  }, [storedMobileNumber]);

  const extractResponseData = (response: MobileToAccountResponseItem[]) => {
    if (!response || response.length === 0) {
      return null;
    }

    const financialDataItem = response.find(item =>
      item.source === "financial_service_data_pull"
    );

    const accountDataItem = response.find(item =>
      item.source === "mobile_to_account"
    );

    const financialData = financialDataItem?.response?.data as FinancialServiceData;
    const accountData = accountDataItem?.response?.data as AccountData;

    return {
      financialData,
      accountData
    };
  };

  const extractedData = apiResponse ? extractResponseData(apiResponse) : null;

  const handleMobileEdit = () => {
    setIsEditingMobile(true);
    setTempMobileNumber(mobileNumber);
  };

  const handleMobileSave = () => {
    if (!tempMobileNumber || tempMobileNumber.length !== 10) {
      toastAlert("error", "Please enter a valid 10-digit mobile number");
      return;
    }

    setMobileNumber(tempMobileNumber);
    setIsEditingMobile(false);
    toastAlert("success", "Mobile number updated successfully");
  };

  const handleMobileCancel = () => {
    setIsEditingMobile(false);
    setTempMobileNumber(mobileNumber);
  };

  const handleSubmit = async () => {
    if (!mobileNumber) {
      toastAlert("error", "Mobile number not found");
      return;
    }

    if (mobileNumber.length !== 10) {
      toastAlert("error", "Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setApiResponse(null);
      setVerificationDone(false);

      const params: MobileToAccountRequest = {
        mobile_number: mobileNumber.toString(),
        investor_id: prodUserData?.InvestorRegistration?.id?.toString() || ""
      };

      const response = await getMobileToAccountDetails(params);

      if (!response || !Array.isArray(response)) {
        toastAlert("error", "Invalid response from server");
        return;
      }

      const hasFinancialData = response.some(item => item.source === "financial_service_data_pull");
      const hasAccountData = response.some(item => item.source === "mobile_to_account");

      if (!hasFinancialData && !hasAccountData) {
        toastAlert("error", "No verification data received");
        return;
      }

      setApiResponse(response);
      setVerificationDone(true);
      setLS('MOBILE_VERIFICATION_RESPONSE', response);
      toastAlert("success", "Mobile verification completed successfully");

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      handleServerError(error);
      toastAlert("error", "Mobile verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!apiResponse) {
      toastAlert("error", "Please complete mobile verification first");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        mobile_verification_data: apiResponse,
        isMember: isMember,
        pan_no: prodUserData?.InvestorRegistration?.pan_no,
        tax_status: prodUserData?.InvestorRegistration?.tax_status,
        investor_id: !isMember ? prodUserData?.InvestorRegistration?.id : null,
        group_leader_id: isMember ? prodUserData?.InvestorRegistration?.id : 0,
        user_type: "Urban",
        dob: prodUserData?.InvestorRegistration?.dob,
        kycStatus: true,
        annualFund: null,
        rm_id: prodUserData?.partner?.regId ? prodUserData?.partner.rm_id : prodUserData?.RM?.id ? prodUserData?.RM.id : null,
        partner_id: prodUserData?.partner?.regId ? prodUserData?.partner.regId : null,
        mobile_number: mobileNumber,
      };

      if (extractedData) {
        if (extractedData.financialData) {
          payload.verified_personal_info = extractedData.financialData.personalInfo;
          payload.verified_phone_info = extractedData.financialData.phoneInfo;
          payload.verified_email_info = extractedData.financialData.emailInfo;
          payload.verified_identity_info = extractedData.financialData.identityInfo;
          payload.verified_address_info = extractedData.financialData.addressInfo;
        }
        if (extractedData.accountData) {
          payload.verified_account_info = extractedData.accountData;
        }
      }

      let res: any = await api.post(`/kyc/create_kyc_investor`, payload);

      if (res.data.data) {
        toastAlert("success", res?.data?.msg || "KYC process continued successfully");

        setKYCSFlow(true);

        if (isMember) {
          setLS(MEMBER_DATA, {
            InvestorRegistration: res.data.data.newKyc,
            mobileVerificationData: apiResponse
          });
        } else {
          const updatedUserData = { ...prodUserData };
          updatedUserData.InvestorRegistration = res.data.data.newKyc;
          updatedUserData.mobileVerificationData = apiResponse;
          setLS(USER_DATA, updatedUserData);
        }

        if (res.data.data.newKyc.isKYCDone) {
          setKYCFlowScreen(false);
        }
      }
    } catch (error) {
      console.log(error, 'error in handleNext');
      handleServerError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1F1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[#9CA3AF]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!verificationDone ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="flex items-start justify-between max-w-7xl mx-auto mt-8">
              <div className="flex-1 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#F9FAFB]">Secure Verification</h1>
                    <p className="text-sm text-[#9CA3AF] mt-1">Bank-level security verification process</p>
                  </div>
                </div>

                {/* Mobile Number Section */}
                <div className="bg-[#111111] rounded-2xl p-6 shadow-lg border border-[#2A2A2A] mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-[#E5E7EB]">
                      Verification Mobile Number
                    </label>
                    {mobileNumber && !isEditingMobile && (
                      <button
                        onClick={handleMobileEdit}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {isEditingMobile ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <CustomInput
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={tempMobileNumber}
                            onChange={(e) => setTempMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="text-center text-lg font-semibold"
                            maxLength={10}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleMobileCancel}
                          className="px-4 py-2 text-sm font-medium text-[#E5E7EB] bg-[#1F1A1A] hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleMobileSave}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : mobileNumber ? (
                    <>
                      <div className="text-xl font-bold text-[#F9FAFB] text-center py-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
                        +91 {mobileNumber}
                      </div>
                      <p className="text-xs text-[#9CA3AF] text-center mt-2">
                        {storedMobileNumber
                          ? "Linked to your bank account for verification"
                          : "Entered mobile number for verification"
                        }
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4 text-[#9CA3AF]">
                        No mobile number found. Please add your mobile number for verification.
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <CustomInput
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={tempMobileNumber}
                            onChange={(e) => setTempMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="text-center text-lg font-semibold"
                            maxLength={10}
                          />
                        </div>
                        <button
                          onClick={handleMobileSave}
                          disabled={!tempMobileNumber || tempMobileNumber.length !== 10}
                          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#111111] rounded-xl p-4 text-center border border-[#2A2A2A] shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[#E5E7EB]">256-bit SSL</p>
                  </div>

                  <div className="bg-[#111111] rounded-xl p-4 text-center border border-[#2A2A2A] shadow-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[#E5E7EB]">RBI Compliant</p>
                  </div>

                  <div className="bg-[#111111] rounded-xl p-4 text-center border border-[#2A2A2A] shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[#E5E7EB]">Secure</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Action Panel */}
              <div className="flex-1 max-w-md">
                <div className="bg-[#111111] rounded-2xl p-8 shadow-xl border border-[#2A2A2A]">
                  {/* Consent Notice */}
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#F9FAFB] mb-2">Verification Consent</h3>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        You consent to share details for KYC verification as per RBI guidelines.
                        Your information is encrypted and processed securely.
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <CustomButton
                    className="w-full py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading || !mobileNumber || isEditingMobile}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Start Verification"
                    )}
                  </CustomButton>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[#2A2A2A]">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-[#9CA3AF]">256-bit SSL Encrypted Connection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Display - Updated Success Banner with Mobile Number */
          <div className="space-y-6">
            {/* Success Banner with Mobile Number */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white max-w-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#111111] bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Verification Successful!</h3>
                    <p className="text-green-100 text-sm">
                      Mobile Number: <span className="font-semibold text-white">+91 {mobileNumber}</span>
                    </p>
                    <p className="text-green-100 text-sm mt-1">
                      Your mobile number has been verified successfully.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">✓</div>
                  <div className="text-green-100 text-xs font-medium">Verified</div>
                </div>
              </div>
            </div>

            {/* Main Grid Layout - Cards Only */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Personal Details Card */}
              {extractedData?.financialData?.personalInfo && (
                <InfoCard title="Personal Details">
                  <div className="grid grid-cols-2 gap-4">
                    <CompactField
                      label="Full Name"
                      value={extractedData.financialData.personalInfo.fullName}
                    />
                    <CompactField
                      label="Date of Birth"
                      value={extractedData.financialData.personalInfo.dob}
                    />
                    <CompactField
                      label="Gender"
                      value={extractedData.financialData.personalInfo.gender}
                    />
                    <CompactField
                      label="Age"
                      value={extractedData.financialData.personalInfo.age}
                    />
                    <CompactField
                      label="Occupation"
                      value={extractedData.financialData.personalInfo.occupation}
                    />
                    <CompactField
                      label="Annual Income"
                      value={extractedData.financialData.personalInfo.totalIncome}
                    />
                  </div>
                </InfoCard>
              )}

              {/* Bank Details Card */}
              {extractedData?.accountData && (
                <InfoCard title="Bank Details">
                  <div className="grid grid-cols-2 gap-4">
                    <CompactField
                      label="Account Holder"
                      value={extractedData.accountData.nameAsPerBank}
                    />
                    <CompactField
                      label="Account Number"
                      value={extractedData.accountData.accountNumber}
                    />
                    <CompactField
                      label="IFSC Code"
                      value={extractedData.accountData.ifsc}
                    />
                    <CompactField
                      label="UPI VPA"
                      value={extractedData.accountData.upiVpa}
                    />
                    {extractedData.accountData.branchDetails && (
                      <>
                        <CompactField
                          label="Bank Name"
                          value={extractedData.accountData.branchDetails.bank}
                        />
                        <CompactField
                          label="Branch"
                          value={extractedData.accountData.branchDetails.branch}
                        />
                      </>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Email Information Card */}
              {extractedData?.financialData?.emailInfo && extractedData.financialData.emailInfo.length > 0 && (
                <InfoCard title="Email Information">
                  <div className="space-y-3">
                    {extractedData.financialData.emailInfo.map((email, index) => (
                      <div key={index} className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Email {email.sequence}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">{email.reportedDate}</span>
                        </div>
                        <div className="font-medium text-[#F9FAFB] text-sm">{email.emailAddress}</div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Identification Details Card */}
              {extractedData?.financialData?.identityInfo && (
                <InfoCard title="Identification Details">
                  <div className="space-y-4">
                    {extractedData.financialData.identityInfo.panNumber.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          PAN Card
                        </h4>
                        {extractedData.financialData.identityInfo.panNumber.map((pan, index) => (
                          <div key={index} className="text-lg font-mono font-bold text-blue-800">
                            {pan.idNumber}
                          </div>
                        ))}
                      </div>
                    )}

                    {extractedData.financialData.identityInfo.aadhaarNumber.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Aadhaar Card
                        </h4>
                        {extractedData.financialData.identityInfo.aadhaarNumber.map((aadhaar, index) => (
                          <div key={index} className="text-lg font-mono font-bold text-green-800">
                            {aadhaar.idNumber}
                          </div>
                        ))}
                      </div>
                    )}

                    {extractedData.financialData.identityInfo.drivingLicense.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                          </svg>
                          Driving License
                        </h4>
                        {extractedData.financialData.identityInfo.drivingLicense.map((dl, index) => (
                          <div key={index} className="text-sm font-mono font-bold text-purple-800">
                            {dl.idNumber}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Address Details Card */}
              {extractedData?.financialData?.addressInfo && extractedData.financialData.addressInfo.length > 0 && (
                <InfoCard title="Address Details" className="xl:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData.financialData.addressInfo.map((address, index) => (
                      <div key={index} className="bg-[#1F1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                        <div className="flex items-start justify-between mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Address {address.sequence}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">{address.reportedDate}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-[#9CA3AF] uppercase font-medium">Address</div>
                            <div className="text-sm font-medium text-[#F9FAFB]">{address.address}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-[#9CA3AF] uppercase font-medium">State</div>
                              <div className="text-sm font-medium text-[#F9FAFB]">{address.state}</div>
                            </div>
                            <div>
                              <div className="text-xs text-[#9CA3AF] uppercase font-medium">Postal Code</div>
                              <div className="text-sm font-medium text-[#F9FAFB]">{address.postal}</div>
                            </div>
                          </div>
                          {address.type && (
                            <div>
                              <div className="text-xs text-[#9CA3AF] uppercase font-medium">Type</div>
                              <div className="text-sm font-medium text-[#F9FAFB]">{address.type}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>

            {/* Action Section */}
            <div className="bg-[#111111] rounded-2xl shadow-lg border border-[#2A2A2A] p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#F9FAFB]">All details verified successfully</p>
                    <p className="text-sm text-[#9CA3AF]">Proceed to complete your KYC process</p>
                  </div>
                </div>
                <CustomButton
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg"
                  onClick={handleNext}
                  loading={loading}
                >
                  Continue KYC Process
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileNumberSection;