"use client"

import CustomButton from '@/commonUI/Button'
import CustomText from '@/commonUI/Text'
import { accountTypeList, NODE_API_URL } from '@/utils/constants'
import React from 'react'
import { FaArrowLeft, FaArrowRight, FaUniversity, FaCreditCard } from 'react-icons/fa'

function BankDetail({ nextTabs, summarydata }: any) {
    const showAccountType = (account_type: number) => {
        const findAccountType = accountTypeList.find((item: any) => item.id == account_type)
        return findAccountType?.name || 'N/A'
    }

    // Handle both single bank account (BankAccountDetail) and multiple bank accounts (BankAccountDetails array)
    const bankAccounts = summarydata?.BankAccountDetails && Array.isArray(summarydata.BankAccountDetails)
        ? summarydata.BankAccountDetails
        : summarydata?.BankAccountDetail
            ? [summarydata.BankAccountDetail]
            : []
    return (
        <div >


            {/* Main Content */}
            <div className="max-w-7xl mx-auto ">
                <div className="space-y-6">
                    <div className="px-6 pt-6">
                        <CustomText className="text-lg font-semibold text-gray-900 mb-6">
                            Account Information
                        </CustomText>
                    </div>
                    {bankAccounts.length > 0 ? (
                        bankAccounts.map((bankAccount: any, index: number) => (
                            <div key={index} className={`bg-white ${index >= 1 ? 'border-t border-secondary/20' : ''}`}>

                                {/* Bank Account Header */}
                                <div className=" from-blue-50 to-indigo-50 px-6 py-2 ">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="bg-white p-3 rounded-full shadow-md border-2 border-blue-200 mr-4">
                                                <FaUniversity className="text-blue-600 text-2xl" />
                                            </div>
                                            <div>
                                                <CustomText className="text-lg font-semibold text-gray-900">
                                                    {bankAccount?.bank_name || 'Bank Account'}
                                                </CustomText>
                                                <CustomText className="text-sm text-gray-600 mt-1">
                                                    Account #{index + 1} • {showAccountType(bankAccount?.account_type)}
                                                </CustomText>
                                            </div>
                                        </div>

                                        {/* Cancelled Cheque Image */}
                                        {bankAccount?.cancelled_cheque && (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-white p-3 rounded-lg shadow-md border-2 border-dashed border-green-200 mt-2">
                                                    <img
                                                        src={`${NODE_API_URL}/static/chequeDoc/${bankAccount.cancelled_cheque}`}
                                                        alt="Cancelled Cheque"
                                                        className="w-32 h-20 object-contain rounded"
                                                    />
                                                </div>
                                                <CustomText className="text-xs text-gray-600 mt-2 font-medium">
                                                    Cancelled Cheque
                                                </CustomText>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bank Account Information Grid */}
                                <div className="px-6 pb-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Account Number */}
                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                Account Number
                                            </CustomText>
                                            <CustomText className="viewFieldValue font-mono">
                                                {bankAccount?.account_no || 'N/A'}
                                            </CustomText>
                                        </div>

                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                Account Type
                                            </CustomText>
                                            <CustomText className="viewFieldValue">
                                                {showAccountType(bankAccount?.account_type)}
                                            </CustomText>
                                        </div>

                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                Bank Name
                                            </CustomText>
                                            <CustomText className="viewFieldValue">
                                                {bankAccount?.BankMaster?.bank_name || 'N/A'}
                                            </CustomText>
                                        </div>

                                        {/* IFSC and MICR */}
                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                IFSC Code
                                            </CustomText>
                                            <CustomText className="viewFieldValue font-mono">
                                                {bankAccount?.ifsc || 'N/A'}
                                            </CustomText>
                                        </div>

                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                MICR Code
                                            </CustomText>
                                            <CustomText className="viewFieldValue font-mono">
                                                {bankAccount?.micr || 'N/A'}
                                            </CustomText>
                                        </div>

                                        <div className="space-y-2">
                                            <CustomText className="viewlabel">
                                                Branch
                                            </CustomText>
                                            <CustomText className="viewFieldValue">
                                                {bankAccount?.branch || 'N/A'}
                                            </CustomText>
                                        </div>
                                    </div>

                                    {/* Bank Verification Status */}

                                </div>
                            </div>
                        ))
                    ) : (
                        /* No Bank Accounts Found */
                        <div className="bg-white ">
                            <div className="p-12 text-center">
                                <FaUniversity className="text-gray-400 text-6xl mx-auto mb-4" />
                                <CustomText className="text-lg font-medium text-gray-900 mb-2">
                                    No Bank Accounts Found
                                </CustomText>
                                <CustomText className="text-gray-600">
                                    No bank account information is available in your profile.
                                </CustomText>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white ">
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

export default BankDetail