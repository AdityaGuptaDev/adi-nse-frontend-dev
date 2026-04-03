"use client";

import React from "react";
import { FaTelegramPlane } from "react-icons/fa";

function CustomLoading() {
  return (
    <div className="p-5 rounded-2xl bg-white/10">
      <div className="bg-black/5 h-14 w-14 flex justify-center items-center rounded-4xl">
        <FaTelegramPlane size={48} className="animate-bounce text-primary" />
      </div>
    </div>
  );
}

export default CustomLoading;
