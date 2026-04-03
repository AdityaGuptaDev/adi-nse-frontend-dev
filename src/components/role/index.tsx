"use client";

import CustomButton from "@/commonUI/Button";
import api from "@/utils/api";
import { pageTypes } from "@/utils/constants";
import { handleServerError, toastAlert } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { RxEyeOpen } from "react-icons/rx";
import DataGrid from "../commonGrid/DataGrid";
import RoleForm from "./roleForm";

const roleHeader = [
  {
    name: "Role",
    fieldName: "roleName",
    sorting: true,
    filter: true,
  },
  {
    name: "Status",
    fieldName: "isActive",
    formatter: (value: boolean) => (value ? "Active" : "InActive"), // Convert boolean to string
    dataClass: (value: boolean) => (value ? "activeClass" : "inActiveClass"),
  },
];

function Role(props: any) {
  const [pageType, setpageType] = useState<pageTypes>("list");
  const [page, setPage] = useState<number>(1);
  const [roleData, setRoleData] = useState<any>();
  const [isView, setIsView] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<any>(0);
  const [usersType, setUsersType] = useState<any>([]);

  const endPoint = `/role/getAllRoles`;
  // const Header = generateColumns(roleHeader,  actionButtons , clickOnAction);

  let actionButtons: any[] = [
    {
      icon: <RxEyeOpen />,
      title: "View",
      tooltip: "view",
      show: props.permission.view,
    },
    {
      icon: <RiEdit2Line />,
      title: "Edit",
      tooltip: "edit",
      show: props.permission.edit,
    },
    {
      icon: <RiDeleteBinLine />,
      title: "Delete",
      tooltip: "delete",
      // confirmBox: {
      //   title: "Are you sure ?",
      //   confirmText: "Yes",
      //   cancelText: "Cancel",
      // },
      show: props.permission.delete,
    },
  ];

  useEffect(() => {
    getUsersType();
  }, []);

  const getUsersType = async () => {
    try {
      let users = await api.get(`user/getAllUserType`);
      setUsersType(users.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  // toggleform
  const toggleForm = (
    formType: pageTypes = pageType == "list" ? "add" : "list"
  ) => {
    if (formType == "list") {
      setRoleData("");
      setIsView(false);
      setIsEdit(false);
    }
    setpageType(formType);
  };

  const clickOnAction = async (e: string, data: any) => {
    if (e == "View") {
      setIsView(true);
      setRoleData(data);
      toggleForm("view");
    }

    if (e == "Edit") {
      setIsEdit(true);
      setRoleData(data);
      toggleForm("edit");
    }

    if (e == "Delete") {
      try {
        if (data.id) {
          const apiRes = await api.delete(`role/deleteRole/${data.id}`);
          const result = apiRes?.data?.data;
          if(result) {
            setRefreshKey((prev: any) => prev + 1);
            toastAlert("success", "Delete Successfullly");
          }
        }
      } catch (error: any) {
        handleServerError(error);
      }
    }
  };

  return (
    <>
      {pageType !== "list" ? (
        <>
          <div className="p-3">
            <CustomButton
              className="flex !text-secondary normal-case bg-transparent p-0 shadow-none"
              onClick={(e) => {
                toggleForm("list");
              }}
            >
              <IoIosArrowBack className="h-6 w-6" /> Back
            </CustomButton>
          </div>
        </>
      ) : null}

      {pageType == "list" ? (
        <>
          <div>
            <DataGrid
              refreshKey={refreshKey}
              headerList={roleHeader}
              apiEndPoint={endPoint}
              actionButtons={actionButtons}
              clickOnAction={clickOnAction}
              permission={props.permission}
              toggleForm={toggleForm}
              pageName={"Role"}
              backButton={true}
            />
          </div>
        </>
      ) : (
        <RoleForm
          data={roleData}
          isView={isView}
          isEdit={isEdit}
          toggleForm={toggleForm}
          usersType={usersType}
        />
      )}
      {/* </div> */}
    </>
  );
}

export default Role;
