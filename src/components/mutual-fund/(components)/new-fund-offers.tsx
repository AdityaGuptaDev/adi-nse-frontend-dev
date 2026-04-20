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

// Golden Black Theme Constants
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textWhite: "#FFFFFF",
  textGray: "#9CA3AF",
  textLight: "#E5E5E5",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

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

    const getStatusBadgeStyle = (status: string): React.CSSProperties => {
        const statusStyles: Record<string, React.CSSProperties> = {
            'Open': { background: `${theme.success}20`, color: theme.success },
            'Closed': { background: `${theme.danger}20`, color: theme.danger },
            'Upcoming': { background: `${theme.primary}20`, color: theme.primary },
            'Active': { background: `${theme.success}20`, color: theme.success },
            'Completed': { background: `${theme.textGray}20`, color: theme.textGray }
        };
        return statusStyles[status] || { background: `${theme.textGray}20`, color: theme.textGray };
    };

    const riskColorStyle = (risk: string): React.CSSProperties => {
        const riskMap: Record<string, React.CSSProperties> = {
            'Low': { background: '#10B98120', color: '#10B981' },
            'Moderate': { background: '#F59E0B20', color: '#F59E0B' },
            'High': { background: '#EF444420', color: '#EF4444' },
            'Very High': { background: '#EF444440', color: '#EF4444' },
        };
        return riskMap[risk] || { background: '#9CA3AF20', color: '#9CA3AF' };
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
            
            <div className="p-4 md:p-5 rounded-xl" style={{ background: theme.cardBg }}>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        {/* Main Header */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 p-2.5 rounded-xl shadow-sm"
                            >
                                <FaGift className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                                <div className="text-xl font-bold" style={{ color: theme.textWhite }}>
                                    New Fund Offers (NFO)
                                </div>
                                <div className="text-sm" style={{ color: theme.textGray }}>
                                    Latest mutual fund launches and opportunities
                                </div>
                            </div>
                        </div>

                        {/* View All Button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="md:self-start"
                        >
                            <button
                                className="px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
                                style={{ background: theme.gradient }}
                                onClick={onChangeViewAll}
                            >
                                <span className="flex items-center gap-1.5">
                                    View All
                                    <FaAngleRight className="h-3.5 w-3.5" />
                                </span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Info Bar */}
                    <div className="rounded-lg p-3 mb-4" style={{ background: `${theme.success}10`, border: `1px solid ${theme.success}30` }}>
                        <div className="flex items-start gap-2">
                            <FaInfo className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.success }} />
                            <div className="text-xs" style={{ color: theme.textGray }}>
                                New Fund Offers are mutual fund schemes launched for the first time. Invest early for potential benefits.
                            </div>
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
                                className="rounded-lg transition-all duration-200 overflow-hidden"
                                style={{
                                    background: theme.hoverBg,
                                    border: `1px solid ${theme.border}`,
                                }}
                            >
                                <div className="p-4">
                                    {/* Fund Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="relative p-2.5 rounded-lg cursor-pointer"
                                                style={{ background: schemeColors[index % schemeColors.length]?.bg || theme.primary }}
                                                onClick={() => handleNavigateFundDetail(fund)}
                                            >
                                                <div className="text-white font-bold text-base w-6 h-6 flex items-center justify-center">
                                                    {fund.name?.charAt(0) || 'N'}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <span 
                                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                                    style={getStatusBadgeStyle(fund.fundStatus || 'Active')}
                                                >
                                                    {fund.fundStatus || 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fund Name */}
                                    <div 
                                        className="font-semibold text-sm leading-tight line-clamp-2 mb-3 cursor-pointer transition-colors"
                                        style={{ color: theme.textWhite }}
                                        onClick={() => handleNavigateFundDetail(fund)}
                                        onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
                                        onMouseLeave={(e) => e.currentTarget.style.color = theme.textWhite}
                                    >
                                        {fund.name || 'New Fund Offer'}
                                    </div>

                                    {/* NFO Period */}
                                    <div className="mb-4 p-3 rounded-lg" style={{ background: theme.cardBg, border: `1px solid ${theme.border}` }}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FaCalendar className="h-3.5 w-3.5" style={{ color: theme.textGray }} />
                                            <div className="text-xs font-medium" style={{ color: theme.textGray }}>
                                                NFO Period
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold" style={{ color: theme.textWhite }}>
                                            {convertDate(fund.nfo_start_date, fund.nfo_end_date) || 'Not specified'}
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                                                Min. Investment
                                            </div>
                                            <div className="text-sm font-semibold" style={{ color: theme.textWhite }}>
                                                ₹{fund.min_amount ? convertNumberIndian(fund.min_amount) : "5,000"}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs mb-0.5" style={{ color: theme.textGray }}>
                                                Risk Level
                                            </div>
                                            <span 
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={riskColorStyle(fund.riskLevel || 'Medium')}
                                            >
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
                                            className="flex-1 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg"
                                            style={{ background: theme.gradient }}
                                        >
                                            <GrTransaction className="h-3.5 w-3.5" />
                                            Transact
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => addToCart(fund?.id)}
                                            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-300"
                                            style={{
                                                border: `1px solid ${theme.primary}`,
                                                color: theme.primary,
                                                background: 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = theme.gradient;
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = theme.primary;
                                            }}
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
                                <div className="inline-block p-4 rounded-full mb-4" style={{ background: theme.hoverBg }}>
                                    <FaGift className="h-8 w-8 mx-auto" style={{ color: theme.textGray }} />
                                </div>
                                <div className="text-base mb-2" style={{ color: theme.textWhite }}>
                                    No New Fund Offers available
                                </div>
                                <div className="text-sm" style={{ color: theme.textGray }}>
                                    Check back later for new fund launches
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* NFO Status Guide */}
                <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.textWhite }}>
                        <FaInfo className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                        NFO Status Guide:
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: theme.success }}></div>
                            <div style={{ color: theme.textGray }}>Open - Available for investment</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: theme.primary }}></div>
                            <div style={{ color: theme.textGray }}>Upcoming - Launching soon</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: theme.danger }}></div>
                            <div style={{ color: theme.textGray }}>Closed - Subscription ended</div>
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
                    investor={mockInvestorData}
                    open={showInvestorPopup}
                    onClose={() => setShowInvestorPopup(false)}
                />
            )}
        </>
    );
}

export default NewFundOffers;