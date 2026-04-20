"use client";

import React from "react";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90",
    secondary: "bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:opacity-90",
    danger: "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:opacity-90",
    outline: "bg-transparent border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10",
  };

  // Width class
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`
        relative overflow-hidden
        font-semibold
        rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${loading ? "cursor-wait" : ""}
        ${disabled && !loading ? "cursor-not-allowed" : ""}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children || label
        )}
      </span>
    </button>
  );
};

export default CustomButton;