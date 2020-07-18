import * as React from "react";
import { Store } from "./Store";
import type { FormVisible } from "./Store";
import type { FormInstance } from "./Form";
import { useIsFirstRender } from "../../../hooks/lifecycle";

export interface UseFormReturn<V> {
    form: FormInstance<V>;
    /**
     * 该值赋予 Form store 属性
     */
    store: Store<V>;
}

export function useForm<V>(values: V | (() => V), visible?: FormVisible<V> | (() => FormVisible<V>)): UseFormReturn<V> {
    const store = React.useRef<Store<V>>();
    const formInstance = React.useRef<FormInstance<V>>();
    const isFirstRender = useIsFirstRender();
    if (isFirstRender) {
        const finalValues = values instanceof Function ? values() : values;
        const finalVisible = visible instanceof Function ? visible() : visible;
        store.current = new Store(finalValues, finalVisible);
        formInstance.current = {
            values: store.current!.values,
            errors: store.current!.errors,
            visible: store.current!.visible,
            setErrors: store.current!.setErrors,
            setValues: store.current!.setValues,
            setVisible: store.current!.setVisible,
            submitForm: store.current!.submit,
            resetForm: store.current!.resetForm,
            validateField: store.current!.validateField,
        };
    }

    return {
        store: store.current!,
        form: formInstance.current!,
    };
}
