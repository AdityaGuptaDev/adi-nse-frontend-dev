"use client"
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Target, Calculator, FileText, PieChart, Star, ArrowRight, UserPlus, Search, Award, Zap, Shield, AlertTriangle, Rocket, TrendingDown, BarChart3, ChevronDown, Plus, IndianRupee, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/utils/api';
import getConfig from '@/utils/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { getLS, removeLS, setLS } from '@/utils/helpers';
import { ADD_MEMBER, ADMIN_INVESTER_DATA, FLAT_MENU, MEMBER_DATA, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from '@/utils/constants';
import { cookieStorageKeys, removeCookieData, removeCookieToken} from '@/services/cookieStorageService';
import { fetchBcCreatedStatus, fetchPartnerCreatedStatus } from '@/services/dashboards';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);


// Alert Popup Component for Onboarding
const OnboardingAlertPopup = ({ 
  onClose, 
  onContinue, 
  isLoading = false 
}: { 
  onClose: () => void; 
  onContinue: () => void;
  isLoading?: boolean;
}) => {
  const [showPopup, setShowPopup] = useState(true);
  const [showRemindLater, setShowRemindLater] = useState(false);

  const handleClose = () => {
    setShowPopup(false);
    onClose();
  };

  const handleContinue = () => {
    setShowPopup(false);
    onContinue();
  };

  const handleRemindLater = () => {
    setShowPopup(false);
    setShowRemindLater(true);
    // Store in localStorage to remind later (e.g., after 24 hours)
    const remindLaterTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
    localStorage.setItem('onboardingRemindLater', remindLaterTime.toString());
    onClose();
  };

  // Remind Later Toast
  const RemindLaterToast = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowRemindLater(false);
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    if (!showRemindLater) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Onboarding reminder set</p>
            <p className="text-xs text-blue-600">We'll remind you again in 24 hours</p>
          </div>
        </div>
      </div>
    );
  };

  if (!showPopup) return (
    <>
      <RemindLaterToast />
      {null}
    </>
  );

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Popup */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isLoading ? 'Checking Status...' : 'Complete Your Onboarding'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? 'Verifying your profile status' : 'Action required to access all features'}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Your partner onboarding process is incomplete. To unlock all dashboard features and start managing clients, please complete your profile setup.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Verify your identity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Set up payment preferences</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Configure investment preferences</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Limited Access</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Some features like adding investors, viewing reports, and portfolio tracking may be restricted until onboarding is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRemindLater}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleContinue}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center space-x-2"
                >
                  <span>Continue Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <RemindLaterToast />
    </>
  );
};

