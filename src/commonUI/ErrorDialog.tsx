import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    errorDetails?: Record<string, string | number>;
    note?: string;
    buttonText?: string;
    // Optional secondary action, e.g. "Edit PAN" when the failure is
    // recoverable by going back and changing a single field.
    primaryAction?: { label: string; onClick: () => void };
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
    isOpen,
    onClose,
    title = 'Something went wrong',
    message = 'An unexpected error has occurred.',
    errorDetails,
    note = '',
    buttonText = 'Close',
    primaryAction,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-center">

                {/* Icon */}
                <div className="mt-6">
                    <XCircle className="text-red-500 w-16 h-16 mx-auto" />
                </div>

                {/* Title and message */}
                <h2 className="text-xl font-semibold text-gray-800 mt-4">{title}</h2>
                <p className="text-sm text-gray-600 px-6 mt-2">{message}</p>

                {/* Error Details */}
                {errorDetails && (
                    <div className="bg-red-50 rounded-xl mx-4 my-6 p-4 border border-red-200">
                        {Object.entries(errorDetails).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex justify-between py-2 border-b border-red-100 last:border-b-0 text-sm text-red-700"
                            >
                                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-right break-all">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Optional Note */}
                {note && (
                    <div className="text-xs text-red-600 italic px-6 mb-4">{note}</div>
                )}

                {/* Buttons */}
                <div className="px-6 pb-6 space-y-2">
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white py-2 rounded-full text-sm font-semibold shadow"
                        >
                            {primaryAction.label}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-full text-sm font-semibold shadow"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorDialog;
