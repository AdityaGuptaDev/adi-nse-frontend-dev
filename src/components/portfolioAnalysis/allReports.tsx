"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
} from "chart.js";
import {
  fetchPortfolioDetails,
  processPortfolioData,
  calculateSummary,
  fetchClientDetails,
  ProcessedRow,
  fetchPortfolioDetails1
} from "@/services/portfolioService";
import { ArrowLeft, FileDown, FileSpreadsheet, MessageCircle, Minus, Plus, Printer, Send } from "lucide-react";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import router from "next/router";
import ExcelJS from 'exceljs';


ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface AllReportsProps {
  invName: string;
  panNo: string;
  onBack: () => void;
  clientName: string;
}

interface GroupedPortfolioItem {
  folioNo: string;
  productName: string;
  transactions: ProcessedRow[];
  id?: number;
  transactionType?: string;
  purchaseDate?: string;
  balanceUnits?: string;
  price?: string;
  totalUnit?: string;
  costValue?: string;
  divPaid?: string;
  div?: string;
  divReinv?: string;
  days?: number;
  currentNav?: string;
  currentValue?: string;
  profitLoss?: string;
  absPercentage?: string;
  cost?: string;
  cagr?: string;
  schemeType?: string;
  pan?: string;
  invName?: string;
  recordType?: string;
}

interface PortfolioSummary {
  totalCost: string;
  totalCurrentValue: string;
  totalProfitLoss: string;
  totalUnits: string;
  totalAbsPercentage: string;
  totalCagrPercentage: string;
  assetTypes: Record<string, number>;
  subClassification: Record<string, number>;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  pincode?: string;
  email?: string;
  mobile?: string;
}

