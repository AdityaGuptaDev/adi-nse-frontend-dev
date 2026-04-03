"use client";
import React, { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomReactSelect from "@/commonUI/ReactSelect";
import Otp from "./otp-page";
import CustomSelect from "@/commonUI/Select";
import CustomLabel from "@/commonUI/Label";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";

interface PurchaseDetailPopupProps {
  modalId?: string;
  showTriggerButton?: boolean;
  schemeData?: any;
  onClose?: () => void;
  open: boolean;
}

const PurchaseDetailPopup: React.FC<PurchaseDetailPopupProps> = ({
  modalId = "purchaseDetailModal",
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
  const openModal = () => modalRef.current?.showModal();
  // const closeModal = () => modalRef.current?.close();

  console.log(showOtpModal, "shoshowOtpModal");

  return (
    <>
      <dialog ref={modalRef} className="modal" id={modalId}>
        <div className="modal-box max-w-2xl w-full rounded-3xl">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-accent pb-4 mb-4">
            <h3 className="font-semibold text-md text-gray-950">
              Purchase Detail
            </h3>
            <button onClick={closeModal} className="btn btn-circle border-none">
              <RxCross2 className="text-gray-500 text-2xl" />
            </button>
          </div>

          {/* Fund Info */}
          <div className="mb-6 border-b border-accent pb-6 ">
            <h2 className="text-sm text-base-content font-medium mb-2">
              {/* {schemeData?.ms_fullname} */}
              HDFC Mid-Cap Opportunities Gr
            </h2>
            <p className="text-base-content text-xs  flex gap-2">
              <span>{/* {schemeData?.SchemeCategory?.Name} */} Equity</span> -
              <span>{/* {schemeData?.SchemeSubcategory?.Name} */} Mid-Cap</span>
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investor Dropdown */}
            <div className="form-control flex flex-col gap-2">
              <label className="label text-black text-sm">Investor</label>

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
              <label className="label text-black text-sm">
                Account Holding
              </label>

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
          <CustomLabel className="label text-base-content  mt-6">
            Existing Folio
          </CustomLabel>
          <div className="form-control  ">
            <div className="flex gap-6 h-14 items-center ">
              <div className="flex gap-6 ">
                <CustomLabel className="text-gray-950 cursor-pointer gap-2 ">
                  <CustomCheckbox
                    label="New"
                    name="folioType"
                    value="new"
                    checked={folioType === "new"}
                    onChange={() => setFolioType("new")}
                  />
                </CustomLabel>
                <CustomLabel className="text-gray-950 cursor-pointer gap-2">
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
          <div className="form-control   w-3xs">
            <CustomLabel className="label">
              <span className="label-text  text-sm text-base-content mb-2">
                Amount
              </span>
            </CustomLabel>

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

export default PurchaseDetailPopup;
