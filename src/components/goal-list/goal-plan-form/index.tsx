"use client";

import CustomButton from "@/commonUI/Button";
import CustomText from "@/commonUI/Text";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInput from "@/commonUI/Input";
import Uploader from "@/components/image-uploader/uploader";
import CustomLabel from "@/commonUI/Label";
import CustomReactSelect from "@/commonUI/ReactSelect";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import { AiOutlinePercentage } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdClose } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import CustomCheckbox from "@/commonUI/CheckBox";
import Pagination from "@/components/commonGrid/components/pagination";
import { handleServerError, toastAlert } from "@/utils/helpers";
import api from "@/utils/api";
import {
  NODE_API_URL,
  convertToCrores,
  max1MBSizeInBytes,
  publicPathName,
  showArraow,
  toFixedDataForReturn,
} from "@/utils/constants";
import { FaArrowAltCircleUp, FaStar } from "react-icons/fa";

const schema = yup.object().shape({
  goal_name: yup.string().trim().required("Name is required"),
  risk_category_id: yup.string().trim().required("Risk category is required"),
  scheme_category_id: yup
    .string()
    .trim()
    .required("Fund Category is required"),
  scheme_subCategory_id: yup
    .string()
    .trim()
    .required("Scheme Subcategory is required"),
  weightage: yup.string().required("Weightage is requied"),
});

