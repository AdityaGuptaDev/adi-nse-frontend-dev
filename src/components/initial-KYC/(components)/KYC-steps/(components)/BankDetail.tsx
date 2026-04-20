"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import NominationDetail from "./NominationDetail";
import CustomReactSelect from "@/commonUI/ReactSelect";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import Link from "next/link";
import { accountTypeList, ADD_MEMBER, MEMBER_DATA, NODE_API_URL, USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import { useFieldArray } from "react-hook-form";
import { useContext } from "react";
import AccountContext from "@/context/AccountContext/Account.context";
import FullPageLoader from "@/commonUI/FullPageLoader";

// Create dynamic schema based on KYC status
const createBankAccountSchema = (isKYCDone: boolean) => {
  const baseSchema = {
    cancelled_cheque: yup
      .string()
      .trim()
      .required("Cancelled Check image is required"),
    account_no: yup.string().trim().required("Account Number is required"),
    account_type: yup.number().required("Account Type is required"),
    ifsc: yup.string().required("IFSC is required"),
    bank_id: yup.string().required("Bank Name is required"),
    micr: yup.string().required("Mirc is required"),
    branch: yup.string().required("Branch is required"),
    bank_proof: yup
      .number()
      .typeError("Bank Proof must be a valid number") // for non-numeric values
      .required("Bank Proof is required")             // for empty/null/undefined
      .transform((value, originalValue) => {
        // Convert empty strings to undefined so required() works correctly
        return originalValue === "" ? undefined : value;
      }),
  };

  // Add conditional fields when KYC is done


  return yup.object().shape(baseSchema);
};

// Create dynamic main schema
const createMainSchema = (isKYCDone: boolean) => {
  return yup.object().shape({
    bankAccounts: yup.array().of(createBankAccountSchema(isKYCDone)).min(1, "At least one bank account is required"),
  });
};

function BankDetail({ steps, setSteps }: any) {
  const [fileNames, setFileNames] = useState<any>([""]);
  const [bankDetailLoader, setBankDetailLoader] = useState<any>(false);
  const [scanChequeLoader, setScanChequeLoader] = useState<any>(false);
  const [userData, setUserData] = useState<any>("");
  const [singzyData, setSingzyData] = useState<any>([]);
  const { listings }: any = useContext(AccountContext);
  const [maxBankAccounts, setMaxBankAccounts] = useState(1);
  const [bankProofList, setBankProofList] = useState([]);
  const [bankValidationLoader, setBankValidationLoader] = useState<any>({});
  const [isMember, setIsMember] = useState(false);




  // Create default bank account object based on KYC status
  const createDefaultBankAccount = () => {
    const baseAccount = {
      cancelled_cheque: "",
      account_no: "",
      account_type: 0,
      ifsc: "",
      bank_id: "",
      micr: "",
      branch: "",
      bank_proof: 0,
    };


    return baseAccount;
  };

  // Create schema based on KYC status
  const validationSchema = createMainSchema(userData?.InvestorRegistration?.isKYCDone || false);

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
    resolver: yupResolver(validationSchema),
    defaultValues: {
      bankAccounts: [createDefaultBankAccount()],
    },
  });


  // Add this function in your BankDetail component
