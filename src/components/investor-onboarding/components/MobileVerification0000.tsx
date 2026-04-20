import { ArrowLeft, CheckCircle, Loader2, Phone, RefreshCw, Shield, Smartphone } from "lucide-react";


<div className="bg-gradient-to-br from-blue-50/80 via-white/70 to-purple-50/80 backdrop-blur-xl flex items-center justify-center p-8 rounded-3xl shadow-2xl border border-white/30">
    <div>
        <button
            onClick={() => setCurrentScreen('welcome')}
            className="flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] mb-6 transition-colors text-sm font-medium group"
        >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
        </button>

        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#F9FAFB] mb-1">Mobile Verification</h1>
            <p className="text-[#9CA3AF] text-sm">We'll send you a verification code to proceed</p>
        </div>

        <div className="space-y-4">
            {/* Mobile Input Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-[#2A2A2A]">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#F9FAFB]">
                            {otpSent ? 'Verification Code Sent' : 'Enter Mobile Number'}
                        </h3>
                        <p className="text-[#9CA3AF] text-xs">
                            {otpSent
                                ? `Code sent to ${partnerData.phone}`
                                : 'We\'ll send you a verification code'
                            }
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-[#E5E7EB] mb-1">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                                <span className="text-[#9CA3AF] text-sm font-medium mr-1">+91</span>
                                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                            </div>
                            <input
                                type="tel"
                                value={partnerData.phone}
                                onChange={(e) => handlePartnerInputChange('phone', e.target.value)}
                                placeholder="Enter 10-digit number"
                                className="w-full pl-16 pr-4 py-3 text-sm border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all duration-200"
                                maxLength={10}
                                disabled={otpSent}
                            />
                        </div>
                        {partnerData.errors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                                {partnerData.errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Send OTP Button - Shows countdown when OTP sent */}
                    {!otpSent ? (
                        <button
                            onClick={sentOtpForMobileVerification}
                            disabled={!partnerData.phone || partnerData.phone.length !== 10 || otpState.loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {otpState.loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Sending OTP...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Send Verification Code
                                </div>
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-blue-700 text-sm font-medium">OTP Sent Successfully</span>
                            </div>
                            <div className="text-blue-600 text-sm font-semibold">
                                {otpState.timer > 0 ? `${otpState.timer}s` : 'Expired'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* OTP Verification Section - Only shows when OTP is sent */}
            {otpSent && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-md animate-in fade-in duration-500">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <Lock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#F9FAFB]">Enter Verification Code</h3>
                            <p className="text-[#9CA3AF] text-xs">
                                Code sent to <span className="font-semibold">{partnerData.phone}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* OTP Input Boxes */}
                        <div>
                            <label className="block text-xs font-medium text-[#E5E7EB] mb-2 text-center">
                                6-digit Verification Code
                            </label>
                            <div className="flex justify-center space-x-2 mb-3">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            otpInputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        maxLength={1}
                                        onChange={(e) => handleOTPChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        className="w-10 h-11 text-center text-lg font-bold border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-[#111111] shadow-sm"
                                        disabled={otpState.loading || isFetchingUserData}
                                    />
                                ))}
                            </div>
                            {otpState.error && (
                                <p className="text-red-500 text-xs text-center flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                                    {otpState.error}
                                </p>
                            )}
                        </div>

                        {/* Timer and Resend */}
                        <div className="flex items-center justify-between text-xs px-1">
                            <span className="text-[#9CA3AF] flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {otpState.timer > 0 ? `Resend in ${otpState.timer}s` : "Ready to resend"}
                            </span>
                            <button
                                onClick={resendOTP}
                                disabled={!otpState.canResend || otpState.loading}
                                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-[#6B7280] flex items-center transition-colors"
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {otpState.loading ? 'Resending...' : 'Resend Code'}
                            </button>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyAndContinue}
                            disabled={otpState.otp.length !== 6 || otpState.loading || isFetchingUserData}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {otpState.loading || isFetchingUserData ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    {isFetchingUserData ? 'Fetching Your Data...' : 'Verifying Code...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Verify & Continue
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Security Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                    <Shield className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                        <p className="text-xs font-medium text-yellow-800">Security Notice</p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                            Never share your OTP with anyone. Our team will never ask for your verification code.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>