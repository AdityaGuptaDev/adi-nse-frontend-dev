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
    };

    nism: {
        arnNumber: string;
        arnError: string;
        euinNumber: string;
        euinError: string;
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



export interface MobileVerificationRequest {
    mobile: string;
    userType: number;
}

export interface KYCInvestorRequest {
    email: string;
    phone: string;
    name: string;
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


