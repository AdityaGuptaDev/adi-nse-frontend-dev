"use client";

import CustomButton from '@/commonUI/Button';
import { pageTypes } from '@/utils/constants';
import React, { useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import DataGrid from '../commonGrid/DataGrid';
import { RxEyeOpen } from 'react-icons/rx';
import { RiDeleteBinLine, RiEdit2Line } from 'react-icons/ri';
import ARNForm from './arnForm';
import { handleServerError, toastAlert } from '@/utils/helpers';
import api from '@/utils/api';


const arnHeader = [
    {
        name: "ARN",
        fieldName: "ARNNo",
        type: "number",
        sorting: true,
        filter: true,
    },
    {
        name: "Holder Name",
        fieldName: "holder_name",
        sorting: true,
        filter: true,
    },
    {
        name: "EUIN",
        fieldName: "EUIN",
        sorting: true,
        filter: true,
    },
    {
        name: "RIA",
        fieldName: "RIA",
        sorting: true,
        filter: true,
    },
    {
        name: "MFU",
        fieldName: "MFU",
        sorting: true,
        filter: true,
    },
    {
        name: "Status",
        fieldName: "isActive",
        formatter: (value: boolean) => (value ? "Active" : "InActive"), // Convert boolean to string
        dataClass: (value: boolean) => (value ? "activeClass" : "inActiveClass"),
    },
];

function ARNList() {

    const [pageType, setpageType] = useState<pageTypes>("list");
    const [arnData, setARNData] = useState<any>();
    const [isView, setIsView] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<any>(0);

    const endPoint = `/arn/getAllARNList`;


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
        {
            icon: <RiDeleteBinLine />,
            title: "Delete",
            tooltip: "delete",
            confirmBox: {
                title: "Are you sure ?",
                confirmText: "Yes",
                cancelText: "Cancel",
            },
            show: true,
        },
    ];

    // toggleform
    const toggleForm = (
        formType: pageTypes = pageType == "list" ? "add" : "list"
    ) => {
        if (formType == "list") {
            setARNData("");
            setIsView(false);
            setIsEdit(false);
        }
        setpageType(formType);
    };


    const clickOnAction = async (e: string, data: any) => {
        if (e == "View") {
            setIsView(true);
            setARNData(data);
            toggleForm("view");
        }

        if (e == "Edit") {
            setIsEdit(true);
            setARNData(data);
            toggleForm("edit");
        }

        if (e == "Delete") {
            try {
                if (data.id) {
                    const apiRes = await api.delete(`arn/deleteARNData/${data.id}`);
                    const result = apiRes?.data?.data;
                    setRefreshKey((prev: any) => prev + 1);

                    toastAlert("success", "Data Deleted Successfullly");
                }
            } catch (error: any) {
                handleServerError(error);
            }
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
                            headerList={arnHeader}
                            apiEndPoint={endPoint}
                            actionButtons={actionButtons}
                            clickOnAction={clickOnAction}
                            permission={true}
                            toggleForm={toggleForm}
                            pageName={"ARN"}
                            backButton={true}
                        />
                    </div>
                </>
            ) : (
                <ARNForm
                    data={arnData}
                    isView={isView}
                    isEdit={isEdit}
                    toggleForm={toggleForm}
                />
            )}
            {/* </div> */}
        </>
    )
}

export default ARNList