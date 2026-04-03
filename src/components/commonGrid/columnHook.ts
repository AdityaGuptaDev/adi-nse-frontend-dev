
import { useState } from "react";
const useColumns = (initialColumns: any[], defaultwidth: number) => {
    const [columns, setColumns] = useState<any>(initialColumns);
    const handleResize = (name: string, width: number) => {
        const updatedColumns = [...columns];
        const foundColumnIndex = updatedColumns.findIndex(({ name: columnName }) => columnName === name);
        if (foundColumnIndex === -1) {
            return;
        }
        updatedColumns[foundColumnIndex].width = Math.floor(width);
        setColumns(updatedColumns);
    }

    const getColumnWidth = (name: string): number => {
        const foundColumn = columns.find((item: any) => item.name === name);
        if (foundColumn) {
            return foundColumn.width ? foundColumn.width : 350;
        }
        return defaultwidth;
    }

    return { columns, setColumns, handleResize, getColumnWidth }
}

export default useColumns;
