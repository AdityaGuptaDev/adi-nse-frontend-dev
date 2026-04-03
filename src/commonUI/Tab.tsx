"use client";

import React, { useState } from "react";

interface TabItem {
  id: any;
  label: any;
}

interface CustomTabsProps {
  tabs: TabItem[];
  defaultActiveId?: any;
  onChange?: (activeTabId: string) => void;
  className: any
}

const CustomTab: React.FC<CustomTabsProps> = ({
  tabs,
  defaultActiveId,
  onChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveId || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={`tabs tabs-box ${className}`}>
      {tabs.map((tab) => (
        <input
          key={tab.id}
          type="radio"
          name={`my_tabs_1`}
          className={`tab`}
          aria-label={tab.label}
          checked={activeTab === tab.id}
          onChange={() => handleChange(tab.id)}
        />
      ))}
    </div>
  );
};

export default CustomTab;
