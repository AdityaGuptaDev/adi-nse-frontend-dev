import React, { useState } from 'react';
import { FileText, Phone, Mail, Globe, Printer } from 'lucide-react';

const VedantAssetInterface = () => {
  const [reportType, setReportType] = useState('SIP and STP');
  const [showInactive, setShowInactive] = useState(false);

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: '#3166AE' }}>
        <div className="flex items-center">
          <span className="text-orange-400 text-lg font-bold">Vedant</span>
          <span className="text-black text-lg font-bold">Asset</span>
        </div>
        <div className="text-right text-white text-xs">
          <div>vedant asset, 3rd Floor, Gayways House,Above Space Furniture, P.P.Compound, Main Road Ranchi 834001 Jharkhand</div>
          <div>Phone: 9304955509, Email: vedantasset@gmail.com, Website: www.vedantasset.co.in</div>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="bg-gray-100 px-4 py-1 flex justify-end space-x-2">
        <FileText className="w-5 h-5 text-red-600 cursor-pointer" />
        <div className="w-5 h-5 bg-teal-500 rounded cursor-pointer"></div>
        <Phone className="w-5 h-5 text-green-600 cursor-pointer" />
        <div className="w-5 h-5 bg-gray-400 rounded cursor-pointer"></div>
        <Printer className="w-5 h-5 text-gray-600 cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Investor Info */}
        <div className="mb-4 text-sm">
          <div><strong>Investor:</strong> LAKSHMI SINHA</div>
          <div><strong>Address:</strong> BEHIND GUMLA PETROL PUMP EKTA NAGAR BOOTI MORE BUTI , Ranchi</div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-sm font-medium">Report Type:</span>
          <select 
            className="p-1 border border-gray-400 text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option>SIP and STP</option>
            <option>Investment Ledger - Date wise</option>
            <option>Portfolio Summary</option>
            <option>Capital Gains Report</option>
          </select>
          <label className="flex items-center ml-4">
            <input 
              type="checkbox" 
              className="mr-1"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <span className="text-sm">Show Inactive SIP/STP too (with balance units)</span>
          </label>
        </div>

        {/* Table Headers */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Sno</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Investor</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">AMC</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Scheme</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Folio</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Asset Type</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Asset Sub-type</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Mode</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Status</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Bank A/C</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Start Date</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Debit Day</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Installment Amt (Rs)</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Installments Paid</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Unit Balance</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Current Value (Rs)</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Return% (XIRR pa)</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* No Data Message */}
        <div className="text-center py-8">
          <p className="text-red-500 font-medium">There are no Active SIP/STP to show</p>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-8 text-xs text-black">
          <div className="font-bold mb-2">Disclaimer:</div>
          <div className="mb-2">
            The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
          </div>
          <div className="mb-2">
            Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not guaranteeing or assuring any dividend under any of the schemes and the same is subject to the availability and adequacy of distributable surplus. Investors are requested to review the prospectus carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission disclosures, SID/SAI/KIM, Code of Conduct and privacy at : http://vedantasset.co.in
          </div>
        </div>
      </div>
    </div>
  );
};

export default VedantAssetInterface;