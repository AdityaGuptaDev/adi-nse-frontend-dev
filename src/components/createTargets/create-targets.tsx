"use client";

import React from 'react';
import { Download, Eye, Settings, Printer, FileDown, Send, MessageCircle, FileSpreadsheet } from 'lucide-react';

interface AssetDetailsProps {
  onBack: () => void;
  clientData: {
    name: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
    phoneRes: string;
    phoneOff: string;
    email: string;
    dob: string;
    pan: string;
  };
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ onBack, clientData }) => {
  return (
    <div className="bg-white text-sm min-h-screen">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-3xl font-bold">
            <span className="text-orange-500">Vedant</span>
            <span className="text-black">Asset</span>
          </div>
          <div className="text-xs text-gray-600 sm:text-right">
             <p className="font-semibold text-base mb-1">vedant asset</p>
              <p>3rd Floor, Gayways House, Above Space Furniture, P.P Compound,</p>
              <p>Main Road Ranchi 834001 Jharkhand</p>
              <p>Phone: 9304955509, Email: vedantasset@gmail.com</p>
              <p>Website: <a href="https://www.vedantasset.co.in" className="text-blue-600 hover:underline">www.vedantasset.co.in</a></p>
          </div>
        </div>
        
        {/* Compact Action Icons */}
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          {[
            { icon: <FileSpreadsheet size={18} className="text-green-600" />, label: "Excel" },
            { icon: <FileDown size={18} className="text-red-500" />, label: "PDF" },
            { icon: <Send size={18} className="text-blue-500" />, label: "Email" },
            { icon: <MessageCircle size={18} className="text-green-600" />, label: "WhatsApp" },
            { icon: <Printer size={18} className="text-gray-600" />, label: "Print" },
            
          ].map((item, index) => (
            <button 
              key={index} 
              className="flex flex-col items-center group hover:bg-gray-50 rounded p-1"
              onClick={() => alert(`${item.label} action`)}
            >
              <div className="p-1">
                {item.icon}
              </div>
              <span className="text-xs mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Title */}
      <div className="bg-gray-200 px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800 text-center">Your Investment Targets</h1>
      </div>

      {/* Compact Client Info - All fields included */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-3">
          {/* Left Column */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Name:</div>
              <div className="col-span-2 text-xs">
                <div className="font-semibold">{clientData.name}</div>
                <div className="text-gray-600 text-2xs">(Group Head: -)</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Gender:</div>
              <div className="col-span-2 text-xs">-</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Phone (Res):</div>
              <div className="col-span-2 text-xs">{clientData.phoneRes || '-'}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Phone (Off):</div>
              <div className="col-span-2 text-xs">{clientData.phoneOff || '-'}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Mobile:</div>
              <div className="col-span-2 text-xs">{clientData.mobile}</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Address:</div>
              <div className="col-span-2 text-xs">{clientData.address}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">City:</div>
              <div className="col-span-2 text-xs">{clientData.city}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">Pincode:</div>
              <div className="col-span-2 text-xs">{clientData.pincode}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">State:</div>
              <div className="col-span-2 text-xs">-</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-baseline">
              <div className="font-medium text-gray-700 text-xs">DOB:</div>
              <div className="col-span-2 text-xs">{clientData.dob}</div>
            </div>
          </div>
        </div>

        {/* Compact Targets Section */}
        <div className="border border-gray-300 rounded p-3 mb-3">
          <div className="text-center text-sm text-gray-600 py-2">
            No Targets Defined yet.
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex justify-center gap-3 mb-3">
          <button 
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-4 rounded transition-colors"
            onClick={onBack}
          >
            BACK TO CLIENT LIST
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-4 rounded transition-colors"
            onClick={() => alert('Create target clicked')}
          >
            CREATE ANOTHER TARGET
          </button>
        </div>

        {/* Additional Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-800 mb-2 text-center">Quick Actions</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            <button 
              className="flex items-center text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded"
              onClick={() => alert('Preview clicked')}
            >
              <Eye size={14} className="mr-1" />
              Preview
            </button>
            <button 
              className="flex items-center text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded"
              onClick={() => alert('Download clicked')}
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
            <button 
              className="flex items-center text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded"
              onClick={() => alert('Settings clicked')}
            >
              <Settings size={14} className="mr-1" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;