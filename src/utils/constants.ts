import environment, { env } from "../environment";
import configFunc from "./config";
const config = configFunc(environment);

export const NODE_API_URL = config.ApiUrl;

export const TOKEN_PREFIX = `VEDANT_ASSET_PROD_TOKEN`;
export const MENU_PREFIX = `VEDANT_ASSET_PROD_MENU`;
export const FLAT_MENU = `VEDANT_ASSET_PROD_FLAT_MENU`;
export const USER_DATA = `VEDANT_ASSET_PROD_USER_DATA`;
export const ADMIN_INVESTER_DATA = `VEDANT_ASSET_PROD_ADMIN_INVESTER_DATA`;
export const ADD_MEMBER = `VEDANT_ASSET_PROD_ADD_MEMBER`;
export const MEMBER_DATA = `VEDANT_ASSET_PROD_MEMBER_DATA`;
export const PROD_DATA = 'VEDANT_ASSET_PROD_DATA'

//creating the new constant fot decentro service 
export const MOBILE_VERIFICATION_RESPONSE = 'MOBILE_VERIFICATION_RESPONSE';


export type pageTypes = "list" | "add" | "edit" | "view";

export const ItemsPerPage = [10, 20, 30, 50, 100, 300]
export const DefaultItemsPerPage = 10


export const publicPathName = `${config.publicBasePath}`

export const routeBaseUrl = `${config.baseUrl}`

export const websiteUrl = `${config.websiteUrl}`

export const adminUrl = `${config.adminURL}`

export const INITIAL_PAGE = 1;
export const INITIAL_LIMIT = 10;
export const MONTHS_IN_A_YEAR = 12;
export const DEFAULT_INFLATION_RATE = 0;
export const INFLATION_RATE = 6
export const max1MBSizeInBytes = 1 * 1024 * 1024;

export const PAN_NO_REGEX = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/;
export const AGE_REGEX = /^([0-9]){2}?$/;
export const EMAIL_REGEX = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
export const MOBILE_REGEX = /^(\+\d{1,3}[- ]?)?\d{10}$/;

export const convertToCrores = (number: number) => {
    const crore = 10000000; // 1 crore is 10 million
    const crores = number / crore;
    return crores?.toFixed(2); // Returns the number in crores rounded to 2 decimal places
};

export const toFixedDataForReturn = (number: number) => {
    // console.log(number, 'number');

    return number ? `${number?.toFixed(2)}%` : '--';
};

export const showArraow = (returnNumber: number, categoryNumber: number) => {
    let ratio: any =
        categoryNumber && categoryNumber > 0
            ? ((returnNumber - categoryNumber) / categoryNumber) * 100
            : returnNumber;
    ratio = ratio?.toFixed(2);
    if (ratio >= 10) {
        return "#056106";
    } else if (5 <= ratio || ratio >= 9.99) {
        return "#00ff00";
    } else if (0 <= ratio || ratio >= 4.99) {
        return "#ffff00";
    } else if (-5 <= ratio || ratio >= -0.99) {
        return "#f79b00";
    } else if (ratio < -5) {
        return "#ff0000";
    }
};

export const formatNumber = (value: any) => {
    if (Number.isInteger(value)) {
        return value?.toString(); // Return as string without decimals
    } else {
        return value?.toFixed(2); // Return with 2 decimal places
    }
}

export const toFixedData = (number: number) => {
    return number ? number?.toFixed(2) : "--";
};

export const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const phoneRegExp = /^\d{10}$/;

export const MEMBER_TYPE = {
    OWNER: 1,
    MEMBER: 2
}

export const KYC_STEPS = {
    REGISTRATION: 0,
    PAN_CHECK: 1,
    POI: 2,     /////// personal_information
    POA: 3,     /////// address detail
    FATCA: 4,
    BANK_ACCOUNT: 5,
    NOMINEE: 6,
    IPV: 7
}

export const REGISTRATION_STEPS = {
    REGISTRATION: 0,
    PAN_CHECK: 1,
    CRITERIA: 2,     /////// personal_information
    PRIMARY_HOLDER: 3,     /////// address detail
    SECONDARY_HOLDER: 4,
    THIRD_HOLDER: 5,
    GUARDIAN_DETAILS: 6,
    BANK_ACCOUNT: 7,
    NOMINEE: 8,
    IPV: 9
}

export const TransactionType: any = {
    Purchase: 1,   /////// Lumpsum
    SIP: 2,
    // Purchase: 1,
    // Redemption: 2,
    // SIP: 3,
    // STP: 4,
    // Switch: 5,
    // SWP: 6,
};

//Added by rakesh sinha

export const months = [
    { label: "Select", value: "0" },
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
];


export const orderTypes = [
    { label: "Lumpsum", value: "B" },
    { label: "SIP", value: "V" },
    { label: "STP", value: "Y" },
    { label: "SWP", value: "J" },
    { label: "Switch", value: "O" },
    { label: "Redeem", value: "R" },

];

