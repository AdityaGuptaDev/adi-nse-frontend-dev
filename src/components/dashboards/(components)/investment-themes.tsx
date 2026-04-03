"use client"

import CustomButton from '@/commonUI/Button';
import FullPageLoader from '@/commonUI/FullPageLoader';
import CustomText from '@/commonUI/Text';
import { formatReturn } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FaAngleRight } from 'react-icons/fa';
import { IoTriangle } from 'react-icons/io5';

interface ThemeData {
    id: string;
    name: string;
    description: string;
    image?: string;
    schemes: number;
    returnRange: number;
}

interface InvestmentThemesProps {
    data: ThemeData[];
}

const InvestmentTheme: React.FC<InvestmentThemesProps> = ({ data }) => {

    const router = useRouter();

    const [viewAllLoader, setViewAllLoader] = useState(false);

    const mockData: ThemeData[] = [
        {
            id: "1",
            image: "�",
            name: "Contra Fund",
            description: "Value investing, Contrarian approach",
            schemes: 12,
            returnRange: 24.8,
        },
        {
            id: "2",
            image: "🎯",
            name: "Focused Fund",
            description: "Concentrated portfolio, High conviction",
            schemes: 15,
            returnRange: 26.3,
        },
        {
            id: "3",
            image: "⚡",
            name: "Dynamic Fund",
            description: "Asset allocation, Market timing",
            schemes: 18,
            returnRange: 19.7,
        },
        {
            id: "4",
            image: "🏢",
            name: "Corporate Fund",
            description: "Corporate bonds, Fixed income",
            schemes: 14,
            returnRange: 8.2,
        },
    ];

    const themesData = data.length > 0 ? data : mockData;

    const onChangeViewAll = () => {
        setViewAllLoader(true);
        router.push(`/investment-theme-list`)
        setViewAllLoader(false);
    }

    return (
        <>
            <FullPageLoader
                isVisible={viewAllLoader}
                message="Processing..."
            />
            <div className="bg-white">
                <div className="flex items-center justify-between mb-4">
                    <CustomText className="text-lg font-montserrat font-semibold text-gray-900">
                        Investment Themes
                    </CustomText>
                    <CustomButton
                        className="p-0 h-auto min-h-0 !text-secondary-content !bg-white"
                        onClick={() => onChangeViewAll()}
                    >
                        View All <span><FaAngleRight /></span>
                    </CustomButton>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {themesData.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            {/* AMC Icon/Logo */}
                            <div className="flex justify-center items-center text-center mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full text-center p-5 flex items-center justify-center">
                                    {/* <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-contain"
                  /> */}
                                    <span className="text-blue-600 text-lg">{item.image}</span>
                                </div>
                            </div>

                            <div className="text-center mb-3">
                                <CustomText className="font-semibold text-gray-900 text-base leading-tight">
                                    {item.name}
                                </CustomText>
                            </div>

                            <div className="text-center mb-4">
                                <CustomText className="font-medium text-gray-900 text-sm leading-tight">
                                    {item.description}
                                </CustomText>
                            </div>

                            <div className="flex justify-between items-center">
                                {/* Schemes Count */}
                                <div className="">
                                    <CustomText className="text-xs text-gray-500 ">
                                        {item.schemes}  Schemes
                                    </CustomText>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IoTriangle className="text-green-600 w-3 h-3" />
                                    <CustomText className="text-sm font-bold text-green-600">
                                        {formatReturn(item.returnRange)}
                                    </CustomText>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <CustomText className="text-sm font-medium text-blue-800">
            Asset Management Companies (AMCs)
          </CustomText>
        </div>
        <CustomText className="text-xs text-blue-700">
          AMCs are financial institutions that manage mutual fund schemes. The ranking is based on 
          Assets Under Management (AUM) which represents the total market value of investments managed by the AMC.
        </CustomText>
      </div> */}
            </div >
        </>
    )
}

export default InvestmentTheme