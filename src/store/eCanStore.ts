import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface eCanCriteria {
    holdingNature: string,
    investorCategory: string,
    taxStatus: string,
    holders: number
}


interface investorOnboarding {
    canCriteria: eCanCriteria | null;
    setSchemeData: (canCriteria: eCanCriteria | null) => void;
    clearData: () => void;
}

export const useFundStore = create<investorOnboarding>()(
    persist(
        (set) => ({
            canCriteria: null,
            setSchemeData: (canCriteria) => set({ canCriteria }),
            clearData: () => set({ canCriteria: null }),
        }),
        {
            name: "investorOnboarding", // key in localStorage
        }
    )
);
