'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MdArrowDropDown, MdArrowDropUp, MdOutlineRemove } from "react-icons/md";
import { FiPlus, FiMinus } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSearchParams } from 'next/navigation';
import { fetchFolioAndSchemesByPan, fetchFoliosByPanAndScheme, fetchPortfolioSearchDetails, fetchPortfolioValuationData, PortfolioValuationItem } from "@/services/reportService";

interface ReportConfig {
  viewType: string;
  reportType: string;
  product: string;
  groupBy: string;
  investor: string;
  source: string;
  reportDate: string;
  holdingPeriod: string;
  transactionType: string;
  columns: string[];
  advancedFilters: {
    category: string;
    subCategory: string;
    fund: string;
    folio: string;
  };
}

interface SchemeData {
  transactionId: string;
  soa: string;
  schemeName: string;
  balanceUnits: number;
  purchaseNav: number;
  currentNav: number;
  purchaseValue: number;
  currentValue: number;
  gain: number;
  holdingDays: number;
  absReturn: number;
  cagr: number;
  transactions: {
    date: string;
    type: string;
    units: number;
    nav: number;
    purchaseValue: number;
    currentValue: number;
    gain: number;
    days: number;
    absReturn: number;
    cagr: number;
  }[];
}

interface InvestorData {
  pan: string;
  investorName: string;
  folioNumber: string;
  category: string;
  schemes: SchemeData[];
}

interface SOAData {
  name: string;
  folio: string;
  scheme: string;
  nominee: string;
  bank: string;
  marketValueDate: string;
  marketValuePerUnit: number;
  totalMarketValue: number;
  unitBalance: number;
  transactions: {
    date: string;
    type: string;
    arnNo: string;
    amount: number;
    navRate: number;
    units: number;
    balanceUnits: number;
  }[];
}

interface InvestorOption {
  name: string;
  pan: string;
}

