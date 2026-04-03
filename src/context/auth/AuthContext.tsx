"use client";
import { cookieStorageKeys, removeCookieData, removeCookieToken } from "@/services/cookieStorageService";
import { ADMIN_INVESTER_DATA, FLAT_MENU, MENU_PREFIX, PROD_DATA, TOKEN_PREFIX, USER_DATA } from "@/utils/constants";
import { getLS, removeLS } from "@/utils/helpers";
import { redirect } from "next/navigation";
// AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Define types
interface User {
  name: string;
  // Add other user properties as needed
}

interface AuthContextProps {
  user: User | null;
  LOGIN: (userData: User, authToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext({});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window != undefined) {
      // Check localStorage for existing user and token
      const loggedInUser = getLS(PROD_DATA);
      if (loggedInUser) {
        setUser(loggedInUser);
      }
    }
  }, []);

  const LOGIN = (userData: User, authToken: string) => {
    // Save user and token to localStorage
    localStorage.setItem(TOKEN_PREFIX, JSON.stringify(authToken));
    localStorage.setItem(PROD_DATA, JSON.stringify(userData));

    // Update state
    setUser(userData);
    redirect("/Blogs");
  };

  const logout = () => {

    // Remove user and token from localStorage
    if (!sessionStorage.getItem(USER_DATA)) {
      removeCookieToken();
      removeCookieData(cookieStorageKeys.INIT_PATH);
    }

    removeLS(PROD_DATA);
    removeLS(TOKEN_PREFIX);
    removeLS(MENU_PREFIX);
    removeLS(FLAT_MENU);
    removeLS(USER_DATA);
    removeLS(ADMIN_INVESTER_DATA)

    // Update state
    setUser(null);
    redirect("/login");
  };

  const value: AuthContextProps = {
    user,
    LOGIN,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default AuthContext