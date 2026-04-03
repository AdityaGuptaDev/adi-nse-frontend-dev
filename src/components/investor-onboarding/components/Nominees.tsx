
import { useState, useEffect } from 'react';
import { StepComponentProps } from '../types';
import api from '@/utils/api';
import {
    ADD_MEMBER,
    KYC_STEPS,
    MEMBER_DATA,
    MEMBER_TYPE,
    NODE_API_URL,
    PAN_NO_REGEX,
    USER_DATA,
    formatTime,
    phoneRegExp,
    EMAIL_REGEX,
    MOBILE_REGEX,
    MOBILE_VERIFICATION_RESPONSE,
} from "@/utils/constants";
import {
    getLS,
    handleServerError,
    setLS,
    toastAlert,
} from "@/utils/helpers";
import getConfig from 'next/config';
import { Trash } from 'lucide-react';
import { fetchHolderDetails } from '@/api/kyc';
import next from 'next';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Nominee {
    name: string;
    relationship: string;
    percentage: string;
    dateOfBirth: string;
    personalIdentifierType: string;
    personalIdentifierNumber: string;
    mobile: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    pinCode: string;
    city: string;
    country: string;
    guardianName: string;
    guardianRelationship: string;
    guardianDateOfBirth: string;
    sameAddressAsFirst: boolean;
}

//const NOMINEES_KEY = "nominees";


interface NomineesProps extends StepComponentProps { }

