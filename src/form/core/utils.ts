/**
 * 从鼠标事件 MouseEvent 或者 键盘输入事件 InputEvent 中获取 value 或者 checked 值
 * @param event
 * @param valuePropName
 */
export const getValueFormUIEvent = (event: any, valuePropName: "checked" | "value") => {
    if (event?.nativeEvent instanceof MouseEvent || event?.nativeEvent instanceof InputEvent) {
        return valuePropName === "value" ? event.target.value : event.target.checked;
    }
    return event;
};
