"use client";

import React from "react";

interface CustomInputIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: any;
  icon?: any;
  iconPosition?: any
}

const CustomInputIcon: React.FC<CustomInputIconProps> = ({
  label,
  className = "",
  required,
  error,
  icon,
  iconPosition,
  ...props
}) => {
  return (
    <div className="">
      <fieldset className="fieldset">
        {label && (
          <>
            <div className="flex">
              <legend className="fieldset-legend">{label}</legend>
              {required ? <span className="text-red-900 mt-1">*</span> : null}
            </div>
          </>
        )}
        <label className="input w-full focus-within:outline-0 rounded-lg">
          {iconPosition === "left" ? <span className="text-black cursor-pointer">{icon}</span> : null }
          <input className={`grow disabled:text-black  ${className}`} {...props} />
          {iconPosition === "right" ? <span className="text-black cursor-pointer">{icon}</span> : null }
        </label>
        {error ? (
          <p className="mt-1 font-normal ml-1 text-red-900">{error}</p>
        ) : null}
      </fieldset>
    </div>
  );
};

export default CustomInputIcon;
