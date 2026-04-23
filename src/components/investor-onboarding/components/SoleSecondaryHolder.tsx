import { useState, useEffect } from 'react';
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
    //const user: any = getLS("INVESTOR_DATA") || getLS("USER_DATA");

    const user: any = getLS("INVESTOR_DATA") || getLS("USER_DATA");


    const holding_nature = user?.InvestorRegistration?.holding_nature;


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

            if (!result) return;


            const basic = Array.isArray(result?.basicDetails)
                ? result.basicDetails[1]
                : result?.basicDetails || {};



            const fatca = Array.isArray(result?.fatca)
                ? result.fatca[1]
                : result?.fatca || {};

            console.log("Fatka=", fatca)

            const additionalKyc = Array.isArray(result?.additionalKyc)
                ? result.additionalKyc[1]
                : result?.additionalKyc || {};


            setFormData(prev => ({
                ...prev,
                gender: basic?.gender || '',
                resISD: '91',
                resSTD: '',
                resPhone: '',
                mobileISD: '91',
                name: basic?.name || '',
                dateOfBirth: toDateInputValue(basic?.date_of_birth),
                pan: basic?.pan_pek || '',
                // Secondary holder has its own mobile/email — falling back to
                // the logged-in primary's contact info (previous behaviour)
                // would cross-contaminate the primary's details into the
                // secondary row on save.
                mobileNumber: basic?.mobile_number || '',
                email: basic?.email || '',
                mobileDeclaration: basic?.mobile_declaration || '',
                emailDeclaration: basic?.email_declaration || '',

                grossAnnualIncome: additionalKyc?.gross_annual_income,
                networth: additionalKyc?.networth,
                networthDate: additionalKyc?.networth_as_on,
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



    /*useEffect(() => {
        const loadData = async () => {
            const res = await fetchHolderDetails(user?.InvestorRegistration?.id);
            const result = res.data.data.data;
            console.log("Holder Details", result);
            setUserData(res.data);

            if (!result) return;


            const basic = Array.isArray(result?.basicDetails)
                ? result.basicDetails[1]
                : result?.basicDetails || {};

            const fatca = Array.isArray(result?.fatca)
                ? result.fatca[1]
                : result?.fatca || {};

            const additionalKyc = Array.isArray(result?.additionalKyc)
                ? result.additionalKyc[1]
                : result?.additionalKyc || {};


            setFormData(prev => ({
                ...prev,
                name: result?.basicDetails?.name,
                dateOfBirth: result?.basicDetails?.date_of_birth || '',
                pan: result?.basicDetails.pan_pek || '',
                gender: result?.basicDetails.gender || '',
                resISD: '91',
                resSTD: '',
                resPhone: '',
                mobileISD: '91',
                mobileNumber: basic?.mobile_number || '',
                email: basic?.email || '',
                mobileDeclaration: basic?.mobile_declaration || '',
                emailDeclaration: basic?.email_declaration || '',

                grossAnnualIncome: additionalKyc?.gross_annual_income || '',
                networth: additionalKyc?.networth || '',
                networthDate: additionalKyc?.networth_as_on || '',
                sourceOfWealth: additionalKyc?.source_of_wealth || '',
                occupation: additionalKyc?.occupation || '',
                pepStatus: additionalKyc?.political_exposure || '',
                kraAddressType: additionalKyc?.kra_address_type || '',
                sourceOfWealthOther: '',
                occupationOther: '',

                taxResidency: fatca?.is_tax_resident_other_than_india || '',
                placeOfBirth: fatca?.place_of_birth || '',
                countryOfBirth: fatca?.country_of_birth || '',
                countryOfCitizenship: fatca?.country_of_citizenship || '',
                countryOfNationality: fatca?.country_of_nationality || '',
                taxCountry: '',
                taxIdentificationNumber: '',
                taxIdentificationType: '',


            }));

        };

        loadData();
    }, []);*/

    const toDateInputValue = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Validity: minimum set MFU needs to accept a secondary holder. DOB and
    // gender are required because the backend keys basicDetails rows by
    // (investor_id, date_of_birth) — a blank DOB would either collide with a
    // row that has null DOB or create a garbage row that later fails MFU's
    // "Second Holder Details should not be blank" check.
    const isFormValid =
        !!formData.name?.trim() &&
        !!formData.pan?.trim() &&
        !!formData.dateOfBirth &&
        !!formData.gender &&
        !!formData.mobileNumber &&
        !!formData.email


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

    const handleTaxResidencyChange = (value: string) => {
        handleInputChange('taxResidency', value);
        setShowTaxSection(value === 'Y');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block submit when required fields are missing so we don't persist a
        // half-filled secondary-holder row (blank DOB was the wedge that made
        // CAN creation fail with "Second Holder Details should not be blank").
        if (!isFormValid) {
            toastAlert("error", "Please fill all required fields for the Secondary Holder.");
            return;
        }

        const payload = {
            investor_id: investorId,
            last_kyc_step: 'sole-secondary',
            // After secondary holder, the flow always continues to bank-accounts.
            // The previous value ('sole-secondary' when not SI) pointed the
            // backend's next_kyc_step at this step itself, trapping the user on
            // reload.
            next_kyc_step: 'bank-accounts',
            holding_nature: holding_nature,
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


        try {
            await api.post(`/kyc/update-basic-details`, payload);
            onCompletionUpdate(true);
            onNext();
        } catch (err) {
            handleServerError(err);
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

    useEffect(() => {
        getCountry()
        getDropdown()
    }, []);

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

    useEffect(() => {
        if (!formData.countryOfBirth) {
            handleInputChange("countryOfBirth", "101");
            handleInputChange("countryOfCitizenship", "101");
            handleInputChange("countryOfNationality", "101");

        }
    }, []);

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-xl">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent mb-6">Sole / Secondary Holder</h2>

            {/* Basic Details Section */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] rounded-t-lg">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">Basic Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Name <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"

                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                maxLength={100}
                            />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Date of Birth <span className="text-[#F59E0B]">*</span>
                            </label>

                            <input
                                type="date"
                                id="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            />
                            {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
                        </div>

                        {/* PAN */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                PAN / PEKRN <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="text"
                                id="pan"

                                value={formData.pan}
                                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                maxLength={10}
                            />
                            {errors.pan && <p className="text-red-400 text-xs mt-1">{errors.pan}</p>}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                        <p className="text-[#F59E0B] text-sm font-semibold">
                            Please provide Name and DOB as per Income Tax Department (ITD) records.
                        </p>
                    </div>
                    {/* Gender Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-start-2">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2 text-right">
                                Gender <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select Gender</option>
                                {data?.gender?.map((option: any) => (
                                    <option key={option.id} value={option.code}>
                                        {option.gender}
                                    </option>
                                ))}
                            </select>
                            {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Residential Phone */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Res. (ISD-STD-Phone)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.resISD}
                                    onChange={(e) => handleInputChange('resISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resSTD}
                                    onChange={(e) => handleInputChange('resSTD', e.target.value)}
                                    className="w-1/4 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resPhone}
                                    onChange={(e) => handleInputChange('resPhone', e.target.value)}
                                    className="w-2/4 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Mobile (ISD-Mobile) <span className="text-[#F59E0B]">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.mobileISD}
                                    onChange={(e) => handleInputChange('mobileISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.mobileNumber}
                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                    className="w-3/4 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                            {errors.mobileNumber && <p className="text-red-400 text-xs mt-1">{errors.mobileNumber}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Email <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                maxLength={100}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div></div>
                        {/* Mobile Declaration */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Mobile Declaration <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="mobileDeclaration"
                                value={formData.mobileDeclaration}
                                onChange={(e) => handleInputChange('mobileDeclaration', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {declarationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.mobileDeclaration && <p className="text-red-400 text-xs mt-1">{errors.mobileDeclaration}</p>}
                        </div>

                        {/* Email Declaration */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Email Declaration <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="emailDeclaration"
                                value={formData.emailDeclaration}
                                onChange={(e) => handleInputChange('emailDeclaration', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {declarationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.emailDeclaration && <p className="text-red-400 text-xs mt-1">{errors.emailDeclaration}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional KYC Details Section */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] rounded-t-lg">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">Additional KYC Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Gross Annual Income */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Gross Annual Income <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="grossAnnualIncome"
                                value={formData.grossAnnualIncome}
                                onChange={(e) => handleInputChange('grossAnnualIncome', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {incomeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Networth */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Networth (in Rs.)
                            </label>
                            <input
                                type="text"
                                id="networth"
                                value={formData.networth ?? ""}
                                onChange={(e) => handleInputChange('networth', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                maxLength={10}
                            />
                        </div>

                        {/* Networth Date */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                As on date
                            </label>
                            <input
                                type="date"
                                id="networthDate"
                                value={formData.networthDate}
                                onChange={(e) => handleInputChange('networthDate', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {errors.income && <p className="text-red-500 text-xs mb-4">{errors.income}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Source of Wealth */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Source of Wealth
                            </label>
                            <select
                                id="sourceOfWealth"
                                value={formData.sourceOfWealth}
                                onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {sourceOfWealthOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Occupation */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Occupation <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="occupation"
                                value={formData.occupation}
                                onChange={(e) => handleInputChange('occupation', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {occupationOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.occupation && <p className="text-red-400 text-xs mt-1">{errors.occupation}</p>}
                        </div>

                        {/* Political Exposure */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Political Exposure <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="pepStatus"
                                value={formData.pepStatus}
                                onChange={(e) => handleInputChange('pepStatus', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                <option value="NA">Not Applicable</option>
                                <option value="PEP">Politically Exposed Person</option>
                                <option value="RPEP">Related to Politically Exposed Person</option>
                            </select>
                            {errors.pepStatus && <p className="text-red-400 text-xs mt-1">{errors.pepStatus}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KRA Address Type */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                KRA Address Type <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="kraAddressType"
                                value={formData.kraAddressType}
                                onChange={(e) => handleInputChange('kraAddressType', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                <option value="1">Residential or Business</option>
                                <option value="2">Residential</option>
                                <option value="3">Business</option>
                                <option value="4">Registered Office</option>
                            </select>
                            {errors.kraAddressType && <p className="text-red-400 text-xs mt-1">{errors.kraAddressType}</p>}
                        </div>

                        {/* Source of Wealth Other */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Other
                            </label>
                            <input
                                type="text"
                                id="sourceOfWealthOther"
                                value={formData.sourceOfWealthOther}
                                onChange={(e) => handleInputChange('sourceOfWealthOther', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.sourceOfWealth !== '08'}
                            />
                        </div>

                        {/* Occupation Other */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Other
                            </label>
                            <input
                                type="text"
                                id="occupationOther"
                                value={formData.occupationOther}
                                onChange={(e) => handleInputChange('occupationOther', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.occupation !== '99'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FATCA Details Section */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] rounded-t-lg">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">FATCA Details</h3>
                </div>
                <div className="p-6">
                    {/* Tax Residency Question */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Tax Residency in a country other than India? <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="taxResidency"
                                value={formData.taxResidency}
                                onChange={(e) => handleTaxResidencyChange(e.target.value)}
                                className="w-full md:w-1/2 px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
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
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Place of Birth <span className="text-[#F59E0B]">*</span>
                            </label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                maxLength={60}
                            />
                            {errors.placeOfBirth && <p className="text-red-400 text-xs mt-1">{errors.placeOfBirth}</p>}
                        </div>

                        {/* Country of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Country of Birth <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="countryOfBirth"
                                value={formData.countryOfBirth}
                                onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfBirth && <p className="text-red-400 text-xs mt-1">{errors.countryOfBirth}</p>}
                        </div>

                        {/* Country of Citizenship */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Country of Citizenship <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="countryOfCitizenship"
                                value={formData.countryOfCitizenship}
                                onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfCitizenship && <p className="text-red-400 text-xs mt-1">{errors.countryOfCitizenship}</p>}
                        </div>

                        {/* Country of Nationality */}
                        <div>
                            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                Country of Nationality <span className="text-[#F59E0B]">*</span>
                            </label>
                            <select
                                id="countryOfNationality"
                                value={formData.countryOfNationality}
                                onChange={(e) => handleInputChange('countryOfNationality', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryList.map((option: any) => (
                                    <option key={option.id} value={option.kyc_code}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfNationality && <p className="text-red-400 text-xs mt-1">{errors.countryOfNationality}</p>}
                        </div>
                    </div>

                    {/* Tax Residency Section (Conditional) */}
                    {showTaxSection && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#2A2A2A]">
                            {/* Country of Tax Residency */}
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Countries of Tax Residency <span className="text-[#F59E0B]">*</span>
                                </label>
                                <select
                                    id="taxCountry"
                                    value={formData.taxCountry}
                                    onChange={(e) => handleInputChange('taxCountry', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    {countryList.map((option: any) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.taxCountry && <p className="text-red-400 text-xs mt-1">{errors.taxCountry}</p>}
                            </div>

                            {/* Tax Identification Number */}
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Tax Identification Numbers <span className="text-[#F59E0B]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="taxIdentificationNumber"
                                    value={formData.taxIdentificationNumber}
                                    onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent uppercase"
                                    maxLength={20}
                                />
                                {errors.taxIdentificationNumber && <p className="text-red-400 text-xs mt-1">{errors.taxIdentificationNumber}</p>}
                            </div>

                            {/* Tax Identification Type */}
                            <div>
                                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                                    Tax Identification Types <span className="text-[#F59E0B]">*</span>
                                </label>
                                <select
                                    id="taxIdentificationType"
                                    value={formData.taxIdentificationType}
                                    onChange={(e) => handleInputChange('taxIdentificationType', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
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
                                {errors.taxIdentificationType && <p className="text-red-400 text-xs mt-1">{errors.taxIdentificationType}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-[#2A2A2A]">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${
                        isFirstStep
                            ? 'bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed'
                            : 'bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:border-[#F59E0B] transition-all'
                    }`}
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${
                        isFormValid
                            ? 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 shadow-lg'
                            : 'bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed'
                    }`}
                >
                    {isLastStep ? 'Submit' : 'Next'}
                </button>
            </div>
        </form>
    );
}