"use client";

import React, { useState, useEffect } from "react";
import { getFolioDetails, FolioItem } from "@/services/folioService";
import { FaFileExcel, FaFilePdf, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download, Eye, AlertCircle, Loader2 } from 'lucide-react';

interface FolioListProps {
  panNo: string;
  schName?: string;
}

export default function FolioList({ panNo, schName }: FolioListProps) {
  const [folioData, setFolioData] = useState<FolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investorName, setInvestorName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = { pan_no: panNo };
        if (schName) {
          params.sch_name = schName;
        }
        const data = await getFolioDetails(params);
        setFolioData(data);
        
        if (data.length > 0 && data[0].inv_name) {
          setInvestorName(data[0].inv_name);
        }
      } catch (err) {
        setError("Failed to fetch folio data. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [panNo, schName]);

  const handleExportExcel = () => {
    try {
      const excelData = folioData.map(item => ({
        "Investor Name": item.inv_name || "-",
        "PAN": panNo,
        "ARN#": item.broker_cod || "-",
        "Folio#": item.foliochk,
        "Mutual Fund": item.mutual_fund,
        "Scheme": item.sch_name,
        "Holding": item.holding_na || "-",
        "Joint Name 1": item.jnt_name1 || "-",
        "Joint Name 2": item.jnt_name2 || "-",
        "Nominee 1": item.nom_name || "-",
        "Nominee 2": item.nom2_name || "-",
        "Nominee 3": item.nom3_name || "-",
        "Source": item.source_table,
        "Distributor": "HO"
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Folio Data");
      XLSX.writeFile(workbook, `Folio_Data_${panNo}.xlsx`);
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.setTextColor(245, 158, 11);
    doc.text("Folio Report", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(156, 163, 175);
    doc.text(`Investor: ${investorName || "N/A"}`, 14, 28);
    doc.text(`PAN: ${panNo}`, 14, 36);
    doc.text(`Total Folios: ${folioData.length}`, 14, 44);

    const tableColumn = [
      "ARN#",
      "Folio#",
      "Fund",
      "Scheme",
      "Holding",
      "Joint-1",
      "Joint-2",
      "Nominee(s)",
      "Source",
    ];

    const tableRows = folioData.map((folio) => [
      folio.broker_cod || "-",
      folio.foliochk,
      folio.mutual_fund,
      folio.sch_name,
      folio.holding_na || "-",
      folio.jnt_name1 || "-",
      folio.jnt_name2 || "-",
      [folio.nom_name, folio.nom2_name, folio.nom3_name].filter(Boolean).join(", ") || "-",
      folio.source_table,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);

    doc.save(`Folio_Data_${panNo}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 bg-[#111111] rounded-xl border border-[#2A2A2A]">
        <Loader2 className="w-12 h-12 text-[#F59E0B] animate-spin" />
        <p className="mt-4 text-base text-white/70">Loading folio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-500/10 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-base text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (folioData.length === 0) {
    return (
      <div className="p-5 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-base text-yellow-400">No folio data found for this client.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl shadow-lg bg-[#111111] border border-[#2A2A2A] overflow-hidden">
      {/* Header Section */}
      <div className="p-5 bg-gradient-to-r from-[#1F1A1A] to-[#111111] border-b border-[#2A2A2A]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#F59E0B]/20 rounded-xl">
              <FileText className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Folio Details
              </h3>
              <p className="text-sm text-white/60 mt-1">
                Investor: <span className="text-[#F59E0B] font-semibold">{investorName || 'N/A'}</span> | PAN: <span className="text-[#F59E0B] font-mono">{panNo}</span>
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Total {folioData.length} folio{folioData.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-lg transition-all duration-200 border border-[#10B981]/30"
              title="Download Excel"
            >
              <FaFileExcel size={16} />
              <span className="text-sm font-medium">Excel</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg transition-all duration-200 border border-[#EF4444]/30"
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
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#1F1A1A]">
            <tr>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">ARN</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Folio #</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Mutual Fund</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Scheme Name</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-right text-white font-semibold">Holding (Units)</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Joint Holder 1</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Joint Holder 2</th>
              <th className="px-4 py-3 border-r border-[#2A2A2A] text-left text-white font-semibold">Nominees</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {folioData.map((folio, index) => (
              <tr 
                key={index} 
                className={`hover:bg-[#1F1A1A] transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0A0A0A]'
                }`}
              >
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <span className="text-sm text-white/90 font-mono">{folio.broker_cod || "-"}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <span className="text-sm text-[#F59E0B] font-semibold font-mono">{folio.foliochk}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <span className="text-sm text-white/90">{folio.mutual_fund}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <div className="text-sm text-white/90 leading-relaxed">
                    {folio.sch_name}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] text-right align-middle">
                  <span className="text-sm text-white/90 font-medium">{folio.holding_na || "-"}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <span className="text-sm text-white/90">{folio.jnt_name1 || "-"}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <span className="text-sm text-white/90">{folio.jnt_name2 || "-"}</span>
                </td>
                <td className="px-4 py-3 border-r border-[#2A2A2A] align-middle">
                  <div className="text-sm text-white/90 leading-relaxed">
                    {[folio.nom_name, folio.nom2_name, folio.nom3_name]
                      .filter(Boolean)
                      .map((nom, i) => (
                        <div key={i} className="mb-0.5">
                          <span className="text-white/60">N{i+1}:</span> {nom}
                        </div>
                      ))}
                    {![folio.nom_name, folio.nom2_name, folio.nom3_name].some(Boolean) && (
                      <span className="text-white/40">-</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="text-sm text-white/90">{folio.source_table}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="px-5 py-4 bg-[#0A0A0A] border-t border-[#2A2A2A]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm text-white/60">
            Total Records: <span className="text-[#F59E0B] font-bold text-base">{folioData.length}</span>
          </span>
          <span className="text-xs text-white/40">
            Generated on: {new Date().toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}