// components/steps/SolePrimaryHolder.tsx
import { useState, useEffect, use } from 'react';
import { StepComponentProps } from '../types';
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
    formatDate,
    getLS,
    handleServerError,
    setLS,
    toastAlert,
} from "@/utils/helpers";
import { GiDogBowl } from 'react-icons/gi';
import api from '@/utils/api';
import { fetchHolderDetails } from '@/api/kyc';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface SolePrimaryHolderProps extends StepComponentProps { }

interface FormData {
    // Basic Details
    name: string;
    dateOfBirth: string;
    pan: string;
    gender: string;
    resISD: string;
    resSTD: string;
    resPhone: string;
    mobileISD: string;
    mobileNumber: string;
    email: string;
    mobileDeclaration: string;
    emailDeclaration: string;

    // Additional KYC Details
    grossAnnualIncome: string;
    networth: string;
    networthDate: string;
    sourceOfWealth: string;
    occupation: string;
    pepStatus: string;
    kraAddressType: string;
    sourceOfWealthOther: string;
    occupationOther: string;

    // FATCA Details
    taxResidency: string;
    placeOfBirth: string;
    countryOfBirth: string;
    countryOfCitizenship: string;
    countryOfNationality: string;
    taxCountry: string;
    taxIdentificationNumber: string;
    taxIdentificationType: string;
}

const LS_KEY = "ecan-soleprimary";


