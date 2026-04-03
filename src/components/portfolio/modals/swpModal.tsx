import CustomButton from "@/commonUI/Button";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import CustomSelect from "@/commonUI/Select";
import React, { forwardRef, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
interface SwpModalProps {
  currentValue: number | string;
  investor: string;
  accountHolding: string;
  schemeData?: any;
}

const SwpModal = forwardRef<HTMLDialogElement, SwpModalProps>(
  ({ currentValue, accountHolding, investor, schemeData }, ref) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMendate, setSelectedMendate] = useState("");
    const [selectedScheme, setSelectedScheme] = useState("");
    const [redeemType, setRedeemType] = useState<string>("Units");
    const [redeemFullValue, setRedeemFullValue] = useState<string>("");
    const [selectedFrequency, setSelectedFrequency] = useState("");

    const DateOptions = [
      { id: 1, text: "Date 1" },
      { id: 2, text: "Date 2" },
    ];
    const monthsDropdown = [
      { durationType: "Months" },
      { durationType: "Years" },
    ];

    const FrequencyOptions = [
      { id: 1, text: "Daily" },
      { id: 3, text: "Weely" },
      { id: 4, text: "Monthly" },
      { id: 5, text: "Quarterly" },
    ];

    return (
      <>
        <dialog ref={ref} className="modal">
          <div className="modal-box relative  max-w-2xl w-full rounded-2xl text-base-content">
            <div className="modalHeader">
              <h3 className="font-semibold text-md text-gray-950">
                SWP Details
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
            <form method="dailog">
              <div className="modalBody">
                <div className="mb-6 border-b border-accent pt-3 pb-6 ">
                  <h2 className="text-sm text-base-content font-medium mb-2">
                    {schemeData?.ms_fullname}
                  </h2>
                  <p className="text-base-content text-xs  flex gap-2">
                    <span>{schemeData?.SchemeCategory?.Name}</span> -
                    <span>{schemeData?.SchemeSubcategory?.Name}</span>
                  </p>
                </div>
                <div className="flex gap-10  my-6">
                  <div className="flex flex-col  ">
                    <span className="text-xs">Folio</span>{" "}
                    <span className="text-sm">12345678</span>
                  </div>

                  <div className="flex flex-col  ">
                    <span className="text-xs">Current Value</span>
                    <span className="text-sm"> ₹{currentValue}</span>
                  </div>
                  <div className="flex flex-col   ">
                    <span className="text-xs">Units</span>
                    <span className="text-sm"> 47.24</span>
                  </div>
                </div>

                <div className="flex items-center w-full gap-6">
                  <label className="label cursor-pointer gap-2 text-sm mt-2">
                    <CustomCheckbox
                      label="Units"
                      name="redeemType"
                      value="Units"
                      checked={redeemType === "Units"}
                      onChange={() => setRedeemType("Units")}
                    />
                  </label>
                  <label className="label cursor-pointer text-sm gap-2 mt-2">
                    <CustomCheckbox
                      label="Amount"
                      name="redeemType"
                      value="Amount"
                      checked={redeemType === "Amount"}
                      onChange={() => setRedeemType("Amount")}
                    />
                  </label>
                  <div className="w-1/2">
                    {redeemType === "Units" && (
                      <div className="w-full">
                        <label className="label text-base-content text-sm">
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
                    {redeemType === "Amount" && (
                      <div className="w-full">
                        <label className="label text-base-content text-sm ">
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

                <div className="flex gap-5 ">
                  <div className="w-full  ">
                    <CustomLabel className="text-sm">Frequency</CustomLabel>
                    <CustomSelect
                      items={FrequencyOptions}
                      bindValue="text"
                      bindName="text"
                      value={selectedFrequency}
                      onChange={(option) =>
                        setSelectedFrequency(option ? option.text : "")
                      }
                    />
                  </div>
                  <div className="flex gap-2 w-full my-5">
                    <div className=" w-full mt-1">
                      <CustomInput
                        type="number"
                        min={0}
                        max={999999}
                        // value={watch("duration_mts")}
                        // name="duration_mts"
                        // onChange={(e: any) => {s
                        //   // setDuration(e?.target?.value);
                        //   setValue("duration_mts", e?.target?.value, {
                        //     shouldValidate: true,
                        //   });
                        // }}
                        id="Monthspan"
                        placeholder="Months/Years"
                      />
                    </div>
                    <div className="w-1/2 mt-1">
                      <CustomSelect
                        items={monthsDropdown}
                        bindName="durationType"
                        bindValue="durationType"
                        onChange={function (selectedItem: any): void {
                          throw new Error("Function not implemented.");
                        }} // value={getValues("durationType")}
                        // {...register("durationType")}
                        // onChange={(e) => {
                        //   setValue("durationType", e?.target.value);
                        //   clearErrors("duration_mts");
                        // }}
                        // disabled={secondModal}
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="w-full my-3 ">
                    <CustomLabel className="text-sm">Frequency</CustomLabel>
                    <CustomSelect
                      items={FrequencyOptions}
                      bindValue="text"
                      bindName="text"
                      value={selectedFrequency}
                      onChange={(option) =>
                        setSelectedFrequency(option ? option.text : "")
                      }
                    />
                  </div> */}
                <div className="w-1/2 mb-6">
                  <CustomLabel className=" text-sm">Date</CustomLabel>
                  <CustomSelect
                    items={DateOptions}
                    bindValue="text"
                    bindName="text"
                    value={selectedDate}
                    onChange={(option) =>
                      setSelectedFrequency(option ? option.text : "")
                    }
                    className="w-full  "
                  />
                </div>
              </div>
              <div className="modalFooter">
                <CustomButton className="text-xs">Initiate SWP</CustomButton>
                {/* <CustomButton className="text-xs">Add to Cart</CustomButton> */}
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

export default SwpModal;
