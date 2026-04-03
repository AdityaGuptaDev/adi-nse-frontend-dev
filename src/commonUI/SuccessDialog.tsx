// components/SuccessDialog.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    data: Record<string, string | number>;
    note?: string;
    buttonText?: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
    isOpen,
    onClose,
    title = '',
    message = '',
    data,
    note = '',
    buttonText = 'Okay',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-center">

                {/* Icon */}
                <div className="mt-6">
                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
                </div>

                {/* Title and message */}
                <h2 className="text-xl font-semibold text-gray-800 mt-4">{title}</h2>
                <p className="text-sm text-gray-600 px-6 mt-2">{message}</p>

                {/* Card with key-value data */}
                <div className="bg-white shadow-inner rounded-xl mx-4 my-6 p-4 border border-gray-200">
                    {Object.entries(data).map(([key, value]) => (
                        <div
                            key={key}
                            className="flex justify-between py-2 border-b border-gray-200 last:border-b-0 text-sm text-gray-700"
                        >
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-right break-all">{String(value)}</span>
                        </div>
                    ))}
                </div>

                {/* Note / info */}
                {note && (
                    <div className="text-xs text-green-600 italic px-6 mb-4">{note}</div>
                )}

                {/* Button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 rounded-full text-sm font-semibold shadow"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessDialog;
