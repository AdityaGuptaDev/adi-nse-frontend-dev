import React, { useState, useEffect } from "react";
import RiskSuitability from './risk-suitability';
import { getPortfolioDetails } from '@/services/clientService';
import { useSearchParams } from 'next/navigation';
import router from "next/router";
import { ArrowLeft } from "lucide-react";

interface ClientData {
    sch_name: string;
    folio_date: string | number | Date;
    foliochk: string;
    inv_name: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    pincode: string;
    email: string;
    phone_off: string;
    phone_res: string;
    inv_dob: string;
    mobile_no: string;
    pan_no: string;
    gender?: string;
}

interface VedantAssetProps {
   onBack: () => void;
  clientData: {
    name: string;
    pan: string;
}}

export default function VedantAssetPage({ onBack }: VedantAssetProps) {
    const [finYear, setFinYear] = useState('2025 - 2026');
    const [targets, setTargets] = useState('- All Targets -');
    const [showRiskSuitability, setShowRiskSuitability] = useState(false);
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    useEffect(() => {
        const fetchClientData = async () => {
            const name = searchParams.get('name');
            const pan = searchParams.get('pan');

            if (name && pan) {
                try {
                    const apiData = await getPortfolioDetails({
                        inv_name: name,
                        pan_no: pan
                    });

                    // Assuming we get an array but only need the first client
                    if (apiData.length > 0) {
                        setClientData(apiData[0]);
                    }
                } catch (err) {
                    setError("Failed to fetch client data");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Missing required query parameters");
                setLoading(false);
            }
        };

        fetchClientData();
    }, [searchParams]);

    if (showRiskSuitability) {
        return (
            <RiskSuitability
                onClose={() => setShowRiskSuitability(false)}
                onCreateTarget={(targetType) => {
                    // Handle target creation if needed
                    setShowRiskSuitability(false);
                }}
                onSelectNow={() => {
                    // Handle select now action
                    setShowRiskSuitability(false);
                }}
            />
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 flex items-center justify-center">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!clientData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 flex items-center justify-center">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 max-w-md">
                    <p>No client data found</p>
                </div>
            </div>
        );
    }

    // Format date of birth if available
    const formattedDob = clientData.inv_dob
        ? new Date(clientData.inv_dob).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        : 'Not specified';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden">
                <button
                    onClick={handleBack}
                    className="flex items-center bg-indigo-300 text-white hover:bg-indigo-400 transition-colors px-4 py-2 rounded"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white relative overflow-hidden">

                    <div className="absolute inset-0 bg-black opacity-5"></div>
                    <div className="relative flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-orange-400 drop-shadow-md">Vedant</span>
                                <span className="text-white ml-1">Asset</span>
                            </h1>
                            <div className="mt-1 text-slate-300 text-xs font-medium">Financial Advisory Services</div>
                        </div>
                        <div className="text-right text-xs leading-relaxed text-slate-300 bg-white/10 backdrop-blur-sm rounded-md p-3 max-w-sm">
                            <div className="font-semibold text-white mb-2 text-sm">Contact Information</div>
                            <p className="mb-1">3rd Floor, Gayways House, Above Space Furniture</p>
                            <p className="mb-1">P.P Compound, Main Road Ranchi 834001 Jharkhand</p>
                            <div className="flex flex-col gap-1 mt-2 text-xs">
                                <p><span className="font-medium">Phone:</span> 9304955509</p>
                                <p><span className="font-medium">Email:</span> vedantasset@gmail.com</p>
                                <p><span className="font-medium">Website:</span>
                                    <a href="https://www.vedantasset.co.in" className="text-orange-300 hover:text-orange-200 hover:underline ml-1 transition-colors">
                                        www.vedantasset.co.in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Information Section */}
                <div className="p-5 bg-slate-50">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Client Information</h2>
                        <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-5">
                        {/* Left Column - Personal Details */}
                        <div className="col-span-3">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 h-full">
                                <h3 className="font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 text-sm">Personal Details</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600 text-xs mb-1">Name</span>
                                        <span className="text-slate-800 font-medium text-sm">{clientData.inv_name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600 text-xs mb-1">Gender</span>
                                        <span className="text-slate-500 text-xs">{clientData.gender || 'Not specified'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600 text-xs mb-1">Date of Birth</span>
                                        <span className="text-slate-800 text-sm">{formattedDob}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600 text-xs mb-1">Mobile</span>
                                        <span className="text-slate-800 font-mono text-sm">+91 {clientData.mobile_no}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Address */}
                        <div className="col-span-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 h-full">
                                <h3 className="font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 text-sm">Address Information</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600 text-xs mb-2">Residential Address</span>
                                        <div className="text-slate-800 leading-relaxed text-sm">
                                            <div className="mb-1">{clientData.address1}</div>
                                            {clientData.address2 && <div className="mb-1">{clientData.address2}</div>}
                                            {clientData.address3 && <div className="mb-1">{clientData.address3}</div>}
                                            <div className="font-medium">{clientData.city}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-600 text-xs mb-1">City</span>
                                            <span className="text-slate-800 text-sm">{clientData.city}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-600 text-xs mb-1">Pincode</span>
                                            <span className="text-slate-800 font-mono text-sm">{clientData.pincode}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-600 text-xs mb-1">Phone (Res)</span>
                                            <span className="text-slate-500 text-xs">
                                                {clientData.phone_res || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-600 text-xs mb-1">Phone (Off)</span>
                                            <span className="text-slate-500 text-xs">
                                                {clientData.phone_off || 'Not provided'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Financial Settings */}
                        <div className="col-span-5">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 h-full">
                                <h3 className="font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 text-sm">Financial Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-medium text-slate-700 block mb-2 text-sm">Financial Year</label>
                                        <select
                                            value={finYear}
                                            onChange={(e) => setFinYear(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                                        >
                                            <option>2025 - 2026</option>
                                            <option>2024 - 2025</option>
                                            <option>2023 - 2024</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-medium text-slate-700 block mb-1 text-sm">Investment Targets</label>
                                        <div className="text-xs text-slate-500 mb-2">Including targets of all family members</div>
                                        <select
                                            value={targets}
                                            onChange={(e) => setTargets(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                                        >
                                            <option>- All Targets -</option>
                                            <option>Individual Targets</option>
                                            <option>Family Targets</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Box */}
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 min-h-48">
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-2">No Active Targets Found</h2>
                                <p className="text-slate-600 mb-4 text-sm">
                                    Sorry, no targets found active during the Financial Year <span className="font-medium text-slate-800">[{finYear}]</span>
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto">
                                <h3 className="font-medium text-slate-700 mb-3 text-sm">What would you like to do?</h3>
                                <ul className="text-left space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-slate-600 font-bold mr-3">•</span>
                                        <span className="text-slate-700 text-sm">Select a different Financial Year from the dropdown above</span>
                                    </li>
                                    <li className="flex items-center justify-center my-2">
                                        <span className="text-slate-400 text-xs">— or —</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 font-bold mr-3">•</span>
                                        <button
                                            onClick={() => setShowRiskSuitability(true)}
                                            className="text-blue-700 hover:text-slate-900 font-medium hover:underline transition-colors text-sm"
                                        >
                                            Create a New Target
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}