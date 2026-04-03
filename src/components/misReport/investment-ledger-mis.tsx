import { investmentGetFolioDtl, InvestmentLedgerDetail } from "@/services/clientService";
import { useSearchParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import { FaDownload, FaFilePdf, FaPrint, FaEnvelope } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ChevronLeft } from "lucide-react";
import { USER_DATA } from "@/utils/constants";
import { getLS } from "@/utils/helpers";

const InvestmentLedger: React.FC = () => {
  const [rptType, setRptType] = useState("ledger");
  const [fromDate, setFromDate] = useState("2020-06-04");
  const [toDate, setToDate] = useState("2025-09-04");
  const [portfolioDetails, setPortfolioDetails] = useState<InvestmentLedgerDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolio, setSelectedFolio] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAMC, setSelectedAMC] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("");
  const recordsPerPage = 10;

  const searchParams = useSearchParams();
  const finalpan = searchParams.get("pan");
  const finalname = searchParams.get("name");
  console.log("name"+finalname)

    const prodUserData = getLS(USER_DATA);
    const panId = prodUserData?.InvestorRegistration?.pan_no ?? 0;
    const nameId = prodUserData?.InvestorRegistration?.name ?? 0;
    //const userTypeid = prodUserData?.userTypeId ?? 0;
    console.log("panId:", panId);
    console.log("nameId:", nameId);

    let pan = "";
let name = "";

