import React, { useReducer } from 'react';
import  AuthContext  from "./AuthContext"
import { TOKEN_PREFIX } from '@/utils/constants';

const isBrowser = typeof window !== 'undefined';
const INITIAL_STATE = {
  authenticated: isBrowser && localStorage && !!localStorage.getItem(TOKEN_PREFIX),
};

function reducer(state:any, action:any) {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...state,
        authenticated: true,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        authenticated: false,
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }:any) => {
  const [authState, authDispatch] = useReducer(reducer, INITIAL_STATE);
  return (
    <AuthContext.Provider value={{ authState, authDispatch }}>
    {children}
  </AuthContext.Provider>
  );
};