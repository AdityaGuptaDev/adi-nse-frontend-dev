"use client"

import CustomText from '@/commonUI/Text'
import { ADD_MEMBER, MEMBER_DATA, SUMMARYSTEP, USER_DATA } from '@/utils/constants';
import React, { useEffect, useState } from 'react'
import PersonalDetail from './(components)/personal-detail';
import AddressDetail from './(components)/address-detail';
import FATCADetail from './(components)/FATCA-detail';
import BankDetail from './(components)/bank-detail';
import NomineeDetail from './(components)/nominee-detail';
import PersonVerification from './(components)/person-verification';
import api from '@/utils/api';
import { getLS, handleServerError, removeLS, setLS, toastAlert } from '@/utils/helpers';
import FullPageLoader from '@/commonUI/FullPageLoader';
import CustomButton from '@/commonUI/Button';
import { FaArrowLeft, FaArrowRight, FaEdit } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomCheckbox from '@/commonUI/CheckBox';
import SuccessDialog from '@/commonUI/SuccessDialog';
import ErrorDialog from '@/commonUI/ErrorDialog';
import DocumentUploadDialog from '@/commonUI/DocumentUploadDialog';

function QuickSummary() {

    const [openAccordions, setOpenAccordions] = useState<number[]>([1]); // Start with first accordion open
    const [summarydata, setSummaryData] = useState<any>({})
    const [pageLoader, setPageLoader] = useState(false)
    const [isKYCDone, setIsKYCDone] = useState<boolean>(false);
    const [isKYCComplete, setIsKYCComplete] = useState<boolean>(false);
    const [isCanRegistration, setCanRegistration] = useState<boolean>(false);

    const router = useRouter();
    const [submitLoader, setSubmitLoader] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [singzyData, setSingzyData] = useState<any>({});
    const [isMember, setIsMember] = useState(false);
    const [userData, setUserData] = useState<any>("");

    const [open, setOpen] = useState(false)
    const [transactionData, seTransactionData] = useState({})
    const [isError, setIsError] = useState(false);
    const [uploadDialog, setUploadDialog] = useState(false)



    const backtoProfile = () => {
        removeLS(ADD_MEMBER);
        removeLS(MEMBER_DATA);
        router.push('/my-profile');
    };
    const handleEditKYC = async () => {
        let isMember = getLS(ADD_MEMBER);

        if (userData) {
            const payload = {
                investor_id: userData?.InvestorRegistration?.id,
                is_CAN_registered: false,
            }
            const res = await api.post(`/kyc/updateinvestor`, payload);
            if (res.data.data) {
                userData.InvestorRegistration.last_kyc_step = 2;
                userData.InvestorRegistration.is_CAN_registered = false;
                if (isMember) {
                    setLS(MEMBER_DATA, userData);
                } else {
                    setLS(USER_DATA, userData);
                }
                router.push('/initial-KYC');

            }

        }
    };
    const handleFinalSubmit = async () => {

        try {
            const payload: any = {
                investor_id: userData.InvestorRegistration?.id
            };
            setSubmitLoader(true)
            const res = await api.post(`/kyc/CAN-register`, payload);
            const result = res?.data?.data?.canResponse?.CANIndFillEezzResp;
            console.log("Response for Can Registration", res)
            if (result?.RESP_HEADER?.RES_CODE !== "0") {
                console.log(result?.RESP_HEADER?.RES_MSG)
                setIsError(true)

                const _transactionData = {
                    can_id: result?.RESP_BODY?.CAN ?? '',
                    name: userData.InvestorRegistration?.name ?? '',
                    status: result?.RESP_HEADER?.RES_MSG ?? '',
                    code: result?.RESP_HEADER?.RES_CODE ?? ''
                };


                seTransactionData(_transactionData)


            } else {
                /*const _transactionData = {
                    can_id: result?.RESP_BODY?.CAN,
                    name: userData.InvestorRegistration?.name,
                    status: 'Success',

                };
                seTransactionData(_transactionData)
                setOpen(true)*/
                router.push('/can-onboarding')
            }

            if (res?.data?.data) {
                userData.InvestorRegistration = res.data.data.investor_data;
                toastAlert("success", "Your onboarding process has been completed successfully.");

                if (userData?.partner || userData?.RM || userData?.superAdmin) {
                    delete userData.InvestorRegistration
                    setLS(USER_DATA, userData);
                    router.push("/investor-list");

                } else {
                    if (isMember) {
                        removeLS(ADD_MEMBER);
                        removeLS(MEMBER_DATA);
                    } else {
                        setLS(USER_DATA, userData);
                    }
                    setSubmitLoader(false)
                    //router.push('/my-profile')
                }

            }
        } catch (error) {
            setSubmitLoader(false)
            handleServerError(error);
        }

    };

    const handleSubmit = async () => {

        try {
            let payload = {
                userToken: singzyData?.id,
                synzyuserId: singzyData?.userId
            }
            setSubmitLoader(true)
            const res = await api.post(`/kyc/create-contract`, payload);

            const geberatePayload = {
                fileName: res.data.data.object.result.combinedPdf,
                userToken: singzyData?.id,
                synzyuserId: singzyData?.userId
            }

            const result = await api.post(`/kyc/genarate-aadhar`, geberatePayload);
            setSubmitLoader(false)

            let redirect_data = result?.data.data.object.result.url
            if (redirect_data) {
                router.push(redirect_data)
            }
        } catch (error) {
            handleServerError(error);

            setSubmitLoader(false)

        }



    }

    //for can image upload section --reading value of pan -

    let pan = "";

    const user = getLS(USER_DATA);

    pan = user?.InvestorRegistration?.pan_no;




    // Initialize user data and steps on client side
    useEffect(() => {
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
            const getUser = getLS(USER_DATA);
            let isMember = getLS(ADD_MEMBER);
            let memberData = getLS(MEMBER_DATA);

            if (memberData) {
                setIsMember(isMember);
                setUserData(memberData);
            } else {
                setUserData(getUser);
            }
            const kycStatus = isMember ? memberData?.InvestorRegistration?.isKYCDone : getUser?.InvestorRegistration?.isKYCDone;
            setIsKYCDone(kycStatus);
            setIsKYCComplete(isMember ? memberData?.InvestorRegistration?.is_kyc_complete : getUser?.InvestorRegistration?.is_kyc_complete);
            setCanRegistration(isMember ? memberData?.InvestorRegistration?.is_CAN_registered : getUser?.InvestorRegistration?.is_CAN_registered);

            // Update steps based on KYC status
            if (getUser) {
                let signzy_user_name = isMember ? memberData?.InvestorRegistration?.signzy_user_name : getUser?.InvestorRegistration?.signzy_user_name;
                let signzy_kyc_id = isMember ? memberData?.InvestorRegistration?.signzy_kyc_id : getUser?.InvestorRegistration?.signzy_kyc_id;

                if (signzy_user_name) {
                    investorLogin({ signzy_user_name, signzy_kyc_id });
                }

                fetchData(isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id);
            }

        }
    }, []);
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


    // Continue to next accordion (close current, open next)
    const nextTabs = (currentStep: number) => {
        const maxStep = isKYCDone ? 5 : 6; // Max step depends on KYC status

        if (currentStep < maxStep) {
            const nextStep = currentStep + 1;
            setOpenAccordions([nextStep]);
        }
    };

    // Back to previous accordion
    const backTabs = (currentStep: number) => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            setOpenAccordions([prevStep]);
        }
    };

    // Toggle accordion open/close (only one accordion open at a time)
    const toggleAccordion = (stepId: number) => {
        setOpenAccordions(prev => {
            if (prev.includes(stepId)) {
                // If clicking on open accordion, close it
                return [];
            } else {
                // If clicking on closed accordion, close all others and open this one
                return [stepId];
            }
        });
    };

    const fetchData = async (id: any) => {
        setPageLoader(true)
        try {
            const res = await api.get(`/kyc/investor-summary/${id}`);
            let result = res.data.data;
            setSummaryData(result);
            setPageLoader(false)

        } catch (error) {
            handleServerError(error);

            setPageLoader(false)

        }
    };


    const [documents, setDocuments] = useState<Record<string, string | null>>({
        aadhar: 'https://example.com/aadhar.jpg',
        pan_card: null,
        bank_proof: null,
    });

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
    const documentOptions = ['aadhar', 'pan_card', 'bank_proof'];

    const handleFileChange = (docType: string, file: File) => {

        const url = URL.createObjectURL(file);
        setUploadedDocs((prev) => ({ ...prev, [docType]: url }));

    };

    const handleUpload = () => {
        console.log('Submitting docs:', uploadedDocs);
    };
    return (
        <>

            <DocumentUploadDialog
                isOpen={uploadDialog}
                onClose={() => setUploadDialog(false)}
                documentOptions={documentOptions}
                onFileChange={handleFileChange}
                uploadedDocs={uploadedDocs}
                onSubmit={handleUpload}
            />


            <ErrorDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
                title="Failed to create CAN NUMBER"
                message="We couldn't process your request."
                errorDetails={{
                    reason: (transactionData as any)?.status ?? 'No status provided',
                    code: (transactionData as any)?.code ?? '0'
                }}
                note="Please contact admin to create CAN NUMBER"
                buttonText="Close"
            />

            <SuccessDialog

                title="Can Created Successful"
                message='Congratulations'
                note='Thanks for being part of vedant mutual fund'
                data={transactionData}
                isOpen={open}
                onClose={() => {
                    setOpen(false)
                    //setUploadDialog(true)
                    router.push('/can-onboarding')
                }}
            />

            <FullPageLoader
                isVisible={pageLoader}
                message="Loading..."
            />
            <div className="min-h-[calc(100vh-100px)] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="space-y-4">

                        {/* Personal Detail Accordion */}
                        <div className="border border-gray-200 rounded-lg">
                            <div
                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(1) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleAccordion(1)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(1) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        1
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Personal and Proof of Identity</h3>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(1) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openAccordions.includes(1) && (
                                <div className="border-t border-gray-200">
                                    <PersonalDetail nextTabs={() => nextTabs(1)} backTabs={() => backTabs(1)} summarydata={summarydata} />
                                </div>
                            )}
                        </div>

                        {/* Address Detail Accordion */}
                        <div className="border border-gray-200 rounded-lg">
                            <div
                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(2) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleAccordion(2)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(2) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        2                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Proof of Address</h3>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(2) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openAccordions.includes(2) && (
                                <div className="border-t border-gray-200">
                                    <AddressDetail nextTabs={() => nextTabs(2)} backTabs={() => backTabs(2)} summarydata={summarydata} />
                                </div>
                            )}
                        </div>

                        {/* FATCA Detail Accordion */}
                        <div className="border border-gray-200 rounded-lg">
                            <div
                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(3) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleAccordion(3)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(3) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        3
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">FATCA</h3>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(3) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openAccordions.includes(3) && (
                                <div className="border-t border-gray-200">
                                    <FATCADetail nextTabs={() => nextTabs(3)} backTabs={() => backTabs(3)} summarydata={summarydata} />
                                </div>
                            )}
                        </div>

                        {/* Bank Detail Accordion */}
                        <div className="border border-gray-200 rounded-lg">
                            <div
                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(4) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleAccordion(4)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(4) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        4
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Bank Account</h3>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(4) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openAccordions.includes(4) && (
                                <div className="border-t border-gray-200">
                                    <BankDetail nextTabs={() => nextTabs(4)} backTabs={() => backTabs(4)} summarydata={summarydata} />
                                </div>
                            )}
                        </div>

                        {/* Nominee Detail Accordion */}
                        <div className="border border-gray-200 rounded-lg">
                            <div
                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(5) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleAccordion(5)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(5) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        5
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Nominee Detail</h3>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(5) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openAccordions.includes(5) && (
                                <div className="border-t border-gray-200">
                                    <NomineeDetail nextTabs={() => nextTabs(5)} backTabs={() => backTabs(5)} summarydata={summarydata} isKYCDone={isKYCDone} isKYCComplete={isKYCComplete} />
                                </div>
                            )}
                        </div>

                        {/* Person Verification Accordion (only if KYC not done) */}
                        {!isKYCDone && (
                            <div className="border border-gray-200 rounded-lg">
                                <div
                                    className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${openAccordions.includes(6) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    onClick={() => toggleAccordion(6)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${openAccordions.includes(6) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            6
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">Person Verification</h3>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions.includes(6) ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {openAccordions.includes(6) && (
                                    <div className="border-t border-gray-200">
                                        <PersonVerification nextTabs={() => nextTabs(6)} backTabs={() => backTabs(6)} summarydata={summarydata} isKYCComplete={isKYCComplete} />
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div>
                        {!isCanRegistration ? (
                            <>
                                <div className="rounded-lg p-6">
                                    <div className="flex items-start">
                                        <CustomCheckbox
                                            checked={isChecked}

                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setIsChecked(true)
                                                } else {
                                                    setIsChecked(false)
                                                }
                                            }}
                                            label={"I agreed that the details are reviewed and verified."}
                                            className="w-4 h-4 min-w-4 min-h-4 rounded-md border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
                                        />
                                        <div>


                                        </div>
                                    </div>
                                </div>
                                {isKYCDone ? (
                                    <div className="flex items-center justify-end gap-3">
                                        <CustomButton
                                            onClick={() => handleEditKYC()}
                                            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                        >
                                            <FaEdit size={14} />
                                            Edit
                                        </CustomButton>
                                        <CustomButton
                                            onClick={() => {
                                                handleFinalSubmit();
                                                //window.open(`http://localhost:3000/can-image-upload?pan=${pan}`, "_blank");
                                            }}
                                            loading={submitLoader}
                                            disabled={!isChecked}
                                            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-white px-6 py-2.5 font-medium"
                                        >
                                            Submit
                                            <FaArrowRight size={14} />
                                        </CustomButton>
                                    </div>
                                ) : !isKYCComplete ? (
                                    <>

                                        <div className="flex items-center justify-end gap-3">
                                            <CustomButton
                                                onClick={() => handleEditKYC()}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                            >
                                                <FaEdit size={14} />
                                                Edit
                                            </CustomButton>
                                            <CustomButton
                                                onClick={() => handleSubmit()}
                                                loading={submitLoader}
                                                disabled={!isChecked}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-white px-6 py-2.5 font-medium"
                                            >
                                                Complete KYC
                                                <FaArrowRight size={14} />
                                            </CustomButton>
                                        </div>
                                    </>

                                ) : (
                                    <>
                                        <div className="flex items-center mt-2 justify-end gap-3">

                                            <CustomButton
                                                onClick={() => backtoProfile()}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                            >
                                                <FaArrowLeft size={14} />
                                                Back to Profile
                                            </CustomButton>
                                            {
                                                isKYCDone && (
                                                    <CustomButton
                                                        onClick={() => handleEditKYC()}
                                                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                                    >
                                                        <FaEdit size={14} />
                                                        Edit
                                                    </CustomButton>
                                                )
                                            }

                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center mt-2 justify-end gap-3">

                                    <CustomButton
                                        onClick={() => backtoProfile()}
                                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                    >
                                        <FaArrowLeft size={14} />
                                        Back to Profile
                                    </CustomButton>
                                    {
                                        isKYCDone && (
                                            <CustomButton
                                                onClick={() => handleEditKYC()}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-gray-700 border border-gray-300 px-6 py-2.5 font-medium"
                                            >
                                                <FaEdit size={14} />
                                                Edit
                                            </CustomButton>
                                        )
                                    }

                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>

    )
}

export default QuickSummary