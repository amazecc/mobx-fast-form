import { makeAutoObservable, runInAction } from "mobx";
import { pickObject } from "../utils";

export type ValidateStatus = "validating" | "success" | "error";

export type FormErrors<V> = Partial<Record<keyof V, string>>;

export type FormTouched<V> = Partial<Record<keyof V, boolean>>;

export type FormVisible<V> = Partial<Record<keyof V, boolean>>;

export type FormValidateStatus<V> = Partial<Record<keyof V, ValidateStatus>>;

export interface ValidateReturnType<V> {
    ok: boolean;
    errors: FormErrors<V>;
}

export interface SubmitReturnType<V> extends ValidateReturnType<V> {
    values: V;
    visible: FormVisible<V>;
}

export class Store<V> {
    readonly values: V;

    errors: FormErrors<V> = {};

    touched: FormTouched<V> = {};

    visible: FormVisible<V> = {};

    validateStatus: FormValidateStatus<V> = {};

    submitCount = 0;

    private readonly initialValue: V;

    /**
     * 表单验证函数集合
     */
    private readonly validateMap = new Map<keyof V, (value: any, values: Readonly<V>) => Promise<string | undefined>>();

    /**
     * 表单验证通过回调函数集合
     */
    private readonly validateSuccessMap = new Map<keyof V, (value: any) => void>();

    constructor(values: V) {
        this.initialValue = { ...values };
        this.values = values;
        makeAutoObservable(this);
    }

    /**
     * 设置字段错误信息
     * @param errors
     */
    setErrors = (errors: FormErrors<V>) => {
        Object.keys(errors).forEach(_ => {
            this.errors[_] = errors[_];
            this.validateStatus[_] = errors[_] ? "error" : "success";
        });
    };

    /**
     * 设置某个字段显示隐藏
     * @param visible
     */
    setVisible = (visible: FormVisible<V>) => {
        Object.keys(visible).forEach(_ => (this.visible[_] = visible[_]));
    };

    /**
     * 设置表单字段的值
     * @param values
     * @param validate
     */
    setValues = <K extends keyof V>(values: Pick<V, K>, validate = true) => {
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
    };

    /**
     * 提交表单操作，会返回验证结果，可根据验证结果进行表单提交操作
     * @param validate
     */
    submit = async (validate = true): Promise<SubmitReturnType<V>> => {
        ++this.submitCount;
        const errors: ValidateReturnType<V> = validate ? await this.validate() : { errors: {}, ok: true };
        return {
            ...errors,
            values: this.values,
            visible: this.visible,
        };
    };

    /**
     * 使用初始值重置表单，将清空错误信息
     * @param values 传入新值，将使用新值重置表单
     */
    reset = <K extends keyof V>(values?: Pick<V, K>) => {
        const finalValue = values ?? { ...this.initialValue };
        Object.keys(finalValue).forEach(_ => (this.values[_] = finalValue[_]));
        Object.keys(this.validateStatus).forEach(_ => (this.validateStatus[_] = undefined));
        this.submitCount = 0;
        this.errors = {};
        this.touched = {};
    };

    /**
     * 对某个字段进行表单验证
     * @param fieldName
     */
    validateField = async <K extends keyof V>(fieldName: K) => {
        const validator = this.validateMap.get(fieldName);
        if (validator) {
            this.validateStatus[fieldName] = "validating";
            const error = await validator(this.values[fieldName], this.values);
            runInAction(() => {
                this.errors[fieldName] = error;
                this.validateStatus[fieldName] = error ? "error" : "success";
            });
            if (!error) {
                this.validateSuccessMap.get(fieldName)?.(this.values[fieldName]);
            }
        }
    };

    /**
     * 对表单所有字段进行表单验证
     */
    validate = async (): Promise<ValidateReturnType<V>> => {
        const validators: Array<Promise<string | undefined>> = [];
        const keys: Array<keyof V> = [];
        this.validateMap.forEach((value, key) => {
            if (this.visible[key]) {
                validators.push(value(this.values[key], this.values));
                keys.push(key);
            }
        });
        const errorsArray = await Promise.all(validators);
        const errors = keys.reduce((prev, next, index) => {
            if (errorsArray[index]) {
                prev[next] = errorsArray[index];
                runInAction(() => {
                    this.validateStatus[next] = "error";
                });
            }
            return prev;
        }, {} as FormErrors<V>);
        const cleanErrors = pickObject(errors, (_key, value) => !!value);
        this.setErrors(cleanErrors);
        return { errors: cleanErrors, ok: Object.keys(cleanErrors).length === 0 };
    };

    /**
     * 注册字段的验证方法
     * @param fieldName
     * @param fn
     */
    registerValidateMethod<K extends keyof V>(fieldName: K, fn: (value: V[K], values: Readonly<V>) => Promise<string | undefined>) {
        this.validateMap.set(fieldName, fn);
    }

    /**
     * 卸载字段的验证方法
     * @param fieldName 字段名
     */
    unregisterValidateMethod<K extends keyof V>(fieldName: K) {
        this.validateMap.delete(fieldName);
    }

    /**
     * 注册字段验证成功的方法
     * @param fieldName
     * @param fn
     */
    registerValidateSuccessMethod<K extends keyof V>(fieldName: K, fn: (value: any) => void) {
        this.validateSuccessMap.set(fieldName, fn);
    }

    /**
     * 卸载字段验证成功的方法
     * @param fieldName 字段名
     */
    unregisterValidateSuccessMethod<K extends keyof V>(fieldName: K) {
        this.validateSuccessMap.delete(fieldName);
    }
}
