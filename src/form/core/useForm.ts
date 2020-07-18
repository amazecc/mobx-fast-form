import * as React from "react";
import { Store } from "./Store";
import type { FormInstance, FormActions } from "./Form";
import { useIsFirstRender } from "../utils";

export interface UseFormReturn<V> {
    form: FormInstance<V>;
    /**
     * 该值赋予 Form store 属性
     */
    store: Store<V>;
}

/**
 * Form hooks
 * @param values 表单初始值
 * @param effect 表单初始化后可以做一些操作
 */
export function useForm<V>(values: V | (() => V), effect?: (actions: FormActions<V>) => void): UseFormReturn<V> {
    const store = React.useRef<Store<V>>();
    const formInstance = React.useRef<FormInstance<V>>();
    const isFirstRender = useIsFirstRender();
    if (isFirstRender) {
        const finalValues = values instanceof Function ? values() : values;
        store.current = new Store(finalValues);
        const formActions = {
            setErrors: store.current!.setErrors,
            setValues: store.current!.setValues,
            setVisible: store.current!.setVisible,
            submitForm: store.current!.submit,
            resetForm: store.current!.resetForm,
            validateField: store.current!.validateField,
        };
        formInstance.current = {
            values: store.current!.values,
            errors: store.current!.errors,
            visible: store.current!.visible,
            ...formActions,
        };
        effect?.(formActions);
    }

    return {
        store: store.current!,
        form: formInstance.current!,
    };
}
