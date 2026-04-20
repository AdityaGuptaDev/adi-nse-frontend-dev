'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Eye, LogIn, Edit, Trash2, Download, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import getConfig from '@/utils/config';




const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);


interface RM {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  role: string;
}

const RMList = () => {
  const router = useRouter();
  const [rms, setRms] = useState<RM[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRms = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${ApiUrl}/partner/getrmList`);
        const array = res.data.data.data;
        const data = array.map((rm: any, index: number) => ({
          id: (index + 1).toString(),
          name: rm.Name ?? 'N/A',
          email: rm.email ?? '',
          mobile: rm.mobile ?? '',
          status: rm.isActive ? 'Active' : 'Inactive',
          role: 'RM'
        }));
        setRms(data);
      } catch (err: any) {
        setError(err.message ?? 'Failed to fetch RMs');
      } finally {
        setLoading(false);
      }
    };
    fetchRms();
  }, []);

  const filteredRms = useMemo(() => {
    let filtered = rms.filter(rm => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = rm.name.toLowerCase().includes(search) || rm.email.toLowerCase().includes(search) || rm.mobile.includes(search);
      const matchesStatus = statusFilter === 'all' || rm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof RM];
        const bValue = b[sortConfig.key as keyof RM];
        if (aValue === bValue) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        return sortConfig.direction === 'asc' ? 1 : -1;
      });
    }

    return filtered;
  }, [rms, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredRms.length / itemsPerPage);

  const paginatedRms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRms.slice(start, start + itemsPerPage);
  }, [filteredRms, currentPage]);

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

  const getStatusBadge = (status: 'Active' | 'Inactive') => {
    const styles = {
      'Active': 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-[#F9FAFB]',
      'Inactive': 'bg-gradient-to-r from-red-400 to-red-600 text-[#F9FAFB]'
    };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
  };

  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredRms.map(rm => ({
          Name: rm.name,
          Email: rm.email,
          Mobile: rm.mobile,
          Role: rm.role,
          Status: rm.status
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RMs");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "RMs.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAction = (action: 'login' | 'view' | 'edit' | 'delete', rm: RM) => {
    switch (action) {
      case 'login':
        router.push(`/login?rmId=${rm.id}`);
        break;
      case 'view':
        router.push(`/rm/view/${rm.id}`);
        break;
      case 'edit':
        router.push(`/rm/edit/${rm.id}`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${rm.name}?`)) {
          alert('Delete API call here');
        }
        break;
    }
  };

  if (loading) return <div className="text-center mt-10">Loading RMs...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-orange-50">
      <button onClick={() => window.history.back()} className="flex items-center text-orange-600 mb-4"><ChevronLeft className="w-5 h-5 mr-2" /> Back</button>

      {/* Controls */}
      <div className="bg-[#111111] p-4 rounded-lg shadow mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setShowFilter(!showFilter)} className="px-4 py-2 bg-orange-500 text-[#F9FAFB] rounded-lg">Toggle Filter</button>
          <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="px-4 py-2 bg-orange-500 text-[#F9FAFB] rounded-lg">Clear Filter</button>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportToExcel} className="px-4 py-2 bg-orange-500 text-[#F9FAFB] rounded-lg flex items-center gap-2">
            {exportLoading ? 'Exporting...' : <><Download className="w-4 h-4" /> Export</>}
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="bg-[#111111] p-4 rounded-lg shadow mb-4 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search RMs..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="pl-3 pr-8 py-2 border rounded-lg">
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedRms.length > 0 ? paginatedRms.map(rm => (
                <motion.tr key={rm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="hover:bg-orange-50">
                  <td className="px-4 py-2">{rm.name}</td>
                  <td className="px-4 py-2">{rm.email}</td>
                  <td className="px-4 py-2">{rm.role}</td>
                  <td className="px-4 py-2">{getStatusBadge(rm.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Login as RM */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('login', rm)}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-[#F9FAFB] rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-lg transition-all duration-300"
                        title="Login as RM"
                      >
                        <LogIn className="w-4 h-4" />
                      </motion.button>

                      {/* View RM */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('view', rm)}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-[#F9FAFB] rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-lg transition-all duration-300"
                        title="View RM"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      {/* Edit RM */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('edit', rm)}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-[#F9FAFB] rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-lg transition-all duration-300"
                        title="Edit RM"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      {/* Delete RM */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('delete', rm)}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-[#F9FAFB] rounded-xl hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-lg transition-all duration-300"
                        title="Delete RM"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>

                </motion.tr>
              )) : (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="px-4 py-2 text-center text-[#9CA3AF]">No RMs found</td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-orange-200 rounded disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-orange-200 rounded disabled:opacity-50">Next</button>
        </div>
      )}

    </div>
  );
};

export default RMList;
