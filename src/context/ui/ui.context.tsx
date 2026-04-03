import { Context, createContext } from 'react';
type uiContextType = {
    sidebarOpen : boolean
}
let UiContext: any = createContext({});
export default  UiContext