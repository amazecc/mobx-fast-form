import * as React from "react";
import { Store } from "./Store";
import { StoreContext, FormContext } from "./context";
import { observe } from "mobx";
import type { FormVisible, FormErrors, SubmitReturnType } from "./Store";
import type { Lambda, IObjectDidChange } from "mobx";

export interface FormActions<V> {
    setValues<K extends keyof V>(values: Pick<V, K>, validate?: boolean): void;
    setErrors(errors: FormErrors<V>): void;
    setVisible(values: FormVisible<V>): void;
    reset(values?: V): void;
    submit(validate?: boolean): Promise<Readonly<SubmitReturnType<V>>>;
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
    /** 表单名字，配合 FormProvider 组件使用 */
    name?: string;
    /**
     * initialValue 更改是否使用新值更新 UI
     */
    enableReinitialize?: boolean;
    /**
     * 表单渲染之前的操作
     */
    beforeRender?: (actions: FormActions<V>) => void;
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
    store?: Store<V> | (new (values: V) => Store<V>);
}

export class Form<V> extends React.PureComponent<FormProps<V>> implements FormInstance<V> {
    static contextType = FormContext;

    readonly context!: React.ContextType<typeof FormContext>;

    private disposer: Lambda | null = null;

    private readonly store: Store<V>;

    setValues: FormActions<V>["setValues"];

    setErrors: FormActions<V>["setErrors"];

    setVisible: FormActions<V>["setVisible"];

    validateField: FormActions<V>["validateField"];

    reset: FormActions<V>["reset"];

    submit: FormActions<V>["submit"];

    constructor(props: FormProps<V>) {
        super(props);
        this.store = this.createStore();
        this.setValues = this.store.setValues;
        this.setErrors = this.store.setErrors;
        this.setVisible = this.store.setVisible;
        this.validateField = this.store.validateField;
        this.reset = this.store.reset;
        this.submit = this.store.submit;
        props.beforeRender?.(this.createFormActions());
    }

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
        const { enableReinitialize, initialValue } = this.props;
        if (enableReinitialize && initialValue !== prevProps.initialValue) {
            this.store.setValues(initialValue!, false);
        }
    }

    componentWillUnmount() {
        this.disposer?.();
    }

    private listener = (change: IObjectDidChange) => {
        if (change.type === "update") {
            this.props.effect?.(change.name as keyof V, change.object as V, this.createFormActions());
            this.context?.onFormChange?.(this.props.name!, change.name as string);
        }
    };

    private createFormActions(): FormActions<V> {
        return {
            setValues: this.setValues,
            setErrors: this.setErrors,
            setVisible: this.setVisible,
            reset: this.reset,
            submit: this.submit,
            validateField: this.validateField,
        };
    }

    private createStore() {
        const { store: OuterStore, initialValue = {} as V } = this.props;
        if ((OuterStore instanceof Function || OuterStore === undefined) && !this.props.initialValue) {
            throw new Error("当 store 没有传入或者传入一个类时，initialValue 为必填");
        }
        if (OuterStore) {
            if (OuterStore instanceof Function) {
                return new OuterStore(initialValue);
            }
            return OuterStore;
        }
        return new Store(initialValue);
    }

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
