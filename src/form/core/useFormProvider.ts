import React from "react";
import { FormsManager, Forms } from "./FormProvider/FormsManager";

export function useFormProvider<F extends Forms>() {
    return React.useMemo(() => new FormsManager<F>(), []);
}
