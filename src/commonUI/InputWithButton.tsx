"use client";

import React from "react";

interface CustomInputButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    buttonName?: any;
    btnonChange?: any;
    inputonChange?: any
}

const CustomInputButton: React.FC<CustomInputButtonProps> = ({
  className = "",
  buttonName,
  placeholder,
  btnonChange,
  inputonChange,
  ...props
}) => {
  return (
    <div className="">
      <div className="flex justify-end w-full bg-white border border-gray-300 rounded-lg py-1 px-2">
        <input
          className="input input-bordered border-none focus:outline-none rounded-lg"
          placeholder={placeholder}
          {...props}
          onChange={inputonChange}
        />
        <button className="btn btn-secondary rounded-lg place-content-end" onChange={btnonChange}>{buttonName}</button>
      </div>
    </div>
  );
};

export default CustomInputButton;
