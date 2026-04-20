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
import { AlertCircle, X } from 'lucide-react';

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

  const endPoint = `/partner/getRmListDtl`;

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
      className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
    },
    {
      icon: <RxDashboard />,
      title: "Dashboard",
      tooltip: "Dashboard",
      show: true,
      className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
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

        localStorage.setItem("RM_LOGIN_DATA", JSON.stringify(loginData));

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
        <div className="bg-[#0A0A0A] min-h-screen">
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
          />
        </div>
      )}

      {/* Deactivate Modal */}
      {deactivateModal && (
        <div id="my_modal_2" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={deleteModalRef}>
          <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full border border-[#2A2A2A]">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#F9FAFB] mb-3">Deactivate Partner</h3>
              <p className="text-[#9CA3AF] mb-6">
                Are you sure you want to deactivate this Partner?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setDeActivateModal(false)}
                  className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoader}
                  className="px-6 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {deleteLoader ? "Processing..." : "Yes, Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
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

export default RmList;
