"use client";

import React, { useState, useEffect } from "react";
import { getTransactions } from "@/services/transactionService";
import { ChevronLeft, Eye, FileText, Download, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { FaFileExcel, FaFilePdf, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface TransactionProps {
  pan: string;
  pageType: string;
  selectedFolios: any[];
}

interface TransactionData {
  folio: string;
  investor1: string;
  investor2: string;
  bank: string;
  branch: string;
  acType: string;
  acNumber: string;
  holding: string;
  transactions: any[];
  loading?: boolean;
  error?: string | null;
}

export default function Transaction({ pan, pageType, selectedFolios }: TransactionProps) {
  const [folioData, setFolioData] = useState<TransactionData[]>([]);
  const [expandedFolio, setExpandedFolio] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (pageType === "multi" && selectedFolios.length > 0) {
        const initialData = selectedFolios.map((folio) => ({
          folio: folio.foliochk,
          investor1: folio.jnt_name1 || "-",
          investor2: folio.jnt_name2 || "-",
          bank: folio.bank_name || "-",
          branch: folio.branch || "-",
          acType: folio.ac_type || "-",
          acNumber: folio.ac_no || "-",
          holding: folio.holding_na || "-",
          transactions: [],
          loading: true,
          error: null,
        }));

        setFolioData(initialData);

        const updatedData = await Promise.all(
          initialData.map(async (folio) => {
            try {
              const response = await getTransactions({
                pan,
                folio_no: folio.folio,
              });

              const rawTransactions = Array.isArray(response)
                ? response
                : (response as any)?.data || [];

              const transactions = rawTransactions.map((txn: any) => ({
                id: txn.id || `${folio.folio}-${txn.traddate}-${txn.application_number}`,
                arn: txn.brokcode || "-",
                txnDate: txn.traddate || "-",
                appId: txn.application_number || "-",
                scheme: txn.scheme || "-",
                mutual_fund: txn.mutual_fund || "-",
                nature: txn.trxn_type_ || "-",
                type: txn.trxntype || "-",
                units: txn.units || "-",
                rate: txn.purprice || "-",
                amount: txn.amount || "-",
                aumUnder: txn.product || "-",
                creditTo: txn.bank_name || "-",
              }));

              return {
                ...folio,
                transactions,
                loading: false,
              };
            } catch (err) {
              return {
                ...folio,
                loading: false,
                error: err instanceof Error ? err.message : "Failed to fetch transactions",
              };
            }
          })
        );

        setFolioData(updatedData);
      }
    };

    fetchData();
  }, [pan, pageType, selectedFolios]);

  const toggleFolio = (folio: string) => {
    setExpandedFolio((prev) => (prev === folio ? null : folio));
  };

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((txnId) => txnId !== id) : [...prev, id]
    );
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF("landscape");

      doc.setFontSize(16);
      doc.setTextColor(245, 158, 11);
      doc.text("Transaction Report", 14, 15);

      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text(`PAN: ${pan}`, 14, 25);
      doc.text(`Total Folios: ${folioData.length}`, 14, 32);

      const tableColumn = [
        "Folio",
        "ARN",
        "Txn Date",
        "Mutual Fund",
        "Scheme",
        "Txn Nature",
        "Units",
        "Rate",
        "Amount",
        "Credit To",
      ];

      const tableRows = folioData.flatMap((folio) =>
        folio.transactions.map((txn) => [
          folio.folio || "-",
          txn.arn,
          txn.txnDate,
          txn.mutual_fund,
          txn.scheme,
          txn.nature,
          txn.units,
          txn.rate,
          txn.amount,
          txn.creditTo,
        ])
      );

      if (tableRows.length === 0) {
        alert("No transactions to export");
        return;
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
        headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);

      doc.save(`Transaction_Data_${pan}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const handleExportExcel = () => {
    try {
      const allTransactions = folioData.flatMap((data) =>
        data.transactions.map((txn) => ({
          Folio: data.folio,
          ARN: txn.arn,
          "Txn Date": txn.txnDate,
          "Mutual Fund": txn.mutual_fund,
          Scheme: txn.scheme,
          "Txn Nature": txn.nature,
          Units: txn.units,
          Rate: txn.rate,
          Amount: txn.amount,
          "Credit To": txn.creditTo,
        }))
      );

      if (allTransactions.length === 0) {
        alert("No transactions to export");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(allTransactions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction Data");
      XLSX.writeFile(workbook, `Transaction_Data_${pan}.xlsx`);
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  const handleDeleteTransactions = () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one transaction to delete");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete ${selectedTransactions.length} selected transaction(s)?`
      )
    ) {
      alert("Delete functionality to be implemented");
      setSelectedTransactions([]);
    }
  };

  if (selectedFolios.length === 0) {
    return (
      <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-400">No folios selected. Please go back and select folios to view transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-[#F59E0B] hover:text-[#FBBF24] transition-colors mb-6 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="rounded-xl shadow-lg bg-[#111111] border border-[#2A2A2A] overflow-hidden">
        {/* Header Section */}
        <div className="p-4 bg-gradient-to-r from-[#1F1A1A] to-[#111111] border-b border-[#2A2A2A]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Transaction Details
                </h3>
                <p className="text-sm text-white/60">
                  PAN: <span className="text-[#F59E0B] font-mono">{pan}</span> • Total Folios:{" "}
                  <span className="text-[#F59E0B]">{folioData.length}</span>
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

        {/* Folio Data Section */}
        {folioData.map((data, index) => (
          <div key={index} className="border-t border-[#2A2A2A]">
            {/* Folio Details Table */}
            <table className="w-full text-sm">
              <thead className="bg-[#1F1A1A]">
                <tr>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">Folio No</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">Inv Name1</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">Inv Name2</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">Bank</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">Branch</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">A/C Type</th>
                  <th className="p-3 text-left text-white font-semibold border-r border-[#2A2A2A]">A/C Number</th>
                  <th className="p-3 text-left text-white font-semibold">Holding</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#2A2A2A] hover:bg-[#1F1A1A] transition-colors">
                  <td className="p-3 text-white/90 font-mono">{data.folio}</td>
                  <td className="p-3 text-white/90">{data.investor1}</td>
                  <td className="p-3 text-white/90">{data.investor2}</td>
                  <td className="p-3 text-white/90">{data.bank}</td>
                  <td className="p-3 text-white/90">{data.branch}</td>
                  <td className="p-3 text-white/90">{data.acType}</td>
                  <td className="p-3 text-white/90 font-mono">{data.acNumber}</td>
                  <td className="p-3 text-white/90">{data.holding}</td>
                </tr>
              </tbody>
            </table>

            {/* View Transactions Button */}
            <div className="px-4 py-3 bg-[#1F1A1A] border-t border-[#2A2A2A] flex justify-between items-center">
              <button
                className="text-sm text-[#F59E0B] hover:text-[#FBBF24] transition-colors font-medium flex items-center gap-2"
                onClick={() => toggleFolio(data.folio)}
                disabled={data.loading}
              >
                <Eye className="w-4 h-4" />
                {data.loading
                  ? "Loading..."
                  : expandedFolio === data.folio
                  ? "Hide Transactions"
                  : "View Transactions"}
              </button>
              {data.error && (
                <span className="text-xs text-red-400">{data.error}</span>
              )}
            </div>

            {/* Transactions Section */}
            {expandedFolio === data.folio && (
              <div className="mt-0 overflow-x-auto p-4 bg-[#0F0F0F]">
                {data.loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
                  </div>
                ) : data.transactions.length === 0 ? (
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-400 text-center">No transactions found for this folio.</p>
                  </div>
                ) : (
                  <>
                    <table className="min-w-[1200px] text-sm border-collapse">
                      <thead className="bg-[#1F1A1A]">
                        <tr>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold">Select</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">ARN#</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Txn Date</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Mutual Fund</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Scheme</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Txn Nature</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Units</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Rate</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Amount</th>
                          <th className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-semibold whitespace-nowrap">Credit To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((txn, i) => (
                          <tr key={i} className="hover:bg-[#1F1A1A] transition-colors even:bg-[#0F0F0F]">
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedTransactions.includes(txn.id)}
                                onChange={() => toggleTransactionSelection(txn.id)}
                                className="h-4 w-4 rounded border-[#2A2A2A] bg-[#1F1A1A] text-[#F59E0B] focus:ring-[#F59E0B] focus:ring-offset-0"
                              />
                            </td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90 font-mono whitespace-nowrap">{txn.arn}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90 whitespace-nowrap">{txn.txnDate}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.mutual_fund}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.scheme}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.nature}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.units}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.rate}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.amount}</td>
                            <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white/90">{txn.creditTo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Delete Button */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleDeleteTransactions}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-lg hover:opacity-90 transition-all duration-200 text-sm font-medium shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected Transaction(s)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}