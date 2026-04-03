"use client";

import React from "react";

interface CustomCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  labelClassName = "",
  className = "",
  checked,
  onChange,
  ...props
}) => {
  return (
    <fieldset className="fieldset">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={`checkbox checked:bg-other before:bg-white border-accent checked:border-other bg-accent/20 w-4 h-4 min-w-4 min-h-4 !p-0.5 rounded-md ${className}`}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && <span className={`label-text ${labelClassName}`}>{label}</span>}
    </label>
    </fieldset>
  );
};

export default CustomCheckbox;
