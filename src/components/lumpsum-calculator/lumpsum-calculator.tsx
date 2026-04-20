import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, PieChart, DollarSign, Target, ChevronLeft, IndianRupee } from 'lucide-react';

export default function LumpsumCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [results, setResults] = useState({
    initialInvestment: 0,
    futureValue: 0,
    wealthGained: 0,
    cagrRate: 0
  });

  // Lumpsum calculation formula
  const calculateLumpsum = () => {
    // Future Value = P × (1 + r)^n
    const futureValue = investmentAmount * Math.pow(1 + (expectedReturn / 100), investmentPeriod);
    const wealthGained = futureValue - investmentAmount;

    // CAGR calculation for verification
    const cagrRate = ((Math.pow(futureValue / investmentAmount, 1 / investmentPeriod) - 1) * 100);

    setResults({
      initialInvestment: investmentAmount,
      futureValue,
      wealthGained,
      cagrRate
    });
  };

  useEffect(() => {
    calculateLumpsum();
  }, [investmentAmount, investmentPeriod, expectedReturn]);

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: any) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  // Calculate year-wise growth for the chart visualization
  const getYearlyGrowth = () => {
    const yearlyData = [];
    for (let year = 0; year <= investmentPeriod; year++) {
      const value = investmentAmount * Math.pow(1 + (expectedReturn / 100), year);
      yearlyData.push({
        year,
        value,
        growth: value - investmentAmount
      });
    }
    return yearlyData;
  };

  const yearlyGrowth = getYearlyGrowth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-6">
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#F59E0B]" />
              Investment Details
            </h2>

            <div className="space-y-6">
              {/* Investment Amount */}
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  One-time Investment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#9CA3AF]">₹</span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none"
                    min="10000"
                    step="10000"
                  />
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full mt-2 h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                  <span>₹10,000</span>
                  <span>₹1,00,00,000</span>
                </div>
              </div>

              {/* Investment Period */}
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Investment Period (Years)
                </label>
                <input
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none"
                  min="1"
                  max="50"
                />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  className="w-full mt-2 h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                  <span>1 Year</span>
                  <span>50 Years</span>
                </div>
              </div>

              {/* Expected Return */}
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Expected Annual Return (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none"
                    min="1"
                    max="30"
                    step="0.5"
                  />
                  <span className="absolute right-3 top-3 text-[#9CA3AF]">%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full mt-2 h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4">
              <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#9CA3AF]">Initial Investment</p>
                    <p className="text-xl font-bold text-[#F9FAFB]">{formatCurrency(results.initialInvestment)}</p>
                  </div>
                  <div className="h-10 w-10 bg-[#1F1A1A] rounded-full flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#9CA3AF]">Future Value</p>
                    <p className="text-xl font-bold text-[#F9FAFB]">{formatCurrency(results.futureValue)}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#9CA3AF]">Wealth Gained</p>
                    <p className="text-xl font-bold text-[#F9FAFB]">{formatCurrency(results.wealthGained)}</p>
                  </div>
                  <div className="h-10 w-10 bg-[#2A1F0A] rounded-full flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-5">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Investment Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#9CA3AF]">Principal Amount</span>
                  <span className="text-sm font-semibold text-[#F59E0B]">
                    {((results.initialInvestment / results.futureValue) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                  <div
                    className="bg-[#F59E0B] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(results.initialInvestment / results.futureValue) * 100 || 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#9CA3AF]">Capital Gains</span>
                  <span className="text-sm font-semibold text-green-600">
                    {((results.wealthGained / results.futureValue) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(results.wealthGained / results.futureValue) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Growth Visualization */}
            <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] p-5">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Growth Timeline</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {yearlyGrowth.filter((_, index) => index % Math.max(1, Math.floor(investmentPeriod / 10)) === 0 || index === yearlyGrowth.length - 1).map((data, index) => (
                  <div key={data.year} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Year {data.year}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#F59E0B]">
                        {formatCurrency(data.value)}
                      </div>
                      {data.year > 0 && (
                        <div className="text-xs text-green-600">
                          +{formatCurrency(data.growth)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-[#1F1A1A] border border-blue-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Investment Summary</h3>
              <div className="space-y-2 text-sm text-[#F9FAFB]">
                <p>Lumpsum Amount: <span className="font-semibold">{formatCurrency(investmentAmount)}</span></p>
                <p>Investment Period: <span className="font-semibold">{investmentPeriod} years</span></p>
                <p>Expected Return: <span className="font-semibold">{expectedReturn}% per annum</span></p>
                <p>Total Return Multiple: <span className="font-semibold">{(results.futureValue / results.initialInvestment || 0).toFixed(2)}x</span></p>
                <p>Absolute Return: <span className="font-semibold">{(((results.futureValue - results.initialInvestment) / results.initialInvestment) * 100 || 0).toFixed(1)}%</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-8 bg-[#111111] rounded-lg border border-[#2A2A2A] p-6">
          <h3 className="text-xl font-semibold text-[#F9FAFB] mb-4">Key Metrics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-[#1F1A1A] rounded-lg">
              <div className="text-2xl font-bold text-[#F59E0B]">{expectedReturn}%</div>
              <div className="text-sm text-[#9CA3AF]">Expected CAGR</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(results.futureValue / results.initialInvestment || 0).toFixed(1)}x</div>
              <div className="text-sm text-[#9CA3AF]">Return Multiple</div>
            </div>
            <div className="text-center p-4 bg-[#1F1A0A] rounded-lg">
              <div className="text-2xl font-bold text-[#F59E0B]">{formatNumber(results.wealthGained / investmentPeriod || 0)}</div>
              <div className="text-sm text-[#9CA3AF]">Avg. Annual Gain</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{investmentPeriod}</div>
              <div className="text-sm text-[#9CA3AF]">Years to Goal</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#9CA3AF] max-w-2xl mx-auto">
            *This calculator provides an estimate based on the inputs provided. Actual returns may vary based on market conditions.
            Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}