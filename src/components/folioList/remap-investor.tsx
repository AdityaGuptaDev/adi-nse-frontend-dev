"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getInvestorDataByPAN } from "@/services/remapInvestorService";
import { FaFileExcel, FaFilePdf, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface RemapInvestorProps {
  pan: string;
}

export default function RemapInvestor({ pan }: RemapInvestorProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInvestorDataByPAN(pan);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch investor data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (pan) {
      fetchData();
    } else {
      setError("PAN number is required");
      setLoading(false);
    }
  }, [pan]);

  const toggleFolioSelection = (folioId: string) => {
    setSelectedFolios(prev =>
      prev.includes(folioId)
        ? prev.filter(id => id !== folioId)
        : [...prev, folioId]
    );
  };

  const handleViewTransactions = () => {
    if (selectedFolios.length === 0) {
      alert("Please select at least one folio to view transactions.");
      return;
    }

    const selectedData = data.filter(d => selectedFolios.includes(d.foliochk));
    localStorage.setItem("selectedFolios", JSON.stringify(selectedData));
    router.push(`/folioList/transaction?page=multi&pan=${pan}`);
  };

  const handleExportExcel = () => {
    try {
      const excelData = data.map(item => ({
        "Source": item.source_table || "-",
        "ARN": item.broker_cod || "-",
        "Folio #": item.foliochk || "-",
        "Mutual Fund": item.mutual_fund ||"-",
        "AMC/Company": item.sch_name || "-",
        "Jnt Name1": item.jnt_name1 || "-",
        "Jnt Name2": item.jnt_name2 || "-",
        "Bank": item.bank_name || "-",
        "Branch": item.branch || "-",
        "A/C Type": item.ac_type || "-",
        "A/C Number": item.ac_no || "-",
        "Holding": item.holding_na || "-"
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Investor Data");
      XLSX.writeFile(workbook, `Investor_Data_${pan}.xlsx`);
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11);
    doc.text("Investor Report", 14, 15);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`PAN: ${pan}`, 14, 25);
    doc.text(`Total Folios: ${data.length}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 39);

    const tableColumn = ["Source", "ARN", "Folio #", "Mutual Fund", "Scheme"];
    const tableRows = data.map((item) => [
      item.source_table || "-",
      item.broker_cod || "-",
      item.foliochk || "-",
      item.mutual_fund || "-",
      item.sch_name || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [30, 30, 30],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
    });

    doc.save(`Investor_Data_${pan}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-[#111111] rounded-xl border border-[#2A2A2A]">
        <Loader2 className="w-12 h-12 text-[#F59E0B] animate-spin" />
        <p className="mt-4 text-white/70">Loading investor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-400">No investor data found for PAN: {pan}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl shadow-lg bg-[#111111] border border-[#2A2A2A] overflow-hidden">
      {/* Header Section */}
      <div className="p-4 bg-gradient-to-r from-[#1F1A1A] to-[#111111] border-b border-[#2A2A2A]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Investor Details
              </h3>
              <p className="text-sm text-white/60">
                PAN: <span className="text-[#F59E0B] font-mono">{pan}</span> • Total Folios: <span className="text-[#F59E0B]">{data.length}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-lg transition-all duration-200 border border-[#10B981]/30"
              title="Download Excel"
            >
              <FaFileExcel size={16} />
              <span className="text-sm font-medium">Excel</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg transition-all duration-200 border border-[#EF4444]/30"
              title="Download PDF"
            >
              <FaFilePdf size={16} />
              <span className="text-sm font-medium">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm border-collapse">
          <thead className="bg-[#1F1A1A]">
            <tr>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Select</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Source</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">ARN</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Folio #</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Mutual Fund</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Scheme</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Jnt Name1</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Jnt Name2</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Bank</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Branch</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">A/C Type</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">A/C Number</th>
              <th className="p-3 border border-[#2A2A2A] text-left text-white font-semibold">Holding</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-[#1F1A1A] transition-colors duration-200 even:bg-[#0F0F0F]">
                <td className="border border-[#2A2A2A] p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedFolios.includes(item.foliochk)}
                    onChange={() => toggleFolioSelection(item.foliochk)}
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#1F1A1A] text-[#F59E0B] focus:ring-[#F59E0B] focus:ring-offset-0"
                  />
                </td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.source_table || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90 font-mono">{item.broker_cod || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90 font-mono">{item.foliochk || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.mutual_fund || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 max-w-[200px] truncate text-white/90" title={item.sch_name}>
                  {item.sch_name || '-'}
                </td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.jnt_name1 || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.jnt_name2 || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.bank_name || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.branch || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.ac_type || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90 font-mono">{item.ac_no || '-'}</td>
                <td className="border border-[#2A2A2A] p-3 whitespace-nowrap text-white/90">{item.holding_na || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section with View Transactions Button on LEFT side */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#1F1A1A] flex justify-start">
        <button
          onClick={handleViewTransactions}
          className="bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Transactions / Folios
        </button>
      </div>
    </div>
  );
}