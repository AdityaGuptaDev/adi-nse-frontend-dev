import React, { useState } from 'react';
import { Bell, MessageCircle } from 'lucide-react';

const SIPAlertForm = () => {
  const [selectedScheme, setSelectedScheme] = useState('');

  const schemes = [
    '- Select Scheme -',
    'Axis Midcap Fund - Reg - Gr',
    'Bandhan Infra Fund -Reg -Gr',
    'Canara Robeco Small Cap Fund - Reg - Gr',
    'Edelweiss Large & Midcap Fund - Reg - Gr',
    'Franklin India Smaller Companies Fund- Reg - Gr',
    'ICICI Prudential Midcap Fund - Reg - Gr',
    'Kotak Midcap Fund - Reg - Gr',
    'Mirae Asset Large Cap Fund - Reg - Gr',
    'Tata Digital India Fund Reg Gr'
  ];

  return (
    <div className="min-h-screen bg-[#1F1A1A]">
      {/* Header */}
      {/* <div className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400"></div>
            <span className="text-sm text-[#9CA3AF]">Manual - Set SIP Alerts - Google Chrome</span>
          </div>
        </div> */}
        {/* <div className="flex items-center space-x-2">
          <button className="w-6 h-6 bg-[#2A2A2A] flex items-center justify-center text-xs">−</button>
          <button className="w-6 h-6 bg-[#2A2A2A] flex items-center justify-center text-xs">□</button>
          <button className="w-6 h-6 bg-red-500 text-white flex items-center justify-center text-xs">×</button>
        </div>
      </div> */}

      {/* URL Bar */}
      {/* <div className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-gray-300"></div>
            <div className="w-4 h-4 bg-gray-300"></div>
          </div>
          <div className="flex-1 bg-[#1F1A1A] px-3 py-1 rounded text-sm text-[#9CA3AF]">
            https://vedantasset.co.in/FinnSys/alerts/set/alerts.sip.asp?investor_id=981
          </div>
        </div>
      </div> */}

      {/* Top Action Buttons */}
      <div className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-2 flex justify-end space-x-2">
        <button className="bg-blue-600 text-white px-4 py-1 text-sm flex items-center space-x-1 rounded">
          <Bell className="w-4 h-4" />
          <span>Manage Tickets</span>
        </button>
        <button className="bg-green-500 text-white px-4 py-1 text-sm flex items-center space-x-1 rounded">
          <MessageCircle className="w-4 h-4" />
          <span>Send us Whatsapp</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#2A2A2A] px-4 py-6">
        {/* Title */}
        <div className="bg-gray-300 px-4 py-2 mb-4">
          <h1 className="text-lg font-semibold text-[#F9FAFB]">
            Set SIP/STP Maturity Alert for LAKSHMI SINHA
          </h1>
        </div>

        {/* Form */}
        <div className="bg-[#111111] rounded shadow">
          <div className="flex">
            {/* Left Column */}
            <div className="bg-gray-300 px-4 py-3 w-48">
              <label className="text-sm font-medium text-[#F9FAFB]">
                Select MF Scheme
              </label>
            </div>
            
            {/* Right Column */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <select 
                  className="w-96 px-3 py-2 border border-[#3A3A3A] rounded bg-[#111111] text-sm"
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                >
                  {schemes.map((scheme, index) => (
                    <option 
                      key={index} 
                      value={scheme}
                      className={scheme === 'Mirae Asset Large Cap Fund - Reg - Gr' ? 'bg-blue-600 text-white' : ''}
                    >
                      {scheme}
                    </option>
                  ))}
                </select>
                
                <button className="ml-4 bg-blue-100 text-blue-600 px-3 py-1 text-sm border border-blue-300 rounded hover:bg-blue-200">
                  [ Capital Summary ]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPAlertForm;