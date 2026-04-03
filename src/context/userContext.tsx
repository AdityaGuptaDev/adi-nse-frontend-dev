
import { PROD_DATA } from "@/utils/constants";
import { getLS, setLS } from "@/utils/helpers";
import { createContext, useContext, useEffect, useState } from "react";


const initValues = {
  user: null,
  getUserDetails: () => { },
  setUserDetails: (user: any) => { },
};
// create context
type UserContextProps = {
  user: any;
  getUserDetails: () => void;
  setUserDetails: (user: any) => void;
};
export const UserContext = createContext<UserContextProps>(initValues);

//logic in provider
export const UserContextProvider = ({ children }: any) => {
  // the value that will be given to the context
  const [value, setvalue] = useState<any>(initValues);

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = async () => {
    try {
      const user = getLS(PROD_DATA);
      setvalue({ user });
    } catch (error) {
      console.log("getUserDetails", error);
    }
  };

  const setUserDetails = async (user: any) => {
    try {
      setvalue({ user: user || null });
      setLS(PROD_DATA, user);

    } catch (error) {
      console.log("setUserDetails", error);
    }
  };

  return (
    // the Provider gives access to the context to its children
    <UserContext.Provider value={{ ...value, getUserDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

// context consumer hook
export const useUserContext = () => {
  // get the context
  const context = useContext(UserContext);

  // if `undefined`, throw an error
  if (context === undefined) {
    throw new Error("useUserContext was used outside of its Provider");
  }

  return context;
};
