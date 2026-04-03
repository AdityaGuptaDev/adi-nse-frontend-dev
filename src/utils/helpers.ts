import CryptoJS from 'crypto-js';
import { toast } from "react-toastify";
import environment from "../environment";
import config from "./config";
import { MENU_PREFIX, USER_DATA } from "./constants";

export const setLS = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    const json = JSON.stringify(data);
    try {
      // If this key already exists in sessionStorage, only update sessionStorage
      if (sessionStorage.getItem(USER_DATA) !== null) {
        sessionStorage.setItem(key, json);
        return;
      }
    } catch { }
    // Otherwise, write to localStorage (default behavior)
    try { localStorage.setItem(key, json); } catch { }
  }
}


export const getLS = (key: string) => {
  if (typeof window !== 'undefined') {
    // Prefer sessionStorage (per-window) so impersonation windows don't leak into other tabs
    try {
      const ss = sessionStorage.getItem(key);
      if (ss) return JSON.parse(ss);
    } catch { }

    try {
      const ls = localStorage.getItem(key);
      if (ls) return JSON.parse(ls);
    } catch { }
  }
  return null;
};


export const removeLS = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      // If key exists in sessionStorage, remove only from sessionStorage
      if (sessionStorage.getItem(key) !== null) {
        sessionStorage.removeItem(key);
        return;
      }
    } catch { }
    // Otherwise, remove from localStorage (default behavior)
    try { localStorage.removeItem(key); } catch { }
  }
}

export const remove_All_LS = () => {
  if (typeof window !== 'undefined') {
    try { sessionStorage.clear(); } catch { }
    try { localStorage.clear(); } catch { }
  }
}


//validate fields if empty or not
export const validFields = (fields: any) => {
  let i = 0;
  let arr = Object.values(fields);
  let len = arr.length;
  let result = true;
  while (i < len) {
    if (!arr[i]) {
      result = false;
      break;
    }
    i++;
  }

  return result;
};

export const toastAlert = (type: string, msg: string) => {
  if (type == "success") return toast.success(msg);
  else if (type == "warn") return toast.warn(msg);
  else if (type == "error") return toast.error(msg);
  else if (type == "info") return toast.info(msg);
  else return toast.dismiss("An Alert Problem");
};

//validate email
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


// for formate date
export const dateFormater = (dateValue: Date) => {
  return new Date(dateValue).toLocaleDateString('en-GB');
};

// for yes no date
export const yesnoFormater = (yesNoValue: 0 | 1) => {
  return yesNoValue == 0 ? "No" : "Yes";
};



export const formatDateWIthMonthName = (date: any, format: string = "") => {
  var d: any = new Date(date),
    month = d.toLocaleString('default', { month: 'long' }),
    day = d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  const nth = function (day: any) {
    if (day > 3 && day < 21) return day = day + 'th';
    switch (d % 10) {
      case 1: return day = day + "st";
      case 2: return day = day + "nd";
      case 3: return day = day + "rd";
      default: return day = day + "th";
    }
  }

  day = nth(day);

  if (format == "m-d-y") {
    return [month, year, day].join("-");
  } else if (format == "d-m-y") {
    return [day, month, year].join("-");
  } else if (format == "d-m") {
    return [day, month].join("-");
  } else if (format == "d/m/y") {
    return [day, month, year].join("/");
  } else if (format == "y/m/d") {
    return [year, month, day].join("-");
  } else {
    return [day, month, year].join(" ");
  }
};
export const formatDateWIthMonthNameShort = (date: any, format: string = "") => {
  var d = new Date(date),
    month = d.toLocaleString('default', { month: 'short' }),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  if (format == "m-d-y") {
    return [month, year, day].join("-");
  } else if (format == "d-m-y") {
    return [day, month, year].join("-");
  } else if (format == "d-m") {
    return [day, month].join("-");
  } else if (format == "d/m/y") {
    return [day, month, year].join("/");
  } else {
    return [year, month, day].join("-");
  }
};

