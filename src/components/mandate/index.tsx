"use client"

import { getBankAccount, getInvestor } from '@/api/holder';
import { submitEmandate } from '@/api/transaction';
import CustomButton from '@/commonUI/Button'
import CustomCheckbox from '@/commonUI/CheckBox';
import CustomInput from '@/commonUI/Input';
import CustomRadio from '@/commonUI/Radio';
import CustomReactSelect from '@/commonUI/ReactSelect';
import CustomText from '@/commonUI/Text'
import { formatDate } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { accountTypeList, USER_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";
import { decrypt } from '@/utils/aesmfu';
import { useSearchParams } from 'next/navigation';
import Loader from '@/commonUI/Loader';
import { MfuPayload } from '@/utils/mfu/generatePayload';
import { ArrowLeft, CreditCard, Calendar, Banknote, User, Shield, AlertCircle } from 'lucide-react';

function Mandate() {

    const router = useRouter();
    //const searchParams = useSearchParams();
    const user = getLS(USER_DATA);
    console.log("User Data:- ", user)


    // const encryptedId = searchParams.get("id");



    const [manType, setManType] = useState("E-Mandate");
    const [CustomAmt, setCustomAmt] = useState();


    const [investorId, setInvestorId] = useState<any>();
    const [accountHoldingName, setAccountHoldingName] = useState<any>();
    const [accountNumber, setAccountNumber] = useState<any>();
    const [accountType, setAccountType] = useState<any>();
    const [bankId, setBankId] = useState<any>('');
    const [bankName, setBankName] = useState<any>('');
    const [ifscCode, setIfscCode] = useState<any>();
    const [micrCode, setMicrCode] = useState<any>();
    const [bankList, setBankList] = useState<any[]>([])
    const [registrationMode, setRegistrationMode] = useState<any>();
    const [investorList, setInvestorList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const [startDate, setStartDate] = useState<any>(() => {
        const today = new Date();
        today.setDate(today.getDate() + 2);
        return formatDate(today);
    });

    const [endDate, setEndDate] = useState<any>(() => {
        const today = new Date();
        today.setDate(today.getDate() + 30);
        return formatDate(today);
    });



    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const encryptedId = params.get('id');

            if (!encryptedId) {
                console.warn("No 'id' param found in URL.");
                return;
            }

            try {
                const decrypted = decrypt(encryptedId);
                const parsedInvestorList = JSON.parse(decrypted);
                setInvestorList(parsedInvestorList);

                // If you want to see the updated state, log the parsed result directly
                console.log("Decrypted and parsed investor list:", parsedInvestorList);
            } catch (error) {
                console.error("Failed to decrypt or parse ID:", error);
            }
        }
    }, []);





    const perDay = [
        { id: "other", name: "Custom" },
        { id: "5000.00", name: "5000" },
        { id: "15000.00", name: "15000" },
        { id: "50000.00", name: "50000" },
        { id: "100000.00", name: "100000" },
        { id: "250000.00", name: "250000" },
        { id: "300000.00", name: "300000" },
        { id: "350000.00", name: "350000" },
        { id: "400000.00", name: "400000" },
        { id: "450000.00", name: "450000" },
        { id: "500000.00", name: "500000" },
        { id: "1000000.00", name: "1000000" },

    ];


    const regMode = [
        {
            id: "PN",
            name: "Payment Net-banking Mode",
        },
        {
            id: "PD",
            name: "Payment Debit Card Mode",
        },
    ];
    const handleInvestor = async (investor_id: string) => {
        console.log(investor_id)
        setInvestorId(investor_id)


        const response = await getBankAccount(user?.InvestorRegistration?.id);
        //const response = await getInvestor(91);
        const data = response?.data?.data?.data

        console.log("bankList :- ", response?.data?.data?.data);
        setBankList(data)


    }

    const handleAccount = async (accNo: any) => {

        setAccountNumber(accNo);
        const bankData = bankList.find(opt => opt.account_no === accNo);
        setAccountType(accountTypeList.find((opt: any) => opt.id == bankData?.account_type)?.value);
        setBankId(bankData.BankMaster.mfu_bk_id);
        setIfscCode(bankData?.ifsc);
        setMicrCode(bankData?.micr);
        setBankName(bankData.BankMaster.bank_name)

    }


    const handleSubmit = async () => {

        setIsLoading(true)
        const jsonRequest = {
            sendResponseFormat: "JSON",
            regMode: registrationMode,
            entityId: process.env.NEXT_PUBLIC_VEDANT_ENTITY_ID,
            can: investorList[0]?.canId,
            riaNo: "",
            arnNo: process.env.NEXT_PUBLIC_VEDANT_ARN,
            subBrokArn: "",
            subBrokCode: "",
            euincode: "",
            accNo: accountNumber,
            accType: accountType,
            bankId: bankId,
            ifscCode: ifscCode,
            micrCode: micrCode,
            maxAmt: CustomAmt,
            startDate: startDate,
            endDate: endDate,
            investorId: investorId,
            mandateType: "E",
        };
        console.log(jsonRequest)
        const stringifiedPayload: Record<string, string> = Object.fromEntries(
            Object.entries(jsonRequest).filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );

        const queryString = new URLSearchParams(stringifiedPayload).toString();
        const response = await submitEmandate(queryString)
        console.log(response)

        const result = response?.data?.data?.data;
        console.log(result)
        const appLink = result?.addResp?.approveLink;

        if (appLink) {
            window.location.href = appLink;
        }
        if (result?.errorCode) {
            setError(result?.errorMessage)
        }
        setIsLoading(false)

    }

    // Custom styles for date picker calendar
    const datePickerStyles = `
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            opacity: 0.7;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            color: #F9FAFB;
        }
        input[type="date"]::-webkit-datetime-edit-text {
            color: #9CA3AF;
        }
        input[type="date"]::-webkit-datetime-edit-month-field {
            color: #F9FAFB;
        }
        input[type="date"]::-webkit-datetime-edit-day-field {
            color: #F9FAFB;
        }
        input[type="date"]::-webkit-datetime-edit-year-field {
            color: #F9FAFB;
        }
        input[type="date"]:focus::-webkit-datetime-edit-fields-wrapper {
            color: #F59E0B;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            filter: invert(1);
            opacity: 0.7;
            cursor: pointer;
        }
        input[type="number"]::-webkit-inner-spin-button:hover,
        input[type="number"]::-webkit-outer-spin-button:hover {
            opacity: 1;
        }
    `;

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <style>{datePickerStyles}</style>
            <div className="w-full px-4 sm:px-6 py-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                            <CreditCard className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <div>
                            <CustomText className="font-semibold font-montserrat text-xl text-[#F9FAFB]">
                                Create Mandates
                            </CustomText>
                            <CustomText className="text-sm text-[#9CA3AF] mt-1">
                                Set up automated payment mandates for your investments
                            </CustomText>
                        </div>
                    </div>
                    <div>
                        <CustomButton 
                            onClick={() => router.push(`/account-holding`)}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back To Account Holding
                        </CustomButton>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden">
                    <div className="p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                                <p className='text-[#EF4444] text-sm'>{error}</p>
                            </div>
                        )}

                        {/* Investor Selection */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Select Investor
                                </label>
                                <CustomReactSelect 
                                    items={investorList} 
                                    bindName='label' 
                                    bindValue='value' 
                                    placeholder='select investor' 
                                    value={investorId} 
                                    onChange={(e: any) => handleInvestor(e.value)} 
                                    className="bg-[#1F1A1A] border-[#2A2A2A] text-[#F9FAFB]"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            borderColor: '#2A2A2A',
                                            color: '#F9FAFB'
                                        }),
                                        menu: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            border: '1px solid #2A2A2A'
                                        }),
                                        option: (base: any, state: any) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                                            color: '#F9FAFB',
                                            cursor: 'pointer'
                                        }),
                                        singleValue: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        input: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        placeholder: (base: any) => ({
                                            ...base,
                                            color: '#9CA3AF'
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Bank Account
                                </label>
                                <CustomReactSelect
                                    items={bankList}
                                    bindName='account_no'
                                    bindValue='account_no'
                                    value={accountNumber}
                                    onChange={(e: any) => handleAccount(e.account_no)}
                                    className="bg-[#1F1A1A] border-[#2A2A2A] text-[#F9FAFB]"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            borderColor: '#2A2A2A',
                                            color: '#F9FAFB'
                                        }),
                                        menu: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            border: '1px solid #2A2A2A'
                                        }),
                                        option: (base: any, state: any) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                                            color: '#F9FAFB',
                                            cursor: 'pointer'
                                        }),
                                        singleValue: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        input: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        placeholder: (base: any) => ({
                                            ...base,
                                            color: '#9CA3AF'
                                        })
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={bankName}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={ifscCode}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                                />
                            </div>
                        </div>

                        {/* Additional Bank Details */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    MICR Code
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={micrCode}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Registration Mode
                                </label>
                                <CustomReactSelect 
                                    items={regMode} 
                                    bindName='name' 
                                    bindValue='id' 
                                    placeholder='--select--' 
                                    onChange={(e: any) => {
                                        setRegistrationMode(e.id);
                                    }} 
                                    value={registrationMode}
                                    className="bg-[#1F1A1A] border-[#2A2A2A] text-[#F9FAFB]"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            borderColor: '#2A2A2A',
                                            color: '#F9FAFB'
                                        }),
                                        menu: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            border: '1px solid #2A2A2A'
                                        }),
                                        option: (base: any, state: any) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                                            color: '#F9FAFB',
                                            cursor: 'pointer'
                                        }),
                                        singleValue: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        input: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        placeholder: (base: any) => ({
                                            ...base,
                                            color: '#9CA3AF'
                                        })
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Account Type
                                </label>
                                <CustomReactSelect 
                                    items={accountTypeList} 
                                    bindName='name' 
                                    bindValue='value' 
                                    placeholder='--select--' 
                                    value={accountType || ""} 
                                    onChange={(e: any) => setAccountType(e.value)}
                                    className="bg-[#1F1A1A] border-[#2A2A2A] text-[#F9FAFB]"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            borderColor: '#2A2A2A',
                                            color: '#F9FAFB'
                                        }),
                                        menu: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            border: '1px solid #2A2A2A'
                                        }),
                                        option: (base: any, state: any) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                                            color: '#F9FAFB',
                                            cursor: 'pointer'
                                        }),
                                        singleValue: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        input: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        placeholder: (base: any) => ({
                                            ...base,
                                            color: '#9CA3AF'
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* Date and Amount Section */}
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-6'>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Start Date
                                </label>
                                <input 
                                    type='date' 
                                    value={startDate} 
                                    max={formatDate(new Date())} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    End Date
                                </label>
                                <input 
                                    type='date' 
                                    value={endDate} 
                                    min={formatDate(new Date())} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    {manType === "E-Mandate" ? "Limit Amount" : "SI Amount"}
                                </label>
                                <CustomReactSelect 
                                    items={perDay} 
                                    bindName='name' 
                                    bindValue='id' 
                                    placeholder='--select--' 
                                    onChange={(e: any) => {
                                        setCustomAmt(e.id);
                                    }} 
                                    value={CustomAmt}
                                    className="bg-[#1F1A1A] border-[#2A2A2A] text-[#F9FAFB]"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            borderColor: '#2A2A2A',
                                            color: '#F9FAFB'
                                        }),
                                        menu: (base: any) => ({
                                            ...base,
                                            backgroundColor: '#1F1A1A',
                                            border: '1px solid #2A2A2A'
                                        }),
                                        option: (base: any, state: any) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#2A2A2A' : '#1F1A1A',
                                            color: '#F9FAFB',
                                            cursor: 'pointer'
                                        }),
                                        singleValue: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        input: (base: any) => ({
                                            ...base,
                                            color: '#F9FAFB'
                                        }),
                                        placeholder: (base: any) => ({
                                            ...base,
                                            color: '#9CA3AF'
                                        })
                                    }}
                                />
                            </div>
                            
                            {CustomAmt === "other" && (
                                <div>
                                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                        Custom Amount
                                    </label>
                                    <input 
                                        type="number"
                                        placeholder="Enter custom amount"
                                        className="w-full px-4 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button Section */}
                    <div className='p-6 border-t border-[#2A2A2A] bg-gradient-to-r from-[#1F1A1A] to-[#111111]'>
                        <div className="flex justify-center">
                            <button 
                                onClick={handleSubmit}
                                className="w-32 px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Wait...</span>
                                        <Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-[#3A3A3A]' />
                                    </div>
                                ) : (
                                    'Register'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mandate