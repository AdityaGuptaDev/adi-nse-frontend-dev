"use client";

import { addAccountHolding, getAccountHolding, getInvestor } from '@/api/holder';
import CustomButton from '@/commonUI/Button';
import CustomCheckbox from '@/commonUI/CheckBox';
import CustomReactSelect from '@/commonUI/ReactSelect';
import CustomText from '@/commonUI/Text';
import { accountHoldingType } from '@/utils/constants';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { CiEdit } from 'react-icons/ci';
import { FaEdit } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { GrDownload, GrNote } from 'react-icons/gr';
import { MdClose } from 'react-icons/md';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { USER_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";

import Loader from '@/commonUI/Loader';
import SuccessDialog from '@/commonUI/SuccessDialog';
import AccountHoldingCard from './component/AccountHoldingCard';
import { encrypt } from '@/utils/aesmfu';
import { eMandateStatus, getMandates, updateMandates } from '@/api/transaction';
import CustomBackButton from '@/commonUI/CustomBackButton';
import { IoMdArrowRoundBack } from 'react-icons/io';

// Golden Black Theme Constants
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

function AccountHolding() {

    let router = useRouter();
    const user = getLS(USER_DATA);
    console.log(user?.InvestorRegistration?.id)

    const addAccountHoldingModalRef = useRef<HTMLDivElement>(null);
    const viewAllMandatesModalRef = useRef<HTMLDivElement>(null);
    const liveMandatesModalRef = useRef<HTMLDivElement>(null);

    const [accountHoldingModal, setAccountHoldingModal] = useState(false);
    const [viewAllMandatesModal, setViewAllMandatesModal] = useState(false);
    const [liveMandatesModal, setLiveMandatesModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

    const accountHoldingCloseModal = () => setAccountHoldingModal(false);

    const viewAllMandatesOpenModal = () => setViewAllMandatesModal(true);
    const viewAllMandatesCloseModal = () => setViewAllMandatesModal(false);

    const liveMandatesOpenModal = () => setLiveMandatesModal(true);
    const liveMandatesCloseModal = () => setLiveMandatesModal(false);
    const [investorList, setInvestorList] = useState<any[]>([]);
    const [selectedInvestorId, setSelectedInvestorId] = useState(null);
    const [secondInvestorId, setSecondInvestorId] = useState(null);
    const [accountType, setAccountType] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false)
    const [transactionData, seTransactionData] = useState({})
    const [accountHoldingList, setAccountHoldingList] = useState<any[]>([])
    const [mandates, setMandates] = useState<any[]>([])

    useEffect(() => {
        const searchInvestor = async () => {
            const response = await getInvestor(user?.InvestorRegistration?.id);
            //const response = await getInvestor(91);
            const data = response?.data?.data?.data
            console.log("Investors :- ", response?.data?.data?.data);
            setInvestorList(data);
        };
        searchInvestor();

    }, []);

    const mmrnRegStatus = {
        RQ: "Pending",
        CL: "Cancelled",
        PA: "Confirmed",
        PR: "Rejected"
    }

    const mmrnAggrStatus = {
        RQ: "Requested",
        RA: "Aggregator Rejected",
        PA: "Confirmed",
        PR: "Rejected",
        SE: "Send to Aggregator",
        PS: "Request Acknowledged by Aggregator",
        PF: "Request Rejected By Aggregator",
        PE: "Pending",
        AC: "Request Cancelled by Aggregator",
        AK: "Aggregator Accepted"
    }




    useEffect(() => {
        const searchAccountHolding = async () => {
            try {
                const response = await getAccountHolding(user?.InvestorRegistration?.id);
                console.log("Account Holding :- ", response?.data?.data?.data);
                setAccountHoldingList(response?.data?.data?.data || []);
            } catch (error) {
                console.error("Error fetching account holding:", error);
            }
        };

        const searchMandates = async () => {
            try {
                const response = await getMandates(user?.InvestorRegistration?.id);
                const data = response?.data?.data?.data || [];

                for (const item of data) {
                    console.log("Mandate Status :- ", item.mandate_status);

                    if (!item.mmrnaggrstatus) {
                        console.log("Pending Mandate Found");
                        const jsonRequest = {
                            can: item.can_id,
                            mmrn: item.mmrn,

                        }
                        const stringifiedPayload: Record<string, string> = Object.fromEntries(
                            Object.entries(jsonRequest).filter(([_, value]) => value !== undefined && value !== null)
                                .map(([key, value]) => [key, String(value)])
                        );

                        const queryString = new URLSearchParams(stringifiedPayload).toString();
                        const result = await eMandateStatus(queryString);
                        console.log("Mandate Status Response :- ", result?.data?.data?.data?.epayStatusResponse[0]);
                        const respData = await updateMandates(item.id,
                            {
                                mmrnaggrstatus: result?.data?.data?.data?.epayStatusResponse[0]?.mmrnAggrStatus,
                                mmrnregstatus: result?.data?.data?.data?.epayStatusResponse[0]?.mmrnRegStatus,
                                prn: result?.data?.data?.data?.epayStatusResponse[0]?.prn,

                            }
                        )
                        console.log("Mandate Update Response :- ", respData);
                        // Optionally update item.mandate_status here if needed
                    }
                }

                console.log("Investor Mandates :- ", data);
                setMandates(data);
            } catch (error) {
                console.error("Error fetching mandates:", error);
            }
        };

        // Run both async functions
        searchAccountHolding();
        searchMandates();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const accountHoldingOpenModal = () => {
        setError(null)
        setIsLoading(false)
        setAccountType("")
        setSelectedInvestorId(null)
        setAccountHoldingModal(true);
    };

    // const accountHoldingCloseModal = () => {
    //     addAccountHoldingModalRef.current?.close();
    // };


    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)
        try {

            let payload = null;

            console.log(accountType, secondInvestorId);
            if (accountType === "SI") {
                payload = { accountType: accountType, investorId: selectedInvestorId }
            } else {
                payload = { accountType: accountType, investorId: selectedInvestorId, secondInvestorId: secondInvestorId }
            }

            const response = await addAccountHolding(payload)
            const result = response?.data?.data?.data?.CANIndFillEezzResp;
            console.log(response)

            if (result?.RESP_HEADER?.RES_CODE !== "0") {
                console.log(result?.RESP_HEADER?.RES_MSG)
                setError(result?.RESP_HEADER?.RES_MSG)
            } else {
                const _investor = investorList.find((opt: any) => opt?.group_leader_id === 0)
                console.log(_investor)
                const _transactionData = {
                    can_id: result?.RESP_BODY?.CAN,
                    name: _investor?.name,
                    status: 'Success',

                };
                seTransactionData(_transactionData)
                setAccountHoldingModal(false);
                setOpen(true)
            }
        } catch (err: any) {
            console.log("Error", err)
            //setError(err)
        }

        setIsLoading(false)

    }

    const handleMandate = () => {

        const finalData: any = [];
        investorList.forEach((item: any) => {
            finalData.push({ label: item?.name, value: item?.id, canId: item?.InvestorAccountHolding[0]?.CAN_Id })
        })
        router.push(`./mandate?id=${encrypt(finalData)}`)
        console.log(finalData)
        console.log(encrypt(finalData))

    }

    return (
        <>
            <SuccessDialog

                title="Can Created Successful"
                message='Congratulations'
                note='Thanks for being part of vedant mutual fund'
                data={transactionData}
                isOpen={open}
                onClose={() => {
                    setOpen(false)

                }}
            />

            <div className='min-h-screen' style={{ background: theme.background }}>
                <div className='p-4 md:p-6'>
                    {/* Header Section */}
                    <div className='flex flex-wrap justify-between items-center gap-4 mb-6'>
                        <div>
                            <CustomBackButton onClick={() => window.history.back()}>
                                <IoMdArrowRoundBack className="h-6 w-6 mr-1 transition-transform duration-300 hover:-translate-x-1" style={{ color: theme.primary }} />
                            </CustomBackButton>
                        </div>

                        <div className='flex flex-wrap gap-3 md:gap-4'>
                            <div>
                                <CustomButton 
                                    onClick={viewAllMandatesOpenModal}
                                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                        background: theme.gradient,
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    View All Mandates
                                </CustomButton>
                            </div>
                            <div>
                                <CustomButton 
                                    onClick={accountHoldingOpenModal}
                                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                        background: theme.gradient,
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    Create New
                                </CustomButton>
                            </div>
                        </div>
                    </div>

                    {/* Account Holding Cards Grid */}
                    <div className='mt-6'>
                        {accountHoldingList.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                                {accountHoldingList.map((item: any, index: number) => (
                                    <AccountHoldingCard
                                        key={index}
                                        item={item}
                                        mandates={mandates.length}
                                        onEdit={() => {
                                            accountHoldingOpenModal();
                                            setIsEdit(true);
                                        }}
                                        onLinkedMandatesClick={liveMandatesOpenModal}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Account Holding Modal */}
            {accountHoldingModal && (
                <div id="my_modal" className="modal modal-open" ref={addAccountHoldingModalRef}>
                    <div 
                        className="modal-box rounded-xl shadow-2xl"
                        style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                            maxWidth: "500px",
                        }}
                    >
                        <form method="dialog" className="modalHeader flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: theme.border }}>
                            <h3 
                                className="modalTitle text-xl font-bold"
                                style={{ color: theme.textPrimary }}
                            >
                                {isEdit ? `Update` : `Add`} Account Holdings
                            </h3>
                            <button
                                className="btn btn-md btn-circle btn-ghost transition-all duration-300 hover:rotate-90"
                                onClick={() => { accountHoldingCloseModal(); setIsEdit(false) }}
                                style={{ color: theme.textSecondary }}
                            >
                                <MdClose size={25} />
                            </button>
                        </form>
                        
                        <div className="modalBody my-6 space-y-4">
                            {error && (
                                <p className='text-xs text-center p-2 rounded-lg' style={{ color: theme.danger, background: `${theme.danger}20` }}>
                                    {error}
                                </p>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <CustomReactSelect
                                        label='Account Type'
                                        placeholder="--select--"
                                        items={accountHoldingType}
                                        bindName="name"
                                        bindValue="id"
                                        value={accountType}
                                        onChange={(value) => {
                                            console.log("Selected:", value.name);
                                            setAccountType(value.id);
                                        }}
                                    />
                                </div>
                                <div>
                                    <CustomReactSelect
                                        label='First Applicant'
                                        placeholder="--select--"
                                        items={investorList}
                                        bindName="name"
                                        bindValue="id"
                                        value={selectedInvestorId}
                                        onChange={(value) => {
                                            console.log("Selected:", value.name);
                                            setSelectedInvestorId(value.id);
                                        }}
                                    />
                                </div>
                                <div>
                                    {(accountType?.includes('JO') || accountType?.includes('AS')) && (
                                        <CustomReactSelect 
                                            label='Second Applicant' 
                                            items={investorList} 
                                            bindName='name' 
                                            bindValue='id' 
                                            placeholder='select investor'
                                            value={secondInvestorId}
                                            onChange={(value) => {
                                                console.log("Selected:", value.name);
                                                setSecondInvestorId(value.id);
                                            }}
                                        />
                                    )}
                                </div>
                                {isEdit && (
                                    <div className='mt-4'>
                                        <CustomCheckbox label='Active' />
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="modalFooter pt-4 border-t" style={{ borderTopColor: theme.border }}>
                            <CustomButton 
                                onClick={handleSubmit}
                                className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{
                                    background: theme.gradient,
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                }}
                            >
                                {isEdit ? `Update` : isLoading ? `Wait...` : `Save`}
                                {isLoading && (
                                    <Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-[#3A3A3A]' />
                                )}
                            </CustomButton>
                        </div>
                    </div>

                </div>
            )}

            {/* View All Mandates Modal */}
            {viewAllMandatesModal && (
                <div id="my_modal_2" className="modal modal-open" ref={viewAllMandatesModalRef}>
                    <div 
                        className="modal-box max-w-7xl rounded-xl shadow-2xl"
                        style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                        }}
                    >
                        <form method="dialog" className="modalHeader flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: theme.border }}>
                            <h3 className="modalTitle text-xl font-bold" style={{ color: theme.textPrimary }}>
                                All Mandates
                            </h3>
                            <button
                                className="btn btn-md btn-circle btn-ghost transition-all duration-300 hover:rotate-90"
                                onClick={viewAllMandatesCloseModal}
                                style={{ color: theme.textSecondary }}
                            >
                                <MdClose size={25} />
                            </button>
                        </form>
                        <div className="modalBody my-6">
                            <div className="overflow-x-auto">
                                <table className='table w-full'>
                                    <thead>
                                        <tr style={{ borderBottomColor: theme.border }}>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Mandate Code</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Holding Account</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Bank</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Start Date</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Validity</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Mandate Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>IFSC</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Verification</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottomColor: theme.border }}>
                                            <td className="py-3 px-4" style={{ color: theme.textPrimary }}>867966</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>34992672506</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>sbik</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>11-09-2024</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>11-09-2040</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>5000</td>
                                            <td className="py-3 px-4" style={{ color: theme.textSecondary }}>SBIN0005943</td>
                                            <td className="py-3 px-4" style={{ color: theme.success }}>Success</td>
                                            <td className="py-3 px-4" style={{ color: theme.success }}>Active</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Linked Mandates Modal */}
            {liveMandatesModal && (
                <div id="my_modal_3" className="modal modal-open" ref={liveMandatesModalRef}>
                    <div 
                        className="modal-box max-w-7xl rounded-xl shadow-2xl"
                        style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,
                        }}
                    >
                        <form method="dialog" className="modalHeader flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: theme.border }}>
                            <h3 className="modalTitle text-xl font-bold" style={{ color: theme.textPrimary }}>
                                Linked Mandates
                            </h3>
                            <button
                                className="btn btn-md btn-circle btn-ghost transition-all duration-300 hover:rotate-90"
                                onClick={liveMandatesCloseModal}
                                style={{ color: theme.textSecondary }}
                            >
                                <MdClose size={25} />
                            </button>
                        </form>
                        <div className="modalBody my-6">
                            <div className='text-end mb-4'>
                                <CustomButton 
                                    onClick={handleMandate}
                                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                        background: theme.gradient,
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    Create Mandate
                                </CustomButton>
                            </div>
                            <div className="overflow-x-auto mt-4">
                                <table className='table w-full'>
                                    <thead>
                                        <tr style={{ borderBottomColor: theme.border }}>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Mandate Code</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Bank</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Start Date</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Validity</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Mandate Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>IFSC</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Verification</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Registration Status</th>
                                            <th className="text-left py-3 px-4 font-semibold" style={{ color: theme.primary }}>Aggregator Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {mandates.length > 0 ? (
                                            mandates.map((mandate, index) => (
                                                <tr key={index} style={{ borderBottomColor: theme.border }}>
                                                    <td className="py-3 px-4" style={{ color: theme.textPrimary }}>{mandate.prn || '—'}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.acc_no || '—'}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.bank_id || '—'}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.start_date}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.end_date}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.max_amt || '—'}</td>
                                                    <td className="py-3 px-4" style={{ color: theme.textSecondary }}>{mandate.ifsc || '—'}</td>
                                                    <td className="py-3 px-4" style={{ color: mmrnRegStatus[mandate.mmrnregstatus as keyof typeof mmrnRegStatus] === 'Confirmed' ? theme.success : theme.warning }}>
                                                        {mmrnRegStatus[mandate.mmrnregstatus as keyof typeof mmrnRegStatus] || 'Pending'}
                                                    </td>
                                                    <td className="py-3 px-4" style={{ color: mmrnAggrStatus[mandate.mmrnaggrstatus as keyof typeof mmrnAggrStatus] === 'Confirmed' ? theme.success : theme.warning }}>
                                                        {mmrnAggrStatus[mandate.mmrnaggrstatus as keyof typeof mmrnAggrStatus] || 'Pending'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="py-8 text-center" style={{ color: theme.textSecondary }}>
                                                    No mandates found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AccountHolding