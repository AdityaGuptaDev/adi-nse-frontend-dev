"use client"

import CustomButton from '@/commonUI/Button'
import CustomText from '@/commonUI/Text'
import api from '@/utils/api'
import { NODE_API_URL, SUMMARYSTEP, USER_DATA, publicPathName } from '@/utils/constants'
import { dateFormateValue, getLS, handleServerError } from '@/utils/helpers'
import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

function PersonalDetail({ nextTabs, backTabs, summarydata }: any) {
    const [extractedPAN, setExtractedPAN] = useState<string | null>(null)

    useEffect(() => {
        // Get the PAN from localStorage that was stored during mobile verification
        const storedPAN = getLS('EXTRACTED_PAN_NUMBER')
        if (storedPAN) {
            setExtractedPAN(storedPAN)
        }

        // Alternatively, you can also get it from the mobile verification response
        const mobileVerificationResponse = getLS('MOBILE_VERIFICATION_RESPONSE')
        if (mobileVerificationResponse && Array.isArray(mobileVerificationResponse)) {
            const panFromResponse = extractPANFromResponse(mobileVerificationResponse)
            if (panFromResponse) {
                setExtractedPAN(panFromResponse)
            }
        }
    }, [])

    // Function to extract PAN from mobile verification response
    const extractPANFromResponse = (response: any[]) => {
        if (!response || response.length === 0) {
            return null
        }

        const financialDataItem = response.find(item =>
            item.source === "financial_service_data_pull"
        )

        if (!financialDataItem?.response?.data) {
            return null
        }

        const financialData = financialDataItem.response.data
        const panInfo = financialData.identityInfo?.panNumber

        if (panInfo && panInfo.length > 0) {
            return panInfo[0].idNumber // Return the first PAN number
        }

        return null
    }

    // Determine which PAN to display (priority: extracted PAN > existing PAN from summarydata)
    const displayPAN = extractedPAN || summarydata?.pan_no

    return (
        <div>
            {/* Header Section */}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">

                    {/* PAN Verification Banner */}
                    {extractedPAN && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                               
                            </div>
                        </div>
                    )}

                    {/* Document Image Section */}
                    {summarydata?.pan_doc && (
                        <div className="px-6 py-8">
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-dashed border-blue-200">
                                    <img
                                        src={`${NODE_API_URL}/static/panDoc/${summarydata?.pan_doc}`}
                                        alt="PAN Document"
                                        className="max-w-xs max-h-48 object-contain rounded"
                                    />
                                </div>
                                <CustomText className="text-sm text-gray-600 mt-3 font-medium">
                                    PAN Card Document
                                </CustomText>
                            </div>
                        </div>
                    )}

                    {/* Personal Information Grid */}
                    <div className="p-6">
                        <CustomText className="text-lg font-semibold text-gray-900 mb-6">
                            Personal Information
                        </CustomText>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Row 1 */}
                            <div className="space-y-2 md:col-span-2">
                                <CustomText className="viewlabel">
                                    Full Name
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.name || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    PAN Number
                                </CustomText>
                                <div className="flex items-center gap-2">
                                    <CustomText className="viewFieldValue font-mono">
                                        {displayPAN || 'N/A'}
                                    </CustomText>
                                    {extractedPAN && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Date of Birth
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {dateFormateValue(summarydata?.dob) || 'N/A'}
                                </CustomText>
                            </div>

                            {/* Row 2 */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Gender
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.Gender?.gender || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Marital Status
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.MaritalStatus?.status || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Father's Name
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.fathers_name || 'N/A'}
                                </CustomText>
                            </div>

                            {/* Row 3 */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Mother's Name
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.mothers_name || 'N/A'}
                                </CustomText>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
                    <div className="flex justify-end items-center">
                        <div>
                            <CustomButton
                                onClick={() => nextTabs()}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 font-medium"
                            >
                                Continue
                                <FaArrowRight size={14} />
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PersonalDetail