"use client";
import React, { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import Otp from "./otpPage";
import CustomInput from "@/commonUI/Input";
import CustomSelect from "@/commonUI/Select";
import CustomRadio from "@/commonUI/Radio";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";

import { CgCalendarDates } from "react-icons/cg";
import CustomButton from "@/commonUI/Button";

interface SipPopupProps {
  modalId?: string;
  showTriggerButton?: boolean;
  schemeData?: any;
  open: boolean;
  onClose: () => void;
}

const SipPopup: React.FC<SipPopupProps> = ({
  modalId = "SipDetailModel",
  schemeData,
  open,
  onClose,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  const [folioType, setFolioType] = useState("new");
  const [existingFolio, setExistingFolio] = useState("");
  const [amount, setAmount] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedFolio, setSelectedFolio] = useState("");
  const [noOfYearsDate, setNoOfYearsDate] = useState("");
  const [fromMandateDate, setFromMandateDate] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  const investorOptions = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];

  const accountOptions = [
    { id: 1, text: "John Doe" },
    { id: 2, text: "Jane Smith" },
  ];

  const folioOptions = [
    { id: 1, text: "321313" },
    { id: 2, text: "312311" },
  ];
  const FrequencyOptions = [
    { id: 1, text: "Daily" },
    { id: 3, text: "Weely" },
    { id: 4, text: "Monthly" },
    { id: 5, text: "Quarterly" },
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

  const closeModal = () => modalRef.current?.close();

  return (
    <>
      {/* {showTriggerButton && (
        <button onClick={openModal} className="btn btn-outline btn-primary">
          + One-Time
        </button>
      )} */}

      <dialog ref={modalRef} className="modal" id={modalId}>
        <div className="modal-box max-w-2xl rounded-3xl">
          {/* Header */}

          <div className="flex justify-between items-center border-b border-accent pb-4 mb-4">
            <h3 className="font-semibold text-md text-gray-950">SIP Detail</h3>
            <button onClick={onClose} className="btn btn-circle border-none">
              <RxCross2 className="text-[#9CA3AF] text-2xl" />
            </button>
          </div>

          {/* Fund Info */}
          <div className="mb-6 border-b border-accent pb-6 ">
            <h2 className="text-sm text-base-content font-medium mb-2">
              {schemeData?.ms_fullname}
            </h2>
            <p className="text-base-content text-xs  flex gap-2">
              <span>{schemeData?.SchemeCategory?.Name}</span> -
              <span>{schemeData?.SchemeSubcategory?.Name}</span>
            </p>
          </div>

          {/* Form Fields */}
          <div className="modalBody">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Investor Dropdown */}

              <div className="form-control flex flex-col gap-2">
                <CustomLabel>Investor</CustomLabel>

                <CustomSelect
                  items={investorOptions}
                  bindValue="name"
                  bindName="name"
                  // value={
                  //   investorOptions.find(
                  //     (opt) => opt.name === selectedInvestor
                  //   ) || null
                  // }
                  onChange={(option) =>
                    setSelectedInvestor(option ? option.name : "")
                  }
                />
              </div>

              {/* Account Holding Dropdown */}
              <div className="form-control flex flex-col gap-2">
                <CustomLabel>Account Holding</CustomLabel>
                {/* <div className="dropdown">
                <label
                  tabIndex={1}
                  className="btn w-full justify-between bg-[#111111]  border border-accent text-placeholder font-normal rounded-lg hover:bg-[#111111]"
                >
                  {selectedAccount || "Select"} <FaChevronDown />
                </label>
                <ul
                  tabIndex={1}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full"
                >
                  {accountOptions.map((acc) => (
                    <li key={acc.id}>
                      <a onClick={() => setSelectedAccount(acc.text)}>
                        {acc.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div> */}
                <CustomSelect
                  items={accountOptions}
                  bindValue="text"
                  bindName="text"
                  // value={
                  //   accountOptions.find((opt) => opt.text === selectedAccount) ||
                  //   null
                  // }
                  onChange={(option) =>
                    setSelectedAccount(option ? option.text : "")
                  }
                />
              </div>
            </div>
          </div>

          {/* Folio Type Radio */}
          <div className="form-control flex  gap-4 items-center  ">
            <div className="w-full">
              <div>
                <CustomLabel>Existing Folio</CustomLabel>
                <div className="flex gap-4 items-center w-full h-8">
                  <div className="flex gap-6 ">
                    <CustomLabel>
                      <CustomCheckbox
                        label="New"
                        name="folioType"
                        value="new"
                        checked={folioType === "new"}
                        onChange={() => setFolioType("new")}
                      />
                    </CustomLabel>
                    <CustomLabel className="cursor-pointer">
                      <CustomCheckbox
                        label="Existing"
                        name="folioType"
                        value="existing"
                        checked={folioType === "existing"}
                        onChange={() => setFolioType("existing")}
                      />
                    </CustomLabel>
                  </div>
                  {/* Existing Folio Dropdown */}
                  {folioType === "existing" && (
                    // </div>
                    <div className="form-control relative">
                      <CustomSelect
                        items={folioOptions}
                        bindValue="text"
                        bindName="text"
                        defaultValue={"Select an option"}
                        // value={
                        //   folioOptions.find((opt) => opt.text === selectedFolio) ||
                        //   null
                        // }
                        onChange={(option) =>
                          setSelectedFolio(option ? option.text : "")
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full">
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

          {/* Amount Input */}
          <div className="flex items-center gap-4 mb-4">
            <div className="form-control mt-2  w-full">
              <CustomLabel className="label">
                <span className="label-text  text-sm text-base-content mb-2">
                  Amount
                </span>
              </CustomLabel>

              <CustomInputIcon
                type="number"
                min={0}
                max={999999}
                placeholder="Enter Amount"
                icon="&#8377;"
                iconPosition="left"

                // onChange={(e: any) => {
                //   setValue("target_amt", e?.target?.value, {
                //     shouldValidate: true,
                //   });
                // }}
              />
            </div>

            <div className=" w-full mt-2 ">
              <CustomLabel>Date</CustomLabel>
              <CustomInput
                type="date"
                // icon={<CgCalendarDates />}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control   font-normal  text-sm ">
              <CustomLabel className="label">
                <span className="label-text  text-sm text-base-content mb-2">
                  No of Years
                </span>
              </CustomLabel>
              <CustomSelect
                items={yearOptions}
                bindValue="label"
                bindName="label"
                // value={
                //   yearOptions.find((opt) => opt.label === noOfYearsDate) || null
                // }

                onChange={(option) =>
                  setNoOfYearsDate(option ? option.label : "")
                }
              />
            </div>

            <div className="form-control text-base-content  font-normal  text-sm gap-2">
              <CustomLabel className="label">From Current Mandate</CustomLabel>
              <CustomSelect
                items={mandateOptions}
                bindValue="label"
                bindName="label"
                defaultValue="Select an Option"
                onChange={(option) =>
                  setFromMandateDate(option ? option.label : "")
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modalFooter mt-4">
            <CustomButton
              className="btn btn-primary w-1/3 rounded-2xl text-lg font-normal text-white"
              onClick={() => {
                console.log({
                  investor: selectedInvestor,
                  accountHolding: selectedAccount,
                  folioType,
                  existingFolio:
                    folioType === "existing" ? selectedFolio : null,
                  amount,
                  schemeData,
                });
                closeModal();

                setShowOtpModal(true);
              }}
            >
              Proceed
            </CustomButton>
          </div>
        </div>
      </dialog>
      <Otp
        open={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          // setDrawerOpen(false);
        }}
      />
    </>
  );
};

export default SipPopup;
