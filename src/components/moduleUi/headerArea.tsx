import React, { useState } from "react";

interface HeaderAreaProps {
  children?: React.ReactElement;
  title?: string;
}

export default function HeaderArea({ title, children }: HeaderAreaProps) {


  return (
    // <div className="flex justify-between mt-8 flex-col gap-2 sm:flex-row">
    <div className="flex justify-between mt-0 flex-row gap-2">
      <div className="font-semibold lg:text-2xl sm:ml-0 font-montserrat">{title}</div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
