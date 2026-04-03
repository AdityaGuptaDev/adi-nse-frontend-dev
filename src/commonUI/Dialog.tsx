"use client";

import React from "react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                    aria-label="Close"
                >
                    &times;
                </button>
                {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
                <div className="mb-4">{children}</div>
                {footer && <div className="mt-4">{footer}</div>}
            </div>
        </div>
    );
};

export default Dialog;
