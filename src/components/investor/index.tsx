"use client";

import { Mail, PhoneCall, X, CheckCircle, MessageSquare, ChevronDown, ChevronUp, ChevronLeft, RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getPortfolioDetails } from "@/services/clientService";
import { useSearchParams, useRouter } from 'next/navigation';
import RiskSuitability from "../risk-management/risk-suitability";
import AssetDetails from "../createTargets/create-targets";
import FolioList from "@/components/folioList/folio-list";
import RemapInvestor from "@/components/folioList/remap-investor";
import AllReports from "@/components/portfolioAnalysis/allReports";
import InvestmentSummary from "@/components/portfolioAnalysis/investment-summary";
import ViewTargets from "../risk-management/ViewTargets";
import InvestmentCart from "../transactOnline/show-create-cart";
import EmailCart from "../transactOnline/email-cart";
import TaxSheet from "../taxationSheet/taxation-sheet";
import VedantAssetPage from "../risk-management/trackMap";
import StockPage from "../manual-entry/stock";
import MutualFundPage from "../manual-entry/mutualFund";
import InterestBearingPage from "../manual-entry/interestBearing";
import NpsPage from "../manual-entry/nps";
import PreciousMetalPage from "../manual-entry/preciousMetal";
import FinancialProductsInterface from "../manual-entry/viewAllEdit";
import TaxSheet1 from "../taxationSheet1/taxation-sheet1";

interface Client {
  id: string;
  dateAdded: string;
  name: string;
  group: string;
  pan: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  phoneRes: string;
  phoneOff: string;
  email: string;
  dob: string;
  kyc: string;
  login: string;
  riskProfile: boolean;
  onlineGateway: boolean;
  appUser: boolean;
  foliochk: string;
  sch_name: string;
}

const reportTabs = [
  "Portfolio Valuation",
  "Folio Master",
  "MIS Reports",
  "Taxation Sheet Realized",
  "Taxation Sheet Unrealized",
];

const misReportOptions = [
  "AUM Report",
  "Investment Ledger",
  "SIP/SWP In Report",
];

const folioMasterOptions = [
  "Folio List",
  "Remap Investor to another distributor"
];

const portfolioMasterOptions = [
  "All Reports",
  "Investment Summary-Point to Point",
];

