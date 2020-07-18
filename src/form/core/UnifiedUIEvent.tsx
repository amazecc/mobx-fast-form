import * as React from "react";
import { getValueFormUIEvent } from "./utils";

export type ValuePropName = "value" | "checked";

interface UnifiedUIEventProps {
    valuePropName: ValuePropName;
    children: React.ReactElement<{ onChange?: (event: any, ...args: any) => void }>;
    value?: any;
    onChange?: (value: any) => void;
}

/**
 * 将表单控件不同的取值方式统一整合为 value/onChange方式
 * @description 两种事件取值方式
 * - checked/onChange
 * - value/onChange
 */
export const UnifiedUIEvent: React.FC<UnifiedUIEventProps> = React.memo(props => {
    const { valuePropName, value, onChange, children } = props;

    const onChildrenChange = React.useCallback(
        (event: any, ...args: any) => {
            // 先执行 onChange 改变 store 中的值，再执行 children 上面的 onChange 方法
            onChange?.(getValueFormUIEvent(event, valuePropName));
            children?.props?.onChange?.(event, ...args);
        },
        [children?.props?.onChange, onChange, valuePropName]
    );

    return React.cloneElement(children, { [valuePropName]: value, onChange: onChildrenChange });
});
