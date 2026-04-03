
import React from "react";
import { FaFilter } from "react-icons/fa";

interface FilterAreaProps {
  children?: any;
}
export default function FilterArea({ children }: FilterAreaProps) {
  const [open, setOpen] = React.useState(true);
  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <>
      <div className="md:flex gap-2 mt-2">
        {open && (
          // <div className="md:flex justify-start mt-3 gap-2 sm:flex-row">
          <div className="grid sm:grid-flow-row md:grid-flow-col auto-rows-max md:auto-rows-min gap-2 gap-y-2">
            {children}
          </div>
        )}
        {/* <div className="mt-3 border-spacing-1">
          <Button
            onClick={toggleOpen}
            variant="outlined"
            className="flex items-center gap-2 shadow-none text-nowrap"
          >
            {open ? "Hide Filters" : "Show Filters"}{" "}
            <FaFilter className="h-4 w-4" />
          </Button>
        </div> */}
      </div>
    </>
  );
}
