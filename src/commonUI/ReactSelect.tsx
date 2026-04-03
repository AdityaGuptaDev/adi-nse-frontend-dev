"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

type propTypes = {
  onChange?: (value: any, action: any) => void;
  items: any[];
  bindValue: string;
  bindName: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
  isMulti?: boolean;
  value?: any;
  isClearable?: boolean;
  className?: string;
  label?: string;
  error?: string | any;
  id?: string;
  onMenuScrollToBottom?: any;
  isLoading?: boolean;
  onInputChange?: any;
  required?: boolean;
  defaultValue?: any;
};

function CustomReactSelect({
  onChange,
  items,
  bindValue,
  bindName,
  disabled,
  name,
  placeholder,
  isMulti,
  value,
  isClearable,
  className,
  label,
  error,
  id,
  onMenuScrollToBottom,
  isLoading,
  onInputChange,
  required,
  defaultValue,
}: propTypes) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || null);

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
    } else if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [value, defaultValue]);

  const handleChange = (selectedOption: any) => {
    setSelectedValue(selectedOption);
    if (onChange) {
      onChange(selectedOption, { action: "select-option" });
    }
  };
  const animatedComponents = makeAnimated();

  const customStyles: any = {
    control: () => ({
      alignItems: "center",
      // backgroundColor: "#ffffff",
      // border: "solid 1px #c6d4f9",
      // borderRadius: "0.3rem",
      justifyContent: "space-between",
      maxHeight: "2.25rem",
      position: "relative",
      transition: "all 100ms",
      boxSizing: "border-box",
      outline: 0,
      display: "flex",
      fontSize: "0.75rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999, // even higher!
      fontSize: "0.75rem", // Custom font size for menu (dropdown)
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999, // <--- THIS is what you want
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "0.75rem", // Custom font size for each option
      backgroundColor: state.isSelected
      ? "var(--color-secondary)"
      : state.isFocused
      ? "#ffe8d1"
      : "white",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize: "0.75rem", 
    }),
  };

  return (
    <>
      <div>
        {isMulti ? (
          <>
            <div>
              <fieldset className="fieldset relative py-0">
                {label && (
                  <>
                    <div className="flex">
                      <legend className="fieldset-legend">{label}</legend>
                      <span className="text-red-900 mt-1">{required ? (
                        <span>*</span>
                      ) : null}&nbsp;
                      </span>
                    </div>
                  </>
                )}
                <Select
                  options={items}
                  getOptionLabel={(option: any) => `${option[bindName]}`}
                  getOptionValue={(option: any) => `${option[bindValue]}`}
                  value={value}
                  components={animatedComponents}
                  isDisabled={disabled}
                  isSearchable={true}
                  placeholder={placeholder}
                  onChange={onChange}
                  closeMenuOnSelect={!isMulti}
                  name={name}
                  isMulti={isMulti}
                  className={`border border-gray-300 rounded-lg min-h-10 ${className}`}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition={"fixed"}
                  menuPlacement={"auto"}
                  id={id}
                  onMenuScrollToBottom={onMenuScrollToBottom}
                  isLoading={isLoading}
                  onInputChange={onInputChange}
                  defaultValue={defaultValue}
                  styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />
              </fieldset>
            </div>
          </>
        ) : (
          <>
            <div>
              <fieldset className="fieldset relative">
                {label && (
                  <>
                    <div className="flex">
                      <legend className="fieldset-legend">{label}</legend>
                      <span className="text-red-900 mt-1">{required ? (
                        <span>*</span>
                      ) : null}&nbsp;
                      </span>
                    </div>
                  </>
                )}
                <Select
                  options={items}
                  getOptionLabel={(option: any) => `${option[bindName]}`}
                  getOptionValue={(option: any) => `${option[bindValue]}`}
                  value={
                    defaultValue
                      ? items?.find(
                          (option: any) => option[bindValue] === selectedValue
                        )
                      : items?.filter((option: any) => {
                          return option[bindValue] == value;
                        })
                  }
                  // value={items?.find((option: any) => option[bindValue] === selectedValue)}
                  instanceId="ID"
                  components={animatedComponents}
                  isDisabled={disabled}
                  isSearchable={true}
                  placeholder={placeholder}
                  onChange={onChange}
                  name={name}
                  styles={customStyles}
                  className={`border border-gray-300 rounded-lg min-h-10 ${className}`}
                  isClearable={isClearable || false}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition={"fixed"}
                  menuPlacement={"auto"}
                  id={id}
                  onMenuScrollToBottom={onMenuScrollToBottom}
                  isLoading={isLoading}
                  onInputChange={onInputChange}
                  defaultValue={defaultValue}
                  // styles={{
                  //   menuPortal: base => ({ ...base, zIndex: 9999 })
                  // }}
                />
              </fieldset>
            </div>
          </>
        )}

        {error ? <p className="text-red-900 text-xs mt-2">{error}</p> : null}
      </div>
    </>
  );
}

export default CustomReactSelect;
