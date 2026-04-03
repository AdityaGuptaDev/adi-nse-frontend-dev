"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getInvestorDataByPAN } from "@/services/remapInvestorService";
import { FaFileExcel, FaFilePdf, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import * as XLSX from "xlsx";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  doc.text("Investor Report", 14, 15);

  const tableColumn = ["Source", "ARN", "Folio #", "Mutual Fund", "Scheme"];
  const tableRows = data.map((item) => [
    item.source_table || "-",
    item.broker_cod || "-",
    item.foliochk || "-",
    item.mutual_fund || "-",
    item.sch_name || "-",
  ]);

  // ✅ correct usage
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
  });

  doc.save(`Investor_Data_${pan}.pdf`);
};


  // const handleEmail = () => {
  //   const subject = `Investor Data for PAN: ${pan}`;
  //   const body = `Please find the investor data for PAN ${pan} attached.`;
  //   window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // };

  // const handleWhatsApp = () => {
  //   const message = `Investor details for PAN: ${pan}\n\n` +
  //     `Total Folios: ${data.length}\n` +
  //     `AMCs: ${[...new Set(data.map(item => item.sch_name))].join(", ")}`;
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

  if (data.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
        <p>No investor data found for PAN: {pan}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-lg shadow-md bg-white overflow-x-auto">
      <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-medium text-gray-700">
          View Investor Details (PAN: {pan})
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
            title="Download Excel"
          >
            <FaFileExcel className="mr-2" size={16} />
            <span>Excel</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
            title="Download PDF"
          >
            <FaFilePdf className="mr-2" size={16} />
            <span>PDF</span>
          </button>
          {/* <button 
            onClick={handleEmail}
            className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
            title="Email"
          >
            <FaEnvelope className="mr-2" size={16} />
            <span>Email</span>
          </button> */}
          {/* <button 
            onClick={handleWhatsApp}
            className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
            title="Share via WhatsApp"
          >
            <FaWhatsapp className="mr-2" size={16} />
            <span>WhatsApp</span>
          </button> */}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border text-left">Select</th>
              <th className="p-3 border text-left">Source</th>
              <th className="p-3 border text-left">ARN</th>
              <th className="p-3 border text-left">Folio #</th>
               <th className="p-3 border text-left">Mutual Fund</th>
              <th className="p-3 border text-left">Scheme</th>
              <th className="p-3 border text-left">Jnt Name1</th>
              <th className="p-3 border text-left">Jnt Name2</th>
              <th className="p-3 border text-left">Bank</th>
              <th className="p-3 border text-left">Branch</th>
              <th className="p-3 border text-left">A/C Type</th>
              <th className="p-3 border text-left">A/C Number</th>
              <th className="p-3 border text-left">Holding</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 even:bg-gray-50">
                <td className="border p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedFolios.includes(item.foliochk)}
                    onChange={() => toggleFolioSelection(item.foliochk)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="border p-3 whitespace-nowrap">{item.source_table}</td>
                <td className="border p-3 whitespace-nowrap">{item.broker_cod || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.foliochk}</td>
                 <td className="border p-3 whitespace-nowrap">{item.mutual_fund}</td>
                <td className="border p-3 max-w-[200px] truncate" title={item.sch_name}>
                  {item.sch_name}
                </td>
                <td className="border p-3 whitespace-nowrap">{item.jnt_name1 || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.jnt_name2 || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.bank_name || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.branch || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.ac_type || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.ac_no || '-'}</td>
                <td className="border p-3 whitespace-nowrap">{item.holding_na || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
           <div className="p-4 border-t flex justify-start">
        <button
          onClick={handleViewTransactions}
          className="bg-[#2f80b9] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          View Transactions / Folios
        </button>
      </div>
    </div>
  );
}