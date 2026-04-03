"use client";

import CustomButton from "@/commonUI/Button";
import FullPageLoader from "@/commonUI/FullPageLoader";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { ADD_MEMBER, MEMBER_DATA, MOBILE_VERIFICATION_RESPONSE, NODE_API_URL, USER_DATA } from "@/utils/constants";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCircleCheck } from "react-icons/fa6";
import OTPInput from "react-otp-input";
import * as yup from "yup";
import FATCADetail from "./FATCADetail";

function AddressDetail({ handlePOIEditProcess, setSteps, steps }: any) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [aadhaarOTP, setAadhaarOTP] = useState<any>();
  const [otpVerifyLoader, setOtpVerifyLoader] = useState<any>(false);
  const [POAConsent, setPOAConsent] = useState<any>(false);

  const [countryList, setCountryList] = useState<any>([]);
  const [stateList, setStateList] = useState<any>([]);
  const [addressTypeList, setAddressTypeList] = useState<any>([]);
  const [frontfileName, setFrontFileName] = useState<any>("");
  const [backfileName, setBackFileName] = useState<any>("");
  const [corrFrontfileName, setCorrFrontFileName] = useState<any>("");
  const [corrBackfileName, setCorrBackFileName] = useState<any>("");
  const [addressDetailLoader, setAddressDetailLoader] = useState<any>(false);
  const [addressUploadLoader, setAddressUploadLoader] = useState<any>(false);
  const [aadhaarOtpResponse, setAadhaarOtpResponse] = useState<any>({});
  const [extractedState, setExtractedState] = useState<string>("");

  const [sameAsPermAddress, setSameAsPermAddress] = useState<boolean>(true);
  const [corrStateList, setCorrStateList] = useState<any>([]);
  const [userData, setUserData] = useState<any>("");
  const [singzyData, setSingzyData] = useState<any>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);

  const createValidationSchema = (isKYCDone: boolean, sameAsPermAddress: boolean) => {
    return yup.object().shape({
      address_front_doc: (isKYCDone || POAConsent)
        ? yup.string().trim().nullable()
        : yup.string().trim().required("Front side image is required"),
      address_back_doc: (isKYCDone || POAConsent)
        ? yup.string().trim().nullable()
        : yup.string().trim().required("Back side image is required"),
      doc_no: yup.string().required("POA number is required").matches(/^[0-9]{12}$/, "POA number must be 12 digits"),
      address1: yup.string().required("Address1 is required"),
      address_type: yup.string().required("Address Type is required"),
      pincode: yup.string().required("Pincode is required").matches(/^[0-9]{6}$/, "PIN code must be 6 digits"),
      district: yup.string().required("District is required"),
      city: yup.string().required("City is required"),
      state_id: yup.string().required("State is required"),
      country_id: yup.string().required("Country is required"),

      // Correspondence address fields
      corr_aadhaar_front_doc: (sameAsPermAddress || isKYCDone)
        ? yup.string().nullable()
        : yup.string().required("Aadhaar front side image is required"),
      corr_aadhaar_back_doc: (sameAsPermAddress || isKYCDone)
        ? yup.string().nullable()
        : yup.string().required("Aadhaar back side image is required"),
      corr_doc_no: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence POA Number is required").matches(/^[0-9]{6}$/, "PIN code must be 6 digits"),

      same_as_permanent: yup.boolean(),
      corr_address1: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence Address1 is required"),
      corr_address_type: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence Address Type is required"),
      corr_pincode: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence Pincode is required").matches(/^[0-9]{6}$/, "PIN code must be 6 digits"),
      corr_district: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence District is required"),
      corr_city: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence City is required"),
      corr_state_id: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence State is required"),
      corr_country_id: sameAsPermAddress
        ? yup.string().nullable()
        : yup.string().required("Correspondence Country is required"),
    })
  };

  const validationSchema = createValidationSchema(userData?.InvestorRegistration?.isKYCDone, sameAsPermAddress);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      address_front_doc: "",
      address_back_doc: "",
      doc_no: "",
      address1: "",
      address2: "",
      address_type: "",
      district: "",
      pincode: "",
      city: "",
      state_id: "",
      country_id: "",
      corr_aadhaar_front_doc: "",
      corr_aadhaar_back_doc: "",
      same_as_permanent: true,
      corr_address1: "",
      corr_address2: "",
      corr_address_type: "",
      corr_district: "",
      corr_pincode: "",
      corr_city: "",
      corr_state_id: "",
      corr_country_id: "",
    },
  });

  // Improved state extraction function
  const extractStateFromMobileVerification = () => {
    try {
      const mobileVerificationData = getLS(MOBILE_VERIFICATION_RESPONSE);
      console.log("🔍 Mobile verification data:", mobileVerificationData);
      
      if (!mobileVerificationData || !Array.isArray(mobileVerificationData)) {
        console.log("❌ No mobile verification data found");
        return null;
      }

      // Try different possible locations for the state data
      let foundState = null;

      // Method 1: Look for financial_service_data_pull
      const financialDataItem = mobileVerificationData.find(item =>
        item.source === "financial_service_data_pull"
      );

      if (financialDataItem?.response?.data) {
        const financialData = financialDataItem.response.data;
        console.log("📊 Financial data:", financialData);
        
        // Check addressInfo array
        if (financialData.addressInfo && Array.isArray(financialData.addressInfo) && financialData.addressInfo.length > 0) {
          foundState = financialData.addressInfo[0].state;
          console.log("📍 State from addressInfo:", foundState);
        }
        
        // Check personalInfo (fallback)
        if (!foundState && financialData.personalInfo) {
          foundState = financialData.personalInfo.state;
          console.log("📍 State from personalInfo:", foundState);
        }
      }

      // Method 2: Look for mobile_to_account as fallback
      if (!foundState) {
        const accountDataItem = mobileVerificationData.find(item =>
          item.source === "mobile_to_account"
        );

        if (accountDataItem?.response?.data) {
          const accountData = accountDataItem.response.data;
          console.log("🏦 Account data:", accountData);
          
          if (accountData.branchDetails?.state) {
            foundState = accountData.branchDetails.state;
            console.log("📍 State from branchDetails:", foundState);
          }
        }
      }

      // Method 3: Check all items for any state data
      if (!foundState) {
        for (const item of mobileVerificationData) {
          if (item.response?.data) {
            const data = item.response.data;
            
            // Check various possible locations
            if (data.addressInfo?.[0]?.state) {
              foundState = data.addressInfo[0].state;
              break;
            }
            if (data.personalInfo?.state) {
              foundState = data.personalInfo.state;
              break;
            }
            if (data.branchDetails?.state) {
              foundState = data.branchDetails.state;
              break;
            }
            if (data.state) {
              foundState = data.state;
              break;
            }
          }
        }
      }

      console.log("🎯 Final extracted state:", foundState);
      return foundState;
    } catch (error) {
      console.error("❌ Error extracting state:", error);
      return null;
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

  const fetchData = async (id: any) => {
    try {
      const res = await api.get(`/kyc/get-address-info/${id}`);
      if (res.data.data) {
        let dataValue = res.data.data;
        setValue("doc_no", dataValue.doc_no);
        setValue("address1", dataValue.address1);
        setValue("address2", dataValue.address2);
        setValue("address_type", dataValue.address_type);
        setValue("district", dataValue.district);
        setValue("pincode", dataValue.pincode);
        setValue("city", dataValue.city);
        setValue("country_id", dataValue.country_id);
        setValue("address_front_doc", dataValue.address_front_doc);
        setValue("address_back_doc", dataValue.address_back_doc);
        setPOAConsent(dataValue.poaConsent);
        
        let value = {
          id: dataValue.country_id
        }
        if (dataValue.country_id) {
          getStateList(value)
        }
        setValue("state_id", dataValue.state_id);
        setBackFileName(dataValue.address_back_doc || "");
        setFrontFileName(dataValue.address_front_doc || "");
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    let getUser: any = getLS(USER_DATA);
    let isMember = getLS(ADD_MEMBER);
    let memberData = getLS(MEMBER_DATA);

    if (memberData) {
      setIsMember(isMember);
      setUserData(memberData);
    } else {
      setUserData(getUser);
    }

    if (getUser) {
      let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name;
      let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id;

      if (signzy_user_name) {
        investorLogin({ signzy_user_name, signzy_kyc_id });
      }

      fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);
    }

    getCountry();
    getAddressTypeList();
  }, []);

  // Separate useEffect for state extraction after country and state lists are loaded
// Add proper dependencies and prevent unnecessary executions
useEffect(() => {
  if (countryList.length > 0 && stateList.length === 0) { // Only run if states aren't loaded
    console.log("🚀 Country list loaded, extracting state...");
    
    const extractedState = extractStateFromMobileVerification();
    if (extractedState) {
      setExtractedState(extractedState);
      console.log("🎯 Setting state to form:", extractedState);
      
      // Use the improved setcountryState function
      setcountryState("India", extractedState);
    } else {
      console.log("❌ No state found in mobile verification data");
      // Load default states for India if no state found
      const india = countryList.find((c: any) => c.name.toLowerCase() === "india");
      if (india) {
        getStateList({ id: india.id });
      }
    }
  }
}, [countryList, stateList.length]); // Added stateList.length as dependency

const getCountry = async () => {
  try {
    let country = await api.get(`/country/getAllCountry`);

    if (country?.data?.data) {
      setCountryList(country?.data?.data);
      const india = country?.data?.data.find(
        (c: any) => c.name.toLowerCase() === "india"
      );
      if (india) {
        setValue("country_id", india.id); 
        
        // Don't call getStateList here - let the useEffect handle it
        // This prevents duplicate calls
      }
    }
  } catch (error) {
    handleServerError(error);
  }
};

const getStateList = useCallback(async (e: any) => {
  if (isLoadingStates) return []; // Prevent multiple simultaneous calls
  
  try {
    setIsLoadingStates(true);
    let state = await api.get(`/state/getAllStateByCountry/${e?.id}`);
    if (state?.data?.data) {
      setStateList(state?.data?.data);
      return state?.data?.data;
    }
    return [];
  } catch (error) {
    handleServerError(error);
    return [];
  } finally {
    setIsLoadingStates(false);
  }
}, [isLoadingStates]);

  const getAddressTypeList = async () => {
    try {
      let address = await api.get(`/addressType/getAllAddressType`);
      if (address?.data?.data) {
        setAddressTypeList(address?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleThreeStepKYC = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: false,
      fatca_step: true,
      bank_step: false,
      nominee_step: false,
      personalverification_step: false
    }))
  };

  // Improved setcountryState function with better matching
  const setcountryState = async (countryName: string, stateName: string, isCorrespondence: boolean = false) => {
    console.log(`🔄 Setting country: ${countryName}, state: ${stateName}, isCorrespondence: ${isCorrespondence}`);
    
    if (!countryName || !stateName) {
      console.log("❌ Missing country or state name");
      return;
    }

    let selectedCountry = countryList.filter((country: any) => {
      return country.name.toLowerCase() === countryName.toLowerCase();
    });

    console.log("🌍 Selected country:", selectedCountry);

    if (selectedCountry.length > 0) {
      if (isCorrespondence) {
        setValue("corr_country_id", selectedCountry[0].id);
      } else {
        setValue("country_id", selectedCountry[0].id);
      }
      
      let statelist = [];
      if (isCorrespondence) {
        statelist = await loadCorrStates(selectedCountry[0].id);
      } else {
        statelist = await getStateList({ id: selectedCountry[0].id });
      }

      console.log("📋 Available states:", statelist);

      if (statelist?.length > 0) {
        // Try exact match first
        let selectedState = statelist.filter((state: any) => {
          return state.name.toLowerCase() === stateName.toLowerCase();
        });

        // If exact match not found, try partial match
        if (selectedState.length === 0) {
          console.log("🔍 No exact match, trying partial match...");
          selectedState = statelist.filter((state: any) => {
            const stateNameLower = stateName.toLowerCase();
            const availableStateLower = state.name.toLowerCase();
            
            return availableStateLower.includes(stateNameLower) || 
                   stateNameLower.includes(availableStateLower) ||
                   availableStateLower.replace(/\s/g, '') === stateNameLower.replace(/\s/g, '');
          });
        }

        console.log("✅ Selected state:", selectedState);

        if (selectedState.length > 0) {
          if (isCorrespondence) {
            setValue("corr_state_id", selectedState[0].id);
            console.log("📝 Set correspondence state to:", selectedState[0].name);
          } else {
            setValue("state_id", selectedState[0].id);
            console.log("📝 Set permanent state to:", selectedState[0].name);
          }
        } else {
          console.log("❌ No matching state found for:", stateName);
          console.log("📋 Available state names:", statelist.map((s: any) => s.name));
        }
      } else {
        console.log("❌ No states available for country:", countryName);
      }
    } else {
      console.log("❌ Country not found:", countryName);
    }
  };

  // Handle Aadhaar front image upload
  const handleUploadAadhaarFrontImage = (e: any) => {
    try {
      let file = e?.target?.files[0];
      if (file && (file.type.includes("image") || file.name.includes("pdf"))) {
        setValue("corr_aadhaar_front_doc", file, { shouldValidate: true });
        if (watch("corr_aadhaar_back_doc")) {
          if (typeof watch("corr_aadhaar_back_doc") == 'string') {
            setValue("corr_aadhaar_back_doc", null);
            return toastAlert("success", "Please Upload Back Side Aadhaar");
          }
          onScanAadhaarCard();
        } else {
          toastAlert("success", "Please Upload Back Side Aadhaar");
        }
      } else {
        toastAlert("error", "Please select a valid image or PDF file");
      }
    } catch (error) {
      console.error("Error uploading Aadhaar front image:", error);
    }
  };

  // Handle Aadhaar back image upload
  const handleUploadAadhaarBackImage = (e: any) => {
    try {
      let file = e?.target?.files[0];
      if (file && (file.type.includes("image") || file.name.includes("pdf"))) {
        setValue("corr_aadhaar_back_doc", file, { shouldValidate: true });
        if (watch("corr_aadhaar_front_doc")) {
          if (typeof watch("corr_aadhaar_front_doc") == 'string') {
            setValue("corr_aadhaar_front_doc", null);
            return toastAlert("success", "Please Upload Front Side Aadhaar");
          }
          onScanAadhaarCard();
        } else {
          toastAlert("success", "Please Upload Front Side Aadhaar");
        }
      } else {
        toastAlert("error", "Please select a valid image or PDF file");
      }
    } catch (error) {
      console.error("Error uploading Aadhaar back image:", error);
    }
  };

  // Scan Aadhaar card when both images are uploaded
  const onScanAadhaarCard = async () => {
    try {
      setAddressUploadLoader(true);

      const formData = new FormData();

      let passObj: any = {
        investor_id: userData?.InvestorRegistration?.id,
        request_type: "updateSignZy",
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
      };
      formData.append("formData", JSON.stringify(passObj));
      formData.append("corr_aadhaar_front_doc", watch("corr_aadhaar_front_doc"));
      formData.append("corr_aadhaar_back_doc", watch("corr_aadhaar_back_doc"));

      const res = await api.post(`/kyc/scan-corr-aadhaar`, formData);

      if (res.data.data) {
        const { data } = res.data;
        if (data?.signzypayload?.country) {
          setcountryState(data?.signzypayload?.country, data?.signzypayload?.state, true);
        }

        setValue("corr_address1", data?.signzypayload?.address || "");
        setValue("corr_pincode", data?.signzypayload?.pincode || "");
        setValue("corr_city", data?.signzypayload?.city || "");
        setValue("corr_district", data?.signzypayload?.district || "");
        setValue("corr_doc_no", data?.signzypayload?.poa_number || "");
        setCorrFrontFileName(data?.poabody?.corr_aadhaar_front_doc || "");
        setCorrBackFileName(data?.poabody?.corr_aadhaar_back_doc || "");
        setValue("corr_aadhaar_front_doc", data?.poabody.corr_aadhaar_front_doc);
        setValue("corr_aadhaar_back_doc", data?.poabody.corr_aadhaar_back_doc);
      }

      setAddressUploadLoader(false);
    } catch (error) {
      setAddressUploadLoader(false);
      handleServerError(error);
    }
  };

  // Handle correspondence address checkbox
  const handleSameAsPermAddressChange = (checked: boolean) => {
    setSameAsPermAddress(checked);
    setValue("same_as_permanent", checked);

    if (checked) {
      setValue("corr_address1", watch("address1"));
      setValue("corr_address2", watch("address2"));
      setValue("corr_address_type", watch("address_type"));
      setValue("corr_district", watch("district"));
      setValue("corr_pincode", watch("pincode"));
      setValue("corr_city", watch("city"));
      setValue("corr_state_id", watch("state_id"));
      setValue("corr_country_id", watch("country_id"));
    } else {
      // Clear correspondence address fields
      setValue("corr_address1", "");
      setValue("corr_address2", "");
      setValue("corr_address_type", "");
      setValue("corr_district", "");
      setValue("corr_pincode", "");
      setValue("corr_city", "");
      setValue("corr_state_id", "");
      setValue("corr_country_id", "");
    }
  };

  // Load correspondence states based on country selection
  const loadCorrStates = async (countryId: string) => {
    try {
      const res: any = await api.get(`/state/getAllStateByCountry/${countryId}`);
      if (res.data.data) {
        setCorrStateList(res.data.data);
        return res?.data?.data
      }
      return []
    } catch (error) {
      console.error("Error loading correspondence states:", error);
    }
  };

  const handleEditProcess = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: true,
      fatca_step: false,
      bank_step: false,
      nominee_step: false,
      personalverification_step: false
    }))
  };

  const onSubmitAddressDetail = async (values: any) => {
    try {
      setAddressDetailLoader(true);

      // Prepare correspondence address data
      const correspondenceData = values.same_as_permanent ? {
        corr_doc_no: values.doc_no,
        corr_address1: values.address1,
        corr_address2: values.address2,
        corr_address_type: values.address_type,
        corr_district: values.district,
        corr_pincode: values.pincode,
        corr_city: values.city,
        corr_state_id: values.state_id,
        corr_country_id: values.country_id,
        corr_aadhaar_front_doc: values.address_front_doc,
        corr_aadhaar_back_doc: values.address_back_doc,
      } : {
        corr_doc_no: values.corr_doc_no,
        corr_address1: values.corr_address1,
        corr_address2: values.corr_address2,
        corr_address_type: values.corr_address_type,
        corr_district: values.corr_district,
        corr_pincode: values.corr_pincode,
        corr_city: values.corr_city,
        corr_state_id: values.corr_state_id,
        corr_country_id: values.corr_country_id,
        corr_aadhaar_front_doc: values.corr_aadhaar_front_doc,
        corr_aadhaar_back_doc: values.corr_aadhaar_back_doc,
      };

      let payload: any = {
        request_type: "updatePOA",
        investor_id: userData?.InvestorRegistration?.id,
        address_type: values.address_type || "",
        doc_holder_name: userData?.InvestorRegistration?.name,
        kycStatus: userData?.InvestorRegistration?.isKYCDone,
        POAConsent: POAConsent,
        doc_no: values.doc_no,
        address_front_doc: values.address_front_doc,
        address_back_doc: values.address_back_doc,
        address1: values.address1 || "",
        address2: values.address2 || "",
        district: values.district || "",
        pincode: values.pincode || "",
        city: values.city || "",
        state_id: values.state_id || "",
        country_id: values.country_id || "",
        same_as_permanent: values.same_as_permanent,
        ...correspondenceData,
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
        dob: userData.InvestorRegistration.dob
      };

      let data = JSON.stringify(payload);
      let updatedPoa = await api.post(`/kyc/updateAddressDetail`, data);

      if (updatedPoa) {
        setAddressDetailLoader(false);
        toastAlert("success", updatedPoa.data.msg);
        let invester = updatedPoa.data.data.investor_data;
        if (invester) {
          userData.InvestorRegistration = invester;
          if (isMember) {
            setLS(MEMBER_DATA, userData);
          } else {
            setLS(USER_DATA, userData);
          }
        }
        handleThreeStepKYC();
      }
    } catch (error) {
      setAddressDetailLoader(false);
      handleServerError(error);
    }
  };

  const onScanAddressProof = async () => {
    try {
      setAddressUploadLoader(true);

      let formData = new FormData();

      let passObj: any = {
        investor_id: userData?.InvestorRegistration?.id,
        request_type: "updateSignZy",
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
      };

      formData.append("formData", JSON.stringify(passObj));
      formData.append("address_front_doc", watch("address_front_doc"));
      formData.append("address_back_doc", watch("address_back_doc"));

      let res: any = await api.post(`/kyc/updateAddressDetail`, formData);

      if (res.data.data) {
        const { signzypayload, poabody } = res.data.data;
        if (Object.keys(signzypayload).length > 0) {
          setcountryState(signzypayload.country, signzypayload.state);

          setValue("address_front_doc", poabody.address_front_doc);
          setValue("address_back_doc", poabody.address_back_doc);
          setValue("doc_no", signzypayload.poa_number || "");
          setValue("address1", signzypayload.address || "");
          setValue("district", signzypayload.district || "");
          setValue("pincode", signzypayload.pincode || "");
          setValue("city", signzypayload.city);
          setBackFileName(poabody.address_back_doc || "");
          setFrontFileName(poabody.address_front_doc || "");
        }
        setAddressUploadLoader(false);
      }
    } catch (error) {
      setAddressUploadLoader(false);
      handleServerError(error);
    }
  };

  const handleUploadFrontImage = (e: any) => {
    try {
      let file = e?.target?.files[0];
      if (file && (file.type.includes("image") || file.name.includes("pdf"))) {
        setValue("address_front_doc", file, { shouldValidate: true });

        if (watch("address_back_doc")) {
          if (typeof watch("address_back_doc") == 'string') {
            setValue("address_back_doc", null);
            return toastAlert("success", "Please Upload Back Side Aadhaar");
          }
          onScanAddressProof();
        } else {
          toastAlert("success", "Please Upload Back Side Aadhaar");
        }
      } else {
        toastAlert("error", "Please select a valid image or PDF file");
      }
    } catch (error) {
      console.error("Error uploading Aadhaar front image:", error);
    }
  };

  const handleUploadBackImage = (e: any) => {
    try {
      let file = e?.target?.files[0];
      if (file && (file.type.includes("image") || file.name.includes("pdf"))) {
        setValue("address_back_doc", file, { shouldValidate: true });

        if (watch("address_front_doc")) {
          if (typeof watch("address_front_doc") == 'string') {
            setValue("address_front_doc", null);
            return toastAlert("success", "Please Upload Front Side Aadhaar");
          }
          onScanAddressProof();
        } else {
          toastAlert("success", "Please Upload Front Side Aadhaar");
        }
      } else {
        toastAlert("error", "Please select a valid image or PDF file");
      }
    } catch (error) {
      console.error("Error uploading Aadhaar back image:", error);
    }
  };

  const onChangeAadhaar = async (doc_no: any) => {
    try {
      setAddressUploadLoader(true);
      let payload: any = {
        aadhaar: doc_no,
        investor_id: userData?.InvestorRegistration?.id,
      }

      let data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);

      if (data) {
        setAadhaarOtpResponse(data.data.data)
        openModal()
        setAddressUploadLoader(false);
        toastAlert("success", data.data.msg);
      }
    } catch (error) {
      setAddressUploadLoader(false);
      handleServerError(error);
    }
  };

  const reSendOtp = async (doc_no: any) => {
    try {
      let payload: any = {
        aadhaar: watch('doc_no'),
        investor_id: userData?.InvestorRegistration?.id,
      }

      let data = await api.post(`/cashfree/initiate-aadhaar-verification`, payload);

      if (data) {
        setAadhaarOtpResponse(data.data.data)
        toastAlert("success", data.data.msg);
      }
    } catch (error) {
      setAddressUploadLoader(false);
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
    setOtpVerifyLoader(true)
    try {
      let payload: any = {
        otp: aadhaarOTP,
        investor_id: userData?.InvestorRegistration?.id,
        aadhaar: (!watch('same_as_permanent') && watch('corr_doc_no')) ? watch('corr_doc_no') : watch('doc_no'),
        ref_id: aadhaarOtpResponse?.ref_id
      }

      let data = await api.post(`/cashfree/aadhaar-otp-verification`, payload);

      if (data) {
        setOtpVerifyLoader(false)
        closeModal()
        setAadhaarOTP(null)

        let dataValue = data.data.data;
        if ((!watch('same_as_permanent') && watch('corr_doc_no'))) {
          setValue("corr_address1", dataValue?.address);
          setValue("corr_district", dataValue.split_address?.dist);
          setValue("corr_pincode", dataValue.split_address?.pincode);
          setValue("corr_city", dataValue.split_address?.po);
          setcountryState(dataValue.split_address?.country, dataValue.split_address?.state, true)
        } else {
          setValue("address1", dataValue?.address);
          setValue("district", dataValue.split_address?.dist);
          setValue("pincode", dataValue.split_address?.pincode);
          setValue("city", dataValue.split_address?.po);
          setcountryState(dataValue.split_address?.country, dataValue.split_address?.state)
        }
      }
    } catch (error) {
      setOtpVerifyLoader(false)
      closeModal()
      setAadhaarOTP(null)
      handleServerError(error);
    }
  }

  return (
    <>
      <FullPageLoader
        isVisible={addressUploadLoader}
        message="Processing Address Proof..."
      />
      
   

      {steps.address_step ? (
        <>
          <form onSubmit={handleSubmit(onSubmitAddressDetail)}>
            <div className="p-4 px-6 pb-6">
              <div className="mt-2">
                <CustomText className="text-xl font-montserrat font-semibold">
                  Address Detail
                </CustomText>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 gap-y-2 mt-4">
                {!userData?.InvestorRegistration?.isKYCDone && !POAConsent ? (
                  <>
                    <div>
                      <CustomInput
                        label="Upload Front Side (Aadhaar Card)"
                        required
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleUploadFrontImage}
                      />
                      {frontfileName && (
                        <div className="flex justify-end">
                          <div className="text-secondary-content">
                            <Link
                              href={`${NODE_API_URL}/static/addressDoc/${frontfileName}`}
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
                        label="Upload Back Side (Aadhaar Card)"
                        required
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleUploadBackImage}
                      />
                      {backfileName && (
                        <div className="flex justify-end">
                          <div className="text-secondary-content">
                            <Link
                              href={`${NODE_API_URL}/static/addressDoc/${backfileName}`}
                              target="_blank"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
                <div>
                  <CustomInput
                    label="POA Number (Aadhaar Number)"
                    placeholder="POA Number (Aadhaar Number)"
                    required
                    {...register("doc_no")}
                    onChange={(e: any) => {
                      if (userData.InvestorRegistration?.isKYCDone && e.target.value.length === 12) {
                        onChangeAadhaar(e.target.value)
                      }
                    }}
                    error={errors.doc_no?.message}
                  />
                </div>
                <div className="md:col-span-2">
                  <CustomInput
                    label="Address 1"
                    placeholder="Address 1"
                    required
                    {...register("address1")}
                    error={errors.address1?.message}
                  />
                </div>
                <div className="md:col-span-2">
                  <CustomInput
                    label="Address 2"
                    placeholder="Address 2"
                    {...register("address2")}
                    error={errors.address2?.message}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    label="Address Type"
                    items={addressTypeList}
                    required
                    placeholder="Select Type"
                    bindValue="id"
                    bindName="address_type"
                    value={watch("address_type")}
                    onChange={(e: any) => {
                      setValue("address_type", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.address_type?.message}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    label="Country"
                    items={countryList}
                    required
                    placeholder="Select Country"
                    bindValue="id"
                    bindName="name"
                    value={watch("country_id")}
                    onChange={(e: any) => {
                      getStateList(e);
                      setValue("country_id", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.country_id?.message}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    label="State"
                    items={stateList}
                    required
                    placeholder="Select State"
                    bindValue="id"
                    bindName="name"
                    value={watch("state_id")}
                    onChange={(e: any) => {
                      setValue("state_id", e.id, {
                        shouldValidate: true,
                      });
                    }}
                    error={errors.state_id?.message}
                  />
                </div>
                <div>
                  <CustomInput
                    label="City"
                    placeholder="City"
                    {...register("city")}
                    error={errors.city?.message}
                    required
                  />
                </div>
                <div>
                  <CustomInput
                    label="Pin Code"
                    placeholder="Pin Code"
                    {...register("pincode")}
                    error={errors.pincode?.message}
                    required
                  />
                </div>
                <div>
                  <CustomInput
                    label="District"
                    placeholder="District"
                    required
                    {...register("district")}
                    error={errors.district?.message}
                  />
                </div>
              </div>

              {/* Correspondence Address Section */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CustomText className="text-lg font-montserrat font-semibold">
                    Correspondence Address
                  </CustomText>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPermAddress}
                      onChange={(e) => handleSameAsPermAddressChange(e.target.checked)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-sm text-gray-600">Same as Permanent Address</span>
                  </label>
                </div>

                {!sameAsPermAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 gap-y-2">
                    {!userData?.InvestorRegistration?.isKYCDone ? (
                      <>
                        <div>
                          <CustomInput
                            label="Upload Aadhaar Front Side"
                            required
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleUploadAadhaarFrontImage}
                            error={errors.corr_aadhaar_front_doc?.message}
                          />
                          {corrFrontfileName && (
                            <div className="mt-2">
                              <div className="text-secondary-content">
                                <Link
                                  href={`${NODE_API_URL}/static/addressDoc/${corrFrontfileName}`}
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
                            label="Upload Aadhaar Back Side"
                            required
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleUploadAadhaarBackImage}
                            error={errors.corr_aadhaar_back_doc?.message}
                          />
                          {corrBackfileName && (
                            <div className="text-secondary-content">
                              <Link
                                href={`${NODE_API_URL}/static/addressDoc/${corrBackfileName}`}
                                target="_blank"
                              >
                                View
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (<></>)}
                    <div>
                      <CustomInput
                        label="POA Number (Aadhaar Number)"
                        placeholder="POA Number (Aadhaar Number)"
                        required
                        {...register("corr_doc_no")}
                        onChange={(e: any) => {
                          if (userData.InvestorRegistration?.isKYCDone && e.target.value.length === 12) {
                            onChangeAadhaar(e.target.value)
                          }
                        }}
                        error={errors.corr_doc_no?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Address Line 1"
                        placeholder="Address Line 1"
                        required
                        {...register("corr_address1")}
                        error={errors.corr_address1?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Address Line 2"
                        placeholder="Address Line 2"
                        {...register("corr_address2")}
                        error={errors.corr_address2?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        label="Address Type"
                        items={addressTypeList}
                        required
                        placeholder="Select Address Type"
                        bindValue="id"
                        bindName="address_type"
                        value={watch("corr_address_type")}
                        onChange={(e: any) => {
                          setValue("corr_address_type", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.corr_address_type?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        label="Country"
                        items={countryList}
                        required
                        placeholder="Select Country"
                        bindValue="id"
                        bindName="name"
                        value={watch("corr_country_id")}
                        onChange={(e: any) => {
                          setValue("corr_country_id", e.id, {
                            shouldValidate: true,
                          });
                          loadCorrStates(e.id);
                        }}
                        error={errors.corr_country_id?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        label="State"
                        items={corrStateList}
                        required
                        placeholder="Select State"
                        bindValue="id"
                        bindName="name"
                        value={watch("corr_state_id")}
                        onChange={(e: any) => {
                          setValue("corr_state_id", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.corr_state_id?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="City"
                        placeholder="City"
                        {...register("corr_city")}
                        error={errors.corr_city?.message}
                        required
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Pin Code"
                        placeholder="Pin Code"
                        {...register("corr_pincode")}
                        error={errors.corr_pincode?.message}
                        required
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="District"
                        placeholder="District"
                        required
                        {...register("corr_district")}
                        error={errors.corr_district?.message}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-border"></div>

            <div className="p-4 flex justify-between">
              <div>
                <CustomButton className="w-32" onClick={handlePOIEditProcess}>
                  Back
                </CustomButton>
              </div>
              <div>
                <CustomButton
                  className="w-32"
                  type="submit"
                  loading={addressDetailLoader}
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
                  <CustomText>Proof of Address</CustomText>
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
              <div className="cursor-pointer" onClick={handleEditProcess}>
                <CustomText className="text-secondary-content">Edit</CustomText>
              </div>
            </div>
          </div>

          <div className="border-b border-border"></div>

          <FATCADetail steps={steps} setSteps={setSteps} />
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
                <div>
                  <div className="text-center">Enter OTP</div>
                  <div className="my-5 flex justify-center">
                    <OTPInput
                      value={aadhaarOTP}
                      onChange={(otp: any) => setAadhaarOTP(otp)}
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
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <CustomButton
                  className="mt-6 w-full bg-primary"
                  type="submit"
                  loading={otpVerifyLoader}
                >
                  Submit
                </CustomButton>
              </div>

              <div
                className="text-other text-center mt-4 cursor-pointer"
                onClick={handleSubmit(reSendOtp)}
              >
                Resend OTP
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default AddressDetail;