// Check if we should show the onboarding alert
// Update the useOnboardingAlert hook in your component
const useOnboardingAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setIsChecking(true);
        
        // Get user's mobile number
        const userData = getLS(PROD_DATA);
        const mobileNumber = userData?.user?.mobile || userData?.mobile;
        
        if (!mobileNumber) {
          console.warn('No mobile number found for user');
          setIsChecking(false);
          return;
        }

        // Fetch partner creation status
        const userCreated = await fetchBcCreatedStatus(mobileNumber);
        console.log('Partner creation status:', userCreated);
        
        // SHOW ALERT ONLY IF userCreated IS NOT 1+
        if (userCreated !== 1) {
          setShowAlert(true);
        } else {
          console.log('Onboarding already completed, hiding alert');
          setShowAlert(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Decide whether to show alert on error
        // setShowAlert(false); // Hide on error
      } finally {
        setIsChecking(false);
      }
    };

    // Check status
    const timer = setTimeout(checkOnboardingStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinueOnboarding = () => {
    const user = getLS(PROD_DATA)?.user;
    const mobileForUrl = user.mobile;
    router.push(`/bcOnboarding?mobile=${mobileForUrl}`);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return {
    showAlert,
    isChecking,
    handleContinueOnboarding,
    handleCloseAlert
  };
};



interface BCData {
  total_investor: string;
  total_investment: string;
  total_current_value: number;
  total_transaction: number;
  profit_loss: number;
  total_aum: number;
  name: string;
  email: string;
  pan: string;
}

interface ApiResponse {
  data: {
    data: BCData[];
    count: number;
  };
  msg: string;
}

interface Scheme {
  scheme_id: string;
  scheme_name: string;
  fund_name: string;
  scheme_isin: string;
  category_name: string;
  risk_level: string;
  percentage: string;
  color_id: number;
  color_name: string;
  color_description: string;
}

interface SchemesResponse {
  data: Scheme[];
  msg: string;
}

interface UserData {
  bc_id?: string | number;
  id?: string | number;
  name?: string;
  email?: string;
}

// Interface for Top Performing Funds API Response
interface TopPerformingFund {
  id: number;
  scheme_id: number;
  ISIN: string;
  Return1d: number;
  Return1w: number;
  Return1mth: number;
  Return3mth: number;
  Return6mth: number;
  Return1yr: number;
  Returns2yr: number | null;
  Returns3yr: number | null;
  Returns5yr: number | null;
  ReturnYTD: number;
  AUM: number;
  AUMDate: string;
  Nav: number;
  NavDate: string;
  NavChange: number;
  NavChangePercentage: number;
  SchemeMaster: {
    id: string;
    ms_fullname: string;
    name: string;
    riskLevel: string;
    SchemeCategory: {
      ID: string;
      Name: string;
    };
    SchemeSubcategory: {
      Id: number;
      Name: string;
    };
  };
  categoryReturnAvg: number;
}

interface TopPerformingFundsResponse {
  data: TopPerformingFund[];
  msg: string;
}

interface MarketData {
  index: string;
  value: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down';
}

// Investor Interface matching API response
interface Investor {
  id: string;
  inv_name: string;
  fathers_name: string;
  father_relation: string;
  pan_no: string;
  reg_mobile: string;
  reg_email: string;
  dob: string;
  address: string;
  partner_name: string;
  created_at: string;
  aum: string;
  rm_name: string;
  name?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string;
  relationship?: string;
  partner?: string;
}


interface InvestorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  investors: Investor[];
  onInvestorSelect: (investor: Investor) => void;
  categoryName: string;
  loading?: boolean;
}

