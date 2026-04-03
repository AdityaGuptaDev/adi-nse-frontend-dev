import React, { useState } from "react";
import { MdClose } from "react-icons/md";

import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import CustomButton from "@/commonUI/Button";
import { useRouter } from "next/navigation";

interface OtpProps {
  open: boolean;
  onClose: () => void;
}
const Otp: React.FC<{ open: any; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [otpValues, setOtpValues] = React.useState(["", "", "", "", "", ""]);
  const [emailOTP, setEmailOTP] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    const otp = otpValues.join("");
    router.push("/payment-success");

    onClose();
  };
  const handleClose = () => {
    onClose();
  };
  const handleResendOTP = () => {
    console.log("Resending OTP...");
    setOtpValues(["", "", "", "", "", ""]);
  };

  if (!open) return null;

  return (
    <>
      <dialog open className="modal modal-open">
        <div className="modal-box w-lg max-w-lg bg-white rounded-3xl shadow-2xl border-0">
          {/* Investment Details Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-base-content mb-2">
              KOTAK - EMERGING EQUITY (G)
            </h2>
            <p className="text-xs text-base-content mb-6 ">
              Equity - Large Cap
            </p>

            <div className="space-y-3 flex justify-between ">
              <div className="flex flex-col">
                <span className="text-base-content text-sm ">
                  Investor Name
                </span>
                <span className="text-base-content text-xs ">Rajendra</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base-content text-sm ">Holding Name</span>
                <span className="text-base-content text-xs ">Rajendra</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base-content text-sm">Folio No.</span>
                <span className="text-base-content text-xs">09876543321</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base-content text-sm">Amount</span>
                <span className="text-base-content text-xs ">₹ 15000</span>
              </div>
            </div>
            <div className="flex justify-start gap-22 ">
              <div className="flex flex-col">
                <span className="text-base-content text-sm">SIP Day</span>
                <span className="text-base-content text-xs ">15</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base-content text-sm">Mandate Code</span>
                <span className="text-base-content text-xs ">1234</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            {/* OTP Section */}
            <h3 className="text-2xl font-bold text-gray-950 mb-4 tracking-wider">
              OTP
            </h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">
              We have sent the verification code to your email address and
              mobile number
            </p>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-x-4 mb-8">
              <OtpInput
                value={emailOTP}
                onChange={(otp: any) => setEmailOTP(otp)}
                numInputs={6}
                renderSeparator={<span className="otpInputGap"></span>}
                renderInput={(props) => (
                  <input {...props} className="otpInput" />
                )}
                inputType={"text"}
                shouldAutoFocus={true}
                // inputStyle={{
                // border: "1px solid",
                // borderRadius: "8px",
                // width: "54px",
                // height: "54px",
                // fontSize: "12px",
                // color: "#000",
                // fontWeight: "400",
                // caretColor: "blue",
                // }}
                //   focusStyle={{
                //     border: "1px solid #CFD3DB",
                //     outline: "none",
                //   }}
              />
            </div>
          </div>

          <div>
            {/* Action Buttons */}
            <div className="space-y-4  flex flex-col justify-center items-center">
              <CustomButton
                className="btn btn-primary bg-primary text-white py-3 rounded-xl text-xl h-12 w-xs"
                onClick={handleSubmit}
              >
                Submit
              </CustomButton>

              <button
                className="btn btn-link text-secondary-content hover:text-secondary-content text-md font-normal "
                onClick={handleResendOTP}
              >
                Resend OTP
              </button>
            </div>
          </div>

          {/* Close Button */}
          <div className="modal-action mt-0">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-400 text-2xl hover:text-base-content"
              onClick={handleClose}
            >
              <MdClose />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
export default Otp;
