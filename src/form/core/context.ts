import * as React from "react";
import type { Store } from "./Store";

export const StoreContext = React.createContext<Store<any>>({} as any);
