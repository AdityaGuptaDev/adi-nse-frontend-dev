"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import CustomText from "@/commonUI/Text";
import CustomInput from "@/commonUI/Input";
import CustomButton from "@/commonUI/Button";
import { FaCircleCheck } from "react-icons/fa6";
import AddressDetail from "./AddressDetail";
import CustomReactSelect from "@/commonUI/ReactSelect";
import FullPageLoader from "@/commonUI/FullPageLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import OtpInput from "react-otp-input";

import * as yup from "yup";
import { useForm } from "react-hook-form";
import {
  ADD_MEMBER,
  KYC_STEPS,
  MEMBER_DATA,
  MEMBER_TYPE,
  NODE_API_URL,
  PAN_NO_REGEX,
  USER_DATA,
  formatTime,
  phoneRegExp,
  EMAIL_REGEX,
  MOBILE_REGEX,
  MOBILE_VERIFICATION_RESPONSE,
} from "@/utils/constants";
import {
  getLS,
  handleServerError,
  setLS,
  toastAlert,
} from "@/utils/helpers";
import api from "@/utils/api";
import Link from "next/link";
import AccountContext from "@/context/AccountContext/Account.context";
import { useRouter } from "next/navigation";
import useRegistrationStore from "../../store";
import { MdEdit } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";

