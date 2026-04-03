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
    equity: "text-green-600",
    debt: "text-blue-600",
    hybrid: "text-purple-600",
    liquid: "text-blue-600",
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

    // Header
    doc.setFillColor(255, 165, 0); // Orange
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
    doc.setTextColor(0, 0, 0);
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

    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition, pageWidth - 30, 15, 'F');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total SIPs: ${totalSIPs} | Active SIPs: ${activeSIPs} | Total Monthly SIP: ₹${totalMonthlySIP.toLocaleString()} | Total Current Value: ₹${totalCurrentValue.toLocaleString()}`, 20, yPosition + 9);

    yPosition += 25;

    // Table headers
    const headers = [
      'Sno',
      'Investor',
      'AMC',
      'Scheme',
      'Folio',
      'Asset Type',
      'Start Date',
      'Txn Type',
      'Debit Day',
      'Install Amt',
      'Inst Paid',
      'Unit Balance',
      'Curr Value',
      'XIRR %'
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

    // Manual table creation since autoTable might not be working
    const rowHeight = 8;
    const cellPadding = 2;
    
    // Column widths (adjusted to fit landscape)
    const columnWidths = [10, 25, 20, 35, 25, 20, 20, 20, 15, 20, 15, 20, 20, 15];
    const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    
    // Scale factor to fit table width
    const scaleFactor = (pageWidth - 30) / totalTableWidth;
    const scaledColumnWidths = columnWidths.map(width => width * scaleFactor);

    // Draw table headers
    doc.setFillColor(59, 130, 246); // Blue header
    doc.rect(15, yPosition, pageWidth - 30, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);

    let xPosition = 17;
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition + 5);
      xPosition += scaledColumnWidths[index];
    });

    yPosition += rowHeight;

    // Draw table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);

    tableData.forEach((row, rowIndex) => {
      // Check for page break
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
        
        // Redraw headers on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(15, yPosition, pageWidth - 30, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        
        xPosition = 17;
        headers.forEach((header, index) => {
          doc.text(header, xPosition, yPosition + 5);
          xPosition += scaledColumnWidths[index];
        });
        
        yPosition += rowHeight;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
      }

      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(240, 240, 240);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, yPosition, pageWidth - 30, rowHeight, 'F');

      // Draw row data
      xPosition = 17;
      row.forEach((cell, cellIndex) => {
        doc.text(cell.toString(), xPosition, yPosition + 5);
        xPosition += scaledColumnWidths[cellIndex];
      });

      yPosition += rowHeight;
    });

    // Footer
    const footerY = Math.min(yPosition + 10, pageHeight - 10);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Vedant Asset Management Pvt. Ltd. | SEBI Registration No.: INZ000123456', 
             pageWidth / 2, footerY, { align: 'center' });

    doc.save(`${name}_SIP_SWP_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export to Excel function
  const exportToExcel = async () => {
    if (!filteredData.length) {
      alert('No data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SIP SWP Report');

    // Add header
    worksheet.mergeCells('A1:N2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'VEDANT ASSET - SIP/SWP REPORT';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFEA580C' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF3C7' }
    };

    // Investor details
    worksheet.mergeCells('A3:N3');
    const investorCell = worksheet.getCell('A3');
    investorCell.value = `Investor: ${name} | PAN: ${pan} | Period: ${fromDate} to ${toDate} | Generated: ${new Date().toLocaleDateString()}`;
    investorCell.font = { bold: true, size: 11 };
    investorCell.alignment = { horizontal: 'center' };
    investorCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    // Summary
    const totalSIPs = filteredData.length;
    const activeSIPs = filteredData.filter(item => item.sip_status === 'Active').length;
    const totalMonthlySIP = filteredData.reduce((sum, item) => sum + item.sip_amount, 0);
    const totalCurrentValue = filteredData.reduce((sum, item) => sum + item.current_value, 0);

    worksheet.mergeCells('A4:N4');
    const summaryCell = worksheet.getCell('A4');
    summaryCell.value = `Summary: Total SIPs: ${totalSIPs} | Active SIPs: ${activeSIPs} | Total Monthly SIP: ₹${totalMonthlySIP.toLocaleString()} | Total Current Value: ₹${totalCurrentValue.toLocaleString()}`;
    summaryCell.font = { bold: true, size: 10 };
    summaryCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F9FF' }
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
      fgColor: { argb: 'FF4B5563' }
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
          fgColor: { argb: 'FFF3F4F6' }
        };
      }

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
    footer.font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
    footer.alignment = { horizontal: 'center' };

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
      <div className="w-full bg-white">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="ml-4">Loading SIP/SWP data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Compact Header with all information together */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-start">
          {/* Left side: Back button and Company info */}
          <div className="flex-1">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-3"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            
            {/* All company info together */}
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-orange-500">
                Vedant<span className="text-black">Asset</span>
                <span className="text-black text-sm font-normal ml-3">
                  | 3rd Floor, Gayways House, Above Space Furniture, P.P Compound, Main Road Ranchi 834001 Jharkhand
                </span>
              </h1>
              
              <div className="text-xs text-gray-700">
                <span className="font-semibold"></span> 9304955509 | 
                <span className="font-semibold ml-2"></span> vedantasset@gmail.com | 
                <span className="font-semibold ml-2"></span> 
                <a href="https://www.vedantasset.co.in" className="text-blue-600 hover:underline ml-1">
                  www.vedantasset.co.in
                </a>
              </div>
            </div>
          </div>

          {/* Right side: Export buttons and Investor info */}
          <div className="flex flex-col items-end gap-2">
            {/* Export buttons in a row */}
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition-colors text-sm"
                title="Export to PDF"
              >
                <FileDown size={16} />
                <span>PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md border border-green-200 transition-colors text-sm"
                title="Export to Excel"
              >
                <FileSpreadsheet size={16} />
                <span>Excel</span>
              </button>
            </div>

            {/* Investor info in one line */}
            <div className="text-xs text-gray-700 text-right">
              <span className="font-semibold">Investor:</span> {name} | 
              <span className="font-semibold ml-2">PAN:</span> {pan}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Report Controls */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded text-sm"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sip_stp">SIP/STP</option>
                <option value="ledger">Ledger</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <div className="relative">
                <DatePicker
                  selected={fromDate ? new Date(fromDate) : null}
                  onChange={(date: Date | null) => {
                    setFromDate(date ? date.toISOString().split("T")[0] : "");
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholderText="Select From Date"
                />
                <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <div className="relative">
                <DatePicker
                  selected={toDate ? new Date(toDate) : null}
                  onChange={(date: Date | null) => {
                    setToDate(date ? date.toISOString().split("T")[0] : "");
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholderText="Select To Date"
                />
                <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={handleDateRangeChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">SIP/SWP Report</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <Filter size={16} />
              <span>Filters</span>
              {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {[statusFilter, amcFilter, schemeTypeFilter, minAmountFilter, maxAmountFilter]
                    .filter(f => f !== 'all' && f !== '').length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* AMC Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">AMC</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={amcFilter}
                    onChange={(e) => setAmcFilter(e.target.value)}
                  >
                    <option value="all">All AMCs</option>
                    {uniqueAmcs.map(amc => (
                      <option key={amc} value={amc}>{amc}</option>
                    ))}
                  </select>
                </div>

                {/* Scheme Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={schemeTypeFilter}
                    onChange={(e) => setSchemeTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {uniqueSchemeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">SIP Amount Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                      value={minAmountFilter}
                      onChange={(e) => setMinAmountFilter(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                      value={maxAmountFilter}
                      onChange={(e) => setMaxAmountFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X size={14} />
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || amcFilter !== 'all' || schemeTypeFilter !== 'all' || minAmountFilter || maxAmountFilter) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {amcFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  AMC: {amcFilter}
                  <button
                    onClick={() => setAmcFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {schemeTypeFilter !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Type: {schemeTypeFilter}
                  <button
                    onClick={() => setSchemeTypeFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(minAmountFilter || maxAmountFilter) && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                  Amount: {minAmountFilter || '0'} - {maxAmountFilter || '∞'}
                  <button
                    onClick={() => {
                      setMinAmountFilter('');
                      setMaxAmountFilter('');
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
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
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-1 border border-gray-300 rounded text-sm"
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
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Sno</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Investor</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">AMC</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Scheme</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Folio</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Asset Type</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Start Date</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Transaction Type</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Debit Day</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Installment Amt (Rs)</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Installments Paid</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Unit Balance</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Current Value (Rs)</th>
                <th className="border border-gray-400 px-2 py-2 text-xs font-medium text-left">Return% (XIRR pa)</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-2 py-1 text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.inv_name}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.amc_code}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    <span >
                      {item.scheme}
                    </span>
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    <span >
                      {item.folio_no}
                    </span>
                  </td>
                  <td
                    className={`border border-gray-400 px-2 py-1 text-xs font-semibold
    ${assetTypeColors[item.scheme_typ?.toLowerCase()] ||
                      "bg-yellow-500 text-black" 
                      }
  `}
                  >
                    {item.scheme_typ}
                  </td>

                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.start_date}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.trn_typ}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.debit_day}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.sip_amount.toLocaleString()}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.installments_paid}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.unit_balance.toFixed(3)}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.current_value.toLocaleString()}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{item.xirr_return.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Bottom */}
        {filteredData.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Navigation */}
              <div className="flex items-center gap-1">
                <span className="text-sm">Page</span>
                
                <form onSubmit={handlePageInputSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInput}
                    className="w-12 p-1 border border-gray-300 rounded text-center text-sm"
                    placeholder={currentPage.toString()}
                  />
                </form>
                
                <span className="text-sm">of {totalPages}</span>
              </div>
              
              {/* Next Page Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-red-500 font-medium">
              No SIP/SWP match your current filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Summary */}
        {filteredData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="text-sm font-medium mb-2">Summary:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="font-medium">Total SIPs:</span> {filteredData.length}
              </div>
           
              <div>
                <span className="font-medium">Total Monthly SIP:</span> ₹{filteredData.reduce((sum, item) => sum + item.sip_amount, 0).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Total Current Value:</span> ₹{filteredData.reduce((sum, item) => sum + item.current_value, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer Section */}
        <div className="mt-8 text-xs text-black">
          <div className="font-bold mb-2">Disclaimer:</div>
          <div className="mb-2">
            The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
          </div>
          <div className="mb-2">
            Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not guaranteeing or assuring any dividend under any of the schemes and the same is subject to the availability and adequacy of distributable surplus. Investors are requested to review the prospectus carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission disclosures, SID/SAI/KIM, Code of Conduct and privacy at : http://vedantasset.co.in
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPSTPReport;