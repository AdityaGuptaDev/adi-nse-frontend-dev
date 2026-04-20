"use client";
import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, FileDown, FileSpreadsheet, Printer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';
import api from '@/utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import autoTable from 'jspdf-autotable';

interface SIPSTPData {
  id: number;
  amc_code: string;
  folio_no: string;
  scheme: string;
  inv_name: string;
  pan: string;
  scheme_typ: string;
  sip_amount: number;
  trn_typ:string;
  sip_status: string;
  installments_paid: number;
  unit_balance: number;
  current_value: number;
  xirr_return: number;
  bank_account: string;
  debit_day: number;
  start_date: string;
  mode: string;
  asset_subtype: string;
}

interface InvestmentLedgerResponse {
  data: {
    data: Array<{
      out_amc: string;
      out_folio_no: string;
      out_scheme: string;
      out_investor: string;
      out_scheme_type: string;
      out_txn_type: string;
      out_txn_date: string;
      out_units: string;
      out_purprice: string;
      out_amount: string;
      out_stamp_duty: string;
      out_total_amount: string;
      out_current_nav: string;
      out_asset_type: string;
      out_asset_sub_type: string;
      out_mode: string;
      out_status: string;
      out_bank_ac: string;
      out_start_date: string | null;
      out_debit_day: string;
      out_install_amt: string;
      out_install_paid: string;
      out_sum_units: string;
      out_sum_inv: string;
      out_sum_curval: string;
      out_xirr: string;
    }>;
  };
  msg: string;
}

