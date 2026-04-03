"use client";

import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: any;
  icon?: any;
  button?: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  className = "",
  required,
  error,
  icon,
  button,
  ...props
}) => {
  return (
    // <div className="">
      <fieldset className="fieldset flex-1">
        {label && (
          <>
            <div className="flex">
              <legend className="fieldset-legend">
                {label}
              </legend>
              <span className="text-red-900 mt-1">{required ? <span className="">*</span> : null}&nbsp;</span>
            </div>
          </>
        )}
        {props.type == "file" ? (
          <input type="file" className="file-input w-full rounded-lg" {...props} />
        ) : (
          <label className={`input w-full focus-within:outline-0 rounded-lg ${button ? "pe-1" : ""}`}>
            <input
              className={`grow autofill:!bg-white disabled:text-black shadow-[inset_1000px_0px_0px_rgba(255,255,255,1)] disabled:shadow-[inset_1000px_0px_0px_#f8f8f8] ${className}`}
              {...props}
            />
            {icon && <span className="text-black cursor-pointer">{icon}</span>}
            {button && <>{button}</>}
          </label>
        )}

        {error ? (
          <p className="mt-0 font-normal text-xs ml-0 text-red-900">{error}</p>
        ) : null}
      </fieldset>
    // </div>
  );
};

export default CustomInput;
