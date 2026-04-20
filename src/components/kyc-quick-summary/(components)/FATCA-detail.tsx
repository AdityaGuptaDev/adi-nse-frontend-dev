"use client"

import CustomButton from '@/commonUI/Button'
import CustomText from '@/commonUI/Text'
import React from 'react'
import { FaArrowLeft, FaArrowRight, FaGlobe, FaUserTie, FaFlag } from 'react-icons/fa'

function FATCADetail({ nextTabs, summarydata }: any) {

    // Helper function to format Yes/No values
    const formatYesNo = (value: string) => {
        if (value === 'yes') return 'Yes';
        if (value === 'no') return 'No';
        if (value === 'related') return 'Related to PEP';
        return value || 'N/A';
    };

    return (
        <div >


            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#111111]">

                    {/* FATCA Header */}


                    {/* FATCA Information Grid */}
                    <div className="p-6">
                        <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-6">
                            Declaration Details
                        </CustomText>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Citizenship Information */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Indian Citizen
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {formatYesNo(summarydata?.InvestorDeclaration?.is_indian_citizen)}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Indian Taxpayer Only
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {formatYesNo(summarydata?.InvestorDeclaration?.is_indian_taxpayer)}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Politically Exposed Person
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {formatYesNo(summarydata?.InvestorDeclaration?.is_politically_exposed)}
                                </CustomText>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Country of Birth
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.InvestorDeclaration?.ContryOfBirth?.name || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Place of Birth
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.InvestorDeclaration?.POB || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Occupation
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.InvestorDeclaration?.OccupationMaster?.occupation || 'N/A'}
                                </CustomText>
                            </div>

                            {/* Financial Information */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Income Source
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.InvestorDeclaration?.IncomeSource?.source_name || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Annual Income Slab
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.InvestorDeclaration?.AnnuaIincomeMaster?.income_range || 'N/A'}
                                </CustomText>
                            </div>
                        </div>

                        {/* Foreign Address Section - Only show if not Indian taxpayer */}
                        {summarydata?.InvestorDeclaration?.is_indian_taxpayer === 'no' && (
                            <div className="mt-8">
                                <div className="flex items-center mb-4">
                                    <FaFlag className="text-orange-600 mr-2" />
                                    <CustomText className="text-lg font-semibold text-[#F9FAFB]">
                                        Foreign Address Information
                                    </CustomText>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="space-y-2">
                                        <CustomText className="viewlabel">
                                            Citizenship Country
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.CitizenshipCountry?.name || 'N/A'}
                                        </CustomText>
                                    </div>

                                    <div className="space-y-2 lg:col-span-2">
                                        <CustomText className="viewlabel">
                                            Foreign Address
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.foreign_address || 'N/A'}
                                        </CustomText>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomText className="viewlabel">
                                            Foreign City
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.foreign_city || 'N/A'}
                                        </CustomText>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomText className="viewlabel">
                                            Foreign District
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.foreign_district || 'N/A'}
                                        </CustomText>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomText className="viewlabel">
                                            Foreign State
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.StateMaster?.name || 'N/A'}
                                        </CustomText>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomText className="viewlabel">
                                            Foreign Country
                                        </CustomText>
                                        <CustomText className="text-base font-medium text-[#F9FAFB] bg-[#111111] px-3 py-2 rounded-md">
                                            {summarydata?.InvestorDeclaration?.ContryOfBirth?.name || 'N/A'}
                                        </CustomText>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Compliance Summary */}

                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#111111]">
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

export default FATCADetail