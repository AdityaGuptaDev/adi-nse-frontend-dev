"use client";

import React from "react";

interface CustomRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const CustomRadio: React.FC<CustomRadioProps> = ({
  label,
  className = "",
  ...props
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className={`radio ${className}`}
        {...props}
      />
      {label && <span className={`label-text ${className}`}>{label}</span>}
    </label>
  );
};

export default CustomRadio;