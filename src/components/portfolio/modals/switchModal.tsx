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

interface SwitchModalProps {
  currentValue: number | string;
  investor: string;
  accountHolding: string;
  schemeData?: any;
}
const SwitchModal = forwardRef<HTMLDialogElement, SwitchModalProps>(
  ({ currentValue, investor, accountHolding, schemeData }, ref) => {
    const [switchType, setSwitchType] = useState<string>("All Units");
    const [switchFullValue, setSwitchFullValue] = useState<string>("");
    const [selectedScheme, setSelectedScheme] = useState("");

    const SchemeOptions = [
      { id: 1, text: "Scheme 1" },
      { id: 2, text: "Scheme 2" },
    ];
    return (
      <>
        <dialog ref={ref} className="modal ">
          <div className="modal-box w-full max-w-2xl rounded-2xl">
            <div className="modalHeader">
              <h3 className="font-semibold text-md text-gray-950">
                Switch Details
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
                    <span className="text-sm"> {accountHolding}</span>
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
                    {schemeData?.ms_fullname}
                  </h2>
                  <p className="text-base-content text-xs  flex gap-2">
                    <span>{schemeData?.SchemeCategory?.Name}</span> -
                    <span>{schemeData?.SchemeSubcategory?.Name}</span>
                  </p>
                </div>
                <div className="flex gap-10 my-6">
                  <div className="flex flex-col text-base-content">
                    <span className="text-xs ">Folio</span>
                    <span className="text-sm">12345678</span>
                  </div>

                  <div className="flex flex-col  text-base-content">
                    <span className="text-xs ">Current Value</span>
                    <span className="text-sm"> ₹{currentValue}</span>
                  </div>
                  <div className="flex flex-col text-base-content ">
                    <span className="text-xs">Units</span>
                    <span className="text-sm"> 47.24</span>
                  </div>
                </div>

                <div className="flex flex-col Sitems-center gap-4 border-b border-accent pb-4">
                  <div className="flex gap-4 mt-4 w-full ">
                    <label className="label  cursor-pointer text-sm gap-2 ">
                      <CustomCheckbox
                        label="All Units"
                        name="switchType"
                        value="All Units"
                        checked={switchType === "All Units"}
                        onChange={() => setSwitchType("All Units")}
                      />
                    </label>
                    <label className="label cursor-pointer gap-2 text-sm">
                      <CustomCheckbox
                        label="Units"
                        name="switchType"
                        value="Units"
                        checked={switchType === "Units"}
                        onChange={() => setSwitchType("Units")}
                      />
                    </label>
                    <label className="label cursor-pointer text-sm gap-2">
                      <CustomCheckbox
                        label="Amount"
                        name="switchType"
                        value="Amount"
                        checked={switchType === "Amount"}
                        onChange={() => setSwitchType("Amount")}
                      />
                    </label>
                  </div>
                  <div className="w-1/2">
                    <CustomLabel className="text-sm text-base-content">
                      To Scheme
                    </CustomLabel>
                    <CustomSelect
                      items={SchemeOptions}
                      bindValue="text"
                      bindName="text"
                      value={selectedScheme}
                      onChange={(option) =>
                        setSelectedScheme(option ? option.text : "")
                      }
                      className="w-full  mt-2"
                    />
                  </div>
                  <div className="w-full">
                    {switchType === "Units" && (
                      <div className="w-1/2">
                        <CustomLabel className="label text-base-content text-sm mb-1">
                          Enter Units
                        </CustomLabel>
                        <CustomInput
                          type="text"
                          // className="input input-bordered w-full"
                          placeholder="Enter value"
                          value={switchFullValue}
                          onChange={(e) => setSwitchFullValue(e.target.value)}
                        />
                      </div>
                    )}
                    {/* {switchType === "All Units" && (
                  <div className="w-1/2">
                    <label className="label text-base-content  text-sm mb-1">
                      Switch Full
                    </label>
                    <CustomInput
                      type="text"
                      // className="input input-bordered w-full"
                      placeholder="Enter value"
                      value={switchFullValue}
                      onChange={(e) => setSwitchFullValue(e.target.value)}
                    />
                  </div>
                )} */}
                    {switchType === "Amount" && (
                      <div className="w-1/2">
                        <label className="label text-base-content text-sm mb-1">
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
                <CustomButton>Switch</CustomButton>
                {/* <CustomButton>Add to Cart</CustomButton> */}
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

export default SwitchModal;
