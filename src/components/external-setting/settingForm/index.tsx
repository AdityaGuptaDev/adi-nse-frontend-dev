"use client";

import React, { useMemo, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInput from '@/commonUI/Input';
import CustomButton from '@/commonUI/Button';
import { handleServerError, toastAlert } from '@/utils/helpers';
import api from '@/utils/api';
import { useForm } from 'react-hook-form';
import CustomReactSelect from '@/commonUI/ReactSelect';
import { CredentialsAccountType, ExternalEntity, ExternalEntityList } from '@/utils/constants';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const schema: any = yup.object().shape({
    external_source: yup.string().trim().required("External Entity is required"),
    account_type: yup.string().trim().when("external_source", {
        is: (value: string) => value !== ExternalEntity.MORNINGSTAR && value !== ExternalEntity.SMS  && value !== ExternalEntity.Email,
        then: (schema) => schema.required("Live / UAT is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    membercode: yup.string().trim().when("external_source", {
        is: (value: string) => value === ExternalEntity.CVLKRA && value === ExternalEntity.Email,
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

    const [passwordType, setpasswordType] = useState<"text" | "password">(
        "password"
    );
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


    return (
        <div className="w-full p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-4 xl:grid-cols-4 gap-5">
                    <div>
                        <CustomReactSelect
                            items={ExternalEntityList}
                            required
                            label="External Entity"
                            placeholder="--Select--"
                            bindName="label"
                            bindValue="value"
                            value={getValues("external_source")}
                            {...register("external_source")}
                            onChange={handleExternalEnitityChange}
                            error={errors?.external_source?.message}
                            disabled={isView ? true : false}
                        />
                    </div>
                    {(externalEnitityId !== ExternalEntity.MORNINGSTAR && externalEnitityId !== ExternalEntity.SMS && externalEnitityId !== ExternalEntity.Email) && (
                        <div>
                            <CustomReactSelect
                                items={CredentialsAccountType}
                                required
                                label="Live / UAT"
                                placeholder="--Select--"
                                bindName="label"
                                bindValue="value"
                                value={getValues("account_type")}
                                {...register("account_type")}
                                onChange={handleAccountTypeChange}
                                error={errors?.account_type?.message}
                                disabled={isView ? true : false}
                            />
                        </div>
                    )}
                    {(externalEnitityId === ExternalEntity.CVLKRA || externalEnitityId === ExternalEntity.Email) && (
                        <div>
                            <CustomInput
                                // label="POS Code"
                                label={externalEnitityId === ExternalEntity.Email ? "Email Port" : "POS Code"}
                                {...register("membercode")}
                                required
                                placeholder="Enter code"
                                disabled={isView ? true : false}
                                error={errors.membercode?.message}
                            />
                        </div>
                    )}
                    <div>
                        <CustomInput
                            label={externalEnitityId === ExternalEntity.MFU || externalEnitityId === ExternalEntity.Cashfree ? "Client ID" : externalEnitityId === ExternalEntity.Email ? "Email Id" : "User Name"}
                            {...register("username")}
                            required
                            placeholder="Enter Value"
                            disabled={isView ? true : false}
                            error={errors.username?.message}
                        />
                    </div>
                    {externalEnitityId === ExternalEntity.MFU || externalEnitityId === ExternalEntity.Cashfree ? (
                        <div>
                            <CustomInput
                                label="Client Secret"
                                {...register("password")}
                                required
                                placeholder="Enter Value"
                                disabled={isView ? true : false}
                                error={errors.password?.message}
                            />
                        </div>
                    ) : (
                        <div>
                            <CustomInput
                                type={passwordType}
                                label="Password"
                                required
                                placeholder="Password"
                                {...register("password")}
                                error={errors.password?.message}
                                icon={
                                    passwordType === "password" ? (
                                        <FaEyeSlash
                                            className="w-4 h-4"
                                            onClick={() => setpasswordType("text")}
                                        />
                                    ) : (
                                        <FaEye
                                            className="w-4 h-4"
                                            onClick={() => setpasswordType("password")}
                                        />
                                    )
                                }
                                disabled={isView ? true : false}
                            />
                        </div>
                    )}

                    <div>
                        <CustomInput
                            // label="API URL"
                            label={externalEnitityId === ExternalEntity.Email ? "Email Host" : "API URL"}
                            {...register("api_base_url")}
                            required
                            placeholder="Enter url"
                            disabled={isView ? true : false}
                            error={errors.api_base_url?.message}
                        />
                    </div>

                    {externalEnitityId === ExternalEntity.MFU && (
                        <>
                            <div>
                                <CustomInput
                                    label="MFU Secret"
                                    {...register("mfu_secret")}
                                    required
                                    placeholder="Enter value"
                                    disabled={isView ? true : false}
                                    error={errors.mfu_secret?.message}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    label="MFU IV"
                                    {...register("mfu_iv")}
                                    required
                                    placeholder="Enter value"
                                    disabled={isView ? true : false}
                                    error={errors.mfu_iv?.message}
                                />
                            </div>
                        </>)}

                    {externalEnitityId === ExternalEntity.SMS && (
                        <>
                            <div>
                                <CustomInput
                                    label="Sender Id"
                                    {...register("sender_id")}
                                    required
                                    placeholder="Enter value"
                                    disabled={isView ? true : false}
                                    error={errors.sender_id?.message}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    label="Entity Id"
                                    {...register("entity_id")}
                                    required
                                    placeholder="Enter value"
                                    disabled={isView ? true : false}
                                    error={errors.entity_id?.message}
                                />
                            </div>
                            <div>
                                <CustomInput
                                    label="Template Id"
                                    {...register("template_id")}
                                    required
                                    placeholder="Enter value"
                                    disabled={isView ? true : false}
                                    error={errors.template_id?.message}
                                />
                            </div>
                        </>)}

                </div>
                <div className="flex justify-end text-end gap-4 mt-4">
                    {!isView ? (
                        <CustomButton
                            type="submit"
                            className="flex normal-case"
                            loading={loading}
                        >
                            {data ? "Update" : "Submit"}
                        </CustomButton>
                    ) : null}
                    <CustomButton
                        className="flex text-proses-secondary normal-case"
                        onClick={() => goToList()}
                    >
                        Cancel
                    </CustomButton>
                </div>
            </form>
        </div>
    )
}

export default SettingForm