//New
export type VerifyKYCTypes = {
  PAN_No: string;
  NAME: string;
  Email: string;
  Mobile: string;
};

//New
export type NomineeTypes = {
  nominee_name: string;
  relation: string;
  nominee_percent: string;
  nominee_pan: string;
  nomDob: string;
  nominee_DOB: any;
  age: number;
  guardian_name: string;
  guardian_pan: string;
  nominee_proof_type: string;
  guardian_relation: string;
  uploadPan: any;
  showDate: boolean;
  minor: boolean;
  nomineeNameErr: boolean;
  relationErr: boolean;
  nomineePercentErr: boolean;
  pancardErr: boolean;
  dateOfBirthErr: boolean;
  guardianNameErr: boolean;
  guardianPANErr: boolean;
  nomineeDOBProofTypeErr: boolean;
  guardianRelationwithNomineeErr: boolean;
  uploadErr: boolean;
  isUploaded: boolean;
};

// nomineeName: string;
// relation: string;
// nomineeDOB: string;
// percent: string;
// gaurdianName: string;
// gaurdianPan: string;
// nomineePan: string;
// Nominee_DOB_Proof_Type: string;
// document: string;
// Guardian_Rel_Type: string;
///New
export type PersonalInfo = {
  gender: string;
  maritalStatus: string;
  motherName: string;
  fatherName: string;
  Occupation: string;
  AddressType: string;
  AnnualIncome: string;
  SourceIncome: string;
};
// otherIncome: string;
// nomineeList: NomineeTypes[];

//New
export type BankDetails = {
  AccountNumber: string;
  BankAddress: string;
  BankName: string;
  BankCity: string;
  nameAsPerBank: string;
  IFSC: string;
  MICR: string;
  BankBranch: string;
  cancelledCheque: any;
};
// cancelledCheque?: any;
// accountNumber: string;
// bankAddress: string;
// bankName: string;
// branch: string;
// IFSC: string;
// MICR: string;
// nameAsBank: string;
// bankCity: string;
// accountType: string;

//New
export type POITypes = {
  name: string;
  dob: string;
  fathers_name: string;
  pan_no: string;
  pan_doc: any;
  pan_image: any;
  mothersName: string;
  gender: string;
  maritalStatus: string;
  father_title: string;
  father_relation: string;
  tax_status: string,
  panImgCheck: string,
  mothers_name: string,
  marital_status: string,
  reg_mobile: string,
  mobile_relation: string,
  reg_email: string,
  email_relation: string,
  guardian_pan_no: string,
  guardian_name: string,
  guardian_dob: string,
  relationship_primary: string,
  relationship_proof: string,
  relationship_proof_document: string,
  guardian_mobile: string,
  guardian_mobile_relation: string,
  guardian_email: string,
  guardian_email_relation: string,
};

//New
export type POATypes = {
  addressProof: any;
  documentHolderName: string;
  documentNumber: string;
  Address: string;
  pinCode: string;
  district: string;
  city: string;
  state: string;
  country: string;
  uploadPOAFront: any;
  uploadPOABack: any;
  addressType: any;
  issue_date: any;
  expiry_date: any;
  poaConsentReceived: boolean;
};
// DocType: string;
// aadharFront: any;
// aadharBack: any;
// aadharNumber: string;
// name: string;
// address: string;
// state: string;
// city: string;
// district: string;
// pincode: string;
// issueDate: string;
// expiryDate: string;

//New
export type IVTypes = {
  video: any;
};

//New
export type IPTypes = {
  photo: any;
};

//New
export type SIGNTypes = {
  signature: any;
};

export type IPVTypes = {
  photo: any;
  video: any;
};

export type DocumentTypes = {
  POI: POITypes;
  POA: POATypes;
  IPV: IPVTypes;
  SIGN: SIGNTypes;
};

export type FormTypes = {
  verifyKYC: VerifyKYCTypes;
  KYCStatus: KYCStausTypes;
  loading: boolean;
  submitAttempt: boolean;
};

export type BasicFormTypes = {
  PAN_No: string;
  Name: string;
  Email: string;
  Mobile: string;
};

export type OTPFormTypes = {
  OTP_E: string;
  OTP_M: string;
};

export type KYCStausTypes = null | "Y" | "N";
export type CommingFromTypes = "next" | "back" | "none";
