// components/AccountHoldingCard.tsx (Enhanced with more details)

import CustomText from '@/commonUI/Text';
import React, { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { User, Shield, CreditCard, BadgeCheck, ChevronRight, Calendar, Mail, Phone } from 'lucide-react';

type AccountHoldingCardProps = {
    item: any;
    mandates: number;
    onEdit: () => void;
    onLinkedMandatesClick: () => void;
};

const AccountHoldingCard: React.FC<AccountHoldingCardProps> = ({ item, mandates, onEdit, onLinkedMandatesClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group relative overflow-hidden bg-[#111111] rounded-xl shadow-lg border border-[#2A2A2A] hover:border-[#F59E0B] hover:shadow-xl transition-all duration-300">
            {/* Animated Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#B45309] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"></div>
            
            <div className="relative p-0 pb-16">
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-r from-[#1F1A1A] to-[#111111] p-4 rounded-t-xl border-b border-[#2A2A2A]">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#F59E0B]/20 rounded-lg group-hover:bg-[#F59E0B]/30 transition-all duration-300">
                                <User className="w-5 h-5 text-[#F59E0B]" />
                            </div>
                            <div>
                                <CustomText className='font-montserrat text-lg font-semibold text-[#F9FAFB]'>
                                    Applicants
                                </CustomText>
                                <CustomText className='text-xs text-[#9CA3AF] block'>
                                    Primary holder details
                                </CustomText>
                            </div>
                        </div>
                        <div className='flex justify-start gap-2'>
                            <span className="px-3 py-1.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded-lg text-xs font-medium border border-[#F59E0B]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse"></span>
                                Single
                            </span>
                            <span className="px-3 py-1.5 bg-[#10B981]/20 text-[#10B981] rounded-lg text-xs font-medium border border-[#10B981]/30 flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Section - Applicant Details */}
                <div className='mt-2 flex flex-col gap-3 p-4'>
                    <div 
                        className='flex gap-4 items-start p-4 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] hover:border-[#F59E0B]/50 transition-all duration-200 cursor-pointer'
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className='flex-shrink-0'>
                            <span className='inline-flex items-center justify-center w-10 h-10 text-sm bg-gradient-to-br from-[#F59E0B] to-[#B45309] text-white rounded-xl font-bold shadow-lg'>
                                1
                            </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between flex-wrap gap-2'>
                                <CustomText className='text-base font-semibold text-[#F9FAFB]'>
                                    {item?.name || 'N/A'}
                                </CustomText>
                                <ChevronRight className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                            
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2'>
                                <div className='flex items-center gap-2'>
                                    <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
                                    <CustomText className='text-xs text-[#9CA3AF]'>
                                        PAN: <span className='text-[#F9FAFB] font-mono'>{item?.pan_no || 'N/A'}</span>
                                    </CustomText>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" />
                                    <CustomText className='text-xs text-[#9CA3AF]'>
                                        CAN: <span className='text-[#F9FAFB] font-mono'>{item?.CAN_Id || 'N/A'}</span>
                                    </CustomText>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className='mt-3 pt-3 border-t border-[#2A2A2A] space-y-2 animate-fadeIn'>
                                    {item?.email && (
                                        <div className='flex items-center gap-2'>
                                            <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                            <CustomText className='text-xs text-[#9CA3AF]'>
                                                Email: <span className='text-[#F9FAFB]'>{item.email}</span>
                                            </CustomText>
                                        </div>
                                    )}
                                    {item?.mobile && (
                                        <div className='flex items-center gap-2'>
                                            <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                            <CustomText className='text-xs text-[#9CA3AF]'>
                                                Mobile: <span className='text-[#F9FAFB]'>{item.mobile}</span>
                                            </CustomText>
                                        </div>
                                    )}
                                    {item?.dob && (
                                        <div className='flex items-center gap-2'>
                                            <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                            <CustomText className='text-xs text-[#9CA3AF]'>
                                                DOB: <span className='text-[#F9FAFB]'>{item.dob}</span>
                                            </CustomText>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Section - Actions */}
                <div className='absolute bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-t from-[#111111] via-[#111111] to-transparent border-t border-[#2A2A2A]'>
                    <button 
                        className='cursor-pointer flex flex-row justify-center items-center gap-2 group/mandate transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-[#1F1A1A]'
                        onClick={onLinkedMandatesClick}
                    >
                        <CustomText className="text-sm font-semibold text-[#F59E0B] hover:text-[#FBBF24] transition-colors">
                            Linked Mandates
                        </CustomText>
                        <div className='relative'>
                            <span className='inline-flex items-center justify-center min-w-[32px] h-7 px-2.5 bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white text-xs font-bold rounded-full shadow-md group-hover/mandate:shadow-lg transition-all duration-200'>
                                {mandates}
                            </span>
                            {mandates > 0 && (
                                <>
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-40"></span>
                                    </span>
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-20"></span>
                                    </span>
                                </>
                            )}
                        </div>
                    </button>
                    
                    <button 
                        className='cursor-pointer p-2 rounded-lg bg-[#1F1A1A] hover:bg-[#2A2A2A] transition-all duration-200 group/edit border border-[#2A2A2A] hover:border-[#F59E0B]'
                        onClick={onEdit}
                        aria-label="Edit applicant details"
                    >
                        <CiEdit 
                            size={20} 
                            className="text-[#F59E0B] group-hover/edit:text-[#FBBF24] transition-colors" 
                        />
                    </button>
                </div>
            </div>

            {/* Add animation keyframes if needed */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AccountHoldingCard;