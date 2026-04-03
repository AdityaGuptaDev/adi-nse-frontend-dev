"use client";

import CustomText from '@/commonUI/Text';
import { toFixedData } from '@/utils/constants';
import { convertOnlyEndDate } from '@/utils/helpers';
import React from 'react'

function Information({ schemeData }: any) {

    console.log(schemeData, "schemeData????????????")
    return (
        <div className="p-4">
            <div>
                <CustomText className="text-lg font-bold">
                    Key Parameters
                </CustomText>
            </div>
            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Type
                    </CustomText>
                    <CustomText className="text-sm">
                        {schemeData?.SchemeSubcategory?.Name}
                    </CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Custodian
                    </CustomText>
                    <CustomText className="text-sm">
                        {schemeData?.AMCMaster?.Name}
                    </CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Registrar
                    </CustomText>
                    <CustomText className="text-sm">
                        {schemeData?.AMCMaster?.amc_registrar || '--'}
                    </CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Benchmark
                    </CustomText>
                    <CustomText className="text-sm">
                        {schemeData?.allBenchmarkName ? schemeData?.allBenchmarkName : "--"}
                    </CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Launch Date
                    </CustomText>
                    <CustomText className="text-sm">
                        {schemeData.inception_date ? convertOnlyEndDate(schemeData.inception_date) : "--"}
                        {/* {schemeData.inception_date
                            ? (() => {
                                const d = new Date(schemeData.inception_date);
                                const day = String(d.getDate()).padStart(
                                    2,
                                    "0"
                                );
                                const month = String(d.getMonth() + 1).padStart(
                                    2,
                                    "0"
                                );
                                const year = d.getFullYear();
                                return `${day}/${month}/${year}`;
                            })()
                            : "--"} */}
                    </CustomText>
                </div>
                <div className='bg-accent-content p-4 rounded-lg'>
                    <CustomText className="text-base font-semibold mb-2">
                        Expense Ratio
                    </CustomText>
                    <CustomText className="text-sm">
                        {toFixedData(schemeData?.net_expense_ratio)} %  p.a.
                    </CustomText>
                </div>
            </div>
        </div>
    )
}

export default Information