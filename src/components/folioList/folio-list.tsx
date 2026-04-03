"use client";

import React, { useState, useEffect } from "react";
import { getFolioDetails, FolioItem } from "@/services/folioService";
import { FaFileExcel, FaFilePdf, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import * as XLSX from "xlsx";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";



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
        
        // Extract investor name from the first record if available
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

  // Header
  doc.setFontSize(16);
  doc.text("Folio Report", 14, 15);

  // Investor info
  doc.setFontSize(11);
  doc.text(`Investor: ${investorName || "N/A"}`, 14, 25);
  doc.text(`PAN: ${panNo}`, 14, 32);
  doc.text(`Total Folios: ${folioData.length}`, 14, 39);

  // Columns
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

  // Rows
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

  // ✅ Correct way to call
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);

  // Save file
  doc.save(`Folio_Data_${panNo}.pdf`);
};



  // const handleEmail = () => {
  //   const subject = `Folio Details for ${investorName || 'Investor'} - PAN: ${panNo}`;
  //   const body = `Please find the folio details for ${investorName || 'the investor'} (PAN: ${panNo}) attached.`;
  //   window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // };

  // const handleWhatsApp = () => {
  //   const message = `Folio details for ${investorName || 'Investor'} - PAN: ${panNo}\n\n` +
  //     `Total Folios: ${folioData.length}\n` +
  //     `Schemes: ${[...new Set(folioData.map(item => item.sch_name))].join(", ")}`;
  //   window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (folioData.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
        <p>No folio data found for this client.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border rounded-lg shadow bg-white">
      {/* Header Section */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Investor: {investorName || 'N/A'} | Pan: {panNo}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {folioData.length} folio{folioData.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-2 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded text-xs font-medium shadow-sm"
            title="Download Excel"
          >
            <FaFileExcel className="mr-1" size={12} />
            Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-2 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded text-xs font-medium shadow-sm"
            title="Download PDF"
          >
            <FaFilePdf className="mr-1" size={12} />
            PDF
          </button>
          {/* <button 
            onClick={handleEmail}
            className="flex items-center px-2 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded text-xs font-medium shadow-sm"
            title="Email"
          >
            <FaEnvelope className="mr-1" size={12} />
            Email
          </button> */}
          {/* <button 
            onClick={handleWhatsApp}
            className="flex items-center px-2 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-xs font-medium shadow-sm"
            title="Share via WhatsApp"
          >
            <FaWhatsapp className="mr-1" size={12} />
            WhatsApp
          </button> */}
        </div>
      </div>

      {/* Compact Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-12">ARN</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-16">Folio#</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-20">Fund</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-28">Scheme</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-16">Holding</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-20">Joint-1</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-20">Joint-2</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-24">Nominees</th>
              <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-16">Source</th>
              {/* <th className="px-2 py-2 border-r border-gray-600 text-left font-medium w-16">Dist.</th> */}
              {/* <th className="px-2 py-2 text-left font-medium w-24">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {folioData.map((folio, index) => (
              <tr 
                key={index} 
                className={`hover:bg-blue-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.broker_cod || "-"}>
                  <span className="text-xs text-gray-700">{folio.broker_cod || "-"}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate font-medium" title={folio.foliochk}>
                  <span className="text-xs text-blue-700">{folio.foliochk}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.mutual_fund}>
                  <span className="text-xs text-gray-700">{folio.mutual_fund}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200" title={folio.sch_name}>
                  <div className="text-xs text-gray-700 leading-tight">
                    {folio.sch_name && folio.sch_name.length > 25 
                      ? `${folio.sch_name.substring(0, 25)}...` 
                      : folio.sch_name
                    }
                  </div>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.holding_na || "-"}>
                  <span className="text-xs text-gray-700">{folio.holding_na || "-"}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.jnt_name1 || "-"}>
                  <span className="text-xs text-gray-700">{folio.jnt_name1 || "-"}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.jnt_name2 || "-"}>
                  <span className="text-xs text-gray-700">{folio.jnt_name2 || "-"}</span>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200">
                  <div className="text-xs text-gray-700 leading-tight">
                    {[folio.nom_name, folio.nom2_name, folio.nom3_name]
                      .filter(Boolean)
                      .map((nom, i) => (
                        <div key={i} className="truncate" title={`Nominee ${i+1}: ${nom}`}>
                          N{i+1}: {nom && nom.length > 10 ? `${nom.substring(0, 10)}...` : nom}
                        </div>
                      ))}
                    {![folio.nom_name, folio.nom2_name, folio.nom3_name].some(Boolean) && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 truncate" title={folio.source_table}>
                  <span className="text-xs text-gray-700">{folio.source_table}</span>
                </td>
                {/* <td className="px-2 py-1.5 border-r border-gray-200">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-1 py-0.5 rounded">HO</span>
                </td> */}
                {/* <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    <button className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors">
                      Buy
                    </button>
                    <button className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-1 py-0.5 rounded transition-colors">
                      Sell
                    </button>
                    <button className="text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-1 py-0.5 rounded transition-colors">
                      Switch
                    </button>
                    <button className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-1 py-0.5 rounded transition-colors">
                      Update
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>Total: {folioData.length} records</span>
          <span>Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}