
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';

import { ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, NODE_API_URL, PROD_DATA, TOKEN_PREFIX, USER_DATA } from './constants';
import { decryptQuery, getLS, remove_All_LS, removeLS } from './helpers';
import { cookieStorageKeys, removeCookieData, removeCookieToken } from '@/services/cookieStorageService';
import { encryptPIIFields } from './piiEncrypt';

const getMessageFromStatus = (status: number, msg: string | null) => {
  switch (status) {
    case 401:
      return msg == 'token expired' ? 'Your token has been expired. Please login again.' : msg || 'Invalid Login';
    case 409:
      return msg || 'Already Exist';
    case 429:
      return msg || 'Too many requests, please try again later';
    case 500:
      return msg || 'Something went wrong';
    case 400:
      return msg || 'Server Error 400';
    default:
      return 'Something went wrong';
  }
};

const formatError = (err: any) => {
  // console.log('err', err);
  let val: any = { msg: '', status: null, field: null };

  // Handle rate limit (429) responses
  if (err?.status === 429 && err?.data?.error === 'RATE_LIMIT_EXCEEDED') {
    const retryAfter = err.data.retryAfter;
    let retryMsg = err.data.message || 'Too many requests, please try again later';
    if (retryAfter) {
      const minutes = Math.ceil(retryAfter / 60);
      retryMsg += `. Retry after ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    val.msg = retryMsg;
    val.status = 429;
    return val;
  }

  if (typeof err?.data == 'string') {
    if (err?.data.search())
      console.log({ err })
    if (err?.data.startsWith('<!DOCTYPE html>')) {
      const match = err?.data.match(/<pre>(.*?)<\/pre>/s);
      if (match && match[1]) {
        const plainMsg = match[1]
          .replace(/<br>/g, '\n')
          .replace(/&nbsp;/g, ' ')
          .trim();
        const errorLine = plainMsg.split('\n')[0].replace(/^Error:\s*/, '').trim();
        val.msg = getMessageFromStatus(err?.status, errorLine);
        val.status = err.status;
      }
    } else {
      val.msg = getMessageFromStatus(err?.status, err?.data);
      val.status = err.status;
    }

  } else if (err?.data?.err?.errors) {
    //format sequelize error
    let e = err?.data?.err?.errors;
    val = [];
    for (let iterator of e) {
      val.push({
        msg: iterator.message,
        field: iterator.path,
        status: err.status,
      });
    }
  } else if (err?.data?.length) {
    //format ZOD error
    let e = err?.data?.[0]?.errors?.issues || [];
    const firstZodError = e?.[0];
    val = {
      msg: firstZodError?.message || 'Server Error',
      status: err?.status,
      field: firstZodError?.path,
    };
  } else if (err?.data?.required) {
    //format express validator error
    let e = err?.data?.required.errors;

    val = [];
    for (let iterator of e) {
      val.push({
        msg: iterator.msg,
        field: iterator.param,
        status: err.status,
      });
    }
  } else if (err?.data?.title) {
    //based on quantom api structure
    val.msg = err?.data?.title;
    val.status = err?.status;
  } else if (err?.data?.message) {
    //based on quantom api structure
    val.msg = err?.data?.message;
    val.status = err?.status;
  } else if (err?.data?.err.name == "ZodError") {
    //format ZOD error
    let e = err?.data?.err?.issues || [];
    const firstZodError = e?.[0];
    val = {
      msg: firstZodError?.message || 'Server Error',
      status: err?.status,
      field: firstZodError?.path,
    };
  }
  else {
    val.msg = getMessageFromStatus(err?.status, null)
      ? getMessageFromStatus(err?.status, null)
      : err.data.msg;
    val.status = err?.status;
  }
  return val;
};

const fetchClient = () => {
  let defaultOptions: AxiosRequestConfig = {
    baseURL: NODE_API_URL,
    // baseURL: process.env.API_BASE_URL,
    headers: {
      // 'Content-Type': 'application/json',
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  let instance: AxiosInstance = axios.create(defaultOptions);
  instance.interceptors.request.use(async (config: any) => {
    try {
      const token = getLS(TOKEN_PREFIX);
      config.headers.Authorization = token;

      if (config.data instanceof FormData) {
        // Let the browser set the correct Content-Type with boundary for
        // multipart uploads. FormData never contains raw PII text fields.
        delete config.headers["Content-Type"];
      } else if (config.data && typeof config.data === 'object') {
        // ── PII Encryption ──────────────────────────────────────────────────
        // Encrypt sensitive fields (mobile, PAN, Aadhaar, email, password…)
        // before they leave the browser. The backend piiDecrypt middleware
        // detects __pii_encrypted: true and decrypts transparently so no
        // controller code needs to change.
        //
        // IMPORTANT — skip this for upstream-proxied payloads where our
        // backend forwards fields verbatim to a third-party provider (MFU,
        // NSE, NIMBUS, etc.). If we encrypt `ifsc`, `account_number`, `pan`,
        // `mobile`, `email`, `dob` etc. inside those payloads, MFU sees the
        // ciphertext instead of the real value and rejects with generic
        // errors like "Invalid Request Details". The backend route does the
        // MFU-side encryption itself, so we send plain values here.
        const url: string = (config.url || "").toString();
        const bypassPii = /\/(mfu|nse|nimbus|mfUtility|mutual-fund\/(?:folios-by-pan-scheme|scheme-by-name))/i.test(url);
        if (!bypassPii) {
          config.data = encryptPIIFields(config.data);
        }
        // ────────────────────────────────────────────────────────────────────
      }
    } catch (error) {
      console.log('err', error);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Modify the response data here
      response.data.data = decryptQuery(response.data.data);
      // console.log("API Response: ", response.data.data);
      return response;
    },
    async (err: AxiosError) => {
      console.log(err?.response);
      if (err?.response?.status === 401) {
        window.location.href = "/login"
        // removeLS(TOKEN_PREFIX)
        //will clear all local storage
        if (!sessionStorage.getItem(USER_DATA)) {
          removeCookieToken();
          removeCookieData(cookieStorageKeys.INIT_PATH);
        }

        removeLS(PROD_DATA);
        removeLS(TOKEN_PREFIX);
        removeLS(MENU_PREFIX);
        removeLS(FLAT_MENU);
        removeLS(USER_DATA);
        removeLS(ADMIN_INVESTER_DATA)

      }

      const errorLog = formatError(err?.response);
      return Promise.reject(errorLog);
    }
  );
  return instance;
};

export default fetchClient();
