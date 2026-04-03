import CustomButton from "@/commonUI/Button";
import CustomInput from "@/commonUI/Input";
import CustomLabel from "@/commonUI/Label";
import CustomSelect from "@/commonUI/Select";
import AccountContext from "@/context/AccountContext/Account.context";
import React, { forwardRef, useContext, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { USER_DATA } from "@/utils/constants";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";

interface BuyModalProps {
  currentValue: number | string;
  investor: string;
  accountHolding: string;
  schemeData?: any;
}

const BuyModal = forwardRef<HTMLDialogElement, BuyModalProps>(
  ({ currentValue, investor, accountHolding, schemeData }, ref) => {
    const { cartCounter, setCartCounter } = useContext(AccountContext);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

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
          const errorMessage = addCartData?.data?.message;
          toastAlert("info", errorMessage);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        handleServerError(error);
      } finally {
        setIsAddingToCart(false);
      }
    };

    return (
      <>
        <dialog ref={ref} className="modal ">
          <div className="modal-box  w-full rounded-3xl ">
            <div className="modalHeader">
              <h3 className="font-semibold text-md text-gray-950">
                Purchase Detail
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
                <div className="mb-6  border-b border-accent pb-4 ">
                  <h2 className="text-sm text-base-content  font-medium mb-2 mt-4">
                    {schemeData?.ms_fullname}
                  </h2>
                  <p className="text-base-content text-xs  flex gap-2">
                    <span>{schemeData?.SchemeCategory?.Name}</span> -
                    <span>{schemeData?.SchemeSubcategory?.Name}</span>
                  </p>
                </div>

                <div className="flex gap-10  mb-6">
                  <div className="flex flex-col   text-base-content ">
                    <span className="text-xs">Folio</span>
                    <span className="text-sm">12345678</span>
                  </div>
                  <div className="flex flex-col   ">
                    <span className="text-xs">Current Value</span>
                    <span className="text-sm"> ₹{currentValue}</span>
                  </div>
                  <div className="flex flex-col text-base-content">
                    <span className="text-xs">Units</span>
                    <span className="text-sm"> 47.24</span>
                  </div>
                </div>
                <div className="flex flex-col  pb-4 ">
                  <CustomLabel className="mt-4 text-sm">
                    Enter Amount (min: ₹)
                  </CustomLabel>
                  <input
                    placeholder="Enter Amount"
                    type="number"
                    className="w-1/2 outline-accent border border-accent px-3 py-1 rounded-lg mt-2"
                  />
                </div>
              </div>
              <div className="modalFooter">
                <CustomButton className="text-xs">Buy Now</CustomButton>
                <CustomButton
                  className="text-xs"
                  onClick={(event: any) => {
                    event.preventDefault();
                    addToCart(schemeData?.id);
                  }}
                  disabled={isAddingToCart}
                >
                  Add to Cart
                </CustomButton>
              </div>
            </form>
          </div>
        </dialog>
      </>
    );
  }
);

export default BuyModal;
