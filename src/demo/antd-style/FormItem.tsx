import * as React from "react";
import { Form } from "antd";
import type { FormItemProps as AntdFormItemProps } from "antd/lib/form";

export interface FormItemProps extends Omit<AntdFormItemProps, "help" | "validateStatus"> {
    errorMessage?: string;
}

export const FormItem: React.FC<FormItemProps> = React.memo(props => {
    const { errorMessage, ...restFormItemProps } = props;
    return (
        <Form.Item colon={false} {...restFormItemProps} help={props.errorMessage} validateStatus={props.errorMessage ? "error" : undefined}>
            {props.children}
        </Form.Item>
    );
});

FormItem.defaultProps = {
    wrapperCol: { span: 24 },
    labelCol: { span: 24 },
};
