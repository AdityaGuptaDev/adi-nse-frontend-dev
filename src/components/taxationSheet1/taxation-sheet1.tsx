"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Download, Calendar, Shield, ArrowLeft } from 'lucide-react';
import { getTaxationSummaryData, getTaxationSummaryData1, TaxationSummary } from '@/services/clientService';
import { useRouter } from 'next/navigation';
import { PROD_DATA, USER_DATA } from '@/utils/constants';
import { getLS } from '@/utils/helpers';

interface TaxSheet1Props {
  onBack?: () => void;
  clientName?: string;
  clientPan?: string;
}

const TaxSheet1: React.FC<TaxSheet1Props> = ({ 
  onBack, 
  clientName: propClientName,
  clientPan: propClientPan 
}: TaxSheet1Props) => {
  const router = useRouter();
  const [reportOption, setReportOption] = useState<'detailed' | 'summary'>('detailed');
  const [reportFormat, setReportFormat] = useState<string>('HTML Format');
  const [investor, setInvestor] = useState<string>('');
  const [toDate, setToDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [taxationData, setTaxationData] = useState<TaxationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPanInput, setShowPanInput] = useState(false);
  const [manualPan, setManualPan] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Helper to get PAN from global storage
  const getGlobalClientPan = () => {
    try {
      // 1. Try window global variable
      if (typeof window !== 'undefined') {
        const windowClient = (window as any).__currentTaxClient;
        if (windowClient && windowClient.pan) {
          return { pan: windowClient.pan };
        }
      }
      
      // 2. Try tax-specific sessionStorage
      const sessionClient = sessionStorage.getItem('taxSheetClient');
      if (sessionClient) {
        const parsed = JSON.parse(sessionClient);
        if (parsed.pan) {
          return { pan: parsed.pan };
        }
      }
      
      // 3. Try original sessionStorage key
      const originalSessionClient = sessionStorage.getItem('selectedClient');
      if (originalSessionClient) {
        const parsed = JSON.parse(originalSessionClient);
        if (parsed.pan) {
          return { pan: parsed.pan };
        }
      }
      
      // 4. Try localStorage backup
      const lastClientData = localStorage.getItem('lastClientData');
      if (lastClientData) {
        const parsed = JSON.parse(lastClientData);
        if (parsed.clients && parsed.clients.length > 0 && parsed.clients[0].pan) {
          return { pan: parsed.clients[0].pan };
        }
      }
      
      return null;
    } catch (err) {
      return null;
    }
  };

  const searchParams = useSearchParams();
  const user = getLS(USER_DATA);
  const globalPanInfo = getGlobalClientPan();
  
  const selectedPan = 
    propClientPan ||
    sessionStorage.getItem('manualTaxPan') ||
    globalPanInfo?.pan ||
    searchParams.get('pan') ||
    user?.InvestorRegistration?.pan_no ||
    '';

  const selectedName = 
    propClientName ||
    searchParams.get('name') ||
    user?.InvestorRegistration?.name ||
    '';

  useEffect(() => {
    if (!selectedPan || selectedPan.trim() === '') {
      const timer = setTimeout(() => {
        setShowPanInput(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!selectedPan || selectedPan.trim() === '') {
          throw new Error("PAN number is required");
        }
        
        const currentYear = new Date().getFullYear();
        const fromDate = `${currentYear - 1}-04-01`;
        
        const taxationSummary = await getTaxationSummaryData1(
          selectedPan,
          fromDate
        );
        
        setTaxationData(taxationSummary || []);
        setInvestor(selectedName || investor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPan]);

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadHTML = (htmlData: string, filename: string) => {
    const blob = new Blob([htmlData], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSVData = (data: TaxationSummary[]) => {
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',') + '\n';

      const rows = data
        .map(item =>
          Object.values(item)
            .map(val => {
              let str = val === null || val === undefined ? "" : String(val);
              str = str.replace(/"/g, '""');
              if (/[",\n]/.test(str)) {
                str = `"${str}"`;
              }
              return str;
            })
            .join(',')
        )
        .join('\n');

      return headers + rows;
    }
    return "No Taxation Data Found";
  };

  const generateHTMLData = (data: TaxationSummary[]) => {
    if (data.length > 0) {
      const headers = Object.keys(data[0]);

      const headerRow = `<tr>${headers.map(h => `<th style="border:1px solid #2A2A2A;padding:8px;background:#1F1A1A;color:#F59E0B">${h}</th>`).join('')}</tr>`;
      const rows = data.map(item =>
        `<tr>${Object.values(item)
          .map(val => `<td style="border:1px solid #2A2A2A;padding:8px;color:#F9FAFB">${val ?? ""}</td>`)
          .join('')} </tr>`
      ).join('');

      return `
        <html>
          <head>
            <title>Tax Report (Unrealized)</title>
            <style>
              body { background-color: #0A0A0A; color: #F9FAFB; font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
              th, td { text-align: left; padding: 8px; border: 1px solid #2A2A2A; }
              th { background-color: #1F1A1A; color: #F59E0B; font-weight: bold; }
              tr:nth-child(even) { background-color: #111111; }
              .header { background-color: #1F1A1A; padding: 20px; margin-bottom: 20px; border-radius: 5px; border: 1px solid #2A2A2A; }
              .summary { margin-bottom: 20px; }
              h2 { color: #F59E0B; }
              p { color: #9CA3AF; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Unrealized Tax Report for ${investor}</h2>
              <p><strong style="color:#F9FAFB">PAN:</strong> ${selectedPan}</p>
              <p><strong style="color:#F9FAFB">Report Type:</strong> ${reportOption === 'detailed' ? 'Detailed' : 'Summary'}</p>
              <p><strong style="color:#F9FAFB">Format:</strong> ${reportFormat}</p>
              <p><strong style="color:#F9FAFB">As of Date:</strong> ${formatDate(toDate)}</p>
              <p><strong style="color:#F9FAFB">Generated On:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong style="color:#F9FAFB">Total Records:</strong> ${data.length}</p>
            </div>
            <table>${headerRow}${rows} </>
          </body>
        </html>
      `;
    }
    return "<p style='color:#9CA3AF'>No Taxation Data Found</p>";
  };

  const handleShowReport = async () => {
    if (loading) {
      alert("Please wait while we load your taxation data");
      return;
    }

    if (error) {
      alert("Cannot generate report: " + error);
      return;
    }

    if (!toDate) {
      alert("Please select Date");
      return;
    }

    try {
      const taxationData = await getTaxationSummaryData1(selectedPan, toDate);

      if (!taxationData || taxationData.length === 0) {
        alert("No taxation data available for the selected period");
        return;
      }

      let filteredData = taxationData;
      if (reportFormat === 'Long Term Equity (112A) - eFiling Format (CSV)') {
        filteredData = taxationData.filter(item => item.gain_type === "LTCG");
      } else if (reportFormat === 'Short Term Capital Gains Format (CSV)') {
        filteredData = taxationData.filter(item => item.gain_type === "STCG");
      }

      if (filteredData.length === 0) {
        alert("No matching records found for the selected report format.");
        return;
      }

      setTaxationData(filteredData);

      const timestamp = new Date().toISOString().slice(0, 10);
      const filenameBase = `Unrealized_Tax_Report_${investor.replace(/\s+/g, '_')}_${timestamp}`;

      if (reportFormat === 'HTML Format') {
        const htmlData = generateHTMLData(filteredData);
        downloadHTML(htmlData, `${filenameBase}.html`);
        alert(`HTML report generated successfully!\nRecords: ${filteredData.length}`);
      } else {
        const csvData = generateCSVData(filteredData);
        downloadCSV(csvData, `${filenameBase}.csv`);
        alert(`CSV report generated successfully!\nRecords: ${filteredData.length}`);
      }
    } catch (err) {
      alert("Error generating tax report. Please try again.");
    }
  };

  const formatOptions = [
    'HTML Format',
    'Complete Report - Computax Format (CSV)',
    'Long Term Equity (112A) - eFiling Format (CSV)',
    'Short Term Capital Gains Format (CSV)'
  ];

  function formatDate(dateString: string): string {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // PAN Input Modal
  const PanInputModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#F9FAFB]">PAN Required</h2>
          <button 
            onClick={() => setShowPanInput(false)}
            className="text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
          >
            ✕
          </button>
        </div>
        
        <p className="text-[#9CA3AF] mb-4">
          Could not automatically detect the PAN number. Please enter it manually:
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#F9FAFB] mb-1">
              PAN Number
            </label>
            <input
              type="text"
              value={manualPan}
              onChange={(e) => setManualPan(e.target.value.toUpperCase())}
              placeholder="e.g., ABCDE1234F"
              className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
              maxLength={10}
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">
              Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowPanInput(false)}
              className="px-4 py-2 text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (manualPan && manualPan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
                  sessionStorage.setItem('manualTaxPan', manualPan);
                  window.location.reload();
                } else {
                  alert('Please enter a valid PAN number (format: ABCDE1234F)');
                }
              }}
              className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              Use This PAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B] mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-[#9CA3AF]">Loading unrealized taxation data...</p>
        </div>
        {showPanInput && <PanInputModal />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <div className="bg-[#111111] rounded-xl shadow-lg max-w-4xl w-full border border-[#2A2A2A]">
          <div className="p-6">
            <div className="text-red-400 mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#F9FAFB] mb-2 text-center">Error Loading Data</h2>
            <p className="text-[#9CA3AF] mb-6 text-center">{error}</p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
              <button
                onClick={handleBack}
                className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => setShowPanInput(true)}
                className="bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] px-6 py-2 rounded-lg hover:bg-[#2A2A2A] transition-all"
              >
                Enter PAN Manually
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] px-6 py-2 rounded-lg hover:bg-[#2A2A2A] transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
        {showPanInput && <PanInputModal />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#111111] shadow-sm border-b border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={handleBack} 
            className="flex items-center space-x-2 text-[#F59E0B] hover:text-[#FBBF24] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-[#9CA3AF]">
              <span className="font-semibold text-[#F9FAFB]">PAN:</span> {selectedPan}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Investor Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden">
              {/* Investor Info Header */}
              <div className="px-6 py-4 border-b border-[#2A2A2A]">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[#F9FAFB]">Investor Information</h2>
                  <span className="text-xs text-[#9CA3AF]">
                    Unrealized Gains
                  </span>
                </div>
              </div>

              {/* Investor Info Content */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF]">Investor Name</label>
                  <div className="bg-[#1F1A1A] px-4 py-3 rounded-lg border border-[#2A2A2A] mt-1">
                    <p className="text-[#F9FAFB] font-medium">{investor || selectedName || "Not available"}</p>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-1">PAN Number</label>
                    <div className="bg-[#1F1A1A] px-4 py-3 rounded-lg border border-[#2A2A2A]">
                      <p className="text-[#F9FAFB] font-mono font-bold tracking-wider">{selectedPan || "Not available"}</p>
                    </div>
                  </div>
                </div>

                {/* Report Date */}
                <div className="border-t border-[#2A2A2A] pt-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#F59E0B]" />
                    <div>
                      <p className="text-sm font-medium text-[#9CA3AF]">Report Date</p>
                      <p className="text-sm text-[#F9FAFB]">
                        {new Date().toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button neatly placed inside card */}
              <div className="bg-[#1F1A1A] px-6 py-4 border-t border-[#2A2A2A]">
                <button
                  onClick={handleShowReport}
                  disabled={!selectedPan}
                  className={`w-full flex items-center justify-center px-6 py-3 
                   text-white font-semibold rounded-lg shadow-md 
                   transition-all duration-300
                   ${selectedPan 
                     ? 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] hover:opacity-90' 
                     : 'bg-[#2A2A2A] cursor-not-allowed text-[#9CA3AF]'}`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {selectedPan ? 'Generate Unrealized Tax Report' : 'PAN Required'}
                </button>
                {!selectedPan && (
                  <button
                    onClick={() => setShowPanInput(true)}
                    className="w-full mt-2 text-sm text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                  >
                    Enter PAN manually
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2A2A2A]">
                <h2 className="text-lg font-semibold text-[#F9FAFB]">Unrealized Tax Report Configuration</h2>
              </div>
              <div className="p-6 space-y-8">
                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-[#F59E0B]">1. Date Selection</h3>
                  <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9CA3AF] mb-1">As of Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      />
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        This report shows unrealized gains up to the selected date
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-[#F59E0B]">2. Export Options</h3>
                  <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Select Format</label>
                      <select 
                        value={reportFormat} 
                        onChange={(e) => setReportFormat(e.target.value)} 
                        className="w-full border border-[#2A2A2A] bg-[#1F1A1A] text-[#F9FAFB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                      >
                        {formatOptions.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        {reportFormat === 'HTML Format' || reportFormat === 'Complete Report - Computax Format (CSV)'
                          ? "This format will include full detailed records"
                          : "Standard format"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Data Info */}
                <div className="bg-[#1F1A1A] p-4 rounded-lg border border-[#2A2A2A]">
                  <h4 className="text-sm font-semibold text-[#F59E0B] mb-2">About Unrealized Tax Report</h4>
                  <ul className="text-xs text-[#9CA3AF] space-y-1">
                    <li>• Shows unrealized capital gains/losses as of selected date</li>
                    <li>• Useful for tax planning and portfolio review</li>
                    <li>• Data includes both LTCG and STCG calculations</li>
                    <li>• Based on cost basis and current market value</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showPanInput && <PanInputModal />}
    </div>
  );
};

export default TaxSheet1;