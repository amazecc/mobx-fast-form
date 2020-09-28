import * as React from "react";

export const formConfig = {
    /** 获取 required 错误信息 */
    getRequiredErrorMessage(label?: React.ReactChild, requiredText?: string): string {
        if (requiredText !== undefined) {
            return requiredText;
        }
        if (React.isValidElement(label) || label === undefined) {
            return `该项为必填项`;
        }
        return `${label}为必填项`;
    },
    /** 是否为空值，用于 required 校验依据 */
    isNullValue(value: any): boolean {
        return value === null || value === undefined || value === "";
    },
};

export function config<K extends keyof typeof formConfig>(newConfig: Pick<typeof formConfig, K>) {
    Object.assign(formConfig, newConfig);
}
