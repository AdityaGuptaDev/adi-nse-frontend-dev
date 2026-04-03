"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePageTitle } from "@/context/pageTitleContext";
import { getAumRecordDtl } from "@/services/clientService";
import {
  Mail,
  FileText,
  File,
  Printer,
  Calendar,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface AumRecordDtlResponse {
  out_folio_no: string;
  out_arn: string;
  out_amc: string;
  out_mutual_fund: string;
  out_scheme: string;
  out_current_val: string;
  out_units: string;
  out_purprice: string;
  out_sum_amount: string;
}

export default function AUMReport() {
  const { setTitle } = usePageTitle();
  const [aumData, setAumData] = useState<AumRecordDtlResponse[]>([]);
  const [filteredData, setFilteredData] = useState<AumRecordDtlResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [emailModalOpen, setEmailModalOpen] = useState(false);
 
  const [activeChart, setActiveChart] = useState<"bar" | "doughnut">("bar");

  const searchParams = useSearchParams();
  const pan = searchParams.get("pan");
  const name = searchParams.get("name");

  useEffect(() => {
    setTitle("AUM Report");
    fetchAumData();
  }, [pan, selectedDate]);

  const fetchAumData = async () => {
    try {
      setLoading(true);
      if (!pan) throw new Error("PAN number is required");

      const response = await getAumRecordDtl({
        pan: pan,
        date: selectedDate,
      });

      if (!Array.isArray(response)) throw new Error("Invalid data format");

      const filtered = response.filter(
        (item: any) =>
          item.out_record_typ === "P" &&
          parseFloat(item.out_units || "0") !== 0 &&
          parseFloat(item.out_purprice || "0") !== 0
      );

      setAumData(filtered);
      setFilteredData(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setAumData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalAum = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.out_current_val) || 0),
    0
  );

  const handleDateFilter = () => fetchAumData();

  // ---- Chart Data (Scheme-wise) ----
  const schemeNames = filteredData.map((item) => item.out_scheme);
  const schemeAmounts = filteredData.map(
    (item) => parseFloat(item.out_current_val) || 0
  );

  // Generate colors for charts
  const generateColors = (count: number) => {
    const colors = [
      "rgba(54, 162, 235, 0.8)", // Blue
      "rgba(255, 99, 132, 0.8)", // Pink
      "rgba(75, 192, 192, 0.8)", // Teal
      "rgba(255, 159, 64, 0.8)", // Orange
      "rgba(153, 102, 255, 0.8)", // Purple
      "rgba(255, 205, 86, 0.8)", // Yellow
      "rgba(201, 203, 207, 0.8)", // Gray
      "rgba(0, 128, 128, 0.8)", // Teal
      "rgba(220, 20, 60, 0.8)", // Crimson
      "rgba(46, 139, 87, 0.8)", // Sea Green
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };
  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          padding: 15,
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Scheme-wise AUM (Bar Chart)",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw as number;
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { font: { size: 11 } } },
      y: { ticks: { font: { size: 11 } } },
    },
  };

  const doughnutChartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          padding: 15,
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Scheme-wise AUM (Doughnut Chart)",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw as number;
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  // Chart Data Definitions
  const barChartData = {
    labels: schemeNames,
    datasets: [
      {
        label: "AUM (₹)",
        data: schemeAmounts,
        backgroundColor: generateColors(schemeNames.length),
      },
    ],
  };

  const doughnutChartData = {
    labels: schemeNames,
    datasets: [
      {
        label: "AUM (₹)",
        data: schemeAmounts,
        backgroundColor: generateColors(schemeNames.length),
        borderWidth: 1,
      },
    ],
  };



  const exportToExcel = () => {
    if (filteredData.length === 0) return alert("No data to export");
    const excelData = filteredData.map((item) => ({
      "Folio Number": item.out_folio_no,
      AMC: getAMCName(item.out_amc),
      "Mutual Fund": item.out_mutual_fund,
      "Scheme Name": item.out_scheme,
      Units: parseFloat(item.out_units || "0").toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      "AUM (Rs.)": parseFloat(item.out_current_val || "0").toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ),
    }));

    excelData.push({
      "Folio Number": "",
      AMC: "Grand Total",
      "Mutual Fund": "",
      "Scheme Name": "",
      Units: "",
      "AUM (Rs.)": totalAum.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AUM Report");
    XLSX.writeFile(
      workbook,
      `AUM_Report_${name || "Report"}_${selectedDate}.xlsx`
    );
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return alert("No data to export");

    const doc = new jsPDF("landscape");

    // Title Header
    doc.setFontSize(16);
    doc.setTextColor(243, 132, 45);
    doc.text("Vedant", 14, 15);
    doc.setTextColor(0, 0, 0);
    doc.text("Asset", 40, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("3rd Floor, Gayways House Above Space Furniture, Ranchi", 14, 22);
    doc.text("Phone: 9304955509 | vedantasset@gmail.com", 14, 28);

    // Investor Details
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Investor: ${name || "-"}`, 14, 38);
    doc.text(`PAN: ${pan || "-"}`, 14, 44);
    doc.text(`Date: ${selectedDate}`, 14, 50);

    // Table Data
    const tableData = filteredData.map((item) => [
      item.out_folio_no,
      item.out_arn,
      item.out_mutual_fund,
      item.out_scheme,
      parseFloat(item.out_units || "0").toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      item.out_purprice || "-",
      item.out_sum_amount || "-",
      parseFloat(item.out_current_val || "0").toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ]);

    tableData.push([
      "",
      "",
      "",
      "Grand Total",
      "",
      "",
      "",
      totalAum.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ]);

    autoTable(doc, {
      head: [
        [
          "Folio Number",
          "ARN",
          "Mutual Fund",
          "Scheme Name",
          "Units",
          "Per Price",
          "Purchase Price",
          "AUM (Rs.)",
        ],
      ],
      body: tableData,
      startY: 58,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "right",
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save(`AUM_Report_${name || "Report"}_${selectedDate}.pdf`);
  };

  const handlePrint = () => window.print();

  if (loading)
    return (
      <div className="p-6 text-center">
        <div className="animate-spin border-4 border-gray-300 border-t-blue-600 w-10 h-10 rounded-full mx-auto"></div>
        <p className="mt-3 text-gray-700">Loading AUM data...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>Error: {error}</p>
        <button
          onClick={fetchAumData}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white font-sans">
      {/* Header */}

      <button
        onClick={() => window.history.back()}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">
          <span className="text-orange-500">Vedant</span>
          <span className="text-black">Asset</span>
        </h1>
        <div className="text-right text-xs text-gray-600">
          <p>3rd Floor, Gayways House Above Space Furniture, Ranchi</p>
          <p>Phone: 9304955509 | vedantasset@gmail.com</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="text-green-600">▼</span> Investor:{" "}
          <span className="font-semibold">{name}</span>
          <br />
          <span className="text-green-600">▼</span> PAN:{" "}
          <span className="font-semibold">{pan}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleDateFilter}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mb-3">
        {/* <button
          onClick={() => setEmailModalOpen(true)}
          className="border px-3 py-1 rounded text-sm"
        >
          <Mail className="w-4 h-4 inline-block mr-1" /> Email
        </button> */}
        <button
          onClick={exportToExcel}
          className="border px-3 py-1 rounded text-sm"
        >
          <FileText className="w-4 h-4 inline-block mr-1" /> Excel
        </button>
        <button
          onClick={exportToPDF}
          className="border px-3 py-1 rounded text-sm"
        >
          <File className="w-4 h-4 inline-block mr-1" /> PDF
        </button>
        <button
          onClick={handlePrint}
          className="border px-3 py-1 rounded text-sm"
        >
          <Printer className="w-4 h-4 inline-block mr-1" /> Print
        </button>
      </div>



      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border px-2 py-1 text-left">Folio Number</th>
              <th className="border px-2 py-1 text-left">ARN</th>
              <th className="border px-2 py-1 text-left">Mutual Fund</th>
              <th className="border px-2 py-1 text-left">Scheme Name</th>
              <th className="border px-2 py-1 text-right">Units</th>
              <th className="border px-2 py-1 text-right">Per Price</th>
              <th className="border px-2 py-1 text-right">Purchase Price</th>
              <th className="border px-2 py-1 text-right">AUM (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{item.out_folio_no}</td>
                <td className="border px-2 py-1">{item.out_arn}</td>
                <td className="border px-2 py-1">{item.out_mutual_fund}</td>
                <td className="border px-2 py-1">{item.out_scheme}</td>
                <td className="border px-2 py-1 text-right">
                  {parseFloat(item.out_units || "0").toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border px-2 py-1">{item.out_purprice}</td>
                <td className="border px-2 py-1">{item.out_sum_amount}</td>
                <td className="border px-2 py-1 text-right">
                  {parseFloat(item.out_current_val || "0").toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-semibold">
              <td colSpan={7} className="border px-2 py-1 text-right">
                Grand Total
              </td>
              <td className="border px-2 py-1 text-right">
                {totalAum.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>


      {/* Chart Section */}
      {schemeNames.length > 0 && (
        <div className="mb-6 border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">AUM Visualization</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart("bar")}
                className={`px-3 py-1 rounded text-sm ${activeChart === "bar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-1" /> Bar Chart
              </button>
              <button
                onClick={() => setActiveChart("doughnut")}
                className={`px-3 py-1 rounded text-sm ${activeChart === "doughnut"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-1" /> Doughnut
                Chart
              </button>
            </div>
          </div>

          <div className="h-80">
            {activeChart === "bar" ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            )}
          </div>


        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 border-t pt-3 text-xs text-gray-700">
        <strong>Disclaimer:</strong> Mutual Fund investments are subject to
        market risks, read all scheme related documents carefully...
      </div>
    </div>
  );
}

function getAMCName(amcCode: string): string {
  const amcMap: Record<string, string> = {
    ABSL: "Aditya Birla Sun Life Mutual Fund",
    MIRAE: "Mirae Mutual Fund",
    EDELWEISS: "Edelweiss Mutual Fund",
    TATA: "TATA Mutual Fund",
    AXIS: "AXIS Mutual Fund",
    HDFC: "HDFC Mutual Fund",
    SBI: "SBI Mutual Fund",
  };
  return amcMap[amcCode] || `${amcCode} Mutual Fund`;
}
