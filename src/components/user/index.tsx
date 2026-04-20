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
    formatter: (value: boolean) => (value ? "Active" : "InActive"),
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
      className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
    },
    {
      icon: <RiEdit2Line />,
      title: "Edit",
      tooltip: "edit",
      show: props.permission.edit,
      className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
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
      show: (row: any) =>
        props.permission.delete && row['UserMappings.userType_id'] !== USER_TYPE.superAdmin,
      className: "p-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-lg hover:opacity-90 transition-all",
    },
    {
      icon: <RxDashboard />,
      title: "Dashboard",
      tooltip: "Dashboard",
      show: (row: any) => {
        return row["UserMappings.userType_id"] === USER_TYPE.RM;
      },
      className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
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
      } 
    }
    if (e == "Dashboard") {
      try {
        const payload = {
          userName: data?.email,
          userTypeId: USER_TYPE.RM,
        };
        const res: any = await api.post(`/user/investor-login`, payload);

        const investorToken = res?.data?.data?.token;
        const investorUser = { ...res.data.data.user, ...res.data.data.meta };
        const investorMenu = res?.data?.data?.menu || [];
        const initPath = res?.data?.data?.initPath || "rm-dashboard";
        const filterData = res?.data?.data?.findFilterData;

        console.log(filterData, "filterData");
        if (!investorToken || !investorUser) {
          return toastAlert("error", "Unable to login as RM");
        }

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
      {pageType !== "list" ? (
        <div className="p-3 bg-[#0A0A0A]">
          <CustomButton
            className="flex !text-[#F59E0B] normal-case bg-transparent p-0 shadow-none hover:!text-[#FBBF24] transition-colors"
            onClick={(e) => {
              toggleForm("list");
            }}
          >
            <IoIosArrowBack className="h-6 w-6 mr-2" /> Back
          </CustomButton>
        </div>
      ) : null}

      {pageType == "list" ? (
        <>
          <div className="bg-[#0A0A0A] min-h-screen">
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

      <style jsx>{`
        :global(.activeClass) {
          color: #10B981;
          background-color: rgba(16, 185, 129, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-block;
        }
        
        :global(.inActiveClass) {
          color: #EF4444;
          background-color: rgba(239, 68, 68, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-block;
        }
        
        :global(.data-grid-container) {
          background-color: #0A0A0A;
        }
        
        :global(.data-grid-table) {
          background-color: #111111;
          border-color: #2A2A2A;
        }
        
        :global(.data-grid-table th) {
          background-color: #1F1A1A;
          color: #F59E0B;
          border-bottom-color: #2A2A2A;
        }
        
        :global(.data-grid-table td) {
          color: #F9FAFB;
          border-bottom-color: #2A2A2A;
        }
        
        :global(.data-grid-table tr:hover) {
          background-color: #1F1A1A;
        }
        
        :global(.data-grid-pagination button) {
          background-color: #111111;
          border-color: #2A2A2A;
          color: #F9FAFB;
        }
        
        :global(.data-grid-pagination button:hover:not(:disabled)) {
          background-color: #1F1A1A;
          border-color: #F59E0B;
          color: #F59E0B;
        }
        
        :global(.data-grid-pagination button.active) {
          background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
          color: white;
          border-color: transparent;
        }
        
        :global(.data-grid-search input) {
          background-color: #111111;
          border-color: #2A2A2A;
          color: #F9FAFB;
        }
        
        :global(.data-grid-search input::placeholder) {
          color: #9CA3AF;
        }
        
        :global(.data-grid-search input:focus) {
          border-color: #F59E0B;
          ring-color: #F59E0B;
        }
        
        :global(.data-grid-filter select) {
          background-color: #111111;
          border-color: #2A2A2A;
          color: #F9FAFB;
        }
        
        :global(.data-grid-filter select:focus) {
          border-color: #F59E0B;
          ring-color: #F59E0B;
        }
        
        :global(.data-grid-filter select option) {
          background-color: #111111;
          color: #F9FAFB;
        }
        
        :global(.data-grid-header) {
          background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
        }
        
        :global(.data-grid-header h2) {
          color: white;
        }
        
        :global(.data-grid-header button) {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        :global(.data-grid-header button:hover) {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}

export default User;