export interface GoalType {
  id: string;
  icon: string;
  name: string;
  color: string;
  bg: string;
  defTarget: number;
  defYrs: number;
  defRate: number;
}

export interface GoalFormData {
  goal_label: string;
  target_amt: string;
  start_date: string;
  start_age: string;
  current_savings: string;
  retirement_age: string;
  return_till_retirement: string;
  annual_expenses: string;
  return_after_retirement: string;
  life_expectancy: string;
  inflation: string;
  target_date: string;
  present_cost: string;
  expected_return: string;
  duration_mts: string;
  risk_category_id: number;
  sip_amt: number;
  sip_duration_mts: number;
  err_perc: number;
  inflation_perc: number;
  existing_fund: number;
  lumpsum_amt: number;
  lumpsum_current_amt: number;
}

export interface Goal {
  id: number;
  goal_type_id: string;
  goal_label: string;
  target_amt: number;
  start_date?: string;
  start_age?: number;
  current_savings?: number;
  retirement_age?: number;
  return_till_retirement?: number;
  annual_expenses?: number;
  return_after_retirement?: number;
  life_expectancy?: number;
  inflation?: number;
  target_date?: string;
  present_cost?: number;
  expected_return: number;
  duration_mts: number;
  risk_category_id: number;
  sip_amt: number;
  sip_duration_mts: number;
  err_perc: number;
  inflation_perc: number;
  existing_fund: number;
  lumpsum_amt: number;
  lumpsum_current_amt: number;
  status?: 'ongoing' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface GoalPlanResponse {
  data: {
    onGoingGoalDetails: Goal[];
    completedGoalDetails: Goal[];
  };
}

export interface GoalTypeResponse {
  data: GoalType[];
}

export interface ChartOption {
  title: {
    text: string;
    left: 'center';
    textStyle: {
      fontSize: number;
      fontWeight: string;
      color: string;
    };
  };
  tooltip: {
    trigger: 'item';
    formatter: string;
  };
  legend: {
    orient: 'vertical';
    left: 'left';
  };
  series: Array<{
    name: string;
    type: 'pie';
    radius: string;
    data: Array<{
      value: number;
      name: string;
    }>;
    emphasis: {
      itemStyle: {
        shadowBlur: number;
        shadowOffsetX: number;
        shadowColor: string;
      };
    };
  }>;
}
