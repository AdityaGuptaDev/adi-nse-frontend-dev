"use client";
import React, { useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomReactSelect from "@/commonUI/ReactSelect";
import Otp from "./otpPage";
import CustomSelect from "@/commonUI/Select";
import CustomLabel from "@/commonUI/Label";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";

interface PurchaseDetailPopupProps {
  modalId?: string;
  showTriggerButton?: boolean;
  schemeData?: any;
}

const PurchaseDetailPopup: React.FC<PurchaseDetailPopupProps> = ({
  modalId = "purchaseDetailModal",
  showTriggerButton = true,
  schemeData,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const [folioType, setFolioType] = useState("new");
  const [existingFolio, setExistingFolio] = useState("");
  const [amount, setAmount] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedFolio, setSelectedFolio] = useState("");

  const investorOptions = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];

  const accountOptions = [
    { id: 1, text: "John Doe" },

    { id: 2, text: "Jane Smith" },
  ];

  const folioOptions = [
    { id: 1, text: "12345" },
    { id: 2, text: "423234" },
  ];

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  return (
    <>
      <dialog ref={modalRef} className="modal" id={modalId}>
        <div className="modal-box max-w-2xl w-full rounded-3xl">
          {/* Header */}
          <div className="modalHeader mb-4">
            <h3 className="font-semibold text-md text-gray-950">
              Purchase Detail
            </h3>
            <button onClick={closeModal} className="btn btn-circle border-none">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investor Dropdown */}
            <div className="form-control ">
              <CustomLabel className="CustomLabel  text-black text-sm">
                Investor
              </CustomLabel>

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
            <div className="form-control ">
              <CustomLabel>Account Holding</CustomLabel>

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
          <CustomLabel className="CustomLabel  text-base-content  mt-3">
            Existing Folio
          </CustomLabel>
          <div className="form-control  ">
            <div className="flex gap-6 h-10 items-center ">
              <div className="flex gap-6 ">
                <CustomLabel className="cursor-pointer ">
                  <CustomCheckbox
                    label="New"
                    name="folioType"
                    value="new"
                    checked={folioType === "new"}
                    onChange={() => setFolioType("new")}
                  />
                </CustomLabel>
                <CustomLabel>
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

          {/* Amount Input */}
          <div className="form-control w-3xs">
            <CustomLabel>Amount</CustomLabel>

            <CustomInputIcon
              type="number"
              min={0}
              max={999999}
              placeholder="Enter"
              icon="&#8377;"
              iconPosition="left"

              // onChange={(e: any) => {
              //   setValue("target_amt", e?.target?.value, {
              //     shouldValidate: true,
              //   });
              // }}
            />
          </div>

          {/* Actions */}
          <div className="modal-action flex justify-center border-t pt-6 border-accent">
            <button
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
            </button>
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

export default PurchaseDetailPopup;
