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
  USER_DATA,
} from "@/utils/constants";
import { handleServerError, toastAlert, getLS, setLS } from "@/utils/helpers";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
} from "react";
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
import { MdClose, MdError, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardArrowRight } from "react-icons/md";
import CustomText from "@/commonUI/Text";
import ReactECharts from "echarts-for-react";
import { useRouter } from "next/navigation";
import { FaArrowAltCircleUp, FaRegCircle, FaStar, FaClipboardList, FaQuestionCircle, FaCheckCircle, FaShieldAlt, FaChartLine, FaBalanceScale } from "react-icons/fa";
import CustomLoading from "@/commonUI/Loading";
import PurchaseDetailPopup from "./(modals)/purchase-detail";
import SipPopup from "./(modals)/sip-detail";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import { searchByISIN } from "@/api/transaction";
import SchemeConfigurationService, { ColorMaster, ColorAllocation, SavedSchemeConfig } from "@/services/schemeConfiguration";
import { Pencil, Plus, Trash2, ArrowLeft } from "lucide-react";

function GoalPlanning() {
  const router = useRouter();

  const tabs = ["New Goal"];
  const addNewGoalModalRef = useRef<HTMLDialogElement>(null);
  const MFAllocationModalRef = useRef<HTMLDialogElement>(null);
  const suggestedSchemeModalRef = useRef<HTMLDialogElement>(null);
  const riskAlertModalRef = useRef<HTMLDialogElement>(null);
  const schemeModalRef = useRef<HTMLDialogElement>(null);
  const deleteGoalPlanModalRef = useRef<HTMLDialogElement>(null);
  const goalDetailModalRef = useRef<HTMLDialogElement>(null);
  const riskRecommendationsModalRef = useRef<HTMLDialogElement>(null);
  const schemeDetailsModalRef = useRef<HTMLDialogElement>(null);

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

  const riskRecommendationsOpenModal = () => {
    riskRecommendationsModalRef.current?.showModal();
  };

  const riskRecommendationsCloseModal = () => {
    riskRecommendationsModalRef.current?.close();
  };

  const schemeDetailsOpenModal = (scheme: any) => {
    setSelectedScheme(scheme);
    schemeDetailsModalRef.current?.showModal();
  };

  const schemeDetailsCloseModal = () => {
    schemeDetailsModalRef.current?.close();
    setSelectedScheme(null);
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
  const [showRetakeAssessment, setShowRetakeAssessment] = useState(false);
  const [retakeQuestions, setRetakeQuestions] = useState<any>([]);
  const [retakeSelectedOptions, setRetakeSelectedOptions] = useState<any>({});
  const [retakeEnabledQuestions, setRetakeEnabledQuestions] = useState<number[]>([0]);
  const [retakeExpandedIndex, setRetakeExpandedIndex] = useState<number | null>(0);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<any>(null);
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

  // Goal filtering states
  const [ongoingFilter, setOngoingFilter] = useState<string>("all");
  const [completedFilter, setCompletedFilter] = useState<string>("all");

  // Dropdown states
  const [ongoingDropdownOpen, setOngoingDropdownOpen] = useState<boolean>(true);
  const [completedDropdownOpen, setCompletedDropdownOpen] = useState<boolean>(true);

  // Risk-based filtering states
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [showRiskRecommendations, setShowRiskRecommendations] = useState<boolean>(false);

  // Scheme details state
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  // Scheme Configuration states for Risk Recommendations
  const [schemeColors, setSchemeColors] = useState<ColorMaster[]>([]);
  const [schemeConfigurations, setSchemeConfigurations] = useState<(SavedSchemeConfig & { percentage?: number })[]>([]);
  const [schemeColorAllocations, setSchemeColorAllocations] = useState<ColorAllocation[]>([]);

  // Scheme Edit Modal states
  const [schemeEditModalOpen, setSchemeEditModalOpen] = useState(false);
  const [schemeAllSchemes, setSchemeAllSchemes] = useState<any[]>([]);
  const [schemeEditColorId, setSchemeEditColorId] = useState<number | null>(null);
  const [schemeEditColorName, setSchemeEditColorName] = useState('');
  const [schemeEditIsEditMode, setSchemeEditIsEditMode] = useState(false);
  const [schemeEditEditingItemId, setSchemeEditEditingItemId] = useState<number | null>(null);
  const [schemeEditSelectedSchemes, setSchemeEditSelectedSchemes] = useState<any[]>([]);
  const [schemeEditPercentages, setSchemeEditPercentages] = useState<{[key: string]: number}>({});
  const [schemeEditSearchTerm, setSchemeEditSearchTerm] = useState('');
  const [schemeEditRiskFilter, setSchemeEditRiskFilter] = useState('');
  const [schemeEditFundFilter, setSchemeEditFundFilter] = useState('');

  // Calculate filtered counts and lists with useMemo
  const filteredOngoingData = useMemo(() => {
    console.log('=== FILTERING ONGOING GOALS ===');
    console.log('Current Filter:', ongoingFilter);
    console.log('Total Ongoing Goals:', ongoingGoalList.length);

    const filtered = ongoingGoalList.filter((item: any, index: number) => {
      console.log(`Goal ${index + 1}: ${item?.goal_label}, SIP: ${item?.sip_amt}, Lumpsum: ${item?.lumpsum_amt}`);

      if (ongoingFilter === "all") {
        console.log('Filter: "all" - showing goal');
        return true;
      }
      if (ongoingFilter === "sip") {
        const isSip = item?.sip_amt > 0;
        console.log(`Filter: "sip" - ${isSip ? 'showing' : 'hiding'} goal`);
        return isSip;
      }
      if (ongoingFilter === "lumpsum") {
        const isLumpsum = item?.lumpsum_amt > 0;
        console.log(`Filter: "lumpsum" - ${isLumpsum ? 'showing' : 'hiding'} goal`);
        return isLumpsum;
      }
      if (ongoingFilter === "high-progress") {
        const progress = (item?.totalAlloc?.Current / item?.target_amt) * 100;
        const isHighProgress = progress >= 50;
        console.log(`Filter: "high-progress" - ${isHighProgress ? 'showing' : 'hiding'} goal (${progress}% progress)`);
        return isHighProgress;
      }
      if (ongoingFilter === "low-progress") {
        const progress = (item?.totalAlloc?.Current / item?.target_amt) * 100;
        const isLowProgress = progress < 50;
        console.log(`Filter: "low-progress" - ${isLowProgress ? 'showing' : 'hiding'} goal (${progress}% progress)`);
        return isLowProgress;
      }
      return false;
    });

    console.log('Filtered Goals Count:', filtered.length);
    console.log('=== END FILTERING ===');
    return filtered;
  }, [ongoingGoalList, ongoingFilter]);

  const filteredCompletedData = useMemo(() => {
    return completedGoalList.filter((item: any) => {
      if (completedFilter === "all") return true;
      if (completedFilter === "recent") {
        const completedDate = new Date(item?.completed_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return completedDate >= thirtyDaysAgo;
      }
      if (completedFilter === "overdue") {
        const completedDate = new Date(item?.completed_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return completedDate < thirtyDaysAgo;
      }
      if (completedFilter === "high-value") {
        return item?.target_amt >= 1000000; // Goals >= 10L
      }
      return false;
    });
  }, [completedGoalList, completedFilter]);

  const filteredOngoingCount = filteredOngoingData.length;
  const filteredCompletedCount = filteredCompletedData.length;


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
    fetchSchemeConfigData();
  }, []);

  // Fetch scheme configuration data for Risk Recommendations
  const fetchSchemeConfigData = async () => {
    try {
      const [colorsData, savedConfigs, allocations] = await Promise.all([
        SchemeConfigurationService.getAllColors(),
        SchemeConfigurationService.getSavedConfigurations(),
        SchemeConfigurationService.getAllColorAllocations(),
      ]);
      setSchemeColors(colorsData || []);
      setSchemeConfigurations((savedConfigs || []).map((cfg: any) => ({ ...cfg, percentage: cfg.percentage || 0 })));
      setSchemeColorAllocations(allocations || []);
    } catch (error) {
      console.error("fetchSchemeConfigData:", error);
    }
  };

  const getSchemeColorConfigs = (colorId: number) => schemeConfigurations.filter(cfg => cfg.color_id === colorId);
  const getSchemeColorAllocation = (colorId: number) => {
    const alloc = schemeColorAllocations.find(a => a.color_id === colorId);
    return { total: alloc?.total_allocation || 0, remaining: alloc?.remaining_allocation || 100, isFull: alloc?.is_fully_allocated || false };
  };
  const formatSchemePercentage = (p: any): string => { const n = Number(p); return isNaN(n) || n === 0 ? '0.00' : n.toFixed(2); };
  const getSchemeColorBorderClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'border border-red-300 bg-[#111111]'; case 'yellow': return 'border border-yellow-300 bg-[#111111]'; case 'green': return 'border border-green-300 bg-[#111111]'; default: return 'border border-[#3A3A3A] bg-[#111111]'; } };
  const getSchemeColorTextClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'text-red-500'; case 'yellow': return 'text-yellow-500'; case 'green': return 'text-green-500'; default: return 'text-[#9CA3AF]'; } };
  const getSchemeColorDividerClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'border-red-100'; case 'yellow': return 'border-yellow-100'; case 'green': return 'border-green-100'; default: return 'border-[#2A2A2A]'; } };
  const getSchemeGradientBtnClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'bg-gradient-to-r from-red-400 to-orange-400'; case 'yellow': return 'bg-gradient-to-r from-yellow-400 to-green-400'; case 'green': return 'bg-gradient-to-r from-green-400 to-teal-400'; default: return 'bg-gradient-to-r from-gray-400 to-gray-500'; } };
  const getSchemeColorBtnClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'bg-red-600 hover:bg-red-700'; case 'yellow': return 'bg-yellow-600 hover:bg-yellow-700'; case 'green': return 'bg-green-600 hover:bg-green-700'; default: return 'bg-gray-600 hover:bg-gray-700'; } };
  const getSchemeColorDesc = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'High-Risk & High-Return'; case 'yellow': return 'Moderate-Risk & Moderate-Return'; case 'green': return 'Low-Risk & Low-Return'; default: return ''; } };
  const getSchemeRiskBadgeClass = (r: string | undefined) => { if (!r) return 'bg-[#1F1A1A] text-[#9CA3AF]'; const l = r.toLowerCase(); if (l.includes('very high')) return 'bg-purple-100 text-purple-700'; if (l.includes('moderately high')) return 'bg-orange-100 text-orange-700'; if (l.includes('high')) return 'bg-red-100 text-red-600'; if (l.includes('moderate')) return 'bg-yellow-100 text-yellow-700'; if (l.includes('low')) return 'bg-green-100 text-green-700'; return 'bg-[#1F1A1A] text-[#9CA3AF]'; };
  const getSchemeHeaderClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'bg-gradient-to-r from-red-600 to-red-700'; case 'yellow': return 'bg-gradient-to-r from-yellow-600 to-yellow-700'; case 'green': return 'bg-gradient-to-r from-green-600 to-green-700'; default: return 'bg-gradient-to-r from-blue-600 to-blue-700'; } };
  const getSchemeSelectedBorder = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'border-red-500 bg-red-50 ring-1 ring-red-200'; case 'yellow': return 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-200'; case 'green': return 'border-green-500 bg-green-50 ring-1 ring-green-200'; default: return 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'; } };
  const getSchemeRadioClass = (c: string) => { switch (c.toLowerCase()) { case 'red': return 'bg-red-500 border-red-500'; case 'yellow': return 'bg-yellow-500 border-yellow-500'; case 'green': return 'bg-green-500 border-green-500'; default: return 'bg-blue-500 border-blue-500'; } };

  // Scheme Edit Modal functions
  const fetchAllSchemesForEdit = async () => {
    try { const schemes = await SchemeConfigurationService.getAllSchemes(); setSchemeAllSchemes(schemes || []); } catch (e) { console.error(e); }
  };

  const openSchemeAddModal = (colorId: number) => {
    const color = schemeColors.find(c => c.id === colorId);
    setSchemeEditColorId(colorId);
    setSchemeEditColorName(color?.color_name || '');
    setSchemeEditIsEditMode(false);
    setSchemeEditEditingItemId(null);
    setSchemeEditSelectedSchemes([]);
    setSchemeEditPercentages({});
    setSchemeEditSearchTerm('');
    setSchemeEditRiskFilter('');
    setSchemeEditFundFilter('');
    if (schemeAllSchemes.length === 0) fetchAllSchemesForEdit();
    riskRecommendationsModalRef.current?.close();
    setSchemeEditModalOpen(true);
  };

  const openSchemeEditModal = (cfg: any) => {
    const color = schemeColors.find(c => c.id === cfg.color_id);
    setSchemeEditColorId(cfg.color_id);
    setSchemeEditColorName(color?.color_name || '');
    setSchemeEditIsEditMode(true);
    setSchemeEditEditingItemId(cfg.id || null);
    setSchemeEditSelectedSchemes([{ scheme_name: cfg.scheme_name, fund_name: cfg.fund_name, scheme_isin: cfg.scheme_isin, category_name: cfg.category_name, risk_level: cfg.risk_level || '' }]);
    setSchemeEditPercentages({ [cfg.scheme_isin]: cfg.percentage || 0 });
    setSchemeEditSearchTerm('');
    setSchemeEditRiskFilter('');
    setSchemeEditFundFilter('');
    if (schemeAllSchemes.length === 0) fetchAllSchemesForEdit();
    riskRecommendationsModalRef.current?.close();
    setSchemeEditModalOpen(true);
  };

  const closeSchemeEditModal = () => {
    setSchemeEditModalOpen(false);
    setSchemeEditSelectedSchemes([]);
    setSchemeEditPercentages({});
    setSchemeEditIsEditMode(false);
    setSchemeEditEditingItemId(null);
    const dialog = riskRecommendationsModalRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const schemeEditTotalPercentage = () => Object.values(schemeEditPercentages).reduce((t, p) => t + (p || 0), 0);

  const handleSchemeEditPercentageChange = (isin: string, value: number) => {
    setSchemeEditPercentages(prev => ({ ...prev, [isin]: value }));
  };

  const handleSchemeEditSave = async () => {
    if (schemeEditSelectedSchemes.length === 0 || !schemeEditColorId) return;
    const totalPct = schemeEditTotalPercentage();
    if (totalPct > 100) { toastAlert('error', `Total cannot exceed 100%. Current: ${totalPct}%`); return; }
    const zeroSchemes = schemeEditSelectedSchemes.filter((s: any) => !schemeEditPercentages[s.scheme_isin] || schemeEditPercentages[s.scheme_isin] === 0);
    if (zeroSchemes.length > 0) { toastAlert('error', 'Please set allocation for all selected schemes.'); return; }

    try {
      if (schemeEditIsEditMode && schemeEditEditingItemId) {
        const s = schemeEditSelectedSchemes[0];
        const updatePayload = {
          color_id: Number(schemeEditColorId), description: '', scheme_name: s.scheme_name, fund_name: s.fund_name,
          scheme_isin: s.scheme_isin, category_name: s.category_name, risk_level: s.risk_level || '',
          percentage: schemeEditPercentages[s.scheme_isin] || 0
        };
        console.log('Update payload:', updatePayload);
        await SchemeConfigurationService.updateConfiguration(schemeEditEditingItemId, updatePayload as any);
        toastAlert('success', 'Configuration updated successfully');
      } else {
        const newConfigs = schemeEditSelectedSchemes.map((s: any) => ({
          color_id: Number(schemeEditColorId), description: '', scheme_name: s.scheme_name, fund_name: s.fund_name,
          scheme_isin: s.scheme_isin, category_name: s.category_name, risk_level: s.risk_level || '',
          percentage: schemeEditPercentages[s.scheme_isin] || 0
        }));
        console.log('Save payload:', { configurations: newConfigs });
        await SchemeConfigurationService.saveSchemeConfiguration({ configurations: newConfigs });
        toastAlert('success', 'Schemes added successfully');
      }
      closeSchemeEditModal();
      await fetchSchemeConfigData();
    } catch (err: any) {
      console.error('Scheme save error:', err);
      toastAlert('error', err.msg || err.message || 'Failed to save');
    }
  };

  const handleSchemeDelete = async (id?: number) => {
    if (!id) return;
    try {
      await SchemeConfigurationService.deleteConfiguration(id);
      toastAlert('success', 'Scheme deleted successfully');
      await fetchSchemeConfigData();
    } catch (err) { toastAlert('error', 'Failed to delete'); }
  };

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
    setRiskList,
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
  ]);

  //get all goal types

  const getGoalsTypes = async () => {
    try {
      console.log('=== STARTING GET GOAL TYPES ===');
      let goalTypes = await api.get(`/goal-plan/getAllGoalType`);
      console.log('=== GOAL TYPES RESPONSE ===');
      console.log('Goal Types Response:', goalTypes);
      console.log('Goal Types Data:', goalTypes?.data?.data);

      console.log(goalTypes, "goalTypesgoalTypes");
      setGoalTypes(goalTypes?.data?.data);
    } catch (error: any) {
      console.error('=== ERROR IN GET GOAL TYPES ===');
      console.error('Full Error:', error);
      console.error('Error Message:', error?.message);
      console.error('Error Response:', error?.response);
      console.error('Error Status:', error?.response?.status);

      // Show specific error message
      if (error?.response?.status === 500) {
        toastAlert('error', 'Server error: Unable to load goal types. Please try again later.');
      } else if (error?.response?.status === 401) {
        toastAlert('error', 'Authentication error: Please login again.');
      } else if (error?.response?.status === 404) {
        toastAlert('error', 'Goal types endpoint not found. Please contact support.');
      } else if (error?.message) {
        toastAlert('error', `Network error: ${error.message}`);
      } else {
        toastAlert('error', 'Unknown error occurred while loading goal types.');
      }

      // Don't call handleServerError to avoid generic message
      // handleServerError(error);
    }
  };

  // Retry mechanism for API calls
  const retryAPICall = async (apiCall: Function, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`API Attempt ${i + 1}/${maxRetries}`);
        const result = await apiCall();
        return result;
      } catch (error) {
        console.error(`API Attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) {
          throw error; // Re-throw on last attempt
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  //get goals list by user id
  const getGoalsList = async () => {
    try {
      console.log('=== STARTING GET GOALS ===');

      // API endpoint validation
      const apiEndpoint = `goal-plan/getAllGoalPalnList`;
      console.log('Calling API endpoint:', apiEndpoint);

      // Use retry mechanism
      const goalList = await retryAPICall(() => api.get(apiEndpoint), 3, 1000);

      console.log('=== GOAL LIST API RESPONSE ===');
      console.log('Full Response:', goalList);
      console.log('Response Status:', goalList?.status);
      console.log('Response Data:', goalList?.data);

      // Validate response structure
      if (!goalList) {
        console.error('No response from API');
        toastAlert('error', 'No response from server. Please check your connection.');
        return;
      }

      if (goalList.status !== 200 && goalList.status !== 201) {
        console.error('API returned non-200 status:', goalList.status);
        toastAlert('error', `Server returned status ${goalList.status}. Please try again.`);
        return;
      }

      if (!goalList.data) {
        console.error('No data in response:', goalList);
        toastAlert('error', 'Invalid response format from server.');
        return;
      }

      if (!goalList.data.data) {
        console.error('No data.data in response:', goalList.data);
        toastAlert('error', 'Invalid data structure from server.');
        return;
      }

      console.log('Data Structure:', goalList?.data?.data);
      console.log('Ongoing Goals:', goalList?.data?.data?.onGoingGoalDetails);
      console.log('Completed Goals:', goalList?.data?.data?.completedGoalDetails);

      const ongoingGoals = goalList?.data?.data?.onGoingGoalDetails || [];
      const completedGoals = goalList?.data?.data?.completedGoalDetails || [];

      console.log('=== GOAL DETAILS ===');
      console.log('Ongoing Goals Count:', ongoingGoals.length);
      console.log('Completed Goals Count:', completedGoals.length);

      if (ongoingGoals.length > 0) {
        console.log('Ongoing Goals List:');
        ongoingGoals.forEach((goal: any, index: number) => {
          console.log(`${index + 1}. Goal: ${goal?.goal_label}, Type: ${goal?.GoalType?.goal_name}, SIP: ${goal?.sip_amt}, Lumpsum: ${goal?.lumpsum_amt}`);
        });
      } else {
        console.log('No ongoing goals found - checking if data structure is correct');
        console.log('Expected structure: data.data.onGoingGoalDetails');
        console.log('Actual structure keys:', Object.keys(goalList?.data?.data || {}));
      }

      setOngoingGoalList(ongoingGoals);
      setCompletedGoalList(completedGoals);

      console.log('=== STATE UPDATED ===');
      console.log('Ongoing Goal List State:', ongoingGoals);
      console.log('Completed Goal List State:', completedGoals);

      // Success message
      if (ongoingGoals.length > 0) {
        toastAlert('success', `Loaded ${ongoingGoals.length} ongoing goals successfully`);
      } else {
        toastAlert('info', 'No ongoing goals found. Create your first goal!');
      }

    } catch (error: any) {
      console.error('=== ERROR IN GET GOALS ===');
      console.error('Full Error:', error);
      console.error('Error Message:', error?.message);
      console.error('Error Response:', error?.response);
      console.error('Error Status:', error?.response?.status);
      console.error('Error Data:', error?.response?.data);

      // Backend API specific error handling
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
        toastAlert('error', 'Cannot connect to server. Please check if the backend is running.');
      } else if (error?.response?.status === 500) {
        toastAlert('error', 'Backend server error. The API endpoint may be down or has an issue.');
      } else if (error?.response?.status === 404) {
        toastAlert('error', 'Goals API endpoint not found. Backend route may not be configured.');
      } else if (error?.response?.status === 401) {
        toastAlert('error', 'Authentication failed. Please login again.');
      } else if (error?.response?.status === 403) {
        toastAlert('error', 'Access denied. You may not have permission to view goals.');
      } else if (error?.message?.includes('timeout')) {
        toastAlert('error', 'Request timeout. Server may be slow or unresponsive.');
      } else if (error?.message) {
        toastAlert('error', `Network error: ${error.message}`);
      } else {
        toastAlert('error', 'Unknown error occurred while loading goals.');
      }

      // Set empty arrays as fallback
      setOngoingGoalList([]);
      setCompletedGoalList([]);
    }
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

      // Always open MF allocation for both new and edit goals
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

      // Open scheme modal without closing MF allocation
      schemeOpenModal();
      // Keep MF allocation open for goal selection and updates
    } catch (error) {
      handleServerError(error);
    }
  };

  const handleBackSchemeModel = () => {
    // // MFAllcationOpenModal();
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
    // // MFAllcationOpenModal();
    setselectedSuggestedScheme({});
  };

  const handleBackMFAllocation = () => {
    MFAllcationCloseModal();
    // Focus on ongoing goals section
    const ongoingGoalsElement = document.getElementById('ongoing-goals-section');
    if (ongoingGoalsElement) {
      ongoingGoalsElement.scrollIntoView({ behavior: 'smooth' });
    }
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

        // Refresh goal list to show updated goal
        getGoalsList();

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

      // Only open MF allocation for editing, not for new goals
      if (editForm) {
        MFAllcationOpenModal();
      }
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

        toastAlert("success", "Goal Planning updated");

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
    // // MFAllcationOpenModal();
    newGoalCloseModal();
  };

  const handleExecuteNow = async (item: any) => {
    try {

      console.log(item, "itemitemitem")

      let resData: any = await api.get(
        `/goal-plan/getGoalPlanWiseSchemeData/${item?.id}`
      );

      // let data: any = resData.data.data;

      console.log(resData, "resDataresDataresData")

      const mfuScheme = await searchByISIN(resData?.data?.data?.schemeList[0]?.SchemeMaster?.schemeISIN)

      let transType = null;
      let amount = null;
      let startDate = null;
      let startMonth = null;
      let startYear = null;
      let endMonth = null;
      let endYear = null;
      if (item?.sip_amt > 0) {
        amount = item?.sip_amt;
        transType = "V";
        startDate = new Date().getDate() + 7;
        startMonth = new Date().getMonth() + 1;
        startYear = new Date().getFullYear();
        endMonth = new Date().getMonth() + 1;
        endYear = new Date().getFullYear() + (item?.sip_duration_mts / 12);
      } else if (item?.lumpsum_amt > 0) {
        amount = item?.lumpsum_amt;
        transType = "B";
        startDate = null;
        startMonth = null;
        startYear = null;
        endMonth = null;
        endYear = null;
      }


      const txnData = mfuScheme?.data?.data?.data.filter((item: any) => item.txn_type === transType);
      console.log("Filtered Transaction Data:", txnData);

      /*sip_amt
      :
      20489
      sip_duration_mts
      :
      120*/


      let data: any = resData.data.data;
      let payload: any = {
        goal_id: item?.id,
        scheme_id: data?.schemeList[0]?.scheme_id,
        frequency: "M",
        trans_type: transType === "B" ? "1" : "2",
        trans_amount: amount,
        day: startDate,
        start_month: startMonth,
        start_year: startYear,
        end_month: endMonth,
        end_year: endYear,
        rta_amc_code: txnData[0]?.fund_code,
        rta_sch_code: txnData[0]?.scheme_code,
        out_rta_sch_code: "",
        tx_vol_type: "A",
        vol: amount,
        div_option: txnData[0]?.div_opt,

      }

      addToCart(payload);

      /*let schemeList = data?.schemeList?.map((scheme: any) => {
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
      }*/
      console.log(payload, "payloadpayload")

    } catch (error) {
      console.log(error, "execute error");
      handleServerError(error);
    }
  }


  //added by rakesh sinha on dated 07-04-2026

  const addToCart = async (schemeData: any) => {

    try {
      const userData: any = getLS(USER_DATA);

      let CartObj = {
        user_id: Number(userData?.id),
        investor_id: Number(userData?.InvestorRegistration?.id),
        account_holding_id: 0,
        cart_type: 1,
        scheme_id: schemeData?.scheme_id,
        trans_type: schemeData?.transaction_type,
        trans_amount: schemeData?.amount,
        frequency: schemeData?.frequency,
        day: schemeData?.day,
        start_month: schemeData?.start_month,
        start_year: schemeData?.start_year,
        end_month: schemeData?.end_month,
        end_year: schemeData?.end_year,
        rta_amc_code: schemeData?.rta_amc_code,
        rta_sch_code: schemeData?.rta_sch_code,
        out_rta_sch_code: schemeData?.out_rta_sch_code,
        tx_vol_type: schemeData?.tx_vol_type,
        vol: schemeData?.vol,
        div_option: schemeData?.div_option,
        goal_id: schemeData?.goal_id,
      };
      console.log("Cart Object :- ", CartObj)
      //setIsCartAdded(true);

      let addCartData = await api.post(`/cart/addfundExploreCardData`, CartObj);
      if (addCartData.data.data) {
        toastAlert("success", "Added To Cart");
        document.location.href = "/my-cart";
        //setCartCounter(cartCounter + 1);
      } else {
        toastAlert("info", "Unable to add in cart, please try again later!");
      }

    } catch (error) {
      handleServerError(error);
    }
  };

  //end


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
    setSelectedGoalDetail(item);
    goalDetailModalRef.current?.showModal();
    // router.push(`/goal-detail?id=${item.id}`);
    // router.push(`/risk-profile`);
  };

  // Retake Assessment Functions
  const handleRetakeAssessment = () => {
    setShowRetakeAssessment(true);
    getRetakeQuestions();
  };

  const getRetakeQuestions = async () => {
    try {
      const response = await api.get(`/risk-profile/getAllRiskQuestion`);
      console.log(response.data?.data, "retake questions response");
      setRetakeQuestions(response.data?.data);
    } catch (error) {
      console.error("Error fetching retake questions:", error);
      handleServerError(error);
    }
  };

  const enableNextRetakeQuestion = (currentIndex: number) => {
    if (
      currentIndex + 1 < retakeQuestions.length &&
      !retakeEnabledQuestions.includes(currentIndex + 1)
    ) {
      setRetakeEnabledQuestions((prev) => [...prev, currentIndex + 1]);
    }
  };

  const isRetakeQuestionAnswered = (questionId: number) => {
    return (
      retakeSelectedOptions[questionId] !== undefined &&
      retakeSelectedOptions[questionId] !== ""
    );
  };

  const handleRetakeOptionChange = (event: any, id: any, questionIndex: number) => {
    const { value } = event.target;

    setRetakeSelectedOptions({
      ...retakeSelectedOptions,
      [id]: value,
    });

    // Enable next question
    enableNextRetakeQuestion(questionIndex);

    // Auto-collapse current and expand next
    if (questionIndex + 1 < retakeQuestions.length) {
      setRetakeExpandedIndex(questionIndex + 1);
    }
  };

  const allRetakeQuestionsAnswered = () => {
    return retakeQuestions.every((question: any) => isRetakeQuestionAnswered(question.id));
  };

  const handleRetakeSubmit = async () => {
    setRetakeLoading(true);
    const dataToSubmit = retakeQuestions?.map((question: any) => {
      const selectedAnswer = retakeSelectedOptions[question?.id];

      const findQuestionById = (id: any) => {
        return retakeQuestions?.find((question: any) => question.id === id);
      };

      let question_s: any = findQuestionById(question.id);
      let point = 0;

      // Determine points based on type of question and selected answer
      if (question.question_type === 1) {
        const answerObj = question.RiskProfileAnswers.find(
          (answer: any) => answer.answer === selectedAnswer
        );
        point = answerObj ? answerObj.point : 0;
      }

      let obj = {
        queId: question.id,
        queType: question.question_type,
        selectedAnswer: selectedAnswer,
        point: point,
      };

      return obj;
    });

    try {
      const payload = {
        answerList: dataToSubmit,
      };

      const res = await api.post(`/risk-profile/add-question-answer`, payload);
      if (res.data.data) {
        // Update risk profile data
        setRiskList(res.data?.data?.userRiskProfileData);
        const user = getLS(USER_DATA);
        user.UserRiskProfile = res.data?.data?.userRiskProfileData;
        setLS(USER_DATA, user);

        // Close retake assessment and show success
        setShowRetakeAssessment(false);
        setRetakeSelectedOptions({});
        setRetakeEnabledQuestions([0]);
        setRetakeExpandedIndex(0);
        setRetakeLoading(false);

        toastAlert("success", "Risk profile updated successfully!");

        // Refresh goal types and goals list with new risk profile
        getGoalsTypes();
        getGoalsList();
      }
    } catch (error) {
      setRetakeLoading(false);
      handleServerError(error);
    }
  };

  const closeRetakeAssessment = () => {
    setShowRetakeAssessment(false);
    setRetakeSelectedOptions({});
    setRetakeEnabledQuestions([0]);
    setRetakeExpandedIndex(0);
  };




  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Risk Alert model */}

      <dialog id="my_modal_1" className="modal" ref={riskAlertModalRef}>
        <div className="modal-box bg-[#111111] border border-[#3A3A3A]">
          <h3 className="text-lg font-bold text-[#F9FAFB]">Hello!</h3>
          <p className="py-4 text-[#E5E7EB]">
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
      <div className="bg-[#111111]">
        <div className="flex sm:gap-4 items-center justify-between pl-2 pr-4 bg-[#111111]">
          <div className="flex items-center gap-4">
            <CustomBackButton onClick={() => window.history.back()}>
              <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
            </CustomBackButton>

            <div className="flex items-center gap-2">
              {/* Enhanced Risk Profile Display */}
              <div className="flex items-center gap-3 bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 shadow-sm">
                {riskListData?.risk_type ? (
                  <>
                    <div className="flex items-center gap-2">
                      {/* Risk Level Icon and Badge */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${riskListData.risk_type.toLowerCase() === 'high'
                        ? 'bg-red-100'
                        : riskListData.risk_type.toLowerCase() === 'moderate'
                          ? 'bg-amber-100'
                          : 'bg-green-100'
                        }`}>
                        {riskListData.risk_type.toLowerCase() === 'high' ? (
                          <FaChartLine className={`text-sm ${riskListData.risk_type.toLowerCase() === 'high'
                            ? 'text-red-600'
                            : riskListData.risk_type.toLowerCase() === 'moderate'
                              ? 'text-amber-600'
                              : 'text-green-600'
                            }`} />
                        ) : riskListData.risk_type.toLowerCase() === 'moderate' ? (
                          <FaBalanceScale className={`text-sm ${riskListData.risk_type.toLowerCase() === 'high'
                            ? 'text-red-600'
                            : riskListData.risk_type.toLowerCase() === 'moderate'
                              ? 'text-amber-600'
                              : 'text-green-600'
                            }`} />
                        ) : (
                          <FaShieldAlt className={`text-sm ${riskListData.risk_type.toLowerCase() === 'high'
                            ? 'text-red-600'
                            : riskListData.risk_type.toLowerCase() === 'moderate'
                              ? 'text-amber-600'
                              : 'text-green-600'
                            }`} />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs text-[#9CA3AF] font-medium">Risk Profile</span>
                        <span className={`text-sm font-bold ${riskListData.risk_type.toLowerCase() === 'high'
                          ? 'text-red-700'
                          : riskListData.risk_type.toLowerCase() === 'moderate'
                            ? 'text-amber-700'
                            : 'text-green-700'
                          }`}>
                          {riskListData.risk_type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Risk Progress Indicator */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${riskListData.risk_type.toLowerCase() === 'high' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                      <div className={`w-2 h-2 rounded-full ${riskListData.risk_type.toLowerCase() === 'moderate' ? 'bg-amber-500' : 'bg-gray-300'
                        }`}></div>
                      <div className={`w-2 h-2 rounded-full ${riskListData.risk_type.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1F1A1A] rounded-full flex items-center justify-center">
                      <FaQuestionCircle className="text-[#6B7280] text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-[#9CA3AF] font-medium">Risk Profile</span>
                      <span className="text-sm font-bold text-[#E5E7EB]">Not Assessed</span>
                    </div>
                  </div>
                )}
              </div>

              <CustomButton
                className="btn-sm px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg transition-colors"
                onClick={handleRetakeAssessment}
              >
                {riskListData?.risk_type ? 'Update Profile' : 'Take Assessment'}
              </CustomButton>
            </div>
          </div>

          <div className="sm:p-4 bg-[#111111]">
            {/* Tabs */}
            <div role="tablist" className="tabs tabs-bordered flex sm:gap-2">
              {tabs.map((tab: any, index: number) => (
                <div key={tab} className="flex items-center">
                  <a
                    role="tab"
                    className={`tab border-none px-0 lg:px-2 py-2 font-montserrat ${activeTab === tab
                      ? "tab-active text-primary font-medium text-base lg:text-2xl hover:text-primary lg:-mt-1"
                      : "text-sm text-[#9CA3AF] hover:text-[#F59E0B] mt-1 font-medium"
                      }`}
                    onClick={() => {
                      setActiveTab(tab);
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

          {/* Risk Profile Recommendations Section - opens Scheme Configuration modal */}
          {riskListData?.risk_type && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${riskListData.risk_type.toLowerCase() === 'high'
                      ? 'bg-red-100'
                      : riskListData.risk_type.toLowerCase() === 'moderate'
                        ? 'bg-amber-100'
                        : 'bg-green-100'
                      }`}>
                      {riskListData.risk_type.toLowerCase() === 'high' ? (
                        <FaChartLine className="text-red-600 text-sm" />
                      ) : riskListData.risk_type.toLowerCase() === 'moderate' ? (
                        <FaBalanceScale className="text-amber-600 text-sm" />
                      ) : (
                        <FaShieldAlt className="text-green-600 text-sm" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F9FAFB]">
                        {riskListData.risk_type.toUpperCase()} Risk Profile
                      </h3>
                      <p className="text-sm text-[#9CA3AF]">
                        {riskListData.risk_type.toLowerCase() === 'high'
                          ? 'Aggressive growth strategy with higher potential returns and volatility'
                          : riskListData.risk_type.toLowerCase() === 'moderate'
                            ? 'Balanced approach with moderate growth and stability'
                            : 'Conservative strategy focused on capital preservation and steady growth'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={riskRecommendationsOpenModal}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View Detailed Recommendations
                      <MdKeyboardArrowRight className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Border line */}
      <div className="border-b border-[#3A3A3A]"></div>

      {/* Tab content */}
      <div className="p-4 bg-[#111111]">
        {/* New Goal Tab Content - Includes All Goals */}

        {activeTab === "New Goal" && (
          <div>
            {/* Goal Types Selection */}
            {goalTypes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {goalTypes.map((item: any, idx: number) => (
                  <div key={idx}>
                    <div
                      className="group border border-[#3A3A3A] rounded-lg p-2 h-36 flex flex-col items-center  justify-center relative hover:shadow-xl transition cursor-pointer bg-[#111111]"
                      onClick={() => handleNewGoal(item)}
                    >
                      <img
                        // src={`${publicPathName}/goalplanning/${item.goal_icon}`}
                        //src={`${NODE_API_URL}/static/goalplanning/${item.goal_icon}`}
                        src={`/goalplanning/${item.goal_icon}`}
                        alt={item.goal_name}
                        className="max-h-full max-w-full object-contain"
                      />

                      <span className="absolute bottom-0 right-0 bg-primary text-[#F9FAFB] text-xs px-3 py-1 rounded-br-lg rounded-tl-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity  duration-200">
                        Start
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-center mt-2 text-[#F9FAFB]">
                        {item.goal_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center text-[#F9FAFB]">
                No Data Found!
              </div>
            )}

            {/* Ongoing Goals Section */}
            <div id="ongoing-goals-section" className="mt-8">
              <div className="border border-[#3A3A3A] rounded-lg bg-[#111111]">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                  onClick={() => setOngoingDropdownOpen(!ongoingDropdownOpen)}
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-[#F9FAFB]">Ongoing Goals</h3>
                    <span className="text-sm text-[#F9FAFB]">{filteredOngoingCount} active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      {[
                        { id: "all", label: "All" },
                        { id: "sip", label: "SIP" },
                        { id: "lumpsum", label: "Lumpsum" }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOngoingFilter(filter.id);
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${ongoingFilter === filter.id
                            ? "bg-[#F59E0B] text-[#F9FAFB]"
                            : "bg-[#2A2A2A] text-[#F9FAFB]"
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    {ongoingDropdownOpen ? (
                      <MdKeyboardArrowUp className="text-[#F9FAFB] text-xl" />
                    ) : (
                      <MdKeyboardArrowDown className="text-[#F9FAFB] text-xl" />
                    )}
                  </div>
                </div>
                {ongoingDropdownOpen && (
                  <div className="px-4 pb-4">
                    {filteredOngoingData.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredOngoingData.map((item: any, index: number) => {
                          const achievedPer =
                            (item?.totalAlloc?.Current / item?.target_amt) * 100;
                          console.log(achievedPer, "achievedPerachievedPer");
                          return (
                            <div
                              className="relative border border-[#3A3A3A] rounded-lg p-5 bg-[#111111]"
                              key={index}
                            >
                              <span className="absolute top-0 right-0 bg-secondary text-[#F9FAFB] text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                                {achievedPer > 0 ? `Initiated` : `Not Initiated`}
                              </span>
                              <div>
                                <CustomText className="text-sm font-semibold font-montserrat text-[#F9FAFB]">
                                  {item?.goal_label}
                                </CustomText>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">
                                  Category: {item?.GoalType?.goal_name}
                                </CustomText>
                                {item?.sip_amt > 0 ? (
                                  <div className="badge bg-secondary-content text-[#F9FAFB] text-xs">
                                    SIP
                                  </div>
                                ) : (
                                  <div className="badge bg-secondary-content text-[#F9FAFB] text-xs">
                                    Lumpsum
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">Target</CustomText>
                                <div className="flex-grow border-b border-[#3A3A3A] mx-2"></div>
                                <div className="text-[#F9FAFB] text-lg font-semibold">
                                  ₹{item?.target_amt}
                                </div>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">
                                  Current Value
                                </CustomText>
                                <div className="flex-grow border-b border-[#3A3A3A] mx-2"></div>
                                <div className="text-[#F9FAFB] text-lg font-semibold">
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
                                  <CustomText className="text-xs font-medium  p-1 bg-[#111111] rounded-md text-[#F9FAFB]">
                                    Achieved
                                  </CustomText>
                                  <div className="text-sm font-semibold bg-[#111111] p-1 rounded-md text-[#F9FAFB]">
                                    {formatNumber(achievedPer)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">
                                    Invested
                                  </CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold">
                                    {item?.totalAlloc?.Invested ? (
                                      <> ₹ {item?.totalAlloc?.Invested}</>
                                    ) : (
                                      <>₹0</>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">Months</CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold text-right">
                                    {item?.totalAlloc?.transaction_month || 0}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">
                                    Recommended
                                  </CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold">
                                    ₹
                                    {item?.sip_amt > 0
                                      ? item?.sip_amt
                                      : item?.lumpsum_amt}
                                  </div>
                                </div>
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">Months</CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold text-right">
                                    {item?.duration_mts || item?.sip_duration_mts}
                                  </div>
                                </div>
                              </div>
                              <div className="border border-b border-[#3A3A3A] my-3"></div>
                              {achievedPer > 0 ? (
                                <div className="text-center">
                                  <CustomButton
                                    className="rounded-xl"
                                    type="button"
                                  // onClick={() => handleViewGoalDetail(item)}
                                  >
                                    View Detail
                                  </CustomButton>
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
                    ) : (
                      <div className="flex justify-center items-center text-[#F9FAFB]">
                        No Data Found!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Completed Goals Section */}
            <div className="mt-8">
              <div className="border border-[#3A3A3A] rounded-lg bg-[#111111]">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                  onClick={() => setCompletedDropdownOpen(!completedDropdownOpen)}
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-[#F9FAFB]">Completed Goals</h3>
                    <span className="text-sm text-[#F9FAFB]">{filteredCompletedCount} achieved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      {[
                        { id: "all", label: "All" },
                        { id: "recent", label: "Recent" }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompletedFilter(filter.id);
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${completedFilter === filter.id
                            ? "bg-[#F59E0B] text-[#F9FAFB]"
                            : "bg-[#2A2A2A] text-[#F9FAFB]"
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    {completedDropdownOpen ? (
                      <MdKeyboardArrowUp className="text-[#F9FAFB] text-xl" />
                    ) : (
                      <MdKeyboardArrowDown className="text-[#F9FAFB] text-xl" />
                    )}
                  </div>
                </div>
                {completedDropdownOpen && (
                  <div className="px-4 pb-4">
                    {filteredCompletedData.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredCompletedData.map((item: any, index: number) => {
                          const achievedPer =
                            (item?.totalAlloc?.Current / item?.target_amt) * 100;

                          return (
                            <div
                              className="relative border border-[#3A3A3A] rounded-lg p-5 bg-[#111111]"
                              key={index}
                            >
                              <span className="absolute top-0 right-0 bg-secondary text-[#F9FAFB] text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                                {achievedPer > 0 ? `Initiated` : `Not Initiated`}
                              </span>
                              <div>
                                <CustomText className="text-sm font-semibold font-montserrat text-[#F9FAFB]">
                                  {item?.goal_label}
                                </CustomText>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">
                                  Category: {item?.GoalType?.goal_name}
                                </CustomText>
                                {item?.sip_amt > 0 ? (
                                  <div className="badge bg-secondary-content text-[#F9FAFB] text-xs">
                                    SIP
                                  </div>
                                ) : (
                                  <div className="badge bg-secondary-content text-[#F9FAFB] text-xs">
                                    Lumpsum
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">Target</CustomText>
                                <div className="flex-grow border-b border-[#3A3A3A] mx-2"></div>
                                <div className="text-[#F9FAFB] text-lg font-semibold">
                                  ₹{item?.target_amt}
                                </div>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <CustomText className="text-xs text-[#F9FAFB]">
                                  Current Value
                                </CustomText>
                                <div className="flex-grow border-b border-[#3A3A3A] mx-2"></div>
                                <div className="text-[#F9FAFB] text-lg font-semibold">
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
                                  <CustomText className="text-xs font-medium  p-1 bg-[#111111] rounded-md text-[#F9FAFB]">
                                    Achieved
                                  </CustomText>
                                  <div className="text-sm font-semibold bg-[#111111] p-1 rounded-md text-[#F9FAFB]">
                                    {formatNumber(achievedPer)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">
                                    Invested
                                  </CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold">
                                    {item?.totalAlloc?.Invested ? (
                                      <> ₹ {item?.totalAlloc?.Invested}</>
                                    ) : (
                                      <>₹0</>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">Months</CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold text-right">
                                    {item?.totalAlloc?.transaction_month || 0}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">
                                    Recommended
                                  </CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold">
                                    ₹{" "}
                                    {item?.sip_amt > 0
                                      ? item?.sip_amt
                                      : item?.lumpsum_amt}
                                  </div>
                                </div>
                                <div>
                                  <CustomText className="text-xs text-[#F9FAFB]">Months</CustomText>
                                  <div className="text-[#F9FAFB] text-base font-semibold text-right">
                                    {item?.duration_mts || item?.sip_duration_mts}
                                  </div>
                                </div>
                              </div>
                              <div className="border border-b border-[#3A3A3A] my-3"></div>
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
                    ) : (
                      <div className="flex justify-center items-center text-[#F9FAFB]">
                        {/* <CustomLoading /> */}
                        No Data Found!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Goal model   first tab */}

      <dialog id="my_modal" className="modal" ref={addNewGoalModalRef}>
        <div className="modal-box max-w-2xl bg-[#111111] border border-[#3A3A3A]">
          <form method="dialog" className="modalHeader">
            <div className="flex-1 sm:flex justify-between">
              <h3 className="modalTitle text-[#F9FAFB]">{GoalType?.goal_name}</h3>
              <CustomText className="text-[#F9FAFB]">
                Risk Profile - {riskListData?.risk_type}
              </CustomText>
            </div>
            <div className="">
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={handleCloseFirstModal}
              >
                <MdClose size={25} className="text-[#F9FAFB]" />
              </button>
              {/* <CustomText className="text-[#F59E0B]">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div className="modalBody">
            <div className="sm:flex justify-between items-center mt-4">
              <CustomLabel className="text-[#F9FAFB]">Title</CustomLabel>
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
            <div className="border-b border-[#3A3A3A]/30 my-4"></div>
            <div className="sm:flex justify-between items-center  mt-4">
              <CustomLabel className="text-[#F9FAFB]">
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
            <div className="border-b border-[#3A3A3A]/30 my-4"></div>
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
                  <div className="badge bg-secondary mb-2 rounded-full text-[#F9FAFB] absolute left-1/2 bottom-3 -translate-x-1/2">
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
            <div className="border-b border-[#3A3A3A]/30 my-4"></div>
            <div className="sm:flex justify-between  mt-4">
              <CustomLabel className="text-[#F9FAFB]">
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
                <div className="border-b border-[#3A3A3A] mt-4"></div>
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
                      <div className="text-[#F9FAFB]">
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
                      <div className="text-[#F9FAFB]">₹&nbsp;{rest?.sipAmt}</div>
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
                  className="bg-[#111111] !text-[#F9FAFB] !border !border-[#3A3A3A] w-32 shadow-none"
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
        <div className="modal-box max-w-7xl min-h-[700px] bg-[#111111] border border-[#3A3A3A]">
          <form method="dialog" className="modalHeader">
            <h3 className="text-lg font-montserrat text-[#F9FAFB]">MF Allocation</h3>
            {/* <button className="btn btn-md btn-circle btn-ghost">✕</button> */}
            <div className="flex gap-5 justify-center items-center">
              {/* <CustomText className="text-[#F59E0B]">
                Risk Profile - Moderate
              </CustomText> */}
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={() => {
                  MFAllcationOpenModal(), suggestedSchemeOpenModal();
                }}
              >
                <MdClose size={25} className="text-[#F9FAFB]" />
              </button>
              {/* <CustomText className="text-[#F59E0B]">{riskListData[0]?.risk_type}</CustomText> */}
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
              <div className="border-r border-[#3A3A3A] h-auto mx-2" />
              <div className="lg:w-3/4 p-2">
                <div className="font-montserrat text-lg font-semibold">
                  <CustomText className="text-[#F9FAFB]">Suggested Investments</CustomText>
                </div>
                <div className="mt-6 overflow-y-auto">
                  {schemeData && schemeData.length > 0 ? (
                    <>
                      {schemeData.map((data: any, index: number) => {
                        return (
                          <Fragment key={index}>
                            <div className="underline">
                              <CustomText className="font-semibold text-[#F9FAFB]">
                                {data?.SchemeCategory?.Name} -{" "}
                                {data?.SchemeSubcategory?.Name}
                              </CustomText>
                            </div>
                            <div className="my-5 grid grid-cols-12 gap-1">
                              <div className="col-span-12 lg:col-span-3">
                                <CustomText className="labelValue text-[#F9FAFB]">
                                  Scheme
                                </CustomText>
                                <CustomText className="text-sm text-[#F9FAFB]">
                                  {data?.SchemeMaster?.ms_fullname}
                                </CustomText>
                              </div>
                              <div className="col-span-3 lg:col-span-2 lg:ps-3">
                                <CustomText className="labelValue text-start mb-1 text-[#F9FAFB]">
                                  Rating
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
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
                                  <CustomText className="labelValue text-[#F9FAFB]">
                                    Return 1y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Return1yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue text-[#F9FAFB]">
                                    Return 3y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Returns3yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue text-[#F9FAFB]">
                                    Return 5y
                                  </CustomText>
                                  <CustomText className="flex items-center gap-2 mx-auto text-sm text-[#F9FAFB]">
                                    {toFixedDataForReturn(
                                      data?.SchemeMaster?.SchemePerformances[0]
                                        ?.Returns5yr
                                    )}
                                  </CustomText>
                                </div>
                                <div className="p-2 -mt-2 rounded-md col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue text-[#F9FAFB]">
                                    Weightage
                                  </CustomText>
                                  <CustomText className="text-sm text-[#F9FAFB]">
                                    {data?.weightage}%
                                  </CustomText>
                                </div>
                                <div className="p-2 -mt-2 rounded-md col-span-1 lg:col-span-1">
                                  <CustomText className="labelValue text-[#F9FAFB]">
                                    Amount
                                  </CustomText>
                                  <CustomText className="text-sm text-[#F9FAFB]">
                                    {/* &#8377;{" "} */}₹
                                    {rest?.sipLumpSelected === "sip"
                                      ? data?.sip_amount
                                      : data?.lumpsum_amount}
                                  </CustomText>
                                </div>
                                <div
                                  className="col-span-1 lg:col-span-1"
                                >
                                  <CustomButton
                                    className="btn-sm text-[#F9FAFB] rounded-lg border-0 shadow-none"
                                    onClick={() =>
                                      handleChangeScheme(data, index)
                                    }
                                  >
                                    Change
                                  </CustomButton>
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-[#F9FAFB]">No Data Found!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modalFooter">
            <div className="text-center">
              <CustomButton
                className="bg-[#1F1A1A] !text-[#F9FAFB] !border !border-[#3A3A3A] w-36 shadow-none"
                onClick={handleBackMFAllocation}
              >
                Back
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
        <div className="modal-box text-center bg-[#111111] border border-[#3A3A3A]">
          <div className="flex justify-center text-center my-2">
            <MdError className="text-red-600 w-14 h-14" />
          </div>
          <h3 className="text-xl font-bold text-[#F9FAFB]">Are you sure?</h3>
          <p className="py-4 text-[#F9FAFB]">you want to cancel this process.</p>
          <div className="modal-action flex gap-5 justify-center items-center text-center">
            <form
              method="dialog"
              className="flex gap-5 justify-center items-center text-center"
            >
              <div className="mt-4 text-center">
                <CustomButton
                  className="bg-[#111111] !text-[#F9FAFB] !border !border-[#3A3A3A] w-28 shadow-none"
                  onClick={() => {
                    suggestedSchemeCloseModal(), // MFAllcationOpenModal();
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
        <div className="modal-box p-0 max-w-7xl bg-[#111111] border border-[#3A3A3A]">
          <form
            method="dialog"
            className="flex justify-between items-center px-5 py-3 border-b border-[#3A3A3A]"
          >
            <h3 className="text-lg font-montserrat text-[#F9FAFB]">Suggested Investments</h3>
            {/* <button className="btn btn-md btn-circle btn-ghost">✕</button> */}
            <div className="flex gap-5 justify-center items-center">
              {/* <CustomText className="text-[#F59E0B]">
                Risk Profile - Moderate
              </CustomText> */}
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={handleBackSchemeModel}
              >
                <MdClose size={25} className="text-[#F9FAFB]" />
              </button>
              {/* <CustomText className="text-[#F59E0B]">{riskListData[0]?.risk_type}</CustomText> */}
            </div>
          </form>
          <div></div>
          <div className="border-b border-[#3A3A3A]"></div>
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
                                  <CustomText className="text-xs font-semibold text-[#F9FAFB]">
                                    Scheme
                                  </CustomText>
                                  <CustomText className="text-sm text-[#F9FAFB]">
                                    {data?.ms_fullname}
                                  </CustomText>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <CustomText className="text-xs text-center font-semibold text-[#F9FAFB]">
                                  AUM
                                </CustomText>
                                <CustomText className="flex justify-center items-center gap-2 text-sm text-[#F9FAFB]">
                                  {convertToCrores(
                                    data?.SchemePerformances[0]?.AUM
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-2">
                                <CustomText className="text-xs font-semibold text-[#F9FAFB]">
                                  Rating
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
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
                                <CustomText className="text-xs font-semibold text-[#F9FAFB]">
                                  Return 1y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Return1yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-1">
                                <CustomText className="text-xs font-semibold text-[#F9FAFB]">
                                  Return 3y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 text-sm text-[#F9FAFB]">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Returns3yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                              <div className="col-span-1">
                                <CustomText className="text-xs font-semibold text-[#F9FAFB]">
                                  Return 5y
                                </CustomText>
                                <CustomText className="flex items-center gap-2 mx-auto text-sm text-[#F9FAFB]">
                                  {toFixedDataForReturn(
                                    data?.SchemePerformances[0]
                                      ? data?.SchemePerformances[0]?.Returns5yr
                                      : 0
                                  )}
                                </CustomText>
                              </div>
                            </div>
                            <div className="border-b border-[#3A3A3A] mt-2"></div>
                          </Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-[#F9FAFB]">No Data Found!</div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-b border-[#3A3A3A]"></div>
            <div className="flex justify-center gap-3">
              <div className="my-4 text-center">
                <CustomButton
                  className="bg-[#1F1A1A] !text-[#F9FAFB] !border !border-[#3A3A3A] w-36 shadow-none"
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
        <div className="modal-box text-center bg-[#111111] border border-[#3A3A3A]">
          <div className="flex justify-center text-center my-2">
            <MdError className="text-red-600 w-14 h-14" />
          </div>
          <h3 className="text-xl font-bold text-[#F9FAFB]">Delete Goal</h3>
          <p className="py-4 text-[#F9FAFB]">Are you sure you want to delete this goal?</p>
          <div className="modal-action flex gap-5 justify-center items-center text-center">
            <form
              method="dialog"
              className="flex gap-5 justify-center items-center text-center"
            >
              <div className="mt-4 text-center">
                <CustomButton
                  className="bg-[#111111] !text-[#F9FAFB] !border !border-[#3A3A3A] w-28 shadow-none"
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

      {/* Goal Detail Popup */}
      <dialog id="goal_detail_modal" className="modal" ref={goalDetailModalRef}>
        <div className="modal-box max-w-6xl bg-[#111111] border border-[#3A3A3A] max-h-[85vh] overflow-y-auto">
          <form method="dialog" className="modalHeader">
            <div className="flex justify-between items-center px-5 py-3 border-b border-[#3A3A3A]">
              <h3 className="text-lg font-montserrat text-[#F9FAFB]">Goal Details</h3>
              <button
                className="btn btn-md btn-circle btn-ghost"
                onClick={() => goalDetailModalRef.current?.close()}
              >
                <MdClose size={25} className="text-[#F9FAFB]" />
              </button>
            </div>
          </form>

          <div className="p-6">
            {selectedGoalDetail && (
              <>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Sidebar */}
                  <div className="lg:w-1/4 w-full">
                    <div className="flex flex-col items-center">
                      {selectedGoalDetail?.GoalType?.goal_icon && (
                        <img
                          src={`/goalplanning/${selectedGoalDetail?.GoalType?.goal_icon}`}
                          alt={selectedGoalDetail?.GoalType?.goal_name}
                          className="w-32 h-32 object-contain mb-4"
                        />
                      )}
                      <CustomText className="text-lg font-semibold font-montserrat text-[#F9FAFB] text-center mb-3">
                        {selectedGoalDetail?.goal_label}
                      </CustomText>
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <CustomText className="text-xs text-[#F9FAFB]">
                          Category: {selectedGoalDetail?.GoalType?.goal_name}
                        </CustomText>
                        {selectedGoalDetail?.sip_amt > 0 ? (
                          <div className="badge bg-secondary-content/10 text-[#F9FAFB] text-xs">
                            SIP
                          </div>
                        ) : (
                          <div className="badge bg-secondary-content/10 text-[#F9FAFB] text-xs">
                            Lumpsum
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <CustomText className="text-sm font-semibold text-[#F9FAFB]">
                          Your Goal Progress
                        </CustomText>
                        <CustomText className="text-sm font-semibold text-[#F9FAFB]">
                          Duration 6 Months
                        </CustomText>
                      </div>
                      <div>
                        <progress
                          className="progress w-full progress-primary rounded-none bg-mainbackground"
                          value={`10`}
                          max="100"
                        ></progress>
                      </div>
                      <div className="text-center">
                        <CustomText className="text-base font-semibold text-[#F9FAFB]">
                          Target Amount ₹ &nbsp;{selectedGoalDetail?.target_amt?.toLocaleString()}
                        </CustomText>
                      </div>
                      <div className="flex justify-between text-sm">
                        <CustomText className="text-[#F9FAFB]">Recommended</CustomText>
                        <CustomText className="text-[#F9FAFB]">₹ {selectedGoalDetail?.calc_amt?.toLocaleString()}</CustomText>
                      </div>
                      <div className="flex justify-between text-sm">
                        <CustomText className="text-[#F9FAFB]">Invested</CustomText>
                        <CustomText className="text-[#F9FAFB]">
                          ₹ {(selectedGoalDetail?.totalAlloc?.Invested || 0).toLocaleString()}
                        </CustomText>
                      </div>
                      <div className="flex justify-between text-sm">
                        <CustomText className="text-[#F9FAFB]">Current</CustomText>
                        <CustomText className="text-[#F9FAFB]">
                          ₹ {(selectedGoalDetail?.totalAlloc?.Current || 0).toLocaleString()}
                        </CustomText>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block border-r border-accent" />

                  {/* Right Content */}
                  <div className="lg:w-3/4 w-full">
                    <div className="mb-4">
                      <CustomText className="font-montserrat text-lg font-semibold text-[#F9FAFB]">
                        Suggested Investments
                      </CustomText>
                    </div>
                    <div className="overflow-x-auto">
                      {selectedGoalDetail?.GoalPlanUserAllocs &&
                        selectedGoalDetail?.GoalPlanUserAllocs.length > 0 ? (
                        <div className="space-y-4">
                          {selectedGoalDetail?.GoalPlanUserAllocs?.map(
                            (data: any, index: number) => {
                              return (
                                <div key={index} className="bg-[#1a1a1a] rounded-lg p-4">
                                  <div className="mb-3">
                                    <CustomText className="font-semibold text-[#F9FAFB] underline">
                                      {data?.SchemeCategory?.Name} -{" "}
                                      {data?.SchemeSubcategory?.Name}
                                    </CustomText>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Scheme</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB]">
                                        {data?.SchemeMaster?.ms_fullname}
                                      </CustomText>
                                    </div>
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Folio</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB]">
                                        {data?.folio_no || "-"}
                                      </CustomText>
                                    </div>
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Invested Value</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB]">
                                        ₹ {(data?.amount || 0).toLocaleString()}
                                      </CustomText>
                                    </div>
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Units</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB]">
                                        {data?.units || 0}
                                      </CustomText>
                                    </div>
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Current Value</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB]">
                                        ₹ {(isNaN(data?.units * data?.nav) ? 0 : data?.units * data?.nav).toLocaleString()}
                                      </CustomText>
                                    </div>
                                    <div>
                                      <CustomText className="text-xs text-[#F9FAFB] mb-1">Total Gain</CustomText>
                                      <CustomText className="text-sm text-[#F9FAFB] font-semibold">
                                        ₹ {(isNaN(data?.units * data?.nav - data?.amount) ? 0 : data?.units * data?.nav - data?.amount).toLocaleString()}
                                      </CustomText>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="text-[#F9FAFB] text-center py-8">No Data Found!</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Back Button inside popup */}
                <div className="border-t border-[#3A3A3A] mt-6 pt-4">
                  <div className="flex justify-center">
                    <CustomButton
                      className="w-36 bg-[#F59E0B] !text-[#F9FAFB] !border !border-[#F59E0B] shadow-none"
                      onClick={() => goalDetailModalRef.current?.close()}
                    >
                      Back
                    </CustomButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </dialog>

      {/* Retake Assessment Modal */}
      <dialog id="retake_assessment_modal" className="modal" open={showRetakeAssessment}>
        <div className="modal-box max-w-5xl w-[95vw] sm:w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaClipboardList className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Retake Risk Assessment</h3>
                  <p className="text-blue-100 text-sm mt-1">Re-evaluate your investment risk profile</p>
                </div>
              </div>
              <button
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                onClick={closeRetakeAssessment}
              >
                <MdClose size={20} className="text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <CustomText className="text-sm font-medium text-[#9CA3AF]">
                  Progress
                </CustomText>
                <CustomText className="text-sm font-semibold text-blue-600">
                  {Object.keys(retakeSelectedOptions).length} / {retakeQuestions.length} Questions
                </CustomText>
              </div>
              <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(Object.keys(retakeSelectedOptions).length / retakeQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                <FaQuestionCircle className="text-blue-600 text-lg sm:text-2xl" />
              </div>
              <CustomText className="text-lg sm:text-2xl font-bold text-[#F9FAFB] mb-2">
                Let's Reassess Your Risk Profile
              </CustomText>
              <CustomText className="text-sm sm:text-base text-[#9CA3AF] max-w-lg mx-auto px-4">
                Answer the following questions to help us understand your current investment preferences and risk tolerance
              </CustomText>

              {/* Current Risk Profile Display */}
              {riskListData?.risk_type && (
                <div className="mt-6 inline-flex items-center gap-2 bg-[#1F1A1A] px-4 py-2 rounded-full">
                  <span className="text-sm text-[#9CA3AF]">Current Risk Level:</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${riskListData.risk_type.toLowerCase() === 'high'
                    ? 'bg-red-100 text-red-700'
                    : riskListData.risk_type.toLowerCase() === 'moderate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                    {riskListData.risk_type.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {retakeQuestions.map((question: any, questionIndex: number) => {
                const isEnabled = retakeEnabledQuestions.includes(questionIndex);
                const isAnswered = isRetakeQuestionAnswered(question.id);
                const selectedAnswer = retakeSelectedOptions[question.id];
                const isExpanded = retakeExpandedIndex === questionIndex;

                return (
                  <div
                    key={question.id}
                    className={`bg-[#111111] rounded-xl shadow-lg border transition-all duration-300 overflow-hidden ${!isEnabled
                      ? "opacity-50 cursor-not-allowed border-[#2A2A2A]"
                      : isAnswered
                        ? "border-green-200 shadow-green-100/50 hover:shadow-xl"
                        : "border-[#2A2A2A] hover:border-blue-300 hover:shadow-xl cursor-pointer"
                      } ${isExpanded ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => isEnabled && setRetakeExpandedIndex(isExpanded ? null : questionIndex)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Question Number Badge */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isAnswered
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                              : isEnabled
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                : "bg-gray-300 text-[#9CA3AF]"
                              }`}
                          >
                            {isAnswered ? (
                              <FaCheckCircle className="text-lg" />
                            ) : (
                              <span>0{questionIndex + 1}</span>
                            )}
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-[#F9FAFB] mb-2 leading-tight">
                            {question.question}
                          </h4>

                          {/* Selected Answer Preview */}
                          {isAnswered && selectedAnswer && !isExpanded && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                              <FaCheckCircle className="text-sm" />
                              <span className="text-xs sm:text-sm font-medium">{selectedAnswer}</span>
                            </div>
                          )}

                          {/* Status Indicators */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${isAnswered
                              ? "bg-green-100 text-green-700"
                              : isEnabled
                                ? "bg-blue-100 text-blue-700"
                                : "bg-[#1F1A1A] text-[#9CA3AF]"
                              }`}>
                              {isAnswered ? "Answered" : isEnabled ? "Not Answered" : "Disabled"}
                            </span>

                            {/* Expand/Collapse Indicator */}
                            {isEnabled && (
                              <div className="flex items-center text-[#6B7280]">
                                {isExpanded ? (
                                  <MdKeyboardArrowUp className="text-base sm:text-lg" />
                                ) : (
                                  <MdKeyboardArrowDown className="text-base sm:text-lg" />
                                )}
                                <span className="text-xs ml-1 hidden sm:inline">
                                  {isExpanded ? "Click to collapse" : "Click to expand"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-[#2A2A2A] bg-[#1F1A1A]/50 p-3 sm:p-5">
                        <div className="pt-2">
                          {/* Question Type 1 - Radio Options */}
                          {question.question_type === 1 && (
                            <div className="space-y-2 sm:space-y-3">
                              {question.RiskProfileAnswers.map(
                                (item: any, index: any) => {
                                  const isSelected = retakeSelectedOptions[question.id] === item.answer;
                                  return (
                                    <label
                                      key={index}
                                      className={`block p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-[#2A2A2A] bg-[#111111] hover:border-blue-300 hover:shadow-sm"
                                        }`}
                                    >
                                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                        {/* Custom Radio Button */}
                                        <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
                                          <div
                                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                              ? "border-blue-600 bg-blue-600"
                                              : "border-[#3A3A3A]"
                                              }`}
                                          >
                                            {isSelected && (
                                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#111111] rounded-full"></div>
                                            )}
                                          </div>
                                          <input
                                            type="radio"
                                            value={item.answer}
                                            checked={isSelected}
                                            onChange={(e) =>
                                              handleRetakeOptionChange(
                                                e,
                                                question.id,
                                                questionIndex
                                              )
                                            }
                                            className="absolute opacity-0 w-0 h-0"
                                          />
                                        </div>

                                        {/* Answer Text */}
                                        <span className={`flex-1 text-sm sm:text-base leading-relaxed ${isSelected ? "text-blue-900 font-medium" : "text-[#E5E7EB]"
                                          }`}>
                                          {item.answer}
                                        </span>

                                        {/* Selection Indicator */}
                                        {isSelected && (
                                          <FaCheckCircle className="text-blue-600 text-base sm:text-lg flex-shrink-0" />
                                        )}
                                      </div>
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <CustomButton
                type="button"
                onClick={closeRetakeAssessment}
                className="w-full sm:w-auto px-8 py-3 bg-[#1F1A1A] hover:bg-[#2A2A2A] text-[#E5E7EB] border-2 border-[#2A2A2A] rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <MdClose size={18} />
                Cancel Assessment
              </CustomButton>
              <CustomButton
                type="submit"
                loading={retakeLoading}
                disabled={!allRetakeQuestionsAnswered()}
                onClick={handleRetakeSubmit}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${allRetakeQuestionsAnswered()
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-[#9CA3AF] cursor-not-allowed"
                  }`}
              >
                {allRetakeQuestionsAnswered() ? (
                  <>
                    <FaCheckCircle size={18} />
                    Submit Assessment
                  </>
                ) : (
                  <>
                    <FaRegCircle size={18} />
                    Complete All Questions
                  </>
                )}
              </CustomButton>
            </div>

            {/* Helper Text */}
            {!allRetakeQuestionsAnswered() && (
              <div className="mt-4 text-center">
                <CustomText className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
                  <MdError className="inline mr-2" />
                  Please answer all questions before submitting
                </CustomText>
              </div>
            )}
          </div>
        </div>
      </dialog>

      {/* Risk Recommendations Modal - Now shows Scheme Configuration */}
      <dialog id="risk_recommendations_modal" className="modal" ref={riskRecommendationsModalRef}>
        <div className="modal-box max-w-6xl bg-[#111111] border border-[#3A3A3A] rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#F9FAFB]">Scheme Configuration</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-[#9CA3AF] hover:text-[#E5E7EB]">
                <MdClose size={20} />
              </button>
            </form>
          </div>
          <p className="text-xs text-[#6B7280] mb-5">Configure your investment schemes by allocating them across different risk categories.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {schemeColors.map(color => {
              const colorConfigs = getSchemeColorConfigs(color.id);
              const { total: totalAlloc, remaining: remainingAlloc, isFull } = getSchemeColorAllocation(color.id);
              const isOver = totalAlloc > 100;

              return (
                <div key={color.id} className={`rounded-xl px-4 pt-3 pb-4 ${getSchemeColorBorderClass(color.color_name)} flex flex-col`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <h3 className={`text-base font-bold ${getSchemeColorTextClass(color.color_name)}`}>{color.color_name}</h3>
                      <span className="text-[10px] text-[#6B7280]">{getSchemeColorDesc(color.color_name)}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-base font-bold ${isOver ? 'text-red-500' : isFull ? getSchemeColorTextClass(color.color_name) : 'text-blue-500'}`}>
                        {formatSchemePercentage(totalAlloc)}%
                      </div>
                      <div className="text-[10px] text-[#6B7280]">{isOver ? 'Over allocated' : isFull ? 'Fully allocated' : `${formatSchemePercentage(remainingAlloc)}% available`}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    {colorConfigs.length === 0 ? (
                      <div className="text-center py-4 text-[#6B7280] bg-[#1F1A1A] rounded-lg border border-dashed border-[#2A2A2A]">
                        <p className="text-xs">No schemes added</p>
                      </div>
                    ) : (
                      <div>
                        {colorConfigs.map((cfg, idx) => (
                          <div key={cfg.id}>
                            <div className="py-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-[12px] text-blue-600 truncate">{cfg.scheme_name}</h4>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex-shrink-0 whitespace-nowrap ${getSchemeRiskBadgeClass(cfg.risk_level)}`}>{cfg.risk_level}</span>
                                  </div>
                                  <div className="text-[10px] text-[#6B7280]">
                                    <span className="font-medium text-[#9CA3AF]">ISIN:</span> {cfg.scheme_isin} <span className="font-medium text-[#9CA3AF]">Fund:</span> {cfg.fund_name && cfg.fund_name.length > 15 ? cfg.fund_name.substring(0, 15) + '...' : cfg.fund_name} <span className="font-semibold text-[#9CA3AF]">{(cfg.percentage || 0) > 0 ? `${formatSchemePercentage(cfg.percentage || 0)}%` : '0%'}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0 items-center">
                                  <button onClick={() => openSchemeEditModal(cfg)} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-green-500 text-white rounded hover:bg-green-600 font-medium">
                                    <Pencil size={9} /> Edit
                                  </button>
                                  <button onClick={() => handleSchemeDelete(cfg.id)} className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded hover:bg-red-600">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {idx < colorConfigs.length - 1 && <div className={`border-b ${getSchemeColorDividerClass(color.color_name)}`} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-2">
                    <button
                      onClick={() => openSchemeAddModal(color.id)}
                      disabled={isFull}
                      className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed ${isFull ? getSchemeGradientBtnClass(color.color_name) : getSchemeColorBtnClass(color.color_name)}`}
                    >
                      <Plus size={13} />
                      {isFull ? 'Fully Allocated' : 'Add Scheme'}
                    </button>
                    {isFull && <p className="text-[9px] text-center text-[#6B7280] mt-1">Delete existing schemes to add new ones</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="modal-action mt-4">
            <form method="dialog">
              <button className="px-5 py-2 bg-[#2A2A2A] hover:bg-gray-300 text-[#E5E7EB] rounded-lg font-medium text-sm transition-colors">
                Close
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Scheme Details Modal */}
      <dialog id="scheme_details_modal" className="modal" ref={schemeDetailsModalRef}>
        <div className="modal-box max-w-5xl bg-[#111111] border border-[#3A3A3A] rounded-xl">
          {selectedScheme && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={schemeDetailsCloseModal}
                    className="btn btn-sm btn-circle btn-ghost text-[#9CA3AF] hover:text-[#E5E7EB]"
                  >
                    <IoMdArrowRoundBack size={20} />
                  </button>
                  <h3 className="text-2xl font-bold text-[#F9FAFB]">{selectedScheme.name}</h3>
                </div>
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost text-[#9CA3AF] hover:text-[#E5E7EB]">
                    <MdClose size={20} />
                  </button>
                </form>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedScheme.riskLevel === 'Moderate Risk' ? 'bg-blue-100 text-blue-800' :
                    selectedScheme.riskLevel === 'Moderate-High Risk' ? 'bg-orange-100 text-orange-800' :
                      selectedScheme.riskLevel === 'Balanced Risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {selectedScheme.riskLevel}
                  </span>
                  {selectedScheme.category === 'Tax Benefit' && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      Section 80C
                    </span>
                  )}
                </div>
                <p className="text-[#9CA3AF] leading-relaxed">
                  {selectedScheme.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Performance Metrics */}
                <div className="bg-[#1F1A1A] rounded-lg p-6">
                  <h4 className="font-semibold text-[#F9FAFB] mb-4 flex items-center gap-2">
                    <FaChartLine className="text-blue-500" />
                    Performance Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Returns (1Y):</span>
                      <span className="font-medium text-green-600">{selectedScheme.returns1Y || '8.5%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Returns (3Y):</span>
                      <span className="font-medium text-green-600">{selectedScheme.returns3Y}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Returns (5Y):</span>
                      <span className="font-medium text-green-600">{selectedScheme.returns5Y || '11.2%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Since Inception:</span>
                      <span className="font-medium text-green-600">{selectedScheme.returnsSinceInception || '14.8%'}</span>
                    </div>
                  </div>
                </div>

                {/* Fund Details */}
                <div className="bg-[#1F1A1A] rounded-lg p-6">
                  <h4 className="font-semibold text-[#F9FAFB] mb-4 flex items-center gap-2">
                    <FaClipboardList className="text-purple-500" />
                    Fund Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Fund Size:</span>
                      <span className="font-medium">{selectedScheme.fundSize || '12,450 Cr'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Launch Date:</span>
                      <span className="font-medium">{selectedScheme.launchDate || '15-Jan-2015'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">NAV:</span>
                      <span className="font-medium">{selectedScheme.nav || '145.67'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Expense Ratio:</span>
                      <span className="font-medium">{selectedScheme.expenseRatio}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#F9FAFB] mb-4">Asset Allocation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{selectedScheme.equityAllocation || '75%'}</div>
                    <div className="text-sm text-[#9CA3AF]">Equity</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">{selectedScheme.debtAllocation || '20%'}</div>
                    <div className="text-sm text-[#9CA3AF]">Debt</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700 mb-1">{selectedScheme.cashAllocation || '5%'}</div>
                    <div className="text-sm text-[#9CA3AF]">Cash & Others</div>
                  </div>
                </div>
              </div>

              {/* Top Holdings */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#F9FAFB] mb-4">Top Holdings</h4>
                <div className="bg-[#1F1A1A] rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedScheme.topHoldings || [
                      { name: 'HDFC Bank Ltd.', allocation: '8.5%' },
                      { name: 'Reliance Industries Ltd.', allocation: '7.2%' },
                      { name: 'ICICI Bank Ltd.', allocation: '6.8%' },
                      { name: 'TCS Ltd.', allocation: '5.9%' },
                      { name: 'Infosys Ltd.', allocation: '5.4%' },
                      { name: 'Kotak Mahindra Bank Ltd.', allocation: '4.8%' }
                    ].map((holding: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-[#E5E7EB] text-sm">{holding.name}</span>
                        <span className="font-medium text-[#F9FAFB] text-sm">{holding.allocation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investment Details */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#F9FAFB] mb-4">Investment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Minimum Investment:</span>
                      <span className="font-medium">{selectedScheme.minInvestment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Additional Purchase:</span>
                      <span className="font-medium">{selectedScheme.additionalPurchase || '500'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">SIP Minimum:</span>
                      <span className="font-medium">{selectedScheme.sipMinimum || '500'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Exit Load:</span>
                      <span className="font-medium">{selectedScheme.exitLoad || '1% before 1 year'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Lock-in Period:</span>
                      <span className="font-medium">{selectedScheme.lockInPeriod || '3 years (ELSS)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Fund Manager:</span>
                      <span className="font-medium">{selectedScheme.fundManager || 'Rahul Sharma'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Invest Now
                </button>
                <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start SIP
                </button>
                <button className="flex-1 bg-[#1F1A1A] hover:bg-[#2A2A2A] text-[#E5E7EB] py-3 rounded-lg font-semibold transition-all duration-200">
                  Add to Watchlist
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={schemeDetailsCloseModal}>close</button>
        </form>
      </dialog>

      {/* Scheme Edit/Add Sub-Modal */}
      {schemeEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-[9999] pt-12">
          <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#2A2A2A]">
            {/* Header */}
            <div className={`px-4 py-3 text-white ${getSchemeHeaderClass(schemeEditColorName)}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={closeSchemeEditModal} className="text-white hover:bg-white/20 transition-colors p-1.5 rounded-full flex items-center gap-1.5 text-sm">
                    <IoMdArrowRoundBack size={16} />
                    <span>Back</span>
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">{schemeEditIsEditMode ? `Edit ${schemeEditColorName} Scheme` : `${schemeEditColorName} - Select Schemes`}</h2>
                    <p className="text-white/80 text-xs">{schemeEditIsEditMode ? 'Update scheme allocation' : 'Choose schemes from available list'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-white/80">Selected: <strong className="text-white">{formatSchemePercentage(schemeEditTotalPercentage())}%</strong></span>
                    <span className="text-white/80">Remaining: <strong className="text-white">{formatSchemePercentage(Math.max(0, (schemeEditColorId ? getSchemeColorAllocation(schemeEditColorId).remaining : 100)))}%</strong></span>
                  </div>
                  <button onClick={handleSchemeEditSave} disabled={schemeEditSelectedSchemes.length === 0 || schemeEditTotalPercentage() === 0} className="bg-[#111111] text-[#F9FAFB] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1F1A1A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm">
                    <FaCheckCircle size={14} />
                    {schemeEditIsEditMode ? 'Update' : `Add ${schemeEditSelectedSchemes.length}`}
                  </button>
                  <button onClick={closeSchemeEditModal} className="text-white hover:bg-white/20 transition-colors p-1.5 rounded-full">
                    <MdClose size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="px-4 py-3 border-b border-[#2A2A2A] bg-[#1F1A1A]">
              <div className="flex flex-nowrap items-center gap-3">
                <div className="flex-1 relative">
                  <input type="text" placeholder="Search schemes..." value={schemeEditSearchTerm} onChange={(e) => setSchemeEditSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-[#3A3A3A] rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-[#111111]" />
                  <FaStar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs" />
                </div>
                <select value={schemeEditRiskFilter} onChange={(e) => setSchemeEditRiskFilter(e.target.value)} className="w-44 px-3 py-2.5 border border-[#3A3A3A] rounded-lg text-sm bg-[#111111]">
                  <option value="">All Risk Levels</option>
                  {[...new Set(schemeAllSchemes.map((s: any) => s.risk_level))].sort().map((r: any) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={schemeEditFundFilter} onChange={(e) => setSchemeEditFundFilter(e.target.value)} className="w-48 px-3 py-2.5 border border-[#3A3A3A] rounded-lg text-sm bg-[#111111]">
                  <option value="">All Funds</option>
                  {[...new Set(schemeAllSchemes.map((s: any) => s.fund_name))].sort().map((f: any) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="mt-2 text-xs text-[#9CA3AF]">
                <span>{(() => {
                  const filtered = schemeAllSchemes.filter((s: any) => {
                    const matchSearch = s.scheme_name.toLowerCase().includes(schemeEditSearchTerm.toLowerCase()) || s.scheme_isin.toLowerCase().includes(schemeEditSearchTerm.toLowerCase()) || s.fund_name.toLowerCase().includes(schemeEditSearchTerm.toLowerCase());
                    const matchRisk = schemeEditRiskFilter ? s.risk_level === schemeEditRiskFilter : true;
                    const matchFund = schemeEditFundFilter ? s.fund_name === schemeEditFundFilter : true;
                    return matchSearch && matchRisk && matchFund;
                  });
                  return filtered.length;
                })()} schemes found</span>
                {schemeEditIsEditMode && schemeEditSelectedSchemes.length > 0 && <span className="ml-3 text-blue-600 font-medium">• Selected scheme shown first</span>}
              </div>
            </div>

            {/* Scheme List */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="divide-y divide-[#2A2A2A]">
                {(() => {
                  let filtered = schemeAllSchemes.filter((s: any) => {
                    const matchSearch = s.scheme_name.toLowerCase().includes(schemeEditSearchTerm.toLowerCase()) || s.scheme_isin.toLowerCase().includes(schemeEditSearchTerm.toLowerCase()) || s.fund_name.toLowerCase().includes(schemeEditSearchTerm.toLowerCase());
                    const matchRisk = schemeEditRiskFilter ? s.risk_level === schemeEditRiskFilter : true;
                    const matchFund = schemeEditFundFilter ? s.fund_name === schemeEditFundFilter : true;
                    return matchSearch && matchRisk && matchFund;
                  });
                  if (schemeEditIsEditMode && schemeEditSelectedSchemes.length > 0) {
                    const selIsin = schemeEditSelectedSchemes[0].scheme_isin;
                    const sel = filtered.find((s: any) => s.scheme_isin === selIsin);
                    const rest = filtered.filter((s: any) => s.scheme_isin !== selIsin);
                    filtered = sel ? [sel, ...rest] : filtered;
                  }
                  return filtered.map((scheme: any) => {
                    const isSelected = schemeEditSelectedSchemes.some((s: any) => s.scheme_isin === scheme.scheme_isin);
                    const isEdited = schemeEditIsEditMode && isSelected;
                    return (
                      <div key={scheme.scheme_isin} className={`px-4 py-3 transition-all duration-200 ${isSelected ? getSchemeSelectedBorder(schemeEditColorName) + ' border-l-4' : 'hover:bg-[#1F1A1A] border-l-4 border-l-transparent'} ${isEdited ? 'ring-2 ring-red-200' : ''}`}>
                        {isEdited && (
                          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-200">
                            <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1"><FaCheckCircle size={11} /> Editing</div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div onClick={() => {
                            if (schemeEditIsEditMode) {
                              const ns = schemeEditSelectedSchemes.some((s: any) => s.scheme_isin === scheme.scheme_isin) ? schemeEditSelectedSchemes : [scheme];
                              setSchemeEditSelectedSchemes(ns);
                              const np = {...schemeEditPercentages}; if (!ns.some((s: any) => s.scheme_isin === scheme.scheme_isin)) { np[scheme.scheme_isin] = 0; } setSchemeEditPercentages(np);
                            } else {
                              const already = schemeEditSelectedSchemes.some((s: any) => s.scheme_isin === scheme.scheme_isin);
                              if (already) { setSchemeEditSelectedSchemes(schemeEditSelectedSchemes.filter((s: any) => s.scheme_isin !== scheme.scheme_isin)); const np = {...schemeEditPercentages}; delete np[scheme.scheme_isin]; setSchemeEditPercentages(np); }
                              else { setSchemeEditSelectedSchemes([...schemeEditSelectedSchemes, scheme]); setSchemeEditPercentages({...schemeEditPercentages, [scheme.scheme_isin]: 0}); }
                            }
                          }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 ${isSelected ? getSchemeRadioClass(schemeEditColorName) : 'border-[#3A3A3A] hover:border-gray-400'}`}>
                            {isSelected && <FaCheckCircle size={14} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-bold text-[#F9FAFB] text-sm mb-1">{scheme.scheme_name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 text-xs text-[#9CA3AF]">
                                  <span><strong className="text-[#9CA3AF]">ISIN:</strong> {scheme.scheme_isin}</span>
                                  <span><strong className="text-[#9CA3AF]">Fund:</strong> {scheme.fund_name}</span>
                                  <span><strong className="text-[#9CA3AF]">Category:</strong> {scheme.category_name}</span>
                                </div>
                              </div>
                              <span className={`ml-3 px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0 ${getSchemeRiskBadgeClass(scheme.risk_level)}`}>{scheme.risk_level}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-3 ml-9 flex items-center gap-3 bg-[#111111] rounded-lg border border-[#2A2A2A] px-3 py-2">
                            <label className="text-sm font-medium text-[#E5E7EB] flex items-center gap-2">
                              Allocation:
                              {(schemeEditPercentages[scheme.scheme_isin] || 0) > 0 && <span className="bg-green-100 text-green-700 w-5 h-5 rounded-full flex items-center justify-center"><FaCheckCircle size={10} /></span>}
                            </label>
                            <input type="number" min={0} max={100} value={schemeEditPercentages[scheme.scheme_isin] || ''} onChange={(e) => handleSchemeEditPercentageChange(scheme.scheme_isin, Number(e.target.value) || 0)} className="w-20 px-2 py-1 border border-[#3A3A3A] rounded text-center text-sm font-medium" placeholder="0" />
                            <span className="text-sm text-[#9CA3AF]">%</span>
                            <span className="text-sm text-[#9CA3AF] ml-1">{(schemeEditPercentages[scheme.scheme_isin] || 0) > 0 ? `${formatSchemePercentage(schemeEditPercentages[scheme.scheme_isin])}%` : ''}</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalPlanning;




