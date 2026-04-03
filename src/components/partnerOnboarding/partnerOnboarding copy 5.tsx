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
import { useRouter } from 'next/navigation';
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

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

type Screen = 'welcome' | 'mobile-verification' | 'dashboard' | 'completion';

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
  REGISTRATION_STATUS: 'kyc_registration_status'
};

// Helper function to format dates for input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';

  // Handle different date formats
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString; // Already in YYYY-MM-DD format
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

  return dateString; // Return as is if cannot parse
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
  }, [key]); // Remove defaultValue from dependencies

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
  const [currentScreen, setCurrentScreen, isScreenInitialized] = useClientState<Screen>(
    STORAGE_KEYS.CURRENT_SCREEN, 
    'mobile-verification'
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const aadhaarOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const [partnerData, setPartnerData, isPartnerDataInitialized] = useClientState<PartnerRegistrationState>(
    STORAGE_KEYS.PARTNER_DATA,
    {
      name: '',
      email: '',
      phone: '',
      address: '',
      dob: '',
      age:'',
      gender:'',
      pincode: '',
      same_as_permanent: false,
      current_address: '',
      current_city: '',
      current_state: '',
      current_pincode: '',
      errors: {
        phone: '',
      }
    }
  );

  const [otpState, setOtpState, isOtpStateInitialized] = useClientState<OTPState>(
    STORAGE_KEYS.OTP_STATE,
    {
      otp: '',
      timer: 0,
      canResend: true,
      loading: false,
      error: ''
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

  // Check if all client states are initialized
  const isAllInitialized = 
    isScreenInitialized &&
    isPartnerDataInitialized &&
    isVerificationInitialized &&
    isOtpStateInitialized &&
    isAadhaarOtpStateInitialized &&
    isEmailOtpStateInitialized &&
    isAddressesInitialized &&
    isAddressIndexInitialized &&
    isEditingInitialized &&
    isRegistrationStatusInitialized;

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpState.timer > 0) {
      interval = setInterval(() => {
        setOtpState(prev => ({
          ...prev,
          timer: prev.timer - 1,
          canResend: prev.timer <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpState.timer, setOtpState]);

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

  // Show loading state during hydration
  if (!isAllInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Verification progress calculation
  const verificationProgress = () => {
    const steps = [
      verification.aadhaar.verified,
      verification.pan.verified,
      verification.bank.verified,
      verification.nism.verified,
      verification.email.verified
    ];
    const completed = steps.filter(Boolean).length;
    return (completed / steps.length) * 100;
  };

  const validatePartnerForm = (): boolean => {
    const errors = {
      phone: ''
    };

    if (!partnerData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(partnerData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    setPartnerData(prev => ({ ...prev, errors }));
    return !Object.values(errors).some(error => error !== '');
  };

  // Fetch user data from mobile API
  const fetchUserDataFromMobile = async (mobile: string) => {
    try {
      setIsFetchingUserData(true);

      const response = await api.post(
        `${ApiUrl}/decentro/log-mobile-to-account`,
        {
          mobile_number: mobile.trim(),
        }
      );

      const data = response.data;
      console.log('Full API Response Structure:', data);

      if (data && data.data && data.data.status === "S") {
        console.log('Data array to process:', data.data.data);
        await processApiResponse(data.data.data);
        toast.success("User data fetched successfully!");
      } else {
        const errorMessage = data?.data?.remark || "Failed to fetch user data";
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching data";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsFetchingUserData(false);
    }
  };

  const processApiResponse = async (apiResponse: any) => {
    try {
      console.log('Raw API Response:', apiResponse);

      const mobileToAccountData = apiResponse.find((item: any) => item.source === 'mobile_to_account');
      const financialData = apiResponse.find((item: any) => item.source === 'financial_service_data_pull');

      console.log('Mobile to Account Data:', mobileToAccountData);
      console.log('Financial Data:', financialData);

      // Process bank data from mobile_to_account
      if (mobileToAccountData?.response?.data) {
        const bankData = mobileToAccountData.response.data;
        console.log('Bank Data Found:', bankData);

        setVerification(prev => ({
          ...prev,
          bank: {
            ...prev.bank,
            accountNumber: bankData.accountNumber || '',
            ifsc: bankData.ifsc || '',
            verified: false
          }
        }));

        if (bankData.nameAsPerBank) {
          setPartnerData(prev => ({
            ...prev,
            name: bankData.nameAsPerBank.trim()
          }));
        }
      }

      // Process personal, identity, and address data from financial_service_data_pull
      if (financialData?.response?.data) {
        const financialDataResp = financialData.response.data;
        console.log('Financial Data Response:', financialDataResp);

        // Set personal info including DOB - FIXED SECTION
        if (financialDataResp.personalInfo) {
          const personalInfo = financialDataResp.personalInfo;
          console.log('Personal Info:', personalInfo);

          // Set name from personalInfo if not already set from bank data
          if (personalInfo.fullName && !partnerData.name) {
            setPartnerData(prev => ({
              ...prev,
              name: personalInfo.fullName.trim()
            }));
          }

          // Set DOB from personalInfo - THIS IS THE FIX
          if (personalInfo.dob) {
            console.log('Setting DOB from personalInfo:', personalInfo.dob);
            setPartnerData(prev => ({
              ...prev,
              dob: personalInfo.dob // Already in YYYY-MM-DD format
            }));
          }
        }

        // Set email data
        if (financialDataResp.emailInfo && financialDataResp.emailInfo.length > 0) {
          const emailData = financialDataResp.emailInfo[0];
          console.log('Email Data:', emailData);

          const emailValue = (emailData.emailAddress || '').toLowerCase();
          setVerification(prev => ({
            ...prev,
            email: {
              ...prev.email,
              value: emailValue,
              verified: false // Set to false initially, will require OTP verification
            }
          }));
          setPartnerData(prev => ({
            ...prev,
            email: emailValue
          }));
          console.log('Setting Email:', emailValue);
        }

        // Set PAN data
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

        // Set Aadhaar data
        if (financialDataResp.identityInfo?.aadhaarNumber && financialDataResp.identityInfo.aadhaarNumber.length > 0) {
          const aadhaarData = financialDataResp.identityInfo.aadhaarNumber[0];
          console.log('Aadhaar Data:', aadhaarData);

          setVerification(prev => ({
            ...prev,
            aadhaar: {
              ...prev.aadhaar,
              value: formatAadhaar(aadhaarData.idNumber || ''),
              verified: false // Set to false initially, will require OTP verification
            }
          }));
        }

        // Set addresses
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

        // Set phone data if needed
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
      toast.error('Error processing user data');
    }
  };

  const sentOtpForMobileVerification = async () => {
    if (!validatePartnerForm()) return;

    try {
      setOtpState(prev => ({ ...prev, loading: true, error: '' }));

      const otpResponse = await PartnerService.sendOtpForMobileVerification({
        mobile: partnerData.phone,
        userType: 4,
      });

      if (otpResponse && otpResponse.data && otpResponse.data.status === 'S') {
        setOtpState({
          otp: '',
          timer: 30,
          canResend: false,
          loading: false,
          error: ''
        });
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      } else {
        const errorMessage = (otpResponse && otpResponse.data?.remark) ? otpResponse.data.remark : 'Failed to send OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while sending OTP';
      setOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // OTP Input Handlers for mobile verification
  const handleOTPChange = (value: string, index: number) => {
    const newOtp = otpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    setOtpState(prev => ({ ...prev, otp: otpString, error: '' }));

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Input Handlers for Aadhaar verification
  const handleAadhaarOTPChange = (value: string, index: number) => {
    const newOtp = aadhaarOtpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    setAadhaarOtpState(prev => ({ ...prev, otp: otpString, error: '' }));

    if (value && index < 5) {
      aadhaarOtpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Input Handlers for Email verification
  const handleEmailOTPChange = (value: string, index: number) => {
    const newOtp = emailOtpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    setEmailOtpState(prev => ({ ...prev, otp: otpString, error: '' }));

    if (value && index < 5) {
      emailOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpState.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('');

    digits.forEach((digit, index) => {
      if (index < 6) {
        handleOTPChange(digit, index);
      }
    });
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

  // Main function that handles OTP verification + API call
  const handleVerifyAndContinue = async () => {
    if (otpState.otp.length !== 6) {
      setOtpState(prev => ({ ...prev, error: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    try {
      setOtpState(prev => ({ ...prev, loading: true, error: '' }));

      const otpVerifyResponse = await PartnerService.verifyOtpForMobile({
        mobile: partnerData.phone,
        userType: 4,
        otp: otpState.otp
      });

      if (otpVerifyResponse && otpVerifyResponse.data && otpVerifyResponse.data.status === 'S') {
        await fetchUserDataFromMobile(partnerData.phone);

        setOtpState(prev => ({ ...prev, loading: false }));
        setCurrentScreen('dashboard');
        // toast.success('Mobile number verified and user data fetched successfully!');
      } else {
        const errorMessage = (otpVerifyResponse && otpVerifyResponse.data?.remark) ? otpVerifyResponse.data.remark : 'OTP verification failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during verification';
      setOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // Send OTP for Aadhaar verification
  const sendAadhaarOTP = async () => {
    if (!verification.aadhaar.value || verification.aadhaar.value.length !== 14) {
      setVerification(prev => ({
        ...prev,
        aadhaar: { 
          ...prev.aadhaar, 
          error: 'Please enter a valid Aadhaar number',
          otpError: ''
        }
      }));
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
        aadhaar: aadhaarNumber
      });

      const response = await PartnerService.sendOtpForAadhaarVerification({
        mobile: partnerData.phone,
        aadhaar: aadhaarNumber
      });

      console.log('Aadhaar OTP Response:', response);

      if (response && response.data && response.data.status === 'S') {
        const userRegArray = response.data.userReg[1];
        const refId = userRegArray.ref_id;

        console.log('Extracted ref_id:', refId);

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
        const errorMessage = response?.data?.remark || 'Failed to send Aadhaar OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Aadhaar OTP Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while sending Aadhaar OTP';
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

  // Send OTP for Email verification
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
        //const userRegArray = response.data.userReg[1];
        //const refId = userRegArray.ref_id;

        //console.log('Extracted ref_id:', refId);

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

      console.log(response.data);

      if (response && response.data && response.data.status === 'S') {
          const aadhaarData = response.data.userReg[0];
  
          setPartnerData(prev => ({
              ...prev,
              name: aadhaarData.name?.trim() || prev.name,
              dob: aadhaarData.dob?.trim() || prev.dob,
              address: aadhaarData.address?.trim() || prev.address,
              pincode: aadhaarData.split_address?.pincode?.trim() || prev.pincode,
          }));
          setAadhaarOtpState(prev => ({ ...prev, verifying: false }));
          toggleEdit('aadhaar')
          setVerification(prev => ({
            ...prev,
            aadhaar: { ...prev.aadhaar, verified: true, error: '' }
          }));
  
          toast.success('Aadhaar verified successfully!');
        } else {
          const errorMessage = response?.data?.remark || 'Invalid Aadhaar OTP';
          throw new Error(errorMessage);
        }
    } catch (error: any) {
      const errorMessage = error.message || 'Aadhaar OTP verification failed';
      setAadhaarOtpState(prev => ({
        ...prev,
        verifying: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
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
      });

      setEmailOtpState(prev => ({ ...prev, verifying: false }));
      toggleEdit('email')
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

  // PAN Validation Function
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

        // IMPORTANT: Allow registration even if KYC is pending
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
          verified: isKycPending, // Allow pending status
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

  // Bank Verification Function
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
        bankAcIfsc: verification.bank.ifsc
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
    try {
      setAadhaarOtpState(prev => ({ ...prev, loading: true, error: '' }));

      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAadhaarOtpState({
        otp: '',
        timer: 30,
        canResend: false,
        loading: false,
        error: '',
        sent: true,
        verifying: false
      });

      aadhaarOtpInputRefs.current.forEach(ref => {
        if (ref) ref.value = '';
      });
      aadhaarOtpInputRefs.current[0]?.focus();
      toast.success('Aadhaar OTP sent successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while resending OTP';
      setAadhaarOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  const resendEmailOTP = async () => {
    try {
      setEmailOtpState(prev => ({ ...prev, loading: true, error: '' }));

      // Simulate API call - replace with actual API
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
      aadhaar: { ...prev.aadhaar, value: formatted, error: '', verified: false }
    }));
    // Reset OTP state when Aadhaar changes
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
    // Also update partnerData email
    setPartnerData(prev => ({
      ...prev,
      email: formatted
    }));
    // Reset OTP state when Email changes
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

  const resendOTP = async () => {
    try {
      setOtpState(prev => ({ ...prev, loading: true, error: '' }));

      await PartnerService.sendOtpForMobileVerification({
        mobile: partnerData.phone,
        userType: 4
      });

      setOtpState({
        otp: '',
        timer: 30,
        canResend: false,
        loading: false,
        error: ''
      });
      otpInputRefs.current.forEach(ref => {
        if (ref) ref.value = '';
      });
      otpInputRefs.current[0]?.focus();
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while resending OTP';
      setOtpState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // Simple toggle edit function - no API calls
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

  // Helper function to check if ARN requirements are complete
  const isARNComplete = () => {
    if (verification.nism.arnHolder === true) {
      // If user selected "Yes" for ARN holder, then ARN, EUIN and document are required
      return verification.nism.arnNumber && 
            verification.nism.euinNumber && 
            verification.nism.verified;
    } else if (verification.nism.arnHolder === false) {
      // If user selected "No" for ARN holder, then it's considered complete
      return true;
    }
    // If ARN holder status is not selected yet, it's not complete
    return false;
  };

  // Calculate overall progress based on specified fields only
  const calculateOverallProgress = () => {
    const steps = [
      !!partnerData.phone, // Mobile
      !!(partnerData.name && partnerData.dob), // Personal Details
      verification.aadhaar.verified, // Aadhaar
      verification.pan.verified, // PAN
      verification.email.verified, // Email
      isARNComplete(), // ARN (with conditional logic)
    ];
    
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  // Update isAllVerified to use the new calculation
  const isAllVerified = calculateOverallProgress() === 100;

  // Single API call for complete registration
  const handleCompleteRegistration = async () => {
    if (!isAllVerified) {
      toast.error('Please complete all verification steps before proceeding');
      return;
    }

    try {
      setRegistrationStatus(prev => ({ ...prev, loading: true, error: '' }));

      // Single API call with ALL data
      const response = await PartnerService.createPartnerUser(
        partnerData,
        verification
      );

      if (response && response.data && response.data.status === 'S') {
        setRegistrationStatus(prev => ({ ...prev, loading: false }));
        
        // Clear localStorage when registration is complete
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
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Mobile Verification Screen
  if (currentScreen === 'mobile-verification') {
    return (
      <div className="bg-gradient-to-br from-blue-50/80 via-white/70 to-purple-50/80 backdrop-blur-xl flex items-center justify-center p-8 rounded-3xl shadow-2xl border border-white/30">
        <div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Register with Mobile</h1>
            <p className="text-gray-600 text-sm">We'll send you a verification code to proceed</p>
          </div>

          <div className="space-y-4">
            {/* Mobile Input Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {otpSent ? 'Verification Code Sent' : 'Enter Mobile Number'}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {otpSent
                      ? `Code sent to ${partnerData.phone}`
                      : 'We\'ll send you a verification code'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="text-gray-500 text-sm font-medium mr-1">+91</span>
                      <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    </div>
                    <input
                      type="tel"
                      value={partnerData.phone}
                      onChange={(e) => handlePartnerInputChange('phone', e.target.value)}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-16 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all duration-200"
                      maxLength={10}
                      disabled={otpSent} // Disable input when OTP is sent
                    />
                  </div>
                  {partnerData.errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                      {partnerData.errors.phone}
                    </p>
                  )}
                </div>

                {/* Send OTP Button - Shows countdown when OTP sent */}
                {!otpSent ? (
                  <button
                    onClick={sentOtpForMobileVerification}
                    disabled={!partnerData.phone || partnerData.phone.length !== 10 || otpState.loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {otpState.loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending OTP...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Send Verification Code
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-blue-700 text-sm font-medium">OTP Sent Successfully</span>
                    </div>
                    <div className="text-blue-600 text-sm font-semibold">
                      {otpState.timer > 0 ? `${otpState.timer}s` : 'Expired'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OTP Verification Section - Only shows when OTP is sent */}
            {otpSent && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-md animate-in fade-in duration-500">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Enter Verification Code</h3>
                    <p className="text-gray-600 text-xs">
                      Code sent to <span className="font-semibold">{partnerData.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* OTP Input Boxes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                      6-digit Verification Code
                    </label>
                    <div className="flex justify-center space-x-2 mb-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          onChange={(e) => handleOTPChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={handlePaste}
                          className="w-10 h-11 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                          disabled={otpState.loading || isFetchingUserData} // Disable during verification
                        />
                      ))}
                    </div>
                    {otpState.error && (
                      <p className="text-red-500 text-xs text-center flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                        {otpState.error}
                      </p>
                    )}
                  </div>

                  {/* Timer and Resend */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-gray-600 flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {otpState.timer > 0 ? `Resend in ${otpState.timer}s` : "Ready to resend"}
                    </span>
                    <button
                      onClick={resendOTP}
                      disabled={!otpState.canResend || otpState.loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 flex items-center transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {otpState.loading ? 'Resending...' : 'Resend Code'}
                    </button>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyAndContinue}
                    disabled={otpState.otp.length !== 6 || otpState.loading || isFetchingUserData}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {otpState.loading || isFetchingUserData ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {isFetchingUserData ? 'Fetching Your Data...' : 'Verifying Code...'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Continue
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <Shield className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800">Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Never share your OTP with anyone. Our team will never ask for your verification code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (currentScreen === 'completion') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">Registration Completed Successfully!</h1>
          <p className="text-gray-600 text-sm mb-4">
            Your partner account has been created successfully. You can now login to access your dashboard.
          </p>

          <div className="bg-white/60 rounded-lg p-4 mb-4 text-left border border-gray-200/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Mobile Number</p>
                <p className="font-semibold text-gray-900">{partnerData.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{partnerData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{partnerData.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-900">{partnerData.dob || 'Please enter'}</p>
              </div>
              <div>
                <p className="text-gray-600">PAN Number</p>
                <p className="font-semibold text-gray-900">{verification.pan.value}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              clearLocalStorage();
              setCurrentScreen('mobile-verification');
              router.push('/login');
            }}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm rounded-xl shadow-md p-6 border border-blue-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <ShieldUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partner Registration</h1>
                <p className="text-gray-600 text-sm mt-1">Complete verification steps to activate your partner account</p>
                
                {/* Progress Stats */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">
                      <span className="font-semibold">{Math.round(calculateOverallProgress())}%</span> Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Verification Badge */}
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs font-semibold text-green-700">Mobile Verified</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{partnerData.phone}</p>
            </div>
          </div>
        </div>

        {/* Verification Steps Grid - Equal height columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          
          {/* Column 1 - Personal Details */}
          <div className="flex flex-col space-y-4">
            {/* Personal Details Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Personal Details</h3>
                    <p className="text-gray-600 text-xs">Your personal information</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleEdit('personal')}
                  className={`flex items-center px-2 py-1.5 rounded text-xs ${
                    isEditing.personal
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
                >
                  {isEditing.personal ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                  {isEditing.personal ? 'Save' : 'Edit'}
                </button>
              </div>

              {/* Full Name and DOB - Outside sections */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={partnerData.name}
                      onChange={(e) => handlePartnerInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                      {partnerData.name || 'Please enter'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing.personal ? (
                    <input
                      type="date"
                      value={partnerData.dob}
                      onChange={(e) => handlePartnerInputChange('dob', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                      {partnerData.dob || 'Please enter'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* PERMANENT ADDRESS SECTION */}
                <div className="p-3 bg-gray-50 border rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm text-gray-800">Permanent Address</h4>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    {isEditing.personal ? (
                      <textarea
                        rows={2}
                        value={partnerData.address}
                        onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white rounded-lg border text-sm whitespace-pre-wrap">
                        {partnerData.address || 'Please enter'}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                    {isEditing.personal ? (
                      <input
                        type="text"
                        maxLength={6}
                        value={partnerData.pincode}
                        onChange={(e) => handlePartnerInputChange('pincode', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white rounded-lg border text-sm">
                        {partnerData.pincode || 'Please enter'}
                      </p>
                    )}
                  </div>
                </div>

                {/* CURRENT ADDRESS SECTION */}
                <div className="p-3 bg-gray-50 border rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm text-gray-800">Current Address</h4>

                  {/* Checkbox */}
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={partnerData.same_as_permanent || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setPartnerData(prev => ({
                          ...prev,
                          same_as_permanent: isChecked,
                          current_address: isChecked ? prev.address : prev.current_address,
                          current_city: isChecked ? '' : prev.current_city,
                          current_state: isChecked ? '' : prev.current_state,
                          current_pincode: isChecked ? prev.pincode : prev.current_pincode
                        }));
                      }}
                    />
                    <span className="text-xs text-gray-700">Same as Permanent Address</span>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    {isEditing.personal ? (
                      <textarea
                        rows={2}
                        disabled={partnerData.same_as_permanent}
                        value={partnerData.current_address || ''}
                        onChange={(e) => handlePartnerInputChange('current_address', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white rounded-lg border text-sm whitespace-pre-wrap">
                        {partnerData.current_address || 'Please enter'}
                      </p>
                    )}
                  </div>

                  {/* City in one line */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    {isEditing.personal ? (
                      <input
                        type="text"
                        disabled={partnerData.same_as_permanent}
                        value={partnerData.current_city || ''}
                        onChange={(e) => handlePartnerInputChange('current_city', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white rounded-lg border text-sm">
                        {partnerData.current_city || 'Please enter'}
                      </p>
                    )}
                  </div>

                  {/* State and Pincode in second line */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* State */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                      {isEditing.personal ? (
                        <select
                          disabled={partnerData.same_as_permanent}
                          value={partnerData.current_state || ''}
                          onChange={(e) => handlePartnerInputChange('current_state', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select State</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-lg border text-sm">
                          {partnerData.current_state || 'Please enter'}
                        </p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                      {isEditing.personal ? (
                        <input
                          type="text"
                          maxLength={6}
                          disabled={partnerData.same_as_permanent}
                          value={partnerData.current_pincode || ''}
                          onChange={(e) => handlePartnerInputChange('current_pincode', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-lg border text-sm">
                          {partnerData.current_pincode || 'Please enter'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 - Aadhaar, PAN, Bank */}
          <div className="flex flex-col space-y-4">
            {/* Aadhaar Verification Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.aadhaar.verified ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                    <Fingerprint className={`w-5 h-5 ${verification.aadhaar.verified ? 'text-green-600' : 'text-blue-600'
                      }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Aadhaar Verification</h3>
                    <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                  </div>
                </div>
                  <button
                    onClick={() => toggleEdit('aadhaar')}
                    className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.aadhaar
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                  >
                    {isEditing.aadhaar ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                    {isEditing.aadhaar ? 'Save' : 'Edit'}
                  </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number</label>
                  {isEditing.aadhaar ? (
                    <input
                      type="text"
                      value={verification.aadhaar.value}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                      placeholder="Enter 12-digit Aadhaar"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={14}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      {verification.aadhaar.value ? maskAadhar(verification.aadhaar.value) : 'Please enter'}
                    </p>
                  )}
                </div>

                {/* Aadhaar Verification Button and OTP Section */}
                {!verification.aadhaar.verified && (
                  <div className="space-y-3">
                    <button
                      onClick={sendAadhaarOTP}
                      disabled={verification.aadhaar.loading || aadhaarOtpState.sent}
                      className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
                    >
                      {verification.aadhaar.loading ? (
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Sending OTP...
                        </div>
                      ) : aadhaarOtpState.sent ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          OTP Sent
                        </div>
                      ) : (
                        'Verify Aadhaar'
                      )}
                    </button>

                    {/* Aadhaar OTP Input Section */}
                    {aadhaarOtpState.sent && (
                      <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            6-digit Aadhaar OTP
                          </label>
                          <div className="flex justify-center space-x-2 mb-3">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                ref={(el) => {
                                  aadhaarOtpInputRefs.current[index] = el;
                                }}
                                type="text"
                                maxLength={1}
                                onChange={(e) => handleAadhaarOTPChange(e.target.value, index)}
                                onKeyDown={(e) => handleAadhaarKeyDown(e, index)}
                                onPaste={handleAadhaarPaste}
                                className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                disabled={aadhaarOtpState.verifying}
                              />
                            ))}
                          </div>
                          {aadhaarOtpState.error && (
                            <p className="text-red-500 text-xs text-center">{aadhaarOtpState.error}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-gray-600">
                            {aadhaarOtpState.timer > 0 ? `Resend in ${aadhaarOtpState.timer}s` : "Ready to resend"}
                          </span>
                          <button
                            onClick={resendAadhaarOTP}
                            disabled={!aadhaarOtpState.canResend || aadhaarOtpState.loading}
                            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                          >
                            {aadhaarOtpState.loading ? 'Resending...' : 'Resend OTP'}
                          </button>
                        </div>

                        <button
                          onClick={verifyAadhaarOTP}
                          disabled={aadhaarOtpState.otp.length !== 6 || aadhaarOtpState.verifying}
                          className="w-full bg-green-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
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
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-800">Aadhaar Verified</span>
                    </div>
                  </div>
                )}

                {verification.aadhaar.error && (
                  <p className="text-red-500 text-xs">{verification.aadhaar.error}</p>
                )}
              </div>
            </div>

            {/* PAN Verification Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    verification.pan.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <IdCard className={`w-5 h-5 ${
                      verification.pan.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">PAN Verification</h3>
                    <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                  </div>
                </div>

                {/* Show edit button only when PAN data is Please enter */}
                {!verification.pan.value && (
                  <button
                    onClick={() => toggleEdit('pan')}
                    className={`flex items-center px-2 py-1.5 rounded text-xs ${
                      isEditing.pan
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {isEditing.pan ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                    {isEditing.pan ? 'Save' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                  {isEditing.pan ? (
                    <input
                      type="text"
                      value={verification.pan.value}
                      onChange={(e) => handlePanChange(e.target.value)}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      maxLength={10}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm">
                      {verification.pan.value || 'Please enter'}
                    </p>
                  )}
                </div>

                {/* PAN Verification Button */}
                {verification.pan.value && !verification.pan.verified && (
                  <div className="space-y-2">
                    <button
                      onClick={verifyPAN}
                      disabled={verification.pan.loading}
                      className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
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
                      <p className="text-red-500 text-xs text-center">{verification.pan.error}</p>
                    )}
                  </div>
                )}

                {verification.pan.verified && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-800">PAN Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Verification Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    verification.bank.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Building2 className={`w-5 h-5 ${
                      verification.bank.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Bank Verification</h3>
                    <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleEdit('bank')}
                  className={`flex items-center px-2 py-1.5 rounded text-xs ${
                    isEditing.bank
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
                >
                  {isEditing.bank ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                  {isEditing.bank ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Account Number</label>
                      {isEditing.bank ? (
                        <input
                          type="text"
                          value={verification.bank.accountNumber}
                          onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                          placeholder="Enter account number"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                          {verification.bank.accountNumber ? verification.bank.accountNumber : 'Please enter'}
                        </p>
                      )}
                      {verification.bank.accountError && (
                        <p className="text-red-500 text-xs mt-1">{verification.bank.accountError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code</label>
                      {isEditing.bank ? (
                        <input
                          type="text"
                          value={verification.bank.ifsc}
                          onChange={(e) => handleBankChange('ifsc', e.target.value)}
                          placeholder="Enter IFSC code"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                          maxLength={11}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                          {verification.bank.ifsc || 'Please enter'}
                        </p>
                      )}
                      {verification.bank.ifscError && (
                        <p className="text-red-500 text-xs mt-1">{verification.bank.ifscError}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bank Verification Button */}
                  {verification.bank.accountNumber && verification.bank.ifsc && !verification.bank.verified && (
                    <div className="space-y-3">
                      <button
                        onClick={verifyBank}
                        disabled={verification.bank.loading}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
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
                        <p className="text-red-500 text-xs text-center">{verification.bank.error}</p>
                      )}
                    </div>
                  )}

                  {/* New Bank Name and MICR Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                      {isEditing.bank ? (
                        <input
                          type="text"
                          value={verification.bank.bankName}
                          onChange={(e) => handleBankChange('bankName', e.target.value)}
                          placeholder="Bank name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                          {verification.bank.bankName || 'Please enter'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">MICR Code</label>
                      {isEditing.bank ? (
                        <input
                          type="text"
                          value={verification.bank.micr}
                          onChange={(e) => handleBankChange('micr', e.target.value)}
                          placeholder="MICR code"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={9}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                          {verification.bank.micr || 'Please enter'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {verification.bank.verified && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-800">Bank Account Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3 - Email, NISM, Complete Registration */}
          <div className="flex flex-col space-y-4">
            {/* Email Verification Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    verification.email.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Mail className={`w-5 h-5 ${
                      verification.email.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Email Verification</h3>
                    <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleEdit('email')}
                  className={`flex items-center px-2 py-1.5 rounded text-xs ${
                    isEditing.email
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
                >
                  {isEditing.email ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                  {isEditing.email ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  {isEditing.email ? (
                    <input
                      type="email"
                      value={verification.email.value}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm">
                      {verification.email.value ? verification.email.value : 'Please enter'}
                    </p>
                  )}
                </div>

                {/* Email Verification Button and OTP Section */}
                {verification.email.value && !verification.email.verified && (
                  <div className="space-y-3">
                    <button
                      onClick={sendEmailOTP}
                      disabled={verification.email.loading || emailOtpState.sent}
                      className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
                    >
                      {verification.email.loading ? (
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Sending OTP...
                        </div>
                      ) : emailOtpState.sent ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          OTP Sent
                        </div>
                      ) : (
                        'Verify Email'
                      )}
                    </button>

                    {/* Email OTP Input Section */}
                    {emailOtpState.sent && (
                      <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            6-digit Email OTP
                          </label>
                          <div className="flex justify-center space-x-2 mb-3">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                ref={(el) => {
                                  emailOtpInputRefs.current[index] = el;
                                }}
                                type="text"
                                maxLength={1}
                                onChange={(e) => handleEmailOTPChange(e.target.value, index)}
                                onKeyDown={(e) => handleEmailKeyDown(e, index)}
                                onPaste={handleEmailPaste}
                                className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                disabled={emailOtpState.verifying}
                              />
                            ))}
                          </div>
                          {emailOtpState.error && (
                            <p className="text-red-500 text-xs text-center">{emailOtpState.error}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-gray-600">
                            {emailOtpState.timer > 0 ? `Resend in ${emailOtpState.timer}s` : "Ready to resend"}
                          </span>
                          <button
                            onClick={resendEmailOTP}
                            disabled={!emailOtpState.canResend || emailOtpState.loading}
                            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                          >
                            {emailOtpState.loading ? 'Resending...' : 'Resend OTP'}
                          </button>
                        </div>

                        <button
                          onClick={verifyEmailOTP}
                          disabled={emailOtpState.otp.length !== 6 || emailOtpState.verifying}
                          className="w-full bg-green-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
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

                {verification.email.verified && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-800">Email Verified</span>
                    </div>
                  </div>
                )}

                {verification.email.error && (
                  <p className="text-red-500 text-xs">{verification.email.error}</p>
                )}
              </div>
            </div>

            {/* NISM Upload Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  verification.nism.verified ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    verification.nism.verified ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Are you an ARN Holder?</h3>
                  <div className="text-gray-600 text-xs">
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
                                // Reset fields when switching to no
                                arnNumber: '',
                                euinNumber: '',
                                fileName: '',
                                base64Data: ''
                              }
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs text-gray-700">Yes</span>
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
                                // Clear fields when selecting no
                                arnNumber: '',
                                euinNumber: '',
                                fileName: '',
                                base64Data: ''
                              }
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!verification.nism.verified && !verification.nism.skipped ? (
                <div className="space-y-3">
                  {/* ARN Holder Fields - Only show if user selected Yes */}
                  {verification.nism.arnHolder && (
                    <>
                      {/* ARN Number and EUIN Number in one line */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            ARN Number
                          </label>
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
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                              verification.nism.arnError ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            maxLength={11}
                          />
                          {verification.nism.arnError && (
                            <p className="text-red-500 text-xs mt-0.5">{verification.nism.arnError}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            EUIN Number
                          </label>
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
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                              verification.nism.euinError ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            maxLength={7}
                          />
                          {verification.nism.euinError && (
                            <p className="text-red-500 text-xs mt-0.5">{verification.nism.euinError}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Upload NISM Certificate
                        </label>
                        <div
                          className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => document.getElementById('nism-upload')?.click()}
                        >
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-gray-600 text-xs">
                            {verification.nism.fileName || 'Click to upload file'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            JPEG, JPG, PNG, SVG, PDF • Max 1MB
                          </p>
                          <input
                            id="nism-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.svg,.pdf"
                            onChange={(e) => handleNismUpload(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                        {verification.nism.uploadError && (
                          <p className="text-red-500 text-xs mt-1">{verification.nism.uploadError}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {verification.nism.arnHolder ? (
                      // Show Upload button only for ARN holders
                      <button
                        onClick={uploadNismDocuments}
                        disabled={verification.nism.loading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
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
                      // Show Skip button for non-ARN holders (full width)
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
                        className="w-full bg-gray-500 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Skip (Not an ARN Holder)
                      </button>
                    )}

                    {/* Show Skip button for ARN holders as well (optional) */}
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
                        className="flex-1 bg-gray-500 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              ) : verification.nism.skipped ? (
                <div className="space-y-3">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-yellow-600 mr-1" />
                      <span className="text-xs font-semibold text-yellow-800">
                        {verification.nism.arnHolder === false
                          ? 'NISM Upload Skipped (Not an ARN Holder)'
                          : 'NISM Upload Skipped'
                        }
                      </span>
                    </div>
                    <p className="text-yellow-700 text-xs mt-1">
                      {verification.nism.arnHolder === false
                        ? 'You indicated you are not an ARN holder'
                        : 'You can upload NISM certificate later if needed'
                      }
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
                          arnHolder: undefined // Reset the selection
                        }
                      }));
                    }}
                    className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {verification.nism.arnHolder === false ? 'I am an ARN Holder' : 'Upload NISM Certificate'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-800">
                        {verification.nism.arnHolder
                          ? 'Uploaded Successfully'
                          : 'Completed Successfully'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 flex-1">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  isAllVerified ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <CheckCircle className={`w-5 h-5 ${
                    isAllVerified ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Complete Registration</h3>
                  <p className="text-gray-600 text-xs">{calculateOverallProgress()}% Complete</p>
                </div>
              </div>

              {/* Verification Status Details - Two Columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                {/* Column 1 */}
                <div className="space-y-2">
                  {/* Mobile Verification */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {partnerData.phone ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">Mobile</span>
                    </div>
                  </div>

                  {/* Aadhaar Verification */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.aadhaar.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">Aadhaar</span>
                    </div>
                  </div>

                  {/* Email Verification */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.email.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">Email</span>
                    </div>
                  </div>

                  {/* ARN Status */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.nism.arnHolder === true ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : verification.nism.arnHolder === false ? (
                        <div className="w-4 h-4 text-gray-400 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">○</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 text-gray-300 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">-</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">ARN Holder</span>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-2">
                  {/* Personal Details */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {partnerData.name && partnerData.dob ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">Personal</span>
                    </div>
                  </div>

                  {/* PAN Verification */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.pan.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">PAN</span>
                    </div>
                  </div>

                  {/* Bank Account Verification */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.bank.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">×</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">Bank</span>
                    </div>
                  </div>

                  {/* NISM Certificate */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      {verification.nism.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : verification.nism.skipped ? (
                        <div className="w-4 h-4 text-gray-400 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">○</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 text-gray-300 mr-2 flex items-center justify-center">
                          <span className="text-lg font-bold">-</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">NISM</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompleteRegistration}
                disabled={!isAllVerified || registrationStatus.loading}
                className="w-full bg-green-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default KYCVerification;