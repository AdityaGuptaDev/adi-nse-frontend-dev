"use client";

import CustomText from '@/commonUI/Text';
import api from '@/utils/api';
import { schemeColors } from '@/utils/constants';
import { convertManagerDate, convertManagerName, handleServerError } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'

function FundManager({ schemeData }: any) {

    const [fundManagereData, setFundManagereData] = useState<any>([]);

    useEffect(() => {
        if (schemeData) {
            getFundManagerData();
        }
    }, [schemeData]);

    const getFundManagerData = async () => {
        try {

            let passBody: any = {
                schemeId: schemeData?.id,
                schemeISINNo: schemeData?.schemeISIN
            }

            let res: any = await api.post(`/scheme/get-fundmanager-data`, passBody);

            if (res.data.data) {
                setFundManagereData(res.data.data);
            }

        } catch (error) {
            handleServerError(error);
        }
    }

    console.log(fundManagereData, "fundManagereData")

    return (
        <div className='p-4'>
            <div>
                <CustomText className='text-lg font-semibold'>Fund Managers</CustomText>
            </div>
            <div>
                {fundManagereData.length > 0 ? (
                    fundManagereData.map((item: any, index: number) => (
                        <div className='bg-accent-content p-4 rounded-lg mt-5' key={index}>
                            <div className='flex items-center'>
                                <div className={`w-15 h-15 ${schemeColors[index % schemeColors.length].bg} ${schemeColors[index % schemeColors.length].text} font-semibold rounded-full flex items-center justify-center`}>
                                    <span>{convertManagerName(item?.FundManagersMaster?.manager_name)}</span>
                                </div>
                                <div className='ms-4'>
                                    <CustomText className='text-base font-semibold'>{item?.FundManagersMaster?.manager_name}</CustomText>
                                    <CustomText className='text-sm mt-2'>Experience: {item?.FundManagersMaster?.manager_exp === 'NULL' || item?.FundManagersMaster?.manager_exp == null ? 0 : item?.FundManagersMaster?.manager_exp} years | Managing since: {convertManagerDate(item?.manager_startdate, true)}</CustomText>
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
        </div>
    )
}

export default FundManager