export default function SolePrimaryHolder({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    data,
    investorId
}: SolePrimaryHolderProps) {

    const [formData, setFormData] = useState<FormData>({
        // Basic Details
        name: '',
        dateOfBirth: '',
        pan: '',
        gender: '',
        resISD: '91',
        resSTD: '',
        resPhone: '',
        mobileISD: '91',
        mobileNumber: '',
        email: '',
        mobileDeclaration: '',
        emailDeclaration: '',

        // Additional KYC Details
        grossAnnualIncome: '',
        networth: '',
        networthDate: '',
        sourceOfWealth: '',
        occupation: '',
        pepStatus: '',
        kraAddressType: '',
        sourceOfWealthOther: '',
        occupationOther: '',


        // FATCA Details
        taxResidency: 'N',
        placeOfBirth: '',
        countryOfBirth: '',
        countryOfCitizenship: '',
        countryOfNationality: '',
        taxCountry: '',
        taxIdentificationNumber: '',
        taxIdentificationType: '',
    });

    //const user: any = getLS(USER_DATA);

    const user: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);
    /// console.log("Sole Primary Holder - User Data:", user);

    const holding_nature = user?.InvestorRegistration?.holding_nature;
    const investor_category = user?.InvestorRegistration?.investor_category;


    const [showTaxSection, setShowTaxSection] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [singzyData, setSingzyData] = useState<any>([]);
    const [userData, setUserData] = useState<any>("");
    const [FATCALoader, setFATCALoader] = useState<any>(false);
    const [incomeListData, setIncomeListData] = useState<any>([]);
    const [occupationListData, setOccupationListData] = useState<any>([]);
    const [annualIncomeData, setAnnualIncomeData] = useState<any>([]);
    const [countryList, setCountryList] = useState<any>([]);
    const [stateList, setStateList] = useState<any>([]);
    const [isMember, setIsMember] = useState(false);
    const [isError, setIsError] = useState(false);



    useEffect(() => {
        const loadData = async () => {
            const res = await fetchHolderDetails(user?.InvestorRegistration?.id);
            const result = res.data.data.data;
            // setUserData(res.data);

            const dob = user?.InvestorRegistration?.dob;
            //const gender = data?.gender;
            setFormData(prev => ({
                ...prev,
                name: user?.InvestorRegistration?.name,
                pan: user?.InvestorRegistration?.pan_no,
                mobileNumber: user?.mobile,
                email: result?.basicDetails[0]?.email,
                dateOfBirth: toDateInputValue(dob),
                taxResidency: 'N',
            }));

            if (!result) return;


            const basic = Array.isArray(result?.basicDetails)
                ? result.basicDetails[0]
                : result?.basicDetails || {};

            const fatca = Array.isArray(result?.fatca)
                ? result.fatca[0]
                : result?.fatca || {};

            const additionalKyc = Array.isArray(result?.additionalKyc)
                ? result.additionalKyc[0]
                : result?.additionalKyc || {};


            setFormData(prev => ({
                ...prev,
                gender: basic?.gender,
                resISD: '91',
                resSTD: '',
                resPhone: '',
                mobileISD: '91',
                mobileNumber: user?.mobile,
                user: user?.email,
                mobileDeclaration: basic?.mobile_declaration,
                emailDeclaration: basic?.email_declaration,

                grossAnnualIncome: additionalKyc?.gross_annual_income,
                networth: additionalKyc?.networth,
                networthDate: toDateInputValue(additionalKyc?.networth_as_on),
                sourceOfWealth: additionalKyc?.source_of_wealth,
                occupation: additionalKyc?.occupation,
                pepStatus: additionalKyc?.political_exposure,
                kraAddressType: additionalKyc?.kra_address_type,
                sourceOfWealthOther: '',
                occupationOther: '',

                taxResidency: fatca?.is_tax_resident_other_than_india || 'N',
                placeOfBirth: fatca?.place_of_birth,
                countryOfBirth: fatca?.country_of_birth || '101',
                countryOfCitizenship: fatca?.country_of_citizenship || '101',
                countryOfNationality: fatca?.country_of_nationality || '101',
                taxCountry: '',
                taxIdentificationNumber: '',
                taxIdentificationType: '',


            }));

        };

        loadData();
    }, []);

    useEffect(() => {
        getCountry()
        getDropdown()
    }, []);

    const toDateInputValue = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Alternative validation approach
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const isFormValid = true


    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Basic Details
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        }

        if (!formData.gender) {
            newErrors.gender = "Please select gender";
        }

        if (!PAN_NO_REGEX.test(formData.pan)) {
            newErrors.pan = "Invalid PAN format";
        }

        if (!MOBILE_REGEX.test(formData.mobileNumber)) {
            newErrors.mobileNumber = "Invalid mobile number";
        }

        if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }

        if (!formData.mobileDeclaration) {
            newErrors.mobileDeclaration = "Mobile declaration is required";
        }

        if (!formData.emailDeclaration) {
            newErrors.emailDeclaration = "Email declaration is required";
        }

        // Additional KYC
        if (!formData.grossAnnualIncome) {
            newErrors.grossAnnualIncome = "Gross annual income is required";
        }



        if (!formData.occupation) {
            newErrors.occupation = "Occupation is required";
        }

        if (!formData.sourceOfWealth) {
            newErrors.sourceOfWealth = "Source of wealth is required";
        }

        if (!formData.pepStatus) {
            newErrors.pepStatus = "Political exposure is required";
        }

        if (!formData.kraAddressType) {
            newErrors.kraAddressType = "KRA address type is required";
        }

        // FATCA
        if (!formData.placeOfBirth) {
            newErrors.placeOfBirth = "Place of birth is required";
        }

        if (!formData.countryOfBirth) {
            newErrors.countryOfBirth = "Country of birth is requiredssss";
        }

        if (!formData.countryOfCitizenship) {
            newErrors.countryOfCitizenship = "Country of citizenship is required";
        }

        if (!formData.countryOfNationality) {
            newErrors.countryOfNationality = "Country of nationality is required";
        }

        // Conditional FATCA (when tax resident = Y)
        if (formData.taxResidency === "Y") {
            if (!formData.taxCountry) {
                newErrors.taxCountry = "Tax residency country is required";
            }
            if (!formData.taxIdentificationNumber) {
                newErrors.taxIdentificationNumber = "Tax identification number is required";
            }
            if (!formData.taxIdentificationType) {
                newErrors.taxIdentificationType = "Tax identification type is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    // Only call onCompletionUpdate when the validity actually changes
    useEffect(() => {

        onCompletionUpdate(isFormValid);
    }, [isFormValid, onCompletionUpdate]);


    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));


        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDateChange = (field: keyof FormData, date: Date | null) => {
        if (date) {
            // Format date to YYYY-MM-DD
            const formattedDate = date.toISOString().split('T')[0];
            handleInputChange(field, formattedDate);
        } else {
            handleInputChange(field, '');
        }
    };

    const handleTaxResidencyChange = (value: string) => {
        handleInputChange('taxResidency', value);
        setShowTaxSection(value === 'Y');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let nextKyc = 'bank-accounts';
        if (holding_nature == 'AS' || holding_nature == 'JO') {
            nextKyc = 'sole-secondary';
        } else {
            nextKyc = 'bank-accounts';
        }

        if (investor_category == 'M') {
            nextKyc = 'guardian-details'
        } else {
            nextKyc = 'bank-accounts';
        }

        //validateForm();
        const payload = {
            investor_id: investorId,
            last_kyc_step: 'sole-primary',
            next_kyc_step: nextKyc,
            holding_nature: holding_nature,
            email: formData.email,
            user_id: user?.id,
            investorBasicDetails: {
                investor_id: investorId,
                name: formData.name,
                date_of_birth: formData.dateOfBirth,
                pan_pek: formData.pan,
                gender: formData.gender,
                residence_isd: formData.resISD,
                residence_std: formData.resSTD,
                residence_phone: formData.resPhone,
                mobile_isd: formData.mobileISD,
                mobile_number: formData.mobileNumber,
                email: formData.email,
                mobile_declaration: formData.mobileDeclaration,
                email_declaration: formData.emailDeclaration
            },
            additionalKyc: {
                investor_id: investorId,
                gross_annual_income: formData.grossAnnualIncome,
                networth: formData.networth,
                networth_as_on: formData.networthDate,
                source_of_wealth: formData.sourceOfWealth,
                occupation: formData.occupation,
                political_exposure: formData.pepStatus,
                kra_address_type: formData.kraAddressType
            },

            fatca: {
                investor_id: investorId,
                is_tax_resident_other_than_india: formData.taxResidency, // boolean
                place_of_birth: formData.placeOfBirth,
                country_of_birth: formData.countryOfBirth,
                country_of_citizenship: formData.countryOfCitizenship,
                country_of_nationality: formData.countryOfNationality,
                tax_residency_countries: formData.taxCountry, // array of strings or comma-separated text
                tax_identification_numbers: formData.taxIdentificationNumber, // array of strings or comma-separated text
                tax_identification_types: formData.taxIdentificationType // array of strings or comma-separated text
            }

        }

        const isValid = validateForm();


        if (isValid) {
            let res: any = await api.post(`/kyc/update-basic-details`, payload);
            console.log("Response fro basic details ", res)
            onNext();
        } else {

            toastAlert("Please fill all required fields.", "error");
        }
    };


    const incomeOptions = [
        { value: '01', label: 'BELOW 1 LAC' },
        { value: '02', label: '1-5 LAC' },
        { value: '03', label: '5-10 LAC' },
        { value: '04', label: '10-25 LAC' },
        { value: '05', label: '25LAC-1CR' },
        { value: '06', label: 'Greater than 1 CR' },
    ];

    const occupationOptions = [
        { value: '01', label: 'Private Sector Service' },
        { value: '02', label: 'Public Sector' },
        { value: '03', label: 'Business' },
        { value: '04', label: 'Professional' },
        { value: '05', label: 'Agriculturist' },
        { value: '06', label: 'Retired' },
        { value: '07', label: 'Housewife' },
        { value: '08', label: 'Student' },
        { value: '09', label: 'Forex Dealer' },
        { value: '10', label: 'Government Service' },
        { value: '11', label: 'Doctor' },
        { value: '99', label: 'Others' },
    ];

    const sourceOfWealthOptions = [
        { value: '01', label: 'Salary' },
        { value: '02', label: 'Business Income' },
        { value: '03', label: 'Gift' },
        { value: '04', label: 'Ancestral Property' },
        { value: '05', label: 'Rental Income' },
        { value: '06', label: 'Prize Money' },
        { value: '07', label: 'Royalty' },
        { value: '08', label: 'Others' },
    ];

    const declarationOptions = [
        { value: 'SE', label: 'Self' },
        { value: 'SP', label: 'Spouse' },
        { value: 'DC', label: 'Dependent Children' },
        { value: 'DS', label: 'Dependent Siblings' },
        { value: 'DP', label: 'Dependent Parents' },
        { value: 'PO', label: 'POA' },
        { value: 'PM', label: 'PMS' },
        { value: 'CD', label: 'Custodian' },
    ];



    // Set default India when country list is loaded
    useEffect(() => {
        if (countryList.length > 0) {
            const indiaCountry = countryList.find((country: any) =>
                country.name === "India" || country.name === "INDIA" || country.name === "india"
            );
        }
    }, [countryList]);

    const getCountry = async () => {
        try {
            let country = await api.get(`/country/getAllCountry`);

            if (country?.data?.data) {
                setCountryList(country?.data?.data);

                handleInputChange("countryOfBirth", "101");
                handleInputChange("countryOfCitizenship", "101");
                handleInputChange("countryOfNationality", "101");



            }
        } catch (error) {
            handleServerError(error);
        }
    };

    const getStateList = async (countryId: any) => {
        try {
            let state = await api.get(`/state/getAllStateByCountry/${countryId}`);
            if (state?.data?.data) {
                setStateList(state?.data?.data);
                return state?.data?.data;
            }
            return [];
        } catch (error) {
            handleServerError(error);
            return [];
        }
    };

    const getDropdown = async () => {
        try {
            let res: any = await api.get(`/kyc/get-fatca-dropdown`);
            let { addresslist, incomeList, occupationList, annualIncome } = res.data.data

            setIncomeListData(incomeList)
            setOccupationListData(occupationList)
            setAnnualIncomeData(annualIncome)

        } catch (error) {
            handleServerError(error);
        }
    }

    /* useEffect(() => {
         if (!formData.countryOfBirth) {
             handleInputChange("countryOfBirth", "101");
             handleInputChange("countryOfCitizenship", "101");
             handleInputChange("countryOfNationality", "101");
 
         }
     }, []);*/

    return (
        <form onSubmit={handleSubmit} className="p-6">
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
            
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sole / Primary Holder</h2>

            {/* Basic Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Basic Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                disabled
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={100}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Date of Birth - Enhanced with react-datepicker */}
                        <div className="relative">
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <div className="date-picker-wrapper">
                                <DatePicker
                                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                                    onChange={(date) => handleDateChange('dateOfBirth', date)}
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
                                                            handleDateChange('dateOfBirth', date);
                                                        }
                                                    }
                                                }
                                            }
                                        }, 500);
                                    }}
                                />
                            </div>
                            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                        </div>

                        {/* PAN */}
                        <div>
                            <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                                PAN / PEKRN <span className="text-red-500">*</span>

                            </label>
                            <input
                                type="text"
                                id="pan"
                                disabled
                                value={formData.pan}
                                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                                className="w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={10}
                            />
                            {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                        <p className="text-red-600 text-sm font-semibold">
                            Please provide Name and DOB as per Income Tax Department (ITD) records.
                        </p>
                    </div>
                    {/* Gender Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-start-2">
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-describedby={errors.gender ? "gender-error" : undefined}
                                aria-invalid={!!errors.gender}
                            >
                                <option value="">Select Gender</option>
                                {data?.gender?.map((option: any) => (
                                    <option key={option.id} value={option.code}>
                                        {option.gender}
                                    </option>
                                ))}
                            </select>
                            {errors.gender && (
                                <p id="gender-error" className="text-red-500 text-xs mt-1">
                                    {errors.gender}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Residential Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Res. (ISD-STD-Phone)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.resISD}
                                    onChange={(e) => handleInputChange('resISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resSTD}
                                    onChange={(e) => handleInputChange('resSTD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resPhone}
                                    onChange={(e) => handleInputChange('resPhone', e.target.value)}
                                    className="w-2/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile (ISD-Mobile) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.mobileISD}
                                    onChange={(e) => handleInputChange('mobileISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.mobileNumber}
                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                    className="w-3/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email ?? ""}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={100}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div></div>
                        {/* Mobile Declaration */}
                        <div>
                            <label htmlFor="mobileDeclaration" className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Declaration <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="mobileDeclaration"
                                value={formData.mobileDeclaration}
                                onChange={(e) => handleInputChange('mobileDeclaration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {declarationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.mobileDeclaration && <p className="text-red-500 text-xs mt-1">{errors.mobileDeclaration}</p>}
                        </div>

                        {/* Email Declaration */}
                        <div>
                            <label htmlFor="emailDeclaration" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Declaration <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="emailDeclaration"
                                value={formData.emailDeclaration}
                                onChange={(e) => handleInputChange('emailDeclaration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {declarationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.emailDeclaration && <p className="text-red-500 text-xs mt-1">{errors.emailDeclaration}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional KYC Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Additional KYC Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Gross Annual Income */}
                        <div>
                            <label htmlFor="grossAnnualIncome" className="block text-sm font-medium text-gray-700 mb-2">
                                Gross Annual Income <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="grossAnnualIncome"
                                value={formData.grossAnnualIncome}
                                onChange={(e) => handleInputChange('grossAnnualIncome', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {incomeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.grossAnnualIncome && <p className="text-red-500 text-xs mb-4">{errors.grossAnnualIncome}</p>}

                        </div>

                        {/* Networth */}
                        <div>
                            <label htmlFor="networth" className="block text-sm font-medium text-gray-700 mb-2">
                                Networth (in Rs.)
                            </label>
                            <input
                                type="text"
                                id="networth"
                                value={formData.networth ?? ""}
                                onChange={(e) => handleInputChange('networth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={10}
                            />
                        </div>

                        {/* Networth Date - Enhanced with react-datepicker */}
                        <div className="relative">
                            <label htmlFor="networthDate" className="block text-sm font-medium text-gray-700 mb-2">
                                As on date
                            </label>
                            <div className="date-picker-wrapper">
                                <DatePicker
                                    selected={formData.networthDate ? new Date(formData.networthDate) : null}
                                    onChange={(date) => handleDateChange('networthDate', date)}
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
                                                            handleDateChange('networthDate', date);
                                                        }
                                                    }
                                                }
                                            }
                                        }, 500);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {errors.income && <p className="text-red-500 text-xs mb-4">{errors.income}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Source of Wealth */}
                        <div>
                            <label htmlFor="sourceOfWealth" className="block text-sm font-medium text-gray-700 mb-2">
                                Source of Wealth
                            </label>
                            <select
                                id="sourceOfWealth"
                                value={formData.sourceOfWealth}
                                onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {sourceOfWealthOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {errors.sourceOfWealth && <p className="text-red-500 text-xs mb-4">{errors.sourceOfWealth}</p>}

                        </div>

                        {/* Occupation */}
                        <div>
                            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                                Occupation <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="occupation"
                                value={formData.occupation}
                                onChange={(e) => handleInputChange('occupation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {occupationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
                        </div>

                        {/* Political Exposure */}
                        <div>
                            <label htmlFor="pepStatus" className="block text-sm font-medium text-gray-700 mb-2">
                                Political Exposure <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="pepStatus"
                                value={formData.pepStatus}
                                onChange={(e) => handleInputChange('pepStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                <option value="NA">Not Applicable</option>
                                <option value="PEP">Politically Exposed Person</option>
                                <option value="RPEP">Related to Politically Exposed Person</option>
                            </select>
                            {errors.pepStatus && <p className="text-red-500 text-xs mt-1">{errors.pepStatus}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KRA Address Type */}
                        <div>
                            <label htmlFor="kraAddressType" className="block text-sm font-medium text-gray-700 mb-2">
                                KRA Address Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="kraAddressType"
                                value={formData.kraAddressType}
                                onChange={(e) => handleInputChange('kraAddressType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                <option value="1">Residential or Business</option>
                                <option value="2">Residential</option>
                                <option value="3">Business</option>
                                <option value="4">Registered Office</option>
                            </select>
                            {errors.kraAddressType && <p className="text-red-500 text-xs mt-1">{errors.kraAddressType}</p>}
                        </div>

                        {/* Source of Wealth Other */}
                        <div>
                            <label htmlFor="sourceOfWealthOther" className="block text-sm font-medium text-gray-700 mb-2">
                                Other (source of wealth)
                            </label>
                            <input
                                type="text"
                                id="sourceOfWealthOther"
                                value={formData.sourceOfWealthOther}
                                onChange={(e) => handleInputChange('sourceOfWealthOther', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.sourceOfWealth !== '08'}
                            />
                        </div>

                        {/* Occupation Other */}
                        <div>
                            <label htmlFor="occupationOther" className="block text-sm font-medium text-gray-700 mb-2">
                                Other (source of occupation)
                            </label>
                            <input
                                type="text"
                                id="occupationOther"
                                value={formData.occupationOther}
                                onChange={(e) => handleInputChange('occupationOther', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.occupation !== '99'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FATCA Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">FATCA Details</h3>
                </div>
                <div className="p-6">
                    {/* Tax Residency Question */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label htmlFor="taxResidency" className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Residency in a country other than India? <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="taxResidency"
                                value={formData.taxResidency}
                                onChange={(e) => handleTaxResidencyChange(e.target.value)}
                                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="N">No - Not a Tax Resident in a Country other than India</option>
                                <option value="Y">Yes - Tax Resident in a Country other than India</option>
                            </select>
                        </div>
                    </div>

                    {/* Birth and Citizenship Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Place of Birth */}
                        <div>
                            <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                Place of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={60}
                            />
                            {errors.placeOfBirth && <p className="text-red-500 text-xs mt-1">{errors.placeOfBirth}</p>}
                        </div>

                        {/* Country of Birth */}
                        <div>
                            <label htmlFor="countryOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                Country of Birth <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfBirth"
                                value={formData.countryOfBirth}
                                onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfBirth && <p className="text-red-500 text-xs mt-1">{errors.countryOfBirth}</p>}
                        </div>

                        {/* Country of Citizenship */}
                        <div>
                            <label htmlFor="countryOfCitizenship" className="block text-sm font-medium text-gray-700 mb-2">
                                Country of Citizenship <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfCitizenship"
                                value={formData.countryOfCitizenship}
                                onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfCitizenship && <p className="text-red-500 text-xs mt-1">{errors.countryOfCitizenship}</p>}
                        </div>

                        {/* Country of Nationality */}
                        <div>
                            <label htmlFor="countryOfNationality" className="block text-sm font-medium text-gray-700 mb-2">
                                Country of Nationality <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfNationality"
                                value={formData.countryOfNationality}
                                onChange={(e) => handleInputChange('countryOfNationality', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfNationality && <p className="text-red-500 text-xs mt-1">{errors.countryOfNationality}</p>}
                        </div>
                    </div>

                    {/* Tax Residency Section (Conditional) */}
                    {showTaxSection && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
                            {/* Country of Tax Residency */}
                            <div>
                                <label htmlFor="taxCountry" className="block text-sm font-medium text-gray-700 mb-2">
                                    Countries of Tax Residency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="taxCountry"
                                    value={formData.taxCountry}
                                    onChange={(e) => handleInputChange('taxCountry', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    {countryList.map((option: any) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.taxCountry && <p className="text-red-500 text-xs mt-1">{errors.taxCountry}</p>}
                            </div>

                            {/* Tax Identification Number */}
                            <div>
                                <label htmlFor="taxIdentificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Identification Numbers <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="taxIdentificationNumber"
                                    value={formData.taxIdentificationNumber}
                                    onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                    maxLength={20}
                                />
                                {errors.taxIdentificationNumber && <p className="text-red-500 text-xs mt-1">{errors.taxIdentificationNumber}</p>}
                            </div>

                            {/* Tax Identification Type */}
                            <div>
                                <label htmlFor="taxIdentificationType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Identification Types <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="taxIdentificationType"
                                    value={formData.taxIdentificationType}
                                    onChange={(e) => handleInputChange('taxIdentificationType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    <option value="E">Driving License</option>
                                    <option value="B">Election ID Card</option>
                                    <option value="D">ID Card</option>
                                    <option value="H">NREGA Job Card</option>
                                    <option value="X">Not categorized</option>
                                    <option value="O">Others</option>
                                    <option value="C">PAN Card</option>
                                    <option value="A">Passport</option>
                                    <option value="T">TIN</option>
                                    <option value="G">UIDIA / Aadhar letter</option>
                                </select>
                                {errors.taxIdentificationType && <p className="text-red-500 text-xs mt-1">{errors.taxIdentificationType}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-md transition-colors ${isFirstStep
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-2 rounded-md transition-colors ${isFormValid
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