"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { handleServerError, toastAlert } from "@/utils/helpers";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import api from "@/utils/api";
import CustomSwitch from "@/commonUI/Switch";

const schema = yup.object().shape({
  roleName: yup.string().trim().required("RoleName is required"),
  userType: yup.string().trim().required("User Type is required"),
});

type RoleFormProps = {
  data: any;
  isView?: boolean;
  isEdit?: boolean;
  toggleForm: (pageType: any) => void;
  usersType: any;
};

function RoleForm({ data, isView, isEdit, toggleForm, usersType }: RoleFormProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    //@ts-ignore
    resolver: yupResolver(schema),
    defaultValues: useMemo(() => {
      return {
        roleName: data?.roleName,
        userType: data?.userType ? parseInt(data?.userType) : null,
        isActive: data?.isActive,
      };
    }, [data]),
  });

  useEffect(() => {
    if (!data) {
      reset({
        roleName: null,
        userType: null,
        isActive: true,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      let obj: any = {
        roleName: values?.roleName,
        userTypeId: values?.userType ? Number(values?.userType) : null,
        isActive: values?.isActive,
      };

      if (data?.id) {
        const apiRes = await api.put(`role/updateRole/${data.id}`, obj);
        const result = apiRes?.data?.data;
        if (result) {
          toastAlert("success", "Update Successfullly");
          setLoading(false);
          goToList();
        }
      } else {
        const apiRes = await api.post("role/addRole", obj);
        const result = apiRes?.data?.data;
        if (result) {
          toastAlert("success", "Save Successfullly");
          setLoading(false);
          goToList();
        }
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleUserTypeChange = (item: any) => {
    console.log(item, "userType");
    const userType = item?.id || null;
    setValue("userType", userType, { shouldValidate: true });
  };

  const goToList = () => {
    toggleForm("list");
    reset({
      roleName: null,
      userType: null,
      isActive: true,
    });
  };

  // Helper function to get error message as string
  const getErrorMessage = (error: any): string | undefined => {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return undefined;
  };

  return (
    <>
      <div className="w-full p-6 bg-[#111111] border-t border-[#2A2A2A] rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-4 xl:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                User Type <span className="text-[#F59E0B]">*</span>
              </label>
              <CustomReactSelect
                items={usersType}
                required
                placeholder="Select User Type"
                bindName="userType"
                bindValue="id"
                value={watch("userType")}
                {...register("userType")}
                onChange={handleUserTypeChange}
                error={errors?.userType?.message}
                disabled={isView ? true : false}
                className="z-50"
              />
              {errors?.userType && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.userType)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                Role <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                {...register("roleName")}
                placeholder="Enter Role"
                disabled={isView ? true : false}
                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.roleName && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.roleName)}</p>
              )}
            </div>

            <div className="flex flex-col space-x-2 py-2 justify-center mt-5">
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
                      className="checked:bg-[#10B981]"
                      onChange={() => field.onChange(!field.value)}
                      color="green"
                      disabled={isView ? true : false}
                    />
                  </div>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end text-end gap-4 mt-6">
            {!isView ? (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : (data ? "Update" : "Submit")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => goToList()}
              className="px-6 py-2.5 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default RoleForm;