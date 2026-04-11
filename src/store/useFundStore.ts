import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SchemeData {
    id: string;
    name: string;
    category: string;
    [key: string]: any;
}

export interface Investor {
    id: string;
    name: string;
    email?: string;
    [key: string]: any;
}


// "MFU" → CAN-backed Morningstar / MFU flow → /mutual-fund/new-order
// "NSE" → UCC-backed NSE MF Desk flow → /nse-order-form
export type FundDataSource = "MFU" | "NSE";

interface FundStore {
    schemeData: SchemeData | null;
    investorList: Investor[];
    dataSource: FundDataSource;
    setSchemeData: (scheme: SchemeData | null) => void;
    setInvestors: (investors: Investor[]) => void;
    setDataSource: (source: FundDataSource) => void;
    clearData: () => void;
}

export const useFundStore = create<FundStore>()(
    persist(
        (set) => ({
            schemeData: null,
            investorList: [],
            dataSource: "MFU",
            setSchemeData: (schemeData) => set({ schemeData }),
            setInvestors: (investorList) => set({ investorList }),
            setDataSource: (dataSource) => set({ dataSource }),
            clearData: () =>
                set({ schemeData: null, investorList: [], dataSource: "MFU" }),
        }),
        {
            name: "fund-store", // key in localStorage
        }
    )
);
