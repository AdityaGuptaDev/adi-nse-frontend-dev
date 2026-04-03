"use Client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import BankDetail from "./BankDetail";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import api from "@/utils/api";
import { ADD_MEMBER, MEMBER_DATA, USER_DATA } from "@/utils/constants";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export const schema = yup.object().shape({
  is_indian_citizen: yup.string().required("Please select an option"),

  is_politically_exposed: yup.string().required("Please select an option"),

  is_indian_taxpayer: yup.string().required("Please select an option"),

  // Removed is_related_to_pep validation as it's now part of is_politically_exposed

  occupation: yup
    .string()
    .required("Occupation is required")
    .typeError("Occupation is required"),

  income_source_id: yup
    .number()
    .required("Wealth Source is required")
    .typeError("Wealth Source is required"),

  salary_slab_id: yup
    .number()
    .required("Annual Income is required")
    .typeError("Annual Income is required"),

  COB: yup.string().when("is_indian_taxpayer", {
    is: "yes",
    then: (schema) => schema.required("Country of Birth is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  POB: yup.string().trim(),

  // Conditional validations for non-Indian citizens
  citizenship_country: yup.string().when("is_indian_citizen", {
    is: "no",
    then: (schema) => schema.required("Please select your country of citizenship"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Conditional validations for non-Indian taxpayers

  foreign_address: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("Address is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  foreign_pincode: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("Pincode is required").matches(/^[0-9]{6}$/, "PIN code must be 6 digits"),
    otherwise: (schema) => schema.notRequired()
    ,
  }),
  foreign_city: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("City is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  foreign_district: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("District is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  foreign_state: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("State is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  foreign_country: yup.string().when("is_indian_taxpayer", {
    is: "no",
    then: (schema) => schema.required("Country is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

});

function FATCADetail({ steps, setSteps }: any) {
  const [singzyData, setSingzyData] = useState<any>([]);
  const [userData, setUserData] = useState<any>("");
  const [FATCALoader, setFATCALoader] = useState<any>(false);
  const [incomeListData, setIncomeListData] = useState<any>([]);
  const [occupationListData, setOccupationListData] = useState<any>([]);
  const [annualIncomeData, setAnnualIncomeData] = useState<any>([]);
  const [countryList, setCountryList] = useState<any>([]);
  const [stateList, setStateList] = useState<any>([]);
  const [isMember, setIsMember] = useState(false);



  let yesNoOptions: any = [
    { id: "yes", name: "Yes" },
    { id: "no", name: "No" },
  ];

  let politicallyExposedOptions: any = [
    { id: "no", name: "No" },
    { id: "yes", name: "Yes" },
    { id: "related", name: "Related" },
    // { id: "related", name: "I am related to a politically exposed person" },
  ];


  const getCountry = async () => {
    try {
      let country = await api.get(`/country/getAllCountry`);

      if (country?.data?.data) {
        // console.log(country?.data?.data, "country?.data?.datacountry?.data?.data");
        setCountryList(country?.data?.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

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

  const getDropdown = async () => {
    try {
      let res: any = await api.get(`/kyc/get-fatca-dropdown`);
      let { addresslist, incomeList, occupationList, annualIncome } = res.data.data

      setIncomeListData(incomeList)
      setOccupationListData(occupationList)
      setAnnualIncomeData(annualIncome)

    } catch (error) {
      handleServerError(error);
    }
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    watch,
    setValue,
    getValues,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_indian_citizen: "yes",
      is_politically_exposed: "no",
      is_indian_taxpayer: "yes",
      occupation: "",
      income_source_id: "",
      salary_slab_id: "",
      COB: "",
      POB: "",
      // New conditional fields
      citizenship_country: "",
      foreign_address: "",
      foreign_pincode: "",
      foreign_city: "",
      foreign_district: "",
      foreign_state: "",
      foreign_country: "",
    },
  });

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
    getCountry()


    if (getUser) {
      let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name;
      let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id;

      if (signzy_user_name) {
        investorLogin({ signzy_user_name, signzy_kyc_id });
      }

      fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);
    }

    getDropdown()

  }, []);

  // Set default India when country list is loaded
  useEffect(() => {
    if (countryList.length > 0) {
      const indiaCountry = countryList.find((country: any) =>
        country.name === "India" || country.name === "INDIA" || country.name === "india"
      );

      if (indiaCountry) {
        // Set COB to India if not already set
        if (!watch("COB")) {
          setValue("COB", indiaCountry.id);
          console.log("Default India set for COB:", indiaCountry);
        }

      }
    }
  }, [countryList, setValue, watch]);

  // Set default India for foreign_country when user changes to non-Indian taxpayer


  const fetchData = async (id: any) => {
    try {
      const res = await api.get(`/kyc/get-investor-declaration/${id}`);

      if (res.data.data) {
        let dataValue = res.data.data;

        // Set form values with fetched data
        setValue("is_indian_citizen", dataValue.is_indian_citizen || "yes");
        setValue("is_politically_exposed", dataValue.is_politically_exposed || "no");
        setValue("is_indian_taxpayer", dataValue.is_indian_taxpayer || "yes");
        setValue("occupation", dataValue.occupation || "");
        setValue("income_source_id", dataValue.income_source_id || "");
        setValue("salary_slab_id", dataValue.salary_slab_id || "");
        console.log(dataValue.COB, "dataValue.COB");

        setValue("COB", dataValue.COB || "");

        setValue("POB", dataValue.POB || "");

        // Set conditional fields
        setValue("citizenship_country", dataValue.citizenship_country || "");
        setValue("foreign_address", dataValue.foreign_address || "");
        setValue("foreign_pincode", dataValue.foreign_pincode || "");
        setValue("foreign_city", dataValue.foreign_city || "");
        setValue("foreign_district", dataValue.foreign_district || "");
        setValue("foreign_state", dataValue.foreign_state || "");
        setValue("foreign_country", dataValue.foreign_country || "");

        // Load states if foreign country is selected
        if (dataValue.foreign_country) {
          getStateList(dataValue.foreign_country);
        }
      }

    } catch (error) {
      console.error("Fetch failed:", error);
      handleServerError(error);
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

  const handleFourStepKYC = () => {

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

  const handleBackProcess = () => {
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

  const handleEditProcess = () => {
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
  console.log(errors, "errors");

  const onSubmitFATCA = async (values: any) => {
    try {
      if (values.is_indian_citizen == "no" || values.is_indian_taxpayer == "no") {
        toastAlert("error", "Dear Investor, the online on-boarding journey is available only for the citizens of India. Kindly reach out to our Back-office team for further details. ");
        return
      }
      
      setFATCALoader(true);
      let passObj: any = {
        investor_id: userData?.InvestorRegistration?.id,
        is_indian_citizen: values.is_indian_citizen,
        is_politically_exposed: values.is_politically_exposed === "related" ? "no" : values.is_politically_exposed,
        is_indian_taxpayer: values.is_indian_taxpayer,
        kycStatus: userData?.InvestorRegistration?.isKYCDone,

        // is_related_to_pep is now handled within is_politically_exposed
        is_related_to_pep: values.is_politically_exposed === "related" ? "yes" : "no",
        occupation: values.occupation,
        income_source_id: values.income_source_id,
        salary_slab_id: values.salary_slab_id,
        signZy_user_id: singzyData?.userId,
        signZy_user_Token: singzyData?.id,
        COB: values.COB,
        POB: values.POB,
        // New conditional fields
        citizenship_country: values.citizenship_country,
        foreign_address: values.foreign_address,
        foreign_pincode: values.foreign_pincode,
        foreign_city: values.foreign_city,
        foreign_district: values.foreign_district,
        foreign_state: values.foreign_state,
        foreign_country: values.foreign_country,
      };


      let declare_data = await api.post(`/kyc/declaration`, passObj);
      if (declare_data) {
        toastAlert("success", declare_data.data.msg);
        let invester = declare_data.data.data.investor_data;
        if (invester) {
          userData.InvestorRegistration = invester;
          if (isMember) {
            setLS(MEMBER_DATA, userData);
          } else {
            setLS(USER_DATA, userData);
          }
        }
        handleFourStepKYC();
      }
      setFATCALoader(false);
    } catch (error: any) {
      handleServerError(error);
      setFATCALoader(false);
    }

    // }
  };

  return (
    <>
      {steps.fatca_step ? (
        <>
          <form onSubmit={handleSubmit(onSubmitFATCA)}>
            <div className="p-4 px-6 pb-6">
              <div className="mt-2">
                <CustomText className="text-xl font-montserrat font-semibold">
                  FATCA
                </CustomText>
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4 gap-y-1">
                  <div className="flex items-center justify-between">
                    <CustomText className="text-sm font-medium">
                      I am a citizen of India
                    </CustomText>
                    <div className="w-28">
                      <CustomReactSelect
                        items={yesNoOptions}
                        bindValue="id"
                        bindName="name"
                        value={watch("is_indian_citizen")}
                        onChange={(e: any) => {
                          setValue("is_indian_citizen", e.id, {
                            shouldValidate: true,
                          });
                          // Clear citizenship country when switching to Yes
                          if (e.id === "yes") {
                            setValue("citizenship_country", "", {
                              shouldValidate: true,
                            });
                          }
                        }}
                        error={errors.is_indian_citizen?.message}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-2">
                    {watch("is_indian_citizen") === "no" && (
                      <div>
                        <CustomReactSelect
                          items={countryList}
                          placeholder="Select Country"
                          bindValue="id"
                          bindName="name"
                          value={watch("citizenship_country")}
                          onChange={(e: any) => {
                            setValue("citizenship_country", e.id, {
                              shouldValidate: true,
                            });
                          }}
                          error={errors.citizenship_country?.message}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4 gap-y-1">

                  <div className="flex items-center justify-between">
                    <CustomText className="text-sm font-medium">
                      I am Tax payer only in India
                    </CustomText>
                    <div className="w-28">
                      <CustomReactSelect
                        items={yesNoOptions}
                        bindValue="id"
                        bindName="name"
                        value={watch("is_indian_taxpayer")}
                        onChange={(e: any) => {
                          setValue("is_indian_taxpayer", e.id, {
                            shouldValidate: true,
                          });
                          setValue("COB", "", { shouldValidate: true });

                          // Clear foreign address fields when switching to Yes
                          if (e.id === "yes") {
                            setValue("foreign_address", "", { shouldValidate: true });
                            setValue("foreign_pincode", "", { shouldValidate: true });
                            setValue("foreign_city", "", { shouldValidate: true });
                            setValue("foreign_district", "", { shouldValidate: true });
                            setValue("foreign_state", "", { shouldValidate: true });
                            setValue("foreign_country", "", { shouldValidate: true });
                            // Clear state list when switching back to Yes
                            setStateList([]);
                          }

                        }}
                        error={errors.is_indian_taxpayer?.message}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4 gap-y-1">

                  <div className="flex items-center justify-between">
                    <CustomText className="text-sm font-medium">
                      I am politically exposed person
                    </CustomText>
                    <div className="w-28">
                      <CustomReactSelect
                        items={politicallyExposedOptions}
                        bindValue="id"
                        bindName="name"
                        value={watch("is_politically_exposed")}
                        onChange={(e: any) => {
                          setValue("is_politically_exposed", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.is_politically_exposed?.message}
                      />
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>

              {/* Foreign Address Fields - Show when "I am Tax payer only in India" is No */}
              {watch("is_indian_taxpayer") === "no" && (
                <div className="mt-6">
                  <CustomText className="text-lg font-semibold mb-4">
                    Additional Information
                  </CustomText>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">

                    <div className="lg:col-span-2">
                      <CustomInput
                        label="Address *"
                        placeholder="Enter address"
                        {...register("foreign_address")}
                        error={errors.foreign_address?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={countryList}
                        label="Country of Birth"
                        required
                        placeholder="Select Country"
                        bindValue="id"
                        bindName="name"
                        value={watch("foreign_country")}
                        onChange={(e: any) => {
                          // First load states for selected country
                          getStateList(e.id);
                          // Then set the country value
                          setValue("foreign_country", e.id, {
                            shouldValidate: true,
                          });
                          // Clear the state selection when country changes
                          setValue("foreign_state", "", {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.foreign_country?.message}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        items={stateList}
                        label="State"
                        required
                        placeholder="Select state"
                        bindValue="id"
                        bindName="name"
                        value={watch("foreign_state")}
                        onChange={(e: any) => {
                          setValue("foreign_state", e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.foreign_state?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="City"
                        required
                        placeholder="Enter city"
                        {...register("foreign_city")}
                        error={errors.foreign_city?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="District"
                        required
                        placeholder="Enter district"
                        {...register("foreign_district")}
                        error={errors.foreign_district?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Pincode"
                        required
                        placeholder="Enter pincode"
                        {...register("foreign_pincode")}
                        error={errors.foreign_pincode?.message}
                      />
                    </div>

                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-7 gap-4 mt-4">
                {watch("is_indian_taxpayer") === "yes" && (
                  <div>
                    <CustomReactSelect
                      items={countryList}
                      label="Country of Birth"
                      placeholder="Country of Birth"
                      bindValue="id"
                      bindName="name"
                      required
                      {...register("COB")}
                      value={watch("COB")}
                      onChange={(e: any) => {
                        setValue("COB", e.id, {});
                      }}
                      error={errors.COB?.message}
                    />
                  </div>
                )}
                {/* <div>
                  <CustomInput
                    label="Occupation"
                    placeholder="Occupation"
                    {...register("occupation")}
                    error={errors.occupation?.message}
                  />
                </div> */}
                <div>
                  <CustomReactSelect
                    items={occupationListData}
                    label="Occupation"
                    placeholder="Occupation"
                    bindValue="id"
                    bindName="occupation"
                    required
                    {...register("occupation")}
                    value={watch("occupation")}
                    onChange={(e: any) => {
                      setValue("occupation", e.id, {});
                    }}
                    error={errors.occupation?.message}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    items={annualIncomeData}
                    label="Annual Income"
                    placeholder="Select"
                    bindValue="id"
                    bindName="income_range"
                    required
                    {...register("salary_slab_id")}
                    value={watch("salary_slab_id")}
                    onChange={(e: any) => {
                      setValue("salary_slab_id", e.id, {});
                    }}
                    error={errors.salary_slab_id?.message}
                  />
                </div>
                <div>
                  <CustomReactSelect
                    items={incomeListData}
                    label="Wealth Source"
                    placeholder="Select"
                    bindValue="source_id"
                    bindName="source_name"
                    required
                    {...register("income_source_id")}
                    value={watch("income_source_id")}
                    onChange={(e: any) => {
                      setValue("income_source_id", e.source_id, {});
                    }}
                    error={errors.income_source_id?.message}
                  />
                </div>

                <div>
                  <CustomInput
                    label="Place of Birth"
                    placeholder="Place of Birth"
                    {...register("POB")}
                    error={errors.POB?.message}
                  />
                </div>
              </div>
            </div>
            <div className="border-b border-border"></div>

            <div className="p-4 flex justify-between">
              <div>
                <CustomButton className="w-32" onClick={handleBackProcess}>
                  Back
                </CustomButton>
              </div>
              <div>
                <CustomButton
                  className="w-32"
                  type="submit"
                  loading={FATCALoader}
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
                  <CustomText>FATCA </CustomText>
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

          <BankDetail steps={steps} setSteps={setSteps} />
        </>
      )}
    </>
  );
}

export default FATCADetail;
