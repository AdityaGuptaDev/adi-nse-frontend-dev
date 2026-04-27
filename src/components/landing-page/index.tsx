"use client";

import React, { useRef, useState, useEffect, JSX } from "react";
import { publicPathName } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/registerStore";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/commonUI/ThemeToggle";
import LanguageDropdown from "@/commonUI/LanguageDropdown";
import { useLandingLang } from "@/i18n/landingI18n";

type UserType = "Investor" | "Partner";

const SIPCalculator = () => {
  const [investmentType, setInvestmentType] = useState<"SIP" | "Lumpsum">("SIP");
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [selectedPlan, setSelectedPlan] = useState("InstaFD");

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = investmentPeriod * 12;
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const investedAmount = monthlyAmount * months;
    const estimatedReturns = futureValue - investedAmount;
    
    return {
      futureValue: Math.round(futureValue),
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns)
    };
  };

  const calculateLumpsum = () => {
    const rate = expectedReturn / 100;
    const futureValue = lumpsumAmount * Math.pow(1 + rate, investmentPeriod);
    const estimatedReturns = futureValue - lumpsumAmount;
    
    return {
      futureValue: Math.round(futureValue),
      investedAmount: lumpsumAmount,
      estimatedReturns: Math.round(estimatedReturns)
    };
  };

  const results = investmentType === "SIP" ? calculateSIP() : calculateLumpsum();
  
  const formatIndianCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  const formatInLakhsCrores = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    return formatIndianCurrency(num);
  };

  const generateYearlyData = () => {
    const data = [];
    if (investmentType === "SIP") {
      const monthlyRate = expectedReturn / 12 / 100;
      for (let year = 1; year <= investmentPeriod; year++) {
        const months = year * 12;
        const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const invested = monthlyAmount * months;
        data.push({
          year,
          futureValue: Math.round(futureValue),
          invested: Math.round(invested)
        });
      }
    } else {
      const rate = expectedReturn / 100;
      for (let year = 1; year <= investmentPeriod; year++) {
        const futureValue = lumpsumAmount * Math.pow(1 + rate, year);
        data.push({
          year,
          futureValue: Math.round(futureValue),
          invested: lumpsumAmount
        });
      }
    }
    return data;
  };

  const yearlyData = generateYearlyData();

  return (
    <div className="bg-[#111111] backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden border border-[#2A2A2A]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#F59E0B]/10 to-[#B45309]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#10B981]/10 to-[#059669]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 relative z-10">
        <div className="flex gap-2 p-1.5 bg-[#1F1A1A] rounded-2xl backdrop-blur-sm border border-[#2A2A2A]">
          <button
            onClick={() => setInvestmentType("SIP")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              investmentType === "SIP"
                ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] shadow-lg shadow-[#F59E0B]/30 scale-105"
                : "text-[#9CA3AF] hover:text-[#F59E0B] hover:bg-[#2A2A2A]"
            }`}
          >
            SIP
          </button>
          <button
            onClick={() => setInvestmentType("Lumpsum")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              investmentType === "Lumpsum"
                ? "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] shadow-lg shadow-[#F59E0B]/30 scale-105"
                : "text-[#9CA3AF] hover:text-[#F59E0B] hover:bg-[#2A2A2A]"
            }`}
          >
            Lumpsum
          </button>
        </div>
        <div className="text-right bg-[#1F1A1A] backdrop-blur-sm px-4 py-2 rounded-2xl border border-[#2A2A2A]">
          <p className="text-xs text-[#9CA3AF]">Potential Value After {investmentPeriod} Years</p>
          <p className="text-xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
            {formatInLakhsCrores(results.futureValue)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        <div>
          <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">
            {investmentType === "SIP" ? "Monthly SIP Amount" : "Lumpsum Investment"}
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-bold">₹</span>
            <input
              type="number"
              value={investmentType === "SIP" ? monthlyAmount : lumpsumAmount}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (investmentType === "SIP") {
                  setMonthlyAmount(val);
                } else {
                  setLumpsumAmount(val);
                }
              }}
              className="w-full pl-8 pr-4 py-3 bg-[#1F1A1A] backdrop-blur-sm border-2 border-[#2A2A2A] rounded-xl focus:border-[#F59E0B] outline-none text-[#F9FAFB] transition-all group-hover:shadow-lg group-hover:shadow-[#F59E0B]/20"
              min="500"
              step="500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[500, 1000, 5000, 10000].map(amt => (
              <button
                key={amt}
                onClick={() => investmentType === "SIP" ? setMonthlyAmount(amt) : setLumpsumAmount(amt)}
                className="text-xs px-2 py-1 rounded-lg bg-[#1F1A1A] backdrop-blur-sm text-[#9CA3AF] border border-[#2A2A2A] hover:from-[#F59E0B] hover:to-[#B45309] hover:text-[#F9FAFB] hover:border-transparent transition-all duration-300"
              >
                ₹{amt/1000}k
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">
            Investment Period <span className="text-[#9CA3AF]">(Years)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="30"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
              className="flex-1 h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
            />
            <span className="min-w-[60px] px-3 py-2 bg-[#1F1A1A] backdrop-blur-sm rounded-lg text-center font-bold text-[#F59E0B] border border-[#2A2A2A]">
              {investmentPeriod}Y
            </span>
          </div>
          <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
            <span>1Y</span>
            <span>40Y</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">
            Expected Return Rate <span className="text-[#9CA3AF]">(Annual)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="30"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="flex-1 h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
            />
            <span className="min-w-[80px] px-3 py-2 bg-[#1F1A1A] backdrop-blur-sm rounded-lg text-center font-bold text-[#F59E0B] border border-[#2A2A2A]">
              {expectedReturn}%
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-[#F9FAFB]">Wealth Growth Projection</span>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full animate-pulse"></span> <span className="text-[#9CA3AF]">Investment</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full animate-pulse delay-300"></span> <span className="text-[#9CA3AF]">Returns</span>
            </span>
          </div>
        </div>
        
        <div className="h-64 flex items-end gap-1">
          {yearlyData.map((data, index) => {
            const maxValue = Math.max(...yearlyData.map(d => d.futureValue));
            const investmentHeight = (data.invested / maxValue) * 100;
            const returnsHeight = ((data.futureValue - data.invested) / maxValue) * 100;
            
            return (
              <motion.div 
                key={index} 
                className="flex-1 flex flex-col items-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="w-full relative">
                  <motion.div 
                    className="w-full bg-gradient-to-t from-[#F59E0B] to-[#B45309] rounded-t-lg transition-all duration-300 group-hover:opacity-80 cursor-pointer relative overflow-hidden"
                    style={{ height: `${investmentHeight}px` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${investmentHeight}px` }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                  >
                    <div className="absolute inset-0 bg-white/10 shimmer"></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1F1A1A] text-[#F9FAFB] text-xs rounded-lg px-2 py-1 whitespace-nowrap z-20 shadow-xl border border-[#2A2A2A]">
                      Invested: {formatInLakhsCrores(data.invested)}
                    </div>
                  </motion.div>
                  <motion.div 
                    className="w-full bg-gradient-to-t from-[#10B981] to-[#059669] rounded-t-lg transition-all duration-300 group-hover:opacity-80 cursor-pointer relative overflow-hidden"
                    style={{ height: `${returnsHeight}px` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${returnsHeight}px` }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                  >
                    <div className="absolute inset-0 bg-white/10 shimmer"></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1F1A1A] text-[#F9FAFB] text-xs rounded-lg px-2 py-1 whitespace-nowrap z-20 shadow-xl border border-[#2A2A2A]">
                      Returns: {formatInLakhsCrores(data.futureValue - data.invested)}
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs text-[#9CA3AF] mt-2">{data.year}Y</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#1F1A1A] backdrop-blur-sm rounded-2xl relative z-10 border border-[#2A2A2A]">
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-xs text-[#9CA3AF]">Invested Amount</p>
          <p className="text-sm font-bold text-[#F59E0B]">{formatInLakhsCrores(results.investedAmount)}</p>
        </motion.div>
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-xs text-[#9CA3AF]">Estimated Returns</p>
          <p className="text-sm font-bold text-[#10B981]">{formatInLakhsCrores(results.estimatedReturns)}</p>
        </motion.div>
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-xs text-[#9CA3AF]">Total Value</p>
          <p className="text-sm font-bold text-[#F59E0B]">{formatInLakhsCrores(results.futureValue)}</p>
        </motion.div>
      </div>

      <div className="mb-6 relative z-10">
        <p className="text-xs text-[#9CA3AF] mb-2">Quick Select Plan</p>
        <div className="flex gap-2">
          {[
            { name: "InstaFD", rate: "7.5%", from: "from-[#F59E0B]", to: "to-[#B45309]", icon: "🏦" },
            { name: "Gold", rate: "12%", from: "from-[#10B981]", to: "to-[#059669]", icon: "👑" },
            { name: "Daily", rate: "12%", from: "from-[#F59E0B]", to: "to-[#B45309]", icon: "⚡" }
          ].map(plan => (
            <motion.button
              key={plan.name}
              onClick={() => {
                setSelectedPlan(plan.name);
                setExpectedReturn(parseFloat(plan.rate));
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all ${
                selectedPlan === plan.name
                  ? `bg-gradient-to-r ${plan.from} ${plan.to} text-[#F9FAFB] border-transparent shadow-lg`
                  : "border-[#2A2A2A] bg-[#1F1A1A] backdrop-blur-sm hover:border-[#F59E0B]"
              }`}
            >
              <span className="text-xs font-bold block text-[#F9FAFB]">{plan.name} {plan.icon}</span>
              <span className={`text-sm font-black ${selectedPlan === plan.name ? "text-[#F9FAFB]" : `bg-gradient-to-r ${plan.from} ${plan.to} bg-clip-text text-transparent`}`}>
                {plan.rate}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#9CA3AF] text-center relative z-10">
        Note: Returns are calculated based on the selected investment plan. 
        Actual returns may vary based on market conditions and fund performance.
      </p>
    </div>
  );
};

// Updated MobileAppMockup with Vedant Asset logo
const MobileAppMockup = () => {
  const [activeScreen, setActiveScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const appScreens = [
    {
      id: "onboarding",
      title: "Welcome to Vedant Asset",
      bg: "from-[#F59E0B] to-[#B45309]",
      icon: "✨",
      features: ["Smart Investing", "Expert Guidance", "Better Returns"],
      amount: "₹500",
      returns: "15%",
      chart: "65%"
    },
    {
      id: "dashboard",
      title: "Investment Dashboard",
      bg: "from-[#10B981] to-[#059669]",
      icon: "📊",
      features: ["Real-time Portfolio", "Performance Analytics", "Market Insights"],
      amount: "₹2.5L",
      returns: "32.5%",
      chart: "82%"
    },
    {
      id: "calculator",
      title: "SIP Calculator",
      bg: "from-[#F59E0B] to-[#B45309]",
      icon: "🧮",
      features: ["Instant Returns", "Goal Planning", "Comparison Tools"],
      amount: "₹12L",
      returns: "28%",
      chart: "45%"
    },
    {
      id: "invest",
      title: "Easy Investment",
      bg: "from-[#F59E0B] to-[#B45309]",
      icon: "💰",
      features: ["Start with ₹500", "Multiple Options", "Instant Updates"],
      amount: "₹50K+",
      returns: "24/7",
      chart: "93%"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveScreen((prev) => (prev + 1) % appScreens.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [appScreens.length]);

  return (
    <div className="relative w-full max-w-[300px] mx-auto perspective-1000">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-[48px] blur-2xl transform translate-y-4 scale-95"></div>
      
      <div className="relative rounded-[48px] bg-gradient-to-br from-[#1F1A1A] to-[#111111] p-3 shadow-2xl transform transition-transform hover:scale-105 duration-300 border border-[#2A2A2A]">
        <div className="relative rounded-[40px] bg-[#0A0A0A] overflow-hidden aspect-[9/19]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#1F1A1A] rounded-b-2xl z-20"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${appScreens[activeScreen].bg}`}>
                <div className="absolute top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#111111]/5 rounded-full blur-2xl animate-ping"></div>
              </div>

              <div className="relative z-10 h-full p-4 flex flex-col">
                <div className="flex justify-between items-center text-[#F9FAFB]/80 text-[10px] mb-3 mt-2">
                  <span className="font-semibold">9:41</span>
                  <div className="flex gap-1">
                    <span className="text-xs">📶</span>
                    <span className="text-xs">📶</span>
                    <span className="text-xs">🔋</span>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="flex justify-center mb-3"
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-1.5 border border-white/20 shadow-lg">
                    <img
                      src={`${publicPathName}/logo_light.png`}
                      alt="Vedant Asset"
                      className="h-8 w-auto brightness-0 invert"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl mb-3 mx-auto border border-white/20 shadow-lg"
                >
                  {appScreens[activeScreen].icon}
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[#F9FAFB] text-base font-bold mb-2 text-center"
                >
                  {appScreens[activeScreen].title}
                </motion.h3>

                <div className="flex gap-1.5 mb-3">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white/10 backdrop-blur-xl rounded-lg px-2 py-1.5 flex-1 border border-white/20"
                  >
                    <p className="text-[#F9FAFB]/70 text-[8px]">Min.</p>
                    <p className="text-[#F9FAFB] font-bold text-sm">{appScreens[activeScreen].amount}</p>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl rounded-lg px-2 py-1.5 flex-1 border border-white/20"
                  >
                    <p className="text-[#F9FAFB]/70 text-[8px]">Returns</p>
                    <p className="text-[#F9FAFB] font-bold text-sm">{appScreens[activeScreen].returns}</p>
                  </motion.div>
                </div>

                <div className="space-y-1.5 mt-1 flex-1">
                  {appScreens[activeScreen].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.45 + index * 0.1 }}
                      className="flex items-center gap-1.5 bg-[#111111]/5 backdrop-blur-sm rounded-lg p-1.5 border border-white/10"
                    >
                      <div className="w-4 h-4 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full flex items-center justify-center text-[#F9FAFB] text-[8px] shrink-0">
                        ✓
                      </div>
                      <span className="text-[#F9FAFB]/80 text-[9px]">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-2 bg-[#111111]/5 backdrop-blur-xl rounded-lg p-2 border border-white/10"
                >
                  <div className="flex justify-between text-[#F9FAFB]/70 text-[8px] mb-1">
                    <span>Portfolio Growth</span>
                    <span className="text-[#10B981]">+28%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: appScreens[activeScreen].chart }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full"
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-2 mb-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] py-2 rounded-xl font-semibold text-xs hover:shadow-lg hover:shadow-[#F59E0B]/30 transition-all transform hover:scale-105"
                >
                  Get Started Now
                </motion.button>

                <div className="flex justify-around text-[#F9FAFB]/80 text-xs">
                  <span className="text-[#F9FAFB] bg-white/10 p-1.5 rounded-lg">🏠</span>
                  <span className="hover:text-[#F9FAFB] transition-colors p-1.5">📈</span>
                  <span className="hover:text-[#F9FAFB] transition-colors p-1.5">💰</span>
                  <span className="hover:text-[#F9FAFB] transition-colors p-1.5">👤</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#2A2A2A] rounded-full"></div>
        </div>

        <div className="absolute -left-1 top-20 w-1 h-8 bg-[#2A2A2A] rounded-l"></div>
        <div className="absolute -right-1 top-24 w-1 h-12 bg-[#2A2A2A] rounded-r"></div>
        <div className="absolute -right-1 top-40 w-1 h-12 bg-[#2A2A2A] rounded-r"></div>
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {appScreens.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveScreen(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeScreen === index
                ? "w-6 bg-gradient-to-r from-[#F59E0B] to-[#B45309]"
                : "w-2 bg-[#2A2A2A] hover:bg-[#F59E0B]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const AppFeatures = () => {
  const features = [
    {
      icon: "🚀",
      title: "Lightning Fast",
      desc: "Open account in 5 minutes with paperless KYC",
      color: "from-[#F59E0B] to-[#B45309]",
      stats: "5 min",
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "📊",
      title: "Live Tracking",
      desc: "Real-time portfolio updates and market insights",
      color: "from-[#10B981] to-[#059669]",
      stats: "24/7",
      bg: "from-[#10B981]/10 to-[#059669]/10"
    },
    {
      icon: "🔒",
      title: "Security",
      desc: "256-bit encryption & biometric authentication",
      color: "from-[#F59E0B] to-[#B45309]",
      stats: "Secure",
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "💬",
      title: "Expert Chat",
      desc: "Direct chat with investment advisors",
      color: "from-[#F59E0B] to-[#B45309]",
      stats: "Live",
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "📱",
      title: "Offline Mode",
      desc: "Access your portfolio without internet",
      color: "from-[#F59E0B] to-[#B45309]",
      stats: "Anywhere",
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "🎯",
      title: "Goal Planner",
      desc: "AI-powered goal-based investment planning",
      color: "from-[#F59E0B] to-[#B45309]",
      stats: "Smart",
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className={`bg-gradient-to-br ${feature.bg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#2A2A2A] group relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[#111111]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${feature.color} text-[#F9FAFB] shadow-md`}>
                {feature.stats}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">{feature.title}</h3>
            <p className="text-sm text-[#9CA3AF]">{feature.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AppFlowSteps = () => {
  const steps = [
    {
      icon: "📱",
      title: "Download App",
      desc: "Get the Vedant Asset app from App Store or Play Store",
      color: "from-[#F59E0B] to-[#B45309]",
      details: ["Scan QR code", "Instant download", "Free to install"],
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "📝",
      title: "Quick Registration",
      desc: "Complete KYC in minutes with our simple process",
      color: "from-[#10B981] to-[#059669]",
      details: ["PAN verification", "Aadhaar linking", "Bank details"],
      bg: "from-[#10B981]/10 to-[#059669]/10"
    },
    {
      icon: "🎯",
      title: "Set Goals",
      desc: "Define your financial goals and investment preferences",
      color: "from-[#F59E0B] to-[#B45309]",
      details: ["Goal planning", "Risk assessment", "Timeline setup"],
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    },
    {
      icon: "💰",
      title: "Start Investing",
      desc: "Begin your investment journey with as low as ₹500",
      color: "from-[#F59E0B] to-[#B45309]",
      details: ["SIP setup", "Lumpsum investment", "Portfolio tracking"],
      bg: "from-[#F59E0B]/10 to-[#B45309]/10"
    }
  ];

  return (
    <div className="relative px-4">
      <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B]/30 via-[#B45309]/30 to-[#10B981]/30 rounded-full"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative group"
          >
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-full flex items-center justify-center text-[#F9FAFB] font-bold text-base z-10 shadow-xl border-4 border-[#111111]">
              {index + 1}
            </div>

            <div className={`bg-gradient-to-br ${step.bg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#2A2A2A] group-hover:scale-105`}>
              <div className={`w-14 h-14 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-2xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                {step.icon}
              </div>

              <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">{step.title}</h3>
              <p className="text-[#9CA3AF] text-xs mb-4">{step.desc}</p>

              <div className="space-y-2">
                {step.details.map((detail, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-2 text-xs text-[#9CA3AF]"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`}></span>
                    {detail}
                  </motion.div>
                ))}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="lg:hidden flex justify-center my-2">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DownloadSection = () => {
  return (
    <div className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#FFFFFF10_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#111111]/5 rounded-full blur-3xl animate-ping"></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-[#F9FAFB] mb-4"
          >
            Get the Vedant Asset App
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#F9FAFB]/90 text-lg mb-8"
          >
            Download now and start your investment journey. Available on iOS and Android.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <button className="flex items-center gap-3 bg-[#0A0A0A] text-[#F9FAFB] px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </button>

            <button className="flex items-center gap-3 bg-[#0A0A0A] text-[#F9FAFB] px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.83.94-1.3 1.63-.84l13.52 8.5c.7.44.7 1.54 0 1.98l-13.52 8.5c-.69.46-1.63-.01-1.63-.84z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">Get it on</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center gap-4"
          >
            <div className="bg-[#111111] p-3 rounded-xl shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1F1A1A] to-[#111111] rounded-xl flex items-center justify-center text-[#F9FAFB] text-xs font-bold border-2 border-white/30">
                SCAN ME
              </div>
            </div>
            <div>
              <span className="text-[#F9FAFB]/80 text-xs block">Scan to download</span>
              <span className="text-[#F9FAFB] font-bold text-base">4.8 ★</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <MobileAppMockup />
        </motion.div>
      </div>
    </div>
  );
};

const HeroWithApp = () => {
  const router = useRouter();
  const { t } = useLandingLang();

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden pt-20 w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B05_1px,transparent_1px)] [background-size:32px_32px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1F1A1A]"></div>
        
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#B45309]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1A1A] backdrop-blur-sm shadow-lg border border-[#F59E0B]/30 mb-6"
          >
            <span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-[#F59E0B]">{t("hero.badge")}</span>
          </motion.div>

          <h1 className="heading-font text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-[#F9FAFB]">{t("hero.title1")}</span>
            <br />
            <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent relative">
              {t("hero.title2")}
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F59E0B] to-[#B45309]"
              ></motion.span>
            </span>
          </h1>

          <p className="text-base text-[#9CA3AF] mt-6 max-w-lg leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex gap-6 mt-8">
            <button
              onClick={() => {
                const element = document.getElementById('choose-path');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="gradient-btn px-8 py-4 rounded-xl font-semibold text-base"
            >
              {t("hero.cta.register")}
            </button>
            <button
              onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl font-semibold text-base bg-[#1F1A1A] backdrop-blur-sm text-[#F9FAFB] border-2 border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-lg transition-all"
            >
              {t("hero.cta.download")}
            </button>
          </div>

          <div className="flex gap-8 mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#1F1A1A] backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-[#2A2A2A]"
            >
              <p className="text-2xl font-bold text-[#F59E0B]">₹300Cr+</p>
              <p className="text-xs text-[#9CA3AF]">{t("hero.stat.aum")}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#1F1A1A] backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-[#2A2A2A]"
            >
              <p className="text-2xl font-bold text-[#10B981]">15%</p>
              <p className="text-xs text-[#9CA3AF]">{t("hero.stat.returns")}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#1F1A1A] backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-[#2A2A2A]"
            >
              <p className="text-2xl font-bold text-[#F59E0B]">50K+</p>
              <p className="text-xs text-[#9CA3AF]">{t("hero.stat.investors")}</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <MobileAppMockup />
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            className="absolute -top-10 -right-10 bg-[#111111] rounded-xl shadow-2xl p-4 border border-[#2A2A2A] hidden lg:block"
          >
            <p className="text-xs text-[#9CA3AF]">{t("hero.appStoreRating")}</p>
            <p className="text-xl font-bold text-[#F59E0B]">4.8 ★</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            className="absolute -bottom-10 -left-10 bg-[#111111] rounded-xl shadow-2xl p-4 border border-[#2A2A2A] hidden lg:block"
          >
            <p className="text-xs text-[#9CA3AF]">{t("hero.activeUsers")}</p>
            <p className="text-xl font-bold text-[#10B981]">50K+</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Updated Investor/Partner Cards with fixed fonts and working button
const ChoosePathCards = () => {
  const router = useRouter();
  const { setUserType } = userStore();

  const handlePathSelect = (type: string) => {
    setUserType(type as any);
    router.push(`/register?userType=${type}`);
  };

  return (
    <div id="choose-path" className="w-full">
      <div className="text-center mb-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block"
        >
          CHOOSE YOUR PATH
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="heading-font text-3xl lg:text-4xl font-bold text-[#F9FAFB] mt-4 mb-3"
        >
          Invest Directly or <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">Grow as a Partner</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#9CA3AF] text-base max-w-3xl mx-auto"
        >
          Whether you're building personal wealth or helping others invest, we have you covered.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {/* Investor Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-[#111111] rounded-3xl shadow-2xl overflow-hidden border border-[#2A2A2A] hover:shadow-3xl transition-all duration-500 group"
        >
          <div className="relative h-40 bg-gradient-to-r from-[#F59E0B] to-[#B45309] p-6 flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#FFFFFF10_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 delay-200"></div>
            
            <div className="relative z-10">
              <span className="text-[#F9FAFB]/90 text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">FOR INVESTORS</span>
              <h3 className="heading-font text-2xl font-bold text-[#F9FAFB] mt-2">Direct Investor</h3>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-[#9CA3AF] mb-4 text-sm">
              Build wealth on your own terms. Start small, stay consistent, and get expert help whenever you need it.
            </p>
            
            <ul className="space-y-3 mb-6">
              {[
                { icon: "💰", text: "Start SIP from just ₹500/month" },
                { icon: "📈", text: "200+ curated mutual funds" },
                { icon: "🎯", text: "Goal-based portfolio planning" },
                { icon: "📊", text: "Real-time analytics dashboard" },
                { icon: "🔒", text: "SEBI-regulated, fully transparent" }
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[#9CA3AF] text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePathSelect("Investor")}
              className="w-full gradient-btn py-3 rounded-xl font-semibold text-base text-center block relative overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10">Start Investing →</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>
          </div>
        </motion.div>

        {/* Partner Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="bg-[#111111] rounded-3xl shadow-2xl overflow-hidden border border-[#2A2A2A] hover:shadow-3xl transition-all duration-500 group"
        >
          <div className="relative h-40 bg-gradient-to-r from-[#10B981] to-[#059669] p-6 flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#FFFFFF10_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 delay-200"></div>
            
            <div className="relative z-10">
              <span className="text-[#F9FAFB]/90 text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">FOR PROFESSIONALS</span>
              <h3 className="heading-font text-2xl font-bold text-[#F9FAFB] mt-2">Financial Partner</h3>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-[#9CA3AF] mb-4 text-sm">
              Scale your advisory practice with our partner network. Earn higher commissions and get the tools to grow.
            </p>
            
            <ul className="space-y-3 mb-6">
              {[
                { icon: "📱", text: "Advanced multi-client dashboard" },
                { icon: "📢", text: "Marketing & onboarding toolkit" },
                { icon: "🎓", text: "Dedicated training programs" },
                { icon: "💰", text: "Higher commission structures" },
                { icon: "⭐", text: "Priority support & onboarding" }
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[#9CA3AF] text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePathSelect("Partner")}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-[#F9FAFB] py-3 rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-[#10B981]/30 transition-all text-center block relative overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10">Join as Partner →</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function LandingPage() {
  const { t } = useLandingLang();
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const appFeaturesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const { setUserType } = userStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = [
        { ref: homeRef, id: "home" },
        { ref: featuresRef, id: "features" },
        { ref: calculatorRef, id: "calculator" },
        { ref: appFeaturesRef, id: "app" },
        { ref: aboutRef, id: "about" },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRegisterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to a specific section when the landing page is opened with a hash
  // (e.g. /landing#features). Used by the in-app nav from logged-in dashboards.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;

    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      home: homeRef,
      features: featuresRef,
      calculator: calculatorRef,
      app: appFeaturesRef,
      about: aboutRef,
    };
    const target = refMap[hash];
    if (!target) return;

    if (hash === "calculator") setShowCalculator(true);

    // Wait one frame so the section has mounted before we scroll
    const t = window.setTimeout(() => {
      target.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  const handleLogin = () => router.push("/login");
  const handleAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  const handleCalculator = () => {
    setShowCalculator(true);
    calculatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleRegister = (type: string) => {
    setRegisterOpen(false);
    router.push(`/register?userType=${type}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Clash+Display:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, .heading-font {
          font-family: 'Clash Display', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-card {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .nav-link {
          position: relative;
          color: #9CA3AF;
          transition: color 0.3s;
          cursor: pointer;
          font-weight: 500;
        }
        
        .nav-link:hover {
          color: #F59E0B;
        }
        
        .nav-link.active {
          color: #F59E0B;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #F59E0B, #B45309);
          border-radius: 2px;
        }
        
        .gradient-btn {
          background: linear-gradient(135deg, #F59E0B, #B45309);
          color: white;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }
        
        .gradient-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }
        
        .gradient-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .gradient-btn:hover::before {
          left: 100%;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#111111]/90 backdrop-blur-md shadow-lg py-3 border-b border-[#2A2A2A]" : "bg-transparent py-5"
      }`}>
        <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img
              src={`${publicPathName}/logo_light.png`}
              alt="Vedant Asset"
              className="h-16 w-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            {[
              { id: "home", label: t("nav.home") },
              { id: "features", label: t("nav.features") },
              { id: "calculator", label: t("nav.calculator") },
              { id: "app", label: t("nav.app") },
              { id: "about", label: t("nav.about") },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "home") homeRef.current?.scrollIntoView({ behavior: "smooth" });
                  if (item.id === "features") featuresRef.current?.scrollIntoView({ behavior: "smooth" });
                  if (item.id === "calculator") handleCalculator();
                  if (item.id === "app") appFeaturesRef.current?.scrollIntoView({ behavior: "smooth" });
                  if (item.id === "about") handleAbout();
                }}
                className={`nav-link text-sm font-semibold ${activeSection === item.id ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <LanguageDropdown />

            <button
              onClick={handleLogin}
              className="text-sm font-semibold text-[#9CA3AF] hover:text-[#F59E0B] transition-colors hidden sm:block"
            >
              {t("nav.signIn")}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRegisterOpen(!registerOpen)}
                className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                {t("nav.register")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {registerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-[#111111] rounded-2xl shadow-xl border border-[#2A2A2A] overflow-hidden"
                  >
                    <div className="p-2">
                      {[
                        { type: "Investor", icon: "📈", label: t("register.investor"), desc: t("register.investorDesc"), color: "from-[#F59E0B] to-[#B45309]" },
                        { type: "Partner", icon: "🤝", label: t("register.partner"), desc: t("register.partnerDesc"), color: "from-[#10B981] to-[#059669]" },
                      ].map(item => (
                        <motion.button
                          key={item.type}
                          whileHover={{ x: 5 }}
                          onClick={() => handleRegister(item.type)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-[#1F1A1A] hover:to-[#1F1A1A] transition-colors cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-[#F9FAFB] text-xl`}>
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm text-[#F9FAFB]">{item.label}</p>
                            <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with App */}
      <section ref={homeRef} id="home">
        <HeroWithApp />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 px-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-[#F59E0B] tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block">{t("section.features.eyebrow")}</span>
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
              <span className="text-[#F9FAFB]">{t("section.features.titleA")}</span>{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                {t("section.features.titleB")}
              </span>
            </h2>
          </motion.div>

          <AppFeatures />
        </div>
      </section>

      {/* Calculator Section */}
      <section ref={calculatorRef} id="calculator" className="py-20 px-6 bg-[#111111]/50">
        <div className="w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-sm font-semibold text-[#F59E0B] tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block">{t("section.calc.eyebrow")}</span>
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
              <span className="text-[#F9FAFB]">{t("section.calc.titleA")}</span>{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                {t("section.calc.titleB")}
              </span>
            </h2>
          </motion.div>
          
          <SIPCalculator />
        </div>
      </section>

      {/* Mobile App Features Section */}
      <section ref={appFeaturesRef} id="app" className="py-20 px-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-[#F59E0B] tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block">{t("section.app.eyebrow")}</span>
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
              <span className="text-[#F9FAFB]">{t("section.app.titleA")}</span>{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                {t("section.app.titleB")}
              </span>
            </h2>
            <p className="text-[#9CA3AF] text-base max-w-2xl mx-auto mt-4">
              {t("section.app.subtitle")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <AppFeatures />
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <MobileAppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* App Flow Steps */}
      <section className="py-20 px-6 bg-[#111111]/50">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-[#F59E0B] tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block">{t("section.steps.eyebrow")}</span>
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-[#F9FAFB] mt-4">
              {t("section.steps.titleA")}{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                {t("section.steps.titleB")}
              </span>
            </h2>
          </motion.div>
          <AppFlowSteps />
        </div>
      </section>

      {/* Download Section */}
      <section ref={downloadRef} id="download" className="py-20 px-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <DownloadSection />
        </div>
      </section>

      {/* Updated CTA Section with Investor/Partner Cards */}
      <section className="py-20 px-6 bg-[#111111]/50">
        <div className="w-full max-w-[1400px] mx-auto">
          <ChoosePathCards />
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-20 px-6">
        <div className="w-full max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="text-sm font-semibold text-[#F59E0B] tracking-wider bg-[#F59E0B]/20 px-4 py-2 rounded-full inline-block">ABOUT US</span>
              <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4">
                <span className="text-[#F9FAFB]">India's Most Trusted</span>{' '}
                <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                  Investment Partner
                </span>
              </h2>
              
              <p className="text-[#9CA3AF] text-base leading-relaxed mb-6">
                Vedant Asset is revolutionizing the way India invests. With over a decade of experience and 300+ Crores in AUM, we've helped thousands of investors achieve their financial goals through smart, technology-driven investment solutions.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "15+", label: "Years Experience", color: "from-[#F59E0B] to-[#B45309]" },
                  { number: "200+", label: "Partner Network", color: "from-[#10B981] to-[#059669]" },
                  { number: "1000+", label: "Happy Clients", color: "from-[#F59E0B] to-[#B45309]" },
                  { number: "24/7", label: "Support", color: "from-[#F59E0B] to-[#B45309]" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-r ${item.color} p-5 rounded-2xl shadow-xl text-[#F9FAFB]`}
                  >
                    <p className="text-2xl font-bold">{item.number}</p>
                    <p className="text-xs opacity-90">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#111111] rounded-3xl p-8 shadow-2xl border border-[#2A2A2A] relative z-10"
              >
                <h3 className="heading-font text-xl font-bold text-[#F9FAFB] mb-3">Our Mission</h3>
                <p className="text-[#9CA3AF] mb-5 text-sm">
                  To democratize investing in India by providing cutting-edge technology, expert guidance, and transparent processes that empower everyone to build wealth.
                </p>
                
                <h3 className="heading-font text-xl font-bold text-[#F9FAFB] mb-3">Our Vision</h3>
                <p className="text-[#9CA3AF] text-sm">
                  To create a financially inclusive India where every individual has access to professional investment tools and expertise, enabling them to secure their financial future.
                </p>
              </motion.div>

              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#B45309]/20 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] py-12 px-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <img
                src={`${publicPathName}/logo_light.png`}
                alt="Vedant Asset"
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                India's most trusted investment platform, making wealth creation accessible to everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li><button onClick={handleAbout} className="hover:text-[#F59E0B] transition-colors">About Us</button></li>
                <li><button onClick={handleCalculator} className="hover:text-[#F59E0B] transition-colors">Calculator</button></li>
                <li><button onClick={() => appFeaturesRef.current?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#F59E0B] transition-colors">Mobile App</button></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Resources</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Investment Guide</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#F9FAFB] mb-4 text-base">Contact</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li className="flex items-center gap-2">📞 9304955509</li>
                <li className="flex items-center gap-2">✉️ vedantasset@gmail.com</li>
                <li>
                  <a 
                    href="https://www.vedantasset.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1"
                  >
                    🌐 www.vedantasset.com
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li className="flex items-start gap-2">📍 3rd Floor, Gayways House, Ranchi — 834001</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2A2A2A] pt-8 text-center">
            <p className="text-sm text-[#9CA3AF]">© 2025 Vedant Asset Technologies Pvt. Ltd. · SEBI Registered Investment Advisor</p>
            <p className="text-xs text-[#9CA3AF]/70 mt-2">Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;