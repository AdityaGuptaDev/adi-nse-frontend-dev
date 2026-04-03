import { create } from "zustand";
import {
    VerifyKYCTypes,
    NomineeTypes,
    PersonalInfo,
    BankDetails,
    POITypes,
    POATypes,
    // IPVTypes,
    IVTypes,
    IPTypes,
    SIGNTypes,
    // DocumentTypes,
    // FormTypes,
    // BasicFormTypes,
    // OTPFormTypes,
    // KYCStausTypes,
    // CommingFromTypes,
} from "@/types/RegistrationTypes";

interface StoreTypes {
    verifyKYC: VerifyKYCTypes;
    POIForm: POITypes;
    POAForm: POATypes;
    PIForm: PersonalInfo;
    BankDForm: BankDetails;
    SignForm: SIGNTypes;
    VideoForm: IVTypes;
    PhotoForm: IPTypes;
    NDNomineeOne: NomineeTypes;
    NDNomineeTwo: NomineeTypes;
    NDNomineeThree: NomineeTypes;
    nomineeSize: any;
    setVerifyKYC: (payload: VerifyKYCTypes) => void;
    setPOIForm: (payload: POITypes) => void;
    setPOAForm: (payload: POATypes) => void;
    setPIForm: (payload: PersonalInfo) => void;
    setBankDForm: (payload: BankDetails) => void;
    setSignForm: (payload: SIGNTypes) => void;
    setVideoForm: (payload: IVTypes) => void;
    setPhotoForm: (payload: IPTypes) => void;
    setNDNomineeOne: (payload: NomineeTypes) => void;
    setNDNomineeTwo: (payload: NomineeTypes) => void;
    setNDNomineeThree: (payload: NomineeTypes) => void;
    setNomineeSize: (payload: any) => void;
}

const useRegistrationStore = create<StoreTypes>((set) => ({
    verifyKYC: {
        PAN_No: "",
        NAME: "",
        Email: "",
        Mobile: "",
    },
    POIForm: {
        name: "",
        dob: "",
        fathers_name: "",
        pan_no: "",
        pan_doc: "",
        pan_image: "",
        mothersName: "",
        gender: "",
        maritalStatus: "",
        father_title: "",
        father_relation: "",
        tax_status: "",
        panImgCheck: "",
        // last_name: "",
        mothers_name: "",
        marital_status: "",
        reg_mobile: "",
        mobile_relation: "",
        reg_email: "",
        email_relation: "",
        guardian_pan_no: "",
        guardian_name: "",
        guardian_dob: "",
        relationship_primary: "",
        relationship_proof: "",
        relationship_proof_document: "",
        guardian_mobile: "",
        guardian_mobile_relation: "",
        guardian_email: "",
        guardian_email_relation: "",
    },
    POAForm: {
        documentHolderName: "",
        documentNumber: "",
        Address: "",
        pinCode: "",
        district: "",
        city: "",
        state: "",
        country: "",
        uploadPOAFront: null,
        uploadPOABack: null,
        addressType: null,
        addressProof: null,
        expiry_date: null,
        issue_date: null,
        poaConsentReceived: false,
    },
    PIForm: {
        gender: "",
        maritalStatus: "",
        motherName: "",
        fatherName: "",
        Occupation: "",
        AddressType: "",
        AnnualIncome: "",
        SourceIncome: "",
    },
    BankDForm: {
        AccountNumber: "",
        BankAddress: "",
        BankName: "",
        BankCity: "",
        nameAsPerBank: "",
        IFSC: "",
        MICR: "",
        BankBranch: "",
        cancelledCheque: null,
    },
    SignForm: {
        signature: null,
    },
    VideoForm: {
        video: [],
    },
    PhotoForm: {
        photo: null,
    },
    NDNomineeOne: {
        nominee_name: "",
        relation: "",
        nominee_percent: "",
        nominee_pan: "",
        nomDob: "",
        nominee_DOB: new Date(),
        age: 0,
        guardian_name: "",
        guardian_pan: "",
        nominee_proof_type: "",
        guardian_relation: "",
        uploadPan: null,
        showDate: false,
        minor: false,
        nomineeNameErr: false,
        relationErr: false,
        nomineePercentErr: false,
        pancardErr: false,
        dateOfBirthErr: false,
        guardianNameErr: false,
        guardianPANErr: false,
        nomineeDOBProofTypeErr: false,
        guardianRelationwithNomineeErr: false,
        uploadErr: false,
        isUploaded: false,
    },
    NDNomineeTwo: {
        nominee_name: "",
        relation: "",
        nominee_percent: "",
        nominee_pan: "",
        nomDob: "",
        nominee_DOB: new Date(),
        age: 0,
        guardian_name: "",
        guardian_pan: "",
        nominee_proof_type: "",
        guardian_relation: "",
        uploadPan: null,
        showDate: false,
        minor: false,
        nomineeNameErr: false,
        relationErr: false,
        nomineePercentErr: false,
        pancardErr: false,
        dateOfBirthErr: false,
        guardianNameErr: false,
        guardianPANErr: false,
        nomineeDOBProofTypeErr: false,
        guardianRelationwithNomineeErr: false,
        uploadErr: false,
        isUploaded: false,
    },
    NDNomineeThree: {
        nominee_name: "",
        relation: "",
        nominee_percent: "",
        nominee_pan: "",
        nomDob: "",
        nominee_DOB: new Date(),
        age: 0,
        guardian_name: "",
        guardian_pan: "",
        nominee_proof_type: "",
        guardian_relation: "",
        uploadPan: null,
        showDate: false,
        minor: false,
        nomineeNameErr: false,
        relationErr: false,
        nomineePercentErr: false,
        pancardErr: false,
        dateOfBirthErr: false,
        guardianNameErr: false,
        guardianPANErr: false,
        nomineeDOBProofTypeErr: false,
        guardianRelationwithNomineeErr: false,
        uploadErr: false,
        isUploaded: false,
    },
    nomineeSize: [0],
    setNomineeSize: (payload: any) =>
        set((state) => ({
            ...state,
            nomineeSize: payload,
        })),

    setVerifyKYC: (payload: any) =>
        set((state) => ({
            ...state,
            verifyKYC: payload,
        })),
    setPOIForm: (payload: any) => {
        set((state) => ({
            ...state,
            POIForm: payload,
        }));
    },
    setPOAForm: (payload: any) => {
        set((state) => ({
            ...state,
            POAForm: payload,
        }));
    },
    setPIForm: (payload: any) => {
        set((state) => ({
            ...state,
            PIForm: payload,
        }));
    },
    setBankDForm: (payload: any) => {
        set((state) => ({
            ...state,
            BankDForm: payload,
        }));
    },
    setSignForm: (payload: any) => {
        set((state) => ({
            ...state,
            SignForm: payload,
        }));
    },
    setVideoForm: (payload: any) => {
        set((state) => ({
            ...state,
            VideoForm: payload,
        }));
    },
    setPhotoForm: (payload: any) => {
        set((state) => ({
            ...state,
            PhotoForm: payload,
        }));
    },

    setNDNomineeOne: (payload: any) => {
        set((state) => ({
            ...state,
            NDNomineeOne: payload,
        }));
    },
    setNDNomineeTwo: (payload: any) => {
        set((state) => ({
            ...state,
            NDNomineeTwo: payload,
        }));
    },
    setNDNomineeThree: (payload: any) => {
        set((state) => ({
            ...state,
            NDNomineeThree: payload,
        }));
    },
}));

export default useRegistrationStore;
