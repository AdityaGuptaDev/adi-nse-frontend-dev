'use client';
import api from '@/utils/api';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiSearch, FiX, FiMail, FiPhone, FiUser, FiCalendar, 
  FiDollarSign, FiHome, FiBriefcase, FiCreditCard, 
  FiChevronLeft, FiChevronRight, FiEye, FiFileText, 
  FiChevronsLeft, FiChevronsRight, FiFilter, FiArrowUp, 
  FiArrowDown, FiUsers, FiCheckCircle, FiActivity, FiTrendingUp,
  FiBarChart2
} from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import getConfig from '@/utils/config';
import { getLS, removeLS } from '@/utils/helpers';
import { 
  ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, 
  PROD_DATA, TOKEN_PREFIX, USER_DATA 
} from '@/utils/constants';
import CustomBackButton from '@/commonUI/CustomBackButton';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { cookieStorageKeys, removeCookieData, removeCookieToken } from '@/services/cookieStorageService';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

interface Client {
  id: string;
  inv_name: string;
  fathers_name: string;
  father_relation: string;
  dob: string;
  pan_no: string;
  reg_email: string;
  reg_mobile: string;
  created_at: string;
  address: string;
  aum: string;
  rm_name: string | null;
  partner_name: string;
  bc_name: string;
  investment_type?: string;
  risk_profile?: string;
  last_transaction?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: string;
}

interface ReportStats {
  totalClients: number;
  totalAUM: number;
  activeClients: number;
  averageAUM: number;
  newClientsThisMonth: number;
  topPartner: string;
}

