"use client";

import CustomButton from '@/commonUI/Button';
import { pageTypes } from '@/utils/constants';
import React, { useState } from 'react'
import DataGrid from '../commonGrid/DataGrid';
import { RxEyeOpen } from 'react-icons/rx';
import { RiEdit2Line } from 'react-icons/ri';
import SettingForm from './settingForm';
import { Settings, ArrowLeft, Plus, RefreshCw } from 'lucide-react';

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
            icon: <RxEyeOpen className="w-4 h-4" />,
            title: "View",
            tooltip: "view",
            show: true,
        },
        {
            icon: <RiEdit2Line className="w-4 h-4" />,
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

    const handleRefresh = () => {
        setRefreshKey((prev: number) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <div className="w-full px-4 sm:px-6 py-6">
                {/* Header Section */}
                {pageType === "list" ? (
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#F59E0B]/20 rounded-xl">
                                    <Settings className="w-6 h-6 text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">External Settings</h1>
                                    <p className="text-sm text-white/70 mt-0.5">
                                        Manage external account configurations and integrations
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-white hover:bg-[#2A2A2A] hover:border-[#F59E0B] transition-all duration-200"
                                >
                                    <RefreshCw className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white">Refresh</span>
                                </button>
                                <button
                                    onClick={() => toggleForm("add")}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                    <span className="text-white">Add New</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4">
                        <button
                            className="flex items-center gap-2 text-[#F59E0B] hover:text-[#FBBF24] bg-transparent p-0 transition-colors duration-200 group"
                            onClick={() => toggleForm("list")}
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium text-white">Back to Settings List</span>
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden">
                    <div className="p-6">
                        {pageType == "list" ? (
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
                                    customStyles={{
                                        tableContainer: "bg-[#111111]",
                                        headerRow: "bg-[#1F1A1A] border-b border-[#2A2A2A]",
                                        // FIXED: Header cell text color - now white and visible
                                        headerCell: "text-white font-semibold py-3 px-4 text-sm",
                                        bodyRow: "border-b border-[#2A2A2A] hover:bg-[#1F1A1A] transition-colors duration-200 cursor-pointer",
                                        bodyCell: "text-white/90 py-3 px-4 text-sm",
                                        actionButton: "text-[#F59E0B] hover:text-[#FBBF24] transition-colors duration-200 p-2 rounded-lg hover:bg-[#2A2A2A]",
                                        pagination: "bg-[#1F1A1A] border-t border-[#2A2A2A] text-white py-3 px-4",
                                        paginationButton: "text-white hover:text-[#F59E0B]",
                                        filterInput: "bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent px-3 py-2 text-sm",
                                        searchInput: "bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent px-3 py-2 text-sm",
                                        emptyState: "text-white/70 py-8 text-center",
                                        loadingState: "text-[#F59E0B] py-8 text-center",
                                        filterLabel: "text-white text-sm font-medium",
                                        searchLabel: "text-white text-sm font-medium",
                                        showingText: "text-white/70 text-sm",
                                        perPageText: "text-white text-sm"
                                    }}
                                />
                            </div>
                        ) : (
                            <SettingForm
                                data={settingData}
                                isView={isView}
                                isEdit={isEdit}
                                toggleForm={toggleForm}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExternalSetting