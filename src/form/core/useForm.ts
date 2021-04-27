import * as React from "react";
import { Store } from "./Store";
import type { FormInstance, FormActions } from "./Form";

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
    return React.useMemo(() => {
        const finalValues = values instanceof Function ? values() : values;
        const store = new Store(finalValues);
        const formActions = {
            setErrors: store.setErrors,
            setValues: store.setValues,
            setVisible: store.setVisible,
            submit: store.submit,
            reset: store.reset,
            validateField: store.validateField,
        };
        const form = {
            values: store.values,
            errors: store.errors,
            visible: store.visible,
            ...formActions,
        };
        effect?.(formActions);
        return { store, form };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
