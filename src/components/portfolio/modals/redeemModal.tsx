import CustomButton from "@/commonUI/Button";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import CustomSelect from "@/commonUI/Select";
import React, { forwardRef, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";
import { FaRupeeSign } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";

interface redeemModalProps {
  currentValue: number | string;
  investor: string;
  accountHolding: string;
  schemeData?: any;
}
const RedeemModal = forwardRef<HTMLDialogElement, redeemModalProps>(
  ({ currentValue, accountHolding, investor, schemeData }, ref) => {
    const [redeemType, setRedeemType] = useState<string>("All Units");
    const [redeemFullValue, setRedeemFullValue] = useState<string>("");

    return (
      <>
        <dialog ref={ref} className="modal ">
          <div className="modal-box w-full max-w-2xl rounded-2xl">
            <div className=" modalHeader ">
              <h3 className="font-semibold text-md text-gray-950">
                Redeem Details
              </h3>

              <form method="dialog" className=" flex">
                <div className="flex gap-7 pr-10 ">
                  <div className="flex flex-col text-base-content">
                    <span className="text-xs font-semibold">Investor Name</span>
                    <span className="text-sm">{investor}</span>
                  </div>

                  <div className="flex flex-col  text-base-content">
                    <span className="text-xs font-semibold">
                      Account Holding
                    </span>
                    <span className="text-sm">{accountHolding} </span>
                  </div>
                </div>
                <button className="  rounded-full h-8 w-8 p-1 flex items-center justify-center cursor-pointer border-accent hover:bg-accent ">
                  <IoCloseSharp className="text-xl" />
                </button>
              </form>
            </div>

            <form method="dialog">
              <div className="modalBody">
                <div className="mb-6 border-b border-accent pb-6 ">
                  <h2 className="text-sm text-base-content font-medium mb-2 mt-4">
                    {schemeData?.ms_fullname}{" "}
                  </h2>
                  <p className="text-base-content text-xs  flex gap-2">
                    <span>{schemeData?.SchemeCategory?.Name}</span> -
                    <span>{schemeData?.SchemeSubcategory?.Name}</span>
                  </p>
                </div>
                <div className="flex gap-10  my-3">
                  <div className="flex flex-col text-base-content">
                    <span className="text-xs">Folio</span>
                    <span className="text-sm">12345678</span>
                  </div>

                  <div className="flex flex-col  text-base-content">
                    <span className="text-xs">Current Value</span>
                    <span className="text-sm"> ₹{currentValue}</span>
                  </div>
                  <div className="flex flex-col text-base-content ">
                    <span className="text-xs">Units</span>
                    <span className="text-sm"> 47.24</span>
                  </div>
                </div>
                <div className="flex  items-center  h-22 mb-3 ">
                  <div className="flex gap-4 mt-4 w-full">
                    <label className="label  cursor-pointer text-sm gap-2 ">
                      <CustomCheckbox
                        label="All Units"
                        name="redeemType"
                        value="All Units"
                        checked={redeemType === "All Units"}
                        onChange={() => setRedeemType("All Units")}
                      />
                    </label>
                    <label className="label cursor-pointer gap-2 text-sm">
                      <CustomCheckbox
                        label="Units"
                        name="redeemType"
                        value="Units"
                        checked={redeemType === "Units"}
                        onChange={() => setRedeemType("Units")}
                      />
                    </label>
                    <label className="label cursor-pointer text-sm gap-2">
                      <CustomCheckbox
                        label="Amount"
                        name="redeemType"
                        value="Amount"
                        checked={redeemType === "Amount"}
                        onChange={() => setRedeemType("Amount")}
                      />
                    </label>
                  </div>
                  <div className="w-full">
                    {redeemType === "Units" && (
                      <div className="w-full">
                        <label className="label text-base-content text-sm ">
                          Enter Units
                        </label>
                        <CustomInput
                          type="text"
                          // className="input input-bordered w-full"
                          placeholder="Enter value"
                          value={redeemFullValue}
                          onChange={(e) => setRedeemFullValue(e.target.value)}
                        />
                      </div>
                    )}
                    {/* {redeemType === "All Units" && (
                  <div className="w-full">
                    <label className="label text-base-content  text-sm mb-1">
                      Redeem Full
                    </label>
                    <CustomInput
                      type="text"
                      // className="input input-bordered w-full"
                      placeholder="Enter value"
                      value={redeemFullValue}
                      onChange={(e) => setRedeemFullValue(e.target.value)}
                    />
                  </div>
                )} */}
                    {redeemType === "Amount" && (
                      <div className="w-full">
                        <label className="label text-base-content text-sm">
                          Enter Amount (min: ₹)
                        </label>
                        <CustomInputIcon
                          type="number"
                          min={0}
                          max={999999}
                          placeholder="Enter Amount"
                          icon={"₹"}
                          iconPosition="left"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modalFooter">
                <CustomButton className="text-xs">Redeem</CustomButton>
                {/* <CustomButton className="text-xs">Add to Cart</CustomButton> */}
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

export default RedeemModal;
