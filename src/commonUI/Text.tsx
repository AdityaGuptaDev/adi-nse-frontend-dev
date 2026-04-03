"use client";

import React from "react";

interface CustomTextProps {
  children: React.ReactNode;
  className?: string;
  onClick?: any;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  className = "",
  tag = "div",
  onClick,
  ...props
}) => {
  const Tag = tag; // Render the appropriate tag dynamically

  return (
    <Tag className={`${className}`} onClick={onClick} {...props}>
      {children}
    </Tag>
  );
};

export default CustomText;
