"use client";

import CustomButton from '@/commonUI/Button';
import FullPageLoader from '@/commonUI/FullPageLoader';
import CustomText from '@/commonUI/Text';
import InvestorPopup from '@/components/fund-explore/investor';
import PurchaseDetailPopup from '@/components/fund-explore/purchaseDetail';
import SipPopup from '@/components/fund-explore/sipDetail';
import AccountContext from '@/context/AccountContext/Account.context';
import api from '@/utils/api';
import { schemeColors, USER_DATA } from '@/utils/constants';
import { convertDate, convertNumberIndian, FUND_STATUS_COLOR, getLS, handleServerError, RISK_COLOR, toastAlert } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { FaAngleRight, FaCalendar, FaGift, FaInfo } from 'react-icons/fa6';
import { GrTransaction } from 'react-icons/gr';
import { IoCartOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

function NewFundOffers({ data }: any) {
    const router = useRouter();
    const [navigateLoader, setNavigateLoader] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState<any>(null);
    const [showInvestorPopup, setShowInvestorPopup] = useState(false);
    const [showSipPopup, setShowSipPopup] = useState(false);
    const { setCartCounter, cartCounter } = useContext<any>(AccountContext);

    const topFund = data?.length > 0 ? data : [];

    const onChangeViewAll = () => {
        setNavigateLoader(true);
        router.push(`/new-fund-offer-list`);
        setNavigateLoader(false);
    };

    const handleNavigateFundDetail = (item: any) => {
        setNavigateLoader(true);
        router.push(`/fund-detail?id=${item?.id}&tab=NAV`);
        setNavigateLoader(false);
    };

    const addToCart = async (schemeId: number) => {
        try {
            const userData: any = getLS(USER_DATA);
            let CartObj = {
                user_id: Number(userData?.id),
                investor_id: Number(userData?.InvestorRegistration?.id),
                account_holding_id: 0,
                cart_type: 1,
                scheme_id: schemeId,
                trans_type: 1,
            };

            let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
            if (addCartData.data.data) {
                toastAlert("success", "Added To Cart");
                setCartCounter(cartCounter + 1);
            } else {
                toastAlert("info", "Unable to add in cart, please try again later!");
            }
        } catch (error) {
            handleServerError(error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            'Open': 'bg-green-100 text-green-800',
            'Closed': 'bg-red-100 text-red-800',
            'Upcoming': 'bg-blue-100 text-blue-800',
            'Active': 'bg-emerald-100 text-emerald-800',
            'Completed': 'bg-gray-100 text-gray-800'
        };
        
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Mock investor data for InvestorPopup
    const mockInvestorData = [
        {
            id: 1,
            name: 'Primary Investor',
            pan: 'ABCDE1234F',
            relationship: 'Self'
        },
        {
            id: 2,
            name: 'Joint Investor',
            pan: 'FGHIJ5678K',
            relationship: 'Joint'
        }
    ];

    return (
        <>
            <FullPageLoader isVisible={navigateLoader} message="Processing..." />
            
            <div className="bg-white p-4 md:p-5 rounded-xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        {/* Main Header */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 rounded-xl shadow-sm"
                            >
                                <FaGift className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                                <CustomText className="text-xl font-bold text-gray-900">
                                    New Fund Offers (NFO)
                                </CustomText>
                                <CustomText className="text-sm text-gray-600">
                                    Latest mutual fund launches and opportunities
                                </CustomText>
                            </div>
                        </div>

                        {/* View All Button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="md:self-start"
                        >
                            <CustomButton
                                className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                onClick={onChangeViewAll}
                            >
                                <span className="flex items-center gap-1.5">
                                    View All
                                    <FaAngleRight className="h-3.5 w-3.5" />
                                </span>
                            </CustomButton>
                        </motion.div>
                    </div>

                    {/* Info Bar */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <FaInfo className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <CustomText className="text-xs text-emerald-700">
                                New Fund Offers are mutual fund schemes launched for the first time. Invest early for potential benefits.
                            </CustomText>
                        </div>
                    </div>
                </div>

                {/* NFO Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topFund.length > 0 ? (
                        topFund.slice(0, 4).map((fund: any, index: number) => (
                            <motion.div
                                key={fund.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-emerald-300 transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-4">
                                    {/* Fund Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className={`relative p-2.5 rounded-lg ${schemeColors[index % schemeColors.length]?.bg || 'bg-emerald-500'} cursor-pointer`}
                                                onClick={() => handleNavigateFundDetail(fund)}
                                            >
                                                <div className="text-white font-bold text-base w-6 h-6 flex items-center justify-center">
                                                    {fund.name?.charAt(0) || 'N'}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(fund.fundStatus)}`}>
                                                    {fund.fundStatus || 'Active'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fund Name */}
                                    <CustomText 
                                        className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-3 cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleNavigateFundDetail(fund)}
                                    >
                                        {fund.name || 'New Fund Offer'}
                                    </CustomText>

                                    {/* NFO Period */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FaCalendar className="h-3.5 w-3.5 text-gray-500" />
                                            <CustomText className="text-xs font-medium text-gray-700">
                                                NFO Period
                                            </CustomText>
                                        </div>
                                        <CustomText className="text-sm font-semibold text-gray-900">
                                            {convertDate(fund.nfo_start_date, fund.nfo_end_date) || 'Not specified'}
                                        </CustomText>
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <CustomText className="text-xs text-gray-500 mb-0.5">
                                                Min. Investment
                                            </CustomText>
                                            <CustomText className="text-sm font-semibold text-gray-900">
                                                ₹{fund.min_amount ? convertNumberIndian(fund.min_amount) : "5,000"}
                                            </CustomText>
                                        </div>
                                        <div className="text-right">
                                            <CustomText className="text-xs text-gray-500 mb-0.5">
                                                Risk Level
                                            </CustomText>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLOR(fund.riskLevel || 'Medium')}`}>
                                                {fund.riskLevel || 'Medium'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setSelectedScheme(fund);
                                                setShowInvestorPopup(true);
                                            }}
                                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
                                        >
                                            <GrTransaction className="h-3.5 w-3.5" />
                                            Transact
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => addToCart(fund?.id)}
                                            className="px-3 border border-emerald-600 text-emerald-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                                        >
                                            <IoCartOutline className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="text-center py-12">
                                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                    <FaGift className="h-8 w-8 text-gray-400" />
                                </div>
                                <CustomText className="text-base text-gray-600 mb-2">
                                    No New Fund Offers available
                                </CustomText>
                                <CustomText className="text-sm text-gray-500">
                                    Check back later for new fund launches
                                </CustomText>
                            </div>
                        </div>
                    )}
                </div>

                {/* NFO Status Guide */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <CustomText className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaInfo className="h-3.5 w-3.5 text-emerald-600" />
                        NFO Status Guide:
                    </CustomText>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <CustomText className="text-gray-600">Open - Available for investment</CustomText>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <CustomText className="text-gray-600">Upcoming - Launching soon</CustomText>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <CustomText className="text-gray-600">Closed - Subscription ended</CustomText>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Components */}
            <PurchaseDetailPopup
                modalId="purchaseDetailModal"
                showTriggerButton={false}
                schemeData={selectedScheme}
            />

            {showSipPopup && selectedScheme && (
                <SipPopup
                    schemeData={selectedScheme}
                    open={showSipPopup}
                    onClose={() => setShowSipPopup(false)}
                />
            )}

            {showInvestorPopup && selectedScheme && (
                <InvestorPopup
                    schemeData={selectedScheme}
                    investor={mockInvestorData} // Added investor prop
                    open={showInvestorPopup}
                    onClose={() => setShowInvestorPopup(false)}
                />
            )}
        </>
    );
}

export default NewFundOffers;