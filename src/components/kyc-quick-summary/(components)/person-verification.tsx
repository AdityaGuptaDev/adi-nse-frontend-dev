"use client"

import CustomText from '@/commonUI/Text'
import { NODE_API_URL } from '@/utils/constants'
import { FaCamera, FaCheckCircle, FaPlayCircle, FaSignature, FaVideo } from 'react-icons/fa'

function PersonVerification({ summarydata }: any) {


    return (
        <div >
            {/* Header Section */}
         

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">

                    {/* Verification Documents Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Signature Section */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="px-6 py-4 ">
                                <div className="flex items-center">
                                    <div className="bg-white p-2 rounded-full shadow-md border-2 border-green-200 mr-3">
                                        <FaSignature className="text-green-600 text-lg" />
                                    </div>
                                    <div>
                                        <CustomText className="text-lg font-semibold text-gray-900">
                                            Digital Signature
                                        </CustomText>
                                        <CustomText className="text-sm text-gray-600">
                                            Your verified signature
                                        </CustomText>
                                    </div>
                                </div>
                            </div>

                            <div >
                                <div className="flex justify-center items-center rounded-lg p-6">
                                    {summarydata?.PersonalDocument?.signature ? (
                                        <div className="text-center">
                                            <img
                                                src={`${NODE_API_URL}/static/signature/${summarydata?.PersonalDocument?.signature}`}
                                                alt="Digital Signature"
                                                className="max-w-xs max-h-32 object-contain mx-auto rounded border"
                                            />
                                            <div className="flex items-center justify-center mt-3">
                                                <FaCheckCircle className="text-green-500 mr-2" />
                                                <CustomText className="text-sm text-green-600 font-medium">
                                                    Signature Verified
                                                </CustomText>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <FaSignature className="text-4xl mx-auto mb-2 text-gray-400" />
                                            <CustomText className="text-sm">No signature available</CustomText>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Photo Section */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="bg-white p-2 rounded-full shadow-md border-2 border-blue-200 mr-3">
                                        <FaCamera className="text-blue-600 text-lg" />
                                    </div>
                                    <div>
                                        <CustomText className="text-lg font-semibold text-gray-900">
                                            Profile Photo
                                        </CustomText>
                                        <CustomText className="text-sm text-gray-600">
                                            Your verified photo
                                        </CustomText>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-center items-center rounded-lg p-6">
                                    {summarydata?.PersonalDocument?.photo ? (
                                        <div className="text-center">
                                            <img
                                                src={`${NODE_API_URL}/static/photo/${summarydata?.PersonalDocument?.photo}`}
                                                alt="Profile Photo"
                                                className="w-32 h-32 object-cover mx-auto border-4 border-white shadow-lg"
                                            />
                                            <div className="flex items-center justify-center mt-3">
                                                <FaCheckCircle className="text-green-500 mr-2" />
                                                <CustomText className="text-sm text-green-600 font-medium">
                                                    Photo Verified
                                                </CustomText>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <FaCamera className="text-4xl mx-auto mb-2 text-gray-400" />
                                            <CustomText className="text-sm">No photo available</CustomText>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Verification Section */}
                    {summarydata?.PersonalDocument?.self_video && (
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
                                <div className="flex items-center">
                                    <div className="bg-white p-2 rounded-full shadow-md border-2 border-purple-200 mr-3">
                                        <FaVideo className="text-purple-600 text-lg" />
                                    </div>
                                    <div>
                                        <CustomText className="text-lg font-semibold text-gray-900">
                                            Video Verification
                                        </CustomText>
                                        <CustomText className="text-sm text-gray-600">
                                            Your identity verification video
                                        </CustomText>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                                    {summarydata?.PersonalDocument?.self_video ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="relative bg-black rounded-lg overflow-hidden">
                                                <video
                                                    width="100%"
                                                    height="240"
                                                    controls
                                                    className="rounded-lg"
                                                    poster="/api/placeholder/400/240"
                                                >
                                                    <source
                                                        src={`${NODE_API_URL}/static/video/${summarydata?.PersonalDocument?.self_video}`}
                                                        type="video/webm"
                                                    />
                                                    <source
                                                        src={`${NODE_API_URL}/static/video/${summarydata?.PersonalDocument?.self_video}`}
                                                        type="video/mp4"
                                                    />
                                                    Your browser does not support the video tag.
                                                </video>
                                                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                                                    <FaCheckCircle className="mr-1" />
                                                    Verified
                                                </div>
                                            </div>
                                            <div className="text-center mt-4">
                                                <CustomText className="text-sm text-gray-600">
                                                    Video verification completed successfully
                                                </CustomText>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            <FaPlayCircle className="text-6xl mx-auto mb-4 text-gray-400" />
                                            <CustomText className="text-lg font-medium text-gray-900 mb-2">
                                                No Video Available
                                            </CustomText>
                                            <CustomText className="text-sm text-gray-600">
                                                Video verification has not been completed yet
                                            </CustomText>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                    }


                </div>
            </div>


        </div>
    )
}

export default PersonVerification