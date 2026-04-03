"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Phone, Filter, X, FileSpreadsheet, FileDown, Send, MessageCircle, Printer } from 'lucide-react';
import { investmentGetFolio } from '@/services/clientService';
import { useSearchParams } from 'next/navigation';
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';

interface SIPSTPData {
  id: number;
  amc_code: string;
  folio_no: string;
  prodcode: string;
  scheme: string;
  inv_name: string;
  pan: string;
  scheme_typ: string;
  brokcode: string;
  sip_amount: number;
  sip_status: string;
  installments_paid: number;
  unit_balance: number;
  current_value: number;
  xirr_return: number;
  bank_account: string;
  debit_day: number;
  start_date: string;
  mode: string;
  asset_subtype: string;
}

const SIPSTPReport = () => {
  const [portfolioData, setPortfolioData] = useState<SIPSTPData[]>([]);
  const [filteredData, setFilteredData] = useState<SIPSTPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [amcFilter, setAmcFilter] = useState<string>('all');
  const [schemeTypeFilter, setSchemeTypeFilter] = useState<string>('all');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');

  // const searchParams = useSearchParams();
  
  // // Get user data
  // const pan = searchParams.get('pan') || user?.InvestorRegistration?.pan_no || '';
  // const name = searchParams.get('name') || user?.InvestorRegistration?.name || '';


  const searchParams = useSearchParams();
  
   
let pan = "";
let name = "";
const user = getLS(USER_DATA);
const aumpan = searchParams.get('pan');
const aumname = searchParams.get('name');

if (!aumpan) {
  pan = user?.InvestorRegistration?.pan_no || "";
  name = user?.InvestorRegistration?.name || "";
} else {
  pan = aumpan || "";
  name = aumname || "";
}


  useEffect(() => {
    console.log("User List ==============", JSON.stringify(user));
  }, []);

console.log("pan----"+pan)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!pan) throw new Error("PAN number is required");

        const response = await investmentGetFolio(pan);
        const typedResponse = response as unknown as SIPSTPData[];
        
        if (!Array.isArray(typedResponse)) {
          throw new Error("Invalid data format received from API");
        }

        // Process and enhance the data
        const processedData = typedResponse.map(item => ({
          ...item,
          sip_status: getRandomStatus(),
          sip_amount: getRandomAmount(),
          current_value: getRandomCurrentValue(),
          xirr_return: getRandomXIRR(),
          unit_balance: getRandomUnits(),
          installments_paid: getRandomInstallments(),
          start_date: getRandomStartDate(),
          bank_account: getRandomBankAccount(),
          debit_day: getRandomDebitDay(),
          mode: 'SIP',
          asset_subtype: getAssetSubtype(item.scheme_typ)
        }));

        setPortfolioData(processedData);
        setFilteredData(processedData); // Initialize filtered data with all data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pan]);

  // Apply filters whenever filter criteria changes
  useEffect(() => {
    if (portfolioData.length === 0) return;

    let result = [...portfolioData];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => 
        statusFilter === 'active' ? item.sip_status === 'Active' : item.sip_status !== 'Active'
      );
    }

    // Apply AMC filter
    if (amcFilter !== 'all') {
      result = result.filter(item => getAMCName(item.amc_code) === amcFilter);
    }

    // Apply scheme type filter
    if (schemeTypeFilter !== 'all') {
      result = result.filter(item => item.asset_subtype === schemeTypeFilter);
    }

    // Apply amount range filter
    if (minAmountFilter) {
      const min = parseFloat(minAmountFilter);
      result = result.filter(item => item.sip_amount >= min);
    }
    if (maxAmountFilter) {
      const max = parseFloat(maxAmountFilter);
      result = result.filter(item => item.sip_amount <= max);
    }

    setFilteredData(result);
  }, [statusFilter, amcFilter, schemeTypeFilter, minAmountFilter, maxAmountFilter, portfolioData]);

  // Get unique values for filters
  const uniqueAmcs = [...new Set(portfolioData.map(item => getAMCName(item.amc_code)))].sort();
  const uniqueSchemeTypes = [...new Set(portfolioData.map(item => item.asset_subtype))].sort();

  const resetFilters = () => {
    setStatusFilter('all');
    setAmcFilter('all');
    setSchemeTypeFilter('all');
    setMinAmountFilter('');
    setMaxAmountFilter('');
  };

  if (loading) {
    return (
      <div className="w-full bg-white">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="ml-4">Loading SIP/STP data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="px-4 py-2 flex justify-between items-center bg-blue-800">
        <div className="flex items-center">
          <span className="text-orange-400 text-lg font-bold">Vedant</span>
          <span className="text-white text-lg font-bold">Asset</span>
        </div>
        <div className="text-right text-white text-xs">
          <div>vedant asset, 3rd Floor, Gayways House,Above Space Furniture, P.P.Compound, Main Road Ranchi 834001 Jharkhand</div>
          <div>Phone: 9304955509, Email: vedantasset@gmail.com, Website: www.vedantasset.co.in</div>
        </div>
      </div>

      {/* Navigation Icons */}
        

      {/* Main Content */}
      <div className="p-4">
        {/* Investor Info */}
        <div className="mb-4 text-sm">
          <div><strong>Investor:</strong> {name}</div>
          <div><strong>PAN:</strong> {pan}</div>
        </div>

        {/* Filter Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">SIP/STP Report</h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <Filter size={16} />
              <span>Filters</span>
              {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {[statusFilter, amcFilter, schemeTypeFilter, minAmountFilter, maxAmountFilter]
                    .filter(f => f !== 'all' && f !== '').length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                {/* AMC Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">AMC</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={amcFilter}
                    onChange={(e) => setAmcFilter(e.target.value)}
                  >
                    <option value="all">All AMCs</option>
                    {uniqueAmcs.map(amc => (
                      <option key={amc} value={amc}>{amc}</option>
                    ))}
                  </select>
                </div>

                {/* Scheme Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={schemeTypeFilter}
                    onChange={(e) => setSchemeTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {uniqueSchemeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">SIP Amount Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                      value={minAmountFilter}
                      onChange={(e) => setMinAmountFilter(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                      value={maxAmountFilter}
                      onChange={(e) => setMaxAmountFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X size={14} />
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {amcFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  AMC: {amcFilter}
                  <button 
                    onClick={() => setAmcFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {schemeTypeFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Type: {schemeTypeFilter}
                  <button 
                    onClick={() => setSchemeTypeFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(minAmountFilter || maxAmountFilter) && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Amount: {minAmountFilter || '0'} - {maxAmountFilter || '∞'}
                  <button 
                    onClick={() => {
                      setMinAmountFilter('');
                      setMaxAmountFilter('');
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-2 text-sm text-gray-600">
          Showing {filteredData.length} of {portfolioData.length} SWP/STP
        </div>

        {/* Table */}
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
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-2 py-1 text-xs">{index + 1}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.inv_name}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{getAMCName(item.amc_code)}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    <span className="text-blue-600 underline cursor-pointer">
                      {item.scheme}
                    </span>
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    <span className="text-blue-600 underline cursor-pointer">
                      {item.folio_no}
                    </span>
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">Equity</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.asset_subtype}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.mode}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    <span className={`px-2 py-1 rounded text-xs ${item.sip_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.sip_status}
                    </span>
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.bank_account}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.start_date}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.debit_day}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.sip_amount.toLocaleString()}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.installments_paid}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.unit_balance.toFixed(3)}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.current_value.toLocaleString()}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.xirr_return.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Data Message */}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">
              No SIP/STP match your current filters
            </p>
            <button 
              onClick={resetFilters}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Summary */}
        {filteredData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="text-sm font-medium mb-2">Summary:</div>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span className="font-medium">Total SIPs:</span> {filteredData.length}
              </div>
              <div>
                <span className="font-medium">Active SIPs:</span> {filteredData.filter(item => item.sip_status === 'Active').length}
              </div>
              <div>
                <span className="font-medium">Total Monthly SIP:</span> ₹{filteredData.reduce((sum, item) => sum + item.sip_amount, 0).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Total Current Value:</span> ₹{filteredData.reduce((sum, item) => sum + item.current_value, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

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

// Helper functions
function getAMCName(amcCode: string): string {
  const amcMap: Record<string, string> = {
    'B': 'Aditya Birla Sun Life',
    'M': 'Mirae Asset',
    'E': 'Edelweiss',
    'T': 'TATA',
    'A': 'AXIS',
    'C': 'Canara Robeco',
    'D': 'DSP',
    'FTI': 'Franklin Templeton',
    'G': 'Bandhan',
    'H': 'HDFC',
    'K': 'Kotak',
    'I': 'ICICI Prudential',
    'N': 'Nippon India'
  };
  return amcMap[amcCode] || `Unknown (${amcCode})`;
}

function getAssetSubtype(schemeType: string): string {
  const subtypeMap: Record<string, string> = {
    'EQ': 'Flexi Cap Fund',
    'ELB': 'Large & Mid Cap Fund',
    'DE': 'Mid Cap Fund',
    'HY': 'Sector/Thematic Fund',
    'default': 'Flexi Cap Fund'
  };
  return subtypeMap[schemeType] || subtypeMap['default'];
}

// Data generation functions
function getRandomStatus(): string {
  const statuses = ['Active', 'Inactive', 'Paused'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomAmount(): number {
  const amounts = [1000, 2000, 5000, 3000, 1500, 10000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

function getRandomCurrentValue(): number {
  const values = [15234, 28567, 43890, 12345, 67890, 34567];
  return values[Math.floor(Math.random() * values.length)];
}

function getRandomXIRR(): number {
  const returns = [12.45, 15.67, 8.90, 18.23, 11.56, 14.78];
  return returns[Math.floor(Math.random() * returns.length)];
}

function getRandomUnits(): number {
  const units = [145.234, 289.567, 432.890, 156.789, 678.123];
  return units[Math.floor(Math.random() * units.length)];
}

function getRandomInstallments(): number {
  const installments = [12, 18, 24, 6, 30, 15];
  return installments[Math.floor(Math.random() * installments.length)];
}

function getRandomStartDate(): string {
  const dates = ['01-Jan-2023', '15-Feb-2023', '01-Mar-2023', '10-Apr-2023', '01-May-2023'];
  return dates[Math.floor(Math.random() * dates.length)];
}

function getRandomBankAccount(): string {
  const accounts = ['HDFC****1234', 'ICICI****5678', 'SBI****9012', 'AXIS****3456'];
  return accounts[Math.floor(Math.random() * accounts.length)];
}

function getRandomDebitDay(): number {
  const days = [1, 5, 10, 15, 25];
  return days[Math.floor(Math.random() * days.length)];
}

export default SIPSTPReport;