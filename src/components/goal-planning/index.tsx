"use client";

import api from "@/utils/api";
import {
  DEFAULT_INFLATION_RATE,
  INFLATION_RATE,
  MONTHS_IN_A_YEAR,
  NODE_API_URL,
  convertToCrores,
  formatNumber,
  publicPathName,
  showArraow,
  toFixedDataForReturn,
} from "@/utils/constants";
import { handleServerError, toastAlert } from "@/utils/helpers";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useSyncGoalPlanning from "./(components)/useSyncGoalPlanning";
import CustomInput from "@/commonUI/Input";
import CustomInputIcon from "@/commonUI/InputWithIcon";
import CustomLabel from "@/commonUI/Label";
import CustomCheckbox from "@/commonUI/CheckBox";
import CustomButton from "@/commonUI/Button";
import CustomSelect from "@/commonUI/Select";
import { MdClose, MdError } from "react-icons/md";
import CustomText from "@/commonUI/Text";
import ReactECharts from "echarts-for-react";
import { useRouter } from "next/navigation";
import { FaArrowAltCircleUp, FaRegCircle, FaStar } from "react-icons/fa";
import CustomLoading from "@/commonUI/Loading";
import PurchaseDetailPopup from "./(modals)/purchase-detail";
import SipPopup from "./(modals)/sip-detail";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { IoMdArrowRoundBack } from "react-icons/io";

