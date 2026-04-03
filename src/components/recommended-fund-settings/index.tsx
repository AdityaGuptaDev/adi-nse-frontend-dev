"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, X, Check, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SchemeConfigurationService, { VedantFunctionFund, SavedVedantFund } from "@/services/schemeConfiguration";

const Button = ({ children, className = "", ...props }: any) => (
  <button {...props} className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 ${className}`}>
    {children}
  </button>
);

const Input = (props: any) => <input {...props} className="border rounded px-3 py-2 w-full" />;

// Only orange category for Vedant Recommended Funds
const VEDANT_CATEGORIES = [
  { id: 1, name: 'High Return', description: 'Funds with highest historical returns', color: 'orange' }
];

export default function VedantRecommendedFundsPage() {
  const router = useRouter();
  const [availableFunds, setAvailableFunds] = useState<VedantFunctionFund[]>([]);
  const [savedFunds, setSavedFunds] = useState<SavedVedantFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('');
  const [selectedFunds, setSelectedFunds] = useState<VedantFunctionFund[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching data...");
      
      await Promise.all([fetchAvailableFunds(), fetchSavedFunds()]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load funds data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFunds = async () => {
    try {
      const funds = await SchemeConfigurationService.getAvailableVedantFunds();
      console.log("Available funds:", funds);
      setAvailableFunds(funds || []);
    } catch (err) {
      console.error("fetchAvailableFunds:", err);
      setAvailableFunds([]);
    }
  };

  const fetchSavedFunds = async () => {
    try {
      const funds = await SchemeConfigurationService.getAllVedantRecommendedFunds();
      console.log("Saved funds:", funds);
      setSavedFunds(funds || []);
    } catch (err) {
      console.error("fetchSavedFunds:", err);
      setSavedFunds([]);
    }
  };

  // Get funds for orange category - Improved logic
  const getCategoryFunds = () => {
    if (!savedFunds || savedFunds.length === 0) {
      console.log("No saved funds available");
      return [];
    }

    // Try to get funds with category_id = 1
    let categoryFunds = savedFunds.filter(fund => {
      console.log("Fund category_id:", fund.category_id, "Fund:", fund);
      return fund.category_id === 1;
    });
    
    console.log("Funds with category_id = 1:", categoryFunds);
    
    // If no funds found with category_id, check if we have any funds at all
    if (categoryFunds.length === 0 && savedFunds.length > 0) {
      console.log("No funds with category_id found, showing all funds:", savedFunds);
      categoryFunds = savedFunds;
    }
    
    return categoryFunds;
  };

  const getColorButtonClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'orange': return 'bg-[#f5862e] hover:bg-[#e07828]';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getModalHeaderClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'orange': return 'bg-gradient-to-r from-[#f5862e] to-[#e07828]';
      default: return 'bg-gradient-to-r from-blue-600 to-blue-700';
    }
  };

  const openModal = (category: any) => {
    setSelectedCategory(category.name);
    setSelectedCategoryId(category.id);
    setModalSearchTerm('');
    setSelectedRiskLevel('');
    setSelectedFunds([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory('');
    setSelectedCategoryId(null);
    setSelectedFunds([]);
  };

  const toggleFundSelection = (fund: VedantFunctionFund) => {
    setSelectedFunds(prev => {
      const isAlreadySelected = prev.some(selectedFund => 
        selectedFund.isin === fund.isin
      );
      
      if (isAlreadySelected) {
        return prev.filter(selectedFund => selectedFund.isin !== fund.isin);
      } else {
        return [...prev, fund];
      }
    });
  };

  const addSelectedFunds = async () => {
    if (selectedFunds.length === 0 || !selectedCategoryId) {
      alert("Please select at least one fund");
      return;
    }

    try {
      console.log("Attempting to save funds:", selectedFunds);
      console.log("Selected category ID:", selectedCategoryId);
      
      // Include category_id when saving funds
      const fundsToSave = selectedFunds.map(fund => ({
        ...fund,
        category_id: selectedCategoryId
      }));

      console.log("Funds prepared for saving:", fundsToSave);

      // Save funds using the service
      await SchemeConfigurationService.saveVedantRecommendedFund(fundsToSave);
      
      alert(`${selectedFunds.length} fund(s) added successfully to ${selectedCategory}`);
      closeModal();
      // Refresh the list immediately
      await fetchSavedFunds();
    } catch (err: any) {
      console.error("Detailed error in addSelectedFunds:", err);
      alert(`Failed to save funds: ${err.message}. Please check the console for details.`);
    }
  };

  const deleteFund = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this fund?")) return;
    
    try {
      await SchemeConfigurationService.deleteVedantRecommendedFund(id);
      // Refresh the funds list after deletion
      await fetchSavedFunds();
      alert("Fund deleted successfully");
    } catch (err: any) {
      console.error("deleteFund:", err);
      alert(`Failed to delete fund: ${err.message}`);
    }
  };

  const uniqueRiskLevels = [...new Set(availableFunds.map(fund => fund.risk_level).filter(Boolean))].sort();

  // Filter logic to check if fund already exists in the same category
  const filteredModalFunds = availableFunds.filter(fund => {
    const matchesSearch = fund.scheme_name?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                         fund.isin?.toLowerCase().includes(modalSearchTerm.toLowerCase());
    
    const matchesRisk = selectedRiskLevel ? fund.risk_level === selectedRiskLevel : true;
    
    // Check if fund already exists in the same category
    const isAlreadyInThisCategory = savedFunds.some(
      savedFund => savedFund.scheme_isin === fund.isin && (savedFund.category_id === selectedCategoryId || savedFund.category_id === 1)
    );
    
    return matchesSearch && matchesRisk && !isAlreadyInThisCategory;
  });

  const formatReturn = (value: number | null | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Helper function to get return values for both fund types
  const getReturn1D = (fund: VedantFunctionFund | SavedVedantFund) => {
    if ('return_1d' in fund) return fund.return_1d;
    return fund.return_1d || null;
  };

  const getReturn1Y = (fund: VedantFunctionFund | SavedVedantFund) => {
    if ('return_1yr' in fund) return fund.return_1yr;
    if ('return_1y' in fund) return (fund as SavedVedantFund).return_1y;
    return null;
  };

  const getSelectionStyle = (isSelected: boolean, categoryColor: string) => {
    const baseStyle = "p-2 border rounded transition-all duration-200 cursor-pointer";
    
    if (isSelected) {
      switch (categoryColor) {
        case 'orange': return `${baseStyle} border-[#f5862e] bg-orange-50 ring-1 ring-orange-200`;
        default: return `${baseStyle} border-blue-500 bg-blue-50 ring-1 ring-blue-200`;
      }
    }
    
    return `${baseStyle} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
  };

  const getCheckboxStyle = (isSelected: boolean, categoryColor: string) => {
    const baseStyle = "w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-200 flex-shrink-0";
    
    if (isSelected) {
      switch (categoryColor) {
        case 'orange': return `${baseStyle} bg-[#f5862e] border-[#f5862e]`;
        default: return `${baseStyle} bg-blue-500 border-blue-500`;
      }
    }
    
    return `${baseStyle} border-gray-300 bg-white hover:border-gray-400`;
  };

  const VedantFundSelectionModal = () => {
    const categoryColor = VEDANT_CATEGORIES.find(c => c.id === selectedCategoryId)?.color || 'orange';
    
    return (
      <div className="absolute top-0 left-0 right-0 z-10 bg-white rounded-lg shadow-lg border border-gray-300 mx-auto w-full max-w-2xl">
        {/* Modal Header - Compressed and Centered */}
        <div className={`p-3 text-white ${getModalHeaderClass(categoryColor)} rounded-t-lg`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={closeModal}
                className="text-white hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={14} />
                <span className="text-xs">Back</span>
              </button>
              <div>
                <h2 className="text-sm font-bold">
                  {`${selectedCategory} - Select Funds`}
                </h2>
                <p className="opacity-90 text-xs">
                  Choose one or multiple funds from available list
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs opacity-90 font-semibold">
                Selected: <span className="text-white font-bold">{selectedFunds.length}</span>
              </div>
              <button
                onClick={addSelectedFunds}
                disabled={selectedFunds.length === 0}
                className="bg-white text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow"
              >
                <Check size={12} />
                {`Add ${selectedFunds.length} Fund${selectedFunds.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={closeModal}
                className="text-white hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section - Compressed */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <Input
                  type="text"
                  placeholder="Search by scheme name or ISIN..."
                  value={modalSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <select
                value={selectedRiskLevel}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRiskLevel(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Risk Levels</option>
                {uniqueRiskLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Content - Compressed */}
        <div className="overflow-y-auto max-h-[300px]">
          {filteredModalFunds.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No funds found matching your criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 p-3">
              {filteredModalFunds.map((fund) => {
                const isSelected = selectedFunds.some(f => f.isin === fund.isin);
                
                return (
                  <div
                    key={`${fund.isin}-${fund.scheme_id}`}
                    onClick={() => toggleFundSelection(fund)}
                    className={`${getSelectionStyle(isSelected, categoryColor)}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFundSelection(fund);
                        }}
                        className={getCheckboxStyle(isSelected, categoryColor)}
                      >
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-xs mb-0.5 truncate">
                              {fund.scheme_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-0.5">
                                <strong className="text-gray-700 text-xs">ISIN:</strong> 
                                <span className="truncate max-w-[80px] font-mono text-xs">{fund.isin}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <strong className="text-gray-700 text-xs">ID:</strong> 
                                <span className="text-xs">{fund.scheme_id}</span>
                              </div>
                            </div>
                            
                            {/* Returns Display - Compressed */}
                            <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                              <div className="text-center">
                                <div className="text-gray-500 text-xs">1D Return</div>
                                <div className={`font-semibold text-xs ${
                                  (getReturn1D(fund) || 0) > 0 ? 'text-green-600' : 
                                  (getReturn1D(fund) || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {formatReturn(getReturn1D(fund))}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500 text-xs">1Y Return</div>
                                <div className={`font-semibold text-xs ${
                                  (getReturn1Y(fund) || 0) > 0 ? 'text-green-600' : 
                                  (getReturn1Y(fund) || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {formatReturn(getReturn1Y(fund))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-1">
                            <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              fund.risk_level?.includes('High') ? 'bg-red-100 text-red-800' :
                              fund.risk_level?.includes('Low') ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {fund.risk_level || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const categoryFunds = getCategoryFunds();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin-setting')} 
            className="flex items-center px-4 py-2 text-white rounded-lg transition-colors mb-4 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: '#f5862e' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5862e] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading funds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin-setting')} 
            className="flex items-center px-4 py-2 text-white rounded-lg transition-colors mb-4 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: '#f5862e' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#f5862e] text-white rounded hover:bg-[#e07828] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin-setting')} 
          className="flex items-center px-4 py-2 text-white rounded-lg transition-colors mb-4 cursor-pointer hover:opacity-90"
          style={{ backgroundColor: '#f5862e' }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800">Vedant Recommended Funds</h1>
        <p className="text-gray-600">Manage and organize recommended funds in High Return category.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-700">Recommended Funds</h2>
            <p className="text-gray-600">Funds with highest historical returns</p>
          </div>
          <button
            onClick={() => openModal(VEDANT_CATEGORIES[0])}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-colors duration-200 bg-[#f5862e] hover:bg-[#e07828]"
          >
            <Plus size={18} />
            Add Fund
          </button>
        </div>

        {/* Table Format - ALWAYS VISIBLE, even when modal is open */}
        {categoryFunds.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Plus size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No funds added yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first recommended fund</p>
            <button
              onClick={() => openModal(VEDANT_CATEGORIES[0])}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 bg-[#f5862e] hover:bg-[#e07828]"
            >
              <Plus size={18} />
              Add Your First Fund
            </button>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-lg border border-gray-200 ${showModal ? 'opacity-30' : ''}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheme Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1D Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1Y Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryFunds.map((fund) => (
                  <tr key={`${fund.id}-${fund.scheme_isin}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{fund.scheme_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{fund.scheme_isin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fund.risk_level?.includes('High') ? 'bg-red-100 text-red-800' :
                        fund.risk_level?.includes('Low') ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fund.risk_level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        (getReturn1D(fund) || 0) > 0 ? 'text-green-600' : 
                        (getReturn1D(fund) || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatReturn(getReturn1D(fund))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        (getReturn1Y(fund) || 0) > 0 ? 'text-green-600' : 
                        (getReturn1Y(fund) || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatReturn(getReturn1Y(fund))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteFund(fund.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal appears as absolute positioned inside the card */}
        {showModal && <VedantFundSelectionModal />}
      </div>
    </div>
  );
}