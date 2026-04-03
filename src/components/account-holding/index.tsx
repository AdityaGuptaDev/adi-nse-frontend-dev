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

    //const accountHoldingOpenModal = () => setAccountHoldingModal(true);
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
    //const [payload, setPayload] = useState<any>({})

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


            <div className='p-4'>
                <div className=' flex  justify-between'>

                    <div>
                        <CustomBackButton onClick={() => window.history.back()}>
                            <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
                        </CustomBackButton>
                    </div>


                    <div className='flex flex-wrap gap-2 md:gap-5'>
                        <div>
                            <CustomButton onClick={viewAllMandatesOpenModal}>View All Mandates</CustomButton>
                        </div>
                        <div>
                            <CustomButton onClick={accountHoldingOpenModal}>Create New</CustomButton>
                        </div>
                    </div>
                </div>
                {/*************Added by rakesh sinha */}
                <div className='mt-5'>

                    {accountHoldingList.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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

            {accountHoldingModal && (
                <div id="my_modal" className="modal modal-open" ref={addAccountHoldingModalRef}>

                    <div className="modal-box">
                        <form method="dialog" className="modalHeader">

                            <div className="flex-1 sm:flex justify-between">
                                <h3 className="modalTitle">{isEdit ? `Update` : `Add`} Account Holdings</h3>
                            </div>
                            <div className="">
                                <button
                                    className="btn btn-md btn-circle btn-ghost"
                                    onClick={() => { accountHoldingCloseModal(); setIsEdit(false) }}
                                >
                                    <MdClose size={25} />
                                </button>
                            </div>
                        </form>
                        <div className="modalBody my-6">
                            {error &&
                                <p className='text-error text-xs text-center'>{error}</p>
                            }
                            <div>
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
                                    {(accountType?.includes('JO') || accountType?.includes('AS')) &&
                                        <CustomReactSelect label='Second Applicant' items={investorList} bindName='name' bindValue='id' placeholder='select investor'
                                            value={secondInvestorId}
                                            onChange={(value) => {
                                                console.log("Selected:", value.name);
                                                setSecondInvestorId(value.id);
                                            }}

                                        />
                                    }
                                </div>
                                {isEdit && (
                                    <div className='mt-4'>
                                        <CustomCheckbox label='Active' />
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="modalFooter">

                            <div>
                                {/*<CustomButton onClick={() => { accountHoldingCloseModal(); setIsEdit(false) }}>{isEdit ? `Update` : `Save`}</CustomButton>*/}
                                <CustomButton onClick={handleSubmit}>{isEdit ?
                                    `Update` :
                                    isLoading ? `Wait...` :
                                        `Save`}

                                    {isLoading &&
                                        <>
                                            <Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-gray-300' />

                                        </>



                                    }    </CustomButton>

                            </div>
                        </div>
                    </div>

                </div>
            )}

            {viewAllMandatesModal && (
                <div id="my_modal_2" className="modal modal-open" ref={viewAllMandatesModalRef}>
                    <div className="modal-box max-w-7xl">
                        <form method="dialog" className="modalHeader">
                            <div className="flex-1 sm:flex justify-between">
                                <h3 className="modalTitle">All Mandates</h3>
                            </div>
                            <div className="">
                                <button
                                    className="btn btn-md btn-circle btn-ghost"
                                    onClick={viewAllMandatesCloseModal}
                                >
                                    <MdClose size={25} />
                                </button>
                            </div>
                        </form>
                        <div className="modalBody my-6">
                            <div className="overflow-x-auto">
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th>Mandate Code</th>
                                            <th>Holding Account</th>
                                            <th>Bank</th>
                                            <th>Start Date</th>
                                            <th>Validity</th>
                                            <th>Mandate Amount</th>
                                            <th>IFSC</th>
                                            <th>Verification</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th>867966</th>
                                            <td>34992672506</td>
                                            <td>sbik</td>
                                            <td>11-09-2024</td>
                                            <td>11-09-2040</td>
                                            <td>5000</td>
                                            <td>SBIN0005943</td>
                                            <td>Success</td>
                                            <td>Active</td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {liveMandatesModal && (
                <div id="my_modal_3" className="modal modal-open" ref={liveMandatesModalRef}>
                    <div className="modal-box max-w-7xl">
                        <form method="dialog" className="modalHeader">
                            <div className="flex-1 sm:flex justify-between">
                                <h3 className="modalTitle">Linked Mandates</h3>
                            </div>
                            <div className="">
                                <button
                                    className="btn btn-md btn-circle btn-ghost"
                                    onClick={liveMandatesCloseModal}
                                >
                                    <MdClose size={25} />
                                </button>
                            </div>
                        </form>
                        <div className="modalBody my-6">
                            <div className='text-end'>
                                <CustomButton onClick={handleMandate}>Create Mandate</CustomButton>
                            </div>
                            <div className="overflow-x-auto mt-4">
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th>Mandate Code</th>
                                            <th>Bank</th>
                                            <th>Start Date</th>
                                            <th >Validity</th>
                                            <th>Mandate Amount</th>
                                            <th className='text-center'>IFSC</th>
                                            <th>Verification</th>
                                            <th>Registration Status</th>
                                            <th>Aggregator Status</th>

                                            {/*<th className='text-center'>Action</th>*/}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {mandates.length > 0 ? (
                                            mandates.map((mandate, index) => (
                                                <tr key={index}>
                                                    <td>{mandate.prn || '—'}</td>
                                                    <td>{mandate.acc_no || '—'}</td>
                                                    <td>{mandate.bank_id || '—'}</td>
                                                    <td>{mandate.start_date}</td>
                                                    <td>{mandate.end_date}</td>
                                                    <td>{mandate.max_amt || '—'}</td>
                                                    <td>{mandate.ifsc || '—'}</td>
                                                    <td>{mmrnRegStatus[mandate.mmrnregstatus as keyof typeof mmrnRegStatus] || 'Pending'}</td>

                                                    <td>{mmrnAggrStatus[mandate.mmrnaggrstatus as keyof typeof mmrnAggrStatus] || 'Pending'}</td>
                                                    <td></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9}>No mandates found.</td>
                                            </tr>
                                        )}
                                        {/*<tr>
                                            <td>
                                                <div>867966</div>
                                                <div className='text-red-600'>Physical</div>
                                            </td>
                                            <td>
                                                <div>sbik</div>
                                                <div className='text-red-600'>34992672506</div>
                                            </td>
                                            <td>11-09-2024</td>
                                            <td>11-09-2040</td>
                                            <td className='text-right'>5000</td>
                                            <td>SBIN0005943</td>
                                            <td>Success</td>
                                            <td>Active</td>
                                            <td>
                                                <div className='flex gap-5'>
                                                    <span className='p-2 rounded-full bg-accent'><GrNote /></span>
                                                    <span className='p-2 rounded-full bg-accent'><GrDownload /></span>
                                                    <span className='p-2 rounded-full bg-accent'><RiDeleteBin5Fill /></span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>867966</div>
                                                <div className='text-red-600'>Physical</div>
                                            </td>
                                            <td>
                                                <div>sbik</div>
                                                <div className='text-red-600'>34992672506</div>
                                            </td>
                                            <td>11-09-2024</td>
                                            <td>11-09-2040</td>
                                            <td className='text-right'>5000</td>
                                            <td>SBIN0005943</td>
                                            <td>Success</td>
                                            <td>Active</td>
                                            <td><div className='flex gap-5'>
                                                <span className='p-2 rounded-full bg-accent'><GrNote /></span>
                                                <span className='p-2 rounded-full bg-accent'><GrDownload /></span>
                                                <span className='p-2 rounded-full bg-accent'><RiDeleteBin5Fill /></span>
                                            </div></td>
                                        </tr>*/}
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