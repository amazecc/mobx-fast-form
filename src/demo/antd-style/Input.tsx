import React from "react";
import { Input as AntdInput } from "antd";
import type { InputProps as AntdInputProps } from "antd/lib/input";

export interface InputProps extends Omit<AntdInputProps, "onChange"> {
    onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = React.forwardRef<AntdInput, InputProps>((props, ref) => {
    const onChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            props.onChange?.(event.target.value, event);
        },
        [props]
    );

    return <AntdInput ref={ref} {...props} onChange={onChange} />;
});