export const monthFromDate = (date: any) => {
  var d = new Date(date);
  let month = d.toLocaleString('default', { month: 'short' });
  return month
}


// generate unique number
export const getUniqueNumber = (prefix: string | null) => {
  var date = new Date();
  var components = [
    prefix,
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ];

  return components.join("");
};

// checking object is empty or not
export const isEmptyObj = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};

export const getAdminLink = (url: string) => {
  let c = config(environment);
  return `${c.adminURL}/#${url}`
}


export const handleServerError = (error: any) => {
  if (!error || error == "undefined" || error == undefined) {
    toastAlert("error", "Somthing went wrong!");
  }

  if (error?.status === 409 || error?.status === 500) {
    if (error?.field?.length) {
      toastAlert("error", `${error.field[0]} has a ${error?.msg}`);
    } else {

      toastAlert("error", error?.data?.msg ? error?.data?.msg : error?.data ? error?.data : error?.msg);
    }
  }

  if (error?.status === 404 || error?.status === 401 || error?.status === 400) {
    if (error.data) {
      toastAlert("error", error?.data);
    } else {
      toastAlert("error", error?.msg);
    }
  }

  if (error?.status === 422) {
    toastAlert("error", error?.data?.required?.errors[0]?.msg);
  }
}

export const dateFormateValue = (date: any) => {

  const inputDate = formatDate(date, "d-m-y");
  const dateParts: any = inputDate.split("-");

  const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  const options: any = { day: "numeric", month: "long", year: "numeric" };

  const formattedDate = dateObj.toLocaleDateString("en-GB", options);

  return formattedDate
}

export function convertTime(time: any) {
  return time.replace(":", ".");
}

export function formatMonthDate(dateString: any) {

  let date = new Date(dateString);
  let options: any = { day: 'numeric', month: 'long', year: 'numeric' };
  let formattedDate = date.toLocaleDateString('en-US', options);

  // Convert the ordinal number for the day
  let day = date.getDate();
  let suffix = "";
  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (day === 3 || day === 23) {
    suffix = "rd";
  } else {
    suffix = "th";
  }
  formattedDate = formattedDate.replace(/\d+/, (match) => match + suffix);

  return formattedDate;
}


///  start

export const formatDayWithSuffix = (dateString: any) => {
  const date = new Date(dateString);
  const day = date.getDate();

  let daySuffix;
  if (day === 1 || day === 21 || day === 31) {
    daySuffix = 'st';
  } else if (day === 2 || day === 22) {
    daySuffix = 'nd';
  } else if (day === 3 || day === 23) {
    daySuffix = 'rd';
  } else {
    daySuffix = 'th';
  }

  return `${day}${daySuffix}`;
}

export const formatDates = (startDate: any, endDate?: any) => {
  const start = new Date(startDate);
  const end = new Date(endDate ? endDate : '');

  const formattedStartDay = formatDayWithSuffix(startDate);
  let formattedEndDay: any

  if (endDate) {
    formattedEndDay = formatDayWithSuffix(endDate);
  }

  const month = start.toLocaleString('default', { month: 'short' });
  const year = start.getFullYear();

  return `${formattedStartDay}${formattedEndDay ? ',' : ''} ${formattedEndDay ? formattedEndDay : ''} ${month} ${year}`;  //example ->  05th, 30th June 2024
}

///// end

// Encryption function
export const encryptQuery = (query: any) => {
  const secretKey = 'va*proses'; // Replace with your secret key
  return CryptoJS.AES.encrypt(JSON.stringify(query), secretKey).toString();
};

