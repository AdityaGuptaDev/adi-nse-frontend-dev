"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldUser,
  IdCard,
  Fingerprint,
  Building2,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Upload,
  FileText,
  Edit,
  Save,
  Shield,
  Smartphone,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PartnerService } from '@/components/partnerOnboarding/partnerService';
import { OTPState, PartnerRegistrationState, VerificationState } from '@/components/partnerOnboarding/types1';
import {
  maskAccountNumber,
  maskPhoneNumber,
  maskAadhar,
  maskPan,
  maskEmail,
  validatePhone,
  formatEmail,
  formatAadhaar,
  formatOTP
} from '@/components/partnerOnboarding/utils1';
import { toast } from 'react-toastify';
import api from '@/utils/api';
import getConfig from '@/utils/config';
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

type Screen = 'dashboard' | 'completion';

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_SCREEN: 'kyc_current_screen',
  PARTNER_DATA: 'kyc_partner_data',
  VERIFICATION_DATA: 'kyc_verification_data',
  OTP_STATE: 'kyc_otp_state',
  AADHAAR_OTP_STATE: 'kyc_aadhaar_otp_state',
  EMAIL_OTP_STATE: 'kyc_email_otp_state',
  ADDRESSES: 'kyc_addresses',
  SELECTED_ADDRESS_INDEX: 'kyc_selected_address_index',
  IS_EDITING: 'kyc_is_editing',
  REGISTRATION_STATUS: 'kyc_registration_status',
  MOBILE_NUMBER: 'kyc_mobile_number'
};

// Helper function to format dates for input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Could not parse date:', dateString);
  }
  return dateString;
};

// Helper functions for localStorage
const saveToLocalStorage = <T,>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const clearLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Custom hook for client-side only state with localStorage
function useClientState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = getFromLocalStorage(key, defaultValue);
      setState(saved);
      setIsInitialized(true);
    }
  }, [key]);

  const setClientState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as Function)(prev) : value;
      saveToLocalStorage(key, newValue);
      return newValue;
    });
  }, [key]);

  return [state, setClientState, isInitialized] as const;
}

