"use client";

import React from "react";

interface CustomBackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
}

const CustomBackButton: React.FC<CustomBackButtonProps> = ({
  label,
  loading = false,
  className =" ",
  children,
  disabled,
  ...props
}) => {
  return (
    <button 
    
    //   className={`btn btn-primary text-white rounded-lg border-0 shadow-none ${className}`}
    className={`cursor-pointer p-1 hover:bg-black/20 rounded-lg   ${className}`}
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
      )}
    </button>
  );
};

export default  CustomBackButton;
