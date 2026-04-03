export interface AadhaarResponseState {
  aadhaar: string;       // Aadhaar number
  otp: string;           // OTP for verification
  ref_id: string;        // Reference ID from API
  loading: boolean;      // Loading state
  verified: boolean;     // Verification status
  error: string;         // Error message
  // Additional response data
  name?: string;
  dob?: string;
  address?: string;
}

export interface PartnerRegistrationState {
 
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  errors: {
    phone: string;
  };
}

export interface OTPState {
  otp: string;
  timer: number;
  canResend: boolean;
  loading: boolean;
  error: string;
}

export interface VerificationState {
  pan: {
    value: string;
    verified: boolean;
    loading: boolean;
    error: string;
  };
  email: {
    value: string;
    verified: boolean;
    loading: boolean;
    error: string;
    ref_id: string;
  };
  aadhaar: {
    isEditingAddress: any;

    value: string;
    verified: boolean;
    loading: boolean;
    error: string;
    modified: boolean;
    ref_id: string;
    // updating: boolean,
    // updateError: string,
    // lastUpdated: null,
  };
  bank: {
    accountNumber: string;
    ifsc: string;
    verified: boolean;
    loading: boolean;
    accountError: string;
    ifscError: string;
    ref_id: string;
  };

  nism: {
     arnNumber: string; // Add this
  arnError: string; 
  euinNumber:string;
    euinError:string;
    fileName: string;
    fileSize: string;
    fileType: string;
    base64Data: string;
    verified: boolean;
    loading: boolean;
    fileError: string;
    uploaded: string;
    uploadError: string;
    skipped: boolean; // Add this
  };
}
