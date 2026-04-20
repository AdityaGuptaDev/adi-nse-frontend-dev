// components/CANEditPopup.tsx
import { updateInvestorBankDetails, updateInvestorNomineeDetails } from '@/services/bankService';
import api from '@/utils/api';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaEdit, FaSave } from 'react-icons/fa';

interface CANEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  summarydata: any;
  canDetails?: any;
  onUpdatePersonal: (data: any) => Promise<void>;
  onUpdateBank: (data: any) => Promise<void>;
  onUpdateNominee: (data: any) => Promise<void>;
  isLoading?: boolean;
}

interface DisplayData {
  personal: {
    mobile: string;
    email: string;
  };
  bank: {
    account_number: string;
    ifsc_code: string;
    micr_code: string;
    bank_name: string;
    branch_name: string;
    account_type: string;
    cancelled_cheque: string;
    bank_proof: string;
  };
  nominee: {
    name: string;
    dob: string;
    relationship: string;
    identity_type: string;
    identity_number: string;
    mobile: string;
    email: string;
    percentage: string;
    address_line1: string;
    pin_code: string;
    city: string;
    state: string;
    country: string;
    nominee_type: string;
  };
}

const CANEditPopup: React.FC<CANEditPopupProps> = ({ 
  isOpen, 
  onClose, 
  userData, 
  summarydata,
  canDetails,
  onUpdatePersonal,
  onUpdateBank,
  onUpdateNominee,
  isLoading = false
}) => {
  const [displayData, setDisplayData] = useState<DisplayData>({
    personal: {
      mobile: 'Not available',
      email: 'Not available',
    },
    bank: {
      account_number: 'Not available',
      ifsc_code: 'Not available',
      micr_code: 'Not available',
      bank_name: 'Not available',
      branch_name: 'Not available',
      account_type: 'Not available',
      cancelled_cheque: 'Not available',
      bank_proof: 'Not available'
    },
    nominee: {
      name: 'Not available',
      dob: 'Not available',
      relationship: 'Not available',
      identity_type: 'Not available',
      identity_number: 'Not available',
      mobile: 'Not available',
      email: 'Not available',
      percentage: '0',
      address_line1: 'Not available',
      pin_code: 'Not available',
      city: 'Not available',
      state: 'Not available',
      country: 'Not available',
      nominee_type: 'Not available'
    }
  });
  
  const [editingFields, setEditingFields] = useState({
    personal: {
      mobile: false,
      email: false
    },
    bank: false,
    nominee: false
  });
  const [tempData, setTempData] = useState<DisplayData>(displayData);
  const [sectionLoading, setSectionLoading] = useState({
    personal: false,
    bank: false,
    nominee: false
  });
  const [apiMessage, setApiMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (summarydata && isOpen) {
      const bankAccount = summarydata?.BankAccountDetails?.[0] || {};
      const bankMaster = bankAccount?.BankMaster || {};
      const bankProof = bankAccount?.BankProof || {};
      const nominee = summarydata?.NomineeDetails?.[0] || {};
      const nomineeIdentity = nominee?.NomineeIdentity || {};
      const nomineeRelationship = nominee?.NominneeRelationshipType || {};
      const stateMaster = nominee?.StateMaster || {};
      const countryMaster = nominee?.CountryMaster || {};

      const newDisplayData: DisplayData = {
        personal: {
          mobile: summarydata?.reg_mobile || 'Not available',
          email: summarydata?.reg_email || 'Not available',
        },
        bank: {
          account_number: bankAccount?.account_no || 'Not available',
          ifsc_code: bankAccount?.ifsc || 'Not available',
          micr_code: bankAccount?.micr || 'Not available',
          bank_name: bankMaster?.bank_name || 'Not available',
          branch_name: bankAccount?.branch || 'Not available',
          account_type: bankAccount?.account_type === '1' ? 'Savings' : 
                       bankAccount?.account_type === '2' ? 'Current' : 
                       bankAccount?.account_type || 'Not available',
          cancelled_cheque: bankAccount?.cancelled_cheque || 'Not available',
          bank_proof: bankProof?.bank_proof || 'Not available'
        },
        nominee: {
          name: nominee?.nominee_name || 'Not available',
          dob: nominee?.nominee_DOB || 'Not available',
          relationship: nomineeRelationship?.relationship || 'Not available',
          identity_type: nomineeIdentity?.type || 'Not available',
          identity_number: nominee?.identity_number || 'Not available',
          mobile: nominee?.mobile_number || 'Not available',
          email: nominee?.email_address || 'Not available',
          percentage: nominee?.percentage_allocation?.toString() || '0',
          address_line1: nominee?.address_line_1 || 'Not available',
          pin_code: nominee?.pin_code || 'Not available',
          city: nominee?.city || 'Not available',
          state: stateMaster?.name || 'Not available',
          country: countryMaster?.name || 'Not available',
          nominee_type: nominee?.nominee_Type || 'Not available'
        }
      };

      setDisplayData(newDisplayData);
      setTempData(newDisplayData);
    }
  }, [summarydata, isOpen]);

  useEffect(() => {
    if (canDetails && isOpen) {
      const newDisplayData: DisplayData = {
        ...displayData,
        personal: {
          mobile: canDetails.reg_mobile || displayData.personal.mobile,
          email: canDetails.reg_email || displayData.personal.email,
        },
        nominee: {
          name: canDetails.nominee_name || displayData.nominee.name,
          dob: canDetails.nominee_DOB || displayData.nominee.dob,
          relationship: displayData.nominee.relationship,
          identity_type: canDetails.type || displayData.nominee.identity_type,
          identity_number: canDetails.identity_number || displayData.nominee.identity_number,
          mobile: canDetails.mobile_number || displayData.nominee.mobile,
          email: canDetails.email_address || displayData.nominee.email,
          percentage: canDetails.percentage_allocation?.toString() || displayData.nominee.percentage,
          address_line1: canDetails.address_line_1 || displayData.nominee.address_line1,
          pin_code: canDetails.pin_code || displayData.nominee.pin_code,
          city: canDetails.city || displayData.nominee.city,
          state: canDetails.state?.toString() || displayData.nominee.state,
          country: canDetails.country?.toString() || displayData.nominee.country,
          nominee_type: displayData.nominee.nominee_type
        },
        bank: {
          ...displayData.bank,
          account_number: canDetails.account_no || displayData.bank.account_number,
          ifsc_code: canDetails.ifsc || displayData.bank.ifsc_code,
          micr_code: canDetails.micr || displayData.bank.micr_code,
          bank_name: canDetails.bank_name || displayData.bank.bank_name,
          branch_name: canDetails.branch || displayData.bank.branch_name
        }
      };

      setDisplayData(newDisplayData);
      setTempData(newDisplayData);
    }
  }, [canDetails, isOpen]);

  const handleInputChange = (section: keyof DisplayData, field: string, value: string) => {
    setTempData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleEditField = (field: 'mobile' | 'email') => {
    setEditingFields(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: !prev.personal[field]
      }
    }));
  };

  const toggleEditSection = (section: 'bank' | 'nominee') => {
    setEditingFields(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUpdatePersonal = async () => {
    setSectionLoading(prev => ({ ...prev, personal: true }));

    const updatedData = {
      email: tempData.personal.email?.trim() || "",
      mobile: tempData.personal.mobile?.trim() || "",
    };

    try {
      const res = await onUpdatePersonal(updatedData);

      setApiMessage({
        type: "success",
        message: "Email/Mobile updated successfully!",
      });

      setDisplayData(prev => ({
        ...prev,
        personal: updatedData,
      }));

      setEditingFields(prev => ({
        ...prev,
        personal: { mobile: false, email: false },
      }));
    } catch (err) {
      setApiMessage({
        type: "error",
        message: "Failed to update personal details.",
      });
    } finally {
      setSectionLoading(prev => ({ ...prev, personal: false }));
    }
  };

  const handleUpdateBank = async () => {
    setSectionLoading((prev) => ({ ...prev, bank: true }));

    try {
      const investorId = userData?.id;

      const formData = {
        investor_id: investorId,
        request_type: "canModification",
        section_type: "bank",
        bank_name: tempData.bank.bank_name || "",
        branch_name: tempData.bank.branch_name || "",
        ifsc: tempData.bank.ifsc_code || "",
        micr: tempData.bank.micr_code || "",
        account_no: tempData.bank.account_number || "",
        account_type: tempData.bank.account_type || "",
      };

      const response = await updateInvestorBankDetails(formData);

      if (response?.msg) {
        setApiMessage({
          type: "success",
          message: response.msg,
        });

        setDisplayData((prev) => ({
          ...prev,
          bank: tempData.bank,
        }));

        setEditingFields((prev) => ({
          ...prev,
          bank: false,
        }));
      } else {
        throw new Error(response?.msg || "Bank details update failed.");
      }
    } catch (error: any) {
      setApiMessage({
        type: "error",
        message: error?.response?.data?.msg || error?.msg || error?.message || "Failed to update bank details.",
      });
    } finally {
      setSectionLoading((prev) => ({ ...prev, bank: false }));
    }
  };

  const handleUpdateNominee = async () => {
    setSectionLoading((prev) => ({ ...prev, nominee: true }));

    try {
      const investorId = userData?.id;

      if (!investorId) {
        throw new Error("Investor ID missing");
      }

      const formData = {
        investor_id: investorId,
        request_type: "canModification",
        section_type: "nominee",
        nominee_details: [
          {
            name: tempData.nominee.name || "",
            dob: tempData.nominee.dob || "",
            relationship: tempData.nominee.relationship || "",
            identity_type: tempData.nominee.identity_type || "",
            identity_number: tempData.nominee.identity_number || "",
            mobile: tempData.nominee.mobile || "",
            email: tempData.nominee.email || "",
            percentage: tempData.nominee.percentage || "",
            address_line1: tempData.nominee.address_line1 || "",
            pin_code: tempData.nominee.pin_code || "",
            city: tempData.nominee.city || "",
            state: tempData.nominee.state || "",
            country: tempData.nominee.country || "",
            nominee_type: tempData.nominee.nominee_type || "",
          },
        ],
      };

      const response = await updateInvestorNomineeDetails(formData);

      if (response?.msg) {
        setApiMessage({
          type: "success",
          message: response.msg,
        });

        setDisplayData((prev) => ({
          ...prev,
          nominee: tempData.nominee,
        }));

        setEditingFields((prev) => ({
          ...prev,
          nominee: false,
        }));
      } else {
        throw new Error(response?.msg || "Nominee update failed");
      }
    } catch (error: any) {
      setApiMessage({
        type: "error",
        message: error?.response?.data?.msg || error?.msg || error?.message || "Failed to update nominee details.",
      });
    } finally {
      setSectionLoading((prev) => ({ ...prev, nominee: false }));
    }
  };

  const cancelEdit = (section: 'personal' | 'bank' | 'nominee') => {
    if (section === 'personal') {
      setTempData(prev => ({
        ...prev,
        personal: displayData.personal
      }));
      setEditingFields(prev => ({
        ...prev,
        personal: {
          mobile: false,
          email: false
        }
      }));
    } else if (section === 'bank') {
      setTempData(prev => ({
        ...prev,
        bank: displayData.bank
      }));
      setEditingFields(prev => ({
        ...prev,
        bank: false
      }));
    } else if (section === 'nominee') {
      setTempData(prev => ({
        ...prev,
        nominee: displayData.nominee
      }));
      setEditingFields(prev => ({
        ...prev,
        nominee: false
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0A0A] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2A2A2A] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0A0A0A] to-[#111111] border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#B45309]">
                <FaCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#F59E0B]">CAN & Profile Details</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Manage your CAN, personal, bank and nominee information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1F1A1A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all"
              disabled={isLoading}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* API Response Message */}
        {apiMessage && (
          <div className={`mx-6 mt-4 p-4 rounded-xl border ${
            apiMessage.type === 'success' 
              ? 'bg-[#064E3B]/20 border-[#10B981]/30 text-[#10B981]'
              : apiMessage.type === 'error'
              ? 'bg-[#991B1B]/20 border-[#EF4444]/30 text-[#EF4444]'
              : 'bg-[#1E3A8A]/20 border-[#3B82F6]/30 text-[#3B82F6]'
          }`}>
            <div className="flex items-center gap-2">
              {apiMessage.type === 'success' && <FaCheck className="text-[#10B981]" />}
              {apiMessage.type === 'error' && <FaTimes className="text-[#EF4444]" />}
              <span className="font-medium">{apiMessage.message}</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Personal Details Section */}
          <div className="border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#111111]">
            <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#F59E0B]">Personal Details</h3>
              {(editingFields.personal.mobile || editingFields.personal.email) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="px-3 py-1 text-sm bg-[#1F1A1A] text-[#9CA3AF] border border-[#2A2A2A] rounded-lg hover:text-white transition-all"
                    disabled={sectionLoading.personal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePersonal}
                    disabled={sectionLoading.personal}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 flex items-center gap-1 disabled:opacity-50 transition-all"
                  >
                    <FaSave size={12} />
                    {sectionLoading.personal ? 'Updating...' : 'Update'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#F59E0B]">Mobile Number</label>
                  {!editingFields.personal.mobile && (
                    <button
                      onClick={() => toggleEditField('mobile')}
                      className="text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                      disabled={sectionLoading.personal}
                    >
                      <FaEdit size={14} />
                    </button>
                  )}
                </div>
                {editingFields.personal.mobile ? (
                  <input
                    type="text"
                    value={tempData.personal.mobile}
                    onChange={(e) => handleInputChange('personal', 'mobile', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                    disabled={sectionLoading.personal}
                  />
                ) : (
                  <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.personal.mobile}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#F59E0B]">Email Address</label>
                  {!editingFields.personal.email && (
                    <button
                      onClick={() => toggleEditField('email')}
                      className="text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                      disabled={sectionLoading.personal}
                    >
                      <FaEdit size={14} />
                    </button>
                  )}
                </div>
                {editingFields.personal.email ? (
                  <input
                    type="email"
                    value={tempData.personal.email}
                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                    disabled={sectionLoading.personal}
                  />
                ) : (
                  <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.personal.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#111111]">
            <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#F59E0B]">Bank Account</h3>
              <div className="flex gap-2">
                {editingFields.bank ? (
                  <>
                    <button
                      onClick={() => cancelEdit('bank')}
                      className="px-3 py-1 text-sm bg-[#1F1A1A] text-[#9CA3AF] border border-[#2A2A2A] rounded-lg hover:text-white transition-all"
                      disabled={sectionLoading.bank}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateBank}
                      disabled={sectionLoading.bank}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 flex items-center gap-1 disabled:opacity-50 transition-all"
                    >
                      <FaSave size={12} />
                      {sectionLoading.bank ? 'Updating...' : 'Update'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleEditSection('bank')}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 flex items-center gap-1"
                    disabled={sectionLoading.bank}
                  >
                    <FaEdit size={12} />
                    Edit Bank Details
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <div className="bg-[#1F1A1A] border border-[#F59E0B]/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#F59E0B]">Bank Account</span>
                    <span className="text-sm text-[#9CA3AF]">►</span>
                    <span className="text-sm font-medium text-[#F9FAFB]">
                      Account #1 • {displayData.bank.account_type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Account Number</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.account_number}
                        onChange={(e) => handleInputChange('bank', 'account_number', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.account_number}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Account Type</label>
                    {editingFields.bank ? (
                      <select
                        value={tempData.bank.account_type}
                        onChange={(e) => handleInputChange('bank', 'account_type', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      >
                        <option value="Savings" className="bg-[#1F1A1A]">Savings</option>
                        <option value="Current" className="bg-[#1F1A1A]">Current</option>
                      </select>
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.account_type}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Bank Name</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.bank_name}
                        onChange={(e) => handleInputChange('bank', 'bank_name', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.bank_name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Branch</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.branch_name}
                        onChange={(e) => handleInputChange('bank', 'branch_name', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.branch_name}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">IFSC Code</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.ifsc_code}
                        onChange={(e) => handleInputChange('bank', 'ifsc_code', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.ifsc_code}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">MICR Code</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.micr_code}
                        onChange={(e) => handleInputChange('bank', 'micr_code', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.micr_code}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Bank Proof</label>
                    <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">{displayData.bank.bank_proof}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F59E0B] mb-2">Cancelled Cheque</label>
                    <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB]">
                      {displayData.bank.cancelled_cheque !== 'Not available' ? 'Uploaded' : 'Not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nominee Details Section */}
          <div className="border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#111111]">
            <div className="bg-[#1F1A1A] px-4 py-3 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#F59E0B]">Nominee Details</h3>
              <div className="flex gap-2">
                {editingFields.nominee ? (
                  <>
                    <button
                      onClick={() => cancelEdit('nominee')}
                      className="px-3 py-1 text-sm bg-[#1F1A1A] text-[#9CA3AF] border border-[#2A2A2A] rounded-lg hover:text-white transition-all"
                      disabled={sectionLoading.nominee}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateNominee}
                      disabled={sectionLoading.nominee}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 flex items-center gap-1 disabled:opacity-50 transition-all"
                    >
                      <FaSave size={12} />
                      {sectionLoading.nominee ? 'Updating...' : 'Update'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleEditSection('nominee')}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white rounded-lg hover:opacity-90 flex items-center gap-1"
                    disabled={sectionLoading.nominee}
                  >
                    <FaEdit size={12} />
                    Edit Nominee Details
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <div className="bg-[#1F1A1A] border border-[#10B981]/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-lg font-semibold text-[#F9FAFB]">
                      {displayData.nominee.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-lg">{displayData.nominee.nominee_type || 'Major'}</span>
                      <span className="text-[#9CA3AF]">+</span>
                      <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded-lg">
                        {displayData.nominee.percentage}% Allocation
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-md font-semibold text-[#F59E0B] mb-4">Personal Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'name', label: 'Full Name' },
                    { key: 'dob', label: 'Date of Birth' },
                    { key: 'relationship', label: 'Relationship' },
                    { key: 'identity_type', label: 'Identity Type' },
                    { key: 'identity_number', label: 'Identity Number' },
                    { key: 'mobile', label: 'Mobile Number' },
                    { key: 'email', label: 'Email Address' },
                    { key: 'percentage', label: 'Allocation Percentage' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-[#F59E0B] mb-2">{field.label}</label>
                      {editingFields.nominee ? (
                        <input
                          type="text"
                          value={tempData.nominee[field.key as keyof DisplayData['nominee']]}
                          onChange={(e) => handleInputChange('nominee', field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all text-sm"
                          disabled={sectionLoading.nominee}
                        />
                      ) : (
                        <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB] text-sm break-all">
                          {field.key === 'percentage' ? `${displayData.nominee[field.key as keyof DisplayData['nominee']]}%` : displayData.nominee[field.key as keyof DisplayData['nominee']]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h5 className="text-md font-semibold text-[#F59E0B] mb-4">Address Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'address_line1', label: 'Address Line 1', span: 'md:col-span-2' },
                    { key: 'pin_code', label: 'Pin Code', span: '' },
                    { key: 'city', label: 'City', span: '' },
                    { key: 'state', label: 'State', span: '' },
                    { key: 'country', label: 'Country', span: '' }
                  ].map((field) => (
                    <div key={field.key} className={field.span}>
                      <label className="block text-sm font-medium text-[#F59E0B] mb-2">{field.label}</label>
                      {editingFields.nominee ? (
                        <input
                          type="text"
                          value={tempData.nominee[field.key as keyof DisplayData['nominee']]}
                          onChange={(e) => handleInputChange('nominee', field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#F59E0B] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all text-sm"
                          disabled={sectionLoading.nominee}
                        />
                      ) : (
                        <div className="p-2 bg-[#1F1A1A] rounded-lg border border-[#2A2A2A] text-[#F9FAFB] text-sm break-all">{displayData.nominee[field.key as keyof DisplayData['nominee']]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-[#2A2A2A] px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CANEditPopup;