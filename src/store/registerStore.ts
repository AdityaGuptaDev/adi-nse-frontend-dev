import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface userType {
    userType: string;
}


interface userRegistration {
    userType: userType | null;
    setUserType: (userType: userType | null) => void;
    clearData: () => void;
}

export const userStore = create<userRegistration>()(
    persist(
        (set) => ({
            userType: null,
            setUserType: (userType) => set({ userType }),
            clearData: () => set({ userType: null }),
        }),
        {
            name: "userOnboarding",
        }
    )
);
