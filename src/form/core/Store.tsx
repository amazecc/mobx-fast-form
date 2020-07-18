import { observable, runInAction } from "mobx";
import { pickObject } from "../utils";

export type FormErrors<V> = {
    [k in keyof V]?: string;
};

export type FormTouched<V> = {
    [k in keyof V]?: boolean;
};

export type FormVisible<V> = {
    [k in keyof V]?: boolean;
};

export interface ValidateReturnType<V> {
    ok: boolean;
    errors: FormErrors<V>;
}

export interface SubmitReturnType<V> {
    values: V;
    errors: FormErrors<V>;
    ok: boolean;
    visible: FormVisible<V>;
}

export class Store<V> {
    @observable readonly values: V;

    @observable errors: FormErrors<V> = {};

    @observable touched: FormTouched<V> = {};

    @observable visible: FormVisible<V> = {};

    submitCount = 0;

    private readonly initialValue: V;

    // 表单验证函数集合
    private readonly validateMap = new Map<keyof V, (value: any, values: Readonly<V>) => Promise<string | undefined>>();

    // 表单验证通过回调函数集合
    private readonly validateSuccessMap = new Map<keyof V, (value: any) => void>();

    constructor(values: V) {
        this.initialValue = { ...values };
        this.values = values;
    }

    setErrors = (errors: FormErrors<V>) => {
        runInAction(() => Object.keys(errors).forEach(_ => (this.errors[_] = errors[_])));
    };

    validateField = async <K extends keyof V>(fieldName: K) => {
        const validator = this.validateMap.get(fieldName);
        if (validator) {
            const error = await validator(this.values[fieldName], this.values);
            runInAction(() => (this.errors[fieldName] = error));
            if (!error) {
                this.validateSuccessMap.get(fieldName)?.(this.values[fieldName]);
            }
        }
    };

    setVisible = (visible: FormVisible<V>) => {
        runInAction(() => Object.keys(visible).forEach(_ => (this.visible[_] = visible[_])));
    };

    setValues = <K extends keyof V>(values: Pick<V, K>, validate = true) => {
        runInAction(() => {
            Object.keys(values).forEach(_ => {
                const fieldName = _ as K;
                this.values[fieldName] = values[fieldName];
                if (!this.touched[fieldName]) {
                    this.touched[fieldName] = true;
                }
                if (validate) {
                    this.validateField(fieldName);
                }
            });
        });
    };

    validate = async (): Promise<ValidateReturnType<V>> => {
        const validators: Array<Promise<string | undefined>> = [];
        const keys: Array<keyof V> = [];
        this.validateMap.forEach((value, key) => {
            if (this.visible[key]) {
                validators.push(this.validateMap.get(key)!(this.values[key], this.values));
                keys.push(key);
            }
        });
        const errorsArray = await Promise.all(validators);
        const errors = keys.reduce((prev, next, index) => {
            if (errorsArray[index]) {
                prev[next] = errorsArray[index];
            }
            return prev;
        }, ({} as unknown) as FormErrors<V>);
        const cleanErrors = pickObject(errors, (key, value) => !!value);
        this.setErrors(cleanErrors);
        return { errors: cleanErrors, ok: Object.keys(cleanErrors).length === 0 };
    };

    submit = async (validate = true): Promise<SubmitReturnType<V>> => {
        ++this.submitCount;
        const errors: ValidateReturnType<V> = validate ? await this.validate() : { errors: {}, ok: true };
        return {
            ...errors,
            values: this.values,
            visible: this.visible,
        };
    };

    resetForm = (values?: V) => {
        runInAction(() => {
            if (values) {
                Object.keys(this.values).forEach(_ => (this.values[_] = values[_]));
            } else {
                Object.keys(this.initialValue).forEach(_ => (this.values[_] = this.initialValue[_]));
            }
            this.submitCount = 0;
            this.errors = {};
            this.touched = {};
        });
    };

    registerValidateMethod<K extends keyof V>(fieldName: K, fn: (value: V[K], values: Readonly<V>) => Promise<string | undefined>) {
        this.validateMap.set(fieldName, fn);
    }

    /**
     * Field 组件卸载的情况控制显示隐藏时，删除验证函数
     * @param fieldName 字段名
     */
    unregisterValidateMethod<K extends keyof V>(fieldName: K) {
        this.validateMap.delete(fieldName);
    }

    registerValidateSuccessMethod<K extends keyof V>(fieldName: K, fn: (value: any) => void) {
        this.validateSuccessMap.set(fieldName, fn);
    }

    /**
     * Field 组件卸载的情况控制显示隐藏时，删除验证成功的函数
     * @param fieldName 字段名
     */
    unregisterValidateSuccessMethod<K extends keyof V>(fieldName: K) {
        this.validateSuccessMap.delete(fieldName);
    }
}
