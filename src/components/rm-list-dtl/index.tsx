"use client";

import CustomButton from '@/commonUI/Button';
import CustomReactSelect from '@/commonUI/ReactSelect';
import api from '@/utils/api';
import { pageTypes, USER_TYPE } from '@/utils/constants';
import { handleServerError, toastAlert } from '@/utils/helpers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoIosArrowBack } from 'react-icons/io';
import { MdClose, MdError } from 'react-icons/md';
import { TbSitemap } from "react-icons/tb";
import DataGrid from '../commonGrid/DataGrid';
import { RxDashboard } from 'react-icons/rx';
import { RiUserUnfollowFill } from 'react-icons/ri';

const partnerHeader = [
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
    name: "Mobile No.",
    fieldName: "mobile",
    sorting: true,
    filter: true,
    type: "text",
  },
  {
    name: "RM",
    fieldName: "rm",
    sorting: true,
    filter: true,
    type: "text",
  },
  {
    name: "Status",
    fieldName: "status",
    filter: true,
    type: "select",
    options: [
      { label: 'Active', value: "true" },
      { label: 'DeActive', value: "false" }
    ],
    formatter: (value: any) => (value === "true" ? "Active" : "DeActive"),
    dataClass: (value: any) => (value === "true" ? "activeClass" : "inActiveClass"),
  },
];

function RmList(props: any) {
  const mappingModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  const [pageType, setpageType] = useState<pageTypes>("list");
  const [RMList, setRMList] = useState<any>([]);
  const [refreshKey, setRefreshKey] = useState<any>(0);
  const [mappingModal, setMappingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState<any>();
  const [deactivateModal, setDeActivateModal] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const endPoint = `/partner/getRmListDtl`; // Correct endpoint

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    defaultValues: useMemo(() => ({ rm_id: null }), []),
  });

  let actionButtons: any[] = [
    {
      icon: <RiUserUnfollowFill />,
      title: "DeActive",
      tooltip: "DeActive",
      show: true,
      className: "p-2 bg-primary text-white rounded-lg",
    },
    {
      icon: <RxDashboard />,
      title: "Dashboard",
      tooltip: "Dashboard",
      show: true,
      className: "p-2 bg-primary text-white rounded-lg",
    },
  ];

  const clickOnAction = async (e: string, data: any) => {
    if (e === "Mapping") {
      setPartnerData(data);
      setValue("rm_id", data.rm_id || null, { shouldValidate: true });
      setMappingModal(true);
    }

    if (e === "DeActive") {
      setPartnerData(data);
      setDeActivateModal(true);
    }

    if (e === "Dashboard") {
      try {
        const payload = {
          userName: data?.email,
          userTypeId: USER_TYPE.RM,
        };

        const res: any = await api.post(`/user/investor-login`, payload);

        const loginData = res?.data?.data;

        if (!loginData?.token) {
          return toastAlert("error", "Unable to login as RM");
        }

        // store login data temporarily
        localStorage.setItem("RM_LOGIN_DATA", JSON.stringify(loginData));

        // open RM dashboard
        window.open("/as-partner", "_blank");

      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const handleCloseModal = () => {
    setMappingModal(false);
    reset({ rm_id: null });
  };

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (!values.rm_id) {
        setLoading(false);
        return toastAlert("error", "Please select rm");
      }

      let resData: any = await api.put(
        `/partner/updatePartner/${partnerData?.regId}`,
        values
      );

      if (resData.data) {
        toastAlert("success", resData.data.msg);
        handleCloseModal();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoader(true);
      let resData: any = await api.delete(
        `/partner/deactivatePartner/${partnerData?.regId}`
      );
      if (resData.data) {
        setDeleteLoader(false);
        setDeActivateModal(false);
        setRefreshKey((prev: any) => prev + 1);
        toastAlert("success", resData.data.msg);
      }
    } catch (error) {
      setDeleteLoader(false);
      handleServerError(error);
    }
  };

  return (
    <>
      {pageType === "list" && (
        <div>
          <DataGrid
            refreshKey={refreshKey}
            headerList={partnerHeader}
            apiEndPoint={endPoint}
            actionButtons={actionButtons}
            clickOnAction={clickOnAction}
            permission={props.permission}
            toggleForm={setpageType}
            pageName={"RM"}
            backButton={true}
          //enableFilter={true}   
          //clearFilter={true}    
          />
        </div>
      )}

      {/* Deactivate Modal */}
      {deactivateModal && (
        <div id="my_modal_2" className="modal modal-open" ref={deleteModalRef}>
          <div className="modal-box text-center">
            <div className="flex justify-center my-2">
              <MdError className="text-red-600 w-14 h-14" />
            </div>
            <h3 className="text-xl font-bold">Deactivate Partner</h3>
            <p className="py-4">Are you sure you want to deactivate this Partner?</p>
            <div className="modal-action flex gap-5 justify-center">
              <CustomButton
                className="bg-white !text-black !border !border-gray-300 w-28"
                onClick={() => setDeActivateModal(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                className="w-28"
                loading={deleteLoader}
                onClick={handleDelete}
              >
                Yes
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RmList;
