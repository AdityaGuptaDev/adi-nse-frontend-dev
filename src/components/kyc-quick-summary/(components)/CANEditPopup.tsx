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
  canDetails?: any; // Add this prop
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
  canDetails, // Add this to destructuring
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

  // Clear message when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setApiMessage(null);
    }
  }, [isOpen]);

  // First useEffect - Load data from summarydata
  useEffect(() => {
    if (summarydata && isOpen) {
      // Extract bank details from BankAccountDetails array
      const bankAccount = summarydata?.BankAccountDetails?.[0] || {};
      const bankMaster = bankAccount?.BankMaster || {};
      const bankProof = bankAccount?.BankProof || {};

      // Extract nominee details from NomineeDetails array
      const nominee = summarydata?.NomineeDetails?.[0] || {};
      const nomineeIdentity = nominee?.NomineeIdentity || {};
      const nomineeRelationship = nominee?.NominneeRelationshipType || {};
      const stateMaster = nominee?.StateMaster || {};
      const countryMaster = nominee?.CountryMaster || {};

      // Get gender and marital status from their respective objects
      const gender = summarydata?.Gender?.gender || 'Not available';
      const maritalStatus = summarydata?.MaritalStatus?.status || 'Not available';

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

  // Second useEffect - Populate data from canDetails when available
  useEffect(() => {
    if (canDetails && isOpen) {
      // Populate nominee details from CAN data
      const newDisplayData: DisplayData = {
        ...displayData,
        personal:{
mobile:canDetails.reg_mobile || displayData.personal.mobile,
email:canDetails.reg_email || displayData.personal.email,
        },
        nominee: {
          name: canDetails.nominee_name || displayData.nominee.name,
          dob: canDetails.nominee_DOB || displayData.nominee.dob,
          relationship: displayData.nominee.relationship, // Keep existing if not in CAN
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
          nominee_type: displayData.nominee.nominee_type // Keep existing
        },
        // You can also populate bank details if needed
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

  console.log(" Sending updated personal data to parent:", updatedData);

  try {
    const res = await onUpdatePersonal(updatedData);
    console.log(" Response from parent:", res);

    setApiMessage({
      type: "success",
      message: "Email/Mobile updated successfully!",
    });

    // update displayed data locally
    setDisplayData(prev => ({
      ...prev,
      personal: updatedData,
    }));

    setEditingFields(prev => ({
      ...prev,
      personal: { mobile: false, email: false },
    }));
  } catch (err) {
    console.error(" Error updating personal:", err);
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

    console.log("Sending CAN modification bank update:", formData);

    const response = await updateInvestorBankDetails(formData);
    console.log(" CAN Bank Update Response:", response);

    //  Use 'msg' from API response
    if (response?.msg) {
      setApiMessage({
        type: "success",
        message: response.msg,
      });

      // Update displayed data in UI
      setDisplayData((prev) => ({
        ...prev,
        bank: tempData.bank,
      }));

      // Close edit mode
      setEditingFields((prev) => ({
        ...prev,
        bank: false,
      }));
    } else {
      throw new Error(response?.msg || "Bank details update failed.");
    }
  } catch (error: any) {
    console.error(" CAN modification bank update failed:", error);
    setApiMessage({
      type: "error",
      message:
        error?.response?.data?.msg ||
        error?.msg ||
        error?.message ||
        "Failed to update bank details.",
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

    // 🧩 Prepare request body (same pattern as bank update)
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

    console.log("📤 Sending nominee update request:", formData);

    const response = await updateInvestorNomineeDetails(formData);
    console.log("✅ Nominee update response:", response);

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
    console.error("❌ Nominee update failed:", error);
    setApiMessage({
      type: "error",
      message:
        error?.response?.data?.msg ||
        error?.msg ||
        error?.message ||
        "Failed to update nominee details.",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">CAN Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

{/* API Response Message */}
        {apiMessage && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border ${
            apiMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : apiMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {apiMessage.type === 'success' && (
                <FaCheck className="mr-2 text-green-600" />
              )}
              {apiMessage.type === 'error' && (
                <FaTimes className="mr-2 text-red-600" />
              )}
              <span className="font-medium">{apiMessage.message}</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Personal Details Section */}
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
              {(editingFields.personal.mobile || editingFields.personal.email) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={sectionLoading.personal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePersonal}
                    disabled={sectionLoading.personal}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaSave size={12} />
                    {sectionLoading.personal ? 'Updating...' : 'Update'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            

              {/* Mobile - Editable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <button
                    onClick={() => toggleEditField('mobile')}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    disabled={sectionLoading.personal}
                  >
                    <FaEdit size={14} />
                  </button>
                </div>
                {editingFields.personal.mobile ? (
                  <input
                    type="text"
                    value={tempData.personal.mobile}
                    onChange={(e) => handleInputChange('personal', 'mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sectionLoading.personal}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.personal.mobile}</div>
                )}
              </div>

              {/* Email - Editable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <button
                    onClick={() => toggleEditField('email')}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    disabled={sectionLoading.personal}
                  >
                    <FaEdit size={14} />
                  </button>
                </div>
                {editingFields.personal.email ? (
                  <input
                    type="email"
                    value={tempData.personal.email}
                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sectionLoading.personal}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.personal.email}</div>
                )}
              </div>

             
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Bank Account</h3>
              <div className="flex gap-2">
                {editingFields.bank ? (
                  <>
                    <button
                      onClick={() => cancelEdit('bank')}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={sectionLoading.bank}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateBank}
                      disabled={sectionLoading.bank}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <FaSave size={12} />
                      {sectionLoading.bank ? 'Updating...' : 'Update'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleEditSection('bank')}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 flex items-center gap-1"
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Bank Account</span>
                    <span className="text-sm text-gray-600">►</span>
                    <span className="text-sm font-medium text-blue-600">
                      Account #1 • {displayData.bank.account_type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.account_number}
                        onChange={(e) => handleInputChange('bank', 'account_number', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.account_number}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    {editingFields.bank ? (
                      <select
                        value={tempData.bank.account_type}
                        onChange={(e) => handleInputChange('bank', 'account_type', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      >
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                      </select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.account_type}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.bank_name}
                        onChange={(e) => handleInputChange('bank', 'bank_name', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.bank_name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.branch_name}
                        onChange={(e) => handleInputChange('bank', 'branch_name', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.branch_name}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.ifsc_code}
                        onChange={(e) => handleInputChange('bank', 'ifsc_code', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.ifsc_code}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MICR Code</label>
                    {editingFields.bank ? (
                      <input
                        type="text"
                        value={tempData.bank.micr_code}
                        onChange={(e) => handleInputChange('bank', 'micr_code', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sectionLoading.bank}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.micr_code}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Proof</label>
                    <div className="p-2 bg-gray-50 rounded border text-gray-700">{displayData.bank.bank_proof}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancelled Cheque</label>
                    <div className="p-2 bg-gray-50 rounded border text-gray-700">
                      {displayData.bank.cancelled_cheque !== 'Not available' ? 'Uploaded' : 'Not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nominee Details Section */}
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Nominee Details</h3>
              <div className="flex gap-2">
                {editingFields.nominee ? (
                  <>
                    <button
                      onClick={() => cancelEdit('nominee')}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={sectionLoading.nominee}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateNominee}
                      disabled={sectionLoading.nominee}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <FaSave size={12} />
                      {sectionLoading.nominee ? 'Updating...' : 'Update'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleEditSection('nominee')}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 flex items-center gap-1"
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {displayData.nominee.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{displayData.nominee.nominee_type || 'Major'}</span>
                      <span>+</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">$</span>
                      <span>+</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {displayData.nominee.percentage}% Allocation
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h5>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      {editingFields.nominee ? (
                        <input
                          type="text"
                          value={tempData.nominee[field.key as keyof DisplayData['nominee']]}
                          onChange={(e) => handleInputChange('nominee', field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={sectionLoading.nominee}
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border text-gray-700 text-sm">
                          {field.key === 'percentage' ? `${displayData.nominee[field.key as keyof DisplayData['nominee']]}%` : displayData.nominee[field.key as keyof DisplayData['nominee']]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h5 className="text-md font-semibold text-gray-900 mb-4">Address Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'address_line1', label: 'Address Line 1', span: 'md:col-span-2' },
                    { key: 'pin_code', label: 'Pin Code', span: '' },
                    { key: 'city', label: 'City', span: '' },
                    { key: 'state', label: 'State', span: '' },
                    { key: 'country', label: 'Country', span: '' }
                  ].map((field) => (
                    <div key={field.key} className={field.span}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      {editingFields.nominee ? (
                        <input
                          type="text"
                          value={tempData.nominee[field.key as keyof DisplayData['nominee']]}
                          onChange={(e) => handleInputChange('nominee', field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={sectionLoading.nominee}
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border text-gray-700 text-sm">{displayData.nominee[field.key as keyof DisplayData['nominee']]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CANEditPopup;