import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Calendar, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import api from '@/utils/api';

// Define TypeScript interfaces
interface BrokerageTransaction {
  txn_date: string;
  folio_no: string;
  scheme_name: string;
  sub_category: string;
  process_date: string;
  txn_id: string;
  txn_amount: string;
  txn_type: string;
  eligible_amount: string;
  brokerage_type: string;
  txn_desc: string;
  brokerage_rate: string;
  brokerage_amount: string;
  from_date: string;
  to_date: string;
  days: string;
  arn_no: string;
  sub_broker_arn: string | null;
  sub_broker_code: string;
  sub_broker_name: string;
  euin: string;
  client_name: string;
  equity_code1: string;
  pan: string;
  rm: string;
  city_category: string;
  service_rm: string;
  family_head: string;
}

interface ApiResponse {
  data: {
    data: BrokerageTransaction[];
  };
  msg: string;
}

interface Filters {
  in_group: string;
  in_category: string;
  in_fund: string;
  in_brokerage_type: string;
  in_from_date: string;
  in_to_date: string;
}

interface Summary {
  totalTransactions: number;
  totalAmount: number;
  totalBrokerage: number;
}

interface DropdownOptions {
  groups: string[];
  categories: string[];
  funds: string[];
  brokerageTypes: string[];
}

