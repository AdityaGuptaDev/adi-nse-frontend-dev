import api from '@/utils/api';

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
    data: AccountData | FinancialServiceData;
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
