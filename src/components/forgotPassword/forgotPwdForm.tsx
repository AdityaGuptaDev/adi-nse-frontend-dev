"use client";

import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import Text from "@/commonUI/Text";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid Email"),
});

export default function ForgotPasswordForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (formValues: any) => {
    try {
      setLoading(true);

      let checkEmail = await api.post(`/user/forgotPassword`, formValues);
      console.log(checkEmail, "checkEmailcheckEmail");
      setLoading(false);
      toastAlert("success", checkEmail.data.msg);
      sessionStorage.setItem("FORCE_CHANGE_PASSWORD", "true");
      router.push("/login");
    } catch (error: any) {
      setLoading(false);
      handleServerError(error);
    }
  };

  return (
    <div className="myContainer">
      <form
        className="mt-10 mb-2 w-80 max-w-screen-lg sm:w-96 mx-auto bg-white p-8 rounded-xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <CustomText className="text-center mb-5 text-xl font-bold">
          Password Recovery
        </CustomText>

        <div className="mb-1 flex flex-col gap-6 mt-6">
          <div>
            <CustomInput
              label="Your Email"
              {...register("email")}
              required
              placeholder="Enter Email"
              error={errors.email?.message}
            />
          </div>
        </div>
        <div className="text-end">
          <CustomButton className="mt-6" type="submit" loading={loading}>
            Send
          </CustomButton>
        </div>
        <CustomText className="mt-4 text-center font-normal">
          Back to login?{" "}
          <a href="/login" className="font-medium text-other">
            Click here
          </a>
        </CustomText>
      </form>
    </div>
  );
}
