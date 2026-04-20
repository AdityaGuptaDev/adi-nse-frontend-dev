"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import { NODE_API_URL, pageTypes } from "@/utils/constants";
import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import GoalPlanForm from "./goal-plan-form";
import api from "@/utils/api";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { MdClose } from "react-icons/md";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { IoMdArrowRoundBack } from "react-icons/io";

function GoalList() {
  const [pageType, setpageType] = useState<pageTypes>("list");
  const [goalTypesList, setGoalTypesList] = useState<any>([]);
  const [editGoalItem, setEditGoalItem] = useState<any>();
  const [pageTitle, setPageTitle] = useState<any>();
  const [deleteGoalId, setDeleteGoalId] = useState();

  const deleteModalRef = useRef<HTMLDialogElement>(null);

  const handleOpen = () => {
    deleteModalRef.current?.showModal();
  };

  const handleClose = (e: any) => {
    e.preventDefault();
    deleteModalRef.current?.close();
  };


  useEffect(() => {
    getGoalsTypes();
  }, []);

  // toggleform
  const toggleForm = (
    formType: pageTypes = pageType == "list" ? "add" : "list"
  ) => {
    if (formType == "list") {
    }
    if (formType == "add") {
      setPageTitle("Add");
    }
    setpageType(formType);
  };

  const getGoalsTypes = async () => {
    try {
      let goalTypes = await api.get(`/goal-plan/getAllGoalType`);
      setGoalTypesList(goalTypes?.data?.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const onEditGoalChange = (item: any) => {
    try {
      setEditGoalItem(item);
      toggleForm("add");
      setPageTitle("Edit");
    } catch (error) {
      handleServerError(error);
    }
  };

  const onDeleteGoalChange = async (item: any) => {
    try {

      let deleteData: any = await api.delete(
        `/goal-plan/deleteGoalPlan/${deleteGoalId}`
      );

      if (deleteData.data) {
        getGoalsTypes();
        handleClose;
        toastAlert("success", "Goal Deleted Successfully");
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  return (
    <>
      {pageType == "list" ? (
        <>
          <div className="p-4 flex justify-between items-center">
            <div className="flex gap-5">
              <CustomBackButton onClick={() => window.history.back()}>
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
              </CustomBackButton>
              <CustomText className="text-xl font-montserrat font-semibold mt-1">
                Goal List
              </CustomText>
            </div>
            <CustomButton
              onClick={(e) => {
                toggleForm("add");
              }}
            >
              New
            </CustomButton>
          </div>
          <div className="border-b border-accent"></div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {goalTypesList.length > 0 &&
                goalTypesList.map((item: any, index: number) => {
                  return (
                    <div key={index}>
                      <div
                        className="group border border-[#2A2A2A] rounded-lg p-2 h-36 flex flex-col items-center  justify-center relative hover:shadow-xl transition"
                      //   onClick={() => handleNewGoal(item)}
                      >
                        <img
                          //   src={`${publicPathName}/goalplanning/${item.goal_icon}`}
                          src={`/goalplanning/${item.goal_icon}`}
                          alt={item.goal_name}
                          className="max-h-full max-w-full object-contain"
                        />

                        <span
                          className="absolute bottom-0 left-0 bg-primary text-[#F9FAFB] text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:cursor-pointer"
                          onClick={() => onEditGoalChange(item)}
                        >
                          Edit
                        </span>
                        {item.goal_name !== "Custom" ? (
                          <span
                            className="absolute bottom-0 right-0 bg-primary text-[#F9FAFB] text-xs px-3 py-1 rounded-br-lg rounded-tl-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:cursor-pointer"
                            onClick={() => { handleOpen(), setDeleteGoalId(item.id) }}
                          >
                            Delete
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm text-center mt-2">
                          {item.goal_name}
                        </p>
                      </div>
                      {deleteGoalId === item.id ? (
                        <dialog
                          id="my_modal"
                          className="modal"
                          ref={deleteModalRef}
                        >
                          <div className="modal-box">
                            <h3 className="text-lg font-bold text-center">
                              Are you sure
                            </h3>
                            <p className="py-4 text-base text-center">
                              You won't be able to revert this
                            </p>
                            <div className="modal-action justify-center">
                              <form method="dialog flex">
                                <button
                                  className="btn btn-primary text-[#F9FAFB] mr-4"
                                  onClick={() => onDeleteGoalChange(item)}
                                >
                                  Yes
                                </button>
                                <button
                                  className="btn bg-[#111111]"
                                  type="button"
                                  onClick={handleClose}
                                >
                                  Close
                                </button>
                              </form>
                            </div>
                          </div>
                        </dialog>
                      ) : null}

                    </div>
                  );
                })}
            </div>
          </div>
        </>
      ) : (
        <GoalPlanForm
          toggleForm={toggleForm}
          getGoalsTypes={getGoalsTypes}
          editGoalItem={editGoalItem}
          setEditGoalItem={setEditGoalItem}
          pageTitle={pageTitle}
        // schemeOpenModal={schemeOpenModal}
        // schemeCloseModal={schemeCloseModal}
        // schemeModalRef={schemeModalRef}
        />
      )}
    </>
  );
}

export default GoalList;
