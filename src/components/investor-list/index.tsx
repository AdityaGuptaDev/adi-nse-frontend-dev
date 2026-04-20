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
import { AlertCircle, X } from 'lucide-react';

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
        formatter: (value: any) => (value ? "Done" : "Pending"),
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
        formatter: (value: any) => (value ? "DeActive" : "Active"),
        dataClass: (value: any) => (value ? "inActiveClass" : "activeClass"),
    },
];

function InvestorList(props: any) {

    const mappingModalRef = useRef<HTMLDivElement>(null);
    const deleteModalRef = useRef<HTMLDivElement>(null);
    const showInvModalRef = useRef<HTMLDivElement>(null);

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
        {
            icon: <RiEdit2Line />,
            title: "Edit",
            tooltip: "edit",
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
            show: props.permission.edit,
        },
        {
            icon: <TbSitemap />,
            title: "Mapping",
            tooltip: "mapping",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
        {
            icon: <GoPlusCircle />,
            title: "Create Partner",
            tooltip: "create partner",
            show: true,
            className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        },
        // {
        //     icon: <GoPlusCircle />,
        //     title: "Create Bc",
        //     tooltip: "create bc",
        //     show: true,
        //     className: "p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all",
        // },
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
        }
    ];

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

                localStorage.setItem("partnerLoginData", JSON.stringify(loginData));
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
                            headerList={investorHeader}
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
                <div className='mt-0'>
                    <KYC />
                </div>
            )}

            {/* Mapping Modal */}
            {mappingModal && (
                <div id="my_modal_1" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={mappingModalRef}>
                    <div className="bg-[#111111] rounded-xl shadow-2xl max-w-4xl w-full border border-[#2A2A2A]">
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
                                <div className="py-4">
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                        <div>
                                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                                Family Head
                                            </label>
                                            <CustomReactSelect
                                                items={familyHeadList}
                                                required
                                                placeholder="Select Family Head"
                                                bindName="name"
                                                bindValue="id"
                                                value={getValues("group_leader_id")}
                                                {...register("group_leader_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "family_head")}
                                                error={errors?.group_leader_id?.message}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                                Select Partner
                                            </label>
                                            <CustomReactSelect
                                                items={partnerList}
                                                required
                                                placeholder="Select Partner"
                                                bindName="adhaar_name"
                                                bindValue="regId"
                                                value={getValues("partner_id")}
                                                {...register("partner_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "partner")}
                                                error={errors?.partner_id?.message}
                                                disabled={disablePartner}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                                Select RM
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
                                                disabled={disableRM}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                                Select BC
                                            </label>
                                            <CustomReactSelect
                                                items={BCList}
                                                required
                                                placeholder="Select BC"
                                                bindName="adhaar_name"
                                                bindValue="regId"
                                                value={getValues("bc_id")}
                                                {...register("bc_id")}
                                                isClearable={true}
                                                onChange={(e: any) => handleChange(e, "bc")}
                                                error={errors?.bc_id?.message}
                                                disabled={disableBC}
                                            />
                                        </div>
                                    </div>
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

            {/* Delete Investor Modal */}
            {deleteModal && (
                <div id="my_modal_2" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={deleteModalRef}>
                    <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full border border-[#2A2A2A]">
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-[#F9FAFB] mb-3">Delete Investor</h3>
                            <p className="text-[#9CA3AF] mb-6">
                                Are you sure you want to delete this investor?
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
                                    {deleteLoader ? "Processing..." : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Investor List Modal */}
            {showInvModal && (
                <div id="my_modal_1" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" ref={showInvModalRef}>
                    <div className="bg-[#111111] rounded-xl shadow-2xl max-w-2xl w-full border border-[#2A2A2A]">
                        <div className="flex justify-between items-center p-5 border-b border-[#2A2A2A]">
                            <h3 className="text-lg font-bold text-[#F59E0B]">Investor List</h3>
                            <button
                                className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                                onClick={onChangeCloseInvestorList}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {headMemberList.map((member: any, index: any) => (
                                    <div key={index} className="p-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
                                        <CustomText className='text-sm text-[#F9FAFB]'>{member}</CustomText>
                                    </div>
                                ))}
                            </div>
                            <div className='mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30'>
                                <CustomCheckbox
                                    labelClassName='text-sm text-red-400'
                                    label="Are you sure you want to delete the investor and remove them from the member mapping?"
                                    checked={isAllInvesFamilyHead}
                                    onChange={(e: any) => setIsAllInvesFamilyHead(e.target.checked)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center p-5 border-t border-[#2A2A2A]">
                            <button
                                type="button"
                                onClick={handleInvestorMapping}
                                className="px-6 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={onChangeCloseInvestorList}
                                className="px-6 py-2 bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors"
                            >
                                Cancel
                            </button>
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

export default InvestorList;