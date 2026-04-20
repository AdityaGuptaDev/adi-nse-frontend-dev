"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, X, Check, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SchemeConfigurationService, { VedantFunctionFund, SavedVedantFund } from "@/services/schemeConfiguration";

const Button = ({ children, className = "", ...props }: any) => (
  <button {...props} className={`px-4 py-2 rounded text-[#F9FAFB] bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90 disabled:opacity-50 transition-all ${className}`}>
    {children}
  </button>
);

const Input = (props: any) => <input {...props} className="border border-[#2A2A2A] rounded-lg px-3 py-2 w-full bg-[#1F1A1A] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent" />;

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
      case 'orange': return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90';
      default: return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90';
    }
  };

  const getModalHeaderClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'orange': return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309]';
      default: return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309]';
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
    const baseStyle = "p-3 border rounded-lg transition-all duration-200 cursor-pointer";
    
    if (isSelected) {
      return `${baseStyle} border-[#F59E0B] bg-[#F59E0B]/10 ring-1 ring-[#F59E0B]/30`;
    }
    
    return `${baseStyle} border-[#2A2A2A] hover:border-[#F59E0B]/50 hover:bg-[#1F1A1A]`;
  };

  const getCheckboxStyle = (isSelected: boolean, categoryColor: string) => {
    const baseStyle = "w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-200 flex-shrink-0";
    
    if (isSelected) {
      return `${baseStyle} bg-gradient-to-r from-[#F59E0B] to-[#B45309] border-transparent`;
    }
    
    return `${baseStyle} border-[#2A2A2A] bg-[#1F1A1A] hover:border-[#F59E0B]`;
  };

  const getRiskBadgeClass = (riskLevel: string | undefined) => {
    if (!riskLevel) return 'bg-[#0A0A0A]0/20 text-[#9CA3AF]';
    if (riskLevel.includes('High')) return 'bg-red-500/20 text-red-400';
    if (riskLevel.includes('Low')) return 'bg-green-500/20 text-green-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  const VedantFundSelectionModal = () => {
    const categoryColor = VEDANT_CATEGORIES.find(c => c.id === selectedCategoryId)?.color || 'orange';
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-[#2A2A2A]">
          {/* Modal Header */}
          <div className={`p-4 text-[#F9FAFB] ${getModalHeaderClass(categoryColor)}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="text-[#F9FAFB] hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded flex items-center gap-1 text-sm"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm">Back</span>
                </button>
                <div>
                  <h2 className="text-lg font-bold">
                    {`${selectedCategory} - Select Funds`}
                  </h2>
                  <p className="opacity-90 text-xs">
                    Choose one or multiple funds from available list
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm opacity-90 font-semibold">
                  Selected: <span className="text-[#F9FAFB] font-bold">{selectedFunds.length}</span>
                </div>
                <button
                  onClick={addSelectedFunds}
                  disabled={selectedFunds.length === 0}
                  className="bg-[#111111] text-[#F9FAFB] px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#111111] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow"
                >
                  <Check size={14} />
                  {`Add ${selectedFunds.length} Fund${selectedFunds.length !== 1 ? 's' : ''}`}
                </button>
                <button
                  onClick={closeModal}
                  className="text-[#F9FAFB] hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-4 border-b border-[#2A2A2A] bg-[#1F1A1A]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={16} />
                  <Input
                    type="text"
                    placeholder="Search by scheme name or ISIN..."
                    value={modalSearchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-[#111111] text-[#F9FAFB] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedRiskLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRiskLevel(e.target.value)}
                  className="w-full text-sm border border-[#2A2A2A] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-[#111111] text-[#F9FAFB]"
                >
                  <option value="">All Risk Levels</option>
                  {uniqueRiskLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 text-xs text-[#9CA3AF]">
              <span>{filteredModalFunds.length} funds available</span>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
            {filteredModalFunds.length === 0 ? (
              <div className="p-8 text-center text-[#9CA3AF]">
                <Search size={32} className="mx-auto mb-3 text-[#2A2A2A]" />
                <p className="text-sm">No funds found matching your criteria</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-4">
                {filteredModalFunds.map((fund) => {
                  const isSelected = selectedFunds.some(f => f.isin === fund.isin);
                  
                  return (
                    <div
                      key={`${fund.isin}-${fund.scheme_id}`}
                      onClick={() => toggleFundSelection(fund)}
                      className={getSelectionStyle(isSelected, categoryColor)}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFundSelection(fund);
                          }}
                          className={getCheckboxStyle(isSelected, categoryColor)}
                        >
                          {isSelected && <Check size={12} className="text-[#F9FAFB]" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#F9FAFB] text-sm mb-1">
                                {fund.scheme_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">ISIN:</strong> 
                                  <span className="font-mono">{fund.isin}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">ID:</strong> 
                                  <span>{fund.scheme_id}</span>
                                </div>
                              </div>
                              
                              {/* Returns Display */}
                              <div className="mt-2 flex gap-4 text-xs">
                                <div>
                                  <span className="text-[#9CA3AF]">1D Return:</span>
                                  <span className={`ml-1 font-semibold ${
                                    (getReturn1D(fund) || 0) > 0 ? 'text-green-400' : 
                                    (getReturn1D(fund) || 0) < 0 ? 'text-red-400' : 'text-[#9CA3AF]'
                                  }`}>
                                    {formatReturn(getReturn1D(fund))}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#9CA3AF]">1Y Return:</span>
                                  <span className={`ml-1 font-semibold ${
                                    (getReturn1Y(fund) || 0) > 0 ? 'text-green-400' : 
                                    (getReturn1Y(fund) || 0) < 0 ? 'text-red-400' : 'text-[#9CA3AF]'
                                  }`}>
                                    {formatReturn(getReturn1Y(fund))}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadgeClass(fund.risk_level)}`}>
                                {fund.risk_level || 'N/A'}
                              </span>
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
      </div>
    );
  };

  const categoryFunds = getCategoryFunds();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] w-full">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin-setting')} 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg transition-all duration-300 mb-4 cursor-pointer hover:opacity-90 hover:shadow-lg group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B] mx-auto"></div>
              <p className="mt-4 text-[#9CA3AF]">Loading funds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] w-full">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin-setting')} 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg transition-all duration-300 mb-4 cursor-pointer hover:opacity-90 hover:shadow-lg group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg hover:opacity-90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin-setting')} 
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg transition-all duration-300 mb-4 cursor-pointer hover:opacity-90 hover:shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">Vedant Recommended Funds</h1>
          <p className="text-[#9CA3AF] mt-1">Manage and organize recommended funds in High Return category.</p>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-lg p-6 mb-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#F9FAFB]">Recommended Funds</h2>
              <p className="text-[#9CA3AF]">Funds with highest historical returns</p>
            </div>
            <button
              onClick={() => openModal(VEDANT_CATEGORIES[0])}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            >
              <Plus size={18} />
              Add Fund
            </button>
          </div>

          {/* Table Format */}
          {categoryFunds.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF] bg-[#1F1A1A] rounded-lg border-2 border-dashed border-[#2A2A2A]">
              <Plus size={48} className="mx-auto mb-4 text-[#2A2A2A]" />
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">No funds added yet</h3>
              <p className="text-[#9CA3AF] mb-4">Get started by adding your first recommended fund</p>
              <button
                onClick={() => openModal(VEDANT_CATEGORIES[0])}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
              >
                <Plus size={18} />
                Add Your First Fund
              </button>
            </div>
          ) : (
            <div className={`overflow-hidden rounded-lg border border-[#2A2A2A] ${showModal ? 'opacity-30 pointer-events-none' : ''}`}>
              <table className="min-w-full divide-y divide-[#2A2A2A]">
                <thead className="bg-[#1F1A1A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      Scheme Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      ISIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      1D Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      1Y Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#111111] divide-y divide-[#2A2A2A]">
                  {categoryFunds.map((fund) => (
                    <tr key={`${fund.id}-${fund.scheme_isin}`} className="hover:bg-[#1F1A1A] transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#F9FAFB]">{fund.scheme_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#9CA3AF] font-mono">{fund.scheme_isin}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeClass(fund.risk_level)}`}>
                          {fund.risk_level || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${
                          (getReturn1D(fund) || 0) > 0 ? 'text-green-400' : 
                          (getReturn1D(fund) || 0) < 0 ? 'text-red-400' : 'text-[#9CA3AF]'
                        }`}>
                          {formatReturn(getReturn1D(fund))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${
                          (getReturn1Y(fund) || 0) > 0 ? 'text-green-400' : 
                          (getReturn1Y(fund) || 0) < 0 ? 'text-red-400' : 'text-[#9CA3AF]'
                        }`}>
                          {formatReturn(getReturn1Y(fund))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteFund(fund.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-[#F9FAFB] rounded-lg hover:bg-red-700 transition-colors duration-200"
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
        </div>
      </div>

      {/* Modal */}
      {showModal && <VedantFundSelectionModal />}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2A2A2A;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #F59E0B;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B45309;
        }
      `}</style>
    </div>
  );
}