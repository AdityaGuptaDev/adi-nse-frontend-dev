import api from '@/utils/api';



export interface MobileVerificationRequest {
  mobile: string;
  userType: number;
}

export class PartnerService {
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
    aadhaar: string
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
  }): Promise<any> {
    try {
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
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "PAN verification failed"
      );
    }
  }

  //6.Bank Account Verification

  static async bankAccountVerification(request: {
    mobile: string;
    bankAcNo: string;
    bankAcIfsc: string;
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
  static async createPartnerUser(request: {
    mobile: string;
   // email: string;
  }): Promise<any> {
    try {
      const response = await api.post(
        `${this.ApiUrl}/partner/partner_user_created`,
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
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
}

