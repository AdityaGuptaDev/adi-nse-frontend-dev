"use client";

import CustomRadio from "@/commonUI/Radio";
import { TransactionType } from "@/utils/constants";
import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import CustomInput from "@/commonUI/Input";
import CustomReactSelect from "@/commonUI/ReactSelect";
import PurchaseDetail from "./(components)/purchase-detail";
import SIPDetail from "./(components)/sip-detail";

function FundCartTransaction({ cartData, cartSingleItem, singleItemIndex, setCartData }: any) {
  return (
    <div className="w-full">
      {cartSingleItem.trans_type == TransactionType.Purchase ? (
        <>
          <PurchaseDetail singleItemIndex={singleItemIndex} cartSingleItem={cartSingleItem} setCartData={setCartData} cartData={cartData} />
        </>
      ) : (
        <>
          <SIPDetail singleItemIndex={singleItemIndex} cartSingleItem={cartSingleItem} setCartData={setCartData} cartData={cartData}  />
        </>
      )}
    </div>
  );
}

export default FundCartTransaction;
