"use client"

import CustomButton from '@/commonUI/Button'
import CustomText from '@/commonUI/Text'
import React from 'react'
import { FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaHome, FaIdCard } from 'react-icons/fa'
import { NODE_API_URL } from '@/utils/constants'

function AddressDetail({ nextTabs, backTabs, summarydata }: any) {
    console.log(summarydata?.AddressDetail)
    return (
        <div >
            {/* Header Section */}


            {/* Main Content */}
            <div className="max-w-7xl mx-auto ">
                <div className="bg-[#111111] ">

                    {/* Address Header */}
                    {summarydata?.AddressDetail?.address_front_doc && summarydata?.AddressDetail?.address_back_doc && (
                        <div className="px-6 py-6">
                            <div className="flex items-center justify-center">

                                <div className="text-center">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        {/* Front Document */}

                                        <div className="flex flex-col items-center">
                                            <div className="bg-[#111111] p-4 rounded-lg shadow-md border-2 border-dashed border-purple-200 w-full">
                                                <img
                                                    src={`${NODE_API_URL}/static/addressDoc/${summarydata?.AddressDetail?.address_front_doc}`}
                                                    alt="Address Proof Front"
                                                    className="w-full max-h-48 object-contain rounded"
                                                />
                                            </div>
                                            <CustomText className="text-sm text-[#9CA3AF] mt-3 font-medium">
                                                Front Side Document
                                            </CustomText>
                                        </div>



                                        <div className="flex flex-col items-center">
                                            <div className="bg-[#111111] p-4 rounded-lg shadow-md border-2 border-dashed border-purple-200 w-full">
                                                <img
                                                    src={`${NODE_API_URL}/static/addressDoc/${summarydata?.AddressDetail?.address_back_doc}`}
                                                    alt="Address Proof Back"
                                                    className="w-full max-h-48 object-contain rounded"
                                                />
                                            </div>
                                            <CustomText className="text-sm text-[#9CA3AF] mt-3 font-medium">
                                                Back Side Document
                                            </CustomText>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Correspondence Address Aadhaar Documents Section */}
                    {summarydata?.AddressDetail?.corr_aadhaar_front_doc && summarydata?.AddressDetail?.corr_aadhaar_back_doc && !summarydata?.AddressDetail?.same_as_permanent && (
                        <div className="px-6 py-6 border-t border-[#2A2A2A]">
                            <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-4">
                                Correspondence Address - Aadhaar Documents
                            </CustomText>
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        {/* Aadhaar Front Document */}
                                        <div className="flex flex-col items-center">
                                            <div className="bg-[#111111] p-4 rounded-lg shadow-md border-2 border-dashed border-green-200 w-full">
                                                <img
                                                    src={`${NODE_API_URL}/static/aadhaarDoc/${summarydata?.AddressDetail?.corr_aadhaar_front_doc}`}
                                                    alt="Correspondence Aadhaar Front"
                                                    className="w-full max-h-48 object-contain rounded"
                                                />
                                            </div>
                                            <CustomText className="text-sm text-[#9CA3AF] mt-3 font-medium">
                                                Aadhaar Front Side
                                            </CustomText>
                                        </div>

                                        {/* Aadhaar Back Document */}
                                        <div className="flex flex-col items-center">
                                            <div className="bg-[#111111] p-4 rounded-lg shadow-md border-2 border-dashed border-green-200 w-full">
                                                <img
                                                    src={`${NODE_API_URL}/static/aadhaarDoc/${summarydata?.AddressDetail?.corr_aadhaar_back_doc}`}
                                                    alt="Correspondence Aadhaar Back"
                                                    className="w-full max-h-48 object-contain rounded"
                                                />
                                            </div>
                                            <CustomText className="text-sm text-[#9CA3AF] mt-3 font-medium">
                                                Aadhaar Back Side
                                            </CustomText>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address Documents Section */}


                    {/* Address Information Grid */}
                    <div className="p-6">
                        <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-6">
                            Permanent Address Information
                        </CustomText>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Address Lines */}
                            <div className="space-y-2 lg:col-span-3">
                                <CustomText className="viewlabel">
                                    Address Line 1
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.address1 || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Address Type
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.AddressType?.address_type || 'N/A'}
                                </CustomText>
                            </div>

                            {/* Address Line 2 */}
                            <div className="space-y-2 lg:col-span-3">
                                <CustomText className="viewlabel">
                                    Address Line 2
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.address2 || 'N/A'}
                                </CustomText>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    City
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.city || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    District
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.district || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Pincode
                                </CustomText>
                                <CustomText className="viewFieldValue font-mono">
                                    {summarydata?.AddressDetail?.pincode || 'N/A'}
                                </CustomText>
                            </div>

                            {/* State and Country */}
                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    State
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.StateMaster?.name || 'N/A'}
                                </CustomText>
                            </div>

                            <div className="space-y-2">
                                <CustomText className="viewlabel">
                                    Country
                                </CustomText>
                                <CustomText className="viewFieldValue">
                                    {summarydata?.AddressDetail?.CountryMaster?.name || 'N/A'}
                                </CustomText>
                            </div>
                        </div>

                        {/* Complete Permanent Address Display */}
                        <div className="mt-8 p-4 bg-blue-20 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                                <FaHome className="text-secondary text-xl mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <CustomText className="text-sm font-medium text-secondary mb-2">
                                        Complete Permanent Address
                                    </CustomText>
                                    <CustomText className="text-sm text-white leading-relaxed">
                                        {summarydata?.AddressDetail?.address1}
                                    </CustomText>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Correspondence Address Section */}
                    {summarydata?.AddressDetail && !summarydata?.AddressDetail?.same_as_permanent && (
                        <div className="p-6 border-t border-[#2A2A2A]">
                            <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-6">
                                Correspondence Address Information
                            </CustomText>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Correspondence Address Lines */}
                                <div className="space-y-2 lg:col-span-3">
                                    <CustomText className="viewlabel">
                                        Correspondence Address Line 1
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.corr_address1 || 'N/A'}
                                    </CustomText>
                                </div>

                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence Address Type
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.CorrAddressType?.address_type || 'N/A'}
                                    </CustomText>
                                </div>

                                {/* Correspondence Address Line 2 */}
                                <div className="space-y-2 lg:col-span-3">
                                    <CustomText className="viewlabel">
                                        Correspondence Address Line 2
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.corr_address2 || 'N/A'}
                                    </CustomText>
                                </div>

                                {/* Correspondence Location Details */}
                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence City
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.corr_city || 'N/A'}
                                    </CustomText>
                                </div>

                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence District
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.corr_district || 'N/A'}
                                    </CustomText>
                                </div>

                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence Pincode
                                    </CustomText>
                                    <CustomText className="viewFieldValue font-mono">
                                        {summarydata?.AddressDetail?.corr_pincode || 'N/A'}
                                    </CustomText>
                                </div>

                                {/* Correspondence State and Country */}
                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence State
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.CorrState?.name || 'N/A'}
                                    </CustomText>
                                </div>

                                <div className="space-y-2">
                                    <CustomText className="viewlabel">
                                        Correspondence Country
                                    </CustomText>
                                    <CustomText className="viewFieldValue">
                                        {summarydata?.AddressDetail?.CorrCountry?.name || 'N/A'}
                                    </CustomText>
                                </div>
                            </div>

                            {/* Complete Correspondence Address Display */}
                            <div className="mt-8 p-4 bg-green-20 rounded-lg border border-green-200">
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-secondary text-xl mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <CustomText className="text-sm font-medium text-secondary mb-2">
                                            Complete Correspondence Address
                                        </CustomText>
                                        <CustomText className="text-sm text-black leading-relaxed">
                                            {summarydata?.AddressDetail?.corr_address1}
                                        </CustomText>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Same as Permanent Address Notice */}
                    {summarydata?.AddressDetail?.same_as_permanent && (
                        <div className="p-6 border-t border-[#2A2A2A]">
                            <div className="p-4  rounded-lg border border-blue-200">
                                <div className="flex items-center">
                                    <FaIdCard className="text-secondary text-xl mr-3 flex-shrink-0" />
                                    <div>
                                        <CustomText className="text-sm font-medium text-secondary mb-1">
                                            Correspondence Address
                                        </CustomText>
                                        <CustomText className="text-sm text-[#E5E7EB]">
                                            Same as Permanent Address
                                        </CustomText>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#111111] ">
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

export default AddressDetail