"use client";

import React, { Fragment, useEffect, useState } from "react";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import CustomText from "@/commonUI/Text";
import CustomInput from "@/commonUI/Input";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { handleServerError } from "@/utils/helpers";
import { convertToCrores } from "@/utils/constants";
import Link from "next/link";


const TopAMCListList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [amcData, setAMCData] = useState<any>([]);

    const router = useRouter();

    useEffect(() => {
        getTopAMCList();
    }, [searchTerm]);

    const getTopAMCList = async () => {
        try {

            let res: any = await api.get(`/mutual-fund/get-top-amc-list`, { params: { search: searchTerm } });
            if (res.data.data) {
                setAMCData(res.data.data);
            }
        } catch (error) {
            handleServerError(error);
        }
    }


    const onBack = () => {
        router.back();
    }

    const SectionDivider = () => <hr className="border-accent" />;

    return (
        <div className="">
            {/* Header */}
            <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div onClick={onBack} className="p-1 cursor-pointer">
                            <IoArrowBack className="w-5 h-5 text-gray-600" />
                        </div>
                        <CustomText className="text-lg font-semibold text-gray-900">
                            Top AMCs
                        </CustomText>
                    </div>
                    {/* <div className="p-2 cursor-pointer">
                        <FiShare2 className="w-5 h-5 text-gray-600" />
                    </div> */}
                </div>
            </div>

            {/* Search Bar */}
            <div className=" py-3 border-b border-gray-200">
                <div className="relative w-full px-4 mb-4">
                    <CustomInput
                        icon={<IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
                        type="text"
                        placeholder="Search For Top Performing Schemes"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Schemes List */}
                {amcData.map((amc: any, index: number) => (
                    <Fragment key={index}>
                        {/* // <div key={amc.id} className="bg-white rounded-lg my-3 p-4 shadow-sm"> */}
                        <Link href={`/amc-scheme-detail?id=${amc.id}`} key={index}>
                            <div className="hover:bg-gray-50 cursor-pointer">
                                <div className="px-4">
                                    {/* Scheme Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="my-3">
                                            <CustomText className="text-base font-semibold mb-1">
                                                {amc?.Name}
                                            </CustomText>
                                            <CustomText className="text-sm mb-1">
                                                AUM: {convertToCrores(amc?.total_AUM)} Cr.
                                            </CustomText>
                                            <CustomText className="text-sm">
                                                Schemes: {amc?.total_schemes}
                                            </CustomText>
                                        </div>
                                    </div>
                                </div>
                                <SectionDivider />
                            </div>
                        </Link>
                    </Fragment>
                ))}
            </div>
        </div>
    );
};

export default TopAMCListList;