// Decryption function (if needed)
export const decryptQuery = (encryptedQuery: any) => {
  const secretKey = 'va*proses'; // Replace with your secret key
  const bytes = CryptoJS.AES.decrypt(encryptedQuery, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};


////  start  convert this formate  ->   05th June - 30th June 2024  /////////////

export function convertDate(startDate: any, endDate: any) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

  function formatDay(day: any) {
    if (day > 3 && day < 21) return day + "th"; // 11th, 12th, 13th
    switch (day % 10) {
      case 1: return day + "st";
      case 2: return day + "nd";
      case 3: return day + "rd";
      default: return day + "th";
    }
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = formatDay(start.getDate());
  const startMonth = monthNames[start.getMonth()];

  const endDay = formatDay(end.getDate());
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  const finalDate = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`

  return `${finalDate ? finalDate : ''}`;      //example ->  05th June - 30th June 2024
}

/////  end date //////////



export function convertOnlyEndDate(endDate: any) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function formatDay(day: any) {
    if (day > 3 && day < 21) return day + "th"; // 11th, 12th, 13th
    switch (day % 10) {
      case 1: return day + "st";
      case 2: return day + "nd";
      case 3: return day + "rd";
      default: return day + "th";
    }
  }

  // const start = new Date(startDate);
  const end = new Date(endDate);

  // const startDay = formatDay(start.getDate());
  // const startMonth = monthNames[start.getMonth()];

  const endDay = formatDay(end.getDate());
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  return `${endDay} ${endMonth} ${endYear}`;      //example ->  30th June 2024
}


//generate random 3 digit number
export const generateRandomThreeDigitNumber = (): string => {
  var length = 3,
    charset = "0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const delay = (time: number) => {
  return new Promise((res) => setTimeout(res, time, "done..."));
};
export const formatDate = (date: any, format: string = "") => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  if (format == "m-d-y") {
    return [month, year, day].join("-");
  } else if (format == "d-m-y") {
    return [day, month, year].join("-");
  } else if (format == "d-m") {
    return [day, month].join("-");
  } else if (format == "d/m/y") {
    return [day, month, year].join("/");
  } else if (format == "y-d-m") {
    return [year, day, month].join("-");
  } else if (format == "y-m-d") {
    return [year, month, day].join("-");
  } else {
    return [year, month, day].join("-");
  }
};

//get action permission using path
export const getActionPermission = (path: string): any => {
  let perm: any = null;
  if (!path) {
    return perm;
  }

  // const MENU = getLS(MENU_PREFIX);
  const MENU: any = (localStorage.getItem(MENU_PREFIX))

  // console.log(MENU, "MENUMENU")

  if (!MENU && !MENU?.length) {
    return perm;
  }

  JSON.parse(MENU).map((parent: any) => {

    if (parent?.children?.length) {
      parent.children.map((child: any) => {

        if (child.link == path) {

          perm = child?.permission || null;

          return;
        }
      });

    } else if (parent.link == path) {
      perm = parent?.permission || null;
      return;
    }
  });
  return perm;
};

export function dateFormat(date: any) {
  var currentDate = new Date(date)
  var day = currentDate.getDate()
  var month = currentDate.getMonth() + 1
  var year = currentDate.getFullYear();
  return year + "-" + month + "-" + day;
}

export function addMonths(date: any, months: any) {
  date.setMonth(date.getMonth() + months);
  return date;
}

export const dateConvt = (val: any) => {
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    date = new Date(val); // Directly parse the string
  }
  // Check if the format is DD-MM-YYYY
  else if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [day, month, year] = val.split("-");
    date = new Date(`${year}-${month}-${day}`);
  } else {

    date = new Date(NaN);
  }


  return (`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)
}


//Added by rakesh Sinha

export const numberToWords = (num: number): string => {
  if (num === 0) return "Zero Rupees";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const numberToWordsBelowThousand = (n: number): string => {
    let word = "";
    if (n > 99) {
      word += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) word += ones[n];
      else word += tens[Math.floor(n / 10)] + " " + ones[n % 10];
    }
    return word.trim();
  };

  const segments = [
    { value: 10000000, name: "Crore" },
    { value: 100000, name: "Lakh" },
    { value: 1000, name: "Thousand" },
    { value: 100, name: "Hundred" }
  ];

  let result = "";
  for (const seg of segments) {
    if (num >= seg.value) {
      result += numberToWordsBelowThousand(Math.floor(num / seg.value)) + " " + seg.name + " ";
      num %= seg.value;
    }
  }

  if (num > 0) {
    result += numberToWordsBelowThousand(num);
  }

  return result.trim() + " Rupees";
}

