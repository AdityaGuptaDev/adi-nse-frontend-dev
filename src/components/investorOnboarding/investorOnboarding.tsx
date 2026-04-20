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
  RefreshCw,
  Users
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
import KYCInitial from '../initial-KYC/(components)/KYC-initial';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

type Screen = 'welcome' | 'mobile-verification' | 'dashboard' | 'completion';

// Add interfaces for nominee dropdown options
interface NomineeRelationship {
  id: number;
  mfu_code: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

interface NomineeIdentity {
  id: number;
  mfu_code: string;
  type: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface NomineeCountry {
  id: string;
  name: string;
  ansi_code: string;
  bse_code: string | null;
  kyc_code: string | null;
  createdBy: string | null;
  modifiedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface NomineeGuardianRelationship {
  id: number;
  mfu_code: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

interface NomineeDropdownData {
  nomineeRelationShipType: NomineeRelationship[];
  nomineeIdentity: NomineeIdentity[];
  nomineeCountry: NomineeCountry[];
  nominee_guardian_relationship_types: NomineeGuardianRelationship[];
}

// Add interfaces for dropdown options
interface Occupation {
  id: number;
  occupation: string;
  occ_code: string;
  bse_occ_code: string;
  occ_type: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface IncomeSource {
  source_id: number;
  source_name: string;
  bse_code: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AddressType {
  id: string;
  at_code: string;
  address_type: string;
  createdBy: string | null;
  modifiedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AnnualIncome {
  id: number;
  income_range: string;
  ai_code: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface FatcaDropdownData {
  occupationList: Occupation[];
  incomeList: IncomeSource[];
  addresslist: AddressType[];
  annualIncome: AnnualIncome[];
}

const KYCVerification: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const [showKYCInitial, setShowKYCInitial] = useState(false);
  const [KYCFlowScreen, setKYCFlowScreen] = useState(true);

  const [isEditing, setIsEditing] = useState({
    aadhaar: false,
    pan: false,
    bank: false,
    email: false,
    personal: false,
    nominee: false,
    fatca: false
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Add state for nominee dropdown data
  const [nomineeDropdownData, setNomineeDropdownData] = useState<NomineeDropdownData>({
    nomineeRelationShipType: [],
    nomineeIdentity: [],
    nomineeCountry: [],
    nominee_guardian_relationship_types: []
  });
  const [loadingNomineeDropdown, setLoadingNomineeDropdown] = useState(false);

  // Add state for FATCA dropdown data
  const [fatcaDropdownData, setFatcaDropdownData] = useState<FatcaDropdownData>({
    occupationList: [],
    incomeList: [],
    addresslist: [],
    annualIncome: []
  });
  const [loadingFatcaDropdown, setLoadingFatcaDropdown] = useState(false);

  // Add this interface for nominee details
  interface NomineeDetails {
    nominee_opt: string; // "Yes", "No", "No, but verify later"
    nominee_name: string;
    nominee_DOB: string;
    nominee_Type: string;
    relation: string;
    mobile_number: string;
    email_address: string;
    percentage_allocation: string;
    guardian_name: string;
    guardian_PAN: string;
    guardian_DOB: string;
    guardian_relationship: string;
    guardian_mobile: string;
    guardian_email: string;
    country: string;
    state: string;
    city: string;
    pin_code: string;
    address_line_1: string;
    address_line_2: string;
    address_line_3: string;
    identity_type: string;
    identity_number: string;
  }

  // Update the FATCA interface to include tax resident countries
  interface TaxResidentCountry {
    country: string;
    tax_payer_id: string;
    id_document_type: string;
  }

  interface FatcaDetails {
    address_type: string;
    income_slab: string;
    place_of_birth: string;
    country_of_birth: string;
    occupation: string;
    citizenship: string;
    wealth_source: string;
    nationality: string;
    politically_exposed: string;
    tax_resident_other: string;
    tax_resident_countries: TaxResidentCountry[];
  }

  // Update initial FATCA state
  const [fatcaDetails, setFatcaDetails] = useState<FatcaDetails>({
    address_type: "",
    income_slab: "",
    place_of_birth: "",
    country_of_birth: "India",
    occupation: "",
    citizenship: "India",
    wealth_source: "",
    nationality: "India",
    politically_exposed: "",
    tax_resident_other: "No",
    tax_resident_countries: [
      { country: "", tax_payer_id: "", id_document_type: "" },
      { country: "", tax_payer_id: "", id_document_type: "" },
      { country: "", tax_payer_id: "", id_document_type: "" }
    ]
  });

  // Update initial state
  const [nominees, setNominees] = useState<NomineeDetails[]>([
    {
      nominee_opt: "Yes",
      nominee_name: "",
      nominee_DOB: "",
      nominee_Type: "Major",
      relation: "",
      mobile_number: "",
      email_address: "",
      percentage_allocation: "",
      guardian_name: "",
      guardian_PAN: "",
      guardian_DOB: "",
      guardian_relationship: "",
      guardian_mobile: "",
      guardian_email: "",
      country: "",
      state: "",
      city: "",
      pin_code: "",
      address_line_1: "",
      address_line_2: "",
      address_line_3: "",
      identity_type: "",
      identity_number: ""
    }
  ]);

  // Update PartnerRegistrationState to include new fields
  const [partnerData, setPartnerData] = useState<PartnerRegistrationState>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    // NEW FIELDS
    age: '',
    gender: '',
    pincode:'',
    errors: {
      phone: '',
    }
  });

  // Update VerificationState to include new bank fields
  const [verification, setVerification] = useState<VerificationState>({
    pan: { value: '', verified: false, loading: false, error: '', validationMessage: '' },
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
      // NEW BANK FIELDS - REMOVED UNNECESSARY FIELDS
      bankName: '',
      branch: '',
      centre: '',
      city: '',
      state: '',
      micr: '',
      address: ''
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

  // Get partner_id from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const partnerIdFromUrl = urlParams.get('partner_id');

    if (partnerIdFromUrl && partnerIdFromUrl.trim() !== '') {
      setPartnerId(partnerIdFromUrl);
      console.log("Partner ID from URL:", partnerIdFromUrl);
    } else {
      console.log("No partner ID found in URL");
      setPartnerId(null);
    }
  }, []);

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
  }, []);

  // Add function to fetch nominee dropdown data
  const fetchNomineeDropdownData = async () => {
    try {
      setLoadingNomineeDropdown(true);
      const response = await api.get(`${ApiUrl}/kyc/get-nominee-dropdown`);

      if (response.data && response.data.data) {
        setNomineeDropdownData(response.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('Error fetching nominee dropdown data:', error);
      toast.error('Failed to load nominee dropdown options');
    } finally {
      setLoadingNomineeDropdown(false);
    }
  };

  // Fetch nominee dropdown data when component mounts
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      fetchFatcaDropdownData();
      fetchNomineeDropdownData();
    }
  }, [currentScreen]);

  // Add function to fetch FATCA dropdown data
  const fetchFatcaDropdownData = async () => {
    try {
      setLoadingFatcaDropdown(true);
      const response = await api.get(`${ApiUrl}/kyc/get-fatca-dropdown`);

      if (response.data && response.data.data) {
        setFatcaDropdownData(response.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('Error fetching FATCA dropdown data:', error);
      toast.error('Failed to load FATCA dropdown options');
    } finally {
      setLoadingFatcaDropdown(false);
    }
  };

  // Fetch FATCA dropdown data when component mounts
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      fetchFatcaDropdownData();
    }
  }, [currentScreen]);

  // Add handler for tax resident countries
  const handleTaxResidentChange = (index: number, field: keyof TaxResidentCountry, value: string) => {
    setFatcaDetails(prev => ({
      ...prev,
      tax_resident_countries: prev.tax_resident_countries.map((country, i) =>
        i === index ? { ...country, [field]: value } : country
      )
    }));
  };

  // Add function to add more tax resident countries (if needed)
  const addTaxResidentCountry = () => {
    if (fatcaDetails.tax_resident_countries.length >= 3) {
      toast.error('Maximum 3 countries allowed');
      return;
    }

    setFatcaDetails(prev => ({
      ...prev,
      tax_resident_countries: [
        ...prev.tax_resident_countries,
        { country: "", tax_payer_id: "", id_document_type: "" }
      ]
    }));
  };

  // Add function to remove tax resident country
  const removeTaxResidentCountry = (index: number) => {
    if (fatcaDetails.tax_resident_countries.length <= 1) {
      toast.error('At least one country is required when tax resident is Yes');
      return;
    }

    setFatcaDetails(prev => ({
      ...prev,
      tax_resident_countries: prev.tax_resident_countries.filter((_, i) => i !== index)
    }));
  };

  // Add handler functions for nominee operations
  const handleNomineeChange = (index: number, field: keyof NomineeDetails, value: string) => {
    setNominees(prev => prev.map((nominee, i) =>
      i === index ? { ...nominee, [field]: value } : nominee
    ));
  };

  const addNominee = () => {
    if (nominees.length >= 5) {
      toast.error('Maximum 5 nominees allowed');
      return;
    }

    setNominees(prev => [...prev, {
      nominee_opt: "Yes",
      nominee_name: "",
      nominee_DOB: "",
      nominee_Type: "Major",
      relation: "",
      mobile_number: "",
      email_address: "",
      percentage_allocation: "",
      guardian_name: "",
      guardian_PAN: "",
      guardian_DOB: "",
      guardian_relationship: "",
      guardian_mobile: "",
      guardian_email: "",
      country: "",
      state: "",
      city: "",
      pin_code: "",
      address_line_1: "",
      address_line_2: "",
      address_line_3: "",
      identity_type: "",
      identity_number: ""
    }]);
  };

  const removeNominee = (index: number) => {
    if (nominees.length <= 1) {
      toast.error('At least one nominee is required');
      return;
    }

    setNominees(prev => prev.filter((_, i) => i !== index));
  };

  const [otpState, setOtpState] = useState<OTPState>({
    otp: '',
    timer: 0,
    canResend: true,
    loading: false,
    error: ''
  });

  // Add FATCA handler
  const handleFatcaChange = (field: keyof FatcaDetails, value: string) => {
    setFatcaDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update the verification progress to exclude Aadhaar and Email verification
  const verificationProgress = () => {
    const steps = [
      // PAN verification - Allow pending status
      (() => {
        const hasValidPan = verification.pan.validationMessage &&
          (verification.pan.validationMessage.includes('Dear Investor, the kyc status for your PAN is validated.') ||
            verification.pan.validationMessage.includes('kyc status for your PAN is still pending'));
        return hasValidPan;
      })(),

      // Bank verification
      // verification.bank.verified,

      // Nominee validation
      (() => {
        if (nominees.some(nominee => nominee.nominee_opt === "No" || nominee.nominee_opt === "No, but verify later")) {
          return true;
        }

        return nominees.every(nominee => {
          if (nominee.nominee_opt === "Yes") {
            const hasBasicInfo = nominee.nominee_name && nominee.relation;
            const hasAddress = nominee.address_line_1 && nominee.city && nominee.state && nominee.pin_code;
            const hasIdentity = nominee.identity_type && nominee.identity_number;

            if (nominee.nominee_Type === "Minor") {
              const hasGuardianInfo = nominee.guardian_name && nominee.guardian_relationship;
              return hasBasicInfo && hasAddress && hasIdentity && hasGuardianInfo;
            }

            return hasBasicInfo && hasAddress && hasIdentity;
          }
          return true;
        });
      })(),

      // FATCA validation
      (() => {
        const hasBasicFatca =
          fatcaDetails.address_type &&
          fatcaDetails.income_slab &&
          fatcaDetails.occupation &&
          fatcaDetails.wealth_source &&
          fatcaDetails.politically_exposed;

        if (fatcaDetails.tax_resident_other === "Yes") {
          const hasValidTaxCountries = fatcaDetails.tax_resident_countries.every(country =>
            country.country && country.tax_payer_id && country.id_document_type
          );
          return hasBasicFatca && hasValidTaxCountries;
        }

        return hasBasicFatca;
      })()
    ];

    const completed = steps.filter(Boolean).length;
    return (completed / steps.length) * 100;
  };

  // Check if all verifications are complete
  const isAllVerified2 = () => {
    return verificationProgress() === 100;
    //return true;
  };

  // Update the getVerificationStatus function to show correct PAN status
  const getVerificationStatus = () => {
    const status = {
      pan: verification.pan.validationMessage &&
        verification.pan.validationMessage.includes('Dear Investor, the kyc status for your PAN is validated.'),
      bank: verification.bank.verified,
      nominee: (() => {
        if (nominees.some(nominee => nominee.nominee_opt === "No" || nominee.nominee_opt === "No, but verify later")) {
          return true;
        }
        return nominees.every(nominee => {
          if (nominee.nominee_opt === "Yes") {
            const hasBasicInfo = nominee.nominee_name && nominee.relation;
            const hasAddress = nominee.address_line_1 && nominee.city && nominee.state && nominee.pin_code;
            const hasIdentity = nominee.identity_type && nominee.identity_number;

            if (nominee.nominee_Type === "Minor") {
              const hasGuardianInfo = nominee.guardian_name && nominee.guardian_relationship;
              return hasBasicInfo && hasAddress && hasIdentity && hasGuardianInfo;
            }

            return hasBasicInfo && hasAddress && hasIdentity;
          }
          return true;
        });
      })(),
      fatca: (() => {
        const hasBasicFatca =
          fatcaDetails.address_type &&
          fatcaDetails.income_slab &&
          fatcaDetails.occupation &&
          fatcaDetails.wealth_source &&
          fatcaDetails.politically_exposed;

        if (fatcaDetails.tax_resident_other === "Yes") {
          const hasValidTaxCountries = fatcaDetails.tax_resident_countries.every(country =>
            country.country && country.tax_payer_id && country.id_document_type
          );
          return hasBasicFatca && hasValidTaxCountries;
        }

        return hasBasicFatca;
      })()
    };

    console.log('Verification Status:', status);
    return status;
  };

  // Add this function to create KYC investor in Signzy
  const createKYCInvestor = async () => {
    try {
      // Check if PAN is available
      if (!verification.pan.value || verification.pan.value.length !== 10) {
        toast.error('Please enter a valid PAN number first');
        return null;
      }

      // Check if mobile is verified
      if (!partnerData.phone) {
        toast.error('Please complete mobile verification first');
        return null;
      }

      // Prepare KYC investor data
      const kycInvestorData = {
        name: partnerData.name || verification.pan.value, // Use PAN if name not available
        pan_no: verification.pan.value,
        email: partnerData.email,
        mobile: partnerData.phone,
      };

      console.log("Creating KYC investor with data:", kycInvestorData);

      // Make API call to create KYC investor
      const response = await api.post(
        `${ApiUrl}/kyc/create_kyc_investor_sinzy`,
        kycInvestorData
      );

      console.log("response-", response);
      console.log("response------", response.data);

      if (response.status === 200) {
        console.log("KYC investor created successfully:", response.data);
        toast.success('KYC process initiated successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data?.remark || 'Failed to create KYC investor');
      }
    } catch (error: any) {
      console.error('Error creating KYC investor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate KYC process';
      toast.error(errorMessage);
      return null;
    }
  };

  // Check if PAN is validated
  const isPanValidated = verification.pan.validationMessage &&
    verification.pan.validationMessage.includes('Dear Investor, the kyc status for your PAN is validated.');

  const canEditFatcaAndNominee = isPanValidated;

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

  // PAN Validation Function
  const validatePANWithBackend = async (panNumber: string) => {
    if (!panNumber || panNumber.length !== 10) {
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

      const response = await api.post(
        `${ApiUrl}/kyc/checkKYCStatus`,
        {
          pan_no: panNumber,
          mobile_number: partnerData.phone,
        }
      );

      let responseData = response.data;
      console.log('PAN Validation Response:', responseData);

      if (responseData && responseData.status === 'S') {
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
            verified: kycStatus || isPending, // Allow pending status
            loading: false,
            error: kycStatus ? '' : (isPending ? '' : 'PAN validation failed'),
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
        const errorMessage = responseData?.msg ||
          responseData?.message ||
          responseData?.data?.message ||
          'PAN validation failed';

        throw new Error(JSON.stringify(errorMessage));


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

  const handleDoKYC = async () => {
    // Check if PAN is available
    if (!verification.pan.value || verification.pan.value.length !== 10) {
      toast.error('Please enter a valid PAN number first');
      return;
    }

    // Check if mobile is verified
    if (!partnerData.phone) {
      toast.error('Please complete mobile verification first');
      return;
    }

    try {
      // Show loading state
      toast.info('Initiating KYC process...');

      // Create KYC investor in Signzy first
      const kycResponse = await createKYCInvestor();

      if (kycResponse) {
        // Store KYC response data if needed
        console.log('KYC Investor Response:', kycResponse);

        // Show the KYC initial component
        setShowKYCInitial(true);
        setKYCFlowScreen(true); // true shows welcome screen first

        toast.success('KYC verification portal opened!');
      }
    } catch (error) {
      console.error('Error in KYC process:', error);
      toast.error('Failed to start KYC process');
    }
  };

  // Add KYC completion handler
  const handleKYCCompletion = async () => {
    try {
      // Re-validate PAN after KYC completion
      if (verification.pan.value) {
        await validatePANWithBackend(verification.pan.value);
      }

      setShowKYCInitial(false);
      toast.success('KYC process completed! Checking PAN status...');
    } catch (error) {
      console.error('Error in KYC completion:', error);
      toast.error('Error completing KYC process');
    }
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
        const branchDetails = bankData.branchDetails;

        console.log('Bank Data Found:', bankData);

        setVerification(prev => ({
          ...prev,
          bank: {
            ...prev.bank,
            accountNumber: bankData.accountNumber || '',
            ifsc: bankData.ifsc || '',
            verified: !!bankData.accountNumber,
            // KEEP ONLY ESSENTIAL FIELDS
            bankName: branchDetails?.bank || '',
            branch: '', // REMOVED
            centre: '', // REMOVED
            city: '', // REMOVED
            state: '', // REMOVED
            micr: branchDetails?.micr || '',
            address: '' // REMOVED
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

        // Set personal info
        if (financialDataResp.personalInfo) {
          const personalInfo = financialDataResp.personalInfo;
          console.log('Personal Info:', personalInfo);

          setPartnerData(prev => ({
            ...prev,
            age: personalInfo.age || '',
            gender: personalInfo.gender || '',
            dob: personalInfo.dob || prev.dob
          }));
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
          // Ensure both states are updated
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
              verified: false // Set to false initially, will validate
            }
          }));

          // Auto-validate the PAN after a short delay
          if (panData.idNumber && panData.idNumber.length === 10) {
            setTimeout(() => {
              validatePANWithBackend(panData.idNumber);
            }, 1500);
          }
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
              verified: !!aadhaarData.idNumber
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
              address: formattedAddresses[0].address
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
        userType: 2,
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

  // OTP Input Handlers
  const handleOTPChange = (value: string, index: number) => {
    const newOtp = otpState.otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    setOtpState(prev => ({ ...prev, otp: otpString, error: '' }));

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpState.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
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
        userType: 2,
        otp: otpState.otp
      });

      if (otpVerifyResponse && otpVerifyResponse.data && otpVerifyResponse.data.status === 'S') {
        await fetchUserDataFromMobile(partnerData.phone);

        setOtpState(prev => ({ ...prev, loading: false }));
        setCurrentScreen('dashboard');
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
      aadhaar: { ...prev.aadhaar, value: formatted, error: '' }
    }));
  };

  const handlePanChange = (value: string) => {
    const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    const upperValue = cleanedValue.toUpperCase();
    setVerification(prev => ({
      ...prev,
      pan: {
        ...prev.pan,
        value: upperValue,
        verified: false,
        validationMessage: '',
        error: ''
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

  const handleBankChange = (field: keyof VerificationState['bank'], value: string) => {
    setVerification(prev => ({
      ...prev,
      bank: {
        ...prev.bank,
        [field]: value,
        [`${field}Error`]: field === 'accountNumber',
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

  // In your component, update the isEditing state management
  const toggleEdit = (field: keyof typeof isEditing) => {
    // Prevent editing FATCA and Nominee if PAN is not validated
    if ((field === 'fatca' || field === 'nominee') && !isPanValidated) {
      toast.error('Please validate your PAN first to edit these sections');
      return;
    }

    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    setPartnerData(prev => ({
      ...prev,
      address: addresses[index].address
    }));
  };

  const isAllVerified =
    verification.aadhaar.verified &&
    verification.pan.verified &&
    verification.bank.verified &&
    verification.email.verified;

  // Popup states
  const [showCanPopup, setShowCanPopup] = useState(false);
  const [canData, setCanData] = useState<any>(null);
  const [canError, setCanError] = useState<string | null>(null);

  // Update the handleCompleteRegistration function with nominee "No" option handling
  const handleCompleteRegistration = async () => {
    if (!isAllVerified2()) {
      toast.error('Please complete all verification steps before proceeding');
      return;
    }

    try {
      setRegistrationStatus(prev => ({ ...prev, loading: true, error: '' }));

      // Prepare nominee data - if "No" is selected, send empty array
      const nomineeData = nominees[0].nominee_opt === "No"
        ? [] // Send empty array when "No" is selected
        : nominees.map(nominee => ({
          nominee_opt: nominee.nominee_opt,
          nominee_name: nominee.nominee_name,
          nominee_DOB: nominee.nominee_DOB,
          nominee_Type: nominee.nominee_Type,
          relation: nominee.relation,
          mobile_number: nominee.mobile_number,
          email_address: nominee.email_address,
          percentage_allocation: nominee.percentage_allocation,
          guardian_name: nominee.guardian_name,
          guardian_PAN: nominee.guardian_PAN,
          guardian_DOB: nominee.guardian_DOB,
          guardian_relationship: nominee.guardian_relationship,
          guardian_mobile: nominee.guardian_mobile,
          guardian_email: nominee.guardian_email,
          country: nominee.country,
          state: nominee.state,
          city: nominee.city,
          pin_code: nominee.pin_code,
          address_line_1: nominee.address_line_1,
          address_line_2: nominee.address_line_2,
          address_line_3: nominee.address_line_3,
          identity_type: nominee.identity_type,
          identity_number: nominee.identity_number
        }));

      // Prepare base registration data without partner_id
      const baseRegistrationData = {
        partner: {
          name: partnerData.name,
          email: partnerData.email,
          phone: partnerData.phone,
          address: partnerData.address,
          dob: partnerData.dob,
          age: partnerData.age,
          gender: partnerData.gender,
        },
        verification: {
          pan: {
            number: verification.pan.value,
            verified: verification.pan.verified,
            validationMessage: verification.pan.validationMessage
          },
          aadhaar: {
            number: verification.aadhaar.value,
            verified: verification.aadhaar.verified
          },
          bank: {
            accountNumber: verification.bank.accountNumber,
            ifsc: verification.bank.ifsc,
            verified: verification.bank.verified,
            bankName: verification.bank.bankName,
            micr: verification.bank.micr,
          },
          email: {
            address: verification.email.value,
            verified: verification.email.verified
          },
        },
        fatca: {
          address_type: fatcaDetails.address_type,
          income_slab: fatcaDetails.income_slab,
          place_of_birth: fatcaDetails.place_of_birth,
          country_of_birth: fatcaDetails.country_of_birth,
          occupation: fatcaDetails.occupation,
          citizenship: fatcaDetails.citizenship,
          wealth_source: fatcaDetails.wealth_source,
          nationality: fatcaDetails.nationality,
          politically_exposed: fatcaDetails.politically_exposed,
          tax_resident_other: fatcaDetails.tax_resident_other,
          tax_resident_countries: fatcaDetails.tax_resident_countries
        },
        nominees: nomineeData
      };

      // Add partner_id only if it exists
      const completeRegistrationData = partnerId
        ? { ...baseRegistrationData, partner_id: partnerId }
        : baseRegistrationData;

      console.log("Sending registration data:", completeRegistrationData);
      console.log("Partner ID included:", partnerId ? "Yes" : "No");





      console.log("Sending registration data:", completeRegistrationData);


      const response = await api.post(`${ApiUrl}/kyc/complete-registration`, completeRegistrationData);
      console.log("Full API Response:", response?.data?.data);

      const registrationResult = response?.data?.data?.registrationResult;
      const canResponse = registrationResult?.canResponse?.RESP_BODY;
      const header = registrationResult?.canResponse?.RESP_HEADER;

      console.log("header?.RES_MSG-----", header?.RES_MSG);
      console.log("registrationResult?.message-----", registrationResult?.message);

      // Extract the response message
      const responseMessage = header?.RES_MSG || registrationResult?.message || 'Registration completed';


      //     // Set data for popup
      //     if (canResponse?.CAN) {
      //       setCanData({
      //         can: canResponse?.CAN,
      //         link: canResponse?.NOM_VER_LINK_H1 || '',
      //         message: registrationResult?.message || header?.RES_MSG || 'Registration successful',
      //       });
      //       setCanError(null);
      //     } else {
      //       setCanData(null);
      //       setCanError(header?.RES_MSG);
      //     }

      //     setShowCanPopup(true);

      //   } catch (error: any) {
      //     console.error('Registration Error:', error);
      //     toast.error('Registration failed: ' + (error.message || 'Unknown error'));
      //   } finally {
      //     setRegistrationStatus(prev => ({ ...prev, loading: false }));
      //   }
      // };

      // Set data for popup
      if (canResponse?.CAN && canResponse.CAN.trim() !== "") {
        setCanData({
          can: canResponse?.CAN,
          link: canResponse?.NOM_VER_LINK_H1 || '',
          message: responseMessage,
        });
        setCanError(null);
      } else {
        setCanData({
          can: null,
          link: '',
          message: responseMessage,
        });
        setCanError(responseMessage);
      }

      setShowCanPopup(true);

    } catch (error: any) {
      console.error('Registration Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error('Registration failed: ' + errorMessage);
    } finally {
      setRegistrationStatus(prev => ({ ...prev, loading: false }));
    }
  };


  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="bg-gradient-to-br from-slate-50/90 via-white/80 to-blue-100/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl flex items-center justify-center p-8 transition-all duration-500 hover:shadow-blue-200 hover:-translate-y-1 hover:scale-[1.02]">
        <div>
          <div className="text-center mb-8">
            <div>
              <ShieldUser className="w-8 h-8 text-blue-900" />
            </div>
            <h1 className="text-2xl font-bold text-[#F9FAFB] mb-2">Investor Registration</h1>
            <p className="text-[#9CA3AF] text-sm">Complete your KYC verification to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Fingerprint, text: 'Aadhaar Verification', desc: 'Auto-filled from your details' },
              { icon: IdCard, text: 'PAN Verification', desc: 'Auto-filled from your details' },
              { icon: Building2, text: 'Bank Account Verification', desc: 'Auto-filled from your details' },
              { icon: FileText, text: 'Nominee Details Verification', desc: 'Nominee Details Verification' },
              { icon: Mail, text: 'Email Verification', desc: 'Auto-filled from your details' },
              { icon: Phone, text: 'Mobile Verification', desc: 'Verify your mobile number' }
            ].map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-[#111111]/60 rounded-lg border border-[#2A2A2A]/50">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <item.icon className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#E5E7EB]">{item.text}</span>
                  <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
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
            className="flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] mb-6 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#F9FAFB] mb-1">Mobile Verification</h1>
            <p className="text-[#9CA3AF] text-sm">We'll send you a verification code to proceed</p>
          </div>

          <div className="space-y-4">
            {/* Mobile Input Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-[#2A2A2A]">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">
                    {otpSent ? 'Verification Code Sent' : 'Enter Mobile Number'}
                  </h3>
                  <p className="text-[#9CA3AF] text-xs">
                    {otpSent
                      ? `Code sent to ${partnerData.phone}`
                      : 'We\'ll send you a verification code'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="text-[#9CA3AF] text-sm font-medium mr-1">+91</span>
                      <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    </div>
                    <input
                      type="tel"
                      value={partnerData.phone}
                      onChange={(e) => handlePartnerInputChange('phone', e.target.value)}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-16 pr-4 py-3 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all duration-200"
                      maxLength={10}
                      disabled={otpSent}
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
                    <h3 className="text-sm font-semibold text-[#F9FAFB]">Enter Verification Code</h3>
                    <p className="text-[#9CA3AF] text-xs">
                      Code sent to <span className="font-semibold">{partnerData.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* OTP Input Boxes */}
                  <div>
                    <label className="block text-xs font-medium text-[#E5E7EB] mb-2 text-center">
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
                          className="w-10 h-11 text-center text-lg font-bold border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-[#111111] shadow-sm"
                          disabled={otpState.loading || isFetchingUserData}
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
                    <span className="text-[#9CA3AF] flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {otpState.timer > 0 ? `Resend in ${otpState.timer}s` : "Ready to resend"}
                    </span>
                    <button
                      onClick={resendOTP}
                      disabled={!otpState.canResend || otpState.loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:text-[#6B7280] flex items-center transition-colors"
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
    const [showSuccessModal, setShowSuccessModal] = useState(true);
    const [canNumber, setCanNumber] = useState<string | null>(null);
    const [isCANCreated, setIsCANCreated] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Check if CAN was created successfully from the registration response
    useEffect(() => {
      console.log('Registration Status in completion:', registrationStatus);

      if (registrationStatus.data) {
        try {
          const responseData = registrationStatus?.data?.data?.data;
          console.log('Full response data:', responseData);

          if (responseData.status === 'S') {
            const canData = responseData?.registrationResult?.canResponse?.RESP_BODY;
            console.log('CAN Data extracted:', canData);

            if (canData && canData.CAN) {
              setCanNumber(canData.CAN);
              setIsCANCreated(true);
              console.log('CAN Number found:', canData.CAN);
            } else {
              setIsCANCreated(false);
              console.log('No CAN number found in response');
              const alternativePath = responseData.registrationResult?.canResponse?.RESP_BODY?.CAN;
              if (alternativePath) {
                setCanNumber(alternativePath);
                setIsCANCreated(true);
                console.log('CAN Number found in alternative path:', alternativePath);
              }
            }
          } else {
            setErrorMessage(responseData.remark || 'Registration failed');
            setShowErrorModal(true);
          }
        } catch (error) {
          console.error('Error processing registration response:', error);
          setErrorMessage('Error processing registration response');
          setShowErrorModal(true);
        }
      } else if (registrationStatus.error) {
        setErrorMessage(registrationStatus.error);
        setShowErrorModal(true);
      }
    }, [registrationStatus]);

    // Error Modal Component
    const ErrorModal = () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-t-2xl p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Registration Issue</h2>
            <p className="text-white/90 text-sm">There was an issue with your registration</p>
          </div>

          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-red-700 bg-red-100/50 py-2 px-4 rounded border border-red-300">
                  {errorMessage || 'An unknown error occurred'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage(null);
                  setCurrentScreen('dashboard');
                }}
                className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-[#1F1A1A] text-[#E5E7EB] rounded-lg py-3 text-sm font-semibold hover:bg-[#2A2A2A] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    // Success Modal Component
    const SuccessModal = () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Investor Created Successfully!</h2>
            <p className="text-white/90 text-sm">Your registration has been completed successfully</p>
          </div>

          <div className="p-6">
            {isCANCreated && canNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <IdCard className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-800">CAN Number Generated</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-900 tracking-wider bg-green-100/50 py-2 px-4 rounded border border-green-300">
                    {canNumber}
                  </p>
                  <p className="text-xs text-green-700 mt-2">Please save this CAN number for future reference</p>
                </div>
              </div>
            )}

            <div className="bg-[#1F1A1A] rounded-lg p-4 mb-4 border border-[#2A2A2A]">
              <h3 className="text-sm font-semibold text-[#F9FAFB] mb-3 text-center">Account Details</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2A2A2A]">
                  <span className="text-[#9CA3AF]">Mobile Number</span>
                  <span className="font-semibold text-[#F9FAFB]">{partnerData.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A2A2A]">
                  <span className="text-[#9CA3AF]">Email</span>
                  <span className="font-semibold text-[#F9FAFB]">{partnerData.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A2A2A]">
                  <span className="text-[#9CA3AF]">Name</span>
                  <span className="font-semibold text-[#F9FAFB]">{partnerData.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#9CA3AF]">PAN Number</span>
                  <span className="font-semibold text-[#F9FAFB]">{verification.pan.value}</span>
                </div>
              </div>
            </div>

            {!isCANCreated && !errorMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Registration Complete</p>
                    <p className="text-xs text-yellow-700 mt-0.5">Your investor registration is complete.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {isCANCreated ? (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Proceed to Login
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-[#1F1A1A] text-[#E5E7EB] rounded-lg py-3 text-sm font-semibold hover:bg-[#2A2A2A] transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        {showErrorModal && <ErrorModal />}
        {showSuccessModal && !showErrorModal && <SuccessModal />}

        {/* Main completion content when modal is closed */}
        {!showSuccessModal && !showErrorModal && (
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-[#2A2A2A]">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-xl font-bold text-[#F9FAFB] mb-3">Registration Completed Successfully!</h1>

            {isCANCreated && canNumber && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <IdCard className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">CAN Number</span>
                </div>
                <p className="text-xl font-bold text-green-900 tracking-wider">{canNumber}</p>
              </div>
            )}

            <button
              onClick={() => setShowSuccessModal(true)}
              className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md mb-4"
            >
              View Registration Details
            </button>

            {isCANCreated && (
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                Proceed to Login
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
  // Main Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4 border border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldUser className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold text-[#F9FAFB]">Investor Registration Dashboard</h1>
                <p className="text-[#9CA3AF] text-xs">Complete all verification steps to finish registration</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9CA3AF]">Mobile Verified</p>
              <p className="font-semibold text-[#F9FAFB] text-sm">{(partnerData.phone)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#E5E7EB]">
                Overall Verification Progress
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {Math.round(verificationProgress())}% Complete
              </span>
            </div>
            <div className="w-full bg-[#2A2A2A] rounded-full h-2">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Personal Details</h3>
                  <p className="text-[#9CA3AF] text-xs">Your personal information</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Full Name</label>
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={partnerData.name}
                      onChange={(e) => handlePartnerInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">{partnerData.name || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Date of Birth</label>
                  {isEditing.personal ? (
                    <input
                      type="date"
                      value={partnerData.dob}
                      onChange={(e) => handlePartnerInputChange('dob', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">{partnerData.dob || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Age</label>
                  {isEditing.personal ? (
                    <input
                      type="number"
                      value={partnerData.age}
                      onChange={(e) => handlePartnerInputChange('age', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">{partnerData.age || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Gender</label>
                  {isEditing.personal ? (
                    <select
                      value={partnerData.gender}
                      onChange={(e) => handlePartnerInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">{partnerData.gender || 'Not available'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Address</label>
                {isEditing.personal ? (
                  <textarea
                    value={partnerData.address}
                    onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm whitespace-pre-wrap">{partnerData.address || 'Not available'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Aadhaar Verification Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.aadhaar.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <Fingerprint className={`w-5 h-5 ${verification.aadhaar.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Aadhaar Verification</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
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
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Aadhaar Number</label>
                {isEditing.aadhaar ? (
                  <input
                    type="text"
                    value={verification.aadhaar.value}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="Enter 12-digit Aadhaar"
                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={14}
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                    {verification.aadhaar.value ? maskAadhar(verification.aadhaar.value) : 'Not available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PAN Verification Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.pan.verified ? 'bg-green-100' : verification.pan.validationMessage ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                  <IdCard className={`w-5 h-5 ${verification.pan.verified ? 'text-green-600' : verification.pan.validationMessage ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">PAN Verification</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!verification.pan.verified && verification.pan.value && (
                  <button
                    onClick={() => validatePANWithBackend(verification.pan.value)}
                    disabled={verification.pan.loading || verification.pan.value.length !== 10}
                    className="flex items-center px-2 py-1.5 rounded text-xs bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    {verification.pan.loading ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Validate
                  </button>
                )}
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
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">PAN Number</label>
                {isEditing.pan ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={verification.pan.value}
                      onChange={(e) => handlePanChange(e.target.value)}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      maxLength={10}
                    />
                    {verification.pan.value && verification.pan.value.length === 10 && !verification.pan.verified && (
                      <button
                        onClick={() => validatePANWithBackend(verification.pan.value)}
                        disabled={verification.pan.loading}
                        className="w-full bg-green-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300"
                      >
                        {verification.pan.loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Checking KYC Status with CVL KRA...
                          </div>
                        ) : (
                          'Validate PAN with CVL KRA'
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm font-semibold">
                    {verification.pan.value || 'Not available'}
                  </p>
                )}
              </div>

              {/* Check if message contains validation success text */}
              {verification.pan.validationMessage && verification.pan.validationMessage.includes('Dear Investor, the kyc status for your PAN is validated.') && (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-bold text-green-800">PAN Verified Successfully</span>
                    </div>
                    <div className="pl-7">
                      <p className="text-sm font-semibold text-green-700 mb-1">
                        CVL KRA Status:
                      </p>
                      <p className="text-sm text-green-800 bg-green-100 p-2 rounded border border-green-200">
                        <strong>{verification.pan.validationMessage}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show for all other messages (non-validation success) */}
              {verification.pan.validationMessage && !verification.pan.validationMessage.includes('Dear Investor, the kyc status for your PAN is validated.') && (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-sm font-bold text-yellow-800">PAN Validation Required</span>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-semibold text-yellow-700 mb-1">
                        CVL KRA Status:
                      </p>
                      <p className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded border border-yellow-200 font-medium">
                        <strong>{verification.pan.validationMessage}</strong>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS - Only show when message is NOT validation success */}
                  {!showKYCInitial && (
                    <div className="space-y-2">
                      {/* Do KYC Button - Shows KYCInitial when clicked */}
                      <button
                        onClick={handleDoKYC}
                        className="w-full bg-orange-600 text-white rounded-lg py-3 text-sm font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete KYC Now
                      </button>

                      {/* Retry Validation Button */}
                      <button
                        onClick={() => validatePANWithBackend(verification.pan.value)}
                        disabled={verification.pan.loading}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                      >
                        {verification.pan.loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Re-checking Status...
                          </div>
                        ) : (
                          'Re-check PAN Status'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* KYC Initial Component */}
              {showKYCInitial && (
                <div className="p-4 bg-[#111111] border border-orange-200 rounded-lg mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-orange-800">KYC Verification in Progress</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={handleKYCCompletion}
                        className="text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-2 py-1 rounded"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => setShowKYCInitial(false)}
                        className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <KYCInitial
                    KYCFlowScreen={KYCFlowScreen}
                    setKYCFlowScreen={setKYCFlowScreen}
                    panNumber={verification.pan.value}
                    mobileNumber={partnerData.phone}
                    email={partnerData.email}
                    name={partnerData.name}
                  />
                </div>
              )}

              {/* ERROR - Validation Failed (no validation message) */}
              {verification.pan.error && !verification.pan.validationMessage && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-sm font-bold text-red-800">âŒ Validation Failed</span>
                    </div>
                    <div className="pl-5">
                      <p className="text-sm font-semibold text-red-700 mb-1">
                        Error Details:
                      </p>
                      <p className="text-sm text-red-800 bg-red-100 p-2 rounded border border-red-200 font-medium">
                        <strong>{verification.pan.error}</strong>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS - Show for error states */}
                  {!showKYCInitial && (
                    <div className="space-y-2">
                      {/* Do KYC Button */}
                      <button
                        onClick={handleDoKYC}
                        className="w-full bg-orange-600 text-white rounded-lg py-3 text-sm font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete KYC Now
                      </button>

                      {/* Retry Validation Button */}
                      <button
                        onClick={() => validatePANWithBackend(verification.pan.value)}
                        disabled={verification.pan.loading}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                      >
                        {verification.pan.loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Re-checking Status...
                          </div>
                        ) : (
                          'Re-check PAN Status'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LOADING - Checking Status */}
              {verification.pan.loading && (
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Checking PAN KYC Status</p>
                      <p className="text-xs text-blue-700">Verifying with CVL KRA database...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bank Verification Card - SIMPLIFIED */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.bank.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <Building2 className={`w-5 h-5 ${verification.bank.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Bank Verification</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Account Number</label>
                  {isEditing.bank ? (
                    <input
                      type="text"
                      value={verification.bank.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {verification.bank.accountNumber ? (verification.bank.accountNumber) : 'Not available'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">IFSC Code</label>
                  {isEditing.bank ? (
                    <input
                      type="text"
                      value={verification.bank.ifsc}
                      onChange={(e) => handleBankChange('ifsc', e.target.value)}
                      placeholder="Enter IFSC code"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      maxLength={11}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {verification.bank.ifsc || 'Not available'}
                    </p>
                  )}
                </div>
              </div>

              {/* Simplified Bank Details - Only essential fields */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Bank Name</label>
                  {isEditing.bank ? (
                    <input
                      type="text"
                      value={verification.bank.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      placeholder="Bank name"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {verification.bank.bankName || 'Not available'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">MICR Code</label>
                  {isEditing.bank ? (
                    <input
                      type="text"
                      value={verification.bank.micr}
                      onChange={(e) => handleBankChange('micr', e.target.value)}
                      placeholder="MICR code"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {verification.bank.micr || 'Not available'}
                    </p>
                  )}
                </div>
              </div>

              {verification.bank.verified && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-xs font-semibold text-green-800">Verified Successfully</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Selection Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Address Selection</h3>
                <p className="text-[#9CA3AF] text-xs">Choose your preferred address</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Select Address</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedAddressIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-[#3A3A3A] hover:border-gray-400'
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
                          <p className="text-xs font-medium text-[#F9FAFB]">
                            {address.type || 'Address'} {address.sequence}
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{address.address}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">
                            {address.state} - {address.postal}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-[#9CA3AF] text-xs text-center py-3">No addresses available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Selected Address</label>
                <textarea
                  value={partnerData.address}
                  onChange={(e) => handlePartnerInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Selected address will appear here"
                />
              </div>
            </div>
          </div>

          {/* Email Verification Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${verification.email.verified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  <Mail className={`w-5 h-5 ${verification.email.verified ? 'text-green-600' : 'text-blue-600'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Email Verification</h3>
                  <p className="text-[#9CA3AF] text-xs">Auto-filled from your details</p>
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
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Email Address</label>
                {isEditing.email ? (
                  <input
                    type="email"
                    value={verification.email.value}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                    {verification.email.value ? (verification.email.value) : 'Not available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FATCA Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${canEditFatcaAndNominee ? 'bg-purple-100' : 'bg-[#1F1A1A]'
                  }`}>
                  <FileText className={`w-5 h-5 ${canEditFatcaAndNominee ? 'text-purple-600' : 'text-[#6B7280]'
                    }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">FATCA Declaration</h3>
                  <p className="text-[#9CA3AF] text-xs">
                    {canEditFatcaAndNominee ? 'Financial information' : 'Validate PAN to edit'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleEdit('fatca')}
                disabled={!canEditFatcaAndNominee}
                className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.fatca
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : canEditFatcaAndNominee
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-[#9CA3AF] cursor-not-allowed'
                  } transition-colors`}
              >
                {isEditing.fatca ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                {isEditing.fatca ? 'Save' : 'Edit'}
              </button>
            </div>
            {!canEditFatcaAndNominee && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                  <p className="text-xs text-yellow-800">
                    Please validate your PAN first to edit FATCA details
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {/* Applicant Info */}
              <div className="bg-[#1F1A1A] p-3 rounded-lg border border-[#2A2A2A]">
                <h4 className="text-xs font-semibold text-[#F9FAFB] mb-2">Applicant: {partnerData.name || 'ADITYA GUPTA'}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Address Type - UPDATED */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Address Type</label>
                  {isEditing.fatca ? (
                    loadingFatcaDropdown ? (
                      <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                          Loading...
                        </div>
                      </div>
                    ) : (
                      <select
                        value={fatcaDetails.address_type}
                        onChange={(e) => handleFatcaChange('address_type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Address Type</option>
                        {fatcaDropdownData.addresslist.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.address_type}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.address_type || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Income Slab - UPDATED */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Income Slab</label>
                  {isEditing.fatca ? (
                    loadingFatcaDropdown ? (
                      <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                          Loading...
                        </div>
                      </div>
                    ) : (
                      <select
                        value={fatcaDetails.income_slab}
                        onChange={(e) => handleFatcaChange('income_slab', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Income Range</option>
                        {fatcaDropdownData.annualIncome.map((income) => (
                          <option key={income.id} value={income.id}>
                            {income.income_range}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.income_slab || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Place of Birth */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Place of Birth</label>
                  {isEditing.fatca ? (
                    <input
                      type="text"
                      value={fatcaDetails.place_of_birth}
                      onChange={(e) => handleFatcaChange('place_of_birth', e.target.value)}
                      placeholder="Enter place of birth"
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.place_of_birth || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Country of Birth */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Country of Birth</label>
                  {isEditing.fatca ? (
                    <select
                      value={fatcaDetails.country_of_birth}
                      onChange={(e) => handleFatcaChange('country_of_birth', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.country_of_birth}
                    </p>
                  )}
                </div>

                {/* Occupation - UPDATED */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Occupation</label>
                  {isEditing.fatca ? (
                    loadingFatcaDropdown ? (
                      <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                          Loading...
                        </div>
                      </div>
                    ) : (
                      <select
                        value={fatcaDetails.occupation}
                        onChange={(e) => handleFatcaChange('occupation', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Occupation</option>
                        {fatcaDropdownData.occupationList.map((occupation) => (
                          <option key={occupation.id} value={occupation.id}>
                            {occupation.occupation}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.occupation || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Citizenship */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Citizenship</label>
                  {isEditing.fatca ? (
                    <select
                      value={fatcaDetails.citizenship}
                      onChange={(e) => handleFatcaChange('citizenship', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.citizenship}
                    </p>
                  )}
                </div>

                {/* Wealth Source - UPDATED */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Wealth Source</label>
                  {isEditing.fatca ? (
                    loadingFatcaDropdown ? (
                      <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                        <div className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                          Loading...
                        </div>
                      </div>
                    ) : (
                      <select
                        value={fatcaDetails.wealth_source}
                        onChange={(e) => handleFatcaChange('wealth_source', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Wealth Source</option>
                        {fatcaDropdownData.incomeList.map((income) => (
                          <option key={income.source_id} value={income.source_id}>
                            {income.source_name}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.wealth_source || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Nationality</label>
                  {isEditing.fatca ? (
                    <select
                      value={fatcaDetails.nationality}
                      onChange={(e) => handleFatcaChange('nationality', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.nationality}
                    </p>
                  )}
                </div>

                {/* Politically Exposed */}
                <div>
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Politically Exposed</label>
                  {isEditing.fatca ? (
                    <select
                      value={fatcaDetails.politically_exposed}
                      onChange={(e) => handleFatcaChange('politically_exposed', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                      {fatcaDetails.politically_exposed || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Tax Resident Other */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#E5E7EB] mb-1">
                    Are you a Tax Resident of any country other than India?
                  </label>
                  {isEditing.fatca ? (
                    <div className="flex gap-4">
                      {["Yes", "No"].map(option => (
                        <label key={option} className="flex items-center text-xs">
                          <input
                            type="radio"
                            value={option}
                            checked={fatcaDetails.tax_resident_other === option}
                            onChange={(e) => handleFatcaChange('tax_resident_other', e.target.value)}
                            className="mr-1"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm font-semibold">
                      {fatcaDetails.tax_resident_other}
                    </p>
                  )}
                </div>
              </div>

              {/* Tax Resident Countries Section - Only show when "Yes" is selected */}
              {fatcaDetails.tax_resident_other === "Yes" && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-[#F9FAFB]">Tax Resident Countries</h4>
                    {isEditing.fatca && fatcaDetails.tax_resident_countries.length < 3 && (
                      <button
                        onClick={addTaxResidentCountry}
                        className="flex items-center px-2 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Add Country
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {fatcaDetails.tax_resident_countries.map((country, index) => (
                      <div key={index} className="border border-[#2A2A2A] rounded-lg p-4 bg-[#1F1A1A]/50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-semibold text-[#F9FAFB]">Country {index + 1}</h5>
                          {isEditing.fatca && fatcaDetails.tax_resident_countries.length > 1 && (
                            <button
                              onClick={() => removeTaxResidentCountry(index)}
                              className="flex items-center px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <span className="w-3 h-3 mr-1">Ã—</span>
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Country */}
                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Country</label>
                            {isEditing.fatca ? (
                              <select
                                value={country.country}
                                onChange={(e) => handleTaxResidentChange(index, 'country', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select Country</option>
                                <option value="USA">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="UAE">United Arab Emirates</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="Japan">Japan</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {country.country || 'Not provided'}
                              </p>
                            )}
                          </div>

                          {/* Tax Payer ID Number */}
                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Tax Payer ID Number</label>
                            {isEditing.fatca ? (
                              <input
                                type="text"
                                value={country.tax_payer_id}
                                onChange={(e) => handleTaxResidentChange(index, 'tax_payer_id', e.target.value)}
                                placeholder="Enter tax payer ID"
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {country.tax_payer_id || 'Not provided'}
                              </p>
                            )}
                          </div>

                          {/* ID Document Type */}
                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">ID Document Type</label>
                            {isEditing.fatca ? (
                              <select
                                value={country.id_document_type}
                                onChange={(e) => handleTaxResidentChange(index, 'id_document_type', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select Document Type</option>
                                <option value="Passport">Passport</option>
                                <option value="National ID">National ID</option>
                                <option value="Tax Identification Number">Tax Identification Number</option>
                                <option value="Social Security Number">Social Security Number</option>
                                <option value="Driver License">Driver License</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {country.id_document_type || 'Not provided'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nominee Details Card - UPDATED WITH API DATA */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Nominee Details</h3>
                  <p className="text-[#9CA3AF] text-xs">
                    {nominees[0].nominee_opt === "No" ? "No Nominee" : `Nominee information (${nominees.length}/5)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {nominees[0].nominee_opt === "Yes" && nominees.length < 5 && (
                  <button
                    onClick={addNominee}
                    className="flex items-center px-2 py-1.5 rounded text-xs bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Add Nominee
                  </button>
                )}
                <button
                  onClick={() => toggleEdit('nominee')}
                  className={`flex items-center px-2 py-1.5 rounded text-xs ${isEditing.nominee
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                >
                  {isEditing.nominee ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                  {isEditing.nominee ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {nominees.map((nominee, index) => (
                <div key={index} className="border border-[#2A2A2A] rounded-lg p-4 bg-[#1F1A1A]/50">
                  {/* Nominee Header with Remove Button */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-semibold text-[#F9FAFB]">
                      {nominees.length > 1 ? `Nominee ${index + 1} ${nominee.nominee_name && `- ${nominee.nominee_name}`}` : 'Nominee Details'}
                    </h4>
                    {nominees.length > 1 && nominee.nominee_opt === "Yes" && (
                      <button
                        onClick={() => removeNominee(index)}
                        className="flex items-center px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <span className="w-3 h-3 mr-1">Ã—</span>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Nominee Option */}
                    <div>
                      <label className="block text-xs font-medium text-[#E5E7EB] mb-2">Nominee Opt</label>
                      {isEditing.nominee ? (
                        <div className="flex gap-4">
                          {["Yes", "No", "No, but verify later"].map(option => (
                            <label key={option} className="flex items-center text-xs">
                              <input
                                type="radio"
                                value={option}
                                checked={nominee.nominee_opt === option}
                                onChange={(e) => {
                                  const newOpt = e.target.value;
                                  handleNomineeChange(index, 'nominee_opt', newOpt);
                                  // If selecting "No", clear all other nominees
                                  if (newOpt === "No" && index === 0) {
                                    setNominees([{ ...nominees[0], nominee_opt: "No" }]);
                                  }
                                }}
                                className="mr-1"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm font-semibold">
                          {nominee.nominee_opt}
                        </p>
                      )}
                    </div>

                    {/* Show nominee details only if "Yes" is selected */}
                    {nominee.nominee_opt === "Yes" && (
                      <>
                        {/* Basic Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Nominee Name</label>
                            {isEditing.nominee ? (
                              <input
                                type="text"
                                value={nominee.nominee_name}
                                onChange={(e) => handleNomineeChange(index, 'nominee_name', e.target.value)}
                                placeholder="Enter nominee name"
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.nominee_name || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Date of Birth</label>
                            {isEditing.nominee ? (
                              <input
                                type="date"
                                value={nominee.nominee_DOB}
                                onChange={(e) => handleNomineeChange(index, 'nominee_DOB', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.nominee_DOB || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Nominee Type</label>
                            {isEditing.nominee ? (
                              <div className="flex gap-4">
                                {["Major", "Minor"].map(type => (
                                  <label key={type} className="flex items-center text-xs">
                                    <input
                                      type="radio"
                                      value={type}
                                      checked={nominee.nominee_Type === type}
                                      onChange={(e) => handleNomineeChange(index, 'nominee_Type', e.target.value)}
                                      className="mr-1"
                                    />
                                    {type}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.nominee_Type || 'Not provided'}
                              </p>
                            )}
                          </div>

                          {/* Relation - UPDATED WITH API DATA */}
                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Relation</label>
                            {isEditing.nominee ? (
                              loadingNomineeDropdown ? (
                                <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                                  <div className="flex items-center">
                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                    Loading...
                                  </div>
                                </div>
                              ) : (
                                <select
                                  value={nominee.relation}
                                  onChange={(e) => handleNomineeChange(index, 'relation', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Select Relation</option>
                                  {nomineeDropdownData.nomineeRelationShipType.map((relation) => (
                                    <option key={relation.id} value={relation.id}>
                                      {relation.relationship}
                                    </option>
                                  ))}
                                </select>
                              )
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.relation || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Percentage Allocation</label>
                            {isEditing.nominee ? (
                              <input
                                type="text"
                                value={nominee.percentage_allocation}
                                onChange={(e) => handleNomineeChange(index, 'percentage_allocation', e.target.value)}
                                placeholder="e.g., 50"
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.percentage_allocation ? `${nominee.percentage_allocation}%` : 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Mobile Number</label>
                            {isEditing.nominee ? (
                              <input
                                type="tel"
                                value={nominee.mobile_number}
                                onChange={(e) => handleNomineeChange(index, 'mobile_number', e.target.value)}
                                placeholder="Nominee mobile number"
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.mobile_number || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Email Address</label>
                            {isEditing.nominee ? (
                              <input
                                type="email"
                                value={nominee.email_address}
                                onChange={(e) => handleNomineeChange(index, 'email_address', e.target.value)}
                                placeholder="Nominee email address"
                                className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                {nominee.email_address || 'Not provided'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address Information */}
                        <div className="border-t pt-3">
                          <h4 className="text-xs font-semibold text-[#F9FAFB] mb-2">Address Information</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Address Line 1</label>
                              {isEditing.nominee ? (
                                <input
                                  type="text"
                                  value={nominee.address_line_1}
                                  onChange={(e) => handleNomineeChange(index, 'address_line_1', e.target.value)}
                                  placeholder="Address line 1"
                                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                  {nominee.address_line_1 || 'Not provided'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Address Line 2</label>
                              {isEditing.nominee ? (
                                <input
                                  type="text"
                                  value={nominee.address_line_2}
                                  onChange={(e) => handleNomineeChange(index, 'address_line_2', e.target.value)}
                                  placeholder="Address line 2"
                                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                  {nominee.address_line_2 || 'Not provided'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Address Line 3</label>
                              {isEditing.nominee ? (
                                <input
                                  type="text"
                                  value={nominee.address_line_3}
                                  onChange={(e) => handleNomineeChange(index, 'address_line_3', e.target.value)}
                                  placeholder="Address line 3"
                                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                  {nominee.address_line_3 || 'Not provided'}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">City</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="text"
                                    value={nominee.city}
                                    onChange={(e) => handleNomineeChange(index, 'city', e.target.value)}
                                    placeholder="City"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.city || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">State</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="text"
                                    value={nominee.state}
                                    onChange={(e) => handleNomineeChange(index, 'state', e.target.value)}
                                    placeholder="State"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.state || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Pin Code</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="text"
                                    value={nominee.pin_code}
                                    onChange={(e) => handleNomineeChange(index, 'pin_code', e.target.value)}
                                    placeholder="Pin code"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.pin_code || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              {/* Country - UPDATED WITH API DATA */}
                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Country</label>
                                {isEditing.nominee ? (
                                  loadingNomineeDropdown ? (
                                    <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                                      <div className="flex items-center">
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                        Loading...
                                      </div>
                                    </div>
                                  ) : (
                                    <select
                                      value={nominee.country}
                                      onChange={(e) => handleNomineeChange(index, 'country', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="">Select Country</option>
                                      {nomineeDropdownData.nomineeCountry.map((country) => (
                                        <option key={country.id} value={country.id}>
                                          {country.name}
                                        </option>
                                      ))}
                                    </select>
                                  )
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.country || 'Not provided'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Identity Information */}
                        <div className="border-t pt-3">
                          <h4 className="text-xs font-semibold text-[#F9FAFB] mb-2">Identity Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Identity Type - UPDATED WITH API DATA */}
                            <div>
                              <label className="block text-xs font-medium text-[#E5E7EB] mb-1">ID Proof Type</label>
                              {isEditing.nominee ? (
                                loadingNomineeDropdown ? (
                                  <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                                    <div className="flex items-center">
                                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                      Loading...
                                    </div>
                                  </div>
                                ) : (
                                  <select
                                    value={nominee.identity_type}
                                    onChange={(e) => handleNomineeChange(index, 'identity_type', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Select ID Proof</option>
                                    {nomineeDropdownData.nomineeIdentity.map((identity) => (
                                      <option key={identity.id} value={identity.id}>
                                        {identity.type}
                                      </option>
                                    ))}
                                  </select>
                                )
                              ) : (
                                <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                  {nominee.identity_type || 'Not provided'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-[#E5E7EB] mb-1">ID Proof Number</label>
                              {isEditing.nominee ? (
                                <input
                                  type="text"
                                  value={nominee.identity_number}
                                  onChange={(e) => handleNomineeChange(index, 'identity_number', e.target.value)}
                                  placeholder="ID proof number"
                                  className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                  {nominee.identity_number || 'Not provided'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Guardian Information - Only show when nominee type is Minor */}
                        {nominee.nominee_Type === "Minor" && (
                          <div className="border-t pt-3">
                            <h4 className="text-xs font-semibold text-[#F9FAFB] mb-2">Guardian Information (Required for Minor)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian Name</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="text"
                                    value={nominee.guardian_name}
                                    onChange={(e) => handleNomineeChange(index, 'guardian_name', e.target.value)}
                                    placeholder="Guardian name"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_name || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              {/* Guardian Relationship - UPDATED WITH API DATA */}
                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian Relation</label>
                                {isEditing.nominee ? (
                                  loadingNomineeDropdown ? (
                                    <div className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg bg-[#1F1A1A]">
                                      <div className="flex items-center">
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                        Loading...
                                      </div>
                                    </div>
                                  ) : (
                                    <select
                                      value={nominee.guardian_relationship}
                                      onChange={(e) => handleNomineeChange(index, 'guardian_relationship', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="">Select Relation</option>
                                      {nomineeDropdownData.nominee_guardian_relationship_types.map((relation) => (
                                        <option key={relation.id} value={relation.id}>
                                          {relation.relationship}
                                        </option>
                                      ))}
                                    </select>
                                  )
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_relationship || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian Date of Birth</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="date"
                                    value={nominee.guardian_DOB}
                                    onChange={(e) => handleNomineeChange(index, 'guardian_DOB', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_DOB || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian PAN</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="text"
                                    value={nominee.guardian_PAN}
                                    onChange={(e) => handleNomineeChange(index, 'guardian_PAN', e.target.value)}
                                    placeholder="Guardian PAN"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_PAN || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian Mobile</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="tel"
                                    value={nominee.guardian_mobile}
                                    onChange={(e) => handleNomineeChange(index, 'guardian_mobile', e.target.value)}
                                    placeholder="Guardian mobile"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_mobile || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">Guardian Email</label>
                                {isEditing.nominee ? (
                                  <input
                                    type="email"
                                    value={nominee.guardian_email}
                                    onChange={(e) => handleNomineeChange(index, 'guardian_email', e.target.value)}
                                    placeholder="Guardian email"
                                    className="w-full px-3 py-2 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="px-3 py-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-sm">
                                    {nominee.guardian_email || 'Not provided'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Show message when "No" is selected */}
                    {nominee.nominee_opt === "No" && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-sm text-yellow-800 font-medium">
                          No nominee selected. You can proceed without nominee details.
                        </p>
                      </div>
                    )}

                    {/* Show message when "No, but verify later" is selected */}
                    {nominee.nominee_opt === "No, but verify later" && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="text-sm text-blue-800 font-medium">
                          Nominee verification will be completed later.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Complete Registration Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#2A2A2A]">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isAllVerified2() ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                <CheckCircle className={`w-5 h-5 ${isAllVerified2() ? 'text-green-600' : 'text-yellow-600'
                  }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Complete Registration</h3>
                <p className="text-[#9CA3AF] text-xs">Finish your registration</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-2 rounded-lg ${isAllVerified2() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                <div className="flex items-center">
                  <CheckCircle className={`w-4 h-4 ${isAllVerified2() ? 'text-green-600' : 'text-yellow-600'
                    } mr-1`} />
                  <span className={`text-xs font-semibold ${isAllVerified2() ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                    {isAllVerified2() ? 'All verifications completed!' : `${Math.round(verificationProgress())}% completed`}
                  </span>
                </div>
                {!isAllVerified2() && (
                  <p className="text-yellow-700 text-xs mt-1">
                    Complete all verification steps to finish registration
                  </p>
                )}
              </div>

              <button
                onClick={handleCompleteRegistration}
                disabled={!isAllVerified2() || registrationStatus.loading}
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

          {showCanPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 backdrop-blur-md">
              <div className="bg-[#111111] rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative border border-[#2A2A2A]">
                <h2 className="text-xl font-semibold mb-3 text-center text-[#F9FAFB]">
                  {canError ? "Registration Status" : "CAN Created Successfully!"}
                </h2>

                {/* Display API Response Message */}
                <div className={`mb-4 p-3 rounded-lg ${canError ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 ${canError ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                      {canError ? (
                        <span className="text-sm font-bold">!</span>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${canError ? 'text-yellow-800' : 'text-blue-800'
                        }`}>
                        {canData?.message || canError || 'Registration completed'}
                      </p>
                    </div>
                  </div>
                </div>

                {!canError ? (
                  <div className="text-sm text-[#E5E7EB] space-y-3">
                    <p className="text-center text-green-700 font-medium">
                      Your Customer Application Number (CAN) has been generated successfully.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      <p>
                        <span className="font-medium text-[#F9FAFB]">Name:</span>{" "}
                        {partnerData.name || "Not available"}
                      </p>
                      <p>
                        <span className="font-medium text-[#F9FAFB]">Email:</span>{" "}
                        {partnerData.email || "Not available"}
                      </p>
                      <p>
                        <span className="font-medium text-[#F9FAFB]">CAN Number:</span>{" "}
                        <span className="text-green-700 font-semibold">
                          {canData?.can || "Not available"}
                        </span>
                      </p>
                      {canData?.link && (
                        <p>
                          <span className="font-medium text-[#F9FAFB]">Can Verification Link:</span>{" "}
                          <a
                            href={canData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium underline hover:text-blue-800"
                          >
                            Open Link
                          </a>
                        </p>
                      )}
                    </div>

                    <p className="text-center text-green-600 font-semibold mt-3">
                      Congratulations! You're now ready to log in and access your dashboard.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-yellow-600 space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="font-medium mb-2">Registration Completed with Note</p>
                      <p className="text-sm">
                        Your registration has been processed, but please note the following:
                      </p>
                      <p className="text-sm font-semibold mt-2">
                        {canError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center gap-3">
                  {!canError ? (
                    <>
                      <button
                        onClick={() => {
                          window.location.href = "/login";
                        }}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                      >
                        Go to Login
                      </button>
                      <button
                        onClick={() => setShowCanPopup(false)}
                        className="bg-[#2A2A2A] text-[#F9FAFB] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          // Allow user to proceed even with warnings
                          window.location.href = "/login";
                        }}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                      >
                        Proceed Anyway
                      </button>
                      <button
                        onClick={() => setShowCanPopup(false)}
                        className="bg-[#2A2A2A] text-[#F9FAFB] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                      >
                        Review Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;