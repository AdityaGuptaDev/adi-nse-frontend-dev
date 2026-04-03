import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, Upload, Download, Copy, User, Calendar, Hash, Phone, Mail } from 'lucide-react';
import { getLS } from '@/utils/helpers';
import { USER_DATA } from '@/utils/constants';
import { getAccountHolding } from '@/api/holder';
// Define types for your data
interface CANData {
  canNumber: string;
  customerName: string;
  email: string;
  phone: string;
  panNumber: string;
  createdDate: string;
  applicationId: string;
}

const investorData = getLS("INVESTOR_DATA");


export default function CANSuccessComponent() {
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [copiedCAN, setCopiedCAN] = useState(false);
  const [canData, setCanData] = useState<CANData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chequeImage, setChequeImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitComplete, setSubmitComplete] = useState(false);
  const [canNo, setCanNo] = useState("")

  // Fetch CAN data from API when component mounts
  useEffect(() => {

    console.log(investorData)
    setLoading(false);

    console.log("=======PAN NUMBER", investorData.InvestorRegistration?.pan_no)


    setCanData({
      canNumber: investorData.can_number,
      customerName: investorData?.InvestorRegistration?.name,
      email: investorData.reg_email,
      phone: investorData.mobile,
      panNumber: investorData.InvestorRegistration?.pan_no,
      createdDate: new Date().toLocaleDateString('en-IN'),
      applicationId: 'MF2024081234',

    });


  }, []);

  useEffect(() => {

    const searchAccountHolding = async () => {
      const response = await getAccountHolding(investorData?.InvestorRegistration?.id);
      const data = response?.data?.data?.data

      setCanNo(data[0]?.CAN_Id
      )
      console.log("Account Holding :- ", response?.data?.data?.data);

    };
    searchAccountHolding();

  }, [])

  const handleDocumentUpload = async () => {
    if (selectedDocuments.length === 0) return;

    setIsUploading(true);

    // Simulate document upload
    await new Promise(resolve => setTimeout(resolve, 3000));

    setUploadComplete(true);
    setIsUploading(false);
    setSelectedDocuments([]);
  };

  const handleSubmitKYC = async () => {
    setIsSubmitting(true);

    // Simulate KYC submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitComplete(true);
    setIsSubmitting(false);
  };

  const copyCANNumber = async () => {
    if (!canData) return;

    try {
      await navigator.clipboard.writeText(canNo);
      setCopiedCAN(true);
      setTimeout(() => setCopiedCAN(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = canData.canNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCAN(true);
      setTimeout(() => setCopiedCAN(false), 2000);
    }
  };

  const handleCommplete = () => {

  }


  if (loading) {
    return (
      <div className=" p-6 bg-gradient-to-br min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CAN details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading CAN Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!canData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No CAN data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen text-center mt-5">
      {/* Success Header */}
      <div className="text-center mb-8 mt-5">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          CAN Created Successfully!
        </h1>
        <p className="text-gray-600 text-lg">
          Your Customer Application Number has been generated
        </p>
      </div>

      {/* CAN Details Card */}
      <div className="flex items-center justify-center w-full">


        <div >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your Customer Account Number
            </h2>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 inline-block">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {canNo}
              </div>
              <button
                onClick={copyCANNumber}
                className="flex items-center justify-center mx-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedCAN ? 'Copied!' : 'Copy CAN Number'}
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">Customer Name:</span>
                <span className="ml-2 font-medium">{canData.customerName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">Email:</span>
                <span className="ml-2 font-medium">{canData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">Phone:</span>
                <span className="ml-2 font-medium">{canData.phone}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <Hash className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">PAN Number:</span>
                <span className="ml-2 font-medium">{canData.panNumber}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">Registration Date:</span>
                <span className="ml-2 font-medium">{canData.createdDate}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">Application ID:</span>
                <span className="ml-2 font-medium">{canData.applicationId}</span>
              </div>
            </div>
          </div>

          {/* Download Confirmation */}
          <div className="text-center">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 inline-block mb-4">
              <div className="flex items-center justify-center text-red-700">

                <span className="font-medium">Check email and update documents accordingly to complete your onboarding</span>
              </div>
            </div>
            {/*<button
              onClick={handleCommplete}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
             
            </button>*/}
          </div>
        </div>
      </div>
    </div>
  );
}
