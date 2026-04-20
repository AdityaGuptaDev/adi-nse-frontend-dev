'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, LogIn, Filter, Users, UserCheck, Clock, UserX, Mail, Phone, ChevronDown, ArrowLeft, ChevronLeft, Eye, ArrowUpDown, ArrowUp, ArrowDown, Star, Grid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPartnerList } from './partnerListService';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Partner {
  id: string;
  name: string | null;
  pan: string | null;
  email: string | null;
  mobile: string | null;
  isPartner: boolean;
  status: 'Active' | 'Inactive' | 'Pending';
}

const PartnerList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Pending'>('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = await getPartnerList();
        const transformedPartners: Partner[] = data
          .filter((partner: any) => partner.isPartner)
          .map((partner: any) => ({
            id: partner.id?.toString() ?? '',
            name: partner.name ?? 'Unknown',
            pan: partner.pan ?? 'N/A',
            email: partner.email ?? '',
            mobile: partner.mobile ?? '',
            isPartner: partner.isPartner,
            status: partner.isActive ? 'Active' : 'Inactive'
          }));
        setPartners(transformedPartners);
      } catch (err: any) {
        setError(err.message ?? 'Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    let filtered = partners.filter((partner: Partner) => {
      const name = partner.name?.toLowerCase() || '';
      const email = partner.email?.toLowerCase() || '';
      const pan = partner.pan?.toLowerCase() || '';
      const mobile = partner.mobile?.toLowerCase() || '';
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch = name.includes(searchTermLower) ||
        email.includes(searchTermLower) ||
        pan.includes(searchTermLower) ||
        mobile.includes(searchTermLower);

      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Partner];
        const bValue = b[sortConfig.key as keyof Partner];

        if (aValue === null || bValue === null) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [partners, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPartners.slice(start, start + itemsPerPage);
  }, [filteredPartners, currentPage, itemsPerPage]);

  const getInitials = (name: string | null): string => {
    if (!name) return 'NA';
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'NA';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getStatusBadge = (status: 'Active' | 'Inactive' | 'Pending') => {
    const styles = {
      'Active': 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-[#F9FAFB] shadow-lg shadow-emerald-500/25',
      'Inactive': 'bg-gradient-to-r from-red-400 to-red-600 text-[#F9FAFB] shadow-lg shadow-red-500/25',
      'Pending': 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#F9FAFB] shadow-lg shadow-amber-500/25'
    };

    return (
      <motion.span 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status}
      </motion.span>
    );
  };

  const statsData = [
    {
      title: 'Total Partners',
      value: partners.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'from-blue-50 to-blue-100',
      change: '+12%'
    },
    {
      title: 'Active Partners',
      value: partners.filter(p => p.status === 'Active').length,
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'from-emerald-50 to-emerald-100',
      change: '+8%'
    },
    {
      title: 'Inactive Partners',
      value: partners.filter(p => p.status === 'Inactive').length,
      icon: UserX,
      color: 'from-rose-500 to-rose-600',
      bg: 'from-rose-50 to-rose-100',
      change: '-3%'
    },
  ];

  const handleLoginAsPartner = (partnerId: string) => {
    // router.push(`/login?partnerId=${partnerId}`);
  };

  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredPartners.map(partner => ({
          Name: partner.name,
          Email: partner.email,
          Mobile: partner.mobile,
         
          Status: partner.status
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Partners");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Partners.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {paginatedPartners.map((partner, index) => (
        <motion.div
          key={partner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group bg-[#111111] rounded-2xl shadow-sm border border-[#2A2A2A] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="relative p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-[#F9FAFB] font-medium text-lg">
                {getInitials(partner.name)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-[#F9FAFB] truncate">{partner.name}</h3>
                <p className="text-sm text-[#9CA3AF] truncate">{partner.pan}</p>
              </div>
              {getStatusBadge(partner.status)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-[#9CA3AF]">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{partner.email}</span>
              </div>
              <div className="flex items-center text-sm text-[#9CA3AF]">
                <Phone className="w-4 h-4 mr-2" />
                <span>{partner.mobile}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-[#9CA3AF]">
                  ID: {partner.id}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => handleLoginAsPartner(partner.id)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-[#F9FAFB] px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Login As
              </button>
              <button className="px-3 py-2 border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const TableView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-[#111111] rounded-2xl shadow-sm border border-[#2A2A2A] overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-[#2A2A2A]">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-[#F9FAFB] hover:text-[#F59E0B] transition-colors"
                >
                  Partner
                  {getSortIcon('name')}
                </button>
              </th>
           
              <th className="px-6 py-4 text-left">Contact</th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 font-semibold text-[#F9FAFB] hover:text-[#F59E0B] transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            <AnimatePresence>
              {paginatedPartners.length > 0 ? (
                paginatedPartners.map((partner, index) => (
                  <motion.tr
                    key={partner.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-[#F9FAFB] font-medium">
                          {getInitials(partner.name)}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-[#F9FAFB]">{partner.name}</div>
                          <div className="text-sm text-[#9CA3AF]">ID: {partner.id}</div>
                        </div>
                      </div>
                    </td>
                
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-[#F9FAFB]">
                          <Mail className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                          {partner.email}
                        </div>
                        <div className="flex items-center text-sm text-[#9CA3AF]">
                          <Phone className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                          {partner.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(partner.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLoginAsPartner(partner.id)}
                          className="p-2 bg-[#1F1A1A] text-[#F59E0B] rounded-lg hover:bg-blue-200 transition-colors"
                          title="Login As Partner"
                        >
                          <LogIn className="w-4 h-4" />
                        </motion.button>
                      
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-[#9CA3AF]">
                    No partners found matching your criteria
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-[#F59E0B] border-t-transparent mx-auto"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-[#9CA3AF]"
          >
            Loading partners...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-6 bg-[#111111] rounded-2xl shadow-sm border border-[#2A2A2A]"
        >
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#F9FAFB] mb-2">Error loading partners</h3>
          <p className="text-[#9CA3AF] mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-[#F9FAFB] rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 p-6"
    >
    

 {/* Stats Cards */}
 <button 
     onClick={() => window.history.back()}
     className="flex items-center text-[#F59E0B] hover:text-[#F59E0B] mb-6 transition-colors"
   >
     <ChevronLeft className="w-5 h-5 mr-2" />
     Back 
   </button>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  {statsData.map((stat, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-[#111111] rounded-xl shadow-sm border border-[#2A2A2A] p-4 overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>

      <div className="relative flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-[#F9FAFB] shadow-md`}>
          <stat.icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#F9FAFB]">{stat.value}</h3>
          <p className="text-[#9CA3AF] text-xs">{stat.title}</p>
        </div>
      </div>
    </motion.div>
  ))}
</div>


      {/* Controls */}
      <div className="bg-[#111111] rounded-2xl shadow-sm border border-[#2A2A2A] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Search and Filter */}
          <div className="flex flex-1 gap-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive' | 'Pending')}
                className="appearance-none bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-10 text-[#F9FAFB] focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* View Toggle and Export */}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#111111] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-[#111111] text-[#F59E0B] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === 'table'
                    ? 'bg-[#111111] text-[#F59E0B] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToExcel}
              disabled={exportLoading}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-[#F9FAFB] rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              {exportLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? <GridView /> : <TableView />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#111111] border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === pageNum
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-[#F9FAFB] shadow-lg shadow-blue-500/25'
                    : 'bg-[#111111] border border-[#2A2A2A] hover:bg-[#0A0A0A]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#111111] border border-[#2A2A2A] rounded-lg hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PartnerList;