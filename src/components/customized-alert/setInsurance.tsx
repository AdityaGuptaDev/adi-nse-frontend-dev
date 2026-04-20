import React, { useState } from 'react';


export default function InsuranceAlertForm() {
  const [formData, setFormData] = useState({
    insuranceType: 'Life Insurance',
    insurancePlan: 'General Insurance',
    insuranceCompany: '',
    policyNo: '',
    sumAssured: '',
    premiumAmount: '',
    premiumFrequency: 'Yearly',
    premiumDay: '1',
    premiumMonth: 'Jan',
    premiumYear: '2026',
    policyTerm: '',
    insuranceExpiryDate: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Alert created successfully!');
  };

  return (
    <div className="min-h-screen bg-[#1F1A1A]">
      {/* Header Bar */}
      {/* <div className="bg-[#111111] border-b border-[#3A3A3A] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm text-[#E5E7EB]">Manual - Set Insurance Alerts - Google Chrome</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-[#9CA3AF] hover:text-[#E5E7EB]">−</button>
          <button className="text-[#9CA3AF] hover:text-[#E5E7EB]">□</button>
          <button className="text-[#9CA3AF] hover:text-[#E5E7EB]">×</button>
        </div>
      </div> */}

      {/* URL Bar */}
      {/* <div className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <div className="flex-1 bg-[#1F1A1A] rounded px-3 py-1 text-sm text-[#9CA3AF]">
            https://vedantasset.co.in/FinnSys/alerts/set/alerts.insurance.asp?INVESTOR_ID=981
          </div>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="bg-[#111111] px-4 py-2 flex justify-end space-x-2">
        <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center space-x-1">
          <span>📋</span>
          <span>Manage Tickets</span>
        </button>
        <button className="bg-green-600 text-white px-4 py-1 rounded text-sm flex items-center space-x-1">
          <span>📞</span>
          <span>Send us Whatsapp</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-[#F9FAFB] mb-6">
          Set Insurance Alert for LAKSHMI SINHA
        </h2>

        <div className="bg-[#111111] p-6 rounded shadow-sm max-w-2xl">
          <table className="w-full">
            <tbody>
              {/* Insurance Type */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB] w-1/3">
                  Insurance Type:
                </td>
                <td className="py-3">
                  <select 
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.insuranceType}
                    onChange={(e) => handleInputChange('insuranceType', e.target.value)}
                  >
                    <option>Life Insurance</option>
                    <option>Health Insurance</option>
                    <option>Motor Insurance</option>
                    <option>General Insurance</option>
                  </select>
                </td>
              </tr>

              {/* Insurance Plan */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Insurance Plan:
                  <div className="text-xs font-normal text-[#9CA3AF] mt-1">
                    (e.g. Endowment, Pension, Traditional, ULIP, Mediclaim, Motor, Accident etc)
                  </div>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.insurancePlan}
                    onChange={(e) => handleInputChange('insurancePlan', e.target.value)}
                  />
                </td>
              </tr>

              {/* Insurance Company */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Insurance Company:
                  <div className="text-xs font-normal text-[#9CA3AF] mt-1">
                    (e.g. HDFC, LIC of India etc)
                  </div>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  />
                </td>
              </tr>

              {/* Policy No */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Policy No: <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.policyNo}
                    onChange={(e) => handleInputChange('policyNo', e.target.value)}
                  />
                </td>
              </tr>

              {/* Sum Assured */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Sum Assured: <span className="text-[#9CA3AF] font-normal">(Rupees)</span>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.sumAssured}
                    onChange={(e) => handleInputChange('sumAssured', e.target.value)}
                  />
                </td>
              </tr>

              {/* Premium Amount */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Premium Amount: <span className="text-[#9CA3AF] font-normal">(Rupees)</span>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.premiumAmount}
                    onChange={(e) => handleInputChange('premiumAmount', e.target.value)}
                  />
                </td>
              </tr>

              {/* Premium Frequency */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Premium Frequency
                </td>
                <td className="py-3">
                  <select 
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.premiumFrequency}
                    onChange={(e) => handleInputChange('premiumFrequency', e.target.value)}
                  >
                    <option>Yearly</option>
                    <option>Half Yearly</option>
                    <option>Quarterly</option>
                    <option>Monthly</option>
                  </select>
                </td>
              </tr>

              {/* Premium / First Installment Date */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Premium / First Installment Date:
                </td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-[#E5E7EB]">Day</span>
                      <select 
                        className="px-2 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={formData.premiumDay}
                        onChange={(e) => handleInputChange('premiumDay', e.target.value)}
                      >
                        {Array.from({length: 31}, (_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-[#E5E7EB]">Month</span>
                      <select 
                        className="px-2 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={formData.premiumMonth}
                        onChange={(e) => handleInputChange('premiumMonth', e.target.value)}
                      >
                        <option>Jan</option>
                        <option>Feb</option>
                        <option>Mar</option>
                        <option>Apr</option>
                        <option>May</option>
                        <option>Jun</option>
                        <option>Jul</option>
                        <option>Aug</option>
                        <option>Sep</option>
                        <option>Oct</option>
                        <option>Nov</option>
                        <option>Dec</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-[#E5E7EB]">Year</span>
                      <select 
                        className="px-2 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={formData.premiumYear}
                        onChange={(e) => handleInputChange('premiumYear', e.target.value)}
                      >
                        {Array.from({length: 10}, (_, i) => (
                          <option key={2024+i} value={2024+i}>{2024+i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Policy Term */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Policy Term: <span className="text-[#9CA3AF] font-normal">(years)</span>
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-32 px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.policyTerm}
                    onChange={(e) => handleInputChange('policyTerm', e.target.value)}
                  />
                </td>
              </tr>

              {/* Insurance Expiry Date */}
              <tr className="border-b border-[#2A2A2A]">
                <td className="py-3 pr-4 font-semibold text-[#E5E7EB]">
                  Insurance Expiry Date:
                </td>
                <td className="py-3">
                  <input 
                    type="text"
                    className="w-full px-3 py-1 border border-[#3A3A3A] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => handleInputChange('insuranceExpiryDate', e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Submit Button */}
          <div className="mt-6 text-center">
            <button 
              onClick={handleSubmit}
              className="bg-[#2A2A2A] hover:bg-gray-300 text-[#F9FAFB] px-6 py-2 rounded border border-gray-400 font-medium"
            >
              Post New Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}