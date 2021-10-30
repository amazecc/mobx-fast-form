import React from "react";
import { Store } from "../Store";

export const StoreContext = React.createContext(new Store<any>({}));
