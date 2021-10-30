import React from "react";
import { Button } from "antd";

import { Form, useForm } from "../resource";
import { Field } from "./antd-style/Field";
import { Input } from "./antd-style/Input";

interface FormState {
    [k: string]: string;
}

// 生成 500 个字段
const fields = Array(500)
    .fill("")
    .map((_, index) => `field${index}`);

const defaultFormState: FormState = fields.reduce((prev, next) => {
    prev[next] = "";
    return prev;
}, {});

export const FormLarge = () => {
    const { store, form } = useForm(defaultFormState);
    const [value, setValue] = React.useState("");

    const submit = React.useCallback(async () => {
        const result = await form.submit();
        console.log(result);
        if (result.ok) {
            // eslint-disable-next-line no-alert
            alert(`提交数据：${JSON.stringify(result.values, null, 4)}`);
        }
    }, [form]);

    return (
        <div style={{ width: 600, margin: "100px auto" }}>
            <h1>使用组件 state 更新</h1>
            <Input value={value} onChange={setValue} />
            <h1>以下使用 mobx-fast-form</h1>
            <Form store={store}>
                {fields.map(_ => (
                    <Field key={_} name={_} label={_} required>
                        <Input />
                    </Field>
                ))}
                <Button onClick={submit}>提交</Button>
            </Form>
        </div>
    );
};
