export interface AadhaarResponseState {
  aadhaar: string;      
  otp: string;        
  ref_id: string;        
  loading: boolean;      
  verified: boolean;   
  error: string;   
  name?: string;
  dob?: string;
  address?: string;
}

export interface PartnerRegistrationState {
  age: string;
  gender: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  pincode: string;
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
    [x: string]: any;
    
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
    //otpSent:boolean;
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
     // NEW BANK FIELDS
      bankName: string;
      branch: string;
      centre: string;
      city: string;
      state: string;
      micr: string;
      address: string;
      error: string;
  };

  nism: {
     arnNumber: string; 
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
    skipped: boolean; 
    arnHolder?: boolean;
  };
}