export default function BrokerageReport() {
  const [filters, setFilters] = useState<Filters>({
    in_group: '',
    in_category: '',
    in_fund: '',
    in_brokerage_type: '',
    in_from_date: '',
    in_to_date: ''
  });

  const [reportData, setReportData] = useState<BrokerageTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<Summary>({
    totalTransactions: 0,
    totalAmount: 0,
    totalBrokerage: 0
  });

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    groups: [],
    categories: [],
    funds: [],
    brokerageTypes: []
  });

  // New state for filters visibility
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setDropdownOptions({
          groups: ['Equity', 'Debt', 'Hybrid', 'Solution Oriented'],
          categories: ['Large Cap', 'Mid Cap', 'Small Cap', 'Multi Cap', 'Flexi Cap'],
          funds: [
            'NIPPON INDIA SMALL CAP FUND - GROWTH PLAN - GROWTH OPTION',
            'HDFC Small Cap Fund',
            'Axis Small Cap Fund'
          ],
          brokerageTypes: ['Annualized', 'Trail', 'Upfront']
        });
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, []);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const response = await api.post(
        'http://localhost:9075/partner/getBrokerageReport',
        filters
      );

      const result: ApiResponse = response.data;

      if (result?.data && Array.isArray(result.data.data)) {
        setReportData(result.data.data);
        calculateSummary(result.data.data);
        // Hide filters after successful search
        setShowFilters(false);
      } else {
        console.error('Invalid response format:', result);
        setReportData([]);
        setSummary({ totalTransactions: 0, totalAmount: 0, totalBrokerage: 0 });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData([]);
      setSummary({ totalTransactions: 0, totalAmount: 0, totalBrokerage: 0 });
      alert('Failed to fetch report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: BrokerageTransaction[]) => {
    const summaryData = data.reduce((acc, item) => {
      const amount = parseFloat(item.txn_amount) || 0;
      const brokerage = parseFloat(item.brokerage_amount) || 0;
      
      return {
        totalTransactions: acc.totalTransactions + 1,
        totalAmount: acc.totalAmount + amount,
        totalBrokerage: acc.totalBrokerage + brokerage
      };
    }, { totalTransactions: 0, totalAmount: 0, totalBrokerage: 0 });
    
    setSummary(summaryData);
  };

  const handleReset = () => {
    setFilters({
      in_group: '',
      in_category: '',
      in_fund: '',
      in_brokerage_type: '',
      in_from_date: '',
      in_to_date: ''
    });
    setReportData([]);
    setSummary({ totalTransactions: 0, totalAmount: 0, totalBrokerage: 0 });
    setCurrentPage(1);
    // Show filters when resetting
    setShowFilters(true);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const headers = ['Transaction Date', 'Folio No', 'Scheme Name', 'Transaction Amount', 'Brokerage Amount', 'Client Name', 'PAN'];
      const csvData = reportData.map(row => [
        row.txn_date || '',
        row.folio_no || '',
        `"${(row.scheme_name || '').replace(/"/g, '""')}"`,
        row.txn_amount || '0',
        row.brokerage_amount || '0',
        row.client_name || '',
        row.pan || ''
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `brokerage_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
        
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         
            {/* Filters Toggle Button - Always visible when there's data */}
            {reportData.length > 0 && (
              <button
                onClick={toggleFilters}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#F9FAFB] rounded-md hover:bg-[#0A0A0A] transition font-medium border border-[#2A2A2A] shadow-sm w-fit"
              >
                {showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-[#9CA3AF]" />
              <h2 className="text-lg font-semibold text-[#F9FAFB]">Report Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Date Range */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">From Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.in_from_date}
                      onChange={(e) => handleFilterChange('in_from_date', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">To Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.in_to_date}
                      onChange={(e) => handleFilterChange('in_to_date', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Group & Category */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Group By</label>
                  <select
                    value={filters.in_group}
                    onChange={(e) => handleFilterChange('in_group', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition bg-[#111111]"
                  >
                    <option value="">Select Group</option>
                    {dropdownOptions.groups.map((group, index) => (
                      <option key={index} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Category</label>
                  <select
                    value={filters.in_category}
                    onChange={(e) => handleFilterChange('in_category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition bg-[#111111]"
                  >
                    <option value="">All Categories</option>
                    {dropdownOptions.categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fund & Brokerage Type */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Fund</label>
                  <select
                    value={filters.in_fund}
                    onChange={(e) => handleFilterChange('in_fund', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition bg-[#111111]"
                  >
                    <option value="">All Funds</option>
                    {dropdownOptions.funds.map((fund, index) => (
                      <option key={index} value={fund}>{fund}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Brokerage Type</label>
                  <select
                    value={filters.in_brokerage_type}
                    onChange={(e) => handleFilterChange('in_brokerage_type', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B] outline-none transition bg-[#111111]"
                  >
                    <option value="">All Types</option>
                    {dropdownOptions.brokerageTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
              

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="clawback"
                    className="w-4 h-4 text-[#F59E0B] border-[#2A2A2A] rounded focus:ring-[#F59E0B]"
                  />
                  <label htmlFor="clawback" className="text-sm text-[#F9FAFB]">
                    Claw back Only
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="payout"
                    className="w-4 h-4 text-[#F59E0B] border-[#2A2A2A] rounded focus:ring-[#F59E0B]"
                  />
                  <label htmlFor="payout" className="text-sm text-[#F9FAFB]">
                    Include Payout columns
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#2A2A2A]">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F59E0B] text-[#F9FAFB] rounded-md hover:bg-[#B45309] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Searching...' : 'Build a report'}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-[#111111] text-[#F9FAFB] rounded-md hover:bg-[#1A1A1A] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-[#2A2A2A]"
              >
                Reset Filters
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleExport}
                disabled={reportData.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-[#F9FAFB] rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            {/* Helper Text */}
            <div className="mt-4 p-3 bg-[#1F1A1A] rounded-md border border-blue-200">
              <p className="text-sm text-[#F59E0B]">
                Use the form above to generate a report
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-[#F9FAFB]">{summary.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-[#1F1A1A] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#F59E0B]" />
                </div>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-[#F9FAFB]">{formatCurrency(summary.totalAmount)}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">₹</span>
                </div>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Brokerage</p>
                  <p className="text-2xl font-bold text-[#F9FAFB]">{formatCurrency(summary.totalBrokerage)}</p>
                </div>
                <div className="w-10 h-10 bg-[#2A1F0A] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-[#F59E0B]">₹</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#F9FAFB]">Transaction Details</h2>
                <p className="text-[#9CA3AF] text-sm">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, reportData.length)} of {reportData.length.toLocaleString()} transactions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-[#F9FAFB] rounded-md hover:bg-green-700 transition font-medium text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Folio No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Scheme</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Brokerage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">PAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {currentItems.map((transaction, index) => (
                    <tr key={index} className="hover:bg-[#0A0A0A] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F9FAFB] font-medium">
                        {formatDate(transaction.txn_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F9FAFB] font-mono">
                        {transaction.folio_no || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#F9FAFB] max-w-[200px] truncate" title={transaction.scheme_name}>
                        {transaction.scheme_name || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F9FAFB] max-w-[150px] truncate" title={transaction.client_name}>
                        {transaction.client_name || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F9FAFB] text-right font-medium">
                        {formatCurrency(transaction.txn_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                        {formatCurrency(transaction.brokerage_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F9FAFB] font-mono">
                        {transaction.pan || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-between">
                <div className="text-sm text-[#F9FAFB]">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-[#2A2A2A] bg-[#111111] hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`min-w-[2rem] px-2 py-1 text-sm rounded-md border transition ${
                          currentPage === pageNumber
                            ? 'bg-[#F59E0B] text-[#F9FAFB] border-[#F59E0B]'
                            : 'bg-[#111111] text-[#F9FAFB] border-[#2A2A2A] hover:bg-[#0A0A0A]'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-[#2A2A2A] bg-[#111111] hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {reportData.length === 0 && !loading && !showFilters && (
          <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-8 text-center">
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <h3 className="text-base font-semibold text-[#F9FAFB] mb-1">No Data Found</h3>
            <p className="text-[#9CA3AF] text-sm">Select filters and click "Build a report" to view transactions</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-[#111111] rounded-lg shadow border border-[#2A2A2A] p-8 text-center">
            <div className="w-12 h-12 bg-[#1F1A1A] rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F59E0B]"></div>
            </div>
            <h3 className="text-base font-semibold text-[#F9FAFB] mb-1">Loading Report Data</h3>
            <p className="text-[#9CA3AF] text-sm">Please wait while we fetch your brokerage information...</p>
          </div>
        )}
      </div>
    </div>
  );
}