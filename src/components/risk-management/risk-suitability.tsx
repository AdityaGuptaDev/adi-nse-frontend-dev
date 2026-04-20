"use client";

import { ArrowRight, BookOpen, Heart, Sunset, Target, X, User, Calendar, Clock, DollarSign, TrendingUp, Car, Bike } from "lucide-react";
import React, { useState } from "react";

interface RiskSuitabilityProps {
  onSelectNow: () => void;
  onClose: () => void;
  onCreateTarget?: (targetType: string) => void;
}

const RiskSuitability: React.FC<RiskSuitabilityProps> = ({ onSelectNow, onClose }) => {
  const [showCreateTarget, setShowCreateTarget] = useState(false);
  const [showRiskSelection, setShowRiskSelection] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string>("");
  const [reviewerComments, setReviewerComments] = useState<string>("");
  const [targetType, setTargetType] = useState<string>("");
  const [formData, setFormData] = useState({
    childrenCount: 1,
    targetStart: "Jul 2025",
    yearsNeeded: "",
    childName: "",
    childAge: "",
    educationCost: "",
    marriageCost: "",
    inflationRate: "6",
    expectedReturns: "",
    savedAmount: "",
    retirementAge: "",
    currentAge: "50",
    lifeExpectancy: "",
    monthlyIncome: "",
    preRetirementReturns: "",
    postRetirementReturns: "",
    targetTitle: "",
    selectedTarget: "Car", 
  });

  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    for (let year = currentYear; year <= currentYear + 5; year++) {
      const startMonth = year === currentYear ? currentMonth : 0;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let month = startMonth; month < 12; month++) {
        months.push(`${monthNames[month]} ${year}`);
      }
    }
    
    return months;
  };

  const handleCreateTarget = (type: string) => {
    setTargetType(type);
    setShowCreateTarget(true);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRiskSelection = (risk: string) => {
    setSelectedRisk(risk);
  };

  const handleSubmitRiskSelection = () => {
    if (!selectedRisk) {
      alert('Please select a risk profile');
      return;
    }
    alert(`Risk profile "${selectedRisk}" selected successfully!`);
    setShowRiskSelection(false);
  };

  const handleSubmit = () => {
    if (targetType === "retirement") {
      if (!formData.retirementAge || !formData.lifeExpectancy || !formData.monthlyIncome) {
        alert('Please fill all required retirement fields');
        return;
      }
      alert(`Retirement plan created successfully!\nRetirement age: ${formData.retirementAge}\nMonthly income: ₹${formData.monthlyIncome}`);
    } 
    else if (targetType === "marriage") {
      if (!formData.childName.trim() || !formData.marriageCost) {
        alert('Please enter child\'s name and marriage cost');
        return;
      }
      alert(`Target created successfully for ${formData.childName}!\nMarriage needed in: ${formData.yearsNeeded} years\nExpected cost: ₹${formData.marriageCost} Lakhs`);
    }
    else if (targetType === "education") {
      if (!formData.childName.trim() || !formData.educationCost) {
        alert('Please enter child\'s name and education cost');
        return;
      }
      alert(`Target created successfully for ${formData.childName}!\nEducation needed in: ${formData.yearsNeeded} years\nExpected cost: ₹${formData.educationCost} Lakhs`);
    }
    else if (targetType === "other") {
      if (!formData.yearsNeeded || !formData.expectedReturns) {
        alert('Please fill all required fields');
        return;
      }
      alert(`Target created successfully!\nTarget: ${formData.targetTitle || formData.selectedTarget}\nYears needed: ${formData.yearsNeeded}\nExpected returns: ${formData.expectedReturns}%`);
    }
    
    onClose();
  };

  if (showRiskSelection) {
    return (
      <div className="min-h-screen bg-black text-[#F9FAFB] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F59E0B] mb-4">
              Select Your Risk Suitability
            </h1>
            <p className="text-gray-300 mb-6">
              Please select the risk profile that best describes your investment preferences.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-3 text-left text-[#9CA3AF] font-medium">Select</th>
                    <th className="p-3 text-left text-[#9CA3AF] font-medium">Risk Profile</th>
                    <th className="p-3 text-left text-[#9CA3AF] font-medium">Best Suited For</th>
                    <th className="p-3 text-left text-[#9CA3AF] font-medium">Review Due in (days)</th>
                    <th className="p-3 text-left text-[#9CA3AF] font-medium">Last modified on</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 hover:bg-[#111111]/50">
                    <td className="p-3">
                      <input 
                        type="radio" 
                        name="riskProfile" 
                        checked={selectedRisk === "Conservative"}
                        onChange={() => handleRiskSelection("Conservative")}
                        className="h-4 w-4 text-[#F59E0B]"
                      />
                    </td>
                    <td className="p-3 font-medium">Conservative</td>
                    <td className="p-3 text-gray-300">
                      Investors willing to accept low returns for high safety of principal amount or investors willing to take a small amount of risk for potential returns.
                    </td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-[#111111]/50">
                    <td className="p-3">
                      <input 
                        type="radio" 
                        name="riskProfile" 
                        checked={selectedRisk === "Moderate"}
                        onChange={() => handleRiskSelection("Moderate")}
                        className="h-4 w-4 text-[#F59E0B]"
                      />
                    </td>
                    <td className="p-3 font-medium">Moderate</td>
                    <td className="p-3 text-gray-300">
                      Investors willing to accept a moderate level of risk for moderate returns.
                    </td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-[#111111]/50">
                    <td className="p-3">
                      <input 
                        type="radio" 
                        name="riskProfile" 
                        checked={selectedRisk === "Aggressive"}
                        onChange={() => handleRiskSelection("Aggressive")}
                        className="h-4 w-4 text-[#F59E0B]"
                      />
                    </td>
                    <td className="p-3 font-medium">Aggressive</td>
                    <td className="p-3 text-gray-300">
                      Investors willing to take relatively high risk for high returns.
                    </td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-[#111111]/50">
                    <td className="p-3">
                      <input 
                        type="radio" 
                        name="riskProfile" 
                        checked={selectedRisk === "Very Aggressive"}
                        onChange={() => handleRiskSelection("Very Aggressive")}
                        className="h-4 w-4 text-[#F59E0B]"
                      />
                    </td>
                    <td className="p-3 font-medium">Very Aggressive</td>
                    <td className="p-3 text-gray-300">
                      Investors willing to lose capital for significantly high returns.
                    </td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                    <td className="p-3 text-[#9CA3AF]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-300 font-medium mb-2">
                Reviewer's Comments:
              </label>
              <textarea
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
                className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                rows={4}
                maxLength={1000}
                placeholder="Enter your comments (1000 characters max)"
              />
              <div className="text-right text-sm text-[#9CA3AF]">
                {reviewerComments.length}/1000 characters
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowRiskSelection(false)}
                className="px-6 py-2 bg-gray-700 text-[#F9FAFB] rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRiskSelection}
                className="px-6 py-2 bg-[#F59E0B] text-[#F9FAFB] rounded-lg font-medium hover:bg-[#B45309] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateTarget) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#0A0A0A] rounded-xl shadow-2xl border border-gray-800 w-full max-w-5xl">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-[#F59E0B] text-center">
              {targetType === "marriage" ? "Create Target for your Child's Marriage" : 
               targetType === "education" ? "Create Target for your Child's Education" :
               targetType === "retirement" ? "Retirement Target starts in:" :
               "Create Investment Target"}
            </h2>
          </div>

          <div className="p-6">
            {targetType === "retirement" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField
                    icon={<User className="text-[#F59E0B]" size={18} />}
                    label="At what age do you wish to retire?"
                    input={
                      <input
                        type="number"
                        value={formData.retirementAge}
                        onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                        className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                        min="1"
                        max="100"
                      />
                    }
                  />

                  <FormField
                    icon={<User className="text-[#F59E0B]" size={18} />}
                    label={
                      <span>
                        (Your current age is {formData.currentAge} yrs. If incorrect, please make correction here)
                      </span>
                    }
                    input={
                      <input
                        type="number"
                        value={formData.currentAge}
                        onChange={(e) => handleInputChange('currentAge', e.target.value)}
                        className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                        min="1"
                        max="100"
                      />
                    }
                  />

                  <FormField
                    icon={<Clock className="text-[#F59E0B]" size={18} />}
                    label="What is your Life expectancy?"
                    input={
                      <input
                        type="number"
                        value={formData.lifeExpectancy}
                        onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
                        className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                        min="1"
                        max="120"
                      />
                    }
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    icon={<DollarSign className="text-[#F59E0B]" size={18} />}
                    label="How much do you wish to earn each month after Retirement? (Current Value)"
                    input={
                      <input
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                        className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                      />
                    }
                  />

                  <FormField
                    icon={<TrendingUp className="text-[#F59E0B]" size={18} />}
                    label="What is your anticipated inflation rate?"
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.inflationRate}
                          onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          step="0.1"
                          min="0"
                          max="20"
                        />
                        <span className="ml-2 text-[#9CA3AF]">%</span>
                      </div>
                    }
                  />

                  <FormField
                    icon={<TrendingUp className="text-[#F59E0B]" size={18} />}
                    label="What are the annual returns you expect on your investment before retirement?"
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.preRetirementReturns}
                          onChange={(e) => handleInputChange('preRetirementReturns', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          step="0.1"
                          min="0"
                          max="30"
                        />
                        <span className="ml-2 text-[#9CA3AF]">%</span>
                      </div>
                    }
                  />

                  <FormField
                    icon={<TrendingUp className="text-[#F59E0B]" size={18} />}
                    label="What are the annual returns you expect on your investment after retirement?"
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.postRetirementReturns}
                          onChange={(e) => handleInputChange('postRetirementReturns', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          step="0.1"
                          min="0"
                          max="30"
                        />
                        <span className="ml-2 text-[#9CA3AF]">%</span>
                      </div>
                    }
                  />

                  <FormField
                    icon={<DollarSign className="text-[#F59E0B]" size={18} />}
                    label="How much money have you already saved for your Retirement?"
                    input={
                      <input
                        type="number"
                        value={formData.savedAmount}
                        onChange={(e) => handleInputChange('savedAmount', e.target.value)}
                        className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                      />
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {targetType === "other" ? (
                    <>
                      <FormField
                        icon={<Target className="text-[#F59E0B]" size={18} />}
                        label="Select the Target you wish to reach:"
                        input={
                          <select
                            value={formData.selectedTarget}
                            onChange={(e) => handleInputChange('selectedTarget', e.target.value)}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          >
                            <option value="Car" className="bg-[#111111]">Car</option>
                            <option value="Bike" className="bg-[#111111]">Bike</option>
                            <option value="House" className="bg-[#111111]">House</option>
                            <option value="Vacation" className="bg-[#111111]">Vacation</option>
                            <option value="Wealth Builder" className="bg-[#111111]">Wealth Builder</option>
                          </select>
                        }
                      />
                      <FormField
                        icon={<Calendar className="text-[#F59E0B]" size={18} />}
                        label="Target Starts in:"
                        input={
                          <select 
                            value={formData.targetStart}
                            onChange={(e) => handleInputChange('targetStart', e.target.value)}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          >
                            {generateMonths().map(month => (
                              <option key={month} value={month} className="bg-[#111111]">{month}</option>
                            ))}
                          </select>
                        }
                      />
                      <FormField
                        icon={<Target className="text-[#F59E0B]" size={18} />}
                        label="Target Title (Optional)"
                        input={
                          <input
                            type="text"
                            value={formData.targetTitle}
                            onChange={(e) => handleInputChange('targetTitle', e.target.value)}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                            placeholder="e.g. Buy a Tesla Model 3"
                          />
                        }
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        icon={<User className="text-[#F59E0B]" size={18} />}
                        label="Select the number of children you wish to set the target for:"
                        input={
                          <select 
                            value={formData.childrenCount}
                            onChange={(e) => handleInputChange('childrenCount', parseInt(e.target.value))}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num} className="bg-[#111111]">{num}</option>
                            ))}
                          </select>
                        }
                      />

                      <FormField
                        icon={<Calendar className="text-[#F59E0B]" size={18} />}
                        label="Target Starts in:"
                        input={
                          <select 
                            value={formData.targetStart}
                            onChange={(e) => handleInputChange('targetStart', e.target.value)}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          >
                            {generateMonths().map(month => (
                              <option key={month} value={month} className="bg-[#111111]">{month}</option>
                            ))}
                          </select>
                        }
                      />
                    </>
                  )}

                  {targetType === "marriage" || targetType === "education" ? (
                    <>
                      <FormField
                        icon={<User className="text-[#F59E0B]" size={18} />}
                        label="Child's Name:"
                        input={
                          <input
                            type="text"
                            value={formData.childName}
                            onChange={(e) => handleInputChange('childName', e.target.value)}
                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          />
                        }
                      />

                      <FormField
                        icon={<Clock className="text-[#F59E0B]" size={18} />}
                        label="Child's Age:"
                        input={
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={formData.childAge}
                              onChange={(e) => handleInputChange('childAge', e.target.value)}
                              className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                              min="0"
                              max="30"
                            />
                            <span className="ml-2 text-[#9CA3AF]">yrs</span>
                          </div>
                        }
                      />
                    </>
                  ) : null}
                </div>

                <div className="space-y-6">
                  {targetType === "marriage" || targetType === "education" ? (
                    <>
                      <FormField
                        icon={<Clock className="text-[#F59E0B]" size={18} />}
                        label={`In how many years will you need money for this child's ${targetType === "marriage" ? "Marriage" : "Education"}?`}
                        input={
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={formData.yearsNeeded}
                              onChange={(e) => handleInputChange('yearsNeeded', e.target.value)}
                              className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                              min="1"
                              max="30"
                            />
                            <span className="ml-2 text-[#9CA3AF]">years</span>
                          </div>
                        }
                      />

                      <FormField
                        icon={<DollarSign className="text-[#F59E0B]" size={18} />}
                        label={`What is your expected cost of ${targetType === "marriage" ? "Marriage" : "Education"} (based on current value)?`}
                        input={
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={targetType === "marriage" ? formData.marriageCost : formData.educationCost}
                              onChange={(e) => handleInputChange(targetType === "marriage" ? 'marriageCost' : 'educationCost', e.target.value)}
                              className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                            />
                            <span className="ml-2 text-[#9CA3AF]">Lacs</span>
                          </div>
                        }
                      />
                    </>
                  ) : targetType === "other" && (
                    <>
                      <FormField
                        icon={<Clock className="text-[#F59E0B]" size={18} />}
                        label={`In how many years do you wish to ${formData.selectedTarget === "Car" ? "buy a Car" : formData.selectedTarget === "Bike" ? "buy a Bike" : `achieve ${formData.selectedTarget}`}?`}
                        input={
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={formData.yearsNeeded}
                              onChange={(e) => handleInputChange('yearsNeeded', e.target.value)}
                              className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                              min="1"
                              max="30"
                            />
                            <span className="ml-2 text-[#9CA3AF]">years</span>
                          </div>
                        }
                      />

                      <FormField
                        icon={<DollarSign className="text-[#F59E0B]" size={18} />}
                        label="What is your expected cost of this Target (based on current value)?"
                        input={
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={formData.educationCost}
                              onChange={(e) => handleInputChange('educationCost', e.target.value)}
                              className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                            />
                            <span className="ml-2 text-[#9CA3AF]">Lacs</span>
                          </div>
                        }
                      />
                    </>
                  )}

                  <FormField
                    icon={<TrendingUp className="text-[#F59E0B]" size={18} />}
                    label="What is your anticipated inflation rate?"
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.inflationRate}
                          onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          step="0.1"
                          min="0"
                          max="20"
                        />
                        <span className="ml-2 text-[#9CA3AF]">%</span>
                      </div>
                    }
                  />

                  <FormField
                    icon={<TrendingUp className="text-[#F59E0B]" size={18} />}
                    label="What are the annual returns you expect on your investment?"
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.expectedReturns}
                          onChange={(e) => handleInputChange('expectedReturns', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                          step="0.1"
                          min="0"
                          max="30"
                        />
                        <span className="ml-2 text-[#9CA3AF]">%</span>
                      </div>
                    }
                  />

                  <FormField
                    icon={<DollarSign className="text-[#F59E0B]" size={18} />}
                    label={`How much money have you already saved ${targetType === "other" ? "for this Target" : targetType === "marriage" ? "for this child's Marriage" : "for this child's Education"}?`}
                    input={
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.savedAmount}
                          onChange={(e) => handleInputChange('savedAmount', e.target.value)}
                          className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                        />
                        <span className="ml-2 text-[#9CA3AF]">Lacs</span>
                      </div>
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-[#111111] rounded-b-xl flex justify-between border-t border-gray-700">
            <button
              onClick={() => setShowCreateTarget(false)}
              className="px-8 py-3 bg-gray-700 text-[#F9FAFB] rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              GO BACK
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-[#F59E0B] text-[#F9FAFB] rounded-lg font-medium hover:bg-[#B45309] transition-colors"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#F9FAFB] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F59E0B] mb-2">
            Risk Suitability not selected yet.
          </h1>
          <p className="text-gray-300">
            Since all investments carry a certain degree of risks, suitability selection is very important for helping you find the right product(s) for your needs.
          </p>
        </div>

        <div className="flex flex-col items-center mb-10">
          <button
            onClick={() => setShowRiskSelection(true)}
            className="bg-[#F59E0B] hover:bg-[#B45309] text-[#F9FAFB] font-medium py-3 px-8 rounded-lg mb-4 flex items-center transition-colors"
          >
            Select Now
            <ArrowRight className="ml-2" size={18} />
          </button>
          <div className="text-[#9CA3AF] text-sm mb-6">— OR, skip the suitability selection process and start creating your investment targets —</div>
        </div>
        
        <h2 className="text-xl font-bold text-[#F59E0B] mb-6">Create a New Target</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TargetCard
            icon={<BookOpen className="text-green-400" size={20} />}
            title="Child's Education"
            onClick={() => handleCreateTarget("education")}
          />
          <TargetCard
            icon={<Heart className="text-pink-400" size={20} />}
            title="Child's Marriage"
            onClick={() => handleCreateTarget("marriage")}
          />
          <TargetCard
            icon={<Sunset className="text-orange-400" size={20} />}
            title="Retirement"
            onClick={() => handleCreateTarget("retirement")}
          />
          <TargetCard
            icon={<Target className="text-purple-400" size={20} />}
            title="Other Targets (Wealth Builder etc)"
            onClick={() => handleCreateTarget("other")}
          />
        </div>
      </div>
    </div>
  );
};

const TargetCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, title, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-6 border border-gray-800 rounded-xl hover:bg-[#111111] hover:border-blue-400 transition-colors ${className}`}
    >
      <div className="mb-3 p-3 bg-[#111111] rounded-full">{icon}</div>
      <span className="text-center font-medium text-[#F9FAFB]">{title}</span>
    </button>
  );
};

const FormField: React.FC<{
  icon: React.ReactNode;
  label: React.ReactNode;
  input: React.ReactNode;
}> = ({ icon, label, input }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-start text-sm font-medium text-gray-300">
        <span className="mr-2 mt-0.5">{icon}</span>
        {label}
      </label>
      {input}
    </div>
  );
};

export default RiskSuitability;
