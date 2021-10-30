/** 异步防抖 */
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