const SIPSTPReport = () => {
  const [portfolioData, setPortfolioData] = useState<SIPSTPData[]>([]);
  const [filteredData, setFilteredData] = useState<SIPSTPData[]>([]);
  const [currentPageData, setCurrentPageData] = useState<SIPSTPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [amcFilter, setAmcFilter] = useState<string>('all');
  const [schemeTypeFilter, setSchemeTypeFilter] = useState<string>('all');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');

  // Date range states
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Report type state
  const [reportType, setReportType] = useState<string>('sip_stp');

  const searchParams = useSearchParams();

  let pan = "";
  let name = "";
  const user = getLS(USER_DATA);
  const aumpan = searchParams.get('pan');
  const aumname = searchParams.get('name');

  if (!aumpan) {
    pan = user?.InvestorRegistration?.pan_no || "";
    name = user?.InvestorRegistration?.name || "";
  } else {
    pan = aumpan || "";
    name = aumname || "";
  }

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    setToDate(formatDate(today));
    setFromDate(formatDate(oneYearAgo));
  }, []);

  // Calculate pagination when filteredData changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    setTotalPages(totalPages || 1);
    
    // Ensure current page is within valid range
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
    
    // Get current page data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    setCurrentPageData(currentItems);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchData = async () => {
      if (!pan || !fromDate || !toDate) return;

      try {
        setLoading(true);
        const response = await api.post<InvestmentLedgerResponse>(
          "/partner/getSipSwp",
          {
            pan,
            rpt_type: reportType,
            from_date: fromDate,
            to_date: toDate,
          }
        );

        const data = response.data;

        if (!data.data || !Array.isArray(data.data.data)) {
          throw new Error("Invalid data format received from API");
        }

        // Process and transform the API response
        const processedData = data.data.data.map((item, index) => ({
          id: index,
          amc_code: item.out_amc,
          folio_no: item.out_folio_no,
          scheme: item.out_scheme,
          inv_name: item.out_investor,
          pan,
          scheme_typ: item.out_scheme_type,
          trn_typ: item.out_txn_type,
          sip_amount: parseFloat(item.out_install_amt) || 0,
          sip_status: item.out_status || 'N/A',
          installments_paid: parseInt(item.out_install_paid) || 0,
          unit_balance: parseFloat(item.out_units) || 0,
          current_value: parseFloat(item.out_sum_curval) || 0,
          xirr_return: parseFloat(item.out_xirr) || 0,
          bank_account: item.out_bank_ac || 'N/A',
          debit_day: parseInt(item.out_debit_day) || 0,
          start_date: item.out_txn_date || 'N/A',
          mode: item.out_mode || 'N/A',
          asset_subtype: item.out_asset_sub_type || 'N/A',
        }));

        setPortfolioData(processedData);
        setFilteredData(processedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pan, reportType, fromDate, toDate]);

  useEffect(() => {
    if (portfolioData.length === 0) return;

    let result = [...portfolioData];

    if (statusFilter !== 'all') {
      result = result.filter(item =>
        statusFilter === 'active' ? item.sip_status === 'Active' : item.sip_status !== 'Active'
      );
    }

    // Apply AMC filter
    if (amcFilter !== 'all') {
      result = result.filter(item => item.amc_code === amcFilter);
    }

    if (schemeTypeFilter !== 'all') {
      result = result.filter(item => item.asset_subtype === schemeTypeFilter);
    }

    if (minAmountFilter) {
      const min = parseFloat(minAmountFilter);
      result = result.filter(item => item.sip_amount >= min);
    }
    if (maxAmountFilter) {
      const max = parseFloat(maxAmountFilter);
      result = result.filter(item => item.sip_amount <= max);
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, amcFilter, schemeTypeFilter, minAmountFilter, maxAmountFilter, portfolioData]);

  const uniqueAmcs = [...new Set(portfolioData.map(item => item.amc_code))].sort();
  const uniqueSchemeTypes = [...new Set(portfolioData.map(item => item.asset_subtype))].sort();
  const uniqueStatuses = [...new Set(portfolioData.map(item => item.sip_status))].sort();
  
  const assetTypeColors: Record<string, string> = {
    equity: "text-green-400",
    debt: "text-blue-400",
    hybrid: "text-purple-400",
    liquid: "text-cyan-400",
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setAmcFilter('all');
    setSchemeTypeFilter('all');
    setMinAmountFilter('');
    setMaxAmountFilter('');
  };

  const handleDateRangeChange = () => {
    setLoading(true);
    // The useEffect will automatically trigger with the new date values
  };

  // Pagination functions
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
    setPageInput('');
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageInput) {
      const pageNum = parseInt(pageInput);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
      }
      setPageInput('');
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    // Recalculate current page to maintain position
    const newPage = Math.ceil(((currentPage - 1) * itemsPerPage + 1) / newItemsPerPage);
    setCurrentPage(newPage);
  };

  // Export to PDF function
  const exportToPDF = () => {
    if (!filteredData.length) {
      alert('No data available to export');
      return;
    }

    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('VEDANT ASSET', pageWidth / 2, 12, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('SIP/SWP REPORT', pageWidth / 2, 22, { align: 'center' });

    yPosition = 40;

    // Investor Details
    doc.setFontSize(10);
    doc.setTextColor(249, 250, 251);
    doc.setFont('helvetica', 'bold');
    doc.text(`Investor: ${name}`, 15, yPosition);
    doc.text(`PAN: ${pan}`, 15, yPosition + 6);
    doc.text(`Period: ${fromDate} to ${toDate}`, pageWidth - 15, yPosition, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, yPosition + 6, { align: 'right' });

    yPosition += 20;

    // Summary
    const totalSIPs = filteredData.length;
    const activeSIPs = filteredData.filter(item => item.sip_status === 'Active').length;
    const totalMonthlySIP = filteredData.reduce((sum, item) => sum + item.sip_amount, 0);
    const totalCurrentValue = filteredData.reduce((sum, item) => sum + item.current_value, 0);

    doc.setFillColor(31, 26, 26);
    doc.rect(15, yPosition, pageWidth - 30, 15, 'F');
    doc.setFontSize(9);
    doc.setTextColor(249, 250, 251);
    doc.text(`Total SIPs: ${totalSIPs} | Active SIPs: ${activeSIPs} | Total Monthly SIP: ₹${totalMonthlySIP.toLocaleString()} | Total Current Value: ₹${totalCurrentValue.toLocaleString()}`, 20, yPosition + 9);

    yPosition += 25;

    const headers = [
      'Sno', 'Investor', 'AMC', 'Scheme', 'Folio', 'Asset Type',
      'Start Date', 'Txn Type', 'Debit Day', 'Install Amt', 'Inst Paid',
      'Unit Balance', 'Curr Value', 'XIRR %'
    ];

    // Table data
    const tableData = filteredData.map((item, index) => [
      (index + 1).toString(),
      item.inv_name,
      item.amc_code,
      item.scheme.length > 25 ? item.scheme.substring(0, 25) + '...' : item.scheme,
      item.folio_no,
      item.scheme_typ,
      item.start_date,
      item.trn_typ,
      item.debit_day.toString(),
      `₹${item.sip_amount.toLocaleString()}`,
      item.installments_paid.toString(),
      item.unit_balance.toFixed(3),
      `₹${item.current_value.toLocaleString()}`,
      `${item.xirr_return.toFixed(2)}%`
    ]);

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], halign: 'center', fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [249, 250, 251], fillColor: [17, 17, 17] },
      alternateRowStyles: { fillColor: [31, 26, 26] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 50 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 15 },
        9: { cellWidth: 25 },
        10: { cellWidth: 20 },
        11: { cellWidth: 25 },
        12: { cellWidth: 25 },
        13: { cellWidth: 20 },
      },
    });

    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Vedant Asset Management Pvt. Ltd. | SEBI Registration No.: INZ000123456', 
             pageWidth / 2, footerY, { align: 'center' });

    doc.save(`${name}_SIP_SWP_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = async () => {
    if (!filteredData.length) {
      alert('No data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SIP SWP Report');

    worksheet.mergeCells('A1:N2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'VEDANT ASSET - SIP/SWP REPORT';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFF59E0B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F1A1A' }
    };

    // Investor details
    worksheet.mergeCells('A3:N3');
    const investorCell = worksheet.getCell('A3');
    investorCell.value = `Investor: ${name} | PAN: ${pan} | Period: ${fromDate} to ${toDate} | Generated: ${new Date().toLocaleDateString()}`;
    investorCell.font = { bold: true, size: 11, color: { argb: 'FFF9FAFB' } };
    investorCell.alignment = { horizontal: 'center' };
    investorCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2A2A2A' }
    };

    // Summary
    const totalSIPs = filteredData.length;
    const activeSIPs = filteredData.filter(item => item.sip_status === 'Active').length;
    const totalMonthlySIP = filteredData.reduce((sum, item) => sum + item.sip_amount, 0);
    const totalCurrentValue = filteredData.reduce((sum, item) => sum + item.current_value, 0);

    worksheet.mergeCells('A4:N4');
    const summaryCell = worksheet.getCell('A4');
    summaryCell.value = `Summary: Total SIPs: ${totalSIPs} | Active SIPs: ${activeSIPs} | Total Monthly SIP: ₹${totalMonthlySIP.toLocaleString()} | Total Current Value: ₹${totalCurrentValue.toLocaleString()}`;
    summaryCell.font = { bold: true, size: 10, color: { argb: 'FFF9FAFB' } };
    summaryCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F1A1A' }
    };

    // Column headers
    worksheet.columns = [
      { header: 'Sno', key: 'sno', width: 6 },
      { header: 'Investor', key: 'investor', width: 20 },
      { header: 'AMC', key: 'amc', width: 15 },
      { header: 'Scheme', key: 'scheme', width: 30 },
      { header: 'Folio', key: 'folio', width: 15 },
      { header: 'Asset Type', key: 'assetType', width: 12 },
      { header: 'Start Date', key: 'startDate', width: 12 },
      { header: 'Txn Type', key: 'txnType', width: 12 },
      { header: 'Debit Day', key: 'debitDay', width: 10 },
      { header: 'Install Amt (₹)', key: 'installAmt', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Inst Paid', key: 'instPaid', width: 10 },
      { header: 'Unit Balance', key: 'unitBalance', width: 12, style: { numFmt: '#,##0.000' } },
      { header: 'Curr Value (₹)', key: 'currValue', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'XIRR %', key: 'xirr', width: 10, style: { numFmt: '0.00%' } }
    ];

    // Style header row
    const headerRow = worksheet.getRow(6);
    headerRow.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }
    };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add data rows
    filteredData.forEach((item, index) => {
      const row = worksheet.addRow({
        sno: index + 1,
        investor: item.inv_name,
        amc: item.amc_code,
        scheme: item.scheme,
        folio: item.folio_no,
        assetType: item.scheme_typ,
        startDate: item.start_date,
        txnType: item.trn_typ,
        debitDay: item.debit_day,
        installAmt: item.sip_amount,
        instPaid: item.installments_paid,
        unitBalance: item.unit_balance,
        currValue: item.current_value,
        xirr: item.xirr_return / 100
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1F1A1A' }
        };
      } else {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF111111' }
        };
      }

      row.font = { color: { argb: 'FFF9FAFB' } };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Footer
    const footerRow = worksheet.getRow(worksheet.rowCount + 2);
    worksheet.mergeCells(`A${footerRow.number}:N${footerRow.number}`);
    const footer = worksheet.getCell(`A${footerRow.number}`);
    footer.value = 'Generated by Vedant Asset Management Pvt. Ltd. | SEBI Registration No.: INZ000123456';
    footer.font = { italic: true, size: 9, color: { argb: 'FF9CA3AF' } };
    footer.alignment = { horizontal: 'center' };
    footer.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF111111' }
    };

    // Write to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_SIP_SWP_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B]"></div>
          <p className="ml-4 text-[#F9FAFB]">Loading SIP/SWP data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-full mx-auto bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-xl">
        {/* Compact Header */}
        <div className="px-4 py-3 border-b border-[#2A2A2A]">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-[#F59E0B] hover:text-[#FBBF24] transition-colors mb-3 group"
              >
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              
              <div className="space-y-1">
                <h1 className="text-xl font-bold">
                  <span className="text-[#F59E0B]">Vedant</span>
                  <span className="text-[#F9FAFB]">Asset</span>
                  <span className="text-[#9CA3AF] text-sm font-normal ml-3">
                    | 3rd Floor, Gayways House, Above Space Furniture, P.P Compound, Main Road Ranchi 834001 Jharkhand
                  </span>
                </h1>
                
                <div className="text-xs text-[#9CA3AF]">
                  <span className="font-semibold text-[#F9FAFB]">Phone:</span> 9304955509 | 
                  <span className="font-semibold text-[#F9FAFB] ml-2">Email:</span> vedantasset@gmail.com | 
                  <span className="font-semibold text-[#F9FAFB] ml-2">Website:</span>
                  <a href="https://www.vedantasset.co.in" className="text-[#F59E0B] hover:underline ml-1">
                    www.vedantasset.co.in
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/30 transition-colors text-sm"
                >
                  <FileDown size={16} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-md border border-green-500/30 transition-colors text-sm"
                >
                  <FileSpreadsheet size={16} />
                  <span>Excel</span>
                </button>
              </div>

              <div className="text-xs text-[#9CA3AF] text-right">
                <span className="font-semibold text-[#F9FAFB]">Investor:</span> {name} | 
                <span className="font-semibold text-[#F9FAFB] ml-2">PAN:</span> {pan}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Report Controls */}
          <div className="mb-4 p-4 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1">Report Type</label>
                <select
                  className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sip_stp">SIP/STP</option>
                  <option value="ledger">Ledger</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1">From Date</label>
                <div className="relative">
                  <DatePicker
                    selected={fromDate ? new Date(fromDate) : null}
                    onChange={(date: Date | null) => {
                      setFromDate(date ? date.toISOString().split("T")[0] : "");
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                    placeholderText="Select From Date"
                  />
                  <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1">To Date</label>
                <div className="relative">
                  <DatePicker
                    selected={toDate ? new Date(toDate) : null}
                    onChange={(date: Date | null) => {
                      setToDate(date ? date.toISOString().split("T")[0] : "");
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                    placeholderText="Select To Date"
                  />
                  <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleDateRangeChange}
                  className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 text-sm"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#F9FAFB]">SIP/SWP Report</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1 bg-[#1F1A1A] text-[#F59E0B] rounded-md hover:bg-[#2A2A2A] border border-[#2A2A2A]"
              >
                <Filter size={16} />
                <span>Filters</span>
                {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
                  <span className="bg-[#F59E0B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[statusFilter, amcFilter, schemeTypeFilter, minAmountFilter, maxAmountFilter]
                      .filter(f => f !== 'all' && f !== '').length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-1">AMC</label>
                    <select
                      className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      value={amcFilter}
                      onChange={(e) => setAmcFilter(e.target.value)}
                    >
                      <option value="all">All AMCs</option>
                      {uniqueAmcs.map(amc => (
                        <option key={amc} value={amc}>{amc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-1">Scheme Type</label>
                    <select
                      className="w-full p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      value={schemeTypeFilter}
                      onChange={(e) => setSchemeTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {uniqueSchemeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-1">SIP Amount Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-1/2 p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        value={minAmountFilter}
                        onChange={(e) => setMinAmountFilter(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-1/2 p-2 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                        value={maxAmountFilter}
                        onChange={(e) => setMaxAmountFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#F59E0B] flex items-center gap-1 transition-colors"
                  >
                    <X size={14} />
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {statusFilter !== 'all' && (
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-full flex items-center">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:text-[#FBBF24]"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {amcFilter !== 'all' && (
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-full flex items-center">
                    AMC: {amcFilter}
                    <button
                      onClick={() => setAmcFilter('all')}
                      className="ml-1 hover:text-[#FBBF24]"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {schemeTypeFilter !== 'all' && (
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-full flex items-center">
                    Type: {schemeTypeFilter}
                    <button
                      onClick={() => setSchemeTypeFilter('all')}
                      className="ml-1 hover:text-[#FBBF24]"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(minAmountFilter || maxAmountFilter) && (
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-full flex items-center">
                    Amount: {minAmountFilter || '0'} - {maxAmountFilter || '∞'}
                    <button
                      onClick={() => {
                        setMinAmountFilter('');
                        setMaxAmountFilter('');
                      }}
                      className="ml-1 hover:text-[#FBBF24]"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls - Top */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="text-sm text-[#9CA3AF]">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9CA3AF]">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="p-1 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#1F1A1A]">
                <tr>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Sno</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Investor</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">AMC</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Scheme</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Folio</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Asset Type</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Start Date</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Transaction Type</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Debit Day</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Installment Amt (Rs)</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Installments Paid</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Unit Balance</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Current Value (Rs)</th>
                  <th className="border border-[#2A2A2A] px-2 py-2 text-xs font-medium text-left text-[#F59E0B]">Return% (XIRR pa)</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#1F1A1A] transition-colors">
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.inv_name}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.amc_code}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.scheme}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.folio_no}</td>
                    <td className={`border border-[#2A2A2A] px-2 py-1 text-xs font-semibold ${assetTypeColors[item.scheme_typ?.toLowerCase()] || "text-yellow-400"}`}>
                      {item.scheme_typ}
                    </td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.start_date}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.trn_typ}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.debit_day}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.sip_amount.toLocaleString()}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.installments_paid}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.unit_balance.toFixed(3)}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#F9FAFB]">{item.current_value.toLocaleString()}</td>
                    <td className="border border-[#2A2A2A] px-2 py-1 text-xs text-[#10B981]">{item.xirr_return.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Bottom */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-[#9CA3AF]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-[#2A2A2A] text-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-all"
                  title="First Page"
                >
                  <ChevronsLeft size={16} />
                </button>
                
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-[#2A2A2A] text-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#9CA3AF]">Page</span>
                  
                  <form onSubmit={handlePageInputSubmit} className="flex items-center">
                    <input
                      type="text"
                      value={pageInput}
                      onChange={handlePageInput}
                      className="w-12 p-1 border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg text-center text-sm focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      placeholder={currentPage.toString()}
                    />
                  </form>
                  
                  <span className="text-sm text-[#9CA3AF]">of {totalPages}</span>
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-[#2A2A2A] text-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-all"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
                
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-[#2A2A2A] text-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1F1A1A] hover:border-[#F59E0B] transition-all"
                  title="Last Page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {filteredData.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-red-400 font-medium">No SIP/SWP match your current filters</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-[#F59E0B] hover:text-[#FBBF24] text-sm"
              >
                Reset all filters
              </button>
            </div>
          )}

          {/* Summary */}
          {filteredData.length > 0 && (
            <div className="mt-4 p-4 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A]">
              <div className="text-sm font-medium text-[#F9FAFB] mb-2">Summary:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-medium text-[#9CA3AF]">Total SIPs:</span> <span className="text-[#F9FAFB]">{filteredData.length}</span>
                </div>
                <div>
                  <span className="font-medium text-[#9CA3AF]">Total Monthly SIP:</span> <span className="text-[#F9FAFB]">₹{filteredData.reduce((sum, item) => sum + item.sip_amount, 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-[#9CA3AF]">Total Current Value:</span> <span className="text-[#F9FAFB]">₹{filteredData.reduce((sum, item) => sum + item.current_value, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Section */}
          <div className="mt-8 text-xs text-[#9CA3AF]">
            <div className="font-bold text-[#F9FAFB] mb-2">Disclaimer:</div>
            <div className="mb-2">
              The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
            </div>
            <div className="mb-2">
              Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not guaranteeing or assuring any dividend under any of the schemes and the same is subject to the availability and adequacy of distributable surplus. Investors are requested to review the prospectus carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission disclosures, SID/SAI/KIM, Code of Conduct and privacy at : http://vedantasset.co.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPSTPReport;