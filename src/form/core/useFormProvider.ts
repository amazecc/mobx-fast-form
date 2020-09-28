import React from "react";
import { useIsFirstRender } from "../utils";
import { FormsManager, Forms } from "./FormProvider/FormsManager";

export function useFormProvider<F extends Forms>() {
    const formManager = React.useRef<FormsManager<F>>();
    const isFirstRender = useIsFirstRender();
    if (isFirstRender) {
        formManager.current = new FormsManager();
    }
    return formManager.current!;
}
