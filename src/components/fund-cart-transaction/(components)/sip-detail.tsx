"use client";

import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomSelect from "@/commonUI/Select";
import React, { useState } from "react";

function SIPDetail({
  cartData,
  cartSingleItem,
  singleItemIndex,
  setCartData,
}: any) {
  const [folioType, setFolioType] = useState("new");
  const [amount, setAmount] = useState("");
  const [selectedFolio, setSelectedFolio] = useState("");
  const [noOfYearsDate, setNoOfYearsDate] = useState("");
  const [fromMandateDate, setFromMandateDate] = useState("");
  const [selectFirstPurchase, setSelectFirstPurchase] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");

  const folioOptions = [
    { id: 1, text: "1036895616" },
    { id: 2, text: "90413784226" },
  ];

  const yearOptions = [
    { id: 1, label: "1 Year" },
    { id: 2, label: "3 Years" },
    { id: 3, label: "5 Years" },
    { id: 4, label: "10 Years" },
  ];

  const mandateOptions = [
    { id: 1, label: "Mandate A" },
    { id: 2, label: "Mandate B" },
    { id: 3, label: "Mandate C" },
  ];
  const FrequencyOptions = [
    { id: 1, text: "Daily" },
    { id: 3, text: "Weely" },
    { id: 4, text: "Monthly" },
    { id: 5, text: "Quarterly" },
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
    setAmount(value);
    updateCartItem(value, "amount");
  };

  const handleSelectYear = (value: any) => {
    setNoOfYearsDate(value);
    updateCartItem(value, "noOfYearsDate");
  };

  const handleMandateDate = (value: any) => {
    setFromMandateDate(value);
    updateCartItem(value, "fromMandateDate");
  };

  const handleFirstPurchase = (value: any) => {
    setSelectFirstPurchase(value);
    updateCartItem(value, "selectFirstPurchase");
  };

  const updateCartItem = (value: any, type: any) => {
    const updatedCart = [...cartData];

    if (type === "amount") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        amount: amount,
      };
    }
    if (type === "folioType") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        folioType: folioType,
      };
    }
    if (type === "selectedFolio") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        selectedFolio: selectedFolio,
      };
    }
    if (type === "noOfYearsDate") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        noOfYearsDate: noOfYearsDate,
      };
    }
    if (type === "fromMandateDate") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        fromMandateDate: fromMandateDate,
      };
    }
    if (type === "selectFirstPurchase") {
      updatedCart[singleItemIndex] = {
        ...updatedCart[singleItemIndex],
        selectFirstPurchase: selectFirstPurchase,
      };
    }

    setCartData(updatedCart);
  };

  function setSelectedDate(arg0: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="w-full sm:flex gap-5">
      {/* Folio Type Radio */}
      {/* <div className=" flex gap-4 "> */}
      <div className="flex gap-6 py-2">
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

      {/* Amount Input */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 items-start gap-4 gap-y-2 mb-4">
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

        {/* <div className="sm:col-span-2 grid grid-cols-2 gap-4"> */}
        <div className="">
          <CustomInput type="date" label="Date" />
        </div>

        {/* No of Years Dropdown */}
        <div className=" flex flex-col gap-2">
          <CustomReactSelect
            label="No of Years"
            items={yearOptions}
            bindValue="label"
            bindName="label"
            value={noOfYearsDate}
            onChange={(option) => handleSelectYear(option.label)}
            placeholder="Select No of Years"
            isClearable={true}
            className="outline-none"
          />
        </div>
        {/* </div> */}

        <div className=" flex flex-col gap-2">
          <CustomReactSelect
            label="From Current Mandate"
            items={mandateOptions}
            bindValue="label"
            bindName="label"
            value={fromMandateDate}
            onChange={(option) => handleMandateDate(option.label)}
            placeholder="Select Mandate"
            isClearable={true}
          />
        </div>

        <div className=" flex flex-col gap-2">
          <CustomLabel className="text-wrap">
            Execute with First purchase
          </CustomLabel>
          <div className="mb-2">
            <CustomCheckbox
              label="Yes"
              onClick={(e: any) => handleFirstPurchase(e.target.checked)}
            />
          </div>
        </div>

        <div className="w-full my-3 ">
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
    </div>
  );
}

export default SIPDetail;
