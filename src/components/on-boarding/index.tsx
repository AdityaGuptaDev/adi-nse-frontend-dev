"use client";

import CustomButton from "@/commonUI/Button";
import { useRouter } from "next/navigation";
import React from "react";

function OnBoarding({ onBoardingModal }: any) {
  let router = useRouter();

  const handleBoadingModel = () => {
    router.push("/initial-KYC");
  };

  return (
    <div className="">
      <div>
        {/* {onBoardingModal && ( */}
        <div id="my_modal_1" className="modal modal-open">
          <div className="modal-box">
            <div className="modalBody">
              {/* <h3 className="text-lg font-bold">Hello!</h3> */}
              <p className="py-4">
                Your on-boarding process is pending, please click on continue to
                proceed.
              </p>
            </div>
            <div className="modal-action flex justify-center">
              <form method="dialog">
                <div className="my-4 text-center">
                  <CustomButton
                    className="w-24 text-center"
                    onClick={handleBoadingModel}
                  >
                    Continue
                  </CustomButton>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  );
}

export default OnBoarding;