// Create dynamic schema based on KYC status and tax status
const createValidationSchema = (isKYCDone: boolean, poiConsent: boolean, taxStatus: string) => {
  return yup.object().shape({
    tax_status: yup.string().trim().required("Tax Status is required"),
    name: yup.string().required("Name is required"),
    dob: yup.string().required("Date of birth is required"),
    gender: yup.string().required("Gender is required"),
    fathers_name: yup.string().required("Father's Name is required"),
    father_title: yup.string().required("Father's title is required"),
    father_relation: yup.string().required("Father's relation is required"),
    mothers_name: yup.string().required("Mother's Name is required"),
    marital_status: yup.string().required("Marital Status is required"),
    reg_mobile: yup
      .string()
      .matches(phoneRegExp, "Mobile No is not valid")
      .required("Mobile No is required")
      .min(10, "Invalid mobile number")
      .max(10, "Invalid mobile number")
      .required("Mobile Number is required")
      .typeError("Please enter valid Mobile number"),
    mobile_relation: yup.string().required("Mobile Relation is required"),
    reg_email: yup
      .string()
      .email("Email is not valid")
      .required("Email is required"),
    email_relation: yup.string().required("Email Relation is required"),


    guardian_pan_no: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Guardian PAN No is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_name: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Guardian Name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_dob: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Guardian Date of Birth is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    relationship_primary: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Relationship is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    relationship_proof: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Relationship proof is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    // Add relationship proof document field for Minor
    relationship_proof_document: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Relationship proof document is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_mobile: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) =>
        schema
          .required("Mobile No is required")
          .matches(phoneRegExp, "Mobile No is not valid")
          .min(10, "Invalid mobile number")
          .max(10, "Invalid mobile number")
          .typeError("Please enter valid Mobile number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_mobile_relation: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Guardian mobile relation is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_email: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) =>
        schema.required("Guardian email is required").email("Email is not valid"),
      otherwise: (schema) => schema.notRequired(),
    }),
    guardian_email_relation: yup.string().when("tax_status", {
      is: (value: any) => {
        return value === "Minor" || taxStatus === "Minor";
      },
      then: (schema) => schema.required("Guardian email relation is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
};

function POI() {
  const addressRef = useRef<any>(null);
  const router = useRouter();

  const [taxStatus, setTaxStatus] = useState<any>();
  const [singzyData, setSingzyData] = useState<any>([]);
  const [fileName, setFileName] = useState<any>("");
  const [relationshipProofFileName, setRelationshipProofFileName] = useState<any>("");
  const [userData, setUserData] = useState<any>("");
  const [personalDetailLoader, setPersonalDetailLoader] = useState<any>(false);
  const [panUploadLoader, setPanUploadLoader] = useState<any>(false);
  const [relationshipProofUploadLoader, setRelationshipProofUploadLoader] = useState<any>(false);
  const [panCheckLoader, setPanCheckLoader] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [isMember, setIsMember] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [mobileVerify, setMobileVerify] = useState<any>(false);
  const [emailVerify, setEmailVerify] = useState<any>(false);
  const [otpData, setOtpData] = useState<any>(false);
  const [timer, setTimer] = useState(60);
  const [otpVerifyLoader, setOtpVerifyLoader] = useState<any>(false);
  const [emailOTP, setEmailOTP] = useState<any>();
  const [mobileOTP, setMobileOTP] = useState<any>();
  const { setListings, listings } = useContext<any>(AccountContext);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [steps, setSteps] = useState<any>({
    pan_step: true,
    address_step: false,
    bank_step: false,
    fatca_step: false,
    nominee_step: false,
    personalverification_step: false
  })

  // Extract mobile number from mobile verification response
  const extractMobileNumberFromResponse = () => {
    const mobileVerificationData = getLS(MOBILE_VERIFICATION_RESPONSE);
    console.log("Mobile verification data:", mobileVerificationData);

    if (mobileVerificationData) {
      // Check if it's the new structure with verifiedMobileNumber
      if (mobileVerificationData.verifiedMobileNumber) {
        return mobileVerificationData.verifiedMobileNumber;
      }

      // Check if it's the old structure with data array
      if (mobileVerificationData.data && Array.isArray(mobileVerificationData.data)) {
        const financialDataItem = mobileVerificationData.data.find((item: any) =>
          item.source === "financial_service_data_pull"
        );
        const phoneNumber = financialDataItem?.response?.data?.phoneInfo?.[0]?.number;
        return phoneNumber || "";
      }

      // Check if it's the direct array structure
      if (Array.isArray(mobileVerificationData)) {
        const financialDataItem = mobileVerificationData.find((item: any) =>
          item.source === "financial_service_data_pull"
        );
        const phoneNumber = financialDataItem?.response?.data?.phoneInfo?.[0]?.number;
        return phoneNumber || "";
      }
    }
    return "";
  };

  // Extract email from mobile verification response
  const extractEmailFromResponse = () => {
    const mobileVerificationData = getLS(MOBILE_VERIFICATION_RESPONSE);
    console.log("Mobile verification data for email:", mobileVerificationData);

    if (mobileVerificationData) {
      let dataArray = mobileVerificationData;

      // Handle new structure
      if (mobileVerificationData.data && Array.isArray(mobileVerificationData.data)) {
        dataArray = mobileVerificationData.data;
      }

      if (Array.isArray(dataArray)) {
        const financialDataItem = dataArray.find((item: any) =>
          item.source === "financial_service_data_pull"
        );

        // Get email from emailInfo array
        const emailInfo = financialDataItem?.response?.data?.emailInfo;
        if (emailInfo && Array.isArray(emailInfo) && emailInfo.length > 0) {
          const primaryEmail = emailInfo[0]?.emailAddress;
          console.log("Extracted email from verification:", primaryEmail);
          return primaryEmail || "";
        }
      }
    }
    return "";
  };

  // Extract PAN number from mobile verification response
  const extractPANFromResponse = () => {
    const mobileVerificationData = getLS(MOBILE_VERIFICATION_RESPONSE);
    if (mobileVerificationData) {
      let dataArray = mobileVerificationData;

      // Handle new structure
      if (mobileVerificationData.data && Array.isArray(mobileVerificationData.data)) {
        dataArray = mobileVerificationData.data;
      }

      if (Array.isArray(dataArray)) {
        const financialDataItem = dataArray.find((item: any) =>
          item.source === "financial_service_data_pull"
        );
        const panNumber = financialDataItem?.response?.data?.identityInfo?.panNumber?.[0]?.idNumber;
        return panNumber || "";
      }
    }
    return "";
  };

  // Extract personal info from mobile verification response
  const extractPersonalInfoFromResponse = () => {
    const mobileVerificationData = getLS(MOBILE_VERIFICATION_RESPONSE);
    if (mobileVerificationData) {
      let dataArray = mobileVerificationData;

      // Handle new structure
      if (mobileVerificationData.data && Array.isArray(mobileVerificationData.data)) {
        dataArray = mobileVerificationData.data;
      }

      if (Array.isArray(dataArray)) {
        const financialDataItem = dataArray.find((item: any) =>
          item.source === "financial_service_data_pull"
        );
        return financialDataItem?.response?.data?.personalInfo || null;
      }
    }
    return null;
  };

  useEffect(() => {
    let getUser: any = getLS(USER_DATA);
    let isMember = getLS(ADD_MEMBER)
    let memberData = getLS(MEMBER_DATA)

    console.log("getUser", getUser)

    let step = isMember ? memberData?.InvestorRegistration?.last_kyc_step : getUser?.InvestorRegistration?.last_kyc_step || 2
    if (step == 2) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: true,
        address_step: false,
        fatca_step: false,
        bank_step: false,
        nominee_step: false,
        personalverification_step: false
      }))
    }
    else if (step == 3) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: false,
        address_step: true,
        fatca_step: false,
        bank_step: false,
        nominee_step: false,
        personalverification_step: false
      }))
    }
    else if (step == 4) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: false,
        address_step: false,
        fatca_step: true,
        bank_step: false,
        nominee_step: false,
        personalverification_step: false
      }))
    }
    else if (step == 5) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: false,
        address_step: false,
        fatca_step: false,
        bank_step: true,
        nominee_step: false,
        personalverification_step: false
      }))
    }
    else if (step == 6) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: false,
        address_step: false,
        fatca_step: false,
        bank_step: false,
        nominee_step: true,
        personalverification_step: false
      }))
    }
    else if (step == 7) {
      setSteps((prev: any) => ({
        ...prev,
        pan_step: false,
        address_step: false,
        fatca_step: false,
        bank_step: false,
        nominee_step: false,
        personalverification_step: true
      }))
    } else if (step == 8) {
      router.push("/kyc-quick-summary");
    }
  }, [])

  const { verifyKYC, setVerifyKYC, POIForm, setPOIForm } = useRegistrationStore();

  // Create schema based on KYC status and tax status
  const validationSchema = createValidationSchema(
    userData?.InvestorRegistration?.isKYCDone,
    userData?.InvestorRegistration?.poiConsent,
    taxStatus
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    watch,
    setValue,
  } = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      tax_status: "",
      pan_image: "",
      pan_no: "",
      name: "",
      dob: "",
      gender: "",
      fathers_name: "",
      father_title: "",
      father_relation: "",
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
  });

  // Single useEffect to handle all data initialization
  useEffect(() => {
    if (dataLoaded) return; // Prevent multiple executions

    const initializeData = async () => {
      let getUser: any = getLS(USER_DATA);
      let isMember = getLS(ADD_MEMBER);
      let memberData = getLS(MEMBER_DATA);

      console.log("Initializing data...");

      // Set user data first
      if (memberData) {
        setIsMember(isMember);
        setUserData(memberData);
      } else {
        setUserData(getUser);
      }

      // Get listings data
      await listings_data({ isMember, memberData, getUser });

      // Extract data from mobile verification response
      const mobileNumber = extractMobileNumberFromResponse();
      const email = extractEmailFromResponse();
      const personalInfo = extractPersonalInfoFromResponse();
      const panNumber = extractPANFromResponse();

      console.log("Extracted mobile number:", mobileNumber);
      console.log("Extracted email:", email);
      console.log("Mobile verification personal info:", personalInfo);
      console.log("Extracted PAN:", panNumber);

      // Set mobile number from mobile verification with highest priority
      if (mobileNumber) {
        setVerifiedMobileNumber(mobileNumber);
        setValue("reg_mobile", mobileNumber, { shouldValidate: true });
        console.log("Set mobile from mobile verification:", mobileNumber);

        // Also update verifyKYC state
        setVerifyKYC({
          ...verifyKYC,
          Mobile: mobileNumber,
        });
      }

      // Set email from mobile verification with highest priority
      if (email) {
        setVerifiedEmail(email);
        setValue("reg_email", email, { shouldValidate: true });
        console.log("Set email from mobile verification:", email);

        // Also update verifyKYC state
        setVerifyKYC({
          ...verifyKYC,
          Email: email,
        });
      }

      // Set values from mobile verification with priority
      if (personalInfo) {
        if (personalInfo.fullName) {
          setValue("name", personalInfo.fullName, { shouldValidate: true });
          console.log("Set name from mobile verification:", personalInfo.fullName);
        }

        if (personalInfo.gender) {
          const genderItem = listings.gender?.find((item: any) =>
            item.gender?.toLowerCase() === personalInfo.gender?.toLowerCase()
          );
          if (genderItem) {
            setValue("gender", genderItem.id, { shouldValidate: true });
            console.log("Set gender from mobile verification:", genderItem.id);
          }
        }

        if (personalInfo.dob) {
          const dobDate = new Date(personalInfo.dob);
          if (!isNaN(dobDate.getTime())) {
            const formattedDob = dobDate.toISOString().split('T')[0];
            setValue("dob", formattedDob, { shouldValidate: true });
            console.log("Set DOB from mobile verification:", formattedDob);
          }
        }
      }

      // Set PAN number
      if (panNumber) {
        setValue("pan_no", panNumber, { shouldValidate: true });
        console.log("Set PAN from mobile verification:", panNumber);
      } else if (getUser?.InvestorRegistration?.pan_no) {
        setValue("pan_no", isMember ? memberData?.InvestorRegistration?.pan_no : getUser?.InvestorRegistration?.pan_no);
      }

      // Set other user data only if not set by mobile verification
      if (!personalInfo?.fullName && getUser?.InvestorRegistration?.name) {
        setValue("name", isMember ? memberData?.InvestorRegistration?.name : getUser?.InvestorRegistration?.name);
      }

      // Set email information only if not set by mobile verification
      if (!email) {
        if (!(getUser?.partner?.regId || getUser?.RM?.id || getUser?.superAdmin)) {
          setValue("reg_email", getUser?.email);
          if (!verifiedEmail) {
            setVerifyKYC({
              ...verifyKYC,
              Email: getUser?.email,
            });
          }
        } else {
          setValue("reg_email", getUser?.InvestorRegistration?.reg_email || "");
        }
      }

      // Set mobile information only if not set by mobile verification
      if (!mobileNumber) {
        if (!(getUser?.partner?.regId || getUser?.RM?.id || getUser?.superAdmin)) {
          setValue("reg_mobile", getUser?.mobile);
          if (!verifiedMobileNumber) {
            setVerifyKYC({
              ...verifyKYC,
              Mobile: getUser?.mobile,
            });
          }
        } else {
          setValue("reg_mobile", getUser?.InvestorRegistration?.reg_mobile || "");
        }
      }

      // Set default values
      setValue("father_title", "Mr.");
      setValue("fathers_name", getUser?.InvestorRegistration?.fathers_name || "");

      // Fetch detailed data
      await fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);

      setDataLoaded(true);
    };

    initializeData();
  }, [listings.gender, setValue, dataLoaded]);

  const fetchData = async (id: any) => {
    try {
      const res = await api.get(`/kyc/get-personal-info/${id}`);
      if (res.data.data) {
        let dataValue = res.data.data;
        setFileName(dataValue.pan_doc);
        console.log(dataValue.tax_status, 'dataValue.tax_status');

        if (dataValue.tax_status) {
          setValue("tax_status", dataValue.tax_status);
          const find = listings.tax_status.find((item: any) => item.id == dataValue.tax_status);
          if (find) {
            setTaxStatus(find.status);
          }
        }

        setValue("pan_image", dataValue.pan_doc);

        // Only set PAN if not already set by mobile verification
        if (!watch("pan_no")) {
          setValue("pan_no", dataValue.pan_no);
        }

        // Only set name if not already set by mobile verification
        if (!watch("name")) {
          setValue("name", dataValue.name);
        }

        // Only set DOB if not already set by mobile verification
        if (!watch("dob")) {
          if (dataValue.dob) {
            const dobDate = new Date(dataValue.dob);
            const formattedDob = dobDate.toISOString().split('T')[0];
            setValue("dob", formattedDob);
          }
        }

        // Only set gender if not already set by mobile verification
        if (!watch("gender")) {
          if (dataValue.gender) {
            const genderItem = listings.gender?.find((item: any) =>
              item.gender?.toLowerCase() === dataValue.gender?.toLowerCase() ||
              item.id === dataValue.gender
            );
            if (genderItem) {
              setValue("gender", genderItem.id);
            } else {
              setValue("gender", dataValue.gender);
            }
          }
        }

        // Only set mobile if not already set by mobile verification
        if (!verifiedMobileNumber && dataValue.reg_mobile) {
          setValue("reg_mobile", dataValue.reg_mobile);
        }

        // Only set email if not already set by mobile verification
        if (!verifiedEmail && dataValue.reg_email) {
          setValue("reg_email", dataValue.reg_email);
        }

        setValue("fathers_name", dataValue.fathers_name);
        if (dataValue.father_title) {
          setValue("father_title", dataValue.father_title);
        }
        setValue("father_relation", dataValue.father_relation);
        setValue("mothers_name", dataValue.mothers_name);
        setValue("marital_status", dataValue.marital_status);
        setValue("mobile_relation", dataValue.mobile_relation);
        setValue("email_relation", dataValue.email_relation);
        setValue("guardian_pan_no", dataValue.guardian_pan_no);
        setValue("guardian_name", dataValue.guardian_name);

        if (dataValue.guardian_dob) {
          const guardianDobDate = new Date(dataValue.guardian_dob);
          const formattedGuardianDob = guardianDobDate.toISOString().split('T')[0];
          setValue("guardian_dob", formattedGuardianDob);
        }

        setValue("relationship_primary", dataValue.relationship_primary);
        setValue("relationship_proof", dataValue.relationship_proof);
        setValue("guardian_mobile", dataValue.guardian_mobile);
        setValue("guardian_mobile_relation", dataValue.guardian_mobile_relation);
        setValue("guardian_email", dataValue.guardian_email);
        setValue("guardian_email_relation", dataValue.guardian_email_relation);
        setValue("relationship_proof_document", dataValue.relationship_proof_document);
        setRelationshipProofFileName(dataValue.relationship_proof_document);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const investorLogin = async (values: any) => {
    try {
      const payload: any = {
        username: values?.signzy_user_name,
        password: values?.signzy_kyc_id,
      };
      const res = await api.post(`/kyc/investorSignzyLogin`, payload);
      if (res?.data?.data) {
        setSingzyData(res?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const listings_data = async ({ isMember, memberData, getUser }: any) => {
    try {
      const res = await api.get(`/kyc/on-boarding-listings`);
      if (res?.data?.data) {
        const list = res?.data?.data;
        setListings((prev: any) => ({
          ...prev,
          ...(list as Partial<any>),
        }));
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const handlePOIEditProcess = () => {
    setIsEdit(true);
    setSteps((prev: any) => ({
      ...prev,
      pan_step: true,
      address_step: false,
      bank_step: false,
      fatca_step: false,
      nominee_step: false,
      personalverification_step: false
    }))
  };

  useEffect(() => {
    if (isEdit) {
      setFileName(POIForm.pan_image);
      setValue("pan_image", POIForm.pan_image);
      setValue("pan_no", POIForm.pan_no);
      setValue("name", POIForm.name);
      setValue("dob", POIForm.dob);
      setValue("gender", POIForm.gender);
      setValue("fathers_name", POIForm.fathers_name);
      setValue("father_title", POIForm.father_title);
      setValue("father_relation", POIForm.father_relation);
      setValue("mothers_name", POIForm.mothers_name);
      setValue("marital_status", POIForm.marital_status);
      setValue("reg_mobile", POIForm.reg_mobile);
      setValue("mobile_relation", POIForm.mobile_relation);
      setValue("reg_email", POIForm.reg_email);
      setValue("email_relation", POIForm.email_relation);
      setValue("guardian_pan_no", POIForm.guardian_pan_no);
      setValue("guardian_name", POIForm.guardian_name);
      setValue("guardian_dob", POIForm.guardian_dob);
      setValue("relationship_primary", POIForm.relationship_primary);
      setValue("relationship_proof", POIForm.relationship_proof);
      setValue("guardian_mobile", POIForm.guardian_mobile);
      setValue("guardian_mobile_relation", POIForm.guardian_mobile_relation);
      setValue("guardian_email", POIForm.guardian_email);
      setValue("guardian_email_relation", POIForm.guardian_email_relation);
      setValue("relationship_proof_document", POIForm.relationship_proof_document || "");
      setRelationshipProofFileName(POIForm.relationship_proof_document || "");
    }
  }, [isEdit]);

  const handleUploadRelationshipProofDocument = (e: any) => {
    try {
      let file = e?.target?.files[0];
      if (file) {
        if (
          file.name.includes("jpg") ||
          file.name.includes("jpeg") ||
          file.name.includes("png") ||
          file.name.includes("pdf")
        ) {
          setValue("relationship_proof_document", file, { shouldValidate: true });
          setRelationshipProofFileName(file.name);
          onUploadRelationshipProofDocument(file);
        } else {
          return toastAlert(
            "error",
            "Unsupported file type. Please upload a jpg, jpeg, png or pdf file."
          );
        }
      } else {
        toastAlert("error", "Please select a valid image or PDF file");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const onUploadRelationshipProofDocument = async (file: any) => {
    try {
      setRelationshipProofUploadLoader(true);

      let formData = new FormData();
      let passObj: any = {
        investor_id: userData?.InvestorRegistration?.id,
      };

      formData.append("formData", JSON.stringify(passObj));
      formData.append("relationship_proof_document", file);

      const res: any = await api.post(`/kyc/uploadRelationshipProof`, formData);

      if (res.data.data) {
        const { data } = res.data;
        console.log("Relationship proof document uploaded successfully", data);
        setValue("relationship_proof_document", data.relationship_proof_document);
        setRelationshipProofFileName(data.relationship_proof_document);
        setRelationshipProofUploadLoader(false);
        toastAlert("success", "Relationship proof document uploaded successfully");
      }
    } catch (error) {
      setRelationshipProofUploadLoader(false);
      handleServerError(error);
    }
  };

  const onSubmitPersonalDetail = async (values: any) => {
    try {
      setPersonalDetailLoader(true);

      let poiPOABody: any = {
        investor_id: userData?.InvestorRegistration?.id,
        name: values?.name,
        pan_no: values?.pan_no,
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
        kycStatus: userData?.InvestorRegistration?.isKYCDone,
        poiConsent: userData?.InvestorRegistration?.poiConsent,
        user_id: userData?.InvestorRegistration?.user_id,
        dob: values?.dob,
        fathers_name: values?.fathers_name,
        father_title: values?.father_title,
        father_relation: values?.father_relation,
        gender: values?.gender,
        marital_status: values?.marital_status,
        member_type: isMember ? MEMBER_TYPE?.MEMBER : MEMBER_TYPE?.OWNER,
        mothers_name: values?.mothers_name,
        taxStatus: taxStatus,
        last_kyc_step: KYC_STEPS?.POI,
        tax_status: values?.tax_status,
        reg_mobile: values?.reg_mobile,
        mobile_relation: values?.mobile_relation,
        reg_email: values?.reg_email,
        email_relation: values?.email_relation,
        guardian_pan_no: values?.guardian_pan_no,
        guardian_name: values?.guardian_name,
        guardian_dob: values?.guardian_dob || null,
        relationship_primary: values?.relationship_primary,
        relationship_proof: values?.relationship_proof,
        guardian_mobile: values?.guardian_mobile,
        guardian_mobile_relation: values?.guardian_mobile_relation,
        guardian_email: values?.guardian_email,
        guardian_email_relation: values?.guardian_email_relation,
        relationship_proof_document: values?.relationship_proof_document,
        request_type: "updatePOI",
      };

      let formData = new FormData();
      formData.append("formData", JSON.stringify(poiPOABody));

      let res: any = await api.post(`/kyc/updatePersonalDetail`, formData);

      if (res.data.data) {
        setPersonalDetailLoader(false);
        toastAlert("success", res.data.msg);
        reset();
        setPOIForm({
          ...POIForm,
          ...poiPOABody,
          pan_image: res.data.data.pan_doc,
        });
        userData.InvestorRegistration = res?.data?.data;
        if (isMember) {
          setLS(MEMBER_DATA, userData);
        } else {
          setLS(USER_DATA, userData);
        }
        setSteps((prev: any) => ({
          ...prev,
          pan_step: false,
          address_step: true,
          bank_step: false,
          fatca_step: false,
          nominee_step: false,
          personalverification_step: false
        }))
        setIsEdit(false);
      }
    } catch (error) {
      setPersonalDetailLoader(false);
      handleServerError(error);
    }
  };

  const startTimer = () => {
    clearInterval(intervalId);
    const newIntervalId = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(newIntervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(newIntervalId);
  };

  const handleKycDetails = async () => {
    try {
      if (watch("emailFlag")) {
        if (verifyKYC?.Email === watch("reg_email")) {
          return toastAlert("error", "Email already exist");
        }
      }

      if (watch("mobileFlag")) {
        if (verifyKYC?.Mobile === watch("reg_mobile")) {
          return toastAlert("error", "Mobile no. already exist");
        }
      }

      // Email validation using regex
      if (watch("emailFlag")) {
        const emailValue = watch("reg_email");
        if (!EMAIL_REGEX.test(emailValue)) {
          return toastAlert("error", "Please enter a valid email address");
        }
      }

      // Mobile validation using regex
      if (watch("mobileFlag")) {
        const mobileValue = watch("reg_mobile");
        if (!MOBILE_REGEX.test(mobileValue)) {
          return toastAlert("error", "Please enter a valid mobile number");
        }
      }

      setMobileOTP(null)
      setEmailOTP(null)
      let payload: any = {
        email: verifyKYC?.Email,
        mobile: verifyKYC?.Mobile,
        emailFlag: watch("emailFlag"),
        mobileFlag: watch("mobileFlag"),
        reg_email: watch("reg_email"),
        reg_mobile: watch("reg_mobile"),
      };

      const res: any = await api.post(`/kyc/kyc-otp-generate`, payload);

      if (res.data.data) {
        toastAlert("success", res?.data?.msg);
        setOtpData(res?.data?.data);
        setTimer(60);
        startTimer()

        if (watch("emailFlag")) {
          setEmailVerify(true);
          openModal();
        }
        if (watch("mobileFlag")) {
          setMobileVerify(true);
          openModal();
        }
      }
    } catch (error) {
      console.log(error, 'errorerror');
      handleServerError(error);
    }
  };

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const onhandleOtpSubmit = async () => {
    try {
      setOtpVerifyLoader(true);
      if (emailVerify) {
        if (!emailOTP || emailOTP.length !== 6) {
          setOtpVerifyLoader(false);
          return toastAlert("error", "Invalid email otp");
        }
      } else if (mobileVerify) {
        if (!mobileOTP || mobileOTP.length !== 6) {
          setOtpVerifyLoader(false);
          return toastAlert("error", "Invalid mobile otp");
        }
      }

      let payload = {
        investor_id: userData?.id,
        email: verifyKYC?.Email,
        mobile: verifyKYC?.Mobile,
        emailFlag: watch("emailFlag"),
        mobileFlag: watch("mobileFlag"),
        reg_email: watch("reg_email"),
        reg_mobile: watch("reg_mobile"),
        emailOTP: emailOTP,
        mobileOTP: mobileOTP,
      };

      let res: any = await api.post(`/kyc/kyc-otp-verify`, payload);

      if (res.data.data) {
        setOtpVerifyLoader(false);
        toastAlert("success", res.data.msg);
        setMobileVerify(false);
        setEmailVerify(false);
        setValue("emailFlag", false);
        setValue("mobileFlag", false);
        setVerifyKYC({
          ...verifyKYC,
          Email: watch("reg_email"),
          Mobile: watch("reg_mobile"),
        });
        closeModal();
      }
    } catch (error: any) {
      setOtpVerifyLoader(false);
      handleServerError(error);
    }
  };

  return (
    <>
      <FullPageLoader
        isVisible={panUploadLoader}
        message="Processing PAN Card..."
      />
      <FullPageLoader
        isVisible={relationshipProofUploadLoader}
        message="Uploading Relationship Proof Document..."
      />
      {steps.pan_step ? (
        <>
          <form onSubmit={handleSubmit(onSubmitPersonalDetail)}>
            <div className="p-4 px-6">
              <div>
                <CustomText className="text-lg font-montserrat font-semibold">
                  Personal Info
                </CustomText>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 gap-y-2 mt-4">
                <div>
                  <CustomReactSelect
                    label="Tax Status"
                    items={listings.tax_status}
                    required
                    disabled={false}
                    bindValue="id"
                    bindName="status"
                    value={watch("tax_status")}
                    {...register("tax_status")}
                    onChange={(e: any) => {
                      setValue("tax_status", e.id, {
                        shouldValidate: true,
                      });
                      setTaxStatus(e.status);
                    }}
                    error={errors.tax_status?.message}
                  />
                </div>
                {taxStatus !== "Minor" && (
                  <div>
                    <CustomInput
                      label="PAN"
                      placeholder="PAN"
                      required
                      readOnly={!!extractPANFromResponse()}
                      {...register("pan_no")}
                      error={errors.pan_no?.message}
                      value={watch("pan_no")}
                    />
                  </div>
                )}
                <div className="">
                  <CustomInput
                    label={taxStatus == "Minor" ? "Name" : "Name"}
                    placeholder="Enter Name"
                    required
                    {...register("name")}
                    error={errors.name?.message}
                    disabled={false}
                    value={watch("name")}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Date Of Birth"
                    type="date"
                    required
                    {...register("dob")}
                    error={errors.dob?.message}
                    disabled={false}
                    value={watch("dob")}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    items={listings.gender}
                    label="Gender"
                    placeholder="Select Gender"
                    bindValue="id"
                    required
                    bindName="gender"
                    value={watch("gender")}
                    {...register("gender")}
                    onChange={(e: any) => {
                      setValue("gender", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.gender?.message}
                  />
                </div>
                {/* Father's Title and Name Row */}
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-4">
                    <CustomReactSelect
                      items={[
                        { id: "Mr.", title: "Mr." },
                        { id: "Mrs.", title: "Mrs." }
                      ]}
                      label="Title"
                      placeholder="Select"
                      bindValue="id"
                      bindName="title"
                      required
                      value={watch("father_title")}
                      onChange={(e: any) => {
                        setValue("father_title", e.id, {
                          shouldValidate: true,
                        });
                      }}
                      error={errors.father_title?.message}
                    />
                  </div>
                  <div className="col-span-8">
                    <CustomInput
                      label="Father/Spouse Name"
                      placeholder="Father/Spouse Name"
                      required
                      {...register("fathers_name")}
                      error={errors.fathers_name?.message}
                      value={watch("fathers_name")}
                    />
                  </div>
                </div>
                <div>
                  <CustomReactSelect
                    items={[
                      { id: "FATHER", relation: "FATHER" },
                      { id: "SPOUSE", relation: "SPOUSE" }
                    ]}
                    label="Relation"
                    placeholder="Select Relation"
                    bindValue="id"
                    bindName="relation"
                    required
                    value={watch("father_relation")}
                    onChange={(e: any) => {
                      setValue("father_relation", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.father_relation?.message}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Mother's Name"
                    placeholder="Mother's Name"
                    required
                    {...register("mothers_name")}
                    error={errors.mothers_name?.message}
                    value={watch("mothers_name")}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    items={listings.marital_status}
                    label="Marital Status"
                    placeholder="Select"
                    bindValue="id"
                    required
                    bindName="status"
                    value={watch("marital_status")}
                    {...register("marital_status")}
                    onChange={(e: any) => {
                      setValue("marital_status", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.marital_status?.message}
                  />
                </div>
                {/* Mobile Field - Always non-editable when verified mobile exists */}
                <div className="flex gap-1">
                  <CustomInput
                    label="Mobile"
                    type="tel"
                    placeholder="Enter Mobile"
                    {...register("reg_mobile")}
                    onChange={(e: any) => {
                      setValue("reg_mobile", e?.target?.value, {
                        shouldValidate: true,
                      });
                    }}
                    required
                    error={errors.reg_mobile?.message}
                    disabled={!!verifiedMobileNumber} // Make mobile field non-editable when verified mobile exists
                    className="flex-1"
                    value={watch("reg_mobile")}
                  />
                  {/* Show verification badge when mobile is from verification */}
                  {verifiedMobileNumber && (
                    <div className="mt-8 flex items-center">
                      <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <CustomReactSelect
                    items={listings.mobile_relation}
                    label="Mobile Relation"
                    placeholder="Select"
                    bindValue="id"
                    bindName="relation"
                    required
                    value={watch("mobile_relation")}
                    {...register("mobile_relation")}
                    onChange={(e: any) => {
                      setValue("mobile_relation", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.mobile_relation?.message}
                  />
                </div>

          
                {/* Email Field - Always editable */}
                <div className="flex gap-1 items-start">
                  <div className="flex-1">
                    <CustomInput
                      label="Email"
                      type="email"
                      placeholder="Enter Email"
                      {...register("reg_email")}
                      onChange={(e: any) => {
                        setValue("reg_email", e?.target?.value, {
                          shouldValidate: true,
                        });
                      }}
                      required
                      error={errors.reg_email?.message}
                      disabled={!watch("emailFlag")}
                      value={watch("reg_email")}
                    />
                  </div>

                  {/* Button container with proper alignment */}
                  <div className="flex-shrink-0 mt-8">
                    {verifiedEmail && !watch("emailFlag") ? (
                      <CustomButton
                        className="px-2"
                        onClick={() => {
                          setValue("emailFlag", true);
                        }}
                      >
                        <MdEdit size={20} />
                      </CustomButton>
                    ) : (
                      !watch("mobileFlag") && (
                        !watch("emailFlag") ? (
                          <CustomButton
                            className="px-2"
                            onClick={() => {
                              setValue("emailFlag", true);
                            }}
                          >
                            <MdEdit size={20} />
                          </CustomButton>
                        ) : (
                          <div className="flex gap-1">
                            <CustomButton
                              className="px-2"
                              type="button"
                              onClick={() => { handleKycDetails() }}
                            >
                              Validate
                            </CustomButton>
                            <CustomButton
                              className="px-2"
                              onClick={() => {
                                setValue("emailFlag", false);
                                setValue("reg_email", verifyKYC?.Email);
                              }}
                            >
                              <RxCross1 size={20} />
                            </CustomButton>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
                <div>
                  <CustomReactSelect
                    items={listings.mobile_relation}
                    label="Email Relation"
                    placeholder="Select"
                    bindValue="id"
                    bindName="relation"
                    required
                    {...register("email_relation")}
                    value={watch("email_relation")}
                    onChange={(e: any) => {
                      setValue("email_relation", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.email_relation?.message}
                  />
                </div>

                {taxStatus === "Minor" ? (
                  <>
                    {/* Guardian fields remain the same... */}
                    <div>
                      <CustomInput
                        label="Guardian PAN"
                        placeholder="Guardian PAN"
                        required
                        {...register("guardian_pan_no")}
                        error={errors.guardian_pan_no?.message}
                        value={watch("guardian_pan_no")}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Guardian Name"
                        placeholder="Guardian Name"
                        required
                        {...register("guardian_name")}
                        error={errors.guardian_name?.message}
                        value={watch("guardian_name")}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Guardian Date of Birth"
                        placeholder="Guardian Date of Birth"
                        type="date"
                        required
                        {...register("guardian_dob")}
                        error={errors.guardian_dob?.message}
                        value={watch("guardian_dob")}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={listings.relationship_primaryHolder}
                        label="Relationship to Primary Holder"
                        placeholder="Select"
                        bindValue="id"
                        bindName="relationship"
                        required
                        {...register("relationship_primary")}
                        value={watch("relationship_primary")}
                        onChange={(e: any) => {
                          setValue("relationship_primary", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.relationship_primary?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={listings.relationship_proof}
                        label="Relationship Proof"
                        placeholder="Select"
                        bindValue="id"
                        bindName="type"
                        required
                        {...register("relationship_proof")}
                        value={watch("relationship_proof")}
                        onChange={(e: any) => {
                          setValue("relationship_proof", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.relationship_proof?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Upload Relationship Proof Document"
                        required
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, application/pdf"
                        onChange={(e: any) => {
                          handleUploadRelationshipProofDocument(e);
                        }}
                        error={errors.relationship_proof_document?.message}
                      />
                      {relationshipProofFileName && (
                        <div className="flex justify-end">
                          <div className="text-secondary-content">
                            <Link
                              href={`${NODE_API_URL}/static/RelationshipProofImage/${relationshipProofFileName}`}
                              target="_blank"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <CustomInput
                        label="Guardian Mobile"
                        placeholder="Guardian Mobile"
                        required
                        {...register("guardian_mobile")}
                        error={errors.guardian_mobile?.message}
                        value={watch("guardian_mobile")}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={listings.mobile_relation}
                        label="Guardian Mobile Relation"
                        placeholder="Select"
                        bindValue="id"
                        bindName="relation"
                        required
                        {...register("guardian_mobile_relation")}
                        value={watch("guardian_mobile_relation")}
                        onChange={(e: any) => {
                          setValue("guardian_mobile_relation", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.guardian_mobile_relation?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Guardian Email ID"
                        placeholder="Guardian Email ID"
                        required
                        {...register("guardian_email")}
                        error={errors.guardian_email?.message}
                        value={watch("guardian_email")}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={listings.mobile_relation}
                        label="Guardian Email Relation"
                        placeholder="Select"
                        bindValue="id"
                        bindName="relation"
                        required
                        {...register("guardian_email_relation")}
                        value={watch("guardian_email_relation")}
                        onChange={(e: any) => {
                          setValue("guardian_email_relation", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.guardian_email_relation?.message}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="border-b border-border"></div>
            <div className="p-4 flex justify-between">
              <div></div>
              <div>
                <CustomButton
                  className="w-32"
                  type="submit"
                  loading={personalDetailLoader}
                >
                  Next
                </CustomButton>
              </div>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="p-4 px-6 pb-6">
            <div className="flex flex-row justify-between sm:justify-start mt-3 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="lg:w-52">
                  <CustomText>Personal Info</CustomText>
                </div>
                <div className="flex justify-between items-center w-full sm:w-56 gap-2">
                  <progress
                    className="progress progress-primary bg-progressBg w-56"
                    value="0"
                    max="100"
                  ></progress>
                  <div className="text-primary cursor-pointer">
                    <FaCircleCheck className="text-green-600" size={20} />
                  </div>
                </div>
              </div>
              <div className="cursor-pointer" onClick={handlePOIEditProcess}>
                <CustomText className="text-secondary-content">Edit</CustomText>
              </div>
            </div>
          </div>
          <div className="border-b border-border"></div>
          <AddressDetail
            steps={steps}
            setSteps={setSteps}
            handlePOIEditProcess={handlePOIEditProcess}
            ref={addressRef}
          />
        </>
      )}
      <dialog id="my_modal" className="modal" ref={modalRef}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onhandleOtpSubmit();
              }}
            >
              <div className="mb-1">
                {emailVerify ? (
                  <div>
                    <div className="text-center">Email address</div>
                    <div className="my-5 flex justify-center">
                      <OtpInput
                        value={emailOTP}
                        onChange={(otp: any) => setEmailOTP(otp)}
                        numInputs={6}
                        renderSeparator={<span className="otpInputGap"></span>}
                        renderInput={(props) => (
                          <input {...props} className="otpInput" />
                        )}
                        inputType={"text"}
                        shouldAutoFocus={true}
                      />
                    </div>
                  </div>
                ) : null}

                {mobileVerify ? (
                  <div>
                    <div className="text-center">Mobile Number</div>
                    <div className="my-5 flex justify-center">
                      <OtpInput
                        value={mobileOTP}
                        onChange={(otp: any) => setMobileOTP(otp)}
                        numInputs={6}
                        renderSeparator={<span className="otpInputGap"></span>}
                        renderInput={(props) => (
                          <input {...props} className="otpInput" />
                        )}
                        inputType={"text"}
                        shouldAutoFocus={true}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {/*<div className="mt-4 flex justify-center">
                {emailVerify
                  ? `Email OTP - ${otpData?.kyc_email_otp ? otpData?.kyc_email_otp : "-"
                  }`
                  : null}{" "}
                {mobileVerify
                  ? `Mobile OTP - ${otpData?.kyc_mobile_otp ? otpData?.kyc_mobile_otp : "-"
                  }`
                  : null}
              </div>*/}

              <div onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-center">
                  <div>
                    <CustomButton
                      className="mt-6 w-full bg-primary"
                      type="submit"
                      loading={otpVerifyLoader}
                    >
                      Submit
                    </CustomButton>
                  </div>
                  <div>
                    <CustomButton
                      className="mt-6 w-full bg-primary"
                      type="button"
                      loading={otpVerifyLoader}
                      onClick={closeModal}
                    >
                      Cancel
                    </CustomButton>
                  </div>
                </div>
              </div>
              <div className="text-red-600 text-center mt-4 cursor-pointer">
                Time Remaining: {formatTime(timer)}s
              </div>
              {timer === 0 && (
                <div
                  className="text-other text-center mt-4 cursor-pointer"
                  onClick={() => { handleKycDetails() }}
                >
                  Resend OTP
                </div>
              )}
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default POI;