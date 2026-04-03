import Cookies from "js-cookie";
export const cookieStorageKeys = {
  TOKEN: "VEDANT_ASSET_PROD_TOKEN",
  USER_DATA: "VEDANT_ASSET_PROD_USER_DATA",
  INIT_PATH: "VEDANT_ASSET_PROD_INIT_PATH"
};

export const storeCookieData = (key: string, value: any) => {
  const jsonValue = JSON.stringify(value);
  Cookies.set(key, jsonValue);
};

export const getCookieData = (key: string) => {
  const jsonValue = Cookies.get(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};

export const removeCookieData = (key: string) => {
  Cookies.remove(key);
};

export const getCookieToken = () => {
  return getCookieData(cookieStorageKeys.TOKEN);
};

export const setCookieToken = (data: any) => {
  storeCookieData(cookieStorageKeys.TOKEN, data);
};

export const removeCookieToken = () => {
  removeCookieData(cookieStorageKeys.TOKEN);
};
