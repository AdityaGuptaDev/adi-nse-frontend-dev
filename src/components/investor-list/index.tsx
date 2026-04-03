"use client";

import CustomButton from '@/commonUI/Button';
import CustomCheckbox from '@/commonUI/CheckBox';
import CustomReactSelect from '@/commonUI/ReactSelect';
import CustomText from '@/commonUI/Text';
import api from '@/utils/api';
import { ADD_MEMBER, MEMBER_DATA, MEMBER_TYPE, pageTypes, USER_DATA, USER_TYPE } from '@/utils/constants';
import { dateFormater, getLS, handleServerError, removeLS, setLS, toastAlert } from '@/utils/helpers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoIosArrowBack } from 'react-icons/io';
import { MdClose, MdError } from 'react-icons/md';
import { RiEdit2Line, RiUserUnfollowFill } from 'react-icons/ri';
import { TbSitemap } from "react-icons/tb";
import DataGrid from '../commonGrid/DataGrid';
import KYC from '../initial-KYC';
import { RxDashboard } from "react-icons/rx";
import { GoPlusCircle } from 'react-icons/go';
import { toast } from 'react-toastify';


const investorHeader = [
    {
        name: "Name",
        fieldName: "name",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Family Head",
        fieldName: "GroupLeader.name",
        // formatter: (value: any) => {
        //     console.log(value, "value?.group_leader_id")
        //     if (value.group_leader_id !== 0 || value.group_leader_id !== null) {
        //         return value?.GroupLeader?.name
        //     } else {
        //         return "--";
        //     }
        // },
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Partner",
        fieldName: "UserRegistration.adhaarName",
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
        name: "BC",
        fieldName: "BcRegistration.adhaarName",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Email",
        fieldName: "reg_email",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Mobile No.",
        fieldName: "reg_mobile",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "DOB",
        fieldName: "dob",
        formatter: (value: any) => (value ? dateFormater(value) : "--"),
        sorting: true,
        filter: true,
        type: "date",
    },
    {
        name: "Gender",
        fieldName: "Gender.gender",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "PAN No.",
        fieldName: "pan_no",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Member Type",
        fieldName: "member_type",
        formatter: (value: any) => (value === MEMBER_TYPE.OWNER ? "Owner" : "Member"),
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "User Type",
        fieldName: "user_type",
        // formatter: (value: any) => (value === '>=50K' ? "Equal And Above 50K" : "Less Than 50K"), // Convert boolean to string
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "Annual Fund",
        fieldName: "annualFund",
        formatter: (value: any) => (value === ">=50K" ? "Equal And Above 50K" : "Less than 50K"),
        type: "select",
        options: [
            { label: 'Equal And Above 50K', value: ">=50K" },
            { label: 'Less than 50K', value: "<50K" }
        ],
        sorting: true,
        filter: true,
    },
    {
        name: "Tax Status",
        fieldName: "TaxStatus.status",
        sorting: true,
        filter: true,
        type: "text",
    },
    {
        name: "KYC Status",
        fieldName: "isKYCDone",
        filter: true,
        type: "select",
        options: [
            { label: 'Done', value: true },
            { label: 'Pending', value: false }
        ],
        formatter: (value: any) => (value ? "Done" : "Pending"), // Convert boolean to string
        dataClass: (value: any) => (value ? "activeClass" : "inActiveClass"),
    },
    {
        name: "Status",
        fieldName: "isDelete",
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


function InvestorList(props: any) {

    const mappingModalRef = useRef<HTMLDivElement>(null);
    const deleteModalRef = useRef<HTMLDivElement>(null);
    const showInvModalRef = useRef<HTMLDivElement>(null);

    // const mappingOpenModal = () => {
    //     mappingModalRef.current?.showModal();
    // };

    // const mappingCloseModal = () => {
    //     mappingModalRef.current?.close();
    // };

    const [pageType, setpageType] = useState<pageTypes>("list");
    const [familyHeadList, setFamilyHeadList] = useState<any>([]);
    const [partnerList, setPartnerList] = useState<any>([]);
    const [BCList, setBCList] = useState<any>([]);
    const [RMList, setRMList] = useState<any>([]);
    const [refreshKey, setRefreshKey] = useState<any>(0);
    const [mappingModal, setMappingModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteLoader, setDeleteLoader] = useState(false);
    const [investorData, setInvestorData] = useState<any>();
    const [disablePartner, setDisablePartner] = useState(false);
    const [disableBC, setDisableBC] = useState(false);
    const [disableRM, setDisableRM] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [investorId, setInvestorId] = useState<number | null>(null);
    const [showInvModal, setShowInvModal] = useState(false);
    const [headMemberList, setHeadMemberList] = useState([]);
    const [isAllInvesFamilyHead, setIsAllInvesFamilyHead] = useState(false);
    const [error, setError] = useState({
        isError: false,
        msg: ""
    })




    const mappingOpenModal = () => setMappingModal(true);
    const mappingCloseModal = () => setMappingModal(false);

    const deleteOpenModal = () => setDeleteModal(true);
    const deleteCloseModal = () => setDeleteModal(false);

    const showInvOpenModal = () => setShowInvModal(true);
    const showInvCloseModal = () => setShowInvModal(false);

    const endPoint = `/investor/getAllInvestorList`;

    useEffect(() => {
        getFamilyHeadList();
        getPartnerList();
        getRMList();
        getBCList();
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
                group_leader_id: null,
                partner_id: null,
                bc_id: null,
                rm_id: null,
            };
        }, []),
    });



    const getFamilyHeadList = async () => {
        try {
            let familyHead = await api.get(`/investor/getAllFamilyHeadList`);
            setFamilyHeadList(familyHead.data.data);
        } catch (error) {
            handleServerError(error);
        }
    };

    const getPartnerList = async () => {
        try {
            let partner = await api.get(`/investor/getAllPartnerList`);
            setPartnerList(partner.data.data);
        } catch (error) {
            handleServerError(error);
        }
    };

    const getRMList = async () => {
        try {
            let rm = await api.get(`/investor/getAllRMList`);
            setRMList(rm.data.data);
        } catch (error) {
            handleServerError(error);
        }
    };

    const getBCList = async () => {
        try {
            let bc = await api.get(`/investor/getAllBcList`);
            setBCList(bc.data.data);
        } catch (error) {
            handleServerError(error);
        }
    };

    let actionButtons: any[] = [
        // {
        //     icon: <RxEyeOpen />,
        //     title: "View",
        //     tooltip: "view",
        //     show: props.permission.view,
        // },
        {
            icon: <RiEdit2Line />,
            title: "Edit",
            tooltip: "edit",
            className: "p-2 bg-primary text-white rounded-lg",

            show: props.permission.edit,
        },
        {
            icon: <TbSitemap />,
            title: "Mapping",
            tooltip: "mapping",
            show: true,
            className: "p-2 bg-primary text-white rounded-lg",
        },
        {
            icon: <GoPlusCircle />,
            title: "Create Partner",
            tooltip: "create partner",
            show: true,
            className: "p-2 bg-primary text-white rounded-lg",
        },
        {
            icon: <GoPlusCircle />,
            title: "Create Bc",
            tooltip: "create bc",
            show: true,
            className: "p-2 bg-primary text-white rounded-lg",
        },
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
        }
        // {
        //     icon: <RiDeleteBinLine />,
        //     title: "Delete",
        //     tooltip: "delete",
        //     confirmBox: {
        //         title: "Are you sure ?",
        //         confirmText: "Yes",
        //         cancelText: "Cancel",
        //     },
        //     show: props.permission.delete,
        // },
    ];

    // toggleform
    const toggleForm = (
        formType: pageTypes = pageType == "list" ? "add" : "list"
    ) => {
        console.log('formType', formType)
        if (formType != 'edit') {

            const getUser = getLS(USER_DATA);
            delete getUser.InvestorRegistration;
            removeLS(ADD_MEMBER);
            removeLS(MEMBER_DATA);
            setLS(USER_DATA, getUser);

        }


        setpageType(formType);
    };

    const clickOnAction = async (e: string, data: any) => {

        if (e == "Mapping") {
            setInvestorData(data);
            setValue("group_leader_id", data.group_leader_id, { shouldValidate: true });
            setValue("partner_id", data.partner_id, { shouldValidate: true });
            setValue("bc_id", data.bc_id, { shouldValidate: true });
            setValue("rm_id", data.rm_id, { shouldValidate: true });
            if (data.partner_id) {
                setDisableRM(!!data.partner_id);
                setDisablePartner(false);
            }

            if (data.rm_id) {
                // disable Partner if rm is selected
                setDisablePartner(!!data.rm_id);
                setDisableRM(false);
            }
            if (data.bc_id) {

                setDisableRM(!!data.bc_id);
                setDisableBC(false);
            }

            mappingOpenModal();
        }

        if (e === "Create Partner") {
            const confirmAction = window.confirm(
                `Do you want to create ${data.name} as partner?`
            );
            if (!confirmAction) return;

            try {
                setLoading(true);

                const res: any = await api.post(
                    `/partner/convertInvToPartner?userId=${data.user_id}`
                );

                setLoading(false);
                console.log("Response =====================", res.data.data.msg, res)

                if (res?.data?.data?.data !== null) {
                    toastAlert(
                        "success",
                        res.data.data.msg || `${data.name} is now a Partner!`
                    );
                } else {
                    toastAlert(
                        "error",
                        res.data.data.msg
                    );
                }


            } catch (error: any) {
                setLoading(false);
                toastAlert("error", error.message || "Something went wrong");
            }
        }

        if (e === "Create Bc") {
            const confirmAction = window.confirm(
                `Do you want to create ${data.name} as bc?`
            );
            if (!confirmAction) return;

            try {
                setLoading(true);

                const res: any = await api.post(
                    `/partner/convertInvToBc?userId=${data.user_id}`
                );

                setLoading(false);
                console.log("Response =====================", res.data.data.msg, res)

                if (res?.data?.data?.data !== null) {
                    toastAlert(
                        "success",
                        res.data.data.msg || `${data.name} is now a Bc!`
                    );
                } else {
                    toastAlert(
                        "error",
                        res.data.data.msg
                    );
                }


            } catch (error: any) {
                setLoading(false);
                toastAlert("error", error.message || "Something went wrong");
            }
        }

        if (e == "DeActive") {

            setInvestorId(data.id);

            let res: any = await api.get(`/investor/findFamilyHeadList/${data.id}`);

            let result = res.data.data;

            let familyHead = result.map((item: any) => item.name);

            let findInType = result.find((item: any) => item?.TaxStatus?.status === 'Minor');

            if (findInType) {
                return toastAlert("error", "Cannot be deleted because this investor has a minor linked under them.");
            }

            setHeadMemberList(familyHead);

            if (result.length > 0) {
                showInvOpenModal();
            } else {
                deleteOpenModal();
            }

        }

        if (e == 'Edit') {
            console.log(data)
            const getUser = getLS(USER_DATA);
            getUser.InvestorRegistration = data;
            console.log(getUser)
            setTimeout(() => {
                setLS(USER_DATA, { ...getUser, InvestorRegistration: data });
                toggleForm("edit");
            }, 1000);

        }

        if (e == 'Dashboard') {
            try {
                const payload = {
                    userName: data.reg_email,
                    userTypeId: USER_TYPE.InvestorRegistration
                };

                const res: any = await api.post(`/user/investor-login`, payload);

                const loginData = res?.data?.data;

                if (!loginData?.token) {
                    return toastAlert("error", "Unable to login as investor");
                }

                // store login data temporarily
                localStorage.setItem("partnerLoginData", JSON.stringify(loginData));

                // open dashboard
                window.open("/as-investor", "_blank");

            } catch (error) {
                handleServerError(error);
            }
        }

    };


    const handleChange = (item: any, type: string) => {
        if (type === "family_head") {
            const member_id = item?.id || null;
            setValue("group_leader_id", member_id, { shouldValidate: true });
        } else if (type === "partner") {
            const partner = item?.regId || null;
            const rm = item?.rm_id || null;
            setValue("partner_id", partner, { shouldValidate: true });
            setValue("rm_id", rm, { shouldValidate: true });
            setDisableRM(!!partner);
            setDisablePartner(false);
            setDisableBC(false);
        } else if (type === "rm") {
            const rm = item?.id || null;
            setValue("rm_id", rm, { shouldValidate: true });
            setDisablePartner(!!rm);
            setDisableRM(false);
            setDisableBC(false);
        } else if (type === "bc") {
            const bc = item?.regId || null;
            setValue("bc_id", bc, { shouldValidate: true });
            setDisableRM(!!bc);
            setDisableBC(false);
        }
    };

    const handleCloseModal = () => {
        mappingCloseModal();
        setDisablePartner(false);
        setDisableBC(false);
        setDisableRM(false);
        reset({
            group_leader_id: null,
            partner_id: null,
            rm_id: null,
            bc_id: null,
        });
    }

    const onSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (!values.partner_id && !values.rm_id && !values.bc_id) {
                setLoading(false);
                return toastAlert("error", "Please select partner, rm, or bc");
            }

            // let filtered = Object.fromEntries(
            //     Object.entries(values).filter(([_, v]) => v !== null && v !== undefined && v !== "")
            // );

            let resData: any = await api.put(`/investor/updateIvestor/${investorData?.id}`, values);

            if (resData.data) {
                toastAlert("success", resData.data.msg);
                setRefreshKey((prev: any) => prev + 1);

                handleCloseModal();
            }

            setLoading(false);

        } catch (error) {
            setLoading(false);
            handleServerError(error);
        }
    }

    const handleDelete = async () => {
        try {
            setDeleteLoader(true);
            let resData: any = await api.delete(`/investor/deleteInvestor/${investorId}`);
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
    }

    const handleInvestorMapping = async () => {
        try {
            if (!isAllInvesFamilyHead) {
                // Map all investors as family heads
                return toastAlert("error", "Please confirm if all investors are family heads.");
            }

            let resData: any = await api.delete(`/investor/investorMappingUpdate/${investorId}`);

            if (resData.data) {
                toastAlert("success", resData.data.msg);
                setIsAllInvesFamilyHead(false);
                setRefreshKey((prev: any) => prev + 1);

                handleDelete();
                showInvCloseModal();
            }

        } catch (error) {
            console.error("Error mapping investors:", error);
            handleServerError(error);
        }
    }

    const onChangeCloseInvestorList = () => {
        showInvCloseModal();
        setIsAllInvesFamilyHead(false);
    }

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
                            headerList={investorHeader}
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
                <div className='mt-0'>

                    <KYC />
                </div>
            )}

            {/* mapping model */}

            {mappingModal && (
                <div id="my_modal_1" className="modal modal-open" ref={mappingModalRef}>
                    <div className="modal-box max-w-3xl">
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
                                    <div className='grid grid-cols-3 gap-4'>
                                        <div>
                                            <CustomReactSelect
                                                items={familyHeadList}
                                                required
                                                label="Family Head"
                                                placeholder="Select Family Head"
                                                bindName="name"
                                                bindValue="id"
                                                value={getValues("group_leader_id")}
                                                {...register("group_leader_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "family_head")}
                                                error={errors?.group_leader_id?.message}
                                            // disabled={isView ? true : false}
                                            />
                                        </div>
                                        <div>
                                            <CustomReactSelect
                                                items={partnerList}
                                                required
                                                label="Select Partner"
                                                placeholder="Select Partner"
                                                bindName="adhaar_name"
                                                bindValue="regId"
                                                value={getValues("partner_id")}
                                                {...register("partner_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "partner")}
                                                error={errors?.partner_id?.message}
                                                // disabled={watch("rm_id") ? true : false}
                                                disabled={disablePartner}
                                            />
                                        </div>
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
                                                // disabled={watch("partner_id") ? true : false}
                                                disabled={disableRM}
                                            />
                                        </div>
                                        <div>
                                            <CustomReactSelect
                                                items={BCList}
                                                required
                                                label="Select BC"
                                                placeholder="Select BC"
                                                bindName="adhaar_name"
                                                bindValue="regId"
                                                value={getValues("bc_id")}
                                                {...register("bc_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "bc")}
                                                error={errors?.bc_id?.message}
                                                // disabled={watch("rm_id") ? true : false}
                                                disabled={disableBC}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="modalFooter modal-action flex justify-center">
                                {/* <form method="dialog"> */}
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
                                            className="bg-white !text-black !border !border-gray-300 w-28"
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </CustomButton>
                                    </div>
                                </div>
                                {/* </form> */}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* delete investor model */}

            {deleteModal && (
                <div id="my_modal_2" className="modal modal-open" ref={deleteModalRef}>
                    <div className="modal-box text-center">
                        <div className="flex justify-center text-center my-2">
                            <MdError className="text-red-600 w-14 h-14" />
                        </div>
                        <h3 className="text-xl font-bold">Delete Investor</h3>
                        <p className="py-4">Are you sure you want to delete this investor?</p>
                        <div className="modal-action flex gap-5 justify-center items-center text-center">
                            <form
                                method="dialog"
                                className="flex gap-5 justify-center items-center text-center"
                            >
                                <div className="mt-4 text-center">
                                    <CustomButton
                                        className="bg-white !text-black !border !border-gray-300 w-28"
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

            {/* investor list model */}

            {showInvModal && (
                <div id="my_modal_1" className="modal modal-open" ref={showInvModalRef}>
                    <div className="modal-box max-w-3xl">
                        <form method="dialog" className="modalHeader">
                            <div className="flex-1 sm:flex justify-between">
                                <h3 className="modalTitle">Investor List</h3>
                            </div>
                            <div className="">
                                <button
                                    className="btn btn-md btn-circle btn-ghost"
                                    onClick={onChangeCloseInvestorList}
                                >
                                    <MdClose size={25} />
                                </button>
                            </div>
                        </form>
                        <div className="modalBody">
                            <div className='p-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    {headMemberList.map((member: any, index: any) => (
                                        <div key={index}>
                                            <CustomText className='text-sm'>{member}</CustomText>
                                        </div>
                                    ))}
                                </div>
                                <div className='mt-10'>
                                    <CustomCheckbox
                                        labelClassName='text-base text-red-600'
                                        label="Are you sure you want to delete the investor and remove them from the member mapping?"
                                        checked={isAllInvesFamilyHead}
                                        onChange={(e: any) => setIsAllInvesFamilyHead(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modalFooter modal-action flex justify-center">
                            {/* <form method="dialog"> */}
                            <div className="flex gap-5 mt-4 text-center">
                                <div>
                                    <CustomButton
                                        className="w-28"
                                        type="submit"
                                        onClick={handleInvestorMapping}
                                    // loading={loading}
                                    >
                                        Yes
                                    </CustomButton>
                                </div>
                                <div>
                                    <CustomButton
                                        className="bg-white !text-black !border !border-gray-300 w-28"
                                        onClick={onChangeCloseInvestorList}
                                    >
                                        Cancel
                                    </CustomButton>
                                </div>
                            </div>
                            {/* </form> */}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default InvestorList