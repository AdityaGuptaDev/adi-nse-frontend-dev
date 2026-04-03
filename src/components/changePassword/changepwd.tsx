"use client";
import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import Text from "@/commonUI/Text";
import api from "@/utils/api";
import { ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";
import { handleServerError, removeLS, setLS, toastAlert } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";

const schema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Field is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
  newPassword: yup
    .string()
    .required("Field is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
  confirmPassword: yup
    .string()
    .required("Field is required")
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be less than 16 characters"),
});

function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const [passwordType, setpasswordType] = useState<"text" | "password">(
    "password"
  );
  const [newpasswordType, setnewpasswordType] = useState<"text" | "password">(
    "password"
  );
  const [confirmpasswordType, setconfirmpasswordType] = useState<
    "text" | "password"
  >("password");
  const [loading, setLoading] = useState<boolean>(false);
  const [successNote, setSuccessNote] = useState("");



 const onSubmit = async (values: any) => {
  try {
    setLoading(true);

    const result: any = await api.post(`/user/changePassword`, values);

    if (result.data.data) {
      toastAlert(
        "success",
        "Your Password has been successfully updated!"
      );

      // Show note message
      setSuccessNote("Your password has been updated successfully. Please log-out and login again.");

      // Clear user data after message
      localStorage.clear();
      sessionStorage.clear();
    }

    setLoading(false);
  } catch (error) {
    setLoading(false);
    handleServerError(error);
  }
};


const handleLogout = () => {
    try {
      console.log('Logging out...');
      
      removeLS(PROD_DATA);
      removeLS(TOKEN_PREFIX);
      removeLS(MENU_PREFIX);
      removeLS(FLAT_MENU);
      removeLS(USER_DATA);
      removeLS(ADMIN_INVESTER_DATA);

      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log('Logout successful - redirecting to login');
      
      router.push('/login');
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <>
     

      <div className="mt-10 mb-2 md:w-[400px] max-w-screen-lg sm:w-96 mx-auto p-8">
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomText className="text-center mb-5">Change Password</CustomText>
           {successNote && (
  <div className="bg-blue-50 text-green-800 border border-blue-300 p-3 rounded-md mt-4">
    {successNote}
  </div>
)}
          <div className="mb-1 flex flex-col gap-6">
            <div>
              <CustomInput
                required
                type={passwordType}
                label="Password"
                placeholder="Password"
                {...register("oldPassword")}
                error={errors.oldPassword?.message}
                icon={
                  passwordType === "password" ? (
                    <FaEyeSlash onClick={() => setpasswordType("text")} />
                  ) : (
                    <FaEye onClick={() => setpasswordType("password")} />
                  )
                }
              />
            </div>
            <div>
              <CustomInput
                required
                type={newpasswordType}
                label="New Password"
                placeholder="New Password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                icon={
                  newpasswordType === "password" ? (
                    <FaEyeSlash onClick={() => setnewpasswordType("text")} />
                  ) : (
                    <FaEye onClick={() => setnewpasswordType("password")} />
                  )
                }
              />
            </div>
            <div>
              <CustomInput
                required
                type={confirmpasswordType}
                label="Confirm Password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                icon={
                  confirmpasswordType === "password" ? (
                    <FaEyeSlash
                      onClick={() => setconfirmpasswordType("text")}
                    />
                  ) : (
                    <FaEye onClick={() => setconfirmpasswordType("password")} />
                  )
                }
              />
            </div>
          </div>
          <CustomButton className="mt-6" type="submit" loading={loading}>
            Change Password
          </CustomButton>
        </form>
      </div>
    </>
  );
}

export default ChangePassword;
