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

  return (
    <>
      <div className="w-full p-6 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-4 xl:grid-cols-4 gap-5">
            <div>
              <CustomReactSelect
                items={usersType}
                required
                label="User Type"
                placeholder="Select User Type"
                bindName="userType"
                bindValue="id"
                value={watch("userType")}
                {...register("userType")}
                onChange={handleUserTypeChange}
                error={errors?.userType?.message}
                disabled={isView ? true : false}
              />
            </div>
            <div>
              <CustomInput
                label="Role"
                {...register("roleName")}
                required
                placeholder="Enter Role"
                disabled={isView ? true : false}
                error={errors.roleName?.message}
              />
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
                      className="checked:bg-green"
                      onChange={() => field.onChange(!field.value)}
                      color="green"
                      disabled={isView ? true : false}
                    />
                  </div>
                )}
              />
            </div>
            {/* ) : null} */}
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
    </>
  );
}

export default RoleForm;
