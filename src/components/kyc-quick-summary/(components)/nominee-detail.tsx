"use client"

import CustomButton from '@/commonUI/Button'
import CustomText from '@/commonUI/Text'
import React from 'react'
import { FaArrowLeft, FaArrowRight, FaUsers, FaUser, FaChild, FaUserTie, FaEdit } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { getLS, handleServerError, setLS, toastAlert } from '@/utils/helpers'
import { USER_DATA } from '@/utils/constants'
import api from '@/utils/api'

function NomineeDetail({ nextTabs, summarydata, isKYCDone, isKYCComplete }: any) {
  const router = useRouter();



  // Helper function to format nominee type
  const formatNomineeType = (type: any) => {
    if (type === 1 || type === "Major") return "Major";
    if (type === 2 || type === "Minor") return "Minor";
    return type || "N/A";
  };

  // Helper function to calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle both single nominee and multiple nominees
  const nominees = summarydata?.NomineeDetails && Array.isArray(summarydata.NomineeDetails)
    ? summarydata.NomineeDetails
    : summarydata?.NomineeDetail
      ? [summarydata.NomineeDetail]
      : []

  return (
    <div className="">
      {/* Header Section */}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {nominees.length > 0 ? (
            nominees.map((nominee: any, index: number) => {
              const isMinor = formatNomineeType(nominee.nominee_Type) === "Minor";
              const age = calculateAge(nominee.nominee_DOB);

              return (
                <div key={index} className="bg-[#111111] ">

                  {/* Nominee Header */}
                  <div className="bg-[#1F1A1A] px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-[#111111] p-3 rounded-full shadow-md border-2 border-purple-200 mr-4">
                          {isMinor ? (
                            <FaChild className="text-purple-600 text-2xl" />
                          ) : (
                            <FaUser className="text-purple-600 text-2xl" />
                          )}
                        </div>
                        <div>
                          <CustomText className="text-lg font-semibold text-[#F9FAFB]">
                            {nominee?.nominee_name || `Nominee ${index + 1}`}
                          </CustomText>
                          <CustomText className="text-sm text-[#9CA3AF] mt-1">
                            {formatNomineeType(nominee?.nominee_Type)} • {nominee?.relation || 'N/A'} • {nominee?.percentage_allocation || '0'}% Allocation
                          </CustomText>
                        </div>
                      </div>

                      {/* Age Badge */}
                      <div className="flex flex-col items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${isMinor
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                          {isMinor ? 'Minor' : 'Major'}
                        </div>
                        <CustomText className="text-xs text-[#9CA3AF] mt-1">
                          Age: {age} years
                        </CustomText>
                      </div>
                    </div>
                  </div>

                  {/* Nominee Information Grid */}
                  <div className="p-6">
                    <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-6">
                      Personal Information
                    </CustomText>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Full Name
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.nominee_name || 'N/A'}
                        </CustomText>
                      </div>

                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Date of Birth
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {formatDate(nominee?.nominee_DOB)}
                        </CustomText>
                      </div>

                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Relationship
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.NominineeRelationshipType?.relationship || 'N/A'}
                        </CustomText>
                      </div>

                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Identity Type
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.NomineeIdentity?.type || 'N/A'}
                        </CustomText>
                      </div>


                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Identity Number
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.identity_number || 'N/A'}
                        </CustomText>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Mobile Number
                        </CustomText>
                        <CustomText className="viewFieldValue font-mono">
                          {nominee?.mobile_number || 'N/A'}
                        </CustomText>
                      </div>

                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Email Address
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.email_address || 'N/A'}
                        </CustomText>
                      </div>

                      <div className="space-y-2">
                        <CustomText className="viewlabel">
                          Allocation Percentage
                        </CustomText>
                        <CustomText className="viewFieldValue">
                          {nominee?.percentage_allocation || '0'}%
                        </CustomText>
                      </div>
                    </div>

                    {/* Address Information */}
                    {(nominee?.address_line_1 || nominee?.city || nominee?.state) && (
                      <div className="mt-8">
                        <CustomText className="text-lg font-semibold text-[#F9FAFB] mb-6">
                          Address Information
                        </CustomText>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2 lg:col-span-2">
                            <CustomText className="viewlabel">
                              Address Line 1
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.address_line_1 || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Pin Code
                            </CustomText>
                            <CustomText className="viewFieldValue font-mono">
                              {nominee?.pin_code || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              City
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.city || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              State
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.StateMaster?.name || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Country
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.CountryMaster?.name || 'N/A'}
                            </CustomText>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Guardian Information - Only show for minors */}
                    {isMinor && (nominee?.guardian_name || nominee?.guardian_PAN) && (
                      <div className="mt-8">
                        <div className="flex items-center mb-4">
                          <FaUserTie className="text-orange-600 mr-2" />
                          <CustomText className="text-lg font-semibold text-[#F9FAFB]">
                            Guardian Information
                          </CustomText>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Guardian Name
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.guardian_name || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Guardian PAN
                            </CustomText>
                            <CustomText className="viewFieldValue font-mono">
                              {nominee?.guardian_PAN || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Guardian DOB
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {formatDate(nominee?.guardian_DOB)}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Guardian Mobile
                            </CustomText>
                            <CustomText className="viewFieldValue font-mono">
                              {nominee?.guardian_mobile || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Guardian Email
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.guardian_email || 'N/A'}
                            </CustomText>
                          </div>

                          <div className="space-y-2">
                            <CustomText className="viewlabel">
                              Relationship to Nominee
                            </CustomText>
                            <CustomText className="viewFieldValue">
                              {nominee?.NomineeGuardianRelationship?.relationship || 'N/A'}
                            </CustomText>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nominee Status */}

                  </div>
                </div>
              )
            })
          ) : (
            /* No Nominees Found */
            <div className="bg-[#111111] rounded-lg shadow-sm border overflow-hidden">
              <div className="p-12 text-center">
                <FaUsers className="text-[#6B7280] text-6xl mx-auto mb-4" />
                <CustomText className="text-lg font-medium text-[#F9FAFB] mb-2">
                  No Nominees Found
                </CustomText>
                <CustomText className="text-[#9CA3AF]">
                  No nominee information is available in your profile.
                </CustomText>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isKYCDone && (
        <div className="bg-[#111111] ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
            <div className="flex justify-end items-center">



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
      )}
    </div>
  )
}

export default NomineeDetail