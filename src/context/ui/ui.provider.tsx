import React, { useReducer } from "react";
import UiContext from "./ui.context";

const INITIAL_STATE = {
  sidebarOpen: true,
  parentId: 0,
  childId: 0,
};

function reducer(state: any, action: any) {
  console.log(action,"action");
  
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case "MENU_SIDEBAR":      
      return {
        ...state,
        parentId: action.parentId,
        childId: action.childId,
      };
    default:
      return state;
  }
}

export const UiProvider = ({ children }: any) => {
  const [uiState, uiDispatch] = useReducer(reducer, INITIAL_STATE);
  return (
    <UiContext.Provider value={{ uiState, uiDispatch }}>
      {children}
    </UiContext.Provider>
  );
};
