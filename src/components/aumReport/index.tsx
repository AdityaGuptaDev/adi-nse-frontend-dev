import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, ChevronLeft, FileText, File, Printer, Calendar, BarChart3, AlertCircle, Download } from 'lucide-react';
import api from '@/utils/api';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define types for better TypeScript support
interface User {
  name: string;
  pan: string;
  role: string;
}

interface PortfolioItem {
  folioNumber: string;
  name: string;
  arnMutual: string;
  fundSchemeName: string;
  units: number;
  perPrice: number;
  purchasePrice: number;
  aum: number;
  role: string;
  assignedTo: string;
  investmentDate: string;
}

interface AumReportItem {
  out_inv_name: string;
  out_folio_no: string;
  out_arn: string;
  out_mutual_fund: string;
  out_scheme: string;
  out_units: string;
  out_amount: string;
  out_current_val: string;
}

interface AumApiResponse {
  data: {
    data: AumReportItem[];
  };
  msg: string;
}

const MutualFundPortfolio = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearchApplied, setIsSearchApplied] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [aumLoading, setAumLoading] = useState(false);
  const [error, setError] = useState('');
  const [aumData, setAumData] = useState<AumReportItem[]>([]);
  const [apiMessage, setApiMessage] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // API call function for user list
  const fetchUserPanList = async (roleType: string) => {
    setLoading(true);
    setError('');
    setApiMessage('');
    setUserList([]);
    setSelectedList('');

    try {
      let requestBody = {};

      // Set request body based on selected role
      if (roleType === 'Investor') {
        requestBody = { in_type: 'I' };
      } else if (roleType === 'RM') {
        requestBody = { in_type: 'R' };
      } else if (roleType === 'Partner') {
        requestBody = { in_type: 'P' };
      } else {
        setLoading(false);
        return;
      }

      const response = await api.post(
        'http://localhost:9075/partner/getUserPanList',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (data.data && data.data.data) {
        // Filter out entries with null pan and name
        const filteredData = data.data.data.filter(
          (user: { out_pan: any; out_name: any }) => user.out_pan && user.out_name
        );

        // Transform data to match our format
        const transformedData: User[] = filteredData.map(
          (user: { out_name: any; out_pan: any }) => ({
            name: user.out_name,
            pan: user.out_pan,
            role: roleType,
          })
        );

        setUserList(transformedData);
        
        if (filteredData.length === 0) {
          setApiMessage(`No ${roleType} users found`);
        }
      } else {
        setApiMessage(`No ${roleType} users available`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 'Failed to fetch user list. Please try again.';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // API call function for AUM Report
  const fetchAumReport = async (role: string, pan: string | null, fromDate: string, toDate: string) => {
    setAumLoading(true);
    setError('');
    setApiMessage('');

    try {
      const requestBody = {
        in_role: role,
        in_from_date: fromDate,
        in_to_date: toDate,
        in_pan: pan
      };

      console.log('Sending AUM request:', requestBody);

      const response = await api.post<AumApiResponse>(
        'http://localhost:9075/partner/getAumReport',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      console.log('AUM API response:', data);

      if (data.data && data.data.data && data.data.data.length > 0) {
        setAumData(data.data.data);
        setApiMessage(`Found ${data.data.data.length} records for the selected criteria`);
      } else {
        setAumData([]);
        setApiMessage('No AUM data found for the selected criteria');
      }
    } catch (err: any) {
      console.error('AUM API Error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        const serverError = err.response.data;
        if (serverError.msg) {
          setError(serverError.msg);
        } else if (err.response.status === 404) {
          setError('AUM data not found for the specified PAN');
        } else if (err.response.status === 400) {
          setError('Invalid request parameters');
        } else {
          setError('Failed to fetch AUM report. Please try again.');
        }
      } else if (err.request) {
        setError('Network error: Unable to connect to server');
      } else {
        setError('An unexpected error occurred');
      }
      
      setAumData([]);
    } finally {
      setAumLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedList('');
    setAumData([]);
    setError('');
    setApiMessage('');
    
    // Call API when RM, Partner, or Investor is selected
    if (role === 'RM' || role === 'Partner' || role === 'Investor') {
      fetchUserPanList(role);
    } else {
      setUserList([]);
    }
  };

  // Extract PAN from selected list option
  const extractPanFromListOption = (listOption: string): string | null => {
    if (!listOption || listOption.includes('All') || listOption.includes('Loading') || listOption.includes('Error') || listOption.includes('No users')) {
      return null;
    }
    
    const panMatch = listOption.match(/\(([A-Z]{5}[0-9]{4}[A-Z])\)/);
    return panMatch ? panMatch[1] : null;
  };

  // Validate PAN format
  const isValidPAN = (pan: string | null): boolean => {
    if (!pan) return true; // null is valid for "All" selection
    
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan);
  };

  // Handle search/filter button click
  const handleDateFilter = async () => {
    if (!selectedRole) {
      setError('Please select a role first.');
      return;
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
      setError('From date cannot be greater than To date');
      return;
    }

    setIsSearchApplied(true);
    
    let pan: string | null = null;
    
    // For Admin role, send null PAN
    if (selectedRole === 'Admin') {
      pan = null;
    } 
    // For other roles, extract PAN from selected list
    else if (selectedList && !selectedList.includes('All')) {
      pan = extractPanFromListOption(selectedList);
      
      // Validate PAN format
      if (pan && !isValidPAN(pan)) {
        setError('Invalid PAN format selected');
        return;
      }
    }
    // For "All" selection in non-Admin roles, send null PAN
    else {
      pan = null;
    }

    await fetchAumReport(selectedRole, pan, fromDate, toDate);
  };

  // Static portfolio data (fallback data - only used when not searching)
  const staticPortfolioData: PortfolioItem[] = [
    {
      folioNumber: 'MF001234',
      name: 'Rajesh Kumar',
      arnMutual: 'ARN-12345',
      fundSchemeName: 'SBI Bluechip Fund - Direct Growth',
      units: 1250.45,
      perPrice: 89.67,
      purchasePrice: 75.20,
      aum: 112150.87,
      role: 'RM',
      assignedTo: 'RM - Rajesh Kumar',
      investmentDate: '2024-01-15'
    },
  ];

  const roleOptions = ['Investor', 'RM', 'Admin', 'Partner'];
  
  // Dynamic list options based on selected role and API data
  const getListOptions = () => {
    if (selectedRole === 'RM' || selectedRole === 'Partner' || selectedRole === 'Investor') {
      if (loading) {
        return ['Loading...'];
      }
      if (error) {
        return ['Error loading data'];
      }
      if (userList.length === 0) {
        return ['No users found'];
      }
      
      return [
        `All ${selectedRole}s`,
        ...userList.map((user: User) => `${selectedRole} - ${user.name} (${user.pan})`)
      ];
    }
    
    if (selectedRole === 'Admin') {
      return [];
    }
    
    return ['Select Role First'];
  };
  
  const listOptions = getListOptions();

  // Check if List dropdown should be shown
  const shouldShowListDropdown = selectedRole && selectedRole !== 'Admin';

  // Transform AUM API data to match our table format
  const transformAumData = (data: AumReportItem[]): PortfolioItem[] => {
    return data.map((item, index) => {
      const units = parseFloat(item.out_units) || 0;
      const currentVal = parseFloat(item.out_current_val) || 0;
      const amount = parseFloat(item.out_amount) || 0;
      
      // Calculate prices safely to avoid division by zero
      const perPrice = units > 0 ? currentVal / units : 0;
      const purchasePrice = units > 0 ? amount / units : 0;

      return {
        folioNumber: item.out_folio_no || 'N/A',
        name: item.out_inv_name || 'Unknown',
        arnMutual: item.out_arn || 'N/A',
        fundSchemeName: `${item.out_mutual_fund || 'Unknown'} - ${item.out_scheme || 'Unknown Scheme'}`,
        units: units,
        perPrice: perPrice,
        purchasePrice: purchasePrice,
        aum: currentVal,
        role: selectedRole,
        assignedTo: `${selectedRole} - ${item.out_inv_name || 'Unknown'}`,
        investmentDate: fromDate
      };
    });
  };

  const filteredData = useMemo(() => {
    // If we have AUM data from API, use it (only when search is applied)
    if (isSearchApplied) {
      if (aumData.length > 0) {
        return transformAumData(aumData);
      } else {
        return []; // Return empty array when no AUM data found
      }
    }
    
    // Otherwise, use static data with filters (only when not searching)
    return staticPortfolioData.filter(item => {
      const matchesRole = selectedRole === '' || selectedRole === 'All Roles' || 
        item.role === selectedRole;
      const matchesList = selectedList === '' || selectedList.includes('All') ||
        item.assignedTo === selectedList;
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.folioNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fundSchemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filtering
      const itemDate = new Date(item.investmentDate);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const matchesDateRange = itemDate >= from && itemDate <= to;
      
      return matchesRole && matchesList && matchesSearch && matchesDateRange;
    });
  }, [selectedRole, selectedList, searchTerm, fromDate, toDate, isSearchApplied, aumData]);

  // Calculate grand total
  const grandTotal = filteredData.reduce((sum, item) => sum + item.aum, 0);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };
  
  const handleResetSearch = () => {
    setIsSearchApplied(false);
    setSearchTerm('');
    setSelectedRole('');
    setSelectedList('');
    setUserList([]);
    setAumData([]);
    setError('');
    setApiMessage('');
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  // Handle list selection change
  const handleListChange = (value: string) => {
    setSelectedList(value);
    setAumData([]); // Clear previous AUM data when list changes
    setError('');
    setApiMessage('');
  };
  
  const handlePrint = () => window.print();
  
  // Enhanced Excel Export Function with Styling
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = filteredData.map(item => ({
        'Folio Number': item.folioNumber,
        'Investor Name': item.name,
        'ARN Mutual': item.arnMutual,
        'Fund Scheme Name': item.fundSchemeName,
        'Units': item.units,
        'Current Price (₹)': item.perPrice,
        'Purchase Price (₹)': item.purchasePrice,
        'AUM Value (₹)': item.aum,
        'Role': item.role,
        'Assigned To': item.assignedTo,
        'Investment Date': item.investmentDate
      }));

      // Add summary row
      const summaryRow = {
        'Folio Number': 'GRAND TOTAL',
        'Investor Name': '',
        'ARN Mutual': '',
        'Fund Scheme Name': '',
        'Units': '',
        'Current Price (₹)': '',
        'Purchase Price (₹)': '',
        'AUM Value (₹)': grandTotal,
        'Role': '',
        'Assigned To': '',
        'Investment Date': ''
      };

      const dataWithSummary = [...excelData, summaryRow];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataWithSummary);

      // Define styles for different sections
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2F75B5' } }, // Blue background
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } }
        }
      };

      const dataStyle = {
        font: { name: 'Arial', sz: 10 },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } }
        }
      };

      const summaryStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '70AD47' } }, // Green background
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } }
        }
      };

      // Apply basic styling by manipulating cell objects
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
      
      // Style headers (first row)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: range.s.r, c: C });
        if (!ws[headerCell]) continue;
        ws[headerCell].s = headerStyle;
      }

      // Style data rows and apply number formatting
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell]) continue;

          // Check if this is the summary row
          if (R === range.e.r) {
            ws[cell].s = summaryStyle;
          } else {
            ws[cell].s = dataStyle;
          }

          // Apply number formatting for currency and numbers
          const cellValue = ws[cell].v;
          if (typeof cellValue === 'number') {
            if (['Units', 'Current Price (₹)', 'Purchase Price (₹)', 'AUM Value (₹)'].includes(Object.keys(excelData[0])[C])) {
              ws[cell].z = '#,##0.00';
            }
          }
        }
      }

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Folio Number
        { wch: 20 }, // Investor Name
        { wch: 15 }, // ARN Mutual
        { wch: 35 }, // Fund Scheme Name
        { wch: 12 }, // Units
        { wch: 15 }, // Current Price
        { wch: 15 }, // Purchase Price
        { wch: 15 }, // AUM Value
        { wch: 12 }, // Role
        { wch: 20 }, // Assigned To
        { wch: 15 }  // Investment Date
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Mutual Fund Portfolio');

      // Create metadata sheet
      const metadata = [
        ['Mutual Fund Portfolio Report'],
        ['Generated on', new Date().toLocaleString()],
        ['Report Period', `${fromDate} to ${toDate}`],
        ['Selected Role', selectedRole || 'All'],
        ['Selected List', selectedList || 'All'],
        ['Total Records', filteredData.length],
        ['Total AUM Value', `₹${formatCurrency(grandTotal)}`],
        [],
        ['Disclaimer:'],
        ['Mutual Fund investments are subject to market risks, read all scheme related documents carefully.'],
        ['Past performance is not indicative of future results.']
      ];

      const wsMetadata = XLSX.utils.aoa_to_sheet(metadata);
      
      // Style metadata sheet
      const metaRange = XLSX.utils.decode_range(wsMetadata['!ref'] || 'A1:A1');
      wsMetadata['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '2F75B5' } },
        alignment: { horizontal: 'center' }
      };
      
      // Merge cells for title
      wsMetadata['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

      XLSX.utils.book_append_sheet(wb, wsMetadata, 'Report Info');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Mutual_Fund_Portfolio_${timestamp}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);
      
      setApiMessage(`Excel report exported successfully with ${filteredData.length} records`);
    } catch (error) {
      console.error('Excel export error:', error);
      setError('Failed to export Excel file. Please try again.');
    }
  };

  // Enhanced PDF Export Function with Custom Design
  const exportToPDF = async () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    setPdfLoading(true);
    try {
      // Create a new PDF instance
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Add header with colors
      pdf.setFillColor(42, 117, 187); // Blue background
      pdf.rect(0, 0, 297, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VEDANT ASSET', 20, 12);
      
      pdf.setTextColor(255, 165, 0);
      pdf.setFontSize(16);
      pdf.text('Mutual Fund Portfolio Report', 20, 18);
      
      // Add company info
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('3rd Floor, Gayways House Above Space Furniture, Ranchi', 200, 8);
      pdf.text('Phone: 9304955509 | vedantasset@gmail.com', 200, 12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 200, 16);
      
      // Add report details section
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, 25, 277, 15, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Report Details:', 15, 32);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Period: ${fromDate} to ${toDate}`, 80, 32);
      pdf.text(`Role: ${selectedRole || 'All'}`, 150, 32);
      pdf.text(`Records: ${filteredData.length}`, 200, 32);
      pdf.text(`Total AUM: ₹${formatCurrency(grandTotal)}`, 240, 32);
      
      // Add summary section
      pdf.setFillColor(230, 240, 255);
      pdf.rect(10, 43, 277, 8, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Portfolio Summary', 15, 48);
      
      // Table headers with colors
      const headers = ['Folio No', 'Investor Name', 'ARN', 'Fund Scheme', 'Units', 'Curr Price', 'Pur Price', 'AUM (₹)'];
      const columnWidths = [25, 35, 25, 65, 20, 25, 25, 35];
      let startX = 10;
      const startY = 55;
      
      pdf.setFillColor(79, 129, 189); // Dark blue headers
      pdf.rect(10, startY, 277, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      headers.forEach((header, index) => {
        pdf.text(header, startX + 2, startY + 5);
        startX += columnWidths[index];
      });
      
      // Table data with alternating colors
      let currentY = startY + 8;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      
      filteredData.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(245, 245, 245);
        }
        pdf.rect(10, currentY, 277, 8, 'F');
        
        pdf.setTextColor(0, 0, 0);
        
        // Row data
        let xPos = 12;
        const rowData = [
          item.folioNumber,
          item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
          item.arnMutual,
          item.fundSchemeName.length > 35 ? item.fundSchemeName.substring(0, 35) + '...' : item.fundSchemeName,
          formatNumber(item.units),
          formatNumber(item.perPrice),
          formatNumber(item.purchasePrice),
          formatCurrency(item.aum)
        ];
        
        rowData.forEach((data, colIndex) => {
          pdf.text(data.toString(), xPos, currentY + 5);
          xPos += columnWidths[colIndex];
        });
        
        currentY += 8;
        
        // Check if we need a new page
        if (currentY > 180 && index < filteredData.length - 1) {
          pdf.addPage();
          currentY = 20;
          
          // Add header on new page
          pdf.setFillColor(42, 117, 187);
          pdf.rect(0, 0, 297, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('VEDANT ASSET - Portfolio Report (Continued)', 20, 10);
          
          // Table headers on new page
          pdf.setFillColor(79, 129, 189);
          pdf.rect(10, currentY, 277, 8, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          
          let headerX = 10;
          headers.forEach((header) => {
            pdf.text(header, headerX + 2, currentY + 5);
            headerX += columnWidths[headers.indexOf(header)];
          });
          
          currentY += 8;
        }
      });
      
      // Add grand total with green background
      pdf.setFillColor(86, 171, 89); // Green background
      pdf.rect(10, currentY, 277, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRAND TOTAL', 12, currentY + 5);
      pdf.text(formatCurrency(grandTotal), 252, currentY + 5);
      
      // Add footer with disclaimer
      currentY += 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, currentY, 287, currentY);
      
      currentY += 5;
      pdf.setTextColor(150, 0, 0);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Disclaimer:', 15, currentY);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      const disclaimer = 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future results.';
      pdf.text(disclaimer, 15, currentY + 4);
      
      // Add page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(7);
        pdf.text(`Page ${i} of ${pageCount}`, 280, 205);
      }
      
      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`Mutual_Fund_Portfolio_${timestamp}.pdf`);
      
      setApiMessage(`PDF report exported successfully with ${filteredData.length} records`);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to export PDF file. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-[#111111] font-sans">
      {/* Header Section */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors mb-4"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          <span className="text-orange-500">Vedant</span>
          <span className="text-black">Asset</span>
        </h1>
        <div className="text-right text-xs text-[#9CA3AF]">
          <p>3rd Floor, Gayways House Above Space Furniture, Ranchi</p>
          <p>Phone: 9304955509 | vedantasset@gmail.com</p>
        </div>
      </div>

      {/* API Message Indicator */}
      {apiMessage && !error && (
        <div className={`mb-4 p-3 rounded flex items-center ${
          aumData.length > 0 ? 'bg-green-50 border border-green-200' : 'bg-[#1F1A1A] border border-blue-200'
        }`}>
          <AlertCircle className={`w-4 h-4 mr-2 ${
            aumData.length > 0 ? 'text-green-600' : 'text-[#F59E0B]'
          }`} />
          <span className={aumData.length > 0 ? 'text-green-700' : 'text-[#F59E0B]'}>
            {apiMessage}
          </span>
        </div>
      )}

      {/* Search Status Indicator */}
      {isSearchApplied && !apiMessage && !error && (
        <div className="mb-4 p-3 bg-[#1F1A1A] border border-blue-200 rounded flex justify-between items-center">
          <div className="flex items-center">
            <Search className="w-4 h-4 text-[#F59E0B] mr-2" />
            <span className="text-[#F59E0B] font-medium">
              {aumLoading ? 'Loading AUM data...' : `Searching for records...`}
            </span>
          </div>
          <button
            onClick={handleResetSearch}
            className="text-sm text-[#F59E0B] hover:text-[#F59E0B] underline"
          >
            Show all data
          </button>
        </div>
      )}

      {/* Loading Indicator for AUM API */}
      {aumLoading && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-yellow-700 font-medium">Fetching AUM report data...</span>
          </div>
        </div>
      )}

      {/* PDF Loading Indicator */}
      {pdfLoading && (
        <div className="mb-4 p-3 bg-[#1F1A0A] border border-purple-200 rounded">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            <span className="text-[#D97706] font-medium">Generating PDF report...</span>
          </div>
        </div>
      )}

      {/* API Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Section */}
      <div className="flex justify-between items-center mb-4 bg-[#0A0A0A] p-4 rounded">
        <div className={`grid gap-4 items-end flex-1 ${shouldShowListDropdown ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
          {/* Role Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#F9FAFB]">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2A2A2A] rounded text-sm focus:outline-none focus:border-[#F59E0B]"
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* List Dropdown - Conditionally rendered */}
          {shouldShowListDropdown && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#F9FAFB]">List</label>
              <select
                value={selectedList}
                onChange={(e) => handleListChange(e.target.value)}
                disabled={!selectedRole || loading}
                className={`w-full px-3 py-2 border border-[#2A2A2A] rounded text-sm focus:outline-none focus:border-[#F59E0B] ${
                  !selectedRole || loading
                    ? 'bg-[#111111] text-[#9CA3AF] cursor-not-allowed' 
                    : 'bg-[#111111]'
                }`}
              >
                <option value="">{loading ? 'Loading users...' : 'Select List'}</option>
                {listOptions.map((list, index) => (
                  <option key={index} value={list}>{list}</option>
                ))}
              </select>
            </div>
          )}

          {/* From Date */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#F9FAFB]">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#2A2A2A] rounded text-sm focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#F9FAFB]">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#2A2A2A] rounded text-sm focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

       

          {/* Search Button */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#F9FAFB] opacity-0">Search</label>
            <button
              onClick={handleDateFilter}
              disabled={aumLoading}
              className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${
                aumLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#F59E0B] hover:bg-[#B45309] text-[#F9FAFB]'
              }`}
            >
              {aumLoading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs text-[#9CA3AF] flex items-center gap-4">
          <span>
            Showing <span className="font-semibold">{filteredData.length}</span> records
            {isSearchApplied && aumData.length > 0 && (
              <span className="text-[#F59E0B] ml-2">(Live AUM Data)</span>
            )}
          </span>

          {filteredData.length > 0 && (
            <span className="flex items-center gap-4">
              <span>
                <span className="font-bold text-[#F59E0B]"> Investments - {filteredData.length}</span> 
              </span>
              <span>
                <span className="font-bold text-green-600">  AUM Value - ₹{formatCurrency(grandTotal)}</span>
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            disabled={filteredData.length === 0}
            className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
              filteredData.length === 0 
                ? 'bg-[#111111] text-[#9CA3AF] cursor-not-allowed border border-[#2A2A2A]' 
                : 'bg-green-600 hover:bg-green-700 text-[#F9FAFB] border border-green-600'
            }`}
          >
            <Download className="w-4 h-4 inline-block mr-1" /> Excel
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredData.length === 0 || pdfLoading}
            className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
              filteredData.length === 0 || pdfLoading
                ? 'bg-[#111111] text-[#9CA3AF] cursor-not-allowed border border-[#2A2A2A]' 
                : 'bg-red-600 hover:bg-red-700 text-[#F9FAFB] border border-red-600'
            }`}
          >
            <File className="w-4 h-4 inline-block mr-1" /> 
            {pdfLoading ? 'Generating...' : 'PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredData.length === 0}
            className={`border border-[#2A2A2A] px-3 py-1 rounded text-sm transition-colors ${
              filteredData.length === 0 
                ? 'bg-[#111111] text-[#9CA3AF] cursor-not-allowed' 
                : 'hover:bg-[#0A0A0A]'
            }`}
          >
            <Printer className="w-4 h-4 inline-block mr-1" /> Print
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border border-[#2A2A2A] text-sm">
          <thead className="bg-[#111111] sticky top-0">
            <tr>
              <th className="border border-[#2A2A2A] px-2 py-2 text-left font-medium">Folio Number</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-left font-medium">Name</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-left font-medium">ARN Mutual</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-left font-medium">Fund Scheme Name</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-right font-medium">Units</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-right font-medium">Per Price (₹)</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-right font-medium">Purchase Price (₹)</th>
              <th className="border border-[#2A2A2A] px-2 py-2 text-right font-medium">AUM (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={`${item.folioNumber}-${index}`} className="hover:bg-[#0A0A0A]">
                  <td className="border border-[#2A2A2A] px-2 py-2">{item.folioNumber}</td>
                  <td className="border border-[#2A2A2A] px-2 py-2">{item.name}</td>
                  <td className="border border-[#2A2A2A] px-2 py-2">{item.arnMutual}</td>
                  <td className="border border-[#2A2A2A] px-2 py-2">{item.fundSchemeName}</td>
                  <td className="border border-[#2A2A2A] px-2 py-2 text-right">
                    {formatNumber(item.units)}
                  </td>
                  <td className="border border-[#2A2A2A] px-2 py-2 text-right">
                    {formatNumber(item.perPrice)}
                  </td>
                  <td className="border border-[#2A2A2A] px-2 py-2 text-right">
                    {formatNumber(item.purchasePrice)}
                  </td>
                  <td className="border border-[#2A2A2A] px-2 py-2 text-right font-medium">
                    {formatCurrency(item.aum)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="border border-[#2A2A2A] px-2 py-8 text-center text-[#9CA3AF]">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p className="font-medium">
                      {isSearchApplied ? 'No AUM data found' : 'No records found'}
                    </p>
                    <p className="text-sm">
                      {isSearchApplied 
                        ? 'Try adjusting your search criteria or select different dates' 
                        : 'Try adjusting your search criteria'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="bg-[#1A1A1A] font-semibold">
                <td colSpan={7} className="border border-[#2A2A2A] px-2 py-2 text-right">
                  Grand Total
                </td>
                <td className="border border-[#2A2A2A] px-2 py-2 text-right font-bold">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 border-t pt-3 text-xs text-[#F9FAFB]">
        <strong>Disclaimer:</strong> Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future results.
      </div>
    </div>
  );
};

export default MutualFundPortfolio;