import React from "react";
import { Store } from "./Store";
import { StoreContext } from "./context";
import { observe } from "mobx";
import { FormContext } from "./FormProvider";
import type { PickOptional } from "src/mobx-assist";
import type { FormVisible, FormErrors, SubmitReturnType } from "./Store";
import type { Lambda, IObjectDidChange } from "mobx";

export interface FormActions<V> {
    setValues<K extends keyof V>(values: Pick<V, K>, validate?: boolean): void;
    setErrors(errors: FormErrors<V>): void;
    setVisible(values: FormVisible<V>): void;
    resetForm(values?: V): void;
    submitForm(validate?: boolean): Promise<Readonly<SubmitReturnType<V>>>;
    validateField: (fieldName: keyof V) => Promise<void>;
}

export interface FormStoreData<V> {
    values: Readonly<V>;
    errors: Readonly<FormErrors<V>>;
    visible: Readonly<FormVisible<V>>;
}

export interface FormInstance<V> extends FormActions<V>, FormStoreData<V> {}

export interface FormProps<V> {
    /**
     * 表单初始值，当 store 传入为一个 Store 实例，则忽略该初始值，因为 Store 实例化时已经提供了初始值
     */
    initialValue?: V;
    /**
     * 控制表单字段初始显示隐藏
     */
    initialVisible?: FormVisible<V>;
    /** 表单名字，配合 FormProvider 组件使用 */
    name?: string;
    /**
     * initialValue 更改是否使用新值更新 UI
     * @default true
     */
    enableReinitialize?: boolean;
    /**
     * 监听表单字段变化
     */
    effect?: (name: keyof V, values: V, actions: FormActions<V>) => void;
    /**
     * Form 内部的状态从外部传入, 使用 useForm 时，需要将 useForm 返回的 store 赋予该字段
     * @example
     * ```tsx
     * function FormDemo() {
     *  const {store, from} = useForm({test: ''})
     *  // form.setValues({test: "1"})
     *  return (
     *    <Form store={store}>
     *      <Field name="test">
     *        <Input />
     *      </Field>
     *    </Form>
     *  )
     * }
     * ```
     */
    store?: Store<V> | (new (values: V, visible?: FormVisible<V>) => Store<V>);
}

export class Form<V> extends React.PureComponent<FormProps<V>> implements FormInstance<V> {
    static contextType = FormContext;

    readonly context!: React.ContextType<typeof FormContext>;

    static defaultProps: PickOptional<FormProps<any>> = {
        enableReinitialize: true,
    };

    private readonly store = (() => {
        const { store: OuterStore, initialValue, initialVisible } = this.props;
        if ((OuterStore instanceof Function || OuterStore === undefined) && !initialValue) {
            throw new Error("当 store 没有传入或者传入一个类时，initialValue 为必填");
        }
        if (OuterStore) {
            if (OuterStore instanceof Function) {
                return new OuterStore(initialValue!, initialVisible);
            }
            return OuterStore;
        }
        return new Store(initialValue!, initialVisible);
    })();

    private disposer: Lambda | null = null;

    setValues = this.store.setValues;

    setErrors = this.store.setErrors;

    setVisible = this.store.setVisible;

    validateField = this.store.validateField;

    resetForm = this.store.resetForm;

    submitForm = this.store.submit;

    componentDidMount() {
        const { name, effect } = this.props;
        if (effect || this.context) {
            this.disposer = observe(this.store.values, this.listener);
        }
        // 如果使用了 FormProvider，那么将表单实例加入其中
        if (this.context) {
            if (!name) {
                throw new Error("表单使用了 FormProvider, Form 的 name 属性为必填");
            }
            this.context.addForm(name, this);
        }
    }

    componentDidUpdate(prevProps: Readonly<FormProps<V>>) {
        const { enableReinitialize, initialValue, initialVisible } = this.props;
        if (enableReinitialize && initialValue !== prevProps.initialValue) {
            this.store.setValues(initialValue!, false);
        }
        if (enableReinitialize && prevProps.initialVisible && initialVisible !== prevProps.initialVisible) {
            this.store.setVisible(prevProps.initialVisible);
        }
    }

    componentWillUnmount() {
        this.disposer?.();
    }

    listener = (change: IObjectDidChange) => {
        if (change.type === "update") {
            this.props.effect?.(change.name as keyof V, change.object as V, {
                setValues: this.setValues,
                setErrors: this.setErrors,
                setVisible: this.setVisible,
                resetForm: this.resetForm,
                submitForm: this.submitForm,
                validateField: this.validateField,
            });
            this.context?.onFormChange?.(this.props.name!, change.name as string);
        }
    };

    get values(): Readonly<V> {
        return this.store.values;
    }

    get errors(): Readonly<FormErrors<V>> {
        return this.store.errors;
    }

    get visible(): Readonly<FormVisible<V>> {
        return this.store.visible;
    }

    render() {
        return <StoreContext.Provider value={this.store}>{this.props.children}</StoreContext.Provider>;
    }
}
