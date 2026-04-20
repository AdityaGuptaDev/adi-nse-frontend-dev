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

  // Golden Black styling — keep react-select readable on the dark theme.
  const customStyles: any = {
    control: (provided: any, state: any) => ({
      ...provided,
      alignItems: "center",
      backgroundColor: "#1F1A1A",
      borderColor: state.isFocused ? "#F59E0B" : "#2A2A2A",
      borderRadius: "0.5rem",
      justifyContent: "space-between",
      minHeight: "2.25rem",
      maxHeight: "2.25rem",
      position: "relative",
      transition: "all 100ms",
      boxSizing: "border-box",
      outline: 0,
      boxShadow: state.isFocused ? "0 0 0 1px #F59E0B" : "none",
      display: "flex",
      fontSize: "0.75rem",
      color: "#F9FAFB",
      "&:hover": { borderColor: "#F59E0B" },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      color: "#F9FAFB",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#F9FAFB",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      fontSize: "0.75rem",
      backgroundColor: "#111111",
      border: "1px solid #2A2A2A",
    }),
    menuList: (provided: any) => ({
      ...provided,
      backgroundColor: "#111111",
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "0.75rem",
      backgroundColor: state.isSelected
        ? "#F59E0B"
        : state.isFocused
          ? "#1F1A1A"
          : "#111111",
      color: state.isSelected ? "#0A0A0A" : "#F9FAFB",
      cursor: "pointer",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize: "0.75rem",
      color: "#F9FAFB",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#2A2A2A",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#F9FAFB",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { backgroundColor: "#F59E0B", color: "#0A0A0A" },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: "#2A2A2A",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { color: "#F59E0B" },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { color: "#EF4444" },
    }),
  };

  return (
    <div>
      {isMulti ? (
        <div>
          <fieldset className="fieldset relative py-0">
            {label && (
              <div className="flex">
                <legend className="fieldset-legend text-[#F9FAFB]">{label}</legend>
                <span className="text-[#F59E0B] mt-1">{required ? (<span>*</span>) : null}&nbsp;</span>
              </div>
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
              className={`rounded-lg min-h-10 ${className}`}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition={"fixed"}
              menuPlacement={"auto"}
              id={id}
              onMenuScrollToBottom={onMenuScrollToBottom}
              isLoading={isLoading}
              onInputChange={onInputChange}
              defaultValue={defaultValue}
              styles={customStyles}
            />
          </fieldset>
        </div>
      ) : (
        <div>
          <fieldset className="fieldset relative">
            {label && (
              <div className="flex">
                <legend className="fieldset-legend text-[#F9FAFB]">{label}</legend>
                <span className="text-[#F59E0B] mt-1">{required ? (<span>*</span>) : null}&nbsp;</span>
              </div>
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
              instanceId="ID"
              components={animatedComponents}
              isDisabled={disabled}
              isSearchable={true}
              placeholder={placeholder}
              onChange={onChange}
              name={name}
              styles={customStyles}
              className={`rounded-lg min-h-10 ${className}`}
              isClearable={isClearable || false}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition={"fixed"}
              menuPlacement={"auto"}
              id={id}
              onMenuScrollToBottom={onMenuScrollToBottom}
              isLoading={isLoading}
              onInputChange={onInputChange}
              defaultValue={defaultValue}
            />
          </fieldset>
        </div>
      )}

      {error ? <p className="text-red-400 text-xs mt-2">{error}</p> : null}
    </div>
  );
}

export default CustomReactSelect;
