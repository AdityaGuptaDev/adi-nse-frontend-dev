import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, ChevronLeft, PieChart, IndianRupee, Calendar, DollarSign } from 'lucide-react';

export default function InvestmentCalculator() {
  const [activeTab, setActiveTab] = useState('sip');
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [lumpSumAmount, setLumpSumAmount] = useState(100000);
  const [withdrawalAmount, setWithdrawalAmount] = useState(5000);
  const [swpPeriod, setSwpPeriod] = useState(10);
  const [results, setResults] = useState({
    totalInvestment: 0,
    futureValue: 0,
    wealthGained: 0,
    totalWithdrawals: 0,
    remainingAmount: 0
  });

  // SIP calculation formula
  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = investmentPeriod * 12;

    // Future Value of SIP formula: M * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyInvestment *
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));

    const totalInvestment = monthlyInvestment * totalMonths;
    const wealthGained = futureValue - totalInvestment;

    setResults({
      totalInvestment,
      futureValue,
      wealthGained,
      totalWithdrawals: 0,
      remainingAmount: 0
    });
  };

  // Lumpsum calculation formula
  const calculateLumpsum = () => {
    const annualRate = expectedReturn / 100;
    const futureValue = lumpSumAmount * Math.pow(1 + annualRate, investmentPeriod);
    const wealthGained = futureValue - lumpSumAmount;

    setResults({
      totalInvestment: lumpSumAmount,
      futureValue,
      wealthGained,
      totalWithdrawals: 0,
      remainingAmount: 0
    });
  };

  // SWP calculation formula - SIMPLIFIED AND CORRECTED
  const calculateSWP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = swpPeriod * 12;
    const principal = lumpSumAmount;

    // Simple iterative calculation (most accurate)
    let balance = principal;
    let totalWithdrawn = 0;
    let monthsCompleted = 0;

    for (let month = 1; month <= totalMonths; month++) {
      // Apply monthly interest first
      balance = balance * (1 + monthlyRate);

      // Then withdraw
      if (balance >= withdrawalAmount) {
        balance -= withdrawalAmount;
        totalWithdrawn += withdrawalAmount;
        monthsCompleted = month;
      } else {
        // If can't withdraw full amount, withdraw whatever is left
        totalWithdrawn += balance;
        balance = 0;
        break;
      }
    }

    const wealthGained = (balance + totalWithdrawn) - principal;

    setResults({
      totalInvestment: principal,
      futureValue: balance,
      wealthGained: wealthGained,
      totalWithdrawals: totalWithdrawn,
      remainingAmount: balance
    });
  };

  useEffect(() => {
    if (activeTab === 'sip') {
      calculateSIP();
    } else if (activeTab === 'lumpsum') {
      calculateLumpsum();
    } else if (activeTab === 'swp') {
      calculateSWP();
    }
  }, [activeTab, monthlyInvestment, investmentPeriod, expectedReturn, lumpSumAmount, withdrawalAmount, swpPeriod]);

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
      return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to format percentage
  const formatPercentage = (value: any) => {
    if (isNaN(value) || !isFinite(value) || value <= 0) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // Calculate percentages for visualization
  const getInvestmentPercentage = () => {
    if (activeTab === 'swp') {
      const total = results.remainingAmount + results.totalWithdrawals;
      if (total <= 0) return 0;
      return (results.totalInvestment / total) * 100;
    } else {
      if (results.futureValue <= 0) return 0;
      return (results.totalInvestment / results.futureValue) * 100;
    }
  };

  const getReturnsPercentage = () => {
    if (activeTab === 'swp') {
      const total = results.remainingAmount + results.totalWithdrawals;
      if (total <= 0) return 0;
      return (results.wealthGained / total) * 100;
    } else {
      if (results.futureValue <= 0) return 0;
      return (results.wealthGained / results.futureValue) * 100;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto"> {/* Changed from max-w-6xl to max-w-7xl */}
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {/* Tabs - Full width */}
        <div className="flex mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${activeTab === 'sip' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('sip')}
          >
            <div className="flex items-center justify-center gap-2">
              <Calculator className="h-5 w-5" />
              SIP Calculator
            </div>
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${activeTab === 'lumpsum' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('lumpsum')}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lumpsum Calculator
            </div>
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${activeTab === 'swp' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('swp')}
          >
            <div className="flex items-center justify-center gap-2">
              <IndianRupee className="h-5 w-5" />
              SWP Calculator
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8"> {/* Increased gap */}
          {/* Input Section - Full width card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              {activeTab === 'sip' && <Calculator className="h-6 w-6 text-blue-600" />}
              {activeTab === 'lumpsum' && <TrendingUp className="h-6 w-6 text-blue-600" />}
              {activeTab === 'swp' && <IndianRupee className="h-6 w-6 text-blue-600" />}
              {activeTab === 'sip' && 'SIP Investment Details'}
              {activeTab === 'lumpsum' && 'Lumpsum Investment Details'}
              {activeTab === 'swp' && 'SWP Investment Details'}
            </h2>

            <div className="space-y-8">
              {/* SIP Inputs */}
              {activeTab === 'sip' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Monthly Investment Amount
                      </label>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(monthlyInvestment)}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-lg">₹</span>
                      <input
                        type="number"
                        value={monthlyInvestment}
                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                        min="500"
                        step="500"
                      />
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="100000"
                      step="500"
                      value={monthlyInvestment}
                      onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                      className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₹500</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                </>
              )}

              {/* Lumpsum Inputs */}
              {activeTab === 'lumpsum' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Investment Amount
                      </label>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(lumpSumAmount)}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-lg">₹</span>
                      <input
                        type="number"
                        value={lumpSumAmount}
                        onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                        min="1000"
                        step="1000"
                      />
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="10000000"
                      step="1000"
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                      className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₹1,000</span>
                      <span>₹1,00,00,000</span>
                    </div>
                  </div>
                </>
              )}

              {/* SWP Inputs */}
              {activeTab === 'swp' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Investment Amount
                      </label>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(lumpSumAmount)}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-lg">₹</span>
                      <input
                        type="number"
                        value={lumpSumAmount}
                        onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                        min="1000"
                        step="1000"
                      />
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="10000000"
                      step="1000"
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                      className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₹1,000</span>
                      <span>₹1,00,00,000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Monthly Withdrawal Amount
                      </label>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(withdrawalAmount)}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-lg">₹</span>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                        min="500"
                        step="500"
                      />
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="100000"
                      step="500"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                      className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₹500</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                </>
              )}

              {/* Common Inputs */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {activeTab === 'swp' ? 'Withdrawal Period (Years)' : 'Investment Period (Years)'}
                  </label>
                  <span className="text-lg font-bold text-blue-600">
                    {activeTab === 'swp' ? swpPeriod : investmentPeriod} Years
                  </span>
                </div>
                <input
                  type="number"
                  value={activeTab === 'swp' ? swpPeriod : investmentPeriod}
                  onChange={(e) => {
                    if (activeTab === 'swp') {
                      setSwpPeriod(Number(e.target.value));
                    } else {
                      setInvestmentPeriod(Number(e.target.value));
                    }
                  }}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                  min="1"
                  max="50"
                />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={activeTab === 'swp' ? swpPeriod : investmentPeriod}
                  onChange={(e) => {
                    if (activeTab === 'swp') {
                      setSwpPeriod(Number(e.target.value));
                    } else {
                      setInvestmentPeriod(Number(e.target.value));
                    }
                  }}
                  className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1 Year</span>
                  <span>50 Years</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Expected Annual Return (%)
                  </label>
                  <span className="text-lg font-bold text-blue-600">{expectedReturn}%</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                    min="1"
                    max="30"
                    step="0.5"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 text-lg">%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full mt-4 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section - Full width */}
          <div className="space-y-8">
            {/* Summary Cards - 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {activeTab === 'swp' ? 'Initial Investment' : 'Total Investment'}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(results.totalInvestment)}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {activeTab === 'swp' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(results.totalWithdrawals)}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {activeTab === 'swp' ? 'Remaining Amount' : 'Future Value'}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {formatCurrency(activeTab === 'swp' ? results.remainingAmount : results.futureValue)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {activeTab === 'swp' ? 'Total Returns' : 'Wealth Gained'}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(results.wealthGained)}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {activeTab === 'swp' ? 'Withdrawal Breakdown' : 'Investment Breakdown'}
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {activeTab === 'swp' ? 'Initial Investment' : 'Principal Amount'}
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatPercentage(getInvestmentPercentage())}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(getInvestmentPercentage(), 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formatCurrency(results.totalInvestment)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Returns</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatPercentage(getReturnsPercentage())}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(getReturnsPercentage(), 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formatCurrency(results.wealthGained)}
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {activeTab === 'sip' && 'SIP Summary'}
                {activeTab === 'lumpsum' && 'Lumpsum Summary'}
                {activeTab === 'swp' && 'SWP Summary'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                {activeTab === 'sip' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Monthly SIP:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(monthlyInvestment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Investment Period:</span>
                        <span className="font-bold text-blue-600">{investmentPeriod} years</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Expected Return:</span>
                        <span className="font-bold text-blue-600">{expectedReturn}% p.a.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Installments:</span>
                        <span className="font-bold text-blue-600">{investmentPeriod * 12}</span>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'lumpsum' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Investment Amount:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(lumpSumAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Investment Period:</span>
                        <span className="font-bold text-blue-600">{investmentPeriod} years</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Expected Return:</span>
                        <span className="font-bold text-blue-600">{expectedReturn}% p.a.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Value:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(results.futureValue)}</span>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'swp' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Initial Investment:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(lumpSumAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Monthly Withdrawal:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(withdrawalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Withdrawal Period:</span>
                        <span className="font-bold text-blue-600">{swpPeriod} years</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Expected Return:</span>
                        <span className="font-bold text-blue-600">{expectedReturn}% p.a.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Withdrawals:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(results.totalWithdrawals)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Remaining Amount:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(results.remainingAmount)}</span>
                      </div>
                    </div>
                    {results.totalWithdrawals < (withdrawalAmount * swpPeriod * 12) && (
                      <div className="col-span-2 mt-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-700 text-sm font-medium">
                            ⚠️ Funds will be exhausted after approximately {Math.round(results.totalWithdrawals / withdrawalAmount)} months
                            ({Math.round((results.totalWithdrawals / withdrawalAmount) / 12)} years)
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-800 mb-3">Important Notes</h4>
          <p className="text-sm text-gray-600">
            *This calculator provides an estimate based on the inputs provided. Actual returns may vary based on market conditions.
            Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.
            For SWP: The calculation assumes withdrawals are made at the end of each month. If withdrawal amount is too high relative
            to investment and expected returns, funds may be exhausted before the end of the period.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}