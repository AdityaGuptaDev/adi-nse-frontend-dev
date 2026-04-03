"use client"

import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import React, { useMemo } from 'react'



interface DataGridProps {
    columnsData: Array<{
      name: string;
      fieldName: string;
      filterFn?: boolean;
      filterType?: 'input' | 'select'; // Add other filter types if needed
    }>;
    data: Array<any>;
  }
  
function DataGrid({columnsData, data}: DataGridProps) {
  //should be memoized or stable

  console.log(columnsData,"columnsDatacolumnsData")

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      columnsData.map((column: any) => (console.log(column,"columncolumn"),{
        accessorKey: column.fieldName,
        header: column.name,
        // filterFn: column.filter
        //   ? column.filterType === "input"
        //     ? "contains" // Use a predefined filter function (can be customized)
        //     : undefined // For future filter types
        //   : undefined,
        Filter: column.filterFn ? ({ column }: any) => (
          column.filterType === "input" ? (
            <input
              type="text"
              placeholder={`Search ${column.name}`}
              value={column.getFilterValue() || ""}
              className="filterInput"
              onChange={(e) => column.setFilterValue(e.target.value)}
            />
          ) : null // Add other filter implementations here
        ) : undefined,
      })),
    [columnsData]
  );


  const table = useMemo(() => ({
    columns,
    data,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
  }), [columns, data]);

  console.log(table,"tabletabletable")

  return <MaterialReactTable {...table} />;
};

export default DataGrid