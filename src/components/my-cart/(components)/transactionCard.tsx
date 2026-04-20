import React from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import { Edit2, Trash2, Tag, FileText, Calendar, DollarSign } from 'lucide-react';

export type TransactionType =
    | "Lumpsum"
    | "SIP"
    | "STP"
    | "SWP"
    | "Switch"
    | "Redeem";

interface Props {
    type: TransactionType | string;
    scheme: string;
    folio: string;
    amount: number;
    details?: Record<string, string>;
    isNew?: boolean;
    isAdd?: boolean;
    editable?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function TransactionCard({
    type,
    scheme,
    folio,
    amount,
    details = {},
    isNew,
    isAdd,
    editable = false,
    onEdit,
    onDelete,
}: Props) {

    // Define keys to control layout
    const paragraphKeys = ["category", "subcategory"];
    const flexColumnKeys = ["frequency", "day", "start_month", "start_year"];
    const Frequencies = [
        { code: "D", description: "Daily" },
        { code: "M", description: "Monthly" },
        { code: "Q", description: "Quarterly" },
        { code: "Y", description: "Yearly" },
    ]

    // Helper function to format key names
    const formatKeyName = (key: string) => {
        return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();
    };

    return (
        <div className="group mt-1 relative rounded-xl border border-[#2A2A2A] p-4 bg-[#111111] hover:bg-[#1F1A1A] hover:border-[#F59E0B]/50 transition-all duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                    {/* Scheme Name and Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {isNew && (
                            <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] font-semibold px-2 py-1 rounded-lg border border-[#F59E0B]/30">
                                New
                            </span>
                        )}
                        {isAdd && (
                            <span className="text-xs bg-[#10B981]/20 text-[#10B981] font-semibold px-2 py-1 rounded-lg border border-[#10B981]/30">
                                Add
                            </span>
                        )}
                        <span className="text-white font-semibold text-base">{scheme}</span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column - Basic Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* Folio */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                    <span className="text-xs text-white/50 font-medium">Folio</span>
                                </div>
                                <p className="text-sm text-white/90 font-mono">{folio}</p>
                            </div>

                            {/* Type */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                    <span className="text-xs text-white/50 font-medium">Type</span>
                                </div>
                                <p className={`text-sm font-semibold ${
                                    type === "Lumpsum" ? "text-[#F59E0B]" :
                                    type === "SIP" ? "text-[#10B981]" :
                                    type === "STP" ? "text-[#6366F1]" :
                                    "text-white/90"
                                }`}>{type}</p>
                            </div>

                            {/* Category & Subcategory */}
                            {Object.entries(details)
                                .filter(([key]) => paragraphKeys.includes(key))
                                .map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                            <span className="text-xs text-white/50 font-medium capitalize">
                                                {formatKeyName(key)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/90 capitalize">{value || "-"}</p>
                                    </div>
                                ))}
                        </div>

                        {/* Right Column - SIP Specific Details */}
                        {type === 'SIP' && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(details)
                                    .filter(([key]) => flexColumnKeys.includes(key))
                                    .map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                                <span className="text-xs text-white/50 font-medium capitalize">
                                                    {formatKeyName(key)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/90">
                                                {key === "frequency" 
                                                    ? (Frequencies.find(opt => opt.code === value)?.description || value || "-")
                                                    : (value || "-")
                                                }
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex flex-col items-end justify-between min-w-[120px]">
                    <div className="text-right">
                        <span className="text-xs text-white/50">Amount</span>
                        <p className="text-xl font-bold text-[#F59E0B]">
                            ₹{amount.toLocaleString('en-IN')}
                        </p>
                    </div>
                    
                    {editable && (
                        <div className="flex gap-2 mt-3 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                                onClick={onEdit}
                                className="p-1.5 rounded-lg bg-[#1F1A1A] hover:bg-[#2A2A2A] transition-colors group/edit"
                                title="Edit"
                            >
                                <FaPen className="w-3.5 h-3.5 text-[#9CA3AF] group-hover/edit:text-[#F59E0B] transition-colors" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-1.5 rounded-lg bg-[#1F1A1A] hover:bg-[#EF4444]/20 transition-colors group/delete"
                                title="Delete"
                            >
                                <FaTrash className="w-3.5 h-3.5 text-[#9CA3AF] group-hover/delete:text-[#EF4444] transition-colors" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}