const KYCVerification: React.FC = () => {
  const searchParams = useSearchParams();
  const mobileFromUrl = searchParams.get('mobile');
  const fromAdmin = searchParams.get('fromAdmin');
  console.log("fromAdmin:", fromAdmin);

  const [currentScreen, setCurrentScreen, isScreenInitialized] = useClientState<Screen>(
    STORAGE_KEYS.CURRENT_SCREEN,
    'dashboard'
  );
  const [selectedAddressIndex, setSelectedAddressIndex, isAddressIndexInitialized] = useClientState<number>(
    STORAGE_KEYS.SELECTED_ADDRESS_INDEX,
    0
  );
  const [isEditing, setIsEditing, isEditingInitialized] = useClientState(
    STORAGE_KEYS.IS_EDITING,
    {
      aadhaar: false,
      pan: false,
      bank: false,
      email: false,
      personal: false
    }
  );
  const [mobileNumber, setMobileNumber, isMobileInitialized] = useClientState<string>(
    STORAGE_KEYS.MOBILE_NUMBER,
    ''
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const aadhaarOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const verificationData = localStorage.getItem(STORAGE_KEYS.VERIFICATION_DATA);
  const parsedData = verificationData ? JSON.parse(verificationData) : null;
  const email = parsedData?.email?.value || "";
  console.log("Email:", email);

  const prodUserData = getLS(USER_DATA);
  const userTypeId = prodUserData?.partner?.userType_id ?? 0;

  let userType = 0;
  if (fromAdmin === "1") {
    userType = 4;
  }
  else {
    userType = prodUserData?.userTypeId ?? 0;
  }

  const loginEmailId = prodUserData?.email ?? 0;

  console.log("loginEmailId:", loginEmailId);

  const [partnerData, setPartnerData, isPartnerDataInitialized] = useClientState<PartnerRegistrationState>(
    STORAGE_KEYS.PARTNER_DATA,
    {
      name: '',
      email: '',
      phone: mobileFromUrl || '',
      address: '',
      dob: '',
      age: '',
      gender: '',
      pincode: '',
      errors: {
        phone: '',
      }
    }
  );

  const [aadhaarOtpState, setAadhaarOtpState, isAadhaarOtpStateInitialized] = useClientState(
    STORAGE_KEYS.AADHAAR_OTP_STATE,
    {
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: '',
      sent: false,
      verifying: false
    }
  );

  const [emailOtpState, setEmailOtpState, isEmailOtpStateInitialized] = useClientState(
    STORAGE_KEYS.EMAIL_OTP_STATE,
    {
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: '',
      sent: false,
      verifying: false
    }
  );

  const [verification, setVerification, isVerificationInitialized] = useClientState<VerificationState>(
    STORAGE_KEYS.VERIFICATION_DATA,
    {
      pan: { value: '', verified: false, loading: false, error: '' },
      email: { value: '', verified: false, loading: false, error: '', ref_id: '' },
      aadhaar: {
        value: '', verified: false, loading: false, error: '', modified: false, ref_id: '',
        isEditingAddress: false
      },
      nism: {
        fileName: '',
        fileSize: '',
        fileType: '',
        base64Data: '',
        verified: false,
        loading: false,
        fileError: '',
        uploaded: '',
        uploadError: '',
        arnNumber: '',
        euinNumber: '',
        arnError: '',
        euinError: '',
        skipped: false,
      },
      bank: {
        accountNumber: '',
        ifsc: '',
        verified: false,
        loading: false,
        accountError: '',
        ifscError: '',
        ref_id: '',
        bankName: '',
        branch: '',
        centre: '',
        city: '',
        state: '',
        micr: '',
        address: '',
        error: ''
      }
    }
  );

  const checkAndClearSession = useCallback(() => {
    if (typeof window === 'undefined') return false;

    try {
      console.log("inside the function")
      console.log("loginEmailId:", loginEmailId)
      console.log("email from verification state:", verification.email.value)

      if (loginEmailId && verification.email.value && loginEmailId !== verification.email.value) {
        console.log("User email mismatch detected. Clearing session...");
        clearLocalStorage();
        setPartnerData({
          name: '',
          email: '',
          phone: mobileFromUrl || '',
          address: '',
          dob: '',
          age: '',
          gender: '',
          pincode: '',
          errors: { phone: '' }
        });
        setVerification({
          pan: { value: '', verified: false, loading: false, error: '' },
          email: { value: '', verified: false, loading: false, error: '', ref_id: '' },
          aadhaar: {
            value: '', verified: false, loading: false, error: '', modified: false, ref_id: '',
            isEditingAddress: false
          },
          nism: {
            fileName: '',
            fileSize: '',
            fileType: '',
            base64Data: '',
            verified: false,
            loading: false,
            fileError: '',
            uploaded: '',
            uploadError: '',
            arnNumber: '',
            euinNumber: '',
            arnError: '',
            euinError: '',
            skipped: false,
          },
          bank: {
            accountNumber: '',
            ifsc: '',
            verified: false,
            loading: false,
            accountError: '',
            ifscError: '',
            ref_id: '',
            bankName: '',
            branch: '',
            centre: '',
            city: '',
            state: '',
            micr: '',
            address: '',
            error: ''
          }
        });
        setAadhaarOtpState({
          otp: '',
          timer: 0,
          canResend: true,
          loading: false,
          error: '',
          sent: false,
          verifying: false
        });
        setEmailOtpState({
          otp: '',
          timer: 0,
          canResend: true,
          loading: false,
          error: '',
          sent: false,
          verifying: false
        });
        setAddresses([]);
        setSelectedAddressIndex(0);
        setIsEditing({
          aadhaar: false,
          pan: false,
          bank: false,
          email: false,
          personal: false
        });
        setRegistrationStatus({
          loading: false,
          data: null,
          error: ''
        });
        setTimeout(() => {
          console.log("LocalStorage after clearing:");
          Object.values(STORAGE_KEYS).forEach(key => {
            console.log(`${key}:`, localStorage.getItem(key));
          });
        }, 100);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  }, [loginEmailId, verification.email.value, mobileFromUrl]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('kyc_was_reloading', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    if (sessionStorage.getItem('kyc_was_reloading') === 'true') {
      setAadhaarOtpState({
        otp: '',
        timer: 0,
        canResend: true,
        loading: false,
        error: '',
        sent: false,
        verifying: false
      });
      setEmailOtpState({
        otp: '',
        timer: 0,
        canResend: true,
        loading: false,
        error: '',
        sent: false,
        verifying: false
      });
      sessionStorage.removeItem('kyc_was_reloading');
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (loginEmailId && isVerificationInitialized) {
      console.log("Running session check...");
    }
  }, [loginEmailId, checkAndClearSession, isVerificationInitialized]);

  const [addresses, setAddresses, isAddressesInitialized] = useClientState<
    Array<{
      sequence: string;
      address: string;
      state: string;
      type: string;
      postal: string;
    }>
  >(STORAGE_KEYS.ADDRESSES, []);

  const [registrationStatus, setRegistrationStatus, isRegistrationStatusInitialized] = useClientState<{
    loading: boolean;
    data: any;
    error: string;
  }>(
    STORAGE_KEYS.REGISTRATION_STATUS,
    {
      loading: false,
      data: null,
      error: ''
    }
  );

  const [isFetchingUserData, setIsFetchingUserData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const isAllInitialized =
    isScreenInitialized &&
    isPartnerDataInitialized &&
    isVerificationInitialized &&
    isAadhaarOtpStateInitialized &&
    isEmailOtpStateInitialized &&
    isAddressesInitialized &&
    isAddressIndexInitialized &&
    isEditingInitialized &&
    isRegistrationStatusInitialized &&
    isMobileInitialized;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (aadhaarOtpState.timer > 0) {
      interval = setInterval(() => {
        setAadhaarOtpState(prev => ({
          ...prev,
          timer: prev.timer - 1,
          canResend: prev.timer <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [aadhaarOtpState.timer, setAadhaarOtpState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailOtpState.timer > 0) {
      interval = setInterval(() => {
        setEmailOtpState(prev => ({
          ...prev,
          timer: prev.timer - 1,
          canResend: prev.timer <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailOtpState.timer, setEmailOtpState]);

  useEffect(() => {
    const fetchData = async () => {
      if (!mobileFromUrl) {
        setError('Mobile number is required in URL parameter');
        setIsLoading(false);
        return;
      }
      if (!validatePhone(mobileFromUrl)) {
        setError('Invalid mobile number. Please check the URL parameter.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError('');
        setMobileNumber(mobileFromUrl);
        setPartnerData(prev => ({
          ...prev,
          phone: mobileFromUrl
        }));
        await fetchPartnerData(mobileFromUrl);
      } catch (err: any) {
        // Don't set error for "no data found" cases
        if (!err.message?.includes("No partner data") && !err.message?.includes("Failed to fetch partner data")) {
          setError(err.message || 'Failed to fetch partner data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (mobileFromUrl) {
      fetchData();
    }
  }, [mobileFromUrl]);

  const fetchPartnerData = async (mobile: string) => {
    try {
      setIsFetchingUserData(true);

      const lastMobile = localStorage.getItem('last_fetched_mobile');


      if (lastMobile && lastMobile !== mobile) {
        console.log('Mobile number changed from', lastMobile, 'to', mobile, '- Clearing old data');
        clearLocalStorage();
      }

      localStorage.setItem('last_fetched_mobile', mobile);

      setPartnerData({
        name: '',
        email: '',
        phone: mobile,
        address: '',
        dob: '',
        age: '',
        gender: '',
        pincode: '',
        errors: { phone: '' }
      });

      setVerification({
        pan: { value: '', verified: false, loading: false, error: '' },
        email: { value: '', verified: false, loading: false, error: '', ref_id: '' },
        aadhaar: {
          value: '', verified: false, loading: false, error: '', modified: false, ref_id: '',
          isEditingAddress: false
        },
        nism: {
          fileName: '',
          fileSize: '',
          fileType: '',
          base64Data: '',
          verified: false,
          loading: false,
          fileError: '',
          uploaded: '',
          uploadError: '',
          arnNumber: '',
          euinNumber: '',
          arnError: '',
          euinError: '',
          skipped: false,
        },
        bank: {
          accountNumber: '',
          ifsc: '',
          verified: false,
          loading: false,
          accountError: '',
          ifscError: '',
          ref_id: '',
          bankName: '',
          branch: '',
          centre: '',
          city: '',
          state: '',
          micr: '',
          address: '',
          error: ''
        }
      });

      setAddresses([]);
      setSelectedAddressIndex(0);
      setAadhaarOtpState({
        otp: '',
        timer: 0,
        canResend: true,
        loading: false,
        error: '',
        sent: false,
        verifying: false
      });
      setEmailOtpState({
        otp: '',
        timer: 0,
        canResend: true,
        loading: false,
        error: '',
        sent: false,
        verifying: false
      });

      // Now fetch new data
      const response = await PartnerService.getUserDecentroData(mobile);
      console.log('Partner Decentro Data Response:', response);

      // Check if response has data - if not, don't throw error, just let user fill manually
      if (response && response.data && response.data.data && response.data.data.length > 0) {
        const partnerData = response.data.data[0]?.response_data?.data;
        if (partnerData && partnerData.length > 0) {
          await processPartnerData(partnerData);
          toast.success('Partner data loaded successfully');
        } else {
          // No data found - this is okay for new partners
          console.log('No existing KYC data found for this mobile number');
          toast.info('No existing KYC data found. Please fill in your details manually.');
          // Don't throw error - allow manual entry
        }
      } else {
        // No data found - this is okay for new partners
        console.log('No partner record exists for this mobile number');
        toast.info('New partner. Please complete your KYC details below.');
        // Don't throw error - allow manual entry
      }
    } catch (error: any) {
      console.error('Error fetching partner data:', error);
      // Only show error for actual network/server issues, not for "no data found"
      const errorMessage = error.response?.data?.message || error.message || "";

      if (errorMessage.includes("network") || errorMessage.includes("timeout") || error.code === 'ECONNABORTED') {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.response?.status === 404) {
        toast.info("No existing KYC data found. Please fill in your details manually.");
      } else {
        toast.error("Unable to fetch existing data. You can fill in your details manually.");
      }
      // Don't throw error - allow user to proceed with manual entry
    } finally {
      setIsFetchingUserData(false);
    }
  };
  const processPartnerData = async (apiResponse: any) => {
    try {
      console.log('Raw Partner API Response:', apiResponse);
      const mobileToAccountData = apiResponse.find((item: any) => item.source === 'mobile_to_account');
      const financialData = apiResponse.find((item: any) => item.source === 'financial_service_data_pull');
      console.log('Mobile to Account Data:', mobileToAccountData);
      console.log('Financial Data:', financialData);
      if (mobileToAccountData?.response?.data) {
        const bankData = mobileToAccountData.response.data;
        console.log('Bank Data Found:', bankData);
        setVerification(prev => ({
          ...prev,
          bank: {
            ...prev.bank,
            accountNumber: bankData.accountNumber || '',
            ifsc: bankData.ifsc || '',
            verified: false,
            bankName: bankData.branchDetails?.bank || '',
            micr: bankData.branchDetails?.micr || '',
            branch: bankData.branchDetails?.branch || '',
            city: bankData.branchDetails?.city || '',
            state: bankData.branchDetails?.state || '',
            address: bankData.branchDetails?.address || ''
          }
        }));
        if (bankData.nameAsPerBank) {
          console.log("bankname-", bankData.nameAsPerBank);
          setPartnerData(prev => ({
            ...prev,
            name: bankData.nameAsPerBank.trim()
          }));
        }
      }
      if (financialData?.response?.data) {
        const financialDataResp = financialData.response.data;
        console.log('Financial Data Response:', financialDataResp);
        if (financialDataResp.personalInfo) {
          const personalInfo = financialDataResp.personalInfo;
          console.log('Personal Info:', personalInfo);
          if (personalInfo.fullName && !partnerData.name) {
            setPartnerData(prev => ({
              ...prev,
              name: personalInfo.fullName.trim()
            }));
          }
          if (personalInfo.dob) {
            console.log('Setting DOB from personalInfo:', personalInfo.dob);
            setPartnerData(prev => ({
              ...prev,
              dob: personalInfo.dob
            }));
          }
          if (personalInfo.age) {
            setPartnerData(prev => ({
              ...prev,
              age: personalInfo.age
            }));
          }
          if (personalInfo.gender) {
            setPartnerData(prev => ({
              ...prev,
              gender: personalInfo.gender
            }));
          }
        }
        if (financialDataResp.emailInfo && financialDataResp.emailInfo.length > 0) {
          const emailData = financialDataResp.emailInfo[0];
          console.log('Email Data:', emailData);
          const emailValue = (emailData.emailAddress || '').toLowerCase();
          console.log('Setting Email:', emailValue);
        }
        if (financialDataResp.identityInfo?.panNumber && financialDataResp.identityInfo.panNumber.length > 0) {
          const panData = financialDataResp.identityInfo.panNumber[0];
          console.log('PAN Data:', panData);
          setVerification(prev => ({
            ...prev,
            pan: {
              ...prev.pan,
              value: panData.idNumber || '',
              verified: false
            }
          }));
        }
        if (financialDataResp.identityInfo?.aadhaarNumber && financialDataResp.identityInfo.aadhaarNumber.length > 0) {
          const aadhaarData = financialDataResp.identityInfo.aadhaarNumber[0];
          console.log('Aadhaar Data:', aadhaarData);
          setVerification(prev => ({
            ...prev,
            aadhaar: {
              ...prev.aadhaar,
              value: formatAadhaar(aadhaarData.idNumber || ''),
              verified: false
            }
          }));
        }
        if (financialDataResp.addressInfo && financialDataResp.addressInfo.length > 0) {
          console.log('Address Info:', financialDataResp.addressInfo);
          const formattedAddresses = financialDataResp.addressInfo.map((addr: any, index: number) => ({
            sequence: addr.sequence || `${index + 1}`,
            address: addr.address || '',
            state: addr.state || '',
            type: addr.type || 'Address',
            postal: addr.postal || '',
            reportedDate: addr.reportedDate || ''
          }));
          console.log('Formatted Addresses:', formattedAddresses);
          setAddresses(formattedAddresses);
          if (formattedAddresses.length > 0) {
            setPartnerData(prev => ({
              ...prev,
              address: formattedAddresses[0].address,
              pincode: formattedAddresses[0].postal || ''
            }));
          }
        }
        if (financialDataResp.phoneInfo && financialDataResp.phoneInfo.length > 0) {
          console.log('Phone Info:', financialDataResp.phoneInfo);
          const primaryPhone = financialDataResp.phoneInfo.find((phone: any) =>
            phone.typeCode === 'M' || phone.typeCode === 'H'
          );
          if (primaryPhone && !partnerData.phone) {
            setPartnerData(prev => ({
              ...prev,
              phone: primaryPhone.number || ''
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error processing API response:', error);
      toast.error('Error processing partner data');
    }
  };

  const handleAadhaarOTPChange = (value: string, index: number) => {
    const newOtp = aadhaarOtpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');
    setAadhaarOtpState(prev => ({ ...prev, otp: otpString, error: '' }));
    if (value && index < 5) {
      aadhaarOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailOTPChange = (value: string, index: number) => {
    const newOtp = emailOtpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');
    setEmailOtpState(prev => ({ ...prev, otp: otpString, error: '' }));
    if (value && index < 5) {
      emailOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleAadhaarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !aadhaarOtpState.otp[index] && index > 0) {
      aadhaarOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !emailOtpState.otp[index] && index > 0) {
      emailOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAadhaarPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('');
    digits.forEach((digit, index) => {
      if (index < 6) {
        handleAadhaarOTPChange(digit, index);
      }
    });
  };

  const handleEmailPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('');
    digits.forEach((digit, index) => {
      if (index < 6) {
        handleEmailOTPChange(digit, index);
      }
    });
  };

  const sendAadhaarOTP = async () => {
    if (!verification.aadhaar.value || verification.aadhaar.value.replace(/\s/g, '').length !== 12) {
      setVerification(prev => ({
        ...prev,
        aadhaar: {
          ...prev.aadhaar,
          error: 'Please enter a valid 12-digit Aadhaar number',
          otpError: ''
        }
      }));
      return;
    }

    if (!partnerData.phone) {
      toast.error('Mobile number is missing. Please refresh the page.');
      return;
    }

    try {
      setVerification(prev => ({
        ...prev,
        aadhaar: {
          ...prev.aadhaar,
          otpLoading: true,
          error: '',
          otpError: ''
        }
      }));

      const aadhaarNumber = verification.aadhaar.value.replace(/\s/g, '');

      console.log('Sending Aadhaar OTP request:', {
        mobile: partnerData.phone,
        aadhaar: aadhaarNumber,
        userTypeId: userType
      });

      const response = await PartnerService.sendOtpForAadhaarVerification({
        mobile: partnerData.phone,
        aadhaar: aadhaarNumber,
        userTypeId: userType
      });

      console.log('Aadhaar OTP Response:', response);

      if (response && response.data && response.data.status === 'S') {
        // Safely extract ref_id from different possible response structures
        let refId = '';

        if (response.data.userReg) {
          // Case 1: userReg is array with ref_id in second element
          if (Array.isArray(response.data.userReg) && response.data.userReg.length > 1) {
            refId = response.data.userReg[1]?.ref_id || '';
          }
          // Case 2: userReg is array with ref_id in first element
          else if (Array.isArray(response.data.userReg) && response.data.userReg[0]?.ref_id) {
            refId = response.data.userReg[0].ref_id;
          }
          // Case 3: userReg is object with ref_id
          else if (typeof response.data.userReg === 'object' && response.data.userReg.ref_id) {
            refId = response.data.userReg.ref_id;
          }
        }

        // Fallback to direct ref_id if available
        if (!refId && response.data.ref_id) {
          refId = response.data.ref_id;
        }

        console.log('Extracted ref_id:', refId);

        if (!refId) {
          console.warn('No ref_id found in response:', response.data);
        }

        setAadhaarOtpState({
          otp: '',
          timer: 30,
          canResend: false,
          loading: false,
          error: '',
          sent: true,
          verifying: false
        });

        setVerification(prev => ({
          ...prev,
          aadhaar: {
            ...prev.aadhaar,
            loading: false,
            otpSent: true,
            showOtpModal: true,
            ref_id: refId,
            error: '',
            otpError: ''
          }
        }));

        toast.success('Aadhaar OTP sent successfully!');

      } else {
        const errorMessage = response?.data?.remark || response?.data?.message || 'Failed to send Aadhaar OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Aadhaar OTP Error:', error);

      let errorMessage = 'An error occurred while sending Aadhaar OTP';

      if (error.response?.data?.remark) {
        errorMessage = error.response.data.remark;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setVerification(prev => ({
        ...prev,
        aadhaar: {
          ...prev.aadhaar,
          otpLoading: false,
          error: errorMessage,
          otpError: errorMessage
        }
      }));

      toast.error(errorMessage);
    }
  };

  const sendEmailOTP = async () => {
    if (!verification.email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verification.email.value)) {
      setVerification(prev => ({
        ...prev,
        email: {
          ...prev.email,
          error: 'Please enter a valid email address'
        }
      }));
      return;
    }
    try {
      setVerification(prev => ({
        ...prev,
        email: {
          ...prev.email,
          loading: true,
          error: ''
        }
      }));
      console.log('Sending Email OTP request:', {
        mobile: partnerData.phone,
        email: verification.email.value
      });
      const response = await PartnerService.sentOtpForEmailVerification({
        mobile: partnerData.phone,
        email: verification.email.value
      });
      console.log('Email OTP Response:', response);
      console.log(response.data);
      if (response && response.data && response.data.status === 'S') {
        setEmailOtpState({
          otp: '',
          timer: 30,
          canResend: false,
          loading: false,
          error: '',
          sent: true,
          verifying: false
        });
        setVerification(prev => ({
          ...prev,
          email: {
            ...prev.email,
            loading: false,
            otpSent: true,
            ref_id: "0",
            error: ''
          }
        }));
        toast.success('Email OTP sent successfully!');
      } else {
        const errorMessage = response?.data?.remark || 'Failed to send Email OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Email OTP Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while sending Email OTP';
      setVerification(prev => ({
        ...prev,
        email: {
          ...prev.email,
          loading: false,
          error: errorMessage
        }
      }));
      toast.error(errorMessage);
    }
  };

  const verifyAadhaarOTP = async () => {
    if (aadhaarOtpState.otp.length !== 6) {
      setAadhaarOtpState(prev => ({ ...prev, error: 'Please enter a valid 6-digit OTP' }));
      return;
    }
    try {
      setAadhaarOtpState(prev => ({ ...prev, verifying: true, error: '' }));
      const response = await PartnerService.verifyOtpForAadhaarVerification({
        mobile: partnerData.phone,
        aadhaar: verification.aadhaar.value.replace(/\s+/g, ''),
        otp: aadhaarOtpState.otp,
        ref_id: verification.aadhaar.ref_id
      });
      console.log('Aadhaar OTP Verification Response:', response);
      if (response && response.data) {
        const responseData = response.data;
        if (responseData.status === 'S') {
          if (responseData.userReg && typeof responseData.userReg === 'object' && !Array.isArray(responseData.userReg)) {
            const userRegObj = responseData.userReg;
            if (userRegObj.status === 'error') {
              const errorMessage = userRegObj.message || userRegObj.error || 'Invalid Aadhaar OTP';
              console.log('OTP verification failed:', errorMessage);
              handleOTPError(errorMessage);
              return;
            }
          }
          if (Array.isArray(responseData.userReg) && responseData.userReg.length > 0) {
            const userRegData = responseData.userReg[0];
            if (userRegData.status === 'VALID') {
              const aadhaarData = userRegData;
              console.log('Aadhaar verification successful:', aadhaarData);
              setPartnerData(prev => ({
                ...prev,
                name: aadhaarData.name?.trim() || prev.name,
                dob: aadhaarData.dob?.trim() || prev.dob,
                address: aadhaarData.address?.trim() || prev.address,
                pincode: aadhaarData.split_address?.pincode?.trim() || prev.pincode,
              }));
              setAadhaarOtpState({
                otp: '',
                timer: 0,
                canResend: true,
                loading: false,
                error: '',
                sent: false,
                verifying: false
              });
              aadhaarOtpInputRefs.current.forEach(ref => {
                if (ref) ref.value = '';
              });
              toggleEdit('aadhaar');
              setVerification(prev => ({
                ...prev,
                aadhaar: {
                  ...prev.aadhaar,
                  verified: true,
                  error: '',
                  ref_id: ''
                }
              }));
              toast.success('Aadhaar verified successfully!');
            } else {
              const errorMessage = userRegData.message || 'Aadhaar OTP verification failed';
              console.log('Invalid status in array:', errorMessage);
              handleOTPError(errorMessage);
            }
          } else {
            const errorMessage = responseData.remark || 'Invalid response format from server';
            console.log('Invalid userReg structure:', responseData.userReg);
            handleOTPError(errorMessage);
          }
        } else {
          const errorMessage = responseData.remark || 'Aadhaar OTP verification failed';
          console.log('Top-level failure:', errorMessage);
          handleOTPError(errorMessage);
        }
      } else {
        handleOTPError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Aadhaar OTP Verification Error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.remark ||
        error.message ||
        'Aadhaar OTP verification failed';
      handleOTPError(errorMessage);
    }
  };

  const handleOTPError = (errorMessage: string) => {
    console.log('Handling OTP error:', errorMessage);
    const isSessionExpired = errorMessage.toLowerCase().includes('session expired') ||
      errorMessage.toLowerCase().includes('generate a new otp');
    aadhaarOtpInputRefs.current.forEach(ref => {
      if (ref) ref.value = '';
    });
    if (isSessionExpired) {
      setAadhaarOtpState({
        otp: '',
        timer: 0,
        canResend: true,
        loading: false,
        error: 'OTP session expired. Please request a new OTP.',
        sent: false,
        verifying: false
      });
      setVerification(prev => ({
        ...prev,
        aadhaar: {
          ...prev.aadhaar,
          error: 'OTP session expired. Please request a new OTP.',
          ref_id: '',
          verified: false
        }
      }));
    } else {
      setAadhaarOtpState(prev => ({
        ...prev,
        otp: '',
        verifying: false,
        error: errorMessage,
        sent: true
      }));
      setVerification(prev => ({
        ...prev,
        aadhaar: {
          ...prev.aadhaar,
          error: errorMessage,
          verified: false
        }
      }));
    }
    toast.error(errorMessage);
    if (!isSessionExpired) {
      setTimeout(() => {
        aadhaarOtpInputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const verifyEmailOTP = async () => {
    if (emailOtpState.otp.length !== 6) {
      setEmailOtpState(prev => ({ ...prev, error: 'Please enter a valid 6-digit OTP' }));
      return;
    }
    try {
      setEmailOtpState(prev => ({ ...prev, verifying: true, error: '' }));
      const response = await PartnerService.verifyOtpForEmailVerification({
        mobile: partnerData.phone,
        email: verification.email.value,
        otp: emailOtpState.otp,
        userTypeId: userType
      });
      setEmailOtpState(prev => ({ ...prev, verifying: false }));
      toggleEdit('email');
      setVerification(prev => ({
        ...prev,
        email: { ...prev.email, verified: true, error: '' }
      }));
      toast.success('Email verified successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Email OTP verification failed';
      setEmailOtpState(prev => ({
        ...prev,
        verifying: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  const verifyPAN = async () => {
    if (!verification.pan.value || verification.pan.value.length !== 10) {
      setVerification(prev => ({
        ...prev,
        pan: {
          ...prev.pan,
          error: 'Please enter a valid PAN number',
          validationMessage: ''
        }
      }));
      return { isValid: false, message: 'Please enter a valid PAN number' };
    }
    try {
      setVerification(prev => ({
        ...prev,
        pan: { ...prev.pan, loading: true, error: '', validationMessage: '' }
      }));
      const response = await PartnerService.panNoVerification({
        pan: verification.pan.value,
        mobile: partnerData.phone,
        name: partnerData.name,
        dob: partnerData.dob,
        userTypeId: userType
      });
      console.log(response);
      let responseData = response.data;
      console.log('PAN Validation Response:', responseData);
      if (responseData && responseData.status === 'S' && responseData.userReg[0].valid === true) {
        const kycStatus = responseData.data?.kycStatus || false;
        const cvlKraMessage = responseData.data?.cvlKraMessage || '';
        const apiMessage = responseData.msg || 'PAN validation completed';
        const displayMessage = cvlKraMessage
          ? `${cvlKraMessage} - ${apiMessage}`
          : apiMessage;
        const isPending = cvlKraMessage.toLowerCase().includes('pending') ||
          cvlKraMessage.toLowerCase().includes('kyc status is pending');
        setVerification(prev => ({
          ...prev,
          pan: {
            ...prev.pan,
            verified: true,
            loading: false,
            error: '',
            validationMessage: displayMessage
          }
        }));
        if (kycStatus) {
          toast.success('PAN validated successfully!');
        } else if (isPending) {
          toast.warning('PAN KYC is pending. You can proceed with registration.');
        } else {
          toast.warning(apiMessage);
        }
        return { isValid: kycStatus || isPending, message: displayMessage };
      } else {
        const errorMessage = responseData.message || 'Invalid PAN';
        setVerification(prev => ({
          ...prev,
          pan: { ...prev.pan, loading: false, error: errorMessage }
        }));
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('PAN Validation Error:', error);
      let errorMessage = 'PAN validation error';
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      const isKycPending = errorMessage.toLowerCase().includes('pending') ||
        errorMessage.toLowerCase().includes('kyc');
      setVerification(prev => ({
        ...prev,
        pan: {
          ...prev.pan,
          verified: isKycPending,
          loading: false,
          error: isKycPending ? '' : errorMessage,
          validationMessage: isKycPending ? errorMessage : ''
        }
      }));
      if (isKycPending) {
        toast.warning('PAN KYC is pending. You can proceed with registration.');
      } else {
        toast.error(errorMessage);
      }
      return { isValid: isKycPending, message: errorMessage };
    }
  };

  const verifyBank = async () => {
    if (!verification.bank.accountNumber || !verification.bank.ifsc) {
      setVerification(prev => ({
        ...prev,
        bank: {
          ...prev.bank,
          accountError: !verification.bank.accountNumber ? 'Account number is required' : '',
          ifscError: !verification.bank.ifsc ? 'IFSC code is required' : ''
        }
      }));
      return;
    }
    try {
      setVerification(prev => ({
        ...prev,
        bank: { ...prev.bank, loading: true, accountError: '', ifscError: '' }
      }));
      const response = await PartnerService.bankAccountVerification({
        mobile: partnerData.phone,
        bankAcNo: verification.bank.accountNumber,
        bankAcIfsc: verification.bank.ifsc,
        userTypeId: userType
      });
      console.log(response.data);
      if (response && response.data && response.data.status === 'S') {
        setVerification(prev => ({
          ...prev,
          bank: { ...prev.bank, bankName: response.data.userReg[1].bank_name, micr: response.data.userReg[1].ifsc_details.micr, loading: false, verified: true, accountError: '', ifscError: '' }
        }));
        toast.success('Bank account verified successfully!');
      } else {
        const errorMessage = response?.data?.remark || 'Invalid Bank Detail!';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Bank verification failed';
      setVerification(prev => ({
        ...prev,
        bank: { ...prev.bank, loading: false, error: errorMessage }
      }));
      toast.error(errorMessage);
    }
  };

  const resendAadhaarOTP = async () => {
    // Validate that we have required data before making API call
    if (!partnerData.phone) {
      toast.error('Mobile number is missing. Please refresh the page.');
      return;
    }

    if (!verification.aadhaar.value) {
      toast.error('Aadhaar number is missing. Please enter your Aadhaar number.');
      return;
    }

    try {
      setAadhaarOtpState(prev => ({ ...prev, loading: true, error: '' }));

      // Clear previous OTP inputs
      aadhaarOtpInputRefs.current.forEach(ref => {
        if (ref) {
          ref.value = '';
          ref.disabled = false;
        }
      });

      console.log('Resending Aadhaar OTP with:', {
        mobile: partnerData.phone,
        aadhaar: verification.aadhaar.value.replace(/\s/g, ''),
        userTypeId: userType
      });

      const response = await PartnerService.sendOtpForAadhaarVerification({
        mobile: partnerData.phone,
        aadhaar: verification.aadhaar.value.replace(/\s/g, ''),
        userTypeId: userType
      });

      console.log('Resend Aadhaar OTP Response:', response);

      if (response && response.data && response.data.status === 'S') {
        // Extract ref_id safely - check different possible response structures
        let refId = '';

        if (response.data.userReg) {
          if (Array.isArray(response.data.userReg) && response.data.userReg[1]) {
            refId = response.data.userReg[1].ref_id;
          } else if (typeof response.data.userReg === 'object' && response.data.userReg.ref_id) {
            refId = response.data.userReg.ref_id;
          } else if (response.data.ref_id) {
            refId = response.data.ref_id;
          }
        }

        console.log('Extracted ref_id for resend:', refId);

        setAadhaarOtpState({
          otp: '',
          timer: 30,
          canResend: false,
          loading: false,
          error: '',
          sent: true,
          verifying: false
        });

        setVerification(prev => ({
          ...prev,
          aadhaar: {
            ...prev.aadhaar,
            loading: false,
            otpSent: true,
            showOtpModal: true,
            ref_id: refId || prev.aadhaar.ref_id,
            error: '',
            otpError: ''
          }
        }));

        toast.success('Aadhaar OTP resent successfully!');

        // Focus on first OTP input
        setTimeout(() => {
          aadhaarOtpInputRefs.current[0]?.focus();
        }, 100);

      } else {
        const errorMessage = response?.data?.remark || response?.data?.message || 'Failed to resend Aadhaar OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Resend Aadhaar OTP Error:', error);

      let errorMessage = 'An error occurred while resending OTP';

      if (error.response?.data?.remark) {
        errorMessage = error.response.data.remark;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAadhaarOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        sent: false,
        canResend: false,
        timer: 5
      }));

      toast.error(errorMessage);
    }
  };

  const clearAadhaarOTP = () => {
    setAadhaarOtpState({
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: '',
      sent: false,
      verifying: false
    });
    setVerification(prev => ({
      ...prev,
      aadhaar: {
        ...prev.aadhaar,
        otpSent: false,
        showOtpModal: false,
        ref_id: ''
      }
    }));
    aadhaarOtpInputRefs.current.forEach(ref => {
      if (ref) ref.value = '';
    });
  };

  const resendEmailOTP = async () => {
    try {
      setEmailOtpState(prev => ({ ...prev, loading: true, error: '' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailOtpState({
        otp: '',
        timer: 30,
        canResend: false,
        loading: false,
        error: '',
        sent: true,
        verifying: false
      });
      emailOtpInputRefs.current.forEach(ref => {
        if (ref) ref.value = '';
      });
      emailOtpInputRefs.current[0]?.focus();
      toast.success('Email OTP sent successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while resending OTP';
      setEmailOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  const uploadNismDocuments = async () => {
    if (!verification.nism.base64Data && !verification.nism.skipped) {
      setVerification(prev => ({
        ...prev,
        nism: { ...prev.nism, uploadError: 'Please select a valid file before uploading or skip.' }
      }));
      return;
    }
    try {
      setVerification(prev => ({
        ...prev,
        nism: { ...prev.nism, loading: true, uploadError: '' }
      }));
      if (!verification.nism.skipped) {
        const response = await PartnerService.uploadNismDocument({
          mobile: partnerData.phone,
          nismDoc: verification.nism.base64Data,
          arn_no: verification.nism.arnNumber,
          euin_no: verification.nism.euinNumber,
        });
        if (response && response.data && response.data.status === 'S') {
          setVerification(prev => ({
            ...prev,
            nism: {
              ...prev.nism,
              verified: true,
              loading: false,
              uploadError: ''
            }
          }));
          toast.success('NISM document uploaded successfully!');
        } else {
          const errorMessage = response?.data?.remark || 'Upload failed';
          throw new Error(errorMessage);
        }
      } else {
        setVerification(prev => ({
          ...prev,
          nism: {
            ...prev.nism,
            verified: true,
            loading: false,
            uploadError: ''
          }
        }));
        toast.success('NISM upload skipped successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during upload';
      setVerification(prev => ({
        ...prev,
        nism: {
          ...prev.nism,
          loading: false,
          uploadError: errorMessage
        }
      }));
      toast.error(errorMessage);
    }
  };

  const handleNismUpload = async (file: File | null) => {
    setVerification(prev => ({
      ...prev,
      nism: {
        ...prev.nism,
        uploadError: '',
        base64Data: '',
        fileName: '',
        verified: false
      }
    }));
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'application/pdf'];
    const maxSizeInBytes = 1 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      setVerification(prev => ({
        ...prev,
        nism: { ...prev.nism, uploadError: 'Only JPEG, JPG, PNG, SVG, and PDF files are allowed' }
      }));
      return;
    }
    if (file.size > maxSizeInBytes) {
      setVerification(prev => ({
        ...prev,
        nism: { ...prev.nism, uploadError: 'File size must be less than or equal to 1MB' }
      }));
      return;
    }
    try {
      setVerification(prev => ({
        ...prev,
        nism: { ...prev.nism, loading: true, uploadError: '' }
      }));
      const base64 = await convertFileToBase64(file);
      setVerification(prev => ({
        ...prev,
        nism: {
          ...prev.nism,
          base64Data: base64,
          fileName: file.name,
          loading: false,
          uploadError: ''
        }
      }));
      toast.success('File selected successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during file upload';
      setVerification(prev => ({
        ...prev,
        nism: {
          ...prev.nism,
          loading: false,
          uploadError: errorMessage
        }
      }));
      toast.error(errorMessage);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePartnerInputChange = (field: keyof Omit<PartnerRegistrationState, 'errors'>, value: string) => {
    setPartnerData(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const handleAadhaarChange = (value: string) => {
    const formatted = formatAadhaar(value);
    setVerification(prev => ({
      ...prev,
      aadhaar: {
        ...prev.aadhaar,
        value: formatted,
        error: '',
        otpError: '',
        verified: false
      }
    }));
    setAadhaarOtpState({
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: '',
      sent: false,
      verifying: false
    });
  };

  const handlePanChange = (value: string) => {
    const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    const upperValue = cleanedValue.toUpperCase();
    setVerification(prev => ({
      ...prev,
      pan: {
        ...prev.pan,
        value: upperValue,
        verified: false
      }
    }));
  };

  const handleEmailChange = (value: string) => {
    const formatted = formatEmail(value);
    setVerification(prev => ({
      ...prev,
      email: { ...prev.email, value: formatted, error: '', verified: false }
    }));
    setPartnerData(prev => ({
      ...prev,
      email: formatted
    }));
    setEmailOtpState({
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: '',
      sent: false,
      verifying: false
    });
  };

  const handleBankChange = (field: 'accountNumber' | 'ifsc' | 'bankName' | 'micr', value: string) => {
    setVerification(prev => ({
      ...prev,
      bank: {
        ...prev.bank,
        [field]: value,
        [`${field}Error`]: '',
        verified: false
      }
    }));
  };

  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    setPartnerData(prev => ({
      ...prev,
      address: addresses[index].address,
      pincode: addresses[index].postal || ''
    }));
  };

  const isARNComplete = () => {
    if (verification.nism.arnHolder === true) {
      return verification.nism.arnNumber &&
        verification.nism.euinNumber &&
        verification.nism.verified;
    } else if (verification.nism.arnHolder === false) {
      return true;
    }
    return false;
  };

  const calculateOverallProgress = () => {
    // Email needs to be verified for all users
    const isEmailVerified = verification.email.verified;

    const steps = [
      !!partnerData.phone,
      !!(partnerData.name && partnerData.dob),
      verification.aadhaar.verified,
      verification.pan.verified,
      isEmailVerified,
      isARNComplete(),
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const isAllVerified = calculateOverallProgress() === 100;

  const handleCompleteRegistration = async () => {
    if (!isAllVerified) {
      toast.error('Please complete all verification steps before proceeding');
      return;
    }
    try {
      setRegistrationStatus(prev => ({ ...prev, loading: true, error: '' }));
      const finalEmail =
        loginEmailId !== "admin@gmail.com"
          ? loginEmailId
          : verification.email.value;
      if (loginEmailId === "admin@gmail.com" && !verification.email.value) {
        toast.error('Please enter an email address');
        return;
      }
      const partnerDataWithEmail = {
        ...partnerData,
        email: finalEmail
      };
      const response = await PartnerService.createPartnerUser(
        partnerDataWithEmail,
        verification,
        finalEmail
      );
      if (response && response.data && response.data.status === 'S') {
        setRegistrationStatus(prev => ({ ...prev, loading: false }));
        clearLocalStorage();
        setCurrentScreen('completion');
        toast.success('Registration completed successfully!');
      } else {
        const errorMessage = response?.data?.remark || 'Registration failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during registration';
      setRegistrationStatus(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.warning(`${errorMessage}`);
    }
  };

  if (currentScreen === 'completion') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#111111] backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-[#2A2A2A]">
          <div className="w-16 h-16 bg-[#10B981]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-xl font-bold text-[#F9FAFB] mb-3">Registration Completed Successfully!</h1>
          <p className="text-[#9CA3AF] text-sm mb-4">
            Your partner account has been created successfully. You can now login to access your dashboard.
          </p>
          <div className="bg-[#1F1A1A] rounded-lg p-4 mb-4 text-left border border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-[#F9FAFB] mb-3">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#9CA3AF]">Mobile Number</p>
                <p className="font-semibold text-[#F9FAFB]">{partnerData.phone}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (loginEmailId !== "admin@gmail.com") {
                router.push('/partner-dashboard');
              } else {
                router.push('/admin-dashboard');
              }
            }}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-colors shadow-md"
          >
            Proceed to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A] mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-xl flex items-center justify-center mr-3 shadow-sm">
                <ShieldUser className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#F9FAFB]">Partner Onboarding Process</h1>
                <p className="text-[#9CA3AF] text-xs mt-0.5">Complete verification steps to activate your partner account</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full mr-1.5"></div>
                    <span className="text-xs text-[#F9FAFB]">
                      <span className="font-semibold">{Math.round(calculateOverallProgress())}%</span> Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="text-right">
                <div className="flex items-center justify-end mb-0.5">
                  <CheckCircle className="w-3 h-3 text-[#10B981] mr-1" />
                  <span className="text-xs font-semibold text-[#10B981]">Mobile Verified-</span>
                  <p className="font-bold text-[#F9FAFB] text-base">{partnerData.phone}</p>
                </div>
                {loginEmailId !== "admin@gmail.com" && (
                  <div className="flex items-center justify-end mb-0.5">
                    <CheckCircle className="w-3 h-3 text-[#10B981] mr-1" />
                    <span className="text-xs font-semibold text-[#10B981]">Email Verified -</span>
                    <p className="font-bold text-[#F9FAFB] text-base">{loginEmailId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* PAN & Email Verification Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="space-y-4">
              {/* PAN Section */}
              <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#2A2A2A]">
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${verification.pan.verified ? 'bg-[#10B981]/20' : 'bg-[#1F1A1A]'}`}>
                      <IdCard className={`w-4 h-4 ${verification.pan.verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#F9FAFB]">PAN Verification</h3>
                      <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={verification.pan.value}
                      onChange={(e) => handlePanChange(e.target.value)}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                      maxLength={10}
                      disabled={verification.pan.verified}
                    />
                    {verification.pan.verified && (
                      <p className="text-[#10B981] text-xs mt-1">✓ PAN verified - Cannot edit</p>
                    )}
                  </div>

                  {verification.pan.value && !verification.pan.verified && (
                    <div className="space-y-2">
                      <button
                        onClick={verifyPAN}
                        disabled={verification.pan.loading || verification.pan.value.length !== 10}
                        className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {verification.pan.loading ? (
                          <div className="flex items-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Verifying...
                          </div>
                        ) : (
                          'Verify PAN'
                        )}
                      </button>
                      {verification.pan.error && (
                        <p className="text-red-400 text-xs text-center">{verification.pan.error}</p>
                      )}
                    </div>
                  )}

                  {verification.pan.verified && (
                    <div className="p-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-[#10B981] mr-1" />
                        <span className="text-xs font-semibold text-[#10B981]">PAN Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Section - Show only when loginEmailId is "admin@gmail.com" */}
              {/* Email Section - Show for all users, editable for everyone */}
              <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#2A2A2A]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-[#1F1A1A]">
                    <Mail className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F9FAFB]">Email Address</h3>
                    <p className="text-[#9CA3AF] text-xs">Will be used for registration</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={verification.email.value}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      disabled={verification.email.verified} // Only disable if already verified
                    />
                    {verification.email.verified && (
                      <p className="text-[#10B981] text-xs mt-1">✓ Email verified - Cannot edit</p>
                    )}
                    <p className="text-xs text-[#9CA3AF] mt-1">This email will be used for registration</p>
                  </div>

                  {!verification.email.verified && verification.email.value && (
                    <div className="space-y-2">
                      <button
                        onClick={sendEmailOTP}
                        disabled={verification.email.loading}
                        className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {verification.email.loading ? (
                          <div className="flex items-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Sending OTP...
                          </div>
                        ) : (
                          'Send Verification OTP'
                        )}
                      </button>

                      {emailOtpState.sent && (
                        <div className="space-y-3 p-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
                          <div className="text-center">
                            <label className="block text-xs font-medium text-[#F9FAFB] mb-2">6-digit Email OTP</label>
                            <div className="flex justify-center space-x-2 mb-3">
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                  key={index}
                                  ref={(el) => { emailOtpInputRefs.current[index] = el; }}
                                  type="text"
                                  maxLength={1}
                                  value={emailOtpState.otp[index] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    handleEmailOTPChange(value, index);
                                  }}
                                  onKeyDown={(e) => handleEmailKeyDown(e, index)}
                                  onPaste={handleEmailPaste}
                                  className="w-10 h-10 text-center text-lg font-bold border border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-200 bg-[#111111] text-[#F9FAFB] shadow-sm"
                                  disabled={emailOtpState.verifying}
                                />
                              ))}
                            </div>
                            {emailOtpState.error && (
                              <p className="text-red-400 text-xs text-center">{emailOtpState.error}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs px-1">
                            <button
                              onClick={() => {
                                setEmailOtpState({
                                  otp: '',
                                  timer: 0,
                                  canResend: true,
                                  loading: false,
                                  error: '',
                                  sent: false,
                                  verifying: false
                                });
                              }}
                              className="text-[#9CA3AF] hover:text-[#F9FAFB] font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={resendEmailOTP}
                              disabled={!emailOtpState.canResend || emailOtpState.loading}
                              className="text-[#F59E0B] hover:text-[#FBBF24] font-medium disabled:text-[#9CA3AF]"
                            >
                              {emailOtpState.loading ? 'Resending...' :
                                emailOtpState.timer > 0 ? `Resend in ${emailOtpState.timer}s` : 'Resend OTP'}
                            </button>
                          </div>
                          <button
                            onClick={verifyEmailOTP}
                            disabled={emailOtpState.otp.length !== 6 || emailOtpState.verifying}
                            className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            {emailOtpState.verifying ? (
                              <div className="flex items-center">
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Verifying...
                              </div>
                            ) : (
                              'Verify OTP'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {verification.email.error && (
                    <p className="text-red-400 text-xs text-center">{verification.email.error}</p>
                  )}

                  {verification.email.verified && (
                    <div className="p-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-[#10B981] mr-1" />
                        <span className="text-xs font-semibold text-[#10B981]">Email Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Aadhaar Verification Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.aadhaar.verified ? 'bg-[#10B981]/20' : 'bg-[#1F1A1A]'}`}>
                  <Fingerprint className={`w-5 h-5 ${verification.aadhaar.verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Aadhaar Details</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  value={verification.aadhaar.value}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="Enter 12-digit Aadhaar"
                  className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  maxLength={14}
                  disabled={verification.aadhaar.verified} // Disable if already verified
                />
                {verification.aadhaar.verified && (
                  <p className="text-[#10B981] text-xs mt-1">✓ Aadhaar verified - Cannot edit</p>
                )}
              </div>

              {!verification.aadhaar.verified && (
                <div className="space-y-3">
                  {!aadhaarOtpState.sent ? (
                    <button
                      onClick={sendAadhaarOTP}
                      disabled={verification.aadhaar.loading || !verification.aadhaar.value || verification.aadhaar.value.replace(/\s/g, '').length !== 12}
                      className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {verification.aadhaar.loading ? (
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Sending OTP...
                        </div>
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3 p-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
                      <div className="text-center">
                        <label className="block text-xs font-medium text-[#F9FAFB] mb-2">6-digit Aadhaar OTP</label>
                        <div className="flex justify-center space-x-2 mb-3">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              ref={(el) => { aadhaarOtpInputRefs.current[index] = el; }}
                              type="text"
                              maxLength={1}
                              value={aadhaarOtpState.otp[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleAadhaarOTPChange(value, index);
                              }}
                              onKeyDown={(e) => handleAadhaarKeyDown(e, index)}
                              onPaste={handleAadhaarPaste}
                              className="w-10 h-10 text-center text-lg font-bold border border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-all duration-200 bg-[#111111] text-[#F9FAFB] shadow-sm"
                              disabled={aadhaarOtpState.verifying}
                            />
                          ))}
                        </div>
                        {aadhaarOtpState.error && (
                          <p className="text-red-400 text-xs text-center">{aadhaarOtpState.error}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs px-1">
                        <button
                          onClick={() => {
                            setAadhaarOtpState({
                              otp: '',
                              timer: 0,
                              canResend: true,
                              loading: false,
                              error: '',
                              sent: false,
                              verifying: false
                            });
                            setVerification(prev => ({
                              ...prev,
                              aadhaar: { ...prev.aadhaar, error: '' }
                            }));
                          }}
                          className="text-[#9CA3AF] hover:text-[#F9FAFB] font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={resendAadhaarOTP}
                          disabled={!aadhaarOtpState.canResend || aadhaarOtpState.loading}
                          className="text-[#F59E0B] hover:text-[#FBBF24] font-medium disabled:text-[#9CA3AF]"
                        >
                          {aadhaarOtpState.loading ? 'Resending...' :
                            aadhaarOtpState.timer > 0 ? `Resend in ${aadhaarOtpState.timer}s` : 'Resend OTP'}
                        </button>
                      </div>
                      <button
                        onClick={verifyAadhaarOTP}
                        disabled={aadhaarOtpState.otp.length !== 6 || aadhaarOtpState.verifying}
                        className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {aadhaarOtpState.verifying ? (
                          <div className="flex items-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Verifying...
                          </div>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {verification.aadhaar.verified && (
                <div className="p-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-[#10B981] mr-1" />
                    <span className="text-xs font-semibold text-[#10B981]">Aadhaar Verified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Personal Details Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#1F1A1A] rounded-lg flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Personal Details</h3>
                  <p className="text-[#9CA3AF] text-xs">Your personal information</p>
                </div>
              </div>
              <button
                onClick={() => toggleEdit('personal')}
                className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.personal
                  ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                  : 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90'
                  } transition-colors`}
              >
                {isEditing.personal ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                {isEditing.personal ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Full Name</label>
                {isEditing.personal ? (
                  <input
                    type="text"
                    value={partnerData.name}
                    onChange={(e) => handlePartnerInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-sm text-[#F9FAFB]">{partnerData.name || 'Please enter'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Date of Birth</label>
                {isEditing.personal ? (
                  <input
                    type="date"
                    value={partnerData.dob}
                    onChange={(e) => handlePartnerInputChange('dob', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-sm text-[#F9FAFB]">{partnerData.dob || 'Please enter'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Address</label>
                {isEditing.personal ? (
                  <textarea
                    value={partnerData.address}
                    onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-sm text-[#F9FAFB] whitespace-pre-wrap">{partnerData.address || 'Please enter'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Pincode</label>
                {isEditing.personal ? (
                  <input
                    type="text"
                    value={partnerData.pincode}
                    onChange={(e) => handlePartnerInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                    maxLength={6}
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-sm text-[#F9FAFB]">{partnerData.pincode || 'Please enter'}</p>
                )}
              </div>
            </div>
          </div>


          {/* Bank Verification Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.bank.verified ? 'bg-[#10B981]/20' : 'bg-[#1F1A1A]'}`}>
                  <Building2 className={`w-5 h-5 ${verification.bank.verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Bank Details</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Account Number</label>
                    <input
                      type="text"
                      value={verification.bank.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      disabled={verification.bank.verified}
                    />
                    {verification.bank.verified && (
                      <p className="text-[#10B981] text-xs mt-1">✓ Bank verified - Cannot edit</p>
                    )}
                    {verification.bank.accountError && (
                      <p className="text-red-400 text-xs mt-1">{verification.bank.accountError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={verification.bank.ifsc}
                      onChange={(e) => handleBankChange('ifsc', e.target.value)}
                      placeholder="Enter IFSC code"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                      maxLength={11}
                      disabled={verification.bank.verified}
                    />
                    {verification.bank.ifscError && (
                      <p className="text-red-400 text-xs mt-1">{verification.bank.ifscError}</p>
                    )}
                  </div>
                </div>

                {verification.bank.accountNumber && verification.bank.ifsc && !verification.bank.verified && (
                  <div className="space-y-3">
                    <button
                      onClick={verifyBank}
                      disabled={verification.bank.loading}
                      className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {verification.bank.loading ? (
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Verifying...
                        </div>
                      ) : (
                        'Verify Bank Account'
                      )}
                    </button>
                    {verification.bank.error && (
                      <p className="text-red-400 text-xs text-center">{verification.bank.error}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={verification.bank.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      placeholder="Bank name"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      disabled={verification.bank.verified}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F9FAFB] mb-1">MICR Code</label>
                    <input
                      type="text"
                      value={verification.bank.micr}
                      onChange={(e) => handleBankChange('micr', e.target.value)}
                      placeholder="MICR code"
                      className="w-full px-3 py-2 text-sm bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      maxLength={9}
                      disabled={verification.bank.verified}
                    />
                  </div>
                </div>
              </div>

              {verification.bank.verified && (
                <div className="p-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-[#10B981] mr-1" />
                    <span className="text-xs font-semibold text-[#10B981]">Bank Account Verified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* NISM Upload Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.nism.verified ? 'bg-[#10B981]/20' : 'bg-[#1F1A1A]'}`}>
                <FileText className={`w-5 h-5 ${verification.nism.verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Are you an ARN Holder?</h3>
                <div className="text-[#9CA3AF] text-xs">
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="arnHolder"
                        value="yes"
                        checked={verification.nism.arnHolder === true}
                        onChange={(e) => {
                          setVerification(prev => ({
                            ...prev,
                            nism: {
                              ...prev.nism,
                              arnHolder: true,
                              arnNumber: '',
                              euinNumber: '',
                              fileName: '',
                              base64Data: ''
                            }
                          }));
                        }}
                        className="mr-2 accent-[#F59E0B]"
                      />
                      <span className="text-xs text-[#F9FAFB]">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="arnHolder"
                        value="no"
                        checked={verification.nism.arnHolder === false}
                        onChange={(e) => {
                          setVerification(prev => ({
                            ...prev,
                            nism: {
                              ...prev.nism,
                              arnHolder: false,
                              arnNumber: '',
                              euinNumber: '',
                              fileName: '',
                              base64Data: ''
                            }
                          }));
                        }}
                        className="mr-2 accent-[#F59E0B]"
                      />
                      <span className="text-xs text-[#F9FAFB]">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {!verification.nism.verified && !verification.nism.skipped ? (
              <div className="space-y-3">
                {verification.nism.arnHolder && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#F9FAFB] mb-1">ARN Number</label>
                        <input
                          type="text"
                          value={verification.nism.arnNumber}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            let error = "";
                            if (value && !/^ARN-\d{1,7}$/.test(value)) {
                              error = "ARN must start with ARN- followed by up to 7 digits (e.g., ARN-1234567)";
                            }
                            setVerification((prev) => ({
                              ...prev,
                              nism: {
                                ...prev.nism,
                                arnNumber: value,
                                arnError: error,
                              },
                            }));
                          }}
                          placeholder="e.g. ARN-1234567"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase bg-[#1F1A1A] text-[#F9FAFB] placeholder:text-[#9CA3AF] ${verification.nism.arnError ? "border-red-400" : "border-[#2A2A2A]"}`}
                          maxLength={11}
                        />
                        {verification.nism.arnError && (
                          <p className="text-red-400 text-xs mt-0.5">{verification.nism.arnError}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#F9FAFB] mb-1">EUIN Number</label>
                        <input
                          type="text"
                          value={verification.nism.euinNumber}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            let error = "";
                            if (value && !/^E\d{1,6}$/.test(value)) {
                              error = "EUIN must start with E followed by up to 6 digits (e.g., E123456)";
                            }
                            setVerification((prev) => ({
                              ...prev,
                              nism: {
                                ...prev.nism,
                                euinNumber: value,
                                euinError: error,
                              },
                            }));
                          }}
                          placeholder="e.g. E123456"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase bg-[#1F1A1A] text-[#F9FAFB] placeholder:text-[#9CA3AF] ${verification.nism.euinError ? "border-red-400" : "border-[#2A2A2A]"}`}
                          maxLength={7}
                        />
                        {verification.nism.euinError && (
                          <p className="text-red-400 text-xs mt-0.5">{verification.nism.euinError}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#F9FAFB] mb-1">Upload NISM Certificate</label>
                      <div
                        className="border border-dashed border-[#2A2A2A] rounded-lg p-3 text-center hover:border-[#F59E0B] transition-colors cursor-pointer bg-[#1F1A1A]"
                        onClick={() => document.getElementById('nism-upload')?.click()}
                      >
                        <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto mb-1" />
                        <p className="text-[#9CA3AF] text-xs">{verification.nism.fileName || 'Click to upload file'}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">JPEG, JPG, PNG, SVG, PDF • Max 1MB</p>
                        <input
                          id="nism-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.svg,.pdf"
                          onChange={(e) => handleNismUpload(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                      {verification.nism.uploadError && (
                        <p className="text-red-400 text-xs mt-1">{verification.nism.uploadError}</p>
                      )}
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  {verification.nism.arnHolder ? (
                    <button
                      onClick={uploadNismDocuments}
                      disabled={verification.nism.loading}
                      className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {verification.nism.loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Uploading...
                        </div>
                      ) : (
                        'Upload & Continue'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setVerification(prev => ({
                          ...prev,
                          nism: {
                            ...prev.nism,
                            skipped: true,
                            verified: true,
                            arnHolder: false
                          }
                        }));
                      }}
                      className="w-full bg-[#0A0A0A] text-[#F9FAFB] rounded-lg py-2 text-xs font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Skip (Not an ARN Holder)
                    </button>
                  )}
                  {verification.nism.arnHolder && (
                    <button
                      onClick={() => {
                        setVerification(prev => ({
                          ...prev,
                          nism: {
                            ...prev.nism,
                            skipped: true,
                            verified: true
                          }
                        }));
                      }}
                      className="flex-1 bg-[#0A0A0A] text-[#F9FAFB] rounded-lg py-2 text-xs font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              </div>
            ) : verification.nism.skipped ? (
              <div className="space-y-3">
                <div className="p-2 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-[#F59E0B] mr-1" />
                    <span className="text-xs font-semibold text-[#F59E0B]">
                      {verification.nism.arnHolder === false
                        ? 'NISM Upload Skipped (Not an ARN Holder)'
                        : 'NISM Upload Skipped'}
                    </span>
                  </div>
                  <p className="text-[#F59E0B] text-xs mt-1">
                    {verification.nism.arnHolder === false
                      ? 'You indicated you are not an ARN holder'
                      : 'You can upload NISM certificate later if needed'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVerification(prev => ({
                      ...prev,
                      nism: {
                        ...prev.nism,
                        skipped: false,
                        verified: false,
                        fileName: '',
                        base64Data: '',
                        arnNumber: '',
                        euinNumber: '',
                        arnHolder: undefined
                      }
                    }));
                  }}
                  className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {verification.nism.arnHolder === false ? 'I am an ARN Holder' : 'Upload NISM Certificate'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-[#10B981] mr-1" />
                    <span className="text-xs font-semibold text-[#10B981]">
                      {verification.nism.arnHolder
                        ? 'Uploaded Successfully'
                        : 'Completed Successfully'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#9CA3AF] space-y-0.5">
                  {verification.nism.arnHolder && (
                    <>
                      {verification.nism.fileName && <p><strong>File:</strong> {verification.nism.fileName}</p>}
                      {verification.nism.arnNumber && <p><strong>ARN:</strong> {verification.nism.arnNumber}</p>}
                      {verification.nism.euinNumber && <p><strong>EUIN:</strong> {verification.nism.euinNumber}</p>}
                    </>
                  )}
                  {verification.nism.arnHolder === false && (
                    <p><strong>Status:</strong> Not an ARN holder</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Complete Registration Card */}
          <div className="bg-[#111111] backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isAllVerified ? 'bg-[#10B981]/20' : 'bg-[#F59E0B]/20'}`}>
                <CheckCircle className={`w-5 h-5 ${isAllVerified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Complete Registration</h3>
                <p className="text-[#9CA3AF] text-xs">{calculateOverallProgress()}% Complete</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {partnerData.phone ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : (
                      <div className="w-4 h-4 text-red-400 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">×</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">Mobile</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {verification.aadhaar.verified ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : (
                      <div className="w-4 h-4 text-red-400 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">×</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">Aadhaar</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {verification.nism.arnHolder === true ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : verification.nism.arnHolder === false ? (
                      <div className="w-4 h-4 text-[#9CA3AF] mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">○</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 text-gray-500 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">-</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">ARN Holder</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {partnerData.name && partnerData.dob ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : (
                      <div className="w-4 h-4 text-red-400 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">×</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">Personal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {verification.pan.verified ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : (
                      <div className="w-4 h-4 text-red-400 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">×</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">PAN</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {verification.bank.verified ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : (
                      <div className="w-4 h-4 text-red-400 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">×</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">Bank</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    {verification.nism.verified ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981] mr-2" />
                    ) : verification.nism.skipped ? (
                      <div className="w-4 h-4 text-[#9CA3AF] mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">○</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 text-gray-500 mr-2 flex items-center justify-center">
                        <span className="text-lg font-bold">-</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#F9FAFB]">NISM</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCompleteRegistration}
              disabled={!isAllVerified || registrationStatus.loading}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registrationStatus.loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Creating User...
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;