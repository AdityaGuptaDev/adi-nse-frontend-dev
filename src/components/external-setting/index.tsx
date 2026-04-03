"use client";

import CustomButton from '@/commonUI/Button';
import { pageTypes } from '@/utils/constants';
import React, { useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import DataGrid from '../commonGrid/DataGrid';
import { RxEyeOpen } from 'react-icons/rx';
import { RiEdit2Line } from 'react-icons/ri';
import SettingForm from './settingForm';

const settingHeader = [
    {
        name: "External Entity",
        fieldName: "external_source",
        sorting: true,
        filter: true,
    },
    {
        name: "Account Type",
        fieldName: "account_type",
        sorting: true,
        filter: true,
    },
    {
        name: "User Name",
        fieldName: "username",
        sorting: true,
        filter: true,
    },
];

function ExternalSetting() {

    const [pageType, setpageType] = useState<pageTypes>("list");
    const [settingData, setSettingData] = useState<any>();
    const [isView, setIsView] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<any>(0);

    const endPoint = `/external-account/getAllExternalAccountList`;


    let actionButtons: any[] = [
        {
            icon: <RxEyeOpen />,
            title: "View",
            tooltip: "view",
            show: true,
        },
        {
            icon: <RiEdit2Line />,
            title: "Edit",
            tooltip: "edit",
            show: true,
        },
    ];

    // toggleform
    const toggleForm = (
        formType: pageTypes = pageType == "list" ? "add" : "list"
    ) => {
        if (formType == "list") {
            setSettingData("");
            setIsView(false);
            setIsEdit(false);
        }
        setpageType(formType);
    };


    const clickOnAction = async (e: string, data: any) => {
        if (e == "View") {
            setIsView(true);
            setSettingData(data);
            toggleForm("view");
        }

        if (e == "Edit") {
            setIsEdit(true);
            setSettingData(data);
            toggleForm("edit");
        }
    };

    return (
        <>
            {pageType !== "list" ? (
                <>
                    <div className="p-3">
                        <CustomButton
                            className="flex !text-secondary normal-case bg-transparent p-0 shadow-none"
                            onClick={(e) => {
                                toggleForm("list");
                            }}
                        >
                            <IoIosArrowBack className="h-6 w-6" /> Back
                        </CustomButton>
                    </div>
                </>
            ) : null}

            {pageType == "list" ? (
                <>
                    <div>
                        <DataGrid
                            refreshKey={refreshKey}
                            headerList={settingHeader}
                            apiEndPoint={endPoint}
                            actionButtons={actionButtons}
                            clickOnAction={clickOnAction}
                            skipPermission={true}
                            toggleForm={toggleForm}
                            pageName={"Setting"}
                            backButton={true}
                        />
                    </div>
                </>
            ) : (
                <SettingForm
                    data={settingData}
                    isView={isView}
                    isEdit={isEdit}
                    toggleForm={toggleForm}
                />
            )}
            {/* </div> */}
        </>
    )
}

export default ExternalSetting