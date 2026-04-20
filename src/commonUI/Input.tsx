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
    <fieldset className="fieldset flex-1">
      {label && (
        <div className="flex">
          <legend className="fieldset-legend text-[#F9FAFB]">
            {label}
          </legend>
          <span className="text-[#F59E0B] mt-1">{required ? <span className="">*</span> : null}&nbsp;</span>
        </div>
      )}
      {props.type == "file" ? (
        <input
          type="file"
          className="file-input w-full rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] text-[#F9FAFB] file:bg-[#2A2A2A] file:text-[#F9FAFB] file:border-0"
          {...props}
        />
      ) : (
        <label
          className={`input w-full focus-within:outline-0 rounded-lg bg-[#1F1A1A] border border-[#2A2A2A] text-[#F9FAFB] focus-within:border-[#F59E0B] ${button ? "pe-1" : ""}`}
        >
          <input
            // Inset shadow defeats browser autofill yellow and paints the input
            // surface dark on every state (normal / hover / focus / autofill).
            className={`grow bg-transparent text-[#F9FAFB] placeholder:text-[#6B7280] autofill:!bg-[#1F1A1A] disabled:text-[#9CA3AF] disabled:cursor-not-allowed shadow-[inset_1000px_0px_0px_#1F1A1A] disabled:shadow-[inset_1000px_0px_0px_#111111] ${className}`}
            {...props}
          />
          {icon && <span className="text-[#9CA3AF] cursor-pointer hover:text-[#F59E0B] transition-colors">{icon}</span>}
          {button && <>{button}</>}
        </label>
      )}

      {error ? (
        <p className="mt-0 font-normal text-xs ml-0 text-red-400">{error}</p>
      ) : null}
    </fieldset>
  );
};

export default CustomInput;