const ReportConfiguration = () => {
  const searchParams = useSearchParams();
  const panFromUrl = searchParams.get('pan');
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showConfigForm, setShowConfigForm] = useState(true);
  const [showDataTable, setShowDataTable] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSOAModal, setShowSOAModal] = useState(false);
  const [selectedSOA, setSelectedSOA] = useState<SOAData | null>(null);
  const [showBuildReport, setShowBuildReport] = useState(false);
  const [apiData, setApiData] = useState<PortfolioValuationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [investorOptions, setInvestorOptions] = useState<InvestorOption[]>([]);
  const [schemeOptions, setSchemeOptions] = useState<string[]>([]);
  const [reportData, setReportData] = useState<InvestorData[]>([]);
  const [filteredReportData, setFilteredReportData] = useState<InvestorData[]>([]);
  const [folioOptions, setFolioOptions] = useState<string[]>([]);
  const [fundOptions, setFundOptions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<PortfolioValuationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [isLoadingFolios, setIsLoadingFolios] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorOption | null>(null);

  const [config, setConfig] = useState<ReportConfig>({
    viewType: "On Screen",
    reportType: "",
    product: "Mutual Fund",
    groupBy: "Scrip",
    investor: panFromUrl || "",
    source: "",
    reportDate: new Date().toLocaleDateString('en-IN').split('/').join('-'),
    holdingPeriod: "All",
    transactionType: "All Selected",
    columns: ["Balance Units", "Purchase NAV", "Current NAV", "Quantity", "Dividend", "Gain", "Holding Days", "Absolute Return", "CAGR"],
    advancedFilters: {
      category: "",
      subCategory: "",
      fund: "",
      folio: ""
    }
  });

  // Set the selected investor when panFromUrl changes
   useEffect(() => {
    const initializeInvestorData = async () => {
      if (panFromUrl && apiData.length > 0) {
        const investor = apiData.find(item => item.pan === panFromUrl);
        if (investor) {
          setSelectedInvestor({
            name: investor.inv_name,
            pan: investor.pan
          });
          setConfig(prev => ({
            ...prev,
            investor: panFromUrl
          }));
          
          // Load folios and schemes for this investor
          const result = await fetchFolioAndSchemesByPan(panFromUrl);
          const folios = [...new Set(result.map(item => item.folio_no))];
          const schemes = [...new Set(result.map(item => item.scheme))];
          setFolioOptions(folios);
          setFundOptions(schemes);
        }
      }
    };

    initializeInvestorData();
  }, [panFromUrl, apiData]);

  // Load investor data and set options
 useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchPortfolioValuationData();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: expected an array.");
      }

      setApiData(data);

      // ✅ Get unique investors (type-safe)
      const uniqueInvestors: InvestorOption[] = Array.from(
        new Set(data.map(item => `${item.inv_name}|${item.pan}`))
      ).map((investorString: string) => {
        const [name, pan] = investorString.split("|");
        return { name, pan } as InvestorOption;
      });

      // ✅ Filter by PAN if provided
      const filteredInvestors: InvestorOption[] = panFromUrl
        ? uniqueInvestors.filter(inv => inv.pan === panFromUrl)
        : uniqueInvestors;

      setInvestorOptions(filteredInvestors);

      // ✅ Transform API data into report format
      const transformedData = transformApiDataToReportFormat(data);
      setReportData(transformedData);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
      toast.error("Failed to load portfolio data");
    }
  };

  loadData();
}, [panFromUrl]);



  const calculateInvestorTotals = (investor: InvestorData) => {
    const totals = {
      purchaseValue: 0,
      currentValue: 0,
      gain: 0,
      holdingDays: 0,
      absReturn: 0,
      cagr: 0,
      schemeCount: 0
    };

    investor.schemes.forEach(scheme => {
      totals.purchaseValue += scheme.purchaseValue;
      totals.currentValue += scheme.currentValue;
      totals.gain += scheme.gain;
      totals.holdingDays += scheme.holdingDays;
      totals.absReturn += scheme.absReturn;
      totals.cagr += scheme.cagr;
      totals.schemeCount++;
    });

    return totals;
  };

  // Calculate category totals for an investor
  const calculateCategoryTotals = (investor: InvestorData, category: string) => {
    const categorySchemes = investor.schemes.filter(scheme =>
      investor.category === category
    );

    const totals = {
      purchaseValue: 0,
      currentValue: 0,
      gain: 0,
      holdingDays: 0,
      absReturn: 0,
      cagr: 0,
      schemeCount: 0
    };

    categorySchemes.forEach(scheme => {
      totals.purchaseValue += scheme.purchaseValue;
      totals.currentValue += scheme.currentValue;
      totals.gain += scheme.gain;
      totals.holdingDays += scheme.holdingDays;
      totals.absReturn += scheme.absReturn;
      totals.cagr += scheme.cagr;
      totals.schemeCount++;
    });

    return totals;
  };

   const handleInvestorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPan = e.target.value;
    setSelectedScheme("");
    
    setConfig(prev => ({
      ...prev,
      investor: selectedPan,
      advancedFilters: {
        ...prev.advancedFilters,
        folio: "",
        fund: "",
      }
    }));

    if (selectedPan) {
      const result = await fetchFolioAndSchemesByPan(selectedPan);
      const folios = [...new Set(result.map(item => item.folio_no))];
      const schemes = [...new Set(result.map(item => item.scheme))];
      setFolioOptions(folios);
      setFundOptions(schemes);
    } else {
      setFolioOptions([]);
      setFundOptions([]);
    }
  };


  const handleSchemeChange = async (scheme: string) => {
    setSelectedScheme(scheme);
    setConfig(prev => ({
      ...prev,
      advancedFilters: {
        ...prev.advancedFilters,
        fund: scheme,
        folio: ""
      }
    }));

    if (config.investor && scheme) {
      setIsLoadingFolios(true);
      try {
        const folios = await fetchFoliosByPanAndScheme(config.investor, scheme);
        setFolioOptions(folios);
      } catch (error) {
        console.error("Failed to load folios:", error);
        toast.error("Failed to load folios");
        setFolioOptions([]);
      } finally {
        setIsLoadingFolios(false);
      }
    } else {
      setFolioOptions([]);
    }
  };
  const handleApply = async () => {
    const { investor, advancedFilters } = config;

    if (!investor) {
      alert("Please select Investor");
      return;
    }

    setIsLoading(true);

    try {
      const results = await fetchPortfolioSearchDetails(
        investor,
        advancedFilters.folio || undefined,
        advancedFilters.fund || undefined
      );

      setSearchResults(results);
      setShowConfigForm(false);
      setShowDataTable(true);
      setShowBuildReport(false);

      toast.success("Report configuration applied");
    } catch (error) {
      console.error("Error applying report config:", error);
      toast.error("Failed to apply report configuration.");
    } finally {
      setIsLoading(false);
    }
  };
  const [selectedProducts, setSelectedProducts] = useState({
    "Mutual Fund": true,
    "Share & Bond": false,
    "Fixed Deposit": false,
    "Other Assets": false
  });

  const [dataOptions, setDataOptions] = useState({
    "Merge SIP, STP, Div Reinvest": false,
    "Investment snapshot since inception": false,
    "SIP Summary": false,
    "Insurance List": false,
    "Folio Comment": false,
    "Category": false,
    "Investor Summary": false,
    "Goal Details": false,
    "Folio Details": false
  });

  const [mfAllocations, setMfAllocations] = useState({
    "Fund": false,
    "Scheme": false,
    "Sub Category": false,
    "Investor": false,
    "Holding": false,
    "Sector": false,
    "Equity Market Cap": false
  });

  const groupByOptions = [
    "Investor",
    "Folio",
    "Scheme",
    "Category",
    "Sub Category",
    "Transaction Type"
  ];

  // filters whenever config or reportData changes
  useEffect(() => {
    if (reportData.length === 0) return;
    let filteredData = [...reportData];
    if (config.investor) {
      filteredData = filteredData.filter(
        investor => investor.pan === config.investor
      );
    }


    //  filters only if investor is selected or no investor is selected
    if (!config.investor || filteredData.length > 0) {

      if (config.advancedFilters.fund) {
        filteredData = filteredData.map(investor => ({
          ...investor,
          schemes: investor.schemes.filter(
            scheme => scheme.schemeName === config.advancedFilters.fund
          )
        })).filter(investor => investor.schemes.length > 0);
      }

      if (config.advancedFilters.folio) {
        filteredData = filteredData.filter(
          investor => investor.folioNumber === config.advancedFilters.folio
        );

      }

      if (config.advancedFilters.category) {
        filteredData = filteredData.filter(
          investor => investor.category === config.advancedFilters.category
        );
      }
    }

    setFilteredReportData(filteredData);
  }, [config, reportData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPortfolioValuationData();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected an array.");
        }

        setApiData(data);

        const investorOptions = data.map(item => ({
          name: item.inv_name,
          pan: item.pan,
          folio: item.folio_no,
          scheme: item.scheme
        }));


        const uniqueSchemes: string[] = Array.from(
          new Set(data.map(item => item.scheme as string))
        );

        const uniqueFolios: string[] = Array.from(
          new Set(data.map(item => `${item.folio_no}` as string))
        );

        setInvestorOptions(investorOptions);
        setSchemeOptions(uniqueSchemes);
        setFolioOptions(uniqueFolios);

        const transformedData = transformApiDataToReportFormat(data);
        const uniqueInvestors = Array.from(new Set(
          data.map(item => `${item.inv_name}|${item.pan}`)
        )).map(investor => {
          const [name, pan] = investor.split('|');
          return { name, pan };
        });

        setInvestorOptions(uniqueInvestors);
        setReportData(transformedData);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
        toast.error('Failed to load portfolio data');
      }
    };

    loadData();
  }, []);



  const transformApiDataToReportFormat = (apiData: PortfolioValuationItem[]): InvestorData[] => {
    if (!apiData || apiData.length === 0) return [];

    const groupedData: Record<string, InvestorData> = {};

    apiData.forEach(item => {
      if (!item) return;

      const key = `${item.inv_name}|${item.folio_no}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          investorName: item.inv_name || 'Unknown Investor',
          pan: item.pan,
          folioNumber: item.folio_no || 'N/A',
          category: item.scheme_typ?.includes("Equity") ? "Equity" :
            item.scheme_typ?.includes("Debt") ? "Debt" : "Other",
          schemes: []
        };
      }

      // scheme if not already present
      const schemeExists = groupedData[key].schemes.some(
        s => s.schemeName === item.scheme
      );

      if (!schemeExists) {
        const purchaseNav = parseFloat(item.purprice) || 0;
        const units = parseFloat(item.units) || 0;
        const purchaseValue = parseFloat(item.amount) || 0;
        const currentNav = purchaseNav * 1.10;
        const currentValue = units * currentNav;
        const gain = currentValue - purchaseValue;
        const holdingDays = Math.floor(
          (new Date().getTime() - new Date(item.traddate).getTime()) /
          (1000 * 60 * 60 * 24)
        );
        const absReturn = (gain / purchaseValue) * 100;
        const cagr = Math.pow((currentValue / purchaseValue), (365 / holdingDays)) - 1;

        groupedData[key].schemes.push({
          transactionId: item.folio_no,
          soa: "SOA",
          schemeName: item.scheme,
          balanceUnits: units,
          purchaseNav: purchaseNav,
          currentNav: currentNav,
          purchaseValue: purchaseValue,
          currentValue: currentValue,
          gain: gain,
          holdingDays: holdingDays,
          absReturn: absReturn,
          cagr: cagr * 100,
          transactions: [{
            date: new Date(item.traddate).toLocaleDateString('en-IN'),
            type: item.trxn_type_,
            units: units,
            nav: purchaseNav,
            purchaseValue: purchaseValue,
            currentValue: currentValue,
            gain: gain,
            days: holdingDays,
            absReturn: absReturn,
            cagr: cagr * 100
          }]
        });
      }
    });

    return Object.values(groupedData);
  };

  const filterOptions = {
    categories: ["Equity", "Debt", "Hybrid", "Solution Oriented", "Other"],
    subCategories: {
      Equity: ["Large Cap", "Mid Cap", "Small Cap", "Multi Cap", "Sectoral/Thematic"],
      Debt: ["Corporate Bond", "Credit Risk", "Banking and PSU", "Gilt", "Liquid"],
      Hybrid: ["Aggressive Hybrid", "Conservative Hybrid", "Dynamic Asset Allocation"],
      "Solution Oriented": ["Childrens Fund", "Retirement Fund"],
      Other: ["Index Funds", "ETF", "Fund of Funds"]
    },
    funds: schemeOptions,
    folios: folioOptions
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleProductChange = (product: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [product]: !prev[product as keyof typeof prev]
    }));
  };

  const handleDataOptionChange = (option: string) => {
    setDataOptions(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev]
    }));
  };

  const handleMfAllocationChange = (option: string) => {
    setMfAllocations(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev]
    }));
  };

  const handleAddToCart = (scheme: any) => {
    toast.success(`${scheme.schemeName} added to cart`);
  };

  const handleSOAClick = (scheme: SchemeData) => {
    const investorData = reportData.find(inv =>
      inv.schemes.some(s => s.schemeName === scheme.schemeName)
    );

    if (investorData) {
      const apiItem = apiData.find(item =>
        item.scheme === scheme.schemeName &&
        item.inv_name === investorData.investorName
      );

      if (apiItem) {
        setSelectedSOA({
          name: apiItem.inv_name,
          folio: apiItem.folio_no,
          scheme: apiItem.scheme,
          nominee: "Not Available",
          bank: `${apiItem.bank_name} - ${apiItem.ac_no}`,
          marketValueDate: new Date().toLocaleDateString('en-IN'),
          marketValuePerUnit: scheme.currentNav,
          totalMarketValue: scheme.currentValue,
          unitBalance: scheme.balanceUnits,
          transactions: [{
            date: new Date(apiItem.traddate).toLocaleDateString('en-IN'),
            type: apiItem.trxn_type_,
            arnNo: apiItem.brokcode,
            amount: parseFloat(apiItem.amount) || 0,
            navRate: parseFloat(apiItem.purprice) || 0,
            units: parseFloat(apiItem.units) || 0,
            balanceUnits: parseFloat(apiItem.units) || 0
          }]
        });
        setShowSOAModal(true);
      }
    }
  };

  const handleHeaderPlusClick = () => {
    setShowConfigForm(true);
    setShowDataTable(false);
    setShowBuildReport(false);
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "product") {
      setShowAdvancedFilters(false);
    }
    if (name === "investor") {
      setConfig(prev => ({
        ...prev,
        [name]: value,
        advancedFilters: {
          ...prev.advancedFilters,
          fund: "",
          folio: ""
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({
      ...prev,
      groupBy: e.target.value
    }));
  };

  const handleAdvancedFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      advancedFilters: {
        ...prev.advancedFilters,
        [name]: value
      }
    }));
  };

  const handleColumnToggle = (column: string) => {
    setConfig(prev => {
      const newColumns = [...prev.columns];
      const index = newColumns.indexOf(column);
      if (index > -1) {
        newColumns.splice(index, 1);
      } else {
        newColumns.push(column);
      }
      return {
        ...prev,
        columns: newColumns
      };
    });
  };
  const handleSendOnWhatsApp = () => {
    toast.success("Report will be sent on WhatsApp");
  };

  const handleMinimize = () => {
    setShowConfigForm(false);
    setShowDataTable(false);
    setShowBuildReport(true);
  };

  const toggleView = () => {
    if (showConfigForm) {
      setShowConfigForm(false);
      setShowDataTable(false);
      setShowBuildReport(true);
    } else {
      setShowConfigForm(true);
      setShowDataTable(false);
      setShowBuildReport(false);
    }
  };

  const toggleAdvancedFilters = () => {
    if (config.product !== "Share & Bond") {
      setShowAdvancedFilters(!showAdvancedFilters);
    }
  };

  const handleApplyAdvancedFilters = () => {
    setShowAdvancedFilters(false);
    toast.success("Advanced filters applied");
  };

  const handleResetAdvancedFilters = () => {
    setConfig(prev => ({
      ...prev,
      advancedFilters: {
        category: "",
        subCategory: "",
        fund: "",
        folio: ""
      }
    }));
  };

  const SOAModal = () => {
    if (!showSOAModal || !selectedSOA) return null;

    const [config, setConfig] = useState({
      viewPeriod: "Since Inception",
      scheme: "Axis Small Cap",
    });

    const handleConfigChange = (e: { target: { name: any; value: any; }; }) => {
      const { name, value } = e.target;
      setConfig((prev) => ({ ...prev, [name]: value }));
    };

    const handleDownload = () => {
      const blob = new Blob(["Sample SOA Content"], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "StatementOfAccount.txt";
      link.click();
      window.URL.revokeObjectURL(url);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-gray-800">Statement of Account</h2>
            <button
              onClick={() => setShowSOAModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>

          <div className="p-6 overflow-auto flex-grow space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <label className="text-gray-600">View Period:</label>
                <select
                  name="viewPeriod"
                  value={config.viewPeriod}
                  onChange={handleConfigChange}
                  className="border text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option>Since Inception</option>
                  <option>Current FY</option>
                  <option>Previous FY</option>
                  <option>Custom</option>
                </select>
                <button className="text-orange-600 hover:underline text-xs">
                  Request SOA
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-gray-600">Transaction Slip Scheme:</label>
                <select
                  name="scheme"
                  value={config.scheme}
                  onChange={handleConfigChange}
                  className="border text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option>Axis Small Cap</option>
                  <option>SBI Bluechip</option>
                  <option>HDFC Midcap</option>
                  <option>ICICI Value Discovery</option>
                </select>
                <button
                  onClick={handleDownload}
                  className="text-orange-600 hover:underline text-xs"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-600"><span className="font-semibold">Name:</span> {selectedSOA.name}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Folio:</span> {selectedSOA.folio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600"><span className="font-semibold">Scheme:</span> {selectedSOA.scheme}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Nominee 1:</span> {selectedSOA.nominee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600"><span className="font-semibold">Joint 1:</span> -</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-600"><span className="font-semibold">Bank:</span> {selectedSOA.bank}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <p><span className="font-semibold">Market Value (Per Unit):</span> ₹ {selectedSOA.marketValuePerUnit.toFixed(4)} as on {selectedSOA.marketValueDate}</p>
                <p><span className="font-semibold">Total Market Value:</span> ₹ {selectedSOA.totalMarketValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-semibold">Unit Balance:</span> {selectedSOA.unitBalance.toFixed(4)}
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Transaction Type</th>
                    <th className="px-4 py-2 border">ARN No</th>
                    <th className="px-4 py-2 border">Amount (₹)</th>
                    <th className="px-4 py-2 border">NAV/Rate (₹)</th>
                    <th className="px-4 py-2 border">Units</th>
                    <th className="px-4 py-2 border">Balance Units</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSOA.transactions.map((txn, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{txn.date}</td>
                      <td className="px-4 py-2 border">{txn.type}</td>
                      <td className="px-4 py-2 border">{txn.arnNo}</td>
                      <td className="px-4 py-2 border">₹ {txn.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 border">₹ {txn.navRate.toFixed(4)}</td>
                      <td className="px-4 py-2 border">{txn.units.toFixed(4)}</td>
                      <td className="px-4 py-2 border">{txn.balanceUnits.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end bg-white sticky bottom-0">
            <button
              onClick={() => setShowSOAModal(false)}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BuildReportMessage = () => (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="text-orange-500 text-5xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Build a report</h3>
        <p className="text-gray-600 mb-4">Use the form above to generate a report</p>
        <button
          onClick={handleHeaderPlusClick}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
        >
          Configure Report
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!loading && (!apiData || apiData.length === 0)) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">No portfolio data available</p>
      </div>
    );
  }

  // Calculate totals for the filtered data
  const calculateTotals = () => {
    const totals = {
      purchaseValue: 0,
      currentValue: 0,
      gain: 0,
      holdingDays: 0,
      absReturn: 0,
      cagr: 0,
      schemeCount: 0
    };

    filteredReportData.forEach(investor => {
      investor.schemes.forEach(scheme => {
        totals.purchaseValue += scheme.purchaseValue;
        totals.currentValue += scheme.currentValue;
        totals.gain += scheme.gain;
        totals.holdingDays += scheme.holdingDays;
        totals.absReturn += scheme.absReturn;
        totals.cagr += scheme.cagr;
        totals.schemeCount++;
      });
    });

    return totals;
  };

  return (
    <div className="p-4 bg-white text-sm relative">
      {showConfigForm ? (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <button
                onClick={toggleView}
                className="mr-2 p-1 text-gray-600 hover:text-orange-500"
              >
                <MdOutlineRemove size={20} />
              </button>
              <h2 className="text-lg font-semibold">Report Configuration</h2>
            </div>
            <button
              onClick={handleMinimize}
              className="p-1 text-gray-600 hover:text-orange-500"
            >
              <FiMinus size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-1">View Type:</h3>
              <div className="flex flex-wrap items-center gap-4">
                {["On Screen", "PDF", "Excel", "Excel (Unformatted)", "Email"].map((type) => (
                  <label key={type} className="flex items-center text-xs">
                    <input
                      type="radio"
                      name="viewType"
                      value={type}
                      checked={config.viewType === type}
                      onChange={handleConfigChange}
                      className="mr-1 h-3 w-3"
                    />
                    {type}
                    {type === "PDF" && <span className="ml-1 text-orange-500"></span>}
                  </label>
                ))}
              </div>
              {config.viewType === "Email" && (
                <div className="mt-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      className="mr-1 h-3 w-3"
                    />
                    CC Relationship Manager
                  </label>
                </div>
              )}
            </div>
          </div>

          {config.viewType !== "On Screen" && config.viewType !== "PDF" && config.viewType !== "Excel (Unformatted)"
            && config.viewType !== "Email" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-1">Report Type:</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {["Category", "Sub-Category", "Transaction", "Client Wise"].map((type) => (
                      <label key={type} className="flex items-center text-xs">
                        <input
                          type="radio"
                          name="reportType"
                          value={type}
                          checked={config.reportType === type}
                          onChange={handleConfigChange}
                          className="mr-1 h-3 w-3"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {config.viewType !== "On Screen" && config.viewType !== "Excel" && config.viewType !== "Excel (Unformatted)" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-1">Group By:</h3>
                <select
                  className="w-full p-1 border rounded text-xs"
                >
                  <option value="">Select Group By Option</option>
                  {groupByOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {config.viewType !== "On Screen" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-1">Choose Product:</h3>
                <div className="flex flex-wrap items-center gap-4">
                  {Object.keys(selectedProducts).map((product) => (
                    <label key={product} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={selectedProducts[product as keyof typeof selectedProducts]}
                        onChange={() => handleProductChange(product)}
                        className="mr-1 h-3 w-3"
                      />
                      {product}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.viewType === "Excel" && (config.reportType === "Transaction" || config.reportType === "Client Wise") ? (
            <div className="mb-4">
              <h3 className="font-medium mb-1">Data Options:</h3>
              <div className="flex flex-wrap gap-1">
                <label className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                  <input
                    type="checkbox"
                    checked={dataOptions["Merge SIP, STP, Div Reinvest"]}
                    onChange={() => handleDataOptionChange("Merge SIP, STP, Div Reinvest")}
                    className="text-orange-500 h-3 w-3"
                  />
                  <span className="text-xs">Merge SIP, STP, Div Reinvest</span>
                </label>
              </div>
            </div>
          ) : config.viewType !== "On Screen" && config.viewType !== "Excel" && config.viewType !== "Excel (Unformatted)" && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">Data Options:</h3>
              <div className="flex flex-wrap gap-1">
                {Object.keys(dataOptions).map(option => (
                  <label key={option} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={dataOptions[option as keyof typeof dataOptions]}
                      onChange={() => handleDataOptionChange(option)}
                      className="text-orange-500 h-3 w-3"
                    />
                    <span className="text-xs">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {config.viewType !== "On Screen" && config.viewType !== "Excel" && config.viewType !== "Excel (Unformatted)" && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">MF Allocation Sections:</h3>
              <div className="flex flex-wrap gap-1">
                {Object.keys(mfAllocations).map(option => (
                  <label key={option} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={mfAllocations[option as keyof typeof mfAllocations]}
                      onChange={() => handleMfAllocationChange(option)}
                      className="text-orange-500 h-3 w-3"
                    />
                    <span className="text-xs">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {config.viewType !== "PDF" && config.viewType !== "Excel" && config.viewType !== "Excel (Unformatted)"
            && config.viewType !== "Email" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-1">Choose Product:</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {["Mutual Fund", "Share & Bond", "Fixed Deposit", "Other Assets"].map((product) => (
                      <label key={product} className="flex items-center text-xs">
                        <input
                          type="radio"
                          name="product"
                          value={product}
                          checked={config.product === product}
                          onChange={handleConfigChange}
                          className="mr-1 h-3 w-3"
                        />
                        {product}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {config.product === "Share & Bond" && config.viewType !== "PDF" && config.viewType !== "Email"
            && config.viewType !== "Excel" && config.viewType !== "Excel (Unformatted)" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-1">Group By:</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center text-xs">
                      <input
                        type="radio"
                        name="groupBy"
                        value="Scrip"
                        checked={config.groupBy === "Scrip"}
                        onChange={handleGroupByChange}
                        className="mr-1 h-3 w-3"
                      />
                      Scrip
                    </label>
                    <label className="flex items-center text-xs">
                      <input
                        type="radio"
                        name="groupBy"
                        value="Investor"
                        checked={config.groupBy === "Investor"}
                        onChange={handleGroupByChange}
                        className="mr-1 h-3 w-3"
                      />
                      Investor
                    </label>
                  </div>
                </div>
              </div>
            )}

          <div className="mb-4">
            <h3 className="font-medium mb-2">Filter:</h3>
            <div className="grid grid-cols-1 lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block mb-1 text-xs">Investor:</label>
                <select
                  name="investor"
                  value={config.investor}
                  onChange={handleInvestorChange}
                  className="w-full p-1 border rounded text-xs"
                >
                  {panFromUrl ? (
                    selectedInvestor && (
                      <option value={selectedInvestor.pan}>
                        {selectedInvestor.name} (PAN: {selectedInvestor.pan})
                      </option>
                    )
                  ) : (
                    <>
                      <option value="">All Investors</option>
                      {investorOptions.map((investor, index) => (
                        <option
                          key={`${investor.pan}-${index}`}
                          value={investor.pan}
                        >
                          {investor.name} (PAN: {investor.pan})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {config.product === "Share & Bond" && (
                <div>
                  <label className="block mb-1 text-xs">Category:</label>
                  <select
                    name="category"
                    value={config.advancedFilters.category}
                    onChange={handleAdvancedFilterChange}
                    className="w-full p-1 border rounded text-xs"
                  >
                    <option value="">All</option>
                    <option>Equity</option>
                    <option>Debt</option>
                    <option>Other</option>
                    <option>Gold</option>
                  </select>
                </div>
              )}

              {config.product === "Mutual Fund" && (
                <div>
                  <label className="block mb-1 text-xs">Source:</label>
                  <select
                    name="source"
                    value={config.source}
                    onChange={handleConfigChange}
                    className="w-full p-1 border rounded text-xs"
                  >
                    <option value="">All</option>
                    <option>Managed Data</option>
                    <option>Outside Data</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs">Report as on date:</label>
                <input
                  type="date"
                  name="reportDate"
                  value={config.reportDate}
                  onChange={handleConfigChange}
                  className="w-full p-1 border rounded text-xs"
                />
              </div>

              {config.product !== "Fixed Deposit" && (
                <div>
                  <label className="block mb-1 text-xs">Holding Period:</label>
                  <select
                    name="holdingPeriod"
                    value={config.holdingPeriod}
                    onChange={handleConfigChange}
                    className="w-full p-1 border rounded text-xs"
                  >
                    <option>All</option>
                    <option>Upto 1 Year</option>
                    <option>More than 1 Year</option>
                    <option>More than 2 Year</option>
                    <option>More than 3 Year</option>
                    <option>More than 4 Year</option>
                  </select>
                </div>
              )}

              {config.product === "Mutual Fund" && (
                <div>
                  <label className="block mb-1 text-xs">Transaction Type:</label>
                  <select
                    name="transactionType"
                    value={config.transactionType}
                    onChange={handleConfigChange}
                    className="w-full p-1 border rounded text-xs"
                  >
                    <option>All</option>
                    <option>Purchase</option>
                    <option>SIP</option>
                    <option>STI</option>
                    <option>Switch IN</option>
                    <option>Divident Reinvest</option>
                    <option>Bonus</option>
                  </select>
                </div>
              )}
            </div>

            {config.product === "Mutual Fund" && (
              <div className="col-span-full">
                <button
                  onClick={toggleAdvancedFilters}
                  className="text-xs text-orange-500 hover:text-orange-700 flex items-center"
                >
                  Advanced Search
                  {showAdvancedFilters ? <MdArrowDropUp size={18} /> : <MdArrowDropDown size={18} />}
                </button>
              </div>
            )}

            {showAdvancedFilters && config.product === "Mutual Fund" && (
              <div className="col-span-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-1 text-xs">Category:</label>
                    <select
                      name="category"
                      value={config.advancedFilters.category}
                      onChange={handleAdvancedFilterChange}
                      className="w-full p-1 border rounded text-xs"
                    >
                      <option value="">All Selected</option>
                      {filterOptions.categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs">Sub Category:</label>
                    <select
                      name="subCategory"
                      value={config.advancedFilters.subCategory}
                      onChange={handleAdvancedFilterChange}
                      className="w-full p-1 border rounded text-xs"
                      disabled={!config.advancedFilters.category}
                    >
                      <option value="">All Selected</option>
                      {config.advancedFilters.category &&
                        filterOptions.subCategories[config.advancedFilters.category as keyof typeof filterOptions.subCategories]?.map((subCat, index) => (
                          <option key={index} value={subCat}>{subCat}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs">Fund:</label>
                    <select
                      name="fund"
                      value={config.advancedFilters.fund}
                      onChange={(e) => {
                        handleAdvancedFilterChange(e);
                        handleSchemeChange(e.target.value);
                      }}
                      className="w-full p-1 border rounded text-xs"
                      disabled={!config.investor}
                    >
                      <option value="">All Selected</option>
                      {fundOptions.map((fund, index) => (
                        <option key={index} value={fund}>{fund}</option>
                      ))}
                    </select>
                  </div>


                  <div>
                    <label className="block mb-1 text-xs">Folio:</label>
                    <select
                      name="folio"
                      value={config.advancedFilters.folio}
                      onChange={handleAdvancedFilterChange}
                      className="w-full p-1 border rounded text-xs"
                      disabled={isLoadingFolios || !config.advancedFilters.fund}
                    >
                      {isLoadingFolios ? (
                        <option value="">Loading folios...</option>
                      ) : (
                        <>
                          <option value="">All Selected</option>
                          {folioOptions.map((folio, index) => (
                            <option key={index} value={folio}>
                              {folio}
                            </option>
                          ))}
                        </>
                      )}
                    </select>




                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={handleResetAdvancedFilters}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyAdvancedFilters}
                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {config.product !== "Fixed Deposit" && config.viewType !== "Excel (Unformatted)" && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">Columns Include:</h3>
              <div className="flex flex-wrap gap-1">
                {config.product === "Share & Bond" ? (
                  <>
                    {["Quantity", "Dividend", "Gain", "Holding Days", "Absolute Return", "CAGR"].map(column => (
                      <label key={column} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={config.columns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="text-orange-500 h-3 w-3"
                        />
                        <span className="text-xs">{column}</span>
                      </label>
                    ))}
                  </>
                ) : config.product === "Other Assets" ? (
                  <label className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={config.columns.includes("Gain")}
                      onChange={() => handleColumnToggle("Gain")}
                      className="text-orange-500 h-3 w-3"
                    />
                    <span className="text-xs">Gain</span>
                  </label>
                ) : (
                  <>
                    {[
                      "Balance Units",
                      "Purchase NAV",
                      "Current NAV",
                      "Quantity",
                      "Dividend",
                      "Gain",
                      "Holding Days",
                      "Absolute Return",
                      "CAGR"
                    ].filter(col => col !== "").map(column => (
                      <label key={column} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={config.columns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="text-orange-500 h-3 w-3"
                        />
                        <span className="text-xs">{column}</span>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleMinimize}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              Cancel
            </button>
            {config.viewType === "PDF" && (
              <button
                onClick={handleSendOnWhatsApp}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs flex items-center gap-1"
              >
                <FaWhatsapp size={14} />
                Send On WhatsApp
              </button>
            )}
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
            >
              Apply
            </button>
          </div>
        </div>
      ) : showDataTable ? (
        <>
          <div className="flex items-center mb-3">
            <button
              onClick={toggleView}
              className="mr-2 p-1 text-gray-600 hover:text-orange-500"
            >
              <MdOutlineRemove size={18} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Report Configuration</h2>
            <button
              onClick={handleHeaderPlusClick}
              className="ml-2 p-1 text-orange-500 hover:text-orange-700 rounded-full hover:bg-orange-50 transition-colors"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <table className="min-w-[1000px] divide-y divide-gray-200 text-sm">
              <thead className="bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                <tr>
                  {[
                    "Folio",
                    "Scheme",
                    "Balance Units",
                    "Purchase NAV",
                    "Current NAV",
                    "Purchase Value",
                    "Current Value",
                    "Gain",
                    "Holding Days",
                    "Abs Return (%)",
                    "CAGR (%)",
                  ].map((heading, i) => (
                    <th
                      key={i}
                      className={`px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wide ${i >= 2 ? "text-right" : ""
                        }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-xs">
                {filteredReportData && filteredReportData.length > 0 ? (
                  filteredReportData.map((investor, index) => {
                    const investorTotals = calculateInvestorTotals(investor);
                    const categoryTotals = calculateCategoryTotals(investor, investor.category);

                    return (
                      <React.Fragment key={`investor-${index}`}>
                        {/* Investor Name Row */}
                        <tr className="bg-gray-50">
                          <td colSpan={11} className="px-3 py-2 font-semibold text-gray-900">
                            {investor.investorName} : {investor.folioNumber}
                          </td>
                        </tr>

                        {/* Category Row */}
                        <tr className="bg-gray-100">
                          <td colSpan={11} className="px-3 py-2 font-medium text-gray-700">
                            {investor.category}
                          </td>
                        </tr>

                        {/* Scheme Rows */}
                        {investor.schemes.map((scheme, idx) => {
                          const isExpanded = expandedRows.has(scheme.transactionId);
                          return (
                            <React.Fragment key={`scheme-${idx}`}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-3 py-1.5 text-gray-800">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toggleRow(scheme.transactionId)}
                                      className="text-gray-600 hover:text-orange-500"
                                    >
                                      {isExpanded ? <FiMinus size={12} /> : <FiPlus size={12} />}
                                    </button>
                                    <span className="font-medium">{scheme.transactionId}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-1.5">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleSOAClick(scheme)}
                                      className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded hover:bg-orange-200"
                                    >
                                      {scheme.soa}
                                    </button>
                                    <button
                                      onClick={() => handleAddToCart(scheme)}
                                      className="text-orange-500 hover:text-orange-700"
                                    >
                                      <IoCartOutline size={12} />
                                    </button>
                                    <span className="ml-1">{scheme.schemeName}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-1.5 text-right">{scheme.balanceUnits.toFixed(3)}</td>
                                <td className="px-3 py-1.5 text-right">{formatNumber(scheme.purchaseNav)}</td>
                                <td className="px-3 py-1.5 text-right">{formatNumber(scheme.currentNav)}</td>
                                <td className="px-3 py-1.5 text-right">{formatNumber(scheme.purchaseValue)}</td>
                                <td className="px-3 py-1.5 text-right">{formatNumber(scheme.currentValue)}</td>
                                <td className="px-3 py-1.5 text-right">{formatNumber(scheme.gain)}</td>
                                <td className="px-3 py-1.5 text-right">{scheme.holdingDays}</td>
                                <td className="px-3 py-1.5 text-right">{scheme.absReturn}</td>
                                <td className="px-3 py-1.5 text-right">{scheme.cagr}</td>
                              </tr>

                              {/* Expanded Transaction Rows */}
                              {isExpanded &&
                                scheme.transactions.map((txn, tIdx) => (
                                  <tr key={`txn-${tIdx}`} className="bg-gray-50 hover:bg-gray-100 text-[11px]">
                                    <td className="px-3 py-1 pl-8 text-gray-600">{txn.date}</td>
                                    <td className="px-3 py-1 text-gray-600">{txn.type}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{txn.units.toFixed(3)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{formatNumber(txn.nav)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{formatNumber(scheme.currentNav)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{formatNumber(txn.purchaseValue)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{formatNumber(txn.currentValue)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{formatNumber(txn.gain)}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{txn.days}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{txn.absReturn}</td>
                                    <td className="px-3 py-1 text-right text-gray-600">{txn.cagr}</td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          );
                        })}

                        {/* Category Sub Total */}
                        <tr className="bg-orange-50 border-t border-gray-300 font-semibold text-[12px]">
                          <td colSpan={5} className="px-3 py-1 text-right text-gray-700">
                            Sub Total - {investor.category} :
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(categoryTotals.purchaseValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(categoryTotals.currentValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(categoryTotals.gain)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {Math.round(categoryTotals.holdingDays / categoryTotals.schemeCount)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {(categoryTotals.absReturn / categoryTotals.schemeCount).toFixed(2)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {(categoryTotals.cagr / categoryTotals.schemeCount).toFixed(2)}
                          </td>
                        </tr>

                        {/* Investor Sub Total */}
                        <tr className="bg-orange-50 border-t border-gray-300 font-semibold text-[12px]">
                          <td colSpan={5} className="px-3 py-1 text-right text-gray-700">
                            Sub Total - {investor.investorName} :
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(investorTotals.purchaseValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(investorTotals.currentValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {formatNumber(investorTotals.gain)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {Math.round(investorTotals.holdingDays / investorTotals.schemeCount)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {(investorTotals.absReturn / investorTotals.schemeCount).toFixed(2)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-700">
                            {(investorTotals.cagr / investorTotals.schemeCount).toFixed(2)}
                          </td>
                        </tr>

                        {/* Investor Grand Total */}
                        <tr className="bg-orange-100 border-t-2 border-gray-400 font-bold text-[12px]">
                          <td colSpan={5} className="px-3 py-1 text-right text-gray-800">
                            Grand Total :
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {formatNumber(investorTotals.purchaseValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {formatNumber(investorTotals.currentValue)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {formatNumber(investorTotals.gain)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {Math.round(investorTotals.holdingDays / investorTotals.schemeCount)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {(investorTotals.absReturn / investorTotals.schemeCount).toFixed(2)}
                          </td>
                          <td className="px-3 py-1 text-right text-gray-800">
                            {(investorTotals.cagr / investorTotals.schemeCount).toFixed(2)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="px-3 py-4 text-center text-sm text-gray-500">
                      {loading ? "Loading data..." : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : showBuildReport ? (
        <BuildReportMessage />
      ) : null}

      <SOAModal />
    </div>
  );
};

export default ReportConfiguration;