function GoalPlanning() {
  const router = useRouter();

  const tabs = ["New Goal", "Ongoing Goal", "Completed Goal"];
  const addNewGoalModalRef = useRef<HTMLDialogElement>(null);
  const MFAllocationModalRef = useRef<HTMLDialogElement>(null);
  const suggestedSchemeModalRef = useRef<HTMLDialogElement>(null);
  const riskAlertModalRef = useRef<HTMLDialogElement>(null);
  const schemeModalRef = useRef<HTMLDialogElement>(null);
  const deleteGoalPlanModalRef = useRef<HTMLDialogElement>(null);

  const newGoalOpenModal = () => {
    addNewGoalModalRef.current?.showModal();
  };

  const newGoalCloseModal = () => {
    addNewGoalModalRef.current?.close();
  };

  const MFAllcationOpenModal = () => {
    MFAllocationModalRef.current?.showModal();
  };

  const MFAllcationCloseModal = () => {
    MFAllocationModalRef.current?.close();
  };

  const suggestedSchemeOpenModal = () => {
    suggestedSchemeModalRef.current?.showModal();
  };

  const suggestedSchemeCloseModal = () => {
    suggestedSchemeModalRef.current?.close();
  };

  const riskAlertOpenModal = () => {
    riskAlertModalRef.current?.showModal();
  };

  const riskAlertCloseModal = () => {
    riskAlertModalRef.current?.close();
  };

  const schemeOpenModal = () => {
    schemeModalRef.current?.showModal();
  };

  const schemeCloseModal = () => {
    schemeModalRef.current?.close();
  };

  const deleteGoalPlanOpenModal = () => {
    deleteGoalPlanModalRef.current?.showModal();
  };

  const deleteGoalPlanCloseModal = () => {
    deleteGoalPlanModalRef.current?.close();
  };

  const [monthsDropdown] = useState([
    { id: 1, durationType: "Months" },
    { id: 2, durationType: "Years" },
  ]);

  const [calculationLoading, setCalculationLoading] = useState(false);
  const [goalTypes, setGoalTypes] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [GoalType, setGoalType] = useState<any>({});
  const [rangeInflation, setRangeInflation] = useState<any>(6);
  const [inflationPercentage, setInflationPercentage] =
    useState<boolean>(false);
  const [duration, setDuration] = useState<any>();
  const [allocationMfRisk, setAllocationMfRisk] = useState([]);
  const [allocationData, setAllocationData] = useState<any>([]);
  const [suggestedCategoryList, setSuggestedCategoryList] = useState<any>([]);
  const [selectedSuggestedScheme, setselectedSuggestedScheme] = useState<any>(
    {}
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSipModal, setShowSipModal] = useState(false);
  const [exchangeSchemeIndex, setExchangeSchemeIndex] = useState<any>({});
  const [saveGoalLoading, setSaveGoalLoading] = useState(false);
  const [topping, setTopping] = useState("Lumpsum");
  const [targetMonth, setTargetMonth] = useState<any>("");
  const [targetSpanType, setTargetSpanType] = useState("Month");
  const [monthDiffrence, setMonthDiffrence] = useState<any>("");
  const [isMobileView, setIsMobileView] = useState<any>(false);
  const [ongoingGoalList, setOngoingGoalList] = useState([]);
  const [completedGoalList, setCompletedGoalList] = useState([]);
  const [goalForm, setGoalForm] = useState<any>({
    goal_plan_id: 0,
    goal_type_id: 0,
    goal_label: "",
    target_amt: "",
    calc_amt: 0,
    lumpsum_amt: 0,
    duration_mts: 0,
    risk_category_id: 1,
    sip_amt: 0,
    sip_duration_mts: 0,
    err_perc: 0,
    inflation_perc: DEFAULT_INFLATION_RATE,
    existing_fund: 0,
    lumpsum_current_amt: 0,
  });
  let [perfomanceRating, setPerfomanceRating] = useState([6, 9]);
  const [editForm, setEditForm] = useState<any>(false);
  const [anyChanges, setAnyChanges] = useState<any>(false);
  const [editGoalData, setEditGoalData] = useState<any>();
  const [goalPlanId, setGoalPlanId] = useState(0);
  const [deleteGoalLoader, setDeleteGoalLoader] = useState<any>(false);


  const goalSchema = Yup.object().shape({
    goal_label: Yup.string().required("Title is required"),
    // target_amt: Yup.string().required("Target amount is required"),
    target_amt: Yup.string()
      .required("Target amount is required")
      .test(
        "is-minimum",
        "Amount must be at least 10,000",
        (value) => Number(value) >= 10000
      ),
    inflation_perc: inflationPercentage
      ? Yup.string().required("Inflation percentage is required")
      : Yup.string().optional().nullable(),
    // duration_mts:  Yup.string().required("Duration is required"),
    duration_mts: Yup.string()
      .required("Target is required")
      .when("durationType", (value: any, schema: Yup.StringSchema) => {
        const durationType = Array.isArray(value) ? value[0] : value;

        if (durationType === "Months") {
          return schema
            .test(
              "is-min-6-months",
              "Target at least 6 Months",
              (val) => Number(val) >= 6
            )
            .test(
              "is-max-360-months",
              "Target in months must not exceed 30 years",
              (val) => Number(val) <= 360
            );
        } else if (durationType === "Years") {
          return schema
            .test(
              "is-max-30-years",
              "Target must be up to 30 years",
              (val) => Number(val) <= 30
            )
            .test(
              "is-min-1-years",
              "Target should at least be 1 year",
              (val) => Number(val) > 0
            );
        }
        return schema;
      }),
    // existing_fund: existingFunds
    //   ? Yup.string().required("Existing fund is required")
    //   : Yup.string().optional().nullable(),
  });

  const defaultValues = {
    goal_label: "",
    target_amt: "",
    inflation_perc: DEFAULT_INFLATION_RATE,
    duration_mts: "",
    risk_category: "",
    existing_fund: "",
    durationType: "Months",
    risk_category_id: "",
    risk: "",
    execution_later: false,
    err_perc: "",
    goal_plan_id: "",
    goal_type_id: "",
    err_per: "",
  };

  useEffect(() => {
    checkRiskProfile();
    getGoalsTypes();
    getGoalsList();
  }, []);

  useEffect(() => {
    if (targetSpanType == "Month") {
      setMonthDiffrence(targetMonth);
    } else {
      setMonthDiffrence(targetMonth * 12);
    }
  }, [targetMonth, targetSpanType]);

  const checkRiskProfile = async () => {
    let profileList = await api.get(`/risk-profile/get-risk-profile-investor`);

    if (!profileList?.data?.data) {
      riskAlertOpenModal();
    }
  };

  const handleRiskModel = () => {
    router.push("/risk-profile");
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    resetField,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues,
    // @ts-ignore
    resolver: yupResolver(goalSchema),
  });
  //Custom hook created
  const {
    riskListData,
    firstModal,
    secondModal,
    setFirstModal,
    setSecondModal,
    handleCalculations,
    schemeData,
    allocation,
    setAllocation,
    ...rest
  } = useSyncGoalPlanning({
    setValue,
    watch,
    setCalculationLoading,
    inflationPercentage,
    rangeInflation,
    editForm,
    setEditForm,
    GoalType,
  });

  useEffect(() => {
    // if (window.matchMedia("(max-width: 600px)").matches) {
    //   console.log("Mobile view (via media query)");
    //   setIsMobileView(true);
    // } else {
    //   setIsMobileView(false);
    //   console.log("Desktop view");
    // }

    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // or 640
    };

    handleResize(); // set on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (watch("duration_mts") && watch("risk") === "recommended" && !editForm) {
      setValue("risk_category_id", riskListData?.id);
      setValue("risk_category", riskListData?.risk_type);
    }
  }, [riskListData?.id]);

  useEffect(() => {
    if (editForm && addNewGoalModalRef.current?.open) {
      const goalLabel = watch("goal_label");
      const targetAmt = watch("target_amt");
      const durationMts = watch("duration_mts");
      const durationType = watch("durationType");
      // const inflation_perc = watch("inflation_perc");

      const isAnyChanged =
        goalLabel !== editGoalData?.goal_label ||
        targetAmt !== editGoalData?.target_amt ||
        durationMts !== editGoalData?.duration_mts ||
        durationType !== "Months";
      //  ||
      // inflationPercentage !== !!editGoalData?.inflation_perc ||
      // parseFloat(rangeInflation) !== parseFloat(editGoalData?.inflation_perc ?? 0);
      setAnyChanges(isAnyChanged);
    }
  }, [
    editForm,
    watch("goal_label"),
    watch("target_amt"),
    watch("duration_mts"),
    watch("durationType"),
    // watch("inflation_perc"),
    // inflationPercentage,
    // rangeInflation, // <-- IMPORTANT!
    addNewGoalModalRef.current?.open,
  ]);

  //get all goal types

  const getGoalsTypes = async () => {
    try {
      let goalTypes = await api.get(`/goal-plan/getAllGoalType`);

      console.log(goalTypes, "goalTypesgoalTypes");
      setGoalTypes(goalTypes?.data?.data);
    } catch (error) {
      handleServerError(error);
    }
  };

  //get goals list by user id
  const getGoalsList = async () => {
    const goalList = await api.get(`goal-plan/getAllGoalPalnList`);
    setOngoingGoalList(goalList?.data?.data?.onGoingGoalDetails);
    setCompletedGoalList(goalList?.data?.data?.completedGoalDetails);
  };

  //// new goal
  const handleNewGoal = (type: any) => {
    reset();
    setRangeInflation(INFLATION_RATE);
    setInflationPercentage(false);
    setValue("risk", "risk");
    setValue("risk_category", riskListData?.risk_type);
    setValue("risk_category_id", riskListData?.id);
    setValue("goal_label", type.goal_name);
    newGoalOpenModal();
    setFirstModal(true);
    setGoalType(type);
  };

  const handleBackModal = () => {
    setSecondModal(false);
  };

  const handleCloseFirstModal = () => {
    setFirstModal(false);
    setSecondModal(false);
    newGoalCloseModal();
    setCalculationLoading(false);
    setEditForm(false);
  };

  const handleProceedGoal = async () => {
    try {
      const allocateChart = allocation
        ?.filter((item: any) => Number(item?.weightage) > 0)
        ?.map((item: any) => ({
          value: formatNumber(Number(item?.weightage)),
          name: `${item.categoryName} - ${item?.Name}`,
        }));
      // allocation,setAllocation
      setAllocationData(allocateChart);

      let RiskMapArray: any = [["Task", "Hours per Day"]];

      for (let mapping of allocateChart) {
        let allocation = [
          `${mapping.categoryName} - ${mapping?.Name}`,
          mapping?.weightage,
        ];
        RiskMapArray.push(allocation);
      }

      setAllocationMfRisk(RiskMapArray);

      setFirstModal(false);
      setSecondModal(false);
      newGoalCloseModal();
      MFAllcationOpenModal();
    } catch (error) {
      handleServerError(error);
    }
  };

  const option = {
    color: ["#FF7F0E", "#17BECF", "#1F77B4"], // Orange, Teal, Blue
    tooltip: {
      trigger: "item",
      formatter: "{b} - {d}%", // Example: Solutions - 40%
      align: "left",
    },
    legend: {
      // type: 'scroll',
      // orient: 'vertical',
      // right: 10,
      // top: 20,
      // bottom: 20,
      // textStyle: {
      //   color: '#000', // Black legend text
      // },
      orient: isMobileView ? "horizontal" : "vertical",
      bottom: isMobileView ? "bottom" : "0%",
      left: "center",
      formatter: function (name: any) {
        const item = allocationData.find((d: any) => d.name === name);
        return `${name}    ${item?.value}%`;
      },
      textStyle: {
        fontFamily: "montserrat",
        fontSize: 12,
        color: "#000",
        overflow: "break", // or 'breakAll' or 'truncate' if needed
        rich: {
          // optional: customize rich text if needed
        },
      },
      itemWidth: 12,
      itemHeight: 12,
      itemStyle: {
        borderRadius: 6,
      },
      // icon: "circle",
      icon: "path://M256,128A128,128,0,1,0,384,256,128,128,0,0,0,256,128Zm0,224a96,96,0,1,1,96-96A96,96,0,0,1,256,352Z",
      itemGap: 20, // more space between items
      padding: [10, 10, 10, 10],
    },
    series: [
      {
        name: "Allocation",
        type: "pie",
        top: isMobileView ? "0%" : "-40%",
        radius: ["40%", "60%"], // Doughnut shape
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        selectedMode: "single",
        data: allocationData,
        label: {
          show: false, // don't show on slices
          position: "",
        },
        // emphasis: {
        //   label: {
        //     show: false,
        //     fontSize: 14,
        //     fontWeight: 'bold',
        //     formatter: '{b} - {d}%'
        //   }
        // },
        labelLine: {
          show: false,
        },
      },
    ],
  };

  const handleChangeScheme = async (item: any, index: number) => {
    try {
      let payload = {
        subcategory_id: item?.scheme_subcate_id,
        currentSchemeId: item?.id,
        sip_amount: item?.sip_amount,
        lumpsum_amount: item?.lumpsum_amount,
        weightage: item?.weightage,
      };

      setExchangeSchemeIndex({ ...exchangeSchemeIndex, index });

      let res: any = await api.post(
        `/goal-plan/suggested-subcategory-schemes`,
        payload
      );

      if (res.data.data) {
        setSuggestedCategoryList(res.data.data);
      }

      schemeOpenModal();
      MFAllcationCloseModal();
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleBackSchemeModel = () => {
    MFAllcationOpenModal();
    schemeCloseModal();
  };

  const selectexchangeSubCategory = (payload: any, index: number) => {
    if (selectedSuggestedScheme.index == index) {
      setselectedSuggestedScheme({});
    } else {
      // setselectedSuggestedScheme({ payload, index })
      setselectedSuggestedScheme(
        (prev: any) =>
          prev.id === payload.id
            ? { id: null, payload: null, index: null } // unselect
            : { id: payload.id, payload, index } // select new
      );
    }
  };

  const exchangeSubCategory = (payload: any, index: number) => {
    schemeData[index].SchemeMaster = payload;
    schemeData[index].scheme_id = payload.id;

    rest.setSchemeData(schemeData);

    schemeCloseModal();
    MFAllcationOpenModal();
    setselectedSuggestedScheme({});
  };

  const handleBackMFAllocation = () => {
    setFirstModal(true);
    setSecondModal(true);
    newGoalOpenModal();
    MFAllcationCloseModal();
  };

  const handleMFAllocation = () => {
    suggestedSchemeCloseModal();
    MFAllcationCloseModal();
    setSaveGoalLoading(false);
    setEditForm(false);
  };


  const handleSaveGoalData = async () => {
    try {

      const scheme = schemeData.map((item: any) => {
        return {
          investment_type:
            rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip",
          scheme_id: item?.scheme_id,
          sip_amount:
            rest?.sipLumpSelected === "lumpsum" ? 0 : item?.sip_amount,
          sip_duration:
            rest?.sipLumpSelected === "lumpsum"
              ? 0
              : watch("durationType") === "Months"
                ? Number(watch("duration_mts"))
                : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
          sip_frequency: 2,
          lumpsum_amount:
            rest?.sipLumpSelected === "lumpsum" ? item?.lumpsum_amount : 0,
          lumpsum_duration:
            rest?.sipLumpSelected === "lumpsum"
              ? watch("durationType") === "Months"
                ? Number(watch("duration_mts"))
                : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
              : 0,
          // bse_order_id: "random",
          scheme_name: item?.SchemeMaster?.ms_fullname,
          scheme_isin: item?.SchemeMaster?.schemeISIN,
        };
      });

      let payload: any = {
        goal_type_id: GoalType?.id,
        goal_label: watch("goal_label"),
        risk_category_id: watch("risk_category_id"),
        target_amt: Number(watch("target_amt")),
        err_perc: Number(watch("err_perc")),
        lumpsum_amt: rest?.sipLumpSelected === "lumpsum" ? rest?.lumpsumAmt : 0,
        sip_amt: rest?.sipLumpSelected === "lumpsum" ? 0 : rest?.sipAmt,
        calc_amt: rest?.sipProjectedAmt
          ? rest?.sipProjectedAmt
          : rest?.lumpProjectedAmt,
        duration_mts:
          rest?.sipLumpSelected === "lumpsum"
            ? watch("durationType") === "Months"
              ? Number(watch("duration_mts"))
              : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
            : 0,
        sip_duration_mts:
          rest?.sipLumpSelected === "lumpsum"
            ? 0
            : watch("durationType") === "Months"
              ? Number(watch("duration_mts"))
              : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
        inflation_perc:
          inflationPercentage === true
            ? rangeInflation
            : DEFAULT_INFLATION_RATE,
        lumpsum_current_amt: Number(rest?.lumpProjectedAmt),
        goal_exec_date: null,
        investment_type:
          rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip", //
        suggested_scheme: scheme,
      };

      let res: any = await api.post(`/goal-plan/addGoalPlanData`, payload);

      if (res.data.data) {
        let goalData: any = res.data.data;
        let allocationList = allocation?.map((allocation: any) => {
          return {
            goal_plan_id: goalData?.plans?.id,
            risk_category_id: Number(watch("risk_category_id")),
            scheme_cate_id: Number(allocation?.scheme_cate_id),
            scheme_subcate_id: Number(allocation?.Id),
            weightage: Number(allocation?.weightage),
            scheme_id: allocation?.scheme_id,
          };
        });

        //add mf allocation
        await api.post("/goal-plan/add-user-alloc", {
          allocationList,
          goal_plan_id: goalData?.plans?.id,
        });

        // setSaveGoalLoading(false);
        // MFAllcationCloseModal();
        // setTopping("Lumpsum");
        // newGoalCloseModal();
        // setTargetMonth("");
        // toastAlert("success", "Goal Planning Added");

        let payload = { ...goalData, schemeFullArray: scheme, schemeData: schemeData };

        return payload;

        // showToast("success", "Goal Planning Added");
      } else {
        return res.data.msg
      }



    } catch (error) {
      handleServerError(error);
    }
  }

  const handleCreateGoal = async () => {
    try {
      setSaveGoalLoading(true);

      // const scheme = schemeData.map((item: any) => {
      //   return {
      //     investment_type:
      //       rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip",
      //     scheme_id: item?.scheme_id,
      //     sip_amount:
      //       rest?.sipLumpSelected === "lumpsum" ? 0 : item?.sip_amount,
      //     sip_duration:
      //       rest?.sipLumpSelected === "lumpsum"
      //         ? 0
      //         : watch("durationType") === "Months"
      //           ? Number(watch("duration_mts"))
      //           : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
      //     sip_frequency: 2,
      //     lumpsum_amount:
      //       rest?.sipLumpSelected === "lumpsum" ? item?.lumpsum_amount : 0,
      //     lumpsum_duration:
      //       rest?.sipLumpSelected === "lumpsum"
      //         ? watch("durationType") === "Months"
      //           ? Number(watch("duration_mts"))
      //           : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
      //         : 0,
      //     // bse_order_id: "random",
      //   };
      // });

      // let payload: any = {
      //   goal_type_id: GoalType?.id,
      //   goal_label: watch("goal_label"),
      //   risk_category_id: watch("risk_category_id"),
      //   target_amt: Number(watch("target_amt")),
      //   err_perc: Number(watch("err_perc")),
      //   lumpsum_amt: rest?.sipLumpSelected === "lumpsum" ? rest?.lumpsumAmt : 0,
      //   sip_amt: rest?.sipLumpSelected === "lumpsum" ? 0 : rest?.sipAmt,
      //   calc_amt: rest?.sipProjectedAmt
      //     ? rest?.sipProjectedAmt
      //     : rest?.lumpProjectedAmt,
      //   duration_mts:
      //     rest?.sipLumpSelected === "lumpsum"
      //       ? watch("durationType") === "Months"
      //         ? Number(watch("duration_mts"))
      //         : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
      //       : 0,
      //   sip_duration_mts:
      //     rest?.sipLumpSelected === "lumpsum"
      //       ? 0
      //       : watch("durationType") === "Months"
      //         ? Number(watch("duration_mts"))
      //         : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
      //   inflation_perc:
      //     inflationPercentage === true
      //       ? rangeInflation
      //       : DEFAULT_INFLATION_RATE,
      //   lumpsum_current_amt: Number(rest?.lumpProjectedAmt),
      //   goal_exec_date: null,
      //   investment_type:
      //     rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip", //
      //   suggested_scheme: scheme,
      // };

      // let res: any = await api.post(`/goal-plan/addGoalPlanData`, payload);

      let resData: any = await handleSaveGoalData();

      console.log(resData, "resData")
      if (resData) {
        setSaveGoalLoading(false);
        MFAllcationCloseModal();
        setTopping("Lumpsum");
        newGoalCloseModal();
        setTargetMonth("");

        toastAlert("success", "Goal Planning Added");
      }

      // if (resData.data.data) {
      //   let goalData: any = resData.data.data;
      //   let allocationList = allocation?.map((allocation: any) => {
      //     return {
      //       goal_plan_id: goalData?.plans?.id,
      //       risk_category_id: Number(watch("risk_category_id")),
      //       scheme_cate_id: Number(allocation?.scheme_cate_id),
      //       scheme_subcate_id: Number(allocation?.Id),
      //       weightage: Number(allocation?.weightage),
      //       scheme_id: allocation?.scheme_id,
      //     };
      //   });

      //   //add mf allocation
      //   await api.post("/goal-plan/add-user-alloc", {
      //     allocationList,
      //     goal_plan_id: goalData?.plans?.id,
      //   });

      //   setSaveGoalLoading(false);

      //   MFAllcationCloseModal();
      //   setTopping("Lumpsum");
      //   newGoalCloseModal();
      //   setTargetMonth("");

      //   // if (watch("execution_later") === true) {
      //   //   setTransactionLater(true);
      //   // } else {

      //   //   kycCheckTransaction()

      //   // }
      //   // setValue("execution_later", false);
      //   toastAlert("success", "Goal Planning Added");
      //   // showToast("success", "Goal Planning Added");
      // }


    } catch (error) {
      setSaveGoalLoading(false);
      setTopping("Lumpsum");
      handleServerError(error);
    }
  };

  const handleSaveAndExecute = async () => {
    try {

      setSaveGoalLoading(true);

      let saveGoalData: any = await handleSaveGoalData();

      let schemeList = saveGoalData?.schemeFullArray?.map((scheme: any) => {
        return {
          scheme_id: scheme.scheme_id,
          scheme_name: scheme?.scheme_name,
          scheme_isin: scheme?.scheme_isin,
          amount: scheme?.sip_amount > 0 ? scheme?.sip_amount : scheme?.lumpsum_amount,
          duration: saveGoalData?.plans?.duration_mts,
          durationType: 'Months'
        };
      });

      let payload = {
        goal_id: saveGoalData?.plans?.id,
        trans_type: saveGoalData?.plans?.sip_amt > 0 ? 'sip' : 'lumpsum',
        schemeArray: schemeList
      }
      console.log(payload, "payload")

      setSaveGoalLoading(false);

    } catch (error) {
      handleServerError(error);
    }
  }

  const handleEdit = async (data: any) => {
    try {
      console.log(data, "datadatadatadata");

      MFAllcationOpenModal();
      setEditGoalData(data);

      setGoalType(data.GoalType);
      setValue(
        "duration_mts",
        data?.duration_mts === 0 ? data?.sip_duration_mts : data?.duration_mts
      );
      rest?.setSipLumpSelected(data?.sip_amt > 0 ? "sip" : "lumpsum");
      setValue("risk", "risk");
      setValue("risk_category", riskListData?.risk_type);
      setValue("risk_category_id", data?.risk_category_id);
      setValue("goal_label", data?.goal_label);
      setValue("inflation_perc", data?.inflation_perc);
      setValue("existing_fund", data?.existing_fund);
      setValue("target_amt", data?.target_amt);
      setValue("goal_plan_id", data?.id);
      setValue("err_perc", data?.err_perc);
      setValue("goal_type_id", data?.goal_type_id),
        setValue("durationType", "Months");
      if (data?.inflation_perc !== DEFAULT_INFLATION_RATE) {
        setInflationPercentage(true);
        setPerfomanceRating([data?.inflation_perc, 9]);
      } else {
        setInflationPercentage(false);
        setPerfomanceRating([0, 9]);
      }
      setEditForm(true);
      setGoalForm({
        goal_plan_id: data?.id,
        goal_type_id: data?.goal_type_id,
        goal_label: data?.goal_label,
        target_amt: data?.target_amt,
        calc_amt: data?.calc_amt,
        lumpsum_amt: data?.lumpsum_amt,
        duration_mts: data?.duration_mts,
        risk_category_id: data?.risk_category_id,
        sip_amt: data?.sip_amt,
        sip_duration_mts: data?.sip_duration_mts,
        err_perc: data?.err_perc,
        inflation_perc: data?.inflation_perc || 0,
        existing_fund: data?.lumpsum_current_amt,
        lumpsum_current_amt: data?.lumpsum_current_amt,
      });
      setTargetMonth(
        data.duration_mts ? data.duration_mts : data.sip_duration_mts
      );

      let resData: any = await api.get(
        `/goal-plan/getGoalPlanWiseSchemeData/${data?.id}`
      );

      if (resData.data.data) {
        let data: any = resData.data.data;
        rest.setSchemeData(data.schemeList);

        setAllocation(data.allocArr);

        const allocateChart = data.allocArr
          ?.filter((item: any) => Number(item?.weightage) > 0)
          ?.map((item: any) => ({
            value: formatNumber(Number(item?.weightage)),
            name: `${item.categoryName} - ${item?.Name}`,
          }));
        // allocation,setAllocation

        setAllocationData(allocateChart);

        let RiskMapArray: any = [["Task", "Hours per Day"]];

        for (let mapping of allocateChart) {
          let allocation = [
            `${mapping.categoryName} - ${mapping?.Name}`,
            mapping?.weightage,
          ];
          RiskMapArray.push(allocation);
        }

        setAllocationMfRisk(RiskMapArray);
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleEditBackForm = () => {
    MFAllcationCloseModal();
    newGoalOpenModal();
  };

  const handleEditSubmitGoal = async () => {
    try {
      setSaveGoalLoading(true);

      const scheme = schemeData?.map((item: any) => {
        return {
          investment_type:
            rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip",
          scheme_id: item?.scheme_id,
          sip_amount:
            rest?.sipLumpSelected === "lumpsum" ? 0 : item?.sip_amount,
          sip_duration:
            rest?.sipLumpSelected === "lumpsum"
              ? 0
              : watch("durationType") === "Months"
                ? Number(watch("duration_mts"))
                : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
          sip_frequency: 2,
          lumpsum_amount:
            rest?.sipLumpSelected === "lumpsum" ? item?.lumpsum_amount : 0,
          lumpsum_duration:
            rest?.sipLumpSelected === "lumpsum"
              ? watch("durationType") === "Months"
                ? Number(watch("duration_mts"))
                : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
              : 0,
          // bse_order_id: "random",
        };
      });

      let payload: any = {
        // goal_type_id: Number(watch("goal_type_id")),
        goal_type_id: GoalType?.id,
        goal_label: watch("goal_label"),
        risk_category_id: watch("risk_category_id"),
        target_amt: Number(watch("target_amt")),
        err_perc: Number(watch("err_perc")),
        lumpsum_amt: rest?.sipLumpSelected === "lumpsum" ? rest?.lumpsumAmt : 0,
        sip_amt: rest?.sipLumpSelected === "lumpsum" ? 0 : rest?.sipAmt,
        calc_amt: rest?.sipProjectedAmt
          ? rest?.sipProjectedAmt
          : rest?.lumpProjectedAmt,
        duration_mts:
          rest?.sipLumpSelected === "lumpsum"
            ? watch("durationType") === "Months"
              ? Number(watch("duration_mts"))
              : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR
            : 0,
        sip_duration_mts:
          rest?.sipLumpSelected === "lumpsum"
            ? 0
            : watch("durationType") === "Months"
              ? Number(watch("duration_mts"))
              : Number(watch("duration_mts")) * MONTHS_IN_A_YEAR,
        inflation_perc:
          inflationPercentage === true
            ? rangeInflation
            : DEFAULT_INFLATION_RATE,
        lumpsum_current_amt: Number(rest?.lumpProjectedAmt),
        goal_exec_date: watch("execution_later") === true ? null : new Date(),
        investment_type:
          rest?.sipLumpSelected === "lumpsum" ? "lumpsum" : "sip",
        suggested_scheme: scheme,
      };

      const res: any = await api.put(
        `/goal-plan/updateGoalPlanData/${Number(watch("goal_plan_id"))}`,
        payload
      );

      if (res.data.data) {
        let allocationList = allocation?.map((allocation: any) => {
          return {
            goal_plan_id: Number(watch("goal_plan_id")),
            risk_category_id: Number(watch("risk_category_id")),
            scheme_cate_id: Number(allocation?.scheme_cate_id),
            scheme_subcate_id: Number(allocation?.Id),
            weightage: Number(allocation?.weightage),
            scheme_id: allocation?.scheme_id,
          };
        });

        //add mf allocation
        await api.post("/goal-plan/add-user-alloc", {
          allocationList,
          goal_plan_id: Number(watch("goal_plan_id")),
        });

        setSaveGoalLoading(false);
        getGoalsList();
        newGoalCloseModal();
        setTopping("Lumpsum");
        MFAllcationCloseModal();
        setTargetMonth("");
        setEditForm(false);

        setGoalForm({
          goal_plan_id: 0,
          goal_type_id: 0,
          goal_label: "",
          target_amt: "",
          calc_amt: 0,
          lumpsum_amt: 0,
          duration_mts: 0,
          risk_category_id: 0,
          sip_amt: 0,
          sip_duration_mts: 0,
          second_field: 0,
        });
      }

      toastAlert("success", "Goal Planning updated");
    } catch (error) {
      setSaveGoalLoading(false);
      setTopping("Lumpsum");
      handleServerError(error);
    }
  };

  const handleEditNextTab = () => {
    MFAllcationOpenModal();
    newGoalCloseModal();
  };

  const handleExecuteNow = async (item: any) => {
    try {

      let resData: any = await api.get(
        `/goal-plan/getGoalPlanWiseSchemeData/${item?.id}`
      );

      let data: any = resData.data.data;

      let schemeList = data?.schemeList?.map((scheme: any) => {
        return {
          scheme_id: scheme.scheme_id,
          scheme_name: scheme?.SchemeMaster?.ms_fullname,
          scheme_isin: scheme?.SchemeMaster?.schemeISIN,
          amount: scheme?.sip_amount > 0 ? scheme?.sip_amount : scheme?.lumpsum_amount,
          duration: item?.duration_mts,
          durationType: 'Months'
        };
      });

      let payload = {
        goal_id: item?.id,
        trans_type: item?.sip_amt > 0 ? "sip" : "lumpsum",
        schemeArray: schemeList
      }

      console.log(payload,"payloadpayload")

    } catch (error) {
      handleServerError(error);
    }
  }


  const handleDelete = async (id: number) => {
    try {
      setDeleteGoalLoader(true);
      let res: any = await api.delete(`/goal-plan/deleteGoalPlanData/${id}`);
      if (res.data.data) {
        setDeleteGoalLoader(false);
        await getGoalsList();
        deleteGoalPlanCloseModal();
        toastAlert("success", "Goal deleted successfully");
      }
    } catch (err: any) {
      setDeleteGoalLoader(false);
      handleServerError(err);
    }
  };

  const handleViewGoalDetail = (item: any) => {
    router.push(`/goal-detail?id=${item.id}`);
    // router.push(`/risk-profile`);
  };

  return (
    <>
      {/* Risk Alert model */}

      <dialog id="my_modal_1" className="modal" ref={riskAlertModalRef}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Hello!</h3>
          <p className="py-4">
            Your Risk Profile process is pending, please click on continue to
            proceed.
          </p>
          <div className="modal-action flex justify-center">
            <form method="dialog">
              <div className="mt-4 text-center">
                <CustomButton
                  className="w-24 text-center"
                  onClick={handleRiskModel}
                >
                  Continue!
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </dialog>
<div >
  <div className="flex sm:gap-4 items-center pl-2">
    <CustomBackButton onClick={() => window.history.back()}>
      <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
    </CustomBackButton>
  
 <div className="sm:p-4">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-bordered flex sm:gap-2">
          {tabs.map((tab: any, index: number) => (
            <div key={tab} className="flex items-center">
              <a
                role="tab"
                className={`tab border-none px-0 lg:px-2 py-2 font-montserrat ${activeTab === tab
                  ? "tab-active text-primary font-medium text-base lg:text-2xl hover:text-primary lg:-mt-1"
                  : "text-sm !text-black hover:text-black mt-1 font-medium"
                  }`}
                onClick={() => {
                  setActiveTab(tab),
                    tab === "Ongoing Goal" ? getGoalsList() : "";
                }}
              >
                {tab}
              </a>
              {/* Vertical divider between tabs except after last one */}
              {index < tabs.length - 1 && (
                <div className="w-2 lg:w-10 h-px bg-gray-300 mx-1 lg:mx-2 mt-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
</div>
</div>
     
      {/* Border line */}
      <div className="border-b border-accent"></div>

      {/* Tab content */}
      <div className="p-4">
        {/* New Goal Tab Content */}

        {activeTab === "New Goal" && (
          <div>
            {goalTypes.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {goalTypes.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div
                        className="group border border-gray-200 rounded-lg p-2 h-36 flex flex-col items-center  justify-center relative hover:shadow-xl transition cursor-pointer"
                        onClick={() => handleNewGoal(item)}
                      >
                        <img
                          // src={`${publicPathName}/goalplanning/${item.goal_icon}`}
                          //src={`${NODE_API_URL}/static/goalplanning/${item.goal_icon}`}
                          src={`/goalplanning/${item.goal_icon}`}
                          alt={item.goal_name}
                          className="max-h-full max-w-full object-contain"
                        />

                        <span className="absolute bottom-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-br-lg rounded-tl-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity  duration-200">
                          Start
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-center mt-2">
                          {item.goal_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center items-center">
                  No Data Found!
                </div>
              </>
            )}
          </div>
        )}

        {/* OnGoing Tab Content */}

        {activeTab === "Ongoing Goal" && (
          <div className="overflow-y-auto px-2">
            {ongoingGoalList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {ongoingGoalList.map((item: any, index: number) => {
                    const achievedPer =
                      (item?.totalAlloc?.Current / item?.target_amt) * 100;
                    console.log(achievedPer, "achievedPerachievedPer");
                    return (
                      <div
                        className="relative border border-gray-200 rounded-lg p-5"
                        key={index}
                      >
                        <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                          {achievedPer > 0 ? `Initiated` : `Not Initiated`}
                        </span>
                        <div>
                          <CustomText className="text-sm font-semibold font-montserrat">
                            {item?.goal_label}
                          </CustomText>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <CustomText className="text-xs">
                            Category: {item?.GoalType?.goal_name}
                          </CustomText>
                          {item?.sip_amt > 0 ? (
                            <div className="badge bg-secondary-content text-white text-xs">
                              SIP
                            </div>
                          ) : (
                            <div className="badge bg-secondary-content text-white text-xs">
                              Lumpsum
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <CustomText className="text-xs">Target</CustomText>
                          <div className="flex-grow border-b border-accent mx-2"></div>
                          <div className="text-secondary text-lg font-semibold">
                            ₹{item?.target_amt}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <CustomText className="text-xs">
                            Current Value
                          </CustomText>
                          <div className="flex-grow border-b border-accent mx-2"></div>
                          <div className="text-secondary text-lg font-semibold">
                            {item?.totalAlloc?.Current ? (
                              <div>₹ {item?.totalAlloc?.Current}</div>
                            ) : (
                              <div>₹0</div>
                            )}
                          </div>
                        </div>
                        {/* <div className="border border-secondary rounded-md p-2 flex justify-between mt-4 px-3">
                          <CustomText>Achieved</CustomText>
                          <div className="text-secondary text-lg font-semibold">
                            0%
                          </div>
                        </div> */}
                        <div className="relative w-full max-w-xs mt-2 border border-secondary rounded-md overflow-hidden">
                          {/* Dynamic background fill */}
                          <div
                            className="absolute top-0 left-0 h-full bg-secondary z-0"
                            style={{ width: `${achievedPer}%` }} // Make this dynamic: `${achieved}%`
                          ></div>

                          {/* Foreground text on top */}
                          <div className="relative z-10 flex justify-between items-center h-full px-3">
                            <CustomText className="text-xs font-medium  p-1 bg-white rounded-md text-black">
                              Achieved
                            </CustomText>
                            <div className="text-sm font-semibold bg-white p-1 rounded-md text-secondary">
                              {formatNumber(achievedPer)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div>
                            <CustomText className="text-xs">
                              Invested
                            </CustomText>
                            <div className="text-secondary text-base font-semibold">
                              {item?.totalAlloc?.Invested ? (
                                <> ₹ {item?.totalAlloc?.Invested}</>
                              ) : (
                                <>₹0</>
                              )}
                            </div>
                          </div>
                          <div>
                            <CustomText className="text-xs">Months</CustomText>
                            <div className="text-secondary text-base font-semibold text-right">
                              {item?.totalAlloc?.transaction_month || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div>
                            <CustomText className="text-xs">
                              Recommended
                            </CustomText>
                            <div className="text-secondary text-base font-semibold">
                              ₹
                              {item?.sip_amt > 0
                                ? item?.sip_amt
                                : item?.lumpsum_amt}
                            </div>
                          </div>
                          <div>
                            <CustomText className="text-xs">Months</CustomText>
                            <div className="text-secondary text-base font-semibold text-right">
                              {item?.duration_mts || item?.sip_duration_mts}
                            </div>
                          </div>
                        </div>
                        <div className="border border-b border-accent my-3"></div>
                        {achievedPer > 0 ? (
                          <div className="text-center">
                            <CustomButton
                              className="rounded-xl"
                              type="button"
                            // onClick={() => handleViewGoalDetail(item)}
                            ></CustomButton>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <CustomButton
                              className="btn-sm rounded-xl"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </CustomButton>
                            <CustomButton
                              className="btn-sm rounded-xl"
                              onClick={() => {
                                setGoalPlanId(item?.id);
                                deleteGoalPlanOpenModal();
                              }}
                            >
                              Delete
                            </CustomButton>
                            <CustomButton
                              className="btn-sm rounded-xl"
                              onClick={() => handleViewGoalDetail(item)}
                            >
                              View Detail
                            </CustomButton>
                            <CustomButton
                              className="btn-sm rounded-xl"
                              onClick={() => handleExecuteNow(item)}
                            >
                              Execute Now
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center items-center">
                  No Data Found!
                </div>
              </>
            )}
          </div>
        )}

        {/* Complete Goal Tab Content*/}

        {activeTab === "Completed Goal" && (
          // <div className="text-center text-gray-500">No completed goals.</div>
          <div className="overflow-y-auto px-2">
            {completedGoalList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {completedGoalList.map((item: any, index: number) => {
                    const achievedPer =
                      (item?.totalAlloc?.Current / item?.target_amt) * 100;

                    return (
                      <div
                        className="relative border border-gray-200 rounded-lg p-5"
                        key={index}
                      >
                        <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                          {achievedPer > 0 ? `Initiated` : `Not Initiated`}
                        </span>
                        <div>
                          <CustomText className="text-sm font-semibold font-montserrat">
                            {item?.goal_label}
                          </CustomText>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <CustomText className="text-xs">
                            Category: {item?.GoalType?.goal_name}
                          </CustomText>
                          {item?.sip_amt > 0 ? (
                            <div className="badge bg-secondary-content text-white text-xs">
                              SIP
                            </div>
                          ) : (
                            <div className="badge bg-secondary-content text-white text-xs">
                              Lumpsum
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <CustomText className="text-xs">Target</CustomText>
                          <div className="flex-grow border-b border-accent mx-2"></div>
                          <div className="text-secondary text-lg font-semibold">
                            ₹{item?.target_amt}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <CustomText className="text-xs">
                            Current Value
                          </CustomText>
                          <div className="flex-grow border-b border-accent mx-2"></div>
                          <div className="text-secondary text-lg font-semibold">
                            {item?.totalAlloc?.Current ? (
                              <div>₹ {item?.totalAlloc?.Current}</div>
                            ) : (
                              <div>₹0</div>
                            )}
                          </div>
                        </div>
                        <div className="relative w-full max-w-xs mt-2 border border-secondary rounded-md overflow-hidden">
                          {/* Dynamic background fill */}
                          <div
                            className="absolute top-0 left-0 h-full bg-secondary z-0"
                            style={{ width: `${achievedPer}%` }} // Make this dynamic: `${achieved}%`
                          ></div>

                          {/* Foreground text on top */}
                          <div className="relative z-10 flex justify-between items-center h-full px-3">
                            <CustomText className="text-xs font-medium  p-1 bg-white rounded-md text-black">
                              Achieved
                            </CustomText>
                            <div className="text-sm font-semibold bg-white p-1 rounded-md text-secondary">
                              {formatNumber(achievedPer)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div>
                            <CustomText className="text-xs">
                              Invested
                            </CustomText>
                            <div className="text-secondary text-base font-semibold">
                              {item?.totalAlloc?.Invested ? (
                                <> ₹ {item?.totalAlloc?.Invested}</>
                              ) : (
                                <>₹0</>
                              )}
                            </div>
                          </div>
                          <div>
                            <CustomText className="text-xs">Months</CustomText>
                            <div className="text-secondary text-base font-semibold text-right">
                              {item?.totalAlloc?.transaction_month || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div>
                            <CustomText className="text-xs">
                              Recommended
                            </CustomText>
                            <div className="text-secondary text-base font-semibold">
                              ₹{" "}
                              {item?.sip_amt > 0
                                ? item?.sip_amt
                                : item?.lumpsum_amt}
                            </div>
                          </div>
                          <div>
                            <CustomText className="text-xs">Months</CustomText>
                            <div className="text-secondary text-base font-semibold text-right">
                              {item?.duration_mts || item?.sip_duration_mts}
                            </div>
                          </div>
                        </div>
                        <div className="border border-b border-accent my-3"></div>
                        <div className="text-center">
                          <CustomButton
                            className="rounded-xl"
                            type="button"
                          // onClick={() => handleViewGoalDetail(item)}
                          >
                            View Detail
                          </CustomButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center items-center">
                  {/* <CustomLoading /> */}
                  No Data Found!
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* New Goal model   first tab */}

      <dialog id="my_modal" className="modal" ref={addNewGoalModalRef}>
        <div className="modal-box max-w-2xl">
          <form method="dialog" className="modalHeader">
            <div className="flex-1 sm:flex justify-between">
              <h3 className="modalTitle">{GoalType?.goal_name}</h3>
              <CustomText className="text-black">
                Risk Profile - {riskListData?.risk_type}
              </CustomText>
            </div>
            <div className="">
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={handleCloseFirstModal}
              >
                <MdClose size={25} />
              </button>
              {/* <CustomText className="text-black">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div className="modalBody">
            <div className="sm:flex justify-between items-center mt-4">
              <CustomLabel>Title</CustomLabel>
              <div className="max-w-48">
                <CustomInput
                  type="text"
                  id="title"
                  aria-describedby="titleHelp"
                  placeholder="Enter Title"
                  value={watch("goal_label")}
                  {...register("goal_label")}
                  onChange={(e: any) => {
                    const title = e?.target?.value;
                    if (!title.startsWith(" ")) {
                      setValue("goal_label", title, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  disabled={secondModal}
                  error={errors?.goal_label?.message}
                />
              </div>
            </div>
            <div className="border-b border-accent/30 my-4"></div>
            <div className="sm:flex justify-between items-center  mt-4">
              <CustomLabel>
                How much money do you need to your goal {GoalType?.goal_name}?
              </CustomLabel>
              <CustomInputIcon
                className="w-36"
                type="number"
                min={0}
                max={999999}
                placeholder="Enter"
                icon="&#8377;"
                iconPosition="left"
                aria-label="Username"
                aria-describedby="basic-addon1"
                value={watch("target_amt")}
                {...register("target_amt")}
                onChange={(e: any) => {
                  setValue("target_amt", e?.target?.value, {
                    shouldValidate: true,
                  });
                }}
                disabled={secondModal}
                error={errors?.target_amt?.message}
              />
            </div>
            <div className="border-b border-accent/30 my-4"></div>
            <div className="sm:flex justify-between items-center gap-5 mt-4 min-h-14">
              <CustomCheckbox
                label="Do you want to adjust the goal amount for inflation ?"
                id="flexSwitchCheckDefault"
                checked={inflationPercentage}
                onChange={(e) => {
                  setInflationPercentage(e?.target?.checked);
                }}
                disabled={secondModal}
              />
              {inflationPercentage && (
                <div className="text-center relative mt-6 sm:mt-0">
                  <div className="badge bg-secondary mb-2 rounded-full text-white absolute left-1/2 bottom-3 -translate-x-1/2">
                    {rangeInflation}
                  </div>
                  <div className={`flex gap-3 justify-center`}>
                    <div className="-mt-2">1</div>
                    <input
                      type="range"
                      min={inflationPercentage ? "1" : "0"}
                      max="9"
                      step="0.5"
                      className="range range-xs range-primary"
                      value={rangeInflation}
                      onChange={(e: any) => {
                        setRangeInflation(e?.target?.value);
                      }}
                      disabled={secondModal}
                    />
                    <div className="-mt-2">9</div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-b border-accent/30 my-4"></div>
            <div className="sm:flex justify-between  mt-4">
              <CustomLabel>
                When do you need these funds for {GoalType?.goal_name} ?
              </CustomLabel>
              <div className="flex gap-2">
                <div className=" w-1/2">
                  <CustomInput
                    type="number"
                    min={0}
                    max={999999}
                    value={watch("duration_mts")}
                    name="duration_mts"
                    onChange={(e: any) => {
                      setDuration(e?.target?.value);
                      setValue("duration_mts", e?.target?.value, {
                        shouldValidate: true,
                      });
                    }}
                    id="Monthspan"
                    placeholder="Months/Years"
                    disabled={secondModal}
                    error={errors?.duration_mts?.message}
                  />
                </div>
                <div className="w-1/2">
                  <CustomSelect
                    items={monthsDropdown}
                    bindName="durationType"
                    bindValue="durationType"
                    value={getValues("durationType")}
                    {...register("durationType")}
                    onChange={(e) => {
                      setValue("durationType", e?.target.value);
                      clearErrors("duration_mts");
                    }}
                    disabled={secondModal}
                  />
                </div>
              </div>
            </div>
            {secondModal ? (
              <>
                <div className="border-b border-accent mt-4"></div>
                <div className="my-6">
                  <div className="font-semibold font-montserrat">
                    <CustomText>Recommended Plan</CustomText>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-16">
                    <div className="flex gap-5">
                      <CustomCheckbox
                        label="Lumpsum"
                        name="lumpsumSip"
                        value="sip"
                        checked={rest?.sipLumpSelected === "lumpsum"}
                        onChange={(e: any) => {
                          e?.target?.checked;
                          rest?.setSipLumpSelected("lumpsum");
                        }}
                      />
                      <div className="text-primary">
                        ₹&nbsp;{rest?.lumpsumAmt}
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <CustomCheckbox
                        label="SIP"
                        name="lumpsumSip"
                        value="sip"
                        checked={rest?.sipLumpSelected === "sip"}
                        onChange={(e: any) => {
                          e?.target?.checked;
                          rest?.setSipLumpSelected("sip");
                        }}
                      />
                      <div className="text-primary">₹&nbsp;{rest?.sipAmt}</div>
                    </div>
                  </div>
                  <div className="mt-5">
                    {inflationPercentage && (
                      <>
                        <span className="font-bold">{`${rangeInflation}% `}</span>
                        inflation adjusted &nbsp;
                      </>
                    )}
                    Projected amount after &nbsp;
                    <span className="font-bold">
                      {duration} &nbsp;{watch("durationType").toLowerCase()}
                    </span>
                    &nbsp;will be&nbsp;
                    <span className="font-bold">
                      &#8377;&nbsp;
                      {rest?.sipLumpSelected === "sip"
                        ? rest?.sipProjectedAmt
                        : rest?.lumpProjectedAmt}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          {!secondModal ? (
            <>
              <div className="modalFooter">
                {editForm && !anyChanges ? (
                  <div className="text-center">
                    <CustomButton
                      loading={calculationLoading}
                      onClick={handleEditNextTab}
                    // type="submit"
                    >
                      Next
                    </CustomButton>
                  </div>
                ) : (
                  <div className="text-center">
                    <CustomButton
                      loading={calculationLoading}
                      onClick={handleSubmit(handleCalculations)}
                      type="submit"
                    >
                      Calculate
                    </CustomButton>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="modalFooter">
              <div className="text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-32 shadow-none"
                  onClick={handleBackModal}
                // loading={loading}
                >
                  Back
                </CustomButton>
              </div>
              <div className="text-center" onClick={handleProceedGoal}>
                <CustomButton
                  className="w-32"
                // loading={loading}
                >
                  Proceed
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </dialog>

      <dialog id="my_modal_2" className="modal" ref={MFAllocationModalRef}>
        <div className="modal-box max-w-7xl min-h-[700px]">
          <form method="dialog" className="modalHeader">
            <h3 className="text-lg font-montserrat">MF Allocation</h3>
            {/* <button className="btn btn-md btn-circle btn-ghost">✕</button> */}
            <div className="flex gap-5 justify-center items-center">
              {/* <CustomText className="text-black">
                Risk Profile - Moderate
              </CustomText> */}
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={() => {
                  MFAllcationOpenModal(), suggestedSchemeOpenModal();
                }}
              >
                <MdClose size={25} />
              </button>
              {/* <CustomText className="text-black">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div className="modalBody">
            <div className="lg:flex h-full min-h-[550px]">
              <div className="lg:w-1/4 px-4">
                <div>
                  {allocationMfRisk && allocationMfRisk.length && (
                    <div className={``}>
                      <ReactECharts
                        option={option}
                        // className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[400px] lg:mt-20"
                        style={{
                          height: isMobileView ? "300px" : "400px",
                          width: "100%",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="border-r border-accent h-auto mx-2" />
              <div className="lg:w-3/4 p-2">
                <div className="font-montserrat text-lg font-semibold">
                  <CustomText>Suggested Investments</CustomText>
                </div>
                <div className="mt-6 overflow-y-auto">
                  {schemeData && schemeData.length > 0 ? (
                    <>
                      {schemeData.map((data: any, index: number) => {
                        return (
                          <Fragment key={index}>
                            <div className="underline">
                              <CustomText className="font-semibold">
                                {data?.SchemeCategory?.Name} -{" "}
                                {data?.SchemeSubcategory?.Name}
                              </CustomText>
                            </div>
                            <div className="my-5 grid grid-cols-12 gap-1">
                              <div className="col-span-12 lg:col-span-3">
                                <CustomText className="labelValue">
                                  Scheme
                                </CustomText>
                                <CustomText className="text-sm">
                                  {data?.SchemeMaster?.ms_fullname}
                                </CustomText>
                              </div>
                              <div className="col-span-3 lg:col-span-2 lg:ps-3">
                                <CustomText className="labelValue text-start mb-1">
                                  Rating
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm">
                                  {data?.SchemeMaster?.SchemePerformances?.[0]
                                    ?.OverallRating ? (
                                    <>
                                      {
                                        data?.SchemeMaster
                                          ?.SchemePerformances[0]?.OverallRating
                                      }
                                      <FaStar className="text-orange-300 text-lg" />
                                    </>
                                  ) : (
                                    "--"
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-9 lg:col-span-7 grid grid-cols-6 gap-1">
                                <div className="col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue">
                                    Return 1y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 text-sm">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Return1yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue">
                                    Return 3y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 text-sm">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Returns3yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue">
                                    Return 5y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 mx-auto text-sm">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Returns5yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="p-2 bg-accent-content -mt-2 rounded-md col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue">
                                    Weightage
                                  </CustomText>
                                  <CustomText className="text-sm">
                                    {data?.weightage}%
                                  </CustomText>
                                </div>
                                <div className="p-2 bg-accent-content -mt-2 rounded-md col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue">
                                    Amount
                                  </CustomText>
                                  <CustomText className="text-sm">
                                    {/* &#8377;{" "} */}₹
                                    {rest?.sipLumpSelected === "sip"
                                      ? data?.sip_amount
                                      : data?.lumpsum_amount}
                                  </CustomText>
                                </div>
                                <div
                                  className="col-span-1 lg:col-span-1"
                                  onClick={() =>
                                    handleChangeScheme(data, index)
                                  }
                                >
                                  <CustomText className="text-primary text-center cursor-pointer text-sm">
                                    Change
                                  </CustomText>
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <div>No Data Found!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modalFooter">
            <div className="text-center">
              <CustomButton
                className="bg-white !text-black !border !border-gray-300 w-36"
                onClick={editForm ? handleEditBackForm : handleBackMFAllocation}
              >
                {/* Back */}
                {editForm ? `Re-Calculate` : `Back`}
              </CustomButton>
            </div>
            <div className="text-center">
              <CustomButton
                className="w-36"
                type="submit"
                loading={saveGoalLoading}
                onClick={() => {
                  editForm ? handleEditSubmitGoal() : handleCreateGoal();
                }}
              >
                Save Goal
              </CustomButton>
            </div>
            <div
              className="text-center"
            //   onClick={handleProceedGoal}
            >
              <CustomButton
                className="w-36"
                type="button"
                onClick={() => handleSaveAndExecute()}
              >
                Save & Execute
              </CustomButton>
            </div>
          </div>
        </div>
      </dialog>

      <dialog id="my_modal_3" className="modal" ref={suggestedSchemeModalRef}>
        <div className="modal-box text-center">
          <div className="flex justify-center text-center my-2">
            <MdError className="text-red-600 w-14 h-14" />
          </div>
          <h3 className="text-xl font-bold">Are you sure?</h3>
          <p className="py-4">you want to cancel this process.</p>
          <div className="modal-action flex gap-5 justify-center items-center text-center">
            <form
              method="dialog"
              className="flex gap-5 justify-center items-center text-center"
            >
              <div className="mt-4 text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-28"
                  onClick={() => {
                    suggestedSchemeCloseModal(), MFAllcationOpenModal();
                    setSaveGoalLoading(false);
                  }}
                // loading={loading}
                >
                  Cancel
                </CustomButton>
              </div>

              <div className="mt-4 text-center">
                <CustomButton
                  className="w-28"
                  // loading={loading}
                  onClick={handleMFAllocation}
                >
                  Yes
                </CustomButton>
              </div>
              {/* <button className="btn" onClick={handleMFAllocation}>Close</button> */}
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="my_modal_4" className="modal" ref={schemeModalRef}>
        <div className="modal-box p-0 max-w-7xl">
          <form
            method="dialog"
            className="flex justify-between items-center px-5 py-3"
          >
            <h3 className="text-lg font-montserrat">Suggested Investments</h3>
            {/* <button className="btn btn-md btn-circle btn-ghost">✕</button> */}
            <div className="flex gap-5 justify-center items-center">
              {/* <CustomText className="text-black">
                Risk Profile - Moderate
              </CustomText> */}
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={handleBackSchemeModel}
              >
                <MdClose size={25} />
              </button>
              {/* <CustomText className="text-black">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div></div>
          <div className="border-b border-accent"></div>
          <div className="mt-0">
            <div className="h-full">
              <div className="p-0">
                <div className="mt-0 overflow-y-auto max-h-[500px] px-5">
                  {suggestedCategoryList && suggestedCategoryList.length > 0 ? (
                    <>
                      {suggestedCategoryList.map((data: any, index: number) => {
                        return (
                          <Fragment key={index}>
                            <div className="my-4 grid grid-cols-12 gap-3">
                              <div className="col-span-5 flex justify-start text-start gap-6">
                                <div className="text-center">
                                  <CustomCheckbox
                                    className="checkbox checkbox-sm"
                                    checked={
                                      selectedSuggestedScheme.id === data.id
                                    }
                                    onChange={() =>
                                      selectexchangeSubCategory(data, index)
                                    }
                                  />
                                </div>
                                <div>
                                  <CustomText className="text-xs font-semibold">
                                    Scheme
                                  </CustomText>
                                  <CustomText className="text-sm">
                                    {data?.ms_fullname}
                                  </CustomText>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <CustomText className="text-xs text-center font-semibold">
                                  AUM
                                </CustomText>
                                <CustomText className="flex justify-center items-center gap-2 text-sm">
                                  {convertToCrores(
                                    data?.SchemePerformances[0]?.AUM
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-2">
                                <CustomText className="text-xs font-semibold">
                                  Rating
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm">
                                  {data?.SchemePerformances?.[0]
                                    ?.OverallRating ? (
                                    <>
                                      {
                                        data?.SchemePerformances[0]
                                          ?.OverallRating
                                      }
                                      <FaStar className="text-orange-300 text-lg" />
                                    </>
                                  ) : (
                                    "--"
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-1">
                                <CustomText className="text-xs font-semibold">
                                  Return 1y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Return1yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-1">
                                <CustomText className="text-xs font-semibold">
                                  Return 3y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Returns3yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-1">
                                <CustomText className="text-xs font-semibold">
                                  Return 5y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 mx-auto text-sm">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Returns5yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                            </div>
                            <div className="border-b border-accent mt-2"></div>
                          </Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <div>No Data Found!</div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-b border-accent"></div>
            <div className="flex justify-center gap-3">
              <div className="my-4 text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-36"
                  onClick={handleBackSchemeModel}
                >
                  Back
                </CustomButton>
              </div>
              <div
                className="mt-4 text-center"
                onClick={() =>
                  exchangeSubCategory(
                    selectedSuggestedScheme?.payload,
                    exchangeSchemeIndex?.index
                  )
                }
              >
                <CustomButton className="w-36" type="submit">
                  Proceed
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </dialog>

      <dialog id="my_modal_5" className="modal" ref={deleteGoalPlanModalRef}>
        <div className="modal-box text-center">
          <div className="flex justify-center text-center my-2">
            <MdError className="text-red-600 w-14 h-14" />
          </div>
          <h3 className="text-xl font-bold">Delete Goal</h3>
          <p className="py-4">Are you sure you want to delete this goal?</p>
          <div className="modal-action flex gap-5 justify-center items-center text-center">
            <form
              method="dialog"
              className="flex gap-5 justify-center items-center text-center"
            >
              <div className="mt-4 text-center">
                <CustomButton
                  className="bg-white !text-black !border !border-gray-300 w-28"
                  onClick={() => {
                    deleteGoalPlanCloseModal();
                  }}
                // loading={loading}
                >
                  Cancel
                </CustomButton>
              </div>

              <div className="mt-4 text-center">
                <CustomButton
                  className="w-28"
                  loading={deleteGoalLoader}
                  onClick={() => handleDelete(goalPlanId)}
                >
                  Yes
                </CustomButton>
              </div>
              {/* <button className="btn" onClick={handleMFAllocation}>Close</button> */}
            </form>
          </div>
        </div>
      </dialog>
      <PurchaseDetailPopup
        open={showPurchaseModal}
        // schemeData={}
        onClose={() => setShowPurchaseModal(false)}
      />
      <SipPopup
        open={showSipModal}
        // schemeData={}
        onClose={() => setShowSipModal(false)}
      />
    </>
  );
}

export default GoalPlanning;
