import * as React from "react";

/**
 * 根据 callback 提取对象中的字段，生成新的对象
 * @param obj 源对象
 * @param callback 提取条件，返回 true 则提取
 */
export function pickObject<T>(obj: T, callback: (key: keyof T, value: T[keyof T]) => boolean) {
    return Object.keys(obj).reduce((prev, next) => {
        if (callback(next as keyof T, obj[next])) {
            prev[next] = obj[next];
        }
        return prev;
    }, ({} as unknown) as T);
}

/**
 * 返回组件是否第一次渲染
 */
export function useIsFirstRender() {
    const isFirstRender = React.useRef(true);
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return true;
    }
    return isFirstRender.current;
}

export const asyncDebounce = <F extends (...args: any[]) => Promise<any>>(fn: F, wait?: number) => {
    let timerId: number | undefined;
    async function f(...args: Parameters<F>) {
        if (timerId !== undefined) {
            clearTimeout(timerId);
            timerId = undefined;
        }
        return await new Promise<ReturnType<F>>(resolve => {
            timerId = window.setTimeout(() => {
                resolve(fn(...args));
            }, wait);
        });
    }
    return f as F;
};
