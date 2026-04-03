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


interface FundStore {
    schemeData: SchemeData | null;
    investorList: Investor[];
    setSchemeData: (scheme: SchemeData | null) => void;
    setInvestors: (investors: Investor[]) => void;
    clearData: () => void;
}

export const useFundStore = create<FundStore>()(
    persist(
        (set) => ({
            schemeData: null,
            investorList: [],
            setSchemeData: (schemeData) => set({ schemeData }),
            setInvestors: (investorList) => set({ investorList }),
            clearData: () => set({ schemeData: null, investorList: [] }),
        }),
        {
            name: "fund-store", // key in localStorage
        }
    )
);
