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
            <div className="min-h-screen bg-[#0A0A0A] p-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] p-3 flex items-center justify-center">
                <div className="bg-[#1F1A1A] border-l-4 border-[#EF4444] text-[#EF4444] p-4 max-w-md">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!clientData) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] p-3 flex items-center justify-center">
                <div className="bg-[#1F1A1A] border-l-4 border-[#F59E0B] text-[#F59E0B] p-4 max-w-md">
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
        <div className="min-h-screen bg-[#0A0A0A] p-3">
            <div className="max-w-6xl mx-auto bg-[#111111] shadow-lg rounded-lg border border-[#2A2A2A] overflow-hidden">
                <button
                    onClick={handleBack}
                    className="flex items-center bg-[#F59E0B] text-white hover:bg-[#B45309] transition-colors px-4 py-2 rounded"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1F1A1A] to-[#111111] px-6 py-4 text-white relative overflow-hidden">

                    <div className="absolute inset-0 bg-black opacity-5"></div>
                    <div className="relative flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-[#F59E0B] drop-shadow-md">Vedant</span>
                                <span className="text-white ml-1">Asset</span>
                            </h1>
                            <div className="mt-1 text-[#9CA3AF] text-xs font-medium">Financial Advisory Services</div>
                        </div>
                        <div className="text-right text-xs leading-relaxed text-[#9CA3AF] bg-white/10 backdrop-blur-sm rounded-md p-3 max-w-sm">
                            <div className="font-semibold text-white mb-2 text-sm">Contact Information</div>
                            <p className="mb-1">3rd Floor, Gayways House, Above Space Furniture</p>
                            <p className="mb-1">P.P Compound, Main Road Ranchi 834001 Jharkhand</p>
                            <div className="flex flex-col gap-1 mt-2 text-xs">
                                <p><span className="font-medium">Phone:</span> 9304955509</p>
                                <p><span className="font-medium">Email:</span> vedantasset@gmail.com</p>
                                <p><span className="font-medium">Website:</span>
                                    <a href="https://www.vedantasset.co.in" className="text-[#F59E0B] hover:text-[#FBBF24] hover:underline ml-1 transition-colors">
                        www.vedantasset.co.in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Information Section */}
                <div className="p-5 bg-[#0A0A0A]">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-[#F59E0B] mb-1">Client Information</h2>
                        <div className="w-16 h-1 bg-[#F59E0B] rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-5">
                        {/* Left Column - Personal Details */}
                        <div className="col-span-3">
                            <div className="bg-[#111111] rounded-lg p-4 shadow-sm border border-[#2A2A2A] h-full">
                                <h3 className="font-semibold text-[#F59E0B] mb-3 pb-2 border-b border-[#2A2A2A] text-sm">Personal Details</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#9CA3AF] text-xs mb-1">Name</span>
                                        <span className="text-[#F9FAFB] font-medium text-sm">{clientData.inv_name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#9CA3AF] text-xs mb-1">Gender</span>
                                        <span className="text-[#9CA3AF] text-xs">{clientData.gender || 'Not specified'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#9CA3AF] text-xs mb-1">Date of Birth</span>
                                        <span className="text-[#F9FAFB] text-sm">{formattedDob}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#9CA3AF] text-xs mb-1">Mobile</span>
                                        <span className="text-[#F9FAFB] font-mono text-sm">+91 {clientData.mobile_no}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Address */}
                        <div className="col-span-4">
                            <div className="bg-[#111111] rounded-lg p-4 shadow-sm border border-[#2A2A2A] h-full">
                                <h3 className="font-semibold text-[#F59E0B] mb-3 pb-2 border-b border-[#2A2A2A] text-sm">Address Information</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#9CA3AF] text-xs mb-2">Residential Address</span>
                                        <div className="text-[#F9FAFB] leading-relaxed text-sm">
                                            <div className="mb-1">{clientData.address1}</div>
                                            {clientData.address2 && <div className="mb-1">{clientData.address2}</div>}
                                            {clientData.address3 && <div className="mb-1">{clientData.address3}</div>}
                                            <div className="font-medium">{clientData.city}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#9CA3AF] text-xs mb-1">City</span>
                                            <span className="text-[#F9FAFB] text-sm">{clientData.city}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#9CA3AF] text-xs mb-1">Pincode</span>
                                            <span className="text-[#F9FAFB] font-mono text-sm">{clientData.pincode}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#9CA3AF] text-xs mb-1">Phone (Res)</span>
                                            <span className="text-[#9CA3AF] text-xs">
                                                {clientData.phone_res || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#9CA3AF] text-xs mb-1">Phone (Off)</span>
                                            <span className="text-[#9CA3AF] text-xs">
                                                {clientData.phone_off || 'Not provided'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Financial Settings */}
                        <div className="col-span-5">
                            <div className="bg-[#111111] rounded-lg p-4 shadow-sm border border-[#2A2A2A] h-full">
                                <h3 className="font-semibold text-[#F59E0B] mb-3 pb-2 border-b border-[#2A2A2A] text-sm">Financial Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-medium text-[#F9FAFB] block mb-2 text-sm">Financial Year</label>
                                        <select
                                            value={finYear}
                                            onChange={(e) => setFinYear(e.target.value)}
                                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#F9FAFB] bg-[#1F1A1A] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all text-sm"
                                        >
                                            <option>2025 - 2026</option>
                                            <option>2024 - 2025</option>
                                            <option>2023 - 2024</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-medium text-[#F9FAFB] block mb-1 text-sm">Investment Targets</label>
                                        <div className="text-xs text-[#9CA3AF] mb-2">Including targets of all family members</div>
                                        <select
                                            value={targets}
                                            onChange={(e) => setTargets(e.target.value)}
                                            className="w-full border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#F9FAFB] bg-[#1F1A1A] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all text-sm"
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
                    <div className="bg-[#111111] rounded-lg p-5 shadow-sm border border-slate-200 min-h-48">
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="w-12 h-12 bg-[#1F1A1A] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-[#F9FAFB] mb-2">No Active Targets Found</h2>
                                <p className="text-[#F59E0B] mb-4 text-sm">
                                    Sorry, no targets found active during the Financial Year <span className="font-medium text-[#F9FAFB]">[{finYear}]</span>
                                </p>
                            </div>

                            <div className="bg-[#111111] rounded-lg p-4 max-w-sm mx-auto">
                                <h3 className="font-medium text-[#F9FAFB] mb-3 text-sm">What would you like to do?</h3>
                                <ul className="text-left space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-[#F59E0B] font-bold mr-3">•</span>
                                        <span className="text-[#F9FAFB] text-sm">Select a different Financial Year from the dropdown above</span>
                                    </li>
                                    <li className="flex items-center justify-center my-2">
                                        <span className="text-[#9CA3AF] text-xs">— or —</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[#F59E0B] font-bold mr-3">•</span>
                                        <button
                                            onClick={() => setShowRiskSuitability(true)}
                                            className="text-[#F59E0B] hover:text-[#FBBF24] font-medium hover:underline transition-colors text-sm"
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
