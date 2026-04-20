"use client";
import React, { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import Otp from "./otp-page";
import CustomInput from "@/commonUI/Input";
import CustomSelect from "@/commonUI/Select";
import CustomRadio from "@/commonUI/Radio";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import { CgCalendarDates } from "react-icons/cg";

interface SipPopupProps {
  modalId?: string;
  showTriggerButton?: boolean;
  schemeData?: any;
  onClose: () => void;
  open: boolean;
}

const SipPopup: React.FC<SipPopupProps> = ({
  modalId = "SipDetailModel",
  schemeData,
  open,
  onClose,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const otpModalRef = useRef<HTMLDialogElement>(null);

  const [folioType, setFolioType] = useState("new");
  const [existingFolio, setExistingFolio] = useState("");
  const [amount, setAmount] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedFolio, setSelectedFolio] = useState("");
  const [noOfYearsDate, setNoOfYearsDate] = useState("");
  const [fromMandateDate, setFromMandateDate] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");

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

  const openModal = () => modalRef.current?.showModal();

  useEffect(() => {
    if (open) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    if (showOtpModal) {
      otpModalRef.current?.showModal();
    } else {
      otpModalRef.current?.close();
    }
  }, [showOtpModal]);

  const closeModal = () => {
    modalRef.current?.close();
    if (onClose) onClose();
  };

  function setSelectedDate(arg0: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      {/* {showTriggerButton && (
        <button onClick={openModal} className="btn btn-outline btn-primary">
          + One-Time
        </button>
      )} */}

      <dialog ref={modalRef} className="modal " id={modalId}>
        <div className="modal-box max-w-2xl w-full rounded-3xl bg-[#111111] border border-[#2A2A2A]">
          {/* Header */}

          <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4 mb-4">
            <h3 className="font-semibold text-md text-[#F9FAFB]">SIP Detail</h3>
            <button onClick={closeModal} className="btn btn-circle border-none bg-transparent hover:bg-[#1F1A1A]">
              <RxCross2 className="text-[#9CA3AF] text-2xl" />
            </button>
          </div>

          {/* Fund Info */}
          <div className=" border-b border-[#2A2A2A] pb-6 ">
            <h2 className="text-sm text-[#F9FAFB] font-medium mb-2">
              {/* {schemeData?.ms_fullname} */}
              HDFC Mid-Cap Opportunities Gr
            </h2>
            <p className="text-[#9CA3AF] text-xs  flex gap-2">
              <span>
                {/* {schemeData?.SchemeCategory?.Name} */}
                Equity
              </span>
              -
              <span>
                {/* {schemeData?.SchemeSubcategory?.Name} */}
                Mid-Cap
              </span>
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* Investor Dropdown */}
            <div className="form-control ">
              <label className="label text-[#F9FAFB] text-sm">
                Investor
              </label>

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
            <div className="">
              <label className="label text-[#F9FAFB] text-sm">
                Account Holding
              </label>
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

          {/* Folio Type Radio */}
          <div className="form-control flex gap-5 ">
            <div className=" w-full  mt-5">
              <CustomLabel className="label text-[#F9FAFB] ">
                Existing Folio
              </CustomLabel>

              <div className="flex gap-5 h-8 items-center">
                <CustomLabel className="text-[#F9FAFB] cursor-pointer gap-2 ">
                  <CustomCheckbox
                    label="New"
                    name="folioType"
                    value="new"
                    checked={folioType === "new"}
                    onChange={() => setFolioType("new")}
                  />
                </CustomLabel>
                <CustomLabel className="text-[#F9FAFB] cursor-pointer">
                  <CustomCheckbox
                    label="Existing"
                    name="folioType"
                    value="existing"
                    checked={folioType === "existing"}
                    onChange={() => setFolioType("existing")}
                  />
                </CustomLabel>
                {/* Existing Folio Dropdown */}
                {folioType === "existing" && (
                  // </div>
                  <div className="form-control ">
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

            <div className="w-full my-3 ">
              <CustomLabel className="text-sm">Frequency</CustomLabel>
              <CustomSelect
                items={FrequencyOptions}
                bindValue="text"
                bindName="text"
                value={selectedFrequency}
                onChange={(option) =>
                  setSelectedDate(option ? option.text : "")
                }
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex items-center gap-4 mb-4">
            <div className="form-control  w-full">
              <CustomLabel className="label">
                <span className="label-text  text-sm text-[#F9FAFB] mb-2">
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
            <div className=" w-full ">
              <CustomLabel className="label">
                <span className="label-text  text-sm text-[#F9FAFB] mb-2">
                  Date
                </span>
              </CustomLabel>
              <CustomInput
                type="date"
                // icon={<CgCalendarDates />}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control   font-normal  text-sm ">
              <CustomLabel className="text-[#F9FAFB]">No of Years</CustomLabel>
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

            <div className="form-control text-[#F9FAFB]  font-normal  text-sm">
              <CustomLabel className="label text-[#F9FAFB]">From Current Mandate</CustomLabel>
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
          <div className="modal-action flex justify-center border-t border-[#2A2A2A] pt-4">
            <button
              className="btn bg-[#F59E0B] hover:bg-[#B45309] border-none w-1/3 rounded-2xl text-lg font-normal text-white"
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
            </button>
          </div>
        </div>
      </dialog>

      {showOtpModal && (
        <dialog ref={otpModalRef} className="modal">
          <Otp
            showOtpModal={showOtpModal}
            onClose={() => {
              setShowOtpModal(false);
              // setDrawerOpen(false);
            }}
          />
        </dialog>
      )}
    </>
  );
};

export default SipPopup;
