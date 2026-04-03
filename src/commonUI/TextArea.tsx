"use client";

import React from "react";

interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  label,
  className = "",
  required,
  ...props
}) => {
  return (
    <fieldset className="fieldset">
      {label && (
        <>
          <div className="flex">
            <legend className="fieldset-legend">{label}</legend>
            {required ? <span className="text-red-900 mt-1">*</span> : null}
          </div>
        </>
      )}
      <textarea className={`textarea ${className}`} {...props} />
    </fieldset>
  );
};

export default CustomTextarea;
