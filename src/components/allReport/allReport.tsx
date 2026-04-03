"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  fetchPortfolioDetails,
  processPortfolioData,
  calculateSummary,
  fetchClientDetails,
  ApiPortfolioItem,
  ProcessedRow,
  fetchPortfolioDetails1
} from "@/services/portfolioService";
import { FileDown, FileSpreadsheet, MessageCircle, Printer, Send, ChevronRight, ChevronDown } from "lucide-react";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { getLS } from "@/utils/helpers";
import { USER_DATA } from "@/utils/constants";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface AllReportsProps {
  invName?: string;
  panNo?: string;
}

interface SummaryData {
  totalCost: string;
  totalCurrentValue: string;
  totalProfitLoss: string;
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

interface ExtendedProcessedRow extends ProcessedRow {
  isExpanded?: boolean;
}

const AllReports: React.FC<AllReportsProps> = ({ invName, panNo }) => {
  const [portfolioData, setPortfolioData] = useState<ExtendedProcessedRow[]>([]);
  const [rawPortfolioData, setRawPortfolioData] = useState<ApiPortfolioItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const user = getLS(USER_DATA);
  let pan = user?.InvestorRegistration?.pan_no;
  let name = user?.InvestorRegistration?.name;

  if (!panNo) {
    panNo = pan;
    invName = name;
  }

  // Add formatDate function
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Function to get child transactions for a parent scheme
  const getChildTransactions = (folioNo: string, scheme: string): ApiPortfolioItem[] => {
    return rawPortfolioData.filter(item =>
      item.out_folio_no === folioNo &&
      item.out_scheme === scheme &&
      item.out_record_typ === "C"
    );
  };

  const toggleExpand = (index: number) => {
    const newData = [...portfolioData];
    if (expandedRow === index) {
      newData[index].isExpanded = false;
      setExpandedRow(null);
    } else {
      if (expandedRow !== null) {
        newData[expandedRow].isExpanded = false;
      }
      newData[index].isExpanded = true;
      setExpandedRow(index);
    }

    setPortfolioData(newData);
  };

  // Function to group items by scheme and create parent-child structure
  const groupItemsByScheme = (items: ApiPortfolioItem[]): ExtendedProcessedRow[] => {
    const grouped: Record<string, ExtendedProcessedRow> = {};
    const result: ExtendedProcessedRow[] = [];

    items.forEach(item => {
      if (item.out_record_typ === "P") {
        // Skip records where Purchase Units or Price is 0
        const units = parseFloat(item.out_units || "0");
        const price = parseFloat(item.out_purprice || "0");
        
        if (units === 0 || price === 0) {
          return; // Skip this record
        }

        const key = `${item.out_folio_no}-${item.out_scheme}`;
        grouped[key] = {
          id: parseInt(item.out_trxnno) || Date.now(),
          folioNo: item.out_folio_no,
          productName: item.out_scheme,
          transactionType: item.out_trxntype,
          purchaseDate: formatDate(item.out_traddate),
          balanceUnits: item.out_units,
          transactionNo: item.out_trxnno,
          totalUnit: item.out_sum_units,
          price: item.out_purprice,
          cost: item.out_sum_amount || "0",
          costValue: item.out_amount,
          divPaid: item.out_div_int_reinv || "0",
          div: item.out_div_int || "0",
          divReinv: item.out_div_int_reinv || "0",
          days: parseInt(item.out_no_of_days) || 0,
          currentNav: item.out_current_nav,
          currentValue: item.out_current_val,
          profitLoss: item.out_p_n_l,
          absPercentage: item.out_abs_per,
          cagr: item.out_cagr_per,
          schemeType: item.out_scheme_typ || "",
          pan: item.out_source || "",
          invName: invName || "",
          recordType: item.out_record_typ,
          isExpanded: false,
        };
      }
    });

    Object.values(grouped).forEach(parent => {
      result.push(parent);
    });

    return result;
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user data if panNo or invName not provided
        let finalPanNo = panNo;
        let finalInvName = invName;

        if (!finalPanNo || !finalInvName) {
          const user = getLS(USER_DATA);
          finalPanNo = finalPanNo || user?.InvestorRegistration?.pan_no;
          finalInvName = finalInvName || user?.InvestorRegistration?.name;
        }

        if (!finalPanNo || !finalInvName) {
          throw new Error("Investor information not available");
        }

        // Fetch both portfolio details and client details using the service functions
        const [portfolioResponse, clientDetails] = await Promise.all([
          fetchPortfolioDetails(finalInvName, finalPanNo), // Use original function by default
          fetchClientDetails(finalPanNo, finalInvName)
        ]);

        const items = portfolioResponse.data.data || [];
        setRawPortfolioData(items);

        // Group items by scheme to create parent-child structure
        const groupedItems = groupItemsByScheme(items);
        setPortfolioData(groupedItems);

        const summaryData = calculateSummary(groupedItems);

        // Combine the summary data with client details
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
      } catch (err) {
        console.error("Error loading portfolio details:", err);
        setError(err instanceof Error ? err.message : "Failed to load portfolio details");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [invName, panNo]);

  const fetchDataWithDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      let finalPanNo = panNo;
      let finalInvName = invName;

      if (!finalPanNo || !finalInvName) {
        const user = getLS(USER_DATA);
        finalPanNo = finalPanNo || user?.InvestorRegistration?.pan_no;
        finalInvName = finalInvName || user?.InvestorRegistration?.name;
      }

      if (!finalPanNo || !finalInvName) {
        throw new Error("Investor information not available");
      }

      // Fetch both portfolio details and client details using the service functions
      const [portfolioResponse, clientDetails] = await Promise.all([
        fetchPortfolioDetails1(finalInvName, finalPanNo, date),
        fetchClientDetails(finalPanNo, finalInvName)
      ]);

      const items = portfolioResponse.data.data || [];
      setRawPortfolioData(items);

      const groupedItems = groupItemsByScheme(items);
      setPortfolioData(groupedItems);

      const summaryData = calculateSummary(groupedItems);

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
    } catch (err) {
      console.error("Error fetching portfolio data with date:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio details");
      throw err;
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

  // Add this helper function at the top of your component, before the return statement
  const formatParentValue = (
    value: string | number | undefined | null,
    isPercentage = false
  ): string => {
    // Handle null/undefined as blank
    if (value === undefined || value === null) {
      return '';
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

  // PDF Export Function
// PDF Export Function - Only export visible data (expanded rows) with all columns
const exportToPDF = () => {
  if (!portfolioData.length || !summary) {
    alert('No portfolio data available to export');
    return;
  }

  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Colors - use hex strings instead of arrays
  const primaryColor = '#FFA500'; // Orange
  const secondaryColor = '#000000'; // Black
  const headerColor = '#3B82F6'; // Blue

  // Add header with background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company title
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('VEDANT ASSET', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('PORTFOLIO REPORT', pageWidth / 2, 25, { align: 'center' });

  // Report date
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 35, { align: 'right' });

  yPosition = 50;

  // Investor details box - use hex color
  doc.setFillColor(239, 246, 255); // Light blue using RGB
  doc.setDrawColor(200, 200, 200); // Gray border
  doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTOR DETAILS', 20, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${invName}`, 20, yPosition + 16);
  doc.text(`PAN: ${panNo}`, 20, yPosition + 22);
  doc.text(`Email: ${summary.email || 'Not available'}`, pageWidth / 2, yPosition + 16);
  doc.text(`Mobile: ${summary.mobile || 'Not available'}`, pageWidth / 2, yPosition + 22);

  yPosition += 40;

  // Portfolio Summary - use hex color
  doc.setFillColor(headerColor);
  doc.roundedRect(15, yPosition, pageWidth - 30, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PORTFOLIO SUMMARY', 20, yPosition + 8);

  yPosition += 15;

  // Summary boxes
  const boxWidth = (pageWidth - 50) / 4;
  const summaries = [
    { label: 'Total Cost', value: `₹${summary.totalCost}` },
    { label: 'Current Value', value: `₹${summary.totalCurrentValue}` },
    { 
      label: 'Net Gain/Loss', 
      value: `₹${summary.totalProfitLoss}`,
      color: parseFloat(summary.totalProfitLoss) >= 0 ? '#22C55E' : '#EF4444' // Green/Red as hex
    },
    { label: 'Absolute Return', value: `${summary.totalAbsPercentage}%` }
  ];

  summaries.forEach((summaryItem, index) => {
    const x = 15 + (index * (boxWidth + 5));
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(x, yPosition, boxWidth, 20, 2, 2, 'FD');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(summaryItem.label, x + 5, yPosition + 7);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Handle color properly
    if (summaryItem.color) {
      doc.setTextColor(summaryItem.color);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    
    doc.text(summaryItem.value, x + 5, yPosition + 15);
  });

  yPosition += 35;

  // Portfolio Table Header - Include ALL columns from your table
  doc.setFillColor(headerColor);
  doc.roundedRect(15, yPosition, pageWidth - 30, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7); // Smaller font to fit all columns
  
  // Adjusted column widths to fit all columns in landscape
  const columns = [
    { header: 'S.No.', width: 12 },
    { header: 'Folio No.', width: 20 },
    { header: 'Product Name', width: 35 },
    { header: 'Trans Type', width: 18 },
    { header: 'Purchase Date', width: 20 },
    { header: 'Units', width: 15 },
    { header: 'Price', width: 15 },
    { header: 'Cost Value', width: 18 },
    { header: 'Dividend', width: 15 },
    { header: 'Div Reinvest', width: 18 },
    { header: 'Days', width: 12 },
    { header: 'Current NAV', width: 18 },
    { header: 'Current Value', width: 18 },
    { header: 'P/L', width: 15 },
    { header: 'Abs%', width: 12 },
    { header: 'CAGR%', width: 12 }
  ];

  let xPosition = 17;
  columns.forEach(col => {
    doc.text(col.header, xPosition, yPosition + 5);
    xPosition += col.width;
  });

  yPosition += 10;

  // Portfolio Data - Only export visible data (expanded rows) with all columns
  doc.setFontSize(6); // Smaller font for data rows
  
  // Helper function to add a row
  const addRow = (data: string[], isParent: boolean = false, isChild: boolean = false) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 15;
      
      // Add header for new page
      doc.setFillColor(headerColor);
      doc.roundedRect(15, yPosition, pageWidth - 30, 8, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      
      xPosition = 17;
      columns.forEach(col => {
        doc.text(col.header, xPosition, yPosition + 5);
        xPosition += col.width;
      });
      yPosition += 10;
      doc.setFontSize(6);
    }

    // Set row background color
    if (isParent) {
      doc.setFillColor(239, 246, 255); // Light blue for parent
    } else if (isChild) {
      doc.setFillColor(255, 255, 255); // White for child
    } else {
      // Alternate colors for regular rows
      if (data[3] === 'SUMMARY') {
        doc.setFillColor(239, 246, 255); // Light blue for parent rows
      } else {
        doc.setFillColor(255, 255, 255); // White for child rows
      }
    }
    
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');

    // Row data
    doc.setTextColor(0, 0, 0);
    if (isParent || data[3] === 'SUMMARY') {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    xPosition = 17;
    data.forEach((text, colIndex) => {
      doc.text(text, xPosition, yPosition + 5);
      xPosition += columns[colIndex].width;
    });

    yPosition += 8;
  };

  let serialNumber = 1;

  // Add all portfolio data - only include expanded child transactions
  portfolioData.forEach((parentItem, parentIndex) => {
    // Add parent row with ALL columns
    const parentRowData = [
      serialNumber.toString(),
      parentItem.folioNo,
      parentItem.productName.length > 25 ? parentItem.productName.substring(0, 25) + '...' : parentItem.productName,
      'SUMMARY',
      formatDate(parentItem.transactionNo),
      parseFloat(parentItem.balanceUnits || '0').toFixed(3),
      parseFloat(parentItem.price || '0').toFixed(2),
      parseFloat(parentItem.costValue || '0').toFixed(2),
      parseFloat(parentItem.div || '0').toFixed(2),
      parseFloat(parentItem.divReinv || '0').toFixed(2),
      parentItem.days?.toString() || '0',
      parseFloat(parentItem.currentNav || '0').toFixed(2),
      parseFloat(parentItem.currentValue || '0').toFixed(2),
      parseFloat(parentItem.profitLoss || '0').toFixed(2),
      `${parseFloat(parentItem.absPercentage || '0').toFixed(2)}%`,
      `${parseFloat(parentItem.cagr || '0').toFixed(2)}%`
    ];

    addRow(parentRowData, true);
    serialNumber++;

    // Only add child transactions if the parent is expanded
    if (parentItem.isExpanded) {
      const childTransactions = getChildTransactions(parentItem.folioNo, parentItem.productName);
      
      if (childTransactions.length > 0) {
        childTransactions.forEach((childItem, childIndex) => {
          const childRowData = [
            '', // Empty serial number for child rows
            childItem.out_folio_no,
            childItem.out_scheme.length > 25 ? childItem.out_scheme.substring(0, 25) + '...' : childItem.out_scheme,
            childItem.out_trxntype,
            formatDate(childItem.out_traddate || ''),
            parseFloat(childItem.out_units || '0').toFixed(3),
            parseFloat(childItem.out_purprice || '0').toFixed(2),
            parseFloat(childItem.out_amount || '0').toFixed(2),
            parseFloat(childItem.out_div_int || '0').toFixed(2),
            parseFloat(childItem.out_div_int_reinv || '0').toFixed(2),
            childItem.out_no_of_days || '0',
            parseFloat(childItem.out_current_nav || '0').toFixed(2),
            parseFloat(childItem.out_current_val || '0').toFixed(2),
            parseFloat(childItem.out_p_n_l || '0').toFixed(2),
            `${parseFloat(childItem.out_abs_per || '0').toFixed(2)}%`,
            `${parseFloat(childItem.out_cagr_per || '0').toFixed(2)}%`
          ];

          addRow(childRowData, false, true);
        });
      }
    }
  });

  // Add totals row with all columns
  const totalUnits = portfolioData.reduce((sum, item) => sum + parseFloat(item.balanceUnits || '0'), 0).toFixed(3);
  
  const totalRowData = [
    '',
    '',
    '',
    '',
    'TOTAL',
    totalUnits,
    '',
    `₹${summary.totalCost}`,
    '',
    '',
    '',
    '',
    `₹${summary.totalCurrentValue}`,
    `₹${summary.totalProfitLoss}`,
    `${summary.totalAbsPercentage}%`,
    ''
  ];

  // Add total row with different background
  if (yPosition > pageHeight - 20) {
    doc.addPage();
    yPosition = 15;
  }
  
  doc.setFillColor(230, 255, 230); // Light green for total row
  doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  
  xPosition = 17;
  totalRowData.forEach((text, colIndex) => {
    doc.text(text, xPosition, yPosition + 5);
    xPosition += columns[colIndex].width;
  });

  yPosition += 15;

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by Vedant Asset Management Pvt. Ltd. | SEBI Registration No.: INZ000123456', 
           pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`${invName}_Portfolio_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

  // excel for particular data
  const exportToExcel1 = async () => {
    // ... (keep your existing exportToExcel1 function unchanged)
    if (!portfolioData.length || !summary) {
      alert('No portfolio data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Portfolio Report');

    // Add company header
    worksheet.mergeCells('A1:O2');
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
    worksheet.mergeCells('A3:O3');
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
      { header: 'Abs %', key: 'absPercentage', width: 10, style: { numFmt: '0.00%' } }
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
    portfolioData.forEach((parentItem, parentIdx) => {
      const isExpanded = parentItem.isExpanded;
      const childRecords = getChildTransactions(parentItem.folioNo, parentItem.productName);

      // Add parent record
      const parentRow = worksheet.addRow({
        sno: serialNumber++,
        folioNo: parentItem.folioNo,
        productName: parentItem.productName,
        transactionType: 'SUMMARY',
        purchaseDate: parentItem.transactionNo || '',
        units: parseFloat(parentItem.balanceUnits || '0'),
        price: parseFloat(parentItem.price || '0'),
        costValue: parseFloat(parentItem.costValue || '0'),
        dividend: parseFloat(parentItem.div || '0'),
        divReinvest: parseFloat(parentItem.divReinv || '0'),
        days: parseInt(parentItem.days?.toString() || '0'),
        currentNav: parseFloat(parentItem.currentNav || '0'),
        currentValue: parseFloat(parentItem.currentValue || '0'),
        profitLoss: parseFloat(parentItem.profitLoss || '0'),
        absPercentage: parseFloat(parentItem.absPercentage || '0') / 100
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
        childRecords.forEach((childItem, childIdx) => {
          const childRow = worksheet.addRow({
            sno: '',
            folioNo: childItem.out_folio_no,
            productName: childItem.out_scheme,
            transactionType: childItem.out_trxntype,
            purchaseDate: formatDate(childItem.out_traddate || ''),
            units: parseFloat(childItem.out_units || '0'),
            price: parseFloat(childItem.out_purprice || '0'),
            costValue: parseFloat(childItem.out_amount || '0'),
            dividend: parseFloat(childItem.out_div_int || '0'),
            divReinvest: parseFloat(childItem.out_div_int_reinv || '0'),
            days: parseInt(childItem.out_no_of_days || '0'),
            currentNav: parseFloat(childItem.out_current_nav || '0'),
            currentValue: parseFloat(childItem.out_current_val || '0'),
            profitLoss: parseFloat(childItem.out_p_n_l || '0'),
            absPercentage: parseFloat(childItem.out_abs_per || '0') / 100
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
    });

    // Add summary section
    worksheet.mergeCells(`A${rowIndex + 1}:O${rowIndex + 1}`);
    const summaryTitle = worksheet.getCell(`A${rowIndex + 1}`);
   
    summaryTitle.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summaryTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' }
    };
    summaryTitle.alignment = { horizontal: 'center' };

    // Summary data
    const summaryData = [
      ['Total Cost Value', `₹${summary.totalCost || '0.00'}`],
      ['Total Current Value', `₹${summary.totalCurrentValue || '0.00'}`],
      ['Net Gain/Loss', `₹${summary.totalProfitLoss || '0.00'}`],
      ['Absolute Return', `${summary.totalAbsPercentage || '0.00'}%`]
    ];

    summaryData.forEach(([label, value], index) => {
      worksheet.mergeCells(`A${rowIndex + 2 + index}:N${rowIndex + 2 + index}`);
      const labelCell = worksheet.getCell(`A${rowIndex + 2 + index}`);
      labelCell.value = label;
      labelCell.font = { bold: true };
      labelCell.alignment = { horizontal: 'right' };

      const valueCell = worksheet.getCell(`O${rowIndex + 2 + index}`);
      valueCell.value = value;
      valueCell.font = { bold: true, color: { argb: label.includes('Gain') ? 'FF16A34A' : 'FF000000' } };
    });

    // Add footer
    const footerRow = rowIndex + 2 + summaryData.length + 2;
    worksheet.mergeCells(`A${footerRow}:O${footerRow}`);
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

  const exportToExcel = async () => {
    // ... (keep your existing exportToExcel function unchanged)
    if (!portfolioData.length) return;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Portfolio Report');

    // Define columns
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

    portfolioData.forEach((parentItem, parentIdx) => {
      // Add parent record with styling
      const parentRow = worksheet.addRow({
        sno: serialNumber++,
        folioNo: parentItem.folioNo,
        productName: parentItem.productName,
        transactionType: 'SUMMARY', // Use 'SUMMARY' for parent rows
        purchaseDate: parentItem.transactionNo || '', // Use transactionNo for parent rows
        purchaseUnits: parseFloat(parentItem.balanceUnits || '0'),
        price: parseFloat(parentItem.price || '0'),
        costValue: parseFloat(parentItem.costValue || '0'),
        divident: parseFloat(parentItem.div || '0'),
        divReinvestment: parseFloat(parentItem.divReinv || '0'),
        days: parseInt(parentItem.days?.toString() || '0'),
        currentNav: parseFloat(parentItem.currentNav || '0'),
        currentValue: parseFloat(parentItem.currentValue || '0'),
        profitLoss: parseFloat(parentItem.profitLoss || '0'),
        absPercentage: parseFloat(parentItem.absPercentage || '0'),
        cagr: parseFloat(parentItem.cagr || '0'),
      });

      // Style parent row with light blue background
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

      // Add all child records
      const childRecords = getChildTransactions(parentItem.folioNo, parentItem.productName);
      childRecords.forEach((childItem, childIdx) => {
        const childRow = worksheet.addRow({
          sno: '',
          folioNo: childItem.out_folio_no,
          productName: childItem.out_scheme,
          transactionType: childItem.out_trxntype,
          purchaseDate: formatDate(childItem.out_traddate), // Use actual purchase date for child rows
          purchaseUnits: parseFloat(childItem.out_units || '0'),
          price: parseFloat(childItem.out_purprice || '0'),
          costValue: parseFloat(childItem.out_amount || '0'),
          divident: parseFloat(childItem.out_div_int || '0'),
          divReinvestment: parseFloat(childItem.out_div_int_reinv || '0'),
          days: parseInt(childItem.out_no_of_days || '0'),
          currentNav: parseFloat(childItem.out_current_nav || '0'),
          currentValue: parseFloat(childItem.out_current_val || '0'),
          profitLoss: parseFloat(childItem.out_p_n_l || '0'),
          absPercentage: parseFloat(childItem.out_abs_per || '0'),
          cagr: parseFloat(childItem.out_cagr_per || '0'),
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

    // Calculate totals
    const totals = {
      purchaseUnits: portfolioData.reduce((sum, item) => sum + parseFloat(item.balanceUnits || '0'), 0),
      costValue: portfolioData.reduce((sum, item) => sum + parseFloat(item.costValue || '0'), 0),
      currentValue: portfolioData.reduce((sum, item) => sum + parseFloat(item.currentValue || '0'), 0),
      profitLoss: portfolioData.reduce((sum, item) => sum + parseFloat(item.profitLoss || '0'), 0),
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

    // Style totals row with green background
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading report...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!portfolioData.length || !summary) {
    return <div className="p-4 text-center text-gray-500">No data found for this investor.</div>;
  }

  return (
    <div className="text-[11px] font-sans text-black bg-white p-4" ref={reportRef}>
      {/* Header Section */}
      <div className="border-b border-black pb-2 mb-2">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">
              Vedant<span className="text-black">Asset</span>
            </h1>
            <div className="mt-2 text-xs">
              <p><strong>Investor:</strong> {invName}</p>
              <p>
                <strong>Address:</strong>{" "}
                {`${summary.address1 || ""} ${summary.address2 || ""} ${summary.address3 || ""}, ${summary.city || ""} - ${summary.pincode || ""}`}
              </p>
              <p><strong>PAN:</strong> {panNo}</p>
              <p><strong>Email:</strong> {summary.email || "Not available"}</p>
              <p><strong>Mobile No:</strong> {summary.mobile || "Not available"}</p>
            </div>
            {/* Action Icons - Added PDF button */}
            <div className="flex justify-left gap-3 mt-3 flex-wrap action-buttons">
              {[
                { icon: <FileDown size={18} className="text-red-600" />, label: "PDF", action: exportToPDF },
                { icon: <FileSpreadsheet size={18} className="text-indigo-600" />, label: "Excel", action: exportToExcel1 },
                { icon: <FileSpreadsheet size={18} className="text-green-600" />, label: "Excel All data", action: exportToExcel },
                { icon: <Printer size={18} className="text-gray-600" />, label: "Print", action: handlePrint },
              ].map((item, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center group hover:bg-gray-50 rounded p-1"
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
            <p>Website: <a href="https://www.vedantasset.co.in" className="text-blue-600 hover:underline">www.vedantasset.co.in</a></p>

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
                  disabled={searchLoading || loading}
                  className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
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
      <div className="overflow-auto mt-4 border border-gray-300 text-[10px]">
        <table className="w-full border-collapse text-[10px]">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr className="text-left">
              
              <th className="p-1 border-r">S.No.</th>
              <th className="p-1 border-r">Folio No.</th>
              <th className="p-1 border-r">Product Name</th>
              <th className="p-1 border-r">Transaction Type</th>
              <th className="p-1 border-r">Purchase Date</th>
              <th className="p-1 border-r">Purchase Units</th>
              {/* <th className="p-1 border-r">Total Units</th> */}
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
            {portfolioData.map((item, idx) => {
              const hasChildTransactions = getChildTransactions(item.folioNo, item.productName).length > 0;
              const isExpanded = item.isExpanded;

              return (
                <React.Fragment key={idx}>
                  {/* Parent Row */}
                  <tr className={idx % 2 === 0 ? "bg-blue-50 font-semibold" : "bg-blue-100 font-semibold"}>
                   
                    <td className="p-1 border">{idx + 1}</td>
                    <td className="p-1 border">{item.folioNo}</td>
                    <td className="p-1 border">{item.productName}</td>
                    <td className="p-1 border">
                      {hasChildTransactions ? (
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() => toggleExpand(idx)}
                        >
                          {isExpanded ? "Hide Transactions" : "View Transactions"}
                        </span>
                      ) : (
                        item.transactionType
                      )}
                    </td>
                    <td className="p-1 border">{formatDate(item.transactionNo)}</td>
                    <td className="p-1 border">{item.balanceUnits}</td>
                    {/* <td className="p-1 border">{item.totalUnit}</td> */}
                    <td className="p-1 border">{item.price}</td>
                    <td className="p-1 border">{item.costValue}</td>
                    <td className="p-1 border">{item.div}</td>
                    <td className="p-1 border">{item.divReinv}</td>
                    <td className="p-1 border">{formatParentValue(item.days)}</td>
                    <td className="p-1 border">{formatParentValue(item.currentNav)}</td>
                    <td className="p-1 border">{formatParentValue(item.currentValue)}</td>
                    <td className="p-1 border">{formatParentValue(item.profitLoss)}</td>
                    <td className="p-1 border">{formatParentValue(item.absPercentage, true)}</td>
                    <td className="p-1 border">{formatParentValue(item.cagr, true)}</td>
                  </tr>

                  {/* Child Rows - shown when expanded */}
                  {isExpanded && getChildTransactions(item.folioNo, item.productName).map((child, childIdx) => (
                    <tr key={`${idx}-${childIdx}`} className={childIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      
                      <td className="p-1 border text-center">{childIdx + 1}</td>
                      <td className="p-1 border">{child.out_folio_no}</td>
                      <td className="p-1 border">{child.out_scheme}</td>
                      <td className="p-1 border">{child.out_trxntype}</td>
                      <td className="p-1 border">{formatDate(child.out_traddate || "")}</td>
                      <td className="p-1 border">{child.out_units}</td>
                      {/* <td className="p-1 border">{child.out_sum_units}</td> */}
                      <td className="p-1 border">{child.out_purprice}</td>
                      <td className="p-1 border">{child.out_amount}</td>
                      <td className="p-1 border">{child.out_div_int}</td>
                      <td className="p-1 border">{child.out_div_int_reinv}</td>
                      <td className="p-1 border">{child.out_no_of_days}</td>
                      <td className="p-1 border">{child.out_current_nav}</td>
                      <td className="p-1 border">{child.out_current_val}</td>
                      <td className="p-1 border">{child.out_p_n_l}</td>
                      <td className="p-1 border">{child.out_abs_per}%</td>
                      <td className="p-1 border">{child.out_cagr_per}%</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            <tr className="bg-blue-50 font-semibold">
              <td className="p-1 border text-center" colSpan={5}>Total</td>
              <td className="p-1 border">{portfolioData.reduce((sum, item) => sum + parseFloat(item.balanceUnits), 0).toFixed(3)}</td>
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
      <div className="mt-6 border border-gray-300 rounded-md p-4 bg-white shadow-sm">
        <h2 className="text-base font-bold mb-3 text-gray-800 border-b pb-2">Portfolio Snapshot</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Cost of Purchase Units:</span>
            <span className="text-sm font-semibold">₹{summary.totalCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Current Value:</span>
            <span className="text-sm font-semibold">₹{summary.totalCurrentValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Net Gain/Loss:</span>
            <span className={`text-sm font-semibold ${parseFloat(summary.totalProfitLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.totalProfitLoss}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReports;