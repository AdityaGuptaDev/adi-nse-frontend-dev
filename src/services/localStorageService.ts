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
  return getLsData(localStorageKeys.PROD_USER_DATA);
};


