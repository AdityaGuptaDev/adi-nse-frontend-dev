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
          color: "#000",
        },
        data: [
          {
            value: Number(totalPoints) / 100,
            name: "Your Score",
            detail: {
              color: "rgba(0, 0, 0, 1)",
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
    <div className="">
      <form>
        
        {showFirstScreen && (<>
          <div className=" pl-2 pt-5">
                  <CustomBackButton onClick={() => window.history.back()}>
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
              </CustomBackButton>
              </div>
          <div className="h-[calc(100vh-150px)] flex items-center justify-center">
             
            <div className="stack">
             
              <div className="text-center flex flex-col gap-5 bg-background/0 p-5 rounded-2xl">
                <CustomText className="font-title relative z-2 mx-auto [transform:translate3d(0,0,0)] text-[clamp(2rem,6vw,4.5rem)] leading-none font-black will-change-auto motion-reduce:tracking-normal! max-[1279px]:tracking-normal!">
                  To Make better decisions.
                  <br />
                  <span className="[transform:translate3d(0,0,0)] bg-[linear-gradient(90deg,var(--color-secondary)_4%,color-mix(in_oklch,var(--color-secondary),var(--color-error))_22%,var(--color-primary)_45%,color-mix(in_oklch,var(--color-primary),var(--color-accent))_67%,var(--color-accent)_100.2%)] bg-clip-text will-change-auto [-webkit-text-fill-color:transparent] motion-reduce:tracking-normal! max-[1279px]:tracking-normal!">
                    you need to understand yourself.
                  </span>
                </CustomText>
                <CustomText className="text-base-content/70 font-title py-4 font-light md:text-2xl">
                  Introducing Vedant Investor Personality, a tool to help you
                  understand your investing behaviour.
                </CustomText>
                <div className="py-3 py-md-5"></div>

                <CustomText className="mb-3 font-bold text-2xl">
                  Introducing Vedant Investor Personality.
                </CustomText>
                <div>
                  <CustomButton
                    onClick={() => {
                      setShowFirstScreen(false);
                      setShowSecondScreen(true);
                    }}
                  >
                    Know your Personality
                    <FaArrowRightLong />
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {showSecondScreen && !showThirdScreen && (
          <div className="mt-0">
            <div className="pageTitle">
              <CustomText className="font-medium text-2xl ">
                Risk Profile Questionaire
              </CustomText>
            </div>
            <div className="px-4 pb-4 flex flex-col justify-center">
              <div className="join join-vertical max-w-4xl ml-auto mr-auto">
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
                      className={`collapse collapse-arrow collapse-primary join-item border-b border-gray-200 ${
                        !isEnabled ? "opacity-50 pointer-events-none" : ""
                      } ${isAnswered ? "" : ""}`}
                    >
                      <input
                        type="radio"
                        name="risk-accordion"
                        disabled={!isEnabled}
                        checked={isExpanded}
                        onChange={() =>
                          setExpandedIndex(isExpanded ? null : questionIndex)
                        }
                        className="border-none"
                      />

                      <div className="collapse-title font-medium relative flex flex-col">
                        <span
                          className={
                            isAnswered && selectedAnswer && !isExpanded
                              ? "text-sm text-placeholder"
                              : "text-xl text-black "
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div
                                className={`p-2 rounded-full bg-background w-12 h-12 flex justify-center items-center text-xl ${
                                  selectedAnswer ? `text-black` : ``
                                }`}
                              >
                                0{questionIndex + 1}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              {question.question}
                              {isAnswered && selectedAnswer && !isExpanded && (
                                <span className="text-xl font-normal text-black">
                                  {selectedAnswer}
                                </span>
                              )}
                            </div>
                          </div>
                        </span>
                      </div>

                      <div className="collapse-content mb-4">
                        <div className="pt-4">
                          {/* Question Type 1 - Radio Options */}
                          {question.question_type === 1 && (
                            <div className="flex flex-col gap-3 ps-10">
                              {question.RiskProfileAnswers.map(
                                (item: any, index: any) => (
                                  <label
                                    key={index}
                                    className={`btn flex justify-between items-center border-none bg-white shadow-none text-black text-base font-normal`}
                                  >
                                    <span className="flex justify-start items-center text-left gap-5 w-full">
                                      {selectedOptions[question.id] ===
                                      item.answer ? (
                                        <FaCircleCheck
                                          size={20}
                                          className="text-green-600 w-5 h-5 min-w-5 min-h-5"
                                        />
                                      ) : (
                                        <FaCircleCheck
                                          size={20}
                                          className="text-gray-300 w-5 h-5 min-w-5 min-h-5"
                                        />
                                      )}

                                      <input
                                        type="radio"
                                        value={item.answer}
                                        checked={
                                          selectedOptions[question.id] ===
                                          item.answer
                                        }
                                        onChange={(e) =>
                                          handleOptionChange(
                                            e,
                                            question.id,
                                            questionIndex
                                          )
                                        }
                                        className="absolute opacity-0 w-0 h-0"
                                      />

                                      {item.answer}
                                    </span>
                                  </label>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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
                  className="btn-lg"
                >
                  Submit
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        {showThirdScreen && !showSecondScreen && (
          <div className="mt-4 text-center">
            <div className="flex gap-1 items-center pl-2">
              <CustomBackButton onClick={() => window.history.back()}>
                <IoMdArrowRoundBack className="h-6 w-6 mr-1" />
              </CustomBackButton>
               <div className="pageTitle text-left">
              <CustomText className="font-medium text-2xl ">
                Risk Profile - Our Assessment
              </CustomText>
            </div>
            </div>
           
            <div className="mt-5 flex justify-center items-center gap-3">
              <CustomText className="text-xl font-bold">
                Your Risk Profile is
              </CustomText>
              <div
                className={`badge text-xl py-2 min-h-8 text-white 
              ${
                riskProfile === "Low"
                  ? `bg-[#387E47]`
                  : riskProfile === "Moderately Low"
                  ? `bg-[#C7CD55]`
                  : riskProfile === "Moderate"
                  ? `bg-[#F3E05D]`
                  : riskProfile === "Moderately High"
                  ? `bg-[#EB984B]`
                  : riskProfile === "High"
                  ? `bg-[#C3263B]`
                  : `badge-primary`
              }`}
              >
                {riskProfile}
              </div>
            </div>
            <div>
              <ReactECharts
                option={AssetAllocationMF}
                className={`riskchart`}
                opts={{ renderer: "svg" }}
              />
            </div>

            <div className="flex justify-center">
              <div className="flex justify-center gap-3 mt-8 flex-wrap bg-background p-2 rounded-md">
                <div className="flex gap-2 items-center">
                  <div className={` h-5 w-5 rounded-md bg-[#387E47]`}></div>
                  <div>Low</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`h-5 w-5 rounded-md bg-[#C7CD55]`}></div>
                  <div>Moderately Low</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`h-5 w-5 rounded-md bg-[#F3E05D]`}></div>
                  <div>Moderate</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`h-5 w-5 rounded-md bg-[#EB984B]`}></div>
                  <div>Moderately High</div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`h-5 w-5 rounded-md bg-[#C3263B]`}></div>
                  <div>High</div>
                </div>
              </div>
            </div>
            <div className="px-4 md:px-44 mt-10">
              <div className="text-lg font-normal">Your Investment Style</div>
              <div className="mt-9">{riskDescProfile}</div>
            </div>

            <div className="mt-8">
              <CustomButton type="button" onClick={handleRetake}>
                Retake Assessment
              </CustomButton>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default RiskProfile;
