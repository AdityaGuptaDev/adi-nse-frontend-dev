import React, { useState } from "react";
import Overview from "./information/overview";
import Objective from "./information/objective";

function Information( { schemeData }: any) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="p-4">
      <div
        role="tablist"
        className="tabs tabs-boxed mb-4 space-x-5 text-white bg-transparent"
      >
        <button
          role="tab"
          className={`tab text-white rounded-xl   font-semibold ${
            activeTab === "Overview"
              ? "tab-active bg-primary hover:text-white text-white"
              : "bg-placeholder !text-white"
          }`}
          onClick={() => setActiveTab("Overview")}
        >
          Overview
        </button>
        <button
          role="tab"
          className={`tab text-white rounded-xl  font-semibold ${
            activeTab === "Objective"
              ? "tab-active  bg-primary hover:text-white text-white"
              : "bg-placeholder !text-white"
          }`}
          onClick={() => setActiveTab("Objective")}
        >
          Objective
        </button>
      </div>

      <div>
        {activeTab === "Overview" && <Overview schemeData={schemeData} />}
        {activeTab === "Objective" && <Objective schemeData={schemeData} />}
      </div>
    </div>
  );
}

export default Information;
