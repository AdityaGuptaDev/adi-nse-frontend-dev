"use client";

import React from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: any;
  required?: any;
  error?: any;
  items: any;
  defaultLabel?: any;
  bindValue?: any;
  bindName?: any;
  onChange: (selectedItem: any) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  required,
  error,
  items,
  onChange,
  defaultLabel = "Select an option",
  className = "",
  bindValue,
  bindName,
  ...props
}) => {
  return (
    <div className="w-full">
      <fieldset className="fieldset">
        {label && (
          <>
            {required ? <span className="text-red-900">*</span> : null}
            <div className="flex">
              <legend className="fieldset-legend">{label}</legend>
              {required ? (
                <span className="text-red-900 mt-1">*</span>
              ) : null}
            </div>
          </>
        )}
        <select
          className={`select text-white disabled:!text-white rounded-lg focus:outline-none focus:shadow-none ${className}`}
          {...props}
          onChange={onChange}
        >
          <option value="" disabled defaultValue={defaultLabel} className="text-white bg-[#111111]">
            {defaultLabel}
          </option>
          {items.map((opt: any) => (
            <option
              key={opt[bindValue]}
              value={opt[bindValue]}
              className="text-white bg-[#111111]"
            >
              {opt[bindName]}
            </option>
          ))}
        </select>
      </fieldset>
      {error ? (
        <p className="mt-1 font-normal ml-1 text-red-900">{error}</p>
      ) : null}
    </div>
  );
};

export default CustomSelect;
