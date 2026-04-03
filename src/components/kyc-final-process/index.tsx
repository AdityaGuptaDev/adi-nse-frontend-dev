"use client"

import CustomText from '@/commonUI/Text'
import CustomButton from '@/commonUI/Button'
import { ADD_MEMBER, MEMBER_DATA, NODE_API_URL, SUMMARYSTEP, USER_DATA } from '@/utils/constants';
import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaDownload, FaFileAlt, FaShieldAlt, FaUserCheck } from 'react-icons/fa'

import api from '@/utils/api';
import { getLS, handleServerError, removeLS, setLS, toastAlert } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

function KYCFinalProcess() {
    const [userData, setUserData] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [singzyData, setSingzyData] = useState<any>({});
    const [fileName, setFileName] = useState<any>('')
    const [isMember, setIsMember] = useState(false);
    const [contractErrorDownload, setContractErrorDownload] = useState(false);
    const [submitLoader, setSubmitLoader] = useState(false)

    const router = useRouter();

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
                SaveAaddherPDF(res?.data?.data)
            }
        } catch (error) {
            handleServerError(error);
        }
    };
    const SaveAaddherPDF = async (data: any) => {
        let getUser: any = getLS(USER_DATA);
        let isMember = getLS(ADD_MEMBER);
        let memberData = getLS(MEMBER_DATA);
        setContractErrorDownload(false)
        try {

            let payload = {
                userToken: data?.id,
                investor_id: isMember ? memberData?.InvestorRegistration?.id : getUser?.InvestorRegistration?.id,
                synzyuserId: data?.userId
            }

            const res = await api.post(`/kyc/save_aaddher_PDF`, payload);
            let result = res.data.data.data;
            if (result) {
                setFileName(`${NODE_API_URL}${result.localFile.publicUrl}`)
            }


        } catch (error) {
            setContractErrorDownload(true);
            handleServerError(error);


        }
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            if (fileName) {
                const link = document.createElement('a');
                link.href = fileName; // replace with your URL
                link.download = 'sample.pdf'; //optional file name
                link.target = '_blank';// 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            // Add your download logic here
            // Example: Download KYC documents or certificate


        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        // Add your final submission logic here

        try {
            let payload = {
                userToken: singzyData?.id,
                investor_id: userData?.InvestorRegistration?.id,
                synzyuserId: singzyData?.userId
            }
            const res = await api.post(`/kyc/execute_verification_engine`, payload);
            let result = res.data.data;
            if (result) {
                let invester = result.investor;
                toastAlert("success", res.data.msg);
                if (userData?.partner || userData?.RM || userData?.superAdmin) {
                    delete userData.InvestorRegistration
                    setLS(USER_DATA, userData);
                    router.push("/investor-list");

                } else {
                    if (invester) {

                        userData.InvestorRegistration = invester;
                        if (isMember) {
                            removeLS(MEMBER_DATA);
                            removeLS(ADD_MEMBER);

                        } else {
                            setLS(USER_DATA, userData);
                        }
                    }
                    router.push("/my-profile");
                }


            }
            setIsSubmitting(false);


        } catch (error) {
            // router.push("/kyc-quick-summary");

            handleServerError(error);
            setIsSubmitting(false);



        }


    };
    const createContract = async () => {

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


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Header Section */}


            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">

                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-white rounded-full p-4 shadow-lg">
                                <FaCheckCircle className="text-green-500 text-6xl" />
                            </div>
                        </div>
                        <CustomText className="text-3xl font-bold text-white mb-4">
                            Verification Successful!
                        </CustomText>
                        <CustomText className="text-green-100 text-lg leading-relaxed max-w-2xl mx-auto">
                            Your Aadhaar eSign process has been verified successfully.
                            All your documents have been processed and your KYC is now complete.
                        </CustomText>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 py-12">

                        {/* Verification Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <FaUserCheck className="text-blue-600 text-2xl" />
                                </div>
                                <CustomText className="font-semibold text-gray-900 mb-2">
                                    Identity Verified
                                </CustomText>
                                <CustomText className="text-sm text-gray-600">
                                    Your identity documents have been successfully verified
                                </CustomText>
                            </div>

                            <div className="text-center">
                                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <FaShieldAlt className="text-purple-600 text-2xl" />
                                </div>
                                <CustomText className="font-semibold text-gray-900 mb-2">
                                    Aadhaar eSign
                                </CustomText>
                                <CustomText className="text-sm text-gray-600">
                                    Digital signature process completed successfully
                                </CustomText>
                            </div>

                            <div className="text-center">
                                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <FaFileAlt className="text-green-600 text-2xl" />
                                </div>
                                <CustomText className="font-semibold text-gray-900 mb-2">
                                    Documents Ready
                                </CustomText>
                                <CustomText className="text-sm text-gray-600">
                                    All your KYC documents are processed and ready
                                </CustomText>
                            </div>
                        </div>

                        {/* Success Message */}


                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {contractErrorDownload ? (
                                <>
                                    <CustomButton
                                        onClick={() => createContract()}
                                        loading={submitLoader}
                                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-white px-6 py-2.5 font-medium"
                                    >
                                        Create Contract again
                                    </CustomButton>
                                </>
                            ) : !contractErrorDownload ? (
                                <>
                                    <CustomButton
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
                                    >
                                        <FaDownload className={`text-xl ${isDownloading ? 'animate-bounce' : ''}`} />
                                        {isDownloading ? 'Downloading...' : 'Download Documents'}
                                    </CustomButton>

                                    <CustomButton
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-4 font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
                                    >
                                        <FaCheckCircle className={`text-xl ${isSubmitting ? 'animate-spin' : ''}`} />
                                        {isSubmitting ? 'Submitting...' : 'Final Submit'}
                                    </CustomButton>
                                </>

                            ) : <></>}


                        </div>

                        {/* Additional Information */}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default KYCFinalProcess