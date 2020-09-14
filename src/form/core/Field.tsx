import * as React from "react";
import { observe } from "mobx";
import { observer } from "mobx-react";
import { StoreContext } from "./context";
import { formConfig } from "./config";
import type { FormErrors, ValidateStatus } from "./Store";
import type { Lambda, IObjectDidChange } from "mobx";
import { asyncDebounce } from "../utils";

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
    validateStatus: ValidateStatus;
    setValue: (value: V[K], validate?: boolean) => void;
    setValues: <K extends keyof V>(values: Pick<V, K>, validate?: boolean) => void;
}

export interface FieldDescriptionProps {
    /** 字段描述 */
    label?: React.ReactChild;
    /** 是否做必填校验 */
    required?: boolean;
    /** 自定义必填提示信息 */
    requiredText?: string;
}

// 传递到 children render props 函数中的参数
export interface RenderPropsConfig<V = any, K extends keyof V = any> extends FieldConfig<V, K>, FieldDescriptionProps {}

export interface FieldProps<V, K extends keyof V> extends FieldDescriptionProps {
    /** 表单字段名称 */
    name: K;
    /** 绑定到的字段名的值改变了，就会重新 render 组件 */
    bindNames?: string[];
    /** 表单验证支持输入函数与正则， 输入正则情况，表单组件 onChange 必须返回 string 类型的值 */
    validate?: Validate<V, K> | ValidateRegExp[];
    /**
     * 对表单验证函数 validate 的防抖处理，值为防抖等待时间
     * @default undefined 即不进行防抖处理
     * @description 单位为毫秒
     */
    validateDebounce?: number;
    /**
     * 可选情况下并且 value 为空时，是否执行 validate 函数进行验证
     * @description 一般用在联合验证的情况，比如：fieldName1, fieldName2, fieldName3, 至少输入一个
     */
    validateNullishWithOptional?: boolean;
    /** 表单验证成功回调 */
    validateSuccess?: (value: V[K]) => void;
    /** 表单控件 */
    children?: React.ReactNode | ((renderPropsConfig: RenderPropsConfig<V, K>) => React.ReactNode);
}

@observer
export class Field<V extends AnyValue, K extends keyof V> extends React.PureComponent<FieldProps<V, K>> {
    static contextType = StoreContext;

    readonly context!: React.ContextType<typeof StoreContext>;

    private disposer: Lambda | null = null;

    constructor(props: FieldProps<V, K>, context: React.ContextType<typeof StoreContext>) {
        super(props, context);
        // 初始设置显示为 true
        if (context.visible[props.name] === undefined) {
            context.setVisible({ [props.name]: true });
        }
    }

    componentDidMount() {
        const { validate, name, bindNames, required, validateSuccess } = this.props;
        this.addValidateMethodToForm();
        if (validateSuccess && (required || validate)) {
            this.context.registerValidateSuccessMethod(name, validateSuccess);
        }
        // 添加 values 变化的监听器，为 bindName 属性服务
        if (bindNames && bindNames.length > 0) {
            this.disposer = observe(this.context.values, this.listener);
        }
    }

    componentWillUnmount() {
        this.context.unregisterValidateMethod(this.props.name);
        this.context.unregisterValidateSuccessMethod(this.props.name);
        this.disposer?.();
    }

    listener = (change: IObjectDidChange) => {
        const { bindNames: bindName, name } = this.props;
        if (bindName?.includes(change.name as string) && change.name !== name) {
            this.forceUpdate();
        }
    };

    getFieldError = (error: string | undefined, touched: boolean | undefined, submitCount: number) => {
        return (touched && error) || (submitCount > 0 && error) ? error : undefined;
    };

    addValidateMethodToForm = () => {
        const { validate, name, required, validateDebounce } = this.props;
        if (required && validate) {
            this.context.registerValidateMethod(name, validateDebounce === undefined ? this.validateWithRequired : asyncDebounce(this.validateWithRequired, validateDebounce));
            return;
        }
        if (required) {
            this.context.registerValidateMethod(name, validateDebounce === undefined ? this.validateOnlyWithRequired : asyncDebounce(this.validateOnlyWithRequired, validateDebounce));
            return;
        }
        if (validate) {
            this.context.registerValidateMethod(name, validateDebounce === undefined ? this.validate : asyncDebounce(this.validate, validateDebounce));
        }
    };

    validateWithRequired = async (value: V[K], values: Readonly<V>) => {
        const errorMessage = await this.validateOnlyWithRequired(value);
        if (errorMessage) {
            return errorMessage;
        }
        return await this.validate(value, values);
    };

    validateOnlyWithRequired = async (value: V[K]) => {
        const { required, requiredText, label } = this.props;
        if (required && formConfig.isNullValue(value)) {
            return requiredText ?? formConfig.getRequiredErrorMessage(label);
        }
        return undefined;
    };

    validate = async (value: V[K], values: Readonly<V>) => {
        const { validate, validateNullishWithOptional, required } = this.props;
        if (!required && !validateNullishWithOptional && formConfig.isNullValue(value)) {
            return undefined;
        }
        return validate instanceof Function ? await validate?.(value, values) : this.createValidateWithRegExp(value, validate);
    };

    createValidateWithRegExp(value: V[K], regExp?: ValidateRegExp[]) {
        const notPaseItem = regExp?.find(_ => !_.pattern.test((value as unknown) as string));
        return notPaseItem?.message;
    }

    setValue = (value: V[K], validate = true) => this.context.setValues({ [this.props.name]: value }, validate);

    onChildrenChange = (value: V[K]) => {
        this.setValue(value);
        if (React.isValidElement(this.props.children)) {
            this.props.children.props.onChange?.(value);
        }
    };

    render() {
        const { children, name, label, required } = this.props;
        const { values, visible, errors, touched, submitCount, validateStatus } = this.context;
        const renderPropsConfig = {
            name,
            label,
            required,
            value: values[name],
            values,
            error: this.getFieldError(errors[name], touched[name], submitCount),
            errors,
            validateStatus: validateStatus[name] as ValidateStatus,
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
