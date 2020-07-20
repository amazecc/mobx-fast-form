import * as React from "react";
import { Field as MobxField, FieldProps as MobxFieldProps, AnyValue } from "src/form/core/Field";
import { FormItem } from "./FormItem";

export interface FieldProps<V, K extends keyof V> extends MobxFieldProps<V, K> {
    /* 不带 FormItem UI
     * @default true
     */
    noStyle?: boolean;
}

export class Field<V extends AnyValue, K extends keyof V> extends React.PureComponent<FieldProps<V, K>> {
    static FormItem = FormItem;

    render() {
        const { noStyle, children, ...restFieldProps } = this.props;
        if (noStyle) {
            return <MobxField {...restFieldProps}>{children}</MobxField>;
        }
        return (
            <MobxField {...restFieldProps}>
                {renderPropsConfig => {
                    const { error, label, required } = renderPropsConfig;
                    const element =
                        children instanceof Function
                            ? children(renderPropsConfig)
                            : React.isValidElement(children)
                            ? React.cloneElement(children, { value: renderPropsConfig.value, onChange: renderPropsConfig.setValue })
                            : children;
                    return (
                        <FormItem label={label} required={required} errorMessage={error}>
                            {element}
                        </FormItem>
                    );
                }}
            </MobxField>
        );
    }
}

export default Field;
