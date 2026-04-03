import api from '@/utils/api';
import { PartnerRegistrationState, VerificationState } from './types1';
import getConfig from 'next/config';

export interface MobileVerificationRequest {
  mobile: string;
  userType: number;
}

export interface KYCInvestorRequest {
  email: string;
  phone: string;
  name: string ;
  pan_no: string;
}

export interface CompleteRegistrationRequest {
  partner: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    age: string;
    gender: string;
  };
  verification: {
    pan: {
      number: string;
      verified: boolean;
      validationMessage: string;
    };
    aadhaar: {
      number: string;
      verified: boolean;
    };
    bank: {
      accountNumber: string;
      ifsc: string;
      verified: boolean;
      bankName: string;
      branch: string;
      centre: string;
      city: string;
      state: string;
      micr: string;
      address: string;
    };
    email: {
      address: string;
      verified: boolean;
    };
  };
  fatca?: {
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
    tax_resident_countries: Array<{
      country: string;
      tax_payer_id: string;
      id_document_type: string;
    }>;
  };
  nominees?: Array<{
    nominee_opt: string;
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
  }>;
}

export class PartnerService {
  static partnerMobileToAccount(mobile: string) {
    throw new Error('Method not implemented.');
  }
  static verifyAadhaarDirect: any;
  static getUserDataFromMobile: any;
  static verifyEmailDirect(arg0: { mobile: string; email: string; }) {
    throw new Error('Method not implemented.');
  }
  private static readonly ApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  //get the current status of the partner with mobile number -
  static async fnGetPartnerCurrentStatus(mobile: string): Promise<any> {
  try {
    const response = await api.get<any>(
      `${this.ApiUrl}/partner/fnGetPartnerCurrentStatus/${mobile}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch partner status";
    throw new Error(errorMessage);
  }
}


// KYC Investor Creation in Signzy
  static async createKYCInvestor(request: KYCInvestorRequest): Promise<any> {
    try {
      console.log('Creating KYC investor with payload:', request);
      
      const response = await api.post<any>(
        `${this.ApiUrl}/kyc/create_kyc_investor_sinzy`,
        request,
        // {
        //   headers: {
        //     Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
        //     "Content-Type": "application/json",
        //   },
        // }
      );
      
      console.log('KYC Investor creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('KYC Investor creation error:', error);
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to create KYC investor";
      throw new Error(errorMessage);
    }
  }

  // Complete Registration with all data
  static async completeRegistration(request: CompleteRegistrationRequest): Promise<any> {
    try {
      console.log('Completing registration with payload:', request);
      
      const response = await api.post<any>(
        `${this.ApiUrl}/kyc/complete-registration`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Complete registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Complete registration error:', error);
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to complete registration";
      throw new Error(errorMessage);
    }
  }


// Get the current status of the partner with mobile number
static async getPartnerStatus(
  mobile: string,
  userType: number
): Promise<any> {
  try {
    const response = await api.post<any>(
      `${this.ApiUrl}/partner/getPartnerStatus`,
      { mobile, userType }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch partner status";
    throw new Error(errorMessage);
  }
}

//creation of API service for decentro log details data -
static async getUserDecentroData(mobile: string): Promise<any> {
  try {
    const response = await api.get<any>(
      `${this.ApiUrl}/partner/getDecentroLog/${mobile}`
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch partner status";
    throw new Error(errorMessage);
  }
}


static async getPartnerDtlWithMobile(
  mobile: string
): Promise<any> {
  try {
    const response = await api.get<any>(
      `${this.ApiUrl}/partner/getPartnerDtlWithMobile`,
      {
        params: { mobile }, // Use params for GET request
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch partner details";
    throw new Error(errorMessage);
  }
}

  //1.Mobile Verification

  static async sendOtpForMobileVerification(
    request: MobileVerificationRequest
  ): Promise<any> {
    try {
      const response = await api.post<any>(
        `${this.ApiUrl}/partner/mobile-verification`,
        request
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "OTP request failed";
      throw new Error(errorMessage);
    }
  }

  //2.OTP Mobile Verifiaction

  static async verifyOtpForMobile(request: {
    mobile: string;
    userType: number;
    otp: string;
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/mobile-otp-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }

  //3.Aadhaar Verification

  static async sendOtpForAadhaarVerification(request: {
    mobile: string,
    aadhaar: string,
    userTypeId:number
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/aadhaar-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Aadhaar Verification Failed"
      );
    }
  }
  //4.OTP Aadhaar Verification

  static async verifyOtpForAadhaarVerification(request: {
    mobile: string;
    aadhaar: string;
    otp: string;
    ref_id: string;
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/aadhaar-otp-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "OTP Verificaton Failed"
      );
    }
  }

  //5.Email Verification

  static async sentOtpForEmailVerification(request: {
    mobile: string;
    email: string;
  }): Promise<{ data: { status: string; remark?: string; ref_id?: string } }> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/email-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email verification OTP failed to send"
      );
    }
  }

  //6. Email OTP Verification
  static async verifyOtpForEmailVerification(request: {
    mobile: string;
    email: string;
    otp: string;
    userTypeId:number
  }): Promise<{
    data: {
      status: string;
      remark?: string;
      verificationResult?: Array<{
        email: string;
        emailVerified: number;
        emailVerifiedAt: string;

      }>;
    };
  }> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/email-otp-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email OTP verification failed"
      );
    }
  }
  //7.Pan Verification

  static async panNoVerification(request: {
    mobile: string;
    pan: string;
    name: string;
    dob: string;
     userTypeId: number
  }): Promise<any> {
    try {
      console.log("PAN Verification Request:", request);

      const response = await api.post(
        `${this.ApiUrl}/partner/pan-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("PAN Verification Response:", response.data);

      return response.data;

    } catch (error: any) {
      console.error("PAN Verification Error:", error);

      // =======================
      // 🔍 Detailed Error Logs
      // =======================

      if (error.response) {
        console.error("API Error Response Data:", error.response.data);
        console.error("API Error Status:", error.response.status);
        console.error("API Error Headers:", error.response.headers);
      }

      if (error.message) {
        console.error("Error Message:", error.message);
      }

      if (error.stack) {
        console.error("Error Stack:", error.stack);
      }

      if (error.errors) {
        console.error("Validation Errors:", error.errors);
      }

      if (error.parent) {
        console.error("DB Error Parent:", error.parent);
      }

      if (error.original) {
        console.error("Original DB Error:", error.original);
      }

      if (error.fields) {
        console.error("Error Fields:", error.fields);
      }

      if (error.sql) {
        console.error("Executed SQL:", error.sql);
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "PAN verification failed"
      );
    }
  }


  //6.Bank Account Verification

  static async bankAccountVerification(request: {
    mobile: string;
    bankAcNo: string;
    bankAcIfsc: string;
    userTypeId:number,
    //bankAcNameInBank: string;
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/bank-account-verification`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Bank Account Verificaton Failed"
      );
    }
  }

  //7.NISM Upload section
  static async uploadNismDocument(request: {
    mobile: string;
    nismDoc: string;
    arn_no:string;
    euin_no:string;
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/nism-upload`,
        request,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "NISM Document Upload Failed"
      );
    }
  }

