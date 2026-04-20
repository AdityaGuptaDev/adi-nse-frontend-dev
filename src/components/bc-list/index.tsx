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

function BcList(props: any) {
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

    const endPoint = `/partner/getAllBcList`;

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
      icon: <RiEdit2Line />,
      title: "Edit",
      tooltip: "edit",
      className: "p-2 bg-primary text-[#F9FAFB] rounded-lg",
      // show: props.permission.edit,
      show: true,
    },
    {
      icon: <TbSitemap />,
      title: "Mapping",
      tooltip: "mapping",
      show: true,
      className: "p-2 bg-primary text-[#F9FAFB] rounded-lg",
    },
    {
      icon: <RiUserUnfollowFill />,
      title: "DeActive",
      tooltip: "DeActive",
      show: true,
      className: "p-2 bg-primary text-[#F9FAFB] rounded-lg",
    },
    {
      icon: <RxDashboard />,
      title: "Dashboard",
      tooltip: "Dashboard",
      show: true,
      className: "p-2 bg-primary text-[#F9FAFB] rounded-lg",
    },
     {
        icon: <GoPlusCircle />, 
        title: "Create Investor",
        tooltip: "create Investor",
        show: true,
        className: "p-2 bg-primary text-[#F9FAFB] rounded-lg",
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
      userTypeId: USER_TYPE.BC,
    };
    const res: any = await api.post(`/user/investor-login`, payload);

    const investorToken = res?.data?.data?.token;
    const investorUser = { ...res.data.data.user, ...res.data.data.meta };
 

    if (!investorToken || !investorUser) {
      return toastAlert("error", "Unable to login as bc");
    }

    // Add extra partner info to pass to dashboard
    const bcInfo = {
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
      bcInfo,
    };

    // Open Partner Dashboard page with query string
    const url = new URL(window.location.origin + "/as-investor");
    url.searchParams.set("data", encodeURIComponent(JSON.stringify(fullData)));

    window.open(url.toString(), "_blank", "noopener");
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
              headerList={partnerHeader}
              apiEndPoint={endPoint}
              actionButtons={actionButtons}
              clickOnAction={clickOnAction}
              permission={props.permission}
              // permission={false}
              toggleForm={toggleForm}
              pageName={"Investor"}
              backButton={true}
            />
          </div>
        </>
      ) : (
        <></>
      )}

      {/* mapping model */}

      {mappingModal && (
        <div id="my_modal_1" className="modal modal-open" ref={mappingModalRef}>
          <div className="modal-box">
            <form method="dialog" className="modalHeader">
              <div className="flex-1 sm:flex justify-between">
                <h3 className="modalTitle">Mapping</h3>
              </div>
              <div className="">
                <button
                  className="btn btn-md btn-circle btn-ghost"
                  onClick={handleCloseModal}
                >
                  <MdClose size={25} />
                </button>
              </div>
            </form>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modalBody">
                <div className="py-4">
                  <div className="">
                    <div>
                      <CustomReactSelect
                        items={RMList}
                        required
                        label="Select RM"
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
                </div>
              </div>
              <div className="modalFooter modal-action flex justify-center">
                <div className="flex gap-5 mt-4 text-center">
                  <div>
                    <CustomButton
                      className="w-28"
                      type="submit"
                      loading={loading}
                    >
                      Submit
                    </CustomButton>
                  </div>
                  <div>
                    <CustomButton
                      className="bg-[#111111] !text-black !border !border-[#2A2A2A] w-28"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </CustomButton>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivateModal && (
        <div id="my_modal_2" className="modal modal-open" ref={deleteModalRef}>
          <div className="modal-box text-center">
            <div className="flex justify-center text-center my-2">
              <MdError className="text-red-600 w-14 h-14" />
            </div>
            <h3 className="text-xl font-bold">Deactivate Partner</h3>
            <p className="py-4">
              Are you sure you want to deactivate this Partner?
            </p>
            <div className="modal-action flex gap-5 justify-center items-center text-center">
              <form
                method="dialog"
                className="flex gap-5 justify-center items-center text-center"
              >
                <div className="mt-4 text-center">
                  <CustomButton
                    className="bg-[#111111] !text-black !border !border-[#2A2A2A] w-28"
                    onClick={() => {
                      deleteCloseModal();
                    }}
                  >
                    Cancel
                  </CustomButton>
                </div>

                <div className="mt-4 text-center">
                  <CustomButton
                    className="w-28"
                    loading={deleteLoader}
                    onClick={() => handleDelete()}
                  >
                    Yes
                  </CustomButton>
                </div>
                {/* <button className="btn" onClick={handleMFAllocation}>Close</button> */}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BcList;