export const dividendFrequency = [
    { label: "Annual", value: "A" },
    { label: "Semi Annual(Half Yearly)", value: "S" },
    { label: "Quarterly", value: "Q" },
    { label: "Monthly", value: "M" },
    { label: "Forthnightly", value: "F" },
    { label: "Weekly", value: "W" },
    { label: "Daily", value: "D" },
];



export const payMode = [

    { value: "OT", label: "Net Banking" },
    { value: "NE", label: "NEFT" },
    { value: "RT", label: "RTGS" },
    { value: "DM", label: "PayEezz" },
    { value: "UP", label: "UPI" },
    { value: "IU", label: "Instsa UPI" },

]

export const dividendOptions = [
    { code: 'N', description: 'NA' },
    { code: 'P', description: 'PAYOUT' },
    { code: 'R', description: 'REINV' },
    { code: 'R', description: 'BOTH' }

];


export const arrTransactionType = [
    { code: "B", value: "B", txnVolTyp: 'A', vol: '5000' },
    { code: "R", value: "R", txnVolTyp: 'E', vol: '5000' },
    { code: "S", value: "O", txnVolTyp: 'E', vol: '5000' },
    { code: "V", value: "V", txnVolTyp: 'A', vol: '1000' },
    { code: "E", value: "Y", txnVolTyp: 'F', vol: '1000' },
    { code: "J", value: "J", txnVolTyp: 'F', vol: '1000' },
];

export const freqMap: Record<string, string> = {
    D: 'Daily',
    W: 'Weekly',
    F: 'Forthnightly',
    M: 'Monthly',
    Q: 'Quarterly',
    S: "Semi Annual(Half Yearly)",
    A: 'Annual'
};

export const TranType = [
    { label: "Lumpsum", value: "1" },
    { label: "SIP", value: "2" },
    { label: "STP", value: "3" },
    { label: "SWP", value: "4" },
    { label: "Switch", value: "5" },
    { label: "Redeem", value: "6" },

];


export const transactionTypeList = [
    { id: 1, name: "B" },
    { id: 2, name: "V" },
    { id: 3, name: "Y" },
    { id: 4, name: "J" },
    { id: 5, name: "O" },
    { id: 6, name: "R" },
];


export const ROLE = {
    superAdmin: 1,
    investor: 2,
    RM: 3,
    partner: 4,
    backOffice: 5,
    BC: 6
}
export const USER_TYPE = {
    superAdmin: 1,
    InvestorRegistration: 2,
    RM: 3,
    partner: 4,
    backOffice: 5,
    BC: 6

}

export const SUMMARYSTEP: any = {
    PersonalDetail: 1,
    Address: 2,
    FATCA: 3,
    BankAccount: 4,
    NomineeDetails: 5,
    Verification: 6
}

export const accountTypeList: any = [
    { id: 1, name: "Savings", value: "SB" },
    { id: 2, name: "Current", value: "CA" },
];
export const accountHoldingModes = {
    single: "Single",
    joint: "Joint",
    anyoneOrSurvivor: "Anyone or Survivor",
}

export const accountHoldingType: any = [
    { id: "SI", name: "Single" },
    { id: "JO", name: "Joint" },
    { id: "AS", name: "Anyone or Survivor" },
]

export const TIMEPERIODS: any = {
    OneDay: "1D",
    OneWeek: "1W",
    OneMonth: "1M",
    ThreeMonth: "3M",
    SixMonth: "6M",
    OneYear: "1Y",
    TwoYear: "2Y",
    ThreeYear: "3Y",
    FiveYear: "5Y",
    TenYear: "10Y",
}

export const SCHEMECATEGORY: any = {
    Equity: 1,
    Debt: 2,
    Hybrid: 3,
    Others: 4,
}

export const schemeColors = [
    { text: "text-yellow-600", bg: "bg-yellow-100" },
    { text: "text-blue-600", bg: "bg-blue-100" },
    { text: "text-green-600", bg: "bg-green-100" },
];

export const ExternalEntityList: any = [
    { label: "CVLKRA", value: "CVLKRA" },
    { label: "Morning Star", value: "MORNINGSTAR" },
    { label: "MFU", value: "MFU" },
    { label: "Cashfree", value: "Cashfree" },
    { label: "Signzy", value: "Signzy" },
    { label: "SMS", value: "SMS" },
    { label: "Email", value: "Email" },
]

export const ExternalEntity: any = {
    CVLKRA: "CVLKRA",
    MORNINGSTAR: "MORNINGSTAR",
    MFU: "MFU",
    Cashfree: "Cashfree",
    Signzy: "Signzy",
    SMS: "SMS",
    Email: "Email",
}

export const CredentialsAccountType: any = [
    { label: "UAT", value: "UAT" },
    { label: "LIVE", value: "LIVE" },
]

export const TAX_STATUS: any = [

    { code: 1, label: "Individual", value: "I" },
    { code: 2, label: "Minor", value: "M" },
    { code: 3, label: "Sole-proprietor", value: "S" }
]