  // updating the address
  static async saveContinueAadhaarDetails(request: {
    name: string;
    adhaar: string;
    mobile: string;
    address: string;
    dob: string;
  }): Promise<any> {
    try {

      const truncatedAddress = request.address.length > 100
        ? request.address.substring(0, 100)
        : request.address;
      const response = await api.post(
        `${this.ApiUrl}/partner/save_continue_adhaar_details`,
        {
          ...request,
          address: truncatedAddress
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to save Aadhaar details"
      );
    }
  }

  // creating user
static async createPartnerUser(
  partnerData: PartnerRegistrationState,
  verification: VerificationState,
  emailToUse?: string // Add this parameter
): Promise<any> {
  try {
    // Determine which email to use:
    // 1. If emailToUse is provided, use it
    // 2. Otherwise use partnerData.email (which might be empty)
    const finalEmail = emailToUse || partnerData.email;

    // Prepare the complete request payload with all verified data
    const requestPayload = {
      mobile: partnerData.phone,
      name: partnerData.name,
      email: finalEmail, // Use the determined email
      dob: partnerData.dob,
      address: partnerData.address,
      pincode: partnerData.pincode,
      aadhaar: verification.aadhaar.value.replace(/\s/g, ''), 
      pan: verification.pan.value,
      bank_account: verification.bank.accountNumber,
      ifsc: verification.bank.ifsc,
      bank_name: verification.bank.bankName,
      micr: verification.bank.micr,
      nism_arn: verification.nism.arnNumber || '',
      nism_euin: verification.nism.euinNumber || '',
      nism_certificate_uploaded: !verification.nism.skipped,
      nism_file_name: verification.nism.fileName || '',
      aadhaar_verified: verification.aadhaar.verified || false,
      pan_verified: verification.pan.verified || false,
      bank_verified: verification.bank.verified || false,
      email_verified: verification.email.verified || false,
    };

    console.log('Sending complete registration data to partner_user_created:', requestPayload);

    const response = await api.post(
      `${this.ApiUrl}/partner/partner_user_created`,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log('Registration API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration API Error:', error);
    throw new Error(
      error.response?.data?.message || "Failed to create user"
    );
  }
}

static async createBcUser(
  partnerData: PartnerRegistrationState,
  verification: VerificationState
): Promise<any> {
  try {
    // Prepare the complete request payload with all verified data
    const requestPayload = {
      mobile: partnerData.phone,
      name: partnerData.name,
      dob: partnerData.dob,
      address: partnerData.address,
      pincode: partnerData.pincode,
      aadhaar: verification.aadhaar.value.replace(/\s/g, ''), 
      pan: verification.pan.value,
      bank_account: verification.bank.accountNumber,
      ifsc: verification.bank.ifsc,
      bank_name: verification.bank.bankName,
      micr: verification.bank.micr,
      email: partnerData.email,
      aadhaar_verified: verification.aadhaar.verified,
      pan_verified: verification.pan.verified,
      bank_verified: verification.bank.verified,
      email_verified: verification.email.verified,
    };

    console.log('Sending complete registration data to bc_user_created:', requestPayload);

    const response = await api.post(
      `${this.ApiUrl}/partner/bc_user_created`,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log('Registration API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration API Error:', error);
      // =======================
      // 🔍 Detailed Error Logs
      // =======================
      if (error.response) {
        console.error("API Error Response Data:", error.response.data);
        console.error("API Error Status:", error.response.status);
        console.error("API Error Headers:", error.response.headers);
      }

      if (error.message) {
        console.error("Error Message:", error.message);
      }

      if (error.stack) {
        console.error("Error Stack:", error.stack);
      }

      if (error.errors) {
        console.error("Validation Errors:", error.errors);
      }

      if (error.parent) {
        console.error("DB Error Parent:", error.parent);
      }

      if (error.original) {
        console.error("Original DB Error:", error.original);
      }

      if (error.fields) {
        console.error("Error Fields:", error.fields);
      }

      if (error.sql) {
        console.error("Executed SQL:", error.sql);
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "BC User Creation failed"
      );
    throw new Error(
      error.response?.data?.message || "Failed to create user"
    );
  }
}

}