export default function ClientTable() {
  const [expandedRows, setExpandedRows] = useState<String[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [showRiskSuitability, setShowRiskSuitability] = useState(false);
  const [showViewTargets, setShowViewTargets] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInvestmentCart, setShowInvestmentCart] = useState(false);
  const [showEmailCart, setShowEmailCart] = useState(false);
  const [showFolioList, setShowFolioList] = useState(false);
  const [showRemapInvestor, setShowRemapInvestor] = useState(false);
  const [showInvestmentSummary, setShowInvestmentSummary] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showTaxSheet, setShowTaxSheet] = useState(false);
  const [showVedantAssetPage, setShowVedantAssetPage] = useState(false);
  const [showStockPage, setShowStockPage] = useState(false);
  const [showMutualFundPage, setShowMutualFundPage] = useState(false);
  const [showInterestBearingPage, setShowInterestBearingPage] = useState(false);
  const [showNPSPage, setShowNPSPage] = useState(false);
  const [showPreciousMetalPage, setShowPreciousMetalPage] = useState(false);
  const [showViewAllPage, setShowViewAllPage] = useState(false);
  const [showTaxSheet1, setShowTaxSheet1] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<{
    clientId: number;
    tab: string;
  } | null>(null);
  const [selectedFolio, setSelectedFolio] = useState<{
    foliochk: string;
    sch_name: string;
    clientId: string;
  } | null>(null);
  const [showComponentUnderRow, setShowComponentUnderRow] = useState<{
    clientId: string;
    component: 'folioList' | 'remapInvestor' | null;
  }>({ clientId: '', component: null });
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchClientData = async () => {
      // If we already have client data, don't fetch again
      if (clients.length > 0 || hasData) {
        setLoading(false);
        return;
      }

      const storedClient = sessionStorage.getItem('selectedClient');
      
      if (storedClient) {
        try {
          const clientData = JSON.parse(storedClient);
          const name = clientData.name;
          const pan = clientData.pan;

          if (name && pan) {
            await fetchClientFromAPI(name, pan);
          } else {
            loadFromLocalStorage();
          }
        } catch (err) {
          console.error("Parse Error:", err);
          loadFromLocalStorage();
        }
      } else {
        // No sessionStorage, try URL params
        const name = searchParams.get('name');
        const pan = searchParams.get('pan');

        if (name && pan) {
          await fetchClientFromAPI(name, pan);
        } else {
          loadFromLocalStorage();
        }
      }
    };

    const fetchClientFromAPI = async (name: string, pan: string) => {
      try {
        const apiData = await getPortfolioDetails({
          inv_name: name,
          pan_no: pan
        });

        const formattedClients = apiData.map((item, index) => ({
          id: item.foliochk,
          dateAdded: new Date(item.folio_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          name: item.inv_name,
          group: "-",
          pan: item.pan_no,
          mobile: item.mobile_no,
          address: `${item.address1} ${item.address2} ${item.address3}`,
          city: item.city,
          pincode: item.pincode,
          phoneRes: item.phone_res,
          phoneOff: item.phone_off,
          email: item.email,
          dob: item.inv_dob ? new Date(item.inv_dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
          kyc: "-",
          login: item.email,
          riskProfile: false,
          onlineGateway: false,
          appUser: true,
          foliochk: item.foliochk,
          sch_name: item.sch_name,
        }));

        setClients(formattedClients);
        setHasData(true);
        
        // Store the data in localStorage for backup
        if (formattedClients.length > 0) {
          localStorage.setItem('lastClientData', JSON.stringify({
            clients: formattedClients,
            timestamp: new Date().getTime()
          }));
          
          setSelectedFolio({
            foliochk: formattedClients[0].foliochk,
            sch_name: formattedClients[0].sch_name,
            clientId: formattedClients[0].id,
          });
        }
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch client data from server");
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const lastClientData = localStorage.getItem('lastClientData');
      
      if (lastClientData) {
        try {
          const parsedData = JSON.parse(lastClientData);
          const { clients: storedClients, timestamp } = parsedData;
          
          // Check if data is less than 4 hours old (optional)
          const fourHoursAgo = new Date().getTime() - (4 * 60 * 60 * 1000);
          
          if (timestamp > fourHoursAgo) {
            setClients(storedClients);
            setHasData(true);
            
            if (storedClients.length > 0) {
              setSelectedFolio({
                foliochk: storedClients[0].foliochk,
                sch_name: storedClients[0].sch_name,
                clientId: storedClients[0].id,
              });
            }
            
            setError(null);
          } else {
            setError("Session expired. Please search for the client again.");
          }
        } catch (err) {
          console.error("Error loading from localStorage:", err);
          setError("No client data available. Please search for a client.");
        }
      } else {
        setError("No client data available. Please search for a client.");
      }
      setLoading(false);
    };

    fetchClientData();
  }, [searchParams]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev = []) =>  
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleDropdown = (clientId: number, tab: string) => {
    if (activeDropdown?.clientId === clientId && activeDropdown?.tab === tab) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown({ clientId, tab });
    }
  };

  const handleOptionClick = (option: string, client: Client) => {
    if (option === "Risk Suitability") {
      setShowRiskSuitability(true);
      setShowFolioList(false);
      setShowRemapInvestor(false);
      setShowAllReports(false);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    if (option === "Portfolio Valuation") {
      setShowAllReports(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
      setActiveDropdown(null);
      return;
    } else if (option === "AUM Report") {
      const pan = clients[0]?.pan;
      const name = clients[0]?.name;
      const folio_no = clients[0]?.foliochk;
      setShowComponentUnderRow({ clientId: '', component: null });
      setSelectedClient(client);

      if (pan && name && folio_no) {
        router.push(`/aun-report?pan=${pan}&name=${encodeURIComponent(name)}&folio_no=${folio_no}`);
      } else {
        alert("Client information not available");
      }
    } else if (option === "Investment Ledger") {
      const pan = clients[0]?.pan;
       const name = clients[0]?.name || "";
      setShowComponentUnderRow({ clientId: '', component: null });
      setSelectedClient(client);

      if (pan) {
        router.push(`/investment-ledger?pan=${pan}&name=${name}`);
        setShowComponentUnderRow({ clientId: '', component: null });
        setSelectedClient(client);
      } else {
        alert("Client information not available");
      }
    } else if (option === "SIP/SWP In Report") {
      const pan = clients[0]?.pan;
      const name = clients[0]?.name || "";

      setShowComponentUnderRow({ clientId: '', component: null });
      setSelectedClient(client);

      if (pan) {
        router.push(`/sip-stp?pan=${pan}&name=${name}`);
        setShowComponentUnderRow({ clientId: '', component: null });
        setSelectedClient(client);
      } else {
        alert("Client information not available");
      }
    }
    else if (option === "SWP/STP out Report") {
      const pan = clients[0]?.pan;
      const name = clients[0]?.name || "";

      setShowComponentUnderRow({ clientId: '', component: null });
      setSelectedClient(client);

      if (pan) {
        router.push(`/swp-stp?pan=${pan}&name=${name}`);
        setShowComponentUnderRow({ clientId: '', component: null });
        setSelectedClient(client);
      } else {
        alert("Client information not available");
      }
    }

    else if (option === "Search Transaction") {
      const pan = clients[0]?.pan;
      setShowComponentUnderRow({ clientId: '', component: null });
      setSelectedClient(client);

      if (pan) {
        router.push(`/search-tra?pan=${pan}`);
        setShowComponentUnderRow({ clientId: '', component: null });
        setSelectedClient(client);
      } else {
        alert("Client information not available");
      }
    }

    else if (option === "Taxation Sheet Realized") {
      setShowTaxSheet(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } 
    else if (option === "Taxation Sheet Unrealized") {
      setShowTaxSheet1(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "Folio List") {
      setSelectedFolio({
        foliochk: client.foliochk,
        sch_name: client.sch_name,
        clientId: client.id
      });
      setShowComponentUnderRow({
        clientId: client.id,
        component: 'folioList'
      });
      setShowRemapInvestor(false);
      setShowAllReports(false);
    } else if (option === "Remap Investor to another distributor") {
      setSelectedFolio({
        foliochk: client.foliochk,
        sch_name: client.sch_name,
        clientId: client.id
      });
      setShowComponentUnderRow({
        clientId: client.id,
        component: 'remapInvestor'
      });
      setShowFolioList(false);
      setShowAllReports(false);
    } else if (option === "All Reports") {
      setShowAllReports(true);
      setShowFolioList(false);
      setShowRemapInvestor(false);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "Investment Summary-Point to Point") {
      setShowInvestmentSummary(true);
      setShowAllReports(false);
      setShowFolioList(false);
      setShowRemapInvestor(false);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "Create Targets") {
      setShowAssetDetails(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "View Targets") {
      setShowViewTargets(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "Track / Map Targets") {
      setShowVedantAssetPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "Stocks") {
      setShowStockPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "Mutual Funds") {
      setShowMutualFundPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "Interest Bearing (RD/FD/etc)") {
      setShowInterestBearingPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "NPS") {
      setShowNPSPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "Precious Metal") {
      setShowPreciousMetalPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "View All / Edit") {
      setShowViewAllPage(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    }
    else if (option === "Show / Create Cart") {
      setShowInvestmentCart(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else if (option === "Email Cart") {
      setShowEmailCart(true);
      setSelectedClient(client);
      setShowComponentUnderRow({ clientId: '', component: null });
    } else {
      alert(`Selected option: ${option}`);
    }
    setActiveDropdown(null);
  };

  const getDropdownOptions = (tab: string): string[] => {
    switch (tab) {
      case "MIS Reports":
        return misReportOptions;
      case "Folio Master":
        return folioMasterOptions;
      case "Portfolio Valuation":
        return portfolioMasterOptions;
      default:
        return [];
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setHasData(false);
    setClients([]);
    
    // Clear storage
    localStorage.removeItem('lastClientData');
    sessionStorage.removeItem('selectedClient');
    
    // Try to get data from URL params if they exist
    const name = searchParams.get('name');
    const pan = searchParams.get('pan');
    
    if (name && pan) {
      // Re-fetch with current URL params
      const fetchData = async () => {
        try {
          const apiData = await getPortfolioDetails({
            inv_name: name,
            pan_no: pan
          });

          const formattedClients = apiData.map((item, index) => ({
            id: item.foliochk,
            dateAdded: new Date(item.folio_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            name: item.inv_name,
            group: "-",
            pan: item.pan_no,
            mobile: item.mobile_no,
            address: `${item.address1} ${item.address2} ${item.address3}`,
            city: item.city,
            pincode: item.pincode,
            phoneRes: item.phone_res,
            phoneOff: item.phone_off,
            email: item.email,
            dob: item.inv_dob ? new Date(item.inv_dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
            kyc: "-",
            login: item.email,
            riskProfile: false,
            onlineGateway: false,
            appUser: true,
            foliochk: item.foliochk,
            sch_name: item.sch_name,
          }));

          setClients(formattedClients);
          setHasData(true);
          
          if (formattedClients.length > 0) {
            localStorage.setItem('lastClientData', JSON.stringify({
              clients: formattedClients,
              timestamp: new Date().getTime()
            }));
            
            setSelectedFolio({
              foliochk: formattedClients[0].foliochk,
              sch_name: formattedClients[0].sch_name,
              clientId: formattedClients[0].id,
            });
          }
          
          setLoading(false);
        } catch (err) {
          console.error("Refresh error:", err);
          setError("Failed to refresh data. Please try again.");
          setLoading(false);
        }
      };
      
      fetchData();
    } else {
      setError("No client parameters available for refresh");
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    // Navigate back to your client search page
    router.push('/client-search'); // Adjust this path to your actual search page
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && clients.length === 0) {
    return (
      <div className="p-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
          
          <button
            onClick={handleBackToSearch}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Search Client Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showAssetDetails && selectedClient ? (
        <AssetDetails
          onBack={() => setShowAssetDetails(false)}
          clientData={{
            name: selectedClient.name,
            mobile: selectedClient.mobile,
            address: selectedClient.address,
            city: selectedClient.city,
            pincode: selectedClient.pincode,
            phoneRes: selectedClient.phoneRes,
            phoneOff: selectedClient.phoneOff,
            email: selectedClient.email,
            dob: selectedClient.dob,
            pan: selectedClient.pan
          }}
        />
      ) : showViewTargets && selectedClient ? (
        <ViewTargets
          onBack={() => setShowViewTargets(false)}
          clientData={{
            name: selectedClient.name,
            pan: selectedClient.pan
          }}
        />
      ) : showVedantAssetPage && selectedClient ? (
        <VedantAssetPage
          onBack={() => setShowVedantAssetPage(false)}
          clientData={{
            name: selectedClient.name,
            pan: selectedClient.pan
          }}
        />
      ) : showInvestmentCart && selectedClient ? (
        <InvestmentCart
          onBack={() => setShowInvestmentCart(false)}
          clientName={selectedClient.name}
        />
      ) : showViewAllPage && selectedClient ? (
        <FinancialProductsInterface
          onBack={() => setShowViewAllPage(false)}
          clientName={selectedClient.name}
        />
      ) : showPreciousMetalPage && selectedClient ? (
        <PreciousMetalPage
          onBack={() => setShowPreciousMetalPage(false)}
          clientName={selectedClient.name}
        />
      ) : showTaxSheet && selectedClient ? (
        <TaxSheet
          onBack={() => setShowTaxSheet(false)}
          clientName={selectedClient.name}
          clientPan={selectedClient.pan}
        />
      ) : showTaxSheet1 && selectedClient ? (
        <TaxSheet1
          onBack={() => setShowTaxSheet1(false)}
          clientName={selectedClient.name}
          clientPan={selectedClient.pan}
          
        />
      ) : showNPSPage && selectedClient ? (
        <NpsPage
          onBack={() => setShowNPSPage(false)}
          clientName={selectedClient.name}
        />
      ) : showInterestBearingPage && selectedClient ? (
        <InterestBearingPage
          onBack={() => setShowInterestBearingPage(false)}
          clientName={selectedClient.name}
        />
      ) : showMutualFundPage && selectedClient ? (
        <MutualFundPage
          onBack={() => setShowMutualFundPage(false)}
          clientName={selectedClient.name}
        />
      ) : showStockPage && selectedClient ? (
        <StockPage
          onBack={() => setShowStockPage(false)}
          clientName={selectedClient.name}
        />
      ) : showAllReports && selectedClient ? (
        <AllReports
          invName={selectedClient?.name || ""}
          panNo={selectedClient?.pan || ""}
          onBack={() => setShowAllReports(false)}
          clientName={selectedClient.name}
        />
      ) : showInvestmentSummary && selectedClient ? (
        <InvestmentSummary
          invName={selectedClient?.name || ""}
          panNo={selectedClient?.pan || ""}
          onBack={() => setShowInvestmentSummary(false)}
          clientName={selectedClient.name}
        />
      ) : showEmailCart && selectedClient ? (
        <EmailCart
          onBack={() => setShowEmailCart(false)}
          clientName={selectedClient.name}
          clientEmail={selectedClient.email}
        />
      ) : showRiskSuitability ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <RiskSuitability
            onSelectNow={() => {
              alert("Risk Suitability selection started");
              setShowRiskSuitability(false);
            }}
            onCreateTarget={(targetType: any) => {
              alert(`Creating ${targetType} target`);
              setShowRiskSuitability(false);
            }}
            onClose={() => setShowRiskSuitability(false)}
          />
        </div>
      ) : (
        <div className="p-4 overflow-x-auto text-sm">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex gap-4">
              {error && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2">
                  <p className="text-sm">Note: Displaying cached data</p>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
          
          <table className="w-full border border-gray-300 table-auto text-center text-[14px] leading-relaxed">
            <thead className="bg-gray-200 font-medium">
              <tr>
                {[
                  "Folio No", "Date Added", "Name", "Group", "PAN", "Mobile",
                  "Address", "City", "Pincode", "Phone (Res)", "Phone (Off)",
                  "Email", "DOB", "KYC Status", "Login",
                  "Risk profile", "Online Gateway", "APP User",
                ].map((header) => (
                  <th key={header} className="border px-2 py-2 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <React.Fragment key={client.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border px-2 py-2">{client.id}</td>
                    <td className="border px-2 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {client.dateAdded}
                      </div>
                    </td>
                    <td className="border px-2 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => {
                            setSelectedFolio({
                              foliochk: client.foliochk,
                              sch_name: client.sch_name,
                              clientId: client.id
                            });
                          }}
                          className=""
                        >
                          {client.name}
                        </button>
                      </div>
                    </td>
                    <td className="border px-2 py-2">{client.group}</td>
                    <td className="border px-2 py-2">{client.pan}</td>
                    <td className="border px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <PhoneCall size={14} className="text-green-500" />
                        <span>{client.mobile}</span>
                      </div>
                    </td>
                    <td className="border px-2 py-2 text-center whitespace-nowrap">
                      <div
                        className="max-w-[200px] truncate hover:underline cursor-help"
                        title={client.address}
                      >
                        {client.address}
                      </div>
                    </td>
                    <td className="border px-2 py-2">{client.city}</td>
                    <td className="border px-2 py-2">{client.pincode}</td>
                    <td className="border px-2 py-2">{client.phoneRes}</td>
                    <td className="border px-2 py-2">{client.phoneOff}</td>
                    <td className="border px-2 py-2">{client.email}</td>
                    <td className="border px-2 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {client.dob}
                      </div>
                    </td>
                    <td className="border px-2 py-2">{client.kyc}</td>
                    <td className="border px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Mail size={14} className="text-blue-500" />
                        <span>{client.login}</span>
                      </div>
                    </td>
                    <td className="border px-2 py-2">
                      {client.riskProfile ? (
                        <CheckCircle className="text-green-500 inline-block" />
                      ) : (
                        <X className="text-red-500 inline-block" />
                      )}
                    </td>
                    <td className="border px-2 py-2">
                      {client.onlineGateway ? (
                        <CheckCircle className="text-green-500 inline-block" />
                      ) : (
                        <X className="text-red-500 inline-block" />
                      )}
                    </td>
                    <td className="border px-2 py-2">
                      {client.appUser ? (
                        <MessageSquare className="text-green-500 inline-block" />
                      ) : (
                        <X className="text-red-500 inline-block" />
                      )}
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td colSpan={18} className="px-2 py-1 text-left">
                      <button
                        onClick={() => toggleRow(client.id)}
                        className="text-blue-600 underline cursor-pointer flex items-center"
                      >
                        {expandedRows.includes(client.id) ? (
                          <ChevronUp size={16} className="mr-1" />
                        ) : (
                          <ChevronDown size={16} className="mr-1" />
                        )}
                        Reports & Utilities
                      </button>
                    </td>
                  </tr>

                  {expandedRows.includes(client.id) && (
                    <>
                      <tr>
                        <td colSpan={18} className="bg-gray-100 px-2 py-3">
                          <div className="flex flex-wrap gap-2 justify-start relative">
                            {reportTabs.map((tab) => (
                              <div key={tab} className="relative">
                                <button
                                  onClick={() => {
                                    if (tab === "Portfolio Valuation") {
                                      setShowAllReports(true);
                                      setSelectedClient(client);
                                      setShowComponentUnderRow({ clientId: '', component: null });
                                      setActiveDropdown(null);
                                    } else if (tab === "Manual Entry" || tab === "Risk Management" ||
                                      tab === "MIS Reports" || tab === "Folio Master" ||
                                      tab === "Transact Online" || tab === "Set Alerts") {
                                      toggleDropdown(parseInt(client.id), tab);
                                    } else if (tab === "Taxation Sheet Realized") {
                                      setShowTaxSheet(true);
                                      setSelectedClient(client);
                                    }
                                    else if (tab === "Taxation Sheet Unrealized") {
                                      setShowTaxSheet1(true);
                                      setSelectedClient(client);
                                    }
                                  }}
                                  className="bg-[#2f80b9] text-white text-xs px-3 py-1 rounded hover:bg-[#23679b] flex items-center"
                                >
                                  {tab}
                                  {(tab === "Manual Entry" || tab === "Risk Management" ||
                                    tab === "MIS Reports" || tab === "Folio Master" ||
                                    tab === "Transact Online" || tab === "Set Alerts") && (
                                      <ChevronDown size={14} className="ml-1" />
                                    )}
                                </button>

                                {activeDropdown?.clientId === parseInt(client.id) && activeDropdown?.tab === tab && (
                                  <div className="fixed z-[1000] mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                    {getDropdownOptions(tab).map((option: string) => (
                                      <div
                                        key={option}
                                        onClick={() => handleOptionClick(option, client)}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b border-gray-100 last:border-b-0"
                                      >
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {showComponentUnderRow.clientId === client.id && (
                        <tr>
                          <td colSpan={18} className="p-0">
                            {showComponentUnderRow.component === 'folioList' && selectedFolio && (
                              <div className="p-4 bg-white border-t">
                                <FolioList
                                  panNo={clients.find(c => c.id === selectedFolio.clientId)?.pan || ""}
                                  schName={selectedFolio.sch_name}
                                />
                                <div className="flex justify-start w-full">
                                  <button
                                    onClick={() => setShowComponentUnderRow({ clientId: '', component: null })}
                                    className="bg-[#2f80b9] text-white px-4 py-1 rounded text-sm mt-2"
                                  >
                                    Close Folio List
                                  </button>
                                </div>
                              </div>
                            )}

                            {showComponentUnderRow.component === 'remapInvestor' && selectedFolio && (
                              <div className="p-4 bg-white border-t">
                                <RemapInvestor
                                  pan={clients.find(c => c.id === selectedFolio.clientId)?.pan || ""}
                                />
                                <div className="flex justify-start w-full">
                                  <button
                                    onClick={() => setShowComponentUnderRow({ clientId: '', component: null })}
                                    className="bg-[#2f80b9] text-white px-4 py-1 rounded text-sm mt-2"
                                  >
                                    Close Remap Investor
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {showTaxSheet && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center border-b p-4">
                  <h2 className="text-xl font-bold">Taxation Sheet</h2>
                  <button
                    onClick={() => setShowTaxSheet(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4">
                  <TaxSheet />
                </div>
              </div>
            </div>
          )}
          {showTaxSheet1 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center border-b p-4">
                  <h2 className="text-xl font-bold">Taxation Sheet</h2>
                  <button
                    onClick={() => setShowTaxSheet1(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4">
                  <TaxSheet1 />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}