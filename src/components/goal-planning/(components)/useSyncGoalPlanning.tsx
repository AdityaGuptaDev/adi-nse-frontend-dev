import api from "@/utils/api";
import {
  DEFAULT_INFLATION_RATE,
  MONTHS_IN_A_YEAR,
  USER_DATA,
} from "@/utils/constants";
import { getLS, handleServerError } from "@/utils/helpers";
import { useState, useEffect } from "react";

const useSyncGoalPlanning = (props: any) => {
  const {
    setValue,
    watch,
    setCalculationLoading,
    inflationPercentage,
    rangeInflation,
    editForm,
    setEditForm,
    GoalType,
  } = props;

  const [riskListData, setRiskList] = useState<any>();
  const [firstModal, setFirstModal] = useState<any>(false);
  const [secondModal, setSecondModal] = useState<any>(false);
  const [sipProjectedAmt, setSipProjectedAmt] = useState<any>();
  const [lumpProjectedAmt, setLumpProjectedAmount] = useState<any>();
  const [lumpsumAmt, setLumpsumpAmt] = useState<any>();
  const [sipAmt, setSipAmt] = useState<any>();
  const [sipLumpSelected, setSipLumpSelected] = useState<any>("lumpsum");
  const [schemeData, setSchemeData] = useState<any>([]);
  const [allocation, setAllocation] = useState<any>([]);

  //Risk list api
  const riskList = async () => {
    const getUser = getLS(USER_DATA);

    try {
      if (getUser?.UserRiskProfile) {
        const resp = await api.get(
          `/risk-profile/get-risk-category-id/${getUser?.UserRiskProfile?.riskProfileId}`
        );

        if (resp?.data?.data) {
          let riskData: any = resp?.data?.data;
          setRiskList(resp?.data?.data);
          // getRiskProfileWiseSchemeList(riskData);
        }
      }
    } catch (error) {
      handleServerError(error);
    }
  };

  // const getRiskProfileWiseSchemeList = async (riskData: any) => {
  //   try {
  //     let resData: any = await api.get(
  //       `/goal-plan/getRiskCatWiseSchemeData/${riskData?.id}`
  //     );
  //     if (resData.data?.data) {
  //       setSchemeData(resData.data?.data);

  //       let allocArr: any = [];

  //       for (let item of resData.data?.data) {
  //         let obj = {
  //           Id: item?.SchemeSubcategory?.Id,
  //           Name: item?.SchemeSubcategory?.Name,
  //           categoryName: item?.SchemeCategory?.Name,
  //           weightage: item.weightage,
  //           scheme_id: item?.id,
  //         };
  //         allocArr.push(obj);
  //       }

  //       setAllocation(allocArr);
  //     }
  //   } catch (error) {
  //     handleServerError(error);
  //   }
  // };

  ///Proceed to payment

  const handleCalculations = async (values: any) => {
    try {
      setCalculationLoading(true);
      const getUser = getLS(USER_DATA);
      let payload = {
        user_id: Number(getUser?.id),
        target_amount: Number(values?.target_amt),
        months:
          values?.durationType === "Months"
            ? Number(values?.duration_mts)
            : Number(values?.duration_mts) * MONTHS_IN_A_YEAR,
        risk_category_id: Number(values?.risk_category_id),
        inflation_rate:
          inflationPercentage === true
            ? Number(rangeInflation)
            : DEFAULT_INFLATION_RATE,
        goal_type_id: GoalType?.id,
        // editForm: editForm,
      };

      let res: any = await api.post(`/goal-plan/calculator/goal`, payload);

      if (res.data.data) {
        setCalculationLoading(false);
        let data: any = res.data.data;

        setSchemeData(data.schemesList);
        setAllocation(data.allocArr);
        setValue("err_perc", data?.err_perc);

        setSipProjectedAmt(data?.goal_sip_projected_value);
        setLumpProjectedAmount(data?.goal_projected_value);
        setLumpsumpAmt(data?.lumpsum_calculated_value);
        setSipAmt(data?.sip_calculated_value);

        if (!editForm) {
          setSipLumpSelected("lumpsum");
        }
        // setSipLumpSelected("lumpsum");

        setSecondModal(true);
      }
    } catch (error) {
      setCalculationLoading(false);
      handleServerError(error);
    }
  };

  useEffect(() => {
    const getUser = getLS(USER_DATA);
    if (getUser?.UserRiskProfile?.riskProfileId !== null) {
      riskList();
    }

    // schemeList()
  }, []);

  return {
    handleCalculations,
    riskListData,
    firstModal,
    secondModal,
    setFirstModal,
    setSecondModal,
    sipLumpSelected,
    setSipLumpSelected,
    sipProjectedAmt,
    lumpProjectedAmt,
    lumpsumAmt,
    sipAmt,
    setSipProjectedAmt,
    setLumpProjectedAmount,
    setLumpsumpAmt,
    setSipAmt,
    schemeData,
    allocation,
    setAllocation,
    setSchemeData,
  };
};

export default useSyncGoalPlanning;