export default function Nominees({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    data,
    investorId
}: NomineesProps) {

    //const user: any = getLS(USER_DATA);
    const user: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);


    const [nominationOption, setNominationOption] = useState('');
    const [showNomineeSection, setShowNomineeSection] = useState(false);
    const [folioSOA, setFolioSOA] = useState('');
    const [showFolioSOADisclaimer, setShowFolioSOADisclaimer] = useState(false);
    const [visibleAccounts, setVisibleAccounts] = useState(1);

    const [nominees, setNominees] = useState<Nominee[]>(() => {

        return [
            {
                name: '',
                relationship: '',
                percentage: '',
                dateOfBirth: '',
                personalIdentifierType: '',
                personalIdentifierNumber: '',
                mobile: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pinCode: '',
                city: '',
                country: '',
                guardianName: '',
                guardianRelationship: '',
                guardianDateOfBirth: '',
                sameAddressAsFirst: false
            },
            {
                name: '',
                relationship: '',
                percentage: '',
                dateOfBirth: '',
                personalIdentifierType: '',
                personalIdentifierNumber: '',
                mobile: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pinCode: '',
                city: '',
                country: '',
                guardianName: '',
                guardianRelationship: '',
                guardianDateOfBirth: '',
                sameAddressAsFirst: false
            },
            {
                name: '',
                relationship: '',
                percentage: '',
                dateOfBirth: '',
                personalIdentifierType: '',
                personalIdentifierNumber: '',
                mobile: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pinCode: '',
                city: '',
                country: '',
                guardianName: '',
                guardianRelationship: '',
                guardianDateOfBirth: '',
                sameAddressAsFirst: false
            }
        ]
    });


    const toDateInputValue = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };


    useEffect(() => {
        const loadData = async () => {
            const res = await fetchHolderDetails(user?.InvestorRegistration?.id);
            const result = res.data?.data?.data;

            console.log("Holder Details", result);

            if (!result) return;



            /* ---------------------------------------------------
               NOMINEES (MULTIPLE)
            ---------------------------------------------------- */
            const nomineeArray = Array.isArray(result.nomineeDetails)
                ? result.nomineeDetails
                : result.nomineeDetails
                    ? [result.nomineeDetails]
                    : [];

            // Map DB → React format

            setNominationOption('Y');
            setShowNomineeSection(true);

            const mappedNominees = nomineeArray.map((n: any) => ({
                name: n.nominee_name || '',
                relationship: n.relation || '',
                percentage: n.percentage_allocation || '',
                dateOfBirth: toDateInputValue(n.nominee_DOB) || '',
                personalIdentifierType: n.identity_type || '',
                personalIdentifierNumber: n.identity_number || '',
                mobile: n.mobile_number || '',
                email: n.email_address || '',
                addressLine1: n.address_line_1 || '',
                addressLine2: n.address_line_2 || '',
                addressLine3: n.address_line_3 || '',
                pinCode: n.pin_code || '',
                city: n.city || '',
                country: n.country || '',

                guardianName: n.guardian_name || '',
                guardianRelationship: n.guardian_relationship || '',
                guardianDateOfBirth: n.guardian_date_of_birth || '',

                sameAddressAsFirst: false, // controlled only by UI
            }));

            // Always ensure 3 rows
            const defaultNominee = {
                name: '',
                relationship: '',
                percentage: '',
                dateOfBirth: '',
                personalIdentifierType: '',
                personalIdentifierNumber: '',
                mobile: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pinCode: '',
                city: '',
                country: '',
                guardianName: '',
                guardianRelationship: '',
                guardianDateOfBirth: '',
                sameAddressAsFirst: false
            };

            const paddedNominees = [
                ...mappedNominees,
                ...Array(Math.max(0, 3 - mappedNominees.length)).fill(defaultNominee)
            ];
            console.log("Padded Nominees:", paddedNominees);
            console.log("Mapped Nominees:", mappedNominees);

            setNominees(paddedNominees);



        };

        loadData();
    }, []);


    const [errors, setErrors] = useState<Record<string, string>>({});
    const [countryList, setCountryList] = useState<any>([]);

    // Options
    const nominationOptions = [
        { value: '', label: 'Select' },
        { value: 'N', label: 'No - I/We declare to Opt out' },
        { value: 'Y', label: 'Yes - I/We wish to nominate' }
    ];


    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate nomination option
        if (!nominationOption) {
            newErrors.nominationOption = 'Nomination Option is required';
        }

        // If user opts for nomination, validate nominee details
        if (nominationOption === 'Y') {
            // Validate first nominee (required)
            const firstNominee = nominees[0];

            if (!firstNominee.name.trim()) {
                newErrors['name_0'] = 'Name of Nominee is required';
            }

            if (!firstNominee.relationship) {
                newErrors['relationship_0'] = 'Relationship is required';
            }

            if (!firstNominee.percentage) {
                newErrors['percentage_0'] = 'Percentage is required';
            } else if (!/^\d{1,3}$/.test(firstNominee.percentage) || parseInt(firstNominee.percentage) > 100) {
                newErrors['percentage_0'] = 'Percentage must be between 0 and 100';
            }

            if (!firstNominee.dateOfBirth) {
                newErrors['dateOfBirth_0'] = 'Date of Birth is required';
            }

            if (!firstNominee.personalIdentifierType) {
                newErrors['personalIdentifierType_0'] = 'Personal Identifier Type is required';
            }

            if (!firstNominee.personalIdentifierNumber.trim()) {
                newErrors['personalIdentifierNumber_0'] = 'Personal Identifier Number is required';
            }

            if (!firstNominee.mobile.trim()) {
                newErrors['mobile_0'] = 'Mobile is required';
            }

            if (!firstNominee.email.trim()) {
                newErrors['email_0'] = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firstNominee.email)) {
                newErrors['email_0'] = 'Invalid email format';
            }

            if (!firstNominee.addressLine1.trim()) {
                newErrors['addressLine1_0'] = 'Address Line 1 is required';
            }


            if (!firstNominee.pinCode) {
                newErrors['pinCode_0'] = 'Pin code is required';
            }

            if (!firstNominee.city.trim()) {
                newErrors['city_0'] = 'City is required';
            }

            if (!firstNominee.country) {
                newErrors['country_0'] = 'Country is required';
            }

            // Validate other nominees if they have any data
            for (let i = 1; i < nominees.length; i++) {
                const nominee = nominees[i];
                const hasData =
                    nominee.name.trim() ||
                    nominee.relationship ||
                    nominee.percentage.trim() ||
                    nominee.dateOfBirth ||
                    nominee.personalIdentifierType ||
                    nominee.personalIdentifierNumber.trim() ||
                    nominee.mobile.trim() ||
                    nominee.email.trim();

                if (hasData) {
                    if (!nominee.name.trim()) {
                        newErrors[`name_${i}`] = 'Name of Nominee is required';
                    }

                    if (!nominee.relationship) {
                        newErrors[`relationship_${i}`] = 'Relationship is required';
                    }

                    if (!nominee.percentage.trim()) {
                        newErrors[`percentage_${i}`] = 'Percentage is required';
                    } else if (!/^\d{1,3}$/.test(nominee.percentage) || parseInt(nominee.percentage) > 100) {
                        newErrors[`percentage_${i}`] = 'Percentage must be between 0 and 100';
                    }

                    if (!nominee.dateOfBirth) {
                        newErrors[`dateOfBirth_${i}`] = 'Date of Birth is required';
                    }

                    if (!nominee.personalIdentifierType) {
                        newErrors[`personalIdentifierType_${i}`] = 'Personal Identifier Type is required';
                    }

                    if (!nominee.personalIdentifierNumber.trim()) {
                        newErrors[`personalIdentifierNumber_${i}`] = 'Personal Identifier Number is required';
                    }

                    if (!nominee.mobile.trim()) {
                        newErrors[`mobile_${i}`] = 'Mobile is required';
                    }

                    if (!nominee.email.trim()) {
                        newErrors[`email_${i}`] = 'Email is required';
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nominee.email)) {
                        newErrors[`email_${i}`] = 'Invalid email format';
                    }

                    // Address validation for other nominees
                    if (!nominee.sameAddressAsFirst) {
                        if (!nominee.addressLine1.trim()) {
                            newErrors[`addressLine1_${i}`] = 'Address Line 1 is required';
                        }

                        if (!nominee.pinCode.trim()) {
                            newErrors[`pinCode_${i}`] = 'Pin code is required';
                        }

                        if (!nominee.city.trim()) {
                            newErrors[`city_${i}`] = 'City is required';
                        }

                        if (!nominee.country) {
                            newErrors[`country_${i}`] = 'Country is required';
                        }
                    }
                }
            }

            // Validate total percentage
            const totalPercentage = nominees
                .filter((_, index) => index === 0 || nominees[index].name.trim() || nominees[index].relationship)
                .reduce((sum, nominee) => sum + (parseInt(nominee.percentage) || 0), 0);

            if (totalPercentage !== 100) {
                newErrors.percentageTotal = 'Total percentage of all nominees must be 100%';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };




    //const isFormValid = validateForm();
    const isFormValid = true;

    useEffect(() => {
        onCompletionUpdate(isFormValid);
    }, [isFormValid, onCompletionUpdate]);

    const handleNominationOptionChange = (value: string) => {
        setNominationOption(value);
        setShowNomineeSection(value === 'Y');

        // Clear errors when changing nomination option
        if (errors.nominationOption) {
            setErrors(prev => ({ ...prev, nominationOption: '' }));
        }
    };

    const handleNomineeChange = async (
    index: number,
    field: keyof Nominee,
    value: string | boolean
) => {
    try {
        let response = await api.get(`/kyc/get-address-info/${investorId}`);
        const apiData = response?.data?.data;
        console.log("API Address:", apiData);

        setNominees(prev => {
            const updatedNominees = [...prev];

            updatedNominees[index] = {
                ...updatedNominees[index],
                [field]: value,
            };

            // ⭐ Case 1: "sameAddressAsFirst" is checked -> fill from API
            if (field === "sameAddressAsFirst" && value === true) {
                // Find India in country list
                const indiaCountry = countryList.find((country: any) => 
                    country.name?.toLowerCase() === "india" || 
                    country.name?.toLowerCase() === "ind" ||
                    country.kyc_code === "IN"
                );
                
                const indiaCountryValue = indiaCountry ? (indiaCountry.kyc_code || indiaCountry.id.toString()) : "";

                updatedNominees[index] = {
                    ...updatedNominees[index],
                    addressLine1: apiData?.address1 || "",
                    addressLine2: apiData?.address2 || "",
                    addressLine3: apiData?.address2 || "",
                    pinCode: apiData?.pincode || "",
                    city: apiData?.district || "",
                    // Force India as the country instead of using API value
                    country: indiaCountryValue || "101", // Fallback to "101" if India not found
                };
                console.log("Address filled from API with INDIA as default country");
            }

            // ⭐ Case 2: user unchecks -> clear all address fields
            if (field === "sameAddressAsFirst" && value === false) {
                updatedNominees[index] = {
                    ...updatedNominees[index],
                    addressLine1: "",
                    addressLine2: "",
                    addressLine3: "",
                    pinCode: "",
                    city: "",
                    country: "",
                };
                console.log("Address cleared");
            }

            return updatedNominees;
        });

        // Clear field-specific error
        const errorKey = `${field}_${index}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: "" }));
        }
    } catch (error) {
        handleServerError(error);
    }
};

    const handleDateChange = (index: number, field: string, date: Date | null) => {
        if (date) {
            // Format date to YYYY-MM-DD
            const formattedDate = date.toISOString().split('T')[0];
            handleNomineeChange(index, field as keyof Nominee, formattedDate);
        } else {
            handleNomineeChange(index, field as keyof Nominee, '');
        }
    };

    const handleFolioSOAChange = (value: string) => {
        setFolioSOA(value);
        setShowFolioSOADisclaimer(true);
    };
    
    useEffect(() => {
        getCountry()
    }, [])
    
    useEffect(() => {
        if (countryList.length > 0) {
            // Find India in the country list
            const indiaCountry = countryList.find((country: any) => 
                country.name?.toLowerCase() === "india" || 
                country.name?.toLowerCase() === "ind" ||
                country.kyc_code === "IN" ||
                country.id === 101 // Common India ID, adjust as needed
            );
            
            if (indiaCountry) {
                // Set India as default for all nominees
                setNominees(prev => {
                    const updatedNominees = [...prev];
                    updatedNominees.forEach((nominee, index) => {
                        if (!nominee.country) { // Only set if not already set
                            updatedNominees[index] = {
                                ...updatedNominees[index],
                                country: indiaCountry.kyc_code || indiaCountry.id.toString()
                            };
                        }
                    });
                    return updatedNominees;
                });
            }
        }
    }, [countryList]);

    const getCountry = async () => {
        try {
            let country = await api.get(`/country/getAllCountry`);

            if (country?.data?.data) {
                console.log(country?.data?.data, "country?.data?.datacountry?.data?.data");
                setCountryList(country?.data?.data);
            }
        } catch (error) {
            handleServerError(error);
        }
    };


    const buildNomineePayload = (investorId: string, nominees: Nominee[]) => {
        // Copy first nominee address for those who selected "sameAddressAsFirst"
        const updatedNominees = nominees.map((n, idx) => {
            if (idx !== 0 && n.sameAddressAsFirst) {
                const first = nominees[0];
                return {
                    ...n,
                    addressLine1: first.addressLine1,
                    addressLine2: first.addressLine2,
                    addressLine3: first.addressLine3,
                    pinCode: first.pinCode,
                    city: first.city,
                    country: first.country
                };
            }
            return n;
        });

        // Filter out nominees with no data at all
        const filteredNominees = updatedNominees.filter(n =>
            n.name ||
            n.relationship ||
            n.percentage ||
            n.dateOfBirth ||
            n.personalIdentifierType ||
            n.personalIdentifierNumber ||
            n.mobile ||
            n.email
        );

        return {
            last_kyc_step: 'nominees',
            next_kyc_step: 'summary-view',
            investor_id: investorId,
            nominee_details: filteredNominees.map(n => ({
                nominee_name: n.name,
                nominee_DOB: n.dateOfBirth,
                nominee_Type: n.guardianName ? 'Minor' : 'Major', // Fill if required
                relation: n.relationship ? Number(n.relationship) : null,
                mobile_number: n.mobile || null,
                email_address: n.email || null,
                percentage_allocation: n.percentage ? Number(n.percentage) : null,

                // Identity details
                identity_type: n.personalIdentifierType ? Number(n.personalIdentifierType) : null,
                identity_number: n.personalIdentifierNumber || null,

                // Address
                address_line_1: n.addressLine1 || null,
                address_line_2: `${n.addressLine2 || ""} ${n.addressLine3 || ""}`.trim() || null,
                city: n.city || null,
                pin_code: n.pinCode || null,
                country: n.country ? Number(n.country) : null,

                // Guardian
                guardian_name: n.guardianName || null,
                guardian_relationship: n.guardianRelationship ? Number(n.guardianRelationship) : null,
                guardian_DOB: n.guardianDateOfBirth || null,
                guardian_mobile: null,
                guardian_email: null,

                // DB fields not in form
                state: null,
                nominee_folio_soa: folioSOA
            }))
        };
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {

            //localStorage.setItem(NOMINEES_KEY, JSON.stringify(nominees));
            const payload = buildNomineePayload(investorId, nominees);
            await api.post("/kyc/update-nominee-details", payload);
            onNext();
        }
    };

    const renderNomineeSection = (index: number, title: string, isRequired: boolean = false) => {
        const nominee = nominees[index];
        const getError = (field: string) => errors[`${field}_${index}`];
        const isMinor = nominee?.dateOfBirth && calculateAge(nominee?.dateOfBirth) < 18;
        const dateValue = nominee?.dateOfBirth ? new Date(nominee.dateOfBirth) : null;

        return (
            <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                        {index + 1}
                    </span>
                    {title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name of Nominee {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            value={nominee?.name}
                            onChange={(e) => handleNomineeChange(index, 'name', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            maxLength={40}
                            placeholder="Enter full name"
                        />
                        {getError('name') && (
                            <p className="text-red-500 text-xs mt-1">{getError('name')}</p>
                        )}
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={nominee?.relationship}
                            onChange={(e) => handleNomineeChange(index, 'relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select</option>
                            {data?.relationship_types.map((option: any) => (
                                <option key={option.id} value={option.id}>
                                    {option.relationship}
                                </option>
                            ))}
                        </select>
                        {getError('relationship') && (
                            <p className="text-red-500 text-xs mt-1">{getError('relationship')}</p>
                        )}
                    </div>

                    {/* Percentage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Percentage(%) {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            value={nominee?.percentage}
                            onChange={(e) => handleNomineeChange(index, 'percentage', e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={3}
                            placeholder="0-100"
                        />
                        {getError('percentage') && (
                            <p className="text-red-500 text-xs mt-1">{getError('percentage')}</p>
                        )}
                    </div>

                    {/* Date of Birth - Enhanced with react-datepicker */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <div className="date-picker-wrapper">
                            <DatePicker
                                selected={dateValue}
                                onChange={(date) => handleDateChange(index, 'dateOfBirth', date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="DD/MM/YYYY"
                                maxDate={new Date()}
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                wrapperClassName="w-full"
                                popperClassName="react-datepicker-enhanced"
                                onKeyDown={(e) => {
                                    // Allow manual typing
                                    const input = e.target as HTMLInputElement;
                                    setTimeout(() => {
                                        const value = input.value;
                                        if (value) {
                                            // Parse manually entered date (DD/MM/YYYY)
                                            const parts = value.split('/');
                                            if (parts.length === 3) {
                                                const day = parts[0];
                                                const month = parts[1];
                                                const year = parts[2];
                                                if (day.length === 2 && month.length === 2 && year.length === 4) {
                                                    const date = new Date(`${year}-${month}-${day}`);
                                                    if (!isNaN(date.getTime())) {
                                                        handleDateChange(index, 'dateOfBirth', date);
                                                    }
                                                }
                                            }
                                        }
                                    }, 500);
                                }}
                            />
                            <style jsx global>{`
                                .react-datepicker-wrapper {
                                    width: 100%;
                                }
                                .react-datepicker__input-container {
                                    width: 100%;
                                }
                                .react-datepicker {
                                    font-family: inherit;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                                }
                                .react-datepicker__header {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    border-bottom: none;
                                    border-top-left-radius: 0.5rem;
                                    border-top-right-radius: 0.5rem;
                                    padding-top: 0.75rem;
                                }
                                .react-datepicker__current-month,
                                .react-datepicker__day-name {
                                    color: white;
                                }
                                .react-datepicker__day-name {
                                    font-weight: 500;
                                }
                                .react-datepicker__day--selected,
                                .react-datepicker__day--in-range {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    border-radius: 50%;
                                }
                                .react-datepicker__day--keyboard-selected {
                                    background: rgba(102, 126, 234, 0.3);
                                    border-radius: 50%;
                                }
                                .react-datepicker__day:hover {
                                    border-radius: 50%;
                                }
                                .react-datepicker__year-dropdown,
                                .react-datepicker__month-dropdown {
                                    background-color: white;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 0.375rem;
                                }
                                .react-datepicker__navigation {
                                    top: 0.75rem;
                                }
                                .react-datepicker__navigation-icon::before {
                                    border-color: white;
                                }
                            `}</style>
                        </div>
                        {getError('dateOfBirth') && (
                            <p className="text-red-500 text-xs mt-1">{getError('dateOfBirth')}</p>
                        )}
                    </div>

                    {/* Personal Identifier Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Personal Identifier Type {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={nominee.personalIdentifierType}
                            onChange={(e) => handleNomineeChange(index, 'personalIdentifierType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select</option>

                            {data?.identity_type_list.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.type}
                                </option>
                            ))}
                        </select>
                        {getError('personalIdentifierType') && (
                            <p className="text-red-500 text-xs mt-1">{getError('personalIdentifierType')}</p>
                        )}
                    </div>

                    {/* Personal Identifier Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Personal Identifier Number {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            value={nominee.personalIdentifierNumber}
                            onChange={(e) => handleNomineeChange(index, 'personalIdentifierNumber', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            placeholder="Enter identifier number"
                        />
                        {getError('personalIdentifierNumber') && (
                            <p className="text-red-500 text-xs mt-1">{getError('personalIdentifierNumber')}</p>
                        )}
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="tel"
                            value={nominee.mobile}
                            onChange={(e) => handleNomineeChange(index, 'mobile', e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"

                          

                        />
                        {getError('mobile') && (
                            <p className="text-red-500 text-xs mt-1">{getError('mobile')}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="email"
                            value={nominee.email}
                            onChange={(e) => handleNomineeChange(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={100}
                            placeholder="Enter email address"
                        />
                        {getError('email') && (
                            <p className="text-red-500 text-xs mt-1">{getError('email')}</p>
                        )}
                    </div>
                </div>

                {/* Address Section */}
                {(index === 0 || !nominee.sameAddressAsFirst) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-3">
                            <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">

                                Address Details
                            </h5>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 1 {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={nominee.addressLine1}
                                onChange={(e) => handleNomineeChange(index, 'addressLine1', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={40}
                                placeholder="House no., Building name"
                            />
                            {getError('addressLine1') && (
                                <p className="text-red-500 text-xs mt-1">{getError('addressLine1')}</p>
                            )}
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={nominee.addressLine2}
                                onChange={(e) => handleNomineeChange(index, 'addressLine2', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={40}
                                placeholder="Street, Area"
                            />
                        </div>

                        {/* Address Line 3 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 3
                            </label>
                            <input
                                type="text"
                                value={nominee.addressLine3}
                                onChange={(e) => handleNomineeChange(index, 'addressLine3', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={40}
                                placeholder="Landmark"
                            />
                        </div>

                        {/* Pin Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pin code {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={nominee.pinCode}
                                onChange={(e) => handleNomineeChange(index, 'pinCode', e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={9}
                                placeholder="Enter pin code"
                            />
                            {getError('pinCode') && (
                                <p className="text-red-500 text-xs mt-1">{getError('pinCode')}</p>
                            )}
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={nominee.city}
                                onChange={(e) => handleNomineeChange(index, 'city', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={30}
                                placeholder="Enter city"
                            />
                            {getError('city') && (
                                <p className="text-red-500 text-xs mt-1">{getError('city')}</p>
                            )}
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country {isRequired && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                value={nominee.country}
                                onChange={(e) => handleNomineeChange(index, 'country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>

                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code || option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {getError('country') && (
                                <p className="text-red-500 text-xs mt-1">{getError('country')}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Same Address Checkbox (for nominees 2 and 3) */}
                {index == 0 && (
                    <div className="mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={nominee.sameAddressAsFirst}
                                onChange={(e) => handleNomineeChange(index, 'sameAddressAsFirst', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Same address as primary holder</span>
                        </label>
                    </div>
                )}

                {/* Guardian Section (if minor) */}
                {isMinor && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-t pt-6">
                        <div className="md:col-span-3">
                            <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                                <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">
                                    👤
                                </span>
                                Guardian Details (Nominee is Minor)
                            </h5>
                        </div>

                        {/* Guardian Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name of Guardian
                            </label>
                            <input
                                type="text"
                                value={nominee.guardianName}
                                onChange={(e) => handleNomineeChange(index, 'guardianName', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={40}
                                placeholder="Enter guardian name"
                            />
                        </div>

                        {/* Guardian Relationship */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Guardian Relationship
                            </label>
                            <select
                                value={nominee.guardianRelationship}
                                onChange={(e) => handleNomineeChange(index, 'guardianRelationship', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {data?.nominee_guardian_relationship_types.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.relationship}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Guardian Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Guardian Date of Birth
                            </label>
                            <input
                                type="date"
                                value={nominee.guardianDateOfBirth}
                                onChange={(e) => handleNomineeChange(index, 'guardianDateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Helper function to calculate age
    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nominee Details</h2>

            {/* Nomination Option Section */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                    <h3 className="text-lg font-medium text-gray-900">Nominee details</h3>
                </div>
                <div className="p-6">
                    {/* SEBI Disclaimer */}
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-4 shadow-sm">
                            <p className="text-blue-800 text-sm">
                                Pursuant to SEBI circular(s) No. SEBI/HO/IMD/-II DOF3/P/CIR/2022/82 dated 15-Jun-2022 on the nomination for mutual fund investment, it is mandatory to either register nominee/opt-out of nominee registration for every NEW folio created effective 1st October 2022.
                            </p>
                        </div>
                    </div>

                    {/* Nomination Option */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nomination Option <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={nominationOption}
                                onChange={(e) => handleNominationOptionChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {nominationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.nominationOption && (
                                <p className="text-red-500 text-xs mt-1">{errors.nominationOption}</p>
                            )}
                        </div>
                    </div>

                    {/* Folio SOA Section */}
                    {showNomineeSection && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nominee Registration Display in Folio SOA
                                    </label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="folioSOA"
                                                value="Y"
                                                checked={folioSOA === 'Y'}
                                                onChange={(e) => handleFolioSOAChange(e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="folioSOA"
                                                value="N"
                                                checked={folioSOA === 'N'}
                                                onChange={(e) => handleFolioSOAChange(e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">No</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Folio SOA Disclaimer */}
                            {showFolioSOADisclaimer && (
                                <div className="mb-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-4">
                                        <p className="text-blue-800 text-sm">
                                            If "Yes", then only the registration status will be displayed and if it is "No", then the name of all the nominees will be displayed.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Nominee Details Section */}
            {showNomineeSection && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                        <h3 className="text-lg font-medium text-gray-900">Nominee Information</h3>
                    </div>
                    <div className="p-6">
                        {/* First Nominee (Required) */}
                        {renderNomineeSection(0, 'First Nominee', true)}


                        {visibleAccounts >= 2 &&
                            renderNomineeSection(1, "Second Nominee")}

                        {visibleAccounts >= 3 &&
                            renderNomineeSection(2, "Third Nominee")}

                        <div className='flex justify-end items-center gap-3'>

                            {/* ADD MORE ACCOUNT BUTTON */}
                            {visibleAccounts < 3 && (
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVisibleAccounts(visibleAccounts + 1)
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
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
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* Second Nominee (Optional) */}
                        {/*renderNomineeSection(1, 'Second Nominee', false)*/}

                        {/* Third Nominee (Optional) */}
                        {/*renderNomineeSection(2, 'Third Nominee', false)*/}

                        {/* Total Percentage Error */}
                        {errors.percentageTotal && (
                            <div className="mb-6">
                                <p className="text-red-500 text-sm font-medium">{errors.percentageTotal}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-md transition-colors shadow-sm ${isFirstStep
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-2 rounded-md transition-colors shadow-sm ${isFormValid
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isLastStep ? 'Submit' : 'Next'}
                </button>
            </div>
        </form>
    );
}