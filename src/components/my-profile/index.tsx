"use client"

import CustomButton from '@/commonUI/Button';
import FullPageLoader from '@/commonUI/FullPageLoader';
import CustomText from '@/commonUI/Text';
import api from '@/utils/api';
import { ADD_MEMBER, MEMBER_DATA, MEMBER_TYPE, USER_DATA, formatNumber } from '@/utils/constants';
import { formatDates, getLS, handleServerError, removeLS, setLS, toastAlert } from '@/utils/helpers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { BiTachometer } from 'react-icons/bi';
import OnBoarding from '../on-boarding';
import { CgSoftwareDownload } from 'react-icons/cg';
import CANEditPopup from '../kyc-quick-summary/(components)/CANEditPopup';
import { User2Icon } from 'lucide-react';

function MyProfile() {
    const router = useRouter();
    const [onBoardingModal, setOnBoardingModal] = useState(false);
    const [expandedMembers, setExpandedMembers] = useState<{ [key: string]: boolean }>({});
    const [investorList, setInvestorList] = useState<any>([]);
    const [kycVerifyLoder, setKycVerifyLoder] = useState<any>(false);
    const [memberToRemove, setMemberToRemove] = useState<any>(null);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);
    const [canEditOpen, setCanEditOpen] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [canDetails, setCanDetails] = useState<any>(null);
    const [fetchingCanDetails, setFetchingCanDetails] = useState(false);
    const [userType, setUserType] = useState<number>(0);
    const [userData, setUserData] = useState<any>(null);
    const removeModalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const userDataLS = getLS(USER_DATA);
        setUserData(userDataLS);
        setUserType(userDataLS?.userTypeId ?? 0);
    }, []);

    const toggleMemberExpansion = (pan: string) => {
        setExpandedMembers(prev => ({
            ...prev,
            [pan]: !prev[pan]
        }));
    };

    const checkPANStatus = async (investorData: any) => {
        setKycVerifyLoder(true);
        try {
            let userData = getLS(USER_DATA);
            let res: any = await api.post(`/kyc/checkKYCStatus`, { pan_no: investorData.pan_no, investor_id: investorData.id });
            if (res.data.data) {
                if (investorData.group_leader_id == 0) {
                    userData.InvestorRegistration = res.data.data.investor_data;
                    setLS(USER_DATA, userData);
                }
                setKycVerifyLoder(false);
                if (res.data.data.investor_data.isKYCDone) {
                    investorListFuncInvestorList()
                    toastAlert("success", res.data.msg);
                } else {
                    toastAlert("warn", res.data.msg);
                }
            }
        } catch (error) {
            handleServerError(error);
            setKycVerifyLoder(false);
        }
    };

    useEffect(() => {
        investorListFuncInvestorList();
    }, []);

    const investorListFuncInvestorList = async () => {
        const userData = getLS(USER_DATA);

        //getting user type Id 
        const userType = userData?.userTypeId ?? 0;
        const partnerId = userData?.partner?.regId ?? 0;
        let investor;

        if (userType === 2) {
            if (!userData?.InvestorRegistration?.id) return;

            investor = await api.post(`/investor/kyc-users`, { investor_id: userData?.InvestorRegistration?.id });
            if (investor) {
                setInvestorList(investor?.data?.data);
            }
        }
        if (userType === 4) {
            investor = await api.post(`/investor/partner-kyc-users`, { partnerId });
            console.log("investor partner data -", investor);
            console.log("investor?.data?.data-", investor?.data?.data)
            if (investor) {
                setInvestorList(investor?.data?.data);
            }
        }

    };

    const handleRemoveMember = (member: any) => {
        setMemberToRemove(member);
        openRemoveModal();
    };

    const openRemoveModal = () => {
        removeModalRef.current?.showModal();
    };

    const closeRemoveModal = () => {
        removeModalRef.current?.close();
    };

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return;

        setIsRemoving(true);
        try {
            const payload = {
                investor_id: memberToRemove.id,
                group_leader_id: 0
            };

            const res = await api.post(`/kyc/updateinvestor`, payload);
            if (res.data.data) {
                toastAlert("success", "Member removed successfully");
                await investorListFuncInvestorList();
                closeRemoveModal();
                setMemberToRemove(null);
            }
        } catch (error) {
            handleServerError(error);
        } finally {
            setIsRemoving(false);
        }
    };

    const cancelRemoveMember = () => {
        closeRemoveModal();
        setMemberToRemove(null);
    };

    const isInvestorMinor = (dob: string) => {
        if (!dob) return false;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18;
    };

    // CAN Edit Popup Handlers
    const handleOpenCANEdit = async (investor: any) => {
        setSelectedInvestor(investor);
        setFetchingCanDetails(true);
        try {
            const response = await api.get(`/kyc/gteCanDetailsInvestor/${investor.pan_no}`);
            if (response.data.data && response.data.data.data && response.data.data.data.length > 0) {
                const canData = response.data.data.data[0];
                setCanDetails(canData);
                toastAlert("success", "CAN details loaded successfully");
            } else {
                toastAlert("info", "No CAN details found for this PAN");
                setCanDetails(null);
            }
        } catch (error) {
            toastAlert("error", "Failed to fetch CAN details");
            setCanDetails(null);
        } finally {
            setFetchingCanDetails(false);
            setCanEditOpen(true);   // ✅ This triggers the popup open
        }
    };

    const handleCloseCANEdit = () => {
        setCanEditOpen(false);
        setSelectedInvestor(null);
        setCanDetails(null);
    };

    // In MyProfile component, update the handleUpdatePersonal function:

    const handleUpdatePersonal = async (data: { mobile?: string; email?: string }) => {
        try {
            console.log("Received from popup:", data);

            const payload = {
                investor_id: selectedInvestor?.id, // make sure this is correct
                email: data.email || "",
                mobile: data.mobile || "",

            };

            console.log("Sending payload to backend:", payload);

            const response = await api.post(
                `kyc/updateEmailMobile`,
                payload,
            );

            console.log("Backend response:", response.data);

            return response.data;
        } catch (err: any) {
            console.error("Error in handleUpdatePersonal:", err);
            throw err;
        }
    };


    const handleUpdateBank = async (data: any) => {
        setIsLoading(true);
        try {
            // Add your API call to update bank details here
            const response = await api.post('/update-bank-details', {
                investor_id: selectedInvestor.id,
                ...data
            });
            toastAlert("success", "Bank details updated successfully");
        } catch (error) {
            handleServerError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateNominee = async (data: any) => {
        setIsLoading(true);
        try {
            // Add your API call to update nominee details here
            const response = await api.post('/update-nominee-details', {
                investor_id: selectedInvestor.id,
                ...data
            });
            toastAlert("success", "Nominee details updated successfully");
        } catch (error) {
            handleServerError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const userData = getLS(USER_DATA);
        console.log("User Data=", userData.InvestorRegistration)
        //getting user type Id 
        const userType = userData?.userTypeId ?? 0;
        if (userType === 2) {
            if (
                (!userData?.InvestorRegistration) ||
                (userData?.InvestorRegistration?.is_kyc_complete === false) ||
                userData?.InvestorRegistration?.is_kyc_complete === null
            ) {
                setOnBoardingModal(true);

            } else {
                console.log("fdsfds")
                setOnBoardingModal(false);
            }
        }
        if (userType === 4 || userType === 6) {
            setOnBoardingModal(false);
        }

    }, []);

    useEffect(() => {
        if (investorList?.GroupMemmber && investorList?.GroupMemmber.length > 0) {
            const initialExpandedState: { [key: string]: boolean } = {};
            investorList?.GroupMemmber.forEach((member: any, index: number) => {
                initialExpandedState[member.pan_no] = false;
            });
            setExpandedMembers(initialExpandedState);
        }
    }, [investorList?.GroupMemmber]);

    return (
        <>
            <FullPageLoader
                isVisible={kycVerifyLoder}
                message="Checking KYC Status..."
            />

            {/* Loading for CAN Details */}
            <FullPageLoader
                isVisible={fetchingCanDetails}
                message="Fetching CAN Details..."
            />

            {/* CAN Edit Popup */}
            <CANEditPopup
                isOpen={canEditOpen}
                onClose={handleCloseCANEdit}
                userData={selectedInvestor}
                summarydata={selectedInvestor}
                canDetails={canDetails}
                onUpdatePersonal={handleUpdatePersonal}
                onUpdateBank={handleUpdateBank}
                onUpdateNominee={handleUpdateNominee}
                isLoading={isLoading}
            />

            {onBoardingModal && (
                <div>
                    <OnBoarding onBoardingModal={onBoardingModal} />
                </div>
            )}
            {!onBoardingModal && (
                <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className='flex flex-col gap-2 justify-end fixed bottom-1/2 right-0 z-50 bg-white rounded-tl-2xl rounded-bl-2xl shadow p-2'>
                            <div onClick={() => router.push(`/risk-profile`)} className='flex flex-col justify-center items-center cursor-pointer bg-primary text-white p-2 rounded-lg'>
                                <BiTachometer className='text-2xl' />
                                <div className='text-xs font-bold'>Risk Profile</div>
                            </div>
                            <div onClick={() => router.push(`/fund-explore`)} className='flex flex-col justify-center items-center cursor-pointer bg-primary text-white p-2 rounded-lg'>
                                <AiOutlineFundProjectionScreen className='text-2xl' />
                                <div className='text-xs font-bold'>Investment</div>
                            </div>
                            <div onClick={() => {
                                setLS(ADD_MEMBER, true);
                                router.push(`/initial-KYC`)
                            }
                            } className='flex flex-col justify-center items-center cursor-pointer bg-primary text-white p-2 rounded-lg'>
                                <User2Icon className='text-2xl' />
                                <div className='text-xs font-bold'>New Profile</div>
                            </div>
                        </div>
                        <div className='mt-5'>
                            <div className="">
                                
                                {/* Partner Profile Section (userType === 4) */}
                                {userType === 4 && (
                                    <div className="bg-white rounded-2xl p-6 mb-6">
                                        <CustomText tag="h2" className="text-2xl font-semibold text-secondary mb-4">
                                            Partner Profile
                                        </CustomText>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Partner Name:</span>
                                                    <span className="font-semibold">{userData?.partner?.adhaarName || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">PAN Number:</span>
                                                    <span className="font-semibold">{userData?.partner?.pan || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Mobile Number:</span>
                                                    <span className="font-semibold">{userData?.partner?.mobile || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Email ID:</span>
                                                    <span className="font-semibold">{userData?.partner?.email || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Aadhaar Number:</span>
                                                    <span className="font-semibold">{userData?.partner?.aadhaar || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Bank Name:</span>
                                                    <span className="font-semibold">{userData?.partner?.bankAcBankName || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Account Number:</span>
                                                    <span className="font-semibold">{userData?.partner?.bankAcNo || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">IFSC Code:</span>
                                                    <span className="font-semibold">{userData?.partner?.bankAcIfsc || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* BC Member Profile Section (userType === 6) */}
                                {userType === 6 && (
                                    <div className="bg-white rounded-2xl p-6 mb-6">
                                        <CustomText tag="h2" className="text-2xl font-semibold text-secondary mb-4">
                                            BC Member Profile
                                        </CustomText>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">BC Member Name:</span>
                                                    <span className="font-semibold">{userData?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">PAN Number:</span>
                                                    <span className="font-semibold">{userData?.BC?.pan || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Mobile Number:</span>
                                                    <span className="font-semibold">{userData?.mobile || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Email ID:</span>
                                                    <span className="font-semibold">{userData?.BC?.email || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Aadhaar Number:</span>
                                                    <span className="font-semibold">{userData?.BC?.aadhaar || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Bank Name:</span>
                                                    <span className="font-semibold">{userData?.BC?.bankAcBankName || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">Account Number:</span>
                                                    <span className="font-semibold">{userData?.BC?.bankAcNo || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-600 w-1/3">IFSC Code:</span>
                                                    <span className="font-semibold">{userData?.BC?.bankAcIfsc || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Profile Header - Only show for userType 2 */}
                                {(userType === 2 || userType === 4 || userType === 6) && (
                                    <div className="bg-white rounded-2xl  px-6 flex flex-col gap-4 mb-2">
                                        <div className="items-start gap-4">
                                            <div>
                                                <CustomText tag="h2" className="text-2xl font-semibold text-secondary  mb-2">{investorList?.name} ( {investorList?.member_type === MEMBER_TYPE?.OWNER ? "Owner | Individual" : "Member"} )</CustomText>
                                            </div>
                                        </div>

                                        <div className='flex justify-between text-sm mt-4'>
                                            <div className="flex flex-col gap-2 text-sm text-gray-700 w-2/3">
                                                <div className='flex gap-6'>
                                                    <span className='inlineLabel'>PAN</span>:
                                                    <span className='font-bold'>{investorList?.pan_no}</span>
                                                </div>
                                                <div className='flex gap-6'>
                                                    <span className='inlineLabel'>KYC Status</span>:
                                                    <span className={`font-bold ${investorList?.isKYCDone ? 'text-green-500' : 'text-red-500'}`}>
                                                        {investorList?.isKYCDone ? "Verified" : "Not Verified"}
                                                    </span>
                                                    {investorList?.is_kyc_complete && !investorList?.isKYCDone && <div
                                                        onClick={() => {
                                                            checkPANStatus(investorList)
                                                        }} className="text-blue-600 underline ml-1 cursor-pointer">(Check KYC Status)</div>
                                                    }
                                                </div>
                                                <div className='flex gap-6'>
                                                    <span className='inlineLabel'>Profile</span>:
                                                    <div className="flex items-center gap-2">
                                                        <span className='font-bold'>{formatNumber(investorList?.percentage) == 100 ? 'Completed' : 'Pending'}</span>
                                                        {formatNumber(investorList?.percentage) == 100 ? (
                                                            <>
                                                                <CustomButton
                                                                    onClick={() => {
                                                                        removeLS(MEMBER_DATA)
                                                                        removeLS(ADD_MEMBER)
                                                                        router.push(`/kyc-quick-summary`)
                                                                    }}
                                                                    className="w-fit h-auto px-2 py-0.5 rounded text-xs font-medium"
                                                                    label="View/Edit"
                                                                />
                                                                <CustomButton
                                                                    onClick={() => handleOpenCANEdit(investorList)}
                                                                    className="w-fit h-auto px-2 py-0.5 rounded text-xs font-medium bg-green-600 hover:bg-green-700"
                                                                    label="Update CAN"
                                                                />
                                                            </>
                                                        ) : (
                                                            <CustomButton onClick={() => {
                                                                removeLS(MEMBER_DATA)
                                                                removeLS(ADD_MEMBER)
                                                                let userData = getLS(USER_DATA);
                                                                userData.InvestorRegistration = investorList;
                                                                setLS(USER_DATA, userData);
                                                                router.push(`/initial-KYC`)
                                                            }} className="w-fit h-auto px-2 py-0.5 rounded text-xs font-medium ml-2" label="Initial Kyc" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='flex gap-6'>
                                                    <span className='inlineLabel'>Address</span>:
                                                    <span className='font-bold'>{investorList?.AddressDetail?.address1}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-1/3">
                                                <div className="flex flex-col gap-2 text-sm text-gray-700">
                                                    <div className='flex gap-6'>
                                                        <span className='inlineLabel'>DOB</span>:
                                                        <span className='font-bold'>{investorList?.dob ? formatDates(investorList?.dob) : '-'}</span>
                                                    </div>
                                                    <div className='flex gap-6'>
                                                        <span className='inlineLabel'>Mobile No.</span>:
                                                        <span className='font-bold'>{investorList?.reg_mobile}</span>
                                                    </div>
                                                    <div className='flex gap-6'>
                                                        <span className='inlineLabel'>Email ID</span>:
                                                        <span className='font-bold'>{investorList?.reg_email}</span>
                                                    </div>
                                                    <div className='flex gap-6'>
                                                        <span className='inlineLabel'>Account Holding</span>:
                                                        <span className='font-bold'>{investorList?.accountHolding || 'Not Linked'}</span>
                                                    </div>
                                                </div>
                                                <div className='border-b border-accent mt-1'></div>
                                                {investorList?.is_kyc_complete && investorList?.isKYCDone && (
                                                    <Link href={`/account-holding`} className="text-blue-600 underline  mt-1">Link account holding</Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Family Members Table - Only show for userType 2 */}
                            {
                                userType === 2 && investorList?.group_leader_id == 0 && (
                                    <div className="bg-white rounded-2xl p-6 ">
                                        <div className='flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-xl'>
                                            <div>
                                                <CustomText tag="h3" className="text-lg font-semibold text-secondary">Family Members</CustomText>
                                            </div>
                                            {/* 
                                            <div>
                                                <CustomButton className="w-fit h-auto px-4 rounded bg-secondary hover:bg-secondary/80 text-white py-1" onClick={() => {
                                                    setLS(ADD_MEMBER, true);
                                                    removeLS(MEMBER_DATA)

                                                    router.push(`/initial-KYC`)
                                                }} label="Add Member" />
                                            </div> */}

                                        </div>
                                        <div className="overflow-x-auto border-b border-accent ">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="border-0 border-accent text-gray-600">
                                                        <th className="w-1/3 py-2 px-4 text-left font-semibold">Member Name</th>
                                                        <th className="w-1/4 py-2 px-4 text-left font-semibold">PAN</th>
                                                        <th className="w-1/4 py-2 px-4 text-left font-semibold">KYC Status</th>
                                                        <th className="w-1/4 py-2 px-4"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {investorList?.GroupMemmber?.map((item: any, idx: number) => (
                                                        <Fragment key={item?.id}>
                                                            <tr className="border-t border-accent group ">
                                                                <td className="py-2 px-4 font-medium">
                                                                    <button
                                                                        className="inline-block align-middle mr-2 cursor-pointer hover:text-blue-600 transition-colors"
                                                                        onClick={() => toggleMemberExpansion(item?.id)}
                                                                    >
                                                                        {expandedMembers[item?.pan_no] ? <span className="rotate-90 inline-block">&#9654;</span> : <span className="inline-block">&#9660;</span>}
                                                                    </button>
                                                                    {item?.name}
                                                                </td>
                                                                <td className="py-2 px-4">{item?.pan_no}</td>
                                                                <td className={`py-2 px-4 capitalize ${item.annualFund == '<50K' ? 'text-gray-500' : item?.isKYCDone ? 'text-green-500' : 'text-red-500'}`}> {item.annualFund == '<50K' ? 'N/A' : item?.isKYCDone ? "Verified" : "Not Verified"}</td>
                                                                <td className="py-2 px-4 flex gap-2 items-center justify-end">
                                                                    {item?.is_kyc_complete && !item?.isKYCDone ? (
                                                                        <CustomButton className="bg-gray-500 text-gray-600w-fit h-auto px-4  rounded text-xs font-normal py-1" onClick={() => {
                                                                            checkPANStatus(item)
                                                                        }} label="Check KYC Status" />
                                                                    ) : null}
                                                                    {formatNumber(item?.percentage) == 100 ? (
                                                                        <div className="flex gap-2">
                                                                            <CustomButton
                                                                                onClick={() => {
                                                                                    setLS(ADD_MEMBER, true);
                                                                                    setLS(MEMBER_DATA, { InvestorRegistration: item })
                                                                                    router.push(`/kyc-quick-summary`)
                                                                                }}
                                                                                className="w-fit h-auto px-4 rounded text-xs font-normal py-1"
                                                                                label="View/Edit"
                                                                            />
                                                                            <CustomButton
                                                                                onClick={() => handleOpenCANEdit(item)}
                                                                                className="w-fit h-auto px-4 rounded text-xs font-normal py-1 bg-green-600 hover:bg-green-700"
                                                                                label="Update CAN"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <CustomButton onClick={() => {
                                                                            setLS(ADD_MEMBER, true);
                                                                            setLS(MEMBER_DATA, { InvestorRegistration: item })
                                                                            router.push(`/initial-KYC`)
                                                                        }} className="w-fit h-auto px-4  rounded text-xs font-normal py-1" label="Initial Kyc" />
                                                                    )}
                                                                    {/* Only show Remove button if investor is not minor */}
                                                                    {!isInvestorMinor(item?.dob) && (
                                                                        <CustomButton onClick={() => {
                                                                            handleRemoveMember(item);
                                                                        }} className="w-fit h-auto px-4  rounded text-xs font-normal py-1" label="Remove" />
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {expandedMembers[item?.id] && (
                                                                <tr className="">
                                                                    <td colSpan={4} className="pb-4 px-4">
                                                                        <div className='bg-gray-50 p-4 rounded-xl'>
                                                                            <div className='flex justify-between'>
                                                                                <div className="flex flex-col gap-2 text-sm text-gray-700 w-2/3">
                                                                                    <div className='flex gap-6'>
                                                                                        <span className='inlineLabel'>Profile</span>:
                                                                                        <div>
                                                                                            <span className='font-bold'>{formatNumber(investorList?.percentage) == 100 ? 'Completed' : 'Pending'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='flex gap-6'>
                                                                                        <span className='inlineLabel'>DOB</span>:
                                                                                        <span className='font-bold'>{item?.dob ? formatDates(item?.dob) : '-'}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col gap-2 items-center w-full">
                                                                                    <div className="flex flex-col gap-2 text-sm text-gray-700">
                                                                                        <div className='flex gap-6'>
                                                                                            <span className='inlineLabel'>Mobile No.</span>:
                                                                                            <span className='font-bold'>{item?.reg_mobile}</span>
                                                                                        </div>
                                                                                        <div className='flex gap-6'>
                                                                                            <span className='inlineLabel'>Email ID</span>:
                                                                                            <span className='font-bold'>{item?.reg_email}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex gap-6 mt-2'>
                                                                                <span className='inlineLabel'>Address</span>:
                                                                                <span className='font-bold'>{
                                                                                    item?.AddressDetail?.address1}</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Member Confirmation Dialog */}
            <dialog id="remove_member_modal" className="modal" ref={removeModalRef}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-center mb-4">Remove Member</h3>
                    <div className="py-4">
                        <p className="text-center mb-2">
                            Are you sure you want to remove{" "}
                            <span className="font-semibold text-red-600">
                                {memberToRemove?.name}
                            </span>{" "}
                            from the family members list?
                        </p>
                        <p className="text-sm text-gray-600 text-center">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="modal-action justify-center">
                        <div className="flex gap-4">
                            <CustomButton
                                onClick={cancelRemoveMember}
                                className="bg-gray-500 hover:bg-gray-600"
                                label="Cancel"
                            />
                            <CustomButton
                                onClick={confirmRemoveMember}
                                loading={isRemoving}
                                className="bg-red-500 hover:bg-red-600"
                                label={isRemoving ? "Removing..." : "Remove"}
                            />
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default MyProfile