const extractBankDetailsFromMobileVerification = () => {
  const mobileVerificationData = getLS('MOBILE_VERIFICATION_RESPONSE');
  
  if (!mobileVerificationData || !Array.isArray(mobileVerificationData)) {
    return null;
  }

  const accountDataItem = mobileVerificationData.find(item =>
    item.source === "mobile_to_account"
  );

  const accountData = accountDataItem?.response?.data as any;
  
  if (accountData) {
    return {
      bankName: accountData.branchDetails?.bank || "",
      accountNumber: accountData.accountNumber || "",
      ifscCode: accountData.ifsc || "",
      branchName: accountData.branchDetails?.branch || "",
      accountHolderName: accountData.nameAsPerBank || "",
      upiVpa: accountData.upiVpa || ""
    };
  }
  
  return null;
};

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bankAccounts"
  });

  const addBankAccount = () => {

    if (fields.length < maxBankAccounts) {
      append(createDefaultBankAccount());
      setFileNames([...fileNames, ""]);
    } else {
      toastAlert("error", `Maximum ${maxBankAccounts} bank accounts allowed`);
    }
  };

  const removeBankAccount = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      const newFileNames = [...fileNames];
      newFileNames.splice(index, 1);
      setFileNames(newFileNames);
    } else {
      toastAlert("error", "At least one bank account is required");
    }
  };

  // API call to validate account number and IFSC
  const validateBankDetails = async (accountNumber: string, ifscCode: string, index: number) => {
    try {
      setBankValidationLoader((prev: any) => ({ ...prev, [index]: true }));

      const payload = {
        bankAcNo: accountNumber,
        bankAcIfsc: ifscCode,
        mobile: userData?.InvestorRegistration?.reg_mobile,
        bankAcNameInBank: userData?.InvestorRegistration?.name

      };

      const response = await api.post('/cashfree/initiate-bank-account-verification', payload);

      if (response.data.data) {
        // Auto-fill bank details from API response
        const bankData = response.data.data;
        setValue(`bankAccounts.${index}.bank_id`, bankData.bank_id || "");
        setValue(`bankAccounts.${index}.branch`, bankData.branch || "");
        setValue(`bankAccounts.${index}.micr`, bankData.micr || "");

        toastAlert("success", response.data.msg);
      }
    } catch (error) {
      toastAlert("error", "Failed to validate bank details");
    } finally {
      setBankValidationLoader((prev: any) => ({ ...prev, [index]: false }));
    }
  };

  // Check if both account number and IFSC are valid and trigger validation
  const handleBankFieldChange = (index: number) => {
    const accountNumber = watch(`bankAccounts.${index}.account_no`);
    const ifscCode = watch(`bankAccounts.${index}.ifsc`);

    // Check if both fields are filled and valid (basic validation)
    if (accountNumber && ifscCode && accountNumber.length >= 9 && ifscCode.length === 11) {
      // Add a small delay to avoid too many API calls
      setTimeout(() => {
        const currentAccountNumber = watch(`bankAccounts.${index}.account_no`);
        const currentIfscCode = watch(`bankAccounts.${index}.ifsc`);

        // Double check if values are still the same after delay
        if (currentAccountNumber === accountNumber && currentIfscCode === ifscCode) {
          validateBankDetails(accountNumber, ifscCode, index);
        }
      }, 500);
    }
  };

  const updateFileName = (index: number, fileName: string) => {
    const newFileNames = [...fileNames];
    newFileNames[index] = fileName;
    setFileNames(newFileNames);
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
      const res = await api.get(`/kyc/get-bank-info/${id}`);

      if (res.data.data) {
        let dataValue = res.data.data;

        // Check if dataValue is an array (multiple bank accounts) or single object
        if (Array.isArray(dataValue) && dataValue.length > 0) {
          // Handle multiple bank accounts
          const newFileNames: string[] = [];

          // Clear existing fields and add new ones based on fetched data
          // Remove all existing fields first
          for (let i = fields.length - 1; i >= 0; i--) {
            remove(i);
          }

          // Add bank accounts from API response
          dataValue.forEach((bankAccount: any, index: number) => {
            const accountData: any = {
              cancelled_cheque: bankAccount.cancelled_cheque || "",
              account_no: bankAccount.account_no || "",
              account_type: bankAccount.account_type || 0,
              ifsc: bankAccount.ifsc || "",
              bank_id: bankAccount.bank_id || "",
              micr: bankAccount.micr || "",
              branch: bankAccount.branch || "",
              bank_proof: bankAccount.bank_proof || 0,
            };



            append(accountData);
            newFileNames.push(bankAccount.cancelled_cheque || "");
          });

          setFileNames(newFileNames);
        } else if (dataValue && !Array.isArray(dataValue)) {
          // Handle single bank account (backward compatibility)
          setValue("bankAccounts.0.account_no", dataValue.account_no || "");
          setValue("bankAccounts.0.account_type", dataValue.account_type || 0);
          setValue("bankAccounts.0.bank_id", dataValue.bank_id || "");
          setValue("bankAccounts.0.ifsc", dataValue.ifsc || "");
          setValue("bankAccounts.0.micr", dataValue.micr || "");
          setValue("bankAccounts.0.branch", dataValue.branch || "");
          setValue("bankAccounts.0.bank_proof", dataValue.bank_proof || 0);
          setValue("bankAccounts.0.cancelled_cheque", dataValue.cancelled_cheque || "");


          updateFileName(0, dataValue?.cancelled_cheque || "");
        }
        // If no data or empty array, the default bank account from form initialization will remain
      } else {
        // If API call fails or returns no data, ensure we have at least one default bank account
        if (fields.length === 0) {
          append(createDefaultBankAccount());
          setFileNames([""]);
        }
      }

    } catch (error) {
      console.error("Fetch failed:", error);
      handleServerError(error);
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
    const kycStatus = isMember ? memberData?.InvestorRegistration?.isKYCDone : getUser?.InvestorRegistration?.isKYCDone
    const max = kycStatus ? 3 : 1
    setMaxBankAccounts(max)
    const proofList = kycStatus ? listings.bank_proof : listings.bank_proof?.filter((item: any) => item.bank_proof === 'Cheque Copy');
    setBankProofList(proofList)

    // NEW: Extract and set bank details from mobile verification
    const bankDetails = extractBankDetailsFromMobileVerification();
    if (bankDetails) {
      console.log("Extracted Bank Details:", bankDetails);
      
      // Set a timeout to ensure the form is ready and bank list is loaded
      setTimeout(() => {
        // Find the bank in your listings by name
        const foundBank = listings.bank_list?.find((bank: any) => 
          bank.bank_name.toLowerCase().includes(bankDetails.bankName.toLowerCase()) ||
          bankDetails.bankName.toLowerCase().includes(bank.bank_name.toLowerCase())
        );

        if (foundBank) {
          setValue(`bankAccounts.0.bank_id`, foundBank.id);
          console.log("Bank set to:", foundBank.bank_name);
        }

        // Set other bank details
        if (bankDetails.accountNumber) {
          setValue(`bankAccounts.0.account_no`, bankDetails.accountNumber);
        }
        if (bankDetails.ifscCode) {
          setValue(`bankAccounts.0.ifsc`, bankDetails.ifscCode);
        }
        if (bankDetails.branchName) {
          setValue(`bankAccounts.0.branch`, bankDetails.branchName);
        }
      }, 1000);
    }
  }
}, [listings.bank_list]); // Add dependency on bank_list
  const handleAccountType = (accounttype: string, list: any[]) => {
    let selectedType = list.filter(type => type.name.toLowerCase() === accounttype.toLowerCase())
    if (selectedType.length > 0) {
      return selectedType[0].id;
    }
    return ""
  }

  const handleFiveStepKYC = () => {
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

  const handleBackProcess = () => {
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

  const handleEditProcess = () => {
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

  const handleUploadCancelledChequeImage = (e: any, index: number) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        updateFileName(index, '');
        return;
      }
      if (
        file.name.includes("jpg") ||
        file.name.includes("jpeg") ||
        file.name.includes("png") ||
        file.name.includes("pdf")
      ) {

        setValue(`bankAccounts.${index}.cancelled_cheque`, file, { shouldValidate: true });
        updateFileName(index, file.name);
        onScanCheque(index);
      } else {
        updateFileName(index, '');

        return toastAlert(
          "error",
          "Unsupported file type. Please upload a jpg, jpeg, png or pdf file."
        );
      }
    } catch (error) {
      handleServerError(error);
    }
  };
