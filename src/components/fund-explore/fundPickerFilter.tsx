import { useEffect, useState } from "react";
import { getAMCList, getCategoryList, getNatureList } from "@/api/fund-picker";
import { MultiSelect } from "react-multi-select-component";
import CustomRadio from "@/commonUI/Radio";
import CustomCheckbox from "@/commonUI/CheckBox";
import api from "@/utils/api";
import { getLS, handleServerError, toastAlert } from "@/utils/helpers";
import { ADMIN_INVESTER_DATA, ROLE, USER_DATA } from "@/utils/constants";

const FundPickerFilter = ({ isOpen, handleClose, setPayload, payload }: any) => {
  const [categoryData, setCategoryData] = useState<any>([]);
  const [selectCategory, setSelectCategory] = useState<any>([]);
  const [selectSubCategory, setSelectSubCategory] = useState<any>([]);
  const [selectNature, setSelectNature] = useState<number | null>(null);
  const [AMCData, setAMCData] = useState<any>([]);
  const [selectAmc, setSelectAmc] = useState<any>([]);
  const [nature, setNature] = useState([]);
  const [selectReturn, setSelectReturn] = useState<any>("Absolute");
  const [selectAbsolute, setSelectAbsolute] = useState<any>("SIP");
  const [selectAnnualised, setSelectAnnualised] = useState<any>("SIP");
  const [selectInclude, setSelectInclude] = useState<any>({
    selectCloseEnded: false,
    selectOpenEnded: false,
    selectIndex: false,
    selectETF: false,
  });
  const [investerFilter, setInvesterFilter] = useState<any>();
  const [userData, setUserData] = useState<any>();



  useEffect(() => {
    const savedFilters = localStorage.getItem("fundPickerFilters");
    let userData: any = getLS(USER_DATA);
    setUserData(userData);
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setSelectCategory(parsedFilters.categoryid || []);
      setSelectSubCategory(parsedFilters.subcategory_id || []);
      setSelectAmc(parsedFilters.amc_id || []);
      setSelectNature(parsedFilters.option_id || 1);
    } else {
      setSelectNature(1);
    }

    getCategoryLists();
    getNList();
    getAMC();
  }, []);

  useEffect(() => {

    const adminFilterData = getLS(ADMIN_INVESTER_DATA);

    if (adminFilterData && adminFilterData.filter_data) {
      const admin_filter = JSON.parse(adminFilterData.filter_data);

      console.log(admin_filter, "admin_filter")
      if (admin_filter?.categoryid) {
        setSelectCategory([...selectCategory, ...admin_filter?.categoryid || []]);
      }
      if (admin_filter?.subcategory_id) {
        setSelectSubCategory([
          ...new Set([...selectSubCategory, ...admin_filter?.subcategory_id || []]),
        ]);
      }
      if (admin_filter?.option_id) {
        setSelectNature(Number(admin_filter?.option_id));
      }
      if (admin_filter?.selectInclude) {
        setSelectInclude({ ...selectInclude, ...admin_filter?.selectInclude })
      }
      if (admin_filter?.amc_id) {
        setSelectAmc([...selectAmc, ...admin_filter?.amc_id || []])
      }

    }
  }, [])


  const resetFilter = (e: any) => {
    setSelectAmc([]);
    setSelectCategory([]);
    setSelectSubCategory([]);
    const find: any = nature.find((item: any) => item.option === "Growth");
    if (find) setSelectNature(find.id);
    localStorage.removeItem("fundPickerFilters");
    localStorage.removeItem(ADMIN_INVESTER_DATA);

    setPayload(false);
    handleClose(e);
  };

  const applyFilter = (e: any) => {
    const obj: any = {};
    if (selectCategory.length) obj.categoryid = selectCategory;
    if (selectSubCategory.length) obj.subcategory_id = selectSubCategory;
    if (selectAmc.length) obj.amc_id = selectAmc;
    if (selectNature !== null) obj.option_id = Number(selectNature);
    if (selectInclude) obj.selectInclude = selectInclude;

    localStorage.setItem("fundPickerFilters", JSON.stringify(obj));
    localStorage.setItem(ADMIN_INVESTER_DATA, JSON.stringify(obj));
    setPayload(obj);

    handleClose(e);
  };

  const applyFilterAsInvester = async (e: any) => {
    try {
      const obj: any = {};
      if (selectCategory.length) obj.categoryid = selectCategory;
      if (selectSubCategory.length) obj.subcategory_id = selectSubCategory;
      if (selectAmc.length) obj.amc_id = selectAmc;
      if (selectNature !== null) obj.option_id = Number(selectNature);
      if (selectInclude) obj.selectInclude = selectInclude;

      let passObj: any = { filter_data: JSON.stringify({ ...payload, ...obj }) };
      setInvesterFilter(passObj)

      let res: any = await api.post(`/fund-picker/admin-filter-for-invester`, passObj);

      if (res.data) {
        toastAlert("success", res.data.msg)
      }

      handleClose(e);
    } catch (error) {
      handleServerError(error);
    }

  };

  const getCategoryLists = async () => {
    try {
      const data = await getCategoryList();
      if (data?.data) {
        const formatted = data?.data?.data.map((item: any) => ({
          id: Number(item.ID),
          label: item.Name,
        }));
        setCategoryData(data?.data?.data);
      }
    } catch (error) { }
  };

  const getNList = async () => {
    try {
      const data = await getNatureList();
      if (data?.data) setNature(data.data.data);
    } catch (error) { }
  };

  const getAMC = async () => {
    try {
      const data = await getAMCList();
      if (data.data && data?.data?.data.length > 0) {
        const convertedData = data?.data?.data.map((item: any) => ({
          value: item.id,
          label: item.Name,
        }));
        setAMCData(convertedData);
      }
    } catch (error) { }
  };

  const handleCategoryChange = (categoryId: number) => {
    const category = categoryData.find(
      (cat: any) => Number(cat.ID) === categoryId
    );
    const subCategoryIds =
      category?.SchemeSubcategories?.map((sub: any) => Number(sub.Id)) || [];

    if (selectCategory.includes(categoryId)) {
      setSelectCategory(
        selectCategory.filter((id: number) => id !== categoryId)
      );
      setSelectSubCategory(
        selectSubCategory.filter((id: number) => !subCategoryIds.includes(id))
      );
    } else {
      setSelectCategory([...selectCategory, categoryId]);
      setSelectSubCategory([
        ...new Set([...selectSubCategory, ...subCategoryIds]),
      ]);
    }
  };

  const handleSubCategoryChange = (subCategoryId: number) => {
    let updatedSubCategories;
    if (selectSubCategory.includes(subCategoryId)) {
      updatedSubCategories = selectSubCategory.filter(
        (id: number) => id !== subCategoryId
      );
    } else {
      updatedSubCategories = [...selectSubCategory, subCategoryId];

      const parentCategory = categoryData.find((cat: any) =>
        cat.SchemeSubcategories?.some(
          (sub: any) => Number(sub.Id) === subCategoryId
        )
      );
      if (
        parentCategory &&
        !selectCategory.includes(Number(parentCategory.ID))
      ) {
        setSelectCategory([...selectCategory, Number(parentCategory.ID)]);
      }
    }
    setSelectSubCategory(updatedSubCategories);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="flex justify-between items-center px-4">
        <h3 className="text-lg font-medium font-montserrat">Filter</h3>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>
      <div className="mt-2 h-[1px] w-full bg-accent"></div>
      <div className="overflow-y-auto h-[calc(100vh-140px)] p-4">
        {/* Asset Class Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 font-montserrat">
            Asset Class
          </h3>
          <div className="space-y-4">
            {categoryData.map((category: any) => (
              <div key={category.ID}>
                <div className="flex items-center mb-3">
                  <CustomCheckbox
                    label={category.Name}
                    checked={selectCategory.includes(Number(category.ID))}
                    onChange={() => handleCategoryChange(Number(category.ID))}
                    labelClassName="underline"
                  />
                </div>

                {category.SchemeSubcategories?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    {category.SchemeSubcategories.map((subCategory: any) => (
                      <div
                        key={subCategory.Id}
                        className="flex items-center"
                      >
                        <CustomCheckbox
                          label={subCategory.Name}
                          checked={selectSubCategory.includes(
                            Number(subCategory.Id)
                          )}
                          onChange={() =>
                            handleSubCategoryChange(Number(subCategory.Id))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="my-2 h-[1px] w-full bg-accent"></div>

        {/* Nature and AMC sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Nature Section */}
          <div className="border-b border-accent pb-4">
            <h3 className="text-lg font-semibold mb-2 font-montserrat">
              Nature
            </h3>
            <div className="flex flex-wrap gap-2">
              {nature.map((item: any) => (
                <input
                  key={item.id}
                  type="radio"
                  aria-label={item.option}
                  name="nature"
                  className={`btn rounded-xl border-none shadow-none text-sm font-medium ${Number(selectNature) === Number(item.id)
                    ? "bg-other text-white border-other"
                    : "bg-[#2A2A2A] text-[#E5E7EB] border-[#2A2A2A]"
                    }`}
                  checked={selectNature === item.id}
                  onChange={() => setSelectNature(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Return Section */}
          <div className="border-b border-accent pb-4">
            <h3 className="text-lg font-semibold mb-2 font-montserrat">
              Returns
            </h3>
            <div className="flex flex-wrap gap-2">
              <input
                type="radio"
                aria-label={"Absolute"}
                name="nature"
                className={`btn rounded-xl border-none shadow-none text-sm font-medium ${selectReturn === "Absolute"
                  ? "bg-other text-white border-other"
                  : "bg-[#2A2A2A] text-[#E5E7EB] border-[#2A2A2A]"
                  }`}
                checked={selectReturn === "Absolute"}
                onChange={() => setSelectReturn("Absolute")}
              />
              <input
                type="radio"
                aria-label={"Annualised"}
                name="nature"
                className={`btn rounded-xl border-none shadow-none text-sm font-medium ${selectReturn === "Annualised"
                  ? "bg-other text-white border-other"
                  : "bg-[#2A2A2A] text-[#E5E7EB] border-[#2A2A2A]"
                  }`}
                checked={selectReturn === "Annualised"}
                onChange={() => setSelectReturn("Annualised")}
              />
            </div>

            <div className="mt-4 flex gap-6">
              <div>
                <CustomRadio
                  label="SIP"
                  className="radio-sm radio-secondary"
                  checked={
                    selectReturn === "Absolute"
                      ? selectAbsolute === "SIP"
                      : selectAnnualised === "SIP"
                  }
                  onChange={() => {
                    selectReturn === "Absolute"
                      ? setSelectAbsolute("SIP")
                      : setSelectAnnualised("SIP");
                  }}
                />
              </div>
              <div>
                <CustomRadio
                  label="Lumpsum"
                  className="radio-sm radio-secondary"
                  checked={
                    selectReturn === "Absolute"
                      ? selectAbsolute === "Lumpsum"
                      : selectAnnualised === "Lumpsum"
                  }
                  onChange={() => {
                    selectReturn === "Absolute"
                      ? setSelectAbsolute("Lumpsum")
                      : setSelectAnnualised("Lumpsum");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-accent pb-4">
            <h3 className="text-lg font-semibold mb-2 font-montserrat">
              Include
            </h3>
            <div className="flex flex-wrap gap-2">
              <div>
                <CustomCheckbox label="Close Ended" checked={selectInclude.selectCloseEnded}
                  onChange={(e: any) => setSelectInclude({ ...selectInclude, selectCloseEnded: e.target.checked })} />
              </div>
              <div>
                <CustomCheckbox label="Open ended" checked={selectInclude.selectOpenEnded}
                  onChange={(e: any) => setSelectInclude({ ...selectInclude, selectOpenEnded: e.target.checked })} />
              </div>
              <div>
                <CustomCheckbox
                  type="checkbox"
                  label="Index"
                  checked={selectInclude.selectIndex}
                  onChange={(e: any) => setSelectInclude({ ...selectInclude, selectIndex: e.target.checked })}
                />
              </div>
              <div>
                <CustomCheckbox
                  type="checkbox"
                  label="ETF"
                  checked={selectInclude.selectETF}
                  onChange={(e: any) => setSelectInclude({ ...selectInclude, selectETF: e.target.checked })}
                />
              </div>
            </div>
          </div>

          {/* AMC Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 font-montserrat">AMC</h3>

            {/* <MultiSelect
                  options={AMCData}
                  value={AMCData.filter((item: any) =>
                    selectAmc?.includes(item.value)
                  )}
                  onChange={(selected: any) =>
                    setSelectAmc(selected.map((item: any) => item.value))
                  }
                  labelledBy="Select AMC"
                  hasSelectAll={false}
                  overrideStrings={{ selectSomeItems: "Search or select AMC" }}
                  className="multi-select-up"
                /> */}

            <MultiSelect
              options={AMCData}
              value={AMCData.filter((item: any) =>
                selectAmc?.includes(item.value)
              )}
              onChange={(selected: any) =>
                setSelectAmc(selected.map((item: any) => item.value))
              }
              labelledBy="Select AMC"
              hasSelectAll={false}
              overrideStrings={{ selectSomeItems: "Search or select AMC" }}
              className="multi-select-up"
              // disableSearch={true}
              ClearIcon={null}
              ItemRenderer={({ checked, option, onClick }: any) => (
                <div
                  onClick={onClick}
                  className="flex items-center gap-2 px-2 cursor-pointer  active:!text-black "
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={onClick}
                    className="checkbox checkbox-info text-white h-[18px] w-[18px] border-accent rounded-md"
                  />
                  <span className="hover:text-black">{option.label}</span>
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <div className="mb-2 h-[1px] w-full bg-accent"></div>
      {/* Footer */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-4">
          <button
            className="btn btn-outline w-full rounded-lg border-border"
            onClick={resetFilter}
          >
            Reset
          </button>
          <button
            className="btn bg-primary hover:bg-primary text-white border-none w-full rounded-lg"
            onClick={(e) => applyFilter(e)}
          >
            Apply
          </button>
        </div>
        {userData.roleId === ROLE.ADMIN && (
          <div className="mt-5">
            <button
              className="btn bg-primary hover:bg-primary text-white border-none w-full rounded-lg"
              onClick={(e) => applyFilterAsInvester(e)}
            >
              Save For Invester
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default FundPickerFilter;