export const formatReturn = (returnValue: number) => {
  return `${returnValue.toFixed(1)}%`;
};

export const convertNumberIndian = (num: any) => {
  const formatted = num.toLocaleString("en-IN"); // Indian locale
  console.log(formatted); //  "1,42,93,253"
  return formatted
}

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Very High":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RISK_COLOR = (riskLevel: string) => {

  switch (riskLevel?.toLowerCase()) {
    case 'low risk':                          ////////////     "Low Risk"
      return 'bg-[#3e884d] text-white';
    case 'low to moderate risk':             /////////////     "Low to Moderate Risk"
      return 'bg-[#90c34e] text-white';
    case 'moderate risk':                   /////////////      "Moderate Risk"
      return 'bg-[#f5e655] text-white';
    case 'moderate high risk':             ////////////        "Moderately High risk"
      return 'bg-[#efa647] text-white';
    case 'high risk':                      //////////          "High Risk"
      return 'bg-[#f16b44] text-white';
    case 'very high risk':                 ///////////         "Very High Risk"
      return 'bg-[#cc3a3b] text-white';
    default:
      return 'bg-gray-400'; // fallback
  }
};


export const FUND_STATUS_COLOR = (fundStatus: string) => {

  switch (fundStatus?.toLowerCase()) {
    case 'open':
      return 'bg-green-600/30 text-green-600';
    // case 'upcoming':
    //   return 'bg-orange-500/30 text-orange-500';
    case 'closing soon':
      return 'bg-red-600/30 text-red-600';
    // case 'closed':
    //   return 'bg-gray-500/30 text-gray-500';
    default:
      return 'bg-gray-400/30 text-gray-400'; // fallback
  }
};


export function convertOnlyDate(date: any) {

  const inputDate = new Date(date);

  const formattedDate = inputDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC" // prevent timezone shift
  });

  console.log(formattedDate);

  return `${formattedDate}`;      //example ->  30 June 2024
}


export const convertManagerName = (fullName: any) => {
  if (fullName) {
    const initials = fullName
      .split(" ")             // Split by space → ['Rajeev', 'Kumar']
      .map((word: any) => word[0])   // Get first letter of each word → ['R', 'K']
      .join("")               // Join letters → 'RK'

    // console.log(initials); 
    return initials    // Output: RK
  }

}

export const convertManagerDate = (date: any, isMonth?: boolean) => {
  if (date) {
    const [day, month, year] = date.split("-");
    const fullYear = parseInt(year) < 50 ? "20" + year : "19" + year;

    const parsedDate = new Date(`${fullYear}-${month}-${day}`);

    const options: Intl.DateTimeFormatOptions = isMonth
      ? { month: 'long', year: 'numeric' }           //////     June 2024
      : { day: '2-digit', month: 'long', year: 'numeric' };      ////////     30 June 2024

    const formatted = parsedDate.toLocaleDateString("en-GB", options);
    return formatted;
  }
  return "";
}


//
export const localStorageKeys = {
  USER_DATA: "VEDANT_ASSET_PROD_DATA",
  PROD_USER_DATA: "VEDANT_ASSET_PROD_USER_DATA",
};




const isClient = typeof window !== "undefined";
export const storeLsData = (key: string, value: any) => {
  if (isClient) {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  }
};

export const getLsData = (key: string) => {
  if (isClient) {
    const jsonValue = localStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  }
};

export const removeLsData = (key: string) => {
  if (isClient) {
    localStorage.removeItem(key);
  }
};

export const getLsUser = () => {
  return getLsData(localStorageKeys.USER_DATA);
};

export const setLsUser = (data: any) => {
  storeLsData(localStorageKeys.USER_DATA, data);
};

export const removeLsUser = () => {
  removeLsData(localStorageKeys.USER_DATA);
};
export const getProdUser = () => {
  console.log("getProdUser called", localStorageKeys.PROD_USER_DATA);
  return getLsData(localStorageKeys.PROD_USER_DATA);
};