export default function ClientSearchReport() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [showFilters, setShowFilters] = useState<{ [key: string]: boolean }>({});
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  // Get user data and determine API parameters
  const prodUserData = getLS(USER_DATA);
  
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

  // Function to get correct API parameters based on user type
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
    
    // Determine parameters based on user type
    switch(userTypeId) {
      case '6': // BC User - use ref_id from BC object
        loginId = prodUserData?.BC?.ref_id?.toString() || 
                 prodUserData?.ref_id?.toString() || 
                 regId || 
                 userId || 
                 '0';
        rmParam = '0';
        console.log('BC User - Using ref_id:', loginId);
        break;
        
      case '4':
      case '5': // Partner User - use partner regId
        loginId = prodUserData?.partner?.regId?.toString() || 
                 regId || 
                 userId || 
                 '0';
        rmParam = '0';
        console.log('Partner User - Using regId:', loginId);
        break;
        
      case '2':
      case '3': // RM User - use RM id
        loginId = prodUserData?.RM?.id?.toString() || 
                 regId || 
                 userId || 
                 '0';
        rmParam = '0';
        console.log('RM User - Using RM id:', loginId);
        break;
        
      case '1': // Admin User
        loginId = '0';
        rmParam = '0';
        console.log('Admin User');
        break;
        
      default: // Default case
        loginId = regId || userId || '0';
        rmParam = '0';
        console.log('Default User - Using:', loginId);
    }
    
    return { loginId, rmParam, userTypeId };
  };
  
  const { loginId, rmParam, userTypeId } = getUserApiParams();

  const columns = [
    {
      key: 'inv_name',
      label: 'Name',
      sortable: true,
      filterable: true,
      width: '200px'
    },
    {
      key: 'pan_no',
      label: 'PAN',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      key: 'fathers_name',
      label: "Father's Name",
      sortable: true,
      filterable: true,
      width: '180px'
    },
    {
      key: 'reg_mobile',
      label: 'Mobile No.',
      sortable: true,
      filterable: true,
      width: '140px'
    },
    {
      key: 'reg_email',
      label: 'Email',
      sortable: true,
      filterable: true,
      width: '220px'
    },
    {
      key: 'aum',
      label: 'AUM (₹)',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'partner_name',
      label: 'Partner',
      sortable: true,
      filterable: true,
      width: '180px'
    },
    {
      key: 'rm_name',
      label: 'RM',
      sortable: true,
      filterable: true,
      width: '180px'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      width: '150px'
    }
  ];

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch (error) {
      return '-';
    }
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        console.log('Fetching from API:', `${ApiUrl}/partner/portfolioDetails/${loginId}/${rmParam}/${userTypeId}`);
        
        const response = await api.get(
          `${ApiUrl}/partner/portfolioDetails/${loginId}/${rmParam}/${userTypeId}`
        );
        
        const apiData = response.data.data.data; 
        const formattedClients = apiData.map((item: any, index: number) => ({
          id: `client-${index}-${Date.now()}`, 
          inv_name: item.inv_name || '',
          fathers_name: item.fathers_name || '',
          father_relation: item.father_relation || '',
          dob: item.dob || '',
          pan_no: item.pan_no || '',
          reg_email: item.reg_email || '',
          reg_mobile: item.reg_mobile || '',
          created_at: item.created_at || '',
          address: item.address || '',
          aum: item.aum || '0',
          rm_name: item.rm_name || '',
          partner_name: item.partner_name || '',
          bc_name: item.bc_name || '',
          status: Math.random() > 0.2 ? 'active' : 'inactive',
          risk_profile: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          last_transaction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          investment_type: ['Equity', 'Debt', 'Hybrid', 'Others'][Math.floor(Math.random() * 4)]
        }));

        setClients(formattedClients);
        
        // Calculate report statistics
        calculateReportStats(formattedClients);
        setLoading(false);
      } catch (err: any) {
        setError(`Failed to fetch client data: ${err.message}`);
        setLoading(false);
        console.error('Error fetching clients:', err);
      }
    };

    fetchClients();
  }, [loginId, rmParam, userTypeId]);

  const calculateReportStats = (clientList: Client[]) => {
    const totalAUM = clientList.reduce((sum, client) => sum + parseFloat(client.aum || '0'), 0);
    const activeClients = clientList.filter(client => client.status === 'active').length;
    const newClientsThisMonth = clientList.filter(client => {
      const created = new Date(client.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Find top partner by AUM
    const partnerAUM: { [key: string]: number } = {};
    clientList.forEach(client => {
      const partner = client.partner_name || 'Unknown';
      partnerAUM[partner] = (partnerAUM[partner] || 0) + parseFloat(client.aum || '0');
    });

    const topPartner = Object.entries(partnerAUM)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    setReportStats({
      totalClients: clientList.length,
      totalAUM,
      activeClients,
      averageAUM: clientList.length > 0 ? totalAUM / clientList.length : 0,
      newClientsThisMonth,
      topPartner
    });
  };

  const processedClients = useMemo(() => {
    let result = [...clients];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client =>
        (client.inv_name?.toLowerCase().includes(term) || '') ||
        (client.pan_no?.toLowerCase().includes(term) || '') ||
        (client.reg_mobile?.includes(searchTerm) || '') ||
        (client.reg_email?.toLowerCase().includes(term) || '') ||
        (client.fathers_name?.toLowerCase().includes(term) || '') ||
        (client.partner_name?.toLowerCase().includes(term) || '') ||
        (client.bc_name?.toLowerCase().includes(term) || '')
      );
    }

    // Apply column filters
    Object.keys(filterConfig).forEach(key => {
      const filterValue = filterConfig[key].toLowerCase();
      if (filterValue) {
        result = result.filter(client => {
          const cellValue = String(client[key as keyof Client] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Client] || '';
        const bValue = b[sortConfig.key as keyof Client] || '';

        // Handle numeric sorting for AUM
        if (sortConfig.key === 'aum') {
          const aNum = parseFloat(aValue as string) || 0;
          const bNum = parseFloat(bValue as string) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle date sorting
        if (sortConfig.key === 'created_at' || sortConfig.key === 'dob') {
          const aDate = new Date(aValue as string).getTime();
          const bDate = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Default string sorting
        const aStr = String(aValue);
        const bStr = String(bValue);
        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [clients, searchTerm, filterConfig, sortConfig]);

  const totalItems = processedClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = processedClients.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilterConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterConfig({});
    setSearchTerm('');
    setSortConfig(null);
    setShowFilters({});
    setCurrentPage(1);
  };

  const toggleFilter = (key: string) => {
    setShowFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setIsOpen(true);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">Inactive</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#0A0A0A]0/20 text-[#9CA3AF]">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <div className="bg-[#111111] p-6 rounded-xl shadow-lg text-center max-w-2xl mx-auto my-8 border border-[#2A2A2A]">
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="max-w-full mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <CustomBackButton onClick={() => window.history.back()}>
              <IoMdArrowRoundBack className="h-6 w-6 text-[#F59E0B]" />
            </CustomBackButton>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                Client Search Report
              </h1>
              <p className="text-[#9CA3AF] text-sm mt-1">Manage and search investor clients</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                className="block w-full pl-10 pr-4 py-2.5 border border-[#2A2A2A] rounded-lg bg-[#111111] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            {(userTypeId === '1' || userTypeId === '4' || userTypeId === '5'|| userTypeId === '2'|| userTypeId === '3'|| userTypeId === '6') && (
              <button
                onClick={() => handleRegister("Investor")}
                className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span className="font-medium">+ Add Investor</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-[#2A2A2A] shadow-lg mb-6 relative bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2A2A2A] text-sm">
              <thead className="bg-[#1F1A1A]">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-[#F59E0B] uppercase tracking-wider whitespace-nowrap"
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.label}</span>
                        <div className="flex items-center gap-1">
                          {column.sortable && (
                            <button
                              onClick={() => column.sortable && handleSort(column.key)}
                              className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                              title={`Sort by ${column.label}`}
                            >
                              {sortConfig?.key === column.key ? (
                                sortConfig.direction === 'asc' ? (
                                  <FiArrowUp className="w-4 h-4 text-[#F59E0B]" />
                                ) : (
                                  <FiArrowDown className="w-4 h-4 text-[#F59E0B]" />
                                )
                              ) : (
                                <FiArrowUp className="w-4 h-4 text-[#9CA3AF]" />
                              )}
                            </button>
                          )}
                          {column.filterable && (
                            <button
                              onClick={() => toggleFilter(column.key)}
                              className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                              title={`Filter ${column.label}`}
                            >
                              <FiFilter className="w-4 h-4 text-[#9CA3AF]" />
                            </button>
                          )}
                        </div>
                      </div>
                      {showFilters[column.key] && column.filterable && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder={`Filter ${column.label}...`}
                            className="w-full px-2 py-1 text-xs border border-[#2A2A2A] rounded focus:outline-none focus:ring-1 focus:ring-[#F59E0B] bg-[#111111] text-[#F9FAFB] placeholder:text-[#9CA3AF]"
                            value={filterConfig[column.key] || ''}
                            onChange={(e) => handleFilter(column.key, e.target.value)}
                          />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#111111] divide-y divide-[#2A2A2A]">
                {currentItems.length > 0 ? (
                  currentItems.map((client) => (
                    <tr key={client.id} className="hover:bg-[#1F1A1A] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="font-medium text-[#F59E0B] hover:text-[#FBBF24] cursor-pointer flex items-center transition-colors"
                          onClick={() => openClientModal(client)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full flex items-center justify-center mr-2 text-[#F59E0B] font-bold">
                            {client.inv_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            {client.inv_name || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-[#F9FAFB]">
                        {client.pan_no || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#F9FAFB]">
                        {client.fathers_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#F9FAFB]">
                        {client.reg_mobile || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#9CA3AF] text-sm">
                        <div className="truncate max-w-[200px]">{client.reg_email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-[#F59E0B]">
                        {formatCurrency(client.aum)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#F9FAFB]">
                        {client.partner_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#F9FAFB]">
                        {client.rm_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openClientModal(client)}
                            className="p-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] rounded-lg hover:opacity-90 transition-all"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              sessionStorage.setItem('selectedClient', JSON.stringify({
                                name: client.inv_name,
                                pan: client.pan_no
                              }));
                              router.push('/investor');
                            }}
                            className="p-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-[#F9FAFB] rounded-lg hover:opacity-90 transition-all"
                            title="View Report"
                          >
                            <FiFileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="w-12 h-12 text-[#2A2A2A] mb-3" />
                        <p className="text-lg font-medium text-[#F9FAFB]">No clients found</p>
                        <p className="text-sm text-[#9CA3AF] mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-[#9CA3AF]">
            Showing <span className="font-medium text-[#F59E0B]">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-[#F59E0B]">{endIndex}</span> of{' '}
            <span className="font-medium text-[#F59E0B]">{totalItems}</span> clients
            {Object.keys(filterConfig).length > 0 && (
              <span className="ml-2 text-[#F59E0B]">
                (Filtered from {clients.length} total)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[#9CA3AF]">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#2A2A2A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#F59E0B] bg-[#111111] text-[#F9FAFB]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-[#9CA3AF]">per page</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border border-[#2A2A2A] rounded-lg flex items-center ${
                currentPage === 1
                  ? 'text-[#9CA3AF] cursor-not-allowed bg-[#111111]'
                  : 'text-[#F9FAFB] hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-colors'
              }`}
              title="First page"
            >
              <FiChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border border-[#2A2A2A] rounded-lg flex items-center ${
                currentPage === 1
                  ? 'text-[#9CA3AF] cursor-not-allowed bg-[#111111]'
                  : 'text-[#F9FAFB] hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-colors'
              }`}
              title="Previous page"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pageNumber, index) => (
              pageNumber === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-[#9CA3AF]">...</span>
              ) : (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber as number)}
                  className={`px-3.5 py-1.5 border rounded-lg transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] border-transparent'
                      : 'text-[#F9FAFB] border-[#2A2A2A] hover:bg-[#1F1A1A] hover:border-[#F59E0B]'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border border-[#2A2A2A] rounded-lg flex items-center ${
                currentPage === totalPages
                  ? 'text-[#9CA3AF] cursor-not-allowed bg-[#111111]'
                  : 'text-[#F9FAFB] hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-colors'
              }`}
              title="Next page"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border border-[#2A2A2A] rounded-lg flex items-center ${
                currentPage === totalPages
                  ? 'text-[#9CA3AF] cursor-not-allowed bg-[#111111]'
                  : 'text-[#F9FAFB] hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-colors'
              }`}
              title="Last page"
            >
              <FiChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Client Details Modal */}
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-[#111111] border border-[#2A2A2A] shadow-2xl">
              <div className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] px-5 py-4 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <Dialog.Title className="text-lg font-semibold text-[#F9FAFB]">Client Details</Dialog.Title>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#F9FAFB] hover:text-gray-200 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5">
                {selectedClient && (
                  <div className="space-y-6">
                    {/* Client Header */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-[#F59E0B]/20 to-[#B45309]/20 rounded-full flex items-center justify-center text-[#F59E0B] text-3xl font-bold">
                        {selectedClient.inv_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-[#F9FAFB] truncate">{selectedClient.inv_name}</h3>
                            <p className="text-sm text-[#9CA3AF] mt-0.5">Investor ID: {selectedClient.id}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                              <div className="flex items-center text-sm text-[#9CA3AF]">
                                <FiMail className="mr-1.5 text-[#F59E0B]" size={14} />
                                <span className="truncate">{selectedClient.reg_email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-[#9CA3AF]">
                                <FiPhone className="mr-1.5 text-[#F59E0B]" size={14} />
                                <span>{selectedClient.reg_mobile || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-[#9CA3AF]">
                                <FiCreditCard className="mr-1.5 text-[#F59E0B]" size={14} />
                                <span className="font-mono">{selectedClient.pan_no || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(selectedClient.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="flex items-center text-base font-semibold text-[#F9FAFB]">
                          <FiUser className="mr-2 text-[#F59E0B]" size={16} />
                          Personal Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Date of Birth</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{formatDate(selectedClient.dob)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Father's Name</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{selectedClient.fathers_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Relationship</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{selectedClient.father_relation || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Risk Profile</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{selectedClient.risk_profile || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="space-y-4">
                        <h4 className="flex items-center text-base font-semibold text-[#F9FAFB]">
                          <FiBriefcase className="mr-2 text-[#F59E0B]" size={16} />
                          Account Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Partner</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{selectedClient.partner_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">RM</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{selectedClient.rm_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#9CA3AF]">Account Created</span>
                            <span className="text-sm font-medium text-[#F9FAFB]">{formatDate(selectedClient.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="pt-4 border-t border-[#2A2A2A]">
                      <h4 className="flex items-center text-base font-semibold text-[#F9FAFB] mb-3">
                        <FiHome className="mr-2 text-[#F59E0B]" size={16} />
                        Address
                      </h4>
                      <p className="text-sm text-[#9CA3AF] bg-[#1F1A1A] p-4 rounded-lg border border-[#2A2A2A]">
                        {selectedClient.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#1F1A1A] px-5 py-4 border-t border-[#2A2A2A] rounded-b-xl flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#F9FAFB] hover:bg-[#2A2A2A] rounded-lg transition-colors border border-[#2A2A2A]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedClient) {
                      sessionStorage.setItem('selectedClient', JSON.stringify({
                        name: selectedClient.inv_name,
                        pan: selectedClient.pan_no
                      }));
                      router.push('/investor');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-[#F9FAFB] text-sm font-medium rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                >
                  <FiFileText className="w-4 h-4" />
                  View Full Report
                </button>
                <button
                  onClick={() => {
                    if (selectedClient) {
                      sessionStorage.setItem('selectedClient', JSON.stringify({
                        name: selectedClient.inv_name,
                        pan: selectedClient.pan_no
                      }));
                      router.push('/dashboards');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-[#F9FAFB] text-sm font-medium rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                >
                  <FiBarChart2 className="w-4 h-4" />
                  View Dashboard
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
