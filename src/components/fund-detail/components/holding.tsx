"use client";

import CustomText from '@/commonUI/Text';
import Pagination from '@/components/commonGrid/components/pagination';
import api from '@/utils/api';
import { toFixedData, toFixedDataForReturn } from '@/utils/constants';
import { handleServerError } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'
import { IoMdArrowRoundBack } from 'react-icons/io';

function Holdings({ schemeData }: any) {

    console.log(schemeData, "schemeData")
    const [holdingData, setHoldingData] = useState<any>([]);
    const [holdingViewAllPage, setHoldingViewAllPage] = useState<any>(false);

    let [page, setPage] = useState(1);
    let [limit, setLimit] = useState(10);
    let [totalCount, setTotalCount] = useState(0);


    useEffect(() => {
        if (schemeData) {
            getFundManagerData();
        }
    }, [schemeData, page]);

    const getFundManagerData = async () => {
        try {

            const param = {
                schemeId: schemeData?.id,
                schemeISINNo: schemeData?.schemeISIN,
                filters: false,
                limit: limit,
                page: page,
            };

            // let passBody: any = {
            //     schemeId: schemeData?.id,
            //     schemeISINNo: schemeData?.schemeISIN
            // }

            let res: any = await api.get(`/scheme/get-mutual-holdingData`, { params: param });

            if (res.data.data) {
                setHoldingData(res.data.data.rows);
                setTotalCount(res.data.data.count);
            }

        } catch (error) {
            handleServerError(error);
        }
    }

    const handleViewAllHolding = () => {
        setHoldingViewAllPage(true);
    }


    console.log(holdingData, "holdingData")


    const onPageChange = (page: number) => {
        setPage(page);
    };

    const onBack = () => {
        setHoldingViewAllPage(false);
        setPage(1);
    }

    console.log(holdingViewAllPage, "holdingViewAllPage")
    console.log(page, "page")


    return (
        <div className='p-4'>
            <div className='flex justify-between items-center'>
                {holdingViewAllPage ? (
                    <div className='flex justify-between items-center gap-2'>
                        <div onClick={onBack} className='cursor-pointer'><IoMdArrowRoundBack size={25} /></div>
                        <div>
                            <CustomText className='text-lg font-semibold'>View All Holdings</CustomText>
                        </div>

                    </div>
                ) : (
                    <>
                        <div>
                            <CustomText className='text-lg font-semibold'>Top Holdings</CustomText>
                        </div>
                        <div onClick={handleViewAllHolding}>
                            <CustomText className='text-sm cursor-pointer font-semibold'>View All</CustomText>
                        </div>
                    </>
                )}

            </div>
            {holdingViewAllPage ? (
                <div>
                    <div className='overflow-auto h-[calc(100vh-230px)] 2xl:h-[calc(100vh-310px)]'>
                        {holdingData.length > 0 ? (
                            holdingData.map((item: any, index: number) => (
                                // <div className='bg-accent-content rounded-lg p-4 my-5' key={index}>
                                //     <div className='flex justify-between items-center'>
                                //         <div>
                                //             <CustomText className='text-base font-semibold'>{item?.name}</CustomText>
                                //             <CustomText className='text-sm'>Banking</CustomText>
                                //         </div>
                                //         <div>
                                //             <div className='flex justify-end items-center gap-4'>
                                //                 <CustomText className='text-sm font-semibold'>{toFixedDataForReturn(Number(item?.portfolio_weighting))}</CustomText>
                                //                 <progress className="progress progress-primary w-56" value={toFixedData(Number(item?.portfolio_weighting))} max="100"></progress>
                                //                 {/* <div className="relative group w-fit">
                                //             <progress
                                //                 className="progress progress-primary w-56"
                                //                 value={toFixedData(Number(item?.portfolio_weighting))}
                                //                 max="100"
                                //             ></progress>
                                //             <div className="absolute left-1/2 -translate-x-1/2 -top-6 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                //                 {toFixedData(Number(item?.portfolio_weighting))}%
                                //             </div>
                                //         </div> */}
                                //             </div>
                                //         </div>


                                //     </div>

                                // </div>
                                <div className='bg-accent-content rounded-lg p-4 my-5' key={index}>
                                    <div className='flex justify-between items-center'>
                                        <div className='flex-1'>
                                            <CustomText className='text-base font-semibold'>{item?.name}</CustomText>
                                            <CustomText className='text-sm text-gray-600'>{item?.sector || 'Banking'}</CustomText>
                                        </div>
                                        <div className='flex items-center gap-4 min-w-fit'>
                                            <CustomText className='text-sm font-semibold min-w-[60px] text-right'>
                                                {toFixedDataForReturn(Number(item?.portfolio_weighting))}%
                                            </CustomText>
                                            <div className="relative group">
                                                <progress
                                                    className="progress progress-primary w-32 sm:w-56"
                                                    value={toFixedData(Number(item?.portfolio_weighting))}
                                                    max="100"
                                                />
                                                <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                                    {toFixedData(Number(item?.portfolio_weighting))}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='p-4'>
                                No Data Found!
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <Pagination
                            totalCount={totalCount}
                            limit={limit}
                            page={page}
                            onPageChange={onPageChange}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    {holdingData.length > 0 ? (
                        holdingData.slice(0, 10).map((item: any, index: number) => (
                            // <div className='bg-accent-content rounded-lg p-4 my-5' key={index}>
                            //     <div className='flex justify-between items-center'>
                            //         <div>
                            //             <CustomText className='text-base font-semibold'>{item?.name}</CustomText>
                            //             <CustomText className='text-sm'>Banking</CustomText>
                            //         </div>
                            //         <div>
                            //             <div className='flex justify-end items-center gap-4'>
                            //                 <CustomText className='text-sm font-semibold'>{toFixedDataForReturn(Number(item?.portfolio_weighting))}</CustomText>
                            //                 <progress className="progress progress-primary w-56" value={toFixedData(Number(item?.portfolio_weighting))} max="100"></progress>
                            //                 {/* <div className="relative group w-fit">
                            //                 <progress
                            //                     className="progress progress-primary w-56"
                            //                     value={toFixedData(Number(item?.portfolio_weighting))}
                            //                     max="100"
                            //                 ></progress>
                            //                 <div className="absolute left-1/2 -translate-x-1/2 -top-6 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                            //                     {toFixedData(Number(item?.portfolio_weighting))}%
                            //                 </div>
                            //             </div> */}
                            //             </div>
                            //         </div>


                            //     </div>

                            // </div>
                            <div className='bg-accent-content rounded-lg p-4 my-5' key={index}>
                                <div className='sm:flex justify-between items-center'>
                                    <div className='flex-1'>
                                        <CustomText className='text-base font-semibold'>{item?.name}</CustomText>
                                        <CustomText className='text-sm text-gray-600'>{item?.sector || 'Banking'}</CustomText>
                                    </div>
                                    <div className='flex justify-center items-center gap-4 min-w-fit'>
                                        <CustomText className='text-sm font-semibold sm:min-w-[60px] text-right'>
                                            {toFixedDataForReturn(Number(item?.portfolio_weighting))}
                                        </CustomText>
                                        <div className="relative group">
                                            <progress
                                                className="progress progress-primary w-32 sm:w-56"
                                                value={toFixedData(Number(item?.portfolio_weighting))}
                                                max="100"
                                            />
                                            <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                                {toFixedData(Number(item?.portfolio_weighting))}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='p-4'>
                            No Data Found!
                        </div>
                    )}

                </div>
            )
            }
        </div >
    )
}

export default Holdings