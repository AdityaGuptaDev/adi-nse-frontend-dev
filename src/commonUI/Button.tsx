"use client";

import React from "react";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-primary text-white rounded-lg border-0 shadow-none ${className}`}
      // ${loading ? "btn-disabled loading loading-spinner" : ""}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="loading loading-spinner"></span> loading
        </>
      ) : (
        children || label 
      )}{" "}
    </button>
  );
};

export default CustomButton;