const onScanCheque = async (index: number = 0) => {
  try {
    setScanChequeLoader(true);

    let formData = new FormData();

    let passObj: any = {
      investor_id: userData?.InvestorRegistration?.id,
      request_type: "updateSignZy",
      userToken: singzyData?.id,
      synzyuserId: singzyData?.userId,
    };

    formData.append("formData", JSON.stringify(passObj));
    formData.append("cancelled_cheque", watch(`bankAccounts.${index}.cancelled_cheque`));
    
    let res: any = null;
    
    // Store current values before making API call
    const currentAccountNo = watch(`bankAccounts.${index}.account_no`);
    const currentIfsc = watch(`bankAccounts.${index}.ifsc`);
    const currentBankId = watch(`bankAccounts.${index}.bank_id`);
    const currentBranch = watch(`bankAccounts.${index}.branch`);
    const currentMicr = watch(`bankAccounts.${index}.micr`);
    const currentAccountType = watch(`bankAccounts.${index}.account_type`);

    if (userData?.InvestorRegistration?.isKYCDone) {
      res = await api.post(`/kyc/invester-bankdetails-for-Kyc-done`, formData);
      if (res) {
        let synzy_data = res.data.data;

        // Only update the cheque file name, preserve other fields
        setValue(`bankAccounts.${index}.cancelled_cheque`, synzy_data?.cancelled_cheque);
        updateFileName(index, synzy_data?.cancelled_cheque || "");
        
        // Restore original values
        if (currentAccountNo) {
          setValue(`bankAccounts.${index}.account_no`, currentAccountNo);
        }
        if (currentIfsc) {
          setValue(`bankAccounts.${index}.ifsc`, currentIfsc);
        }
        if (currentBankId) {
          setValue(`bankAccounts.${index}.bank_id`, currentBankId);
        }
        if (currentBranch) {
          setValue(`bankAccounts.${index}.branch`, currentBranch);
        }
        if (currentMicr) {
          setValue(`bankAccounts.${index}.micr`, currentMicr);
        }
        if (currentAccountType) {
          setValue(`bankAccounts.${index}.account_type`, currentAccountType);
        }
      }
    } else {
      res = await api.post(`/kyc/invester-bankdetails`, formData);
      if (res) {
        let synzy_data = res.data.data;

        // For non-KYC done users, update all fields as before
        setValue(`bankAccounts.${index}.account_no`, synzy_data?.account_no);
        setValue(`bankAccounts.${index}.account_type`, handleAccountType(synzy_data?.account_type, accountTypeList));
        setValue(`bankAccounts.${index}.bank_id`, synzy_data?.bank_id);
        setValue(`bankAccounts.${index}.branch`, synzy_data?.branch);
        setValue(`bankAccounts.${index}.cancelled_cheque`, synzy_data?.cancelled_cheque);
        setValue(`bankAccounts.${index}.ifsc`, synzy_data?.ifsc);
        setValue(`bankAccounts.${index}.micr`, synzy_data?.micr);
        updateFileName(index, synzy_data?.cancelled_cheque || "");
      }
    }

    setScanChequeLoader(false);
  } catch (error) {
    updateFileName(index, '');
    setScanChequeLoader(false);
    handleServerError(error);
  }
};

  const onSubmitBankDetail = async (values: any) => {
    try {

      setBankDetailLoader(true);


      let payload: any = {
        request_type: "updateBankDetails",
        investor_id: userData?.InvestorRegistration?.id,
        userToken: singzyData?.id,
        synzyuserId: singzyData?.userId,
        kycStatus: userData?.InvestorRegistration?.isKYCDone,

        bankAccounts: values.bankAccounts
      };



      let updatedPoa = await api.post(`/kyc/invester-bankdetails`, payload);

      if (updatedPoa) {
        setBankDetailLoader(false);
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
        handleFiveStepKYC()
      }
    } catch (error) {
      setBankDetailLoader(false);
      handleServerError(error);
    }
  };


  return (
    <>
      {scanChequeLoader && <FullPageLoader isVisible={scanChequeLoader} message="Processing cheque scan..." />}
      {steps.bank_step ? (
        <>
          <form onSubmit={handleSubmit(onSubmitBankDetail)}>
            <div className="p-4 px-6">
              <div className="mt-2 flex justify-between items-center">
                <CustomText className="text-xl font-montserrat font-semibold">
                  Bank Account Details
                </CustomText>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="mt-6">
                  <div className="flex justify-between sm:justify-start items-center gap-3 mb-4 bg-[#111111] sticky z-10">
                    <CustomText className="text-lg font-semibold">
                      Bank Account {index + 1}
                      {index === 0 && " (Primary)"}
                    </CustomText>
                    {fields.length > 1 && (
                      <CustomButton
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Remove
                      </CustomButton>
                    )}
                  </div>
                 

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
                    <div>
                      <CustomReactSelect
                        items={bankProofList}
                        bindValue="id"
                        bindName="bank_proof"
                        label="Bank Proof"
                        placeholder="Bank Proof"
                        value={watch(`bankAccounts.${index}.bank_proof`)}
                        onChange={(e: any) => {
                          setValue(`bankAccounts.${index}.bank_proof`, e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={(errors.bankAccounts as any)?.[index]?.bank_proof?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label={userData?.InvestorRegistration?.isKYCDone ? `Upload Bank proof` : 'Upload Cancelled Cheque'}
                        required
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e: any) => {
                          handleUploadCancelledChequeImage(e, index);
                        }}
                      />
                      {fileNames[index] && (
                        <div className="flex justify-end">

                          <div className="text-secondary-content">
                            <Link
                              href={`${NODE_API_URL}/static/chequeDoc/${fileNames[index]}`}
                              target="_blank"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )}
                      {(errors.bankAccounts as any)?.[index]?.cancelled_cheque && (
                        <div className="text-red-500 text-sm mt-1">
                          {(errors.bankAccounts as any)[index].cancelled_cheque.message}
                        </div>
                      )}
                    </div>
                    <div>
                      <CustomInput
                        label="Account Number"
                        placeholder="Account Number"
                        required
                        {...register(`bankAccounts.${index}.account_no`, {
                          onChange: () => handleBankFieldChange(index)
                        })}
                        error={(errors.bankAccounts as any)?.[index]?.account_no?.message}
                      />
                    </div>
                    <div className="relative">
                      <CustomInput
                        label="IFSC"
                        placeholder="IFSC"
                        required
                        {...register(`bankAccounts.${index}.ifsc`, {
                          onChange: () => handleBankFieldChange(index)
                        })}
                        error={(errors.bankAccounts as any)?.[index]?.ifsc?.message}
                      />
                      {bankValidationLoader[index] && (
                        <div className="absolute right-3 top-9 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {/* Show additional fields only when KYC is done */}

                    <div>
                      <CustomReactSelect
                        items={accountTypeList}
                        label="Account Type"
                        placeholder="Account Type"
                        bindValue="id"
                        bindName="name"
                        value={watch(`bankAccounts.${index}.account_type`)}
                        onChange={(e: any) => {
                          setValue(`bankAccounts.${index}.account_type`, e.id, {
                            shouldValidate: true,
                          });
                        }}
                        error={(errors.bankAccounts as any)?.[index]?.account_type?.message}
                      />
                    </div>

                    <div>
                      {/* <CustomInput
                        label="Bank Name"
                        placeholder="Bank Name"
                        {...register(`bankAccounts.${index}.bank_id`)}
                        error={(errors.bankAccounts as any)?.[index]?.bank_id?.message}
                      /> */}
                      <div>
                        <CustomReactSelect
                          items={listings.bank_list}
                          label="Select Bank"
                          placeholder="Select Bank"
                          bindValue="id"
                          bindName="bank_name"
                          value={watch(`bankAccounts.${index}.bank_id`)}
                          onChange={(e: any) => {
                            setValue(`bankAccounts.${index}.bank_id`, e.id, {
                              shouldValidate: true,
                            });
                          }}
                          error={(errors.bankAccounts as any)?.[index]?.bank_id?.message}
                        />
                      </div>
                    </div>
                    <div>
                      <CustomInput
                        label="MICR"
                        placeholder="MICR"
                        {...register(`bankAccounts.${index}.micr`)}
                        error={(errors.bankAccounts as any)?.[index]?.micr?.message}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Bank Branch"
                        placeholder="Bank Branch"
                        {...register(`bankAccounts.${index}.branch`)}
                        error={(errors.bankAccounts as any)?.[index]?.branch?.message}
                      />
                    </div>


                  </div>

                  {index < fields.length - 1 && (
                    <div className="border-b border-border mt-6"></div>
                  )}
                </div>
              ))}
            </div>

 <div className="my-6 flex justify-center">
                <CustomButton
                  className="w-32"
                  type="submit"
                  loading={bankDetailLoader}
                >
                  Next
                </CustomButton>
              </div>

           

            <div className="border-b border-border"></div>

            <div className="p-4 flex justify-between">
              <div>
                <CustomButton className="w-32" onClick={handleBackProcess}>
                  Back
                </CustomButton>
              </div>

  {userData?.InvestorRegistration?.isKYCDone && fields.length < maxBankAccounts && (
              <div className="my-6 flex justify-center">
                <CustomButton
                  type="button"
                  onClick={addBankAccount}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  Add More
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
                  <CustomText>Bank Account Detail</CustomText>
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

          <NominationDetail steps={steps} setSteps={setSteps} />
        </>
      )}
    </>
  );
}

export default BankDetail;
