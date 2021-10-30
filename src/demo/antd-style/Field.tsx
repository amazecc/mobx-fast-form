import React from "react";
import { Form } from "antd";
import { Field as MobxField, FieldProps as MobxFieldProps, AnyValue } from "../../resource/core/Field";

export interface FieldProps<V, K extends keyof V> extends MobxFieldProps<V, K> {
    /* 不带 FormItem UI
     * @default true
     */
    noStyle?: boolean;
    label: string;
    required?: boolean;
}

export class Field<V extends AnyValue, K extends keyof V> extends React.PureComponent<FieldProps<V, K>> {
    override render() {
        const { noStyle, label, required, children, ...restFieldProps } = this.props;
        if (noStyle) {
            return (
                <MobxField {...restFieldProps} required={required} requiredMessage={`${label}为必填项`}>
                    {children}
                </MobxField>
            );
        }
        return (
            <MobxField {...restFieldProps} required={required} requiredMessage={`${label}为必填项`}>
                {renderPropsConfig => {
                    const { error, validateStatus } = renderPropsConfig;
                    return (
                        <Form.Item label={label} required={required} help={error} validateStatus={validateStatus} hasFeedback>
                            {children instanceof Function
                                ? children(renderPropsConfig)
                                : React.isValidElement(children)
                                ? React.cloneElement(children, { value: renderPropsConfig.value, onChange: renderPropsConfig.setValue })
                                : children}
                        </Form.Item>
                    );
                }}
            </MobxField>
        );
    }
}

export default Field;
