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
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiCreditCard,
    FiCheckCircle,
    FiXCircle,
    FiHome,
} from 'react-icons/fi';

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
    const [uccDetails, setUccDetails] = useState<any>(null);
    const removeModalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const userDataLS = getLS(USER_DATA);
        setUserData(userDataLS);
        setUserType(userDataLS?.userTypeId ?? 0);

        // Fetch UCC details if investor mobile is available
        const fetchUccDetails = async () => {
            const investor = userDataLS?.InvestorRegistration;
            if (investor?.reg_mobile) {
                try {
                    const res = await api.get(`/nse/ucc/search-by-mobile/${investor.reg_mobile}`);
                    const payload = res?.data?.data ?? res?.data ?? {};
                    if (payload?.status === "S" && payload?.data) {
                        setUccDetails(payload.data);
                    }
                } catch {
                    // UCC not found - that's fine
                }
            }
        };
        fetchUccDetails();
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
        let userType;

if (userData?.partner?.userType_id) {
  userType = userData.partner.userType_id;
} else {
  userType = userData?.userTypeId ?? 0;
}

        //const userType = userData?.userTypeId ?? 0;
        
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

    // Per-session key so "Remind me later" doesn't re-pop on every page nav
    // within the same browser tab. A fresh login or tab reopens the prompt.
    const ONBOARDING_DISMISSED_KEY = "ONBOARDING_REMINDER_DISMISSED";

    useEffect(() => {
        const checkOnboarding = async () => {
            const userData = getLS(USER_DATA);
            const userTypeVal = userData?.userTypeId ?? 0;

            // Partners/admins never see onboarding popup
            if (userTypeVal === 4 || userTypeVal === 6) {
                setOnBoardingModal(false);
                return;
            }

            if (userTypeVal !== 2) {
                setOnBoardingModal(false);
                return;
            }

            // User dismissed it earlier in this tab — respect that until they
            // close the tab / log out.
            try {
                if (sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1") {
                    setOnBoardingModal(false);
                    return;
                }
            } catch {
                // sessionStorage may be unavailable in private mode — fall through.
            }

            const investor = userData?.InvestorRegistration;

            // Hide if we already have a CAN OR a UCC on file — those are the
            // two execution lanes and having either means onboarding is done
            // enough to transact.
            if (investor?.is_CAN_registered === true) {
                setOnBoardingModal(false);
                return;
            }

            // Check UCC via backend — covers the NSE-registered lane.
            if (investor?.reg_mobile) {
                try {
                    const res = await api.get(`/nse/ucc/search-by-mobile/${investor.reg_mobile}`);
                    const payload = res?.data?.data ?? res?.data ?? {};
                    if (payload?.status === "S" && payload?.data) {
                        const uccData = payload.data;
                        const hasUcc =
                            uccData.uccCreated === 1 ||
                            uccData.uccCreated === true ||
                            !!uccData.clientCode;
                        if (hasUcc) {
                            setUccDetails(uccData);
                            setOnBoardingModal(false);
                            return;
                        }
                    }
                } catch {
                    // UCC service may legitimately return 404 — fall through.
                }
            }

            // Neither CAN nor UCC → show the "Go with MFU / Go with NSE" prompt.
            setOnBoardingModal(true);
        };

        checkOnboarding();
    }, []);

    const handleOnboardingDismiss = () => {
        setOnBoardingModal(false);
        try {
            sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (investorList?.GroupMemmber && investorList?.GroupMemmber.length > 0) {
            const initialExpandedState: { [key: string]: boolean } = {};
            investorList?.GroupMemmber.forEach((member: any, index: number) => {
                initialExpandedState[member.pan_no] = false;
            });
            setExpandedMembers(initialExpandedState);
        }
    }, [investorList?.GroupMemmber]);

    // ══════════════════════════════════════════
    //  Merged profile view — falls back to UCC fields when the CAN-based
    //  investorList is empty (UCC-only onboarding). This fixes the bug where
    //  UCC investors saw blank PAN / Mobile / Address / DOB in the header.
    // ══════════════════════════════════════════
    const pickFirst = (...vals: any[]): string => {
        for (const v of vals) {
            if (v !== undefined && v !== null && `${v}`.trim() !== "") return `${v}`.trim();
        }
        return "";
    };

    const uccFullName = pickFirst(
        [
            uccDetails?.primaryHolderFirstName,
            uccDetails?.primaryHolderMiddleName,
            uccDetails?.primaryHolderLastName,
        ]
            .filter((p: any) => p && `${p}`.trim() !== "")
            .join(" ")
    );

    const uccFullAddress = [
        uccDetails?.address1,
        uccDetails?.address2,
        uccDetails?.address3,
        uccDetails?.city,
        uccDetails?.state,
        uccDetails?.pincode,
    ]
        .filter((p: any) => p && `${p}`.trim() !== "")
        .join(", ");

    const hasUcc =
        !!uccDetails &&
        (uccDetails.uccCreated === 1 ||
            uccDetails.uccCreated === true ||
            !!uccDetails.clientCode);

    const profileView = {
        name: pickFirst(investorList?.name, uccFullName, userData?.name),
        pan: pickFirst(investorList?.pan_no, uccDetails?.primaryHolderPan),
        dob: pickFirst(investorList?.dob, uccDetails?.primaryHolderDobIncorporation),
        mobile: pickFirst(investorList?.reg_mobile, uccDetails?.indianMobileNo),
        email: pickFirst(investorList?.reg_email, uccDetails?.email),
        address: pickFirst(investorList?.AddressDetail?.address1, uccFullAddress),
        city: pickFirst(investorList?.AddressDetail?.city, uccDetails?.city),
        state: pickFirst(investorList?.AddressDetail?.state, uccDetails?.state),
        pincode: pickFirst(investorList?.AddressDetail?.pincode, uccDetails?.pincode),
        accountHolding: pickFirst(investorList?.accountHolding),
        bankName: pickFirst(uccDetails?.bankName1, uccDetails?.bankName2),
        bankAccountNo: pickFirst(uccDetails?.accountNo1, uccDetails?.accountNo2),
        bankIfsc: pickFirst(uccDetails?.ifscCode1, uccDetails?.ifscCode2),
        uccClientCode: pickFirst(uccDetails?.clientCode),
        isCanRegistered: !!investorList?.is_CAN_registered,
        isKycDone: !!investorList?.isKYCDone,
        isKycComplete: !!investorList?.is_kyc_complete,
        percentage: formatNumber(investorList?.percentage),
        memberTypeLabel:
            investorList?.member_type === MEMBER_TYPE?.OWNER ? "Owner | Individual" : "Member",
    };

    const profileCompleted = profileView.percentage === 100 || hasUcc;

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
                <OnBoarding
                    onBoardingModal={onBoardingModal}
                    onClose={handleOnboardingDismiss}
                />
            )}
            {(
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
                                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 border border-gray-100">
                                        {/* Gradient banner with avatar + name */}
                                        <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                                    {profileView.name ? profileView.name.charAt(0).toUpperCase() : <FiUser className="w-8 h-8" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-white text-2xl font-semibold truncate">
                                                        {profileView.name || "Investor"}
                                                    </h2>
                                                    <p className="text-white/80 text-sm mt-0.5">{profileView.memberTypeLabel}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                                        {profileView.isKycDone ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                                                <FiCheckCircle className="w-3 h-3" /> KYC Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                                                <FiXCircle className="w-3 h-3" /> KYC Pending
                                                            </span>
                                                        )}
                                                        {profileView.isCanRegistered && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#D97706]">
                                                                <FiCheckCircle className="w-3 h-3" /> CAN {canDetails?.can_number || "Registered"}
                                                            </span>
                                                        )}
                                                        {hasUcc && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#D97706]">
                                                                <FiCheckCircle className="w-3 h-3" /> NSE UCC {profileView.uccClientCode || "Created"}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                                                profileCompleted
                                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                                            }`}
                                                        >
                                                            Profile {profileCompleted ? "Completed" : "Pending"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action row */}
                                        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50">
                                            {profileView.isKycComplete && !profileView.isKycDone && (
                                                <button
                                                    onClick={() => checkPANStatus(investorList)}
                                                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                >
                                                    Check KYC Status
                                                </button>
                                            )}
                                            {profileCompleted ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            removeLS(MEMBER_DATA);
                                                            removeLS(ADD_MEMBER);
                                                            router.push(`/kyc-quick-summary`);
                                                        }}
                                                        className="px-4 py-1.5 rounded-full bg-[#F59E0B] text-white text-xs font-semibold hover:bg-[#D97706] transition-colors"
                                                    >
                                                        View / Edit
                                                    </button>
                                                    {profileView.isCanRegistered && (
                                                        <button
                                                            onClick={() => handleOpenCANEdit(investorList)}
                                                            className="px-4 py-1.5 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                                                        >
                                                            Update CAN
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        removeLS(MEMBER_DATA);
                                                        removeLS(ADD_MEMBER);
                                                        const ud = getLS(USER_DATA);
                                                        ud.InvestorRegistration = investorList;
                                                        setLS(USER_DATA, ud);
                                                        router.push(`/initial-KYC`);
                                                    }}
                                                    className="px-4 py-1.5 rounded-full bg-[#F59E0B] text-white text-xs font-semibold hover:bg-[#D97706] transition-colors"
                                                >
                                                    Initial KYC
                                                </button>
                                            )}
                                            {profileView.isKycComplete && profileView.isKycDone && (
                                                <Link
                                                    href={`/account-holding`}
                                                    className="px-4 py-1.5 rounded-full border border-[#F59E0B] text-[#D97706] text-xs font-semibold hover:bg-[#F59E0B]/10 transition-colors"
                                                >
                                                    Link Account Holding
                                                </Link>
                                            )}
                                        </div>

                                        {/* Details grid */}
                                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiCreditCard className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">PAN</div>
                                                    <div className="font-mono font-semibold text-gray-800 truncate">{profileView.pan || "—"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiCalendar className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Date of Birth</div>
                                                    <div className="font-semibold text-gray-800">{profileView.dob ? formatDates(profileView.dob) : "—"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiPhone className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mobile</div>
                                                    <div className="font-semibold text-gray-800 truncate">{profileView.mobile || "—"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiMail className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Email</div>
                                                    <div className="font-semibold text-gray-800 truncate" title={profileView.email}>{profileView.email || "—"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 md:col-span-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiMapPin className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Address</div>
                                                    <div className="font-semibold text-gray-800 break-words">{profileView.address || "—"}</div>
                                                </div>
                                            </div>
                                            {(profileView.bankName || profileView.bankAccountNo) && (
                                                <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                        <FiHome className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Bank</div>
                                                            <div className="font-semibold text-gray-800 truncate" title={profileView.bankName}>{profileView.bankName || "—"}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Account No</div>
                                                            <div className="font-mono font-semibold text-gray-800">
                                                                {profileView.bankAccountNo ? `****${profileView.bankAccountNo.slice(-4)}` : "—"}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">IFSC</div>
                                                            <div className="font-mono font-semibold text-gray-800">{profileView.bankIfsc || "—"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center flex-shrink-0">
                                                    <FiUser className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Account Holding</div>
                                                    <div className="font-semibold text-gray-800">{profileView.accountHolding || "Not Linked"}</div>
                                                </div>
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