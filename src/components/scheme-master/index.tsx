"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Search, X, Check, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SchemeConfigurationService, { Scheme, SavedSchemeConfig as ServiceSavedSchemeConfig, ColorMaster, ColorAllocation } from "@/services/schemeConfiguration";

type SavedSchemeConfig = ServiceSavedSchemeConfig & { percentage?: number };

const Button = ({ children, className = "", ...props }: any) => (
  <button {...props} className={`px-4 py-2 rounded text-[#F9FAFB] bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90 disabled:opacity-50 transition-all ${className}`}>
    {children}
  </button>
);

const Input = (props: any) => <input {...props} className="border border-[#2A2A2A] rounded-lg px-3 py-2 w-full bg-[#1F1A1A] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent" />;

const PercentageInputWithLocalState = ({ 
  schemeIsin, 
  value, 
  onChange 
}: { 
  schemeIsin: string;
  value: number;
  onChange: (schemeIsin: string, value: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(value === 0 ? '' : value.toString());

  useEffect(() => {
    setInputValue(value === 0 ? '' : value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === '') {
      setInputValue('');
      onChange(schemeIsin, 0);
      return;
    }

    if (/^\d+$/.test(newValue)) {
      const numericValue = parseInt(newValue, 10);
     
      if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
        setInputValue(newValue);
        onChange(schemeIsin, numericValue);
      } else if (numericValue > 100) {
        setInputValue('100');
        onChange(schemeIsin, 100);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue('0');
      onChange(schemeIsin, 0);
    } else {
      const percentage = parseInt(inputValue, 10);
      if (!isNaN(percentage)) {
        const boundedValue = Math.min(100, Math.max(0, percentage));
        setInputValue(boundedValue.toString());
        onChange(schemeIsin, boundedValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!/[\d]|Backspace|Delete|Tab|Enter|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|\./.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
      className="w-16 px-2 py-1 border border-[#2A2A2A] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-colors duration-200 text-center text-sm font-medium bg-[#1F1A1A] text-[#F9FAFB]"
      placeholder="0"
    />
  );
};

export default function SchemeConfigurationPage() {
  const router = useRouter();
  const [colors, setColors] = useState<ColorMaster[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [configurations, setConfigurations] = useState<SavedSchemeConfig[]>([]);
  const [colorAllocations, setColorAllocations] = useState<ColorAllocation[]>([]);

 
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string>('');
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('');
  const [selectedFund, setSelectedFund] = useState<string>('');
  const [selectedSchemes, setSelectedSchemes] = useState<Scheme[]>([]);
  const [schemePercentages, setSchemePercentages] = useState<{[key: string]: number}>({});

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editItems, setEditItems] = useState<SavedSchemeConfig[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    fetchColors();
    fetchAllSchemes();
    fetchConfigurations();
  }, []);

  useEffect(() => {
    fetchColorAllocations();
  }, [configurations]);

  async function fetchColors() {
    try {
      const colorsData = await SchemeConfigurationService.getAllColors();
      setColors(colorsData);
    } catch (err) {
      console.error("fetchColors:", err);
      setColors([]);
    }
  }

  async function fetchAllSchemes() {
    try {
      const schemes = await SchemeConfigurationService.getAllSchemes();
      setAllSchemes(schemes);
    } catch (err) {
      console.error("fetchAllSchemes:", err);
    }
  }

  async function fetchConfigurations() {
    try {
      const saved = await SchemeConfigurationService.getSavedConfigurations();
      const configurationsWithPercentages = (saved as SavedSchemeConfig[]).map(config => ({
        ...config,
        percentage: config.percentage || 0
      }));
      setConfigurations(configurationsWithPercentages || []);
    } catch (err) {
      console.error("fetchConfigurations:", err);
    }
  }

  async function fetchColorAllocations() {
    try {
      const allocations = await SchemeConfigurationService.getAllColorAllocations();
      setColorAllocations(allocations);
    } catch (err) {
      console.error("fetchColorAllocations:", err);
    }
  }

  
  const calculateColorTotalAllocation = (colorId: number) => {
    const allocation = colorAllocations.find(a => a.color_id === colorId);
    return allocation ? allocation.total_allocation : 0;
  };

  const calculateRemainingAllocation = (colorId: number) => {
    const allocation = colorAllocations.find(a => a.color_id === colorId);
    return allocation ? allocation.remaining_allocation : 100;
  };

  const isColorFullyAllocated = (colorId: number) => {
    const allocation = colorAllocations.find(a => a.color_id === colorId);
    return allocation ? allocation.is_fully_allocated : false;
  };

  const isColorOverAllocated = (colorId: number) => {
    const totalAllocation = calculateColorTotalAllocation(colorId);
    return totalAllocation > 100;
  };

  const calculateSelectedSchemesTotalPercentage = () => {
    const total = Object.values(schemePercentages).reduce((total, percent) => total + (percent || 0), 0);
    return Math.round(total * 100) / 100;
  };


  const formatPercentage = (percentage: any): string => {
 
    const num = Number(percentage);
    if (isNaN(num) || num === 0) return '0.00';
    return num.toFixed(2);
  };


  const openModal = (colorId: number) => {
    const color = colors.find(c => c.id === colorId);
    setSelectedCategory(color?.color_name.toLowerCase() || '');
    setSelectedColorId(colorId);
    setSelectedColorName(color?.color_name || '');
    setModalSearchTerm('');
    setSelectedRiskLevel('');
    setSelectedFund('');
    setSelectedSchemes([]);
    setSchemePercentages({});
    setIsEditMode(false);
    setEditingItemId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory('');
    setSelectedColorId(null);
    setSelectedColorName('');
    setSelectedSchemes([]);
    setSchemePercentages({});
    setIsEditMode(false);
    setEditingItemId(null);
  };

  const toggleSchemeSelection = (scheme: Scheme) => {
    setSelectedSchemes(prev => {
      const isSelected = prev.some(s => s.scheme_isin === scheme.scheme_isin);
      if (isSelected) {
        const newPercentages = {...schemePercentages};
        delete newPercentages[scheme.scheme_isin];
        setSchemePercentages(newPercentages);
        return prev.filter(s => s.scheme_isin !== scheme.scheme_isin);
      } else {
        const isFullyAllocated = isColorFullyAllocated(selectedColorId!);
        if (isFullyAllocated && !isEditMode) {
          alert(`Cannot add more schemes. ${selectedColorName.toUpperCase()} category is fully allocated (100%). Please delete existing schemes to add new ones.`);
          return prev; // Return previous state instead of undefined
        }
        
        const currentTotal = calculateSelectedSchemesTotalPercentage();
        const availableAllocation = calculateRemainingAllocation(selectedColorId!);
        
        if (currentTotal >= availableAllocation && !isEditMode) {
          alert(`Cannot add more schemes. Available allocation: ${formatPercentage(availableAllocation)}%`);
          return prev; // Return previous state instead of undefined
        }
        
        setSchemePercentages(prev => ({
          ...prev,
          [scheme.scheme_isin]: 0
        }));
        return [...prev, scheme];
      }
    });
  };

  const handlePercentageChange = (schemeIsin: string, value: number) => {
    const currentTotal = calculateSelectedSchemesTotalPercentage();
    const currentValue = schemePercentages[schemeIsin] || 0;
    const newTotal = currentTotal - currentValue + value;
    
    const availableAllocation = calculateRemainingAllocation(selectedColorId!) + (isEditMode ? currentValue : 0);
    
    if (newTotal > availableAllocation && !isEditMode) {
      alert(`Total allocation cannot exceed 100%. Available: ${formatPercentage(availableAllocation)}%`);
      return;
    }
    
    setSchemePercentages(prev => ({
      ...prev,
      [schemeIsin]: value
    }));
  };

  const addSelectedSchemes = async () => {
    if (selectedSchemes.length === 0 || !selectedColorId) return;

    const totalPercentage = calculateSelectedSchemesTotalPercentage();
    if (totalPercentage > 100) {
      alert(`Total percentage cannot exceed 100%. Current total: ${totalPercentage}%`);
      return;
    }

    const schemesWithZeroAllocation = selectedSchemes.filter(scheme => 
      !schemePercentages[scheme.scheme_isin] || schemePercentages[scheme.scheme_isin] === 0
    );

    if (schemesWithZeroAllocation.length > 0) {
      alert("Please set allocation percentage for all selected schemes before saving.");
      return;
    }

    
    const existingAllocation = calculateColorTotalAllocation(selectedColorId);
    const newTotalAllocation = existingAllocation + totalPercentage;
    
    if (newTotalAllocation > 100) {
      alert(`Total allocation for ${selectedColorName.toUpperCase()} cannot exceed 100%. Current total: ${newTotalAllocation}%`);
      
      return;
    }


    if (newTotalAllocation === 100) {
      alert(`Perfect! You have allocated 100% for ${selectedColorName.toUpperCase()}. Schemes added successfully.`);
    }

    const newConfigs = selectedSchemes.map(scheme => ({
      color_id: Number(selectedColorId),
      description: "",
      scheme_name: scheme.scheme_name,
      fund_name: scheme.fund_name,
      scheme_isin: scheme.scheme_isin,
      category_name: scheme.category_name,
      risk_level: scheme.risk_level || "",
      percentage: schemePercentages[scheme.scheme_isin] || 0
    }));

    const payload = {
      configurations: newConfigs
    };

    try {
      await SchemeConfigurationService.saveSchemeConfiguration(payload);
      if (newTotalAllocation !== 100) {
        alert("Schemes added successfully");
      }
      closeModal();
      await fetchConfigurations();
    } catch (err: any) {
      console.error("addSelectedSchemes:", err);
      alert(err.message || "Failed to save schemes");
    }
  };

  const openEditModal = (item: SavedSchemeConfig) => {
    setModalSearchTerm('');
    setSelectedRiskLevel('');
    setSelectedFund('');
    setIsEditMode(true);
    setEditingItemId(item.id || null);
    const color = colors.find(c => c.id === item.color_id);
    setSelectedCategory(color?.color_name.toLowerCase() || '');
    setSelectedColorId(item.color_id);
    setSelectedColorName(color?.color_name || '');
    
    const schemeToEdit: Scheme = {
      scheme_name: item.scheme_name,
      fund_name: item.fund_name,
      scheme_isin: item.scheme_isin,
      category_name: item.category_name,
      risk_level: item.risk_level || ""
    };
    
    setSelectedSchemes([schemeToEdit]);
    setSchemePercentages({
      [item.scheme_isin]: item.percentage || 0
    });
    
    setShowModal(true);
  };

  // FIXED: Update configuration with proper error handling
  const updateConfiguration = async () => {
    if (selectedSchemes.length === 0 || !selectedColorId || !editingItemId) return;

    const totalPercentage = calculateSelectedSchemesTotalPercentage();
    if (totalPercentage > 100) {
      alert(`Total percentage cannot exceed 100%. Current total: ${totalPercentage}%`);
      return;
    }

    const selectedScheme = selectedSchemes[0];
    const updatePayload = {
      color_id: Number(selectedColorId),
      description: "",
      scheme_name: selectedScheme.scheme_name,
      fund_name: selectedScheme.fund_name,
      scheme_isin: selectedScheme.scheme_isin,
      category_name: selectedScheme.category_name,
      risk_level: selectedScheme.risk_level || "",
      percentage: schemePercentages[selectedScheme.scheme_isin] || 0
    };


    const existingAllocationWithoutEdited = calculateColorTotalAllocation(selectedColorId) - (configurations.find(cfg => cfg.id === editingItemId)?.percentage || 0);
    const newTotalAllocation = existingAllocationWithoutEdited + totalPercentage;

    if (newTotalAllocation > 100) {
      alert(`Total allocation for ${selectedColorName.toUpperCase()} cannot exceed 100%. Current total: ${newTotalAllocation}%`);
      return;
    }


    if (newTotalAllocation === 100) {
      alert(`Perfect! You have allocated 100% for ${selectedColorName.toUpperCase()}. Configuration updated successfully.`);
    }

    try {
      await SchemeConfigurationService.updateConfiguration(editingItemId, updatePayload);
      if (newTotalAllocation !== 100) {
        alert("Configuration updated successfully");
      }
      closeModal();
      await fetchConfigurations();
    } catch (err: any) {
      console.error("updateConfiguration:", err);
      alert(err.message || "Failed to update configuration");
    }
  };

  const deleteSavedItem = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await SchemeConfigurationService.deleteConfiguration(id);
      await fetchConfigurations();
    } catch (err) {
      console.error("deleteSavedItem:", err);
      alert("Failed to delete configuration");
    }
  };

  const getColorConfigurations = (colorId: number) => {
    return configurations.filter(cfg => cfg.color_id === colorId);
  };

  const getColorCardClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'red': return 'border-t-4 border-t-red-500 bg-[#111111]';
      case 'yellow': return 'border-t-4 border-t-yellow-500 bg-[#111111]';
      case 'green': return 'border-t-4 border-t-green-500 bg-[#111111]';
      default: return 'border-t-4 border-t-gray-500 bg-[#111111]';
    }
  };

  const getColorButtonClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'red': return 'bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90';
      case 'yellow': return 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:opacity-90';
      case 'green': return 'bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90';
      default: return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90';
    }
  };

  const getModalHeaderClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'red': return 'bg-gradient-to-r from-red-600 to-red-700';
      case 'yellow': return 'bg-gradient-to-r from-yellow-600 to-yellow-700';
      case 'green': return 'bg-gradient-to-r from-green-600 to-green-700';
      default: return 'bg-gradient-to-r from-[#F59E0B] to-[#B45309]';
    }
  };

  const getRiskBadgeClass = (riskLevel: string | undefined) => {
    if (!riskLevel) return 'bg-[#0A0A0A]0/20 text-[#9CA3AF]';
    if (riskLevel.includes('High')) return 'bg-red-500/20 text-red-400';
    if (riskLevel.includes('Low')) return 'bg-green-500/20 text-green-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  const uniqueRiskLevels = [...new Set(allSchemes.map(scheme => scheme.risk_level).filter(risk => risk))].sort();
  const uniqueFunds = [...new Set(allSchemes.map(scheme => scheme.fund_name).filter(fund => fund))].sort();

  const filteredModalSchemes = allSchemes.filter(scheme => {
    const matchesSearch = scheme.scheme_name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                          scheme.scheme_isin.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                          scheme.fund_name.toLowerCase().includes(modalSearchTerm.toLowerCase());
    
    const matchesRisk = selectedRiskLevel ? scheme.risk_level === selectedRiskLevel : true;
    const matchesFund = selectedFund ? scheme.fund_name === selectedFund : true;
    
    return matchesSearch && matchesRisk && matchesFund;
  });

  const getSelectedBorderClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'red': return 'border-red-500 bg-red-50 ring-1 ring-red-200';
      case 'yellow': return 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-200';
      case 'green': return 'border-green-500 bg-green-50 ring-1 ring-green-200';
      default: return 'border-blue-500 bg-blue-50 ring-1 ring-blue-200';
    }
  };

  const getSelectedRadioClass = (colorName: string) => {
    switch (colorName.toLowerCase()) {
      case 'red': return 'bg-red-500 border-red-500';
      case 'yellow': return 'bg-yellow-500 border-yellow-500';
      case 'green': return 'bg-green-500 border-green-500';
      default: return 'bg-blue-500 border-blue-500';
    }
  };

  const getSchemeRiskBadge = (riskLevel: string | undefined) => {
    if (!riskLevel) return 'bg-[#1F1A1A] text-[#9CA3AF]';
    const r = riskLevel.toLowerCase();
    if (r.includes('very high')) return 'bg-purple-100 text-purple-700';
    if (r.includes('moderately high')) return 'bg-orange-100 text-orange-700';
    if (r.includes('high')) return 'bg-red-100 text-red-700';
    if (r.includes('moderate')) return 'bg-yellow-100 text-yellow-700';
    if (r.includes('low')) return 'bg-green-100 text-green-700';
    return 'bg-[#1F1A1A] text-[#9CA3AF]';
  };

  const SchemeSelectionModal = () => {
    const totalPercentage = calculateSelectedSchemesTotalPercentage();
    const remainingAllocation = selectedColorId ? calculateRemainingAllocation(selectedColorId) : 100;
    const isOverLimit = remainingAllocation < 0;

    const getSortedSchemes = () => {
      if (!isEditMode || selectedSchemes.length === 0) {
        return filteredModalSchemes;
      }
      const selectedSchemeIsin = selectedSchemes[0].scheme_isin;
      const selectedScheme = filteredModalSchemes.find(s => s.scheme_isin === selectedSchemeIsin);
      const otherSchemes = filteredModalSchemes.filter(s => s.scheme_isin !== selectedSchemeIsin);
      if (selectedScheme) {
        return [selectedScheme, ...otherSchemes];
      }
      return filteredModalSchemes;
    };

    const sortedSchemes = getSortedSchemes();

    return (
      <div className="fixed inset-0 bg-black/80 flex items-start justify-center p-4 z-50 pt-20">
        <div className="bg-[#111111] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-[#2A2A2A]">
          <div className={`p-4 text-[#F9FAFB] ${getModalHeaderClass(selectedColorName)}`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={closeModal}
                  className="text-[#F9FAFB] hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded flex items-center gap-1 text-sm flex-shrink-0"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold truncate">
                        {isEditMode ? `Edit ${selectedColorName} Scheme` : `${selectedColorName} - Select Schemes`}
                      </h2>
                      <p className="opacity-90 text-xs truncate">
                        {isEditMode ? 'Update scheme allocation' : 'Choose schemes from available list'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-shrink-0">
                      <div className={`font-semibold ${isOverLimit ? 'text-red-200' : 'opacity-90'}`}>
                        Selected: <span className="text-[#F9FAFB] font-bold">{formatPercentage(totalPercentage)}%</span>
                      </div>
                      <div className={`font-semibold ${isOverLimit ? 'text-red-200' : 'opacity-90'}`}>
                        Remaining: <span className={`font-bold ${isOverLimit ? 'text-red-200' : 'text-[#F9FAFB]'}`}>
                          {formatPercentage(Math.max(0, remainingAllocation))}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={isEditMode ? updateConfiguration : addSelectedSchemes}
                  disabled={selectedSchemes.length === 0 || isOverLimit || totalPercentage === 0}
                  className="bg-[#111111] text-[#F9FAFB] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#111111] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow"
                >
                  <Check size={12} />
                  {isEditMode ? 'Update' : `Add ${selectedSchemes.length}`}
                </button>
                <button
                  onClick={closeModal}
                  className="text-[#F9FAFB] hover:bg-black hover:bg-opacity-20 transition-colors p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-[#2A2A2A] bg-[#1F1A1A]">
            <div className="flex flex-nowrap items-center gap-3">
              <div className="flex-1 min-w-[120px] relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={14} />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-[#111111] text-[#F9FAFB] placeholder:text-[#9CA3AF]"
                />
              </div>
          
              <div className="w-40">
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-[#111111] text-[#F9FAFB]"
                >
                  <option value="">All Risk Levels</option>
                  {uniqueRiskLevels.map(risk => (
                    <option key={risk} value={risk}>{risk}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-48">
                <select
                  value={selectedFund}
                  onChange={(e) => setSelectedFund(e.target.value)}
                  className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-[#111111] text-[#F9FAFB]"
                >
                  <option value="">All Funds</option>
                  {uniqueFunds.map(fund => (
                    <option key={fund} value={fund}>{fund}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-[#9CA3AF]">
              <span>{sortedSchemes.length} schemes found</span>
              {isEditMode && selectedSchemes.length > 0 && (
                <span className="ml-3 text-[#F59E0B] font-medium">
                  • Selected scheme shown first
                </span>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {sortedSchemes.length === 0 ? (
              <div className="p-6 text-center text-[#9CA3AF]">
                <Search size={32} className="mx-auto mb-3 text-[#2A2A2A]" />
                <p className="text-sm">No schemes found matching your criteria</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-4">
                {sortedSchemes.map((scheme) => {
                  const isSelected = selectedSchemes.some(s => s.scheme_isin === scheme.scheme_isin);
                  const percentage = schemePercentages[scheme.scheme_isin] || 0;
                  const isCurrentlyEdited = isEditMode && isSelected;
                  
                  return (
                    <div
                      key={scheme.scheme_isin}
                      className={`p-3 border rounded-lg transition-all duration-200 ${
                        isSelected
                          ? `border-${selectedColorName.toLowerCase()}-500 bg-${selectedColorName.toLowerCase()}-500/10`
                          : 'border-[#2A2A2A] hover:border-[#F59E0B]/50 hover:bg-[#1F1A1A]'
                      } ${isCurrentlyEdited ? 'ring-2 ring-[#F59E0B]' : ''}`}
                    >
                      {isCurrentlyEdited && (
                        <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#F59E0B]/30">
                          <div className="bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-0.5">
                            <Check size={10} />
                            Editing
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {!isEditMode && (
                          <div 
                            onClick={() => toggleSchemeSelection(scheme)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                              isSelected
                                ? `bg-${selectedColorName.toLowerCase()}-500 border-${selectedColorName.toLowerCase()}-500`
                                : 'border-[#2A2A2A] hover:border-[#F59E0B]'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-[#F9FAFB]" />}
                          </div>
                        )}
                        
                        {isEditMode && (
                          <div 
                            onClick={() => {
                              const newSelectedScheme = selectedSchemes.some(s => s.scheme_isin === scheme.scheme_isin) 
                                ? selectedSchemes 
                                : [scheme];
                              setSelectedSchemes(newSelectedScheme);
                              const newPercentages = {...schemePercentages};
                              if (!newSelectedScheme.some(s => s.scheme_isin === scheme.scheme_isin)) {
                                Object.keys(newPercentages).forEach(key => {
                                  if (!newSelectedScheme.some(s => s.scheme_isin === key)) {
                                    delete newPercentages[key];
                                  }
                                });
                                newPercentages[scheme.scheme_isin] = 0;
                              }
                              setSchemePercentages(newPercentages);
                            }}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                              selectedSchemes.some(s => s.scheme_isin === scheme.scheme_isin)
                                ? `bg-${selectedColorName.toLowerCase()}-500 border-${selectedColorName.toLowerCase()}-500`
                                : 'border-[#2A2A2A] hover:border-[#F59E0B]'
                            }`}
                          >
                            {selectedSchemes.some(s => s.scheme_isin === scheme.scheme_isin) && <Check size={12} className="text-[#F9FAFB]" />}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#F9FAFB] text-sm mb-1 truncate hover:text-clip hover:whitespace-normal group">
                                {scheme.scheme_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">ISIN:</strong> 
                                  <span className="truncate max-w-[120px]">{scheme.scheme_isin}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">Fund:</strong> 
                                  <span className="truncate max-w-[140px]">{scheme.fund_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">Category:</strong> 
                                  <span>{scheme.category_name}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskBadgeClass(scheme.risk_level)}`}>
                                {scheme.risk_level || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedSchemes.some(s => s.scheme_isin === scheme.scheme_isin) && (
                        <div className="mt-2 flex items-center gap-3 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] p-2">
                          <label className="text-xs font-medium text-[#9CA3AF] whitespace-nowrap flex items-center gap-1.5">
                            <span>Allocation:</span>
                            {schemePercentages[scheme.scheme_isin] > 0 && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded">
                                ✓
                              </span>
                            )}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <PercentageInputWithLocalState 
                              schemeIsin={scheme.scheme_isin} 
                              value={schemePercentages[scheme.scheme_isin] || 0} 
                              onChange={handlePercentageChange}
                            />
                            <span className="text-xs text-[#9CA3AF] font-medium">%</span>
                          </div>
                          <div className="text-xs text-[#9CA3AF] ml-1">
                            {schemePercentages[scheme.scheme_isin] === 0 ? 'Enter 1-100' : `${schemePercentages[scheme.scheme_isin]}%`}
                          </div>
                        </div>
                      )}
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin-setting')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg transition-all duration-300 mb-4 cursor-pointer hover:opacity-90 hover:shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">Scheme Configuration</h1>
          <p className="text-[#9CA3AF] mt-1">Configure your investment schemes by allocating them across different risk categories. Each color represents a distinct risk level - Red for high risk, Yellow for medium risk, and Green for low risk. Allocate up to 100% across schemes within each category</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {colors.map(color => {
            const colorConfigs = getColorConfigurations(color.id);
            const totalAllocation = calculateColorTotalAllocation(color.id);
            const availableAllocation = calculateRemainingAllocation(color.id);
            const isFullyAllocated = isColorFullyAllocated(color.id);
            const isOverAllocated = isColorOverAllocated(color.id);
            
            const getColorTextClass = (colorName: string) => {
              switch (colorName.toLowerCase()) {
                case 'red': return 'text-red-400';
                case 'yellow': return 'text-yellow-400';
                case 'green': return 'text-green-400';
                default: return 'text-[#F59E0B]';
              }
            };
            
            return (
              <div key={color.id} className={`rounded-xl border border-[#2A2A2A] ${getColorCardClass(color.color_name)} p-5 flex flex-col min-h-[450px] shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${getColorTextClass(color.color_name)}`}>
                        {color.color_name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1">{color.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${
                      isOverAllocated ? 'text-red-400' : 
                      isFullyAllocated ? 'text-green-400' : 
                      'text-[#F59E0B]'
                    }`}>
                      {formatPercentage(totalAllocation)}%
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {isOverAllocated ? `+${formatPercentage(totalAllocation - 100)}%` :
                       isFullyAllocated ? 'Fully allocated' :
                       `${formatPercentage(availableAllocation)}% available`}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  {colorConfigs.length === 0 ? (
                    <div className="text-center py-8 text-[#9CA3AF] bg-[#1F1A1A] rounded-lg border border-dashed border-[#2A2A2A] h-full flex flex-col items-center justify-center min-h-[200px]">
                      <Plus size={32} className="text-[#2A2A2A] mb-2" />
                      <p className="text-xs mb-1">No schemes added</p>
                      <p className="text-xs">Click "Add Scheme" to start</p>
                    </div>
                  ) : (
                    <div className={`space-y-2 ${colorConfigs.length > 4 ? 'max-h-[280px] overflow-y-auto pr-1 custom-scrollbar' : ''}`}>
                      {colorConfigs.map(cfg => (
                        <div key={cfg.id} className="bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] p-3 hover:border-[#F59E0B]/50 transition-all duration-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold text-[#F9FAFB] text-xs truncate hover:text-clip hover:whitespace-normal group">
                                  {cfg.scheme_name}
                                </h4>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getRiskBadgeClass(cfg.risk_level)}`}>
                                  {cfg.risk_level || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">ISIN:</strong> 
                                  <span className="max-w-[80px] truncate">{cfg.scheme_isin}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <strong className="text-[#9CA3AF]">Fund:</strong> 
                                  <span className="truncate max-w-[100px]">{cfg.fund_name}</span>
                                </div>
                                <div className={`font-semibold ${(cfg.percentage || 0) > 0 ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`}>
                                  {(cfg.percentage || 0) > 0 ? `${formatPercentage(cfg.percentage || 0)}%` : '0%'}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-1 flex-shrink-0">
                              <button
                                onClick={() => openEditModal(cfg)}
                                className="flex items-center gap-0.5 px-2 py-1 text-xs bg-[#F59E0B] text-[#F9FAFB] rounded-lg hover:bg-[#B45309] transition-colors duration-200"
                              >
                                <Pencil size={10} />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSavedItem(cfg.id)}
                                className="flex items-center gap-0.5 px-2 py-1 text-xs bg-red-600 text-[#F9FAFB] rounded-lg hover:bg-red-700 transition-colors duration-200"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A2A2A]">
                  <button
                    onClick={() => openModal(color.id)}
                    disabled={isFullyAllocated}
                    className={`w-full flex items-center justify-center gap-1 px-3 py-2 text-[#F9FAFB] rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getColorButtonClass(color.color_name)}`}
                  >
                    <Plus size={14} />
                    {isFullyAllocated ? 'Fully Allocated' : 'Add Scheme'}
                  </button>
                  {isFullyAllocated && (
                    <p className="text-xs text-center text-[#9CA3AF] mt-2">
                      Delete existing schemes to add new ones
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showModal && <SchemeSelectionModal />}
      
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