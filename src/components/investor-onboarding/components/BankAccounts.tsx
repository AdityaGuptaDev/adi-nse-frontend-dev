// components/steps/BankAccounts.tsx
import { useState, useEffect, useRef } from 'react';
import { StepComponentProps } from '../types';
import api from '@/utils/api';
import { getLS, toastAlert } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';
import { Trash } from 'lucide-react';
import { fetchHolderDetails } from '@/api/kyc';
import Select, { SingleValue } from "react-select";

interface BankAccount {
    accountNumber: string;
    reEnterAccountNumber: string;
    accountType: string;
    bankName: string;
    micr: string;
    ifsc: string;
    bankProof: string;
    bankId: string;
    isVerified?: boolean;
}

interface BankAccountsProps extends StepComponentProps { }

export default function BankAccounts({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    data,
    investorId
}: BankAccountsProps) {

    const user: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);

    const [visibleAccounts, setVisibleAccounts] = useState(1);
    const [isVerifying, setIsVerifying] = useState<Record<number, boolean>>({});
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
        return [
            {
                accountNumber: '',
                reEnterAccountNumber: '',
                accountType: '',
                bankName: '',
                micr: '',
                ifsc: '',
                bankProof: '',
                bankId: '',
                isVerified: false
            },
            {
                accountNumber: '',
                reEnterAccountNumber: '',
                accountType: '',
                bankName: '',
                micr: '',
                ifsc: '',
                bankProof: '',
                bankId: '',
                isVerified: false
            },
            {
                accountNumber: '',
                reEnterAccountNumber: '',
                accountType: '',
                bankName: '',
                micr: '',
                ifsc: '',
                bankProof: '',
                bankId: '',
                isVerified: false
            }
        ];
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Refs for debouncing and tracking verification
    const verificationTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({});
    const lastVerifiedValueRef = useRef<Record<number, { accountNumber: string; ifsc: string }>>({});

    // Account type options
    const accountTypeOptions = [
        { value: '', label: 'Select' },
        { value: 'CA', label: 'Current Account' },
        { value: 'CC', label: 'Cash Credit' },
        { value: 'FCNR', label: 'Foreign Currency Non Resident' },
        { value: 'NRE', label: 'Non Resident External Account' },
        { value: 'NRO', label: 'Non Resident Ordinary A/c' },
        { value: 'OD', label: 'Over Draft Account' },
        { value: 'OTH', label: 'Others' },
        { value: 'PSB', label: 'Post Office Savings Account' },
        { value: 'SB', label: 'Savings Account' },
        { value: 'SNRA', label: 'Special Non Resident Rupee A/c' },
        { value: 'SNRR', label: 'Special Non Resident repatriable' }
    ];

    // Bank proof options
    const bankProofOptions = [
        { value: '', label: 'Select' },
        { value: '14', label: 'Latest Bank Passbook' },
        { value: '15', label: 'Latest Bank Account Statement' },
        { value: '77', label: 'Cheque Copy' }
    ];

    // Load existing bank details
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchHolderDetails(user?.InvestorRegistration?.id);
                const result = res.data.data.data;

                const bankDetails = Array.isArray(result?.bankDetails)
                    ? result.bankDetails
                    : result?.bankDetails
                        ? [result.bankDetails]
                        : [];

                console.log("Bank Details Loaded: ", bankDetails);
                
                if (bankDetails.length > 0) {
                    const mappedBanks = bankDetails.map((b: any) => ({
                        accountNumber: b.account_no || '',
                        reEnterAccountNumber: b.account_no || '',
                        accountType: b.account_type || '',
                        bankName: b.bank_id || '',
                        micr: b.micr || '',
                        ifsc: b.ifsc || '',
                        bankProof: b.bank_proof || '',
                        bankId: b.bank_id || '',
                        isVerified: false
                    }));

                    const paddedBanks = [
                        ...mappedBanks,
                        ...Array(Math.max(0, 3 - mappedBanks.length)).fill({
                            accountNumber: '',
                            reEnterAccountNumber: '',
                            accountType: '',
                            bankName: '',
                            micr: '',
                            ifsc: '',
                            bankProof: '',
                            bankId: '',
                            isVerified: false
                        })
                    ];

                    setBankAccounts(paddedBanks);

                    // Auto-verify each bank account with a delay
                    setTimeout(() => {
                        paddedBanks.forEach((account, index) => {
                            if (account.accountNumber && account.ifsc && account.ifsc.length >= 11) {
                                console.log(`Scheduling auto-verification for bank account ${index + 1}`);
                                setTimeout(() => {
                                    validateBankDetails(account.accountNumber, account.ifsc, index);
                                }, index * 300);
                            }
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('Error loading bank details:', error);
            }
        };

        loadData();
    }, []);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(verificationTimeoutRef.current).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate first bank account (required)
        const firstAccount = bankAccounts[0];

        if (!firstAccount.accountNumber) {
            newErrors['accountNumber_0'] = 'Bank Account Number is required';
        }

        if (!firstAccount.reEnterAccountNumber) {
            newErrors['reEnterAccountNumber_0'] = 'Please re-enter Bank Account Number';
        } else if (firstAccount.accountNumber !== firstAccount.reEnterAccountNumber) {
            newErrors['reEnterAccountNumber_0'] = 'Account numbers do not match';
        }

        if (!firstAccount.accountType) {
            newErrors['accountType_0'] = 'Account Type is required';
        }

        if (!firstAccount.bankName) {
            newErrors['bankName_0'] = 'Bank Name is required';
        }

        if (!firstAccount.micr) {
            newErrors['micr_0'] = 'MICR is required';
        }

        if (!firstAccount.ifsc.trim()) {
            newErrors['ifsc_0'] = 'IFSC is required';
        }

        if (!firstAccount.bankProof) {
            newErrors['bankProof_0'] = 'Bank Proof is required';
        }

        // Validate other accounts if they have any data
        for (let i = 1; i < bankAccounts.length; i++) {
            const account = bankAccounts[i];
            const hasData =
                account.accountNumber.trim() ||
                account.reEnterAccountNumber.trim() ||
                account.accountType ||
                account.bankName ||
                account.micr.trim() ||
                account.ifsc.trim() ||
                account.bankProof;

            if (hasData) {
                if (!account.accountNumber.trim()) {
                    newErrors[`accountNumber_${i}`] = 'Bank Account Number is required';
                }

                if (!account.reEnterAccountNumber.trim()) {
                    newErrors[`reEnterAccountNumber_${i}`] = 'Please re-enter Bank Account Number';
                } else if (account.accountNumber !== account.reEnterAccountNumber) {
                    newErrors[`reEnterAccountNumber_${i}`] = 'Account numbers do not match';
                }

                if (!account.accountType) {
                    newErrors[`accountType_${i}`] = 'Account Type is required';
                }

                if (!account.bankName) {
                    newErrors[`bankName_${i}`] = 'Bank Name is required';
                }

                if (!account.micr.trim()) {
                    newErrors[`micr_${i}`] = 'MICR is required';
                }

                if (!account.ifsc.trim()) {
                    newErrors[`ifsc_${i}`] = 'IFSC is required';
                }

                if (!account.bankProof) {
                    newErrors[`bankProof_${i}`] = 'Bank Proof is required';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = true;

    useEffect(() => {
        onCompletionUpdate(isFormValid);
    }, [isFormValid, onCompletionUpdate]);

    const handleAccountChange = (index: number, field: Exclude<keyof BankAccount, 'isVerified'>, value: string) => {
        setBankAccounts(prev => {
            const updatedAccounts = [...prev];
            updatedAccounts[index] = { 
                ...updatedAccounts[index], 
                [field]: value,
                isVerified: false
            };
            return updatedAccounts;
        });

        // Clear error when user starts typing
        const errorKey = `${field}_${index}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }

       
        if (verificationTimeoutRef.current[index]) {
            clearTimeout(verificationTimeoutRef.current[index]);
        }

        // Check if all required fields are present
        const currentAccount = { ...bankAccounts[index], [field]: value };
        
        const shouldValidate = 
            currentAccount.accountNumber && 
            currentAccount.accountNumber.length > 0 &&
            currentAccount.ifsc && 
            currentAccount.ifsc.length >= 11;

        if (shouldValidate) {
            const isAccountNumberField = field === 'accountNumber';
            const isIfscField = field === 'ifsc' && value.length >= 11;
            const isReEnterField = field === 'reEnterAccountNumber' && 
                                   currentAccount.accountNumber === value;

            if (isAccountNumberField || isIfscField || isReEnterField) {
                console.log(`Scheduling validation from ${field} field`);
                
                // Debounce the API call
                verificationTimeoutRef.current[index] = setTimeout(() => {
                    // Get the latest account state
                    const latestAccount = bankAccounts[index];
                    if (latestAccount.accountNumber === currentAccount.accountNumber && 
                        latestAccount.ifsc === currentAccount.ifsc) {
                        
                        // Check if already verified with these exact values
                        const lastVerified = lastVerifiedValueRef.current[index];
                        if (!lastVerified || 
                            lastVerified.accountNumber !== currentAccount.accountNumber || 
                            lastVerified.ifsc !== currentAccount.ifsc) {
                            
                            console.log(`Executing validation for account ${index}`);
                            validateBankDetails(currentAccount.accountNumber, currentAccount.ifsc, index);
                        }
                    }
                }, 800);
            }
        }
    };

    const handleReEnterBlur = (index: number) => {
        const currentAccount = bankAccounts[index];
    
        if (currentAccount.accountNumber && 
            currentAccount.ifsc && 
            currentAccount.ifsc.length >= 11 &&
            currentAccount.reEnterAccountNumber &&
            currentAccount.accountNumber === currentAccount.reEnterAccountNumber) {
            
            console.log("Re-Enter field blur - checking if verification needed");
            
            // Clear any pending timeout
            if (verificationTimeoutRef.current[index]) {
                clearTimeout(verificationTimeoutRef.current[index]);
            }
            
            // Check if already verified with these values
            const lastVerified = lastVerifiedValueRef.current[index];
            if (!lastVerified || 
                lastVerified.accountNumber !== currentAccount.accountNumber || 
                lastVerified.ifsc !== currentAccount.ifsc) {
                
                // Small delay to ensure state is updated
                setTimeout(() => {
                    validateBankDetails(currentAccount.accountNumber, currentAccount.ifsc, index);
                }, 100);
            }
        }
    };

    const validateBankDetails = async (
        accountNumber: string,
        ifscCode: string,
        index: number
    ) => {
        // Prevent multiple simultaneous verifications
        if (isVerifying[index]) {
            console.log('Verification already in progress for account', index);
            return;
        }

        // Check if already verified with these exact values
        const lastVerified = lastVerifiedValueRef.current[index];
        if (lastVerified && 
            lastVerified.accountNumber === accountNumber && 
            lastVerified.ifsc === ifscCode && 
            bankAccounts[index]?.isVerified) {
            console.log('Account already verified with same values, skipping');
            return;
        }

        try {
            setIsVerifying(prev => ({ ...prev, [index]: true }));

            const payload = {
                bankAcNo: accountNumber,
                bankAcIfsc: ifscCode
            };

            const response = await api.post(
                "/cashfree/initiate-bank-account-verification",
                payload
            );

            // Check if response is successful
            if (response.data?.status === "success" || response.data?.data) {
                const bankData = response.data.data;
                
                if (bankData) {
                    const responseBank = bankData?.bank_name || bankData?.ifsc_details?.bank || "";

                    const normalize = (str: string) =>
                        str?.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

                    const normalizedResponseBank = normalize(responseBank);

                    const selectedBank = (data?.bank_list || []).find((b: any) => {
                        const normalizedListBank = normalize(b.bank_name);
                        return (
                            normalizedListBank.includes(normalizedResponseBank) ||
                            normalizedResponseBank.includes(normalizedListBank)
                        );
                    });

                    console.log('Selected Bank:', selectedBank);
                    
                    setBankAccounts(prev => {
                        const updated = [...prev];
                        updated[index] = {
                            ...updated[index],
                            micr: bankData?.micr || updated[index].micr,
                            bankName: selectedBank?.bank_name || responseBank || updated[index].bankName,
                            bankId: selectedBank?.mfu_bk_id || updated[index].bankId,
                            isVerified: true
                        };
                        return updated;
                    });

                    // Store the verified values
                    lastVerifiedValueRef.current[index] = {
                        accountNumber,
                        ifsc: ifscCode
                    };

                    if (bankData?.micr) {
                        setErrors(prev => ({
                            ...prev,
                            [`micr_${index}`]: ""
                        }));
                    }

                    toastAlert("success", response.data.msg || "Bank details verified successfully");
                } else {
                    toastAlert("warning", "Bank verification returned no data");
                }
            } else {
                // API returned but with error status
                const errorMsg = response.data?.msg || "Failed to validate bank details";
                toastAlert("error", errorMsg);
                
                setBankAccounts(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        isVerified: false
                    };
                    return updated;
                });
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            
            const errorMessage = error?.response?.data?.msg || 
                                error?.message || 
                                "Failed to validate bank details";
            
            toastAlert("error", errorMessage);
            
            setBankAccounts(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    isVerified: false
                };
                return updated;
            });
        } finally {
            setIsVerifying(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(bankAccounts);
        
        const payload = {
            investor_id: investorId,
            last_kyc_step: 'bank-accounts',
            next_kyc_step: 'nominees',
            bank_details: bankAccounts
                .filter(acc =>
                    acc.accountNumber ||
                    acc.reEnterAccountNumber ||
                    acc.accountType ||
                    acc.bankName ||
                    acc.ifsc ||
                    acc.micr ||
                    acc.bankProof
                )
                .map(acc => ({
                    cancelled_cheque: "",
                    account_number: acc.accountNumber,
                    account_type: acc.accountType,
                    bank_name: acc.bankName,
                    bank_id: acc.bankId,
                    micr: acc.micr,
                    ifsc: acc.ifsc,
                    bank_proof: acc.bankProof
                }))
        };

        try {
            let response = await api.post(`/kyc/update-bank-details`, payload);
            console.log(response);

            if (validateForm()) {
                onNext();
            }
        } catch (error) {
            console.error('Error submitting bank details:', error);
            toastAlert("error", "Failed to save bank details");
        }
    };

    const renderBankAccountSection = (index: number, title: string, isRequired: boolean = false) => {
        const account = bankAccounts[index];
        const getError = (field: string) => errors[`${field}_${index}`];
        const isVerifyingAccount = isVerifying[index];

        return (
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {title}
                        {account.isVerified && (
                            <span className="ml-2 text-green-600 text-sm font-normal">
                                ✓ Verified
                            </span>
                        )}
                        {isVerifyingAccount && (
                            <span className="ml-2 text-blue-600 text-sm font-normal">
                                Verifying...
                            </span>
                        )}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* IFSC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={account.ifsc}
                                onChange={(e) => handleAccountChange(index, 'ifsc', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={11}
                                disabled={isVerifyingAccount}
                            />
                            {getError('ifsc') && (
                                <p className="text-red-500 text-xs mt-1">{getError('ifsc')}</p>
                            )}
                        </div>
                        
                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank A/c No {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                value={account.accountNumber}
                                onChange={(e) => handleAccountChange(index, 'accountNumber', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={20}
                                disabled={isVerifyingAccount}
                            />
                            {getError('accountNumber') && (
                                <p className="text-red-500 text-xs mt-1">{getError('accountNumber')}</p>
                            )}
                        </div>

                        {/* Re-enter Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Re-Enter Bank A/c No {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={account.reEnterAccountNumber}
                                onChange={(e) => handleAccountChange(index, 'reEnterAccountNumber', e.target.value.toUpperCase())}
                                onBlur={() => handleReEnterBlur(index)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={20}
                                disabled={isVerifyingAccount}
                            />
                            {getError('reEnterAccountNumber') && (
                                <p className="text-red-500 text-xs mt-1">{getError('reEnterAccountNumber')}</p>
                            )}
                        </div>

                        {/* Account Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                value={account.accountType}
                                onChange={(e) => handleAccountChange(index, 'accountType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isVerifyingAccount}
                            >
                                {accountTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {getError('accountType') && (
                                <p className="text-red-500 text-xs mt-1">{getError('accountType')}</p>
                            )}
                        </div>

                        {/* Bank Name */}
                        <div className="relative w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative w-full">
                                <Select
                                    options={data?.bank_list || []}
                                    getOptionLabel={(option: any) => option.bank_name}
                                    getOptionValue={(option: any) => option.mfu_bk_id}
                                    value={
                                        account.bankId
                                            ? (data?.bank_list ?? []).find(
                                                (bank: any) => bank.mfu_bk_id === account.bankId
                                            ) ?? null
                                            : null
                                    }
                                    onChange={(selectedOption: SingleValue<any>) => {
                                        const bankId = selectedOption?.mfu_bk_id || "";
                                        const bankName = selectedOption?.bank_name || "";
                                        handleAccountChange(index, "bankId", bankId);
                                        handleAccountChange(index, "bankName", bankName);
                                    }}
                                    isClearable
                                    placeholder="Select Bank"
                                    name={`bank-select-${index}`}
                                    className="w-full border border-gray-300 rounded-lg"
                                    isDisabled={isVerifyingAccount}
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        control: (base) => ({ ...base, fontSize: "0.75rem" }),
                                        singleValue: (base) => ({ ...base, fontSize: "0.75rem" }),
                                    }}
                                    menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                />
                                {getError("bankName") && (
                                    <p className="text-red-500 text-xs mt-1">{getError("bankName")}</p>
                                )}
                            </div>
                        </div>

                        {/* MICR */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                MICR {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={account.micr}
                                onChange={(e) => handleAccountChange(index, 'micr', e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={9}
                                disabled={isVerifyingAccount}
                            />
                            {getError('micr') && (
                                <p className="text-red-500 text-xs mt-1">{getError('micr')}</p>
                            )}
                        </div>

                        {/* Bank Proof */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Proof {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                value={account.bankProof}
                                onChange={(e) => handleAccountChange(index, 'bankProof', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isVerifyingAccount}
                            >
                                {bankProofOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {getError('bankProof') && (
                                <p className="text-red-500 text-xs mt-1">{getError('bankProof')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bank Account Details</h2>

            {renderBankAccountSection(0, "Default Bank Account", true)}

            {visibleAccounts >= 2 &&
                renderBankAccountSection(1, "Second Bank Account")}

            {visibleAccounts >= 3 &&
                renderBankAccountSection(2, "Third Bank Account")}

            <div className='flex justify-end items-center gap-3'>
                {visibleAccounts < 3 && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setVisibleAccounts(visibleAccounts + 1);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            + Add More
                        </button>
                    </div>
                )}

                {visibleAccounts > 1 && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setVisibleAccounts(visibleAccounts - 1)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            <Trash />
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-md transition-colors ${
                        isFirstStep
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-2 rounded-md transition-colors ${
                        isFormValid
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {isLastStep ? 'Submit' : 'Next'}
                </button>
            </div>
        </form>
    );
}