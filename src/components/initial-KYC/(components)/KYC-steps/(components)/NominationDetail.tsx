"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import React, { useContext, useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import PersonVerification from "./PersonVerification";
import CustomRadio from "@/commonUI/Radio";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { useFieldArray, useForm } from "react-hook-form";
import api from "@/utils/api";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA } from "@/utils/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AccountContext from "@/context/AccountContext/Account.context";
import { useRouter } from "next/navigation";

// Validation schema
const nomineeSchema = yup.object().shape({
  nominee_name: yup.string().required("Nominee name is required"),
  nominee_DOB: yup.string().required("Date of birth is required"),
  nominee_Type: yup.string().required("Nominee type is required"),
  relation: yup.string().required("Relationship is required"),
  percentage_allocation: yup
    .string()
    .required("Percentage allocation is required")
    .test("is-number", "Percentage must be a valid number", (value) => {
      return !isNaN(Number(value));
    })
    .test("min-value", "Percentage must be at least 1%", (value) => {
      return Number(value) >= 1;
    })
    .test("max-value", "Percentage cannot exceed 100%", (value) => {
      return Number(value) <= 100;
    }),
  // Identity Information
  identity_type: yup.string().required("Identity type is required"),
  identity_number: yup.string().required("Identity number is required"),
  // Contact Information
  mobile_number: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  email_address: yup
    .string()
    .required("Email address is required")
    .email("Invalid email format"),
  // Address Information
  address_line_1: yup.string().required("Address line 1 is required"),
  address_line_2: yup.string().notRequired(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pin_code: yup
    .string()
    .required("PIN code is required")
    .matches(/^[0-9]{6}$/, "PIN code must be 6 digits"),
  country: yup.string().required("Country is required"),
  guardian_name: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema.required("Guardian name is required for minor"),
    otherwise: (schema) => schema.notRequired(),
  }),
  guardian_PAN: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema
      .required("Guardian PAN is required for minor")
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
    otherwise: (schema) => schema.notRequired(),
  }),
  guardian_DOB: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema.required("Guardian date of birth is required for minor"),
    otherwise: (schema) => schema.notRequired(),
  }),
  guardian_mobile: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema
      .required("Guardian mobile is required for minor")
      .matches(/^[0-9]{10}$/, "Guardian mobile number must be 10 digits"),
    otherwise: (schema) => schema.notRequired(),
  }),
  guardian_email: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema.email("Invalid email").required("Guardian email is required for minor"),
    otherwise: (schema) => schema.notRequired(),
  }),
  guardian_relationship: yup.string().when("nominee_Type", {
    is: "Minor",
    then: (schema) => schema.required("Guardian relationship is required for minor"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const schema = yup.object().shape({
  nominees: yup
    .array()
    .of(nomineeSchema)
    .min(1, "At least one nominee is required")
    .test("total-percentage", "Total percentage allocation must equal 100%", function (nominees) {
      if (!nominees || nominees.length === 0) return true;

      const total = nominees.reduce((sum: number, nominee: any) => {
        return sum + (parseFloat(nominee.percentage_allocation) || 0);
      }, 0);

      return total === 100;
    }),
});

function NominationDetail({ steps, setSteps }: any) {
  const maxNominees = 3;
  const [isNominee, setIsNominee] = useState<any>("Yes");
  const [nomineeDetailLoader, setNomineeDetailLoader] = useState<any>(false);
  const [userData, setUserData] = useState<any>("");
  const [singzyData, setSingzyData] = useState<any>([]);
  const [countryList, setCountryList] = useState<any>([]);
  const [stateList, setStateList] = useState<any>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const { listings } = useContext<any>(AccountContext);
  const [isMember, setIsMember] = useState(false);
  const router = useRouter();

  // Identity type options





  const { control, register, formState: { errors }, handleSubmit, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nominees: [
        {
          nominee_name: "",
          nominee_DOB: "",
          nominee_Type: "Major", // default to major
          relation: "",
          percentage_allocation: "",
          // Identity Information
          identity_type: "",
          identity_number: "",
          // Contact Information
          mobile_number: "",
          email_address: "",
          // Address Information
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          pin_code: "",
          country: "", // No default country
          // Guardian Information
          guardian_name: "",
          guardian_PAN: "",
          guardian_DOB: "",
          guardian_mobile: "",
          guardian_email: "",
          guardian_relationship: "",
        },
      ],
    },
  });


  const fetchData = async (id: any) => {
    try {
      setIsLoadingData(true);
      const res = await api.get(`/kyc/get-nominee-info/${id}`);
      if (res.data.data) {
        let dataValue = res.data.data;

        // Patch the form with existing nominee data
        // Handle both array and single object responses
        let nomineesArray = [];
        if (dataValue) {
          if (Array.isArray(dataValue)) {
            nomineesArray = dataValue;
          } else if (typeof dataValue === 'object') {
            nomineesArray = [dataValue];
          }
        }

        if (nomineesArray.length > 0) {

          const formattedNominees = nomineesArray.map((nominee: any, index: number) => {

            const formatted = {
              nominee_name: nominee.nominee_name || "",
              // Handle date format - remove timestamp if present
              nominee_DOB: nominee.nominee_DOB ?
                (String(nominee.nominee_DOB).includes('T') ? String(nominee.nominee_DOB).split('T')[0] : String(nominee.nominee_DOB)) : "",
              // Handle nominee type - convert number to string
              nominee_Type: nominee.nominee_Type,
              relation: nominee.relation,
              // Handle percentage field variations
              percentage_allocation: nominee.percentage_allocation,
              // Identity Information
              identity_type: nominee.identity_type || "",
              identity_number: nominee.identity_number || "",
              // Contact Information
              mobile_number: nominee.mobile_number || "",
              email_address: nominee.email_address || "",
              // Address Information
              address_line_1: nominee.address_line_1 || "",
              address_line_2: nominee.address_line_2 || "",
              city: nominee.city || "",
              state: nominee.state || "",
              pin_code: nominee.pin_code || "",
              country: nominee.country || "",
              // Guardian fields (for minors) - handle variations
              guardian_name: nominee.guardian_name || "",
              guardian_PAN: nominee.guardian_PAN || nominee.guardian_pan || "",
              guardian_DOB: nominee.guardian_DOB ?
                (String(nominee.guardian_DOB).includes('T') ? String(nominee.guardian_DOB).split('T')[0] : String(nominee.guardian_DOB)) : "",
              guardian_mobile: nominee.guardian_mobile || "",
              guardian_email: nominee.guardian_email || "",
              guardian_relationship: nominee.guardian_relationship || nominee.guardian_relation || "",
            };

            return formatted;
          });


          // Use reset instead of setValue to completely replace form data
          reset({
            nominees: formattedNominees
          });


          // Load states for each nominee if country is selected
          formattedNominees.forEach((nominee: any, index: number) => {
            if (nominee.country) {
              getStateList(nominee.country);
            }
          });

          // Verify the form was updated


        }
      }
    } catch (error) {
      console.error("Fetch nominee data failed:", error);
    } finally {
      setIsLoadingData(false);
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
      // First initialize signzy login
      let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name;
      let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id;

      if (signzy_user_name) {
        investorLogin({ signzy_user_name, signzy_kyc_id });
      }
      setTimeout(() => {
        fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);
      }, 500);
    }
  }, [reset]);

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nominees",
  });

  // Fetch country list
  const getCountryList = async () => {
    try {
      let country = await api.get(`/country/getAllCountry`);
      if (country?.data?.data) {
        setCountryList(country?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  // Fetch state list based on country
  const getStateList = async (countryId: any) => {
    try {
      let state = await api.get(`/state/getAllStateByCountry/${countryId}`);
      if (state?.data?.data) {
        setStateList(state?.data?.data);
        return state?.data?.data;
      }
      return [];
    } catch (error) {
      handleServerError(error);
      return [];
    }
  };

  const onSubmit = async (data: any) => {
    setNomineeDetailLoader(true);

    try {
      let nomineeBody: any = {
        investor_id: userData?.InvestorRegistration?.id,
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
        kycStatus: userData?.InvestorRegistration?.isKYCDone,
        nominee_details: data?.nominees,
      };



      let res: any = await api.post(`/kyc/investor-nominee`, nomineeBody);
      if (res.data.data) {
        userData.InvestorRegistration = res?.data?.data.investor_data;
        if (isMember) {
          setLS(MEMBER_DATA, userData);
        } else {
          setLS(USER_DATA, userData);
        }
        if (userData.InvestorRegistration.isKYCDone) {
          const payload = {
            investor_id: userData?.InvestorRegistration?.id,
            last_kyc_step: 8,
          }
          const res = await api.post(`/kyc/updateinvestor`, payload);
          if (res.data.data) {
            userData.InvestorRegistration = res.data.data.investor_data;
            if (isMember) {
              setLS(MEMBER_DATA, userData);
            } else {
              setLS(USER_DATA, userData);
            }
            setIsLoadingData(false);

            router.push("/kyc-quick-summary");
          }

        } else {

          handleSixStepKYC();
        }
        toastAlert("success", "Nominees Added Successfully");
      }
    } catch (error) {
      handleServerError(error);
    } finally {
      setNomineeDetailLoader(false);
    }
  };

  const nomineesWatch = watch("nominees");


  // Load initial data
  useEffect(() => {
    getCountryList(); // Only load countries, no default states
  }, []);

  // Age calculation logic - triggers specifically on DOB change
  useEffect(() => {
    if (nomineesWatch && Array.isArray(nomineesWatch)) {
      nomineesWatch.forEach((nominee: any, index: number) => {
        if (nominee.nominee_DOB) {
          const birthDate = new Date(nominee.nominee_DOB);
          const today = new Date();

          // Calculate age more accurately
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }


          // Only update if the current nominee_Type doesn't match the calculated age
          const currentType = watch(`nominees.${index}.nominee_Type`);
          const calculatedType = age >= 18 ? "Major" : "Minor";

          if (currentType !== calculatedType) {
            setValue(`nominees.${index}.nominee_Type`, calculatedType);
          }
        }
      });
    }
  }, [nomineesWatch?.map((nominee: any) => nominee?.nominee_DOB), setValue, watch]);





  const handleSixStepKYC = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: false,
      fatca_step: false,
      bank_step: false,
      nominee_step: false,
      personalverification_step: true
    }))
  };

  const handleBackProcess = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: false,
      fatca_step: false,
      bank_step: true,
      nominee_step: false,
      personalverification_step: false
    }))
  };

  const handleEditProcess = () => {
    setSteps((prev: any) => ({
      ...prev,
      pan_step: false,
      address_step: false,
      fatca_step: false,
      bank_step: false,
      nominee_step: true,
      personalverification_step: false
    }))
  };

  return (
    <>
      {steps.nominee_step ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4 px-6">
              <div className="mt-2">
                <CustomText className="text-xl font-montserrat font-semibold">
                  Nomination Details
                </CustomText>
                <p className="text-sm text-gray-600 mt-2">
                  Add nominee details for your investment account. You can add up to 3 nominees and the total allocation must equal 100%.
                </p>

              </div>
              {/* {userData?.InvestorRegistration?.isKYCDone && (
                <div className="mt-4">
                  <CustomText>Do you want to add a Nominee?</CustomText>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-3">
                    <div>
                      <CustomRadio
                        className="radio-sm"
                        label="Yes"
                        checked={isNominee === "Yes"}
                        onChange={() => setIsNominee("Yes")}
                      />
                    </div>
                    <div>
                      <CustomRadio
                        className="radio-sm"
                        label="No"
                        checked={isNominee === "No"}
                        onChange={() => setIsNominee("No")}
                      />
                    </div>
                    <div>
                      <CustomRadio
                        className="radio-sm"
                        label="No, but verify later"
                        checked={isNominee === "No, but verify later"}
                        onChange={() => setIsNominee("No, but verify later")}
                      />
                    </div>
                  </div>
                </div>
              )

              } */}


              {isNominee === "Yes" ? (
                <>

                  {fields.map((_, index) => {
                    const nomineeType = nomineesWatch?.[index]?.nominee_Type;

                    return (
                      <div key={index} className="bg-white border-0 border-gray-200 rounded-lg p-0 mb-6 mt-3">
                        <div className="flex gap-4 items-center justify-between sm:justify-start mb-4 bg-gray-50 p-2 sticky top-0 z-10">
                          <CustomText className="text-lg font-montserrat font-semibold text-primary">
                            Nominee {index + 1}
                          </CustomText>

                          {fields.length > 1 && (
                            <div className="flex justify-end">
                              <CustomButton
                                type="button"
                                onClick={() => remove(index)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                              >
                                Remove
                              </CustomButton>
                            </div>
                          )}
                        </div>
                        <div className="mt-5">
                          <CustomText className="text-lg font-montserrat font-semibold">
                            Basic Information
                          </CustomText>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-4">
                          <div>
                            <CustomInput
                              {...register(`nominees.${index}.nominee_name`)}
                              label="Nominee Name"
                              required
                              placeholder="Enter nominee name"
                              error={(errors.nominees as any)?.[index]?.nominee_name?.message}
                            />
                          </div>
                          <div>
                            <CustomInput
                              {...register(`nominees.${index}.nominee_DOB`)}
                              label="Date Of Birth"
                              required
                              placeholder="Select date of birth"
                              type="date"
                              onChange={(e: any) => {
                                // Update the form value
                                setValue(`nominees.${index}.nominee_DOB`, e.target.value, {
                                  shouldValidate: true,
                                });

                                // Calculate age immediately on DOB change
                                if (e.target.value) {
                                  const birthDate = new Date(e.target.value);
                                  const today = new Date();
                                  let age = today.getFullYear() - birthDate.getFullYear();
                                  const monthDiff = today.getMonth() - birthDate.getMonth();

                                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                    age--;
                                  }

                                  const calculatedType = age >= 18 ? "Major" : "Minor";
                                  setValue(`nominees.${index}.nominee_Type`, calculatedType, {
                                    shouldValidate: true,
                                  });

                                }
                              }}
                              error={(errors.nominees as any)?.[index]?.nominee_DOB?.message}
                            />
                          </div>
                          <div >
                            <CustomInput
                              {...register(`nominees.${index}.nominee_Type`)}
                              label="Nominee Type"
                              required
                              disabled={true}
                              value={nomineeType}
                              placeholder="Nominee Type"
                              error={(errors.nominees as any)?.[index]?.nominee_Type?.message}
                            />
                          </div>
                          {/* {(errors.nominees as any)?.[index]?.nominee_Type && (
                              <div className="text-red-500 text-sm mt-1">
                                {(errors.nominees as any)[index].nominee_Type.message}
                              </div>
                            )} */}
                          <div className="md:col-span-2 2xl:col-span-1">
                            <CustomReactSelect
                              items={listings.relationship_types}
                              label="Relationship"
                              placeholder="Select relationship"
                              bindValue="id"
                              bindName="relationship"
                              required
                              {...register(`nominees.${index}.relation`)}
                              value={watch(`nominees.${index}.relation`)}
                              onChange={(e: any) => {
                                setValue(`nominees.${index}.relation`, e.id, {
                                  shouldValidate: true,
                                });
                              }}
                              error={(errors.nominees as any)?.[index]?.relation?.message}
                            />

                          </div>
                          <div>
                            <CustomInput
                              label="Percentage of Allocation"
                              required
                              placeholder="Enter percentage (1-100)"
                              type="number"
                              min="1"
                              max="100"
                              {...register(`nominees.${index}.percentage_allocation`)}
                              error={(errors.nominees as any)?.[index]?.percentage_allocation?.message}
                            />
                          </div>
                          <div>
                            <CustomReactSelect
                              items={listings.identity_type_list}
                              label="Identity Type"
                              placeholder="Select identity type"
                              bindValue="id"
                              bindName="type"
                              required
                              {...register(`nominees.${index}.identity_type`)}
                              value={watch(`nominees.${index}.identity_type`)}
                              onChange={(e: any) => {
                                setValue(`nominees.${index}.identity_type`, e.id, {
                                  shouldValidate: true,
                                });
                              }}
                              error={(errors.nominees as any)?.[index]?.identity_type?.message}
                            />
                          </div>
                          <div>
                            <CustomInput
                              label="Identity Number"
                              required
                              placeholder="Enter identity number"
                              {...register(`nominees.${index}.identity_number`)}
                              error={(errors.nominees as any)?.[index]?.identity_number?.message}
                            />
                          </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="mt-6">
                          <CustomText className="text-lg font-montserrat font-semibold">
                            Contact Information
                          </CustomText>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-4">
                          <div>
                            <CustomInput
                              label="Mobile Number"
                              required
                              placeholder="Enter 10-digit mobile number"
                              type="tel"
                              maxLength={10}
                              {...register(`nominees.${index}.mobile_number`)}
                              onKeyDown={(e: any) => {
                                // Only allow numeric input and navigation keys
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              error={(errors.nominees as any)?.[index]?.mobile_number?.message}
                            />
                          </div>
                          <div className="col-span-2">
                            <CustomInput
                              label="Email Address"
                              required
                              placeholder="Enter email address"
                              type="email"
                              {...register(`nominees.${index}.email_address`)}
                              error={(errors.nominees as any)?.[index]?.email_address?.message}
                            />
                          </div>
                        </div>

                        {/* Address Information Section */}
                        <div className="mt-6">
                          <CustomText className="text-lg font-montserrat font-semibold">
                            Address Information
                          </CustomText>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-4">
                          <div className="lg:col-span-2">
                            <CustomInput
                              label="Address Line 1"
                              required
                              placeholder="Enter address line 1"
                              {...register(`nominees.${index}.address_line_1`)}
                              error={(errors.nominees as any)?.[index]?.address_line_1?.message}
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <CustomInput
                              label="Address Line 2"
                              placeholder="Enter address line 2 (optional)"
                              {...register(`nominees.${index}.address_line_2`)}
                              error={(errors.nominees as any)?.[index]?.address_line_2?.message}
                            />
                          </div>
                          <div>
                            <CustomReactSelect
                              items={countryList}
                              label="Country"
                              placeholder="Select country"
                              bindValue="id"
                              bindName="name"
                              required
                              {...register(`nominees.${index}.country`)}
                              value={watch(`nominees.${index}.country`)}
                              onChange={(e: any) => {
                                // First load states for selected country
                                getStateList(e.id);
                                // Then set the country value
                                setValue(`nominees.${index}.country`, e.id, {
                                  shouldValidate: true,
                                });
                                // Clear the state selection when country changes
                                setValue(`nominees.${index}.state`, "", {
                                  shouldValidate: true,
                                });
                              }}
                              error={(errors.nominees as any)?.[index]?.country?.message}
                            />
                          </div>
                          <div>
                            <CustomReactSelect
                              items={stateList}
                              label="State"
                              placeholder="Select state"
                              bindValue="id"
                              bindName="name"
                              required
                              {...register(`nominees.${index}.state`)}
                              value={watch(`nominees.${index}.state`)}
                              onChange={(e: any) => {
                                setValue(`nominees.${index}.state`, e.id, {
                                  shouldValidate: true,
                                });
                              }}
                              error={(errors.nominees as any)?.[index]?.state?.message}
                            />
                          </div>
                          <div>
                            <CustomInput
                              label="City"
                              required
                              placeholder="Enter city"
                              {...register(`nominees.${index}.city`)}
                              error={(errors.nominees as any)?.[index]?.city?.message}
                            />
                          </div>
                          <div>
                            <CustomInput
                              label="PIN Code"
                              required
                              placeholder="Enter PIN code"
                              type="text"
                              maxLength={6}
                              {...register(`nominees.${index}.pin_code`)}
                              error={(errors.nominees as any)?.[index]?.pin_code?.message}
                            />
                          </div>
                        </div>

                        {nomineeType === "Minor" ? (
                          <>
                            <div className="mt-6">
                              <CustomText className="text-lg font-montserrat font-semibold">
                                Guardian Information
                              </CustomText>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-4">
                              <div>
                                <CustomInput
                                  label="Guardian Name"
                                  required
                                  placeholder="Enter guardian name"
                                  {...register(`nominees.${index}.guardian_name`)}
                                  error={(errors.nominees as any)?.[index]?.guardian_name?.message}
                                />
                              </div>
                              <div>
                                <CustomInput
                                  label="Guardian PAN"
                                  required
                                  placeholder="Enter PAN (e.g., ABCDE1234F)"
                                  maxLength={10}
                                  style={{ textTransform: 'uppercase' }}
                                  {...register(`nominees.${index}.guardian_PAN`)}
                                  onKeyDown={(e: any) => {
                                    const currentValue = watch(`nominees.${index}.guardian_PAN`) || '';
                                    const position = currentValue.length;

                                    // Allow navigation keys
                                    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                      return;
                                    }

                                    // PAN format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
                                    if (position < 5) {
                                      // First 5 positions should be letters
                                      if (!/[A-Za-z]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    } else if (position >= 5 && position < 9) {
                                      // Positions 6-9 should be numbers
                                      if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    } else if (position === 9) {
                                      // Last position should be a letter
                                      if (!/[A-Za-z]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    } else {
                                      // No more characters allowed
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e: any) => {
                                    const upperValue = e.target.value.toUpperCase();
                                    setValue(`nominees.${index}.guardian_PAN`, upperValue, {
                                      shouldValidate: true,
                                    });
                                  }}
                                  error={(errors.nominees as any)?.[index]?.guardian_PAN?.message}
                                />
                              </div>
                              <div>
                                <CustomInput
                                  label="Guardian Date Of Birth"
                                  required
                                  placeholder="Select guardian date of birth"
                                  type="date"
                                  {...register(`nominees.${index}.guardian_DOB`)}
                                  error={(errors.nominees as any)?.[index]?.guardian_DOB?.message}
                                />
                              </div>
                              <div>
                                <CustomReactSelect
                                  items={listings.nominee_guardian_relationship_types}
                                  bindValue="id"
                                  bindName="relationship"
                                  label="Relationship to Nominee"
                                  required
                                  placeholder="Select relationship"

                                  {...register(`nominees.${index}.guardian_relationship`)}
                                  value={watch(`nominees.${index}.guardian_relationship`)}
                                  onChange={(e: any) => {
                                    setValue(`nominees.${index}.guardian_relationship`, e.id, {
                                      shouldValidate: true,
                                    });
                                  }}
                                  error={(errors.nominees as any)?.[index]?.guardian_relationship?.message}
                                />
                              </div>
                              <div>
                                <CustomInput
                                  label="Guardian Mobile Number"
                                  required
                                  placeholder="Enter 10-digit mobile number"
                                  type="tel"
                                  maxLength={10}
                                  {...register(`nominees.${index}.guardian_mobile`)}
                                  onKeyDown={(e: any) => {
                                    // Only allow numeric input and navigation keys
                                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  error={(errors.nominees as any)?.[index]?.guardian_mobile?.message}
                                />
                              </div>
                              <div className="col-span-2">
                                <CustomInput
                                  label="Guardian Email Address"
                                  required
                                  placeholder="Enter email address"
                                  type="email"
                                  {...register(`nominees.${index}.guardian_email`)}
                                  error={(errors.nominees as any)?.[index]?.guardian_email?.message}
                                />
                              </div>
                            </div>
                          </>
                        ) : null}

                        {/* {index < fields.length - 1 && (
                          <div className="border-b border-gray-200 my-6"></div>
                        )} */}
                      </div>
                    );
                  })}

                 


                  <div className="mt-6 flex justify-center">
                <CustomButton
                  className="w-32"
                  type="submit"
                  disabled={nomineeDetailLoader || isLoadingData}
                >
                  {nomineeDetailLoader ? "Processing..." : isLoadingData ? "Loading..." : "Next"}
                </CustomButton>
              </div>


                  {/* Summary Section */}
                  {isNominee === "Yes" && fields.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <CustomText className="text-lg font-semibold mb-2">Summary</CustomText>
                      <div className="text-sm text-gray-600">
                        <p className="text-lg font-semibold">Total Nominees: {fields.length}</p>
                        <p className="text-lg font-semibold">
                          Total Allocation: {
                            nomineesWatch?.reduce((total: number, nominee: any) => {
                              return total + (parseFloat(nominee.percentage_allocation) || 0);
                            }, 0) || 0
                          }%
                        </p>
                        {nomineesWatch?.reduce((total: number, nominee: any) => {
                          return total + (parseFloat(nominee.percentage_allocation) || 0);
                        }, 0) !== 100 && (
                            <p className="text-orange-600 mt-1">
                              ⚠️ Total allocation should equal 100%
                            </p>
                          )}
                      </div>

                      {/* Display form-level errors */}
                      {(errors as any)?.nominees?.message && (
                        <div className="text-red-500 text-sm mt-2">
                          {(errors as any).nominees.message}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="border-b border-border"></div>

            <div className="p-4 flex justify-between">
              <div>
                <CustomButton
                  className="w-32"
                  onClick={handleBackProcess}
                  disabled={nomineeDetailLoader}
                >
                  Back
                </CustomButton>
              </div>

               {fields.length < maxNominees && (
                    <div className="mt-6 flex justify-center">
                      <CustomButton
                        type="button"
                        onClick={() =>
                          append({
                            nominee_name: "",
                            nominee_DOB: "",
                            nominee_Type: "Major",
                            relation: "",
                            percentage_allocation: "",
                            // Identity Information
                            identity_type: "",
                            identity_number: "",
                            // Contact Information
                            mobile_number: "",
                            email_address: "",
                            // Address Information
                            address_line_1: "",
                            address_line_2: "",
                            city: "",
                            state: "",
                            pin_code: "",
                            country: "", // No default country
                            // Guardian Information
                            guardian_name: "",
                            guardian_PAN: "",
                            guardian_DOB: "",
                            guardian_mobile: "",
                            guardian_email: "",
                            guardian_relationship: "",
                          })
                        }
                        className="bg-primary text-white px-6 py-2 rounded"
                      >
                        + Add Another Nominee
                      </CustomButton>
                    </div>
                  )}
              
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="p-4 px-6 pb-6">
            <div className="flex flex-row justify-between sm:justify-start mt-3 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="lg:w-52">
                  <CustomText>Nomination Detail</CustomText>
                </div>
                <div className="flex justify-between items-center w-full sm:w-56 gap-2">
                  <progress
                    className="progress progress-primary bg-progressBg w-56"
                    value="0"
                    max="100"
                  ></progress>
                  {/* </div> */}
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

          <PersonVerification steps={steps} setSteps={setSteps} />
        </>
      )}
    </>
  );
}

export default NominationDetail;
