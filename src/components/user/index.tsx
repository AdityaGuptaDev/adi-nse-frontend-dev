"use client";

import React, { useEffect, useReducer, useState } from "react";
import HeaderArea from "../moduleUi/headerArea";
import Link from "next/link";
import { GoPlusCircle } from "react-icons/go";
import { IoIosArrowBack } from "react-icons/io";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { RxDashboard, RxEyeOpen } from "react-icons/rx";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { pageTypes, DefaultItemsPerPage, ROLE, USER_TYPE } from "@/utils/constants";
import api from "@/utils/api";
import DataGrid from "../commonGrid/DataGrid";
import UserForm from "./userForm";
import CustomButton from "@/commonUI/Button";

const header = [
  {
    name: "Name",
    fieldName: "name",
    sorting: true,
    filter: true,
    type: "text",
  },
  {
    name: "Email",
    fieldName: "email",
    sorting: true,
    filter: true,
    type: "text",
  },
  {
    name: "Role",
    fieldName: "UserMappings.Role.roleName",
    sorting: true,
    filter: true,
    type: "text",
  },
  {
    name: "Status",
    fieldName: "isActive",
    formatter: (value: boolean) => (value ? "Active" : "InActive"), // Convert boolean to string
    dataClass: (value: boolean) => (value ? "activeClass" : "inActiveClass"),
  },
];

function User(props: any) {
  const [pageType, setpageType] = useState<pageTypes>("list");
  const [roleList, setRoleList] = useState<any>([]);
  const [userData, setUserData] = useState<any>();
  const [isView, setIsView] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<any>(0);
  const [usersType, setUsersType] = useState<any>([]);

  const endPoint = `/user/getAllUser`;

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
      confirmBox: {
        title: "Are you sure ?",
        confirmText: "Yes",
        cancelText: "Cancel",
      },
      // show: props.permission.delete,
      show: (row: any) =>
        props.permission.delete && row['UserMappings.userType_id'] !== USER_TYPE.superAdmin, // 👈 hide delete if roleId = 1
    },
    {
      icon: <RxDashboard />,
      title: "Dashboard",
      tooltip: "Dashboard",
      show: (row: any) => {
        return row["UserMappings.userType_id"] === USER_TYPE.RM;
      },
    },
  ];

  useEffect(() => {
    getRoleList();
    getUsersType();
  }, []);

  const getRoleList = async () => {
    try {
      let roles = await api.get(`role/getRoles`);
      setRoleList(roles.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const getUsersType = async () => {
    try {
      let users = await api.get(`user/getAllUserType`);
      setUsersType(users.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  // toggleform
  const toggleForm = async(
    formType: pageTypes = pageType == "list" ? "add" : "list"
  ) => {
    if (formType == "list") {
      setUserData("");
      setIsEdit(false);
      setIsView(false);
    }
    setpageType(formType);
  };

  const clickOnAction = async (e: string, data: any) => { 
    if (e == "View") {
      setIsView(true);
      setUserData(data);
      toggleForm("view");
    }
    if (e == "Edit") {
      setIsEdit(true);
      setUserData(data);
      toggleForm("edit");
    }
    if (e == "Delete") {
      try {
        if (data.id) {
          const apiRes: any = await api.delete(`user/deleteUser/${data.id}`);
          const result = apiRes?.data?.data;
          if (apiRes.data.msg) {
            setRefreshKey((prev: any) => prev + 1);
            toastAlert("success", "Delete Successfullly");
          }
        }
      } catch (error: any) {
        handleServerError(error);
      } }
      if (e == "Dashboard") {
        try {
          // const payload = { userName: "gv@gmail.com", userTypeId: USER_TYPE.partner };
          const payload = {
            userName: data?.email,
            userTypeId: USER_TYPE.RM,
          };
          const res: any = await api.post(`/user/investor-login`, payload);
  
          const investorToken = res?.data?.data?.token;
          const investorUser = { ...res.data.data.user, ...res.data.data.meta }; // contains user, menu, meta, initPath, etc per your sample
          const investorMenu = res?.data?.data?.menu || [];
          const initPath = res?.data?.data?.initPath || "rm-dashboard";
          const filterData = res?.data?.data?.findFilterData;
  
          console.log(filterData, "filterData");
          if (!investorToken || !investorUser) {
            return toastAlert("error", "Unable to login as RM");
          }
  
          // Open new window with bootstrap route and pass data via query
          const url = new URL(window.location.origin + "/as-user");
          url.searchParams.set(
            "data",
            encodeURIComponent(JSON.stringify(res.data.data))
          );
  
          window.open(url.toString(), "_blank", "noopener");
        } catch (error) {
          handleServerError(error);
        }
      }
    };

  return (
    <>
      {/* <HeaderArea title="User"> */}
      {pageType !== "list" ? (
        //   <>
        //     {props.permission.add ? <CustomButton  className="flex text-proses-secondary normal-case justify-end-end" onClick={(e) => {
        //       toggleForm("add");
        //     }}>
        //       <GoPlusCircle className="h-4 w-4 mr-1" /> Add User
        //     </CustomButton> : null}
        //   </>
        // ) : (
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
      ) : null}
      {/* )} */}
      {/* </HeaderArea> */}

      {pageType == "list" ? (
        <>
          <div>
            <DataGrid
              refreshKey={refreshKey}
              headerList={header}
              apiEndPoint={endPoint}
              actionButtons={actionButtons}
              clickOnAction={clickOnAction}
              permission={props.permission}
              toggleForm={toggleForm}
              pageName={"User"}
              backButton={true}
            />
          </div>
        </>
      ) : (
        <UserForm
          data={userData}
          isView={isView}
          isEdit={isEdit}
          toggleForm={toggleForm}
          roleList={roleList}
          usersTypeList={usersType}
        />
      )}
    </>
  );
}

export default User;
