import React, { useRef, useState } from 'react';

interface DocumentUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFileChange: (docType: string, file: File) => void;
    uploadedDocs: Record<string, string>; // { docType: imageUrl }
    onSubmit: () => void;
    isSubmitting?: boolean;
    documentOptions: string[]; // e.g. ['aadhar', 'pan_card', 'bank_proof']
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
    isOpen,
    onClose,
    onFileChange,
    uploadedDocs,
    onSubmit,
    isSubmitting = false,
    documentOptions,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<string>('');

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedDocType) {
            onFileChange(selectedDocType, file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Upload Documents</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
                </div>

                <div className="p-6 space-y-4">

                    {/* Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Document Type</label>
                        <select
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">-- Select Document --</option>
                            {documentOptions.map((doc) => (
                                <option key={doc} value={doc}>
                                    {doc.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Button */}
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            disabled={!selectedDocType}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-orange-500 text-white px-4 py-2 text-sm rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                            Upload Document
                        </button>
                    </div>

                    {/* Uploaded Documents List */}
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-semibold mb-3">Uploaded Documents</h3>
                        <div className="space-y-4">
                            {Object.entries(uploadedDocs).length === 0 ? (
                                <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
                            ) : (
                                Object.entries(uploadedDocs).map(([docType, url]) => (
                                    <div key={docType}>
                                        <p className="text-sm font-medium capitalize mb-1">
                                            {docType.replace(/_/g, ' ')}
                                        </p>
                                        {url.endsWith('.pdf') ? (
                                            <>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-sm underline"
                                                >
                                                    View PDF
                                                </a>
                                            </>

                                        ) : (
                                            <img
                                                src={url}
                                                alt={docType}
                                                className="w-full max-w-xs h-40 object-cover border rounded"
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 px-6 py-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Documents'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadDialog;