if (!panId || !nameId) {
  // if panId/nameId are missing, prefer URL values
  pan = finalpan || panId;
  name = finalname || nameId;
} else {
  // if panId/nameId exist, use them
  pan = panId;
  name = nameId;
}


  const handleSearch = async () => {
    if (!pan) {
      alert("PAN is missing in URL.");
      return;
    }
    setLoading(true);
    try {
      const data = await investmentGetFolioDtl(pan, rptType, fromDate, toDate);
      setPortfolioDetails(data);
      setCurrentPage(1);
    } catch (error) {
      alert("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatCurrency = (value: string | number) => {
    if (!value) return "0.00";
    return parseFloat(value.toString()).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  // Extract unique dropdown options
  const uniqueFolios = useMemo(() => Array.from(new Set(portfolioDetails.map(d => d.out_folio_no))), [portfolioDetails]);
  const uniqueTypes = useMemo(() => Array.from(new Set(portfolioDetails.map(d => d.out_scheme_type))), [portfolioDetails]);
  const uniqueAMCs = useMemo(() => Array.from(new Set(portfolioDetails.map(d => d.out_amc))), [portfolioDetails]);
  const uniqueSchemes = useMemo(() => Array.from(new Set(portfolioDetails.map(d => d.out_scheme))), [portfolioDetails]);

  // Apply filters
  const filteredDetails = useMemo(() => {
    return portfolioDetails.filter(item =>
      (selectedFolio ? item.out_folio_no === selectedFolio : true) &&
      (selectedType ? item.out_scheme_type === selectedType : true) &&
      (selectedAMC ? item.out_amc === selectedAMC : true) &&
      (selectedScheme ? item.out_scheme === selectedScheme : true)
    );
  }, [portfolioDetails, selectedFolio, selectedType, selectedAMC, selectedScheme]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDetails.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredDetails.length / recordsPerPage);

  // Export to Excel
  const handleExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDetails);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InvestmentLedger");
    XLSX.writeFile(workbook, "InvestmentLedger.xlsx");
  };

const handlePDF = () => {
  try {
    const doc = new jsPDF("landscape", "pt", "A4"); // landscape A4
    doc.setFontSize(12);
    doc.text("Investment Ledger Report", 40, 30);

    const headers = [[
      "Serial No",
      "Date",
      "ARN",
      "AMC",
      "Folio",
      "Investor",
      "Scheme",
      "Type",
      "Txn",
      "Units",
      "Purchase Price",
      "Amount",
      "NAV",
      "Value",
      "XIRR %"
    ]];

    const rows = filteredDetails.map((item, index) => [
      index + 1,
      formatDate(item.out_txn_date),
      item.out_brokcode,
      item.out_amc,
      item.out_folio_no,
      item.out_investor,
      item.out_scheme,
      item.out_scheme_type,
      item.out_txn_type,
      formatCurrency(item.out_units),
      formatCurrency(item.out_purprice),
      formatCurrency(item.out_amount),
      formatCurrency(item.out_current_nav),
      formatCurrency(item.out_sum_curval),
      item.out_xirr + "%"
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 50,
      theme: "grid",
      headStyles: { fillColor: [47, 128, 185], textColor: 255, halign: "center" },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 3, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 40 },   // Serial
        1: { cellWidth: 60 },   // Date
        2: { cellWidth: 50 },   // ARN
        3: { cellWidth: 60 },   // AMC
        4: { cellWidth: 60 },   // Folio
        5: { cellWidth: 80 },   // Investor
        6: { cellWidth: 100 },  // Scheme
        7: { cellWidth: 50 },   // Type
        8: { cellWidth: 50 },   // Txn
        9: { cellWidth: 60 },   // Units
        10:{ cellWidth: 70 },   // Purchase Price
        11:{ cellWidth: 70 },   // Amount
        12:{ cellWidth: 60 },   // NAV
        13:{ cellWidth: 70 },   // Value
        14:{ cellWidth: 60 },   // XIRR
      },
    });

    doc.save("InvestmentLedger.pdf");
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("Failed to export PDF. Please try again.");
  }
};


  // Print Table
  const handlePrint = () => {
    const printContent = document.getElementById("ledger-table")?.outerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow && printContent) {
      printWindow.document.write(`<html><head><title>Investment Ledger</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Email placeholder
  // const handleEmail = () => {
  //   alert("Email functionality to be integrated with backend.");
  // };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
          <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-2"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
  
        <div className="flex gap-2 mt-4 md:mt-0">
          {/* <button onClick={handleEmail} className="border px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
            <FaEnvelope /> Email
          </button> */}
          <button onClick={handleExcel} className="border px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
            <FaDownload /> Excel
          </button>
          <button onClick={handlePDF} className="border px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
            <FaFilePdf /> PDF
          </button>
          <button onClick={handlePrint} className="border px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      {/* Investor and PAN Info */}
<div className="w-full mb-4">
  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm flex flex-wrap gap-4 items-center shadow-sm">
    <span className="text-blue-700 font-semibold">▼ Investor:</span>
    <span className="font-bold text-gray-800">{name}</span>
    <span className="text-green-700 font-semibold">▼ PAN:</span>
    <span className="font-bold text-gray-800">{pan}</span>
  </div>
</div>

{/* Filters Section */}
<div className="flex flex-wrap items-end gap-4 mb-6">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Folio</label>
    <select
      value={selectedFolio}
      onChange={(e) => setSelectedFolio(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    >
      <option value="">All</option>
      {uniqueFolios.map(folio => <option key={folio} value={folio}>{folio}</option>)}
    </select>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Fund Type</label>
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    >
      <option value="">All</option>
      {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
    </select>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">AMC</label>
    <select
      value={selectedAMC}
      onChange={(e) => setSelectedAMC(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    >
      <option value="">All</option>
      {uniqueAMCs.map(amc => <option key={amc} value={amc}>{amc}</option>)}
    </select>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Scheme</label>
    <select
      value={selectedScheme}
      onChange={(e) => setSelectedScheme(e.target.value)}
      className="border rounded-lg px-3 py-2 w-44 text-sm shadow-sm focus:ring focus:ring-blue-200"
    >
      <option value="">All</option>
      {uniqueSchemes.map(scheme => <option key={scheme} value={scheme}>{scheme}</option>)}
    </select>
  </div>

  {/* Submit Button */}
  <div className="flex items-end">
    <button
      onClick={handleSearch}
      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-md text-sm transition-all"
    >
      {loading ? "Loading..." : "Submit"}
    </button>
  </div>
</div>


      {/* Table */}
<div className="overflow-x-auto" id="ledger-table">
  <table className="w-full border border-gray-300 rounded-lg text-xs">
    <thead>
      <tr className="bg-gray-100 text-gray-700">
        <th className="px-3 py-2 border">Serial Number</th>
        <th className="px-3 py-2 border">Date</th>
        <th className="px-3 py-2 border">ARN</th>
        <th className="px-3 py-2 border">AMC</th>
        <th className="px-3 py-2 border">Folio</th>
        <th className="px-3 py-2 border">Investor</th>
        <th className="px-3 py-2 border">Scheme</th>
        <th className="px-3 py-2 border">Type</th>
        <th className="px-3 py-2 border">Txn</th>
        <th className="px-3 py-2 border text-right">Units</th>
        <th className="px-3 py-2 border text-right">Purchase Price</th>
        <th className="px-3 py-2 border text-right">Amount</th>
        <th className="px-3 py-2 border text-right">NAV</th>
        <th className="px-3 py-2 border text-right">Value</th>
        <th className="px-3 py-2 border text-right">XIRR %</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      {currentRecords.length > 0 && currentRecords.map((item, index) => (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-3 py-2 border text-center">
            {(currentPage - 1) * recordsPerPage + index + 1}
          </td>
          <td className="px-3 py-2 border">{formatDate(item.out_txn_date)}</td>
          <td className="px-3 py-2 border">{item.out_brokcode}</td>
          <td className="px-3 py-2 border">{item.out_amc}</td>
          <td className="px-3 py-2 border">{item.out_folio_no}</td>
          <td className="px-3 py-2 border">{item.out_investor}</td>
          <td className="px-3 py-2 border">{item.out_scheme}</td>
          <td className="px-3 py-2 border">{item.out_scheme_type}</td>
          <td className="px-3 py-2 border">{item.out_txn_type}</td>
          <td className="px-3 py-2 border text-right">{formatCurrency(item.out_units)}</td>
          <td className="px-3 py-2 border text-right">{formatCurrency(item.out_purprice)}</td>
          <td className="px-3 py-2 border text-right">{formatCurrency(item.out_amount)}</td>
          <td className="px-3 py-2 border text-right">{formatCurrency(item.out_current_nav)}</td>
          <td className="px-3 py-2 border text-right">{formatCurrency(item.out_sum_curval)}</td>
          <td className="px-3 py-2 border text-right">{item.out_xirr}%</td>
        </tr>
      ))}

      {currentRecords.length === 0 && (
        <tr>
          <td colSpan={15} className="text-center py-4 border">No records found.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {/* Pagination */}
    {filteredDetails.length > recordsPerPage && (
  <div className="flex justify-end mt-4 gap-2">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(prev => prev - 1)}
      className="px-3 py-1 border rounded-lg disabled:opacity-50"
    >
      Prev
    </button>
    <span className="px-3 py-1">
      Page {currentPage} of {totalPages}
    </span>
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(prev => prev + 1)}
      className="px-3 py-1 border rounded-lg disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}

    </div>
  );
};

export default InvestmentLedger;
