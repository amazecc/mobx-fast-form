import * as React from "react";
import type { Store } from "./Store";
import type {ContextState} from './FormProvider'

export const StoreContext = React.createContext<Store<any>>({} as any);

export const FormContext = React.createContext<ContextState | null>(null);