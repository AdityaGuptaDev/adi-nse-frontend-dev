import React, { useState, useRef } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Database,
  X,
  FileText,
  Play,
  History,
} from "lucide-react";

const BASE_URL = "http://localhost:8000";


interface UploadedFile {
  fileName: string;
  sectionKey: string;
  uploadTime: Date;
  apiPath: string;
}

interface FilePatternConfig {
  pattern: RegExp;
  requiredSuffix: string;
  description: string;
}

type FilePatternKey = 
  | "CAMS-AUM" 
  | "CAMS-Brokerage" 
  | "CAMS-Investor" 
  | "CAMS-SIP" 
  | "CAMS-SIP-Expire" 
  | "CAMS-Transaction"
  | "KFintech-AUM"
  | "KFintech-Transaction"
  | "KFintech-Brokerage"
  | "KFintech-Investor";

const UploadDashboard = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filePatterns: Record<FilePatternKey, FilePatternConfig> = {

    "CAMS-AUM": { pattern: /R22\.dbf$/i, requiredSuffix: "R22", description: "Must end with R22.dbf" },
    "CAMS-Brokerage": { pattern: /R77\.dbf$/i, requiredSuffix: "R77", description: "Must end with R77.dbf" },
    "CAMS-Investor": { pattern: /R9\.dbf$/i, requiredSuffix: "R9", description: "Must end with R9.dbf" },
    "CAMS-SIP": { pattern: /R49\.dbf$/i, requiredSuffix: "R49", description: "Must end with R49.dbf" },
    "CAMS-SIP-Expire": { pattern: /R5\.dbf$/i, requiredSuffix: "R5", description: "Must end with R5.dbf" },
    "CAMS-Transaction": { pattern: /R2\.dbf$/i, requiredSuffix: "R2", description: "Must end with R2.dbf" },
    

    "KFintech-AUM": { pattern: /W0C.*\.dbf$/i, requiredSuffix: "W0C", description: "Must contain W0C and end with .dbf" },
    "KFintech-Transaction": { pattern: /W0T.*\.dbf$/i, requiredSuffix: "W0T", description: "Must contain W0T and end with .dbf" },
    "KFintech-Brokerage": { pattern: /W0B.*\.dbf$/i, requiredSuffix: "W0B", description: "Must contain W0B and end with .dbf" },
    "KFintech-Investor": { pattern: /W0M.*\.dbf$/i, requiredSuffix: "W0M", description: "Must contain W0M and end with .dbf" },
  };

 
  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  
  const isFileAlreadyUploaded = (fileName: string, sectionKey: string): boolean => {
    return uploadedFiles.some(
      file => file.fileName === fileName && file.sectionKey === sectionKey
    );
  };

  
  const getFileKey = (sectionTitle: string, itemLabel: string): string => {
    return `${sectionTitle}-${itemLabel}`;
  };


  const validateFileName = (fileName: string, sectionTitle: string, itemLabel: string): { isValid: boolean; error?: string } => {
    const fileKey = getFileKey(sectionTitle, itemLabel);
    
   
    const patternMap: Record<string, FilePatternKey> = {
    
      "Investor DBF (wbr2c)": "CAMS-Investor",
      "AUM DBF (wbr22)": "CAMS-AUM",
      "Investor Details DBF (wbr9)": "CAMS-Investor",
      "Transaction DBF (wbr2)": "CAMS-Transaction",
      "SIP DBF (wbr49)": "CAMS-SIP",
      "Brokerage DBF (wbr77)": "CAMS-Brokerage",
      "SIP Expire DBF (wbr5)": "CAMS-SIP-Expire",
      
  
      "AUM DBF (wbcum)": "KFintech-AUM",
      "Transaction DBF (wbtrn)": "KFintech-Transaction",
      "Investor Master DBF (wbmst)": "KFintech-Investor",
      "Brokerage DBF (wbbrok)": "KFintech-Brokerage",
    };

    const patternKey = patternMap[itemLabel];
    
    if (!patternKey || !filePatterns[patternKey]) {
      return { isValid: true }; 
    }

    const patternConfig = filePatterns[patternKey];
    
    if (!patternConfig.pattern.test(fileName)) {
      return {
        isValid: false,
        error: `Invalid file for ${itemLabel}. File name "${fileName}" does not match required pattern: ${patternConfig.description}`
      };
    }

    return { isValid: true };
  };

 
  const handleFileSelect = (sectionTitle: string, itemLabel: string, file: File | null) => {
    const fileKey = getFileKey(sectionTitle, itemLabel);
    
    if (file) {
      
      if (isFileAlreadyUploaded(file.name, fileKey)) {
        setStatus(prev => ({
          ...prev,
          [fileKey]: ` File "${file.name}" was already uploaded. Choose a different file.`,
        }));
        setSelectedFiles(prev => ({ ...prev, [fileKey]: null }));

        if (fileInputRefs.current[fileKey]) {
          fileInputRefs.current[fileKey]!.value = "";
        }
        return;
      }


      const validation = validateFileName(file.name, sectionTitle, itemLabel);
      if (!validation.isValid) {
        setStatus(prev => ({
          ...prev,
          [fileKey]: ` ${validation.error}`,
        }));
        setSelectedFiles(prev => ({ ...prev, [fileKey]: null }));
        
 
        if (fileInputRefs.current[fileKey]) {
          fileInputRefs.current[fileKey]!.value = "";
        }
        return;
      }

      setSelectedFiles(prev => ({ ...prev, [fileKey]: file }));
      setStatus(prev => ({
        ...prev,
        [fileKey]: ` Selected: ${file.name} `,
      }));
    } else {
      setSelectedFiles(prev => ({ ...prev, [fileKey]: null }));
      setStatus(prev => ({ ...prev, [fileKey]: "" }));
    }
  };

  
  const clearFileSelection = (sectionTitle: string, itemLabel: string) => {
    const fileKey = getFileKey(sectionTitle, itemLabel);
    
    setSelectedFiles(prev => ({ ...prev, [fileKey]: null }));
    setStatus(prev => ({ ...prev, [fileKey]: "" }));

    if (fileInputRefs.current[fileKey]) {
      fileInputRefs.current[fileKey]!.value = "";
    }
  };

  const uploadFile = async (apiPath: string, sectionTitle: string, itemLabel: string) => {
    const fileKey = getFileKey(sectionTitle, itemLabel);
    const file = selectedFiles[fileKey];

    if (!file) {
      setStatus(prev => ({ ...prev, [fileKey]: " Please select a file first." }));
      return;
    }

    if (!token) {
      setStatus(prev => ({ ...prev, [fileKey]: " Please enter a valid token." }));
      return;
    }

    if (isFileAlreadyUploaded(file.name, fileKey)) {
      setStatus(prev => ({
        ...prev,
        [fileKey]: ` File "${file.name}" was already uploaded. Upload cancelled.`,
      }));
      clearFileSelection(sectionTitle, itemLabel);
      return;
    }

  
    const validation = validateFileName(file.name, sectionTitle, itemLabel);
    if (!validation.isValid) {
      setStatus(prev => ({
        ...prev,
        [fileKey]: ` ${validation.error}`,
      }));
      clearFileSelection(sectionTitle, itemLabel);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(prev => ({ ...prev, [fileKey]: true }));
    setStatus(prev => ({ ...prev, [fileKey]: " Uploading..." }));

    try {
      const res = await axios.post(`${BASE_URL}${apiPath}`, formData, {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      });


      const newUploadedFile: UploadedFile = {
        fileName: file.name,
        sectionKey: fileKey,
        uploadTime: new Date(),
        apiPath: apiPath,
      };
      
      setUploadedFiles(prev => [...prev, newUploadedFile]);
      setStatus(prev => ({
        ...prev,
        [fileKey]: ` Success: ${res.data?.message || "File processed successfully!"}`,
      }));
      
      
      setTimeout(() => {
        clearFileSelection(sectionTitle, itemLabel);
      }, 2000);

    } catch (err: any) {
      setStatus(prev => ({
        ...prev,
        [fileKey]:
          " Upload failed: " +
          (err.response?.data?.detail || err.message || "Unknown error."),
      }));
    } finally {
      setLoading(prev => ({ ...prev, [fileKey]: false }));
    }
  };


  const runBackgroundJob = async () => {
    if (!token) {
      setStatus(prev => ({ ...prev, "job": " Please enter a valid token." }));
      return;
    }

    setLoading(prev => ({ ...prev, "job": true }));
    setStatus(prev => ({ ...prev, "job": " Running background job..." }));

    try {
      const res = await axios.post(`${BASE_URL}/run-job`, {}, {
        headers: { token: token },
      });

      setStatus(prev => ({
        ...prev,
        "job": ` ${res.data?.status || "Job triggered successfully!"}`,
      }));
    } catch (err: any) {
      setStatus(prev => ({
        ...prev,
        "job": " Job failed: " + (err.response?.data?.detail || err.message || "Unknown error."),
      }));
    } finally {
      setLoading(prev => ({ ...prev, "job": false }));
    }
  };

  const clearUploadHistory = () => {
    setUploadedFiles([]);
  };

 
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSections = [
    {
      title: "📘 CAMS Uploads",
      icon: <Database className="h-5 w-5 text-blue-500" />,
      items: [
        { label: "Investor DBF (wbr2c)", api: "/cams/wbr2c", pattern: "Must end with R9.dbf" },
        { label: "AUM DBF (wbr22)", api: "/cams/wbr22", pattern: "Must end with R22.dbf" },
        { label: "Investor Details DBF (wbr9)", api: "/cams/wbr9", pattern: "Must end with R9.dbf" },
        { label: "Transaction DBF (wbr2)", api: "/cams/wbr2", pattern: "Must end with R2.dbf" },
        { label: "SIP DBF (wbr49)", api: "/cams/wbr49", pattern: "Must end with R49.dbf" },
        { label: "Brokerage DBF (wbr77)", api: "/cams/wbr77", pattern: "Must end with R77.dbf" },
        { label: "SIP Expire DBF (wbr5)", api: "/cams/wbr5", pattern: "Must end with R5.dbf" },
      ],
    },
    {
      title: "📗 KFintech Uploads",
      icon: <Database className="h-5 w-5 text-green-500" />,
      items: [
        { label: "AUM DBF (wbcum)", api: "/kfintech/wbcum", pattern: "Must contain W0C" },
        { label: "Transaction DBF (wbtrn)", api: "/kfintech/wbtrn", pattern: "Must contain W0T" },
        { label: "Investor Master DBF (wbmst)", api: "/kfintech/wbmst", pattern: "Must contain W0M" },
        { label: "Brokerage DBF (wbbrok)", api: "/kfintech/wbbrok", pattern: "Must contain W0B" },
      ],
    },
  ];


  const getUploadedFilesCount = (sectionTitle: string): number => {
    return uploadedFiles.filter(file => file.sectionKey.startsWith(sectionTitle)).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-gray-900 flex items-center">
            <Upload className="h-5 w-5 text-teal-500 mr-2" />
            Mutual Fund Data Processing (CAMS & KFintech)
          </h1>
          {uploadedFiles.length > 0 && (
            <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
               {uploadedFiles.length} files uploaded
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={runBackgroundJob}
            disabled={loading["job"]}
            className={`${
              loading["job"]
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            } text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors`}
          >
            {loading["job"] ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Background Job</span>
              </>
            )}
          </button>

          <input
            type="text"
            placeholder="Enter API Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-72"
          />
        </div>
      </div>

      {status["job"] && (
        <div className="mx-6 mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className={`text-sm flex items-center space-x-2 ${
            status["job"].includes("") ? "text-green-600" : 
            status["job"].includes("") ? "text-red-600" : 
            "text-blue-600"
          }`}>
            {status["job"].includes("") ? (
              <CheckCircle className="h-4 w-4" />
            ) : status["job"].includes("") ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="font-medium">Background Job:</span>
            <span>{status["job"]}</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {uploadSections.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleAccordion(section.title)}
              className="w-full flex justify-between items-center px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {section.icon}
                <h2 className="text-base font-semibold text-gray-800">{section.title}</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {getUploadedFilesCount(section.title)}/{section.items.length} uploaded
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {openAccordion === section.title ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>

         
            {openAccordion === section.title && (
              <div className="p-5 space-y-6 bg-white">
                {section.items.map((item, idx) => {
                  const fileKey = getFileKey(section.title, item.label);
                  const isFileSelected = !!selectedFiles[fileKey];
                  const isUploaded = uploadedFiles.some(
                    file => file.sectionKey === fileKey && file.fileName === selectedFiles[fileKey]?.name
                  );

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-800 flex items-center space-x-2">
                          <FileUp className="h-4 w-4 text-teal-500" />
                          <span>{item.label}</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {item.pattern}
                          </span>
                          {isFileSelected && (
                            <button
                              onClick={() => clearFileSelection(section.title, item.label)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Clear selection"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          id={`file-${sectionIdx}-${idx}`}
                          ref={(el) => {
                            fileInputRefs.current[fileKey] = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            handleFileSelect(section.title, item.label, file);
                          }}
                          className="block w-64 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                          accept=".dbf,.DBF"
                        />

                        <button
                          onClick={() => uploadFile(item.api, section.title, item.label)}
                          disabled={loading[fileKey] || !selectedFiles[fileKey] || isUploaded}
                          className={`${
                            loading[fileKey]
                              ? "bg-gray-400 cursor-not-allowed"
                              : !selectedFiles[fileKey] || isUploaded
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-teal-500 hover:bg-teal-600"
                          } text-white px-5 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors`}
                        >
                          {loading[fileKey] ? (
                            <>
                              <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
                              <span>Uploading...</span>
                            </>
                          ) : isUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>Upload</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Status */}
                      {status[fileKey] && (
                        <div
                          className={`mt-3 text-sm flex items-center space-x-2 ${
                            status[fileKey].includes("")
                              ? "text-green-600"
                              : status[fileKey].includes("") || status[fileKey].includes("")
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {status[fileKey].includes("") ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : status[fileKey].includes("") || status[fileKey].includes("") ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span>{status[fileKey]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

       
        {uploadedFiles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          
            <div className="w-full flex justify-between items-center px-5 py-4 bg-purple-100">
              <div className="flex items-center space-x-3">
                <History className="h-5 w-5 text-purple-500" />
                <h2 className="text-base font-semibold text-gray-800">Recent Uploads</h2>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  {uploadedFiles.length} files
                </span>
              </div>
              <button
                onClick={clearUploadHistory}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.slice().reverse().map((file, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800 truncate">
                          {file.fileName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.uploadTime.toLocaleDateString()} at {file.uploadTime.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-teal-600 font-medium mt-1">
                          {file.sectionKey.split('-')[1]}
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadedFile(uploadedFiles.length - 1 - index)}
                        className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                        title="Remove from history"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {file.apiPath}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

     
      {showHistoryPanel && uploadedFiles.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-teal-500" />
              Recently Uploaded ({uploadedFiles.length})
            </h3>
            <button
              onClick={() => setShowHistoryPanel(false)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {uploadedFiles.slice(-5).reverse().map((file, index) => (
              <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                <div className="font-medium truncate">{file.fileName}</div>
                <div className="text-gray-400 text-xs">
                  {file.uploadTime.toLocaleTimeString()} • {file.sectionKey.split('-')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDashboard;