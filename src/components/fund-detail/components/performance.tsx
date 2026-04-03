"use client";

import CustomText from '@/commonUI/Text';
import api from '@/utils/api';
import { TIMEPERIODS, toFixedData, toFixedDataForReturn } from '@/utils/constants';
import { handleServerError } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'

function Performance({ schemeData }: any) {

    const [selectedPeriod, setSelectedPeriod] = useState("1D");
    const [performanceSchemeData, setPerformanceSchemeData] = useState<any>([]);

    const timePeriods: any[] = [
        { label: "1D", value: "1 Day" },
        { label: "1W", value: "1 Week" },
        { label: "1M", value: "1 Month" },
        { label: "3M", value: "3 Months" },
    ];

    useEffect(() => {
        getPerformanceSchemeData();
    }, []);

    const getPerformanceSchemeData = async () => {
        try {

            let passBody: any = {
                schemeId: schemeData?.id,
                categoryId: schemeData?.SchemeCategory?.ID,
                subCategoryId: schemeData?.SchemeSubcategory?.Id,
            }

            let res: any = await api.post(`/scheme/get-performance-scheme-data`, passBody);

            if (res.data.data) {
                setPerformanceSchemeData(res.data.data);
            }

        } catch (error) {
            handleServerError(error);
        }
    }


    const fundAVG: any = selectedPeriod === TIMEPERIODS.OneDay ? toFixedData(schemeData?.SchemePerformances[0]?.Return1d) :
        selectedPeriod === TIMEPERIODS.OneWeek ? toFixedData(schemeData?.SchemePerformances[0]?.Return1w) :
            selectedPeriod === TIMEPERIODS.OneMonth ? toFixedData(schemeData?.SchemePerformances[0]?.Return1mth) :
                selectedPeriod === TIMEPERIODS.ThreeMonth ? toFixedData(schemeData?.SchemePerformances[0]?.Return3mth) : "-";

    const textColor = fundAVG >= 0  ? "text-green-600" : "text-red-600";
    const formatedFundAVG = fundAVG >= 0  ? `+ ${fundAVG} %` : `${fundAVG} %`;


    return (
        <div className='p-4'>
            <div>
                <CustomText className='text-lg font-semibold'>Performance</CustomText>
            </div>
            <div className='mt-4'>
                <div className="px-6 py-4 border-b border-base-300">
                    <div className="tabs flex flex-wrap gap-2">
                        {timePeriods.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.label)}
                                className={`tab text-white rounded-md py-2 text-xs font-semibold  ${selectedPeriod === period.label
                                    ? "tab-active bg-primary hover:text-white text-white"
                                    : "bg-placeholder !text-white"
                                    }`}
                            >
                                {period.value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='mt-5 grid grid-cols-1 md:grid-cols-3 lg::grid-cols-3 gap-4'>
                    <div className='bg-accent-content p-4 rounded-lg text-center'>
                        <CustomText className={`text-2xl font-semibold mb-2  ${textColor}`}>
                            {formatedFundAVG}
                        </CustomText>
                        <CustomText className="text-sm">
                            Fund Return
                        </CustomText>
                    </div>
                    <div className='bg-accent-content p-4 rounded-lg text-center'>
                        <CustomText className="text-lg font-semibold mb-2">
                            pending data
                        </CustomText>
                        <CustomText className="text-sm">
                            Benchmark Return
                        </CustomText>
                    </div>
                    <div className='bg-accent-content p-4 rounded-lg text-center'>
                        <CustomText className="text-lg font-semibold mb-2">
                            pending data
                        </CustomText>
                        <CustomText className="text-sm">
                            Alpha
                        </CustomText>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Performance