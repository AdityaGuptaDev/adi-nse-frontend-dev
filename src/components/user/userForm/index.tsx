"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomSwitch from "@/commonUI/Switch";
import CustomTextarea from "@/commonUI/TextArea";
import api from "@/utils/api";
import { USER_TYPE } from "@/utils/constants";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";

const phoneRegExp = /^\d{10}$/;

const schema = yup.object().shape({
  roleId: yup.string().trim().required("Role is required"),
  userTypeId: yup.string().trim().required("User Type is required"),
  name: yup.string().trim().required("Name is required"),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
  mobile: yup
    .string()
    .matches(phoneRegExp, "Mobile No is not valid")
    .required("Mobile No is required")
    .min(10, "Invalid mobile number")
    .max(10, "Invalid mobile number")
    .required("Mobile Number is required")
    .typeError("Please enter valid Mobile number"),
  email: yup.string().email("Email is not valid").required("Email is required"),
  ARN: yup.string().nullable().when("userTypeId", {
    is: (val: any) => {
      console.log(val, "val");
      return val == USER_TYPE.RM
    },
    then: (schema) => schema.required("ARN is required for RM users"),
    otherwise: (schema) => schema.notRequired(),
  }),
  EUIN: yup.string().nullable().when("userTypeId", {
    is: (val: any) => val == USER_TYPE.RM,
    then: (schema) => schema.required("EUIN is required for RM users"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const EditSchema = yup.object().shape({
  roleId: yup.string().trim().required("Role is required"),
  userTypeId: yup.string().trim().required("User Type is required"),
  name: yup.string().trim().required("Name is required"),
  mobile: yup
    .string()
    .matches(phoneRegExp, "Mobile No is not valid")
    .required("Mobile No is required")
    .min(10, "Invalid mobile number")
    .max(10, "Invalid mobile number")
    .required("Mobile Number is required")
    .typeError("Please enter valid Mobile number"),
  email: yup.string().email("Email is not valid").required("Email is required"),
  ARN: yup.string().when("userTypeId", {
    is: (val: any) => {
      console.log(val, "val");
      return val == USER_TYPE.RM
    },
    then: (schema) => schema.required("ARN is required for RM users"),
    otherwise: (schema) => schema.optional(),
  }),
  EUIN: yup.string().when("userTypeId", {
    is: (val: any) => val == USER_TYPE.RM,
    then: (schema) => schema.required("EUIN is required for RM users"),
    otherwise: (schema) => schema.optional(),
  }),
});

type UserFormProps = {
  data: any;
  isView?: boolean;
  isEdit?: boolean;
  toggleForm: (pageType: any) => void;
  roleList: any;
  usersTypeList: any;
};

function UserForm({
  data,
  isView,
  toggleForm,
  isEdit,
  roleList,
  usersTypeList,
}: UserFormProps) {
  const [passwordType, setpasswordType] = useState<"text" | "password">(
    "password"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUserType, setSelectedUserType] = useState<any>(null);
  const [backOfficeUsers, setBackOfficeUsers] = useState<any[]>([]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    //@ts-ignore
    resolver: yupResolver(isEdit ? EditSchema : schema),
    mode: "onSubmit",
    defaultValues: useMemo(() => {
      console.log(data, "data");
      return {
        roleId: data?.roleId ? parseInt(data?.roleId) : null,
        userTypeId: data?.userTypeId ? parseInt(data?.userTypeId) : null,
        name: data?.name,
        email: data?.email,
        password: null,
        mobile: data?.mobile ? parseInt(data?.mobile) : null,
        ARN: data?.['UserMappings.RMRegistration.ARN'] ? data['UserMappings.RMRegistration.ARN'] : null,
        EUIN: data?.['UserMappings.RMRegistration.EUIN'] ? data['UserMappings.RMRegistration.EUIN'] : null,
        isActive: data?.isActive,
      };
    }, [data]),
  });
  console.log(errors, "errors");

  useEffect(() => {
    if (!data) {
      reset({
        roleId: null,
        userTypeId: null,
        name: null,
        email: null,
        password: null,
        mobile: null,
        ARN: null,
        EUIN: null,
        isActive: true,
      });
      setSelectedUserType(null);
    } else {
      setSelectedUserType(data?.userTypeId ? parseInt(data?.userTypeId) : null);
    }
  }, [data, reset]);

  const onSubmit = async (values: any) => {
    console.log(values, "values");
    try {
      setLoading(true);
      let obj: any = {
        mobile: values?.mobile ? Number(values?.mobile) : null,
        roleId: values?.roleId ? Number(values?.roleId) : null,
        userTypeId: values?.userTypeId ? Number(values?.userTypeId) : null,
        name: values?.name,
        email: values?.email,
        ARN: values?.ARN || null,
        EUIN: values?.EUIN || null,
        isActive: values?.isActive,
      };
      if (data?.id) {
        delete values.password;
        const apiRes = await api.put(`user/updateUser/${data.id}`, obj);
        const result = apiRes?.data?.data;
        if (result) {
          toastAlert("success", "Update Successfullly");
          setLoading(false);
          goToList();
        }
      } else {
        obj = { ...obj, password: values?.password };

        const apiRes = await api.post("user/addUser", obj);
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

  const handleRoleChange = (item: any) => {
    const roleId = item?.id || null;
    setValue("roleId", roleId, { shouldValidate: false });
  };

  const handleUserTypeChange = (item: any) => {
    const userType = item?.id || null;
    setValue("userTypeId", userType, { shouldValidate: false });
    setSelectedUserType(userType);

    setValue("roleId", null, { shouldValidate: false });

    if (userType !== 3) {
      setValue("ARN", null, { shouldValidate: false });
      setValue("EUIN", null, { shouldValidate: false });
    }
  };

  const filteredRoleList = useMemo(() => {
    if (!selectedUserType) {
      return [];
    }

    return roleList.filter((role: any) => {
      const matchesUserType = role?.userTypeId == selectedUserType;
      const roleName = role?.roleName?.toLowerCase();
      const isNotAllowedRole = roleName === 'Investor' || roleName === 'Partner';
      return matchesUserType && !isNotAllowedRole;
    });
  }, [roleList, selectedUserType]);

  const filteredUserTypeList = useMemo(() => {
    return usersTypeList.filter((item: any) => {
      const usertype = item?.userType?.toLowerCase();
      return usertype === 'supar admin' || usertype === 'rm';
    });
  }, [usersTypeList]);

  const goToList = () => {
    toggleForm("list");
    setSelectedUserType(null);
    reset({
      roleId: null,
      userTypeId: null,
      name: null,
      email: null,
      password: null,
      mobile: null,
      ARN: null,
      EUIN: null,
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
                items={filteredUserTypeList}
                required
                placeholder="Select User Type"
                bindName="userType"
                bindValue="id"
                value={getValues("userTypeId")}
                {...register("userTypeId")}
                onChange={handleUserTypeChange}
                error={errors?.userTypeId?.message}
                disabled={isView ? true : false}
                className="z-50"
              />
              {errors?.userTypeId && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.userTypeId)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                Role <span className="text-[#F59E0B]">*</span>
              </label>
              <CustomReactSelect
                items={filteredRoleList}
                required
                placeholder="Select Role"
                bindName="roleName"
                bindValue="id"
                value={watch("roleId")}
                {...register("roleId")}
                onChange={handleRoleChange}
                error={errors?.roleId?.message}
                disabled={isView ? true : false}
                className="z-50"
              />
              {errors?.roleId && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.roleId)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                Name <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="Enter Name"
                disabled={isView ? true : false}
                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.name)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                Email <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Enter Email"
                disabled={isView ? true : false}
                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.email)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                Mobile No <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="tel"
                {...register("mobile")}
                placeholder="Enter Mobile No"
                disabled={isView ? true : false}
                className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.mobile)}</p>
              )}
            </div>

            {selectedUserType == USER_TYPE.RM && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    ARN <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("ARN")}
                    placeholder="Enter ARN"
                    disabled={isView ? true : false}
                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.ARN && (
                    <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.ARN)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    EUIN <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("EUIN")}
                    placeholder="Enter EUIN"
                    disabled={isView ? true : false}
                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.EUIN && (
                    <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.EUIN)}</p>
                  )}
                </div>
              </>
            )}

            {!isEdit && !isView ? (
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Password <span className="text-[#F59E0B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordType}
                    {...register("password")}
                    placeholder="Enter Password"
                    className="w-full px-4 py-2.5 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setpasswordType(passwordType === "password" ? "text" : "password")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                  >
                    {passwordType === "password" ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{getErrorMessage(errors.password)}</p>
                )}
              </div>
            ) : null}

            {isEdit || isView ? (
              <div className="flex flex-col space-x-2 py-2">
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
            ) : null}
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

export default UserForm;