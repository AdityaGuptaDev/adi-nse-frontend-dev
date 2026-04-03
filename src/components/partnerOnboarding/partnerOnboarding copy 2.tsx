"use client";

import React, { useState, useEffect, useRef } from 'react';
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

const KYCVerification: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mobile-verification');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState({
    aadhaar: false,
    pan: false,
    bank: false,
    email: false,
    personal: false
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const aadhaarOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const [partnerData, setPartnerData] = useState<PartnerRegistrationState>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    age:'',
    gender:'',
    pincode: '',
    errors: {
      phone: '',
    }
  });

  const [otpState, setOtpState] = useState<OTPState>({
    otp: '',
    timer: 0,
    canResend: true,
    loading: false,
    error: ''
  });

  const [aadhaarOtpState, setAadhaarOtpState] = useState({
    otp: '',
    timer: 0,
    canResend: true,
    loading: false,
    error: '',
    sent: false,
    verifying: false
  });

  const [verification, setVerification] = useState<VerificationState>({
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

  const [addresses, setAddresses] = useState<Array<{
    sequence: string;
    address: string;
    state: string;
    type: string;
    postal: string;
  }>>([]);

  const [registrationStatus, setRegistrationStatus] = useState<{
    loading: boolean;
    data: any;
    error: string;
  }>({
    loading: false,
    data: null,
    error: ''
  });

  const [isFetchingUserData, setIsFetchingUserData] = useState(false);

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
  }, [otpState.timer]);

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
  }, [aadhaarOtpState.timer]);

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
            verified: !!bankData.accountNumber
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
              verified: !!emailData.emailAddress
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
              verified: !!formatAadhaar(aadhaarData.idNumber || '')
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

  // Aadhaar Verification Functions
  /*const sendAadhaarOTP = async () => {
    if (!verification.aadhaar.value || verification.aadhaar.value.length !== 14) {
      setVerification(prev => ({
        ...prev,
        aadhaar: { ...prev.aadhaar, error: 'Please enter a valid 12-digit Aadhaar number' }
      }));
      return;
    }

    try {
      setVerification(prev => ({
        ...prev,
        aadhaar: { ...prev.aadhaar, loading: true, error: '' }
      }));

      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with actual API call:
      // const response = await PartnerService.sendAadhaarOTP({
      //   aadhaar: verification.aadhaar.value.replace(/\s/g, '')
      // });

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
        aadhaar: { ...prev.aadhaar, loading: false }
      }));

      toast.success('Aadhaar OTP sent successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send Aadhaar OTP';
      setVerification(prev => ({
        ...prev,
        aadhaar: { ...prev.aadhaar, loading: false, error: errorMessage }
      }));
      toast.error(errorMessage);
    }
  };*/

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

      // Extract ref_id from the nested response structure
      let refId = '';
      
      if (response && response.data && response.data.status === 'S') {

        
        // Find the object with ref_id in userReg array
        
        console.log("response.data.status---",response.data.status);

        const userRegArray = response.data.userReg[1];

        console.log("userRegArray---",userRegArray);

        const refId =userRegArray.ref_id;

        console.log('Extracted ref_id:', refId);
        console.log('Extracted ref_id:', userRegArray.ref_id);

        setAadhaarOtpState({
          otp: '',
          timer: 30,
          canResend: false,
          loading: false,
          error: '',
          sent: true,
          verifying: false
        });

        /*setVerification(prev => ({
          ...prev,
          aadhaar: { ...prev.aadhaar, loading: false }
        }));*/

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

  const verifyAadhaarOTP = async () => {
    if (aadhaarOtpState.otp.length !== 6) {
      setAadhaarOtpState(prev => ({ ...prev, error: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    try {
      setAadhaarOtpState(prev => ({ ...prev, verifying: true, error: '' }));

      // Simulate API call - replace with actual API
      //await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with actual API call:
      // const response = await PartnerService.verifyAadhaarOTP({
      //   aadhaar: verification.aadhaar.value.replace(/\s/g, ''),
      //   otp: aadhaarOtpState.otp
      // });

      /*console.log("Aadhaar OTP Verification Request:");
      console.log("Mobile:", partnerData.phone);
      console.log("Aadhaar:", verification.aadhaar.value.replace(/\s+/g, ''));
      console.log("OTP:", aadhaarOtpState.otp);
      console.log("Ref ID:", verification.aadhaar.ref_id);*/

      const response = await PartnerService.verifyOtpForAadhaarVerification({
        mobile: partnerData.phone,
        aadhaar: verification.aadhaar.value.replace(/\s+/g, ''),
        otp: aadhaarOtpState.otp,
        ref_id: verification.aadhaar.ref_id
      });

      setAadhaarOtpState(prev => ({ ...prev, verifying: false }));
      toggleEdit('aadhaar')
      setVerification(prev => ({
        ...prev,
        aadhaar: { ...prev.aadhaar, verified: true, error: '' }
      }));

      toast.success('Aadhaar verified successfully!');
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

  // PAN Verification Function
  const verifyPAN = async () => {
    if (!verification.pan.value || verification.pan.value.length !== 10) {
      setVerification(prev => ({
        ...prev,
        pan: { ...prev.pan, error: 'Please enter a valid PAN number' }
      }));
      return;
    }

    try {
      setVerification(prev => ({
        ...prev,
        pan: { ...prev.pan, loading: true, error: '' }
      }));

      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with actual API call:
      // const response = await PartnerService.verifyPAN({
      //   pan: verification.pan.value
      // });

      setVerification(prev => ({
        ...prev,
        pan: { ...prev.pan, loading: false, verified: true, error: '' }
      }));

      toast.success('PAN verified successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'PAN verification failed';
      setVerification(prev => ({
        ...prev,
        pan: { ...prev.pan, loading: false, error: errorMessage }
      }));
      toast.error(errorMessage);
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

      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with actual API call:
      // const response = await PartnerService.verifyBank({
      //   accountNumber: verification.bank.accountNumber,
      //   ifsc: verification.bank.ifsc
      // });

      setVerification(prev => ({
        ...prev,
        bank: { ...prev.bank, loading: false, verified: true, accountError: '', ifscError: '' }
      }));

      toast.success('Bank account verified successfully!');
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
      email: { ...prev.email, value: formatted, error: '' }
    }));
    // Also update partnerData email
    setPartnerData(prev => ({
      ...prev,
      email: formatted
    }));
  };

  const handleBankChange = (field: 'accountNumber' | 'ifsc', value: string) => {
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

  const isAllVerified =
    verification.aadhaar.verified &&
    verification.pan.verified &&
    verification.bank.verified &&
    verification.nism.verified &&
    verification.email.verified;

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

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className=" bg-gradient-to-br from-slate-50/90 via-white/80 to-blue-100/80 
    backdrop-blur-xl border border-white/40 
    shadow-2xl rounded-3xl 
    flex items-center justify-center p-8 
    transition-all duration-500 
    hover:shadow-blue-200 hover:-translate-y-1 hover:scale-[1.02]">
        <div >
          <div className="text-center mb-8">
            <div >
              <ShieldUser className="w-8 h-8 text-blue-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Registration</h1>
            <p className="text-gray-600 text-sm">Complete your KYC verification to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Fingerprint, text: 'Aadhaar Verification', desc: 'Auto-filled from your details' },
              { icon: IdCard, text: 'PAN Verification', desc: 'Auto-filled from your details' },
              { icon: Building2, text: 'Bank Account Verification', desc: 'Auto-filled from your details' },
              { icon: FileText, text: 'NISM Certificate Upload', desc: 'Upload NISM certificate' },
              { icon: Mail, text: 'Email Verification', desc: 'Auto-filled from your details' },
              { icon: Phone, text: 'Mobile Verification', desc: 'Verify your mobile number' }
            ].map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-white/60 rounded-lg border border-gray-200/50">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <item.icon className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-700">{item.text}</span>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentScreen('mobile-verification')}
            className="w-full bg-blue-900 text-white rounded-lg py-3 font-semibold text-sm hover:bg-blue-900 transition-colors shadow-md"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }


  // Mobile Verification Screen
  if (currentScreen === 'mobile-verification') {
    return (
      <div className="bg-gradient-to-br from-blue-50/80 via-white/70 to-purple-50/80 backdrop-blur-xl flex items-center justify-center p-8 rounded-3xl shadow-2xl border border-white/30">
        <div>
          <button
            onClick={() => setCurrentScreen('welcome')}
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
                <p className="font-semibold text-gray-900">{partnerData.dob || 'Not available'}</p>
              </div>
              <div>
                <p className="text-gray-600">PAN Number</p>
                <p className="font-semibold text-gray-900">{verification.pan.value}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
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
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldUser className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Partner Registration Dashboard</h1>
                <p className="text-gray-600 text-xs">Complete all verification steps to finish registration</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Mobile Verified</p>
              <p className="font-semibold text-gray-900 text-sm">{(partnerData.phone)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                Overall Verification Progress
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {Math.round(verificationProgress())}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${verificationProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Verification Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Personal Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
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
                className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.personal
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
              >
                {isEditing.personal ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                {isEditing.personal ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing.personal ? (
                  <input
                    type="text"
                    value={partnerData.name}
                    onChange={(e) => handlePartnerInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">{partnerData.name || 'Not available'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing.personal ? (
                  <input
                    type="date"
                    value={partnerData.dob}
                    onChange={(e) => handlePartnerInputChange('dob', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">{partnerData.dob || 'Not available'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                {isEditing.personal ? (
                  <textarea
                    value={partnerData.address}
                    onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap">{partnerData.address || 'Not available'}</p>
                )}
              </div>

              {/* PINCODE FIELD ADDED */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                {isEditing.personal ? (
                  <input
                    type="text"
                    value={partnerData.pincode}
                    onChange={(e) => handlePartnerInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">{partnerData.pincode || 'Not available'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Aadhaar Verification Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
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
                    {verification.aadhaar.value ? maskAadhar(verification.aadhaar.value) : 'Not available'}
                  </p>
                )}
              </div>

              {/* Aadhaar Verification Button and OTP Section */}
              {verification.aadhaar.value.length==12 && !verification.aadhaar.verified && (
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.pan.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <IdCard className={`w-5 h-5 ${verification.pan.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">PAN Verification</h3>
                  <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                </div>
              </div>

              {/* Show edit button only when PAN data is NOT available */}
              {!verification.pan.value && (
                <button
                  onClick={() => toggleEdit('pan')}
                  className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.pan
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
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                    {verification.pan.value || 'Not available'}
                  </p>
                )}
              </div>

              {/* PAN Verification Button */}
              {verification.pan.value && !verification.pan.verified && (
                <div className="space-y-3">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.bank.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <Building2 className={`w-5 h-5 ${verification.bank.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Bank Verification</h3>
                  <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                </div>
              </div>
              <button
                onClick={() => toggleEdit('bank')}
                className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.bank
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
              >
                {isEditing.bank ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                {isEditing.bank ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
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
                      {verification.bank.accountNumber ? (verification.bank.accountNumber) : 'Not available'}
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
                      {verification.bank.ifsc || 'Not available'}
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

              {verification.bank.verified && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-xs font-semibold text-green-800">Bank Account Verified Successfully</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Selection Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Address Selection</h3>
                <p className="text-gray-600 text-xs">Choose your preferred address</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Address</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedAddressIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                      onClick={() => handleAddressSelect(index)}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={selectedAddressIndex === index}
                          onChange={() => handleAddressSelect(index)}
                          className="mt-0.5 mr-2"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">
                            {address.type || 'Address'} {address.sequence}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{address.address}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {address.state} - {address.postal}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-3">No addresses available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Selected Address</label>
                <textarea
                  value={partnerData.address}
                  onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Selected address will appear here"
                />
              </div>

              {/* PINCODE FIELD ADDED */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={partnerData.pincode}
                  onChange={(e) => handlePartnerInputChange('pincode', e.target.value)}
                  placeholder="Enter pincode"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Email Verification Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.email.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <Mail className={`w-5 h-5 ${verification.email.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Email Verification</h3>
                  <p className="text-gray-600 text-xs">Auto-filled from your details</p>
                </div>
              </div>
              <button
                onClick={() => toggleEdit('email')}
                className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.email
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
                  <p className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                    {verification.email.value ? (verification.email.value) : 'Not available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* NISM Upload Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.nism.verified ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                <FileText className={`w-5 h-5 ${verification.nism.verified ? 'text-green-600' : 'text-blue-600'
                  }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">NISM Upload</h3>
                <p className="text-gray-600 text-xs">Upload certificate (Optional)</p>
              </div>
            </div>

            {!verification.nism.verified && !verification.nism.skipped ? (
              <div className="space-y-3">
                {/* ARN Holder Question */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Are you an ARN holder?
                  </label>
                  <div className="flex gap-4">
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

                {/* ARN Holder Fields - Only show if user selected Yes */}
                {verification.nism.arnHolder && (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ARN Number <span className="text-gray-400">(Optional)</span>
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
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${verification.nism.arnError ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                          maxLength={11}
                        />
                        {verification.nism.arnError && (
                          <p className="text-red-500 text-xs mt-0.5">{verification.nism.arnError}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          EUIN No <span className="text-gray-400">(Optional)</span>
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
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${verification.nism.euinError ? "border-red-300 bg-red-50" : "border-gray-300"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isAllVerified ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                <CheckCircle className={`w-5 h-5 ${isAllVerified ? 'text-green-600' : 'text-yellow-600'
                  }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Complete Registration</h3>
                <p className="text-gray-600 text-xs">Finish your registration</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-2 rounded-lg ${isAllVerified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                <div className="flex items-center">
                  <CheckCircle className={`w-4 h-4 ${isAllVerified ? 'text-green-600' : 'text-yellow-600'
                    } mr-1`} />
                  <span className={`text-xs font-semibold ${isAllVerified ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                    {isAllVerified ? 'All verifications completed!' : `${Math.round(verificationProgress())}% completed`}
                  </span>
                </div>
                {!isAllVerified && (
                  <p className="text-yellow-700 text-xs mt-1">
                    Complete all verification steps to finish registration
                  </p>
                )}
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