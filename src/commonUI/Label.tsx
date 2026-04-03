"use client";

import React, { Children } from "react";

interface CustomLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const CustomLabel: React.FC<CustomLabelProps> = ({
  label,
  className = "",
  children,
}) => {
  return (
    <label className={`label text-sm text-black ${className}`}>
      <span className="label-text" style={{ color: "black" }}>
        {children}
      </span>
    </label>
  );
};

export default CustomLabel;
