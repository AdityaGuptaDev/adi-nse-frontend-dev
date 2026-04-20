// components/steps/SolePrimaryHolder.tsx
import { useState, useEffect } from 'react';
import { StepComponentProps } from '../types';

interface SolePrimaryHolderProps extends StepComponentProps { }

interface FormData {
    // Basic Details
    name: string;
    dateOfBirth: string;
    pan: string;
    reEnterPan: string;
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

export default function SolePrimaryHolder({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep
}: SolePrimaryHolderProps) {
    const [formData, setFormData] = useState<FormData>({
        // Basic Details
        name: '',
        dateOfBirth: '',
        pan: '',
        reEnterPan: '',
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

    const [showTaxSection, setShowTaxSection] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Basic Details validation
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
        if (!formData.pan.trim()) newErrors.pan = 'PAN is required';
        if (!formData.reEnterPan.trim()) newErrors.reEnterPan = 'Please re-enter PAN';
        if (formData.pan !== formData.reEnterPan) newErrors.reEnterPan = 'PAN numbers do not match';
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.mobileDeclaration) newErrors.mobileDeclaration = 'Mobile declaration is required';
        if (!formData.emailDeclaration) newErrors.emailDeclaration = 'Email declaration is required';

        // Additional KYC validation
        if (!formData.grossAnnualIncome && !formData.networth) {
            newErrors.income = 'Either Gross Annual Income or Networth is required';
        }
        if (!formData.occupation) newErrors.occupation = 'Occupation is required';
        if (!formData.pepStatus) newErrors.pepStatus = 'Political Exposure is required';
        if (!formData.kraAddressType) newErrors.kraAddressType = 'KRA Address Type is required';

        // FATCA validation
        if (!formData.placeOfBirth) newErrors.placeOfBirth = 'Place of Birth is required';
        if (!formData.countryOfBirth) newErrors.countryOfBirth = 'Country of Birth is required';
        if (!formData.countryOfCitizenship) newErrors.countryOfCitizenship = 'Country of Citizenship is required';
        if (!formData.countryOfNationality) newErrors.countryOfNationality = 'Country of Nationality is required';

        if (showTaxSection) {
            if (!formData.taxCountry) newErrors.taxCountry = 'Country of Tax Residency is required';
            if (!formData.taxIdentificationNumber) newErrors.taxIdentificationNumber = 'Tax Identification Number is required';
            if (!formData.taxIdentificationType) newErrors.taxIdentificationType = 'Tax Identification Type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = validateForm();

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            onNext();
        }
    };

    // Country options (simplified for demo)
    const countryOptions = [
        { value: '101', label: 'India' },
        { value: '230', label: 'United States' },
        { value: '229', label: 'United Kingdom' },
        { value: '039', label: 'Canada' },
        { value: '014', label: 'Australia' },
        { value: '108', label: 'Italy' },
        { value: '074', label: 'France' },
        { value: '081', label: 'Germany' },
        { value: '157', label: 'New Zealand' },
        { value: '196', label: 'Singapore' },
        { value: '117', label: 'Korea Republic Of' },
        { value: '110', label: 'Japan' },
    ];

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

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-6">Sole / Primary Holder</h2>

            {/* Basic Details Section */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A]">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">Basic Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={100}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                        </div>

                        {/* PAN */}
                        <div>
                            <label htmlFor="pan" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                PAN / PEKRN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="pan"
                                value={formData.pan}
                                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
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

                    {/* Re-enter PAN */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-start-2">
                            <label htmlFor="reEnterPan" className="block text-sm font-medium text-[#E5E7EB] mb-2 text-right">
                                Re-Enter PAN / PEKRN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="reEnterPan"
                                value={formData.reEnterPan}
                                onChange={(e) => handleInputChange('reEnterPan', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={10}
                            />
                            {errors.reEnterPan && <p className="text-red-500 text-xs mt-1">{errors.reEnterPan}</p>}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Residential Phone */}
                        <div>
                            <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Res. (ISD-STD-Phone)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.resISD}
                                    onChange={(e) => handleInputChange('resISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resSTD}
                                    onChange={(e) => handleInputChange('resSTD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.resPhone}
                                    onChange={(e) => handleInputChange('resPhone', e.target.value)}
                                    className="w-2/4 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Mobile (ISD-Mobile) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.mobileISD}
                                    onChange={(e) => handleInputChange('mobileISD', e.target.value)}
                                    className="w-1/4 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    maxLength={5}
                                />
                                <input
                                    type="text"
                                    value={formData.mobileNumber}
                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                    className="w-3/4 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={15}
                                />
                            </div>
                            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="mobileDeclaration" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Mobile Declaration <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="mobileDeclaration"
                                value={formData.mobileDeclaration}
                                onChange={(e) => handleInputChange('mobileDeclaration', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="emailDeclaration" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Email Declaration <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="emailDeclaration"
                                value={formData.emailDeclaration}
                                onChange={(e) => handleInputChange('emailDeclaration', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A]">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">Additional KYC Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Gross Annual Income */}
                        <div>
                            <label htmlFor="grossAnnualIncome" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Gross Annual Income <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="grossAnnualIncome"
                                value={formData.grossAnnualIncome}
                                onChange={(e) => handleInputChange('grossAnnualIncome', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="networth" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Networth (in Rs.)
                            </label>
                            <input
                                type="text"
                                id="networth"
                                value={formData.networth}
                                onChange={(e) => handleInputChange('networth', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={10}
                            />
                        </div>

                        {/* Networth Date */}
                        <div>
                            <label htmlFor="networthDate" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                As on date
                            </label>
                            <input
                                type="date"
                                id="networthDate"
                                value={formData.networthDate}
                                onChange={(e) => handleInputChange('networthDate', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {errors.income && <p className="text-red-500 text-xs mb-4">{errors.income}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Source of Wealth */}
                        <div>
                            <label htmlFor="sourceOfWealth" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Source of Wealth
                            </label>
                            <select
                                id="sourceOfWealth"
                                value={formData.sourceOfWealth}
                                onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="occupation" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Occupation <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="occupation"
                                value={formData.occupation}
                                onChange={(e) => handleInputChange('occupation', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="pepStatus" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Political Exposure <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="pepStatus"
                                value={formData.pepStatus}
                                onChange={(e) => handleInputChange('pepStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="kraAddressType" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                KRA Address Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="kraAddressType"
                                value={formData.kraAddressType}
                                onChange={(e) => handleInputChange('kraAddressType', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="sourceOfWealthOther" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Other
                            </label>
                            <input
                                type="text"
                                id="sourceOfWealthOther"
                                value={formData.sourceOfWealthOther}
                                onChange={(e) => handleInputChange('sourceOfWealthOther', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.sourceOfWealth !== '08'}
                            />
                        </div>

                        {/* Occupation Other */}
                        <div>
                            <label htmlFor="occupationOther" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Other
                            </label>
                            <input
                                type="text"
                                id="occupationOther"
                                value={formData.occupationOther}
                                onChange={(e) => handleInputChange('occupationOther', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={50}
                                readOnly={formData.occupation !== '99'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FATCA Details Section */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] mb-6">
                <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A]">
                    <h3 className="text-lg font-medium text-[#F9FAFB]">FATCA Details</h3>
                </div>
                <div className="p-6">
                    {/* Tax Residency Question */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label htmlFor="taxResidency" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Tax Residency in a country other than India? <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="taxResidency"
                                value={formData.taxResidency}
                                onChange={(e) => handleTaxResidencyChange(e.target.value)}
                                className="w-full md:w-1/2 px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label htmlFor="placeOfBirth" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Place of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                maxLength={60}
                            />
                            {errors.placeOfBirth && <p className="text-red-500 text-xs mt-1">{errors.placeOfBirth}</p>}
                        </div>

                        {/* Country of Birth */}
                        <div>
                            <label htmlFor="countryOfBirth" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Country of Birth <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfBirth"
                                value={formData.countryOfBirth}
                                onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfBirth && <p className="text-red-500 text-xs mt-1">{errors.countryOfBirth}</p>}
                        </div>

                        {/* Country of Citizenship */}
                        <div>
                            <label htmlFor="countryOfCitizenship" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Country of Citizenship <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfCitizenship"
                                value={formData.countryOfCitizenship}
                                onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfCitizenship && <p className="text-red-500 text-xs mt-1">{errors.countryOfCitizenship}</p>}
                        </div>

                        {/* Country of Nationality */}
                        <div>
                            <label htmlFor="countryOfNationality" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                Country of Nationality <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="countryOfNationality"
                                value={formData.countryOfNationality}
                                onChange={(e) => handleInputChange('countryOfNationality', e.target.value)}
                                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {countryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.countryOfNationality && <p className="text-red-500 text-xs mt-1">{errors.countryOfNationality}</p>}
                        </div>
                    </div>

                    {/* Tax Residency Section (Conditional) */}
                    {showTaxSection && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#2A2A2A]">
                            {/* Country of Tax Residency */}
                            <div>
                                <label htmlFor="taxCountry" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                    Countries of Tax Residency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="taxCountry"
                                    value={formData.taxCountry}
                                    onChange={(e) => handleInputChange('taxCountry', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    {countryOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.taxCountry && <p className="text-red-500 text-xs mt-1">{errors.taxCountry}</p>}
                            </div>

                            {/* Tax Identification Number */}
                            <div>
                                <label htmlFor="taxIdentificationNumber" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                    Tax Identification Numbers <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="taxIdentificationNumber"
                                    value={formData.taxIdentificationNumber}
                                    onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                    maxLength={20}
                                />
                                {errors.taxIdentificationNumber && <p className="text-red-500 text-xs mt-1">{errors.taxIdentificationNumber}</p>}
                            </div>

                            {/* Tax Identification Type */}
                            <div>
                                <label htmlFor="taxIdentificationType" className="block text-sm font-medium text-[#E5E7EB] mb-2">
                                    Tax Identification Types <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="taxIdentificationType"
                                    value={formData.taxIdentificationType}
                                    onChange={(e) => handleInputChange('taxIdentificationType', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="flex justify-between items-center pt-6 border-t border-[#2A2A2A]">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-md transition-colors ${isFirstStep
                        ? 'bg-gray-300 text-[#9CA3AF] cursor-not-allowed'
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
                        : 'bg-gray-300 text-[#9CA3AF] cursor-not-allowed'
                        }`}
                >
                    {isLastStep ? 'Submit' : 'Next'}
                </button>
            </div>
        </form>
    );
}