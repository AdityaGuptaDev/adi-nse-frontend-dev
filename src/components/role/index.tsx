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
    formatter: (value: boolean) => (value ? "Active" : "InActive"),
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
      show: props.permission.delete,
      className: "p-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-lg hover:opacity-90 transition-all",
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
        </>
      ) : null}

      {pageType == "list" ? (
        <>
          <div className="bg-[#0A0A0A] min-h-screen">
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

export default Role;