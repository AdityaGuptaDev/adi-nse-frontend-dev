"use client";

import CustomButton from "@/commonUI/Button";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomInput from "@/commonUI/Input";
import CustomText from "@/commonUI/Text";
import api from "@/utils/api";
import { NODE_API_URL, publicPathName, toFixedDataForReturn } from "@/utils/constants";
import { handleServerError } from "@/utils/helpers";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FaCircle, FaStar } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { MdClose, MdError } from "react-icons/md";

function RuralFundExplore() {
  const suggestedSchemeModalRef = useRef<HTMLDialogElement>(null);

  const [amount, setAmount] = useState<{ [id: string]: number }>({});
  const [firstAmount, setFirstAmount] = useState(500);
  const [secondAmount, setSecondAmount] = useState(500);
  const [threeAmount, setThreeAmount] = useState(500);
  const [schemeList, setSchemeList] = useState<any>([]);

  const suggestedSchemeOpenModal = () => {
    suggestedSchemeModalRef.current?.showModal();
  };

  const suggestedSchemeCloseModal = () => {
    suggestedSchemeModalRef.current?.close();
  };

  const handleOnEdit = () => {
    suggestedSchemeOpenModal();
  };

  const handleBackSchemeModel = () => {
    suggestedSchemeCloseModal();
  }

  useEffect(() => {
    getSchemeList();
  }, [])

  const getSchemeList: any = async () => {
    try {

      let res: any = await api.get(`/wo-kyc-fund/get-scheme-by-wo-kyc`);

      console.log(res, "resres")
      if (res.data.data) {
        setSchemeList(res.data.data);
      }
    } catch (error) {
      handleServerError(error);
    }
  }

  return (
    <>
      <div className="pageTitle">
        <CustomText className="text-xl font-montserrat font-semibold mt-1">
          Fund Explore
        </CustomText>
      </div>

      <div className="pt-4">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="text-start font-semibold">Scheme</th>
                <th className="text-start font-semibold">Category</th>
                <th className="text-center font-semibold">Return 3 Yrs.</th>
                <th className="text-start font-semibold">Rating</th>
                <th className="text-center font-semibold">SIP</th>
                {/* <th className="text-center"></th> */}
              </tr>
            </thead>
            <tbody>
              {!schemeList.length ? (
                <>
                  <tr>
                    <td colSpan={3}>
                      No Data Found!
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  {
                    schemeList.length && schemeList.map((item: any, i: number) => {
                      return (
                        <Fragment key={i}>
                          <tr className="">
                            <td className="text-start w-4/12">
                              <div className="flex gap-4">
                                <div>
                                  {/* <img
                                src={`${publicPathName}/Kotak.png`}
                              /> */}
                                  <img
                                    src={`${NODE_API_URL}/static/amc_logo/${item?.SchemeMaster?.AMCMaster?.amc_logo}`}
                                    className="w-10 h-10 min-w-10 min-h-10 object-contain"
                                  />
                                </div>
                                <div className="mt-3 text-secondary-content font-normal">
                                  {item?.SchemeMaster?.ms_fullname}
                                </div>
                              </div>
                            </td>
                            <td className="text-center w-2/12">
                              <div className="flex items-center gap-4">
                                <FaCircle size={10} className="text-secondary-content" />
                                <span>{item?.SchemeMaster?.SchemeSubcategory?.Name}</span>
                              </div>
                            </td>
                            <td className="text-center w-2/12">{toFixedDataForReturn(
                              item?.SchemeMaster?.SchemePerformances?.[0]?.Returns3yr
                            )}</td>
                            <td className="text-start w-1/12">
                              {/* <div className="flex gap-2 text-primary">
                            5
                            <span>
                              <FaStar className="text-lg" />
                            </span>
                          </div> */}
                              <div className="flex justify-center items-center gap-2">
                                {item?.SchemeMaster?.SchemePerformances?.[0]?.OverallRating ? (
                                  <>
                                    {item?.SchemeMaster?.SchemePerformances[0]?.OverallRating}
                                    <FaStar className="text-primary text-lg" />
                                  </>
                                ) : (
                                  "--"
                                )}
                              </div>
                            </td>
                            <td className="w-1/12">
                              <CustomInput className="w-8 " value={amount[item?.SchemeMaster?.id] || 500} type="number" min={0}
                                onChange={(e: any) => {
                                  setAmount({
                                    ...amount,
                                    [item?.SchemeMaster?.id]: Number(e.target.value),
                                  });
                                }} />
                            </td>
                            {/* <td className="w-2/12 text-center items-center cursor-pointer">
                    <FiEdit size={25} onClick={handleOnEdit} />
                  </td> */}
                          </tr>
                        </Fragment>
                      )
                    })
                  }
                </>
              )}

              {/* <tr className="">
                <td className="text-start w-4/12">
                  <div className="flex gap-4">
                    <div>
                      <img
                        src={`${publicPathName}/Kotak.png`}
                      />
                    </div>
                    <div className="mt-3 text-secondary-content font-normal">
                      ICICI Pru Large & Mid Cap Gr
                    </div>
                  </div>
                </td>
                <td className="text-center w-2/12">
                  <div className="flex items-center gap-4">
                    <FaCircle size={10} className="text-secondary-content" />
                    <span>Large & Midcap</span>
                  </div>
                </td>
                <td className="text-center w-2/12">26.84%</td>
                <td className="text-start w-1/12">
                  <div className="flex gap-2 text-primary">
                    5
                    <span>
                      <FaStar className="text-lg" />
                    </span>
                  </div>
                </td>
                <td className="w-1/12">
                  <CustomInput className="w-8 " value={firstAmount} type="number" min={0} onChange={(e: any) => setFirstAmount(e.target.value)} />
                </td>
              </tr>
              <tr className="">
                <td className="text-start w-4/12">
                  <div className="flex gap-4">
                    <div>
                      <img src={`${publicPathName}/Kotak.png`} />
                    </div>
                    <div className="mt-3 text-secondary-content font-normal">
                      Nippon India Large Cap Gr
                    </div>
                  </div>
                </td>
                <td className="text-center w-2/12">
                  <div className="flex items-center gap-4">
                    <FaCircle size={10} className="text-secondary-content" />
                    <span>Large Cap</span>
                  </div>
                </td>
                <td className="text-center w-2/12">21.79%</td>
                <td className="text-start w-1/12">
                  <div className="flex gap-2 text-primary">
                    5
                    <span>
                      <FaStar className="text-lg" />
                    </span>
                  </div>
                </td>
                <td className="w-1/12">
                  <CustomInput className="w-8" value={secondAmount} type="number" min={0} onChange={(e: any) => setSecondAmount(e.target.value)} />
                </td>
              </tr>
              <tr className="">
                <td className="text-start w-4/12">
                  <div className="flex gap-4">
                    <div>
                      <img src={`${publicPathName}/Kotak.png`} />
                    </div>
                    <div className="mt-3 text-secondary-content font-normal">
                      HDFC Mid-Cap Opportunities Gr
                    </div>
                  </div>
                </td>
                <td className="text-center w-2/12">
                  <div className="flex items-center gap-4">
                    <FaCircle size={10} className="text-secondary-content" />
                    <span>Mid Cap</span>
                  </div>
                </td>
                <td className="text-center w-2/12">33.38%</td>
                <td className="text-start w-1/12">
                  <div className="flex gap-2 text-primary">
                    5
                    <span>
                      <FaStar className="text-lg" />
                    </span>
                  </div>
                </td>
                <td className="w-1/12">
                  <CustomInput className="w-8" value={threeAmount} type="number" min={0} onChange={(e: any) => setThreeAmount(e.target.value)} />
                </td>
              </tr> */}
            </tbody>
          </table>
        </div>

        <div className="pageTitle"></div>

        <div className="p-4 flex justify-end text-end">
          <div>
            <CustomButton
              className="w-32"
            //   onClick={() => router.push(`/fund-explore`)}
            >
              Next
            </CustomButton>
          </div>
        </div>
      </div>

      {/* suggested scheme */}
      <dialog id="my_modal_1" className="modal" ref={suggestedSchemeModalRef}>
        <div className="modal-box p-0 max-w-7xl">
          <form
            method="dialog"
            className="flex justify-between items-center px-5 py-3"
          >
            <h3 className="text-lg font-montserrat">Suggested Scheme</h3>
            {/* <button className="btn btn-md btn-circle btn-ghost">✕</button> */}
            <div className="flex gap-5 justify-center items-center">
              {/* <CustomText className="text-black">
                Risk Profile - Moderate
              </CustomText> */}
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={handleBackSchemeModel}
              >
                <MdClose size={25} />
              </button>
              {/* <CustomText className="text-black">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div></div>
          <div className="border-b border-accent"></div>
          <div className="mt-0">
            <div className="h-full">
              <div className="p-0">
                <div className="mt-0 overflow-y-auto max-h-[500px] px-5">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="text-center"></th>
                          <th className="text-start">Scheme</th>
                          <th className="text-center">Category</th>
                          <th className="text-center">Return 3 Yrs.</th>
                          <th className="text-start">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="">
                          <td className="w-1/12 text-center items-center">
                            <CustomCheckbox />
                          </td>
                          <td className="text-start w-4/12">
                            <div className="flex gap-4">
                              <div>
                                <img src={`${publicPathName}/Kotak.png`} />
                              </div>
                              <div className="mt-3 text-secondary-content font-normal">
                                ICICI Pru Large & Mid Cap Gr
                              </div>
                            </div>
                          </td>
                          <td className="text-center w-2/12">
                            <div className="flex items-center gap-4">
                              <FaCircle
                                size={10}
                                className="text-secondary-content"
                              />
                              <span>Large & Midcap</span>
                            </div>
                          </td>
                          <td className="text-center w-2/12">26.84%</td>
                          <td className="text-start w-1/12">
                            <div className="flex gap-2 text-primary">
                              5
                              <span>
                                <FaStar className="text-lg" />
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr className="">
                          <td className="w-1/12 text-center items-center">
                            <CustomCheckbox />
                          </td>
                          <td className="text-start w-4/12">
                            <div className="flex gap-4">
                              <div>
                                <img src={`${publicPathName}/Kotak.png`} />
                              </div>
                              <div className="mt-3 text-secondary-content font-normal">
                                Nippon India Large Cap Gr
                              </div>
                            </div>
                          </td>
                          <td className="text-center w-2/12">
                            <div className="flex items-center gap-4">
                              <FaCircle
                                size={10}
                                className="text-secondary-content"
                              />
                              <span>Large Cap</span>
                            </div>
                          </td>
                          <td className="text-center w-2/12">21.79%</td>
                          <td className="text-start w-1/12">
                            <div className="flex gap-2 text-primary">
                              5
                              <span>
                                <FaStar className="text-lg" />
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr className="">
                          <td className="w-1/12 text-center items-center">
                            <CustomCheckbox />
                          </td>
                          <td className="text-start w-4/12">
                            <div className="flex gap-4">
                              <div>
                                <img src={`${publicPathName}/Kotak.png`} />
                              </div>
                              <div className="mt-3 text-secondary-content font-normal">
                                HDFC Mid-Cap Opportunities Gr
                              </div>
                            </div>
                          </td>
                          <td className="text-center w-2/12">
                            <div className="flex items-center gap-4">
                              <FaCircle
                                size={10}
                                className="text-secondary-content"
                              />
                              <span>Mid Cap</span>
                            </div>
                          </td>
                          <td className="text-center w-2/12">33.38%</td>
                          <td className="text-start w-1/12">
                            <div className="flex gap-2 text-primary">
                              5
                              <span>
                                <FaStar className="text-lg" />
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-accent"></div>
            <div className="flex justify-center gap-3">
              <div className="my-4 text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-36"
                  onClick={handleBackSchemeModel}
                >
                  Back
                </CustomButton>
              </div>
              <div
                className="mt-4 text-center"
                onClick={handleBackSchemeModel}
              >
                <CustomButton className="w-36" type="submit">
                  Proceed
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default RuralFundExplore;
