import { calculateSummary, ClientDetails, fetchClientDetails, fetchPortfolioDetails, processPortfolioData } from "@/services/portfolioService";
import { ChevronLeft, FileDown, FileSpreadsheet, MessageCircle, Printer, Send } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

interface InvestmentSummaryProps {
  panNo: string;
  invName: string;
  clientName: string;
  onBack: () => void;
}

interface PortfolioItem {
  folioNo: string;
  productName: string;
  balanceUnits: string;
  costValue: string;
  price: string;
  currentNav: string;
  currentValue: string;
  profitLoss: string;
  absPercentage: string;
  cagr?: string;
}

interface SummaryData {
  totalCost: string;
  totalCurrentValue: string;
  totalProfitLoss: string;
  totalUnits: string;
  totalAbsPercentage: string;
  assetTypes: Record<string, number>;
  subClassification: Record<string, number>;
}

interface AssetAllocation {
  type: string;
  value: number;
  allocation: number;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({ panNo, invName, onBack }) => {
  const [fromDate, setFromDate] = useState<Date>(new Date(2025, 3, 1)); // April 1, 2025
  const [toDate, setToDate] = useState<Date>(new Date(2025, 6, 22)); // July 22, 2025
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({} as SummaryData);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format dates for display
  const formattedFromDate = useMemo(() => {
    return fromDate ? `${fromDate.getDate()}-${fromDate.toLocaleString('default', { month: 'long' })}-${fromDate.getFullYear()}` : '';
  }, [fromDate]);

  const formattedToDate = useMemo(() => {
    return toDate ? `${toDate.getDate()}-${toDate.toLocaleString('default', { month: 'long' })}-${toDate.getFullYear()}` : '';
  }, [toDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch client details
        const clientData = await fetchClientDetails(panNo, invName);
        setClientDetails(clientData);

        // Fetch portfolio data
        const response = await fetchPortfolioDetails(invName, panNo);
        const processedData = processPortfolioData(response.data.data);
        const summary = calculateSummary(processedData);

        setPortfolioData(processedData);
        setSummaryData(summary);

        // Transform subClassification into assetAllocation format
        const allocationData = Object.entries(summary.subClassification).map(([type, value]) => ({
          type,
          value: (parseFloat(summary.totalCurrentValue) * (value as number)) / 100,
          allocation: value as number
        }));

        setAssetAllocation(allocationData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load portfolio data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [panNo, invName]);

  const handleSubmit = () => {
    // Here you would typically refetch data with the new date range
    // For now, we'll just log and update the display
    console.log('From:', fromDate);
    console.log('To:', toDate);
    // In a real app, you would call fetchData() again with the new date range
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = portfolioData.map(item => ({
      'Folio No': item.folioNo,
      'Investor': invName,
      'Scheme': item.productName,
      'Units': item.balanceUnits,
      'Cost (Rs.)': item.costValue,
      'NAV (Rs.)': item.price,
      'Value (Rs.)': item.currentValue,
      'P&L (Rs.)': item.profitLoss,
      'Returns (%)': item.absPercentage
    }));

    // Add summary row
    excelData.push({
      'Folio No': 'TOTAL',
      'Investor': '',
      'Scheme': '',
      'Units': '',
      'Cost (Rs.)': summaryData.totalCost,
      'NAV (Rs.)': '',
      'Value (Rs.)': summaryData.totalCurrentValue,
      'P&L (Rs.)': summaryData.totalProfitLoss,
      'Returns (%)': summaryData.totalAbsPercentage
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Portfolio Summary");

    // Generate file name
    const fileName = `Portfolio_Summary_${invName}_${formattedFromDate}_to_${formattedToDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(`Investment Portfolio Summary - ${invName}`, 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${formattedFromDate} to ${formattedToDate}`, 105, 22, { align: 'center' });

    // Add client details
    doc.setFontSize(10);
    doc.text(`Investor: ${invName}`, 14, 30);
    doc.text(`PAN: ${panNo}`, 14, 36);
    if (clientDetails) {
      doc.text(`Address: ${clientDetails.address1} ${clientDetails.address2} ${clientDetails.address3}`, 14, 42);
      doc.text(`City: ${clientDetails.city} - ${clientDetails.pincode}`, 14, 48);
    }

    // Add summary table
    doc.setFontSize(12);
    doc.text('Portfolio Summary', 14, 60);

    autoTable(doc, {
      startY: 65,
      head: [['Metric', 'Value (Rs.)']],
      body: [
        ['Total Cost', summaryData.totalCost],
        ['Current Value', summaryData.totalCurrentValue],
        ['Profit/Loss', summaryData.totalProfitLoss],
        ['Returns', `${summaryData.totalAbsPercentage}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });

    // Add detailed portfolio table
    doc.setFontSize(12);
    doc.text('Detailed Portfolio', 14, (doc as any).lastAutoTable.finalY + 15);

    const portfolioTableData = portfolioData.map(item => [
      item.folioNo,
      item.productName,
      item.balanceUnits,
      item.costValue,
      item.currentValue,
      item.profitLoss,
      `${item.absPercentage}%`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Folio', 'Scheme', 'Units', 'Cost', 'Value', 'P&L', 'Returns']],
      body: portfolioTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      pageBreak: 'auto'
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Generated by Vedant Asset', 195, 285, { align: 'right' });
    }

    // Save the PDF
    doc.save(`Portfolio_Summary_${invName}_${formattedFromDate}_to_${formattedToDate}.pdf`);
  };

  const handlePrint = () => {
    // Create a print-specific HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Investment Summary - ${invName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .header-info { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .border { border: 1px solid #ddd; }
            .font-bold { font-weight: bold; }
            .text-red-600 { color: #dc2626; }
            .text-green-600 { color: #16a34a; }
            .summary-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .summary-card { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
            .summary-card h3 { background-color: #f3f4f6; margin: 0; padding: 8px; text-align: center; font-size: 12px; }
            .summary-card-content { padding: 10px; }
            .chart-container { display: flex; justify-content: center; margin: 20px 0; }
            .disclaimer { margin-top: 30px; font-size: 10px; }
            @page { size: auto; margin: 10mm; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1><span style="color: #f97316">Vedant</span><span>Asset</span></h1>
              <div>
                <p><strong>Investor:</strong> ${invName}</p>
                <p><strong>PAN:</strong> ${panNo}</p>
                ${clientDetails ? `
                  <p><strong>Address:</strong> ${clientDetails.address1} ${clientDetails.address2} ${clientDetails.address3}</p>
                  <p><strong>City:</strong> ${clientDetails.city} - ${clientDetails.pincode}</p>
                  <p><strong>Email:</strong> ${clientDetails.email}</p>
                  <p><strong>Mobile:</strong> ${clientDetails.mobile_no}</p>
                ` : ''}
              </div>
            </div>
            <div class="header-info">
              <p class="font-semibold">vedant asset</p>
              <p>3rd Floor, Gayways House, Above Space Furniture, P.P Compound,</p>
              <p>Main Road Ranchi 834001 Jharkhand</p>
              <p>Phone: 9304955509, Email: vedantasset@gmail.com</p>
              <p>Website: www.vedantasset.co.in</p>
              <p><strong>Report Period:</strong> ${formattedFromDate} to ${formattedToDate}</p>
            </div>
          </div>

          <h2>Investment Portfolio Summary</h2>
          
          <!-- Main Investment Table -->
          <table>
            <thead>
              <tr class="bg-gray-100">
                <th rowspan="2">Folio</th>
                <th rowspan="2">Investor</th>
                <th rowspan="2">Scheme</th>
                <th colspan="4">Opening Unit Balance (as on ${formattedFromDate})</th>
                <th colspan="6">Investments & Deposits (Rs.)</th>
                <th colspan="4">Withdrawals (Rs.)</th>
                <th colspan="4">Dividends / Interest (Rs.)</th>
                <th colspan="4">Closing Unit Balance (as on ${formattedToDate})</th>
                <th colspan="4">P&L (Rs.)</th>
                <th colspan="3">Returns (%)</th>
              </tr>
              <tr class="bg-gray-100">
                <th>Units</th>
                <th>Cost (Rs.)</th>
                <th>NAV (Rs.)</th>
                <th>Value (Rs.)</th>
                <th>Normal</th>
                <th>SIP</th>
                <th>DTP In</th>
                <th>Normal</th>
                <th>STP In</th>
                <th>Others</th>
                <th>Normal</th>
                <th>SWP</th>
                <th>Normal</th>
                <th>STP Out</th>
                <th>Others</th>
                <th>Re-Inv</th>
                <th>Paid</th>
                <th>DTP Out</th>
                <th>Units</th>
                <th>Cost (Rs.)</th>
                <th>NAV (Rs.)</th>
                <th>Value (Rs.)</th>
                <th>Un-Realized</th>
                <th>Realized</th>
                <th>Un-Realized</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${portfolioData.map(item => `
                <tr>
                  <td>${item.folioNo}</td>
                  <td>${invName}</td>
                  <td>${item.productName}</td>
                  <td class="text-right">${item.balanceUnits}</td>
                  <td class="text-right">${item.costValue}</td>
                  <td class="text-right">${item.price}</td>
                  <td class="text-right">${item.costValue}</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right">${item.balanceUnits}</td>
                  <td class="text-right">${item.costValue}</td>
                  <td class="text-right">${item.currentNav}</td>
                  <td class="text-right">${item.currentValue}</td>
                  <td class="text-right ${parseFloat(item.profitLoss) < 0 ? 'text-red-600' : 'text-green-600'}">${item.profitLoss}</td>
                  <td class="text-right">0.00</td>
                  <td class="text-right ${parseFloat(item.absPercentage) < 0 ? 'text-red-600' : 'text-green-600'}">${item.absPercentage}%</td>
                  <td class="text-right ${parseFloat(item.profitLoss) < 0 ? 'text-red-600' : 'text-green-600'}">${item.profitLoss}</td>
                </tr>
              `).join('')}
              <tr class="bg-gray-200 font-bold">
                <td colspan="6" class="text-center">Total</td>
                <td class="text-right">${summaryData.totalCost}</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">0.00</td>
                <td class="text-right">${summaryData.totalUnits}</td>
                <td class="text-right">${summaryData.totalCurrentValue}</td>
                <td class="text-right text-green-600">${summaryData.totalProfitLoss}</td>
                <td class="text-right">0.00</td>
                <td class="text-right text-green-600">${summaryData.totalAbsPercentage}%</td>
                <td class="text-right text-green-600">${summaryData.totalProfitLoss}</td>
              </tr>
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="summary-section">
            <!-- Portfolio Snapshot -->
            <div class="summary-card">
              <h3>Portfolio Snapshot</h3>
              <div class="summary-card-content">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Cost of Balance Units (Rs.):</span>
                  <span class="font-bold">${summaryData.totalCost}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Current Value (Rs.):</span>
                  <span class="font-bold">${summaryData.totalCurrentValue}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Unrealized Gain/Loss (Rs.):</span>
                  <span class="font-bold ${parseFloat(summaryData.totalProfitLoss) < 0 ? 'text-red-600' : 'text-green-600'}">
                    ${parseFloat(summaryData.totalProfitLoss) < 0 ? '▼' : '▲'} ${Math.abs(parseFloat(summaryData.totalProfitLoss)).toFixed(2)}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>CA(Abs) of Balance Units:</span>
                  <span class="font-bold ${parseFloat(summaryData.totalAbsPercentage) < 0 ? 'text-red-600' : 'text-green-600'}">
                    ${summaryData.totalAbsPercentage}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Asset wise Allocation -->
            <div class="summary-card">
              <h3>Asset wise Allocation (%)</h3>
              <div class="summary-card-content">
                <div class="chart-container">
                  <div style="position: relative; width: 120px; height: 120px;">
                    ${Object.entries(summaryData.assetTypes || {}).map(([type, percentage], idx) => `
                      <div style="
                        position: absolute;
                        inset: 0;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 10px;
                        font-weight: bold;
                        text-shadow: 0 0 2px black;
                        background-color: ${['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'][idx % 7]};
                        ${idx === 0 ? '' : 'clip-path: polygon(0 0, 50% 50%, 100% 100%, 0 100%); transform: rotate(90deg);'}
                      ">
                        ${idx === 0 ? `${type}<br>${percentage}%` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Asset Classification -->
            <div class="summary-card">
              <h3>Asset Classification (%)</h3>
              <div class="summary-card-content">
                <table style="width: 100%; font-size: 10px;">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Asset Type</th>
                      <th style="text-align: left;">Sub Asset Type</th>
                      <th style="text-align: right;">Value (Rs.)</th>
                      <th style="text-align: right;">Alloc (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${assetAllocation.map(item => `
                      <tr>
                        <td>Equity</td>
                        <td>${item.type}</td>
                        <td class="text-right">${item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td class="text-right">${item.allocation.toFixed(2)}%</td>
                      </tr>
                    `).join('')}
                    <tr style="font-weight: bold; background-color: #f3f4f6;">
                      <td colspan="2">Total:</td>
                      <td class="text-right">${summaryData.totalCurrentValue}</td>
                      <td class="text-right">100.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Investment Summary Table -->
          <div style="margin-top: 20px;">
            <div style="background-color: #fed7aa; padding: 8px; text-align: center; font-weight: bold; border-radius: 4px 4px 0 0;">
              Investment Summary for the Report Period<br>
              <span style="font-weight: normal;">(from ${formattedFromDate} - ${formattedToDate})</span>
            </div>
            <table style="border-collapse: collapse; border-radius: 0 0 4px 4px; overflow: hidden;">
              <tbody>
                <tr style="background-color: #f3f4f6;">
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Purchases (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Dividends / Interest Paid (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Redemptions (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Reinvested Dividends (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                </tr>
                <tr style="background-color: #f3f4f6;">
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Net Investment (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">DTP Outs (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Total Realized Gain/Loss (Rs.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">0.00</td>
                  <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Total Returns since Inception (XIRR %p.a.):</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd; color: #16a34a; font-weight: bold;">
                    ${portfolioData[0]?.cagr || '0.00'}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Disclaimer -->
          <div class="disclaimer">
            <h3 style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">Disclaimer</h3>
            <p style="font-size: 10px; margin-bottom: 8px;">
              The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
            </p>
            <p style="font-size: 10px;">
              Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not responsible for any loss or shortfall incurred by the investors. Investors are requested to review the portfolio carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission structure in SID.
            </p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Color palette for charts
  const chartColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
    "#8B5CF6", "#EC4899", "#14B8A6"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        {error}
        <button
          onClick={onBack}
          className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded mx-auto"
        >
          Close
        </button>
      </div>
    );
  }

  if (!portfolioData.length) {
    return (
      <div className="text-center p-4">
        <p>No portfolio data available for this investor.</p>
        <button
          onClick={onBack}
          className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded mx-auto"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="text-sm font-sans text-black bg-white p-4 max-w-full overflow-x-auto">
               <button 
    onClick={() => window.history.back()}
    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
  >
    <ChevronLeft className="w-5 h-5 mr-2" />
    Back 
  </button>
      {/* Header Section */}
      <div className="border-b border-black pb-2 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-orange-500">Vedant</span>
              <span className="text-black">Asset</span>
            </h1>
            <div className="mt-2 text-xs">
              <p>
                <strong>Investor:</strong> {invName}
              </p>
              <p>
                <strong>PAN:</strong> {panNo}
              </p>
              {clientDetails && (
                <>
                  <p>
                    <strong>Address:</strong> {clientDetails.address1} {clientDetails.address2} {clientDetails.address3}
                  </p>
                  <p>
                    <strong>City:</strong> {clientDetails.city} - {clientDetails.pincode}
                  </p>
                  <p>
                    <strong>Email:</strong> {clientDetails.email}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {clientDetails.mobile_no}
                  </p>
                </>
              )}
            </div>
            {/* Action Icons */}
            <div className="flex justify-left gap-3 mt-3 flex-wrap action-buttons">
              {[
                {
                  icon: <FileSpreadsheet size={18} className="text-green-600" />,
                  label: "Excel",
                  action: exportToExcel
                },
                {
                  icon: <FileDown size={18} className="text-red-500" />,
                  label: "PDF",
                  action: exportToPDF
                },
                {
                  icon: <Send size={18} className="text-blue-500" />,
                  label: "Email",
                  action: () => alert('Email functionality will be implemented here')
                },
                {
                  icon: <MessageCircle size={18} className="text-green-600" />,
                  label: "WhatsApp",
                  action: () => alert('WhatsApp functionality will be implemented here')
                },
                {
                  icon: <Printer size={18} className="text-gray-600" />,
                  label: "Print",
                  action: handlePrint
                },
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

          <div className="text-right">
            <p className="font-semibold text-base mb-1">vedant asset</p>
            <p>3rd Floor, Gayways House, Above Space Furniture, P.P Compound,</p>
            <p>Main Road Ranchi 834001 Jharkhand</p>
            <p>Phone: 9304955509, Email: vedantasset@gmail.com</p>
            <p>Website: <a href="https://www.vedantasset.co.in" className="text-blue-600 hover:underline">www.vedantasset.co.in</a></p>

            <div className="mb-2 flex items-center gap-2">
              <strong>From:</strong>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date || new Date())}
                dateFormat="MMMM d, yyyy"
                className="border px-2 py-1 text-xs rounded"
                maxDate={new Date()}
              />
              <strong>Till:</strong>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date || new Date())}
                dateFormat="MMMM d, yyyy"
                className="border px-2 py-1 text-xs rounded"
                maxDate={new Date()}
                minDate={fromDate}
              />
              <button
                onClick={handleSubmit}
                className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs border rounded hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Investment Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-gray-400 p-1 text-center w-20">Folio</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center w-24">Investor</th>
              <th rowSpan={2} className="border border-gray-400 p-1 text-center w-48">Scheme</th>

              <th colSpan={4} className="border border-gray-400 p-1 text-center bg-blue-50">
                Opening Unit Balance<br />
                <span className="text-xs font-normal">(as on {formattedFromDate})</span>
              </th>

              <th colSpan={6} className="border border-gray-400 p-1 text-center bg-green-50">
                Investments & Deposits (Rs.)
              </th>

              <th colSpan={4} className="border border-gray-400 p-1 text-center bg-red-50">
                Withdrawals (Rs.)
              </th>

              <th colSpan={4} className="border border-gray-400 p-1 text-center bg-yellow-50">
                Dividends / Interest (Rs.)
              </th>

              <th colSpan={4} className="border border-gray-400 p-1 text-center bg-purple-50">
                Closing Unit Balance<br />
                <span className="text-xs font-normal">(as on {formattedToDate})</span>
              </th>

              <th colSpan={2} className="border border-gray-400 p-1 text-center bg-orange-50">
                P&L (Rs.)<br />
                <span className="text-xs font-normal">(for this report period)</span>
              </th>

              <th colSpan={3} className="border border-gray-400 p-1 text-center bg-pink-50">
                Returns (%)<br />
                <span className="text-xs font-normal">(on {formattedToDate})</span>
              </th>
            </tr>

            <tr className="bg-gray-50">
              <th className="border border-gray-400 p-1 text-xs">Units</th>
              <th className="border border-gray-400 p-1 text-xs">Cost (Rs.)</th>
              <th className="border border-gray-400 p-1 text-xs">NAV (Rs.)</th>
              <th className="border border-gray-400 p-1 text-xs">Value (Rs.)</th>

              <th className="border border-gray-400 p-1 text-xs">Normal</th>
              <th className="border border-gray-400 p-1 text-xs">SIP</th>
              <th className="border border-gray-400 p-1 text-xs">DTP In</th>
              <th className="border border-gray-400 p-1 text-xs">Normal</th>
              <th className="border border-gray-400 p-1 text-xs">STP In</th>
              <th className="border border-gray-400 p-1 text-xs">Others</th>

              <th className="border border-gray-400 p-1 text-xs">Normal</th>
              <th className="border border-gray-400 p-1 text-xs">SWP</th>
              <th className="border border-gray-400 p-1 text-xs">Normal</th>
              <th className="border border-gray-400 p-1 text-xs">STP Out</th>

              <th className="border border-gray-400 p-1 text-xs">Others</th>
              <th className="border border-gray-400 p-1 text-xs">Re-Inv</th>
              <th className="border border-gray-400 p-1 text-xs">Paid</th>
              <th className="border border-gray-400 p-1 text-xs">DTP Out</th>

              <th className="border border-gray-400 p-1 text-xs">Units</th>
              <th className="border border-gray-400 p-1 text-xs">Cost (Rs.)</th>
              <th className="border border-gray-400 p-1 text-xs">NAV (Rs.)</th>
              <th className="border border-gray-400 p-1 text-xs">Value (Rs.)</th>

              <th className="border border-gray-400 p-1 text-xs">Un-Realized</th>
              <th className="border border-gray-400 p-1 text-xs">Realized</th>
              <th className="border border-gray-400 p-1 text-xs">Un-Realized</th>
              <th className="border border-gray-400 p-1 text-xs">Total</th>
            </tr>
          </thead>

          <tbody>
            {portfolioData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-400 p-1 whitespace-nowrap text-xs">{row.folioNo}</td>
                <td className="border border-gray-400 p-1 whitespace-nowrap text-xs">{invName}</td>
                <td className="border border-gray-400 p-1 whitespace-nowrap text-xs">{row.productName}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.balanceUnits}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.costValue}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.price}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.costValue}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.balanceUnits}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.costValue}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.currentNav}</td>
                <td className="border border-gray-400 p-1 text-xs text-center">{row.currentValue}</td>
                <td className={`border border-gray-400 p-1 text-xs text-center ${parseFloat(row.profitLoss) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {row.profitLoss}
                </td>
                <td className="border border-gray-300 p-1 text-xs text-center">0.00</td>
                <td className={`border border-gray-300 p-1 text-xs text-center ${parseFloat(row.absPercentage) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {row.absPercentage}%
                </td>
                <td className={`border border-gray-300 p-1 text-xs text-center ${parseFloat(row.profitLoss) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {row.profitLoss}
                </td>
                <td className="border border-gray-300 p-1 text-xs text-center">0.00</td>
                <td className="border border-gray-300 p-1 text-xs text-center">0.00</td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-gray-200 font-bold">
              <td colSpan={6} className="border border-gray-400 p-1 text-[11px] text-center">Total</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">{summaryData.totalCost}</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">{summaryData.totalUnits}</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">{summaryData.totalCurrentValue}</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center text-green-600">{summaryData.totalProfitLoss}</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center text-green-600">{summaryData.totalAbsPercentage}%</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center text-green-600">{summaryData.totalProfitLoss}</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center text-green-600">0.00</td>
              <td className="border border-gray-400 p-1 text-[11px] text-center text-green-600">0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Portfolio Snapshot */}
        <div className="border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <h3 className="bg-gray-200 p-2 text-[11px] font-bold text-center">Portfolio Snapshot</h3>
          <div className="p-2 text-[11px]">
            <div className="flex justify-between mb-1 hover:bg-gray-50 p-1 rounded">
              <span>Total Cost of Balance Units (Rs.):</span>
              <span className="font-bold">{summaryData.totalCost}</span>
            </div>
            <div className="flex justify-between mb-1 hover:bg-gray-50 p-1 rounded">
              <span>Total Current Value of the Portfolio (Rs.):</span>
              <span className="font-bold">{summaryData.totalCurrentValue}</span>
            </div>
            <div className="flex justify-between hover:bg-gray-50 p-1 rounded">
              <span>Total Unrealized Gain/Loss (Rs.):</span>
              <span className={`font-bold ${parseFloat(summaryData.totalProfitLoss) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(summaryData.totalProfitLoss) < 0 ? '▼' : '▲'} {Math.abs(parseFloat(summaryData.totalProfitLoss)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mt-2 hover:bg-gray-50 p-1 rounded">
              <span>CA(Abs) of Balance Units:</span>
              <span className={`font-bold ${parseFloat(summaryData.totalAbsPercentage) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {summaryData.totalAbsPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Asset wise Allocation */}
        <div className="border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <h3 className="bg-gray-200 p-2 text-[11px] font-bold text-center">Asset wise Allocation (%)</h3>
          <div className="p-4 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-2">
              {summaryData.assetTypes && Object.entries(summaryData.assetTypes).map(([type, percentage], idx) => (
                <div
                  key={type}
                  className="absolute inset-0 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-inner hover:opacity-90 transition-opacity cursor-pointer"
                  style={{
                    backgroundColor: chartColors[idx % chartColors.length],
                    clipPath: idx === 0 ? undefined : `polygon(0 0, 50% 50%, 100% 100%, 0 100%)`,
                    transform: idx === 0 ? undefined : 'rotate(90deg)'
                  }}
                  title={`${type}: ${percentage}%`}
                >
                  {idx === 0 && `${type}\n${percentage}%`}
                </div>
              ))}
            </div>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 active:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        </div>

        {/* Asset Classification */}
        <div className="border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <h3 className="bg-gray-200 p-2 text-[11px] font-bold text-center">Asset Classification (%)</h3>
          <div className="p-2">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">Asset Type</th>
                  <th className="text-left p-1">Sub Asset Type</th>
                  <th className="text-right p-1">Value (Rs.)</th>
                  <th className="text-right p-1">Alloc (%)</th>
                </tr>
              </thead>
              <tbody>
                {assetAllocation.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-1">Equity</td>
                    <td className="p-1">{item.type}</td>
                    <td className="p-1 text-right">{item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{item.allocation.toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100 hover:bg-gray-200">
                  <td colSpan={2} className="p-1">Total:</td>
                  <td className="p-1 text-right">{summaryData.totalCurrentValue}</td>
                  <td className="p-1 text-right">100.00%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sub-Asset wise Allocation Chart */}
      <div className="mb-6">
        <div className="border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <h3 className="bg-gray-200 p-2 text-[11px] font-bold text-center">Sub-Asset wise Allocation (%)</h3>
          <div className="p-4">
            <div className="flex items-end justify-center space-x-2 h-48">
              {assetAllocation.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center group cursor-pointer"
                  title={`${item.type}: ${item.allocation.toFixed(2)}% (Rs. ${item.value.toLocaleString('en-IN')})`}
                >
                  <div
                    className="w-10 mb-1 transition-all duration-300 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1"
                    style={{
                      height: `${(item.allocation / Math.max(...assetAllocation.map(a => a.allocation))) * 140}px`,
                      backgroundColor: chartColors[index % chartColors.length],
                      backgroundImage: `linear-gradient(to bottom, ${chartColors[index % chartColors.length]}, ${chartColors[(index + 3) % chartColors.length]})`
                    }}
                  ></div>
                  <div className="text-[10px] text-center transform -rotate-45 origin-top-left w-16 group-hover:font-bold transition-all">
                    {item.type.replace(' Fund', '')}<br />
                    <span className="font-bold">({item.allocation.toFixed(2)}%)</span>
                  </div>
                  <div className="text-[10px] text-center mt-2 group-hover:text-blue-600 transition-colors">
                    Rs {(item.value / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              {assetAllocation.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center text-[11px] cursor-pointer hover:underline"
                  onClick={() => alert(`${item.type}: ${item.allocation.toFixed(2)}% (Rs. ${item.value.toLocaleString('en-IN')})`)}
                >
                  <div
                    className="w-3 h-3 mr-1 rounded-sm"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  ></div>
                  <span>{item.type.replace(' Fund', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Summary Table */}
      <div className="mb-6">
        <div className="bg-orange-200 p-2 text-[11px] font-bold text-center rounded-t-lg">
          Investment Summary for the Report Period<br />
          <span className="font-normal">(from {formattedFromDate} - {formattedToDate})</span>
        </div>
        <table className="w-full border-collapse text-[11px] rounded-b-lg overflow-hidden shadow-sm">
          <tbody>
            <tr className="bg-gray-100 hover:bg-gray-200 transition-colors">
              <td className="border border-gray-400 p-2 font-bold">Purchases (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
              <td className="border border-gray-400 p-2 font-bold">Dividends / Interest Paid (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
            </tr>
            <tr className="hover:bg-gray-100 transition-colors">
              <td className="border border-gray-400 p-2 font-bold">Redemptions (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
              <td className="border border-gray-400 p-2 font-bold">Reinvested Dividends (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
            </tr>
            <tr className="bg-gray-100 hover:bg-gray-200 transition-colors">
              <td className="border border-gray-400 p-2 font-bold">Net Investment (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
              <td className="border border-gray-400 p-2 font-bold">DTP Outs (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
            </tr>
            <tr className="hover:bg-gray-100 transition-colors">
              <td className="border border-gray-400 p-2 font-bold">Total Realized Gain/Loss (Rs.):</td>
              <td className="border border-gray-400 p-2 text-right">0.00</td>
              <td className="border border-gray-400 p-2 font-bold">Total Returns since Inception (XIRR %p.a.):</td>
              <td className="border border-gray-400 p-2 text-right text-green-600 font-bold">
                {portfolioData[0]?.cagr || '0.00'}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-black pt-4">
        <h3 className="text-[11px] font-bold mb-2">Disclaimer</h3>
        <div className="text-[10px] leading-tight">
          <p className="mb-2">
            The above report output is generated by computer, using the mailback data received from the respective registrars. No signature required. Please report to the administrator immediately, for any discrepancy found in the statement.
          </p>
          <p className="mb-2">
            Mutual Fund investments are subject to market risks, read all scheme related documents carefully. The NAVs of the schemes may go up or down depending upon the factors and forces affecting the securities market including the fluctuations in the interest rates. The past performance of the mutual funds is not necessarily indicative of future performance of the schemes. The Mutual Fund is not responsible for any loss or shortfall incurred by the investors. Investors are requested to review the portfolio carefully and obtain expert professional advice with regard to specific legal, tax and financial implications of the investment/participation in the scheme. Please refer more details about commission structure in SID.
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={onBack}
          className="bg-[#2f80b9] text-white px-4 py-2 rounded text-sm"
        >
          Close Investment Summary
        </button>
      </div>
    </div>
  );
};

export default InvestmentSummary;