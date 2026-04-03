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
    }, // RM user type ID
    then: (schema) => schema.required("ARN is required for RM users"),
    otherwise: (schema) => schema.notRequired(),
  }),
  EUIN: yup.string().nullable().when("userTypeId", {
    is: (val: any) => val == USER_TYPE.RM, // RM user type ID
    then: (schema) => schema.required("EUIN is required for RM users"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // pincode: yup.string().matches(/^[0-9]+$/, "Must be only digits").required("Pincode is required").typeError("Pincode is required"),
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
    }, // RM user type ID
    then: (schema) => schema.required("ARN is required for RM users"),
    otherwise: (schema) => schema.optional(),
  }),
  EUIN: yup.string().when("userTypeId", {
    is: (val: any) => val == USER_TYPE.RM, // RM user type ID
    then: (schema) => schema.required("EUIN is required for RM users"),
    otherwise: (schema) => schema.optional(),
  }),

  // pincode: yup.string().matches(/^[0-9]+$/, "Must be only digits").required("Pincode is required").typeError("Pincode is required"),
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
    mode: "onSubmit", // Only validate on submit, not on change
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
        // address: data?.address,
        // pincode: data?.pincode ? parseInt(data?.pincode) : null,
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
        // address: null,
        // pincode: null,
        isActive: true,
      });
      setSelectedUserType(null);
    } else {
      // Set selected user type when data is loaded
      setSelectedUserType(data?.userTypeId ? parseInt(data?.userTypeId) : null);
    }
  }, [data, reset]);



  const onSubmit = async (values: any) => {
    console.log(values, "values");
    try {
      // setLoading(true);
      let obj: any = {
        mobile: values?.mobile ? Number(values?.mobile) : null,
        roleId: values?.roleId ? Number(values?.roleId) : null,
        userTypeId: values?.userTypeId ? Number(values?.userTypeId) : null,
        name: values?.name,
        email: values?.email,
        ARN: values?.ARN || null,
        EUIN: values?.EUIN || null,
        // pincode: values?.pincode ? Number(values?.pincode) : null,
        // address: values?.address,
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

    // Clear role selection when user type changes
    setValue("roleId", null, { shouldValidate: false });

    // Clear RM specific fields when user type changes
    if (userType !== 3) { // If not RM user type (3 is RM user type ID)
      setValue("ARN", null, { shouldValidate: false });
      setValue("EUIN", null, { shouldValidate: false });
    }
  };


  // Filter roles based on selected user type
  const filteredRoleList = useMemo(() => {
    if (!selectedUserType) {
      return []; // Return empty array if no user type is selected
    }

    return roleList.filter((role: any) => {
      // Filter by userTypeId matching selected user type
      const matchesUserType = role?.userTypeId == selectedUserType;

      // Also filter to show only Super Admin, RM, 
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
      // address: null,
      // pincode: null,
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
                items={filteredUserTypeList}
                required
                label="User Type"
                placeholder="Select User Type"
                bindName="userType"
                bindValue="id"
                value={getValues("userTypeId")}
                {...register("userTypeId")}
                onChange={handleUserTypeChange}
                error={errors?.userTypeId?.message}
                disabled={isView ? true : false}
              />
            </div>
            <div>
              <CustomReactSelect
                items={filteredRoleList}
                required
                label="Role"
                placeholder="Select Role"
                bindName="roleName"
                bindValue="id"
                value={watch("roleId")}
                {...register("roleId")}
                onChange={handleRoleChange}
                error={errors?.roleId?.message}
                disabled={isView ? true : false}
              />
            </div>

            <div>
              <CustomInput
                label="Name"
                {...register("name")}
                required
                placeholder="Enter Name"
                disabled={isView ? true : false}
                error={errors.name?.message}
              />
            </div>
            <div>
              <CustomInput
                label="Email"
                {...register("email")}
                placeholder="Enter Email"
                required
                disabled={isView ? true : false}
                error={errors.email?.message}
              />
            </div>
            <div>
              <CustomInput
                label="Mobile No"
                {...register("mobile")}
                placeholder="Enter Mobile No"
                required
                disabled={isView ? true : false}
                error={errors.mobile?.message}
              />
            </div>

            {/* RM specific fields */}
            {selectedUserType == USER_TYPE.RM && (
              <>
                <div>
                  <CustomInput
                    label="ARN"
                    {...register("ARN")}
                    placeholder="Enter ARN"
                    required
                    disabled={isView ? true : false}
                    error={errors.ARN?.message}
                  />
                </div>
                <div>
                  <CustomInput
                    label="EUIN"
                    {...register("EUIN")}
                    placeholder="Enter EUIN"
                    required
                    disabled={isView ? true : false}
                    error={errors.EUIN?.message}
                  />
                </div>

              </>
            )}

            {!isEdit && !isView ? (
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
                />
              </div>
            ) : null}

            {/* <div>
              <CustomInput
                type="number"
                required
                label="Pincode"
                {...register("pincode")}
                placeholder="Enter Pincode"
                error={errors.pincode?.message}
                disabled={isView ? true : false}
              />
            </div> */}
            {/* <div>
              <CustomTextarea
                label="Address"
                {...register("address")}
                disabled={isView ? true : false}
              />
            </div> */}
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
    </>
  );
}

export default UserForm;
