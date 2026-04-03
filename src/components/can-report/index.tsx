'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Search,
  Download,
  ChevronRight,
  Hash,
  Layers,
  FileText,
  UserCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  Filter,
  X,
  User,
  CreditCard
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '@/utils/api';
import getConfig from '@/utils/config';

const env = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';
const { ApiUrl } = getConfig(env);

// Type Definitions
interface RawResponse {
  CANIndFillEezzResp: {
    RESP_BODY: {
      CAN?: string;
      NOM_VER_LINK_H1?: string;
      NOM_VER_LINK_H2?: string;
      NOM_VER_LINK_H3?: string;
    };
    RESP_HEADER: {
      RES_MSG: string;
      RES_CODE: string;
      ENTITY_ID: string;
      TIMESTAMP: string;
      UNIQUE_ID: string;
      VERSION_NO: string;
      REQUEST_TYPE: string;
    };
  };
}

interface ApiResponseItem {
  id: number;
  raw_response: RawResponse;
  created_at: string;
  investor_id: number | null;
  can_number: string | null;
  response_pan: string | null;
  investor_name: string | null;
  investor_pan: string | null;
}

interface ApiResponse {
  data: {
    data: ApiResponseItem[];
    count: number;
  };
  msg: string;
}

interface FilterResponse {
  data: {
    data: ApiResponseItem[];
    count: number;
  };
  msg: string;
}

interface Report {
  id: number;
  can: string;
  respHeader: 'SUCCESS' | 'ERROR';
  resCode: string;
  resMsg: string;
  entityId: string;
  timestamp: string;
  uniqueId: string;
  versionNo: string;
  requestType: string;
  created_at: string;
  investor_id: number | null;
  can_number: string | null;
  response_pan: string | null;
  investor_name: string | null;
  investor_pan: string | null;
  rawData: RawResponse;
  nomLinkH1: string | null;
  nomLinkH2: string | null;
  nomLinkH3: string | null;
}

interface SortConfig {
  key: keyof Report;
  direction: 'asc' | 'desc';
}

interface Stats {
  total: number;
  success: number;
  errors: number;
  uniqueEntities: number;
}

interface FilterParams {
  CAN?: string;
  created_at?: string;
}

