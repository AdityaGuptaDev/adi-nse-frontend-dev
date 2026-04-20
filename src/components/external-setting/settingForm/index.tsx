"use client";

import React, { useMemo, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomButton from '@/commonUI/Button';
import { handleServerError, toastAlert } from '@/utils/helpers';
import api from '@/utils/api';
import { useForm } from 'react-hook-form';
import { CredentialsAccountType, ExternalEntity, ExternalEntityList } from '@/utils/constants';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Save, X, Database } from 'lucide-react';

const schema: any = yup.object().shape({
    external_source: yup.string().trim().required("External Entity is required"),
    account_type: yup.string().trim().when("external_source", {
        is: (value: string) => value !== ExternalEntity.MORNINGSTAR && value !== ExternalEntity.SMS && value !== ExternalEntity.Email,
        then: (schema) => schema.required("Live / UAT is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    membercode: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.CVLKRA || value === ExternalEntity.Email,
        then: (schema) => schema.required("This field is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    username: yup.string().trim().required("This field is required"),
    password: yup.string().trim().required("This field is required"),
    api_base_url: yup.string().trim().required("This field is required"),
    mfu_secret: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.MFU,
        then: (schema) => schema.required("MFU secret is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    mfu_iv: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.MFU,
        then: (schema) => schema.required("MFU IV is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    sender_id: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.SMS,
        then: (schema) => schema.required("Sender Id is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    entity_id: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.SMS,
        then: (schema) => schema.required("Entity Id is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    template_id: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.SMS,
        then: (schema) => schema.required("Template Id is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
});

type SettingFormProps = {
    data: any;
    isView?: boolean;
    isEdit?: boolean;
    toggleForm: (pageType: any) => void;
};

function SettingForm({ data, isView, isEdit, toggleForm }: SettingFormProps) {

    const [passwordType, setpasswordType] = useState<"text" | "password">("password");
    const [loading, setLoading] = useState<boolean>(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        getValues,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: useMemo(() => {
            return {
                external_source: data?.external_source,
                account_type: data?.account_type,
                membercode: data?.membercode,
                username: data?.username,
                password: data?.password,
                api_base_url: data?.api_base_url,
                mfu_secret: data?.mfu_secret,
                mfu_iv: data?.mfu_iv,
                sender_id: data?.sender_id,
                entity_id: data?.entity_id,
                template_id: data?.template_id,
            };
        }, [data]),
    });

    const onSubmit = async (values: any) => {
        try {
            setLoading(true);

            let payload = {
                ...values,
                account_type: (values.external_source === ExternalEntity.MORNINGSTAR || values.external_source === ExternalEntity.SMS || values.external_source === ExternalEntity.Email) ? "LIVE" : values.account_type
            }

            if (data?.id) {
                const apiRes = await api.put(`external-account/updateExternalAccount/${data.id}`, payload);
                const result = apiRes?.data?.data;
                if (result) {
                    toastAlert("success", apiRes?.data?.msg);
                    setLoading(false);
                    goToList();
                }
            } else {
                const apiRes = await api.post("external-account/addExternalAccount", payload);
                const result = apiRes?.data?.data;
                if (result) {
                    toastAlert("success", apiRes?.data?.msg);
                    setLoading(false);
                    goToList();
                }
            }
        } catch (error) {
            setLoading(false);
            handleServerError(error);
        }
    };

    const handleExternalEnitityChange = (item: any) => {
        const enitityId = item?.value || null;
        setValue("external_source", enitityId, { shouldValidate: true });
    };

    const handleAccountTypeChange = (item: any) => {
        const accountTypeId = item?.value || null;
        setValue("account_type", accountTypeId, { shouldValidate: true });
    }

    const goToList = () => {
        toggleForm("list");
        reset({
            external_source: null,
            account_type: null,
            membercode: null,
            username: null,
            password: null,
            api_base_url: null,
            mfu_secret: null,
            mfu_iv: null,
            sender_id: null,
            entity_id: null,
            template_id: null,
        });
    };

    const externalEnitityId: any = watch("external_source");

    // Helper function to get dynamic label
    const getUsernameLabel = () => {
        if (externalEnitityId === ExternalEntity.MFU || externalEnitityId === ExternalEntity.Cashfree) {
            return "Client ID";
        }
        if (externalEnitityId === ExternalEntity.Email) {
            return "Email Id";
        }
        return "User Name";
    };

    const getApiUrlLabel = () => {
        if (externalEnitityId === ExternalEntity.Email) {
            return "Email Host";
        }
        return "API URL";
    };

    // Custom React Select Styles for Dark Mode
    const customSelectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#1F1A1A',
            borderColor: state.isFocused ? '#F59E0B' : '#2A2A2A',
            color: '#F9FAFB',
            boxShadow: state.isFocused ? '0 0 0 1px #F59E0B' : 'none',
            '&:hover': {
                borderColor: '#F59E0B'
            }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#1F1A1A',
            border: '1px solid #2A2A2A',
            zIndex: 9999
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
            color: '#F9FAFB',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#F59E0B'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#F9FAFB'
        }),
        input: (base: any) => ({
            ...base,
            color: '#F9FAFB'
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#9CA3AF'
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: '#9CA3AF',
            '&:hover': {
                color: '#F59E0B'
            }
        }),
        indicatorSeparator: (base: any) => ({
            ...base,
            backgroundColor: '#2A2A2A'
        })
    };

    return (
        <div className="w-full bg-[#111111] rounded-xl">
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Form Header */}
                <div className="mb-6 pb-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                            <Database className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#F9FAFB]">
                                {data?.id ? 'Edit External Configuration' : 'Add New External Configuration'}
                            </h3>
                            <p className="text-sm text-[#9CA3AF] mt-1">
                                Configure external service credentials and API settings
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 xl:grid-cols-4 gap-5">
                    {/* External Entity Select */}
                    <div>
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                            External Entity <span className="text-[#EF4444]">*</span>
                        </label>
                        <select
                            {...register("external_source")}
                            value={getValues("external_source") || ""}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                const selectedItem = ExternalEntityList.find(item => item.value === selectedValue);
                                if (selectedItem) {
                                    handleExternalEnitityChange(selectedItem);
                                }
                            }}
                            disabled={isView}
                            className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="" className="bg-[#1F1A1A] text-[#9CA3AF]">--Select--</option>
                            {ExternalEntityList.map((item) => (
                                <option key={item.value} value={item.value} className="bg-[#1F1A1A] text-[#F9FAFB]">
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        {errors?.external_source?.message && (
                            <p className="mt-1 text-xs text-[#EF4444]">{errors.external_source.message}</p>
                        )}
                    </div>

                    {/* Live / UAT Select - Conditional */}
                    {(externalEnitityId !== ExternalEntity.MORNINGSTAR && externalEnitityId !== ExternalEntity.SMS && externalEnitityId !== ExternalEntity.Email && externalEnitityId) && (
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Live / UAT <span className="text-[#EF4444]">*</span>
                            </label>
                            <select
                                {...register("account_type")}
                                value={getValues("account_type") || ""}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    const selectedItem = CredentialsAccountType.find(item => item.value === selectedValue);
                                    if (selectedItem) {
                                        handleAccountTypeChange(selectedItem);
                                    }
                                }}
                                disabled={isView}
                                className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <option value="" className="bg-[#1F1A1A] text-[#9CA3AF]">--Select--</option>
                                {CredentialsAccountType.map((item) => (
                                    <option key={item.value} value={item.value} className="bg-[#1F1A1A] text-[#F9FAFB]">
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            {errors?.account_type?.message && (
                                <p className="mt-1 text-xs text-[#EF4444]">{errors.account_type.message}</p>
                            )}
                        </div>
                    )}

                    {/* Member Code / POS Code / Email Port - Conditional */}
                    {(externalEnitityId === ExternalEntity.CVLKRA || externalEnitityId === ExternalEntity.Email) && (
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                {externalEnitityId === ExternalEntity.Email ? "Email Port" : "POS Code"} <span className="text-[#EF4444]">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("membercode")}
                                placeholder="Enter code"
                                disabled={isView}
                                className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            {errors.membercode?.message && (
                                <p className="mt-1 text-xs text-[#EF4444]">{errors.membercode.message}</p>
                            )}
                        </div>
                    )}

                    {/* Username / Client ID / Email ID */}
                    <div>
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                            {getUsernameLabel()} <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("username")}
                            placeholder="Enter Value"
                            disabled={isView}
                            className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {errors.username?.message && (
                            <p className="mt-1 text-xs text-[#EF4444]">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password / Client Secret */}
                    <div>
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                            {externalEnitityId === ExternalEntity.MFU || externalEnitityId === ExternalEntity.Cashfree ? "Client Secret" : "Password"} <span className="text-[#EF4444]">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={passwordType}
                                {...register("password")}
                                placeholder="Enter Value"
                                disabled={isView}
                                className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setpasswordType(passwordType === "password" ? "text" : "password")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                            >
                                {passwordType === "password" ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password?.message && (
                            <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
                        )}
                    </div>

                    {/* API URL / Email Host */}
                    <div>
                        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                            {getApiUrlLabel()} <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("api_base_url")}
                            placeholder="Enter url"
                            disabled={isView}
                            className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {errors.api_base_url?.message && (
                            <p className="mt-1 text-xs text-[#EF4444]">{errors.api_base_url.message}</p>
                        )}
                    </div>

                    {/* MFU Specific Fields */}
                    {externalEnitityId === ExternalEntity.MFU && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    MFU Secret <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("mfu_secret")}
                                    placeholder="Enter value"
                                    disabled={isView}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {errors.mfu_secret?.message && (
                                    <p className="mt-1 text-xs text-[#EF4444]">{errors.mfu_secret.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    MFU IV <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("mfu_iv")}
                                    placeholder="Enter value"
                                    disabled={isView}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {errors.mfu_iv?.message && (
                                    <p className="mt-1 text-xs text-[#EF4444]">{errors.mfu_iv.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* SMS Specific Fields */}
                    {externalEnitityId === ExternalEntity.SMS && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Sender Id <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("sender_id")}
                                    placeholder="Enter value"
                                    disabled={isView}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {errors.sender_id?.message && (
                                    <p className="mt-1 text-xs text-[#EF4444]">{errors.sender_id.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Entity Id <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("entity_id")}
                                    placeholder="Enter value"
                                    disabled={isView}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {errors.entity_id?.message && (
                                    <p className="mt-1 text-xs text-[#EF4444]">{errors.entity_id.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Template Id <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("template_id")}
                                    placeholder="Enter value"
                                    disabled={isView}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {errors.template_id?.message && (
                                    <p className="mt-1 text-xs text-[#EF4444]">{errors.template_id.message}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2A2A2A]">
                    {!isView && (
                        <CustomButton
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                            loading={loading}
                        >
                            <Save className="w-4 h-4" />
                            {data?.id ? "Update" : "Submit"}
                        </CustomButton>
                    )}
                    <CustomButton
                        className="flex items-center gap-2 px-6 py-2.5 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg hover:bg-[#2A2A2A] transition-colors duration-200"
                        onClick={() => goToList()}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </CustomButton>
                </div>
            </form>
        </div>
    )
}

export default SettingForm