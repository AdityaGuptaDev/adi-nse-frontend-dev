"use client";

import React, { useMemo, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInput from '@/commonUI/Input';
import CustomButton from '@/commonUI/Button';
import { handleServerError, toastAlert } from '@/utils/helpers';
import api from '@/utils/api';
import { Controller, useForm } from 'react-hook-form';
import CustomSwitch from '@/commonUI/Switch';

const schema: any = yup.object().shape({
    ARNNo: yup.string().trim().required("ARN No is required"),
    holder_name: yup.string().trim().required("Holder Name is required"),
    EUIN: yup.string().trim().required("EUIN is required"),
    // RIA: yup.string().trim().required("RIA is required"),
    MFU: yup.string().trim().required("MFU is required"),
});

type ARNFormProps = {
    data: any;
    isView?: boolean;
    isEdit?: boolean;
    toggleForm: (pageType: any) => void;
};


function ARNForm({ data, isView, isEdit, toggleForm }: ARNFormProps) {


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
                ARNNo: data?.ARNNo,
                holder_name: data?.holder_name,
                EUIN: data?.EUIN,
                RIA: data?.RIA,
                MFU: data?.MFU,
                isActive: data?.isActive,
            };
        }, [data]),
    });


    const onSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (data?.id) {
                const apiRes = await api.put(`arn/updateARNData/${data.id}`, values);
                const result = apiRes?.data?.data;
                if (result) {
                    toastAlert("success", apiRes?.data?.msg);
                    setLoading(false);
                    goToList();
                }
            } else {

                const apiRes = await api.post("arn/addARNData", values);
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

    const goToList = () => {
        toggleForm("list");
        reset({
            ARNNo: null,
            holder_name: null,
            EUIN: null,
            RIA: null,
            MFU: null,
            isActive: true,
        });
    };

    return (
        <div className="w-full p-6 bg-[#111111] border-t border-[#2A2A2A]">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-4 xl:grid-cols-4 gap-5">

                    <div>
                        <CustomInput
                            label="ARN"
                            {...register("ARNNo")}
                            required
                            type='number'
                            placeholder="Enter code"
                            disabled={isView ? true : false}
                            error={errors.ARNNo?.message}
                        />
                    </div>

                    <div>
                        <CustomInput
                            label="Holder Name"
                            {...register("holder_name")}
                            required
                            placeholder="Enter Value"
                            disabled={isView ? true : false}
                            error={errors.holder_name?.message}
                        />
                    </div>
                    <div>
                        <CustomInput
                            label="EUIN"
                            {...register("EUIN")}
                            required
                            placeholder="Enter Value"
                            disabled={isView ? true : false}
                            error={errors.EUIN?.message}
                        />
                    </div>

                    <div>
                        <CustomInput
                            label="RIA"
                            {...register("RIA")}
                            // required
                            placeholder="Enter value"
                            disabled={isView ? true : false}
                            // error={errors.RIA?.message}
                        />
                    </div>
                    <div>
                        <CustomInput
                            label="MFU default ARN"
                            {...register("MFU")}
                            required
                            placeholder="Enter value"
                            disabled={isView ? true : false}
                            error={errors.MFU?.message}
                        />
                    </div>

                    {isEdit || isView ? (
                        <div className="flex flex-col space-x-2 py-2 mt-8">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center">
                                        <CustomSwitch
                                            label="IsActive"
                                            id="isActive"
                                            {...field}
                                            checked={field.value}
                                            className="checked:bg-green"
                                            onChange={() => field.onChange(!field.value)}
                                            color="green"
                                            disabled={isView ? true : false}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    ) : null}

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

export default ARNForm