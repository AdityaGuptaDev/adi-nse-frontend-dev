import React, { useState } from 'react';
import { ChevronDown, Filter, Search, Download, Plus, TrendingUp, DollarSign, PieChart, BarChart3, ArrowLeft } from 'lucide-react';
import router from 'next/router';



interface FinancialProductsProps {
  onBack?: () => void;
  clientName?: string;
}

export default function FinancialProductsInterface({ onBack }: FinancialProductsProps) {
  const [recordsPerPage, setRecordsPerPage] = useState('10');
  const [currentSort, setCurrentSort] = useState('Date Added');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const sortOptions = [
    'Date Added',
    'Investors',
    'Distributors',
    'Asset Type',
    'Scheme Type'
  ];

  const tableHeaders = [
    'Date Added',
    'Asset/Scheme Type',
    'Investor',
    'Distributor',
    'Folio',
    'Product/Scheme',
    'Purchase/Maturity',
    'Tenure',
    'Units',
    'Current Value',
    'Int. P.A.',
    'Int. Payable',
    'Comp./Freq.',
    'Created By',
    'Actions'
  ];

  const stats = [
    { label: 'Products', value: '0', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Value', value: '₹0', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Investors', value: '0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Distributors', value: '0', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'mutual-funds', label: 'Mutual Funds' },
    { id: 'fixed-deposits', label: 'Fixed Deposits' },
    { id: 'nps', label: 'NPS' },
    { id: 'precious-metals', label: 'Precious Metals' }
  ];

  // Handler functions
  const handleAddProduct = () => {
    alert('Add Product button clicked!');
    // Here you would typically open a modal or navigate to a form
  };

  const handleExport = () => {
    alert('Export button clicked!');
    // Here you would typically trigger a download or export process
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchTerm}`);
    // Here you would typically filter your data based on search term
  };

  const handleSortChange = (option: string) => {
    setCurrentSort(option);
    alert(`Sorted by: ${option}`);
    // Here you would typically sort your data
  };

  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(value);
    alert(`Showing ${value} records per page`);
    // Here you would typically paginate your data
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    alert(`Showing ${tabId} products`);
    // Here you would typically filter your data by type
  };

  const handlePreviousPage = () => {
    alert('Previous page');
    // Here you would typically go to previous page
  };

  const handleNextPage = () => {
    alert('Next page');
    // Here you would typically go to next page
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      {/* Compact Header */}
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBack}
              className="flex items-center bg-indigo-300 text-white hover:bg-indigo-400 transition-colors px-4 py-2 rounded"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">Financial Portfolio</h1>
              <p className="text-xs text-gray-500">Investment management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Plus size={12} />
              <span>Add Product</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <Download size={12} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-6 h-6 ${stat.bg} rounded-md flex items-center justify-center`}>
                <stat.icon className={`w-3 h-3 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 p-1 mb-3">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap mr-1 transition-colors ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Controls */}
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">

            <form onSubmit={handleSearch} className="relative">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-gray-50 border-0 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
              />
            </form>

            <div className="flex items-center space-x-1 bg-gray-50 rounded-md px-2 py-1">
              <label className="text-xs text-gray-600">Show:</label>
              <select
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(e.target.value)}
                className="bg-transparent border-0 text-xs focus:outline-none"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">Sort:</span>
            <div className="flex items-center space-x-1">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSortChange(option)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${currentSort === option
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {tableHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={tableHeaders.length} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">No Products Added</h3>
                      <p className="text-xs text-gray-500 mb-3">Start by adding your first financial product</p>
                      <button
                        onClick={handleAddProduct}
                        className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all mx-auto"
                      >
                        <Plus size={12} />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compact Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Showing 0 to 0 of 0 entries</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePreviousPage}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <div className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded text-xs">
              1
            </div>
            <button
              onClick={handleNextPage}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}