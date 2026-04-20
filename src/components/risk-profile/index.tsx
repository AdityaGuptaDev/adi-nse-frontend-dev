"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { USER_DATA, publicPathName } from "@/utils/constants";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaCircleCheck,
} from "react-icons/fa6";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { getLS, handleServerError, setLS, toastAlert } from "@/utils/helpers";
import api from "@/utils/api";
import ReactECharts from "echarts-for-react";
import { FaPlay, FaRegCheckCircle } from "react-icons/fa";
import CustomRadio from "@/commonUI/Radio";
import CustomInput from "@/commonUI/Input";
import CustomBackButton from "@/commonUI/CustomBackButton";
import { IoMdArrowRoundBack } from "react-icons/io";
import { ChevronRight, ChevronDown, Shield, TrendingUp, Target, BarChart3 } from "lucide-react";

function RiskProfile() {
  const [questions, setQuestions] = useState<any>([]);
  const [showFirstScreen, setShowFirstScreen] = useState(true);
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [showThirdScreen, setShowThirdScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [error, setError] = useState<any>("");
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [totalPoints, setTotalPoints] = useState<any>(0);
  const [riskProfile, setRiskProfile] = useState<any>("");
  const [currentUser, setUser] = useState<any>({});
  const [riskDescProfile, setRiskDescProfile] = useState<any>("");
  const [enabledQuestions, setEnabledQuestions] = useState<number[]>([0]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const AssetAllocationMF = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: 1,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 36,
            color: [
              [0.10, "#3e884d"],    // Low
              [0.32, "#ced450"],    // Moderately Low
              [0.64, "#f5e655"],    // Moderate
              [0.95, "#efa647"],    // Moderately High
              [1.00, "#cc3a3b"],    // High
            ],
            shadowColor: "rgba(0, 0, 0, 0.5)",
            shadowBlur: 10,
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "12%",
          width: 20,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "rgba(0, 0, 0, 1)",
          },
        },
        axisTick: {
          length: 20,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          color: "#464646",
          fontSize: 10,
          distance: -60,
          width: 65,
          overflow: "break",
          rotate: "tangential",
          formatter: function (value: number) {
            return "";
          },
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 14,
          color: "#aaa",
        },
        detail: {
          fontSize: 50,
          offsetCenter: [0, "-35%"],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value * 100) + "";
          },
          color: "#F59E0B",
        },
        data: [
          {
            value: Number(totalPoints) / 100,
            name: "Your Score",
            detail: {
              color: "#F59E0B",
            },
          },
        ],
      },
    ],
  };

  console.log(totalPoints, "totalPointstotalPoints");

  useEffect(() => {
    const user = getLS(USER_DATA);
    setUser(user);
    getResult();
  }, []);

  const getResult = async () => {
    try {
      const result = await api.get(`/risk-profile/get-risk-profile-investor`);
      console.log(result?.data?.data, "result?.data?.dataresult?.data?.data");
      if (result?.data?.data) {
        setTotalPoints(result.data?.data?.totalPoints);
        setRiskProfile(result.data?.data?.RiskCategory?.risk_type);
        setRiskDescProfile(result.data?.data?.RiskCategory?.risk_desc);

        setShowThirdScreen(true);
        setShowFirstScreen(false);
      } else {
        getFetchQuestions();
      }
    } catch (error) {
      console.error("Error fetching questions and types:", error);
      handleServerError(error);
    }
  };

  const getFetchQuestions = async () => {
    try {
      const response = await api.get(`/risk-profile/getAllRiskQuestion`);
      console.log(response.data?.data, "response.data?.data");
      setQuestions(response.data?.data);
    } catch (error) {
      console.error("Error fetching questions and types:", error);
      handleServerError(error);
    }
  };

  const validationSchema = Yup.object().shape({});

  // enable next question when current one is answered
  const enableNextQuestion = (currentIndex: number) => {
    if (
      currentIndex + 1 < questions.length &&
      !enabledQuestions.includes(currentIndex + 1)
    ) {
      setEnabledQuestions((prev) => [...prev, currentIndex + 1]);
    }
  };

  // Check if question is answered
  const isQuestionAnswered = (questionId: number) => {
    return (
      selectedOptions[questionId] !== undefined &&
      selectedOptions[questionId] !== ""
    );
  };

  ////  question type 1
  const handleOptionChange = (event: any, id: any, questionIndex: number) => {
    const { value } = event.target;

    setSelectedOptions({
      ...selectedOptions,
      [id]: value,
    });

    // Enable next question
    enableNextQuestion(questionIndex);
    setError("");

    // Auto-collapse current and expand next
    if (questionIndex + 1 < questions.length) {
      setExpandedIndex(questionIndex + 1);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    setLoading(true);
    const dataToSubmit = questions?.map((question: any) => {
      const selectedAnswer = selectedOptions[question?.id];

      const findQuestionById = (id: any) => {
        return questions?.find((question: any) => question.id === id);
      };

      let question_s: any = findQuestionById(question.id);
      let point = 0;

      // Determine points based on the type of the question and the selected answer
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
        setRiskProfile(res.data?.data?.porfile);
        currentUser.UserRiskProfile = res.data?.data?.userRiskProfileData;

        setLS(USER_DATA, currentUser);
        setTotalPoints(res.data?.data?.totalPoints);
        setRiskDescProfile(res.data?.data?.risk_desc);

        setShowThirdScreen(true);
        setShowSecondScreen(false);
        setLoading(false);
        toastAlert("success", res.data.msg);
      }
    } catch (error) {
      setLoading(false);
      handleServerError(error);
    }
  };

  const handleRetake = () => {
    setSelectedOptions({});
    setEnabledQuestions([0]); // Reset to only first question enabled
    setShowFirstScreen(true);
    setShowSecondScreen(false);
    setShowThirdScreen(false);
    getFetchQuestions();
  };

  const {
    control,
    register,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm({
    //@ts-ignore
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  });

  const getmin = (data: any) => {
    if (!Array.isArray(data) || data.length === 0) {
      return 0;
    }
    const minValues = data.map((item: any) => item.range_min);
    return Math.min(...minValues);
  };

  const getmax = (data: any) => {
    if (!Array.isArray(data) || data.length === 0) {
      return 100;
    }
    const maxValues = data.map((item: any) => item.range_max);
    return Math.max(...maxValues);
  };

  const setIntervaliNRange = (RiskProfileAnswers: any) => {
    const uniqueValues: any = [
      ...new Set(
        RiskProfileAnswers.flatMap(({ range_min, range_max }: any) => [
          range_min,
          range_max,
        ])
      ),
    ];

    const numObject = uniqueValues.reduce((acc: any, curr: any) => {
      acc[curr] = curr;
      return acc;
    }, {});
    return numObject;
  };

  const getTickPosition = (val: number, min: number, max: number) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * 100;
  };

  // Check if all questions are answered to enable submit
  const allQuestionsAnswered = () => {
    return questions.every((question: any) => isQuestionAnswered(question.id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="w-full px-0">
        <form>
          {showFirstScreen && (
            <>
              <div className="pl-2 pt-5">
                <CustomBackButton onClick={() => window.history.back()}>
                  <IoMdArrowRoundBack className="h-6 w-6 mr-1 text-[#F59E0B]" />
                </CustomBackButton>
              </div>
              <div className="h-[calc(100vh-150px)] flex items-center justify-center">
                <div className="stack">
                  <div className="text-center flex flex-col gap-5 p-5 rounded-2xl max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-2xl">
                        <Shield className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <CustomText className="font-title relative z-2 mx-auto [transform:translate3d(0,0,0)] text-[clamp(2rem,6vw,4.5rem)] leading-none font-black will-change-auto motion-reduce:tracking-normal! max-[1279px]:tracking-normal! text-[#F9FAFB]">
                      To Make better decisions.
                      <br />
                      <span className="[transform:translate3d(0,0,0)] bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#B45309] bg-clip-text will-change-auto [-webkit-text-fill-color:transparent] motion-reduce:tracking-normal! max-[1279px]:tracking-normal!">
                        you need to understand yourself.
                      </span>
                    </CustomText>
                    <CustomText className="text-[#9CA3AF] font-title py-4 font-light md:text-2xl">
                      Introducing Vedant Investor Personality, a tool to help you
                      understand your investing behaviour.
                    </CustomText>
                    <div className="py-3 py-md-5"></div>

                    <CustomText className="mb-3 font-bold text-2xl text-[#F9FAFB]">
                      Introducing Vedant Investor Personality.
                    </CustomText>
                    <div>
                      <CustomButton
                        onClick={() => {
                          setShowFirstScreen(false);
                          setShowSecondScreen(true);
                        }}
                        className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 transition-all"
                      >
                        Know your Personality
                        <FaArrowRightLong className="ml-2" />
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {showSecondScreen && !showThirdScreen && (
            <div className="mt-0">
              {/* Header */}
              <div className="w-full bg-[#111111] border-b border-[#2A2A2A] shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <CustomBackButton onClick={() => window.history.back()}>
                      <IoMdArrowRoundBack className="h-6 w-6 text-[#F59E0B]" />
                    </CustomBackButton>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                        Risk Profile Questionnaire
                      </h1>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        Answer all questions to determine your risk profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 flex flex-col justify-center mt-6">
                <div className="join join-vertical max-w-4xl ml-auto mr-auto w-full">
                  {questions.map((question: any, questionIndex: number) => {
                    const isEnabled = enabledQuestions.includes(questionIndex);
                    const isAnswered = isQuestionAnswered(question.id);
                    const selectedAnswer = selectedOptions[question.id];
                    const min = getmin(question.RiskProfileAnswers);
                    const max = getmax(question.RiskProfileAnswers);
                    const isExpanded = expandedIndex === questionIndex;

                    return (
                      <div
                        key={question.id}
                        className={`bg-[#111111] rounded-xl mb-4 border border-[#2A2A2A] overflow-hidden transition-all duration-200 ${
                          !isEnabled ? "opacity-50" : ""
                        } ${isExpanded ? "shadow-lg shadow-[#F59E0B]/10" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isEnabled) {
                              setExpandedIndex(isExpanded ? null : questionIndex);
                            }
                          }}
                          disabled={!isEnabled}
                          className="w-full p-5 text-left flex items-start gap-4 hover:bg-[#1F1A1A] transition-colors"
                        >
                          <div
                            className={`p-2 rounded-full w-12 h-12 flex justify-center items-center text-xl font-bold flex-shrink-0 ${
                              isAnswered
                                ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white"
                                : "bg-[#1F1A1A] text-[#9CA3AF] border border-[#2A2A2A]"
                            }`}
                          >
                            {questionIndex + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-[#F9FAFB] font-medium text-base">
                              {question.question}
                            </div>
                            {isAnswered && selectedAnswer && !isExpanded && (
                              <div className="text-[#F59E0B] text-sm mt-2">
                                Selected: {selectedAnswer}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-[#F59E0B]" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-[#2A2A2A]">
                            {/* Question Type 1 - Radio Options */}
                            {question.question_type === 1 && (
                              <div className="flex flex-col gap-3">
                                {question.RiskProfileAnswers.map(
                                  (item: any, index: any) => (
                                    <label
                                      key={index}
                                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        selectedOptions[question.id] === item.answer
                                          ? "bg-[#F59E0B]/10 border border-[#F59E0B]"
                                          : "bg-[#1F1A1A] border border-[#2A2A2A] hover:border-[#F59E0B]/50"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        value={item.answer}
                                        checked={
                                          selectedOptions[question.id] === item.answer
                                        }
                                        onChange={(e) =>
                                          handleOptionChange(
                                            e,
                                            question.id,
                                            questionIndex
                                          )
                                        }
                                        className="w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]"
                                      />
                                      <span className="text-[#F9FAFB] text-base">
                                        {item.answer}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 text-center">
                  <CustomButton
                    type="submit"
                    loading={loading}
                    disabled={!allQuestionsAnswered()}
                    onClick={handleSubmit}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                      allQuestionsAnswered()
                        ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90"
                        : "bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed"
                    }`}
                  >
                    Submit Assessment
                  </CustomButton>
                  {!allQuestionsAnswered() && (
                    <p className="text-[#9CA3AF] text-sm mt-3">
                      Please answer all questions to submit
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {showThirdScreen && !showSecondScreen && (
            <div className="mt-0">
              {/* Header */}
              <div className="w-full bg-[#111111] border-b border-[#2A2A2A] shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <CustomBackButton onClick={() => window.history.back()}>
                      <IoMdArrowRoundBack className="h-6 w-6 text-[#F59E0B]" />
                    </CustomBackButton>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                        Risk Profile - Our Assessment
                      </h1>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        Based on your responses, here's your investment profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center px-4">
                <div className="flex justify-center items-center gap-3 mb-6">
                  <CustomText className="text-xl font-bold text-[#F9FAFB]">
                    Your Risk Profile is
                  </CustomText>
                  <div
                    className={`badge text-xl py-3 px-6 min-h-8 text-white font-semibold rounded-full shadow-lg
                    ${
                      riskProfile === "Low"
                        ? "bg-[#387E47]"
                        : riskProfile === "Moderately Low"
                        ? "bg-[#C7CD55]"
                        : riskProfile === "Moderate"
                        ? "bg-[#F3E05D] text-black"
                        : riskProfile === "Moderately High"
                        ? "bg-[#EB984B]"
                        : riskProfile === "High"
                        ? "bg-[#C3263B]"
                        : "bg-gradient-to-r from-[#F59E0B] to-[#B45309]"
                    }`}
                  >
                    {riskProfile}
                  </div>
                </div>

                <div className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A] max-w-3xl mx-auto">
                  <ReactECharts
                    option={AssetAllocationMF}
                    className={`riskchart w-full`}
                    opts={{ renderer: "svg" }}
                    style={{ height: "300px" }}
                  />
                </div>

                <div className="flex justify-center mt-8">
                  <div className="flex flex-wrap justify-center gap-3 p-4 bg-[#111111] rounded-xl border border-[#2A2A2A]">
                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-lg bg-[#1F1A1A]">
                      <div className={`h-3 w-3 rounded-full bg-[#387E47]`}></div>
                      <div className="text-[#9CA3AF] text-sm">Low</div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-lg bg-[#1F1A1A]">
                      <div className={`h-3 w-3 rounded-full bg-[#C7CD55]`}></div>
                      <div className="text-[#9CA3AF] text-sm">Moderately Low</div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-lg bg-[#1F1A1A]">
                      <div className={`h-3 w-3 rounded-full bg-[#F3E05D]`}></div>
                      <div className="text-[#9CA3AF] text-sm">Moderate</div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-lg bg-[#1F1A1A]">
                      <div className={`h-3 w-3 rounded-full bg-[#EB984B]`}></div>
                      <div className="text-[#9CA3AF] text-sm">Moderately High</div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-lg bg-[#1F1A1A]">
                      <div className={`h-3 w-3 rounded-full bg-[#C3263B]`}></div>
                      <div className="text-[#9CA3AF] text-sm">High</div>
                    </div>
                  </div>
                </div>

                <div className="px-4 md:px-44 mt-10">
                  <div className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                      <div className="text-lg font-semibold text-[#F9FAFB]">Your Investment Style</div>
                    </div>
                    <div className="text-[#9CA3AF] leading-relaxed">{riskDescProfile}</div>
                  </div>
                </div>

                <div className="mt-10 pb-10">
                  <CustomButton
                    type="button"
                    onClick={handleRetake}
                    className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 transition-all px-8 py-3 rounded-lg font-semibold"
                  >
                    Retake Assessment
                  </CustomButton>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default RiskProfile;