const AllReports: React.FC<AllReportsProps> = ({ invName, panNo, onBack }: AllReportsProps) => {
  const [portfolioData, setPortfolioData] = useState<ProcessedRow[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const handleBack = () => {
    onBack ? onBack() : router.back();
  };

  const toggleRow = (schemeKey: string) => {
    setExpandedRows(prev => {
      if (prev[schemeKey]) {
        const newState = { ...prev };
        delete newState[schemeKey];
        return newState;
      }
      return { [schemeKey]: true };
    });
  };


  const groupedData = portfolioData.reduce((acc, item) => {
    const key = `${item.folioNo}-${item.productName}`;

    if (!acc[key]) {
      acc[key] = {
        folioNo: item.folioNo,
        productName: item.productName,
        transactions: []
      };
    }
    // Add parent record first, then child records
    if (item.recordType === 'P') {

      const existingParentIndex = acc[key].transactions.findIndex(t => t.recordType === 'P');
      if (existingParentIndex >= 0) {
        acc[key].transactions[existingParentIndex] = item;
      } else {
        acc[key].transactions.unshift(item);
      }
    } else {
      acc[key].transactions.push(item);
    }

    return acc;
  }, {} as Record<string, GroupedPortfolioItem>);

  // Filter out parent records where both Purchase Units and Price are zero
  const filteredGroupedData = Object.entries(groupedData).filter(([key, group]) => {
    const parentRecord = group.transactions.find(t => t.recordType === 'P');
    
    if (parentRecord) {
      const purchaseUnits = parseFloat(parentRecord.balanceUnits || '0');
      const price = parseFloat(parentRecord.price || '0');
      
      // Only include if NOT (both are zero)
      return !(purchaseUnits === 0 && price === 0);
    }
    
    return true; // Keep groups without parent records
  });

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);

        // Fetch both portfolio details and client details using the service functions
        const [portfolioResponse, clientDetails] = await Promise.all([
          fetchPortfolioDetails(invName, panNo),
          fetchClientDetails(panNo, invName)
        ]);

        const items = portfolioResponse.data.data || [];
        const processedData = processPortfolioData(items);
        const summaryData = calculateSummary(processedData);
        setPortfolioData(processedData);
        setSummary({
          ...summaryData,
          address1: clientDetails.address1,
          address2: clientDetails.address2,
          address3: clientDetails.address3,
          city: clientDetails.city,
          pincode: clientDetails.pincode,
          email: clientDetails.email,
          mobile: clientDetails.mobile_no
        });
      } catch (error) {
        console.error("Error loading portfolio details:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [invName, panNo]);

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const ordinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
  } catch (error) {
    return dateString; 
  }
};
  //helpers method
  const formatValue = (
    value: string | number | undefined,
    isParent = false,
    isPercentage = false
  ): string => {
    if (!isParent || value === undefined || value === null) {
      if (isPercentage && value) {
        return `${value}%`;
      }
      return value?.toString() || '';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numValue === 0 || numValue === 0.00) {
      return '---';
    }

    if (typeof value === 'string' && (value === '0' || value === '0.00' || value === '0.0')) {
      return '---';
    }
    if (isPercentage) {
      return `${value}%`;
    }
    return value.toString();
  };


  const fetchDataWithDate = async (date: string) => {
    try {
      setLoading(true);
      const [portfolioResponse, clientDetails] = await Promise.all([
        fetchPortfolioDetails1(invName, panNo, date),
        fetchClientDetails(panNo, invName)
      ]);

      const items = portfolioResponse.data.data || [];
      const processedData = processPortfolioData(items);
      const summaryData = calculateSummary(processedData);


      setPortfolioData(processedData);
      setSummary({
        ...summaryData,
        address1: clientDetails.address1,
        address2: clientDetails.address2,
        address3: clientDetails.address3,
        city: clientDetails.city,
        pincode: clientDetails.pincode,
        email: clientDetails.email,
        mobile: clientDetails.mobile_no
      });
    } catch (error) {
      console.error("Error fetching portfolio data with date:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add search handler function
  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      await fetchDataWithDate(reportDate);
    } catch (error) {
      console.error("Error searching with date:", error);
    } finally {
      setSearchLoading(false);
    }
  };


const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Portfolio Report');

  worksheet.columns = [
    { header: 'S.No.', key: 'sno', width: 8 },
    { header: 'Folio No.', key: 'folioNo', width: 15 },
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Transaction Type', key: 'transactionType', width: 20 },
    { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
    { header: 'Purchase Units', key: 'purchaseUnits', width: 15 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Cost Value', key: 'costValue', width: 15 },
    { header: 'Divident', key: 'divident', width: 12 },
    { header: 'Div Reinvestment', key: 'divReinvestment', width: 15 },
    { header: 'No of Days', key: 'days', width: 12 },
    { header: 'Current NAV', key: 'currentNav', width: 15 },
    { header: 'Current Value', key: 'currentValue', width: 15 },
    { header: 'P+L', key: 'profitLoss', width: 15 },
    { header: 'Abs%', key: 'absPercentage', width: 12 },
    { header: 'CAGR%', key: 'cagr', width: 12 },
  ];

  // Style for header row
  worksheet.getRow(1).font = { bold: true, size: 11 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  worksheet.getRow(1).eachCell((cell: any) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  let rowIndex = 2;
  let serialNumber = 1;

  // Use filtered data for Excel export too
  filteredGroupedData.forEach(([key, group]) => {
    const parentRecord = group.transactions.find(t => t.recordType === 'P');
    const childRecords = group.transactions.filter(t => t.recordType === 'C');

    // Add parent record with styling
    if (parentRecord) {
      const parentRow = worksheet.addRow({
        sno: serialNumber++,
        folioNo: parentRecord.folioNo,
        productName: parentRecord.productName,
        transactionType: 'SUMMARY',
        purchaseDate: parentRecord.transactionNo || '', 
        purchaseUnits: parseFloat(parentRecord.balanceUnits || '0'),
        price: parseFloat(parentRecord.price || '0'),
        costValue: parseFloat(parentRecord.costValue || '0'),
        divident: parseFloat(parentRecord.div || '0'),
        divReinvestment: parseFloat(parentRecord.divReinv || '0'),
        days: parseInt(parentRecord.days?.toString() || '0'),
        currentNav: parseFloat(parentRecord.currentNav || '0'),
        currentValue: parseFloat(parentRecord.currentValue || '0'),
        profitLoss: parseFloat(parentRecord.profitLoss || '0'),
        absPercentage: parseFloat(parentRecord.absPercentage || '0'),
        cagr: parseFloat(parentRecord.cagr || '0'),
      });

      parentRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F1FF' }
      };
      parentRow.font = { bold: true };
      parentRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      rowIndex++;
    }

    childRecords.forEach((tx, tIdx) => {
      const childRow = worksheet.addRow({
        sno: '',
        folioNo: tx.folioNo,
        productName: tx.productName,
        transactionType: tx.transactionType,
        purchaseDate: tx.purchaseDate, 
        purchaseUnits: parseFloat(tx.balanceUnits || '0'),
        price: parseFloat(tx.price || '0'),
        costValue: parseFloat(tx.cost || '0'),
        divident: parseFloat(tx.div || '0'),
        divReinvestment: parseFloat(tx.divReinv || '0'),
        days: parseInt(tx.days?.toString() || '0'),
        currentNav: parseFloat(tx.currentNav || '0'),
        currentValue: parseFloat(tx.currentValue || '0'),
        profitLoss: parseFloat(tx.profitLoss || '0'),
        absPercentage: parseFloat(tx.absPercentage || '0'),
        cagr: parseFloat(tx.cagr || '0'),
      });

      // Style child rows with light gray background
      childRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
      childRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      rowIndex++;
    });
  });

  // Apply number and date formatting
  worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber > 1) {
      const dateCell = row.getCell(5); 
      if (dateCell.value && typeof dateCell.value === 'string') {
        const cellValue = dateCell.value.toString();
        if (cellValue.includes('/') || cellValue.includes('-')) {
          const dateValue = new Date(cellValue);
          if (!isNaN(dateValue.getTime())) {
            dateCell.value = dateValue;
            dateCell.numFmt = 'dd-mm-yyyy';
          }
        }

      }
      const numericColumns = [6, 7, 8, 9, 10, 11, 12, 13];
      numericColumns.forEach(colIndex => {
        const cell = row.getCell(colIndex);
        const cellValue = cell.value;
        
        if (cellValue !== null && cellValue !== undefined && typeof cellValue === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });
  
      const percentageColumns = [14, 15];
      percentageColumns.forEach(colIndex => {
        const cell = row.getCell(colIndex);
        const cellValue = cell.value;
        
        if (cellValue !== null && cellValue !== undefined && typeof cellValue === 'number') {
          cell.numFmt = '0.00%';
        }
      });
    }
  });

  // Calculate totals
  const parentRecords = portfolioData.filter(item => item.recordType === 'P');
  const totals = {
    purchaseUnits: parentRecords.reduce((sum, item) => sum + parseFloat(item.balanceUnits || '0'), 0),
    costValue: parentRecords.reduce((sum, item) => sum + parseFloat(item.costValue || '0'), 0),
    currentValue: parentRecords.reduce((sum, item) => sum + parseFloat(item.currentValue || '0'), 0),
    profitLoss: parentRecords.reduce((sum, item) => sum + parseFloat(item.profitLoss || '0'), 0),
  };

  // Add totals row with styling
  const totalRow = worksheet.addRow({
    sno: rowIndex - 1,
    folioNo: '',
    productName: '',
    transactionType: '',
    purchaseDate: '',
    purchaseUnits: totals.purchaseUnits,
    price: '',
    costValue: totals.costValue,
    divident: '',
    divReinvestment: '',
    days: '',
    currentNav: 'Total',
    currentValue: totals.currentValue,
    profitLoss: totals.profitLoss,
    absPercentage: parseFloat(summary?.totalAbsPercentage || '0'),
    cagr: parseFloat(summary?.totalCagrPercentage || '0'),
  });

  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F5E8' }
  };
  totalRow.font = { bold: true };
  totalRow.eachCell((cell: any) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Format totals row
  const numericColumns = [6, 7, 8, 9, 10, 11, 12, 13];
  numericColumns.forEach(colIndex => {
    const cell = totalRow.getCell(colIndex);
    const cellValue = cell.value;
    
    if (cellValue !== null && cellValue !== undefined && typeof cellValue === 'number') {
      cell.numFmt = '#,##0.00';
    }
  });
  
  const percentageColumns = [14, 15];
  percentageColumns.forEach(colIndex => {
    const cell = totalRow.getCell(colIndex);
    const cellValue = cell.value;
    
    if (cellValue !== null && cellValue !== undefined && typeof cellValue === 'number') {
      cell.numFmt = '0.00%';
    }
  });

  // Write to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invName}_Portfolio_Report.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
// excel for particular data
const exportToExcel1 = async () => {
  if (!summary) {
    alert('No portfolio data available to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Portfolio Report');

  // Add company header
  worksheet.mergeCells('A1:P2');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'VEDANT ASSET - PORTFOLIO REPORT';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFEA580C' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF3C7' }
  };

  // Investor details
  worksheet.mergeCells('A3:P3');
  const investorCell = worksheet.getCell('A3');
  investorCell.value = `Investor: ${invName} | PAN: ${panNo} | Date: ${new Date().toLocaleDateString()}`;
  investorCell.font = { bold: true, size: 11 };
  investorCell.alignment = { horizontal: 'center' };
  investorCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' }
  };

  // Column headers with styling
  worksheet.columns = [
    { header: 'S.No.', key: 'sno', width: 6 },
    { header: 'Folio No.', key: 'folioNo', width: 15 },
    { header: 'Product Name', key: 'productName', width: 35 },
    { header: 'Transaction Type', key: 'transactionType', width: 18 },
    { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
    { header: 'Units', key: 'units', width: 12, style: { numFmt: '#,##0.00' } },
    { header: 'Price (₹)', key: 'price', width: 12, style: { numFmt: '#,##0.00' } },
    { header: 'Cost Value (₹)', key: 'costValue', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Dividend (₹)', key: 'dividend', width: 12, style: { numFmt: '#,##0.00' } },
    { header: 'Div Reinvest (₹)', key: 'divReinvest', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Days', key: 'days', width: 8 },
    { header: 'Current NAV (₹)', key: 'currentNav', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Current Value (₹)', key: 'currentValue', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'P/L (₹)', key: 'profitLoss', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Abs %', key: 'absPercentage', width: 10, style: { numFmt: '0.00%' } },
    { header: 'CAGR %', key: 'cagr', width: 10, style: { numFmt: '0.00%' } }
  ];

  // Style header row
  const headerRow = worksheet.getRow(5);
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

  let rowIndex = 6;
  let serialNumber = 1;

  // Add data rows based on current view (expanded state)
  filteredGroupedData.forEach(([key, group]) => {
    const parentRecord = group.transactions.find(t => t.recordType === 'P');
    const childRecords = group.transactions.filter(t => t.recordType === 'C');
    const isExpanded = expandedRows[key];

    // Only include parent records that are visible
    if (parentRecord) {
      const parentRow = worksheet.addRow({
        sno: serialNumber++,
        folioNo: parentRecord.folioNo,
        productName: parentRecord.productName,
        transactionType: 'SUMMARY',
        purchaseDate: parentRecord.transactionNo ? formatDate(parentRecord.transactionNo) : '',
        units: parseFloat(parentRecord.balanceUnits || '0'),
        price: parseFloat(parentRecord.price || '0'),
        costValue: parseFloat(parentRecord.costValue || '0'),
        dividend: parseFloat(parentRecord.div || '0'),
        divReinvest: parseFloat(parentRecord.divReinv || '0'),
        days: parseInt(parentRecord.days?.toString() || '0'),
        currentNav: parseFloat(parentRecord.currentNav || '0'),
        currentValue: parseFloat(parentRecord.currentValue || '0'),
        profitLoss: parseFloat(parentRecord.profitLoss || '0'),
        absPercentage: parseFloat(parentRecord.absPercentage || '0') / 100,
        cagr: parseFloat(parentRecord.cagr || '0') / 100
      });

      // Style parent row
      parentRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF6FF' }
      };
      parentRow.font = { bold: true, size: 10 };
      parentRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      rowIndex++;

      // Add child rows only if expanded
      if (isExpanded && childRecords.length > 0) {
        childRecords.forEach((tx, tIdx) => {
          const childRow = worksheet.addRow({
            sno: '',
            folioNo: tx.folioNo,
            productName: tx.productName,
            transactionType: tx.transactionType,
            purchaseDate: tx.purchaseDate,
            units: parseFloat(tx.balanceUnits || '0'),
            price: parseFloat(tx.price || '0'),
            costValue: parseFloat(tx.cost || '0'),
            dividend: parseFloat(tx.div || '0'),
            divReinvest: parseFloat(tx.divReinv || '0'),
            days: parseInt(tx.days?.toString() || '0'),
            currentNav: parseFloat(tx.currentNav || '0'),
            currentValue: parseFloat(tx.currentValue || '0'),
            profitLoss: parseFloat(tx.profitLoss || '0'),
            absPercentage: parseFloat(tx.absPercentage || '0') / 100,
            cagr: parseFloat(tx.cagr || '0') / 100
          });

          // Style child rows
          childRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
          childRow.font = { size: 9 };
          childRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
          rowIndex++;
        });
      }
    }
  });

  // Add summary section
  worksheet.mergeCells(`A${rowIndex + 1}:P${rowIndex + 1}`);
  const summaryTitle = worksheet.getCell(`A${rowIndex + 1}`);
  // summaryTitle.value = 'PORTFOLIO SUMMARY';
  summaryTitle.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summaryTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF059669' }
  };
  summaryTitle.alignment = { horizontal: 'center' };

  // Summary data with null checks
  const summaryData = [
    ['Total Cost Value', `₹${summary.totalCost || '0.00'}`],
    ['Total Current Value', `₹${summary.totalCurrentValue || '0.00'}`],
    ['Net Gain/Loss', `₹${summary.totalProfitLoss || '0.00'}`],
    ['Absolute Return', `${summary.totalAbsPercentage || '0.00'}%`],
    // ['CAGR Return', `${summary.totalCagrPercentage || '0.00'}%`]
  ];

  summaryData.forEach(([label, value], index) => {
    worksheet.mergeCells(`A${rowIndex + 2 + index}:O${rowIndex + 2 + index}`);
    const labelCell = worksheet.getCell(`A${rowIndex + 2 + index}`);
    labelCell.value = label;
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: 'right' };

    const valueCell = worksheet.getCell(`P${rowIndex + 2 + index}`);
    valueCell.value = value;
    valueCell.font = { bold: true, color: { argb: label.includes('Gain') ? 'FF16A34A' : 'FF000000' } };
  });

  // Add footer
  const footerRow = rowIndex + 2 + summaryData.length + 2;
  worksheet.mergeCells(`A${footerRow}:P${footerRow}`);
  const footer = worksheet.getCell(`A${footerRow}`);
  footer.value = 'Generated by Vedant Asset Management Pvt. Ltd. | SEBI Registration No.: INZ000123456';
  footer.font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
  footer.alignment = { horizontal: 'center' };

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    if (column.width) {
      column.width = Math.min(column.width + 2, 50);
    }
  });

  // Write to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invName}_Portfolio_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


  const generatePDF = async () => {
    if (!reportRef.current) return;
    const originalExpandedState = { ...expandedRows };

    try {
      // Expand all rows for PDF generation
      const allExpanded: Record<string, boolean> = {};
      filteredGroupedData.forEach(([key]) => {
        allExpanded[key] = true;
      });
      setExpandedRows(allExpanded);

      await new Promise(resolve => setTimeout(resolve, 500));
      const reportClone = reportRef.current.cloneNode(true) as HTMLElement;

      const html = reportClone.innerHTML;
      const fixedHtml = html.replace(/oklch\([^)]*\)/g, 'rgb(0, 0, 0)');
      reportClone.innerHTML = fixedHtml;
      const elementsToRemove = [
        reportClone.querySelector('.action-buttons'),
        reportClone.querySelector('.text-right')
      ];

      elementsToRemove.forEach(el => el?.remove());

      const headerHTML = `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #f97316;
      padding-bottom: 15px;
    ">
      <div>
        <h1 style="
          font-size: 22px;
          font-weight: bold;
          color: #f97316;
          margin: 0;
        ">
          Vedant<span style="color: #000">Asset</span>
        </h1>
        <p style="
          font-size: 9px;
          color: #666;
          margin-top: 5px;
          font-style: italic;
        ">
          Wealth Management Experts Since 2010
        </p>
      </div>
      
      <div style="text-align: right;">
        <div style="
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          display: inline-block;
        ">
          <p style="margin: 0; font-size: 10px; font-weight: bold;">
            Statement Date: ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}
          </p>
        </div>
      </div>
    </div>
  `;

      // Insert our new header
      reportClone.insertAdjacentHTML('afterbegin', headerHTML);

      // Footer HTML
      const footerHTML = `
    <div style="
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      font-size: 8px;
      color: #666;
      text-align: center;
    ">
      <p>Vedant Asset Management Pvt. Ltd. • SEBI Registration No.: INZ000123456</p>
      <p>This is an electronically generated statement. No signature required.</p>
    </div>
  `;

      // Add footer
      reportClone.insertAdjacentHTML('beforeend', footerHTML);

      // Create a new HTML structure for PDF generation
      const htmlContent = `
    <html>
      <head>
        <title>${invName} Portfolio Report</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white !important;
            color: #333;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9px; 
            margin: 10px 0;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f8f8 !important; 
            font-weight: 600;
            color: #444;
          }
          .text-right { 
            text-align: right; 
          }
          .text-center { 
            text-align: center; 
          }
          .border { 
            border: 1px solid #ddd !important; 
          }
          .bg-[#0A0A0A] { 
            background-color: #f9fafb !important; 
          }
          .bg-[#1F1A1A] { 
            background-color: #eff6ff !important; 
          }
          .bg-[#111111] { 
            background-color: #ffffff !important; 
          }
          .font-semibold { 
            font-weight: 600 !important; 
          }
          .text-green-600 { 
            color: #16a34a !important; 
          }
          .text-[#F59E0B] { 
            color: #2563eb !important; 
          }
          .text-orange-500 { 
            color: #f97316 !important; 
          }
          .shadow-sm { 
            box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important; 
          }
          .rounded-md { 
            border-radius: 4px !important; 
          }
          h2 {
            color: #f97316;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        ${reportClone.innerHTML}
      </body>
    </html>
  `;

      // Create a new window for PDF generation
      const pdfWindow = window.open('', '', 'width=1200,height=800');
      if (pdfWindow) {
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();

        // Use html2canvas and jsPDF to generate the PDF
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(pdfWindow.document.body, {
          scale: 2, // Higher quality
          logging: false,
          useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${invName}_Portfolio_Report.pdf`);
        pdfWindow.close();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setExpandedRows(originalExpandedState);
    }
  };
  const handlePrint = () => {
    if (!reportRef.current) return;

    const printWindow = window.open('', '', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${invName} Portfolio Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 10px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 4px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2 !important; 
              }
              .text-right { 
                text-align: right; 
              }
              .text-center { 
                text-align: center; 
              }
              .border { 
                border: 1px solid #ddd !important; 
              }
              .bg-[#0A0A0A] { 
                background-color: #f9fafb !important; 
              }
              .bg-[#1F1A1A] { 
                background-color: #eff6ff !important; 
              }
              .bg-[#111111] { 
                background-color: #ffffff !important; 
              }
              .font-semibold { 
                font-weight: 600 !important; 
              }
              .text-green-600 { 
                color: #16a34a !important; 
              }
              .text-[#F59E0B] { 
                color: #2563eb !important; 
              }
              .text-orange-500 { 
                color: #f97316 !important; 
              }
              .shadow-sm { 
                box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important; 
              }
              .rounded-md { 
                border-radius: 0.375rem !important; 
              }
              .action-buttons { 
                display: none !important; 
              }
            </style>
          </head>
          <body>
            ${reportRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Delay printing to ensure styles are applied
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      // Fallback if popup is blocked
      window.print();
    }
  };

  // const sendEmail = async () => {
  //   try {

  //     await generatePDF(); 

  //     // Prepare email content
  //     const emailSubject = `${invName}'s Portfolio Report`;
  //     const emailBody = `Dear Investor,\n\nPlease find attached your portfolio report.\n\nRegards,\nVedant Asset Team`;

  //     // Create mailto link (note: attachments don't work in most browsers via mailto)
  //     const mailtoLink = `mailto:${summary?.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  //     // Open user's email client
  //     window.location.href = mailtoLink;

  //     // For testing purposes
  //     alert(`Email client opened with:\nTo: ${summary?.email}\nSubject: ${emailSubject}\n\nNote: PDF attachment must be added manually in your email client.`);

  //   } catch (error) {
  //     console.error('Error in email sending:', error);
  //     alert('Failed to prepare email. See console for details.');
  //   }
  // };

  // const sendWhatsApp = () => {
  //   const message = `Portfolio Report for ${invName} (PAN: ${panNo}):\n` +
  //     `Total Current Value: ₹${summary?.totalCurrentValue || 'N/A'}\n` +
  //     `Net Gain/Loss: ₹${summary?.totalProfitLoss || 'N/A'}`;

  //   const encodedMessage = encodeURIComponent(message);
  //   window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  // };

  if (loading) {
    return <div className="p-4 text-center text-[#9CA3AF]">Loading report...</div>;
  }

  if (!portfolioData.length || !summary) {
    return <div className="p-4 text-center text-[#9CA3AF]">No data found for this investor.</div>;
  }

  return (
    <div className="text-[11px] font-sans text-black bg-[#111111] p-4" ref={reportRef}>
      {/* Header Section */}
      <div className="border-b border-black pb-2 mb-2">
        <button
          onClick={handleBack}
          className="flex items-center bg-[#F59E0B] text-[#F9FAFB] hover:bg-[#B45309] transition-colors px-4 py-2 rounded"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">
              Vedant<span className="text-black">Asset</span>
            </h1>
            <div className="mt-2 text-xs">
              <p><strong>Investor:</strong> {invName}</p>
              <p>
                <strong>Address:</strong>{" "}
                {`${summary?.address1 || ""} ${summary?.address2 || ""} ${summary?.address3 || ""}, ${summary?.city || ""} - ${summary?.pincode || ""}`}
              </p>
              <p><strong>PAN:</strong> {panNo}</p>
              <p><strong>Email:</strong> {summary?.email || "Not available"}</p>
              <p><strong>Mobile No:</strong> {summary?.mobile || "Not available"}</p>
            </div>
            {/* Action Icons */}
            <div className="flex justify-left gap-3 mt-3 flex-wrap action-buttons">
              {[
                 { icon: <FileSpreadsheet size={18} className="text-[#F59E0B]" />, label: "Excel", action: exportToExcel1 },
                { icon: <FileSpreadsheet size={18} className="text-green-600" />, label: "Excel All Data", action: exportToExcel },
                { icon: <FileDown size={18} className="text-red-500" />, label: "PDF", action: generatePDF },
                // { icon: <Send size={18} className="text-[#F59E0B]" />, label: "Email", action: sendEmail },
                // { icon: <MessageCircle size={18} className="text-green-600" />, label: "WhatsApp", action: sendWhatsApp },
                { icon: <Printer size={18} className="text-[#9CA3AF]" />, label: "Print", action: handlePrint },
               
              ].map((item, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center group hover:bg-[#0A0A0A] rounded p-1"
                  onClick={item.action}
                >
                  <div className="p-1">{item.icon}</div>
                  <span className="text-xs mt-0.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-right text-xs">
            <p className="font-semibold text-base mb-1">vedant asset</p>
            <p>3rd Floor, Gayways House, Above Space Furniture, P.P Compound,</p>
            <p>Main Road Ranchi 834001 Jharkhand</p>
            <p>Phone: 9304955509, Email: vedantasset@gmail.com</p>
            <p>Website: <a href="https://www.vedantasset.co.in" className="text-[#F59E0B] hover:underline">www.vedantasset.co.in</a></p>

            {/* Filters */}
            <div className="mt-3">
              <p className="mb-1">
                <strong>Statement Date:</strong>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="ml-2 border px-2 py-1 rounded text-sm"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="ml-2 bg-[#F59E0B] text-[#F9FAFB] px-3 py-1 rounded text-sm hover:bg-[#F59E0B] disabled:bg-blue-300"
                >
                  {searchLoading ? 'Loading...' : 'Search'}
                </button>
              </p>

              <p className="mb-1">
                <strong>Asset Class:</strong>
                <select className="ml-1 border px-1"><option>All Assets</option></select>
              </p>
              <p className="mb-1">
                <strong>Report Type:</strong>
                <select className="ml-1 border px-1"><option>Current Holding</option></select>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
     <div className="overflow-auto mt-4 border border-[#2A2A2A] text-[10px]">
        <table className="w-full border-collapse text-[10px]">
          <thead className="bg-[#111111] border-b border-[#2A2A2A]">
            <tr className="text-left">
              <th className="p-1 border-r">S.No.</th>
              <th className="p-1 border-r">Folio No.</th>
              <th className="p-1 border-r">Product Name</th>
              <th className="p-1 border-r">Transaction Type</th>
              <th className="p-1 border-r">Purchase Date</th>
              <th className="p-1 border-r">Purchase Units</th>
              <th className="p-1 border-r">Price</th>
              <th className="p-1 border-r">Cost Value</th>
              <th className="p-1 border-r">Divident</th>
              <th className="p-1 border-r">Div Reinvestment</th>
              <th className="p-1 border-r">No of Days</th>
              <th className="p-1 border-r">Current NAV</th>
              <th className="p-1 border-r">Current Value</th>
              <th className="p-1 border-r">P+L</th>
              <th className="p-1 border-r">Abs%</th>
              <th className="p-1">CAGR%</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroupedData.map(([key, group], idx) => {
              const parentRecord = group.transactions.find(t => t.recordType === 'P');
              const childRecords = group.transactions.filter(t => t.recordType === 'C');
              const isExpanded = expandedRows[key];
              const hasTransactions = childRecords.length > 0;

              return (
                <React.Fragment key={key}>
                  {/* Parent Row (Scheme Summary) */}
                  {parentRecord && (
                    <tr className="bg-[#111111] font-semibold">
                      <td className="p-1 border text-center">{idx + 1}</td> {/* Serial number */}
                      <td className="p-1 border">{parentRecord.folioNo}</td>
                      <td className="p-1 border">{parentRecord.productName}</td>
                      <td className="p-1 border text-center">
                        {hasTransactions ? (
                          <button
                            className="text-[#F59E0B] hover:underline text-xs"
                            onClick={() => toggleRow(key)}
                          >
                            {isExpanded ? "Hide Transactions" : "View Transactions"}
                          </button>
                        ) : (
                          "No Transactions"
                        )}
                      </td>
                      <td className="p-1 border">{formatDate(parentRecord.transactionNo)}</td>
                      <td className="p-1 border">{parentRecord.balanceUnits}</td>
                      <td className="p-1 border">{parentRecord.price}</td>
                      <td className="p-1 border">{parentRecord.costValue}</td>
                      <td className="p-1 border">{parentRecord.div}</td>
                      <td className="p-1 border">{parentRecord.divReinv}</td>
                      <td className="p-1 border">{formatValue(parentRecord.days, true)}</td>
                      <td className="p-1 border">{formatValue(parentRecord.currentNav, true)}</td>
                      <td className="p-1 border">{formatValue(parentRecord.currentValue, true)}</td>
                      <td className="p-1 border">{formatValue(parentRecord.profitLoss, true)}</td>
                      <td className="p-1 border">{formatValue(parentRecord.absPercentage, true, true)}</td>
                      <td className="p-1 border">{formatValue(parentRecord.cagr, true, true)}</td>
                    </tr>
                  )}

                  {/* Child Rows (Transactions) */}
                  {isExpanded && childRecords.map((tx, tIdx) => (
                    <tr key={`${key}-${tIdx}`} className="bg-[#111111]">
                      <td className="p-1 border text-center">{tIdx + 1}</td> {/* Transaction serial number */}
                      <td className="p-1 border">{tx.folioNo}</td>
                      <td className="p-1 border">{tx.productName}</td>
                      <td className="p-1 border">{tx.transactionType}</td>
                      <td className="p-1 border">{tx.purchaseDate}</td>
                      <td className="p-1 border">{tx.balanceUnits}</td>
                      <td className="p-1 border">{tx.price}</td>
                      <td className="p-1 border">{tx.costValue}</td>
                      <td className="p-1 border">{tx.div}</td>
                      <td className="p-1 border">{tx.divReinv}</td>
                      <td className="p-1 border">{tx.days}</td>
                      <td className="p-1 border">{tx.currentNav}</td>
                      <td className="p-1 border">{tx.currentValue}</td>
                      <td className="p-1 border">{tx.profitLoss}</td>
                      <td className="p-1 border">{tx.absPercentage}%</td>
                      <td className="p-1 border">{tx.cagr}%</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Total Row */}
            <tr className="bg-[#1F1A1A] font-semibold">
              <td className="p-1 border text-center" colSpan={5}>Total</td>
              <td className="p-1 border">{summary.totalUnits}</td>
              <td className="p-1 border"></td>
              <td className="p-1 border">₹{summary.totalCost}</td>
              <td className="p-1 border"></td>
              <td className="p-1 border"></td>
              <td className="p-1 border"></td>
              <td className="p-1 border"></td>
              <td className="p-1 border">₹{summary.totalCurrentValue}</td>
              <td className="p-1 border">₹{summary.totalProfitLoss}</td>
              <td className="p-1 border">{summary.totalAbsPercentage}%</td>
              <td className="p-1 border"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Portfolio Snapshot */}
      <div className="mt-6 border border-[#2A2A2A] rounded-md p-4 bg-[#111111] shadow-sm">
        <h2 className="text-base font-bold mb-3 text-[#F9FAFB] border-b pb-2">Portfolio Snapshot</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#F9FAFB]">Total Cost of Purchase Units:</span>
            <span className="text-sm font-semibold">₹{summary.totalCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#F9FAFB]">Total Current Value:</span>
            <span className="text-sm font-semibold">₹{summary.totalCurrentValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#F9FAFB]">Net Gain/Loss:</span>
            <span className="text-sm font-semibold text-green-600">₹{summary.totalProfitLoss}</span>
          </div>
          {/* <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#F9FAFB]">Overall CAGR%:</span>
            <span className="text-sm font-semibold text-[#F59E0B]">{summary.totalCagrPercentage}%</span>
          </div> */}
        </div>
      </div>


    </div>
  );
};

export default AllReports;