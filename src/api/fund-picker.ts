import api from "@/utils/api";

export const getCategoryList = async () => {
  return await api.get(`/fund-picker/get-category-with-subCategory`);
};

export const getFundPickerData = async (param: any) => {
  return await api.get("/fund-picker/getFundPickerData", { params: param });
};

export const getNatureList = async () => {
  return await api.get(`/fund-picker/get-nature-list`);
};

export const getAMCList = async () => {
  return await api.get(`/fund-picker/get-AMC`);
};