const InvestorSelectionModal: React.FC<InvestorSelectionModalProps> = ({
  isOpen,
  onClose,
  investors,
  onInvestorSelect,
  categoryName,
  loading = false
}) => {
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>(investors);


  const getCategoryColors = () => {
    switch (categoryName.toLowerCase()) {
      case 'red':
        return {
          headerGradient: 'from-red-600 to-red-700',
          searchBg: 'bg-red-50',
          selectedBg: 'bg-red-50',
          selectedBorder: 'border-l-red-500',
          selectedIcon: 'bg-red-100 text-red-600',
          summaryGradient: 'from-red-50 to-pink-50',
          summaryBorder: 'border-red-200',
          summaryIcon: 'bg-red-100 text-red-600',
          buttonGradient: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
        };
      case 'yellow':
        return {
          headerGradient: 'from-yellow-600 to-amber-700',
          searchBg: 'bg-amber-50',
          selectedBg: 'bg-amber-50',
          selectedBorder: 'border-l-amber-500',
          selectedIcon: 'bg-amber-100 text-amber-600',
          summaryGradient: 'from-amber-50 to-yellow-50',
          summaryBorder: 'border-amber-200',
          summaryIcon: 'bg-amber-100 text-amber-600',
          buttonGradient: 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
        };
      case 'green':
        return {
          headerGradient: 'from-green-600 to-emerald-700',
          searchBg: 'bg-emerald-50',
          selectedBg: 'bg-emerald-50',
          selectedBorder: 'border-l-emerald-500',
          selectedIcon: 'bg-emerald-100 text-emerald-600',
          summaryGradient: 'from-emerald-50 to-green-50',
          summaryBorder: 'border-emerald-200',
          summaryIcon: 'bg-emerald-100 text-emerald-600',
          buttonGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        };
      default:
        return {
          headerGradient: 'from-slate-800 to-slate-900',
          searchBg: 'bg-slate-50',
          selectedBg: 'bg-blue-50',
          selectedBorder: 'border-l-blue-500',
          selectedIcon: 'bg-blue-100 text-blue-600',
          summaryGradient: 'from-blue-50 to-indigo-50',
          summaryBorder: 'border-blue-200',
          summaryIcon: 'bg-blue-100 text-blue-600',
          buttonGradient: 'from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800'
        };
    }
  };

  const colors = getCategoryColors();

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInvestors(investors);
    } else {
      const filtered = investors.filter(investor =>
        investor.inv_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.pan_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.reg_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.reg_mobile.includes(searchTerm)
      );
      setFilteredInvestors(filtered);
    }
  }, [searchTerm, investors]);

  const handleSelectInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
  };

  const handleSearch = () => {

  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleProceed = () => {
    if (selectedInvestor) {
      onInvestorSelect(selectedInvestor);
      onClose();
      setSelectedInvestor(null);
      setSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.headerGradient} px-6 py-4 flex items-center justify-between`}>
          <div>
            <h2 className="text-xl font-bold text-white">Select Investor for Investment</h2>
            <p className="text-white/80 text-sm mt-1">
              Choose an investor for <span className="font-semibold text-white">{categoryName}</span> category
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Section */}
        <div className={`${colors.searchBg} px-6 py-4 border-b border-slate-200`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search investors by name, PAN, email, or mobile..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600">
                Total: <span className="font-semibold text-slate-800">{filteredInvestors.length} investors</span>
              </span>
              <span className="text-slate-600">
                Selected: <span className="font-semibold text-green-600">
                  {selectedInvestor ? '1 investor' : 'None'}
                </span>
              </span>
              {searchTerm && (
                <span className="text-slate-500">
                  Searching for: "{searchTerm}"
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Click on investor to select
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading investors...</span>
            </div>
          ) : (
            <>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">

                <div className="bg-slate-50 grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-200">
                  <div className="col-span-3">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Investor Details</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Contact Info</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Personal Info</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Address</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</span>
                  </div>
                </div>


                <div className="divide-y divide-slate-100">
                  {filteredInvestors.map((investor) => (
                    <div
                      key={investor.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 transition-all duration-200 cursor-pointer ${selectedInvestor?.id === investor.id
                        ? `${colors.selectedBg} border-l-4 ${colors.selectedBorder}`
                        : 'hover:bg-slate-50'
                        }`}
                      onClick={() => handleSelectInvestor(investor)}
                    >

                      <div className="col-span-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedInvestor?.id === investor.id
                            ? colors.selectedIcon
                            : 'bg-slate-100 text-slate-600'
                            }`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{investor.inv_name}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              PAN: <span className="font-mono text-slate-800">{investor.pan_no}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Father: {investor.fathers_name}
                            </div>
                          </div>
                        </div>
                      </div>


                      <div className="col-span-2">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-slate-500">Mobile:</span>
                            <div className="font-medium text-slate-800">{investor.reg_mobile}</div>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-500">Email:</span>
                            <div className="font-medium text-slate-800 truncate">{investor.reg_email}</div>
                          </div>
                        </div>
                      </div>


                      <div className="col-span-2">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-slate-500">Relationship:</span>
                            <div className="font-medium text-slate-800">{investor.father_relation}</div>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-500">Partner:</span>
                            <div className="font-medium text-slate-800">{investor.partner_name}</div>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-500">DOB:</span>
                            <div className="font-medium text-slate-800">{investor.dob}</div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="text-xs text-slate-700 leading-relaxed">
                          {investor.address}
                        </div>
                      </div>


                      <div className="col-span-2 flex items-center justify-center">
                        {selectedInvestor?.id === investor.id ? (
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Selected
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 px-3 py-1">
                            Click to select
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>


                {filteredInvestors.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      {searchTerm ? 'No Investors Found' : 'No Investors Available'}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      {searchTerm
                        ? `No investors found matching "${searchTerm}". Try a different search term.`
                        : 'No investors are currently available for this category. Please add investors to proceed with investments.'
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={handleClear}
                        className="mt-3 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>


              {selectedInvestor && (
                <div className={`mt-4 p-4 bg-gradient-to-r ${colors.summaryGradient} rounded-lg border ${colors.summaryBorder}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.summaryIcon} rounded-full flex items-center justify-center`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{selectedInvestor.inv_name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedInvestor.pan_no} • {selectedInvestor.reg_mobile}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Ready for</div>
                      <div className="font-semibold text-slate-800">{categoryName} Investment</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-slate-600">
            {selectedInvestor ? (
              <span>
                Selected: <span className="font-semibold text-slate-800">{selectedInvestor.inv_name}</span>
              </span>
            ) : (
              <span>No investor selected</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!selectedInvestor || loading}
              className={`px-8 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${selectedInvestor && !loading
                ? `bg-gradient-to-r ${colors.buttonGradient} text-white shadow-sm hover:shadow-md`
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Proceed to Investment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BCDashboard = () => {
  const router = useRouter();

  
  
  // Use the BC onboarding alert hook
  const { showAlert, isChecking, handleContinueOnboarding, handleCloseAlert } = useOnboardingAlert();
  

  const handleRegister = async (userType: string) => {
    if (!sessionStorage.getItem(USER_DATA)) {
      removeCookieToken();
      removeCookieData(cookieStorageKeys.INIT_PATH);
    }

    removeLS(PROD_DATA);
    removeLS(TOKEN_PREFIX);
    removeLS(MENU_PREFIX);
    removeLS(FLAT_MENU);
    removeLS(USER_DATA);
    removeLS(ADMIN_INVESTER_DATA);


    router.push(`/register?userType=${userType}`);
  };
  

  const [bcDetails, setBcDetails] = useState({
    name: "",
    email: "",
    pan: ""
  });

  const [overview, setOverview] = useState({
    totalClients: "0",
    totalInvestment: "₹0",
    totalCurrentValue: "₹0",
    totalTransactionValue: "₹0",
    profitLoss: "₹0",
    totalAUM: "₹0"
  });

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [topPerformingFunds, setTopPerformingFunds] = useState<TopPerformingFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [topFundsLoading, setTopFundsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; schemes: Scheme[] } | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [clients, setClients] = useState<Investor[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const prodUserData = getLS(USER_DATA);


  const getUserApiParams = () => {
    const userTypeId = prodUserData?.userTypeId?.toString() || '';
    const userId = prodUserData?.id?.toString() || '0';
    const regId = prodUserData?.regId?.toString() || '0';

    let loginId = '0';
    let rmParam = '0';

    console.log('User Data:', {
      userTypeId,
      userId,
      regId,
      BC: prodUserData?.BC,
      partner: prodUserData?.partner,
      RM: prodUserData?.RM
    });


    switch (userTypeId) {
      case '6': 
        loginId = prodUserData?.BC?.ref_id?.toString() ||
          prodUserData?.ref_id?.toString() ||
          regId ||
          userId ||
          '0';
        rmParam = '0';
        console.log('BC User - Using ref_id:', loginId);
        break;

      case '4':
      case '5':
        loginId = prodUserData?.partner?.regId?.toString() ||
          regId ||
          userId ||
          '0';
        rmParam = '0';
        console.log('Partner User - Using regId:', loginId);
        break;

      case '2':
      case '3':
        loginId = prodUserData?.RM?.id?.toString() ||
          regId ||
          userId ||
          '0';
        rmParam = '0';
        console.log('RM User - Using RM id:', loginId);
        break;

      case '1':
        loginId = '0';
        rmParam = '0';
        console.log('Admin User');
        break;

      default: 
        loginId = regId || userId || '0';
        rmParam = '0';
        console.log('Default User - Using:', loginId);
    }

    return { loginId, rmParam, userTypeId };
  };

  const { loginId, rmParam, userTypeId } = getUserApiParams();

  const bcId = prodUserData?.BC?.ref_id;

 
  const [animatedNumbers, setAnimatedNumbers] = useState({
    clients: 0,
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalTransactionValue: 0,
    profitLoss: 0,
    totalAUM: 0
  });


  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

 
  useEffect(() => {
    const getUserData = () => {
      try {
        const storedUserData = getLS(USER_DATA);
        console.log('User data from localStorage:', storedUserData);

        if (storedUserData) {
          setUserData(storedUserData);
        } else {
          console.error('No user data found in localStorage');
          setError('User authentication data not found. Please login again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error reading user data:', err);
        setError('Failed to load user data. Please login again.');
        setLoading(false);
      }
    };

    getUserData();
  }, []);


  useEffect(() => {
    const fetchBCData = async () => {
      if (!bcId) {
        console.log('BC ID not available yet, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for BC ID:', bcId);

        const response = await api.get(`${ApiUrl}/partner/bcCount/${bcId}`);
        console.log('API Response:', response.data);

        const data: ApiResponse = response.data;

        if (data.data && data.data.data && data.data.data.length > 0) {
          const bcData = data.data.data[0];
          console.log('BC Data received:', bcData);

          setBcDetails({
            name: bcData.name || "Not Available",
            email: bcData.email || "Not Available",
            pan: bcData.pan || "Not Available"
          });

        
          const clients = parseInt(bcData.total_investor) || 0;
          const totalInvestmentValue = parseFloat(bcData.total_investment) || 0;
          const totalCurrentValue = bcData.total_current_value || 0;
          const totalTransactionValue = bcData.total_transaction || 0;
          const profitLossValue = bcData.profit_loss || 0;
          const totalAUMValue = bcData.total_aum || 0;

          animateNumber('clients', clients);
          animateNumber('totalInvestment', totalInvestmentValue);
          animateNumber('totalCurrentValue', totalCurrentValue);
          animateNumber('totalTransactionValue', totalTransactionValue);
          animateNumber('profitLoss', profitLossValue);
          animateNumber('totalAUM', totalAUMValue);

          setOverview({
            totalClients: bcData.total_investor || "0",
            totalInvestment: `₹${totalInvestmentValue.toLocaleString('en-IN')}`,
            totalCurrentValue: `₹${totalCurrentValue.toLocaleString('en-IN')}`,
            totalTransactionValue: `₹${totalTransactionValue.toLocaleString('en-IN')}`,
            profitLoss: `₹${profitLossValue.toLocaleString('en-IN')}`,
            totalAUM: `₹${totalAUMValue.toLocaleString('en-IN')}`
          });
        } else {
          console.warn('No BC data found in response');
          setError('No business correspondent data found');
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching BC data:', err);

        if (err.response) {
          console.error('Response error:', err.response.data);
          setError(`Server error: ${err.response.status} - ${err.response.data?.msg || 'Unknown error'}`);
        } else if (err.request) {
          console.error('Request error:', err.request);
          setError('Network error: Unable to connect to server');
        } else {
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBCData();
  }, [bcId]);


  const animateNumber = (type: 'clients' | 'totalInvestment' | 'totalCurrentValue' | 'totalTransactionValue' | 'profitLoss' | 'totalAUM', target: number) => {
    const duration = 1500;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setAnimatedNumbers(prev => ({
        ...prev,
        [type]: Math.floor(current)
      }));
    }, duration / steps);
  };


  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setSchemesLoading(true);
        console.log('Fetching schemes data...');

        const response = await api.get(`${ApiUrl}/scheme-configuration/getBcSchemes`);
        console.log('Schemes API Response:', response.data);

        const data: SchemesResponse = response.data;

        if (data.data && data.data.length > 0) {
          setSchemes(data.data);
        } else {
          console.warn('No schemes data found in response');
        }
      } catch (err: any) {
        console.error('Error fetching schemes data:', err);

        if (err.response) {
          console.error('Schemes response error:', err.response.data);
        } else if (err.request) {
          console.error('Schemes request error:', err.request);
        }
      } finally {
        setSchemesLoading(false);
      }
    };

    fetchSchemes();
  }, []);


  useEffect(() => {
    const fetchTopPerformingFunds = async () => {
      try {
        setTopFundsLoading(true);
        console.log('Fetching top performing funds...');

        const response = await api.get(`${ApiUrl}/mutual-fund/get-top-performing-funds`);
        console.log('Top Performing Funds API Response:', response.data);

        const data: TopPerformingFundsResponse = response.data;

        if (data.data && data.data.length > 0) {
          setTopPerformingFunds(data.data);
        } else {
          console.warn('No top performing funds data found in response');
        }
      } catch (err: any) {
        console.error('Error fetching top performing funds:', err);

        if (err.response) {
          console.error('Top funds response error:', err.response.data);
        } else if (err.request) {
          console.error('Top funds request error:', err.request);
        }
      } finally {
        setTopFundsLoading(false);
      }
    };

    fetchTopPerformingFunds();
  }, []);


  const fetchClients = async (): Promise<Investor[]> => {
    try {
      setClientsLoading(true);
      setClientsError(null);

      console.log('Fetching clients with parameters:', {
        loginId,
        rmParam,
        userTypeId,
        apiUrl: `${ApiUrl}/partner/portfolioDetails/${loginId}/${rmParam}/${userTypeId}`
      });

      const response = await api.get(`${ApiUrl}/partner/portfolioDetails/${loginId}/${rmParam}/${userTypeId}`);
      console.log('Clients API Response:', response.data);

      const apiData = response.data.data.data;

    
      const formattedClients: Investor[] = apiData.map((item: any, index: number) => ({
        id: `client-${index}-${Date.now()}`,
        inv_name: item.inv_name || 'N/A',
        fathers_name: item.fathers_name || 'N/A',
        father_relation: item.father_relation || 'N/A',
        dob: item.dob || 'N/A',
        pan_no: item.pan_no || 'N/A',
        reg_email: item.reg_email || 'N/A',
        reg_mobile: item.reg_mobile || 'N/A',
        created_at: item.created_at || 'N/A',
        address: item.address || 'N/A',
        aum: item.aum || '0',
        rm_name: item.rm_name || 'N/A',
        partner_name: item.partner_name || 'N/A',
        name: item.inv_name || 'N/A',
        mobile: item.reg_mobile || 'N/A',
        email: item.reg_email || 'N/A',
        dateOfBirth: item.dob || 'N/A',
        relationship: item.father_relation || 'N/A',
        partner: item.partner_name || 'N/A'
      }));

      setClients(formattedClients);
      console.log('Formatted clients:', formattedClients.length);
      return formattedClients;
    } catch (err) {
      const errorMessage = 'Failed to fetch client data';
      setClientsError(errorMessage);
      console.error('Error fetching clients:', err);
      throw new Error(errorMessage);
    } finally {
      setClientsLoading(false);
    }
  };


  const formatAUM = (aum: number): string => {
    if (aum >= 10000000) { // 10 Crore+
      return `₹${(aum / 10000000).toFixed(1)} Cr`;
    } else if (aum >= 100000) { // 1 Lakh+
      return `₹${(aum / 100000).toFixed(1)} L`;
    } else {
      return `₹${aum.toLocaleString('en-IN')}`;
    }
  };




  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low risk':
        return 'bg-green-100 text-green-800';
      case 'moderately low risk':
        return 'bg-blue-100 text-blue-800';
      case 'moderate risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderately high risk':
        return 'bg-orange-100 text-orange-800';
      case 'high risk':
        return 'bg-red-100 text-red-800';
      case 'very high risk':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

 
  const getSimplifiedRisk = (riskLevel: string): string => {
    if (riskLevel?.includes('Very High')) return 'Very High';
    if (riskLevel?.includes('High')) return 'High';
    if (riskLevel?.includes('Moderate')) return 'Medium';
    if (riskLevel?.includes('Low')) return 'Low';
    return riskLevel || 'Not Rated';
  };

  const groupedSchemes = schemes.reduce((acc, scheme) => {
    const colorKey = scheme.color_name;
    if (!acc[colorKey]) {
      acc[colorKey] = [];
    }
    acc[colorKey].push(scheme);
    return acc;
  }, {} as Record<string, Scheme[]>);


  const getColorConfig = (colorName: string) => {
    const configs = {
      Red: {
        bgColor: 'bg-gradient-to-br from-white to-red-50',
        borderColor: 'border-red-200',
        headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
        textColor: 'text-red-700',
        availableBg: 'bg-red-100',
        availableText: 'text-red-800',
        headerText: 'text-white',
        percentageText: 'text-red-600',
        buttonBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        riskBg: 'bg-red-100',
        riskText: 'text-red-800',
        investButtonBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        glow: 'hover:shadow-lg hover:shadow-red-200/50'
      },
      Yellow: {
        bgColor: 'bg-gradient-to-br from-white to-amber-50',
        borderColor: 'border-yellow-200',
        headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
        textColor: 'text-yellow-700',
        availableBg: 'bg-yellow-100',
        availableText: 'text-yellow-800',
        headerText: 'text-white',
        percentageText: 'text-yellow-600',
        buttonBg: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
        riskBg: 'bg-yellow-100',
        riskText: 'text-yellow-800',
        investButtonBg: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
        glow: 'hover:shadow-lg hover:shadow-yellow-200/50'
      },
      Green: {
        bgColor: 'bg-gradient-to-br from-white to-emerald-50',
        borderColor: 'border-green-200',
        headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
        textColor: 'text-green-700',
        availableBg: 'bg-green-100',
        availableText: 'text-green-800',
        headerText: 'text-white',
        percentageText: 'text-green-600',
        buttonBg: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
        riskBg: 'bg-green-100',
        riskText: 'text-green-800',
        investButtonBg: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-amber-700',
        glow: 'hover:shadow-lg hover:shadow-green-200/50'
      }
    };

    return configs[colorName as keyof typeof configs] || configs.Red;
  };


  const handleCategoryInvestNow = async (colorName: string, schemes: Scheme[]) => {
    console.log('Opening investor selection for category:', colorName, schemes);
    setSelectedCategory({ name: colorName, schemes });

    try {
      const realClients = await fetchClients();
      console.log('Fetched clients:', realClients.length);
      setInvestors(realClients);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching clients for modal:', error);
    }
  };

  const handleInvestorSelect = (investor: Investor) => {
    console.log('Selected investor:', investor);
    console.log('For category:', selectedCategory);
    if (selectedCategory) {
      sessionStorage.setItem('selectedClient', JSON.stringify({
        name: investor.inv_name,
        pan: investor.pan_no,
        id: investor.id,
        bcId: loginId
      }));

      router.push(`/mutual-fund?category=${selectedCategory.name.toLowerCase()}&investorId=${investor.id}`);
    }
  };

  

  // Quick Actions
  const quickActions = [
    {
      icon: Users,
      label: "Investors",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      onClick: () => router.push('/investor-list')
    },
    {
      icon: UserPlus,
      label: "Add Investors",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
         onClick: () => handleRegister('Investor')
    },
    {
      icon: Search,
      label: "Fund Finder",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      onClick: () => router.push('/mutual-fund')
    },
    {
      icon: PieChart,
      label: "Portfolio Tracker",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      onClick: () => router.push('/portfolio')
    },
    {
      icon: Calculator,
      label: "Calculator",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      onClick: () => router.push('/sip-calculator')
    },
    {
      icon: FileText,
      label: "Clients Reports",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      onClick: () => router.push('/search-report')
    },
    {
      icon: Target,
      label: "Investment Goal",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      onClick: () => router.push('/goal-list')
    }
  ];


  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (!bcId || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {!bcId ? 'Loading user data...' : 'Loading dashboard data...'}
          </p>
          {bcId && (
            <p className="text-sm text-gray-500 mt-2">Fetching data for BC ID: {bcId}</p>
          )}
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Retry
            </button>
            {error.includes('login') && (
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4">
       {showAlert && (
        <OnboardingAlertPopup
          onClose={handleCloseAlert}
          onContinue={handleContinueOnboarding}
          isLoading={isChecking}
        />
      )}
       {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
     
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome !</h1>

            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">{bcDetails.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">PAN: {bcDetails.pan}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{bcDetails.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Overview</h2>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:border-blue-200 transition-all duration-200 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 animate-count">
                  {animatedNumbers.clients.toLocaleString('en-IN')}
                </h3>
              </div>
              <p className="text-blue-700 text-sm font-medium">Total Clients</p>
            </div>

            {/* AUM */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 hover:border-purple-200 transition-all duration-200 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 animate-count">
                  {formatNumber(animatedNumbers.totalCurrentValue)}
                </h3>
              </div>
              <p className="text-purple-700 text-sm font-medium">Total AUM</p>
            </div>

            {/* Transaction */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 hover:border-orange-200 transition-all duration-200 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 animate-count">
                  {formatNumber(animatedNumbers.totalTransactionValue)}
                </h3>
              </div>
              <p className="text-orange-700 text-sm font-medium">Total Transaction</p>
            </div>
          </div>
        </div>

        {/* Recommended Mutual Fund Schemes - Show All Schemes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative">

          <div className="absolute -top-4 -right-4 z-10 animate-bounce hover:animate-pulse cursor-pointer">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white">
                <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center relative">
                  <div className="flex items-end gap-1">
                    <div className="w-1 h-2 bg-green-500 animate-pulse"></div>
                    <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>

                  <div className="absolute bottom-2 w-6 h-1 bg-red-500 rounded-full"></div>

                  <div className="absolute -top-3 w-1 h-3 bg-blue-500">
                    <div className="text-xs -mt-3">₹</div>
                  </div>
                </div>
              </div>


              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 animate-ping">
                <div className="text-xl">📈</div>
              </div>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-purple-300 rounded-lg px-2 py-1 shadow-lg">
                <div className="text-xs font-bold text-purple-600 whitespace-nowrap">
                  Invest Now! 🚀
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-white border-b-2 border-r-2 border-purple-300 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended Mutual Fund Plans</h2>
                <p className="text-gray-600 text-sm mt-1">Top investment opportunities for your clients</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/mutual-fund')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Do It Yourself
            </button>
          </div>

          {schemesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-sm">Loading investment opportunities...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(groupedSchemes).map(([colorName, colorSchemes]) => {
                const colorConfig = getColorConfig(colorName);
                const firstScheme = colorSchemes[0];

                return (
                  <div
                    key={colorName}
                    className={`${colorConfig.bgColor} rounded-lg border ${colorConfig.borderColor} overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-[420px]`}
                  >

                    <div className={`${colorConfig.headerBg} px-4 py-3 flex-shrink-0`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`text-sm font-bold ${colorConfig.headerText}`}>
                          {firstScheme.color_description}
                        </h3>
                        <Award className="w-4 h-4 text-white/80" />
                      </div>
                    </div>


                    <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {colorSchemes.map((scheme, index) => (
                        <div
                          key={scheme.scheme_id}
                          className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-all duration-150 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm leading-tight flex-1 pr-2" title={scheme.scheme_name}>
                              {scheme.scheme_name}
                            </h4>
                            <span className={`font-bold text-sm ${colorConfig.percentageText} whitespace-nowrap`}>
                              {scheme.percentage}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorConfig.riskBg} ${colorConfig.riskText}`}>
                              {scheme.risk_level}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {scheme.scheme_isin.slice(-6)}...
                            </span>
                          </div>

                          <div className="text-xs text-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Fund House:</span>
                              <span className="font-medium text-right max-w-[120px] truncate" title={scheme.fund_name}>
                                {scheme.fund_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>


                    <div className="p-4 border-t border-gray-200 bg-white/50 flex-shrink-0">
                      <button
                        onClick={() => handleCategoryInvestNow(colorName, colorSchemes)}
                        disabled={clientsLoading}
                        className={`w-full ${colorConfig.investButtonBg} text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {clientsLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            Invest Now
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


          {!schemesLoading && schemes.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No mutual fund schemes available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 transition-all duration-200 hover:shadow-sm flex flex-col items-center gap-2"
              >
                <div className={`${action.bgColor} p-2 rounded-lg transition-all duration-200 group-hover:scale-110`}>
                  <action.icon className={`w-4 h-4 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Performing Funds - Horizontal Layout */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top Performing Funds</h2>
                <p className="text-gray-600 text-sm mt-1">Best performing mutual funds</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Live
            </div>
          </div>

          {topFundsLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600 text-sm">Loading top funds...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4 min-w-max">
                {topPerformingFunds.slice(0, 6).map((fund) => {
                  const trend = fund.Return1yr >= 0 ? 'up' : 'down';
                  const simplifiedRisk = getSimplifiedRisk(fund.SchemeMaster.riskLevel);

                  return (
                    <div
                      key={fund.id}
                      className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-all duration-200 min-w-[280px] flex-shrink-0 shadow-sm hover:shadow-md"
                    >

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight line-clamp-2" title={fund.SchemeMaster.name}>
                            {fund.SchemeMaster.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(fund.SchemeMaster.riskLevel)}`}>
                              {simplifiedRisk}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {fund.SchemeMaster.SchemeSubcategory?.Name || 'Others'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">1 Year Return</div>
                          <div className="flex items-center gap-1">
                            {trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-lg font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {fund.Return1yr.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">AUM</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {formatAUM(fund.AUM)}
                          </div>
                        </div>
                      </div>


                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">1M</div>
                          <div className={`text-xs font-semibold ${fund.Return1mth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.Return1mth.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">3M</div>
                          <div className={`text-xs font-semibold ${fund.Return3mth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.Return3mth.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">6M</div>
                          <div className={`text-xs font-semibold ${fund.Return6mth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.Return6mth.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">YTD</div>
                          <div className={`text-xs font-semibold ${fund.ReturnYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.ReturnYTD.toFixed(1)}%
                          </div>
                        </div>
                      </div>


                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!topFundsLoading && topPerformingFunds.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">No top performing funds</p>
              <p className="text-gray-400 text-xs mt-1">Data will appear here soon</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/mutual-fund')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Explore All Funds
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      <InvestorSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
          setClientsError(null);
        }}
        investors={investors}
        onInvestorSelect={handleInvestorSelect}
        categoryName={selectedCategory?.name || ''}
        loading={clientsLoading}
      />


      {clientsError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{clientsError}</span>
            <button
              onClick={() => setClientsError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-count {
          animation: countUp 0.6s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BCDashboard;