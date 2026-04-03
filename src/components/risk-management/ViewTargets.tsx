"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getPortfolioDetails } from "@/services/clientService";

interface ClientData {
  name: string;
  pan: string;
  address: string;
  city: string;
  pincode: string;
  phoneRes: string;
  phoneOff: string;
  mobile: string;
  dob: string;
  email: string;
}

interface ViewTargetsProps {
  onBack: () => void;
  clientData?: {
    name: string;
    pan: string;
  };
}

export default function ViewTargets({ onBack, clientData }: ViewTargetsProps) {
  const [financialYear, setFinancialYear] = useState("2025 - 2026");
  const [clientDetails, setClientDetails] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientData?.pan || !clientData?.name) return;
      
      try {
        setLoading(true);
        const data = await getPortfolioDetails({
          pan_no: clientData.pan,
          inv_name: clientData.name
        });
        
        if (data && data.length > 0) {
          const client = data[0];
          setClientDetails({
            name: client.inv_name,
            pan: client.pan_no,
            address: `${client.address1} ${client.address2} ${client.address3}`.trim(),
            city: client.city,
            pincode: client.pincode,
            phoneRes: client.phone_res,
            phoneOff: client.phone_off,
            mobile: client.mobile_no,
            dob: client.inv_dob ? new Date(client.inv_dob).toLocaleDateString('en-IN') : "-",
            email: client.email
          });
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch client details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientData]);

  const handleBack = () => {
    onBack ? onBack() : router.back();
  };

  const financialYearOptions = [
    "2025 - 2026",
    "2024 - 2025",
    "2023 - 2024"
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <button 
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-1" size={20} />
          Back
        </button>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading client details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white border-b-2 border-gray-200 p-6 mb-4">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-bold text-orange-600">
                  Vedant<span className="text-black">Asset</span>
                </div>
                <div className="text-right text-sm text-gray-700 leading-relaxed">
                  <p className="font-semibold text-base mb-1">vedant asset</p>
                  <p>3rd Floor, Gayways House, Above Space Furniture, P.P Compound,</p>
                  <p>Main Road Ranchi 834001 Jharkhand</p>
                  <p>Phone: 9304955509, Email: vedantasset@gmail.com</p>
                  <p>Website: <a href="https://www.vedantasset.co.in" className="text-blue-600 hover:underline">www.vedantasset.co.in</a></p>
                </div>
              </div>
            </div>

            {/* Client Information Grid */}
            {clientDetails && (
              <div className="bg-white border border-gray-200 p-6 mb-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  <div><span className="font-semibold">Name:</span> {clientDetails.name}</div>
                  <div><span className="font-semibold">Address:</span> {clientDetails.address}</div>
                  <div>
                    <span className="font-semibold">Fin. Year:</span> 
                    <select
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                      className="ml-2 border border-gray-300 px-2 py-1 text-sm rounded"
                    >
                      {financialYearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div><span className="font-semibold">Gender:</span> -</div>
                  <div><span className="font-semibold">City:</span> {clientDetails.city}</div>
                  <div>
                    <span className="font-semibold">Targets:</span>
                    <select className="ml-2 border border-gray-300 px-2 py-1 text-sm rounded">
                      <option>- All Targets -</option>
                    </select>
                  </div>
                  
                  <div><span className="font-semibold">Phone (Res):</span> {clientDetails.phoneRes || '-'}</div>
                  <div><span className="font-semibold">Pincode:</span> {clientDetails.pincode}</div>
                  <div className="text-sm text-gray-600">(including the targets of all family members)</div>
                  
                  <div><span className="font-semibold">Phone (Off):</span> {clientDetails.phoneOff || '-'}</div>
                  <div><span className="font-semibold">State:</span> Jharkhand</div>
                  <div></div>
                  
                  <div><span className="font-semibold">Mobile:</span> {clientDetails.mobile}</div>
                  <div><span className="font-semibold">DOB:</span> {clientDetails.dob}</div>
                  <div></div>
                  
                  <div><span className="font-semibold">Email:</span> {clientDetails.email}</div>
                  <div><span className="font-semibold">PAN:</span> {clientDetails.pan}</div>
                  <div></div>
                </div>
              </div>
            )}

            {/* Targets Section */}
            <div className="bg-white border border-gray-200 p-8">
              <div className="text-center">
                <p className="text-gray-700 mb-6 text-base">
                  Sorry, No targets found active during the Financial Year <span className="font-semibold">[{financialYear}]</span>
                </p>
                
                <div className="space-y-2">
                  <div className="text-blue-600">
                    • <button 
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={() => setFinancialYear(financialYearOptions.find(y => y !== financialYear) || financialYear)}
                      >
                        Select a different Financial Year
                      </button>
                  </div>
                  <div className="text-blue-600">
                    • <button 
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={() => alert("Create a New Target")}
                      >
                        Create a New Target
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}