
// Common option type
export type Option = {
    label: string;
    value: string;
};

/* -------------------- Relationship Type -------------------- */
export const relationshipTypeOptions: Option[] = [
    { label: "FATHER", value: "1" },
    { label: "MOTHER", value: "2" },
    { label: "COURT APPOINTED LEGAL GUARDIAN", value: "3" },
    { label: "AUNT", value: "4" },
    { label: "BROTHER-IN-LAW", value: "5" },
    { label: "BROTHER", value: "6" },
    { label: "DAUGHTER", value: "7" },
    { label: "DAUGHTER-IN-LAW", value: "8" },
    { label: "FATHER-IN-LAW", value: "9" },
    { label: "GRAND DAUGHTER", value: "10" },
    { label: "GRAND FATHER", value: "11" },
    { label: "GRAND MOTHER", value: "12" },
    { label: "GRAND SON", value: "13" },
    { label: "MOTHER-IN-LAW", value: "14" },
    { label: "NEPHEW", value: "15" },
    { label: "NIECE", value: "16" },
    { label: "SISTER", value: "17" },
    { label: "SISTER-IN-LAW", value: "18" },
    { label: "SON", value: "19" },
    { label: "SON-IN-LAW", value: "20" },
    { label: "SPOUSE", value: "21" },
    { label: "UNCLE", value: "22" },
    { label: "OTHERS", value: "23" },
];


export const investorCategory = [
    { value: "I", label: "Individual" },
    { value: "M", label: "Minor" },
    { value: "S", label: "Sole-proprietor" },
]

export const holdingNature = [
    { value: "SI", label: "Single" },
    { value: "JO", label: "Joint" },
    { value: "AS", label: "Anyone or Survivor" },
]


export const TaxStatus = [

    {
        label: "01-RES.IND",
        value: "1",
    },
    {
        label: "02-NRI-NRE",
        value: "2",
    },
    {
        label: "03-NRI-NRO",
        value: "3",
    },
    {
        label: "05-PIO (NRO)",
        value: "5",
    },
    {
        label: "05-PIO (NRE)",
        value: "4",
    }
];


export const incomeOptions = [
    { value: '01', label: 'BELOW 1 LAC' },
    { value: '02', label: '1-5 LAC' },
    { value: '03', label: '5-10 LAC' },
    { value: '04', label: '10-25 LAC' },
    { value: '05', label: '25LAC-1CR' },
    { value: '06', label: 'Greater than 1 CR' },
];

export const occupationOptions = [
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

export const sourceOfWealthOptions = [
    { value: '01', label: 'Salary' },
    { value: '02', label: 'Business Income' },
    { value: '03', label: 'Gift' },
    { value: '04', label: 'Ancestral Property' },
    { value: '05', label: 'Rental Income' },
    { value: '06', label: 'Prize Money' },
    { value: '07', label: 'Royalty' },
    { value: '08', label: 'Others' },
];

export const declarationOptions = [
    { value: 'SE', label: 'Self' },
    { value: 'SP', label: 'Spouse' },
    { value: 'DC', label: 'Dependent Children' },
    { value: 'DS', label: 'Dependent Siblings' },
    { value: 'DP', label: 'Dependent Parents' },
    { value: 'PO', label: 'POA' },
    { value: 'PM', label: 'PMS' },
    { value: 'CD', label: 'Custodian' },
];


export const kraAddressType = [
    { label: "Residential or Business", value: "1" },
    { label: "Residential", value: "2" },
    { label: "Business", value: "3" },
    { label: "Registered Office", value: "4" },
];

export const country = [
    { label: "India", value: "101" },
]
