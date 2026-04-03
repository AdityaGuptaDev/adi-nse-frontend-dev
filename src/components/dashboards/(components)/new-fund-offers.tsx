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
import React, { useContext, useState } from 'react'
import { FaAngleRight } from 'react-icons/fa6';
import { GrTransaction } from 'react-icons/gr';
import { IoCartOutline } from 'react-icons/io5';

function NewFundOffers({ data }: any) {

    let router = useRouter();

    const [navegateLoader, setNavigateLoader] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [showInvestorPopup, setshowInvestorPopup] = useState(false);
    const [showSipPopup, setShowSipPopup] = useState(false);

    const { setCartCounter, cartCounter } = useContext<any>(AccountContext);


    const topFund = data.length > 0 ? data : [];

    const onChangeViewAll = () => {
        setNavigateLoader(true);
        router.push(`/new-fund-offer-list`)
        setNavigateLoader(false);
    }

    const handleNavigateFundDetail = (item: any) => {
        setNavigateLoader(true);
        router.push(
            `/fund-detail?id=${item?.id}&tab=NAV`
        );
        setNavigateLoader(false);
    };

    const addToCart = async (schemeId: number) => {
        try {
            const userData: any = getLS(USER_DATA);
            // console.log(userData, "userDatauserData");

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


    return (
        <>
            <FullPageLoader
                isVisible={navegateLoader}
                message="Processing..."
            />
            <div className="bg-white">
                <div className="flex items-center justify-between mb-4">
                    <CustomText className="text-lg font-montserrat font-semibold text-gray-900">
                        New Fund Offers (NFO)
                    </CustomText>
                    <CustomButton
                        className="p-0 h-auto min-h-0 !text-secondary-content !bg-white"
                        onClick={() => onChangeViewAll()}
                    >
                        View All <span><FaAngleRight /></span>
                    </CustomButton>
                </div>
                <div className="">
                    <div className="relative">
                        {/* <div ref={sliderRefTopPerformingScheme} className="keen-slider"> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {topFund.length > 0 ? (
                                topFund.slice(0, 4).map((fund: any, index: number) => (
                                    //   <div className="keen-slider__slide" key={fund.id}>
                                    <div key={index}>
                                        <div
                                            className="bg-white border border-gray-200 rounded-xl p-4 h-full hover:shadow-lg transition-all duration-200"
                                        >
                                            {/* fund Header with Icon */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="">
                                                    <div className={`w-12 h-12 ${schemeColors[index % schemeColors.length].bg} rounded-full flex justify-center items-center ${schemeColors[index % schemeColors.length].text} font-semibold text-lg`}>
                                                        {fund.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <CustomText className="font-semibold text-secondary-content text-base line-clamp-2">
                                                        <span className={`badge ${FUND_STATUS_COLOR(fund.fundStatus)}`}>{fund.fundStatus}</span>
                                                    </CustomText>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <div >
                                                    <CustomText className="font-semibold text-secondary-content text-base line-clamp-2 cursor-pointer">
                                                        {fund.name}
                                                    </CustomText>
                                                </div>
                                            </div>

                                            {/* <div className="mt-2">
                                                <CustomText className="font-medium text-sm line-clamp-2">
                                                    {fund.description}
                                                </CustomText>
                                            </div> */}

                                            <div className="mt-4 flex justify-between items-center">
                                                <CustomText className="font-medium text-xs text-gray-500 line-clamp-2">
                                                    NFO Period
                                                </CustomText>
                                                <CustomText className="font-semibold text-sm line-clamp-2">
                                                    {convertDate(fund.nfo_start_date, fund.nfo_end_date)}
                                                </CustomText>
                                            </div>


                                            {/* Risk Rating and Investment */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div>
                                                    <CustomText className="text-xs text-gray-500 mb-1">
                                                        Min. investment
                                                    </CustomText>
                                                    <CustomText className="text-sm font-bold text-gray-900">
                                                        {fund.min_amount ? convertNumberIndian(fund.min_amount): 0}
                                                    </CustomText>
                                                </div>
                                                <div className="text-right">
                                                    <CustomText className="text-xs text-gray-500 mb-1">
                                                        Risk Rating
                                                    </CustomText>
                                                    {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(fund.riskRating)}`}> */}
                                                    <span className={`px-2 py-1 badge text-xs rounded-full font-medium  ${RISK_COLOR(fund.riskLevel)}`}>
                                                        {fund.riskLevel}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <div
                                                    data-tip="Transact"
                                                    tabIndex={0}
                                                    role="button"
                                                    className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                                                    onClick={() => {
                                                        setSelectedScheme(fund);
                                                        setshowInvestorPopup(true);
                                                    }}

                                                >
                                                    <GrTransaction
                                                        size={14}
                                                        className="text-primary"
                                                    />
                                                    <span>Transact</span>
                                                </div>
                                                <div
                                                    data-tip="Add to Cart"
                                                    className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                                                    onClick={(event: any) => {
                                                        addToCart(fund?.id);
                                                    }}
                                                >
                                                    <IoCartOutline size={16} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))) : (
                                <div className="col-span-4">
                                    <CustomText className="text-center text-gray-500">
                                        No Data Found
                                    </CustomText>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <PurchaseDetailPopup
                modalId="purchaseDetailModal"
                showTriggerButton={false}
                schemeData={selectedScheme}
            />

            {
                showSipPopup && (
                    <SipPopup
                        schemeData={selectedScheme}
                        open={showSipPopup}
                        onClose={() => setShowSipPopup(false)}
                    />
                )
            }

            {
                showInvestorPopup && (
                    <InvestorPopup
                        schemeData={selectedScheme}
                        open={showInvestorPopup}
                        onClose={() => setshowInvestorPopup(false)}
                    />
                )
            }
        </>
    )
}

export default NewFundOffers