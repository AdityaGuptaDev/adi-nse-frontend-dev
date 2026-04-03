import React, { useState } from 'react';
import { FileText, Phone, Mail, Globe, Printer } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VedantAssetInterface = () => {
  const [selectedTransactions, setSelectedTransactions] = useState(['All']);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [tillDate, setTillDate] = useState<Date | null>(null);


  const transactionTypes = [
    'All',
    'Purchases',
    'Bonus',
    'Certificate Issued Rejection',
    'Consolidation IN',
    'Dividend Sweep In',
    'Dividend Transfer Plan In',
    'DMAT In',
    'Gift In',
    'Merger-In'
  ];

  const toggleTransaction = (type: string) => {
    if (type === 'All') {
      setSelectedTransactions(['All']);
    } else {
      let newSelection = selectedTransactions.filter(t => t !== 'All');
      if (newSelection.includes(type)) {
        newSelection = newSelection.filter(t => t !== type);
      } else {
        newSelection.push(type);
      }
      if (newSelection.length === 0) {
        newSelection = ['All'];
      }
      setSelectedTransactions(newSelection);
    }
  };

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
      <div className="flex">
        {/* Left Panel - Filters */}
        <div className="w-2/3 p-4">
          <table className="w-full">
            <tbody>
              {/* ARN No */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium w-32">ARN No:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All ARNs -</option>
                  </select>
                </td>
              </tr>

              {/* Distributor */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">Distributor:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All Distributors including HO</option>
                  </select>
                </td>
              </tr>

              {/* Asset Type */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">Asset Type:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All Asset Types-</option>
                  </select>
                </td>
              </tr>

              {/* Investor */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">Investor:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>LAKSHMI SINHA</option>
                  </select>
                </td>
              </tr>

              {/* Registrar */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">Registrar</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All -</option>
                  </select>
                </td>
              </tr>

              {/* Sub-Asset Type */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">Sub-Asset Type:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All Sub-Asset Types-</option>
                  </select>
                </td>
              </tr>

              {/* AMC/Stock Ex */}
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 text-sm font-medium">AMC/Stock Ex:</td>
                <td className="py-2">
                  <select className="w-full p-1 border border-gray-300 text-sm bg-white">
                    <option>- All AMCs -</option>
                  </select>
                </td>
              </tr>

              {/* Report Duration */}
              <tr>
                <td className="py-2 pr-4 text-sm font-medium">Report Duration:</td>
                <td className="py-2">
                  <div className="space-y-2">
                    {/* From Date */}
                     <div className="flex items-center space-x-2">
        <span className="text-sm font-medium w-12">From:</span>
        <DatePicker
          selected={fromDate}
          onChange={(date: Date | null) => setFromDate(date)}
          dateFormat="dd/MM/yyyy"
          className="p-1 border border-gray-300 rounded bg-white text-sm"
          placeholderText="Select start date"
        />
      </div>

      {/* Till Date */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium w-12">Till:</span>
        <DatePicker
          selected={tillDate}
          onChange={(date: Date | null) => setTillDate(date)}
          dateFormat="dd/MM/yyyy"
          className="p-1 border border-gray-300 rounded bg-white text-sm"
          placeholderText="Select end date"
        />
      </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Panel - Transaction Types */}
        <div className="w-1/3 p-4 border-l border-gray-300">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Transaction Types:</label>
            <div className="border border-gray-300 bg-white min-h-48 max-h-48 overflow-y-auto">
              {transactionTypes.map((type, index) => (
                <div 
                  key={type}
                  className={`px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 ${
                    selectedTransactions.includes(type) ? 'bg-blue-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleTransaction(type)}
                >
                  {type}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">* Press &lt;ctrl&gt; key for multiple selection</div>
          </div>

          {/* Search Button */}
          <button className="bg-blue-600 text-white px-6 py-2 text-sm hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="p-4 text-xs text-black">
        <div className="font-bold mb-2">Disclaimer:</div>
        <div className="mb-2">
          The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
        </div>
        <div className="mb-2">
          Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not guaranteeing or assuring any dividend under any of the schemes and the same is subject to the availability and adequacy of distributable surplus. Investors are requested to review the prospectus carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission disclosures, SID/SAI/KIM, Code of Conduct and privacy at : http://vedantasset.co.in
        </div>
      </div>
    </div>
  );
};

export default VedantAssetInterface;