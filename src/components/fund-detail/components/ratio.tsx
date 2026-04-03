"use client";

import CustomText from '@/commonUI/Text';
import api from '@/utils/api';
import { toFixedData, toFixedDataForReturn } from '@/utils/constants';
import { handleServerError } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'

function Ratio({ schemeData }: any) {

    const [ratioData, setRatioData] = useState<any>();

    useEffect(() => {
        getPerformanceSchemeData();
    }, []);

    const getPerformanceSchemeData = async () => {
        try {

            let passBody: any = {
                schemeId: schemeData?.id,
                schemeISINNo: schemeData?.schemeISIN,
            }

            let res: any = await api.post(`/scheme/get-ratio-scheme-data`, passBody);

            if (res.data.data) {
                setRatioData(res.data.data);
            }

        } catch (error) {
            handleServerError(error);
        }
    }

    console.log(ratioData,"ratioDataratioData")


    return (
        <div className='p-4'>
            <div>
                <CustomText className='text-lg font-semibold'>Key Ratios</CustomText>
            </div>
            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Expense Ratio</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(schemeData?.net_expense_ratio)}</CustomText>
                    <CustomText className='text-sm mt-2'>Annual</CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Tracking Error</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(ratioData?.TrackingError3Yr)}</CustomText>
                    <CustomText className='text-sm mt-2'>Annualized</CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Beta</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(ratioData?.Beta3Yr)}</CustomText>
                    <CustomText className='text-sm mt-2'>vs Benchmark</CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Sharpe Ratio</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(ratioData?.SharpeRatio3Yr)}</CustomText>
                    <CustomText className='text-sm mt-2'>3 Year</CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Alpha</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(ratioData?.Alpha3Yr)}</CustomText>
                    <CustomText className='text-sm mt-2'>3 Year</CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className='text-base font-semibold'>Standard Deviation</CustomText>
                    <CustomText className='text-2xl font-semibold text-secondary-content mt-2'>{toFixedDataForReturn(ratioData?.StandardDeviation3Yr)}</CustomText>
                    <CustomText className='text-sm mt-2'>3 Year</CustomText>
                </div>
            </div>
        </div>
    )
}

export default Ratio