function GoalPlanForm({
  toggleForm,
  getGoalsTypes,
  editGoalItem,
  setEditGoalItem,
  pageTitle
}: any) {
  const [imageUrl, setImageUrl] = useState("");
  const [riskCategory, setRiskCategory] = useState([]);
  const [schemeCategory, setSchemeCategory] = useState([]);
  const [schemeSubCategory, setSchemeSubCategory] = useState([]);
  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(50);
  let [totalCount, setTotalCount] = useState(0);
  let [schemeData, setSchemeData] = useState([]);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>();
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
  const [finalScheme, setFinalScheme] = useState<any>();
  const [finalLoading, setFinalLoading] = useState(false);
  let [search, setSearch] = useState("");
  let [payload, setPayload] = useState<any>(null);
  const [editSelectSchemeId, setEditSelectSchemeId] = useState<number | null>(
    null
  );
  const [isEdit, setIsEdit] = useState<any>(false);
  const [findRiskCatData, setFindRiskCatData] = useState<any>();
  const [findSchemeCatData, setFindSchemeCatData] = useState<any>();
  const [findSchemeSubCatData, setFindSchemeSubCatData] = useState<any>();

  const schemeModalRef = useRef<HTMLDialogElement>(null);

  const schemeOpenModal = () => {
    schemeModalRef.current?.showModal();
  };

  const schemeCloseModal = () => {
    schemeModalRef.current?.close();
  };

  useEffect(() => {
    getAllRiskCategory();
    getAllSchemeCategory();
  }, []);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    debounceTimer = setTimeout(async () => {
      if (schemeModalRef.current?.open === true) {
        handleShowScheme({ isAdd: true });
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [payload, page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: useMemo(() => {
      return {
        goal_name: editGoalItem ? editGoalItem.goal_name : "",
        risk_category_id: "",
        scheme_category_id: "",
        scheme_subCategory_id: "",
        weightage: "",
      };
    }, [editGoalItem]),
    // defaultValues: {
    //   goal_name: "",
    //   risk_category_id: "",
    //   scheme_category_id: "",
    //   scheme_subCategory_id: "",
    //   weightage: "",
    // },
  });

  useEffect(() => {
    if (editGoalItem) {
      setImageUrl(editGoalItem.goal_icon);
      getEditFilterObj();
    }
  }, [editGoalItem]);

  const getAllRiskCategory = async () => {
    try {
      let res: any = await api.get(`/risk-profile/get-allrisk-category`);
      setRiskCategory(res.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const getAllSchemeCategory = async () => {
    try {
      let res: any = await api.get(`/scheme/get-allscheme-category`);
      setSchemeCategory(res.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const getSchemeSubCategory = async (itemId: any) => {
    try {
      let catId: any = itemId;

      let res: any = await api.get(
        `/scheme/get-allscheme-subcategory/${catId}`
      );
      setSchemeSubCategory(res.data.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  const onChangeSearch = (event: any) => {
    if (event.target.value) {
      setSearch(event.target.value);
      const payloadObj = { ms_fullname: event.target.value };
      setPayload(payloadObj);
    } else {
      setPayload(null);
    }
  };

  const handleShowScheme = async (type: any) => {
    try {

      const risk_category_id = getValues("risk_category_id");
      const scheme_category_id = getValues("scheme_category_id");
      const scheme_subCategory_id = getValues("scheme_subCategory_id");
      const weightage = getValues("weightage");

      const findRiskCat: any = riskCategory.find(
        (item: any) => item.id === risk_category_id
      );
      setFindRiskCatData(findRiskCat);

      const findSchemeCat: any = schemeCategory.find(
        (item: any) => item.ID === scheme_category_id
      );
      setFindSchemeCatData(findSchemeCat);

      const findSchemeSubCat: any = schemeSubCategory.find(
        (item: any) => item.Id === scheme_subCategory_id
      );
      setFindSchemeSubCatData(findSchemeSubCat);


      if (
        !risk_category_id ||
        !scheme_category_id ||
        !scheme_subCategory_id ||
        !weightage
      ) {
        return toastAlert("error", "Please select all field");
      }

      if (finalScheme) {
        let checkSubCatData: any = checkSubCategoryWiseData(finalScheme);


        if (!checkSubCatData) {
          return toastAlert(
            "info",
            "The selected sub-category already exists in this risk category. Kindly select a different sub-category."
          );
        }
      }


      if (type.isAdd) {
        let checkData = checkWeightages(finalScheme);

        if (checkData === true) {
          return toastAlert(
            "info",
            "This risk category in already 100 weightages add, so other category select"
          );
        }
      }

      let data: any;

      if (payload) {
        data = {
          ...payload,
          category_id: [scheme_category_id],
          subcategory_id: [scheme_subCategory_id],
        };
      } else {
        data = {
          category_id: [scheme_category_id],
          subcategory_id: [scheme_subCategory_id],
        };
      }

      //   setPayload((prev: any) => ({
      //     ...prev,
      //     category_id: [scheme_category_id],
      //     subcategory_id: [scheme_subCategory_id],
      //   }));

      const param = {
        filters: data ? JSON.stringify(data) : false,
        limit: limit,
        sort: false,
        page: page,
      };

      if (data && scheme_category_id && scheme_subCategory_id) {
        const res = await api.get(`/fund-picker/getFundPickerData`, {
          params: param,
        });

        setSchemeData(res?.data?.data?.rows);
        setTotalCount(res?.data?.data?.count);
        schemeOpenModal();
      }
    } catch (error) {
      console.log(error, "errrrrrrrr")
      handleServerError(error);
    }
  };

  // const showArraow = (returnNumber: number, categoryNumber: number) => {
  //   let ratio: any =
  //     categoryNumber && categoryNumber > 0
  //       ? ((returnNumber - categoryNumber) / categoryNumber) * 100
  //       : returnNumber;
  //   ratio = ratio?.toFixed(2);
  //   if (ratio >= 10) {
  //     return "#056106";
  //   } else if (5 <= ratio || ratio >= 9.99) {
  //     return "#00ff00";
  //   } else if (0 <= ratio || ratio >= 4.99) {
  //     return "#ffff00";
  //   } else if (-5 <= ratio || ratio >= -0.99) {
  //     return "#f79b00";
  //   } else if (ratio < -5) {
  //     return "#ff0000";
  //   }
  // };

  const handleScheModalClose = () => {
    schemeCloseModal();
    setSelectedSchemeId(null);
    setPayload(null);
    setValue("risk_category_id", null);
    setValue("scheme_category_id", null);
    setValue("scheme_subCategory_id", null);
    setValue("weightage", null);
  };

  const handleCheckboxChange = (item: any) => {
    const risk_category_id = getValues("risk_category_id");

    const findRiskCat: any = riskCategory.find(
      (item: any) => item.id === risk_category_id
    );
    // Check if finalScheme[riskType] exists and has selectedSchemes
    const existingSchemes =
      finalScheme?.[findRiskCat.risk_type]?.selectedSchemes || [];

    // Check if selectedScheme ID already exists in this riskType
    const alreadySelected = existingSchemes.some(
      (scheme: any) => scheme.selectedScheme?.id === item.id
    );

    if (alreadySelected) {
      return toastAlert(
        "info",
        "This scheme is already selected under this risk category."
      );
    }

    // Not duplicate, so proceed with selection
    setSelectedSchemeId((prev) => (prev === item.id ? null : item.id));
    setSelectedScheme(item);

    // Optional: update finalScheme state here if needed
  };

  const handleProceedScheme = () => {
    try {
      setSchemeLoading(true);

      const risk_category_id = getValues("risk_category_id");
      const scheme_category_id = getValues("scheme_category_id");
      const scheme_subCategory_id = getValues("scheme_subCategory_id");
      const weightage = getValues("weightage");

      const findRiskCat: any = riskCategory.find(
        (item: any) => item.id === risk_category_id
      );
      const findSchemeCat: any = schemeCategory.find(
        (item: any) => item.ID === scheme_category_id
      );
      const findSchemeSubCat: any = schemeSubCategory.find(
        (item: any) => item.Id === scheme_subCategory_id
      );

      const riskLevelName = findRiskCat?.risk_type || "";

      if (!selectedScheme) {
        setSchemeLoading(false);
        return toastAlert("error", "Please select scheme");
      }

      const schemeEntry = {
        scheme_category: findSchemeCat,
        scheme_subCategory: findSchemeSubCat,
        weightage: weightage,
        selectedScheme: selectedScheme,
      };

      setFinalScheme((prev: any) => {
        const updated = { ...prev };

        if (!updated[riskLevelName]) {
          // First time adding this risk category
          updated[riskLevelName] = {
            risk_category: findRiskCat,
            selectedSchemes: [schemeEntry],
          };
        } else {
          // Risk level exists — check for existing scheme by ID
          const schemeIndex = updated[riskLevelName].selectedSchemes.findIndex(
            (item: any) => item.selectedScheme.id === editSelectSchemeId
          );

          if (schemeIndex !== -1) {
            // Update existing scheme
            updated[riskLevelName].selectedSchemes[schemeIndex] = schemeEntry;
          } else {
            //  Add new scheme
            updated[riskLevelName].selectedSchemes.push(schemeEntry);
          }
        }

        return updated;
      });

      // Reset form and states
      setSchemeLoading(false);
      setIsEdit(false);
      schemeCloseModal();
      setValue("risk_category_id", null);
      setValue("scheme_category_id", null);
      setValue("scheme_subCategory_id", null);
      setValue("weightage", null);
      setSelectedSchemeId(null);
    } catch (error) {
      setSchemeLoading(false);
      handleServerError(error);
    }
  };

  const checkWeightages = (finalobj: any) => {
    const riskCatId = Number(getValues("risk_category_id"));

    if (riskCatId) {
      let matched = false;

      for (const riskLevelName in finalobj) {
        const categoryData = finalobj[riskLevelName];

        if (Number(categoryData?.risk_category?.id) === riskCatId) {
          matched = true;

          const schemes = categoryData?.selectedSchemes || [];

          // if (!schemes.length) {
          //   toastAlert("error", `Please select at least one scheme for "${riskLevelName}"`);
          //   return false;
          // }

          const totalWeight = schemes.reduce((sum: number, item: any) => {
            const weight = parseFloat(item?.weightage);
            return sum + (isNaN(weight) ? 0 : weight);
          }, 0);

          if (totalWeight !== 100) {
            // toastAlert(
            //   "info",
            //   `Total weightage for risk category "${riskLevelName}" is ${totalWeight}, which must equal 100`
            // );
            return false;
          }

          break; // already checked matched one
        }
      }
      // If not matched, add the new risk category
      if (!matched) {
        // toastAlert("info", `New risk category "${foundRiskCat.risk_type}" added. Please add schemes.`);
        return false;
      }

      return true;
    } else {
      for (const riskCategory in finalobj) {
        const schemes = finalobj[riskCategory].selectedSchemes;

        if (!schemes.length) {
          return toastAlert("error", "Please select scheme");
        }

        const totalWeight = schemes.reduce((sum: any, item: any) => {
          return sum + parseFloat(item.weightage || 0);
        }, 0);

        if (totalWeight !== 100) {
          // let obj = {
          //   riskCategory: riskCategory,
          //   totalWeight: totalWeight,
          //   type: false
          // }
          toastAlert(
            "info",
            `Total weightage for risk category "${riskCategory}" is ${totalWeight}, which is not equal to 100`
          );
          return false;
        }
      }
      // If all categories are valid
      return true;
    }
  };

  const checkSubCategoryWiseData = (finalobj: any) => {
    const risk_category_id = getValues("risk_category_id");
    const scheme_subCategory_id = getValues("scheme_subCategory_id");


    // Step 1: Find correct risk category object
    const riskCategory: any = Object.values(finalobj)?.find(
      (r: any) => r.risk_category.id === risk_category_id
    );

    // Step 2: Check if subCategory already exists
    const isSubCategoryExist = riskCategory?.selectedSchemes.some(
      (scheme: any) => scheme.scheme_subCategory.Id === scheme_subCategory_id
    );

    // Step 3: If already exists, don't allow to add
    if (isSubCategoryExist) {
      console.log("❌ This scheme sub-category is already added.");
      return false
      // e.g., show error toast or return from function
    } else {
      console.log("✅ You can add this scheme.");
      return true
      // proceed to add
    }
  }

  const getEditFilterObj = () => {
    try {
      editGoalItem.GoalPlanAllocs.forEach((data: any) => {
        const riskLevelName = data?.RiskCategory.risk_type || "";

        const schemeEntry = {
          scheme_category: data.SchemeCategory,
          scheme_subCategory: data.SchemeSubcategory,
          weightage: data.weightage,
          selectedScheme: data.SchemeMaster,
        };

        // Update finalScheme structure
        setFinalScheme((prev: any) => {
          const updated = { ...prev };

          if (!updated[riskLevelName]) {
            updated[riskLevelName] = {
              risk_category: data.RiskCategory,
              selectedSchemes: [schemeEntry],
            };
          } else {
            // Prevent duplicate schemes (optional)
            const alreadyExists = updated[riskLevelName].selectedSchemes.some(
              (item: any) =>
                item.selectedScheme.id === schemeEntry.selectedScheme.id
            );

            if (!alreadyExists) {
              updated[riskLevelName].selectedSchemes.push(schemeEntry);
            }
          }

          return updated;
        });
      });
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleEditScheme = (allItem: any, selectedItem: any) => {
    try {
      setIsEdit(true);

      setEditSelectSchemeId(selectedItem.selectedScheme.id);

      setValue("risk_category_id", allItem.risk_category.id);

      allItem.selectedSchemes.forEach((data: any) => {
        if (selectedItem.selectedScheme.id === data.selectedScheme.id) {
          setValue("scheme_category_id", data.scheme_category.ID);
          setValue("scheme_subCategory_id", data.scheme_subCategory.Id);
          setValue("weightage", data.weightage);
          setSelectedSchemeId(data.selectedScheme.id);
          getSchemeSubCategory(data.scheme_category.ID);
        }
      });

      handleShowScheme({ isAdd: false });
    } catch (error) {
      handleServerError(error);
    }
  };

  const finalDataSave = async () => {
    try {
      setFinalLoading(true);

      console.log(finalScheme, "finalSchemefinalScheme")

      let GoalName = getValues("goal_name");

      if (!GoalName || !imageUrl) {
        setFinalLoading(false);
        return toastAlert("error", "Please add name and image");
      }

      if (!finalScheme) {
        setFinalLoading(false);
        return toastAlert("error", "Please add scheme");
      }


      let checkData = checkWeightages(finalScheme);

      if (checkData === false) {
        setFinalLoading(false);
        return;
      }

      if (GoalName === 'Custom') {

        const presentCategories = riskCategory.map((item: any) => item.risk_type);

        const missingCategories = presentCategories.filter(
          (category: any) => !finalScheme.hasOwnProperty(category)
        );

        if (missingCategories.length > 0) {
          setFinalLoading(false);
          return toastAlert("info", `Please add the following risk categories: ${missingCategories.join(", ")}`)
        }
      }

      const schemeArr = Object.entries(finalScheme).map(
        ([riskType, data]: any) => ({
          riskCategoryId: data.risk_category.id,
          selectedScheme: data.selectedSchemes.map((scheme: any) => ({
            schemeCategoryId: scheme.scheme_category.ID,
            schemeSubCategoryId: scheme.scheme_subCategory.Id,
            schemeId: scheme.selectedScheme.id,
            weightage: scheme.weightage,
          })),
        })
      );

      const payload = {
        goal_name: GoalName,
        image: imageUrl,
        schemeArr,
      };

      // setFinalLoading(false);
      // return
      if (editGoalItem) {
        let res: any = await api.put(
          `/goal-plan/updateGoalPlan/${editGoalItem.id}`,
          payload
        );

        if (res.data.data) {
          setFinalLoading(false);
          toastAlert("success", "Data update successfully");
          toggleForm("list");
          getGoalsTypes();
        }
      } else {
        let res: any = await api.post(
          `/goal-plan/addGoalPlanAllocData`,
          payload
        );

        if (res.data.data) {
          setFinalLoading(false);
          toastAlert("success", "Data add successfully");
          toggleForm("list");
          getGoalsTypes();
        }
      }
    } catch (error) {
      setFinalLoading(false);
      handleServerError(error);
    }
  };

  const onChaneDeleteScheme = (item: any, catType: any) => {
    try {
      const schemeIdToRemove = item?.selectedScheme?.id;
      setFinalScheme((prevState: any) => {
        // Clone the previous state
        const updatedCategory = { ...prevState[catType] };

        // Filter out the scheme to be deleted
        updatedCategory.selectedSchemes =
          updatedCategory.selectedSchemes.filter(
            (scheme: any) => scheme.selectedScheme?.id !== schemeIdToRemove
          );

        if (updatedCategory.selectedSchemes.length === 0) {
          const newState = { ...prevState };
          delete newState[catType];
          return newState;
        }

        // Return updated state
        return {
          ...prevState,
          [catType]: updatedCategory,
        };
      });
    } catch (error) {
      handleServerError(error);
    }
  };

  const goToList = () => {
    toggleForm("list");
    setEditGoalItem(null);
    getGoalsTypes();
    setValue("goal_name", null);
    setImageUrl("");
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setValue("risk_category_id", null);
    setValue("scheme_category_id", null);
    setValue("scheme_subCategory_id", null);
    setValue("weightage", null);
  }

  const riskCategoryId = watch("risk_category_id");
  const schemeCategoryId = watch("scheme_category_id");
  const schemeSubCategoryId = watch("scheme_subCategory_id");

  return (
    <>
      {/* <div className="py-2 px-4"> */}
      <div className="pageTitle">
        <CustomText className="font-medium text-2xl ">
          {pageTitle} Goal
        </CustomText>
        {/* <CustomButton>New</CustomButton> */}
      </div>
      {/* </div> */}
      <div className="p-3">
        <form className="sm:flex h-full min-h-[calc(100vh-300px)]">
          <div className="sm:w-1/4 px-4">
            <div>
              <CustomInput
                label="Name"
                required
                placeholder="Enter Name"
                {...register("goal_name")}
                error={errors?.goal_name?.message}
                disabled={isEdit || (watch("goal_name") === "Custom") ? true : false}
              />
            </div>
            <div className="my-4 ">
              <div className="mt-3">
                <Uploader
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  folder="goalplanning"
                  size={max1MBSizeInBytes}
                />
              </div>
            </div>
          </div>
          <div className="border-r border-accent h-auto mx-2" />

          <div className="sm:w-3/4 px-2">
            <div className="sm:flex gap-3 sticky z-10">
              <div className="sm:w-3/12">
                <CustomReactSelect
                  items={riskCategory}
                  required
                  label="Risk Category"
                  placeholder="Select Risk Category"
                  bindName="risk_type"
                  bindValue="id"
                  // value={getValues("risk_category_id")}
                  value={riskCategoryId}
                  {...register("risk_category_id")}
                  onChange={(e: any) => {
                    setValue("risk_category_id", e.id, {
                      shouldValidate: true,
                    });
                    setValue("scheme_category_id", null);
                    setValue("scheme_subCategory_id", null);
                    setValue("weightage", null);
                  }}
                  disabled={isEdit}
                  error={errors?.risk_category_id?.message}
                />
              </div>
              <div className="sm:w-3/12">
                <CustomReactSelect
                  items={schemeCategory}
                  required
                  label="Category"
                  placeholder="Select Fund Category"
                  bindName="Name"
                  bindValue="ID"
                  // value={getValues("scheme_category_id")}
                  value={schemeCategoryId}
                  {...register("scheme_category_id")}
                  onChange={(e: any) => {
                    setValue("scheme_category_id", e.ID, {
                      shouldValidate: true,
                    });
                    getSchemeSubCategory(e.ID);
                  }}
                  disabled={isEdit}
                  error={errors?.scheme_category_id?.message}
                />
              </div>
              <div className="sm:w-3/12">
                <CustomReactSelect
                  items={schemeSubCategory}
                  required
                  label="Subcategory"
                  placeholder="Select Scheme SubCategory"
                  bindName="Name"
                  bindValue="Id"
                  // value={getValues("scheme_subCategory_id")}
                  value={schemeSubCategoryId}
                  {...register("scheme_subCategory_id")}
                  onChange={(e: any) => {
                    setValue("scheme_subCategory_id", e.Id, {
                      shouldValidate: true,
                    });
                  }}
                  disabled={isEdit}
                  error={errors?.scheme_subCategory_id?.message}
                />
              </div>
              <div className="sm:w-2/12">
                <CustomInputIcon
                  required
                  label="Weightage"
                  placeholder="Enter Weightage"
                  icon={<AiOutlinePercentage />}
                  iconPosition="right"
                  {...register("weightage")}
                  disabled={isEdit}
                  error={errors.weightage?.message}
                />
              </div>
              <div className="sm:mt-8 sm:w-1/12">
                {isEdit ? (
                  <CustomButton
                    className="bg-white !text-black !border !border-gray-300 w-full"
                    type="button"
                    onClick={(e: any) => handleCancelEdit()}
                  >
                    Cancel
                  </CustomButton>
                ) : (
                  <CustomButton
                    className="w-full"
                    type="button"
                    onClick={(e: any) => { handleShowScheme({ isAdd: true }) }}
                  >
                    Show
                  </CustomButton>
                )}

              </div>
            </div>
            <div className="border-b border-accent my-2"></div>
            <div className="overflow-auto max-h-[calc(100vh-390px)]">
              <table className="table w-full table-pin-rows">
                <thead className="thead">
                  <tr className="border-b border-accent">
                    <th className="p-1 text-left">Scheme</th>
                    <th className="p-1 text-center">Weightage</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {finalScheme &&
                    Object.entries(finalScheme).map(
                      ([riskLabel, schemeItem]: [string, any], index) => {
                        return (
                          <Fragment key={index}>
                            <tr className="bg-[#F4F6F8]">
                              <td
                                colSpan={3}
                                className="font-semibold text-gray-700"
                              >
                                {riskLabel}
                              </td>
                            </tr>
                            {/* @ts-ignore */}
                            {schemeItem.selectedSchemes.map(
                              (item: any, subIndex: number) => {
                                return (
                                  <tr
                                    className="border-b border-accent"
                                    key={subIndex}
                                  >
                                    <td className="items-start p-1">
                                      <div className="flex items-center gap-5">
                                        <img
                                          // src="/Kotak.png"
                                          src={`${NODE_API_URL}/static/amc_logo/${item.selectedScheme?.AMCMaster?.amc_logo}`}
                                          className="w-10 h-10 min-w-10 min-h-10 rounded-full object-contain"
                                          alt="logo"
                                        />
                                        <div>
                                          <div className="font-medium">
                                            {item.selectedScheme.ms_fullname}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {item.scheme_category.Name} -{" "}
                                            {item.scheme_subCategory.Name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-center font-medium">
                                      {item?.weightage} %
                                    </td>
                                    <td className="flex gap-3 justify-center mt-2">
                                      <div
                                        className="text-blue-400 cursor-pointer"
                                        onClick={() =>
                                          handleEditScheme(schemeItem, item)
                                        }
                                      >
                                        Edit
                                      </div>
                                      <div
                                        onClick={() =>
                                          onChaneDeleteScheme(item, riskLabel)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <RiDeleteBin6Line
                                          size={20}
                                          className="text-primary"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </Fragment>
                        );
                      }
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
        <dialog id="my_modal" className="modal" ref={schemeModalRef}>
          <div className="modal-box w-screen md:h-auto max-w-6xl p-0">
            <form method="dialog" className="flex justify-between items-center p-2 sm:p-5">
              <h3 className="text-lg font-montserrat font-medium">
                Scheme List
              </h3>
              <button
                className="btn btn-md btn-circle btn-ghost text-end"
                onClick={() => {
                  setIsEdit(false);
                  handleScheModalClose();
                }}
              >
                <MdClose size={25} />
              </button>
            </form>
            {/* <div></div> */}
            <div className="border-b border-accent mt-0"></div>
            <div className="mt-0 p-0">
              <div className="sm:flex justify-between gap-2 p-5">
                <div>
                  <label className="input rounded-lg">
                    <CiSearch className="h-[1em] opacity-50" size={25} />
                    <input
                      type="search"
                      className="grow"
                      placeholder="Search"
                      onChange={(e) => onChangeSearch(e)}
                    />
                  </label>
                </div>
                <div className="flex gap-6 mt-2 sm:mt-0">
                  <div>
                    <CustomText className="text-base-content text-xs">Risk Category</CustomText>
                    <CustomText className="text-sm">{findRiskCatData?.risk_type}</CustomText>
                  </div>
                  <div>
                    <CustomText className="text-base-content text-xs">Fund Category</CustomText>
                    <CustomText className="text-sm">{findSchemeCatData?.Name}</CustomText>
                  </div>
                  <div>
                    <CustomText className="text-base-content text-xs">Subcategory</CustomText>
                    <CustomText className="text-sm">{findSchemeSubCatData?.Name}</CustomText>
                  </div>
                  <div className=" bg-[#F9F9F9] rounded-sm p-2 -mt-2">
                    <CustomText className="text-base-content text-xs">Weightage</CustomText>
                    <CustomText className="text-sm">{getValues("weightage")}%</CustomText>
                  </div>
                </div>
              </div>

              <div className="border-b border-accent mt-0"></div>
              <div className="relative max-h-[calc(100vh-400px)] sm:max-h-[55vh] overflow-y-auto">
                <table className="table w-full table-pin-rows">
                  <thead className="thead">
                    <tr className="border-b border-accent">
                      <th className="p-2 text-left min-w-3xs">Scheme</th>
                      <th className="p-2 text-center">Rating</th>
                      <th className="p-2 text-end">AUM (Cr.)</th>
                      <th className="p-2 text-end">Exp. Ratio</th>
                      <th className="p-2 text-center">Return 1y</th>
                      <th className="p-2 text-center">Return 3y</th>
                      <th className="p-2 text-center">Return 5y</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {schemeData.length > 0 ? (
                      schemeData.map((item: any, index: number) => {
                        console.log(item,"???????????????????")
                        return (
                          <Fragment key={index}>
                            <tr className="border-b border-accent">
                              <td className="p-1 py-2">
                                <div className="flex items-center gap-3">
                                  <CustomCheckbox
                                    className="checkbox checkbox-sm"
                                    checked={selectedSchemeId === item.id}
                                    onChange={() => handleCheckboxChange(item)}
                                  />
                                  <img
                                    // src={`${publicPathName}/Kotak.png`}
                                    src={`${NODE_API_URL}/static/amc_logo/${item.AMCMaster?.amc_logo}`}
                                    className="w-10 h-10 min-w-10 min-h-10 object-contain"
                                    alt="logo"
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {item.ms_fullname}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {item.SchemeCategory.Name} -{" "}
                                      {item.SchemeSubcategory.Name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="flex justify-center items-center gap-1 text-yellow-500">
                                  {item?.SchemePerformances[0]
                                    ?.OverallRating ? (
                                    <>
                                      {
                                        item?.SchemePerformances[0]
                                          ?.OverallRating
                                      }
                                      <FaStar className="text-orange-300 text-lg" />
                                    </>
                                  ) : (
                                    "--"
                                  )}
                                </div>
                              </td>
                              <td className="text-end">
                                {convertToCrores(
                                  item?.SchemePerformances[0]?.AUM
                                )}
                              </td>
                              <td className="text-end">25</td>
                              <td className="mt-3 text-center">
                                <div className="flex justify-center items-center gap-2">
                                  {/* {toFixedDataForReturn(
                                    item?.SchemePerformances[0]?.Return1yr
                                  ) != "--" ? (
                                    <>
                                      <FaArrowAltCircleUp
                                        color={showArraow(
                                          item?.SchemePerformances[0]
                                            ?.Return1yr,
                                          item?.SchemePerformances[0]
                                            ?.CategoryAvgReturn1yr
                                        )}
                                      />
                                    </>
                                  ) : null} */}
                                  {toFixedDataForReturn(
                                    item?.SchemePerformances[0]?.Return1yr
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="flex justify-center items-center gap-2">
                                  {/* {toFixedDataForReturn(
                                    item?.SchemePerformances[0]?.Returns3yr
                                  ) != "--" ? (
                                    <>
                                      <FaArrowAltCircleUp
                                        color={showArraow(
                                          item?.SchemePerformances[0]
                                            ?.Returns3yr,
                                          item?.SchemePerformances[0]
                                            ?.CategoryAvgReturns3yr
                                        )}
                                      />
                                    </>
                                  ) : null} */}
                                  {toFixedDataForReturn(
                                    item?.SchemePerformances[0]?.Returns3yr
                                  )}
                                </div>{" "}
                              </td>
                              <td className="text-center">
                                <div>
                                  <div className="flex justify-center items-center gap-2 mx-auto">
                                    {/* {toFixedDataForReturn(
                                      item?.SchemePerformances[0]?.Returns5yr
                                    ) != "--" ? (
                                      <>
                                        <FaArrowAltCircleUp
                                          color={showArraow(
                                            item?.SchemePerformances[0]
                                              ?.Returns5yr,
                                            item?.SchemePerformances[0]
                                              ?.CategoryAvgReturns5yr
                                          )}
                                        />
                                      </>
                                    ) : null} */}
                                    {toFixedDataForReturn(
                                      item?.SchemePerformances[0]?.Returns5yr
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          <div className="mt-16 text-center">
                            No data found!
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-0">
              <Pagination
                totalCount={totalCount}
                limit={limit}
                page={page}
                onPageChange={onPageChange}
              />
            </div>
            <div className="border-b border-accent mt-0"></div>
            <div className="flex gap-5 justify-center text-center p-5">
              <div className="mt-0 text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-24 shadow-none"
                  onClick={() => {
                    setIsEdit(false);
                    handleScheModalClose();
                  }}
                >
                  Cancel
                </CustomButton>
              </div>
              <div className="mt-0 text-center">
                <CustomButton
                  className="w-24"
                  loading={schemeLoading}
                  onClick={handleProceedScheme}
                >
                  Proceed
                </CustomButton>
              </div>
            </div>
          </div>
        </dialog>
      </div>
      <div className="border-b border-accent"></div>
      <div className="flex justify-between p-2 px-5">
        <div className="mt-4 text-center">
          <CustomButton className="w-36" onClick={goToList}>
            Back
          </CustomButton>
        </div>
        <div
          className="mt-4 text-center"
        //   onClick={handleProceedGoal}
        >
          <CustomButton
            className="w-36"
            type="submit"
            loading={finalLoading}
            onClick={finalDataSave}
          >
            Save
          </CustomButton>
        </div>
      </div>
    </>
  );
}

export default GoalPlanForm;
