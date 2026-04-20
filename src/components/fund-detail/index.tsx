"use client"


import AccountContext from '@/context/AccountContext/Account.context';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import { FaStar } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { IoCartOutline } from 'react-icons/io5';
import PurchaseDetailPopup from '../fund-explore/purchaseDetail';
import SipPopup from '../fund-explore/sipDetail';
import { getLS, handleServerError, toastAlert } from '@/utils/helpers';
import api from '@/utils/api';
import NAVChart from './components/NavChart';
import { GrTransaction } from 'react-icons/gr';
import Information from './components/information';
import RelatedScheme from './components/related-scheme';
import Performance from './components/performance';
import Holdings from './components/holding';
import FundManager from './components/fund-manager';
import Ratio from './components/ratio';
import { USER_DATA } from '@/utils/constants';
import InvestorPopup from '../fund-explore/investor';

function FundDetail() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const tabFromQuery = searchParams.get("tab");
    const schemeId = searchParams.get("id");

    const [activeTab, setActiveTab] = useState("NAV");
    const [schemeData, setSchemeData] = useState<any>();

    const [selectedScheme, setSelectedScheme] = useState(null);
    const [showInvestorPopup, setshowInvestorPopup] = useState(false);
    const [showSipPopup, setShowSipPopup] = useState(false);

    const { setCartCounter, cartCounter } = useContext<any>(AccountContext);


    const tabs = [
        "NAV",
        "Information",
        "Related Scheme",
        "Performance",
        "Holding",
        // "AUM",
        "Fund Manager",
        "Ratio",
    ];

    useEffect(() => {
        if (schemeId) {
            getSchemeDataById();
        }
    }, [schemeId]);

    useEffect(() => {
        if (tabFromQuery) {
            setActiveTab(tabFromQuery);
        }
    }, [tabFromQuery]);

    const getSchemeDataById = async () => {
        try {
            let id = schemeId;

            let res: any = await api.get(`/scheme/get-scheme-by-id/${id}`);

            if (res.data.data) {

                const names = res.data.data?.SchemeBenchmarksMappings?.map((item: any) => item.SchemeBenchmarksMaster?.benchmark_name)
                    .filter(Boolean) // remove null/undefined
                    .join(" / ");

                res.data.data = { ...res.data.data, allBenchmarkName: names };
                setSchemeData(res.data.data);

            }
        } catch (error) {
            handleServerError(error);
        }
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
            console.log(CartObj)

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
            <div className="">
                <div className="sm:flex sm:items-center sm:justify-between px-4 pt-4">
                    <div className="flex sm:justify-center items-center-center sm:gap-3">
                        <div
                            className="cursor-pointer"
                            onClick={() => router.push("/mutual-fund")}
                        >
                            <IoMdArrowRoundBack size={25} />
                        </div>
                        <div className="font-bold text-xl px-4 ">
                            {/* ICICI Pru Balanced Advantage Fund (G) */}
                            {schemeData?.ms_fullname}
                        </div>
                    </div>

                    <div className="flex ms-10 gap-2">
                        {/* <div
                            data-tip="Transact"
                            tabIndex={0}
                            role="button"
                            className="btn btn-sm btnStyle py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                            onClick={() => {
                                setSelectedScheme(schemeData);
                                setshowInvestorPopup(true);
                            }}
                        >
                            <GrTransaction
                                size={14}
                                className="text-primary"
                            />
                            <span>Transact</span>
                        </div> */}

                        <div
                            data-tip="Add to Cart"
                            className="btn btn-sm btnStyle bg-primary py-0 px-2 text-sm font-normal border-0 rounded-lg tooltip tooltip-bottom"
                            onClick={(event: any) => {
                                addToCart(schemeData?.id);
                            }}
                        >
                            <IoCartOutline size={16} className="text-[#F9FAFB]" />
                        </div>
                        <span className="text-primary text-lg flex items-center gap-2 mr-1">
                            {schemeData?.SchemePerformances?.[0]?.OverallRating ? (
                                <>
                                    {schemeData?.SchemePerformances[0]?.OverallRating}
                                    <FaStar className="text-primary text-lg" />
                                </>
                            ) : (
                                "--"
                            )}
                            {/* 5 <FaStar /> */}
                        </span>
                    </div>
                </div>

                <div
                    role="tablist"
                    className="tabs tabs-bordered bg-base-200 text-base-content pt-2 mt-4 px-4 flex-nowrap text-nowrap overflow-x-auto"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            role="tab"
                            className={`tab h-7 ${activeTab === tab
                                ? "tab-active text-secondary bg-[#111111] rounded-t-xl"
                                : " !text-base-content"
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === "NAV" && <NAVChart schemeData={schemeData} />}
                    {activeTab === "Information" && <Information schemeData={schemeData} />}
                    {activeTab === "Related Scheme" && <RelatedScheme schemeData={schemeData} />}
                    {activeTab === "Performance" && <Performance schemeData={schemeData} />}
                    {activeTab === "Holding" && <Holdings schemeData={schemeData} />}
                    {activeTab === "Fund Manager" && <FundManager schemeData={schemeData} />}
                    {activeTab === "Ratio" && <Ratio schemeData={schemeData} />}
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

export default FundDetail