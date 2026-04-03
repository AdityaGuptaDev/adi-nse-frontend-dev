"use client";

import React from "react";
import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import { publicPathName } from "@/utils/constants";
import { useRouter } from "next/navigation";

function LandingPage() {
  const router = useRouter();

  const handleBecomeInvestor = () => {
    router.push("/investorOnboarding");
  };
 const login = () => {
    router.push("/login");
  };

  const handleBecomePartner = () => {
    router.push("/partnerOnboarding");
  };

  const handleBecomeBC = () => {
    router.push("/bcOnboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1 flex justify-center">
            <img
              src={`${publicPathName}/logo_light.png`}
              alt="Vedant Asset"
              className="h-12 sm:h-16"
            />
          </div>
          <div className="absolute right-4 sm:right-6 lg:right-8">
            <CustomButton
              onClick={login}
              className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </CustomButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <CustomText className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{" "}
              <span className="text-primary">Vedant Asset</span>
            </CustomText>
            <CustomText className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your trusted partner in wealth management and investment solutions.
              Choose your path to financial success.
            </CustomText>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch mb-16">
            {/* Become an Investor Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full lg:w-80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <CustomText className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Become an Investor
                </CustomText>
                <CustomText className="text-gray-600 mb-6 text-center leading-relaxed">
                  Start your investment journey with our comprehensive portfolio management, expert guidance, and personalized financial planning.
                </CustomText>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Professional Portfolio Management
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Goal-Based Investment Planning
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Real-time Market Insights
                  </li>
                </ul>
              </div>
              <CustomButton
                onClick={handleBecomeInvestor}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Investing Today
              </CustomButton>
            </div>

            {/* Become a Partner Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full lg:w-80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <CustomText className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Become a Partner
                </CustomText>
                <CustomText className="text-gray-600 mb-6 text-center leading-relaxed">
                  Join our network of financial advisors and grow your business with our comprehensive platform, tools, and dedicated support.
                </CustomText>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced Partner Dashboard
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Commission Tracking & Reports
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Marketing & Training Support
                  </li>
                </ul>
              </div>
              <CustomButton
                onClick={handleBecomePartner}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Join Our Network
              </CustomButton>
            </div>

            {/* Become a BC Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full lg:w-80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <CustomText className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Become a BC
                </CustomText>
                <CustomText className="text-gray-600 mb-6 text-center leading-relaxed">
                  Join as a Business Correspondent and extend financial services to underserved areas with our robust platform.
                </CustomText>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Lucrative Commission Structure
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mobile Banking Solutions
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Dedicated BC Support Team
                  </li>
                </ul>
              </div>
              <CustomButton
                onClick={handleBecomeBC}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Join Our Network
              </CustomButton>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <CustomText className="text-3xl font-bold text-primary mb-2">10K+</CustomText>
                <CustomText className="text-gray-600 text-sm">Happy Investors</CustomText>
              </div>
              <div className="text-center">
                <CustomText className="text-3xl font-bold text-primary mb-2">₹500Cr+</CustomText>
                <CustomText className="text-gray-600 text-sm">Assets Under Management</CustomText>
              </div>
              <div className="text-center">
                <CustomText className="text-3xl font-bold text-secondary mb-2">200+</CustomText>
                <CustomText className="text-gray-600 text-sm">Partner Network</CustomText>
              </div>
              <div className="text-center">
                <CustomText className="text-3xl font-bold text-orange-500 mb-2">50+</CustomText>
                <CustomText className="text-gray-600 text-sm">BC Partners</CustomText>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CustomText className="text-xl font-semibold text-gray-900 mb-3">
                Trusted Platform
              </CustomText>
              <CustomText className="text-gray-600 leading-relaxed">
                Secure and reliable investment platform with regulatory compliance and advanced security measures
              </CustomText>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CustomText className="text-xl font-semibold text-gray-900 mb-3">
                Expert Guidance
              </CustomText>
              <CustomText className="text-gray-600 leading-relaxed">
                Professional advice from certified financial experts with years of market experience
              </CustomText>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <CustomText className="text-xl font-semibold text-gray-900 mb-3">
                Comprehensive Solutions
              </CustomText>
              <CustomText className="text-gray-600 leading-relaxed">
                Complete range of investment and wealth management services tailored to your needs
              </CustomText>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <CustomText className="text-gray-500">
            © 2025 Vedant Asset. All rights reserved.
          </CustomText>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;