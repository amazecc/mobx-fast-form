import React from "react";
import { FormsManager } from "./FormsManager";

export const FormContext = React.createContext<FormsManager<any> | null>(null);
