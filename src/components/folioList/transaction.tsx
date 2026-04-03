"use client";

import React, { useState, useEffect } from "react";
import { getTransactions } from "@/services/transactionService";
import { ChevronLeft } from "lucide-react";
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
                mutual_fund:txn.mutual_fund || "-",
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
                error:
                  err instanceof Error
                    ? err.message
                    : "Failed to fetch transactions",
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
      prev.includes(id)
        ? prev.filter((txnId) => txnId !== id)
        : [...prev, id]
    );
  };


  const handleExportPDF = () => {
  try {
    const doc = new jsPDF("landscape");

    // Title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 90);
    doc.text("Transaction Report", 14, 15);

    // PAN Info
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`PAN: ${pan}`, 14, 25);
    doc.text(`Total Folios: ${folioData.length}`, 14, 32);

    // Gather all transactions across folios
    const tableColumn = [
      "Folio",
      "ARN",
      "Txn Date",
      // "App ID",
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
        txn.appId,
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

    // ✅ Correct usage of autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [47, 128, 185], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Footer
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
      const allTransactions = folioData.flatMap(data => 
        data.transactions.map(txn => ({
          "Folio": data.folio,
          "ARN": txn.arn,
          "Txn Date": txn.txnDate,
          // "App ID": txn.appId,
          "Mutual Fund": txn.mutual_fund,
          "Scheme": txn.scheme,
          "Txn Nature": txn.nature,
      
          "Units": txn.units,
          "Rate": txn.rate,
          "Amount": txn.amount,
          
          "Credit To": txn.creditTo
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



  // const handleEmail = () => {
  //   const subject = `Transaction Data for PAN: ${pan}`;
  //   const body = `Please find the transaction data for PAN ${pan} attached.`;
  //   window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // };

  // const handleWhatsApp = () => {
  //   const transactionCount = folioData.reduce((count, data) => count + data.transactions.length, 0);
  //   const message = `Transaction details for PAN: ${pan}\n\n` +
  //     `Total Transactions: ${transactionCount}\n` +
  //     `Folios: ${folioData.map(data => data.folio).join(", ")}`;
  //   window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  // };

  const handleDeleteTransactions = () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one transaction to delete");
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedTransactions.length} selected transaction(s)?`)) {
      alert("Delete functionality to be implemented");
      setSelectedTransactions([]);
    }
  };

  if (selectedFolios.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
        <p>No folios selected. Please go back and select folios to view transactions.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back 
      </button>
      
      <div className="mt-6 border rounded-lg shadow-md bg-white overflow-x-auto">
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-medium text-gray-700">
            Showing transactions for PAN: <span className="text-blue-700">{pan}</span>
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
        
        {folioData.map((data, index) => (
          <div key={index} className="border-t">
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Folio No</th>
                  <th>Inv Name1</th>
                  <th>Inv Name2</th>
                  <th>Bank</th>
                  <th>Branch</th>
                  <th>A/C Type</th>
                  <th>A/C Number</th>
                  <th>Holding</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">{data.folio}</td>
                  <td>{data.investor1}</td>
                  <td>{data.investor2}</td>
                  <td>{data.bank}</td>
                  <td>{data.branch}</td>
                  <td>{data.acType}</td>
                  <td>{data.acNumber}</td>
                  <td>{data.holding}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="px-4 py-2 bg-gray-100 font-medium flex justify-between items-center">
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => toggleFolio(data.folio)}
                disabled={data.loading}
              >
                {data.loading
                  ? "Loading..."
                  : expandedFolio === data.folio
                  ? "Hide Transactions"
                  : "View Transactions"}
              </button>
            </div>

            {expandedFolio === data.folio && (
              <div className="mt-2 overflow-x-auto p-2">
                {data.loading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : data.transactions.length === 0 ? (
                  <div className="p-4 bg-yellow-100 text-yellow-700">
                    No transactions found for this folio.
                  </div>
                ) : (
                  <>
                    <table className="min-w-[1200px] text-sm border-collapse border border-gray-300">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="border px-2 py-1">Select</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">ARN#</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Txn Date</th>
                          {/* <th className="border px-2 py-2 text-center whitespace-nowrap">AppId</th> */}
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Mutual Fund</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Scheme</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Txn Nature</th>
                    
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Units</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Rate</th>
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Amount</th>
                          {/* <th className="border px-2 py-2 text-center whitespace-nowrap">AUM Under</th> */}
                          <th className="border px-2 py-2 text-center whitespace-nowrap">Credit To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((txn, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border px-2 py-1 text-center">
                              <input 
                                type="checkbox" 
                                checked={selectedTransactions.includes(txn.id)}
                                onChange={() => toggleTransactionSelection(txn.id)}
                                className="h-4 w-4"
                              />
                            </td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.arn}</td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.txnDate}</td>
                            {/* <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.appId}</td> */}
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.mutual_fund}</td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.scheme}</td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.nature}</td>
                       
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.units}</td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.rate}</td>
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.amount}</td>
                            {/* <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.aumUnder}</td> */}
                            <td className="border px-2 py-2 text-center whitespace-nowrap">{txn.creditTo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={handleDeleteTransactions}
                        className="px-3 py-1 bg-[#2f80b9] text-white rounded hover:bg-red-700 text-sm"
                      >
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