import CustomButton from "@/commonUI/Button";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import CustomSelect from "@/commonUI/Select";
import React, { forwardRef, useContext, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import { USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import AccountContext from "@/context/AccountContext/Account.context";

interface SipModalProps {
  currentValue: number | string;
  investor: string;
  accountHolding: string;
  schemeData?: any;
}

const SipModal = forwardRef<HTMLDialogElement, SipModalProps>(
  ({ currentValue, investor, accountHolding, schemeData }, ref) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMendate, setSelectedMendate] = useState("");
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { cartCounter, setCartCounter } = useContext(AccountContext);

    const MendateOptions = [
      { id: 1, text: "32131" },
      { id: 2, text: "31231" },
    ];
    const FrequencyOptions = [
      { id: 1, text: "Daily" },
      { id: 3, text: "Weekly" },
      { id: 4, text: "Monthly" },
      { id: 5, text: "Quarterly" },
    ];
    const DateOptions = [
      { id: 1, text: "Date 1" },
      { id: 2, text: "Date 2" },
    ];
    const monthsDropdown = [
      { durationType: "Months" },
      { durationType: "Years" },
    ];

    const addToCart = async (schemeId: number) => {
      if (isAddingToCart) return;

      try {
        setIsAddingToCart(true);
        const userData: any = getLS(USER_DATA);

        let CartObj = {
          user_id: Number(userData.id),
          investor_id: Number(userData.UserBasicDetail.id),
          account_holding_id: 0,
          cart_type: 1,
          scheme_id: schemeId,
          trans_type: 1,
        };

        const addCartData = await api.post(
          `/cart/addfundExploreCardData`,
          CartObj
        );

        if (addCartData?.data?.data) {
          toastAlert("success", "Added To Cart");
          const newCartCount = (cartCounter || 0) + 1;
          setCartCounter(newCartCount);
          if (ref && typeof ref !== "function" && ref.current) {
            ref.current.close();
          }
        } else {
          const errorMessage =
            addCartData?.data?.message ||
            "Unable to add in cart, please try again later!";
          toastAlert("info", errorMessage);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        handleServerError(error);
        toastAlert("error", "Failed to add to cart. Please try again.");
      } finally {
        setIsAddingToCart(false);
      }
    };

    return (
      <>
        <dialog ref={ref} className="modal">
          <div className="modal-box relative  max-w-2xl w-full rounded-2xl text-base-content">
            <div className="modalHeader">
              <h3 className="font-semibold text-md text-gray-950">
                SIP Details
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
              {" "}
              {/* Fixed typo: "dailog" -> "dialog" */}
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
                  <div className="flex flex-col">
                    <span className="text-xs">Folio</span>{" "}
                    <span className="text-sm">12345678</span>
                  </div>

                  <div className="flex flex-col  ">
                    <span className="text-xs">Current Value</span>
                    <span className="text-sm"> ₹{currentValue}</span>
                  </div>
                  <div className="flex flex-col ">
                    <span className="text-xs">Units</span>
                    <span className="text-sm"> 47.24</span>
                  </div>
                </div>
                <div className="flex gap-5 ">
                  <div className="w-full  ">
                    <CustomLabel className=" text-sm">
                      Enter Amount (min: ₹)
                    </CustomLabel>
                    <input
                      placeholder="Enter Amount"
                      type="number"
                      className="w-full outline-accent px-3 py-2 border border-accent rounded-lg mt-2"
                    />
                  </div>
                  <div className="w-full my-1 ">
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
                </div>
                <div className="flex gap-5 my-1">
                  <div className="w-full">
                    <CustomLabel className=" text-sm">Date</CustomLabel>
                    <CustomSelect
                      items={DateOptions}
                      bindValue="text"
                      bindName="text"
                      value={selectedDate}
                      onChange={(option) =>
                        setSelectedDate(option ? option.text : "")
                      }
                      className="w-full  mt-1"
                    />
                  </div>
                  <div className="flex gap-2 mt-7 w-full">
                    <div className=" w-full ">
                      <CustomInput
                        type="number"
                        min={0}
                        max={999999}
                        id="Monthspan"
                        placeholder="Months/Years"
                      />
                    </div>
                    <div className="w-1/2 ">
                      <CustomSelect
                        items={monthsDropdown}
                        bindName="durationType"
                        bindValue="durationType"
                        onChange={function (selectedItem: any): void {
                          // TODO: Implement duration type change logic
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full my-3 ">
                  <CustomLabel className="mt-3 text-sm ">
                    From Current Mandate
                  </CustomLabel>
                  <CustomSelect
                    items={MendateOptions}
                    bindValue="text"
                    bindName="text"
                    value={selectedMendate}
                    onChange={
                      (option) => setSelectedMendate(option ? option.text : "") // Fixed: should update selectedMendate, not selectedDate
                    }
                  />
                </div>

                <div className="flex flex-col  pb-6 border-b border-accent text-sm ">
                  <CustomLabel> Execute with First purchase</CustomLabel>
                  <label className="label cursor-pointer gap-2">
                    <CustomCheckbox label="Yes" name="folioType" value="Yes" />
                  </label>
                </div>
              </div>
              <div className="modalFooter">
                <CustomButton className="text-xs">Initiate SIP</CustomButton>
                <CustomButton
                  className="text-xs"
                  onClick={(event: any) => {
                    event.preventDefault();
                    addToCart(schemeData?.id);
                  }}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </CustomButton>
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

export default SipModal;
