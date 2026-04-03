// components/AccountHoldingCard.tsx

import CustomText from '@/commonUI/Text';
import React from 'react';
import { CiEdit } from 'react-icons/ci';

type AccountHoldingCardProps = {
    item: any;
    mandates: number;
    onEdit: () => void;
    onLinkedMandatesClick: () => void;
};

const AccountHoldingCard: React.FC<AccountHoldingCardProps> = ({ item, mandates, onEdit, onLinkedMandatesClick }) => {
    return (
        <div className="card card-border border-accent bg-base-100 hover:shadow-xl">
            <div className="card-body p-0 pb-14">
                <div className="text-start grid grid-cols-1 items-start gap-4">
                    <div className="text-start flex justify-between items-center gap-4 bg-gray-50 p-4 py-3 rounded-lg">
                        <div>
                            <CustomText className='font-montserrat text-lg font-semibold'>Applicants</CustomText>
                        </div>
                        <div className='flex justify-start gap-2 mt-0'>
                            <span className="badge bg-primary/20 text-primary rounded-sm">Single</span>
                            <span className="badge bg-success/10 text-success rounded-sm">Active</span>
                        </div>
                    </div>

                    <div className='mt-0 flex flex-col gap-4 p-4 py-2'>
                        <div className='flex gap-4'>
                            <div>
                                <span className='p-1.5 text-xs bg-accent/10 rounded-lg font-semibold'>1</span>
                            </div>
                            <div>
                                <CustomText className='text-sm'>{item?.name}</CustomText>
                                <CustomText className='text-xs opacity-60'>{item?.pan_no}</CustomText>
                                <CustomText className='text-xs opacity-60'>{item?.CAN_Id}</CustomText>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-between gap-4 p-4 absolute bottom-0 left-0 right-0'>
                        <div className='cursor-pointer flex flex-row justify-center items-center gap-2' onClick={onLinkedMandatesClick}>
                            <CustomText className="link link-primary">Linked Mandates</CustomText>
                            <div>
                                <span className='p-1 px-2 bg-accent rounded-full'>{mandates}</span>
                            </div>
                        </div>
                        <div className='cursor-pointer' onClick={onEdit}>
                            <CiEdit size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountHoldingCard;
