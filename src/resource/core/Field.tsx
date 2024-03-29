import React from "react";
import { IReactionDisposer, reaction } from "mobx";
import { observer } from "mobx-react";
import { StoreContext } from "./Form/context";
import { asyncDebounce } from "../utils";
import type { FormErrors, ValidateStatus } from "./Store";

export interface AnyValue {
    [k: string]: any;
}

export type Validate<V, K extends keyof V> = (value: V[K], values: Readonly<V>) => (string | undefined) | Promise<string | undefined>;

export interface ValidateRegExp {
    pattern: RegExp;
    message: string;
}

export interface FieldConfig<V, K extends keyof V> {
    value: V[K];
    values: V;
    error: string | undefined;
    errors: FormErrors<V>;
    validateStatus: ValidateStatus | undefined;
    setValue: (value: V[K], validate?: boolean) => void;
    setValues: <KK extends keyof V>(values: Pick<V, KK>, validate?: boolean) => void;
}

// 传递到 children render props 函数中的参数
export interface RenderPropsConfig<V = any, K extends keyof V = any> extends FieldConfig<V, K> {}

export interface FieldProps<V, K extends keyof V> {
    /** 表单字段名称 */
    name: K;
    /** 是否必填 */
    required?: boolean;
    /**
     * 必填不通过的提示文字
     * @default 请输入内容
     */
    requiredMessage?: string;
    /** 表单验证支持输入函数与正则， 输入正则情况，表单组件 onChange 必须返回 string 类型的值 */
    validate?: Validate<V, K> | ValidateRegExp[];
    /**
     * 对表单验证函数 validate 的防抖处理，值为防抖等待时间
     * @default undefined 即不进行防抖处理
     * @description 单位为毫秒
     */
    validateDebounce?: number;
    /**
     * 可选情况下并且 value 为空时，是否执行 validate 函数进行校验
     * @description 一般用在联合校验的情况，比如：fieldName1, fieldName2, fieldName3, 至少输入一个
     */
    validateNullishWithOptional?: boolean;
    /** 表单控件 */
    children?: React.ReactNode | ((renderPropsConfig: RenderPropsConfig<V, K>) => React.ReactNode);
    /** 表单验证成功回调 */
    validateSuccess?: (value: V[K]) => void;
    /** 绑定到的值改变了，就会重新 render 组件 */
    bind?: (values: V) => any[];
}

@observer
export class Field<V extends AnyValue, K extends keyof V> extends React.PureComponent<FieldProps<V, K>> {
    static override contextType = StoreContext;

    static defaultProps: PickOptional<FieldProps<any, any>> = {
        requiredMessage: "请输入内容",
    };

    declare readonly context: React.ContextType<typeof StoreContext>;

    private disposer: IReactionDisposer | null = null;

    override componentDidMount() {
        const { validate, name, bind, validateSuccess } = this.props;
        if (this.context.visible[name] === undefined) {
            this.context.setVisible({ [name]: true });
        }
        this.addValidateMethodToForm();
        if (validateSuccess && validate) {
            this.context.registerValidateSuccessMethod(name, validateSuccess);
        }
        // 添加 values 变化的监听器，为 bind 属性服务
        if (bind) {
            this.disposer = reaction(
                () => bind(this.context.values),
                () => this.forceUpdate()
            );
        }
    }

    override componentWillUnmount() {
        this.context.unregisterValidateMethod(this.props.name);
        this.context.unregisterValidateSuccessMethod(this.props.name);
        this.disposer?.();
    }

    isNullValue = (value: V[K]) => value === null || value === undefined || (typeof value === "string" && value === "");

    getFieldError = (error: string | undefined, touched: boolean | undefined, submitCount: number) => {
        return (touched && error) || (submitCount > 0 && error) ? error : undefined;
    };

    addValidateMethodToForm = () => {
        const { required, validate, name, validateDebounce } = this.props;
        if (required || validate) {
            this.context.registerValidateMethod(name, validateDebounce === undefined ? this.validate : asyncDebounce(this.validate, validateDebounce));
        }
    };

    validate = async (value: V[K], values: Readonly<V>) => {
        const { validate, required, requiredMessage, validateNullishWithOptional } = this.props;
        // 如果不是必填，并且值为空，直接校验通过
        if (!required && this.isNullValue(value) && !validateNullishWithOptional) {
            return undefined;
        }
        // 如果必填且值为空，进行必填的校验
        if (required && this.isNullValue(value)) {
            return requiredMessage;
        }
        // 对外部传入 validate 进行校验
        return validate instanceof Function ? await validate?.(value, values) : validate?.find(_ => !_.pattern.test(value))?.message;
    };

    setValue = (value: V[K], validate = true) => this.context.setValues({ [this.props.name]: value }, validate);

    onChildrenChange = (value: V[K]) => {
        this.setValue(value);
        if (React.isValidElement(this.props.children)) {
            this.props.children.props.onChange?.(value);
        }
    };

    override render() {
        const { children, name } = this.props;
        const { values, visible, errors, touched, submitCount, validateStatus } = this.context;
        const renderPropsConfig = {
            name,
            value: values[name],
            values,
            error: this.getFieldError(errors[name], touched[name], submitCount),
            errors,
            validateStatus: validateStatus[name],
            setValue: this.setValue,
            setValues: this.context.setValues,
        };
        if (!visible[name]) {
            return null;
        }
        if (React.isValidElement(children)) {
            return React.cloneElement(children, { value: renderPropsConfig.value, onChange: this.onChildrenChange });
        }
        if (children instanceof Function) {
            return children(renderPropsConfig);
        }
        return children;
    }
}