export default function CANReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [canSearch, setCanSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(false);
  const itemsPerPage = 10;

  // Transform API data to Report format
  const transformApiData = useCallback((apiData: ApiResponseItem[]): Report[] => {
    return apiData.map(item => {
      const respHeader = item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.RES_MSG?.toLowerCase().includes('success')
        ? 'SUCCESS'
        : 'ERROR';

      return {
        id: item.id,
        can: item.raw_response?.CANIndFillEezzResp?.RESP_BODY?.CAN?.trim() || 'N/A',
        respHeader,
        resCode: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.RES_CODE || 'N/A',
        resMsg: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.RES_MSG || 'N/A',
        entityId: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.ENTITY_ID || 'N/A',
        timestamp: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.TIMESTAMP || 'N/A',
        uniqueId: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.UNIQUE_ID || 'N/A',
        versionNo: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.VERSION_NO || 'N/A',
        requestType: item.raw_response?.CANIndFillEezzResp?.RESP_HEADER?.REQUEST_TYPE || 'N/A',
        created_at: item.created_at,
        investor_id: item.investor_id,
        can_number: item.can_number,
        response_pan: item.response_pan,
        investor_name: item.investor_name,
        investor_pan: item.investor_pan,
        rawData: item.raw_response,
        nomLinkH1: item.raw_response?.CANIndFillEezzResp?.RESP_BODY?.NOM_VER_LINK_H1 || null,
        nomLinkH2: item.raw_response?.CANIndFillEezzResp?.RESP_BODY?.NOM_VER_LINK_H2 || null,
        nomLinkH3: item.raw_response?.CANIndFillEezzResp?.RESP_BODY?.NOM_VER_LINK_H3 || null
      };
    });
  }, []);

  // Fetch all reports from API
  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFiltering(false);

      const response = await api.get(`${ApiUrl}/partner/canRegister/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse = response.data;

      if (data?.data && Array.isArray(data.data.data)) {
        const transformedData = transformApiData(data.data.data);
        setReports(transformedData);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error("Error fetching reports:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load reports. Please try again."
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [transformApiData]);

  // Fetch filtered reports
  const fetchFilteredReports = useCallback(async (filters: FilterParams) => {
    try {
      setLoading(true);
      setError(null);
      setIsFiltering(true);

      const filterData: any = {};
      if (filters.CAN && filters.CAN.trim()) {
        filterData.CAN = filters.CAN.trim();
      }
      if (filters.created_at && filters.created_at.trim()) {
        filterData.created_at = filters.created_at.trim();
      }

      if (Object.keys(filterData).length === 0) {
        await fetchAllReports();
        return;
      }

      const response = await api.post(`${ApiUrl}/partner/canRegister/filter`,
        filterData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: FilterResponse = response.data;

      if (data?.data && Array.isArray(data.data.data)) {
        const transformedData = transformApiData(data.data.data);
        setReports(transformedData);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error("Error fetching filtered reports:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load filtered reports. Please try again."
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [transformApiData, fetchAllReports]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const filters: FilterParams = {};

    if (canSearch.trim()) {
      filters.CAN = canSearch.trim();
    }

    if (dateFilter.trim()) {
      filters.created_at = dateFilter.trim();
    }

    fetchFilteredReports(filters);
  }, [canSearch, dateFilter, fetchFilteredReports]);

  // Clear  filters
  const clearFilters = useCallback(() => {
    setCanSearch('');
    setDateFilter('');
    setSearchTerm('');
    setStatusFilter('ALL');
    setIsFiltering(false);
    fetchAllReports();
  }, [fetchAllReports]);


  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);


  const stats: Stats = useMemo(() => {
    const total = reports.length;
    const success = reports.filter(r => r.respHeader === 'SUCCESS').length;
    const errors = reports.filter(r => r.respHeader === 'ERROR').length;
    const uniqueEntities = new Set(reports.map(r => r.entityId)).size;

    return { total, success, errors, uniqueEntities };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch =
        report.can?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.resMsg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.resCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.can_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.response_pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.investor_pan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'SUCCESS' && report.respHeader === 'SUCCESS') ||
        (statusFilter === 'ERROR' && report.respHeader === 'ERROR');

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);


  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredReports, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedReports.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedReports, currentPage, itemsPerPage]);


  const handleSort = useCallback((key: keyof Report) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  //  Excel
  const handleExportExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(sortedReports.map((report, index) => ({
      'S.No': index + 1,
      'ID': report.id,
      'CAN': report.can,
      'Status': report.respHeader,
      'Response Code': report.resCode,
      'Response Message': report.resMsg,
      'Entity ID': report.entityId,
      'Timestamp': report.timestamp,
      'Unique ID': report.uniqueId,
      'Version': report.versionNo,
      'Request Type': report.requestType,
      'Created At': formatDate(report.created_at),
      'Investor ID': report.investor_id || 'N/A',
      'CAN Number': report.can_number || 'N/A',
      'Response PAN': report.response_pan || 'N/A',
      'Name': report.investor_name || 'N/A',
      'PAN': report.investor_pan || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CAN Reports');
    XLSX.writeFile(workbook, `CAN_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [sortedReports]);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  }, []);

  const columns = useMemo(() => [
    { key: 'sno' as keyof Report, label: 'S.No', sortable: false, width: '70px' },
    { key: 'id' as keyof Report, label: 'ID', sortable: true, width: '70px' },
    { key: 'can' as keyof Report, label: 'CAN', sortable: true, icon: <Hash size={12} />, width: '110px' },
    { key: 'respHeader' as keyof Report, label: 'Status', sortable: true, width: '90px' },
    { key: 'resCode' as keyof Report, label: 'Res Code', sortable: true, width: '90px' },
    { key: 'resMsg' as keyof Report, label: 'Message', sortable: false, width: '160px' },
    { key: 'entityId' as keyof Report, label: 'Entity', sortable: true, width: '100px' },
    { key: 'investor_name' as keyof Report, label: 'Name', sortable: true, icon: <User size={12} />, width: '140px' },
    { key: 'investor_pan' as keyof Report, label: 'PAN', sortable: true, icon: <CreditCard size={12} />, width: '110px' },
    { key: 'uniqueId' as keyof Report, label: 'Unique ID', sortable: true, width: '130px' },
    { key: 'versionNo' as keyof Report, label: 'Ver', sortable: true, icon: <Layers size={12} />, width: '70px' },
    { key: 'created_at' as keyof Report, label: 'Created At', sortable: true, icon: <Calendar size={12} />, width: '150px' },
    { key: 'actions' as keyof Report, label: 'Actions', sortable: false, width: '80px' }
  ], []);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);


  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  }, [applyFilters]);


  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading CAN reports...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchAllReports}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">

            <div className="lg:col-span-8 grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-base font-bold text-slate-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <CheckCircle className="text-emerald-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Success</p>
                    <p className="text-base font-bold text-emerald-600">{stats.success}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <XCircle className="text-rose-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Errors</p>
                    <p className="text-base font-bold text-rose-600">{stats.errors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <UserCheck className="text-purple-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Entities</p>
                    <p className="text-base font-bold text-purple-600">{stats.uniqueEntities}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="lg:col-span-3 bg-white rounded-lg p-3 shadow-sm border border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search all fields..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <button
                onClick={handleExportExcel}
                className="w-full h-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={loading || reports.length === 0}
              >
                <Download size={14} />
                <span className="hidden lg:inline">Export</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">

              <div className="flex gap-1">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('SUCCESS')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Success
                </button>
                <button
                  onClick={() => setStatusFilter('ERROR')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === 'ERROR' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Errors
                </button>
              </div>


              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="CAN ID"
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    value={canSearch}
                    onChange={(e) => setCanSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>


              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>


              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  <Filter size={14} />
                  Apply
                </button>

                {(isFiltering || canSearch || dateFilter) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {(canSearch || dateFilter) && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Active filters:</span>
                  {canSearch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                      CAN: {canSearch}
                      <button
                        onClick={() => setCanSearch('')}
                        className="ml-0.5 p-0.5 hover:bg-blue-100 rounded"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {dateFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-100">
                      Date: {dateFilter}
                      <button
                        onClick={() => setDateFilter('')}
                        className="ml-0.5 p-0.5 hover:bg-green-100 rounded"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

          <div className="px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Transaction Details</h2>
                <p className="text-xs text-slate-500">
                  Showing {paginatedReports.length} of {filteredReports.length} records
                  {searchTerm && ` for "${searchTerm}"`}
                  {isFiltering && ' (Server-side filtered)'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Success
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    Error
                  </span>
                </div>
                <button
                  onClick={fetchAllReports}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw size={14} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-600">
                {isFiltering ? 'Applying filters...' : 'Updating data...'}
              </p>
            </div>
          )}


          {error && !loading && (
            <div className="p-4 bg-rose-50 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-rose-500 flex-shrink-0" size={16} />
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  onClick={fetchAllReports}
                  className="ml-auto text-xs px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded"
                >
                  Retry
                </button>
              </div>
            </div>
          )}


          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => column.sortable && handleSort(column.key)}
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        {column.icon}
                        <span>{column.label}</span>
                        {column.sortable && sortConfig.key === column.key && (
                          sortConfig.direction === 'asc' ?
                            <ChevronUp size={10} /> :
                            <ChevronDown size={10} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedReports.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors duration-150 group">
                      <td className="px-3 py-2">
                        <div className="text-sm font-mono text-slate-900">
                          {((currentPage - 1) * itemsPerPage) + index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-mono text-slate-900">#{report.id}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">C</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">
                              {report.can === 'N/A' || report.can === ' ' || !report.can.trim() ? 'Not Assigned' : report.can}
                            </div>
                            {report.can_number && (
                              <div className="text-xs text-slate-500 mt-0.5">
                                DB: {report.can_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          {report.respHeader === 'SUCCESS' ? (
                            <CheckCircle className="text-emerald-500 mr-1.5" size={12} />
                          ) : (
                            <XCircle className="text-rose-500 mr-1.5" size={12} />
                          )}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${report.respHeader === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {report.respHeader}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono ${report.resCode === '0' || report.resCode.startsWith('2')
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          {report.resCode}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-slate-900 truncate max-w-[160px]" title={report.resMsg}>
                          {report.resMsg}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-slate-900 font-medium">{report.entityId}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-slate-900 truncate max-w-[140px]" title={report.investor_name || 'N/A'}>
                          {report.investor_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-mono text-slate-900" title={report.investor_pan || 'N/A'}>
                          {report.investor_pan || 'N/A'}
                        </div>
                        {report.response_pan && report.response_pan !== report.investor_pan && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            Resp: {report.response_pan}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-mono text-slate-900 truncate max-w-[130px]" title={report.uniqueId}>
                          {report.uniqueId}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-sm font-medium">
                          v{report.versionNo}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-slate-900">{formatDate(report.created_at)}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye size={12} className="text-slate-600" />
                          </button>
                          {report.nomLinkH1 && (
                            <a
                              href={report.nomLinkH1}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Open Nomination Link"
                              aria-label="Open nomination link"
                            >
                              <ExternalLink size={12} className="text-blue-600" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>


                    {expandedRow === report.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={columns.length} className="px-3 py-3">
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Response Details</h4>
                                <div className="space-y-1.5">
                                  <p className="text-sm">
                                    <span className="text-slate-500">Response Code: </span>
                                    <span className="font-medium">{report.resCode}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">Message: </span>
                                    <span className="font-medium">{report.resMsg}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">Request Type: </span>
                                    <span className="font-medium">{report.requestType}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">Timestamp: </span>
                                    <span className="font-medium">{formatDate(report.timestamp)}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">System Info</h4>
                                <div className="space-y-1.5">
                                  <p className="text-sm">
                                    <span className="text-slate-500">Investor ID: </span>
                                    <span className="font-medium">{report.investor_id || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500"> Name: </span>
                                    <span className="font-medium">{report.investor_name || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500"> PAN: </span>
                                    <span className="font-medium">{report.investor_pan || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">Response PAN: </span>
                                    <span className="font-medium">{report.response_pan || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">CAN Number (DB): </span>
                                    <span className="font-medium">{report.can_number || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-slate-500">Created: </span>
                                    <span className="font-medium">{formatDate(report.created_at)}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-slate-700">Raw Response</h4>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(report.rawData, null, 2))}
                                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <div className="bg-slate-50 rounded p-3 h-32 overflow-auto">
                                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                                    {JSON.stringify(report.rawData, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>


          {filteredReports.length === 0 && !loading && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-700 mb-1">No transactions found</h3>
              <p className="text-sm text-slate-500">
                {searchTerm || canSearch || dateFilter
                  ? `No results for the applied filters`
                  : 'No transaction data available'}
              </p>
              {(searchTerm || canSearch || dateFilter) && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}


          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Showing <span className="font-semibold text-slate-900">
                  {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)}
                </span> of{' '}
                <span className="font-semibold text-slate-900">{filteredReports.length}</span> records
                {isFiltering && <span className="ml-1 text-indigo-600">(Server-side filtered)</span>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  Prev
                </button>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 py-1 text-xs rounded-lg min-w-[32px] ${currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-slate-500">...</span>}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <ChevronRight size={12} />
                <span>Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>


        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Data refreshes automatically. Last fetched: {new Date().toLocaleTimeString()}</p>
          {isFiltering && (
            <p className="mt-1 text-indigo-600">
              Currently showing server-side filtered results.
              <button onClick={clearFilters} className="ml-1 text-indigo-700 hover:underline">
                Show all records
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}