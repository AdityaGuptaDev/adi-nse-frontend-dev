"use client";

import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomReactSelect from "@/commonUI/ReactSelect";
import React, { useState } from "react";

function PurchaseDetail({
  cartData,
  cartSingleItem,
  singleItemIndex,
  setCartData,
}: any) {
  const [folioType, setFolioType] = useState("new");
  const [selectedFolio, setSelectedFolio] = useState("");
  const [amount, setAmount] = useState("");

  const folioOptions = [
    { id: 1, text: "1036895616" },
    { id: 2, text: "90413784226" },
  ];

  const onChangeFolioType = (type: any) => {
    setFolioType(type);
    updateCartItem(type, "folioType");
  };

  const handleSelectFolio = (value: any) => {
    setSelectedFolio(value);
    updateCartItem(value, "selectedFolio");
  };

  const handleAmount = (value: any) => {
    console.log(value, "valuevalue");
    setAmount(value);
    updateCartItem(value, "amount");
  };

  const updateCartItem = (value: any, type: any) => {
    const updatedCart = [...cartData]; // clone the original array

    if (type === "amount") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex], // clone the item
        amount: value,
      };
    }
    if (type === "folioType") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex], // clone the item
        folioType: value,
      };
    }
    if (type === "selectedFolio") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex], // clone the item
        selectedFolio: value,
      };
    }

    setCartData(updatedCart); // update the full array
  };

  return (
    <div className="w-full sm:flex gap-5">
      {/* Folio Type Radio */}
      {/* <div className="flex gap-4"> */}
      <div className="flex gap-6 items-center py-2">
        <label className="label cursor-pointer gap-2">
          <CustomCheckbox
            label="New"
            name="folioType"
            value="new"
            checked={folioType === "new"}
            onChange={() => onChangeFolioType("new")}
          />
        </label>
        <label className="label cursor-pointer gap-2">
          <CustomCheckbox
            label="Existing"
            name="folioType"
            value="existing"
            checked={folioType === "existing"}
            onChange={() => onChangeFolioType("existing")}
          />
        </label>
      </div>
      {/* </div> */}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-4 mb-4">
        {/* Existing Folio Dropdown */}
        {folioType === "existing" && (
          <div className="">
            <CustomReactSelect
              label="Select Folio"
              items={folioOptions}
              bindValue="text"
              bindName="text"
              value={selectedFolio}
              onChange={(option) =>
                handleSelectFolio(option ? option.text : "")
              }
              placeholder="Select Folio"
              isClearable={true}
            />
          </div>
        )}

        {/* Amount Input */}
        <div>
          <CustomInputIcon
            label="Amount"
            iconPosition="left"
            icon={"₹"}
            type="number"
            value={amount}
            onChange={(e) => handleAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetail;
