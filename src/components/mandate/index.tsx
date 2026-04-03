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

    return (
        <div>
            <div className='md:flex justify-between pageTitle'>
                <div>
                    <CustomText className="font-semibold font-montserrat text-xl ">
                        Create Mandates
                    </CustomText>
                </div>
                <div>
                    <CustomButton onClick={() => router.push(`/account-holding`)}>
                        Back To Account Holding
                    </CustomButton>
                </div>
            </div>
            <div className='p-4'>
                <div className='grid grid-cols-3 md:grid-cols-3 gap-4'>
                    <div>
                        <CustomReactSelect label='Select Investor' items={investorList} bindName='label' bindValue='value' placeholder='select investor' value={investorId} onChange={(e: any) => handleInvestor(e.value)} />
                    </div>
                    {error &&
                        <p className='text-error text-xs text-center'>{error}</p>
                    }
                </div>
                <div className='grid grid-cols-3 md:grid-cols-3 gap-4 mt-4'>
                    <div>
                        <CustomReactSelect
                            label='Bank Account'
                            items={bankList}
                            bindName='account_no'
                            bindValue='account_no'
                            value={accountNumber}
                            onChange={(e: any) => handleAccount(e.account_no)}
                        />
                    </div>
                    <div>
                        <CustomInput
                            label='Bank Name'
                            disabled
                            value={bankName}
                            onChange={(e: any) => setBankName(e.bankName)}
                        />
                    </div>
                    <div>
                        <CustomInput
                            label='IFSC Code'
                            disabled
                            value={ifscCode}
                            onChange={(e: any) => setIfscCode(e.ifsc)}
                        />
                    </div>
                </div>
                <div className='grid grid-cols-3 md:grid-cols-3 gap-4 mt-4'>
                    <div>
                        <CustomInput
                            label='MICR Code'
                            disabled
                            value={micrCode}
                            onChange={(e: any) => setMicrCode(e.micr)}
                        />
                    </div>

                    <div>
                        <CustomReactSelect label='Registration Mode' items={regMode} bindName='name' bindValue='id' placeholder='--select--' onChange={(e: any) => {
                            setRegistrationMode(e.id);
                        }} value={registrationMode} />
                    </div>


                    <div>
                        <CustomReactSelect label='Account Type' items={accountTypeList} bindName='name' bindValue='value' placeholder='--select--' value={accountType || ""} onChange={(e: any) => setAccountType(e.value)} />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>

                    <div>
                        <CustomInput label='Start Date' type='date' value={startDate} max={formatDate(
                            new Date())} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <CustomInput label='End Date' type='date' value={endDate} min={formatDate(
                            new Date())} onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <CustomReactSelect label={manType === "E-Mandate"
                            ? "Limit"
                            : "SI Amount"} items={perDay} bindName='name' bindValue='id' placeholder='--select--' onChange={(e: any) => {
                                setCustomAmt(e.id);
                            }} value={CustomAmt} />
                    </div>
                    {CustomAmt === "other" ? (
                        <div>
                            <CustomInput label='Custom Amount' />
                        </div>
                    ) : null}



                </div>
            </div>

            <div className='p-4 text-center'>
                <div>
                    <CustomButton className='w-32' onClick={handleSubmit}>
                        {isLoading ? `Wait...` :
                            `Register`}
                        {isLoading &&
                            <Loader size="w-4 h-4" color="text-white" thickness="border-2" borderColor='border-gray-300' />
                        }

                    </CustomButton>
                </div>
            </div>

        </div>
    )
}

export default Mandate