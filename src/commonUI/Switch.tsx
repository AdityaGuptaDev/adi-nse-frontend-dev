"use client";

import React from "react";

interface CustomSwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  label2?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  label2,
  className = "",
  checked,
  onChange,
  ...props
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {label2 && <span className="label-text">{label2}</span>}
      <input
        type="checkbox"
        className={`toggle ${className}`}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && <span className="label-text">{label}</span>}
    </label>
  );
};

export default CustomSwitch;
