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
import { RiEdit2Line, RiUserUnfollowFill } from 'react-icons/ri';
import { GoPlusCircle } from 'react-icons/go';
import { AlertCircle, X } from 'lucide-react';

const partnerHeader = [
    {
        name: "Name",
        fieldName: "adhaarName",
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
        name: "PAN",
        fieldName: "pan",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "RM",
        fieldName: "RMRegistration.Name",
        sorting: true,
        filter: true,
        type: "text",
    },
   {
        name: "Status",
        fieldName: "is_delete",
        filter: true,
        type: "select",
        options: [
            { label: 'DeActive', value: true },
            { label: 'Active', value: false }
        ],
        formatter: (value: any) => (value ? "DeActive" : "Active"), // Convert boolean to string
        dataClass: (value: any) => (value ? "inActiveClass" : "activeClass"),
    },

];

function PartnerList(props: any) {
    const mappingModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const showInvModalRef = useRef<HTMLDivElement>(null);

    const [pageType, setpageType] = useState<pageTypes>("list");
    const [RMList, setRMList] = useState<any>([]);
    const [refreshKey, setRefreshKey] = useState<any>(0);
    const [mappingModal, setMappingModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [partnerData, setPartnerData] = useState<any>();
  const [deactivateModal, setDeActivateModal] = useState(false);
  const [investorId, setInvestorId] = useState<number | null>(null);
  const [showInvModal, setShowInvModal] = useState(false);
  const [headMemberList, setHeadMemberList] = useState<any>([]);
  const [deleteLoader, setDeleteLoader] = useState(false);

    const mappingOpenModal = () => setMappingModal(true);
    const mappingCloseModal = () => setMappingModal(false);

  const deleteOpenModal = () => setDeActivateModal(true);
  const deleteCloseModal = () => setDeActivateModal(false);

  const showInvOpenModal = () => setShowInvModal(true);
  const showInvCloseModal = () => setShowInvModal(false);

    const endPoint = `/partner/getAllPartnerList`;

    useEffect(() => {
        getRMList();
    }, [])

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        getValues,
    } = useForm({
        defaultValues: useMemo(() => {
            return {
                rm_id: null,
            };
        }, []),
    });

  const getRMList = async () => {
    try {
      let rm = await api.get(`/investor/getAllRMList`);
      setRMList(rm.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

    let actionButtons: any[] = [
          {
            icon: <RxDashboard />,
            title: "Dashboard",
            tooltip: "Dashboard",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
           {
            icon: <GoPlusCircle />,
            title: "Create Investor",
            tooltip: "create Investor",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
        {
            icon: <RiEdit2Line />,
            title: "Edit",
            tooltip: "edit",
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
            show: true,
        },
       
        {
            icon: <TbSitemap />,
            title: "Mapping",
            tooltip: "mapping",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
        {
            icon: <RiUserUnfollowFill />,
            title: "DeActive",
            tooltip: "DeActive",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
      
      
    ];

  // toggleform
  const toggleForm = (
    formType: pageTypes = pageType == "list" ? "add" : "list"
  ) => {
    setpageType(formType);
  };

  const clickOnAction = async (e: string, data: any) => {
    if (e == "Mapping") {
      setPartnerData(data);
      setValue("rm_id", data.rm_id, { shouldValidate: true });
      mappingOpenModal();
    }
    if (e == "DeActive") {
     
        deleteOpenModal();
         setPartnerData(data);

    }

    // if (e == "Dashboard") {
    //   try {
    //     // const payload = { userName: "gv@gmail.com", userTypeId: USER_TYPE.partner };
    //     const payload = {
    //       userName: data?.email,
    //       userTypeId: USER_TYPE.partner,
    //     };
    //     const res: any = await api.post(`/user/investor-login`, payload);

    //     const investorToken = res?.data?.data?.token;
    //     const investorUser = { ...res.data.data.user, ...res.data.data.meta }; // contains user, menu, meta, initPath, etc per your sample
    //     const investorMenu = res?.data?.data?.menu || [];
    //     const initPath = res?.data?.data?.initPath || "partner-dashboard";
    //     const filterData = res?.data?.data?.findFilterData;

    //     console.log(filterData, "filterData");
    //     if (!investorToken || !investorUser) {
    //       return toastAlert("error", "Unable to login as partner");
    //     }

    //     // Open new window with bootstrap route and pass data via query
    //     const url = new URL(window.location.origin + "/as-partner");
    //     url.searchParams.set(
    //       "data",
    //       encodeURIComponent(JSON.stringify(res.data.data))
    //     );

    //     window.open(url.toString(), "_blank", "noopener");
    //   } catch (error) {
    //     handleServerError(error);
    //   }
    // }

    if (e == "Dashboard") {
  try {
    const payload = {
      userName: data?.email,
      userTypeId: USER_TYPE.partner,
    };
    const res: any = await api.post(`/user/investor-login`, payload);

    const investorToken = res?.data?.data?.token;
    const investorUser = { ...res.data.data.user, ...res.data.data.meta };


    if (!investorToken || !investorUser) {
      return toastAlert("error", "Unable to login as partner");
    }

    // Add extra partner info to pass to dashboard
    const partnerInfo = {
      name: data?.adhaarName,
      email: data?.email,
      mobile: data?.mobile,
      pan: data?.pan,
      rm: data?.RMRegistration?.Name,
      regId: data?.regId,
    };

    // Merge with backend login response
    const fullData = {
      ...res.data.data,
      partnerInfo,
    };

    // Open Partner Dashboard page with query string
    const url = new URL(window.location.origin + "/as-investor");
localStorage.setItem("partnerLoginData", JSON.stringify(fullData));
window.open("/as-investor", "_blank");
  } catch (error) {
    handleServerError(error);
  }
}


    if (e === "Create Investor") {
  try {
    // optional confirmation
    const confirmAction = window.confirm(
      `Do you want to create investor for PAN ${data.pan}?`
    );
    if (!confirmAction) return;

    // you can also pass PAN or regId to the next page via query params
    const url = new URL(window.location.origin + "/initial-KYC");
    url.searchParams.set("pan", data.pan);
    url.searchParams.set("partnerId", data.regId);

    window.open(url.toString(), "_blank", "noopener"); // open in new tab
    // OR navigate in same tab:
    // window.location.href = url.toString();

  } catch (error) {
    handleServerError(error);
  }
}

  };

  const handleChange = (item: any, type: string) => {
    if (type === "rm") {
      const rm = item?.id || null;
      setValue("rm_id", rm, { shouldValidate: true });
    }
  };

  const handleCloseModal = () => {
    mappingCloseModal();
    reset({
      rm_id: null,
    });
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
      deleteCloseModal();
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
                            headerList={partnerHeader}
                            apiEndPoint={endPoint}
                            actionButtons={actionButtons}
                            clickOnAction={clickOnAction}
                            permission={props.permission}
                            toggleForm={toggleForm}
                            pageName={"Investor"}
                            backButton={true}
                        />
                    </div>
                </>
            ) : (
                <></>
            )}

            {/* Mapping Modal */}
            {mappingModal && (
                <div id="my_modal_1" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={mappingModalRef}>
                    <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full border border-[#2A2A2A]">
                        <div className="flex justify-between items-center p-5 border-b border-[#2A2A2A]">
                            <h3 className="text-lg font-bold text-[#F59E0B]">Mapping</h3>
                            <button
                                className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                                onClick={handleCloseModal}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="p-5">
                                <div className="py-2">
                                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                        Select RM <span className="text-[#F59E0B]">*</span>
                                    </label>
                                    <CustomReactSelect
                                        items={RMList}
                                        required
                                        placeholder="Select RM"
                                        bindName="Name"
                                        bindValue="id"
                                        value={getValues("rm_id")}
                                        {...register("rm_id")}
                                        isClearable={true}
                                        onChange={(e: any) => handleChange(e, "rm")}
                                        error={errors?.rm_id?.message}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center p-5 border-t border-[#2A2A2A]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
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
                                    onClick={() => deleteCloseModal()}
                                    className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete()}
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
                
                /* Custom React Select Styles */
                :global(.custom-react-select-container) {
                    width: 100%;
                }
                
                :global(.custom-react-select__control) {
                    background-color: #1F1A1A !important;
                    border-color: #2A2A2A !important;
                    min-height: 42px;
                }
                
                :global(.custom-react-select__control:hover) {
                    border-color: #F59E0B !important;
                }
                
                :global(.custom-react-select__control--is-focused) {
                    border-color: #F59E0B !important;
                    box-shadow: 0 0 0 1px #F59E0B !important;
                }
                
                :global(.custom-react-select__value-container) {
                    color: #F9FAFB !important;
                }
                
                :global(.custom-react-select__input-container) {
                    color: #F9FAFB !important;
                }
                
                :global(.custom-react-select__single-value) {
                    color: #F9FAFB !important;
                }
                
                :global(.custom-react-select__placeholder) {
                    color: #9CA3AF !important;
                }
                
                :global(.custom-react-select__menu) {
                    background-color: #1F1A1A !important;
                    border: 1px solid #2A2A2A !important;
                }
                
                :global(.custom-react-select__option) {
                    color: #F9FAFB !important;
                    background-color: #1F1A1A !important;
                }
                
                :global(.custom-react-select__option--is-focused) {
                    background-color: #2A2A2A !important;
                    color: #F59E0B !important;
                }
                
                :global(.custom-react-select__option--is-selected) {
                    background-color: #F59E0B !important;
                    color: white !important;
                }
                
                :global(.custom-react-select__indicator-separator) {
                    background-color: #2A2A2A !important;
                }
                
                :global(.custom-react-select__dropdown-indicator) {
                    color: #9CA3AF !important;
                }
                
                :global(.custom-react-select__dropdown-indicator:hover) {
                    color: #F59E0B !important;
                }
                
                :global(.custom-react-select__clear-indicator) {
                    color: #9CA3AF !important;
                }
                
                :global(.custom-react-select__clear-indicator:hover) {
                    color: #F59E0B !important;
                }
            `}</style>
        </>
    );
}

export default PartnerList;
